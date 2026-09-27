import { useState } from "react";
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

export default function App() {
  const auth = useAuth();
  const tasks = useTasks(3000, auth.isAuthenticated);
  const chat = useChat(auth.isAuthenticated);
  const [convCollapsed, setConvCollapsed] = useState(false);
  const [kanbanCollapsed, setKanbanCollapsed] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [reviewTaskId, setReviewTaskId] = useState<string | null>(null);

  if (auth.booting) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh", color: "#6b6b76", fontFamily: "system-ui" }}>
        Conectando con el backend…
      </div>
    );
  }
  if (!auth.isAuthenticated) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh", padding: 24, textAlign: "center", fontFamily: "system-ui" }}>
        <div>
          <h2 style={{ color: "#b91c1c", marginBottom: 12 }}>No se pudo conectar al backend</h2>
          <p style={{ color: "#6b6b76", maxWidth: 480 }}>{auth.error ?? "Error desconocido"}</p>
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
        <ChatPanel />
        <KanbanPanel
          collapsed={kanbanCollapsed}
          mobileOpen={false}
          onCloseMobile={() => {}}
          tasks={tasks.tasks}
          onOpenTask={(t: AgentTask) => setOpenTaskId(t.id)}
          onReviewTask={(t: AgentTask) => setReviewTaskId(t.id)}
        />
      </div>
      {openTaskId && (
        <TaskDetailModal taskId={openTaskId} onClose={() => setOpenTaskId(null)} onChanged={tasks.refresh} />
      )}
      {reviewTaskId && (
        <ApprovalModal taskId={reviewTaskId} onClose={() => setReviewTaskId(null)} onChanged={tasks.refresh} />
      )}
    </div>
  );
}
