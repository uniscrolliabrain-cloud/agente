// UI_ANIMATED_NUMBER_V1
import { useEffect, useState } from "react";
// UI_CC_CLEANUP_V1 - quitados Activity, AlertCircle, Briefcase sin usar.
import { CheckCircle2, ChevronRight, Clock, Zap } from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import { AnimatedNumber } from "./AnimatedNumber";
import { useNotifications } from "../hooks/useNotifications";
import type { AgentTask } from "../types/api";
import { relativeTime } from "../lib/format";

interface Props {
  enabled: boolean;
  onOpenTask?: (taskId: string) => void;
}

function statusLabel(task: AgentTask): string {
  if (task.status === "running") {
    const running = task.plan.find((s) => s.status === "running");
    if (running) return running.title;
    return "Trabajando en ello";
  }
  if (task.status === "waiting_approval") return "Esperando tu aprobación";
  if (task.status === "waiting_input") return "Necesita datos tuyos";
  if (task.status === "queued") return "En cola";
  if (task.status === "scheduled") return "Programada";
  if (task.status === "paused") return "En pausa";
  if (task.status === "succeeded") return "Completada";
  if (task.status === "failed") return "Con error";
  return "Cancelada";
}

function humanKind(kind: string): string {
  if (kind === "sop") return "Proceso";
  if (kind === "document") return "Documento";
  if (kind === "monitor") return "Vigilancia";
  if (kind === "finance") return "Finanzas";
  if (kind === "plan") return "Plan";
  return "Tarea";
}

function initialOf(assignedTo?: string): string {
  if (!assignedTo) return "IA";
  return assignedTo.slice(0, 1).toUpperCase();
}

export default function ControlCenterView({ enabled, onOpenTask }: Props) {
  const tasks = useTasks(3000, enabled);
  const notifications = useNotifications(enabled);
  const [, setTick] = useState(0);

  // Re-render cada 5 s para que "hace X min" y los contadores en vivo se refresquen.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const all = tasks.tasks;
  const running = all.filter((t) => t.status === "running");
  const queued = all.filter((t) => t.status === "queued" || t.status === "scheduled");
  const paused = all.filter((t) => t.status === "paused");
  const needsAction = all.filter(
    (t) => t.status === "waiting_approval" || t.status === "waiting_input",
  );
  const completed = all.filter((t) => t.status === "succeeded");
  const failed = all.filter((t) => t.status === "failed");
  const idle = queued.length + paused.length;

  const banner = needsAction[0];

  const workerBusy = running.length;
  const workerIdle = idle;
  const workerPaused = paused.length;
  const workerTotal = workerBusy + workerIdle + workerPaused;

  const lastError = failed[0];

  return (
    <div className="v3-cc-main">
      <div className="v3-cc-header">
        <h1 className="v3-cc-title">Centro de control</h1>
        <div className="v3-cc-sub">
          {workerTotal > 0
            ? `${workerBusy} agente${workerBusy === 1 ? "" : "s"} trabajando ahora mismo`
            : "Todo en calma"}
          {" · "}
          {needsAction.length > 0
            ? `${needsAction.length} cosa${needsAction.length === 1 ? "" : "s"} esperando tu OK`
            : "nada esperando tu OK"}
        </div>
      </div>

      {/* KPIs */}
      <div className="v3-cc-kpis">
        <div className="v3-kpi">
          <div className="v3-kpi-head">
            <div className="v3-kpi-icon green">
              <Zap size={13} />
            </div>
            <span className="v3-kpi-label">Agentes trabajando</span>
          </div>
          <div className="v3-kpi-value"><AnimatedNumber value={workerBusy} /></div>
          <div className="v3-kpi-meta">
            <b>{workerIdle}</b> esperando · <b>{workerPaused}</b> en pausa
          </div>
        </div>

        <div className="v3-kpi">
          <div className="v3-kpi-head">
            <div className="v3-kpi-icon">
              <CheckCircle2 size={13} />
            </div>
            <span className="v3-kpi-label">Tareas completadas</span>
          </div>
          <div className="v3-kpi-value"><AnimatedNumber value={completed.length} /></div>
          <div className="v3-kpi-meta">
            <b>{failed.length}</b> con error · <b>{all.length}</b> en total
          </div>
        </div>

        <div className="v3-kpi">
          <div className="v3-kpi-head">
            <div className="v3-kpi-icon orange">
              <Clock size={13} />
            </div>
            <span className="v3-kpi-label">Pendientes de tu OK</span>
          </div>
          <div className="v3-kpi-value"><AnimatedNumber value={needsAction.length} /></div>
          <div className="v3-kpi-meta">
            {notifications.unread > 0 ? (
              <>
                <b>{notifications.unread}</b> notificaciones sin leer
              </>
            ) : (
              "todo visto"
            )}
          </div>
        </div>
      </div>

      {/* Banner "necesita tu accion" */}
      {banner && (
        <div className="v2-need-action">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div className="v2-need-action-icon">⚠️</div>
            <div>
              <div className="v2-need-action-eyebrow">Necesita tu acción</div>
              <div className="v2-need-action-title">{banner.title}</div>
              <div className="v2-need-action-sub">
                {banner.status === "waiting_input"
                  ? "Necesita datos tuyos para continuar"
                  : "Esperando tu aprobación"}
              </div>
            </div>
          </div>
          <button
            className="v2-need-action-btn"
            onClick={() => onOpenTask?.(banner.id)}
          >
            Revisar
          </button>
        </div>
      )}

      {/* Procesos en curso */}
      <div className="v3-cc-section">
        <div className="v3-cc-section-head">
          <span className="v3-cc-section-title">Procesos en marcha</span>
          <span className="v3-cc-section-meta">
            {running.length} en curso
          </span>
        </div>
        {running.length === 0 ? (
          <div className="v3-cc-empty">
            {all.length === 0
              ? "Aún no hay procesos en marcha."
              : "Nada trabajando ahora mismo."}
          </div>
        ) : (
          running.slice(0, 6).map((t) => (
            <div
              key={t.id}
              className="v3-task-row"
              onClick={() => onOpenTask?.(t.id)}
            >
              <div className="v3-spinner" />
              <div className="v3-task-body">
                <div className="v3-task-title">{t.title}</div>
                <div className="v3-task-sub">
                  {humanKind(t.kind)} · {statusLabel(t)} · {relativeTime(t.updatedAt)}
                </div>
              </div>
              <div className="v3-task-tags">
                <span className="v2-tag agent">{humanKind(t.kind)}</span>
                <div className="v3-task-avatar">{initialOf(t.assignedTo)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pendientes */}
      {queued.length > 0 && (
        <div className="v3-cc-section">
          <div className="v3-cc-section-head">
            <span className="v3-cc-section-title">En cola</span>
            <span className="v3-cc-section-meta">{queued.length} esperando</span>
          </div>
          {queued.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="v3-task-row soft"
              onClick={() => onOpenTask?.(t.id)}
            >
              <span className="v2-task-status empty" />
              <div className="v3-task-body">
                <div className="v3-task-title">{t.title}</div>
                <div className="v3-task-sub">
                  {humanKind(t.kind)} · {statusLabel(t)}
                </div>
              </div>
              <div className="v3-task-tags">
                <ChevronRight size={14} style={{ color: "var(--v2-text-3)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado del equipo + Resumen */}
      <div className="v3-cc-bottom">
        <div className="v3-cc-panel">
          <div className="v3-cc-panel-title">Estado del equipo</div>
          <div className="v3-cc-stat">
            <span>Trabajando</span>
            <div className="v3-cc-bar green">
              <span style={{ width: `${workerTotal ? (workerBusy / workerTotal) * 100 : 0}%` }} />
            </div>
            <b>{workerBusy}</b>
          </div>
          <div className="v3-cc-stat">
            <span>Esperando</span>
            <div className="v3-cc-bar gray">
              <span style={{ width: `${workerTotal ? (workerIdle / workerTotal) * 100 : 0}%` }} />
            </div>
            <b>{workerIdle}</b>
          </div>
          <div className="v3-cc-stat">
            <span>En pausa</span>
            <div className="v3-cc-bar orange">
              <span style={{ width: `${workerTotal ? (workerPaused / workerTotal) * 100 : 0}%` }} />
            </div>
            <b>{workerPaused}</b>
          </div>
        </div>

        <div className="v3-cc-panel">
          <div className="v3-cc-panel-title">Resumen del sistema</div>
          <div className="v3-cc-stat">
            <span>Estado</span>
            <b style={{ color: tasks.workerRunning ? "var(--v2-green)" : "var(--v2-text-3)" }}>
              {tasks.workerRunning ? "Funcionando" : "Parado"}
            </b>
          </div>
          <div className="v3-cc-stat">
            <span>Última actividad</span>
            <b>
              {tasks.workerLastTickAt
                ? relativeTime(tasks.workerLastTickAt)
                : "—"}
            </b>
          </div>
          <div className="v3-cc-stat">
            <span>Último problema</span>
            <b style={{ color: lastError ? "var(--v2-warn-text)" : "inherit" }}>
              {lastError ? relativeTime(lastError.updatedAt) : "ninguno"}
            </b>
          </div>
          <div className="v3-cc-stat">
            <span>Notificaciones</span>
            <b>{notifications.unread} sin leer</b>
          </div>
        </div>
      </div>

      {tasks.error && (
        <div className="chat-error" style={{ marginTop: 16 }}>{tasks.error}</div>
      )}
    </div>
  );
}