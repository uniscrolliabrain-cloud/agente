// B3_SIDEBAR_LIVE_V1 - LiveItem disponible para usar en la lista de recientes.
// B1_SIDEBAR_V1
import { Activity, Bot, Brain, Files, FolderKanban, LayoutDashboard, MessageSquare, Search, Settings, UserCog } from "lucide-react";
import type { Thread } from "../api/threads";
// WIRE_SIDEBAR_LIVEITEM_V1
import LiveItem from "./LiveItem";

// WS_UI_APPVIEW_V1 - anadida entrada workspace.
export type AppView = "chat" | "tasks" | "documents" | "projects" | "control-center" | "memory" | "users" | "agents" | "workspace";

interface Props {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  isAdmin: boolean;
  activeThreadId: string | null;
  threads: Thread[];
  onSelectThread: (id: string) => void;
  userName: string;
  userRole: string;
  onOpenProfile: () => void;
}

const PRIMARY: { id: AppView; label: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "tasks", label: "Tareas", icon: LayoutDashboard },
  { id: "documents", label: "Documentos", icon: Files },
  { id: "memory", label: "Conocimiento", icon: Brain },
  { id: "projects", label: "Proyectos", icon: FolderKanban },
  { id: "control-center", label: "Centro de control", icon: Activity },
  { id: "agents", label: "Agentes", icon: Bot },
  // WS_UI_SIDEBAR_ITEM_V1
  { id: "workspace", label: "Workspaces", icon: FolderKanban },
];

export default function SidebarV2({
  activeView,
  onSelectView,
  isAdmin,
  activeThreadId,
  threads,
  onSelectThread,
  userName,
  userRole,
  onOpenProfile,
}: Props) {
  const initials = userName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const recent = threads.slice(0, 3);
  const hasPendingTasks = false;

  return (
    <aside className="v2-sidebar">
      <div>
        <div className="v2-sidebar-brand">
          <div className="v2-sidebar-brand-mark">N</div>
          <span className="v2-sidebar-brand-name">norte.</span>
          <span className="v2-sidebar-brand-beta">BETA</span>
        </div>

        <div className="v2-sidebar-sections">
          <div>
            <div className="v2-sidebar-label">Principal</div>
            <nav className="v2-sidebar-nav">
              {PRIMARY.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    className={`v2-nav-item ${active ? "active" : ""}`}
                    onClick={() => onSelectView(item.id)}
                  >
                    <span>
                      <Icon className="v2-nav-icon" />
                      {item.label}
                    </span>
                    {item.id === "tasks" && hasPendingTasks && <span className="v2-nav-dot" />}
                  </button>
                );
              })}
              {isAdmin && (
                <button
                  className={`v2-nav-item ${activeView === "users" ? "active" : ""}`}
                  onClick={() => onSelectView("users")}
                >
                  <span>
                    <UserCog className="v2-nav-icon" />
                    Equipo
                  </span>
                </button>
              )}
            </nav>
          </div>

          <div>
            <div className="v2-sidebar-recent-title">
              <span className="v2-sidebar-label" style={{ padding: 0, margin: 0 }}>Recientes</span>
              <Search size={14} style={{ color: "var(--v2-text-3)" }} />
            </div>
            <div className="v2-sidebar-recent">
              {recent.length === 0 ? (
                <div style={{ padding: "0 12px", fontSize: 12, color: "var(--v2-text-3)" }}>Sin conversaciones</div>
              ) : (
                recent.map((t) => (
                  <LiveItem
                    key={t.id}
                    title={t.title}
                    active={t.id === activeThreadId}
                    activities={[]}
                    onClick={() => onSelectThread(t.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="v2-sidebar-footer">
        <button className="v2-user-chip" onClick={onOpenProfile} style={{ width: "100%", border: 0, background: "transparent", cursor: "pointer" }}>
          <div className="v2-user-chip-avatar">{initials || "?"}</div>
          <div style={{ textAlign: "left" }}>
            <div className="v2-user-chip-name">{userName}</div>
            <div className="v2-user-chip-role">
              <span className="v2-status-dot" />
              {userRole === "admin" ? "Admin" : "Usuario"}
            </div>
          </div>
          <Settings size={16} style={{ marginLeft: "auto", color: "var(--v2-text-3)" }} />
        </button>
      </div>
    </aside>
  );
}