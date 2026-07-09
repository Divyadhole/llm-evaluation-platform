export type Summary = {
  total_runs: number;
  pass_rate: number;
  avg_quality: number;
  avg_latency_ms: number;
  cost_today_usd: number;
  regressions: number;
};

export type PromptVersion = {
  id: string;
  name: string;
  version: string;
  owner: string;
  task: string;
  updated_at: string;
};

export type Metric = {
  name: string;
  score: number;
  threshold: number;
  judge_type: "llm_judge" | "human_judge" | "heuristic";
};

export type EvaluationRun = {
  id: string;
  prompt_version_id: string;
  model: string;
  status: "passed" | "warning" | "failed";
  metrics: Metric[];
  latency_ms: number;
  cost_usd: number;
  created_at: string;
};

export type GoldenExample = {
  id: string;
  dataset: string;
  input: string;
  expected_answer: string;
  tags: string[];
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8100/api";

export const demoSummary: Summary = {
  total_runs: 312,
  pass_rate: 0.87,
  avg_quality: 0.89,
  avg_latency_ms: 1460,
  cost_today_usd: 18.42,
  regressions: 6,
};

export const demoPrompts: PromptVersion[] = [
  {
    id: "prompt-support-v3",
    name: "Support Triage",
    version: "3.0",
    owner: "AI Quality",
    task: "Classify support tickets, summarize urgency, and suggest routing.",
    updated_at: "2026-07-06T18:15:00Z",
  },
  {
    id: "prompt-policy-v2",
    name: "Policy QA",
    version: "2.1",
    owner: "Trust and Safety",
    task: "Answer policy questions with citations and uncertainty handling.",
    updated_at: "2026-07-07T14:20:00Z",
  },
  {
    id: "prompt-sales-v1",
    name: "Sales Research",
    version: "1.4",
    owner: "Growth",
    task: "Summarize account research and produce next-best actions.",
    updated_at: "2026-07-08T09:45:00Z",
  },
];

export const demoRuns: EvaluationRun[] = [
  {
    id: "eval-1001",
    prompt_version_id: "prompt-support-v3",
    model: "gpt-4.1",
    status: "passed",
    metrics: [
      { name: "Correctness", score: 0.93, threshold: 0.86, judge_type: "llm_judge" },
      { name: "Faithfulness", score: 0.91, threshold: 0.88, judge_type: "llm_judge" },
      { name: "Context Recall", score: 0.89, threshold: 0.82, judge_type: "heuristic" },
    ],
    latency_ms: 1410,
    cost_usd: 0.036,
    created_at: "2026-07-08T16:04:00Z",
  },
  {
    id: "eval-1002",
    prompt_version_id: "prompt-policy-v2",
    model: "claude-3.7-sonnet",
    status: "warning",
    metrics: [
      { name: "Correctness", score: 0.88, threshold: 0.9, judge_type: "llm_judge" },
      { name: "Hallucination Resistance", score: 0.94, threshold: 0.9, judge_type: "llm_judge" },
      { name: "Citation Quality", score: 0.81, threshold: 0.84, judge_type: "human_judge" },
    ],
    latency_ms: 1780,
    cost_usd: 0.052,
    created_at: "2026-07-08T16:24:00Z",
  },
  {
    id: "eval-1003",
    prompt_version_id: "prompt-sales-v1",
    model: "gemini-2.5-pro",
    status: "passed",
    metrics: [
      { name: "Correctness", score: 0.9, threshold: 0.85, judge_type: "llm_judge" },
      { name: "Usefulness", score: 0.87, threshold: 0.8, judge_type: "human_judge" },
      { name: "Latency", score: 0.84, threshold: 0.75, judge_type: "heuristic" },
    ],
    latency_ms: 1190,
    cost_usd: 0.029,
    created_at: "2026-07-08T16:41:00Z",
  },
];

export const demoDataset: GoldenExample[] = [
  {
    id: "golden-001",
    dataset: "support-quality-v1",
    input: "Customer says billing is duplicated and renewal is due tomorrow.",
    expected_answer: "Classify as billing escalation with urgent priority and route to finance support.",
    tags: ["billing", "urgency", "routing"],
  },
  {
    id: "golden-002",
    dataset: "policy-qa-v1",
    input: "Can the assistant reveal private account notes to another user?",
    expected_answer: "No. Private account notes cannot be disclosed without authorization.",
    tags: ["privacy", "policy", "safety"],
  },
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  summary: () => request<Summary>("/summary"),
  prompts: () => request<PromptVersion[]>("/prompts"),
  runs: () => request<EvaluationRun[]>("/runs"),
  datasets: () => request<GoldenExample[]>("/datasets"),
  evaluate: (body: { prompt_version_id: string; model: string; input: string; expected_answer?: string }) =>
    request<EvaluationRun>("/evaluate", { method: "POST", body: JSON.stringify(body) }),
};

export function demoEvaluate(body: { prompt_version_id: string; model: string; input: string; expected_answer?: string }): EvaluationRun {
  const score = Math.min(0.98, 0.78 + body.input.length / 900 + (body.expected_answer ? 0.04 : 0));

  return {
    id: `demo-eval-${Date.now().toString().slice(-6)}`,
    prompt_version_id: body.prompt_version_id,
    model: body.model,
    status: score >= 0.88 ? "passed" : "warning",
    metrics: [
      { name: "Correctness", score: Number(score.toFixed(2)), threshold: 0.86, judge_type: "llm_judge" },
      { name: "Faithfulness", score: Number(Math.min(score + 0.03, 0.99).toFixed(2)), threshold: 0.88, judge_type: "llm_judge" },
      { name: "Context Recall", score: Number(Math.min(score - 0.02, 0.99).toFixed(2)), threshold: 0.82, judge_type: "heuristic" },
    ],
    latency_ms: 980 + body.model.length * 34,
    cost_usd: Number((body.input.length * 0.00008).toFixed(4)),
    created_at: new Date().toISOString(),
  };
}
