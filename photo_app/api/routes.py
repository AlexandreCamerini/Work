from fastapi import APIRouter, HTTPException, UploadFile

from photo_app.api.schemas import JobStatusResponse, UploadResponse
from photo_app.config import settings
from photo_app.pipeline.orchestrator import process_photo
from photo_app.pipeline.queue import queue
from photo_app.storage.local_storage import storage

router = APIRouter(prefix="/photos", tags=["photos"])


@router.post("/upload", response_model=UploadResponse)
async def upload_photo(file: UploadFile) -> UploadResponse:
    content = await file.read()
    if len(content) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Arquivo excede o limite configurado")

    image_path = storage.save(file.filename or "upload", content)
    job = queue.submit(lambda: process_photo(image_path))
    return UploadResponse(job_id=job.id, status=job.status.value)


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str) -> JobStatusResponse:
    job = queue.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    return JobStatusResponse(job_id=job.id, status=job.status.value, result=job.result, error=job.error)
