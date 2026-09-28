import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Moon, PanelLeft, PanelRight, Sun, User } from "lucide-react";

interface HeaderProps {
  status: "ok" | "working" | "offline" | "error";
  statusLabel: string;
  convCollapsed: boolean;
  kanbanCollapsed: boolean;
  dark: boolean;
  userName: string;
  userRole: string;
  onToggleTheme: () => void;
  onToggleConv: () => void;
  onToggleKanban: () => void;
  onOpenProfile: () => void;
  notifications?: number;
  onOpenNotifications?: () => void;
  onLogout: () => void;
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
      </div>
      <div className="header-right">
        <button className="ghost-icon-button desktop-only" onClick={props.onToggleKanban}>
          <PanelRight size={17} strokeWidth={1.8} />
        </button>
        <span className="status" role="status" data-state={props.status}>
          <span className="status__dot" aria-hidden="true" />
          {props.statusLabel}
        </span>
        <button
          className="ghost-icon-button notification-button"
          onClick={props.onOpenNotifications}
          title={props.notifications ? `${props.notifications} notificaciones` : "Notificaciones"}
        >
          <Bell size={17} strokeWidth={1.8} />
          {props.notifications && props.notifications > 0 ? (
            <span className="notification-badge">{props.notifications > 99 ? "99+" : props.notifications}</span>
          ) : null}
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