interface HeaderProps {
  mode: "sample" | "live";
  workerRunning: boolean;
  workerLastTickAt?: string;
  convCollapsed: boolean;
  kanbanCollapsed: boolean;
  onToggleConv: () => void;
  onToggleKanban: () => void;
  onLogout: () => void;
}

function formatTick(iso?: string): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 2000) return "ahora";
  if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
  return `${Math.floor(ms / 60000)}m`;
}

export default function Header(props: HeaderProps) {
  const {
    mode,
    workerRunning,
    workerLastTickAt,
    convCollapsed,
    kanbanCollapsed,
    onToggleConv,
    onToggleKanban,
    onLogout,
  } = props;

  return (
    <header className="app-header">
      <div className="h-left">
        <button className="icon-btn hide-mobile" onClick={onToggleConv} title={convCollapsed ? "Mostrar conversaciones" : "Ocultar conversaciones"}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M9 3v18" />
          </svg>
        </button>
        <div className="h-logo">
          <div className="logo-grad small">IA</div>
          <span className="h-title">Agente IA Pro</span>
        </div>
        <div className="h-divider" />
        <div className="worker">
          <span className={`w-dot ${workerRunning ? "pulse" : ""}`} />
          <span className="w-label">Worker</span>
          <span className={`w-status ${workerRunning ? "running" : ""}`}>
            {workerRunning ? "running" : "stopped"}
          </span>
          <span className="w-tick">· {formatTick(workerLastTickAt)}</span>
        </div>
        <span className={`mode-chip ${mode}`}>{mode}</span>
      </div>
      <div className="h-right">
        <button className="icon-btn hide-mobile" onClick={onToggleKanban} title={kanbanCollapsed ? "Mostrar kanban" : "Ocultar kanban"}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M15 3v18" />
          </svg>
        </button>
        <button className="icon-btn" onClick={onLogout} title="Cerrar sesión">
          <span className="avatar">JD</span>
        </button>
      </div>
    </header>
  );
}
