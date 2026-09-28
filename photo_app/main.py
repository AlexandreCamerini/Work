from fastapi import FastAPI

from photo_app.api.routes import router

app = FastAPI(title="Photo App", version="0.1.0")
app.include_router(router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
