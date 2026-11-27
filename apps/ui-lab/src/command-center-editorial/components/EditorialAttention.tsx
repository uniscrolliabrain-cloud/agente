// Requiere tu atención. Una decisión se revisa con el flujo existente
// (`onReviewTask`, ApprovalInbox): aquí no se aprueba nada directamente. Un
// fallo solo se abre; no se ofrece "reintentar" porque la vista original no lo
// tiene y no se inventan acciones de negocio.
import { ChangeMark } from "../PresentationChanges";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CompanyTask } from "../../../../web/src/api/company";
import { relativeTime } from "../../../../web/src/lib/format";
import { humanKind, isWaiting, statusLabel } from "../../../../web/src/components/command-center/labels";
import { SectionHeader } from "./EditorialStates";
import { taskToneClass } from "./task-presentation";


export function AttentionCard({
  task,
  who,
  onOpenTask,
  onReviewTask,
}: {
  task: CompanyTask;
  who: string;
  onOpenTask?: ((taskId: string) => void) | undefined;
  onReviewTask?: ((taskId: string) => void) | undefined;
}) {
  const failed = task.status === "failed";
  const canReview = task.status === "waiting_approval" && Boolean(onReviewTask);

  return (
    <article className={`cce-card ${failed ? "cce-card--alert" : ""}`}>
      <div className="cce-card-top">
        <span className={`cce-tag ${taskToneClass(task.status)}`.trim()}>
          {statusLabel(task.status)}
        </span>
        <span className="cce-row-meta">{relativeTime(task.updatedAt) || "sin fecha"}</span>
      </div>
      <h3>{task.title}<ChangeMark observation={`task:${task.id}`} /></h3>
      <p className="cce-card-context">
        {humanKind(task.kind)} · {who}
        {failed ? " · revisa el error antes de relanzar" : task.status === "waiting_approval" ? " · pendiente de autorización" : isWaiting(task.status) ? " · pendiente de información" : ""}
      </p>
      <div className="cce-card-actions">
        {canReview && (
          <button
            type="button"
            className="cce-btn cce-btn--primary cce-btn--small"
            onClick={() => onReviewTask?.(task.id)}
          >
            Revisar y aprobar
          </button>
        )}
        {onOpenTask && (
          <button
            type="button"
            className={`cce-btn cce-btn--small ${!canReview ? "cce-btn--primary" : ""}`}
            onClick={() => onOpenTask(task.id)}
          >
            {canReview ? "Abrir tarea" : "Ver contexto"}
          </button>
        )}
      </div>
    </article>
  );
}

export function EditorialAttention({
  tasks,
  totalAttention,
  whoFor,
  onOpenTask,
  onReviewTask,
}: {
  tasks: CompanyTask[];
  totalAttention: number;
  whoFor: (task: CompanyTask) => string;
  onOpenTask?: ((taskId: string) => void) | undefined;
  onReviewTask?: ((taskId: string) => void) | undefined;
}) {
  return (
    <section className="cce-section" aria-labelledby="cce-attention-title">
      <SectionHeader
        id="cce-attention-title"
        icon={<AlertTriangle size={17} aria-hidden="true" />}
        title="Requiere tu atención"
        sub={
          totalAttention > tasks.length
            ? `${tasks.length} de ${totalAttention} asuntos abiertos en el listado reciente`
            : tasks.length === 0
              ? "Nada pendiente"
              : `${tasks.length} ${tasks.length === 1 ? "asunto abierto" : "asuntos abiertos"}`
        }
      />
      {tasks.length === 0 ? (
        <div className="cce-empty">
          {totalAttention > 0 ? (
            <><AlertTriangle size={16} aria-hidden="true" /> Hay asuntos pendientes fuera del listado reciente.</>
          ) : (
            <><CheckCircle2 size={16} aria-hidden="true" /> Nada esperando tu decisión ahora mismo.</>
          )}
        </div>
      ) : (
        <div className="cce-grid">
          {tasks.map((task) => (
            <AttentionCard
              key={task.id}
              task={task}
              who={whoFor(task)}
              onOpenTask={onOpenTask}
              onReviewTask={onReviewTask}
            />
          ))}
        </div>
      )}
    </section>
  );
}
