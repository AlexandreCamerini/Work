"""Legenda automática de foto (accessibility alt-text, busca por texto livre)."""
from photo_app.inference.registry import get_backend

MODEL_ID = "Salesforce/blip-image-captioning-base"


def caption_image(image_path: str) -> str:
    backend = get_backend()
    result = backend.run(MODEL_ID, {"_task": "image-to-text", "images": image_path})
    return result.output[0]["generated_text"]
