"""Classificação NSFW — roda ANTES de qualquer outro estágio do pipeline.

Furo de lógica comum em apps de foto: processar/gerar thumbnail/servir a imagem antes
de moderar. Aqui a moderação é modelada como gate bloqueante (ver pipeline/orchestrator.py),
não como mais um estágio paralelo.
"""
from dataclasses import dataclass

from photo_app.inference.registry import get_backend

MODEL_ID = "Falconsai/nsfw_image_detection"
REJECT_THRESHOLD = 0.85


@dataclass
class ModerationVerdict:
    is_safe: bool
    nsfw_score: float
    raw_label: str


def moderate(image_path: str) -> ModerationVerdict:
    backend = get_backend()
    result = backend.run(MODEL_ID, {"_task": "image-classification", "images": image_path})

    scores = {item["label"].lower(): item["score"] for item in result.output}
    nsfw_score = scores.get("nsfw", 0.0)
    return ModerationVerdict(
        is_safe=nsfw_score < REJECT_THRESHOLD,
        nsfw_score=nsfw_score,
        raw_label=max(scores, key=scores.get),
    )
