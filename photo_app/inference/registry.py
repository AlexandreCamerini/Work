"""Ponto único de decisão: qual backend atende qual chamada.

`models/*.py` nunca instancia um backend diretamente — sempre pede ao registry.
Isso mantém a troca local/hospedado como uma mudança de env var, não de código.
"""
from photo_app.config import BackendKind, settings
from photo_app.inference.base import InferenceBackend

_INSTANCES: dict[BackendKind, InferenceBackend] = {}


def get_backend() -> InferenceBackend:
    kind = settings.inference_backend
    if kind not in _INSTANCES:
        if kind is BackendKind.LOCAL:
            from photo_app.inference.local_backend import LocalBackend

            _INSTANCES[kind] = LocalBackend()
        elif kind is BackendKind.HF_ENDPOINT:
            from photo_app.inference.hf_endpoint_backend import HFEndpointBackend

            _INSTANCES[kind] = HFEndpointBackend()
        else:
            raise ValueError(f"Backend desconhecido: {kind}")
    return _INSTANCES[kind]
