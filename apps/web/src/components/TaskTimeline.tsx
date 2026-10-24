// C1_TASKTIMELINE_V1 - timeline vertical del plan de la tarea.
import type { TaskStep } from "../types/api";

interface Props {
  plan: TaskStep[];
}

const ICON: Record<TaskStep["status"], string> = {
  pending: "○",
  running: "◉",
  succeeded: "✓",
  failed: "×",
  waiting: "⏸",
};

const LABEL: Record<TaskStep["status"], string> = {
  pending: "pendiente",
  running: "en curso",
  succeeded: "hecho",
  failed: "error",
  waiting: "esperando",
};

export default function TaskTimeline({ plan }: Props) {
  if (plan.length === 0) return null;
  return (
    <ol className="tl" aria-label="Plan de la tarea">
      {plan.map((s) => (
        <li
          key={s.id}
          className="tl__step"
          data-status={s.status}
          aria-current={s.status === "running" ? "step" : undefined}
        >
          <span className="tl__dot" aria-hidden>
            {ICON[s.status]}
          </span>
          <div className="tl__body">
            <b className="tl__title">{s.title}</b>
            <small className="tl__meta">
              {LABEL[s.status]}
              {s.durationMs != null && ` · ${(s.durationMs / 1000).toFixed(1)}s`}
              {s.detail && ` · ${s.detail.slice(0, 80)}`}
            </small>
          </div>
        </li>
      ))}
    </ol>
  );
}