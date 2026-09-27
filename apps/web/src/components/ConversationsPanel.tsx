import { Bot, Brain, Files, LayoutDashboard, MessageSquare, Plus, Search, Settings, Sparkles } from "lucide-react";

interface Props {
  collapsed: boolean;
  onNewChat: () => void;
  onSelectThread: (id: string) => void;
  activeThreadId: string | null;
}

export default function ConversationsPanel({ collapsed, onNewChat, onSelectThread, activeThreadId }: Props) {
  const items = activeThreadId ? [{ id: activeThreadId, title: "Conversación principal" }] : [];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <button className="new-chat-button" onClick={onNewChat}>
          <Plus size={16} />
          <span>Nuevo chat</span>
        </button>
        <button className="sidebar-search">
          <Search size={15} />
          <span>Buscar</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-label">Workspace</span>
          <button className="nav-item active">
            <MessageSquare size={16} />
            <span>Chat</span>
          </button>
          <button className="nav-item">
            <LayoutDashboard size={16} />
            <span>Tareas</span>
          </button>
          <button className="nav-item">
            <Files size={16} />
            <span>Documentos</span>
          </button>
          <button className="nav-item">
            <Brain size={16} />
            <span>Memoria</span>
          </button>
          <button className="nav-item">
            <Bot size={16} />
            <span>Agentes</span>
          </button>
        </div>

        <div className="nav-section conversations-section">
          <div className="nav-section-header">
            <span className="nav-label">Conversaciones</span>
            <button className="mini-action" onClick={onNewChat} title="Nueva conversación">
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
                <button
                  key={c.id}
                  className={`conversation-item ${c.id === activeThreadId ? "active" : ""}`}
                  onClick={() => onSelectThread(c.id)}
                >
                  <MessageSquare size={15} />
                  <span>{c.title}</span>
                </button>
              ))
            )}
          </div>
        </div>
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
        <button className="nav-item">
          <Settings size={16} />
          <span>Configuración</span>
        </button>
      </div>
    </aside>
  );
}
