from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings

app = FastAPI(
    title="LLM Evaluation Platform",
    description="Portfolio API for prompt testing, model comparison, and AI quality evaluation.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "LLM Evaluation Platform API",
        "status": "running",
        "docs": "http://localhost:8100/docs",
        "frontend": "http://localhost:5175",
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "llm-evaluation-platform"}
