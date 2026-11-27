// "Lo que te has perdido": feed cronológico construido con las tareas recientes
// del tenant, ordenadas por `updatedAt` verificable. No hay texto inventado: si
// no hay registros, la sección no se pinta.
import { ChangeMark } from "../PresentationChanges";
import { Clock } from "lucide-react";
import type { CompanyTask } from "../../../../web/src/api/company";
import { relativeTime } from "../../../../web/src/lib/format";
import { humanKind, statusLabel } from "../../../../web/src/components/command-center/labels";
import { SectionHeader } from "./EditorialStates";
import { taskToneClass } from "./task-presentation";

function feedTime(iso: string): string {
  const value = relativeTime(iso);
  if (!value) return "sin fecha";
  return value === "ahora" ? "ahora" : `hace ${value}`;
}


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
    <section className="cce-section" aria-labelledby="cce-feed-title">
      <SectionHeader
        id="cce-feed-title"
        icon={<Clock size={17} aria-hidden="true" />}
        title="Lo que te has perdido"
        sub={`${tasks.length} ${tasks.length === 1 ? "registro" : "registros"} · orden por última actualización`}
      />
      <ul className="cce-list">
        {tasks.map((task) => {
          const content = (
            <>
              <span className="cce-row-time">{feedTime(task.updatedAt)}</span>
              <span className="cce-row-body">
                <span className="cce-row-title">{task.title}<ChangeMark observation={`task:${task.id}`} /></span>
                <span className="cce-row-meta">
                  {humanKind(task.kind)} · {whoFor(task)}
                </span>
              </span>
              <span className="cce-row-side">
                <span className={`cce-tag ${taskToneClass(task.status)}`.trim()}>
                  {statusLabel(task.status)}
                </span>
              </span>
            </>
          );

          return (
            <li key={task.id}>
              {onOpenTask ? (
                <button type="button" className="cce-row" onClick={() => onOpenTask(task.id)}>
                  {content}
                </button>
              ) : (
                <div className="cce-row">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
