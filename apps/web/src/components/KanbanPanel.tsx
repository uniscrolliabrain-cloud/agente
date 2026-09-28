import { useState } from "react";
import { Brain, CheckCircle2, Circle, CircleAlert, Files, Play, X } from "lucide-react";
import type { AgentTask } from "../types/api";
import { formatBytes, relativeTime } from "../lib/format";
import { groupTasks, type TaskColumnType } from "../lib/taskColumns";
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

type TabId = "tasks" | "context" | "memory";

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
  const columns = groupTasks(tasks);

  const Column = ({ title, items, type, empty }: { title: string; items: AgentTask[]; type: TaskColumnType; empty: string }) => {
    const Icon = type === "todo" ? Circle : type === "running" ? Play : type === "action" ? CircleAlert : CheckCircle2;
    return (
      <section className={`task-column ${type}`}>
        <div className="task-column-header">
          <div className="task-column-title">
            <Icon size={14} />
            <span>{title}</span>
          </div>
          <span className="task-count">{items.length}</span>
        </div>
        {items.length === 0 ? (
          <div className="task-empty"><span>{empty}</span></div>
        ) : (
          <div className="task-list">
            {items.map((t) => (
              <TaskCard key={t.id} task={t} onOpen={() => onOpenTask(t)} onReview={() => onReviewTask(t)} />
            ))}
          </div>
        )}
      </section>
    );
  };

  const headerLabel = tab === "tasks" ? `${tasks.length} total` : tab === "context" ? `${files.length} archivos` : `${memories.length} memorias`;

  return (
    <aside className={`right-panel ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="right-panel-header">
        <div>
          <strong>{tab === "tasks" ? "Tareas" : tab === "context" ? "Contexto" : "Memoria"}</strong>
          <span>{headerLabel}</span>
        </div>
        <button className="ghost-icon-button mobile-close" onClick={onCloseMobile}>
          <X size={17} />
        </button>
      </div>

      <div className="right-panel-tabs">
        <button className={tab === "tasks" ? "active" : ""} onClick={() => setTab("tasks")}>Tareas</button>
        <button className={tab === "context" ? "active" : ""} onClick={() => setTab("context")}>Contexto</button>
        <button className={tab === "memory" ? "active" : ""} onClick={() => setTab("memory")}>Memoria</button>
      </div>

      <div className="right-panel-content">
        {tab === "tasks" &&
          columns.map((column) => (
            <Column
              key={column.type}
              title={column.title}
              items={column.tasks}
              type={column.type}
              empty="Sin tareas"
            />
          ))}

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
              <div className="task-empty"><span>Sin archivos todavía</span></div>
            ) : (
              <div className="task-list">
                {files.slice(0, 30).map((f) => (
                  <div key={f.id} className="context-item">
                    <div className="context-item-icon">📄</div>
                    <div className="context-item-body">
                      <div className="context-item-title" title={f.name}>{f.name}</div>
                      <div className="context-item-sub">
                        {formatBytes(f.size)}{f.size && f.createdAt ? " · " : ""}{relativeTime(f.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "memory" && (
          <section className="task-column">
            <div className="task-column-header">
              <div className="task-column-title">
                <Brain size={14} />
                <span>Memoria del agente</span>
              </div>
              <span className="task-count">{memories.length}</span>
            </div>
            {memories.length === 0 ? (
              <div className="task-empty"><span>El agente aún no recuerda nada</span></div>
            ) : (
              <div className="task-list">
                {memories.slice(0, 40).map((m) => (
                  <div key={m.id} className="memory-item">
                    <div className="memory-text">{m.text}</div>
                    {m.source && <div className="memory-source">{m.source} · {relativeTime(m.createdAt)}</div>}
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
