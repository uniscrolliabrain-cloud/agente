import { lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useAuth } from "./hooks/useAuth";
import { useTasks } from "./hooks/useTasks";
import { useChat } from "./hooks/useChat";
import { useThreads } from "./hooks/useThreads";
import { useWorkspaceData } from "./hooks/useWorkspaceData";
import { useNotifications } from "./hooks/useNotifications";
import { useViewResolver } from "./hooks/useViewResolver";
import { usePanel } from "./hooks/usePanel";
import { useMediaQuery } from "./hooks/useMediaQuery";
import SidebarV2, { type AppView } from "./components/SidebarV2";
// DOCK_RAIL_V1 - barra de accesos independiente, solo en el clon de demostración.
import DockRail from "./components/DockRail";
import TopBarV2 from "./components/TopBarV2";
import ChatPanel from "./components/ChatPanel";
import CommandCenterView from "./components/CommandCenterView";
import CommandCenterEditorialView from "./components/CommandCenterEditorialView";
import Login from "./components/Login";
import LoginV3 from "./components/login-v3/LoginV3";
import Landing from "./landing/Landing.jsx";

// LOGIN_V3_SWITCH_V1 - la interfaz nueva queda activa por defecto y se puede
// revertir sin tocar código con VITE_LOGIN_V3=false. La autenticación es la
// misma en ambos casos: ningún contrato OAuth o de sesión cambia.
const USE_LOGIN_V3 = import.meta.env.VITE_LOGIN_V3 !== "false";
// COMMAND_CENTER_V2_SWITCH - composición editorial reversible.
const USE_COMMAND_CENTER_V2 = import.meta.env.VITE_COMMAND_CENTER_V2 !== "false";
import TasksView from "./components/TasksView";
import DocumentsView from "./components/DocumentsView";
import MemoryView from "./components/MemoryView";
import ProjectsView from "./components/ProjectsView";
import ControlCenterView from "./components/ControlCenterView";
import UsersView from "./components/UsersView";
import WhatsAppView from "./components/WhatsAppView";
// TEAM_VIEW_V1 - "Equipo" sustituye a la antigua vista de agentes.
import TeamView from "./components/TeamView";
import { isDemoSession } from "./api/client";
import VerticalSliceOperationsView from "./components/VerticalSliceOperationsView";
// APP_CENTRO_MANDO_V1
import CentroMandoWorkspace from "./workspaces/35-centro-mando/CentroMandoWorkspace";
// WS_UI_APP_SHELL_V1
import WorkspaceShell from "./workspaces/WorkspaceShell";
import { useWorkspaces } from "./hooks/useWorkspaces";
import ProfileModal from "./components/ProfileModal";
import TaskDetailModal from "./components/TaskDetailModal";
import ApprovalModal from "./components/ApprovalModal";
import CommandPalette from "./components/CommandPalette";
import AppShell from "./components/AppShell";
import ContextualPanel from "./components/ContextualPanel";
// SIDEBAR_CHAT_V1 - chat acoplado y ajustes con cierre de sesion.
import SidebarChat from "./components/SidebarChat";
import SettingsMenu from "./components/SettingsMenu";
import { MessageSquare, X } from "lucide-react";
import type { AgentTask } from "./types/api";
import MobileChatSheet from "./components/MobileChatSheet";
import MobileSheetDiagnostics from "./components/MobileSheetDiagnostics";
import WorkspaceLoadBoundary from "./components/WorkspaceLoadBoundary";

const BusinessCommandStudio = lazy(() => import("./workspaces/business-command-studio/BusinessCommandStudio"));

function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("agente_theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("agente_theme", dark ? "dark" : "light");
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

// DEMO_VIEWS_V1 - el clon de demostración (UI Lab / GitHub Pages) inyecta aquí
// los workspaces nuevos sin cambiar producción: sin este prop, la app monta
// exactamente las mismas vistas de siempre.
// DEMO_VIEWS_V1 - cada entrada es un nodo o una función que recibe la
// navegación del shell, para que los menús internos de la demo cambien de vista.
type DemoView = ReactNode | ((nav: (view: AppView) => void) => ReactNode);

// TU_EMPRESA_V1 - el clon demo inyecta aquí el estudio de compilación. Sin
// este prop, producción no monta la capa ni muestra la entrada en Ajustes.
type CompanyArea = (opts: { onClose: () => void }) => ReactNode;

export default function App({
  demoViews,
  companyArea,
}: { demoViews?: Partial<Record<AppView, DemoView>>; companyArea?: CompanyArea } = {}) {
  const auth = useAuth();
  const tasks = useTasks(3000, auth.isAuthenticated);
  const threads = useThreads(auth.isAuthenticated);
  const chat = useChat(auth.isAuthenticated, threads.activeId, threads.touch);
  const { memories, files } = useWorkspaceData(auth.isAuthenticated);
  useNotifications(auth.isAuthenticated);
  useTheme();
  const {
    view: resolvedView,
    loading: viewLoading,
    error: viewError,
    resolve: resolveView,
    clear: clearView,
  } = useViewResolver();

  // COMMAND_CENTER_VIEW_V1 - la sesion abre en el centro de mando, no en el chat vacio.
  const [view, setView] = useState<AppView>("today");
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reviewTaskId, setReviewTaskId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const { workspaces } = useWorkspaces(auth.isAuthenticated);
  // SIDEBAR_RAIL_V1 - barra plegada y drawer movil.
  const isMobile = useMediaQuery("(max-width: 900px)");
  const [collapsed, setCollapsed] = usePanel("ui.left.collapsed", false);
  const [mobileNav, setMobileNav] = useState(false);
  // SIDEBAR_CHAT_V1 - el chat ocupa la columna izquierda sin cambiar de vista.
  const [chatDock, setChatDock] = useState(false);
  const [mobileChat, setMobileChat] = useState(false);
  const chatFabRef = useRef<HTMLButtonElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // TU_EMPRESA_V1 - la meta-app sustituye el shell mientras está abierta.
  const [companyOpen, setCompanyOpen] = useState(false);
  // SPLIT_PANE_V1 - arrastrar una entrada de la barra lateral al contenido abre
  // esa vista al lado de la actual: a la derecha en escritorio y arriba en móvil.
  // Solo el clon de demostración lo usa.
  const [split, setSplit] = useState<AppView | null>(null);
  // SPLIT_PANE_V1 - reparto ajustable con el separador; no tiene por qué ser 50/50.
  const [splitRatio, setSplitRatio] = useState(0.5);
  const splitArea = useRef<HTMLDivElement>(null);
  const SPLIT_MIN = 0.2;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!auth.isAuthenticated || !(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
      if (k === "n") { e.preventDefault(); setView("chat"); void threads.createNew(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [auth.isAuthenticated, threads.createNew]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    if (threads.activeId) return;
    if (threads.loading) return;
    if (threads.threads.length > 0) threads.select(threads.threads[0].id);
    else void threads.createNew();
  }, [auth.isAuthenticated, threads]);

  const handleResolveView = useCallback(
    (intent: string, messageId?: string) => {
      void resolveView(intent, {
        ...(messageId ? { messageId } : {}),
        ...(activeWorkspaceId ? { workspaceId: activeWorkspaceId } : {}),
        ...(threads.activeId ? { threadId: threads.activeId } : {}),
      });
    },
    [resolveView, activeWorkspaceId, threads.activeId],
  );

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
    // PUBLIC_LANDING_KEEP_V1 - la landing publica que ya estaba en produccion se
    // conserva en la raiz; el acceso al panel sigue en ?acceso=1 y usa Login V3.
    if (new URLSearchParams(window.location.search).get("acceso") !== "1") return <Landing />;
    return USE_LOGIN_V3 ? (
      <LoginV3 onLogin={auth.login} onEnterDemo={auth.loginDemo} error={auth.error} />
    ) : (
      <Login onLogin={auth.login} onEnterDemo={auth.loginDemo} error={auth.error} />
    );
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
  // SESSION_TENANT_NOTICE_V1 (E18) - la etiqueta del espacio sale del tenant
  // que devuelve /api/auth/me, no del token demo. El sandbox conserva su
  // etiqueta propia porque su tenant sintetico no existe en el backend.
  const sessionTenant = isDemoSession() ? null : (auth.user?.tenantId ?? null);
  const contextLabel = isDemoSession() ? "Interfaz" : (sessionTenant ? sessionTenant.toUpperCase() : "MI");

  const demoSession = isDemoSession();
  const chatDockActive = chatDock && !isMobile;
  const mobileSheetOpen = isMobile && mobileChat;
  const chatOpen = chatDockActive || mobileSheetOpen;
  // MOBILE_SHEET_V2 - con la hoja abierta sus controles ya ofrecen cerrar; el boton
  // flotante solo hace falta cuando la hoja no esta (si no, queda encima y salta).
  const showChatFab = !mobileNav && !mobileSheetOpen;

  const selectView = (next: AppView) => {
    setView(next);
    setMobileNav(false);
  };

  // SPLIT_PANE_V1 - el destino soltado a la derecha: una vista o una conversación.
  const openSplit = (target: { kind: "view" | "thread"; id: string }) => {
    setMobileNav(false);
    if (target.kind === "thread") {
      threads.select(target.id);
      setSplit("chat");
      return;
    }
    setSplit(target.id as AppView);
  };

  // DEMO_VIEWS_V1 - resuelve un nodo o una función de navegación de la demo.
  const renderDemoView = (key: AppView): ReactNode => {
    const entry = demoViews?.[key];
    return typeof entry === "function" ? entry(selectView) : entry;
  };

  const toggleChat = () => {
    if (isMobile) {
      setMobileChat((open) => !open);
      return;
    }
    if (chatDock) {
      setChatDock(false);
      return;
    }
    setChatDock(true);
  };

  const dockedChat = chatDockActive ? (
    <SidebarChat
      chat={chat}
      tenantLabel={contextLabel}
      onClose={() => setChatDock(false)}
      onOpenFullChat={() => { setChatDock(false); setView("chat"); }}
      onOpenSettings={() => setSettingsOpen(true)}
    />
  ) : undefined;

  // SPLIT_PANE_V1 - el separador ajusta el reparto: vertical en escritorio,
  // horizontal cuando los paneles van apilados.
  const startSplitDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const area = splitArea.current?.getBoundingClientRect();
    if (!area) return;
    const move = (pointer: PointerEvent) => {
      const next = isMobile ? (pointer.clientY - area.top) / area.height : (pointer.clientX - area.left) / area.width;
      setSplitRatio(Math.min(1 - SPLIT_MIN, Math.max(SPLIT_MIN, next)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onSplitKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.02;
    const grow = isMobile ? event.key === "ArrowDown" : event.key === "ArrowRight";
    const shrink = isMobile ? event.key === "ArrowUp" : event.key === "ArrowLeft";
    if (!grow && !shrink) return;
    event.preventDefault();
    setSplitRatio((value) => Math.min(1 - SPLIT_MIN, Math.max(SPLIT_MIN, value + (grow ? step : -step))));
  };

  const splitStyle: CSSProperties | undefined = split
    ? isMobile
      ? { gridTemplateColumns: "minmax(0, 1fr)", gridTemplateRows: `${splitRatio}fr 10px ${1 - splitRatio}fr` }
      : { gridTemplateColumns: `${splitRatio}fr 10px ${1 - splitRatio}fr` }
    : undefined;

  // SPLIT_PANE_V1 - una sola descripción de vistas para los dos paneles, así el
  // panel dividido monta exactamente lo mismo que la vista principal.
  const renderViewContent = (current: AppView): ReactNode => {
    if (current === "today" && USE_COMMAND_CENTER_V2) {
      return (
        <CommandCenterEditorialView
          onOpenTask={(id) => setOpenTaskId(id)}
          onReviewTask={(id) => setReviewTaskId(id)}
          onOpenTasksView={() => setView("tasks")}
          onOpenAgentsView={() => setView("team")}
          onOpenChat={() => setView("chat")}
          {...(auth.user?.role === "admin"
            ? { onOpenTeamView: () => setView(demoViews ? "team" : "users") }
            : {})}
        />
      );
    }
    if (current === "today") {
      return (
        <CommandCenterView
          onOpenTask={(id) => setOpenTaskId(id)}
          onReviewTask={(id) => setReviewTaskId(id)}
          onOpenTasksView={() => setView("tasks")}
          onOpenAgentsView={() => setView("team")}
          onOpenChat={() => setView("chat")}
          {...(auth.user?.role === "admin"
            ? { onOpenTeamView: () => setView(demoViews ? "team" : "users") }
            : {})}
        />
      );
    }
    if (current === "chat") {
      return renderDemoView("chat") ?? (
        <ChatPanel chat={chat} onResolveView={handleResolveView} userName={auth.user?.name} />
      );
    }
    if (current === "tasks") {
      return (
        renderDemoView("tasks") ?? (
          <TasksView
            tasks={tasks.tasks}
            currentUserId={auth.user?.id ?? null}
            onOpenTask={openTask}
            onReviewTask={reviewTask}
          />
        )
      );
    }
    if (current === "documents") return renderDemoView("documents") ?? <DocumentsView files={files} />;
    if (current === "whatsapp") return renderDemoView("whatsapp") ?? <WhatsAppView />;
    if (current === "formation") return renderDemoView("formation") ?? null;
    if (current === "operations") {
      return <VerticalSliceOperationsView enabled={auth.isAuthenticated} onOpenTask={(id) => setOpenTaskId(id)} />;
    }
    if (current === "memory") return renderDemoView("memory") ?? <MemoryView memories={memories} />;
    if (current === "projects") {
      return renderDemoView("projects") ?? <ProjectsView enabled={auth.isAuthenticated} />;
    }
    if (current === "control-center") {
      return <ControlCenterView enabled={auth.isAuthenticated} onOpenTask={(id) => setOpenTaskId(id)} />;
    }
    if (current === "users" && auth.user) return <UsersView currentUserId={auth.user.id} />;
    if (current === "team") return renderDemoView("team") ?? <TeamView onOpenChat={() => setView("chat")} />;
    if (current === "workspace") {
      return (
        <WorkspaceShell
          workspaces={workspaces}
          workspaceId={activeWorkspaceId}
          onSelectWorkspace={setActiveWorkspaceId}
        />
      );
    }
    if (current === "apps") return renderDemoView("apps") ?? null;
    if (current === "centro-mando") return renderDemoView("centro-mando") ?? <CentroMandoWorkspace />;
    if (current === "command-studio") {
      return (
        <WorkspaceLoadBoundary>
          <Suspense fallback={<p style={{ padding: 24 }}>Preparando el estudio demo…</p>}>
            <BusinessCommandStudio />
          </Suspense>
        </WorkspaceLoadBoundary>
      );
    }
    return null;
  };

  const sidebar = (
    <SidebarV2
      activeView={view}
      onSelectView={selectView}
      isAdmin={auth.user?.role === "admin"}
      activeThreadId={threads.activeId}
      threads={threads.threads}
      onSelectThread={(id) => { setView("chat"); setMobileNav(false); threads.select(id); }}
      onRenameThread={(id, title) => threads.rename(id, title)}
      onPatchThread={(id, patch) => threads.patch(id, patch)}
      onDeleteThread={(id) => threads.remove(id)}
      userName={auth.user?.name ?? "Usuario"}
      userRole={auth.user?.role ?? "user"}
      onOpenProfile={() => setProfileOpen(true)}
      demo={{
        active: demoSession,
        onExit: () => { void auth.logout(); },
      }}
      tenant={sessionTenant ? { id: sessionTenant } : null}
      showApps={Boolean(demoViews?.apps)}
      showFormation={Boolean(demoViews?.formation)}
      projectsLabel={demoViews?.projects ? "Cartera" : undefined}
      hideLegacyViews={Boolean(demoViews)}
      reorderableNav={Boolean(demoViews)}
      chatsPanel={Boolean(demoViews)}
      {...(demoViews ? { onSplitDrop: openSplit } : {})}
      collapsed={chatDockActive || (collapsed && !isMobile)}
      onToggleCollapsed={chatDockActive ? undefined : () => setCollapsed((value) => !value)}
      onOpenSettings={() => setSettingsOpen(true)}
    />
  );

  const panel = resolvedView || viewLoading || viewError ? (
    <ContextualPanel
      view={resolvedView}
      loading={viewLoading}
      error={viewError}
      onClose={clearView}
    />
  ) : undefined;

  return (
    <>
      <AppShell
        sidebar={sidebar}
        panel={panel}
        collapsed={collapsed && !isMobile}
        chatDock={dockedChat}
        dock={demoViews ? <DockRail activeView={view} onSelectView={selectView} /> : undefined}
        mobileOpen={mobileNav}
        onCloseMobile={() => setMobileNav(false)}
      >
        <TopBarV2
          status={status}
          statusLabel={statusLabel}
          contextLabel={contextLabel}
          onNewChat={handleNewChat}
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenMenu={() => setMobileNav(true)}
        />

        <div className="v2-content" data-split={split ? "true" : undefined} ref={splitArea} style={splitStyle}>
          {split ? (
            <>
              <section className="v2-pane" data-pane="main" aria-label="Vista actual">
                {renderViewContent(view)}
              </section>
              <div
                className="v2-split-handle"
                role="separator"
                aria-orientation={isMobile ? "horizontal" : "vertical"}
                aria-label="Ajustar el reparto de la pantalla"
                aria-valuemin={Math.round(SPLIT_MIN * 100)}
                aria-valuemax={Math.round((1 - SPLIT_MIN) * 100)}
                aria-valuenow={Math.round(splitRatio * 100)}
                tabIndex={0}
                onPointerDown={startSplitDrag}
                onKeyDown={onSplitKeyDown}
              >
                <span aria-hidden="true" />
              </div>
              <section className="v2-pane" data-pane="split" aria-label="Vista dividida">
                {renderViewContent(split)}
              </section>
              <button
                type="button"
                className="v2-split-close"
                onClick={() => setSplit(null)}
                aria-label="Cerrar vista dividida"
                title="Cerrar vista dividida"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            renderViewContent(view)
          )}
        </div>
      </AppShell>

      {/* SIDEBAR_CHAT_V1 - boton flotante persistente: el agente esta siempre a
          un toque; en movil abre una hoja inferior sin abandonar la pantalla. */}
      {showChatFab && (
        <button
          type="button"
          ref={chatFabRef}
          className={`chat-fab ${chatOpen ? "open" : ""}`}
          onClick={toggleChat}
          aria-label={chatOpen ? "Cerrar chat" : "Hablar con tu agente"}
          aria-expanded={chatOpen}
        >
          {chatOpen ? <X size={18} /> : <MessageSquare size={18} />}
          <span>{chatOpen ? "Cerrar chat" : "Chat"}</span>
        </button>
      )}

      {mobileSheetOpen && (
        <MobileChatSheet
          chat={chat}
          tenantLabel={contextLabel}
          onClose={() => {
            setMobileChat(false);
            requestAnimationFrame(() => chatFabRef.current?.focus({ preventScroll: true }));
          }}
          onOpenFullChat={() => { setMobileChat(false); setView("chat"); }}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {import.meta.env.DEV && new URLSearchParams(location.search).get("sheetDebug") === "1" && (
        <MobileSheetDiagnostics />
      )}

      <SettingsMenu
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userName={auth.user?.name ?? "Usuario"}
        userEmail={auth.user?.email ?? null}
        userRole={auth.user?.role ?? "user"}
        tenantLabel={demoSession ? "Interfaz · demo" : contextLabel}
        demo={demoSession}
        onOpenProfile={() => setProfileOpen(true)}
        {...(companyArea ? { onOpenCompany: () => setCompanyOpen(true) } : {})}
        onExitDemo={() => { void auth.logout(); }}
        onLogout={() => { void auth.logout(); }}
      />

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
          appearance={Boolean(demoViews)}
          user={auth.user}
          onClose={() => setProfileOpen(false)}
          onSaved={(u) => { localStorage.setItem("agente_user", JSON.stringify(u)); }}
        />
      )}

      {reviewTaskId && (
        <ApprovalModal
          taskId={reviewTaskId}
          onClose={() => setReviewTaskId(null)}
          onChanged={tasks.refresh}
        />
      )}

      {companyOpen && companyArea?.({ onClose: () => setCompanyOpen(false) })}
    </>
  );
}
