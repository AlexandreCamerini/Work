from unittest.mock import patch

from photo_app.inference.base import InferenceResult
from photo_app.models.moderation import REJECT_THRESHOLD, moderate


def test_moderate_rejects_at_threshold() -> None:
    fake_result = InferenceResult(
        output=[
            {"label": "normal", "score": 1 - REJECT_THRESHOLD},
            {"label": "nsfw", "score": REJECT_THRESHOLD},
        ],
        latency_ms=1.0,
        backend="fake",
    )
    with patch("photo_app.models.moderation.get_backend", return_value=type(
        "B", (), {"run": staticmethod(lambda *_: fake_result)}
    )()):
        verdict = moderate("fake/path.jpg")

    assert verdict.is_safe is False
    assert verdict.nsfw_score == REJECT_THRESHOLD
