import { useState } from "react";
import { Brain, CheckCircle2, Circle, CircleAlert, Files, Inbox, Play, X } from "lucide-react";
import type { AgentTask } from "../types/api";
import type { FileEntry, MemoryEntry } from "../hooks/useWorkspaceData";
import TaskCard from "./TaskCard";

interface Props {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  tasks: AgentTask[];
  memories: MemoryEntry[];
  files: FileEntry[];
  onOpenTask: (task: AgentTask) => void;
  onReviewTask: (task: AgentTask) => void;
}

type TabId = "tasks" | "context" | "business";

function formatBytes(bytes?: number): string {
  if (bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function relativeTime(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`;
  return `${Math.floor(ms / 86400000)}d`;
}

export default function KanbanPanel({
  collapsed,
  mobileOpen,
  onCloseMobile,
  tasks,
  memories,
  files,
  onOpenTask,
  onReviewTask,
}: Props) {
  const [tab, setTab] = useState<TabId>("tasks");

  const todo = tasks.filter((t) => ["queued", "scheduled", "paused"].includes(t.status));
  const running = tasks.filter((t) => t.status === "running");
  const action = tasks.filter((t) => t.status === "waiting_approval" || t.status === "waiting_input");
  const done = tasks.filter((t) => ["succeeded", "failed", "cancelled"].includes(t.status));
  const tasksEmpty = tasks.length === 0;

  const headerLabel = tab === "tasks"
    ? `${tasks.length} total`
    : tab === "context"
      ? `${files.length} archivos`
      : `${memories.length} memorias`;

  const Section = ({
    title,
    items,
    type,
    icon,
  }: {
    title: string;
    items: AgentTask[];
    type: "todo" | "running" | "action" | "done";
    icon: React.ReactNode;
  }) => {
    if (items.length === 0) return null;
    return (
      <section className={`task-column ${type}`}>
        <div className="task-column-header">
          <div className="task-column-title">
            {icon}
            <span>{title}</span>
          </div>
          <span className="task-count">{items.length}</span>
        </div>
        <div className="task-list">
          {items.map((t) => (
            <TaskCard key={t.id} task={t} onOpen={() => onOpenTask(t)} onReview={() => onReviewTask(t)} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <aside className={`right-panel ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="right-panel-header">
        <div>
          <strong>{tab === "tasks" ? "Tareas" : tab === "context" ? "Contexto" : "Negocio"}</strong>
          <span>{headerLabel}</span>
        </div>
        <button className="ghost-icon-button mobile-close" onClick={onCloseMobile}>
          <X size={17} />
        </button>
      </div>

      <div className="right-panel-tabs" role="tablist">
        <button className={tab === "tasks" ? "active" : ""} role="tab" aria-selected={tab === "tasks"} onClick={() => setTab("tasks")}>Tareas</button>
        <button className={tab === "context" ? "active" : ""} role="tab" aria-selected={tab === "context"} onClick={() => setTab("context")}>Contexto</button>
        <button className={tab === "business" ? "active" : ""} role="tab" aria-selected={tab === "business"} onClick={() => setTab("business")}>Negocio</button>
      </div>

      <div className="right-panel-content">
        {tab === "tasks" && (
          tasksEmpty ? (
            <div className="pane-empty">
              <Inbox size={22} />
              <p className="pane-empty__title">Aun no hay tareas</p>
              <p className="pane-empty__sub">Cuando el agente prepare algo o necesite tu aprobacion, aparecera aqui.</p>
            </div>
          ) : (
            <>
              <Section title="En curso" items={running} type="running" icon={<Play size={14} />} />
              <Section title="Necesita tu accion" items={action} type="action" icon={<CircleAlert size={14} />} />
              <Section title="Por hacer" items={todo} type="todo" icon={<Circle size={14} />} />
              <Section title="Completado" items={done} type="done" icon={<CheckCircle2 size={14} />} />
            </>
          )
        )}

        {tab === "context" && (
          <section className="task-column">
            <div className="task-column-header">
              <div className="task-column-title">
                <Files size={14} />
                <span>Archivos recientes</span>
              </div>
              <span className="task-count">{files.length}</span>
            </div>
            {files.length === 0 ? (
              <div className="task-empty"><span>Sin archivos todavia</span></div>
            ) : (
              <div className="task-list">
                {files.slice(0, 30).map((f) => (
                  <div key={f.id} className="context-item">
                    <div className="context-item-icon">F</div>
                    <div className="context-item-body">
                      <div className="context-item-title" title={f.name}>{f.name}</div>
                      <div className="context-item-sub">
                        {formatBytes(f.size)}{f.size && f.createdAt ? " - " : ""}{relativeTime(f.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "business" && (
          <section className="task-column">
            <div className="task-column-header">
              <div className="task-column-title">
                <Brain size={14} />
                <span>Lo que sabe de tu negocio</span>
              </div>
              <span className="task-count">{memories.length}</span>
            </div>
            {memories.length === 0 ? (
              <div className="task-empty"><span>El agente aun no recuerda nada</span></div>
            ) : (
              <div className="task-list">
                {memories.slice(0, 40).map((m) => (
                  <div key={m.id} className="memory-item">
                    <div className="memory-text">{m.text}</div>
                    {m.source && <div className="memory-source">{m.source} - {relativeTime(m.createdAt)}</div>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </aside>
  );
}
