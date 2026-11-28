// En marcha y trabajo cerrado. Se mantienen las dos secciones de la vista
// original: las tarjetas de ejecución y la trazabilidad de lo terminado con su
// acción de "Ver prueba" solo cuando existe callback real.
import { ArrowUpRight, CheckCircle2, Clock, Play } from "lucide-react";
import type { CompanyTask } from "../../../api/company";
import { relativeTime } from "../../../lib/format";
import { humanKind } from "../../../components/command-center/labels";
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
    <section className="cce-legacy-section" aria-labelledby="cce-legacy-running-title">
      <SectionHeader
        id="cce-legacy-running-title"
        icon={<Play size={16} aria-hidden="true" />}
        title="En marcha ahora"
        sub={tasks.length === 0 ? "Sin trabajo en curso" : `${tasks.length} en ejecución`}
      />
      {tasks.length === 0 ? (
        <div className="cce-legacy-empty">
          <Clock size={16} aria-hidden="true" /> Ningún agente está ejecutando una tarea en este momento.
        </div>
      ) : (
        <div className="cce-legacy-grid">
          {tasks.map((task) => (
            <article key={task.id} className="cce-legacy-card">
              <div className="cce-legacy-card-top">
                <span className="cce-legacy-tag cce-legacy-tag--live">En curso</span>
                <span className="cce-legacy-row-meta">{relativeTime(task.updatedAt) || "sin fecha"}</span>
              </div>
              <h3>{task.title}</h3>
              <p className="cce-legacy-card-context">
                {humanKind(task.kind)} · {whoFor(task)}
              </p>
              {onOpenTask && (
                <div className="cce-legacy-card-actions">
                  <button type="button" className="cce-legacy-btn cce-legacy-btn--small" onClick={() => onOpenTask(task.id)}>
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
    <section className="cce-legacy-section" id="cce-legacy-timeline" aria-labelledby="cce-legacy-done-title">
      <SectionHeader
        id="cce-legacy-done-title"
        icon={<CheckCircle2 size={16} aria-hidden="true" />}
        title="Qué hizo tu OS agéntico"
        sub="Trazabilidad: quién hizo qué y con qué prueba"
      />
      {tasks.length === 0 ? (
        <div className="cce-legacy-empty">Todavía no hay trabajo cerrado que mostrar.</div>
      ) : (
        <ul className="cce-legacy-timeline">
          {tasks.map((task) => {
            const who = whoFor(task);
            return (
              <li key={task.id} className="cce-legacy-timeline-item">
                <span className={`cce-legacy-avatar ${task.assignedTo ? "cce-legacy-avatar--agent" : ""}`.trim()} aria-hidden="true">
                  {who.slice(0, 1).toUpperCase()}
                </span>
                <span className="cce-legacy-timeline-body">
                  <span className="cce-legacy-timeline-title">{task.title}</span>
                  <span className="cce-legacy-timeline-meta">
                    {who} · {humanKind(task.kind)} · {relativeTime(task.updatedAt) || "sin fecha"}
                  </span>
                </span>
                {onOpenTask && (
                  <button type="button" className="cce-legacy-btn cce-legacy-btn--small" onClick={() => onOpenTask(task.id)}>
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
