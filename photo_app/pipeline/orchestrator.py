"""Orquestra os estágios de processamento de uma foto.

Regra de negócio central: moderação é um GATE, não um estágio como os outros.
Se a imagem for rejeitada, nenhum outro modelo roda sobre ela — nem tagging, nem
armazenamento do resultado processado. Os demais estágios (tagging, bg removal,
caption) são best-effort: a falha de um não derruba os outros nem o job inteiro,
porque cada um alimenta uma feature independente da UI.
"""
import asyncio
import logging

from photo_app.models import background_removal, captioning, clip_tagging, moderation

logger = logging.getLogger(__name__)


async def process_photo(image_path: str) -> dict:
    verdict = await asyncio.to_thread(moderation.moderate, image_path)
    if not verdict.is_safe:
        return {
            "rejected": True,
            "reason": "moderation",
            "nsfw_score": verdict.nsfw_score,
        }

    stages = {
        "tags": (clip_tagging.tag_image, image_path),
        "caption": (captioning.caption_image, image_path),
        "background_removed": (background_removal.remove_background, image_path),
    }

    results: dict = {"rejected": False}
    outcomes = await asyncio.gather(
        *(asyncio.to_thread(fn, arg) for fn, arg in stages.values()),
        return_exceptions=True,
    )
    for (stage_name, _), outcome in zip(stages.items(), outcomes, strict=True):
        if isinstance(outcome, Exception):
            logger.warning("Estágio %s falhou para %s: %s", stage_name, image_path, outcome)
            results[stage_name] = None
        else:
            results[stage_name] = outcome
    return results
