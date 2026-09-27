import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useTasks } from "./hooks/useTasks";
import { useChat } from "./hooks/useChat";
import { useWorkspaceData } from "./hooks/useWorkspaceData";
import Header from "./components/Header";
import ConversationsPanel, { type AppView } from "./components/ConversationsPanel";
import ChatPanel from "./components/ChatPanel";
import KanbanPanel from "./components/KanbanPanel";
import Login from "./components/Login";
import TasksView from "./components/TasksView";
import DocumentsView from "./components/DocumentsView";
import MemoryView from "./components/MemoryView";
import UsersView from "./components/UsersView";
import ProfileModal from "./components/ProfileModal";
import TaskDetailModal from "./components/TaskDetailModal";
import ApprovalModal from "./components/ApprovalModal";
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

export default function App() {
  const auth = useAuth();
  const tasks = useTasks(3000, auth.isAuthenticated);
  const chat = useChat(auth.isAuthenticated);
  const { memories, files } = useWorkspaceData(auth.isAuthenticated);
  const theme = useTheme();

  const [view, setView] = useState<AppView>("chat");
  const [convCollapsed, setConvCollapsed] = useState(false);
  const [kanbanCollapsed, setKanbanCollapsed] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reviewTaskId, setReviewTaskId] = useState<string | null>(null);

  if (auth.booting) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <div className="brand-mark">AI</div>
          <div className="boot-spinner" />
          <span>Conectando con el agente…</span>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Login onLogin={auth.login} error={auth.error} />;
  }

  const openTask = (t: AgentTask) => setOpenTaskId(t.id);
  const reviewTask = (t: AgentTask) => setReviewTaskId(t.id);

  return (
    <div className="app-root">
      <Header
        mode={auth.mode ?? "live"}
        workerRunning={tasks.workerRunning}
        workerLastTickAt={tasks.workerLastTickAt}
        convCollapsed={convCollapsed}
        kanbanCollapsed={kanbanCollapsed}
        dark={theme.dark}
        onToggleTheme={theme.toggle}
        onToggleConv={() => setConvCollapsed((v) => !v)}
        onToggleKanban={() => setKanbanCollapsed((v) => !v)}
        userName={auth.user?.name ?? "Usuario"}
        userRole={auth.user?.role ?? "user"}
        onOpenProfile={() => setProfileOpen(true)}
        onLogout={auth.logout}
      />

      <div className="main">
        <ConversationsPanel
          collapsed={convCollapsed}
          activeView={view}
          onSelectView={setView}
          activeThreadId={chat.threadId}
          isAdmin={auth.user?.role === "admin"}
          onNewChat={() => { /* multi-thread próximamente */ }}
        />

        {view === "chat" && <ChatPanel chat={chat} />}
        {view === "tasks" && <TasksView tasks={tasks.tasks} onOpenTask={openTask} onReviewTask={reviewTask} />}
        {view === "documents" && <DocumentsView files={files} />}
        {view === "memory" && <MemoryView memories={memories} />}
        {view === "users" && auth.user && <UsersView currentUserId={auth.user.id} />}

        {view === "chat" && (
          <KanbanPanel
            collapsed={kanbanCollapsed}
            mobileOpen={false}
            onCloseMobile={() => setKanbanCollapsed(true)}
            tasks={tasks.tasks}
            memories={memories}
            files={files}
            onOpenTask={openTask}
            onReviewTask={reviewTask}
          />
        )}
      </div>

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
