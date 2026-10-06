This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: apps/web/src/components/TaskDetailModal.tsx, apps/web/src/components/TaskTimeline.tsx, apps/web/src/components/TasksView.tsx, apps/web/src/types/api.ts
- Files matching these patterns are excluded: **/node_modules/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  web/
    src/
      components/
        TaskDetailModal.tsx
        TasksView.tsx
        TaskTimeline.tsx
      types/
        api.ts
```

# Files

## File: apps/web/src/components/TaskTimeline.tsx
```typescript
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
```

## File: apps/web/src/components/TaskDetailModal.tsx
```typescript
// C1_TASKDETAIL_V2 - usa TaskTimeline para el plan.
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { controlTask, getTaskDetail, answerTask } from "../api/tasks";
// WIRE_TASKDETAIL_TIMELINE_V1
import TaskTimeline from "./TaskTimeline";
import type { AgentTask, TaskDetail } from "../types/api";

interface Props {
  taskId: string;
  onClose: () => void;
  onChanged: () => void;
}

type Tab = "plan" | "events" | "artifacts";

export default function TaskDetailModal({ taskId, onClose, onChanged }: Props) {
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [tab, setTab] = useState<Tab>("plan");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setDetail(await getTaskDetail(taskId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando detalle");
      }
    })();
  }, [taskId]);

  const control = async (action: "pause" | "resume" | "cancel" | "retry") => {
    try {
      await controlTask(taskId, action);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en control");
    }
  };

  const submitAnswer = async () => {
    try {
      await answerTask(taskId, answer);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al responder");
    }
  };

  const task: AgentTask | null = detail?.task ?? null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{task?.title ?? "Cargando…"}</div>
            <div className="modal-sub">{task?.id.slice(0, 12)} · {task?.status}</div>
          </div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>

        <div className="tabs">
          <button className={tab === "plan" ? "active" : ""} onClick={() => setTab("plan")}>Plan</button>
          <button className={tab === "events" ? "active" : ""} onClick={() => setTab("events")}>Eventos</button>
          <button className={tab === "artifacts" ? "active" : ""} onClick={() => setTab("artifacts")}>Artifacts</button>
        </div>

        <div className="modal-body">
          {error && <div className="chat-error">{error}</div>}
          {!detail && !error && <div className="muted">Cargando…</div>}

          {detail && tab === "plan" && (
            <div className="plan-list">
              {/* WIRE_TASKDETAIL_TIMELINE_V1 */}
              <TaskTimeline plan={task!.plan} />
              <div className="control-row">
                <button className="ctrl-btn" onClick={() => control("pause")}>⏸ Pausar</button>
                <button className="ctrl-btn" onClick={() => control("resume")}>▶ Reanudar</button>
                <button className="ctrl-btn danger" onClick={() => control("cancel")}>✕ Cancelar</button>
                <button className="ctrl-btn" onClick={() => control("retry")}>↻ Reintentar</button>
              </div>
              {task!.status === "waiting_input" && (
                <div className="answer-box">
                  <label>Respuesta</label>
                  <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={3} />
                  <button className="primary-btn" style={{ marginTop: 8 }} onClick={submitAnswer}>
                    Enviar respuesta
                  </button>
                </div>
              )}
            </div>
          )}

          {detail && tab === "events" && (
            <div className="plan-list">
              {detail.events.map((ev) => (
                <div key={ev.id} className="plan-item">
                  <span className="plan-num" style={{ fontSize: 8 }}>{new Date(ev.date).toLocaleTimeString().slice(0, 5)}</span>
                  <span><b>{ev.title}</b>{ev.detail ? ` — ${ev.detail}` : ""}</span>
                </div>
              ))}
              {detail.events.length === 0 && <div className="muted">Sin eventos</div>}
            </div>
          )}

          {detail && tab === "artifacts" && (
            <div className="plan-list">
              {detail.artifacts.map((a) => (
                <div key={a.id} className="plan-item">
                  <span className="plan-num" style={{ fontSize: 10 }}>📄</span>
                  <span>{a.title}</span>
                  <span className="plan-check">{a.kind}</span>
                </div>
              ))}
              {detail.artifacts.length === 0 && <div className="muted">Sin artifacts</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ESCALATE_UI_REVERTED
```

## File: apps/web/src/types/api.ts
```typescript
export type TaskStatus =
  | "queued"
  | "running"
  | "waiting_approval"
  | "waiting_input"
  | "scheduled"
  | "paused"
  | "succeeded"
  | "failed"
  | "cancelled";

export type TaskKind = "agent" | "document" | "monitor" | "finance" | "plan" | "sop";

export interface TaskStep {
  id: string;
  title: string;
  status: "pending" | "running" | "succeeded" | "failed" | "waiting";
  detail?: string;
  // FIX_02_TASKSTEP_DURATION_V1
  durationMs?: number;
}

export interface Evidence {
  id: string;
  kind: "mail" | "file" | "web" | "user";
  title: string;
  excerpt: string;
  url?: string;
}

export interface AgentTask {
  id: string;
  title: string;
  prompt: string;
  kind: TaskKind;
  status: TaskStatus;
  goalId?: string;
  /** Id del rol de agente al que se asigno la tarea (AgentRole.id). */
  assignedTo?: string;
  plan: TaskStep[];
  evidence: Evidence[];
  input: Record<string, unknown>;
  state: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  nextRunAt?: string;
  leaseId?: string | null;
  leaseUntil?: string | null;
  attempts: number;
  actionId?: string | null;
  result?: string;
  error?: string | null;
  question?: string;
  artifactIds: string[];
}

export interface RunEvent {
  id: string;
  taskId: string;
  date: string;
  kind: "plan" | "step" | "observation" | "approval" | "result" | "error" | "status";
  title: string;
  detail: string;
}

export interface AgentArtifact {
  id: string;
  taskId: string;
  kind: "plan" | "comparison" | "finance" | "report";
  title: string;
  summary: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface AgentWorkspace {
  tasks: AgentTask[];
  goals: unknown[];
  monitors: unknown[];
  ideas: unknown[];
  memories: unknown[];
  artifacts: AgentArtifact[];
  notifications: unknown[];
  identity: { name: string; tone: string; avatar?: string };
  worker: { running: boolean; lastTickAt?: string };
}

export interface ActionProposal {
  id: string;
  taskId?: string;
  title: string;
  kind: string;
  data: Record<string, unknown>;
  account?: string;
  connectionId?: string;
  status:
    | "awaiting_review"
    | "scheduled"
    | "executing"
    | "succeeded"
    | "failed"
    | "outcome_unknown"
    | "denied"
    | "cancelled"
    | "expired";
  // DUAL_SIGN_UI_V1 — doble firma y ventana de undo (espejo de ActionProposal
  // en packages/domain/src/index.ts). Mantener sincronizado con ese contrato.
  signers?: string[];
  needed?: number;
  executeAt?: string | null;
  hash: string;
  createdAt: string;
  expiresAt: string;
  result?: string;
  error?: string;
}

export interface TaskDetail {
  task: AgentTask;
  files: unknown[];
  browsers: unknown[];
  events: RunEvent[];
  artifacts: AgentArtifact[];
}

export interface WorkspaceSnapshot {
  mode: "sample" | "live";
  profile: { name: string; email: string };
  mail: unknown[];
  events: unknown[];
  files: unknown[];
  browsers: unknown[];
  actions: ActionProposal[];
  activity: unknown[];
  connections: unknown[];
  runtime: {
    provider: "sample" | "model" | "openbot";
    configured: boolean;
    openbotConfigured: boolean;
    richThreads?: boolean;
  };
}

export type MessageRole = "user" | "assistant" | "system";

export interface ChatAttachment {
  id: string;
  name: string;
  size?: number;
}

// B2_TOOLS_V1 - toolCall singular -> tools[].
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: string;
  tools?: { id: string; name: string; status: "running" | "done" | "error"; startedAt: number; endedAt?: number; args?: unknown }[];
  taskIdRef?: string;
  attachment?: ChatAttachment;
}
```

## File: apps/web/src/components/TasksView.tsx
```typescript
// FIX_02_TASKSVIEW_CLEAN_V1 - import TaskTimeline pendiente de wire.
// C3_TASKSVIEW_APPROVALS_V1 - usar ApprovalInbox en la seccion 'Necesita tu OK'.
// C1_TASKSVIEW_V2 - usa TaskTimeline en el detalle y filtro por rol.
// TASKS_ROLE_FILTER_V1 - filtro por rol del empleado digital.
// UI_PANEL_SLIDE_V1_USE
import { useMemo, useState } from "react";
import type { AgentTask } from "../types/api";
// WIRE_TASKTIMELINE_V1

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
```
