"""Testes do harness de POC (sem rede: HTTP e cliente Claude são fakes)."""

import json
from types import SimpleNamespace

import pytest

from decision_eval import cli, dataset, gate, metrics, providers
from decision_eval.questions import KEYS

SEED = cli.DEFAULT_DATA


def _ex(labels: dict[str, bool] | None = None) -> dataset.Example:
    return dataset.Example("x", "p", labels or {k: True for k in KEYS})


def _pred(p: float, latency: float = 0.1, tin: int = 100) -> providers.Prediction:
    return providers.Prediction(
        probs={k: p for k in KEYS}, latency_s=latency, input_tokens=tin
    )


# ---------------------------------------------------------------- dataset

def test_seed_dataset_is_valid():
    examples = dataset.load(SEED)
    assert len(examples) >= 30
    assert all(set(ex.labels) == set(KEYS) for ex in examples)


def test_dataset_rejects_missing_label(tmp_path):
    bad = tmp_path / "bad.jsonl"
    bad.write_text(json.dumps({"id": "a", "prompt": "x", "labels": {"exemplos": True}}))
    with pytest.raises(ValueError, match="faltando"):
        dataset.load(bad)


def test_dataset_rejects_duplicate_id(tmp_path):
    row = json.dumps({"id": "a", "prompt": "x", "labels": {k: True for k in KEYS}})
    bad = tmp_path / "dup.jsonl"
    bad.write_text(row + "\n" + row + "\n")
    with pytest.raises(ValueError, match="duplicado"):
        dataset.load(bad)


# ---------------------------------------------------------------- metrics

def test_percentile_interpolates():
    assert metrics.percentile([1, 2, 3, 4], 50) == 2.5
    assert metrics.percentile([10], 95) == 10


def test_ece_zero_when_perfectly_calibrated():
    # confiança 0.8 e 80% de acerto
    pairs = [(0.8, True)] * 8 + [(0.8, False)] * 2
    assert metrics.expected_calibration_error(pairs) == pytest.approx(0.0)


def test_ece_penalizes_overconfidence():
    pairs = [(1.0, True)] * 5 + [(1.0, False)] * 5
    assert metrics.expected_calibration_error(pairs) == pytest.approx(0.5)


def test_compute_excludes_errors_and_prices_tokens():
    examples = [_ex(), _ex()]
    preds = [_pred(0.95, tin=1_000_000), providers.Prediction(error="boom")]
    m = metrics.compute("x", 1.0, 0.0, examples, preds)
    assert m.n_errors == 1 and m.error_rate == 0.5
    assert m.n_decisions == len(KEYS)
    assert m.accuracy == 1.0
    assert m.cost_usd == pytest.approx(1.0)
    assert m.auto_coverage == 1.0


# ---------------------------------------------------------------- gate

def _m(**kw) -> metrics.Metrics:
    base = dict(
        provider="x", n_examples=300, n_errors=0, n_decisions=2400, accuracy=0.9,
        brier=0.05, ece=0.03, auto_threshold=0.9, auto_coverage=0.8,
        auto_accuracy=0.97, latency_p50_ms=50, latency_p95_ms=80, cost_usd=0.01,
        cost_per_1k_decisions_usd=0.001,
    )
    base.update(kw)
    return metrics.Metrics(**base)


def test_gate_approves_when_all_criteria_met():
    v = gate.evaluate(_m(), _m(latency_p95_ms=2000, cost_per_1k_decisions_usd=0.5))
    assert v.status == "APROVADO"


def test_gate_rejects_poor_calibration():
    v = gate.evaluate(_m(ece=0.2), _m(latency_p95_ms=2000))
    assert v.status == "REPROVADO"
    assert not next(c for c in v.checks if c.name == "calibração").passed


def test_gate_rejects_accuracy_drop():
    v = gate.evaluate(_m(accuracy=0.80), _m(accuracy=0.90, latency_p95_ms=2000))
    assert v.status == "REPROVADO"


def test_gate_inconclusive_on_small_sample():
    v = gate.evaluate(_m(n_examples=32), _m(latency_p95_ms=2000))
    assert v.status == "INCONCLUSIVO"


# ---------------------------------------------------------------- Jev

def _jev_ok_payload(p: float = 0.9) -> dict:
    return {
        "model": "jev-1.13.0",
        "answers": {k: {"type": "noul", "noul": p} for k in KEYS},
        "usage": {"input_tokens": 400, "output_tokens": 70},
    }


def test_jev_request_shape_and_parsing():
    calls = []

    def fake_post(url, body, headers, timeout):
        calls.append((url, body, headers))
        return 200, {}, _jev_ok_payload(0.9)

    jev = providers.JevProvider(api_key="k", post=fake_post)
    pred = jev.predict("resuma o documento")
    assert pred.error is None
    assert pred.probs == {k: 0.9 for k in KEYS}
    assert pred.input_tokens == 400
    url, body, headers = calls[0]
    assert url == "https://api.typesafe.ai/v1/systemone"
    assert headers["Authorization"] == "Bearer k"
    assert body["model"] == "jev-1.13.0"
    assert body["state"] == "resuma o documento"
    assert set(body["questions"]) == set(KEYS)
    assert all(q["type"] == "noul" for q in body["questions"].values())


def test_jev_retries_429_then_succeeds(monkeypatch):
    monkeypatch.setattr(providers.time, "sleep", lambda s: None)
    responses = [(429, {"Retry-After": "1"}, {}), (200, {}, _jev_ok_payload())]
    jev = providers.JevProvider(api_key="k", post=lambda *a: responses.pop(0))
    assert jev.predict("x").error is None


def test_jev_non_retryable_error_becomes_prediction_error():
    jev = providers.JevProvider(
        api_key="k", post=lambda *a: (401, {}, {"error": "bad key"})
    )
    pred = jev.predict("x")
    assert pred.error and "401" in pred.error


def test_jev_missing_answer_is_error():
    payload = _jev_ok_payload()
    del payload["answers"]["exemplos"]
    jev = providers.JevProvider(api_key="k", post=lambda *a: (200, {}, payload))
    assert "exemplos" in jev.predict("x").error


def test_jev_requires_key(monkeypatch):
    monkeypatch.delenv("TYPESAFE_API_KEY", raising=False)
    with pytest.raises(RuntimeError):
        providers.JevProvider()


# ---------------------------------------------------------------- Claude

class _FakeMessages:
    def __init__(self, stop_reason="end_turn", value=0.7):
        self.stop_reason, self.value, self.kwargs = stop_reason, value, None

    def parse(self, **kwargs):
        self.kwargs = kwargs
        schema = kwargs["output_format"]
        parsed = schema(**{k: self.value for k in KEYS})
        return SimpleNamespace(
            stop_reason=self.stop_reason,
            parsed_output=parsed,
            usage=SimpleNamespace(input_tokens=900, output_tokens=120),
        )


def test_claude_provider_parses_structured_output():
    fake = _FakeMessages(value=1.4)  # fora de [0,1] → clamp
    p = providers.ClaudeProvider(client=SimpleNamespace(messages=fake))
    pred = p.predict("resuma")
    assert pred.error is None
    assert pred.probs == {k: 1.0 for k in KEYS}
    assert fake.kwargs["model"] == "claude-haiku-4-5"
    assert "<prompt_avaliado>" in fake.kwargs["messages"][0]["content"]
    assert (p.price_in, p.price_out) == (1.0, 5.0)


def test_claude_refusal_is_error():
    fake = _FakeMessages(stop_reason="refusal")
    p = providers.ClaudeProvider(client=SimpleNamespace(messages=fake))
    assert p.predict("x").error == "RuntimeError: refusal"


# ---------------------------------------------------------------- CLI

def test_cli_rules_only_writes_outputs(tmp_path, capsys):
    rc = cli.main(["--providers", "rules", "--limit", "5", "--out", str(tmp_path)])
    assert rc == 0
    assert (tmp_path / "report.md").exists()
    data = json.loads((tmp_path / "metrics.json").read_text())
    assert data["metrics"][0]["n_examples"] == 5
    assert data["verdict"] is None


def test_cli_skips_provider_failing_preflight(tmp_path, monkeypatch):
    class Broken:
        name, price_in, price_out = "jev", 0.0, 0.0

        def predict(self, prompt):
            return providers.Prediction(error="auth")

    real_build = providers.build
    monkeypatch.setattr(
        providers, "build", lambda n: Broken() if n == "jev" else real_build(n)
    )
    rc = cli.main(["--providers", "rules,jev", "--limit", "3", "--out", str(tmp_path)])
    assert rc == 0
    lines = (tmp_path / "predictions.jsonl").read_text().splitlines()
    assert all(json.loads(line)["provider"] == "rules" for line in lines)
