import { Bot, Brain, Files, LayoutDashboard, MessageSquare, Plus, Search, Settings, Sparkles, UserCog } from "lucide-react";

export type AppView = "chat" | "tasks" | "documents" | "memory" | "users";

interface Props {
  collapsed: boolean;
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  isAdmin: boolean;
  onNewChat: () => void;
  activeThreadId: string | null;
}

export default function ConversationsPanel({ collapsed, activeView, onSelectView, isAdmin, onNewChat, activeThreadId }: Props) {
  const items = activeThreadId ? [{ id: activeThreadId, title: "Conversación principal" }] : [];

  const item = (view: AppView, Icon: typeof MessageSquare, label: string) => (
    <button className={`nav-item ${activeView === view ? "active" : ""}`} onClick={() => onSelectView(view)}>
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

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
              <button className="mini-action" onClick={onNewChat} title="Nueva conversación (próximamente)">
                <Plus size={14} />
              </button>
            </div>
            <div className="conversation-list">
              {items.length === 0 ? (
                <div className="sidebar-empty">
                  <MessageSquare size={16} />
                  <span>Sin conversaciones</span>
                </div>
              ) : (
                items.map((c) => (
                  <button key={c.id} className="conversation-item active">
                    <MessageSquare size={15} />
                    <span>{c.title}</span>
                  </button>
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
