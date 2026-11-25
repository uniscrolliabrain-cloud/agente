// B3_SIDEBAR_LIVE_V1 - LiveItem disponible para usar en la lista de recientes.
// B1_SIDEBAR_V1
// SIDEBAR_RAIL_V1 - con la barra plegada quedan los iconos en un rail con
// tooltip al pasar por encima; los ajustes viven abajo, en color de acento.
import {
  Activity,
  BarChart3,
  Brain,
  ChevronsRight,
  ClipboardList,
  Files,
  FolderKanban,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  MessageSquareText,
  PanelsTopLeft,
  PanelLeftClose,
  Search,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { useState, type MouseEvent } from "react";
import type { Thread } from "../api/threads";
// SIDEBAR_THREADS_V2 - filas compactas con menu por conversacion.
import SidebarThreads, { type ThreadPatch } from "./SidebarThreads";
// BRAND_MARK_V1 - la marca AgntiaPro tambien en la barra lateral.
import { BrandLockup } from "./BrandMark";
import { WhatsAppIcon } from "./WhatsAppIcon";

// WS_UI_APPVIEW_V1 - anadida entrada workspace.
// SIDEBAR_BRAND_AGNTIA_V1
export type AppView = "today" | "chat" | "tasks" | "documents" | "projects" | "control-center" | "memory" | "users" | "team" | "workspace" | "centro-mando" | "whatsapp" | "operations" | "command-studio" | "apps" | "formation";

interface Props {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  isAdmin: boolean;
  activeThreadId: string | null;
  threads: Thread[];
  onSelectThread: (id: string) => void;
  /** SIDEBAR_THREADS_V2 - acciones del menu de cada conversacion. */
  onRenameThread: (id: string, title: string) => Promise<unknown> | void;
  onPatchThread: (id: string, patch: ThreadPatch) => Promise<unknown> | void;
  onDeleteThread?: (id: string) => Promise<unknown> | void;
  userName: string;
  userRole: string;
  onOpenProfile: () => void;
  /** DEMO_TENANT_V1 - aviso y salida del tenant sintetico. */
  demo?: { active: boolean; onExit: () => void };
  /** SESSION_TENANT_NOTICE_V1 - empresa resuelta por /api/auth/me para esta sesion. */
  tenant?: { id: string } | null;
  /** SIDEBAR_RAIL_V1 - plegada deja solo los iconos. */
  collapsed: boolean;
  onToggleCollapsed?: () => void;
  /** SIDEBAR_SETTINGS_V1 - menu de cuenta y cierre de sesion. */
  onOpenSettings: () => void;
  /** DEMO_VIEWS_V1 - el clon de demostracion anade la entrada Apps; en
   *  produccion el prop va apagado y el menu queda igual. */
  showApps?: boolean;
  /** DEMO_VIEWS_V1 - igual que Apps: Formación solo existe en el clon. */
  showFormation?: boolean;
}

const PRIMARY: { id: AppView; label: string; icon: typeof MessageSquareText }[] = [
  // COMMAND_CENTER_VIEW_V1 - la entrada que abre la empresa al arrancar.
  { id: "today", label: "Centro de mando", icon: Gauge },
  { id: "command-studio", label: "Estudio · Demo", icon: PanelsTopLeft },
  { id: "chat", label: "Chat", icon: MessageSquareText },
  { id: "tasks", label: "Tareas", icon: LayoutDashboard },
  { id: "whatsapp", label: "WhatsApp", icon: WhatsAppIcon },
  { id: "documents", label: "Documentos", icon: Files },
  { id: "memory", label: "Conocimiento", icon: Brain },
  { id: "projects", label: "Proyectos", icon: FolderKanban },
  { id: "control-center", label: "Centro de control", icon: Activity },
  { id: "operations", label: "Operaciones", icon: ClipboardList },
  // TEAM_VIEW_V1 - personas y agentes IA en la misma pantalla.
  { id: "team", label: "Equipo", icon: Users },
  // WS_UI_SIDEBAR_ITEM_V1
  { id: "workspace", label: "Workspaces", icon: PanelsTopLeft },
  // COMMAND_CENTER_VIEW_V1 - la analitica del tenant, separada del centro de mando.
  { id: "centro-mando", label: "Analítica", icon: BarChart3 },
];

export default function SidebarV2({
  activeView,
  onSelectView,
  isAdmin,
  activeThreadId,
  threads,
  onSelectThread,
  onRenameThread,
  onPatchThread,
  onDeleteThread,
  userName,
  userRole,
  onOpenProfile,
  demo,
  tenant,
  collapsed,
  onToggleCollapsed,
  onOpenSettings,
  showApps,
  showFormation,
}: Props) {
  // DEMO_VIEWS_V1 - Apps solo aparece cuando el clon inyecta su workspace.
  const demoItems: { id: AppView; label: string; icon: typeof MessageSquareText }[] = [
    ...(showApps ? [{ id: "apps" as const, label: "Apps", icon: LayoutGrid }] : []),
    ...(showFormation ? [{ id: "formation" as const, label: "Formación", icon: GraduationCap }] : []),
  ];
  const navItems: { id: AppView; label: string; icon: typeof MessageSquareText }[] = [
    ...PRIMARY.slice(0, 2),
    ...demoItems,
    ...PRIMARY.slice(2),
  ];
  const initials = userName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  // SIDEBAR_THREADS_V2 - todos los hilos, en una lista que ya hace scroll con
  // la columna. Antes solo se veían tres y los demás desaparecían sin aviso.
  const recent = threads;
  const hasPendingTasks = false;
  // El tooltip del rail se pinta en coordenadas de ventana para que no lo
  // recorte el scroll interno de la barra.
  const [railTip, setRailTip] = useState<{ label: string; x: number; y: number } | null>(null);
  const showTip = (label: string) => (event: MouseEvent<HTMLElement>) => {
    if (!collapsed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setRailTip({ label, x: rect.right + 12, y: rect.top + rect.height / 2 });
  };
  const hideTip = () => setRailTip(null);

  return (
    <aside className="v2-sidebar" data-collapsed={collapsed}>
      <div className="v2-sidebar-top">
        <div className="v2-sidebar-head">
          <button
            type="button"
            className="v2-sidebar-brand"
            onClick={() => onSelectView("today")}
            aria-label="Ir al inicio"
          >
            <BrandLockup compact={collapsed} />
          </button>
          {onToggleCollapsed && <button
            type="button"
            className="v2-rail-toggle"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Desplegar menú" : "Plegar menú"}
            aria-expanded={!collapsed}
            title={collapsed ? "Desplegar menú" : "Plegar menú"}
          >
            {collapsed ? <ChevronsRight size={15} /> : <PanelLeftClose size={15} />}
          </button>}
        </div>

        {!collapsed && demo?.active && (
          <div className="v2-demo-notice" role="status">
            <span className="v2-demo-dot" aria-hidden="true" />
            <div style={{ minWidth: 0 }}>
              <div className="v2-demo-title">Tenant demo · Interfaz</div>
              <div className="v2-demo-sub">Datos sintéticos</div>
            </div>
            <button type="button" className="v2-demo-exit" onClick={demo.onExit}>
              Salir
            </button>
          </div>
        )}

        {!collapsed && !demo?.active && tenant?.id && (
          <div className="v2-demo-notice" role="status">
            <span className="v2-demo-dot" aria-hidden="true" />
            <div style={{ minWidth: 0 }}>
              <div className="v2-demo-title">Empresa · {tenant.id.toUpperCase()}</div>
              <div className="v2-demo-sub">Sesión verificada</div>
            </div>
          </div>
        )}

        <nav className="v2-sidebar-nav" aria-label="Principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`v2-nav-item ${active ? "active" : ""}`}
                onClick={() => onSelectView(item.id)}
                onMouseEnter={showTip(item.label)}
                onMouseLeave={hideTip}
                aria-label={collapsed ? item.label : undefined}
              >
                <span className="v2-nav-main">
                  <Icon className="v2-nav-icon" />
                  {!collapsed && <span className="v2-nav-label">{item.label}</span>}
                </span>
                {!collapsed && item.id === "tasks" && hasPendingTasks && <span className="v2-nav-dot" />}
              </button>
            );
          })}
          {isAdmin && (
            <button
              type="button"
              className={`v2-nav-item ${activeView === "users" ? "active" : ""}`}
              onClick={() => onSelectView("users")}
              onMouseEnter={showTip("Usuarios")}
              onMouseLeave={hideTip}
              aria-label={collapsed ? "Usuarios" : undefined}
            >
              <span className="v2-nav-main">
                <UserCog className="v2-nav-icon" />
                {!collapsed && <span className="v2-nav-label">Usuarios</span>}
              </span>
            </button>
          )}
        </nav>

        {!collapsed && (
          <div className="v2-sidebar-recent-block">
            <div className="v2-sidebar-recent-title">
              <span className="v2-sidebar-label" style={{ padding: 0, margin: 0 }}>Recientes</span>
              <Search size={14} style={{ color: "var(--v2-text-3)" }} />
            </div>
            <SidebarThreads
              threads={recent}
              activeThreadId={activeThreadId}
              onSelect={onSelectThread}
              onRename={onRenameThread}
              onPatch={onPatchThread}
              {...(onDeleteThread ? { onDelete: onDeleteThread } : {})}
            />
          </div>
        )}
      </div>

      <div className="v2-sidebar-footer">
        {collapsed ? (
          <div className="v2-rail-actions">
            <button
              type="button"
              className="v2-rail-action accent"
              onClick={onOpenSettings}
              onMouseEnter={showTip("Ajustes")}
              onMouseLeave={hideTip}
              aria-label="Ajustes"
            >
              <Settings size={17} />
            </button>
            <button type="button" className="v2-rail-avatar" onClick={onOpenProfile} title={userName} aria-label="Mi perfil">
              {initials || "?"}
            </button>
          </div>
        ) : (
          <div className="v2-footer-row">
            <button
              type="button"
              className="v2-user-chip"
              onClick={onOpenProfile}
              style={{ flex: 1, minWidth: 0, border: 0, background: "transparent", cursor: "pointer" }}
            >
              <div className="v2-user-chip-avatar">{initials || "?"}</div>
              <div style={{ textAlign: "left", minWidth: 0 }}>
                <div className="v2-user-chip-name">{userName}</div>
                <div className="v2-user-chip-role">
                  <span className="v2-status-dot" />
                  {userRole === "admin" ? "Admin" : "Usuario"}
                </div>
              </div>
            </button>
            <button
              type="button"
              className="v2-gear"
              onClick={onOpenSettings}
              aria-label="Ajustes y cuenta"
              title="Ajustes y cuenta"
            >
              <Settings size={16} />
            </button>
          </div>
        )}
      </div>

      {collapsed && railTip && (
        <span
          className="v2-rail-tip-fixed"
          role="tooltip"
          style={{ left: railTip.x, top: railTip.y }}
        >
          {railTip.label}
        </span>
      )}
    </aside>
  );
}
