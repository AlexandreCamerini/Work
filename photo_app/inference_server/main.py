"""Servidor de inferência standalone, pensado para rodar numa VM Oracle Cloud Always
Free (Ampere A1, ARM64, sem GPU) — ou qualquer máquina CPU-only sempre ligada e grátis.

Deliberadamente separado do resto do `photo_app`: não conhece storage, fila ou moderação
de negócio — só recebe (model_id, task, arquivo), roda `transformers.pipeline` e devolve
o resultado. O lado cliente é `inference/self_hosted_backend.py`.

Rodar:
    pip install -r inference_server/requirements.txt
    INFERENCE_SERVER_TOKEN=<token-forte> uvicorn photo_app.inference_server.main:app --host 0.0.0.0 --port 8001
"""
import io
import json
import os

from fastapi import Depends, FastAPI, Form, HTTPException, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from PIL import Image

app = FastAPI(title="Photo App — Self-Hosted Inference Server")
_bearer = HTTPBearer()
_PIPELINE_CACHE: dict[str, object] = {}

_EXPECTED_TOKEN = os.getenv("INFERENCE_SERVER_TOKEN", "")
if not _EXPECTED_TOKEN:
    raise RuntimeError("INFERENCE_SERVER_TOKEN não configurado — endpoint ficaria aberto na internet")


def require_token(credentials: HTTPAuthorizationCredentials = Depends(_bearer)) -> None:
    if credentials.credentials != _EXPECTED_TOKEN:
        raise HTTPException(status_code=401, detail="Token inválido")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/infer", dependencies=[Depends(require_token)])
async def infer(
    file: UploadFile,
    model_id: str = Form(...),
    task: str = Form(...),
    extra_json: str = Form("{}"),
) -> dict:
    from transformers import pipeline as hf_pipeline

    if model_id not in _PIPELINE_CACHE:
        _PIPELINE_CACHE[model_id] = hf_pipeline(task=task, model=model_id)
    pipe = _PIPELINE_CACHE[model_id]

    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    output = pipe(images=image, **json.loads(extra_json))
    return {"output": output}
