interface Props {
  collapsed: boolean;
  onNewChat: () => void;
  onSelectThread: (id: string) => void;
  activeThreadId: string | null;
}

export default function ConversationsPanel({ collapsed, onNewChat, onSelectThread, activeThreadId }: Props) {
  const items = activeThreadId
    ? [{ id: activeThreadId, title: "Conversación principal" }]
    : [];

  return (
    <aside className={`conversations-panel ${collapsed ? "collapsed" : ""}`}>
      <div className="conv-head">
        <span className="conv-head-title">Conversaciones</span>
        <button className="conv-new" onClick={onNewChat} title="Nueva conversación (próximamente)">+</button>
      </div>
      <div className="conv-list">
        {items.length === 0 && <div className="conv-empty">Sin conversaciones</div>}
        {items.map((c) => (
          <button
            key={c.id}
            className={`conv-item ${c.id === activeThreadId ? "active" : ""}`}
            onClick={() => onSelectThread(c.id)}
          >
            <span className="conv-item-icon">💬</span>
            <span className="conv-item-title">{c.title}</span>
          </button>
        ))}
      </div>
      <div className="conv-foot">
        <span className="conv-foot-note">Multi-thread próximamente</span>
      </div>
    </aside>
  );
}
