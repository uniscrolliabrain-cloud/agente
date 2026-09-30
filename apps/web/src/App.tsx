import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useTasks } from "./hooks/useTasks";
import { useChat } from "./hooks/useChat";
import { useThreads } from "./hooks/useThreads";
import { useWorkspaceData } from "./hooks/useWorkspaceData";
import { useNotifications } from "./hooks/useNotifications";
import Header from "./components/Header";
import ConversationsPanel, { type AppView } from "./components/ConversationsPanel";
import ChatPanel from "./components/ChatPanel";
import KanbanPanel from "./components/KanbanPanel";
import Login from "./components/Login";
import TasksView from "./components/TasksView";
import DocumentsView from "./components/DocumentsView";
import MemoryView from "./components/MemoryView";
import ProjectsView from "./components/ProjectsView";
import ControlCenterView from "./components/ControlCenterView";
import UsersView from "./components/UsersView";
import ProfileModal from "./components/ProfileModal";
import TaskDetailModal from "./components/TaskDetailModal";
import ApprovalModal from "./components/ApprovalModal";
import CommandPalette from "./components/CommandPalette";
import type { AgentTask } from "./types/api";
// WORKSPACE_REGISTRY_V1 — los hooks del registry (useStateRegistry/useEffectRegistry) se
// quitaron: Fase 1 no esta cableada y noUnusedLocals rompia el typecheck. Al implementarla,
// volver a importar useState/useEffect aqui y consumir WORKSPACE_VIEW_BY_ROLE (ya exportado).

function usePanel(key: string, defaultCollapsed: boolean) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === "1") return true;
      if (saved === "0") return false;
    } catch { /* modo privado */ }
    return defaultCollapsed;
  });
  useEffect(() => {
    try { localStorage.setItem(key, collapsed ? "1" : "0"); } catch { /* noop */ }
  }, [key, collapsed]);
  return [collapsed, setCollapsed] as const;
}

function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("openmuse_theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("openmuse_theme", dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggle: () => setDark((v) => !v) };
}

// WORKSPACE_REGISTRY_V1 — mapeo rol -> vista por defecto. Fase 1: solo
// cambia la vista inicial al activar un rol. Fase 3: plantillas ricas.
// Exportado a proposito: asi el scaffolding se conserva aunque Fase 1 no este
// cableada todavia, y noUnusedLocals no lo marca como declaracion muerta.
export const WORKSPACE_VIEW_BY_ROLE: Record<string, AppView> = {
  direccion: "control-center",
  comercial: "tasks",
  atencion: "chat",
  administrativo: "documents",
  finanzas: "control-center",
  marketing: "tasks",
  contenido: "documents",
  operaciones: "tasks",
  compras: "tasks",
  rrhh: "tasks",
  legal: "documents",
  compliance: "documents",
  investigacion: "memory",
  calidad: "tasks",
  it: "tasks",
  producto: "projects",
};
export default function App() {
  const auth = useAuth();
  const tasks = useTasks(3000, auth.isAuthenticated);
  const threads = useThreads(auth.isAuthenticated);
  const chat = useChat(auth.isAuthenticated, threads.activeId, threads.touch);
  const { memories, files } = useWorkspaceData(auth.isAuthenticated);
  const notifications = useNotifications(auth.isAuthenticated);
  const theme = useTheme();

  const [view, setView] = useState<AppView>("chat");
  const [convCollapsed, setConvCollapsed] = usePanel("openmuse_conv_collapsed", false);
  const [kanbanCollapsed, setKanbanCollapsed] = usePanel("openmuse_kanban_collapsed", false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reviewTaskId, setReviewTaskId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === "b") { e.preventDefault(); setConvCollapsed((v) => !v); }
      if (k === "j") { e.preventDefault(); setKanbanCollapsed((v) => !v); }
      if (k === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
      if (k === "n") { e.preventDefault(); setView("chat"); void threads.createNew(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setConvCollapsed, setKanbanCollapsed, threads.createNew]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    if (threads.activeId) return;
    if (threads.loading) return;
    if (threads.threads.length > 0) threads.select(threads.threads[0].id);
    else void threads.createNew();
  }, [auth.isAuthenticated, threads]);

  if (auth.booting) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <div className="brand-mark">AI</div>
          <div className="boot-spinner" />
          <span>Conectando con el agente...</span>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Login onLogin={auth.login} error={auth.error} />;
  }

  const openTask = (t: AgentTask) => setOpenTaskId(t.id);
  const reviewTask = (t: AgentTask) => setReviewTaskId(t.id);
  const handleNewChat = () => {
    setView("chat");
    void threads.createNew();
  };

  const status: "ok" | "working" | "offline" | "error" = chat.streaming
    ? "working"
    : tasks.workerRunning
      ? "ok"
      : "offline";
  const statusLabel = chat.streaming
    ? "Trabajando..."
    : tasks.workerRunning
      ? "Agente activo"
      : "Desconectado";

  return (
    <div className="app-root">
      <Header
        status={status}
        statusLabel={statusLabel}
        convCollapsed={convCollapsed}
        kanbanCollapsed={kanbanCollapsed}
        dark={theme.dark}
        onToggleTheme={theme.toggle}
        onToggleConv={() => setConvCollapsed((v) => !v)}
        onToggleKanban={() => setKanbanCollapsed((v) => !v)}
        userName={auth.user?.name ?? "Usuario"}
        userRole={auth.user?.role ?? "user"}
        onOpenProfile={() => setProfileOpen(true)}
        notifications={notifications.unread}
        onOpenNotifications={() => { void notifications.markAllRead(); setView("tasks"); }}
        onLogout={auth.logout}
      />

      <div className="main">
        <ConversationsPanel
          collapsed={convCollapsed}
          activeView={view}
          // APP_WORKSPACE_LABEL_V1
          workspaceLabel="Agente IA Pro"
          onSelectView={setView}
          activeThreadId={threads.activeId}
          threads={threads.threads}
          onSelectThread={(id) => { setView("chat"); threads.select(id); }}
          isAdmin={auth.user?.role === "admin"}
          onNewChat={handleNewChat}
          onOpenPalette={() => setPaletteOpen(true)}
          userName={auth.user?.name ?? "Usuario"}
          userRole={auth.user?.role ?? "user"}
          onOpenProfile={() => setProfileOpen(true)}
        />

        {view === "chat" && <ChatPanel chat={chat} />}
        {view === "tasks" && <TasksView tasks={tasks.tasks} currentUserId={auth.user?.id ?? null} onOpenTask={openTask} onReviewTask={reviewTask} />}
        {view === "documents" && <DocumentsView files={files} />}
        {view === "memory" && <MemoryView memories={memories} />}
        {view === "projects" && <ProjectsView enabled={auth.isAuthenticated} />}
        {view === "control-center" && <ControlCenterView enabled={auth.isAuthenticated} onOpenTask={(id) => setOpenTaskId(id)} />}
        {view === "users" && auth.user && <UsersView currentUserId={auth.user.id} />}

        {view === "chat" && (
          <KanbanPanel
            collapsed={kanbanCollapsed}
            // MOBILE_KANBAN — en pantallas pequenas el panel se abre como overlay.
            mobileOpen={!kanbanCollapsed && window.matchMedia("(max-width: 900px)").matches}
            onCloseMobile={() => setKanbanCollapsed(true)}
            tasks={tasks.tasks}
            memories={memories}
            files={files}
            onOpenTask={openTask}
            onReviewTask={reviewTask}
          />
        )}
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectView={setView}
        onNewChat={handleNewChat}
      />

      {openTaskId && (
        <TaskDetailModal
          taskId={openTaskId}
          onClose={() => setOpenTaskId(null)}
          onChanged={tasks.refresh}
        />
      )}

      {profileOpen && auth.user && (
        <ProfileModal
          user={auth.user}
          onClose={() => setProfileOpen(false)}
          onSaved={(u) => { localStorage.setItem("openmuse_user", JSON.stringify(u)); }}
        />
      )}

      {reviewTaskId && (
        <ApprovalModal
          taskId={reviewTaskId}
          onClose={() => setReviewTaskId(null)}
          onChanged={tasks.refresh}
        />
      )}
    </div>
  );
}
