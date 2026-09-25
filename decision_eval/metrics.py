"""Métricas de decisões binárias probabilísticas.

Tudo é calculado sobre decisões individuais (exemplo × pergunta); latência e
custo são por requisição (1 requisição = 1 exemplo = 8 decisões).
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field

from .dataset import Example
from .providers import Prediction
from .questions import KEYS


@dataclass
class Metrics:
    provider: str
    n_examples: int
    n_errors: int
    n_decisions: int
    accuracy: float
    brier: float
    ece: float
    auto_threshold: float
    auto_coverage: float
    auto_accuracy: float
    latency_p50_ms: float
    latency_p95_ms: float
    cost_usd: float
    cost_per_1k_decisions_usd: float
    per_question_accuracy: dict[str, float] = field(default_factory=dict)

    @property
    def error_rate(self) -> float:
        return self.n_errors / self.n_examples if self.n_examples else 0.0


def percentile(values: list[float], q: float) -> float:
    """Percentil por interpolação linear (q em [0, 100])."""
    if not values:
        return float("nan")
    xs = sorted(values)
    pos = (len(xs) - 1) * q / 100
    lo, hi = math.floor(pos), math.ceil(pos)
    return xs[lo] + (xs[hi] - xs[lo]) * (pos - lo)


def expected_calibration_error(
    pairs: list[tuple[float, bool]], n_bins: int = 10
) -> float:
    """ECE sobre a confiança da classe prevista (max(p, 1-p)).

    A confiança fica em [0.5, 1]; bins igualmente espaçados nesse intervalo.
    """
    if not pairs:
        return float("nan")
    bins: list[list[tuple[float, bool]]] = [[] for _ in range(n_bins)]
    for p, y in pairs:
        conf = max(p, 1 - p)
        correct = (p >= 0.5) == y
        idx = min(int((conf - 0.5) / 0.5 * n_bins), n_bins - 1)
        bins[idx].append((conf, correct))
    total = len(pairs)
    ece = 0.0
    for b in bins:
        if b:
            avg_conf = sum(c for c, _ in b) / len(b)
            acc = sum(1 for _, ok in b if ok) / len(b)
            ece += len(b) / total * abs(avg_conf - acc)
    return ece


def compute(
    provider: str,
    price_in: float,
    price_out: float,
    examples: list[Example],
    predictions: list[Prediction],
    auto_threshold: float = 0.9,
) -> Metrics:
    pairs: list[tuple[float, bool]] = []
    per_q: dict[str, list[bool]] = {k: [] for k in KEYS}
    latencies: list[float] = []
    tokens_in = tokens_out = 0
    errors = 0

    for ex, pred in zip(examples, predictions, strict=True):
        if pred.error:
            errors += 1
            continue
        latencies.append(pred.latency_s * 1000)
        tokens_in += pred.input_tokens
        tokens_out += pred.output_tokens
        for k in KEYS:
            p, y = pred.probs[k], ex.labels[k]
            pairs.append((p, y))
            per_q[k].append((p >= 0.5) == y)

    n = len(pairs)
    correct = sum(1 for p, y in pairs if (p >= 0.5) == y)
    brier = sum((p - float(y)) ** 2 for p, y in pairs) / n if n else float("nan")
    auto = [(p, y) for p, y in pairs if max(p, 1 - p) >= auto_threshold]
    auto_correct = sum(1 for p, y in auto if (p >= 0.5) == y)
    cost = (tokens_in * price_in + tokens_out * price_out) / 1_000_000

    return Metrics(
        provider=provider,
        n_examples=len(examples),
        n_errors=errors,
        n_decisions=n,
        accuracy=correct / n if n else float("nan"),
        brier=brier,
        ece=expected_calibration_error(pairs),
        auto_threshold=auto_threshold,
        auto_coverage=len(auto) / n if n else float("nan"),
        auto_accuracy=auto_correct / len(auto) if auto else float("nan"),
        latency_p50_ms=percentile(latencies, 50),
        latency_p95_ms=percentile(latencies, 95),
        cost_usd=cost,
        cost_per_1k_decisions_usd=cost / n * 1000 if n else float("nan"),
        per_question_accuracy={
            k: sum(v) / len(v) if v else float("nan") for k, v in per_q.items()
        },
    )
