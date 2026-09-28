"""Roda modelos localmente via `transformers`/`diffusers`.

Import de transformers é lazy (dentro do método) para não forçar essa dependência pesada
em quem só quer rodar testes de pipeline ou usar o backend hf_endpoint.
"""
import time

from photo_app.inference.base import InferenceBackend, InferenceResult

_PIPELINE_CACHE: dict[str, object] = {}


class LocalBackend(InferenceBackend):
    def run(self, model_id: str, inputs: dict) -> InferenceResult:
        from transformers import pipeline as hf_pipeline

        task = inputs.pop("_task")
        if model_id not in _PIPELINE_CACHE:
            _PIPELINE_CACHE[model_id] = hf_pipeline(task=task, model=model_id)
        pipe = _PIPELINE_CACHE[model_id]

        start = time.perf_counter()
        output = pipe(**inputs)
        latency_ms = (time.perf_counter() - start) * 1000
        return InferenceResult(output=output, latency_ms=latency_ms, backend="local")
