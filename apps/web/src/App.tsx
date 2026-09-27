import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useTasks } from "./hooks/useTasks";
import { useChat } from "./hooks/useChat";
import Header from "./components/Header";
import ConversationsPanel from "./components/ConversationsPanel";
import ChatPanel from "./components/ChatPanel";
import KanbanPanel from "./components/KanbanPanel";
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
  const theme = useTheme();

  const [convCollapsed, setConvCollapsed] = useState(false);
  const [kanbanCollapsed, setKanbanCollapsed] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
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
    return (
      <div className="boot-screen">
        <div className="connection-error">
          <div className="connection-error-icon">!</div>
          <h2>No se pudo conectar</h2>
          <p>{auth.error ?? "Error desconocido"}</p>
        </div>
      </div>
    );
  }

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
        onLogout={auth.logout}
      />

      <div className="main">
        <ConversationsPanel
          collapsed={convCollapsed}
          activeThreadId={chat.threadId}
          onNewChat={() => { /* multi-thread próximamente */ }}
          onSelectThread={() => { /* multi-thread próximamente */ }}
        />

        <ChatPanel chat={chat} />

        <KanbanPanel
          collapsed={kanbanCollapsed}
          mobileOpen={false}
          onCloseMobile={() => setKanbanCollapsed(true)}
          tasks={tasks.tasks}
          onOpenTask={(t: AgentTask) => setOpenTaskId(t.id)}
          onReviewTask={(t: AgentTask) => setReviewTaskId(t.id)}
        />
      </div>

      {openTaskId && (
        <TaskDetailModal
          taskId={openTaskId}
          onClose={() => setOpenTaskId(null)}
          onChanged={tasks.refresh}
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
