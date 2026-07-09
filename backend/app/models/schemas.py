from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class RunStatus(str, Enum):
    PASSED = "passed"
    WARNING = "warning"
    FAILED = "failed"


class JudgeType(str, Enum):
    LLM = "llm_judge"
    HUMAN = "human_judge"
    HEURISTIC = "heuristic"


class PromptVersion(BaseModel):
    id: str
    name: str
    version: str
    owner: str
    task: str
    updated_at: datetime


class GoldenExample(BaseModel):
    id: str
    dataset: str
    input: str
    expected_answer: str
    tags: list[str]


class EvaluationMetric(BaseModel):
    name: str
    score: float = Field(ge=0, le=1)
    threshold: float = Field(ge=0, le=1)
    judge_type: JudgeType


class EvaluationRun(BaseModel):
    id: str
    prompt_version_id: str
    model: str
    status: RunStatus
    metrics: list[EvaluationMetric]
    latency_ms: int
    cost_usd: float
    created_at: datetime


class EvaluationRequest(BaseModel):
    prompt_version_id: str
    model: str
    input: str
    expected_answer: str | None = None


class DashboardSummary(BaseModel):
    total_runs: int
    pass_rate: float
    avg_quality: float
    avg_latency_ms: int
    cost_today_usd: float
    regressions: int


class FeedbackRequest(BaseModel):
    run_id: str
    rating: int = Field(ge=1, le=5)
    notes: str | None = None
