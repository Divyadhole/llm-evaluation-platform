import type { Metric } from "../lib/api";

type MetricBarProps = {
  metric: Metric;
};

export function MetricBar({ metric }: MetricBarProps) {
  const pass = metric.score >= metric.threshold;

  return (
    <div className="metric-bar">
      <div className="metric-label">
        <span>{metric.name}</span>
        <strong className={pass ? "pass" : "risk"}>{Math.round(metric.score * 100)}%</strong>
      </div>
      <div className="bar-track" aria-label={`${metric.name} score ${Math.round(metric.score * 100)} percent`}>
        <span style={{ width: `${metric.score * 100}%` }} />
      </div>
      <small>Threshold {Math.round(metric.threshold * 100)}% · {metric.judge_type.replace("_", " ")}</small>
    </div>
  );
}
