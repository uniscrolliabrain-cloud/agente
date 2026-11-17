// COMMAND_CENTER_TASKS_V1 - secciones de tareas del centro de mando.
//
// "Requiere tu atención" y "En marcha" salen de las tareas reales del tenant.
// Aprobar abre el flujo existente (ApprovalInbox); abrir lleva al detalle de la
// tarea. No hay acciones simuladas: si el backend no expone algo, no se pinta.
import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock, Play } from "lucide-react";
import type { CompanyTask } from "../../api/company";
import { relativeTime } from "../../lib/format";
import { humanKind, isWaiting, statusLabel } from "./labels";

interface CommonProps {
  whoFor: (task: CompanyTask) => string;
  onOpenTask?: (taskId: string) => void;
  onReviewTask?: (taskId: string) => void;
}

function TaskCard({
  task,
  who,
  onOpenTask,
  onReviewTask,
}: {
  task: CompanyTask;
  who: string;
  onOpenTask?: (taskId: string) => void;
  onReviewTask?: (taskId: string) => void;
}) {
  const waiting = isWaiting(task.status);
  const failed = task.status === "failed";

  return (
    <article className={`cc-card ${failed ? "alert" : ""}`}>
      <span className={`cc-tag ${failed ? "danger" : "warn"}`}>
        {failed ? "Error" : statusLabel(task.status)}
      </span>
      <h3>{task.title}</h3>
      <p>
        {humanKind(task.kind)} · {who} · {relativeTime(task.updatedAt) || "sin fecha"}
      </p>
      <div className="cc-card-actions">
        {task.status === "waiting_approval" && onReviewTask ? (
          <button type="button" className="cc-btn primary" onClick={() => onReviewTask(task.id)}>
            Revisar y aprobar
          </button>
        ) : null}
        {onOpenTask && (
          <button
            type="button"
            className={`cc-btn ${waiting && task.status !== "waiting_approval" ? "primary" : ""}`}
            onClick={() => onOpenTask(task.id)}
          >
            Abrir tarea
          </button>
        )}
      </div>
    </article>
  );
}

export function AttentionSection({
  tasks,
  whoFor,
  onOpenTask,
  onReviewTask,
}: CommonProps & { tasks: CompanyTask[] }) {
  return (
    <section className="cc-section">
      <div className="cc-section-head">
        <h2 className="cc-section-title">
          <AlertTriangle size={16} /> Requiere tu atención
        </h2>
        <span className="cc-section-sub">
          {tasks.length === 0
            ? "Nada pendiente"
            : `${tasks.length} ${tasks.length === 1 ? "asunto abierto" : "asuntos abiertos"}`}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="cc-empty">
          <CheckCircle2 size={16} /> Nada esperando tu decisión ahora mismo.
        </div>
      ) : (
        <div className="cc-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              who={whoFor(task)}
              {...(onOpenTask ? { onOpenTask } : {})}
              {...(onReviewTask ? { onReviewTask } : {})}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function RunningSection({
  tasks,
  whoFor,
  onOpenTask,
}: CommonProps & { tasks: CompanyTask[] }) {
  return (
    <section className="cc-section">
      <div className="cc-section-head">
        <h2 className="cc-section-title">
          <Play size={16} /> En marcha ahora
        </h2>
        <span className="cc-section-sub">
          {tasks.length === 0 ? "Sin trabajo en curso" : `${tasks.length} en ejecución`}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="cc-empty">
          <Clock size={16} /> Ningún agente está ejecutando una tarea en este momento.
        </div>
      ) : (
        <div className="cc-grid">
          {tasks.map((task) => (
            <article key={task.id} className="cc-card">
              <span className="cc-tag live">En curso</span>
              <h3>{task.title}</h3>
              <p>
                {humanKind(task.kind)} · {whoFor(task)} · {relativeTime(task.updatedAt) || "sin fecha"}
              </p>
              {onOpenTask && (
                <div className="cc-card-actions">
                  <button type="button" className="cc-btn" onClick={() => onOpenTask(task.id)}>
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

export function DoneSection({
  tasks,
  whoFor,
  onOpenTask,
}: CommonProps & { tasks: CompanyTask[] }) {
  return (
    <section className="cc-section" id="cc-timeline">
      <div className="cc-section-head">
        <h2 className="cc-section-title">
          <CheckCircle2 size={16} /> Qué hizo tu OS agéntico
        </h2>
        <span className="cc-section-sub">Trazabilidad: quién hizo qué y con qué prueba</span>
      </div>

      {tasks.length === 0 ? (
        <div className="cc-empty">Todavía no hay trabajo cerrado que mostrar.</div>
      ) : (
        <div className="cc-timeline">
          {tasks.map((task) => {
            const who = whoFor(task);
            return (
              <div key={task.id} className="cc-timeline-row">
                <span className="cc-timeline-avatar">{who.slice(0, 1).toUpperCase()}</span>
                <span className="cc-timeline-body">
                  <span className="cc-timeline-title">{task.title}</span>
                  <span className="cc-timeline-meta">
                    {who} · {humanKind(task.kind)} · {relativeTime(task.updatedAt) || "sin fecha"}
                  </span>
                </span>
                {onOpenTask && (
                  <button type="button" className="cc-btn" onClick={() => onOpenTask(task.id)}>
                    Ver prueba <ArrowUpRight size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
