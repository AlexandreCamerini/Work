from abc import ABC, abstractmethod


class PhotoStorage(ABC):
    @abstractmethod
    def save(self, filename: str, content: bytes) -> str:
        """Persiste o arquivo e retorna um path/URI utilizável pelos estágios do pipeline."""
        raise NotImplementedError
