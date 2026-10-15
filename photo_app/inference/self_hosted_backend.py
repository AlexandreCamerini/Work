"""Chama um servidor de inferência que você mesmo hospeda — o caso de uso real é uma VM
Oracle Cloud Always Free (Ampere A1, grátis por tempo indeterminado, sem GPU) rodando
o serviço em `inference_server/` deste repo.

Diferença crítica em relação a `LocalBackend`: aqui o modelo NÃO roda no mesmo processo
que o resto do app, então o `image_path` recebido de `models/*.py` é local ao backend
principal (ex.: Railway) e inacessível pra VM remota. Por isso o arquivo é lido e enviado
como multipart, nunca como path.

O endpoint é exposto publicamente na internet (IP da VM) sem nenhuma camada de rede
privada — por isso o token Bearer é obrigatório, não opcional, mesmo sendo "só" um
backend de inferência de imagem.
"""
import time

import httpx

from photo_app.config import settings
from photo_app.inference.base import InferenceBackend, InferenceResult


class SelfHostedBackend(InferenceBackend):
    def __init__(self, timeout_s: float = 60.0) -> None:
        if not settings.self_hosted_url:
            raise RuntimeError("SELF_HOSTED_INFERENCE_URL não configurado")
        if not settings.self_hosted_token:
            raise RuntimeError(
                "SELF_HOSTED_INFERENCE_TOKEN não configurado — "
                "o servidor de inferência fica exposto sem autenticação sem ele"
            )
        self._timeout_s = timeout_s

    def run(self, model_id: str, inputs: dict) -> InferenceResult:
        task = inputs.pop("_task")
        image_path = inputs.pop("images")
        headers = {"Authorization": f"Bearer {settings.self_hosted_token}"}

        with open(image_path, "rb") as f:
            files = {"file": (image_path, f, "application/octet-stream")}
            data = {"model_id": model_id, "task": task, "extra_json": _to_json(inputs)}

            start = time.perf_counter()
            response = httpx.post(
                f"{settings.self_hosted_url}/infer",
                headers=headers,
                data=data,
                files=files,
                timeout=self._timeout_s,
            )
        response.raise_for_status()
        latency_ms = (time.perf_counter() - start) * 1000
        return InferenceResult(output=response.json()["output"], latency_ms=latency_ms, backend="self_hosted")


def _to_json(inputs: dict) -> str:
    import json

    return json.dumps(inputs)
