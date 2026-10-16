"""Contrato único que todo modelo HF deve respeitar, independente de onde roda.

Isolar essa interface é o que permite trocar local <-> Inference Endpoint <-> outro
provedor sem tocar em pipeline/ ou models/. Sem isso, cada wrapper de modelo acopla
diretamente em `transformers` ou em uma URL, e migrar de MVP pra produção vira reescrita.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class InferenceResult:
    output: Any
    latency_ms: float
    backend: str


class InferenceBackend(ABC):
    @abstractmethod
    def run(self, model_id: str, inputs: dict) -> InferenceResult:
        """Executa um modelo identificado por `model_id` (repo id do HF Hub) com `inputs`."""
        raise NotImplementedError
