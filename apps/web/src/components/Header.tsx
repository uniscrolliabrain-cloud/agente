import { CircleDot, LogOut, Moon, PanelLeft, PanelRight, Sun } from "lucide-react";

interface HeaderProps {
  mode: "sample" | "live";
  workerRunning: boolean;
  workerLastTickAt?: string;
  convCollapsed: boolean;
  kanbanCollapsed: boolean;
  dark: boolean;
  onToggleTheme: () => void;
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

export default function Header({
  mode,
  workerRunning,
  workerLastTickAt,
  convCollapsed,
  kanbanCollapsed,
  dark,
  onToggleTheme,
  onToggleConv,
  onToggleKanban,
  onLogout,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="ghost-icon-button desktop-only"
          onClick={onToggleConv}
          title={convCollapsed ? "Mostrar sidebar" : "Ocultar sidebar"}
        >
          <PanelLeft size={17} strokeWidth={1.8} />
        </button>

        <div className="brand">
          <div className="brand-mark">AI</div>
          <div className="brand-copy">
            <span className="brand-name">Agente IA Pro</span>
            <span className="brand-subtitle">Workspace</span>
          </div>
        </div>

        <div className="header-divider" />

        <div className="worker-status">
          <span className={`worker-indicator ${workerRunning ? "active" : ""}`}>
            <CircleDot size={11} />
          </span>
          <span className="worker-label">Worker</span>
          <span className={workerRunning ? "worker-running" : "worker-stopped"}>
            {workerRunning ? "Running" : "Stopped"}
          </span>
          <span className="worker-time">· {formatTick(workerLastTickAt)}</span>
        </div>

        <div className={`environment-pill ${mode}`}>
          <span className="environment-dot" />
          {mode === "live" ? "Live" : "Sample"}
        </div>
      </div>

      <div className="header-right">
        <button
          className="ghost-icon-button desktop-only"
          onClick={onToggleKanban}
          title={kanbanCollapsed ? "Mostrar tareas" : "Ocultar tareas"}
        >
          <PanelRight size={17} strokeWidth={1.8} />
        </button>

        <button
          className="ghost-icon-button"
          onClick={onToggleTheme}
          title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
        </button>

        <div className="user-menu">
          <div className="user-avatar">AL</div>
          <div className="user-copy desktop-only">
            <span>Alfonso</span>
            <small>Agencia</small>
          </div>
          <button className="user-menu-button" onClick={onLogout} title="Cerrar sesión">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
