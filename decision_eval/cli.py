"""CLI do POC: roda providers sobre o dataset, mede e aplica o gate.

    python -m decision_eval --providers rules,jev,claude
    python -m decision_eval --providers rules --limit 10     # smoke test sem custo

Providers sem credencial são pulados com aviso (degradação), não abortam.
Saídas em --out: predictions.jsonl (bruto, para recálculo), metrics.json,
report.md.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict
from pathlib import Path

from . import dataset, gate, metrics, providers

DEFAULT_DATA = Path(__file__).resolve().parent.parent / "data" / "prompt_quality_seed.jsonl"


def run_provider(p: providers.Provider, examples: list[dataset.Example], concurrency: int):
    """Preflight no 1º exemplo: se falhar (credencial, rede, modelo), devolve
    None em vez de gastar o lote inteiro em erros."""
    first = p.predict(examples[0].prompt)
    if first.error:
        print(f"[aviso] provider '{p.name}' pulado no preflight: {first.error}",
              file=sys.stderr)
        return None
    workers = 1 if p.name == "rules" else concurrency
    with ThreadPoolExecutor(max_workers=workers) as pool:
        return [first] + list(pool.map(lambda ex: p.predict(ex.prompt), examples[1:]))


def _fmt(x: float, spec: str) -> str:
    return "—" if isinstance(x, float) and math.isnan(x) else format(x, spec)


def render_report(
    results: list[metrics.Metrics], verdict: gate.Verdict | None, data_path: str
) -> str:
    out = [f"# POC Jev — relatório\n\nDataset: `{data_path}`\n"]
    out.append(
        "| provider | exemplos | erros | acurácia | Brier | ECE | "
        "cobertura auto | acurácia auto | p50 ms | p95 ms | US$/1k decisões |"
    )
    out.append("|---|---|---|---|---|---|---|---|---|---|---|")
    for m in results:
        out.append(
            f"| {m.provider} | {m.n_examples} | {m.n_errors} | "
            f"{_fmt(m.accuracy, '.3f')} | {_fmt(m.brier, '.3f')} | {_fmt(m.ece, '.3f')} | "
            f"{_fmt(m.auto_coverage, '.1%')} | {_fmt(m.auto_accuracy, '.3f')} | "
            f"{_fmt(m.latency_p50_ms, '.0f')} | {_fmt(m.latency_p95_ms, '.0f')} | "
            f"{_fmt(m.cost_per_1k_decisions_usd, '.5f')} |"
        )
    out.append(
        f"\n\"Auto\" = decisões com confiança ≥ {results[0].auto_threshold} "
        "(as que o código executaria sem revisão).\n"
    )
    out.append("## Acurácia por pergunta\n")
    keys = list(results[0].per_question_accuracy)
    out.append("| pergunta | " + " | ".join(m.provider for m in results) + " |")
    out.append("|---|" + "---|" * len(results))
    for k in keys:
        out.append(
            f"| {k} | "
            + " | ".join(_fmt(m.per_question_accuracy[k], ".2f") for m in results)
            + " |"
        )
    if verdict:
        out.append(f"\n## Gate: **{verdict.status}**\n")
        for ch in verdict.checks:
            out.append(f"- {'✅' if ch.passed else '❌'} **{ch.name}** — {ch.detail}")
    else:
        out.append("\n## Gate: não avaliado (requer providers `jev` e `claude`)")
    return "\n".join(out) + "\n"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="decision_eval", description=__doc__.splitlines()[0])
    ap.add_argument("--data", default=str(DEFAULT_DATA))
    ap.add_argument("--providers", default="rules,jev,claude")
    ap.add_argument("--limit", type=int, default=0, help="usar só os N primeiros exemplos")
    ap.add_argument("--concurrency", type=int, default=4)
    ap.add_argument("--auto-threshold", type=float, default=0.9)
    ap.add_argument("--out", default="results")
    args = ap.parse_args(argv)

    if not 0.5 <= args.auto_threshold <= 1.0:
        ap.error("--auto-threshold deve estar em [0.5, 1.0]")
    if args.concurrency < 1:
        ap.error("--concurrency deve ser ≥ 1")

    examples = dataset.load(args.data)
    if args.limit:
        examples = examples[: args.limit]

    instances: list[providers.Provider] = []
    for name in [n.strip() for n in args.providers.split(",") if n.strip()]:
        try:
            instances.append(providers.build(name))
        except Exception as exc:  # noqa: BLE001
            print(f"[aviso] provider '{name}' pulado: {exc}", file=sys.stderr)
    if not instances:
        print("nenhum provider disponível", file=sys.stderr)
        return 2

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    results: list[metrics.Metrics] = []
    with open(out_dir / "predictions.jsonl", "w", encoding="utf-8") as raw:
        for p in instances:
            print(f"[run] {p.name}: {len(examples)} exemplos...", file=sys.stderr)
            preds = run_provider(p, examples, args.concurrency)
            if preds is None:
                continue
            for ex, pr in zip(examples, preds):
                raw.write(json.dumps({"provider": p.name, "id": ex.id, **asdict(pr)},
                                     ensure_ascii=False) + "\n")
            m = metrics.compute(p.name, p.price_in, p.price_out, examples, preds,
                                args.auto_threshold)
            if m.n_errors:
                first = next(pr.error for pr in preds if pr.error)
                print(f"[aviso] {p.name}: {m.n_errors} erro(s); primeiro: {first}",
                      file=sys.stderr)
            results.append(m)

    if not results:
        print("nenhum provider concluiu a execução", file=sys.stderr)
        return 2

    by_kind = {m.provider.split(":")[0]: m for m in results}
    verdict = None
    if "jev" in by_kind and "claude" in by_kind:
        verdict = gate.evaluate(by_kind["jev"], by_kind["claude"])

    (out_dir / "metrics.json").write_text(json.dumps(
        {"metrics": [asdict(m) for m in results],
         "verdict": asdict(verdict) if verdict else None},
        ensure_ascii=False, indent=2,
    ))
    report = render_report(results, verdict, args.data)
    (out_dir / "report.md").write_text(report, encoding="utf-8")
    print(report)
    return 0


if __name__ == "__main__":
    sys.exit(main())
