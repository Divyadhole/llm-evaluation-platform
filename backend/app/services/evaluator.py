from datetime import UTC, datetime
from uuid import uuid4

from app.models.schemas import EvaluationMetric, EvaluationRequest, EvaluationRun, JudgeType, RunStatus
from app.services.catalog import RUNS


def summarize_quality(metrics: list[EvaluationMetric]) -> float:
    if not metrics:
        return 0.0
    return round(sum(metric.score for metric in metrics) / len(metrics), 3)


def determine_status(metrics: list[EvaluationMetric]) -> RunStatus:
    failures = [metric for metric in metrics if metric.score < metric.threshold]
    if len(failures) >= 2:
        return RunStatus.FAILED
    if failures:
        return RunStatus.WARNING
    return RunStatus.PASSED


def create_evaluation(request: EvaluationRequest) -> EvaluationRun:
    input_length = max(len(request.input), 1)
    expected_bonus = 0.04 if request.expected_answer else 0
    base = min(0.98, 0.78 + input_length / 1000 + expected_bonus)
    metrics = [
        EvaluationMetric(name="Correctness", score=round(base, 2), threshold=0.86, judge_type=JudgeType.LLM),
        EvaluationMetric(name="Faithfulness", score=round(min(base + 0.03, 0.99), 2), threshold=0.88, judge_type=JudgeType.LLM),
        EvaluationMetric(name="Context Recall", score=round(min(base - 0.02, 0.99), 2), threshold=0.82, judge_type=JudgeType.HEURISTIC),
    ]

    run = EvaluationRun(
        id=f"eval-{uuid4().hex[:8]}",
        prompt_version_id=request.prompt_version_id,
        model=request.model,
        status=determine_status(metrics),
        metrics=metrics,
        latency_ms=980 + len(request.model) * 34,
        cost_usd=round(input_length * 0.00008, 4),
        created_at=datetime.now(UTC),
    )
    RUNS.insert(0, run)
    return run
