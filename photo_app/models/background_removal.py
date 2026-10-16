"""Remoção de fundo. Modelo leve o suficiente para candidatar-se a rodar no client via
transformers.js/ONNX Runtime Web — ver README.md, seção "Onde cada modelo roda"."""
from photo_app.inference.registry import get_backend

MODEL_ID = "briaai/RMBG-2.0"


def remove_background(image_path: str) -> bytes:
    backend = get_backend()
    result = backend.run(MODEL_ID, {"_task": "image-segmentation", "images": image_path})
    return result.output
