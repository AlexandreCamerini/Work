"""Tagging automático e busca semântica via embeddings CLIP.

zero-shot-image-classification cobre tagging contra um vocabulário fixo de tags do app.
Para busca semântica livre (texto -> foto), troque a task para gerar embeddings e comparar
por similaridade de cosseno num índice vetorial — fora do escopo deste skeleton.
"""
from photo_app.inference.registry import get_backend

MODEL_ID = "openai/clip-vit-base-patch32"

DEFAULT_TAG_VOCABULARY = [
    "pessoa", "paisagem", "comida", "animal", "documento", "cidade", "praia",
    "noite", "festa", "esporte", "natureza", "interior", "veículo",
]


def tag_image(image_path: str, vocabulary: list[str] | None = None, top_k: int = 5) -> list[dict]:
    backend = get_backend()
    result = backend.run(
        MODEL_ID,
        {
            "_task": "zero-shot-image-classification",
            "images": image_path,
            "candidate_labels": vocabulary or DEFAULT_TAG_VOCABULARY,
        },
    )
    return sorted(result.output, key=lambda x: x["score"], reverse=True)[:top_k]
