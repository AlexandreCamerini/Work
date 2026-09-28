"""Fila assíncrona in-process para processamento de fotos.

Interface deliberadamente mínima para ser substituível por Redis/RQ ou Celery quando o
volume justificar (múltiplos workers, retry persistente, observabilidade de fila). Trocar
o backend aqui não deve exigir mudar orchestrator.py nem api/routes.py.
"""
import asyncio
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from enum import Enum
from uuid import uuid4


class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"
    REJECTED = "rejected"  # bloqueado pela moderação


@dataclass
class Job:
    id: str = field(default_factory=lambda: str(uuid4()))
    status: JobStatus = JobStatus.QUEUED
    result: dict | None = None
    error: str | None = None


class PhotoJobQueue:
    def __init__(self) -> None:
        self._jobs: dict[str, Job] = {}

    def submit(self, coro_factory: Callable[[], Awaitable[dict]]) -> Job:
        job = Job()
        self._jobs[job.id] = job
        asyncio.create_task(self._run(job, coro_factory))
        return job

    async def _run(self, job: Job, coro_factory: Callable[[], Awaitable[dict]]) -> None:
        job.status = JobStatus.RUNNING
        try:
            job.result = await coro_factory()
            job.status = (
                JobStatus.REJECTED if job.result.get("rejected") else JobStatus.DONE
            )
        except Exception as exc:  # job de background: isolar falha, nunca propagar
            job.status = JobStatus.FAILED
            job.error = str(exc)

    def get(self, job_id: str) -> Job | None:
        return self._jobs.get(job_id)


queue = PhotoJobQueue()
