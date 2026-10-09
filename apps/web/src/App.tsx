// FIX_TC_APP_V3 - App con AppShell + ContextualPanel + viewResolver.
import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useTasks } from "./hooks/useTasks";
import { useChat } from "./hooks/useChat";
import { useThreads } from "./hooks/useThreads";
import { useWorkspaceData } from "./hooks/useWorkspaceData";
import { useNotifications } from "./hooks/useNotifications";
import { useViewResolver } from "./hooks/useViewResolver";
import SidebarV2, { type AppView } from "./components/SidebarV2";
import TopBarV2 from "./components/TopBarV2";
import ChatPanel from "./components/ChatPanel";
import Login from "./components/Login";
import TasksView from "./components/TasksView";
import DocumentsView from "./components/DocumentsView";
import MemoryView from "./components/MemoryView";
import ProjectsView from "./components/ProjectsView";
import ControlCenterView from "./components/ControlCenterView";
import UsersView from "./components/UsersView";
import AgentsPage from "./components/agents/AgentsPage";
import ProfileModal from "./components/ProfileModal";
import TaskDetailModal from "./components/TaskDetailModal";
import ApprovalModal from "./components/ApprovalModal";
import CommandPalette from "./components/CommandPalette";
import AppShell from "./components/AppShell";
import ContextualPanel from "./components/ContextualPanel";
import type { AgentTask } from "./types/api";

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
  useNotifications(auth.isAuthenticated);
  useTheme();
  const viewResolver = useViewResolver();

  const [view, setView] = useState<AppView>("chat");
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reviewTaskId, setReviewTaskId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
      if (k === "n") { e.preventDefault(); setView("chat"); void threads.createNew(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [threads.createNew]);

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

  const status: "ok" | "working" | "offline" = chat.streaming
    ? "working"
    : tasks.workerRunning
      ? "ok"
      : "offline";
  const statusLabel = chat.streaming
    ? "Trabajando..."
    : tasks.workerRunning
      ? "Agente activo"
      : "Desconectado";

  const sidebar = (
    <SidebarV2
      activeView={view}
      onSelectView={setView}
      isAdmin={auth.user?.role === "admin"}
      activeThreadId={threads.activeId}
      threads={threads.threads}
      onSelectThread={(id) => { setView("chat"); threads.select(id); }}
      userName={auth.user?.name ?? "Usuario"}
      userRole={auth.user?.role ?? "user"}
      onOpenProfile={() => setProfileOpen(true)}
    />
  );

  const panel = (
    <ContextualPanel
      spec={viewResolver.spec}
      onClose={viewResolver.clear}
    />
  );

  return (
    <>
      <AppShell sidebar={sidebar} panel={panel}>
        <TopBarV2
          status={status}
          statusLabel={statusLabel}
          onNewChat={handleNewChat}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        <div className="v2-content">
          {view === "chat" && <ChatPanel chat={chat} onResolveView={(intent) => void viewResolver.resolve(intent)} />} {/* APP_CONNECT_VIEWRESOLVER_V1 */}
          {view === "tasks" && (
            <TasksView
              tasks={tasks.tasks}
              currentUserId={auth.user?.id ?? null}
              onOpenTask={openTask}
              onReviewTask={reviewTask}
            />
          )}
          {view === "documents" && <DocumentsView files={files} />}
          {view === "memory" && <MemoryView memories={memories} />}
          {view === "projects" && <ProjectsView enabled={auth.isAuthenticated} />}
          {view === "control-center" && (
            <ControlCenterView enabled={auth.isAuthenticated} onOpenTask={(id) => setOpenTaskId(id)} />
          )}
          {view === "users" && auth.user && <UsersView currentUserId={auth.user.id} />}
          {view === "agents" && <AgentsPage enabled={auth.isAuthenticated} />} {/* AGENTS_PAGE_ENABLED_V1 */}
        </div>
      </AppShell>

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
    </>
  );
}