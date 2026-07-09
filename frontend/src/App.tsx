import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Brain, CircleDollarSign, Clock3, Play, ShieldAlert } from "lucide-react";
import { MetricBar } from "./components/MetricBar";
import { StatCard } from "./components/StatCard";
import {
  EvaluationRun,
  GoldenExample,
  PromptVersion,
  Summary,
  api,
  demoDataset,
  demoEvaluate,
  demoPrompts,
  demoRuns,
  demoSummary,
} from "./lib/api";

const defaultInput = "Customer says billing is duplicated, renewal is due tomorrow, and the account owner is unavailable.";
const models = ["gpt-4.1", "claude-3.7-sonnet", "gemini-2.5-pro", "llama-4-maverick"];

export function App() {
  const [summary, setSummary] = useState<Summary>(demoSummary);
  const [prompts, setPrompts] = useState<PromptVersion[]>(demoPrompts);
  const [runs, setRuns] = useState<EvaluationRun[]>(demoRuns);
  const [dataset, setDataset] = useState<GoldenExample[]>(demoDataset);
  const [selectedPromptId, setSelectedPromptId] = useState("prompt-support-v3");
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [input, setInput] = useState(defaultInput);
  const [expected, setExpected] = useState("Escalate as urgent billing risk and route to finance support.");
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.summary(), api.prompts(), api.runs(), api.datasets()])
      .then(([summaryData, promptData, runData, datasetData]) => {
        setSummary(summaryData);
        setPrompts(promptData);
        setRuns(runData);
        setDataset(datasetData);
      })
      .catch(() => setDemoMode(true));
  }, []);

  const selectedPrompt = useMemo(
    () => prompts.find((prompt) => prompt.id === selectedPromptId) ?? prompts[0],
    [prompts, selectedPromptId],
  );

  async function handleEvaluate() {
    setLoading(true);
    const body = {
      prompt_version_id: selectedPromptId,
      model: selectedModel,
      input,
      expected_answer: expected,
    };

    try {
      const run = demoMode ? demoEvaluate(body) : await api.evaluate(body);
      setRuns((current) => [run, ...current]);
    } catch {
      setDemoMode(true);
      setRuns((current) => [demoEvaluate(body), ...current]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <a className="skip-link" href="#evaluation-workbench">Skip to evaluation workbench</a>
      <header className="topbar">
        <div>
          <p>Portfolio project 2</p>
          <h1>LLM Evaluation Platform</h1>
          <p className="hero-copy">
            A quality control dashboard for prompt testing, golden datasets, model comparison,
            regression checks, LLM judges, human review, latency, and cost.
          </p>
        </div>
        <div className="topbar-actions">
          <span><Brain size={16} /> LLM judge</span>
          <span><ShieldAlert size={16} /> Regression gates</span>
        </div>
      </header>

      {demoMode && (
        <div className="notice" role="status">
          Portfolio demo mode is active. The dashboard remains interactive with sample evaluation data.
        </div>
      )}

      <section className="stats-grid">
        <StatCard icon={Activity} label="Runs" value={`${summary.total_runs}`} detail="tracked evaluations" />
        <StatCard icon={BarChart3} label="Pass Rate" value={`${Math.round(summary.pass_rate * 100)}%`} detail="quality gate pass" />
        <StatCard icon={Clock3} label="Latency" value={`${summary.avg_latency_ms} ms`} detail="average response time" />
        <StatCard icon={CircleDollarSign} label="Cost" value={`$${summary.cost_today_usd}`} detail="today's eval spend" />
      </section>

      <section className="workspace-grid" id="evaluation-workbench">
        <section className="panel">
          <div className="panel-heading">
            <h2>Prompt Registry</h2>
            <p>{selectedPrompt?.task}</p>
          </div>
          <div className="prompt-list" role="list">
            {prompts.map((prompt) => (
              <button
                key={prompt.id}
                className={`prompt-card ${prompt.id === selectedPromptId ? "selected" : ""}`}
                onClick={() => setSelectedPromptId(prompt.id)}
                aria-pressed={prompt.id === selectedPromptId}
                type="button"
              >
                <span>{prompt.name}</span>
                <strong>v{prompt.version}</strong>
                <small>{prompt.owner}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="panel evaluator-panel">
          <div className="panel-heading">
            <h2>Evaluation Workbench</h2>
            <p>Compare a prompt, model, input, and expected answer against quality metrics.</p>
          </div>
          <label htmlFor="model-select">Model</label>
          <select id="model-select" value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}>
            {models.map((model) => <option key={model}>{model}</option>)}
          </select>
          <label htmlFor="eval-input">Test input</label>
          <textarea id="eval-input" value={input} onChange={(event) => setInput(event.target.value)} />
          <label htmlFor="expected-answer">Expected answer</label>
          <textarea id="expected-answer" value={expected} onChange={(event) => setExpected(event.target.value)} />
          <button className="primary-action" onClick={handleEvaluate} disabled={loading || !input.trim()} type="button">
            <Play size={17} />
            {loading ? "Evaluating" : "Run Evaluation"}
          </button>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Latest Runs</h2>
            <p>Quality scores, gates, model choice, latency, and cost.</p>
          </div>
          <div className="run-list">
            {runs.slice(0, 4).map((run) => (
              <article className="run-card" key={run.id}>
                <div className="run-header">
                  <div>
                    <h3>{run.id}</h3>
                    <p>{run.model}</p>
                  </div>
                  <span className={`status ${run.status}`}>{run.status}</span>
                </div>
                {run.metrics.map((metric) => <MetricBar key={metric.name} metric={metric} />)}
                <dl>
                  <div><dt>Latency</dt><dd>{run.latency_ms} ms</dd></div>
                  <div><dt>Cost</dt><dd>${run.cost_usd.toFixed(4)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Golden Dataset</h2>
            <p>Regression examples used to catch quality drops before release.</p>
          </div>
          <div className="dataset-list">
            {dataset.map((item) => (
              <article key={item.id}>
                <span>{item.dataset}</span>
                <h3>{item.input}</h3>
                <p>{item.expected_answer}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
