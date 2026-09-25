"""Gate de aceite: o candidato (Jev) só entra se bater TODOS os critérios.

Critérios (ajustáveis via `Criteria`):
  1. amostra      — n_examples ≥ min_examples, senão o veredito é INCONCLUSIVO
  2. estabilidade — taxa de erro de requisição ≤ max_error_rate
  3. qualidade    — acurácia ≥ acurácia do baseline − accuracy_tolerance
  4. calibração   — ECE ≤ max_ece
  5. eficiência   — ganho ≥ min_speedup em latência p95 OU em custo/1k decisões
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from .metrics import Metrics


@dataclass(frozen=True)
class Criteria:
    min_examples: int = 200
    max_error_rate: float = 0.05
    accuracy_tolerance: float = 0.02
    max_ece: float = 0.05
    min_speedup: float = 10.0


@dataclass
class Check:
    name: str
    passed: bool
    detail: str


@dataclass
class Verdict:
    status: str  # APROVADO | REPROVADO | INCONCLUSIVO
    checks: list[Check]


def _ratio(baseline: float, candidate: float) -> float:
    if math.isnan(baseline) or math.isnan(candidate):
        return float("nan")
    if candidate <= 0:
        return math.inf if baseline > 0 else 1.0
    return baseline / candidate


def evaluate(candidate: Metrics, baseline: Metrics, c: Criteria = Criteria()) -> Verdict:
    lat_gain = _ratio(baseline.latency_p95_ms, candidate.latency_p95_ms)
    cost_gain = _ratio(baseline.cost_per_1k_decisions_usd, candidate.cost_per_1k_decisions_usd)
    checks = [
        Check(
            "estabilidade",
            candidate.error_rate <= c.max_error_rate,
            f"erros {candidate.error_rate:.1%} (máx {c.max_error_rate:.0%})",
        ),
        Check(
            "qualidade",
            candidate.accuracy >= baseline.accuracy - c.accuracy_tolerance,
            f"acurácia {candidate.accuracy:.3f} vs baseline {baseline.accuracy:.3f} "
            f"(tolerância {c.accuracy_tolerance})",
        ),
        Check(
            "calibração",
            candidate.ece <= c.max_ece,
            f"ECE {candidate.ece:.3f} (máx {c.max_ece})",
        ),
        Check(
            "eficiência",
            lat_gain >= c.min_speedup or cost_gain >= c.min_speedup,
            f"p95 {lat_gain:.1f}x mais rápido, custo {cost_gain:.1f}x menor "
            f"(mín {c.min_speedup:.0f}x em um dos dois)",
        ),
    ]
    if candidate.n_examples < c.min_examples:
        status = "INCONCLUSIVO"
        checks.insert(0, Check(
            "amostra", False,
            f"{candidate.n_examples} exemplos (mín {c.min_examples}) — "
            "resultado indicativo, não decisório",
        ))
    else:
        status = "APROVADO" if all(ch.passed for ch in checks) else "REPROVADO"
    return Verdict(status, checks)
