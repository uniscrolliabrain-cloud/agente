// "Lo que te has perdido": feed cronológico construido con las tareas recientes
// del tenant, ordenadas por `updatedAt` verificable. No hay texto inventado: si
// no hay registros, la sección no se pinta.
import { Clock } from "lucide-react";
import type { CompanyTask } from "../../../api/company";
import { relativeTime } from "../../../lib/format";
import { humanKind, statusLabel, statusTone } from "../../../components/command-center/labels";
import { SectionHeader } from "./EditorialStates";

function feedTime(iso: string): string {
  const value = relativeTime(iso);
  if (!value) return "sin fecha";
  return value === "ahora" ? "ahora" : `hace ${value}`;
}

const TONE_CLASS: Record<string, string> = {
  live: "cce-legacy-tag--live",
  waiting: "cce-legacy-tag--warn",
  failed: "cce-legacy-tag--danger",
  done: "cce-legacy-tag--ok",
  idle: "",
};

export function EditorialFeed({
  tasks,
  whoFor,
  onOpenTask,
}: {
  tasks: CompanyTask[];
  whoFor: (task: CompanyTask) => string;
  onOpenTask?: ((taskId: string) => void) | undefined;
}) {
  if (tasks.length === 0) return null;

  return (
    <section className="cce-legacy-section" aria-labelledby="cce-legacy-feed-title">
      <SectionHeader
        id="cce-legacy-feed-title"
        icon={<Clock size={17} aria-hidden="true" />}
        title="Lo que te has perdido"
        sub={`${tasks.length} ${tasks.length === 1 ? "registro" : "registros"} · orden por última actualización`}
      />
      <ul className="cce-legacy-list">
        {tasks.map((task) => {
          const content = (
            <>
              <span className="cce-legacy-row-time">{feedTime(task.updatedAt)}</span>
              <span className="cce-legacy-row-body">
                <span className="cce-legacy-row-title">{task.title}</span>
                <span className="cce-legacy-row-meta">
                  {humanKind(task.kind)} · {whoFor(task)}
                </span>
              </span>
              <span className="cce-legacy-row-side">
                <span className={`cce-legacy-tag ${TONE_CLASS[statusTone(task.status)] ?? ""}`.trim()}>
                  {statusLabel(task.status)}
                </span>
              </span>
            </>
          );

          return (
            <li key={task.id}>
              {onOpenTask ? (
                <button type="button" className="cce-legacy-row" onClick={() => onOpenTask(task.id)}>
                  {content}
                </button>
              ) : (
                <div className="cce-legacy-row">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
