"""Testa o contrato HTTP do SelfHostedBackend sem precisar de uma VM real: mocka
httpx.post e um arquivo de imagem temporário."""
from unittest.mock import MagicMock, patch

import pytest

from photo_app.config import settings


@pytest.fixture
def configured_settings(tmp_path):
    original = (settings.self_hosted_url, settings.self_hosted_token)
    settings.self_hosted_url = "http://oracle-vm:8001"
    settings.self_hosted_token = "test-token"
    yield tmp_path
    settings.self_hosted_url, settings.self_hosted_token = original


def test_run_sends_multipart_with_bearer_token(configured_settings):
    from photo_app.inference.self_hosted_backend import SelfHostedBackend

    image_path = configured_settings / "photo.jpg"
    image_path.write_bytes(b"fake-image-bytes")

    fake_response = MagicMock()
    fake_response.json.return_value = {"output": [{"label": "praia", "score": 0.9}]}
    fake_response.raise_for_status.return_value = None

    with patch("httpx.post", return_value=fake_response) as mock_post:
        backend = SelfHostedBackend()
        result = backend.run(
            "openai/clip-vit-base-patch32",
            {"_task": "zero-shot-image-classification", "images": str(image_path), "candidate_labels": ["praia"]},
        )

    assert result.output == [{"label": "praia", "score": 0.9}]
    assert result.backend == "self_hosted"

    _, kwargs = mock_post.call_args
    assert kwargs["headers"]["Authorization"] == "Bearer test-token"
    assert kwargs["data"]["model_id"] == "openai/clip-vit-base-patch32"
    assert kwargs["data"]["task"] == "zero-shot-image-classification"


def test_requires_token_configured(configured_settings):
    from photo_app.inference.self_hosted_backend import SelfHostedBackend

    settings.self_hosted_token = ""
    with pytest.raises(RuntimeError, match="TOKEN"):
        SelfHostedBackend()
