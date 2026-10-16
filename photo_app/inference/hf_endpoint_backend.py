"""Chama um HF Inference Endpoint (ou a Inference API pública) via HTTP.

Uso recomendado em produção para modelos pesados (diffusion, upscaling) — evita manter
GPU própria ociosa. Trade-off: latência de rede + custo por chamada, então nunca chamar
isso de forma síncrona dentro de um request HTTP do usuário — sempre via fila (ver
pipeline/queue.py).
"""
import time

import httpx

from photo_app.config import settings
from photo_app.inference.base import InferenceBackend, InferenceResult


class HFEndpointBackend(InferenceBackend):
    def __init__(self, timeout_s: float = 60.0) -> None:
        if not settings.hf_token:
            raise RuntimeError("HF_TOKEN não configurado para o backend hf_endpoint")
        self._timeout_s = timeout_s

    def run(self, model_id: str, inputs: dict) -> InferenceResult:
        inputs.pop("_task", None)
        url = settings.hf_endpoint_url or f"https://api-inference.huggingface.co/models/{model_id}"
        headers = {"Authorization": f"Bearer {settings.hf_token}"}

        start = time.perf_counter()
        response = httpx.post(url, headers=headers, json=inputs, timeout=self._timeout_s)
        response.raise_for_status()
        latency_ms = (time.perf_counter() - start) * 1000
        return InferenceResult(output=response.json(), latency_ms=latency_ms, backend="hf_endpoint")
