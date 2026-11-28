// En marcha y trabajo cerrado. Se mantienen las dos secciones de la vista
// original: las tarjetas de ejecución y la trazabilidad de lo terminado con su
// acción de "Ver prueba" solo cuando existe callback real.
import { ChangeMark } from "../PresentationChanges";
import { ArrowUpRight, CheckCircle2, Clock, Play } from "lucide-react";
import type { CompanyTask } from "../../../../web/src/api/company";
import { relativeTime } from "../../../../web/src/lib/format";
import { humanKind } from "../../../../web/src/components/command-center/labels";
import { SectionHeader } from "./EditorialStates";

export function EditorialRunning({
  tasks,
  whoFor,
  onOpenTask,
}: {
  tasks: CompanyTask[];
  whoFor: (task: CompanyTask) => string;
  onOpenTask?: ((taskId: string) => void) | undefined;
}) {
  return (
    <section className="cce-section" aria-labelledby="cce-running-title">
      <SectionHeader
        id="cce-running-title"
        icon={<Play size={16} aria-hidden="true" />}
        title="En marcha ahora"
        sub={tasks.length === 0 ? "Sin trabajo en curso" : `${tasks.length} en ejecución`}
      />
      {tasks.length === 0 ? (
        <div className="cce-empty">
          <Clock size={16} aria-hidden="true" /> Ningún agente está ejecutando una tarea en este momento.
        </div>
      ) : (
        <div className="cce-grid">
          {tasks.map((task) => (
            <article key={task.id} className="cce-card">
              <div className="cce-card-top">
                <span className="cce-tag cce-tag--live">En curso</span>
                <span className="cce-row-meta">{relativeTime(task.updatedAt) || "sin fecha"}</span>
              </div>
              <h3>{task.title}<ChangeMark observation={`task:${task.id}`} /></h3>
              <p className="cce-card-context">
                {humanKind(task.kind)} · {whoFor(task)}
              </p>
              {onOpenTask && (
                <div className="cce-card-actions">
                  <button type="button" className="cce-btn cce-btn--small" onClick={() => onOpenTask(task.id)}>
                    Ver tarea
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function EditorialDone({
  tasks,
  whoFor,
  onOpenTask,
}: {
  tasks: CompanyTask[];
  whoFor: (task: CompanyTask) => string;
  onOpenTask?: ((taskId: string) => void) | undefined;
}) {
  return (
    <section className="cce-section" id="cce-timeline" data-cce-work-target tabIndex={-1} aria-labelledby="cce-done-title">
      <SectionHeader
        id="cce-done-title"
        icon={<CheckCircle2 size={16} aria-hidden="true" />}
        title="Qué hizo tu OS agéntico"
        sub="Trazabilidad: quién hizo qué y con qué prueba"
      />
      {tasks.length === 0 ? (
        <div className="cce-empty">Todavía no hay trabajo cerrado que mostrar.</div>
      ) : (
        <ul className="cce-timeline">
          {tasks.map((task) => {
            const who = whoFor(task);
            return (
              <li key={task.id} className="cce-timeline-item">
                <span className={`cce-avatar ${task.assignedTo ? "cce-avatar--agent" : ""}`.trim()} aria-hidden="true">
                  {who.slice(0, 1).toUpperCase()}
                </span>
                <span className="cce-timeline-body">
                  <span className="cce-timeline-title">{task.title}<ChangeMark observation={`task:${task.id}`} /></span>
                  <span className="cce-timeline-meta">
                    {who} · {humanKind(task.kind)} · {relativeTime(task.updatedAt) || "sin fecha"}
                  </span>
                </span>
                {onOpenTask && (
                  <button type="button" className="cce-btn cce-btn--small" onClick={() => onOpenTask(task.id)}>
                    Ver prueba <ArrowUpRight size={13} aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
