import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleDot, LogOut, Moon, PanelLeft, PanelRight, Sun, User } from "lucide-react";

interface HeaderProps {
  mode: "sample" | "live";
  workerRunning: boolean;
  workerLastTickAt?: string;
  convCollapsed: boolean;
  kanbanCollapsed: boolean;
  dark: boolean;
  userName: string;
  userRole: string;
  onToggleTheme: () => void;
  onToggleConv: () => void;
  onToggleKanban: () => void;
  onOpenProfile: () => void;
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const initials = props.userName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="ghost-icon-button desktop-only" onClick={props.onToggleConv}>
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
          <span className={`worker-indicator ${props.workerRunning ? "active" : ""}`}>
            <CircleDot size={11} />
          </span>
          <span className="worker-label">Worker</span>
          <span className={props.workerRunning ? "worker-running" : "worker-stopped"}>
            {props.workerRunning ? "Running" : "Stopped"}
          </span>
          <span className="worker-time">· {formatTick(props.workerLastTickAt)}</span>
        </div>
        <div className={`environment-pill ${props.mode}`}>
          <span className="environment-dot" />
          {props.mode === "live" ? "Live" : "Sample"}
        </div>
      </div>
      <div className="header-right">
        <button className="ghost-icon-button desktop-only" onClick={props.onToggleKanban}>
          <PanelRight size={17} strokeWidth={1.8} />
        </button>
        <button className="ghost-icon-button" onClick={props.onToggleTheme}>
          {props.dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
        </button>
        <div className="user-menu-wrap" ref={menuRef}>
          <button className="user-menu-trigger" onClick={() => setMenuOpen((v) => !v)}>
            <div className="user-avatar">{initials || "?"}</div>
            <div className="user-copy desktop-only">
              <span>{props.userName}</span>
              <small>{props.userRole === "admin" ? "Admin" : "Usuario"}</small>
            </div>
            <ChevronDown size={14} className="user-chevron" />
          </button>
          {menuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-dropdown-name">{props.userName}</div>
                <div className="user-dropdown-role">{props.userRole === "admin" ? "Administrador" : "Usuario"}</div>
              </div>
              <div className="user-dropdown-divider" />
              <button className="user-dropdown-item" onClick={() => { setMenuOpen(false); props.onOpenProfile(); }}>
                <User size={14} /><span>Mi perfil</span>
              </button>
              <button className="user-dropdown-item danger" onClick={() => { setMenuOpen(false); props.onLogout(); }}>
                <LogOut size={14} /><span>Cerrar sesion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
