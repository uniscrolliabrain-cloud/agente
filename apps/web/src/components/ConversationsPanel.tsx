import { Activity, Bot, Brain, Files, FolderKanban, LayoutDashboard, MessageSquare, Plus, Search, Settings, UserCog } from "lucide-react";
import type { Thread } from "../api/threads";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

export type AppView = "chat" | "tasks" | "documents" | "projects" | "control-center" | "memory" | "users";

interface Props {
  collapsed: boolean;
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  isAdmin: boolean;
  onNewChat: () => void;
  onOpenPalette: () => void;
  activeThreadId: string | null;
  threads: Thread[];
  onSelectThread: (id: string) => void;
  userName: string;
  userRole: string;
  onOpenProfile: () => void;
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
  onOpenPalette,
  activeThreadId,
  threads,
  onSelectThread,
  userName,
  userRole,
  onOpenProfile,
}: Props) {
  const item = (view: AppView, Icon: typeof MessageSquare, label: string) => (
    <button className={`nav-item ${activeView === view ? "active" : ""}`} onClick={() => onSelectView(view)}>
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  const groups = groupThreads(threads);
  const initials = userName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <WorkspaceSwitcher name="Mi empresa" subtitle="Agente IA Pro" />
      <div className="sidebar-top">
        <button className="new-chat-button" onClick={onNewChat}>
          <Plus size={16} />
          <span>Nuevo chat</span>
        </button>
        <button className="sidebar-search" onClick={onOpenPalette}>
          <Search size={15} />
          <span>Buscar</span>
        </button>
      </div>

      <nav className="sidebar-nav scroll">
        <div className="nav-section">
          <span className="nav-label">Workspace</span>
          {item("chat", MessageSquare, "Chat")}
          {item("tasks", LayoutDashboard, "Tareas")}
          {item("documents", Files, "Documentos")}
          {item("projects", FolderKanban, "Proyectos")}
          {item("control-center", Activity, "Centro de control")}
          {item("memory", Brain, "Lo que sabe de tu negocio")}
          {isAdmin && item("users", UserCog, "Equipo")}
          <button className="nav-item" disabled title="Proximamente">
            <Bot size={16} />
            <span>Agentes</span>
          </button>
        </div>

        {activeView === "chat" && (
          <div className="nav-section conversations-section">
            <div className="nav-section-header">
              <span className="nav-label">Conversaciones</span>
              <button className="mini-action" onClick={onNewChat} title="Nueva conversacion">
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
        <div className="user">
          <span className="user__avatar" aria-hidden="true">{initials || "?"}</span>
          <span className="user__text">
            <span className="user__name">{userName}</span>
            <span className="user__role">{userRole === "admin" ? "Admin" : "Usuario"}</span>
          </span>
          <button className="icon-btn" aria-label="Configuracion" onClick={onOpenProfile}>
            <Settings size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
