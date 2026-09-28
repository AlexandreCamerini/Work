"""Storage local para MVP. Trocar por S3/GCS implica só um novo módulo que respeite
PhotoStorage — nenhuma outra camada referencia caminho de disco diretamente."""
from pathlib import Path
from uuid import uuid4

from photo_app.config import settings
from photo_app.storage.base import PhotoStorage


class LocalPhotoStorage(PhotoStorage):
    def __init__(self) -> None:
        self._root = Path(settings.storage_root)
        self._root.mkdir(parents=True, exist_ok=True)

    def save(self, filename: str, content: bytes) -> str:
        suffix = Path(filename).suffix
        dest = self._root / f"{uuid4()}{suffix}"
        dest.write_bytes(content)
        return str(dest)


storage = LocalPhotoStorage()
