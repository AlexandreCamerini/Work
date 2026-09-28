"""Configuração central. Tudo que muda entre ambientes vive aqui, nunca hardcoded nos módulos."""
import os
from enum import Enum


class BackendKind(str, Enum):
    LOCAL = "local"
    HF_ENDPOINT = "hf_endpoint"


class Settings:
    def __init__(self) -> None:
        self.inference_backend = BackendKind(os.getenv("INFERENCE_BACKEND", BackendKind.LOCAL.value))
        self.hf_token = os.getenv("HF_TOKEN", "")
        self.hf_endpoint_url = os.getenv("HF_ENDPOINT_URL", "")
        self.storage_root = os.getenv("PHOTO_STORAGE_ROOT", "./data/photos")
        self.max_upload_mb = int(os.getenv("MAX_UPLOAD_MB", "20"))


settings = Settings()
