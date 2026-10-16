"""Testa a lógica de orquestração sem depender de transformers/torch instalados:
o InferenceBackend é mockado em cada wrapper de models/, que é o único ponto de
acoplamento entre models/ e inference/ (cada módulo importa get_backend por nome,
então o patch precisa mirar o módulo consumidor, não photo_app.inference.registry)."""
from contextlib import ExitStack
from unittest.mock import patch

import pytest

from photo_app.inference.base import InferenceResult
from photo_app.pipeline.orchestrator import process_photo


class FakeBackend:
    def __init__(self, nsfw_score: float = 0.01) -> None:
        self._nsfw_score = nsfw_score

    def run(self, model_id: str, inputs: dict) -> InferenceResult:
        task = inputs.get("_task")
        if task == "image-classification":
            output = [
                {"label": "normal", "score": 1 - self._nsfw_score},
                {"label": "nsfw", "score": self._nsfw_score},
            ]
        elif task == "zero-shot-image-classification":
            output = [{"label": "praia", "score": 0.9}]
        elif task == "image-to-text":
            output = [{"generated_text": "uma foto de praia"}]
        elif task == "image-segmentation":
            output = b"fake-png-bytes"
        else:
            raise ValueError(f"task inesperada: {task}")
        return InferenceResult(output=output, latency_ms=1.0, backend="fake")


MODULES_USING_BACKEND = [
    "photo_app.models.moderation.get_backend",
    "photo_app.models.clip_tagging.get_backend",
    "photo_app.models.captioning.get_backend",
    "photo_app.models.background_removal.get_backend",
]


def _patch_all_backends(backend):
    stack = ExitStack()
    for target in MODULES_USING_BACKEND:
        stack.enter_context(patch(target, return_value=backend))
    return stack


@pytest.mark.asyncio
async def test_safe_image_runs_all_stages() -> None:
    with _patch_all_backends(FakeBackend()):
        result = await process_photo("fake/path.jpg")

    assert result["rejected"] is False
    assert result["tags"][0]["label"] == "praia"
    assert result["caption"] == "uma foto de praia"
    assert result["background_removed"] == b"fake-png-bytes"


@pytest.mark.asyncio
async def test_nsfw_image_is_rejected_before_other_stages() -> None:
    backend = FakeBackend(nsfw_score=0.99)
    with _patch_all_backends(backend):
        result = await process_photo("fake/path.jpg")

    assert result["rejected"] is True
    assert result["reason"] == "moderation"
    assert "tags" not in result
