import { useMemo, useState } from "react";
import type { AgentTask } from "../types/api";

interface Props {
  tasks: AgentTask[];
  currentUserId: string | null;
  onOpenTask: (task: AgentTask) => void;
  onReviewTask: (task: AgentTask) => void;
}

type Filter = "todas" | "mias" | "sin_asignar" | "escaladas";

const DEMO_BANNER = {
  title: "Aprobar factura · Consultoría Norte · 7.900 €",
  sub: "Vence mañana · supera el umbral del SOP · 5.000 € → 7.900 € (+58%)",
};

const DEMO_EN_CURSO = [
  { t: "Conciliar banco de septiembre", tag: "Agente", meta: "hace 4 min" },
  { t: "Enviar recordatorios de pago", tag: "Agente", meta: "hace 12 min" },
];
const DEMO_POR_HACER = [
  { t: "Revisar contrato de alquiler", tag: "Legal", meta: "Vie 3" },
  { t: "Actualizar SOP de altas de cliente", tag: "SOP", meta: "Lun 6" },
];
const DEMO_COMPLETADO = [{ t: "Resumen semanal enviado al equipo", meta: "Hoy" }];

export default function TasksView({ tasks, currentUserId, onOpenTask, onReviewTask }: Props) {
  const [filter, setFilter] = useState<Filter>("todas");

  const visible = useMemo(() => {
    if (filter === "mias")
      // TASKS_MIAS_V1 - incluye no asignadas.
      return tasks.filter((t) => t.assignedTo === currentUserId || !t.assignedTo);
    if (filter === "sin_asignar") return tasks.filter((t) => !t.assignedTo);
    if (filter === "escaladas")
      return tasks.filter((t) => Boolean((t.state as Record<string, unknown>)?.escalatedTo));
    return tasks;
  }, [tasks, filter, currentUserId]);

  const needsAction = visible.filter(
    (t) => t.status === "waiting_approval" || t.status === "waiting_input",
  );
  const enCurso = visible.filter((t) => t.status === "running");
  const porHacer = visible.filter(
    (t) => t.status === "queued" || t.status === "scheduled" || t.status === "paused",
  );
  const completado = visible.filter((t) => t.status === "succeeded");

  const banner = needsAction[0];
  const bannerTitle = banner ? banner.title : DEMO_BANNER.title;
  const bannerSub = banner
    ? banner.status === "waiting_input"
      ? "Necesita datos tuyos para continuar"
      : "Esperando tu aprobación"
    : DEMO_BANNER.sub;

  const filters: { id: Filter; label: string }[] = [
    { id: "todas", label: "Todas" },
    { id: "mias", label: "Mías" },
    { id: "sin_asignar", label: "Sin asignar" },
    { id: "escaladas", label: "Escaladas" },
  ];

  return (
    <div className="v2-tasks-view">
      <div className="v2-tasks-header">
        <h1 className="v2-tasks-title">Tareas</h1>
        <div className="v2-tasks-meta">
          {tasks.length} tareas · {needsAction.length} necesitan acción
        </div>
      </div>

      <div className="v2-pill-row" style={{ marginBottom: 20 }}>
        {filters.map((f) => (
          <button
            key={f.id}
            className={`v2-pill ${filter === f.id ? "active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {(needsAction.length > 0 || tasks.length === 0) && (
        <div className="v2-need-action">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div className="v2-need-action-icon">⚠️</div>
            <div>
              <div className="v2-need-action-eyebrow">Necesita tu acción</div>
              <div className="v2-need-action-title">{bannerTitle}</div>
              <div className="v2-need-action-sub">{bannerSub}</div>
            </div>
          </div>
          <button
            className="v2-need-action-btn"
            onClick={() => (banner ? onReviewTask(banner) : undefined)}
          >
            Revisar
          </button>
        </div>
      )}

      <div className="v2-tasks-section">
        <div className="v2-section-heading">● En curso</div>
        {enCurso.length === 0 && tasks.length > 0 ? (
          <div className="v2-tasks-empty">Sin tareas en curso</div>
        ) : enCurso.length === 0 ? (
          DEMO_EN_CURSO.map((row, i) => (
            <div key={i} className="v2-task-row">
              <span className="v2-task-status half" />
              <span className="v2-task-row-title">{row.t}</span>
              <div className="v2-task-row-meta">
                <span className="v2-tag agent">{row.tag}</span>
                <span className="v2-task-row-date">{row.meta}</span>
              </div>
            </div>
          ))
        ) : (
          enCurso.map((t) => (
            <div key={t.id} className="v2-task-row" onClick={() => onOpenTask(t)}>
              <span className="v2-task-status half" />
              <span className="v2-task-row-title">{t.title}</span>
              <div className="v2-task-row-meta">
                <span className="v2-tag agent">{t.kind}</span>
                <span className="v2-task-row-date">{t.updatedAt.slice(11, 16)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="v2-tasks-section">
        <div className="v2-section-heading">○ Por hacer</div>
        {porHacer.length === 0 && tasks.length > 0 ? (
          <div className="v2-tasks-empty">Sin tareas pendientes</div>
        ) : porHacer.length === 0 ? (
          DEMO_POR_HACER.map((row, i) => (
            <div key={i} className="v2-task-row soft">
              <span className="v2-task-status empty" />
              <span className="v2-task-row-title">{row.t}</span>
              <div className="v2-task-row-meta">
                <span className="v2-tag">{row.tag}</span>
                <span className="v2-task-row-date">{row.meta}</span>
              </div>
            </div>
          ))
        ) : (
          porHacer.map((t) => (
            <div key={t.id} className="v2-task-row soft" onClick={() => onOpenTask(t)}>
              <span className="v2-task-status empty" />
              <span className="v2-task-row-title">{t.title}</span>
              <div className="v2-task-row-meta">
                <span className="v2-tag">{t.kind}</span>
                <span className="v2-task-row-date">{t.updatedAt.slice(11, 16)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="v2-tasks-section">
        <div className="v2-section-heading">✓ Completado</div>
        {completado.length === 0 && tasks.length > 0 ? (
          <div className="v2-tasks-empty">Sin tareas completadas</div>
        ) : completado.length === 0 ? (
          DEMO_COMPLETADO.map((row, i) => (
            <div key={i} className="v2-task-row done">
              <span className="v2-task-status done">✓</span>
              <span className="v2-task-row-title done">{row.t}</span>
              <span className="v2-task-row-date">{row.meta}</span>
            </div>
          ))
        ) : (
          completado.map((t) => (
            <div key={t.id} className="v2-task-row done" onClick={() => onOpenTask(t)}>
              <span className="v2-task-status done">✓</span>
              <span className="v2-task-row-title done">{t.title}</span>
              <span className="v2-task-row-date">{t.updatedAt.slice(11, 16)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}