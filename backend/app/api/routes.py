from fastapi import APIRouter

from app.models.schemas import (
    DashboardSummary,
    EvaluationRequest,
    EvaluationRun,
    FeedbackRequest,
    GoldenExample,
    PromptVersion,
)
from app.services.catalog import GOLDEN_DATASET, PROMPTS, RUNS
from app.services.evaluator import create_evaluation, summarize_quality

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_summary() -> DashboardSummary:
    total_metrics = [metric for run in RUNS for metric in run.metrics]
    return DashboardSummary(
        total_runs=len(RUNS),
        pass_rate=round(len([run for run in RUNS if run.status == "passed"]) / len(RUNS), 2),
        avg_quality=summarize_quality(total_metrics),
        avg_latency_ms=round(sum(run.latency_ms for run in RUNS) / len(RUNS)),
        cost_today_usd=round(sum(run.cost_usd for run in RUNS), 3),
        regressions=len([run for run in RUNS if run.status in {"warning", "failed"}]),
    )


@router.get("/prompts", response_model=list[PromptVersion])
def list_prompts() -> list[PromptVersion]:
    return PROMPTS


@router.get("/datasets", response_model=list[GoldenExample])
def list_datasets() -> list[GoldenExample]:
    return GOLDEN_DATASET


@router.get("/runs", response_model=list[EvaluationRun])
def list_runs() -> list[EvaluationRun]:
    return RUNS


@router.post("/evaluate", response_model=EvaluationRun)
def evaluate(request: EvaluationRequest) -> EvaluationRun:
    return create_evaluation(request)


@router.post("/feedback")
def save_feedback(request: FeedbackRequest) -> dict[str, str | int | None]:
    return {"status": "saved", "run_id": request.run_id, "rating": request.rating, "notes": request.notes}
