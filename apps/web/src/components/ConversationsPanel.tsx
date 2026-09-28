import { Bot, Brain, Files, FolderKanban, LayoutDashboard, MessageSquare, Plus, Search, Settings, Sparkles, UserCog } from "lucide-react";
import type { Thread } from "../api/threads";

export type AppView = "chat" | "tasks" | "documents" | "memory" | "projects" | "users";

interface Props {
  collapsed: boolean;
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  isAdmin: boolean;
  onNewChat: () => void;
  activeThreadId: string | null;
  threads: Thread[];
  onSelectThread: (id: string) => void;
}

function groupThreads(threads: Thread[]): Array<{ label: string; items: Thread[] }> {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const today: Thread[] = [];
  const yesterday: Thread[] = [];
  const older: Thread[] = [];
  for (const t of threads) {
    const t0 = Date.parse(t.updatedAt);
    if (!Number.isFinite(t0)) { older.push(t); continue; }
    const age = now - t0;
    if (age < oneDay) today.push(t);
    else if (age < 2 * oneDay) yesterday.push(t);
    else older.push(t);
  }
  const groups: Array<{ label: string; items: Thread[] }> = [];
  if (today.length) groups.push({ label: "Hoy", items: today });
  if (yesterday.length) groups.push({ label: "Ayer", items: yesterday });
  if (older.length) groups.push({ label: "Anteriores", items: older });
  return groups;
}

export default function ConversationsPanel({
  collapsed,
  activeView,
  onSelectView,
  isAdmin,
  onNewChat,
  activeThreadId,
  threads,
  onSelectThread,
}: Props) {
  const item = (view: AppView, Icon: typeof MessageSquare, label: string) => (
    <button className={`nav-item ${activeView === view ? "active" : ""}`} onClick={() => onSelectView(view)}>
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  const groups = groupThreads(threads);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <button className="new-chat-button" onClick={onNewChat}>
          <Plus size={16} />
          <span>Nuevo chat</span>
        </button>
        <button className="sidebar-search" disabled>
          <Search size={15} />
          <span>Buscar</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-label">Workspace</span>
          {item("chat", MessageSquare, "Chat")}
          {item("tasks", LayoutDashboard, "Tareas")}
          {item("documents", Files, "Documentos")}
          {item("projects", FolderKanban, "Proyectos")}
          {item("memory", Brain, "Memoria")}
          {isAdmin && item("users", UserCog, "Usuarios")}
          <button className="nav-item" disabled title="Próximamente">
            <Bot size={16} />
            <span>Agentes</span>
          </button>
        </div>

        {activeView === "chat" && (
          <div className="nav-section conversations-section">
            <div className="nav-section-header">
              <span className="nav-label">Conversaciones</span>
              <button className="mini-action" onClick={onNewChat} title="Nueva conversación">
                <Plus size={14} />
              </button>
            </div>
            <div className="conversation-list">
              {groups.length === 0 ? (
                <div className="sidebar-empty">
                  <MessageSquare size={16} />
                  <span>Sin conversaciones</span>
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.label}>
                    <div className="nav-label" style={{ padding: "6px 9px 4px" }}>{group.label}</div>
                    {group.items.map((t) => (
                      <button
                        key={t.id}
                        className={`conversation-item ${t.id === activeThreadId ? "active" : ""}`}
                        onClick={() => onSelectThread(t.id)}
                        title={t.title}
                      >
                        <MessageSquare size={15} />
                        <span>{t.title}</span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-upgrade">
          <div className="upgrade-icon">
            <Sparkles size={15} />
          </div>
          <div>
            <strong>Agente IA Pro</strong>
            <span>Workspace activo</span>
          </div>
        </div>
        <button className="nav-item" disabled title="Próximamente">
          <Settings size={16} />
          <span>Configuración</span>
        </button>
      </div>
    </aside>
  );
}