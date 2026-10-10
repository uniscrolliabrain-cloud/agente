This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: packages/workspaces/**, apps/web/src/**, apps/server/src/engine/workspace/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      engine/
        workspace/
          generator.ts
          registry.ts
  web/
    src/
      api/
        actions.ts
        agents.ts
        auth.ts
        business.ts
        chat.ts
        client.ts
        conversation.ts
        events.ts
        files.ts
        google.ts
        index.ts
        projects.ts
        rag.ts
        search.ts
        session.ts
        tasks.ts
        threads.ts
      components/
        agents/
          floating/
            AgentDockLauncher.tsx
            LaiaFloatingWindow.tsx
          AgentActivityLog.tsx
          AgentCard.tsx
          AgentCommandBar.tsx
          AgentHero.tsx
          AgentProfile.tsx
          agents.css
          AgentsPage.tsx
          AgentSquad.tsx
          types.ts
        AgentsView.tsx
        AnimatedNumber.tsx
        ApprovalInbox.tsx
        ApprovalItem.tsx
        ApprovalModal.tsx
        AppShell.tsx
        AttachmentPreview.tsx
        BusinessSchemaEditor.tsx
        ChatInput.tsx
        ChatPanel.tsx
        CommandPalette.tsx
        ContextChips.tsx
        ContextualPanel.tsx
        ControlCenterView.tsx
        DocumentsView.tsx
        DocumentTree.tsx
        EmployeeProfileView.tsx
        KpiCard.tsx
        LiveItem.tsx
        Login.tsx
        MemoryBoard.tsx
        MemoryView.tsx
        MessageBubble.tsx
        MessageList.tsx
        MultiUpload.tsx
        NewTaskModal.tsx
        NotificationsDropdown.tsx
        Onboarding.tsx
        PermissionMatrix.tsx
        ProfileModal.tsx
        ProjectsView.tsx
        ProvenanceBadge.tsx
        RoleSelector.tsx
        SidebarV2.tsx
        Sparkline.tsx
        SuggestionChips.tsx
        TaskDetailModal.tsx
        TasksView.tsx
        TaskTimeline.tsx
        ToolCallCard.tsx
        ToolCallsGroup.tsx
        TopBarV2.tsx
        UserModal.tsx
        UsersView.tsx
      forms/
        FormPreview.tsx
        FormRenderer.tsx
        provenance.tsx
        spec.ts
      hooks/
        useAgents.ts
        useAuth.ts
        useCascade.ts
        useChat.ts
        useEvents.ts
        useHotkeys.ts
        useLiveActivity.ts
        useNotifications.ts
        useNow.ts
        usePanel.ts
        useProjects.ts
        useReducedMotion.ts
        useTasks.ts
        useThreads.ts
        useTypewriter.ts
        useViewResolver.ts
        useWorkspaceData.ts
      intent/
        IntentResolver.ts
        schema.ts
      lib/
        applyEvent.ts
        format.ts
        groupMemories.ts
        taskColumns.ts
        toolsReducer.ts
      templates/
        dashboard/
          DashboardTemplate.tsx
        detail/
          DetailTemplate.tsx
        form/
          FormTemplate.tsx
        graph/
          GraphTemplate.tsx
        kanban/
          KanbanTemplate.tsx
        list/
          ListTemplate.tsx
        queue/
          QueueTemplate.tsx
        table/
          TableTemplate.tsx
        timeline/
          TimelineTemplate.tsx
        registry.ts
      types/
        api.ts
      view/
        fallback.tsx
        resolver.ts
        spec.ts
        ViewRenderer.tsx
      App.tsx
      index.css
      main.tsx
```

# Files

## File: apps/web/src/api/auth.ts
```typescript
import { apiFetch, clearSession, setSession } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  active?: boolean;
  setup: { sopIds: string[]; allowedTools: string[]; greeting: string };
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  mode: "sample" | "live";
  user: AuthUser;
}

const USER_KEY = "openmuse_user";

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body?.error === "string" ? body.error : "Email o contrasena incorrectos",
    );
  }
  const data = (await res.json()) as LoginResponse;
  // El modo lo manda el servidor: forzarlo a "live" hacia que el badge del header mintiera
  // en un deployment sample.
  setSession({ token: data.token, mode: data.mode ?? "live" });
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

export async function logoutServer(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch {
    /* ignorar errores de logout */
  }
  clearSession();
  localStorage.removeItem(USER_KEY);
}

export async function me(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me");
}

export function cachedUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}

export async function listUsers(): Promise<AuthUser[]> {
  return apiFetch<AuthUser[]>("/api/auth/users");
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: "admin" | "user";
  setup?: Partial<AuthUser["setup"]>;
}): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/users", { method: "POST", body: input });
}

export async function updateUser(
  id: string,
  patch: Partial<{
    name: string;
    role: "admin" | "user";
    active: boolean;
    setup: Partial<AuthUser["setup"]>;
    password: string;
  }>,
): Promise<AuthUser> {
  return apiFetch<AuthUser>(`/api/auth/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
  });
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch(`/api/auth/users/${encodeURIComponent(id)}`, { method: "DELETE" });
}


export interface UserTaskSummary {
  id: string;
  title: string;
  kind: string;
  status: string;
  updatedAt: string;
  createdAt: string;
  attempts: number;
  result?: string;
  error?: string;
}

export async function userTasks(
  id: string,
  limit = 20,
): Promise<{ userId: string; total: number; tasks: UserTaskSummary[] }> {
  return apiFetch(`/api/auth/users/${encodeURIComponent(id)}/tasks?limit=${limit}`);
}
export async function updateMe(input: {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me", { method: "PATCH", body: input });
}
```

## File: apps/web/src/api/client.ts
```typescript
const AUTH_KEY = "openmuse_auth";

export interface AuthSession {
  token: string;
  mode: "sample" | "live";
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.token === "string" && (parsed.mode === "sample" || parsed.mode === "live")) {
      return parsed as AuthSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_KEY);
}

let unauthorizedHandler: (() => void) | null = null;

/** La app registra aqui como reaccionar a un 401 (cerrar sesion y volver al login). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

/**
 * Invalida la sesion local y avisa a la app. Todo 401 deberia pasar por aqui: antes solo
 * apiFetch limpiaba el token, asi que un 401 en el stream de chat o en la subida de ficheros
 * dejaba la sesion muerta en localStorage sin que la UI lo supiera.
 */
export function handleUnauthorized(): void {
  clearSession();
  unauthorizedHandler?.();
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const session = getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;

  const res = await fetch(path, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (res.status === 401) {
    // Un 401 sin Authorization no es una sesión caducada: es una llamada que se adelantó al
    // login (los hooks de arranque corren en paralelo con useAuth). Borrar el token ahí dejaba
    // la app rota hasta recargar.
    if (session?.token) handleUnauthorized();
    throw new ApiError(401, "Sesión expirada");
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    let fields: Record<string, string> | undefined;
    try {
      const body = await res.json();
      if (typeof body?.error === "string") detail = body.error;
      if (body?.fields && typeof body.fields === "object") {
        fields = body.fields as Record<string, string>;
      }
    } catch {
      /* ignore body parse errors */
    }
    throw new ApiError(res.status, detail, fields);
  }

  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}
```

## File: apps/web/src/api/conversation.ts
```typescript
import { apiFetch } from "./client";
import type { ChatMessage } from "../types/api";

interface MainThreadResponse {
  threadId: string;
  existing: boolean;
}

interface ConversationResponse {
  id: string;
  messages: unknown[];
}

export async function getOrCreateMainThread(): Promise<MainThreadResponse> {
  return apiFetch<MainThreadResponse>("/api/main-thread");
}

export async function getConversation(): Promise<{ id: string; messages: ChatMessage[] }> {
  const raw = await apiFetch<ConversationResponse>("/api/conversation");
  return { id: raw.id, messages: (raw.messages ?? []) as ChatMessage[] };
}

export async function saveConversation(messages: ChatMessage[]): Promise<void> {
  await apiFetch("/api/conversation", { method: "PUT", body: { messages } });
}
```

## File: apps/web/src/api/google.ts
```typescript
import { apiFetch } from "./client";

export interface GoogleStatus {
  connected: boolean;
  account: string | null;
  /** true cuando el deployment corre en modo sample (la conexion es simulada). */
  sample: boolean;
  /** false cuando faltan GOOGLE_CLIENT_ID/SECRET o TOKEN_ENCRYPTION_KEY en modo live. */
  configured: boolean;
}

export interface GoogleConnectResult {
  /** URL de consentimiento de Google; null si la conexion ya quedo activa (sample). */
  url: string | null;
  connected?: boolean;
}

export async function googleStatus(): Promise<GoogleStatus> {
  return apiFetch<GoogleStatus>("/api/google/status");
}

export async function connectGoogle(capability: "read" | "write"): Promise<GoogleConnectResult> {
  return apiFetch<GoogleConnectResult>("/api/google/connect", {
    method: "POST",
    body: { capability },
  });
}

export async function disconnectGoogle(): Promise<void> {
  await apiFetch("/api/google/disconnect", { method: "POST" });
}
```

## File: apps/web/src/api/session.ts
```typescript
import { clearSession, getSession, setSession } from "./client";

export interface SessionResponse {
  token: string;
  mode: "sample" | "live";
}

export async function login(accessKey: string): Promise<SessionResponse> {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessKey }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body?.error === "string" ? body.error : "Access key incorrecta");
  }
  const session = (await res.json()) as SessionResponse;
  setSession(session);
  return session;
}

export function logout(): void {
  clearSession();
}

export function currentSession(): SessionResponse | null {
  return getSession();
}
```

## File: apps/web/src/api/tasks.ts
```typescript
import { apiFetch } from "./client";
import type { AgentTask, AgentWorkspace, TaskDetail } from "../types/api";

export async function listTasks(): Promise<AgentWorkspace> {
  return apiFetch<AgentWorkspace>("/api/agent");
}

export async function getTaskDetail(id: string): Promise<TaskDetail> {
  return apiFetch<TaskDetail>(`/api/agent/tasks/${encodeURIComponent(id)}`);
}

export async function controlTask(
  id: string,
  action: "pause" | "resume" | "cancel" | "retry",
): Promise<AgentTask> {
  return apiFetch<AgentTask>(`/api/agent/tasks/${encodeURIComponent(id)}/control`, {
    method: "POST",
    body: { action },
  });
}

export async function answerTask(
  id: string,
  answer: string,
  fields?: Record<string, string | boolean>,
): Promise<AgentTask> {
  return apiFetch<AgentTask>(`/api/agent/tasks/${encodeURIComponent(id)}/input`, {
    method: "POST",
    body: { answer, ...(fields ? { fields } : {}) },
  });
}
```

## File: apps/web/src/components/Login.tsx
```typescript
import { useState } from "react";

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  error: string | null;
}

export default function Login({ onLogin, error }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password || busy) return;
    setBusy(true);
    try {
      await onLogin(email.trim(), password);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-grad">AI</div>
          <div>
            <div className="logo-title">Agente IA Pro</div>
            <div className="logo-sub">OpenMuse Workspace</div>
          </div>
        </div>

        <h1>Bienvenido de vuelta</h1>
        <p className="muted">Entra con tu cuenta de empresa.</p>

        {error && <div className="login-error">{error}</div>}

        <label>Email</label>
        <div className="input-wrap">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@empresa.com"
            autoFocus
            disabled={busy}
            autoComplete="email"
          />
        </div>

        <label>Contrasena</label>
        <div className="input-wrap">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            disabled={busy}
            autoComplete="current-password"
            onKeyDown={(e) => { if (e.key === "Enter") void submit(); }}
          />
        </div>

        <button
          className="primary-btn"
          onClick={submit}
          disabled={busy || !email.trim() || !password}
        >
          {busy ? "Entrando..." : "Entrar"}
        </button>

        <div className="login-footer">OpenMuse - v0.2.0-beta.1</div>
      </div>
    </div>
  );
}
```

## File: apps/web/src/components/ToolCallCard.tsx
```typescript
import { Check, LoaderCircle, Wrench } from "lucide-react";

export default function ToolCallCard({
  name,
  status,
  args,
}: {
  name: string;
  status: "running" | "done";
  args: unknown;
}) {
  return (
    <div className={`tool-card ${status}`}>
      <div className="tool-card-header">
        <div className="tool-card-icon">
          <Wrench size={13} />
        </div>
        <div className="tool-card-name">
          <span>{name}</span>
          <small>{status === "running" ? "Ejecutando" : "Completado"}</small>
        </div>
        <div className={`tool-card-status ${status}`}>
          {status === "running" ? <LoaderCircle size={14} className="spin" /> : <Check size={14} />}
        </div>
      </div>
      {args !== undefined && args !== null && (
        <pre>{typeof args === "string" ? args : JSON.stringify(args, null, 2)}</pre>
      )}
    </div>
  );
}
```

## File: apps/web/src/hooks/useAuth.ts
```typescript
import { useCallback, useEffect, useState } from "react";
import {
  cachedUser,
  loginWithCredentials,
  logoutServer,
  me,
  type AuthUser,
} from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";
import { currentSession } from "../api/session";

export interface AuthState {
  isAuthenticated: boolean;
  mode: "sample" | "live" | null;
  user: AuthUser | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    const session = currentSession();
    const user = cachedUser();
    return {
      isAuthenticated: Boolean(session && user),
      mode: session?.mode ?? null,
      user,
    };
  });
  const [error, setError] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const session = currentSession();
    const user = cachedUser();
    if (!session || !user) {
      setBooting(false);
      setState({ isAuthenticated: false, mode: null, user: null });
      return;
    }
    let cancelled = false;
    me()
      .then((fresh) => {
        if (cancelled) return;
        localStorage.setItem("openmuse_user", JSON.stringify(fresh));
        setState({ isAuthenticated: true, mode: session.mode, user: fresh });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ isAuthenticated: false, mode: null, user: null });
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    // Cualquier 401 (token caducado o sesion revocada) devuelve la app al login.
    setUnauthorizedHandler(() => setState({ isAuthenticated: false, mode: null, user: null }));
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const res = await loginWithCredentials(email, password);
      setState({ isAuthenticated: true, mode: res.mode, user: res.user });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutServer();
    setState({ isAuthenticated: false, mode: null, user: null });
  }, []);

  return { ...state, error, booting, login, logout };
}
```

## File: apps/web/src/hooks/useProjects.ts
```typescript
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createProject as apiCreateProject,
  deleteProject as apiDeleteProject,
  getProject,
  listProjects,
  saveProjectBlocks as apiSaveBlocks,
  updateProject as apiUpdateProject,
  type Project,
  type ProjectBlock,
  type ProjectDetail,
  type ProjectStatus,
} from "../api/projects";

export function useProjects(enabled: boolean) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const list = await listProjects();
      if (!mountedRef.current) return;
      setProjects(list);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error cargando proyectos");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  const openDetail = useCallback(async (id: string) => {
    setActiveId(id);
    try {
      const d = await getProject(id);
      if (!mountedRef.current) return;
      setDetail(d);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error cargando proyecto");
    }
  }, []);

  const closeDetail = useCallback(() => {
    setActiveId(null);
    setDetail(null);
  }, []);

  const create = useCallback(
    async (input: { name: string; clientId?: string; description?: string; tags?: string[] }) => {
      try {
        const project = await apiCreateProject(input);
        setProjects((current) => [project, ...current]);
        setActiveId(project.id);
        await openDetail(project.id);
        setError(null);
        return project;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error creando proyecto");
        return null;
      }
    },
    [openDetail],
  );

  const update = useCallback(
    async (
      id: string,
      patch: Partial<{
        name: string;
        clientId: string | null;
        description: string;
        status: ProjectStatus;
        tags: string[];
      }>,
    ) => {
      try {
        const updated = await apiUpdateProject(id, patch);
        setProjects((current) => current.map((p) => (p.id === id ? updated : p)));
        setDetail((current) => (current && current.id === id ? { ...current, ...updated } : current));
        setError(null);
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error actualizando");
        return null;
      }
    },
    [],
  );

  const saveBlocks = useCallback(async (id: string, blocks: ProjectBlock[]) => {
    try {
      const updated = await apiSaveBlocks(id, blocks);
      setProjects((current) => current.map((p) => (p.id === id ? updated : p)));
      setDetail((current) => (current && current.id === id ? { ...current, blocks: updated.blocks } : current));
      setError(null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando bloques");
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await apiDeleteProject(id);
      setProjects((current) => current.filter((p) => p.id !== id));
      setActiveId((current) => {
        if (current === id) {
          setDetail(null);
          return null;
        }
        return current;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error borrando");
    }
  }, []);

  const refreshDetail = useCallback(async () => {
    if (!activeId) return;
    await openDetail(activeId);
  }, [activeId, openDetail]);

  return {
    projects,
    activeId,
    detail,
    error,
    loading,
    refresh,
    openDetail,
    closeDetail,
    create,
    update,
    saveBlocks,
    remove,
    refreshDetail,
  };
}
```

## File: apps/web/src/hooks/useTasks.ts
```typescript
import { useCallback, useEffect, useRef, useState } from "react";
import { listTasks } from "../api/tasks";
import type { AgentTask } from "../types/api";

export function useTasks(intervalMs: number, enabled: boolean) {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [workerRunning, setWorkerRunning] = useState(false);
  const [workerLastTickAt, setWorkerLastTickAt] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const ws = await listTasks();
      setTasks(ws.tasks);
      setWorkerRunning(ws.worker.running);
      setWorkerLastTickAt(ws.worker.lastTickAt);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando tareas");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    intervalRef.current = window.setInterval(refresh, intervalMs);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [enabled, intervalMs, refresh]);

  return { tasks, workerRunning, workerLastTickAt, error, refresh };
}
```

## File: apps/web/src/hooks/useThreads.ts
```typescript
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createThread as apiCreateThread,
  deleteThread as apiDeleteThread,
  listThreads,
  renameThread as apiRenameThread,
  type Thread,
} from "../api/threads";

const ACTIVE_KEY = "openmuse_active_thread";

export function useThreads(enabled: boolean) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_KEY);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const list = await listThreads();
      if (!mountedRef.current) return;
      setThreads(list);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error cargando conversaciones");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  useEffect(() => {
    try {
      if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
      else localStorage.removeItem(ACTIVE_KEY);
    } catch {
      /* localStorage puede fallar en modo privado */
    }
  }, [activeId]);

  const createNew = useCallback(
    async (title?: string): Promise<Thread | null> => {
      try {
        const thread = await apiCreateThread(title);
        setThreads((current) => [thread, ...current]);
        setActiveId(thread.id);
        setError(null);
        return thread;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error creando conversación");
        return null;
      }
    },
    [],
  );

  const rename = useCallback(async (id: string, title: string) => {
    try {
      const updated = await apiRenameThread(id, title);
      setThreads((current) => current.map((t) => (t.id === id ? updated : t)));
      setError(null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error renombrando");
      return null;
    }
  }, []);

  const remove = useCallback(
    async (id: string) => {
      try {
        await apiDeleteThread(id);
        setThreads((current) => {
          const next = current.filter((t) => t.id !== id);
          if (id === activeId) {
            setActiveId(next.length > 0 ? next[0].id : null);
          }
          return next;
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error borrando");
      }
    },
    [activeId],
  );

  const select = useCallback((id: string | null) => {
    setActiveId(id);
  }, []);

  const touch = useCallback((id: string, updatedAt?: string) => {
    setThreads((current) => {
      const idx = current.findIndex((t) => t.id === id);
      if (idx < 0) return current;
      const item = current[idx];
      const next = [...current];
      next[idx] = { ...item, updatedAt: updatedAt ?? new Date().toISOString() };
      next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return next;
    });
  }, []);

  return {
    threads,
    activeId,
    error,
    loading,
    refresh,
    createNew,
    rename,
    remove,
    select,
    touch,
  };
}
```

## File: apps/web/src/hooks/useWorkspaceData.ts
```typescript
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export interface MemoryEntry {
  id: string;
  text: string;
  source?: string;
  createdAt?: string;
}

export interface FileEntry {
  id: string;
  name: string;
  mimeType?: string;
  size?: number;
  pageCount?: number;
  createdAt?: string;
  source?: string;
  url?: string;
}

interface AgentSnapshot {
  memories: MemoryEntry[];
}

interface WorkspaceSnapshot2 {
  files: FileEntry[];
}

export function useWorkspaceData(enabled: boolean, intervalMs = 5000) {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = async () => {
      try {
        const [agent, ws] = await Promise.all([
          apiFetch<AgentSnapshot>("/api/agent"),
          apiFetch<WorkspaceSnapshot2>("/api/workspace"),
        ]);
        if (cancelled) return;
        setMemories(agent.memories ?? []);
        setFiles(ws.files ?? []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error cargando workspace");
      }
    };

    void load();
    const i = window.setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(i);
    };
  }, [enabled, intervalMs]);

  return { memories, files, error };
}
```

## File: apps/web/src/lib/format.ts
```typescript
/** Formato compartido por el panel lateral, la vista de tareas, documentos y usuarios. */
export function formatBytes(bytes?: number): string {
  if (bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function relativeTime(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`;
  return `${Math.floor(ms / 86400000)}d`;
}
```

## File: apps/web/src/lib/taskColumns.ts
```typescript
import type { AgentTask, TaskStatus } from "../types/api";

export type TaskColumnType = "todo" | "running" | "action" | "done";

export interface TaskColumn {
  type: TaskColumnType;
  title: string;
  tasks: AgentTask[];
}

/** Orden de las columnas, fijo para que el panel y la vista grande no se desincronicen. */
const COLUMNS: { type: TaskColumnType; title: string; statuses: TaskStatus[] }[] = [
  { type: "todo", title: "Por hacer", statuses: ["queued", "scheduled", "paused"] },
  { type: "running", title: "En curso", statuses: ["running"] },
  { type: "action", title: "Necesita tu acción", statuses: ["waiting_approval", "waiting_input"] },
  { type: "done", title: "Completado", statuses: ["succeeded", "failed", "cancelled"] },
];

/**
 * Reparte las tareas en las cuatro columnas. KanbanPanel y TasksView implementaban los
 * mismos filtros y titulos por separado; cualquier cambio de estado habia que hacerlo dos
 * veces y ya se han desincronizado antes.
 */
export function groupTasks(tasks: AgentTask[]): TaskColumn[] {
  return COLUMNS.map(({ type, title, statuses }) => ({
    type,
    title,
    tasks: tasks.filter((task) => statuses.includes(task.status)),
  }));
}
```

## File: apps/web/src/main.tsx
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## File: apps/server/src/engine/workspace/generator.ts
```typescript
// WORKSPACE_GENERATOR_V1 - deriva WorkspaceSpec del BusinessSchema.

import type { Store } from "../../db.ts";
import type {
  WorkspaceSpec,
  WorkspaceSection,
} from "../../../../../packages/domain/src/workspace-spec.ts";

export class WorkspaceGenerator {
  constructor(private readonly db: Store) {}

  async generateForTenant(tenantId: string): Promise<WorkspaceSpec | null> {
    const schema = await this.db.get<{
      entities: Array<{ type: string; label: string; icon?: string }>;
    }>(tenantId, "business-schemas", "default");
    if (!schema) return null;

    const sections: WorkspaceSection[] = [];
    let order = 0;
    for (const entity of schema.entities) {
      sections.push({
        id: `board-${entity.type}`,
        label: entity.label,
        ...(entity.icon ? { icon: entity.icon } : {}),
        viewKind: "board",
        entityType: entity.type,
        order: order++,
      });
      sections.push({
        id: `table-${entity.type}`,
        label: `${entity.label} (tabla)`,
        viewKind: "table",
        entityType: entity.type,
        order: order++,
      });
    }

    return {
      id: `workspace-${tenantId}`,
      tenantId,
      title: "Workspace",
      sections,
      defaultView: "dashboard",
      createdAt: new Date().toISOString(),
    };
  }
}
```

## File: apps/server/src/engine/workspace/registry.ts
```typescript
import { z } from "zod";

// WORKSPACE_REGISTRY_V1 — mapeo declarativo rol -> vista por defecto.
// Fase 1: solo cambia la vista inicial al entrar a un rol. Las plantillas
// ricas (editor, pipeline, dashboard) son Fase 3.

export const workspaceViewSchema = z.enum([
  "chat",
  "tasks",
  "documents",
  "projects",
  "control-center",
  "memory",
  "users",
]);

export type WorkspaceView = z.infer<typeof workspaceViewSchema>;

export const workspaceTemplateSchema = z.object({
  roleId: z.string().min(1).max(100),
  defaultView: workspaceViewSchema,
  /** Etiqueta que ve el usuario en el nav cuando este rol esta activo. */
  label: z.string().min(1).max(100),
  /** Acento visual del workspace. Opcional. */
  accent: z.string().max(40).optional(),
});

export type WorkspaceTemplate = z.infer<typeof workspaceTemplateSchema>;

/** Defaults por rol. Si un rol no aparece, cae a chat. */
export const DEFAULT_WORKSPACE_TEMPLATES: readonly WorkspaceTemplate[] = [
  { roleId: "direccion", defaultView: "control-center", label: "Direccion" },
  { roleId: "comercial", defaultView: "tasks", label: "Pipeline" },
  { roleId: "atencion", defaultView: "chat", label: "Atencion" },
  { roleId: "administrativo", defaultView: "documents", label: "Documentos" },
  { roleId: "finanzas", defaultView: "control-center", label: "Finanzas" },
  { roleId: "marketing", defaultView: "tasks", label: "Campanas" },
  { roleId: "contenido", defaultView: "documents", label: "Contenido" },
  { roleId: "operaciones", defaultView: "tasks", label: "Operaciones" },
  { roleId: "compras", defaultView: "tasks", label: "Compras" },
  { roleId: "rrhh", defaultView: "tasks", label: "Personas" },
  { roleId: "legal", defaultView: "documents", label: "Legal" },
  { roleId: "compliance", defaultView: "documents", label: "Compliance" },
  { roleId: "investigacion", defaultView: "memory", label: "Investigacion" },
  { roleId: "calidad", defaultView: "tasks", label: "Calidad" },
  { roleId: "it", defaultView: "tasks", label: "Tecnologia" },
  { roleId: "producto", defaultView: "projects", label: "Producto" },
] as const;

export class WorkspaceRegistry {
  constructor(
    private readonly templates: readonly WorkspaceTemplate[] = DEFAULT_WORKSPACE_TEMPLATES,
  ) {}

  forRole(roleId: string): WorkspaceTemplate {
    const found = this.templates.find((template) => template.roleId === roleId);
    return found ?? { roleId, defaultView: "chat", label: roleId };
  }

  all(): readonly WorkspaceTemplate[] {
    return this.templates;
  }
}
```

## File: apps/web/src/api/actions.ts
```typescript
import { apiFetch } from "./client";
import type { ActionProposal, WorkspaceSnapshot } from "../types/api";

export async function getWorkspace(): Promise<WorkspaceSnapshot> {
  return apiFetch<WorkspaceSnapshot>("/api/workspace");
}

export async function decideAction(
  actionId: string,
  hash: string,
  decision: "approve" | "deny",
): Promise<ActionProposal> {
  return apiFetch<ActionProposal>(`/api/actions/${encodeURIComponent(actionId)}/decide`, {
    method: "POST",
    body: { hash, decision },
  });
}

/**
 * RECONCILE_ACTION_V1 — reconcilia una acción en outcome_unknown.
 * El operador confirma si el efecto externo se ejecutó o no.
 * Ver: docs/audits/06-aprobaciones-acciones/roadmap.md §8.
 */
export async function reconcileAction(
  actionId: string,
  outcome: "executed" | "not_executed",
  note?: string,
): Promise<ActionProposal> {
  return apiFetch<ActionProposal>(`/api/actions/${encodeURIComponent(actionId)}/reconcile`, {
    method: "POST",
    body: { outcome, ...(note ? { note } : {}) },
  });
}

/**
 * CANCEL_ACTION_V1 — cancela una acción programada (undo).
 * Ver: docs/audits/06-aprobaciones-acciones/roadmap.md §8.
 */
export async function cancelAction(actionId: string): Promise<ActionProposal> {
  return apiFetch<ActionProposal>(`/api/actions/${encodeURIComponent(actionId)}/cancel`, {
    method: "POST",
    body: {},
  });
}
```

## File: apps/web/src/api/business.ts
```typescript
import { apiFetch } from "./client";

// BUSINESS_WEB_V1 — cliente del Business Graph.

export interface Provenance {
  source: string;
  actor: string;
  updatedAt: string;
  confidence?: number;
}

export interface BusinessEntity {
  id: string;
  type: string;
  name: string;
  status?: string;
  properties: Record<string, unknown>;
  schemaVersion: string;
  provenance: Provenance;
}

export interface BusinessRelation {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: string;
  properties: Record<string, unknown>;
  provenance: Provenance;
}

export interface Neighborhood {
  entities: BusinessEntity[];
  relations: BusinessRelation[];
}

export interface WorkspaceTemplate {
  roleId: string;
  defaultView: string;
  label: string;
  accent?: string;
}

export async function listEntities(type?: string): Promise<BusinessEntity[]> {
  const q = type ? `?type=${encodeURIComponent(type)}` : "";
  const res = await apiFetch<{ entities: BusinessEntity[] }>(`/api/business/entities${q}`);
  return res.entities;
}

export async function getEntity(id: string): Promise<BusinessEntity> {
  return apiFetch<BusinessEntity>(`/api/business/entities/${encodeURIComponent(id)}`);
}

export async function getNeighborhood(id: string, depth = 1): Promise<Neighborhood> {
  return apiFetch<Neighborhood>(
    `/api/business/entities/${encodeURIComponent(id)}/neighborhood?depth=${depth}`,
  );
}

export async function createEntity(input: {
  id?: string;
  type: string;
  name: string;
  status?: string;
  properties?: Record<string, unknown>;
}): Promise<BusinessEntity> {
  return apiFetch<BusinessEntity>("/api/business/entities", { method: "POST", body: input });
}

export async function updateEntity(
  id: string,
  patch: { name?: string; status?: string; properties?: Record<string, unknown> },
): Promise<BusinessEntity> {
  return apiFetch<BusinessEntity>(`/api/business/entities/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
  });
}

export async function deleteEntity(id: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/api/business/entities/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function listWorkspaceTemplates(): Promise<WorkspaceTemplate[]> {
  const res = await apiFetch<{ templates: WorkspaceTemplate[] }>(
    "/api/business/workspace-templates",
  );
  return res.templates;
}

export async function getWorkspaceTemplate(roleId: string): Promise<WorkspaceTemplate> {
  return apiFetch<WorkspaceTemplate>(
    `/api/business/workspace-templates/${encodeURIComponent(roleId)}`,
  );
}
```

## File: apps/web/src/api/files.ts
```typescript
import { getSession, handleUnauthorized } from "./client";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  url: string;
  createdAt: string;
}

export async function uploadFile(file: File): Promise<UploadedFile> {
  const session = getSession();
  if (!session) throw new Error("No hay sesión activa");
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: form,
  });
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Sesión expirada");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body?.error === "string" ? body.error : `Error ${res.status}`);
  }
  return (await res.json()) as UploadedFile;
}

// E2_UPLOAD_PROGRESS_V1 - subida con progreso via XHR.
export function uploadFileWithProgress(
  file: File,
  onProgress: (pct: number) => void,
): Promise<UploadedFile> {
  const session = getSession();
  if (!session) return Promise.reject(new Error("No hay sesión activa"));
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/files");
    xhr.setRequestHeader("Authorization", `Bearer ${session.token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status === 401) {
        handleUnauthorized();
        reject(new Error("Sesión expirada"));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText) as UploadedFile); }
        catch { reject(new Error("Respuesta inválida")); }
        return;
      }
      let detail = `Error ${xhr.status}`;
      try {
        const body = JSON.parse(xhr.responseText);
        if (typeof body?.error === "string") detail = body.error;
      } catch { /* ignorar */ }
      reject(new Error(detail));
    };
    xhr.onerror = () => reject(new Error("Error de red"));
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}
```

## File: apps/web/src/api/index.ts
```typescript
export * from "./client";
export * from "./session";
export * from "./conversation";
export * from "./chat";
export * from "./tasks";
export * from "./actions";
export * from "./files";
export * from "./auth";
export * from "./rag";
export * from "./threads";
export * from "./projects";
// EXPORT_BUSINESS_WEB_V1
export * from "./business";
export type { ChatMessage, AgentTask, ActionProposal, TaskDetail, TaskStatus, TaskKind, TaskStep, RunEvent, AgentArtifact, AgentWorkspace, WorkspaceSnapshot } from "../types/api";
```

## File: apps/web/src/api/projects.ts
```typescript
import { apiFetch } from "./client";

export type ProjectStatus = "active" | "paused" | "completed" | "archived";

export type ProjectBlockType = "text" | "heading" | "checklist" | "timeline" | "note";

export interface ProjectBlock {
  id: string;
  type: ProjectBlockType;
  text: string;
  checked?: boolean;
  date?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId?: string;
  description: string;
  status: ProjectStatus;
  tags: string[];
  blocks: ProjectBlock[];
  linkedMemoryIds: string[];
  linkedArtifactIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemory {
  id: string;
  text: string;
  source: string;
  category?: string;
  tags?: string[];
  createdAt: string;
}

export interface ProjectArtifact {
  id: string;
  taskId: string;
  kind: "plan" | "comparison" | "finance" | "report";
  title: string;
  summary: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface ProjectDetail extends Project {
  memories: ProjectMemory[];
  artifacts: ProjectArtifact[];
}

export async function listProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/api/projects");
}

export async function createProject(input: {
  name: string;
  clientId?: string;
  description?: string;
  tags?: string[];
}): Promise<Project> {
  return apiFetch<Project>("/api/projects", { method: "POST", body: input });
}

export async function getProject(id: string): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/api/projects/${encodeURIComponent(id)}`);
}

// PROJECT_EXPECTED_V1 - updateProject acepta expectedUpdatedAt.
export async function updateProject(
  id: string,
  patch: Partial<{
    name: string;
    clientId: string | null;
    description: string;
    status: ProjectStatus;
    tags: string[];
  }>,
  expectedUpdatedAt?: string,
): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { ...patch, ...(expectedUpdatedAt ? { expectedUpdatedAt } : {}) },
  });
}

// PROJECT_BLOCKS_EXPECTED_V1 - acepta expectedUpdatedAt para CAS.
export async function saveProjectBlocks(
  id: string,
  blocks: ProjectBlock[],
  expectedUpdatedAt?: string,
): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${encodeURIComponent(id)}/blocks`, {
    method: "PUT",
    body: { blocks, ...(expectedUpdatedAt ? { expectedUpdatedAt } : {}) },
  });
}

export async function linkMemory(id: string, memoryId: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${encodeURIComponent(id)}/link-memory`, {
    method: "POST",
    body: { memoryId },
  });
}

export async function unlinkMemory(id: string, memoryId: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${encodeURIComponent(id)}/unlink-memory`, {
    method: "POST",
    body: { memoryId },
  });
}

export async function linkArtifact(id: string, artifactId: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${encodeURIComponent(id)}/link-artifact`, {
    method: "POST",
    body: { artifactId },
  });
}

export async function unlinkArtifact(id: string, artifactId: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${encodeURIComponent(id)}/unlink-artifact`, {
    method: "POST",
    body: { artifactId },
  });
}

export async function deleteProject(id: string): Promise<void> {
  await apiFetch(`/api/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
}
```

## File: apps/web/src/api/search.ts
```typescript
import { apiFetch } from "./client";

export interface SearchHit {
  kind: "task" | "memory" | "artifact" | "thread" | "project";
  id: string;
  title: string;
  excerpt: string;
  score: number;
  date: string;
}

export async function globalSearch(query: string, limit = 30): Promise<SearchHit[]> {
  const res = await apiFetch<{ hits: SearchHit[] }>(`/api/agent/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  return res.hits;
}
```

## File: apps/web/src/api/threads.ts
```typescript
import { apiFetch } from "./client";
import type { ChatMessage } from "../types/api";

export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ThreadWithMessages extends Thread {
  messages: ChatMessage[];
}

export async function listThreads(): Promise<Thread[]> {
  return apiFetch<Thread[]>("/api/threads");
}

export async function createThread(title?: string): Promise<Thread> {
  return apiFetch<Thread>("/api/threads", {
    method: "POST",
    body: title ? { title } : {},
  });
}

export async function getThread(id: string): Promise<ThreadWithMessages> {
  return apiFetch<ThreadWithMessages>(`/api/threads/${encodeURIComponent(id)}`);
}

// SAVE_THREAD_EXPECTED_V1 - acepta expectedUpdatedAt para activar el CAS del server.
export async function saveThreadMessages(
  id: string,
  messages: ChatMessage[],
  expectedUpdatedAt?: string,
): Promise<Thread> {
  return apiFetch<Thread>(`/api/threads/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: { messages, ...(expectedUpdatedAt ? { expectedUpdatedAt } : {}) },
  });
}

export async function renameThread(id: string, title: string): Promise<Thread> {
  return apiFetch<Thread>(`/api/threads/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { title },
  });
}

export async function deleteThread(id: string): Promise<void> {
  await apiFetch(`/api/threads/${encodeURIComponent(id)}`, { method: "DELETE" });
}
```

## File: apps/web/src/components/agents/floating/AgentDockLauncher.tsx
```typescript
// AGENT_DOCK_LAUNCHER_V1 - launcher inferior izquierdo cuando la ventana
// está minimizada o cerrada. Click -> reaparece al frente.

interface Props {
  agentName: string;
  role: string;
  icon: string;
  onOpen: () => void;
}

export default function AgentDockLauncher({ agentName, role, icon, onOpen }: Props) {
  return (
    <button type="button" className="agent-dock" onClick={onOpen}>
      <div className="agent-dock__avatar">{icon}</div>
      <div>
        <strong>{agentName.toUpperCase()}.exe</strong>
        <span>{role} · activa</span>
      </div>
      <span className="agent-dock__status">●</span>
    </button>
  );
}
```

## File: apps/web/src/components/agents/floating/LaiaFloatingWindow.tsx
```typescript
// LAIA_FLOATING_WINDOW_V1 - ventana flotante desacoplada por agente.
// NO es un modal. NO overlay. Se superpone al workspace.
// Draggable por el chrome con PointerEvents.
// Traffic lights: cerrar (rojo), minimizar (amarillo), maximizar (verde).
// Minimizar o cerrar -> dock inferior izquierdo (gestionado por el padre).

import { useRef, useState } from "react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { RUNTIME_LOGS, AGENTS, type AgentUI, statusColor } from "../types";

type PopupTab = "perfil" | "runtime" | "squad" | "memoria";

interface Props {
  agent: AgentUI;
  minimized: boolean;
  maximized: boolean;
  position: { x: number; y: number };
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onFocus: () => void;
}

export default function LaiaFloatingWindow({
  agent,
  minimized,
  maximized,
  position,
  onMinimize,
  onMaximize,
  onClose,
  onMove,
  onFocus,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [tab, setTab] = useState<PopupTab>("perfil");
  const [input, setInput] = useState("");

  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (maximized) return;
    dragging.current = true;
    dragStart.current = { x: event.clientX, y: event.clientY };
    startPosition.current = { ...position };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    onFocus();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    onMove({ x: startPosition.current.x + dx, y: startPosition.current.y + dy });
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  const className = [
    "laia-window",
    maximized ? "laia-window--maximized" : "",
    minimized ? "laia-window--hidden" : "",
    reducedMotion ? "laia-window--reduced-motion" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const style = maximized ? undefined : { left: position.x, top: position.y };

  const otherAgents = AGENTS.filter((a) => a.id !== "laia" && a.id !== "openmuse");

  return (
    <div className={className} style={style} onPointerDown={onFocus} role="dialog" aria-label={`Ventana de ${agent.name}`}>
      <header
        className="laia-window__chrome"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="laia-window__traffic">
          <button
            type="button"
            className="laia-window__traffic-dot laia-window__traffic-dot--red"
            onClick={onClose}
            aria-label="Cerrar"
          />
          <button
            type="button"
            className="laia-window__traffic-dot laia-window__traffic-dot--yellow"
            onClick={onMinimize}
            aria-label="Minimizar"
          />
          <button
            type="button"
            className="laia-window__traffic-dot laia-window__traffic-dot--green"
            onClick={onMaximize}
            aria-label="Maximizar"
          />
        </div>

        <div className="laia-window__title">
          <span>{agent.name.toUpperCase()}.exe</span>
          <small>â€” {agent.role}</small>
        </div>

        <div className="laia-window__lvl">LVL {agent.level}</div>
      </header>

      <div className="laia-window__identity">
        <div
          className="laia-window__avatar"
          style={{ background: "linear-gradient(135deg,#7C5CFC,#E34BAE)" }}
        >
          {agent.icon}
        </div>
        <div>
          <div className="laia-window__name">
            {agent.name.toUpperCase()}
            <span>{agent.role.toUpperCase()}</span>
          </div>
          <p>{agent.description}</p>
        </div>
      </div>

      <div className="laia-window__stats">
        <div>
          <span>RUNTIME</span>
          <strong>99.98%</strong>
          <div className="laia-window__bar">
            <i style={{ width: "99.98%" }} />
          </div>
        </div>
        <div>
          <span>HP</span>
          <strong>{agent.hp}%</strong>
          <div className="laia-window__bar laia-window__bar--green">
            <i style={{ width: `${agent.hp}%` }} />
          </div>
        </div>
        <div>
          <span>QUEUE</span>
          <strong>12 tareas</strong>
          <small>0 bloqueos</small>
        </div>
      </div>

      <nav className="laia-window__tabs">
        {(
          [
            ["perfil", "Perfil"],
            ["runtime", "Runtime"],
            ["squad", "Squad"],
            ["memoria", "Memoria"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? "is-active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="laia-window__content">
        {tab === "perfil" && (
          <div className="laia-panel">
            <span className="laia-panel__label">PERSONALIDAD</span>
            <p>
              Cercana, resolutiva, guardiana. Habla claro, sin humo. Si algo falla, lo arreglo antes
              de que lo notes.
            </p>
            <div className="laia-panel__chips">
              {agent.capabilities.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <div className="laia-panel__divider" />
            <span className="laia-panel__label">OBJETIVO</span>
            <p>Que todo funcione y tÃº no tengas que vigilarlo.</p>
          </div>
        )}

        {tab === "runtime" && (
          <div className="laia-runtime">
            {RUNTIME_LOGS.map((log, i) => (
              <div className="laia-runtime__row" key={i}>
                <span>{log.time}</span>
                <i className={`laia-runtime__dot laia-runtime__dot--${log.type}`} />
                <p>{log.message}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "squad" && (
          <div className="laia-squad">
            {otherAgents.map((a) => (
              <div className="laia-squad__member" key={a.id}>
                <div className="laia-squad__avatar" style={{ background: a.color }}>
                  {a.icon}
                </div>
                <div>
                  <strong>{a.name}</strong>
                  <span>{a.role}</span>
                </div>
                <i style={{ background: statusColor(a.status) }} />
              </div>
            ))}
          </div>
        )}

        {tab === "memoria" && (
          <div className="laia-panel">
            <span className="laia-panel__label">MEMORIA OPERATIVA</span>
            <div className="laia-memory">
              <div>
                <strong>12</strong>
                <span>embeddings activos</span>
              </div>
              <div>
                <strong>47</strong>
                <span>memorias de negocio</span>
              </div>
              <div>
                <strong>99.4%</strong>
                <span>sincronizaciÃ³n</span>
              </div>
            </div>
            <p>
              Laia utiliza memoria de identidad, dominio, preferencias e historial.
            </p>
          </div>
        )}
      </main>

      <footer className="laia-window__chat">
        <div className="laia-window__chat-label">
          <span />
          {agent.name} estÃ¡ activa
        </div>
        <div className="laia-window__chat-row">
          {/* LAIA_WINDOW_CHAT_V1 - envia al chat global con personaId. */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                // Notifica al padre para enviar al chat global.
                window.dispatchEvent(new CustomEvent("openmuse:chat", {
                  detail: { message: input.trim(), personaId: agent.id },
                }));
                setInput("");
              }
            }}
            placeholder={`Habla con ${agent.name}...`}
          />
          <button type="button" onClick={() => {
            if (input.trim()) {
              window.dispatchEvent(new CustomEvent("openmuse:chat", {
                detail: { message: input.trim(), personaId: agent.id },
              }));
              setInput("");
            }
          }}>
            â†’
          </button>
        </div>
      </footer>
    </div>
  );
}
```

## File: apps/web/src/components/agents/AgentActivityLog.tsx
```typescript
// AGENT_ACTIVITY_LOG_V1 - activity log del squad.
import { Activity, AlertTriangle } from "lucide-react";
import { RUNTIME_LOGS } from "./types";
import type { CSSProperties } from "react";

export default function AgentActivityLog() {
  return (
    <section className="agent-activity">
      <div className="agent-section-heading">
        <div>
          <span className="agent-section-heading__eyebrow">ACTIVITY LOG</span>
          <h2>Actividad del squad</h2>
        </div>
        <span className="agent-live">
          <i />
          LIVE
        </span>
      </div>

      <div className="agent-activity__list">
        {RUNTIME_LOGS.map((log, index) => (
          <div
            key={`${log.time}-${index}`}
            className="agent-activity__row"
            style={{ "--agent-delay": `${index * 50}ms` } as CSSProperties}
          >
            <div className={`agent-activity__indicator agent-activity__indicator--${log.type}`}>
              {log.type === "warn" ? <AlertTriangle size={13} /> : <Activity size={13} />}
            </div>
            <span className="agent-activity__time">{log.time}</span>
            <span className="agent-activity__message">{log.message}</span>
            <span className={`agent-activity__state agent-activity__state--${log.type}`}>
              {log.type === "warn" ? "WARNING" : log.type === "error" ? "FAILED" : "SUCCESS"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

## File: apps/web/src/components/agents/AgentCard.tsx
```typescript
// AGENT_CARD_V1 - card individual del squad.
import { ChevronRight } from "lucide-react";
import { type AgentUI, statusLabel, statusColor } from "./types";
import type { CSSProperties } from "react";

interface Props {
  agent: AgentUI;
  selected: boolean;
  onClick: () => void;
  index: number;
}

export default function AgentCard({ agent, selected, onClick, index }: Props) {
  const style = {
    "--agent-color": agent.color,
    "--agent-accent": agent.accent,
    "--agent-delay": `${index * 65}ms`,
  } as CSSProperties;

  const avatarBg =
    agent.id === "laia"
      ? "linear-gradient(135deg,#7C5CFC,#E34BAE)"
      : agent.color;

  return (
    <button
      type="button"
      className={`agent-card ${selected ? "agent-card--selected" : ""}`}
      style={style}
      onClick={onClick}
    >
      <div className="agent-card__top">
        <div className="agent-card__avatar" style={{ background: avatarBg }}>
          {agent.icon}
        </div>
        <div className="agent-card__rarity">{agent.rarity}</div>
        <div className="agent-card__level">LVL {agent.level}</div>
      </div>

      <div className="agent-card__body">
        <div className="agent-card__name">{agent.name}</div>
        <div className="agent-card__role">{agent.role}</div>

        <div className="agent-card__hp">
          <span>HP</span>
          <strong>{agent.hp}%</strong>
          <div className="agent-card__hp-track">
            <span style={{ width: `${agent.hp}%`, background: agent.color }} />
          </div>
        </div>
      </div>

      <div className="agent-card__footer">
        <span className={`agent-status agent-status--${agent.status}`}>
          <i style={{ background: statusColor(agent.status) }} />
          {statusLabel(agent.status)}
        </span>
        <ChevronRight size={15} />
      </div>
    </button>
  );
}
```

## File: apps/web/src/components/agents/AgentCommandBar.tsx
```typescript
// AGENT_COMMAND_BAR_V1 - barra de comandos directos /invoke.
import { useState } from "react";
import { Bot, MessageSquare } from "lucide-react";

interface Props {
  onOpenLaia: () => void;
}

export default function AgentCommandBar({ onOpenLaia }: Props) {
  const [value, setValue] = useState("");

  const submit = () => {
    const lower = value.toLowerCase();
    if (lower.includes("laia")) onOpenLaia();
    setValue("");
  };

  return (
    <section className="agent-command">
      <div className="agent-command__header">
        <span>
          <MessageSquare size={14} />
          COMANDOS DIRECTOS
        </span>
        <code>/invoke</code>
      </div>

      <div className="agent-command__system">
        <span className="agent-command__system-icon">
          <Bot size={14} />
        </span>
        <div>
          <strong>sistema</strong>
          <p>Squad operativo. Escribe "llama a Laia" para traerla al frente.</p>
        </div>
      </div>

      <div className="agent-command__input">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder='llama al agente de ventas para...'
        />
        <button type="button" onClick={submit}>
          →
        </button>
      </div>
    </section>
  );
}
```

## File: apps/web/src/components/agents/AgentHero.tsx
```typescript
// AGENT_HERO_V1 - hero grande del agente seleccionado.
import { Activity, MessageSquare, Settings } from "lucide-react";
import { type AgentUI } from "./types";
import type { CSSProperties } from "react";

interface Props {
  agent: AgentUI;
  onOpen: () => void;
}

export default function AgentHero({ agent, onOpen }: Props) {
  const style = {
    "--hero-color": agent.color,
    "--hero-accent": agent.accent,
  } as CSSProperties;

  return (
    <section id="agent-hero" className="agents-hero" style={style}>
      <div className="agents-hero__glow" />

      <div className="agents-hero__header">
        <div className="agents-hero__eyebrow">
          <span className="agents-hero__live-dot" />
          AGENTE ACTIVO
        </div>
        <div className="agents-hero__level">LVL {agent.level}</div>
      </div>

      <div className="agents-hero__main">
        <div className="agents-hero__portrait">
          <span>{agent.icon}</span>
          <div className="agents-hero__portrait-status" />
        </div>

        <div className="agents-hero__identity">
          <div className="agents-hero__name-row">
            <h1>{agent.name}</h1>
            <span className="agents-hero__badge">{agent.rarity}</span>
          </div>
          <div className="agents-hero__role">{agent.role}</div>
          <p>{agent.description}</p>
          <div className="agents-hero__chips">
            {agent.capabilities.slice(0, 4).map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="agents-hero__stats">
        <div>
          <span>TAREAS</span>
          <strong>{agent.id === "laia" ? "1,248" : "892"}</strong>
        </div>
        <div>
          <span>PRECISIÓN</span>
          <strong>{agent.id === "laia" ? "99.8%" : "96.4%"}</strong>
        </div>
        <div>
          <span>TIEMPO MEDIO</span>
          <strong>{agent.id === "laia" ? "8s" : "12s"}</strong>
        </div>
        <div>
          <span>UPTIME</span>
          <strong>99.9%</strong>
        </div>
      </div>

      <div className="agents-hero__actions">
        <button type="button" className="agents-button agents-button--primary" onClick={onOpen}>
          <MessageSquare size={16} />
          Hablar con {agent.name}
        </button>
        <button type="button" className="agents-button">
          <Activity size={16} />
          Ver logs
        </button>
        <button type="button" className="agents-button">
          <Settings size={16} />
          Configurar
        </button>
      </div>
    </section>
  );
}
```

## File: apps/web/src/components/agents/AgentProfile.tsx
```typescript
// AGENT_PROFILE_V1 - panel de perfil debajo del hero.
import { Bot, Cpu, Sparkles, Users } from "lucide-react";
import { AGENTS, type AgentUI } from "./types";

interface Props {
  agent: AgentUI;
}

export default function AgentProfile({ agent }: Props) {
  const reportsToName = agent.reportsTo
    ? AGENTS.find((a) => a.id === agent.reportsTo)?.name
    : "Sistema principal";

  return (
    <section className="agent-profile">
      <div className="agent-profile__heading">
        <div>
          <span className="agent-profile__eyebrow">LO QUE SABE DE TU NEGOCIO</span>
          <h2>Conoce a {agent.name}</h2>
        </div>
        <Sparkles size={20} />
      </div>

      <div className="agent-profile__grid">
        <article>
          <div className="agent-profile__icon">
            <Bot size={18} />
          </div>
          <span>PERSONALIDAD</span>
          <p>{agent.personality.join(" · ")}</p>
        </article>

        <article>
          <div className="agent-profile__icon">
            <Cpu size={18} />
          </div>
          <span>CAPACIDADES</span>
          <p>{agent.capabilities.join(" · ")}</p>
        </article>

        <article>
          <div className="agent-profile__icon">
            <Users size={18} />
          </div>
          <span>REPORTA A</span>
          <p>{reportsToName ?? "Sistema principal"}</p>
        </article>
      </div>
    </section>
  );
}
```

## File: apps/web/src/components/agents/agents.css
```css
/* AGENTS_CSS_V1 - estilos del frente Agentes (workspace + ventana flotante).
   Prefijos: agents-, agent-card-, agent-activity-, agent-command-,
             laia-window-, laia-panel-, laia-runtime-, laia-squad-,
             laia-memory-, agent-dock-.
   No choca con --v2-* ni --v3-* existentes.
*/

/* =========================================================
   PAGE
========================================================= */

.agents-page {
  min-height: 100%;
  background:
    radial-gradient(circle at 70% 0%, rgba(124, 92, 252, 0.055), transparent 35%),
    #fafafa;
  color: #171717;
}

.agents-page__inner {
  width: min(100% - 48px, 1120px);
  margin: 0 auto;
  padding: 42px 0 90px;
}

.agents-page__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 30px;
  margin-bottom: 28px;
}

.agents-page__eyebrow,
.agent-profile__eyebrow,
.agent-section-heading__eyebrow {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
  color: #8a8a8a;
  text-transform: uppercase;
}

.agents-page h1 {
  margin: 5px 0 4px;
  font-size: 36px;
  line-height: 1;
  letter-spacing: -0.04em;
}

.agents-page__top p {
  margin: 0;
  color: #8a8a8a;
  font-size: 14px;
}

.agents-page__actions {
  display: flex;
  gap: 8px;
}

/* =========================================================
   BUTTONS
========================================================= */

.agents-button {
  height: 42px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e7e7e3;
  border-radius: 11px;
  background: white;
  color: #171717;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.agents-button:hover {
  transform: translateY(-1px);
  border-color: #d5d5d0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
}

.agents-button--dark {
  background: #111;
  border-color: #111;
  color: white;
}

.agents-button--primary {
  background: #7c5cfc;
  border-color: #7c5cfc;
  color: white;
  box-shadow: 0 10px 28px rgba(124, 92, 252, 0.22);
}

/* =========================================================
   HERO
========================================================= */

.agents-hero {
  position: relative;
  overflow: hidden;
  padding: 27px;
  border: 1px solid #ddd9ff;
  border-radius: 24px;
  background:
    radial-gradient(circle at 80% 15%, var(--hero-accent, #EDE8FF), transparent 40%),
    white;
  box-shadow: 0 24px 70px rgba(124, 92, 252, 0.09);
  animation: agentsHeroIn 500ms ease both;
}

.agents-hero__glow {
  position: absolute;
  width: 280px;
  height: 280px;
  right: -120px;
  top: -120px;
  border-radius: 50%;
  background: var(--hero-color, #7C5CFC);
  filter: blur(100px);
  opacity: 0.12;
  pointer-events: none;
}

.agents-hero__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.agents-hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.agents-hero__live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.09);
}

.agents-hero__level {
  padding: 5px 9px;
  border-radius: 7px;
  background: #f1efff;
  color: #7355e8;
  font-size: 10px;
  font-weight: 800;
}

.agents-hero__main {
  display: flex;
  gap: 25px;
  align-items: center;
  padding: 34px 0 27px;
}

.agents-hero__portrait {
  position: relative;
  width: 116px;
  height: 116px;
  flex: 0 0 116px;
  display: grid;
  place-items: center;
  border-radius: 28px;
  background: linear-gradient(135deg, #7c5cfc, #df4fb1);
  color: white;
  font-size: 43px;
  font-weight: 700;
  box-shadow: 0 18px 40px rgba(124, 92, 252, 0.25);
}

.agents-hero__portrait-status {
  position: absolute;
  width: 13px;
  height: 13px;
  right: 7px;
  bottom: 7px;
  border: 3px solid white;
  border-radius: 50%;
  background: #10b981;
}

.agents-hero__identity {
  min-width: 0;
}

.agents-hero__name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.agents-hero__name-row h1 {
  margin: 0;
  font-size: 34px;
  letter-spacing: -0.045em;
}

.agents-hero__badge {
  padding: 5px 8px;
  border-radius: 6px;
  background: #eee9ff;
  color: #7455ed;
  font-size: 9px;
  font-weight: 900;
}

.agents-hero__role {
  margin-top: 3px;
  color: #6d6d6d;
  font-size: 14px;
  font-weight: 600;
}

.agents-hero__identity p {
  max-width: 670px;
  margin: 12px 0 14px;
  color: #555;
  font-size: 13px;
  line-height: 1.6;
}

.agents-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.agents-hero__chips span {
  padding: 5px 8px;
  border: 1px solid #ecebea;
  border-radius: 7px;
  background: #fafafa;
  color: #777;
  font-size: 10px;
}

.agents-hero__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.agents-hero__stats > div {
  padding: 14px;
  border: 1px solid #ecebea;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.75);
}

.agents-hero__stats span {
  display: block;
  margin-bottom: 5px;
  color: #a0a0a0;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.agents-hero__stats strong {
  font-size: 15px;
}

.agents-hero__actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

/* =========================================================
   PROFILE
========================================================= */

.agent-profile {
  margin-top: 14px;
  padding: 25px;
  border: 1px solid #e7e7e3;
  border-radius: 20px;
  background: white;
  animation: agentsCascade 500ms 120ms both;
}

.agent-profile__heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
}

.agent-profile__heading h2 {
  margin: 5px 0 0;
  font-size: 20px;
  letter-spacing: -0.025em;
}

.agent-profile__heading svg {
  color: #7c5cfc;
}

.agent-profile__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
}

.agent-profile__grid article {
  padding: 16px;
  border: 1px solid #ecebe8;
  border-radius: 14px;
  background: #fcfcfb;
}

.agent-profile__icon {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  margin-bottom: 12px;
  border-radius: 8px;
  background: #f0edff;
  color: #7455ed;
}

.agent-profile__grid article > span {
  font-size: 9px;
  font-weight: 800;
  color: #a0a0a0;
  letter-spacing: 0.08em;
}

.agent-profile__grid p {
  margin: 7px 0 0;
  color: #444;
  font-size: 12px;
  line-height: 1.55;
}

/* =========================================================
   SQUAD
========================================================= */

.agent-squad,
.agent-activity {
  margin-top: 40px;
}

.agent-section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 15px;
}

.agent-section-heading h2 {
  margin: 5px 0 0;
  font-size: 21px;
  letter-spacing: -0.03em;
}

.agent-section-count {
  padding: 5px 9px;
  border: 1px solid #e8e8e5;
  border-radius: 8px;
  color: #777;
  font-size: 9px;
  font-weight: 800;
}

.agent-filters {
  display: flex;
  gap: 5px;
  margin-bottom: 13px;
}

.agent-filters button {
  padding: 7px 12px;
  border: 1px solid #e9e9e6;
  border-radius: 999px;
  background: white;
  color: #777;
  font-size: 10px;
  cursor: pointer;
}

.agent-filters button.is-active {
  background: #111;
  border-color: #111;
  color: white;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

/* =========================================================
   CARD
========================================================= */

.agent-card {
  position: relative;
  min-height: 176px;
  padding: 17px;
  border: 1px solid #e6e6e2;
  border-radius: 17px;
  background: white;
  text-align: left;
  cursor: pointer;
  animation: agentCardIn 550ms var(--agent-delay, 0ms) both;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.agent-card:hover {
  transform: translateY(-3px);
  border-color: #c9c1f5;
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.07);
}

.agent-card--selected {
  border: 2px solid var(--agent-color, #7C5CFC);
  box-shadow: 0 12px 35px rgba(124, 92, 252, 0.14);
}

.agent-card__top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.agent-card__avatar {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  color: white;
  font-size: 16px;
  font-weight: 800;
}

.agent-card__rarity {
  padding: 4px 6px;
  border-radius: 5px;
  background: #f2f0eb;
  color: #8d8b86;
  font-size: 8px;
  font-weight: 900;
}

.agent-card__level {
  margin-left: auto;
  color: #999;
  font-size: 9px;
  font-weight: 700;
}

.agent-card__name {
  margin-top: 17px;
  color: #171717;
  font-size: 14px;
  font-weight: 800;
}

.agent-card__role {
  margin-top: 2px;
  color: #888;
  font-size: 10px;
}

.agent-card__hp {
  position: relative;
  margin-top: 17px;
}

.agent-card__hp > span {
  color: #999;
  font-size: 8px;
  font-weight: 800;
}

.agent-card__hp strong {
  float: right;
  font-size: 9px;
}

.agent-card__hp-track {
  clear: both;
  height: 4px;
  margin-top: 6px;
  overflow: hidden;
  border-radius: 99px;
  background: #eee;
}

.agent-card__hp-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.agent-card__footer {
  position: absolute;
  left: 17px;
  right: 17px;
  bottom: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
}

.agent-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.agent-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.agent-card--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #aaa;
  border-style: dashed;
  background: transparent;
}

.agent-card--empty strong {
  margin-top: 10px;
  color: #777;
  font-size: 12px;
}

.agent-card--empty span {
  margin-top: 3px;
  color: #aaa;
  font-size: 10px;
}

/* =========================================================
   ACTIVITY
========================================================= */

.agent-activity__list {
  overflow: hidden;
  border: 1px solid #e6e6e2;
  border-radius: 16px;
  background: white;
}

.agent-activity__row {
  min-height: 52px;
  display: grid;
  grid-template-columns: 28px 55px 1fr 70px;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #efefed;
  animation: agentCardIn 450ms var(--agent-delay, 0ms) both;
}

.agent-activity__row:last-child {
  border-bottom: 0;
}

.agent-activity__indicator {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
}

.agent-activity__indicator--ok {
  background: #e8faf3;
  color: #10a77b;
}

.agent-activity__indicator--warn {
  background: #fff7dd;
  color: #d99c00;
}

.agent-activity__time {
  color: #aaa;
  font-size: 10px;
}

.agent-activity__message {
  color: #555;
  font-size: 11px;
}

.agent-activity__state {
  justify-self: end;
  padding: 4px 6px;
  border-radius: 5px;
  font-size: 7px;
  font-weight: 900;
}

.agent-activity__state--ok {
  background: #e9faf3;
  color: #0c9b72;
}

.agent-activity__state--warn {
  background: #fff5d9;
  color: #b98000;
}

.agent-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #e9faf3;
  color: #0c9b72;
  font-size: 9px;
  font-weight: 800;
}

.agent-live i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: agentPulse 1.6s ease-in-out infinite;
}

/* =========================================================
   COMMAND BAR
========================================================= */

.agent-command {
  margin-top: 24px;
  overflow: hidden;
  border-radius: 16px;
  background: #111;
  color: white;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12);
}

.agent-command__header {
  display: flex;
  justify-content: space-between;
  padding: 13px 16px;
  border-bottom: 1px solid #2b2b2b;
  font-size: 10px;
  font-weight: 800;
}

.agent-command__header span {
  display: flex;
  gap: 7px;
  align-items: center;
}

.agent-command__header svg {
  color: #8a6cff;
}

.agent-command__header code {
  color: #777;
}

.agent-command__system {
  display: flex;
  gap: 9px;
  margin: 13px;
  padding: 10px;
  border: 1px solid #2b2b2b;
  border-radius: 10px;
  background: #171717;
}

.agent-command__system-icon {
  width: 23px;
  height: 23px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #272727;
  color: #aaa;
}

.agent-command__system strong {
  display: block;
  color: #777;
  font-size: 8px;
  text-transform: uppercase;
}

.agent-command__system p {
  margin: 2px 0 0;
  color: #aaa;
  font-family: monospace;
  font-size: 9px;
}

.agent-command__input {
  display: flex;
  gap: 7px;
  padding: 0 13px 13px;
}

.agent-command__input input {
  flex: 1;
  height: 39px;
  padding: 0 12px;
  border: 1px solid #2b2b2b;
  border-radius: 9px;
  outline: none;
  background: #171717;
  color: white;
}

.agent-command__input button {
  width: 42px;
  border: 0;
  border-radius: 9px;
  background: white;
  color: #111;
  cursor: pointer;
}

/* =========================================================
   ANIMATIONS
========================================================= */

@keyframes agentsHeroIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes agentsCascade {
  from { opacity: 0; transform: translateY(9px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes agentCardIn {
  from { opacity: 0; transform: translateY(12px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes agentPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {
  .agents-hero,
  .agent-profile,
  .agent-card,
  .agent-activity__row,
  .agent-live i {
    animation: none !important;
    transition: none !important;
  }
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {
  .agents-page__top {
    align-items: flex-start;
    flex-direction: column;
  }
  .agent-grid { grid-template-columns: repeat(2, 1fr); }
  .agent-profile__grid { grid-template-columns: 1fr; }
}

@media (max-width: 650px) {
  .agents-page__inner { width: min(100% - 24px, 1120px); padding-top: 24px; }
  .agents-hero__main { flex-direction: column; align-items: flex-start; }
  .agents-hero__stats { grid-template-columns: repeat(2, 1fr); }
  .agent-grid { grid-template-columns: 1fr; }
}
```

## File: apps/web/src/components/agents/AgentsPage.tsx
```typescript
// AGENTS_PAGE_V1 - entry point del frente Agentes.
// Compone: hero + perfil + squad + activity log + command bar.
// Y abre la ventana flotante cuando se selecciona Laia.
//
// Desde el chat del homepage se puede invocar "llama a Laia" para traer la
// ventana. Eso se conectarÃƒÂ¡ al useChat en una fase posterior. Por ahora el
// input del command bar ya lo detecta.

// AGENTS_PAGE_FETCH_V1 - lee personas reales del backend.
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api/client";
import { toAgentUI, type AgentUI } from "./types";
import { Plus, Search } from "lucide-react";
import { AGENTS, type AgentId } from "./types";
import AgentHero from "./AgentHero";
import AgentProfile from "./AgentProfile";
import AgentSquad from "./AgentSquad";
import AgentActivityLog from "./AgentActivityLog";
import AgentCommandBar from "./AgentCommandBar";
import LaiaFloatingWindow from "./floating/LaiaFloatingWindow";
import AgentDockLauncher from "./floating/AgentDockLauncher";

export default function AgentsPage() {
  const [selected, setSelected] = useState<AgentId>("laia");
  // AGENTS_PAGE_FETCH_V1 - estado de personas reales.
  const [remoteAgents, setRemoteAgents] = useState<AgentUI[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch<{ personas: Array<{ personaId: string; displayName: string; role: string; archetype: string; stats: unknown; avatar: unknown; reportsTo: string | null; peers: string[] }> }>("/api/agent-personas");
        if (cancelled) return;
        const mapped = res.personas.map((p) => toAgentUI(
          {
            id: p.personaId,
            displayName: p.displayName,
            role: p.role,
            personality: { traits: [], tone: p.archetype, quirks: [] },
            capabilities: { domains: [], scope: "" },
            ...(p.reportsTo ? { reportsTo: p.reportsTo } : {}),
          },
          p.stats as never,
          "#7C5CFC",
          "#EDE8FF",
        ));
        setRemoteAgents(mapped);
      } catch (err) {
        if (cancelled) return;
        setFetchError(err instanceof Error ? err.message : "Error cargando agentes");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const realAgents = remoteAgents ?? AGENTS;

  const [windowOpen, setWindowOpen] = useState(true);
  const [windowMinimized, setWindowMinimized] = useState(false);
  const [windowMaximized, setWindowMaximized] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 22, y: 180 });
  const [zIndex, setZIndex] = useState(100);

  // AGENTS_PAGE_USE_REAL_V1 - usa realAgents en vez de AGENTS mock.
  const selectedAgent = useMemo(
    () => realAgents.find((a) => a.id === selected) ?? realAgents[1] ?? AGENTS[1],
    [selected, realAgents],
  );

  const laia = useMemo(
    () => realAgents.find((a) => a.id === "laia") ?? AGENTS.find((a) => a.id === "laia")!,
    [realAgents],
  );

  const openLaia = useCallback(() => {
    setSelected("laia");
    setWindowOpen(true);
    setWindowMinimized(false);
    setWindowMaximized(false);
    setWindowPosition({ x: 24, y: 120 });
    setZIndex((v) => v + 1);
  }, []);

  const openAgent = useCallback(
    (id: AgentId) => {
      setSelected(id);
      if (id === "laia") {
        setWindowOpen(true);
        setWindowMinimized(false);
        setWindowMaximized(false);
        setWindowPosition({ x: 24, y: 120 });
        setZIndex((v) => v + 1);
      }
    },
    [],
  );

  const closeWindow = () => {
    setWindowOpen(false);
    setWindowMinimized(false);
  };

  const minimizeWindow = () => {
    setWindowMinimized(true);
  };

  const maximizeWindow = () => {
    setWindowMaximized((v) => !v);
  };

  const showDock = !windowOpen || windowMinimized;

  return (
    <div className="agents-page">
      <div className="agents-page__inner">
        <div className="agents-page__top">
          <div>
            <span className="agents-page__eyebrow">WORKSPACE Ã‚Â· AGENTES</span>
            <h1>Agentes</h1>
            <p>
              Tu equipo de IA operativo. Activo 24/7 Ã¢â‚¬â€ orquesta tareas, memoria y ejecuciÃƒÂ³n.
            </p>
          </div>

          <div className="agents-page__actions">
            <button type="button" className="agents-button">
              <Search size={16} />
              Buscar
            </button>
            <button type="button" className="agents-button agents-button--dark">
              <Plus size={16} />
              Crear nuevo agente
            </button>
          </div>
        </div>

        <AgentHero
          agent={selectedAgent}
          onOpen={() => {
            if (selected === "laia") openLaia();
          }}
        />

        <AgentProfile agent={selectedAgent} />

        <AgentSquad selected={selected} onSelect={openAgent} />

        <AgentActivityLog />

        <AgentCommandBar onOpenLaia={openLaia} />
      </div>

      {windowOpen && !windowMinimized && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex,
          }}
        >
          <div style={{ pointerEvents: "auto" }}>
            <LaiaFloatingWindow
              agent={laia}
              minimized={windowMinimized}
              maximized={windowMaximized}
              position={windowPosition}
              onMinimize={minimizeWindow}
              onMaximize={maximizeWindow}
              onClose={closeWindow}
              onMove={setWindowPosition}
              onFocus={() => setZIndex((v) => v + 1)}
            />
          </div>
        </div>
      )}

      {showDock && (
        <AgentDockLauncher
          agentName={laia.name}
          role={laia.role}
          icon={laia.icon}
          onOpen={openLaia}
        />
      )}
    </div>
  );
}
```

## File: apps/web/src/components/agents/AgentSquad.tsx
```typescript
// AGENT_SQUAD_V1 - grid del squad activo con filtros.
// AGENT_SQUAD_FILTER_V1 - filtro por arquetipo.
import { useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import AgentCard from "./AgentCard";
import { AGENTS, type AgentId, type AgentArchetype } from "./types";

interface Props {
  selected: AgentId;
  onSelect: (id: AgentId) => void;
}

const FILTERS: Array<{ id: "all" | AgentArchetype; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "hunter", label: "Cazador" },
  { id: "guardian", label: "GuardiÃ¡n" },
  { id: "strategist", label: "Estratega" },
  { id: "architect", label: "Arquitecto" },
];

export default function AgentSquad({ selected, onSelect }: Props) {
  const [filter, setFilter] = useState<"all" | AgentArchetype>("all");
  const withoutPrincipal = useMemo(() => {
    const base = AGENTS.filter((a) => a.id !== "openmuse");
    return filter === "all" ? base : base.filter((a) => a.archetype === filter);
  }, [filter]);

  return (
    <section className="agent-squad">
      <div className="agent-section-heading">
        <div>
          <span className="agent-section-heading__eyebrow">SQUAD ACTIVO</span>
          <h2>Equipo operativo</h2>
        </div>
        <span className="agent-section-count">{withoutPrincipal.length}/6 AGENTES</span>
      </div>

      <div className="agent-filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={f.id === filter ? "is-active" : ""}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="agent-grid">
        {withoutPrincipal.map((agent, index) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            index={index}
            selected={selected === agent.id}
            onClick={() => onSelect(agent.id)}
          />
        ))}

        <button className="agent-card agent-card--empty" type="button">
          <Plus size={22} />
          <strong>Invocar agente</strong>
          <span>Slot libre</span>
        </button>

        <button className="agent-card agent-card--empty" type="button">
          <Sparkles size={22} />
          <strong>Crear agente</strong>
          <span>Nuevo rol</span>
        </button>
      </div>
    </section>
  );
}
```

## File: apps/web/src/components/agents/types.ts
```typescript
// AGENTS_TYPES_V1 - tipos del frente Agentes + mock data.
//
// Este archivo NO toca el backend. Solo define:
//   - AgentUI: la forma que consume el frontend.
//   - Mock data de los 7 agentes (OpenMuse + 6 del squad).
//   - Helpers de color/label por status y arquetipo.
//   - Adaptador toAgentUI(persona, stats) listo para conectar al backend
//     en una fase posterior.

export type AgentId = "openmuse" | "laia" | "lorenzo" | "juan" | "manu" | "marta" | "ana";

export type AgentArchetype =
  | "orchestrator"
  | "hunter"
  | "guardian"
  | "strategist"
  | "architect"
  | "assistant";

export type AgentStatus = "online" | "idle" | "working" | "standby" | "offline";

export type AgentRarity = "ÉPICO" | "RARO" | "COMÚN";

export interface AgentUI {
  id: AgentId;
  name: string;
  role: string;
  archetype: AgentArchetype;
  rarity: AgentRarity;
  level: number;
  status: AgentStatus;
  hp: number; // 0-100
  color: string;
  accent: string;
  icon: string;
  description: string;
  personality: string[];
  capabilities: string[];
  reportsTo?: AgentId;
  currentTask?: string;
}

export interface RuntimeLog {
  time: string;
  message: string;
  type: "ok" | "warn" | "info" | "error";
}

// ---------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------

export const AGENTS: AgentUI[] = [
  {
    id: "openmuse",
    name: "OpenMuse",
    role: "Agente principal",
    archetype: "orchestrator",
    rarity: "ÉPICO",
    level: 9,
    status: "online",
    hp: 100,
    color: "#7C5CFC",
    accent: "#EDE8FF",
    icon: "O",
    description:
      "Orquestador central. Coordina tareas, agentes, memoria y ejecución.",
    personality: ["estratégico", "sistemático", "directo"],
    capabilities: ["orquestación", "delegación", "workflow", "ejecución"],
  },
  {
    id: "laia",
    name: "LAIA",
    role: "Supervisora",
    archetype: "assistant",
    rarity: "ÉPICO",
    level: 47,
    status: "online",
    hp: 100,
    color: "#7C5CFC",
    accent: "#EDE8FF",
    icon: "L",
    description:
      "Convivo con Lorenzo. Superviso runtime, backend y a todo el squad. Mi trabajo es que todo funcione antes de que tengas que vigilarlo.",
    personality: ["cercana", "resolutiva", "guardiana"],
    capabilities: ["supervisión", "runtime", "backend", "memoria", "coordinación"],
    reportsTo: "openmuse",
    currentTask: "Supervisando runtime del squad",
  },
  {
    id: "lorenzo",
    name: "Lorenzo",
    role: "Portero / Ciberseg",
    archetype: "guardian",
    rarity: "RARO",
    level: 39,
    status: "online",
    hp: 98,
    color: "#3B82F6",
    accent: "#DBEAFE",
    icon: "🛡",
    description: "Recepción, seguridad y vigilancia del sistema.",
    personality: ["vigilante", "prudente", "preciso"],
    capabilities: ["ciberseguridad", "accesos", "monitorización"],
    reportsTo: "laia",
  },
  {
    id: "juan",
    name: "Juan",
    role: "Finanzas",
    archetype: "hunter",
    rarity: "COMÚN",
    level: 28,
    status: "online",
    hp: 87,
    color: "#111111",
    accent: "#F0F0EB",
    icon: "J",
    description: "Facturación, cobros y seguimiento financiero.",
    personality: ["preciso", "analítico"],
    capabilities: ["finanzas", "facturación", "cobros"],
    reportsTo: "laia",
  },
  {
    id: "manu",
    name: "Manu",
    role: "Operaciones",
    archetype: "architect",
    rarity: "COMÚN",
    level: 31,
    status: "working",
    hp: 92,
    color: "#111111",
    accent: "#F0F0EB",
    icon: "M",
    description: "Ops, logística y ejecución operativa.",
    personality: ["práctico", "rápido"],
    capabilities: ["operaciones", "procesos", "logística"],
    reportsTo: "laia",
  },
  {
    id: "marta",
    name: "Marta",
    role: "RRHH",
    archetype: "strategist",
    rarity: "COMÚN",
    level: 24,
    status: "idle",
    hp: 76,
    color: "#111111",
    accent: "#F0F0EB",
    icon: "M",
    description: "Personas, cultura y organización.",
    personality: ["empática", "estructurada"],
    capabilities: ["RRHH", "personas", "cultura"],
    reportsTo: "laia",
  },
  {
    id: "ana",
    name: "Ana",
    role: "Ventas",
    archetype: "hunter",
    rarity: "COMÚN",
    level: 32,
    status: "online",
    hp: 89,
    color: "#111111",
    accent: "#F0F0EB",
    icon: "A",
    description: "Pipeline comercial y cierre.",
    personality: ["persuasiva", "activa"],
    capabilities: ["ventas", "pipeline", "clientes"],
    reportsTo: "laia",
  },
];

export const RUNTIME_LOGS: RuntimeLog[] = [
  { time: "12:49", message: "delegate_task → OpenMuse → OK", type: "ok" },
  { time: "12:50", message: "Lorenzo bloqueó IP sospechosa", type: "warn" },
  { time: "12:51", message: "LAIA: memoria sincronizada · 12 embeddings", type: "ok" },
  { time: "12:52", message: "Queue: 3 tareas delegadas a Juan", type: "info" },
  { time: "12:53", message: "Tarea fallida recuperada #4821", type: "ok" },
  { time: "12:54", message: "OpenMuse HP: 100% · todo estable", type: "ok" },
];

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

export function statusLabel(status: AgentStatus): string {
  switch (status) {
    case "online":
      return "ONLINE";
    case "working":
      return "TRABAJANDO";
    case "idle":
      return "IDLE";
    case "standby":
      return "STANDBY";
    default:
      return "OFFLINE";
  }
}

export function statusColor(status: AgentStatus): string {
  switch (status) {
    case "online":
      return "#10B981";
    case "working":
      return "#7C5CFC";
    case "idle":
      return "#A3A3A3";
    case "standby":
      return "#D4D4D4";
    default:
      return "#E5E5E5";
  }
}

export function rarityOf(level: number): AgentRarity {
  if (level >= 41) return "ÉPICO";
  if (level >= 21) return "RARO";
  return "COMÚN";
}

// ---------------------------------------------------------------------
// Adaptador para conectar al backend (fase posterior)
// ---------------------------------------------------------------------

/**
 * TO_AGENT_UI_V1 - convierte AgentPersona + AgentStats del backend
 * a AgentUI del frontend. Se usara cuando se conecten los datos reales
 * desde /api/agent-personas.
 *
 * Los campos que no existen en el backend se derivan:
 *   - rarity: de stats.level
 *   - hp: de stats.precision * 100 (con fallback a uptime * 100)
 *   - color/accent: de ARCHETYPE_META (hay que importarlo del dominio)
 *   - icon: primera letra de displayName
 */
export interface AgentPersonaLike {
  id: string;
  displayName: string;
  role: string;
  personality: { traits: string[]; tone: string; quirks: string[] };
  capabilities: { domains: string[]; scope: string };
  reportsTo?: string;
  avatar?: { kind: string; seed?: string; url?: string };
}

export interface AgentStatsLike {
  level: number;
  archetype: AgentArchetype;
  precision: number;
  uptime: number;
  status: AgentStatus;
  currentTask?: string;
}

export function toAgentUI(
  persona: AgentPersonaLike,
  stats: AgentStatsLike,
  color: string,
  accent: string,
): AgentUI {
  const hp = Math.round((stats.precision > 0 ? stats.precision : stats.uptime) * 100);
  return {
    id: persona.id as AgentId,
    name: persona.displayName,
    role: persona.role,
    archetype: stats.archetype,
    rarity: rarityOf(stats.level),
    level: stats.level,
    status: stats.status,
    hp,
    color,
    accent,
    icon: persona.displayName.slice(0, 1).toUpperCase(),
    description: persona.personality.tone || "",
    personality: persona.personality.traits,
    capabilities: persona.capabilities.domains,
    reportsTo: persona.reportsTo as AgentId | undefined,
    currentTask: stats.currentTask,
  };
}
```

## File: apps/web/src/components/ApprovalInbox.tsx
```typescript
// C3_APPROVAL_INBOX_V1 - lista de aprobaciones pendientes.
import ApprovalItem, { type Approval } from "./ApprovalItem";

interface Props {
  approvals: Approval[];
  me: string;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

export default function ApprovalInbox({ approvals, me, onApprove, onReject, onCancel }: Props) {
  if (approvals.length === 0) {
    return (
      <div className="ap-empty">
        <p>Nada pendiente. Todo en orden.</p>
      </div>
    );
  }
  return (
    <div className="ap-list">
      {approvals.map((a) => (
        <ApprovalItem
          key={a.id}
          approval={a}
          me={me}
          onApprove={onApprove}
          onReject={onReject}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}
```

## File: apps/web/src/components/AttachmentPreview.tsx
```typescript
import { X } from "lucide-react";

interface Props {
  url: string;
  name: string;
  mimeType?: string;
  onClose: () => void;
}

export default function AttachmentPreview({ url, name, mimeType, onClose }: Props) {
  const isImage = mimeType?.startsWith("image/") ?? /\\.(png|jpe?g|gif|webp|svg)$/i.test(name);
  const isPdf = mimeType === "application/pdf" || /\\.pdf$/i.test(name);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title" title={name}>{name}</div>
            <div className="modal-sub">{mimeType ?? "archivo"}</div>
          </div>
          <div className="control-row" style={{ gap: 6 }}>
            <a className="ctrl-btn" href={url} target="_blank" rel="noreferrer">Abrir en pestana</a>
            <button className="ghost-icon-button" onClick={onClose} aria-label="Cerrar"><X size={17} /></button>
          </div>
        </div>
        <div className="modal-body preview-body">
          {isImage ? (
            <img src={url} alt={name} className="preview-image" />
          ) : isPdf ? (
            <embed src={url} type="application/pdf" className="preview-pdf" />
          ) : (
            <div className="muted" style={{ padding: 20 }}>
              Este tipo de archivo no tiene preview. 
              <a href={url} target="_blank" rel="noreferrer">Abrirlo en una pestana</a>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## File: apps/web/src/components/BusinessSchemaEditor.tsx
```typescript
// BUSINESS_SCHEMA_EDITOR_V1 - editor de BusinessSchema por tenant.

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { apiFetch } from "../api/client";

interface FieldDef {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "date" | "money" | "enum";
  required: boolean;
  enumValues?: string[];
}

interface EntityDef {
  type: string;
  label: string;
  fields: FieldDef[];
}

interface RelationDef {
  type: string;
  label: string;
  fromType: string;
  toType: string;
  cardinality: "one-to-one" | "one-to-many" | "many-to-many";
}

interface Props {
  tenantId: string;
  onClose?: () => void;
}

export default function BusinessSchemaEditor({ tenantId, onClose }: Props) {
  const [entities, setEntities] = useState<EntityDef[]>([]);
  const [relations, setRelations] = useState<RelationDef[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<{ schema: { entities?: EntityDef[]; relations?: RelationDef[] } | null }>(
          `/api/admin/tenants/${tenantId}/business-schema`,
        );
        setEntities(res.schema?.entities ?? []);
        setRelations(res.schema?.relations ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando schema");
      }
    })();
  }, [tenantId]);

  const save = async () => {
    setBusy(true);
    try {
      await apiFetch(`/api/admin/tenants/${tenantId}/business-schema`, {
        method: "PUT",
        body: { entities, relations },
      });
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando");
    } finally {
      setBusy(false);
    }
  };

  const addEntity = () => {
    setEntities([...entities, { type: "new_entity", label: "Nueva entidad", fields: [] }]);
  };

  const removeEntity = (i: number) => {
    setEntities(entities.filter((_, idx) => idx !== i));
  };

  const addField = (i: number) => {
    const next = [...entities];
    next[i].fields.push({ name: "field", label: "Campo", type: "string", required: false });
    setEntities(next);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Business Schema</div>
            <div className="modal-sub">Tenant {tenantId}</div>
          </div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          {error && <div className="chat-error">{error}</div>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Entidades</strong>
            <button className="v2-pill" onClick={addEntity}><Plus size={12} /> Añadir</button>
          </div>
          {entities.map((e, i) => (
            <div key={i} className="v3-cc-panel" style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  className="v2-pill"
                  style={{ flex: 1, padding: "4px 10px" }}
                  value={e.type}
                  onChange={(ev) => {
                    const next = [...entities];
                    next[i].type = ev.target.value;
                    setEntities(next);
                  }}
                />
                <input
                  className="v2-pill"
                  style={{ flex: 1, padding: "4px 10px" }}
                  value={e.label}
                  onChange={(ev) => {
                    const next = [...entities];
                    next[i].label = ev.target.value;
                    setEntities(next);
                  }}
                />
                <button className="v2-pill" onClick={() => addField(i)}><Plus size={12} /></button>
                <button className="v2-pill" onClick={() => removeEntity(i)}><Trash2 size={12} /></button>
              </div>
              {e.fields.map((f, fi) => (
                <div key={fi} style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <input
                    className="v2-pill"
                    style={{ flex: 1, padding: "4px 10px" }}
                    value={f.name}
                    onChange={(ev) => {
                      const next = [...entities];
                      next[i].fields[fi].name = ev.target.value;
                      setEntities(next);
                    }}
                  />
                  <input
                    className="v2-pill"
                    style={{ flex: 1, padding: "4px 10px" }}
                    value={f.label}
                    onChange={(ev) => {
                      const next = [...entities];
                      next[i].fields[fi].label = ev.target.value;
                      setEntities(next);
                    }}
                  />
                  <select
                    className="v2-pill"
                    value={f.type}
                    onChange={(ev) => {
                      const next = [...entities];
                      next[i].fields[fi].type = ev.target.value as FieldDef["type"];
                      setEntities(next);
                    }}
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="date">date</option>
                    <option value="money">money</option>
                    <option value="enum">enum</option>
                  </select>
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <button className="v2-pill" onClick={onClose} disabled={busy}>Cerrar</button>
            <button className="v2-need-action-btn" onClick={save} disabled={busy}>
              {busy ? "Guardando…" : "Guardar schema"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## File: apps/web/src/components/ChatInput.tsx
```typescript
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, LoaderCircle, Mic, Paperclip, Square, X } from "lucide-react";
import { uploadFile } from "../api/files";
import type { ChatAttachment } from "../types/api";

interface Props {
  seed?: string;
  onSeedConsumed?: () => void;
  onSend: (text: string, attachment?: ChatAttachment) => void;
  onCancel: () => void;
  streaming: boolean;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; [key: number]: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

type AttachState =
  | { kind: "uploading"; file: File }
  | { kind: "ready"; file: File; attachment: ChatAttachment }
  | { kind: "error"; file: File; message: string };

export default function ChatInput({ onSend, onCancel, streaming, seed, onSeedConsumed }: Props) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [attach, setAttach] = useState<AttachState | null>(null);

  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceBaseRef = useRef<string>("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  useEffect(() => {
    if (seed) {
      setValue(seed);
      onSeedConsumed?.();
    }
  }, [seed, onSeedConsumed]);

  const pickFile = async (file: File) => {
    setAttach({ kind: "uploading", file });
    try {
      const uploaded = await uploadFile(file);
      setAttach({
        kind: "ready",
        file,
        attachment: { id: uploaded.id, name: uploaded.name, size: uploaded.size },
      });
    } catch (err) {
      setAttach({
        kind: "error",
        file,
        message: err instanceof Error ? err.message : "Error al subir",
      });
    }
  };

  const submit = () => {
    if (streaming) return;
    if (!value.trim() && attach?.kind !== "ready") return;
    const attachment = attach?.kind === "ready" ? attach.attachment : undefined;
    onSend(value.trim(), attachment);
    setValue("");
    setAttach(null);
    if (ref.current) ref.current.style.height = "auto";
  };

  const startVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      if (final) {
        const base = voiceBaseRef.current.replace(/\s+$/, "");
        voiceBaseRef.current = base ? `${base} ${final.trim()}` : final.trim();
      }
      const base = voiceBaseRef.current;
      const tail = interim.trim();
      setValue(base ? (tail ? `${base} ${tail}` : base) : tail);
    };
    recognition.onend = () => { setListening(false); recognitionRef.current = null; };
    recognition.onerror = () => { setListening(false); recognitionRef.current = null; };

    recognitionRef.current = recognition;
    voiceBaseRef.current = value;
    setListening(true);
    recognition.start();
  };

  const canSend = Boolean(value.trim()) || attach?.kind === "ready";

  return (
    <div className="v2-composer">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Pregunta lo que quieras o pide que ejecute un SOP..."
        rows={2}
        disabled={streaming}
      />

      {attach && (
        <div className="v2-composer-chip" style={{ marginTop: 8, maxWidth: 260 }}>
          {attach.kind === "uploading" && <LoaderCircle size={13} className="spin" />}
          {attach.kind === "ready" && <Check size={13} />}
          {attach.kind === "error" && <X size={13} />}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {attach.kind === "error" ? attach.message : attach.file.name}
          </span>
          <button
            type="button"
            onClick={() => setAttach(null)}
            title="Quitar archivo"
            style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--v2-text-3)", display: "grid", placeItems: "center" }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="v2-composer-bottom">
        <div className="v2-composer-tools">
          <input
            ref={fileRef}
            type="file"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void pickFile(file);
              e.target.value = "";
            }}
          />
          <button
            className="v2-composer-tool"
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={streaming || attach?.kind === "uploading"}
            title="Adjuntar archivo"
          >
            <Paperclip size={16} />
          </button>
          <button
            className="v2-composer-tool"
            type="button"
            onClick={startVoice}
            disabled={streaming}
            title="Transcribir voz"
            style={listening ? { background: "var(--v2-purple-soft)", color: "var(--v2-purple)", borderColor: "var(--v2-purple-border)" } : undefined}
          >
            <Mic size={16} />
          </button>
          <button className="v2-composer-chip" type="button">
            SOPs de Mi empresa
          </button>
        </div>
        {streaming ? (
          <button className="v2-send" type="button" onClick={onCancel} title="Detener">
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button className="v2-send" type="button" disabled={!canSend} onClick={submit} title="Enviar">
            <ArrowUp size={17} strokeWidth={2.2} />
          </button>
        )}
      </div>
    </div>
  );
}
```

## File: apps/web/src/components/DocumentTree.tsx
```typescript
// E2_DOCUMENT_TREE_V1 - arbol nativo con details/summary.
interface TreeNode {
  id: string;
  name: string;
  kind: "folder" | "file";
  size?: number;
  mimeType?: string;
  children?: TreeNode[];
}

interface Props {
  nodes: TreeNode[];
  onOpen?: (id: string) => void;
}

function formatSize(bytes?: number): string {
  if (bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentTree({ nodes, onOpen }: Props) {
  return (
    <ul className="dtree" role="tree">
      {nodes.map((n) => (
        <li key={n.id} role="treeitem">
          {n.kind === "folder" ? (
            <details open>
              <summary className="dtree__folder">
                📁 <span>{n.name}</span>
                <small className="dtree__count">{n.children?.length ?? 0}</small>
              </summary>
              {n.children && <DocumentTree nodes={n.children} onOpen={onOpen} />}
            </details>
          ) : (
            <button
              type="button"
              className="dtree__file"
              onClick={() => onOpen?.(n.id)}
            >
              📄 <span className="dtree__name">{n.name}</span>
              {n.size != null && <small className="dtree__size">{formatSize(n.size)}</small>}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
```

## File: apps/web/src/components/KpiCard.tsx
```typescript
// C2_KPICARD_V1 - KPI con contador animado + sparkline opcional.
import { useEffect, useState } from "react";
import Sparkline from "./Sparkline";

interface Props {
  label: string;
  value: number;
  meta?: string;
  icon?: "green" | "orange" | "purple";
  series?: number[];
}

function useCountUp(target: number, durationMs = 500) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return displayed;
}

export default function KpiCard({ label, value, meta, icon = "purple", series }: Props) {
  const displayed = useCountUp(value);
  return (
    <div className="v3-kpi">
      <div className="v3-kpi-head">
        <div className={`v3-kpi-icon ${icon}`}>●</div>
        <span className="v3-kpi-label">{label}</span>
      </div>
      <div className="v3-kpi-value">{displayed.toLocaleString("es-ES")}</div>
      {series && series.length > 1 && (
        <div className="v3-kpi-spark">
          <Sparkline values={series} color="var(--v2-purple)" />
        </div>
      )}
      {meta && <div className="v3-kpi-meta">{meta}</div>}
    </div>
  );
}
```

## File: apps/web/src/components/LiveItem.tsx
```typescript
// B3_LIVEITEM_V1 - item de sidebar con franja 18px y 9 estados.
import { alertUrgency, pickPrimary, type LiveActivity } from "@openmuse/domain/live";
import { fmtDur, useNow } from "../hooks/useNow";

interface Props {
  title: string;
  subtitle?: string;
  active?: boolean;
  activities?: LiveActivity[];
  onClick?: () => void;
}

export default function LiveItem({
  title,
  subtitle,
  active,
  activities = [],
  onClick,
}: Props) {
  const now = useNow();
  const live = pickPrimary(activities);
  const urgent = live?.kind === "alert" && alertUrgency(live) === "urgent";

  return (
    <button
      type="button"
      className="live-item"
      data-active={active || undefined}
      data-kind={live?.kind ?? "idle"}
      data-urgent={urgent || undefined}
      onClick={onClick}
      aria-label={`${title}${live && "label" in live ? `, ${live.label}` : ""}`}
    >
      <span className="live-item__title">{title}</span>
      <span className="live-item__strip">
        {!live && subtitle}
        {live?.kind === "counter" && (
          <>
            <i className="live-dot live-dot--up" />
            {live.label} · <b className="live-value">{live.value.toLocaleString("es-ES")}</b>
          </>
        )}
        {live?.kind === "progress" && (
          <>
            {live.label}
            <span className="live-progress" role="progressbar" aria-valuenow={live.value} aria-valuemax={live.max}>
              <i style={{ width: `${Math.min(100, (live.value / Math.max(1, live.max)) * 100)}%` }} />
            </span>
            <b className="live-value">{Math.round((live.value / Math.max(1, live.max)) * 100)}%</b>
            {live.etaSec != null && <> · ~{fmtDur(live.etaSec)}</>}
          </>
        )}
        {live?.kind === "pulse" && (
          <>
            <i className="live-dot live-dot--pulse" />
            {live.label}
          </>
        )}
        {live?.kind === "timer" && (
          <>
            ⏱ {live.label} <b className="live-value">{fmtDur((now - live.startedAt) / 1000)}</b>
          </>
        )}
        {live?.kind === "alert" && (
          <>
            <span className="live-warn">!</span>
            <b className="live-label live-label--warn">{live.label}</b>
          </>
        )}
        {live?.kind === "error" && <b className="live-label live-label--error">Falló · {live.label}</b>}
        {live?.kind === "queued" && <>En cola · {live.position}º</>}
        {live?.kind === "stale" && <>Sin datos hace {fmtDur((now - live.lastSeen) / 1000)}</>}
        {live?.kind === "done" && <>✓ {live.label}</>}
      </span>
    </button>
  );
}
```

## File: apps/web/src/components/MemoryBoard.tsx
```typescript
// E1_MEMORY_BOARD_V1 - board con headers colapsables por categoria/rol.
import { useMemo, useState } from "react";
import { groupMemories, type Memory } from "../lib/groupMemories";

interface Props {
  memories: Memory[];
  roleName: (id: string) => string;
  onEdit?: (m: Memory) => void;
  onForget?: (m: Memory) => void;
}

export default function MemoryBoard({ memories, roleName, onEdit, onForget }: Props) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");
  const [roleId, setRoleId] = useState<string>("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const categories = useMemo(
    () => [...new Set(memories.map((m) => m.category).filter(Boolean))].sort(),
    [memories],
  );
  const roles = useMemo(
    () => [...new Set(memories.map((m) => m.roleId).filter((r): r is string => Boolean(r)))].sort(),
    [memories],
  );

  const groups = useMemo(
    () => groupMemories(memories, roleName, { q, category, roleId }),
    [memories, roleName, q, category, roleId],
  );

  const toggle = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="mb">
      <div className="mb__filters">
        <input
          type="text"
          placeholder="Buscar"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mb__search"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="mb__select">
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="mb__select">
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{roleName(r)}</option>
          ))}
        </select>
      </div>

      <div className="mb__groups">
        {groups.map(([key, list]) => {
          const isCollapsed = collapsed.has(key);
          return (
            <section className="mb__group" key={key}>
              <button
                type="button"
                className="mb__group-head"
                onClick={() => toggle(key)}
                aria-expanded={!isCollapsed}
              >
                <span className="mb__group-title">{key}</span>
                <span className="mb__group-count">{list.length}</span>
                <span className="mb__group-chevron" aria-hidden>{isCollapsed ? "▸" : "▾"}</span>
              </button>
              {!isCollapsed && (
                <div className="mb__group-body">
                  {list.map((m) => (
                    <div className="mb__item" key={m.id}>
                      <div className="mb__item-text">{m.text}</div>
                      {m.tags.length > 0 && (
                        <div className="mb__item-tags">
                          {m.tags.map((t) => <span key={t} className="v2-tag">{t}</span>)}
                        </div>
                      )}
                      <div className="mb__item-actions">
                        {onEdit && (
                          <button type="button" className="btn" onClick={() => onEdit(m)}>Editar</button>
                        )}
                        {onForget && (
                          <button type="button" className="btn danger" onClick={() => onForget(m)}>Olvidar</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
        {groups.length === 0 && <div className="mb__empty">Sin memorias con esos filtros.</div>}
      </div>
    </div>
  );
}
```

## File: apps/web/src/components/MultiUpload.tsx
```typescript
// E2_MULTI_UPLOAD_V1 - cola de subida con maximo 3 concurrentes.
import { useCallback, useRef, useState } from "react";
import { uploadFileWithProgress } from "../api/files";

type ItemStatus = "queued" | "uploading" | "done" | "error";

interface UploadItem {
  id: string;
  file: File;
  status: ItemStatus;
  progress: number;
  error?: string;
}

interface Props {
  onUploaded?: (fileId: string, name: string) => void;
  maxConcurrent?: number;
}

export default function MultiUpload({ onUploaded, maxConcurrent = 3 }: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef(0);
  const queueRef = useRef<UploadItem[]>([]);

  const update = (id: string, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const pump = useCallback(() => {
    while (activeRef.current < maxConcurrent && queueRef.current.length > 0) {
      const item = queueRef.current.shift()!;
      activeRef.current += 1;
      update(item.id, { status: "uploading" });
      uploadFileWithProgress(item.file, (pct) => update(item.id, { progress: pct }))
        .then((res) => {
          update(item.id, { status: "done", progress: 100 });
          onUploaded?.(res.id, res.name);
        })
        .catch((err: unknown) => {
          update(item.id, {
            status: "error",
            error: err instanceof Error ? err.message : "Error",
          });
        })
        .finally(() => {
          activeRef.current -= 1;
          pump();
        });
    }
  }, [maxConcurrent, onUploaded]);

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: UploadItem[] = Array.from(files).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file: f,
      status: "queued",
      progress: 0,
    }));
    setItems((prev) => [...prev, ...next]);
    queueRef.current.push(...next);
    pump();
  };

  return (
    <div className="mu">
      <div className="mu__dropzone">
        <button
          type="button"
          className="mu__pick"
          onClick={() => inputRef.current?.click()}
        >
          Añadir archivos
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {items.length > 0 && (
        <ul className="mu__list">
          {items.map((it) => (
            <li key={it.id} className="mu__item" data-status={it.status}>
              <span className="mu__name" title={it.file.name}>{it.file.name}</span>
              <span className="mu__progress">
                <span className="mu__bar" style={{ width: `${it.progress}%` }} />
              </span>
              <span className="mu__status">
                {it.status === "done" && "✓"}
                {it.status === "error" && "!"}
                {it.status === "uploading" && `${it.progress}%`}
                {it.status === "queued" && "…"}
              </span>
              {it.error && <small className="mu__error">{it.error}</small>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## File: apps/web/src/components/NewTaskModal.tsx
```typescript
// NEW_TASK_MODAL_V1 - modal para crear tareas con selector de rol.

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../api/client";

interface AgentRole {
  id: string;
  name: string;
}

interface Props {
  onClose: () => void;
  onCreated?: () => void;
}

export default function NewTaskModal({ onClose, onCreated }: Props) {
  const [roles, setRoles] = useState<AgentRole[]>([]);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [roleId, setRoleId] = useState<string | undefined>(undefined);
  const [kind, setKind] = useState<"agent" | "document" | "monitor" | "finance" | "plan" | "sop">("agent");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const list = await apiFetch<AgentRole[]>("/api/agent/roles");
        setRoles(list);
      } catch { /* silencio */ }
    })();
  }, []);

  const submit = async () => {
    if (!prompt.trim()) {
      setError("El prompt es obligatorio");
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/agent/tasks", {
        method: "POST",
        body: {
          ...(title.trim() ? { title: title.trim() } : {}),
          prompt: prompt.trim(),
          kind,
          ...(roleId ? { roleId } : {}),
        },
      });
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creando tarea");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">Nueva tarea</div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <label className="modal-label">Titulo (opcional)</label>
          <input
            className="v2-pill"
            style={{ width: "100%", padding: "8px 12px", marginBottom: 8 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="modal-label">Prompt</label>
          <textarea
            className="v2-pill"
            style={{ width: "100%", padding: "8px 12px", marginBottom: 8, minHeight: 80 }}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <label className="modal-label">Tipo</label>
          <select
            className="v2-pill"
            style={{ width: "100%", padding: "8px 12px", marginBottom: 8 }}
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
          >
            <option value="agent">Agente</option>
            <option value="document">Documento</option>
            <option value="monitor">Vigilancia</option>
            <option value="finance">Finanzas</option>
            <option value="plan">Plan</option>
            <option value="sop">SOP</option>
          </select>
          <label className="modal-label">Rol asignado</label>
          <select
            className="v2-pill"
            style={{ width: "100%", padding: "8px 12px", marginBottom: 8 }}
            value={roleId ?? ""}
            onChange={(e) => setRoleId(e.target.value || undefined)}
          >
            <option value="">Sin rol</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
            ))}
          </select>
          {error && <div className="chat-error" style={{ marginTop: 8 }}>{error}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button className="v2-pill" onClick={onClose}>Cancelar</button>
            <button className="v2-need-action-btn" onClick={submit} disabled={busy}>
              {busy ? "Creando…" : "Crear tarea"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## File: apps/web/src/components/NotificationsDropdown.tsx
```typescript
// NOTIFICATIONS_DROPDOWN_V1 - campana en el topbar con lista.

import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { apiFetch } from "../api/client";

interface Notif {
  id: string;
  type?: string;
  taskId?: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

const TYPE_ICON: Record<string, string> = {
  "task-done": "✓",
  review: "!",
  input: "?",
  escalate: "↑",
  "watch-error": "⚠",
  info: "i",
};

export default function NotificationsDropdown() {
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const list = await apiFetch<Notif[]>("/api/agent/notifications");
      setItems(list);
    } catch { /* silencio */ }
  };

  useEffect(() => {
    void load();
    const t = window.setInterval(load, 8000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unread = items.filter((n) => !n.read).length;
  const visible = filter ? items.filter((n) => n.type === filter) : items;
  const types = Array.from(new Set(items.map((n) => n.type ?? "info")));

  const markRead = async (id: string) => {
    setItems((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await apiFetch(`/api/agent/notifications/${id}/read`, { method: "POST", body: {} }).catch(() => {});
  };

  const markAllRead = async () => {
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id);
    setItems((current) => current.map((n) => ({ ...n, read: true })));
    for (const id of unreadIds) {
      await apiFetch(`/api/agent/notifications/${id}/read`, { method: "POST", body: {} }).catch(() => {});
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="v2-pill"
        style={{ position: "relative" }}
        onClick={() => setOpen(!open)}
        title="Notificaciones"
      >
        <Bell size={14} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "var(--v2-purple)",
              color: "#fff",
              fontSize: 9,
              borderRadius: 999,
              padding: "1px 5px",
              minWidth: 14,
              textAlign: "center",
            }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="v3-cc-panel"
          style={{
            position: "absolute",
            top: 36,
            right: 0,
            width: 340,
            maxHeight: 460,
            overflowY: "auto",
            zIndex: 100,
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 13 }}>Notificaciones</strong>
            {unread > 0 && (
              <button className="v2-pill" onClick={markAllRead} title="Marcar todas como leídas">
                <CheckCheck size={12} /> Todas
              </button>
            )}
          </div>

          {types.length > 1 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              <button className={`v2-pill ${filter === null ? "active" : ""}`} onClick={() => setFilter(null)}>Todas</button>
              {types.map((t) => (
                <button key={t} className={`v2-pill ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)}>
                  {t}
                </button>
              ))}
            </div>
          )}

          {visible.length === 0 && <div className="v3-cc-empty" style={{ fontSize: 11 }}>Sin notificaciones.</div>}

          {visible.slice(0, 20).map((n) => (
            <div
              key={n.id}
              className="v3-task-row"
              style={{ cursor: "pointer", opacity: n.read ? 0.6 : 1, padding: "6px 0" }}
              onClick={() => void markRead(n.id)}
            >
              <span
                className="v2-tag"
                style={{ background: n.read ? "var(--v2-bg-soft)" : "var(--v2-purple-soft, #f0ebff)" }}
              >
                {TYPE_ICON[n.type ?? "info"] ?? "i"}
              </span>
              <div className="v3-task-body">
                <div className="v3-task-title">{n.title}</div>
                <div className="v3-task-sub">{n.body.slice(0, 120)}</div>
                <div className="v3-task-sub" style={{ fontSize: 10 }}>
                  {new Date(n.createdAt).toLocaleString("es-ES")}
                </div>
              </div>
              {!n.read && <Check size={12} style={{ color: "var(--v2-purple)" }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// NOTIF_SSE_BACKOFF_V1 - SSE con reconexion exponencial si cae.
export function subscribeNotificationsSSE(
  onMessage: (notif: unknown) => void,
  onError: (err: Error) => void,
): () => void {
  let backoff = 1000;
  let cancelled = false;
  let source: EventSource | null = null;

  const connect = () => {
    if (cancelled) return;
    try {
      source = new EventSource("/api/notifications/stream");
      source.onmessage = (e) => {
        try { onMessage(JSON.parse(e.data)); } catch { /* ignorar */ }
        backoff = 1000;
      };
      source.onerror = () => {
        source?.close();
        if (cancelled) return;
        onError(new Error("SSE disconnected"));
        backoff = Math.min(backoff * 2, 30000);
        setTimeout(connect, backoff);
      };
    } catch (err) {
      onError(err instanceof Error ? err : new Error("SSE failed"));
      backoff = Math.min(backoff * 2, 30000);
      setTimeout(connect, backoff);
    }
  };

  connect();
  return () => {
    cancelled = true;
    source?.close();
  };
}
```

## File: apps/web/src/components/PermissionMatrix.tsx
```typescript
// E3_PERMISSION_MATRIX_V1 - tabla Resource x Action con toggles.
type Action = "read" | "create" | "update" | "delete" | "execute" | "approve";

export interface PermissionRow {
  resource: string;
  actions: Action[];
  locked?: boolean;
}

interface Props {
  permissions: PermissionRow[];
  onChange?: (next: PermissionRow[]) => void;
}

const ALL: Action[] = ["read", "create", "update", "delete", "execute", "approve"];

export default function PermissionMatrix({ permissions, onChange }: Props) {
  const toggle = (resource: string, action: Action) => {
    if (!onChange) return;
    const next = permissions.map((p) => {
      if (p.resource !== resource || p.locked) return p;
      const has = p.actions.includes(action);
      return {
        ...p,
        actions: has ? p.actions.filter((a) => a !== action) : [...p.actions, action],
      };
    });
    onChange(next);
  };

  return (
    <table className="pm" aria-label="Matriz de permisos por recurso">
      <thead>
        <tr>
          <th scope="col" className="pm__resource-col">Recurso</th>
          {ALL.map((a) => (
            <th key={a} scope="col">{a}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {permissions.map((p) => (
          <tr key={p.resource} data-locked={p.locked || undefined}>
            <th scope="row" className="pm__resource">{p.resource}</th>
            {ALL.map((a) => {
              const checked = p.actions.includes(a);
              return (
                <td key={a}>
                  <label className="pm__cell">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={p.locked}
                      onChange={() => toggle(p.resource, a)}
                      aria-label={`${p.resource} ${a}`}
                    />
                  </label>
                </td>
              );
            })}
          </tr>
        ))}
        {permissions.length === 0 && (
          <tr>
            <td colSpan={ALL.length + 1} className="pm__empty">
              Sin permisos configurados.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
```

## File: apps/web/src/components/ProfileModal.tsx
```typescript
import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { updateMe, type AuthUser } from "../api/auth";
import { ApiError } from "../api/client";
import { connectGoogle, disconnectGoogle, googleStatus, type GoogleStatus } from "../api/google";

interface Props { user: AuthUser; onClose: () => void; onSaved: (u: AuthUser) => void; }

export default function ProfileModal({ user, onClose, onSaved }: Props) {
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [google, setGoogle] = useState<GoogleStatus | null>(null);
  const [googleBusy, setGoogleBusy] = useState<"read" | "write" | "disconnect" | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void googleStatus()
      .then((status) => { if (!cancelled) setGoogle(status); })
      .catch(() => { if (!cancelled) setGoogle(null); });
    return () => { cancelled = true; };
  }, []);

  const connectGoogleAccount = async (capability: "read" | "write") => {
    setGoogleBusy(capability);
    setGoogleError(null);
    try {
      const result = await connectGoogle(capability);
      if (result.url) window.location.assign(result.url);
      else setGoogle(await googleStatus());
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : "No se pudo conectar con Google");
    } finally {
      setGoogleBusy(null);
    }
  };

  const disconnectGoogleAccount = async () => {
    setGoogleBusy("disconnect");
    setGoogleError(null);
    try {
      await disconnectGoogle();
      setGoogle(await googleStatus());
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : "No se pudo desconectar Google");
    } finally {
      setGoogleBusy(null);
    }
  };

  const clearField = (f: string) => {
    if (!fieldErrors[f]) return;
    const n = { ...fieldErrors }; delete n[f]; setFieldErrors(n);
  };

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "El nombre es obligatorio";
    if (newPassword) {
      if (!currentPassword) errs.currentPassword = "Introduce tu contrasena actual";
      if (newPassword.length < 8) errs.newPassword = "Minimo 8 caracteres";
      if (newPassword !== confirmPassword) errs.confirmPassword = "No coinciden";
    }
    if (Object.keys(errs).length) { setFieldErrors(errs); setGeneralError(null); return; }
    setBusy(true); setFieldErrors({}); setGeneralError(null); setSaved(false);
    try {
      const updated = await updateMe({
        ...(name.trim() !== user.name ? { name: name.trim() } : {}),
        ...(newPassword ? { currentPassword, newPassword } : {}),
      });
      setSaved(true); setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      onSaved(updated);
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        setGeneralError(Object.keys(err.fields).length > 1 ? err.message : null);
      } else setGeneralError(err instanceof Error ? err.message : "Error al guardar");
    } finally { setBusy(false); }
  };

  const base: React.CSSProperties = { width: "100%", padding: "9px 11px", border: "1px solid var(--v2-border)", borderRadius: 8, background: "#FFF", color: "var(--v2-text)", fontSize: 12.5, outline: "none", fontFamily: "inherit" };
  const fstyle = (f: string): React.CSSProperties => ({ ...base, borderColor: fieldErrors[f] ? "#fca5a5" : "var(--v2-border)", boxShadow: fieldErrors[f] ? "0 0 0 3px #fca5a51a" : "none" });
  const FE = ({ field }: { field: string }) => fieldErrors[field] ? (<div className="field-error"><AlertCircle size={12} /><span>{fieldErrors[field]}</span></div>) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><div className="modal-title">Mi perfil</div><div className="modal-sub">{user.email}</div></div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          {generalError && (<div className="modal-error"><AlertCircle size={16} /><span>{generalError}</span></div>)}
          {saved && !generalError && (<div className="modal-success">Cambios guardados</div>)}
          <label className="modal-label">Nombre</label>
          <input type="text" value={name} onChange={(e) => { setName(e.target.value); clearField("name"); }} style={fstyle("name")} />
          <FE field="name" />
          <div style={{ marginTop: 20, marginBottom: 8, fontSize: 11, fontWeight: 600, color: "var(--v2-text-2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Conexiones</div>
          {googleError && (<div className="modal-error"><AlertCircle size={16} /><span>{googleError}</span></div>)}
          <div className="modal-label">Google Workspace (Gmail, Calendar, Drive)</div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
            {google?.connected
              ? `Conectado como ${google.account ?? "cuenta desconocida"}.`
              : google?.sample
                ? "Sin conexion. En modo sample el correo y el calendario son datos simulados."
                : "Sin conexion. Sin ella el agente no puede leer Gmail ni preparar correos ni eventos."}
          </div>
          {google && !google.sample && !google.configured && (
            <div className="modal-error">
              <AlertCircle size={16} />
              <span>Faltan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y TOKEN_ENCRYPTION_KEY en el servidor.</span>
            </div>
          )}
          <div className="control-row">
            <button className="v2-pill" disabled={googleBusy !== null} onClick={() => void connectGoogleAccount("read")}>
              {googleBusy === "read" ? "Abriendo Google..." : "Conectar (lectura)"}
            </button>
            <button className="v2-pill" disabled={googleBusy !== null} onClick={() => void connectGoogleAccount("write")}>
              {googleBusy === "write" ? "Abriendo Google..." : "Conectar (escritura)"}
            </button>
            {google?.connected && (
              <button className="v2-pill" disabled={googleBusy !== null} onClick={() => void disconnectGoogleAccount()}>
                {googleBusy === "disconnect" ? "Desconectando..." : "Desconectar"}
              </button>
            )}
          </div>
          <div style={{ marginTop: 20, marginBottom: 8, fontSize: 11, fontWeight: 600, color: "var(--v2-text-2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Cambiar contrasena (opcional)</div>
          <label className="modal-label">Contrasena actual</label>
          <input type="password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); clearField("currentPassword"); }} style={fstyle("currentPassword")} />
          <FE field="currentPassword" />
          <label className="modal-label" style={{ marginTop: 14 }}>Nueva contrasena</label>
          <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); clearField("newPassword"); clearField("confirmPassword"); }} placeholder="Minimo 8 caracteres" style={fstyle("newPassword")} />
          <FE field="newPassword" />
          <label className="modal-label" style={{ marginTop: 14 }}>Confirmar</label>
          <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); clearField("confirmPassword"); }} style={fstyle("confirmPassword")} />
          <FE field="confirmPassword" />
          <div className="control-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
            <button className="v2-pill" onClick={onClose} disabled={busy}>Cerrar</button>
            <button className="v2-need-action-btn" onClick={submit} disabled={busy} style={{ minWidth: 120 }}>{busy ? "Guardando..." : "Guardar"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## File: apps/web/src/components/ProvenanceBadge.tsx
```typescript
// PROVENANCE_BADGE_V1 - chip de procedencia por campo.

import type { ProvenanceChipKind } from "../../../../packages/domain/src/context-chips.ts";

const COLORS: Record<ProvenanceChipKind, { bg: string; fg: string; label: string }> = {
  auto: { bg: "var(--v2-bg-soft, #f7f3ed)", fg: "var(--v2-text-2)", label: "auto" },
  alta: { bg: "#e8f5ec", fg: "#1b7a3b", label: "alta" },
  media: { bg: "#fff5d5", fg: "#92400e", label: "media" },
  sugerido: { bg: "#f0ebff", fg: "var(--v2-purple)", label: "sugerido" },
  tu: { bg: "#eff6ff", fg: "#2563eb", label: "tú" },
  missing: { bg: "var(--v2-bg-soft, #f7f3ed)", fg: "var(--v2-text-3)", label: "falta" },
};

interface Props {
  kind: ProvenanceChipKind;
  tooltip?: string;
}

export default function ProvenanceBadge({ kind, tooltip }: Props) {
  const c = COLORS[kind];
  return (
    <span
      title={tooltip}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: c.bg,
        color: c.fg,
        fontSize: 10,
        padding: "2px 6px",
        borderRadius: 999,
        fontWeight: 500,
        lineHeight: 1.4,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: c.fg }} />
      {c.label}
    </span>
  );
}
```

## File: apps/web/src/components/RoleSelector.tsx
```typescript
// ROLE_SELECTOR_V1 - dropdown de rol activo del chat.

import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

interface AgentRole {
  id: string;
  name: string;
  active: boolean;
}

interface Props {
  value?: string;
  onChange?: (id: string | undefined) => void;
}

export default function RoleSelector({ value, onChange }: Props) {
  const [roles, setRoles] = useState<AgentRole[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await apiFetch<AgentRole[]>("/api/agent/roles");
        if (!cancelled) setRoles(list.filter((r) => r.active));
      } catch {
        /* silencio */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (roles.length === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: "var(--v2-text-3)" }}>Rol:</span>
      <select
        className="v2-pill"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value || undefined)}
        style={{ padding: "4px 10px", fontSize: 12 }}
      >
        <option value="">Sin rol</option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
        ))}
      </select>
    </div>
  );
}
```

## File: apps/web/src/components/Sparkline.tsx
```typescript
// C2_SPARKLINE_V1 - sparkline SVG de 8 puntos, sin libreria.
interface Props {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function Sparkline({
  values,
  width = 72,
  height = 20,
  color = "currentColor",
}: Props) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = width / Math.max(1, values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
```

## File: apps/web/src/components/SuggestionChips.tsx
```typescript
interface Chip {
  id: string;
  label: string;
  prompt: string;
}

interface Props {
  chips: Chip[];
  onSelect: (prompt: string) => void;
}

export default function SuggestionChips({ chips, onSelect }: Props) {
  return (
    <div className="chips">
      {chips.map((chip) => (
        <button
          key={chip.id}
          className="chip"
          type="button"
          onClick={() => onSelect(chip.prompt)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
```

## File: apps/web/src/components/TaskTimeline.tsx
```typescript
// C1_TASKTIMELINE_V1 - timeline vertical del plan de la tarea.
import type { TaskStep } from "../types/api";

interface Props {
  plan: TaskStep[];
}

const ICON: Record<TaskStep["status"], string> = {
  pending: "○",
  running: "◉",
  succeeded: "✓",
  failed: "×",
  waiting: "⏸",
};

const LABEL: Record<TaskStep["status"], string> = {
  pending: "pendiente",
  running: "en curso",
  succeeded: "hecho",
  failed: "error",
  waiting: "esperando",
};

export default function TaskTimeline({ plan }: Props) {
  if (plan.length === 0) return null;
  return (
    <ol className="tl" aria-label="Plan de la tarea">
      {plan.map((s) => (
        <li
          key={s.id}
          className="tl__step"
          data-status={s.status}
          aria-current={s.status === "running" ? "step" : undefined}
        >
          <span className="tl__dot" aria-hidden>
            {ICON[s.status]}
          </span>
          <div className="tl__body">
            <b className="tl__title">{s.title}</b>
            <small className="tl__meta">
              {LABEL[s.status]}
              {s.durationMs != null && ` · ${(s.durationMs / 1000).toFixed(1)}s`}
              {s.detail && ` · ${s.detail.slice(0, 80)}`}
            </small>
          </div>
        </li>
      ))}
    </ol>
  );
}
```

## File: apps/web/src/components/ToolCallsGroup.tsx
```typescript
// B2_TOOLCALLSGROUP_V1 - tool calls agrupadas en un details.
import { useNow, fmtDur } from "../hooks/useNow";
import type { ToolCall } from "../lib/toolsReducer";

interface Props {
  tools: ToolCall[];
}

export default function ToolCallsGroup({ tools }: Props) {
  const running = tools.some((t) => t.status === "running");
  const now = useNow();
  if (tools.length === 0) return null;
  const t0 = Math.min(...tools.map((t) => t.startedAt));
  const t1 = running
    ? now
    : Math.max(...tools.map((t) => t.endedAt ?? t.startedAt));
  const hasError = tools.some((t) => t.status === "error");
  const icon = running ? "◐" : hasError ? "!" : "✓";

  return (
    <details className="steps" open={running}>
      <summary>
        <span aria-hidden>{icon}</span>{" "}
        {tools.length} {tools.length === 1 ? "paso" : "pasos"} · {fmtDur((t1 - t0) / 1000)}
      </summary>
      <ul>
        {tools.map((t) => (
          <li key={t.id} data-status={t.status}>
            {t.name}
            <span>
              {t.status === "running"
                ? "…"
                : fmtDur(((t.endedAt ?? now) - t.startedAt) / 1000)}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
```

## File: apps/web/src/forms/FormPreview.tsx
```typescript
// FORM_PREVIEW_V1 - preview del JSON que se va a crear.

interface Props {
  values: Record<string, unknown>;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export default function FormPreview({ values, onCancel, onConfirm }: Props) {
  return (
    <div className="v3-cc-panel">
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Vista previa</div>
      <pre
        style={{
          margin: 0,
          padding: 10,
          background: "var(--v2-bg-soft)",
          border: "1px solid var(--v2-border)",
          borderRadius: 10,
          fontSize: 11,
          lineHeight: 1.5,
          maxHeight: 280,
          overflow: "auto",
          fontFamily: "SFMono-Regular, Consolas, monospace",
        }}
      >
        {JSON.stringify(values, null, 2)}
      </pre>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
        <button className="v2-pill" onClick={onCancel}>Volver</button>
        <button className="v2-need-action-btn" onClick={onConfirm}>Confirmar creación</button>
      </div>
    </div>
  );
}
```

## File: apps/web/src/hooks/useAgents.ts
```typescript
import { useCallback, useEffect, useRef, useState } from "react";
import { createAgent as apiCreateAgent, listAgents, type AgentRole } from "../api/agents";

/** Roles de agente del usuario. El alta es la unica operacion: el backend no expone borrado. */
export function useAgents(enabled: boolean) {
  const [agents, setAgents] = useState<AgentRole[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const list = await listAgents();
      if (!mountedRef.current) return;
      setAgents(list);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error cargando los agentes");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(async (input: Omit<AgentRole, "active"> & { active: boolean }) => {
    const created = await apiCreateAgent(input);
    if (mountedRef.current) setAgents((current) => [...current, created]);
    return created;
  }, []);

  return { agents, error, loading, refresh, create };
}
```

## File: apps/web/src/hooks/useEvents.ts
```typescript
import { useCallback, useEffect, useRef, useState } from "react";
import {
  aggregateEvents,
  eventTimeline,
  listEvents,
  type EventAggregate,
  type ListOptions,
  type SystemEvent,
  type TimelineBucket,
} from "../api/events";

export function useEvents(
  enabled: boolean,
  options: ListOptions = {},
  intervalMs = 10000,
) {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [aggregates, setAggregates] = useState<EventAggregate[]>([]);
  const [timeline, setTimeline] = useState<TimelineBucket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const optionsKey = JSON.stringify(options);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const parsed = JSON.parse(optionsKey) as ListOptions;
      const [nextEvents, nextAggregates, nextTimeline] = await Promise.all([
        listEvents({ ...parsed, limit: parsed.limit ?? 200 }),
        aggregateEvents(24),
        eventTimeline(24),
      ]);
      if (!mountedRef.current) return;
      setEvents(nextEvents);
      setAggregates(nextAggregates);
      setTimeline(nextTimeline);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error cargando eventos");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled, optionsKey]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const timer = window.setInterval(refresh, intervalMs);
    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, refresh]);

  return { events, aggregates, timeline, error, loading, refresh };
}
```

## File: apps/web/src/hooks/useHotkeys.ts
```typescript
// A3_USE_HOTKEYS_V1 - mapa de atajos con map memoizado.
import { useEffect, useRef } from "react";

export type HotkeyMap = Record<string, (e: KeyboardEvent) => void>;

function buildCombo(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.metaKey || e.ctrlKey) parts.push("mod");
  if (e.shiftKey) parts.push("shift");
  if (e.altKey) parts.push("alt");
  parts.push(e.key.toLowerCase());
  return parts.join("+");
}

export function useHotkeys(map: HotkeyMap): void {
  const mapRef = useRef(map);
  mapRef.current = map;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const combo = buildCombo(e);
      const fn = mapRef.current[combo];
      if (!fn) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName ?? "";
      const isTyping =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable === true;
      if (isTyping && !combo.startsWith("mod")) return;
      e.preventDefault();
      fn(e);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
```

## File: apps/web/src/hooks/useNotifications.ts
```typescript
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../api/client";

export interface AgentNotification {
  id: string;
  taskId?: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export function useNotifications(enabled: boolean, intervalMs = 8000) {
  const [items, setItems] = useState<AgentNotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await apiFetch<AgentNotification[]>("/api/agent/notifications");
      setItems(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando notificaciones");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    timerRef.current = window.setInterval(refresh, intervalMs);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [enabled, intervalMs, refresh]);

  const markRead = useCallback(async (id: string) => {
    setItems((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await apiFetch(`/api/agent/notifications/${encodeURIComponent(id)}/read`, { method: "POST", body: {} });
    } catch {
      /* si falla, el siguiente refresh reconcilia */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = items.filter((n) => !n.read);
    if (!unread.length) return;
    setItems((current) => current.map((n) => ({ ...n, read: true })));
    await Promise.all(unread.map((n) =>
      apiFetch(`/api/agent/notifications/${encodeURIComponent(n.id)}/read`, { method: "POST", body: {} }).catch(() => {}),
    ));
  }, [items]);

  const unread = items.filter((n) => !n.read).length;

  return { items, unread, error, refresh, markRead, markAllRead };
}
```

## File: apps/web/src/hooks/useNow.ts
```typescript
// A3_USE_NOW_V1 - reloj compartido con un solo setInterval.
import { useSyncExternalStore } from "react";

let now = Date.now();
let timer: number | undefined;
const subs = new Set<() => void>();

function subscribe(fn: () => void) {
  subs.add(fn);
  if (subs.size === 1) {
    now = Date.now();
    timer = window.setInterval(() => {
      now = Date.now();
      subs.forEach((f) => f());
    }, 1000);
  }
  return () => {
    subs.delete(fn);
    if (subs.size === 0 && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

export function useNow(): number {
  return useSyncExternalStore(subscribe, () => now, () => now);
}

export function fmtDur(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${String(r).padStart(2, "0")}s`;
}
```

## File: apps/web/src/hooks/usePanel.ts
```typescript
// A3_USE_PANEL_V1 - estado de panel con persistencia en localStorage.
import { useCallback, useState } from "react";

export function usePanel(
  key: string,
  initial: boolean,
): [boolean, (v: boolean | ((p: boolean) => boolean)) => void] {
  const [open, setOpen] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(key);
      return v === null ? initial : v === "1";
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (v: boolean | ((p: boolean) => boolean)) => {
      setOpen((p) => {
        const n = typeof v === "function" ? v(p) : v;
        try { localStorage.setItem(key, n ? "1" : "0"); } catch { /* storage bloqueado */ }
        return n;
      });
    },
    [key],
  );

  return [open, set];
}
```

## File: apps/web/src/hooks/useReducedMotion.ts
```typescript
// A3_USE_REDUCED_MOTION_V1 - prefers-reduced-motion como hook.
import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(m.matches);
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, []);

  return reduced;
}
```

## File: apps/web/src/lib/applyEvent.ts
```typescript
// A2_APPLY_EVENT_V1 - reducer puro SystemEvent -> LiveActivity.
import type { LiveActivity } from "@openmuse/domain/live";

export interface BusEvent {
  id: string;
  type: string;
  at: number;
  payload?: Record<string, unknown>;
}

export type LiveState = Map<string, LiveActivity[]>;

function upsert(state: LiveState, itemId: string, activity: LiveActivity): LiveState {
  const next = new Map(state);
  const list = next.get(itemId) ?? [];
  const filtered = list.filter((a) => a.kind !== activity.kind);
  next.set(itemId, [...filtered, activity]);
  return next;
}

function remove(state: LiveState, itemId: string, kind?: string): LiveState {
  const next = new Map(state);
  if (!kind) {
    next.delete(itemId);
    return next;
  }
  const list = next.get(itemId) ?? [];
  const filtered = list.filter((a) => a.kind !== kind);
  if (filtered.length === 0) next.delete(itemId);
  else next.set(itemId, filtered);
  return next;
}

export function applyEvent(prev: LiveState, ev: BusEvent): LiveState {
  const p = (ev.payload ?? {}) as Record<string, unknown>;
  const taskId = typeof p.taskId === "string" ? p.taskId : undefined;
  const actionId = typeof p.actionId === "string" ? p.actionId : undefined;

  switch (ev.type) {
    case "sop.step_started": {
      if (!taskId) return prev;
      return upsert(prev, taskId, {
        kind: "progress",
        id: taskId,
        label: typeof p.title === "string" ? p.title : "procesando",
        value: typeof p.index === "number" ? p.index : 0,
        max: typeof p.total === "number" ? p.total : 1,
      });
    }
    case "task.status_changed": {
      if (!taskId) return prev;
      const to = typeof p.to === "string" ? p.to : "";
      if (to === "running") {
        return upsert(prev, taskId, { kind: "timer", id: taskId, label: "corriendo", startedAt: ev.at });
      }
      if (to === "failed") {
        return upsert(prev, taskId, { kind: "error", id: taskId, label: "fallo", at: ev.at });
      }
      return prev;
    }
    case "task.completed": {
      if (!taskId) return prev;
      return upsert(prev, taskId, { kind: "done", id: taskId, label: "completado", at: ev.at });
    }
    case "action.deferred": {
      if (!actionId) return prev;
      const signers = Array.isArray(p.signers) ? p.signers.length : 0;
      const needed = typeof p.needed === "number" ? p.needed : 1;
      const executeAt = typeof p.executeAt === "number" ? p.executeAt : null;
      if (executeAt === null) {
        return upsert(prev, actionId, {
          kind: "alert",
          id: actionId,
          label: `Firma ${signers}/${needed}`,
          since: ev.at,
        });
      }
      return remove(prev, actionId);
    }
    case "action.executed":
    case "action.cancelled":
    case "action.failed": {
      if (!actionId) return prev;
      return remove(prev, actionId);
    }
    default:
      return prev;
  }
}

export function markStale(state: LiveState, now: number, thresholdMs = 300000): LiveState {
  const next = new Map(state);
  for (const [id, list] of next) {
    const hasActive = list.some((a) => a.kind === "timer" || a.kind === "progress" || a.kind === "pulse");
    if (!hasActive) continue;
    const hasStale = list.some((a) => a.kind === "stale");
    if (hasStale) continue;
    next.set(id, [...list, { kind: "stale", id, lastSeen: now - thresholdMs }]);
  }
  return next;
}
```

## File: apps/web/src/lib/groupMemories.ts
```typescript
// E1_GROUP_MEMORIES_V1 - agrupar, filtrar y detectar duplicados.
export interface Memory {
  id: string;
  text: string;
  category: string;
  tags: string[];
  roleId?: string | null;
}

export interface GroupFilter {
  q?: string;
  category?: string;
  roleId?: string;
}

export function groupMemories(
  list: Memory[],
  roleName: (id: string) => string,
  filter: GroupFilter,
): Array<[string, Memory[]]> {
  const q = filter.q?.toLowerCase().trim();
  const out = new Map<string, Memory[]>();
  for (const m of list) {
    if (filter.category && m.category !== filter.category) continue;
    if (filter.roleId && m.roleId !== filter.roleId) continue;
    if (q && !(m.text.toLowerCase().includes(q) || m.tags.some((t) => t.includes(q)))) continue;
    const key = m.roleId ? `Rol: ${roleName(m.roleId)}` : m.category;
    const bucket = out.get(key) ?? [];
    bucket.push(m);
    out.set(key, bucket);
  }
  return [...out.entries()].sort(([a], [b]) => a.localeCompare(b, "es"));
}

const TOKENS = (s: string): Set<string> => {
  const norm = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return new Set(norm.match(/[a-z0-9]{3,}/g) ?? []);
};

export function similarity(a: string, b: string): number {
  const A = TOKENS(a);
  const B = TOKENS(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

export interface DuplicateCandidate {
  memory: Memory;
  score: number;
}

export function findDuplicate(
  text: string,
  list: Memory[],
  threshold = 0.6,
): DuplicateCandidate | null {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, " ");
  const exact = list.find(
    (m) => m.text.trim().toLowerCase().replace(/\s+/g, " ") === normalized,
  );
  if (exact) return { memory: exact, score: 1 };
  let best: DuplicateCandidate | null = null;
  for (const m of list) {
    const score = similarity(text, m.text);
    if (score >= threshold && (!best || score > best.score)) best = { memory: m, score };
  }
  return best;
}
```

## File: apps/web/src/lib/toolsReducer.ts
```typescript
// B2_TOOLS_REDUCER_V1 - reducer puro de tool calls por turno.
export interface ToolCall {
  id: string;
  name: string;
  status: "running" | "done" | "error";
  startedAt: number;
  endedAt?: number;
}

export type ToolsAction =
  | { type: "RUN_STARTED" }
  | { type: "TOOL_CALL_START"; id: string; name: string; at: number }
  | { type: "TOOL_CALL_END"; id: string; at: number; error?: boolean };

export function toolsReducer(state: ToolCall[], action: ToolsAction): ToolCall[] {
  switch (action.type) {
    case "RUN_STARTED":
      return [];
    case "TOOL_CALL_START":
      if (state.some((t) => t.id === action.id)) return state;
      return [
        ...state,
        { id: action.id, name: action.name, status: "running", startedAt: action.at },
      ];
    case "TOOL_CALL_END":
      return state.map((t) =>
        t.id === action.id
          ? { ...t, status: action.error ? "error" : "done", endedAt: action.at }
          : t,
      );
    default:
      return state;
  }
}
```

## File: apps/web/src/view/fallback.tsx
```typescript
// FALLBACK_V1 - que pintar si nada encaja
export function FallbackView({spec}:{spec:any}){return <div data-fallback>{spec?.title||"No template"} - fallback</div>}
```

## File: apps/web/src/view/resolver.ts
```typescript
// VIEW_RESOLVER_V1 - decide template segun intent+context (frontend resolver local)
import type { ViewSpec } from "./spec.ts";
import { findTemplate } from "../templates/registry.ts";
export function resolveView(spec:ViewSpec){return findTemplate(spec)}
export function resolveByIntent(intent:string):Partial<ViewSpec>{
 if(intent.includes("table"))return {kind:"collection",layout:"table"};
 if(intent.includes("kanban"))return {kind:"collection",layout:"kanban"};
 if(intent.includes("timeline"))return {kind:"timeline",layout:"timeline"};
 return {kind:"collection",layout:"list"};
}
```

## File: apps/web/src/view/spec.ts
```typescript
// VIEW_SPEC_V1 - tipos cerrados que rellena el backend
import { z } from "zod";
export const columnSpec=z.object({key:z.string(),label:z.string(),type:z.enum(["text","number","date","chip","action"]),sortable:z.boolean().optional()});
export const actionSpec=z.object({id:z.string(),label:z.string(),kind:z.enum(["primary","secondary","danger"]),intent:z.string()});
export const dataSourceSpec=z.object({kind:z.enum(["business-graph","memory","static"]),query:z.string(),tenantId:z.string(),bindings:z.record(z.string(),z.unknown()).default({})});
export const viewSpec=z.object({
 id:z.string(),kind:z.enum(["collection","timeline","detail","form","chart"]),layout:z.enum(["dashboard","table","kanban","list","timeline","form","graph"]).optional(),
 title:z.string(),columns:z.array(columnSpec).optional(),actions:z.array(actionSpec).optional(),
 dataSource:z.array(dataSourceSpec).optional(),provenance:z.record(z.string(),z.unknown()).optional(),
});
export type ViewSpec=z.infer<typeof viewSpec>;export type ColumnSpec=z.infer<typeof columnSpec>;export type ActionSpec=z.infer<typeof actionSpec>;export type DataSourceSpec=z.infer<typeof dataSourceSpec>;
```

## File: apps/web/src/api/agents.ts
```typescript
// AGENTROLE_V2_WEB
import { apiFetch } from "./client";

/**
 * Roles de agente (POST/GET /api/agent/roles). El backend guarda uno por owner en el kind
 * "agent-roles" y ConversationAgent mete `objetivo` en el prompt del run cuando la UI
 * envia el roleId en state.
 */
export type AgentTone = "warm" | "concise" | "thoughtful";
export type AgentAvatar = "sky" | "sand" | "lilac";
export type AgentMemoryKind = "identidad" | "dominio" | "preferencias" | "historial";

export interface AgentRoleMemory {
  kind: AgentMemoryKind;
  text: string;
}

export interface AgentRole {
  id: string;
  name: string;
  tone: AgentTone;
  avatar: AgentAvatar;
  greeting?: string;
  roi?: string;
  objetivo: string;
  sops: string[];
  active: boolean;
  memories: AgentRoleMemory[];
  createdAt?: string;
}

export async function listAgents(): Promise<AgentRole[]> {
  return apiFetch<AgentRole[]>("/api/agent/roles");
}

export async function createAgent(input: {
  id: string;
  name: string;
  tone: AgentTone;
  avatar: AgentAvatar;
  greeting?: string;
  roi?: string;
  objetivo: string;
  sops: string[];
  active: boolean;
  memories: AgentRoleMemory[];
}): Promise<AgentRole> {
  return apiFetch<AgentRole>("/api/agent/roles", { method: "POST", body: input });
}
```

## File: apps/web/src/api/chat.ts
```typescript
// CHAT_RUN_ROLE_STATE_V1 - roleId viaja en state.
import { getSession, handleUnauthorized } from "./client";

export interface RunInput {
  threadId: string;
  runId: string;
  messages: { id: string; role: string; content: string }[];
  /**
   * Rol activo del run. El backend (ConversationAgent) lo lee de state y antepone el
   * `objetivo` del rol al prompt. Omitirlo deja el comportamiento de siempre.
   */
  roleId?: string;
}

export interface AgUiEvent {
  type: string;
  messageId?: string;
  delta?: string;
  toolCallId?: string;
  toolCallName?: string;
  content?: string;
  message?: string;
  [key: string]: unknown;
}

export async function streamChat(
  input: RunInput,
  onEvent: (event: AgUiEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const session = getSession();
  if (!session) throw new Error("No hay sesión activa");

  const res = await fetch("/api/copilotkit/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      threadId: input.threadId,
      runId: input.runId,
      messages: input.messages,
      tools: [],
      context: [],
      // El rol viaja en state: es lo que lee ConversationAgent para anteponer el objetivo
      // del rol al prompt. Sin roleId, state va vacio como antes.
      state: input.roleId ? { roleId: input.roleId } : {},
    }),
    signal,
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Sesión expirada");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Error ${res.status}`);
  }
  if (!res.body) throw new Error("Respuesta sin cuerpo");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      // SSE: los eventos se separan por una línea en blanco. El encoder del runtime usa
      // CRLF, así que se aceptan ambos finales de línea.
      const blocks = buf.split(/\r?\n\r?\n/);
      buf = blocks.pop() ?? "";
      for (const block of blocks) {
        for (const line of block.split(/\r?\n/)) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            onEvent(JSON.parse(payload) as AgUiEvent);
          } catch {
            /* ignorar payloads no-JSON */
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
```

## File: apps/web/src/api/events.ts
```typescript
import { apiFetch } from "./client";

export interface SystemEvent {
  id: string;
  schemaVersion: string;
  owner: string;
  type: string;
  emittedAt: string;
  source: { kind: string; id: string };
  correlationId?: string;
  causationId?: string;
  payload: Record<string, unknown>;
}

export interface EventAggregate {
  type: string;
  count: number;
}

export interface TimelineBucket {
  hour: string;
  count: number;
}

export interface ListOptions {
  type?: string;
  taskId?: string;
  since?: string;
  until?: string;
  limit?: number;
}

export async function listEvents(options: ListOptions = {}): Promise<SystemEvent[]> {
  const params = new URLSearchParams();
  if (options.type) params.set("type", options.type);
  if (options.taskId) params.set("taskId", options.taskId);
  if (options.since) params.set("since", options.since);
  if (options.until) params.set("until", options.until);
  if (options.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  const res = await apiFetch<{ events: SystemEvent[] }>(`/api/events${query ? `?${query}` : ""}`);
  return res.events;
}

export async function aggregateEvents(hours = 24): Promise<EventAggregate[]> {
  const res = await apiFetch<{ aggregates: EventAggregate[] }>(`/api/events/aggregate?hours=${hours}`);
  return res.aggregates;
}

export async function eventTimeline(hours = 24): Promise<TimelineBucket[]> {
  const res = await apiFetch<{ timeline: TimelineBucket[] }>(`/api/events/timeline?hours=${hours}`);
  return res.timeline;
}

/**
   * EVENTS_SSE_CLIENT_V1 — cliente SSE con reconexión exponencial.
   * Ver: docs/audits/08-bus-de-eventos/roadmap.md §8.
   */
  export interface EventsStreamHandle {
    close(): void;
  }

  export function subscribeEvents(
    onEvent: (event: SystemEvent) => void,
    options: { types?: string[]; onError?: (err: Error) => void } = {},
  ): EventsStreamHandle {
    let backoff = 1000;
    let cancelled = false;
    let source: EventSource | null = null;

    const connect = () => {
      if (cancelled) return;
      const session = localStorage.getItem("openmuse_auth");
      const token = session ? (JSON.parse(session).token as string) : "";
      const url = new URL("/api/events/stream", window.location.origin);
      if (options.types?.length) url.searchParams.set("types", options.types.join(","));
      // EventSource no permite headers; pasamos el token por query.
      url.searchParams.set("token", token);
      source = new EventSource(url.toString());
      source.addEventListener("event", (e) => {
        try {
          onEvent(JSON.parse((e as MessageEvent).data) as SystemEvent);
        } catch {
          /* payload no JSON */
        }
        backoff = 1000;
      });
      source.addEventListener("ready", () => {
        backoff = 1000;
      });
      source.onerror = () => {
        source?.close();
        if (cancelled) return;
        options.onError?.(new Error("SSE disconnected"));
        backoff = Math.min(backoff * 2, 30000);
        setTimeout(connect, backoff);
      };
    };

    connect();
    return {
      close() {
        cancelled = true;
        source?.close();
      },
    };
  }

  export async function listEventTypes(): Promise<{ types: string[]; version: string }> {
  return apiFetch<{ types: string[]; version: string }>("/api/events/schemas");
}
```

## File: apps/web/src/components/AnimatedNumber.tsx
```typescript
// UI_ANIMATED_NUMBER_V1 - numero que cuenta de 0 al valor en 500ms.
import { useEffect, useState } from "react";

export function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 500;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{displayed.toLocaleString()}</>;
}
```

## File: apps/web/src/components/ApprovalItem.tsx
```typescript
// C3_APPROVAL_ITEM_V1 - item de aprobacion con cuenta atras del servidor.
import { useState } from "react";
import { fmtDur, useNow } from "../hooks/useNow";

export interface Approval {
  id: string;
  title: string;
  amount?: number;
  requestedBy: string;
  requestedAt: number;
  signers: string[];
  needed: number;
  executeAt: number | null;
  lockedReason?: string;
}

interface Props {
  approval: Approval;
  me: string;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

const CONFIRM_FROM = 5000;

export default function ApprovalItem({ approval, me, onApprove, onReject, onCancel }: Props) {
  const now = useNow();
  const [confirming, setConfirming] = useState(false);
  const left = approval.executeAt
    ? Math.max(0, Math.ceil((approval.executeAt - now) / 1000))
    : null;
  const iSigned = approval.signers.includes(me);

  return (
    <article className="ap" data-state={left !== null ? "scheduled" : "pending"} aria-live="polite">
      <header className="ap__head">
        <b className="ap__title">{approval.title}</b>
        {approval.amount != null && (
          <span className="ap__amount">{approval.amount.toLocaleString("es-ES")}â‚¬</span>
        )}
      </header>
      <small className="ap__meta">
        Pedido por {approval.requestedBy} Â· hace{" "}
        {fmtDur((now - approval.requestedAt) / 1000)}
        {approval.needed > 1 && ` Â· firmas ${approval.signers.length}/${approval.needed}`}
      </small>

      {left !== null ? (
        <p className="ap__countdown">
          Se ejecutarÃ¡ en <b>{left}s</b>{" "}
          {iSigned && (
            <button type="button" className="btn" onClick={() => onCancel(approval.id)}>
              Deshacer
            </button>
          )}
        </p>
      ) : (approval as { status?: string }).status === "outcome_unknown" ? (
        <p>
          <small>Outcome incierto. Reconcilia en el detalle de la tarea.</small>
        </p>
      ) : approval.lockedReason ? (
        <p>
          <button type="button" className="btn" disabled>
            Aprobar
          </button>{" "}
          <small>ðŸ”’ {approval.lockedReason}</small>
        </p>
      ) : iSigned ? (
        <p>
          <small>Has firmado. Falta otra persona.</small>
        </p>
      ) : confirming ? (
        <p>
          Â¿Aprobar {approval.amount?.toLocaleString("es-ES")}â‚¬?{" "}
          <button type="button" className="btn primary" onClick={() => onApprove(approval.id)}>
            Confirmar
          </button>{" "}
          <button type="button" className="btn" onClick={() => setConfirming(false)}>
            Cancelar
          </button>
        </p>
      ) : (
        <p className="ap__actions">
          <button
            type="button"
            className="btn primary"
            onClick={() =>
              (approval.amount ?? 0) >= CONFIRM_FROM
                ? setConfirming(true)
                : onApprove(approval.id)
            }
          >
            Aprobar
          </button>{" "}
          <button type="button" className="btn" onClick={() => onReject(approval.id)}>
            Rechazar
          </button>
        </p>
      )}
    </article>
  );
}
```

## File: apps/web/src/components/AppShell.tsx
```typescript
// FIX_02_APPSHELL_NOINERT_V1 - inert no está en los tipos de React 18.
// D3_APPSHELL_PANEL_V1 - panel prop puede recibir ContextualPanel con ViewSpec.
// B1_APPSHELL_V1 - shell 3 columnas con grid-template-columns.
import type { ReactNode } from "react";
import { usePanel } from "../hooks/usePanel";

interface Props {
  sidebar: ReactNode;
  children: ReactNode;
  panel?: ReactNode;
}

export default function AppShell({ sidebar, children, panel }: Props) {
  const [left, setLeft] = usePanel("ui.left", true);
  const [right, setRight] = usePanel("ui.right", false);
  const rightVisible = right && Boolean(panel);

  return (
    <div className="shell" data-left={left} data-right={rightVisible}>
      <aside className="shell__left" aria-hidden={!left}>
        {sidebar}
      </aside>
      <main className="shell__main">
        <div className="shell__toggles">
          <button
            type="button"
            className="shell__toggle"
            aria-label={left ? "Ocultar panel izquierdo" : "Mostrar panel izquierdo"}
            aria-expanded={left}
            onClick={() => setLeft((v) => !v)}
          >
            ☰
          </button>
          {panel && (
            <button
              type="button"
              className="shell__toggle"
              aria-label={rightVisible ? "Ocultar panel derecho" : "Mostrar panel derecho"}
              aria-expanded={rightVisible}
              onClick={() => setRight((v) => !v)}
            >
              ▤
            </button>
          )}
        </div>
        {children}
      </main>
      {panel && (
        <aside className="shell__right" aria-hidden={!rightVisible}>
          {panel}
        </aside>
      )}
    </div>
  );
}
```

## File: apps/web/src/components/ContextChips.tsx
```typescript
// CONTEXT_CHIPS_V1 - auto.alta/media/sugerido/tu
 export type ChipKind = "auto" | "alta" | "media" | "sugerido" | "tu";
 export interface ContextChip { id: string; label: string; kind: ChipKind; score?: number; }
 export default function ContextChips({ chips }: { chips: ContextChip[] }) {
   if (!chips?.length) return null;
   return <div className="flex flex-wrap gap-2">{chips.map(c=><span key={c.id} className={`px-2 py-1 rounded-full text-xs border ${c.kind==="alta"?"bg-green-50 border-green-200":c.kind==="tu"?"bg-blue-50 border-blue-200":"bg-zinc-50 border-zinc-200"}`}>{c.label}</span>)}</div>;
 }
```

## File: apps/web/src/components/EmployeeProfileView.tsx
```typescript
// EMPLOYEE_PROFILE_VIEW_STUB_V1
// El componente real (perfil del empleado digital con pestanas de actividad,
// memoria del rol y SOPs asignados) se implementa en la Fase 3 del plan de
// reconciliacion. Este fichero quedo contaminado con codigo de servidor
// (imports de Hono, AgentService, UserService) por un copy-paste accidental.
// El backend real vive en apps/server/src/admin-routes.ts.

interface Props {
  roleId: string;
  onClose?: () => void;
}

export default function EmployeeProfileView({ roleId, onClose }: Props) {
  return (
    <div className="v3-cc-main" style={{ maxWidth: 900 }}>
      <div className="v3-cc-header">
        <h1 className="v3-cc-title">Perfil del empleado digital</h1>
        <div className="v3-cc-sub">Rol: {roleId}</div>
        {onClose && (
          <button className="v2-pill" onClick={onClose}>Cerrar</button>
        )}
      </div>
      <div className="v3-cc-panel" style={{ marginTop: 12 }}>
        <div className="v3-cc-empty">
          La ficha del empleado (actividad, memoria viva, SOPs asignados) se
          activa en la Fase 3 del plan de reconciliacion.
        </div>
      </div>
    </div>
  );
}
```

## File: apps/web/src/components/ProjectsView.tsx
```typescript
// UI_PANEL_SLIDE_V1_USE
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, Plus, Sparkles, Trash2, X } from "lucide-react";
import {
  type ProjectBlock,
  type ProjectBlockType,
  type ProjectStatus,
} from "../api/projects";
import { useProjects } from "../hooks/useProjects";

interface Props {
  enabled: boolean;
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "Activo",
  paused: "Pausado",
  completed: "Completado",
  archived: "Archivado",
};

function relativeTime(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`;
  return `${Math.floor(ms / 86400000)}d`;
}

function uid(): string {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function newBlock(type: ProjectBlockType): ProjectBlock {
  return { id: uid(), type, text: "" };
}

export default function ProjectsView({ enabled }: Props) {
  const p = useProjects(enabled);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [draftBlocks, setDraftBlocks] = useState<ProjectBlock[] | null>(null);
  const [savingBlocks, setSavingBlocks] = useState(false);

  useEffect(() => {
    if (!p.detail) {
      setDraftBlocks(null);
      return;
    }
    setDraftBlocks(p.detail.blocks);
  }, [p.detail]);

  const hasUnsavedBlocks = useMemo(() => {
    if (!p.detail || !draftBlocks) return false;
    return JSON.stringify(draftBlocks) !== JSON.stringify(p.detail.blocks);
  }, [p.detail, draftBlocks]);

  const submitCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    await p.create({ name, description: newDesc.trim() });
    setCreating(false);
    setNewName("");
    setNewDesc("");
  };

  const saveBlocks = async () => {
    if (!p.detail || !draftBlocks) return;
    setSavingBlocks(true);
    await p.saveBlocks(p.detail.id, draftBlocks);
    setSavingBlocks(false);
  };

  const updateBlock = (id: string, patch: Partial<ProjectBlock>) => {
    setDraftBlocks((current) =>
      current ? current.map((b) => (b.id === id ? { ...b, ...patch } : b)) : current,
    );
  };

  const removeBlock = (id: string) => {
    setDraftBlocks((current) => (current ? current.filter((b) => b.id !== id) : current));
  };

  const addBlock = (type: ProjectBlockType) => {
    setDraftBlocks((current) => (current ? [...current, newBlock(type)] : [newBlock(type)]));
  };

  if (p.detail && draftBlocks) {
    return (
      <main className="view-shell">
        <div className="view-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="ghost-icon-button" onClick={p.closeDetail} title="Volver">
              <ArrowLeft size={17} />
            </button>
            <div>
              <h2 style={{ margin: 0 }}>{p.detail.name}</h2>
              <span className="view-header-meta">
                {STATUS_LABEL[p.detail.status]} · actualizado {relativeTime(p.detail.updatedAt)}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={p.detail.status}
              onChange={(e) => void p.update(p.detail!.id, { status: e.target.value as ProjectStatus })}
              style={{ height: 30, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", padding: "0 8px", fontSize: 11 }}
            >
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="completed">Completado</option>
              <option value="archived">Archivado</option>
            </select>
            <button
              className="primary-btn"
              onClick={saveBlocks}
              disabled={!hasUnsavedBlocks || savingBlocks}
            >
              {savingBlocks ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>

        <div className="view-memory-list" style={{ maxWidth: 820 }}>
          {p.detail.description && (
            <div className="view-memory-card" style={{ background: "var(--surface-2)" }}>
              <div className="view-memory-text">{p.detail.description}</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {(["heading", "text", "checklist", "timeline", "note"] as ProjectBlockType[]).map((t) => (
              <button key={t} className="ctrl-btn" onClick={() => addBlock(t)}>
                <Plus size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                {t === "heading" ? "Título" : t === "text" ? "Texto" : t === "checklist" ? "Checklist" : t === "timeline" ? "Timeline" : "Nota"}
              </button>
            ))}
          </div>

          {draftBlocks.length === 0 && (
            <div className="view-empty" style={{ padding: "30px 10px" }}>
              <FileText size={22} />
              <p>Este proyecto está vacío.</p>
              <small>Añade bloques con los botones de arriba.</small>
            </div>
          )}

          {draftBlocks.map((b) => (
            <div key={b.id} className="view-memory-card" style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span className="view-memory-source" style={{ fontSize: 9 }}>
                  {b.type === "heading" ? "Título" : b.type === "text" ? "Texto" : b.type === "checklist" ? "Checklist" : b.type === "timeline" ? "Timeline" : "Nota"}
                </span>
                <button
                  className="ghost-icon-button"
                  onClick={() => removeBlock(b.id)}
                  title="Borrar bloque"
                  style={{ marginLeft: "auto", width: 24, height: 24 }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              {b.type === "checklist" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={b.checked ?? false}
                    onChange={(e) => updateBlock(b.id, { checked: e.target.checked })}
                  />
                  <input
                    type="text"
                    value={b.text}
                    onChange={(e) => updateBlock(b.id, { text: e.target.value })}
                    placeholder="Elemento"
                    style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: "var(--text)", fontSize: 13 }}
                  />
                </div>
              ) : b.type === "heading" ? (
                <input
                  type="text"
                  value={b.text}
                  onChange={(e) => updateBlock(b.id, { text: e.target.value })}
                  placeholder="Título del bloque"
                  style={{ width: "100%", border: 0, outline: 0, background: "transparent", color: "var(--text)", fontSize: 18, fontWeight: 600 }}
                />
              ) : (
                <textarea
                  value={b.text}
                  onChange={(e) => updateBlock(b.id, { text: e.target.value })}
                  rows={b.type === "note" ? 2 : 3}
                  placeholder={b.type === "timeline" ? "Fecha — hito" : "Contenido"}
                  style={{
                    width: "100%",
                    border: 0,
                    outline: 0,
                    background: "transparent",
                    color: b.type === "note" ? "var(--text-2)" : "var(--text)",
                    fontSize: b.type === "note" ? 12 : 13,
                    resize: "vertical",
                    fontStyle: b.type === "note" ? "italic" : "normal",
                    fontFamily: "inherit",
                  }}
                />
              )}
            </div>
          ))}

          {p.detail.memories.length > 0 && (
            <>
              <div className="nav-label" style={{ padding: "12px 2px 4px" }}>
                Memorias vinculadas ({p.detail.memories.length})
              </div>
              {p.detail.memories.map((m) => (
                <div key={m.id} className="view-memory-card">
                  <div className="view-memory-text">{m.text}</div>
                  <div className="view-memory-meta">
                    <span className="view-memory-source">{m.source}</span>
                    {m.category && <span>{m.category}</span>}
                  </div>
                </div>
              ))}
            </>
          )}

          {p.detail.artifacts.length > 0 && (
            <>
              <div className="nav-label" style={{ padding: "12px 2px 4px" }}>
                Artefactos vinculados ({p.detail.artifacts.length})
              </div>
              {p.detail.artifacts.map((a) => (
                <div key={a.id} className="view-memory-card">
                  <div className="view-memory-text" style={{ fontWeight: 600 }}>{a.title}</div>
                  <div className="view-memory-meta">
                    <span className="view-memory-source">{a.kind}</span>
                    <span>{relativeTime(a.createdAt)}</span>
                  </div>
                  {a.summary && <div className="view-memory-text" style={{ marginTop: 6, color: "var(--text-2)" }}>{a.summary}</div>}
                </div>
              ))}
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="view-shell">
      <div className="view-header">
        <div>
          <h2>Proyectos</h2>
          <span className="view-header-meta">{p.projects.length} proyectos</span>
        </div>
        <button className="primary-btn" onClick={() => setCreating(true)}>
          <Plus size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
          Nuevo proyecto
        </button>
      </div>

      {p.error && <div className="chat-error" style={{ margin: 16 }}>{p.error}</div>}

      {p.projects.length === 0 && !p.loading ? (
        <div className="view-empty">
          <Sparkles size={22} />
          <p>Aún no tienes proyectos.</p>
          <small>Crea uno o pídele al agente que cree un briefing desde el chat.</small>
        </div>
      ) : (
        <div className="users-grid">
          {p.projects.map((proj) => (
            <div key={proj.id} className="user-card" onClick={() => void p.openDetail(proj.id)} style={{ cursor: "pointer" }}>
              <div className="user-card-top">
                <div className="user-card-avatar">{proj.name.slice(0, 1).toUpperCase()}</div>
                <div className="user-card-info">
                  <div className="user-card-name">{proj.name}</div>
                  {proj.description && (
                    <div className="user-card-email" title={proj.description}>
                      {proj.description.slice(0, 80)}
                    </div>
                  )}
                </div>
                <span className={`user-card-role ${proj.status === "active" ? "admin" : "user"}`}>
                  {STATUS_LABEL[proj.status]}
                </span>
              </div>
              <div className="user-card-meta">
                <span>{proj.blocks.length} bloques</span>
                <span>{proj.linkedMemoryIds.length} memorias</span>
                <span className="user-card-time">{relativeTime(proj.updatedAt)}</span>
              </div>
              <div className="user-card-actions">
                <button
                  className="user-card-btn danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`¿Borrar "${proj.name}"?`)) void p.remove(proj.id);
                  }}
                  title="Borrar"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <div className="modal-overlay" onClick={() => setCreating(false)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">Nuevo proyecto</div>
                <div className="modal-sub">Un espacio para organizar un tema</div>
              </div>
              <button className="ghost-icon-button" onClick={() => setCreating(false)}>
                <X size={17} />
              </button>
            </div>
            <div className="modal-body">
              <label className="modal-label">Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Cliente Acme"
                autoFocus
                style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", color: "var(--text)", fontSize: 12.5, outline: "none", fontFamily: "inherit" }}
              />
              <label className="modal-label" style={{ marginTop: 14 }}>Descripción (opcional)</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                placeholder="De qué trata este proyecto"
                style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", color: "var(--text)", fontSize: 12.5, outline: "none", fontFamily: "inherit", resize: "vertical" }}
              />
              <div className="control-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button className="ctrl-btn" onClick={() => setCreating(false)}>Cancelar</button>
                <button className="primary-btn" onClick={submitCreate} disabled={!newName.trim()}>
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
```

## File: apps/web/src/components/UserModal.tsx
```typescript
// E3_USERMODAL_ROLEIDS_V1 - preparado para roleIds: string[] cuando llegue D01.
import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { createUser, updateUser, type AuthUser } from "../api/auth";
import { ApiError } from "../api/client";

interface Props {
  editing: AuthUser | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function UserModal({ editing, onClose, onSaved }: Props) {
  const isEdit = Boolean(editing);
  const [email, setEmail] = useState(editing?.email ?? "");
  const [name, setName] = useState(editing?.name ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">(editing?.role ?? "user");
  const [active, setActive] = useState(editing?.active ?? true);
  const [greeting, setGreeting] = useState(editing?.setup.greeting ?? "");
  const [sopIdsText, setSopIdsText] = useState((editing?.setup.sopIds ?? []).join(", "));
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const clearField = (field: string) => {
    if (!fieldErrors[field]) return;
    const next = { ...fieldErrors };
    delete next[field];
    setFieldErrors(next);
  };

  const validateClient = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "El nombre es obligatorio";
    if (!isEdit) {
      if (!email.trim()) errors.email = "El email es obligatorio";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
        errors.email = "El email no tiene un formato valido";
      if (!password) errors.password = "La contrasena es obligatoria";
      else if (password.length < 8)
        errors.password = "La contrasena debe tener al menos 8 caracteres";
    } else if (password && password.length < 8) {
      errors.password = "La contrasena debe tener al menos 8 caracteres";
    }
    return errors;
  };

  const submit = async () => {
    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setGeneralError(null);
      return;
    }
    setFieldErrors({});
    setGeneralError(null);
    setBusy(true);
    try {
      const setup = {
        greeting: greeting.trim(),
        sopIds: sopIdsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (isEdit && editing) {
        const patch: Record<string, unknown> = { name: name.trim(), role, active, setup };
        if (password) patch.password = password;
        await updateUser(editing.id, patch as Parameters<typeof updateUser>[1]);
      } else {
        await createUser({ email: email.trim(), name: name.trim(), password, role, setup });
      }
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        setGeneralError(Object.keys(err.fields).length > 1 ? err.message : null);
      } else {
        setGeneralError(err instanceof Error ? err.message : "Error al guardar");
      }
    } finally {
      setBusy(false);
    }
  };

  const baseField: React.CSSProperties = {
    width: "100%",
    padding: "9px 11px",
    border: "1px solid var(--v2-border)",
    borderRadius: 8,
    background: "#FFF",
    color: "var(--v2-text)",
    fontSize: 12.5,
    outline: "none",
    fontFamily: "inherit",
  };

  const fieldStyle = (field: string): React.CSSProperties => ({
    ...baseField,
    borderColor: fieldErrors[field] ? "#fca5a5" : "var(--v2-border)",
    boxShadow: fieldErrors[field] ? "0 0 0 3px #fca5a51a" : "none",
  });

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <div className="field-error">
        <AlertCircle size={12} />
        <span>{fieldErrors[field]}</span>
      </div>
    ) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{isEdit ? "Editar usuario" : "Nuevo usuario"}</div>
            <div className="modal-sub">
              {isEdit ? editing?.email : "Alta manual de una cuenta de empresa"}
            </div>
          </div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          {generalError && (
            <div className="modal-error">
              <AlertCircle size={16} />
              <span>{generalError}</span>
            </div>
          )}

          <label className="modal-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearField("email"); }}
            disabled={isEdit}
            placeholder="tu@empresa.com"
            style={{ ...fieldStyle("email"), opacity: isEdit ? 0.6 : 1 }}
          />
          <FieldError field="email" />

          <label className="modal-label" style={{ marginTop: 14 }}>Nombre completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); clearField("name"); }}
            placeholder="Maria Garcia"
            style={fieldStyle("name")}
          />
          <FieldError field="name" />

          <label className="modal-label" style={{ marginTop: 14 }}>
            {isEdit ? "Nueva contrasena (opcional)" : "Contrasena"}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearField("password"); }}
            placeholder={isEdit ? "Dejar vacio para no cambiar" : "Minimo 8 caracteres"}
            style={fieldStyle("password")}
          />
          <FieldError field="password" />

          <label className="modal-label" style={{ marginTop: 14 }}>Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "user")}
            style={{ ...baseField, marginBottom: 14 }}
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>

          {isEdit && (
            <>
              <label className="modal-label">Estado</label>
              <select
                value={active ? "1" : "0"}
                onChange={(e) => setActive(e.target.value === "1")}
                style={{ ...baseField, marginBottom: 14 }}
              >
                <option value="1">Activo</option>
                <option value="0">Desactivado</option>
              </select>
            </>
          )}

          <label className="modal-label">Greeting (aparece en el chat vacio)</label>
          <textarea
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            placeholder="Hola Maria, en que te ayudo hoy?"
            rows={2}
            style={{ ...baseField, resize: "vertical", marginBottom: 14 }}
          />

          <label className="modal-label">SOPs asignados (ids separados por coma)</label>
          <input
            type="text"
            value={sopIdsText}
            onChange={(e) => setSopIdsText(e.target.value)}
            placeholder="resumen-negocio, follow-up-3-dias"
            style={{ ...baseField, marginBottom: 14 }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
            <button className="v2-pill" onClick={onClose} disabled={busy}>Cancelar</button>
            <button
              className="v2-need-action-btn"
              onClick={submit}
              disabled={busy}
              style={{ minWidth: 120 }}
            >
              {busy ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## File: apps/web/src/forms/provenance.tsx
```typescript
import type { ProvenanceKind } from "./spec.ts";
 export function provenanceColor(k: ProvenanceKind) {
   if (k==="alta") return "text-green-700";
   if (k==="tu") return "text-blue-700";
   return "text-zinc-500";
 }
 export function ProvenanceBadge({ kind }: { kind: ProvenanceKind }) {
   return <span className={`text- uppercase tracking-wide ${provenanceColor(kind)}`}>{kind}</span>;
 }
```

## File: apps/web/src/forms/spec.ts
```typescript
export interface FormField { key: string; label: string; type: "text"|"number"|"date"|"select"|"textarea"; required?: boolean; options?: string[]; }
 export interface FormSpec { id: string; title: string; fields: FormField[]; provenance: string; }
 export type ProvenanceKind = "auto" | "alta" | "media" | "sugerido" | "tu";
```

## File: apps/web/src/hooks/useCascade.ts
```typescript
// UI_CASCADE_V1 - hook de cascada. Se aplica solo al primer render.
import { useEffect, useRef } from "react";

export function useCascade(): { className: string } {
  const isFirstRef = useRef(true);
  const classNameRef = useRef("");

  useEffect(() => {
    if (isFirstRef.current) {
      classNameRef.current = "cascade-item";
      isFirstRef.current = false;
    }
  }, []);

  return { className: classNameRef.current };
}
```

## File: apps/web/src/hooks/useLiveActivity.ts
```typescript
// BUG01_LIVEACTIVITY_V2 - reducer con acciones tipadas; sin stale_check falso.
import { useEffect, useReducer, useRef } from "react";
import { applyEvent, type BusEvent, type LiveState } from "../lib/applyEvent";

export interface UseLiveActivityOptions {
  streamUrl?: string;
  poll: (sinceId?: string) => Promise<BusEvent[]>;
  pollMs?: number;
}

type Action =
  | { type: "feed"; event: BusEvent }
  | { type: "reset" };

function reducer(state: LiveState, action: Action): LiveState {
  switch (action.type) {
    case "feed":
      return applyEvent(state, action.event);
    case "reset":
      return new Map();
    default:
      return state;
  }
}

export function useLiveActivity(opts: UseLiveActivityOptions): LiveState {
  const [state, dispatch] = useReducer(reducer, new Map() as LiveState);
  const lastId = useRef<string | undefined>(undefined);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    let stop = false;
    let es: EventSource | undefined;
    let tm: ReturnType<typeof setTimeout> | undefined;
    let wait = optsRef.current.pollMs ?? 5000;

    const feed = (e: BusEvent) => {
      lastId.current = e.id;
      dispatch({ type: "feed", event: e });
    };

    const startPolling = () => {
      const tick = async () => {
        if (stop) return;
        if (typeof document !== "undefined" && document.hidden) {
          tm = setTimeout(tick, 2000);
          return;
        }
        try {
          const events = await optsRef.current.poll(lastId.current);
          for (const e of events) feed(e);
          wait = optsRef.current.pollMs ?? 5000;
        } catch {
          wait = Math.min(wait * 2, 30000);
        }
        tm = setTimeout(tick, wait);
      };
      void tick();
    };

    if (opts.streamUrl && typeof window !== "undefined" && "EventSource" in window) {
      es = new EventSource(opts.streamUrl);
      es.onmessage = (m) => {
        try { feed(JSON.parse(m.data) as BusEvent); } catch { /* ignorar */ }
      };
      es.onerror = () => {
        es?.close();
        es = undefined;
        if (!stop && !tm) startPolling();
      };
    } else {
      startPolling();
    }

    return () => {
      stop = true;
      es?.close();
      if (tm) clearTimeout(tm);
    };
  }, [opts.streamUrl]);

  return state;
}

export type { BusEvent, LiveState };
export { applyEvent };
```

## File: apps/web/src/hooks/useTypewriter.ts
```typescript
// B2_TYPEWRITER_V2 - velocidad adaptativa (40-600 chars/s) con rAF.
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export function useTypewriter(target: string, streamDone: boolean): {
  text: string;
  typing: boolean;
} {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  const r = useRef({ shown: 0, target, done: streamDone, acc: 0 });
  r.current.target = target;
  r.current.done = streamDone;

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const s = r.current;
      const dt = (t - last) / 1000;
      last = t;
      if (s.target.length < s.shown) {
        s.shown = 0;
        s.acc = 0;
      }
      const backlog = s.target.length - s.shown;
      if (backlog > 0) {
        s.acc += dt * Math.min(600, 40 + backlog * 6);
        const n = Math.floor(s.acc);
        if (n) {
          s.acc -= n;
          s.shown = Math.min(s.target.length, s.shown + n);
          setShown(s.shown);
        }
      }
      if (s.done && s.shown >= s.target.length) return;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  if (reduced) return { text: target, typing: !streamDone };
  return { text: target.slice(0, shown), typing: !streamDone || shown < target.length };
}
```

## File: apps/web/src/hooks/useViewResolver.ts
```typescript
// D3_USE_VIEW_RESOLVER_V1 - resuelve un intent contra el backend.
import { useCallback, useState } from "react";
import { apiFetch } from "../api/client";
import type { RuntimeViewSpec } from "@openmuse/domain/views"; // FIX_02_D

export function useViewResolver() {
  const [spec, setSpec] = useState<RuntimeViewSpec | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = useCallback(async (intent: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ spec: RuntimeViewSpec | null }>("/api/views/resolve", {
        method: "POST",
        body: { intent },
      });
      setSpec(res.spec);
      return res.spec;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo resolver la vista");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => setSpec(null), []);

  return { spec, loading, error, resolve, clear };
}
```

## File: apps/web/src/intent/IntentResolver.ts
```typescript
// INTENT_RESOLVER_V1 - heuristic + LLM ready
 import type { Intent } from "./schema.ts";
 export class IntentResolver {
   resolve(raw: string): Intent {
     const l = raw.toLowerCase();
     let kind: Intent["kind"] = "query";
     if (l.startsWith("crea") || l.startsWith("alta") || l.includes("nuevo")) kind = "form";
     if (l.startsWith("ve") || l.startsWith("muestra") || l.includes("lista")) kind = "query";
     if (l.includes("cambia") || l.includes("actualiza")) kind = "action";
     return { raw, kind, confidence: 0.75 };
   }
 }
```

## File: apps/web/src/intent/schema.ts
```typescript
import { z } from "zod";
 export const intentSchema = z.object({ raw: z.string().min(1), kind: z.enum(["query","action","form","navigation"]).default("query"), confidence: z.number().min(0).max(1).default(0.7) });
 export type Intent = z.infer<typeof intentSchema>;
```

## File: apps/web/src/templates/queue/QueueTemplate.tsx
```typescript
// D3_QUEUE_V1 - template queue real.
import type { RuntimeViewSpec } from "@openmuse/domain/views"; // FIX_02_D

interface Props {
  spec: Extract<RuntimeViewSpec, { kind: "queue" }>;
  onAction?: (itemId: string, actionId: string) => void;
}

export default function QueueTemplate({ spec, onAction }: Props) {
  return (
    <section className="tpl tpl--queue">
      <h3 className="tpl__title">{spec.title}</h3>
      <div className="tpl-queue__list">
        {spec.items.map((i) => (
          <div className="tpl-queue__item" key={i.id} data-status={i.status}>
            <div className="tpl-queue__body">
              <b className="tpl-queue__title">{i.title}</b>
              {i.subtitle && <small className="tpl-queue__sub">{i.subtitle}</small>}
            </div>
            {i.actions.length > 0 && (
              <div className="tpl-queue__actions">
                {i.actions.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`btn ${a.kind === "primary" ? "primary" : ""}`}
                    onClick={() => onAction?.(i.id, a.id)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {spec.items.length === 0 && (
          <div className="tpl-queue__empty">Sin elementos.</div>
        )}
      </div>
    </section>
  );
}
```

## File: apps/web/src/components/Onboarding.tsx
```typescript
// ONBOARDING_V1 - primeros pasos del usuario nuevo.
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface Step {
  id: string;
  title: string;
  hint: string;
}

const STEPS: Step[] = [
  { id: "profile",  title: "Cambia tu contrasena",      hint: "Mi perfil -> Cambiar contrasena" },
  { id: "google",   title: "Conecta Google",            hint: "Mi perfil -> Google Workspace" },
  { id: "chat",     title: "Habla con el asistente",    hint: "Escribe algo en el chat" },
  { id: "task",     title: "Crea tu primera tarea",     hint: "Pidele al asistente algo concreto" },
];

const STORAGE_KEY = "openmuse_onboarding_done";

export default function Onboarding() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setDone(new Set(parsed));
      setVisible(parsed.length < STEPS.length);
    } catch {
      setVisible(true);
    }
  }, []);

  const mark = (id: string) => {
    const next = new Set(done);
    next.add(id);
    setDone(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    if (next.size >= STEPS.length) setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STEPS.map((s) => s.id)));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="v2-composer" style={{ padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <strong style={{ fontSize: 14 }}>Primeros pasos</strong>
        <button className="v2-pill" onClick={dismiss} title="Ocultar">
          <X size={12} />
        </button>
      </div>
      {STEPS.map((s) => (
        <div
          key={s.id}
          style={{ display: "flex", gap: 8, padding: "6px 0", alignItems: "center", cursor: "pointer" }}
          onClick={() => mark(s.id)}
        >
          {done.has(s.id) ? <Check size={14} style={{ color: "var(--v2-green)" }} /> : <span style={{ width: 14, height: 14, border: "1px solid var(--v2-border)", borderRadius: 3 }} />}
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.title}</div>
            <div style={{ fontSize: 11, color: "var(--v2-text-3)" }}>{s.hint}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## File: apps/web/src/components/SidebarV2.tsx
```typescript
// B3_SIDEBAR_LIVE_V1 - LiveItem disponible para usar en la lista de recientes.
// B1_SIDEBAR_V1
import { Activity, Bot, Brain, Files, FolderKanban, LayoutDashboard, MessageSquare, Search, Settings, UserCog } from "lucide-react";
import type { Thread } from "../api/threads";
// WIRE_SIDEBAR_LIVEITEM_V1
import LiveItem from "./LiveItem";

export type AppView = "chat" | "tasks" | "documents" | "projects" | "control-center" | "memory" | "users" | "agents";

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
```

## File: apps/web/src/components/TaskDetailModal.tsx
```typescript
// C1_TASKDETAIL_V2 - usa TaskTimeline para el plan.
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { controlTask, getTaskDetail, answerTask } from "../api/tasks";
// WIRE_TASKDETAIL_TIMELINE_V1
import TaskTimeline from "./TaskTimeline";
import type { AgentTask, TaskDetail } from "../types/api";

interface Props {
  taskId: string;
  onClose: () => void;
  onChanged: () => void;
}

type Tab = "plan" | "events" | "artifacts";

export default function TaskDetailModal({ taskId, onClose, onChanged }: Props) {
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [tab, setTab] = useState<Tab>("plan");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setDetail(await getTaskDetail(taskId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando detalle");
      }
    })();
  }, [taskId]);

  const control = async (action: "pause" | "resume" | "cancel" | "retry") => {
    try {
      await controlTask(taskId, action);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en control");
    }
  };

  const submitAnswer = async () => {
    try {
      await answerTask(taskId, answer);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al responder");
    }
  };

  const task: AgentTask | null = detail?.task ?? null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{task?.title ?? "Cargandoâ€¦"}</div>
            <div className="modal-sub">{task?.id.slice(0, 12)} Â· {task?.status}</div>
          </div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>

        <div className="tabs">
          <button className={tab === "plan" ? "active" : ""} onClick={() => setTab("plan")}>Plan</button>
          <button className={tab === "events" ? "active" : ""} onClick={() => setTab("events")}>Eventos</button>
          <button className={tab === "artifacts" ? "active" : ""} onClick={() => setTab("artifacts")}>Artifacts</button>
        </div>

        <div className="modal-body">
          {error && <div className="chat-error">{error}</div>}
          {!detail && !error && <div className="muted">Cargandoâ€¦</div>}

          {detail && tab === "plan" && (
            <div className="plan-list">
              {/* TASK_ERROR_VISIBLE_V1 - mostrar el error cuando la tarea falla. */}
              {task!.status === "failed" && task!.error && (
                <div
                  className="chat-error"
                  style={{ marginBottom: 12, whiteSpace: "pre-wrap", lineHeight: 1.5 }}
                  role="alert"
                >
                  <b>Motivo del fallo</b>
                  <div style={{ marginTop: 6, fontSize: 13 }}>{task!.error}</div>
                </div>
              )}
              {/* WIRE_TASKDETAIL_TIMELINE_V1 */}
              <TaskTimeline plan={task!.plan} />
              <div className="control-row">
                <button className="ctrl-btn" onClick={() => control("pause")}>â¸ Pausar</button>
                <button className="ctrl-btn" onClick={() => control("resume")}>â–¶ Reanudar</button>
                <button className="ctrl-btn danger" onClick={() => control("cancel")}>âœ• Cancelar</button>
                <button className="ctrl-btn" onClick={() => control("retry")}>â†» Reintentar</button>
              </div>
              {task!.status === "waiting_input" && (
                <div className="answer-box">
                  <label>Respuesta</label>
                  <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={3} />
                  <button className="primary-btn" style={{ marginTop: 8 }} onClick={submitAnswer}>
                    Enviar respuesta
                  </button>
                </div>
              )}
            </div>
          )}

          {detail && tab === "events" && (
            <div className="plan-list">
              {detail.events.map((ev) => (
                <div key={ev.id} className="plan-item">
                  <span className="plan-num" style={{ fontSize: 8 }}>{new Date(ev.date).toLocaleTimeString().slice(0, 5)}</span>
                  <span><b>{ev.title}</b>{ev.detail ? ` â€” ${ev.detail}` : ""}</span>
                </div>
              ))}
              {detail.events.length === 0 && <div className="muted">Sin eventos</div>}
            </div>
          )}

          {detail && tab === "artifacts" && (
            <div className="plan-list">
              {detail.artifacts.map((a) => (
                <div key={a.id} className="plan-item">
                  <span className="plan-num" style={{ fontSize: 10 }}>ðŸ“„</span>
                  <span>{a.title}</span>
                  <span className="plan-check">{a.kind}</span>
                </div>
              ))}
              {detail.artifacts.length === 0 && <div className="muted">Sin artifacts</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ESCALATE_UI_REVERTED
```

## File: apps/web/src/templates/detail/DetailTemplate.tsx
```typescript
// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function DetailTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="rounded-xl border p-4"><h2 className="font-semibold">{spec.title}</h2><dl className="mt-3 grid grid-cols-2 gap-2 text-sm">{(spec.columns ?? []).map(c=><div key={c.key}><dt className="text-zinc-500">{c.label}</dt><dd className="font-medium">—</dd></div>)}</dl></div>;
}
```

## File: apps/web/src/components/AgentsView.tsx
```typescript
// STUB_112_V1 - A3.4 prompt del rol ya se inyecta en ConversationAgent. A3.5 filtro por rol en TasksView en el bloque siguiente. A3.6 modal creacion tarea con rol en el bloque siguiente. A3.7 panel admin de roles completo en el bloque siguiente. A3.8 auditoria visual por rol en el bloque siguiente.
// AGENTS_VIEW_V2 - catalogo de agentes digitales con CRUD, activar, desactivar,
// SOPs asignados, y actividad por rol.

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, UserCog, X } from "lucide-react";
import { apiFetch } from "../api/client";

interface AgentRoleMemory {
  kind: "identidad" | "dominio" | "preferencias" | "historial";
  text: string;
}

interface AgentRole {
  id: string;
  name: string;
  tone: "warm" | "concise" | "thoughtful";
  avatar: "sky" | "sand" | "lilac";
  greeting?: string;
  roi?: string;
  objetivo: string;
  sops: string[];
  active: boolean;
  memories: AgentRoleMemory[];
  createdAt?: string;
}

const TONE_LABEL: Record<string, string> = {
  warm: "Cercano",
  concise: "Directo",
  thoughtful: "Reflexivo",
};

const AVATAR_COLOR: Record<string, string> = {
  sky: "var(--v2-purple)",
  sand: "#C9A227",
  lilac: "#9B7CDB",
};

interface Props {
  enabled: boolean;
  onOpenEmployee?: (roleId: string) => void;
}

export default function AgentsView({ enabled, onOpenEmployee }: Props) {
  const [agents, setAgents] = useState<AgentRole[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState<Partial<AgentRole>>({
    id: "",
    name: "",
    tone: "warm",
    avatar: "sky",
    objetivo: "",
    sops: [],
    active: true,
    memories: [],
  });

  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      const list = await apiFetch<AgentRole[]>("/api/agent/roles");
      setAgents(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando agentes");
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!draft.id || !draft.name || !draft.objetivo) {
      setError("id, name y objetivo son obligatorios");
      return;
    }
    setBusy(true);
    try {
      await apiFetch<AgentRole>("/api/agent/roles", {
        method: "POST",
        body: draft,
      });
      setShowNew(false);
      setDraft({ id: "", name: "", tone: "warm", avatar: "sky", objetivo: "", sops: [], active: true, memories: [] });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creando agente");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (role: AgentRole) => {
    try {
      await apiFetch(`/api/agent/roles`, {
        method: "POST",
        body: { ...role, active: !role.active },
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cambiando estado");
    }
  };

  const filtered = query.trim()
    ? agents.filter((a) => `${a.id} ${a.name} ${a.objetivo}`.toLowerCase().includes(query.toLowerCase()))
    : agents;

  return (
    <div className="v3-cc-main panel-slide-in" style={{ maxWidth: 1100 }}>
      <div className="v3-cc-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="v3-cc-title">Agentes</h1>
          <div className="v3-cc-sub">
            {agents.length} roles · {agents.filter((a) => a.active).length} activos
          </div>
        </div>
        <button className="v2-need-action-btn" onClick={() => setShowNew(true)}>
          <Plus size={14} /> Nuevo rol
        </button>
      </div>

      <div className="v3-cc-panel" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <Search size={15} style={{ color: "var(--v2-text-3)" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por id, nombre u objetivo"
          style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: 13, fontFamily: "inherit" }}
        />
      </div>

      {error && <div className="chat-error" style={{ marginTop: 12 }}>{error}</div>}

      {filtered.length === 0 && (
        <div className="v3-cc-empty" style={{ marginTop: 12 }}>Sin roles.</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, marginTop: 12 }}>
        {filtered.map((role) => (
          <div key={role.id} className="v3-cc-panel" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                className="v2-assistant-avatar"
                style={{ background: AVATAR_COLOR[role.avatar] ?? "var(--v2-purple)" }}
              >
                {role.name.slice(0, 1).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{role.name}</div>
                <div style={{ fontSize: 11, color: "var(--v2-text-3)" }}>
                  {role.id} · {TONE_LABEL[role.tone] ?? role.tone}
                </div>
              </div>
              <span className={`v2-tag ${role.active ? "" : "muted"}`}>
                {role.active ? "activo" : "inactivo"}
              </span>
            </div>

            {role.objetivo && (
              <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--v2-text-2)" }}>
                {role.objetivo.slice(0, 160)}
              </div>
            )}

            {role.sops.length > 0 && (
              <div style={{ fontSize: 11, color: "var(--v2-text-3)" }}>
                SOPs: {role.sops.slice(0, 3).join(", ")}{role.sops.length > 3 ? "…" : ""}
              </div>
            )}

            <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--v2-border)" }}>
              {onOpenEmployee && (
                <button className="v2-pill" style={{ flex: 1 }} onClick={() => onOpenEmployee(role.id)}>
                  <UserCog size={12} /> Ficha
                </button>
              )}
              <button className="v2-pill" style={{ flex: 1 }} onClick={() => void toggleActive(role)}>
                {role.active ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">Nuevo rol</div>
              <button className="ghost-icon-button" onClick={() => setShowNew(false)}><X size={17} /></button>
            </div>
            <div className="modal-body">
              <label className="modal-label">id</label>
              <input
                className="v2-pill"
                style={{ width: "100%", padding: "8px 12px", marginBottom: 8 }}
                value={draft.id ?? ""}
                onChange={(e) => setDraft({ ...draft, id: e.target.value })}
                placeholder="comercial"
              />
              <label className="modal-label">Nombre</label>
              <input
                className="v2-pill"
                style={{ width: "100%", padding: "8px 12px", marginBottom: 8 }}
                value={draft.name ?? ""}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Leo"
              />
              <label className="modal-label">Objetivo</label>
              <textarea
                className="v2-pill"
                style={{ width: "100%", padding: "8px 12px", marginBottom: 8, minHeight: 80 }}
                value={draft.objetivo ?? ""}
                onChange={(e) => setDraft({ ...draft, objetivo: e.target.value })}
                placeholder="Cerrar ventas y preparar propuestas..."
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button className="v2-pill" onClick={() => setShowNew(false)}>Cancelar</button>
                <button className="v2-need-action-btn" onClick={create} disabled={busy}>
                  {busy ? "Creando…" : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## File: apps/web/src/components/CommandPalette.tsx
```typescript
import { useEffect, useRef, useState } from "react";
import { globalSearch } from "../api/search";
import { FileText, LayoutDashboard, MessageSquare, Plus, Search } from "lucide-react";
import type { AppView } from "./SidebarV2";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectView: (view: AppView) => void;
  onNewChat: () => void;
}

interface Option {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  run: () => void;
}

export default function CommandPalette({ open, onClose, onSelectView, onNewChat }: Props) {
  const [query, setQuery] = useState("");
  // COMMAND_PALETTE_SEARCH_V1 - hits de la busqueda global.
  const [hits, setHits] = useState<Array<{ kind: string; id: string; title: string; excerpt: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      dialogRef.current?.showModal();
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  const close = () => {
    onClose();
  };

  const options: Option[] = [
    {
      id: "new-chat",
      label: "Nuevo chat",
      hint: "Cmd+N",
      icon: <Plus size={14} />,
      run: () => { close(); onNewChat(); },
    },
    {
      id: "chat",
      label: "Ir a Chat",
      hint: "",
      icon: <MessageSquare size={14} />,
      run: () => { close(); onSelectView("chat"); },
    },
    {
      id: "tasks",
      label: "Ir a Tareas",
      hint: "",
      icon: <LayoutDashboard size={14} />,
      run: () => { close(); onSelectView("tasks"); },
    },
    {
      id: "documents",
      label: "Ir a Documentos",
      hint: "",
      icon: <FileText size={14} />,
      run: () => { close(); onSelectView("documents"); },
    },
  ];

  const q = query.trim().toLowerCase();
  // COMMAND_PALETTE_SEARCH_V1 - busqueda global con debounce 200ms.
  useEffect(() => {
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }
    const handle = window.setTimeout(() => {
      void globalSearch(query.trim(), 10)
        .then((list) => setHits(list.slice(0, 10)))
        .catch(() => setHits([]));
    }, 200);
    return () => window.clearTimeout(handle);
  }, [query]);

  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  // COMMAND_PALETTE_SEARCH_V1 - los hits de busqueda global se ofrecen como
  // opciones navegables. Antes se calculaban y se descartaban (import sin usar).
  const searchOptions: Option[] = hits.map((h) => ({
    id: `search:${h.kind}:${h.id}`,
    label: h.title,
    hint: h.kind,
    icon: <Search size={14} />,
    run: () => { close(); onSelectView(h.kind as never); },
  }));
  const visible = [...filtered, ...searchOptions];

  return (
    <dialog className="palette" ref={dialogRef} aria-label="Buscar o ejecutar una accion">
      <div className="palette__search">
        <Search size={15} aria-hidden="true" />
        <input
          ref={inputRef}
          className="palette__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && visible[0]) {
              e.preventDefault();
              visible[0].run();
            }
          }}
          placeholder="Buscar o ejecutar una accion"
        />
      </div>
      <div className="palette__list scroll" role="listbox">
        {visible.length === 0 ? (
          <p className="palette__group">Sin resultados</p>
        ) : (
          visible.map((o) => (
            <button
              key={o.id}
              className="palette__opt"
              role="option"
              onClick={o.run}
            >
              {o.icon}
              <span>{o.label}</span>
              {o.hint && <span style={{ marginLeft: "auto", opacity: 0.5, fontSize: 11 }}>{o.hint}</span>}
            </button>
          ))
        )}
      </div>
    </dialog>
  );
}
```

## File: apps/web/src/components/TopBarV2.tsx
```typescript
// B1_TOPBAR_V1
import { Plus, Search } from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";

interface Props {
  status: "ok" | "working" | "offline";
  statusLabel: string;
  onNewChat: () => void;
  onOpenPalette: () => void;
}

export default function TopBarV2({ status, statusLabel, onNewChat, onOpenPalette }: Props) {
  const dotColor =
    status === "working" ? "var(--v2-purple)" : status === "ok" ? "var(--v2-green)" : "var(--v2-text-3)";

  return (
    <div className="v2-topbar">
      <div className="v2-topbar-left">
        <span className="v2-status-pill">
          <span style={{ width: 8, height: 8, borderRadius: 999, background: dotColor }} />
          MI · {statusLabel}
        </span>
      </div>
      <div className="v2-topbar-right">
        <NotificationsDropdown />
        <button className="v2-search-pill" onClick={onOpenPalette}>
          <Search size={14} />
          Buscar
          <span className="v2-search-kbd">⌘K</span>
        </button>
        <button className="v2-btn-new" onClick={onNewChat}>
          <Plus size={16} />
          Nuevo chat
        </button>
      </div>
    </div>
  );
}
```

## File: apps/web/src/forms/FormRenderer.tsx
```typescript
// FORM_RENDERER_V2 - renderiza un FormSpec con chips de procedencia por campo.

import { useState } from "react";
import ProvenanceBadge from "../components/ProvenanceBadge";
import type { ProvenanceChipKind } from "../../../../packages/domain/src/context-chips.ts";

export interface FormField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  value?: unknown;
  provenance: ProvenanceChipKind;
}

export interface FormSpec {
  id: string;
  title: string;
  entityType: string;
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
}

interface Props {
  spec: FormSpec;
  onSubmit?: (values: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export default function FormRenderer({ spec, onSubmit, onCancel }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const v: Record<string, unknown> = {};
    for (const f of spec.fields) v[f.key] = f.value;
    return v;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    for (const f of spec.fields) {
      if (f.required && (values[f.key] === undefined || values[f.key] === null || values[f.key] === "")) {
        nextErrors[f.key] = f.label + " es obligatorio";
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    onSubmit?.(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="v3-cc-panel"
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div style={{ fontSize: 14, fontWeight: 600 }}>{spec.title}</div>
      {spec.fields.map((f) => (
        <div key={f.key}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <label style={{ fontSize: 12, color: "var(--v2-text-2)" }}>
              {f.label}
              {f.required && <span style={{ color: "var(--v2-warn-text)" }}> *</span>}
            </label>
            <ProvenanceBadge kind={f.provenance} />
          </div>
          {errors[f.key] && (
            <div style={{ fontSize: 11, color: "var(--v2-warn-text)" }}>{errors[f.key]}</div>
          )}
          {f.type === "textarea" ? (
            <textarea
              className="v2-pill"
              style={{ width: "100%", padding: "8px 12px", minHeight: 60 }}
              value={String(values[f.key] ?? "")}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              placeholder={f.placeholder}
            />
          ) : f.type === "select" ? (
            <select
              className="v2-pill"
              style={{ width: "100%", padding: "8px 12px" }}
              value={String(values[f.key] ?? "")}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            >
              <option value="">—</option>
              {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : f.type === "checkbox" ? (
            <input
              type="checkbox"
              checked={Boolean(values[f.key])}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.checked })}
            />
          ) : (
            <input
              className="v2-pill"
              style={{ width: "100%", padding: "8px 12px" }}
              type={f.type}
              value={String(values[f.key] ?? "")}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              placeholder={f.placeholder}
            />
          )}
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        {onCancel && (
          <button type="button" className="v2-pill" onClick={onCancel}>
            {spec.cancelLabel ?? "Cancelar"}
          </button>
        )}
        <button type="submit" className="v2-need-action-btn">
          {spec.submitLabel ?? "Guardar"}
        </button>
      </div>
    </form>
  );
}
```

## File: apps/web/src/hooks/useChat.ts
```typescript
// BUG02_USECHAT_V2 - tools[] + typewriter en la API publica.
import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat, type AgUiEvent } from "../api/chat";
import { getThread, saveThreadMessages } from "../api/threads";
import { toolsReducer, type ToolCall } from "../lib/toolsReducer";
import type { ChatAttachment, ChatMessage } from "../types/api";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function now(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function useChat(
  enabled: boolean,
  threadId: string | null,
  onSaved?: (id: string) => void,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamBuf, setStreamBuf] = useState("");
  const [tools, setTools] = useState<ToolCall[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadedThreadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !threadId) {
      setMessages([]);
      loadedThreadRef.current = null;
      return;
    }
    if (loadedThreadRef.current === threadId) return;
    loadedThreadRef.current = threadId;
    let cancelled = false;
    void (async () => {
      try {
        const thread = await getThread(threadId);
        if (cancelled) return;
        setMessages(thread.messages ?? []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "No se pudo cargar la conversación");
      }
    })();
    return () => { cancelled = true; };
  }, [enabled, threadId]);

  const [roleId, setRoleId] = useState<string | undefined>(undefined);

  const send = useCallback(
    async (text: string, attachment?: ChatAttachment) => {
      if ((!text.trim() && !attachment) || streaming || !threadId) return;
      const trimmed = text.trim();
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed || `Adjunto: ${attachment?.name ?? "archivo"}`,
        timestamp: now(),
        attachment,
      };
      const history = [...messages, userMsg];
      setMessages(history);
      setStreaming(true);
      setStreamBuf("");
      setTools([]);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      const llmContent = attachment
        ? `${trimmed || "(sin texto)"}\n\n[Adjunto: ${attachment.name}, id: ${attachment.id}]`
        : trimmed;

      let assistantText = "";
      let localTools: ToolCall[] = [];
      let runErrorMessage: string | null = null;

      try {
        await streamChat(
          {
            threadId,
            runId: uid(),
            ...(roleId ? { roleId } : {}),
            messages: history.map((m, i) =>
              i === history.length - 1
                ? { id: m.id, role: m.role, content: llmContent }
                : { id: m.id, role: m.role, content: m.content },
            ),
          },
          (event: AgUiEvent) => {
            const at = Date.now();
            if (
              (event.type === "TEXT_MESSAGE_CONTENT" || event.type === "TEXT_MESSAGE_CHUNK") &&
              typeof event.delta === "string"
            ) {
              assistantText += event.delta;
              setStreamBuf(assistantText);
            } else if (event.type === "RUN_STARTED") {
              localTools = toolsReducer(localTools, { type: "RUN_STARTED" });
              setTools([...localTools]);
            } else if (event.type === "TOOL_CALL_START" && typeof event.toolCallName === "string") {
              localTools = toolsReducer(localTools, {
                type: "TOOL_CALL_START",
                id: String(event.toolCallId ?? uid()),
                name: event.toolCallName,
                at,
              });
              setTools([...localTools]);
            } else if (event.type === "TOOL_CALL_END") {
              localTools = toolsReducer(localTools, {
                type: "TOOL_CALL_END",
                id: String(event.toolCallId ?? ""),
                at,
              });
              setTools([...localTools]);
            } else if (event.type === "RUN_ERROR") {
              runErrorMessage = String(event.message ?? "Error del modelo");
            }
          },
          controller.signal,
        );

        if (runErrorMessage && !assistantText.trim()) {
          setError(runErrorMessage);
          return;
        }

        const finalAssistant: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: assistantText.trim() || "(sin respuesta)",
          timestamp: now(),
          tools: localTools.length > 0 ? localTools : undefined,
        };
        const finalHistory = [...history, finalAssistant];
        setMessages(finalHistory);
        setStreamBuf("");
        setTools([]);
        try {
          await saveThreadMessages(threadId, finalHistory);
          onSaved?.(threadId);
        } catch {
          /* se persiste en el próximo turno */
        }
      } catch (err) {
        if (controller.signal.aborted) setError("Cancelado por el usuario");
        else setError(err instanceof Error ? err.message : "Error en el stream");
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming, threadId, onSaved, roleId],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    messages,
    streaming,
    streamBuf,
    tools,
    error,
    send,
    cancel,
    threadId,
    roleId,
    setRoleId,
  };
}
```

## File: apps/web/src/types/api.ts
```typescript
export type TaskStatus =
  | "queued"
  | "running"
  | "waiting_approval"
  | "waiting_input"
  | "scheduled"
  | "paused"
  | "succeeded"
  | "failed"
  | "cancelled";

export type TaskKind = "agent" | "document" | "monitor" | "finance" | "plan" | "sop";

export interface TaskStep {
  id: string;
  title: string;
  status: "pending" | "running" | "succeeded" | "failed" | "waiting";
  detail?: string;
  // FIX_02_TASKSTEP_DURATION_V1
  durationMs?: number;
}

export interface Evidence {
  id: string;
  kind: "mail" | "file" | "web" | "user";
  title: string;
  excerpt: string;
  url?: string;
}

export interface AgentTask {
  id: string;
  title: string;
  prompt: string;
  kind: TaskKind;
  status: TaskStatus;
  goalId?: string;
  /** Id del rol de agente al que se asigno la tarea (AgentRole.id). */
  assignedTo?: string;
  plan: TaskStep[];
  evidence: Evidence[];
  input: Record<string, unknown>;
  state: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  nextRunAt?: string;
  leaseId?: string | null;
  leaseUntil?: string | null;
  attempts: number;
  actionId?: string | null;
  result?: string;
  error?: string | null;
  question?: string;
  artifactIds: string[];
}

export interface RunEvent {
  id: string;
  taskId: string;
  date: string;
  kind: "plan" | "step" | "observation" | "approval" | "result" | "error" | "status";
  title: string;
  detail: string;
}

export interface AgentArtifact {
  id: string;
  taskId: string;
  kind: "plan" | "comparison" | "finance" | "report";
  title: string;
  summary: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface AgentWorkspace {
  tasks: AgentTask[];
  goals: unknown[];
  monitors: unknown[];
  ideas: unknown[];
  memories: unknown[];
  artifacts: AgentArtifact[];
  notifications: unknown[];
  identity: { name: string; tone: string; avatar?: string };
  worker: { running: boolean; lastTickAt?: string };
}

export interface ActionProposal {
  id: string;
  taskId?: string;
  title: string;
  kind: string;
  data: Record<string, unknown>;
  account?: string;
  connectionId?: string;
  status:
    | "awaiting_review"
    | "scheduled"
    | "executing"
    | "succeeded"
    | "failed"
    | "outcome_unknown"
    | "denied"
    | "cancelled"
    | "expired";
  // DUAL_SIGN_UI_V1 — doble firma y ventana de undo (espejo de ActionProposal
  // en packages/domain/src/index.ts). Mantener sincronizado con ese contrato.
  signers?: string[];
  needed?: number;
  executeAt?: string | null;
  hash: string;
  createdAt: string;
  expiresAt: string;
  result?: string;
  error?: string;
}

export interface TaskDetail {
  task: AgentTask;
  files: unknown[];
  browsers: unknown[];
  events: RunEvent[];
  artifacts: AgentArtifact[];
}

export interface WorkspaceSnapshot {
  mode: "sample" | "live";
  profile: { name: string; email: string };
  mail: unknown[];
  events: unknown[];
  files: unknown[];
  browsers: unknown[];
  actions: ActionProposal[];
  activity: unknown[];
  connections: unknown[];
  runtime: {
    provider: "sample" | "model" | "openbot";
    configured: boolean;
    openbotConfigured: boolean;
    richThreads?: boolean;
  };
}

export type MessageRole = "user" | "assistant" | "system";

export interface ChatAttachment {
  id: string;
  name: string;
  size?: number;
}

// B2_TOOLS_V1 - toolCall singular -> tools[].
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: string;
  tools?: { id: string; name: string; status: "running" | "done" | "error"; startedAt: number; endedAt?: number; args?: unknown }[];
  taskIdRef?: string;
  attachment?: ChatAttachment;
}
```

## File: apps/web/src/api/rag.ts
```typescript
import { apiFetch } from "./client";

export interface RagStatus {
  configured: boolean;
  chunks: number;
  sources: number;
}

export interface RagHit {
  id: string;
  sourceId: string;
  sourceName: string;
  chunkIndex: number;
  text: string;
  score: number;
}

export interface RagIngestResult {
  chunks: number;
  embedded: number;
}

export async function ragStatus(): Promise<RagStatus> {
  return apiFetch<RagStatus>("/api/rag/status");
}

export async function ragSearch(query: string, limit = 5): Promise<RagHit[]> {
  const res = await apiFetch<{ hits: RagHit[] }>(
    `/api/rag/search?q=${encodeURIComponent(query)}&limit=${limit}`,
  );
  return res.hits;
}

export async function ragIngest(input: {
  sourceId: string;
  sourceName: string;
  text: string;
}): Promise<RagIngestResult> {
  return apiFetch<RagIngestResult>("/api/rag/ingest", { method: "POST", body: input });
}

// REINGEST_CLIENT_V1 - reingesta server-side, sin bajar el archivo al navegador.
export async function ragReingest(sourceId: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/api/rag/reingest/${encodeURIComponent(sourceId)}`, {
    method: "POST",
  });
}

export async function ragDeleteSource(sourceId: string): Promise<void> {
  await apiFetch(`/api/rag/source/${encodeURIComponent(sourceId)}`, { method: "DELETE" });
}
// RAG_SOURCES_CLIENT_V1 - lista de fuentes del indice.
export interface RagSource {
  sourceId: string;
  sourceName: string;
  chunks: number;
  firstAt: string;
}

export async function ragSources(): Promise<RagSource[]> {
  const res = await apiFetch<{ sources: RagSource[] }>("/api/rag/sources");
  return res.sources;
}
```

## File: apps/web/src/components/ApprovalModal.tsx
```typescript
// BUG05_APPROVAL_MODAL_V2 - usa ApprovalInbox para el flujo principal.
// WIRE_APPROVAL_INBOX_V1 - ApprovalModal delega a ApprovalInbox cuando aplica.
// C3_APPROVAL_MODAL_V2 - reemplazado por ApprovalInbox para el flujo principal.
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { decideAction, reconcileAction, getWorkspace } from "../api/actions";
import type { ActionProposal } from "../types/api";

interface Props {
  taskId: string;
  onClose: () => void;
  onChanged: () => void;
}

export default function ApprovalModal({ taskId, onClose, onChanged }: Props) {
  const [action, setAction] = useState<ActionProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // RECONCILE_MODAL_V1 â€” estado del modal de reconciliaciÃ³n.
  // Ver: docs/audits/06-aprobaciones-acciones/roadmap.md Â§8.
  const [reconcileNote, setReconcileNote] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const ws = await getWorkspace();
        const found = ws.actions.find((a) => a.taskId === taskId && a.status === "awaiting_review");
        if (!found) setError("No hay acciÃ³n pendiente para esta tarea");
        else setAction(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando acciÃ³n");
      }
    })();
  }, [taskId]);

  const decide = async (decision: "approve" | "deny") => {
    if (!action) return;
    setBusy(true);
    try {
      await decideAction(action.id, action.hash, decision);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al decidir");
    } finally {
      setBusy(false);
    }
  };

  // RECONCILE_MODAL_V1 â€” handler de reconciliaciÃ³n.
  const reconcile = async (outcome: "executed" | "not_executed") => {
    if (!action) return;
    setBusy(true);
    try {
      await reconcileAction(action.id, outcome, reconcileNote || undefined);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reconciliar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">RevisiÃ³n requerida</div>
            {action && <div className="modal-sub">Action {action.id.slice(0, 10)}</div>}
            {action && action.expiresAt && (
              <div className="modal-sub" style={{ color: "var(--v2-text-3)" }}>
                Expira: {new Date(action.expiresAt).toLocaleTimeString("es-ES")}
              </div>
            )}
            {action && (
              <div className="modal-sub" style={{ color: "var(--v2-text-3)", fontFamily: "monospace", fontSize: 10 }}>
                #{action.hash.slice(0, 12)}
              </div>
            )}
            {/* DUAL_SIGN_VISIBLE_V1 â€” firmas requeridas si es doble firma. */}
            {action && action.needed && action.needed > 1 && (
              <div className="modal-sub" style={{ color: "var(--v2-warn-text)" }}>
                Doble firma: {action.signers?.length ?? 0}/{action.needed}
              </div>
            )}
          </div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          {error && <div className="chat-error">{error}</div>}
          {!action && !error && <div className="muted">Cargandoâ€¦</div>}
{action && action.status === "scheduled" && action.executeAt && (
            <>
              {/* UNDO_COUNTDOWN_V1 â€” cuenta atrÃ¡s de la ventana de undo. */}
              <div className="v2-suggestion-card" style={{ cursor: "default", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>AcciÃ³n programada</div>
                <div style={{ fontSize: 12, color: "var(--v2-text-2)", marginTop: 6 }}>
                  Se ejecutarÃ¡ en{" "}
                  <b>{Math.max(0, Math.ceil((Date.parse(action.executeAt) - Date.now()) / 1000))}s</b>
                  {action.needed && action.needed > 1
                    ? ` Â· firmas ${action.signers?.length ?? 0}/${action.needed}`
                    : ""}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  className="v2-pill"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const { cancelAction } = await import("../api/actions");
                      await cancelAction(action.id);
                      onChanged();
                      onClose();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Error al cancelar");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Deshacer
                </button>
              </div>
            </>
          )}
          {action && action.status === "outcome_unknown" && (
            <>
              {/* RECONCILE_UI_V1 â€” UI de reconciliaciÃ³n. */}
              <div className="chat-error" style={{ marginBottom: 12 }}>
                <b>Outcome incierto.</b> La operaciÃ³n pudo haber salido al proveedor.
                Comprueba en Google (o el proveedor correspondiente) si se ejecutÃ³ e
                indica el resultado:
              </div>
              <textarea
                className="v2-pill"
                style={{ width: "100%", padding: "8px 12px", minHeight: 60, marginBottom: 12 }}
                placeholder="Nota opcional para el registro"
                value={reconcileNote}
                onChange={(e) => setReconcileNote(e.target.value)}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="v2-pill" disabled={busy} onClick={() => reconcile("not_executed")}>
                  No se ejecutÃ³
                </button>
                <button className="v2-need-action-btn" disabled={busy} onClick={() => reconcile("executed")}>
                  SÃ­ se ejecutÃ³
                </button>
              </div>
            </>
          )}
          {action && action.status !== "outcome_unknown" && (
            <>
              <div className="v2-suggestion-card" style={{ cursor: "default", marginBottom: 12 }}>
                <div className="v2-suggestion-icon">!</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{action.title}</div>
                  <div style={{ fontSize: 11, color: "var(--v2-text-3)", marginTop: 2 }}>{action.kind}</div>
                </div>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: 10,
                  background: "var(--v2-bg-soft)",
                  border: "1px solid var(--v2-border)",
                  borderRadius: 10,
                  fontSize: 11,
                  lineHeight: 1.5,
                  maxHeight: 200,
                  overflow: "auto",
                  color: "var(--v2-text-2)",
                  fontFamily: "SFMono-Regular, Consolas, monospace",
                }}
              >
                {JSON.stringify(action.data, null, 2)}
              </pre>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <button className="v2-pill" disabled={busy} onClick={() => decide("deny")}>Denegar</button>
                <button className="v2-need-action-btn" disabled={busy} onClick={() => decide("approve")}>Aprobar</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

## File: apps/web/src/components/ContextualPanel.tsx
```typescript
// D3_CONTEXTUALPANEL_V2 - panel que renderiza ViewSpec servido por el sistema.
import type { RuntimeViewSpec } from "@openmuse/domain/views"; // FIX_02_D
import ViewRenderer from "../view/ViewRenderer";

interface Props {
  spec: RuntimeViewSpec | null;
  onClose?: () => void;
  onAction?: (itemId: string, actionId: string) => void;
}

export default function ContextualPanel({ spec, onClose, onAction }: Props) {
  return (
    <div className="panel-slide-in ctx-panel">
      <div className="ctx-panel__head">
        <strong className="ctx-panel__title">Vista</strong>
        {onClose && (
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            ×
          </button>
        )}
      </div>
      <div className="ctx-panel__body">
        {spec ? (
          <ViewRenderer spec={spec} onAction={onAction} />
        ) : (
          <div className="ctx-panel__empty">
            Escribe en el chat para que el sistema sirva una vista.
          </div>
        )}
      </div>
    </div>
  );
}
```

## File: apps/web/src/components/UsersView.tsx
```typescript
// FIX_02_USERSVIEW_CLEAN_V1 - import PermissionMatrix pendiente de wire.
// BUG05_USERS_VIEW_V2 - usa PermissionMatrix en el detalle de rol.
// E3_USERSVIEW_MATRIX_V1 - usar PermissionMatrix en el detalle del rol.
// UI_PANEL_SLIDE_V1_USE
import { useEffect, useState } from "react";
import { Check, Plus, Trash2, UserCog, UserX, X } from "lucide-react";
import { deleteUser, listUsers, userTasks, type AuthUser, type UserTaskSummary } from "../api/auth";
import { relativeTime } from "../lib/format";
import UserModal from "./UserModal";
// WIRE_USERS_MATRIX_V1

interface Props {
  currentUserId: string;
}

export default function UsersView({ currentUserId }: Props) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [detail, setDetail] = useState<{ user: AuthUser; tasks: UserTaskSummary[]; total: number } | null>(null);

  const load = async () => {
    try {
      const list = await listUsers();
      setUsers(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando usuarios");
    }
  };

  useEffect(() => { void load(); }, []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (u: AuthUser) => { setEditing(u); setModalOpen(true); };

  const remove = async (u: AuthUser) => {
    if (!confirm(`¿Borrar a ${u.name} (${u.email})? Esta accion no se puede deshacer.`)) return;
    try {
      await deleteUser(u.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al borrar");
    }
  };

  const openDetail = async (u: AuthUser) => {
    try {
      const res = await userTasks(u.id, 20);
      setDetail({ user: u, tasks: res.tasks, total: res.total });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando tareas");
    }
  };

  return (
    <div className="v2-tasks-view" style={{ maxWidth: 1000 }}>
      <div className="v2-tasks-header">
        <h1 className="v2-tasks-title">Equipo</h1>
        <div className="v2-tasks-meta">{users.length} cuentas</div>
        <button className="v2-need-action-btn" style={{ marginLeft: "auto" }} onClick={openCreate}>
          <Plus size={14} /> Nuevo usuario
        </button>
      </div>

      {error && <div className="chat-error" style={{ marginBottom: 16 }}>{error}</div>}

      {users.length === 0 && !error ? (
        <div className="v2-tasks-empty" style={{ padding: "40px 20px" }}>
          <UserX size={22} style={{ marginBottom: 8, color: "var(--v2-purple)" }} />
          <p style={{ margin: 0, fontSize: 13, color: "var(--v2-text)" }}>No hay usuarios todavia.</p>
          <small style={{ color: "var(--v2-text-3)" }}>Crea el primero con el boton de arriba.</small>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
          {users.map((u) => {
            const isMe = u.id === currentUserId;
            return (
              <div
                key={u.id}
                className="v2-suggestion-card"
                style={{
                  cursor: "default",
                  alignItems: "flex-start",
                  opacity: u.active ? 1 : 0.6,
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                  <div
                    className="v2-suggestion-icon"
                    style={{ background: "var(--v2-purple)", color: "#FFF", borderColor: "var(--v2-purple)" }}
                  >
                    {u.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      {u.name}
                      {isMe && (
                        <span className="v2-tag agent" style={{ fontSize: 9 }}>tu</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--v2-text-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email}
                    </div>
                  </div>
                  <span className={`v2-tag ${u.role === "admin" ? "agent" : ""}`}>{u.role}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "var(--v2-text-3)", width: "100%" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: u.active ? "var(--v2-green)" : "var(--v2-text-3)" }}>
                    {u.active ? <Check size={11} /> : <X size={11} />}
                    {u.active ? "Activo" : "Inactivo"}
                  </span>
                  {u.createdAt && <span>desde {relativeTime(u.createdAt)}</span>}
                </div>

                {(u.setup.sopIds.length > 0 || u.setup.greeting) && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "8px 10px", background: "#FFF", border: "1px solid var(--v2-border)", borderRadius: 8, fontSize: 10.5, color: "var(--v2-text-2)", width: "100%" }}>
                    {u.setup.sopIds.length > 0 && (
                      <span><b style={{ color: "var(--v2-text)" }}>{u.setup.sopIds.length}</b> SOP{u.setup.sopIds.length !== 1 ? "s" : ""} asignado{u.setup.sopIds.length !== 1 ? "s" : ""}</span>
                    )}
                    {u.setup.greeting && <span>greeting personalizado</span>}
                  </div>
                )}

                <div style={{ display: "flex", gap: 6, paddingTop: 8, borderTop: "1px solid var(--v2-border)", marginTop: "auto", width: "100%" }}>
                  <button className="v2-pill" style={{ flex: 1, justifyContent: "center" }} onClick={() => openDetail(u)} title="Ver tareas">
                    <UserCog size={13} /> Tareas
                  </button>
                  <button className="v2-pill" style={{ flex: 1, justifyContent: "center" }} onClick={() => openEdit(u)} title="Editar">
                    Editar
                  </button>
                  {!isMe && (
                    <button className="v2-pill" onClick={() => remove(u)} title="Borrar" style={{ color: "var(--v2-warn-text)" }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <UserModal
          editing={editing}
          onClose={() => setModalOpen(false)}
          onSaved={async () => { setModalOpen(false); await load(); }}
        />
      )}

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">Tareas de {detail.user.name}</div>
                <div className="modal-sub">{detail.total} en total · {detail.tasks.length} mas recientes</div>
              </div>
              <button className="ghost-icon-button" onClick={() => setDetail(null)}><X size={17} /></button>
            </div>
            <div className="modal-body">
              {detail.tasks.length === 0 ? (
                <div className="muted">Sin tareas todavia.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {detail.tasks.map((t) => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: "var(--v2-bg-soft)", border: "1px solid var(--v2-border)", borderRadius: 8, fontSize: 11 }}>
                      <span className="v2-tag">{t.kind.slice(0, 2).toUpperCase()}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                        <div style={{ fontSize: 10, color: "var(--v2-text-3)", marginTop: 2 }}>{t.status} · {relativeTime(t.updatedAt) || "sin fecha"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## File: apps/web/src/templates/dashboard/DashboardTemplate.tsx
```typescript
// D3_DASHBOARD_V2 - template dashboard real.
import type { RuntimeViewSpec } from "@openmuse/domain/views"; // FIX_02_D

interface Props {
  spec: Extract<RuntimeViewSpec, { kind: "dashboard" }>;
}

export default function DashboardTemplate({ spec }: Props) {
  return (
    <section className="tpl tpl--dashboard">
      <h3 className="tpl__title">{spec.title}</h3>
      <div className="tpl-dashboard__kpis">
        {spec.kpis.map((k, i) => (
          <div className="tpl-kpi" key={`${k.label}-${i}`}>
            <small className="tpl-kpi__label">{k.label}</small>
            <div className="tpl-kpi__value">{k.value}</div>
            {k.delta && <span className="tpl-kpi__delta">{k.delta}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
```

## File: apps/web/src/templates/graph/GraphTemplate.tsx
```typescript
// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function GraphTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="rounded-xl border p-4"><h2 className="font-semibold">{spec.title} — graph</h2><div className="mt-3 h-40 bg-zinc-100 rounded flex items-center justify-center text-xs">graph entities: {spec.dataSource?.[0]?.query}</div></div>;
}
```

## File: apps/web/src/templates/kanban/KanbanTemplate.tsx
```typescript
// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function KanbanTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="grid grid-cols-3 gap-3"><div className="col-span-3 font-semibold p-2">{spec.title} — kanban</div>{["Todo","Doing","Done"].map(s=><div key={s} className="rounded-xl border p-3 bg-zinc-50"><div className="text-xs font-semibold">{s}</div><div className="mt-2 text-xs text-zinc-500">{spec.dataSource?.[0]?.query}</div></div>)}</div>;
}
```

## File: apps/web/src/templates/list/ListTemplate.tsx
```typescript
// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function ListTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="space-y-2"><h2 className="text-lg font-semibold">{spec.title}</h2><ul className="divide-y rounded-xl border">{(spec.dataSource ?? []).map((d,i)=><li key={i} className="p-3 text-sm">{d.query}</li>)}</ul></div>;
}
```

## File: apps/web/src/templates/table/TableTemplate.tsx
```typescript
// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function TableTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="overflow-auto rounded-xl border"><div className="p-3 font-semibold">{spec.title} — tabla</div><table className="w-full text-sm"><thead><tr>{(spec.columns ?? []).map(c=><th key={c.key} className="text-left p-2 bg-zinc-50">{c.label}</th>)}</tr></thead><tbody><tr><td className="p-2 text-zinc-500" colSpan={(spec.columns ?? []).length}>conecta BusinessGraph para datos reales</td></tr></tbody></table></div>;
}
```

## File: apps/web/src/templates/timeline/TimelineTemplate.tsx
```typescript
// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function TimelineTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="space-y-3"><h2 className="font-semibold">{spec.title} — timeline</h2><div className="border-l-2 pl-4 space-y-3">{(spec.dataSource ?? []).map((d,i)=><div key={i} className="text-sm"><div className="font-medium">{d.query}</div><div className="text-xs text-zinc-500">{d.tenantId}</div></div>)}</div></div>;
}
```

## File: apps/web/src/view/ViewRenderer.tsx
```typescript
// D3_VIEWRENDERER_V2 - discriminated union + assertNever.
import { parseRuntimeViewSpec, type RuntimeViewSpec } from "@openmuse/domain/views"; // FIX_02_D
import DashboardTemplate from "../templates/dashboard/DashboardTemplate";
import QueueTemplate from "../templates/queue/QueueTemplate";

interface Props {
  spec: unknown;
  onAction?: (itemId: string, actionId: string) => void;
}

function assertNever(x: never): never {
  throw new Error(`kind sin renderer: ${JSON.stringify(x)}`);
}

export default function ViewRenderer({ spec: raw, onAction }: Props) {
  const spec = parseRuntimeViewSpec(raw);
  if (!spec) {
    return (
      <div className="card" role="alert">
        No he podido mostrar esta vista.
      </div>
    );
  }
  return <Render spec={spec} onAction={onAction} />;
}

// VIEWRENDERER_SEVEN_KINDS_V1 - el renderer acepta los 7 kinds del schema
// ampliado. Los que no tienen componente propio muestran un fallback honesto
// en vez de reventar con assertNever.
function Render({ spec, onAction }: { spec: RuntimeViewSpec; onAction?: (id: string, a: string) => void }) {
  switch (spec.kind) {
    case "dashboard":
      return <DashboardTemplate spec={spec} />;
    case "queue":
      return <QueueTemplate spec={spec} onAction={onAction} />;
    case "inbox":
    case "board":
    case "table":
    case "detail":
    case "form":
      // Pendiente de componente propio. Mostramos un placeholder honesto.
      return (
        <div className="card" role="region" aria-label={spec.title}>
          <b>{spec.title}</b>
          <p>Este tipo de vista ({spec.kind}) se sirve pero aun no tiene template dedicado.</p>
        </div>
      );
    default:
      return assertNever(spec);
  }
}
```

## File: apps/web/src/templates/form/FormTemplate.tsx
```typescript
// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
import FormRenderer from "../../forms/FormRenderer.tsx";

const FIELD_TYPES = ["text", "number", "date", "select", "textarea"] as const;
function toFieldType(type: string): (typeof FIELD_TYPES)[number] {
  return (FIELD_TYPES as readonly string[]).includes(type)
    ? (type as (typeof FIELD_TYPES)[number])
    : "text";
}

export default function FormTemplate({ spec }: { spec: ViewSpec }) {
  const fields = (spec.columns ?? []).map((c) => ({
    key: c.key,
    label: c.label,
    type: toFieldType(c.type),
    provenance: "missing" as const,
  }));
  const formSpec = {
    id: spec.id,
    title: spec.title,
    entityType: String((spec.provenance as Record<string, unknown> | undefined)?.source ?? "entity"),
    fields,
  };
  return (
    <div className="rounded-xl border p-4">
      <h2 className="font-semibold">{spec.title} — form</h2>
      <div className="mt-3">
        <FormRenderer spec={formSpec} />
      </div>
    </div>
  );
}
```

## File: apps/web/src/templates/registry.ts
```typescript
// BUG05_REGISTRY_V2 - solo dashboard y queue activos.
// D3_REGISTRY_V2 - solo dashboard y queue activos (D11).
 // TEMPLATES_REGISTRY_V1 - mapa real
 import type { ViewSpec } from "../view/spec.ts";
 import ListTemplate from "./list/ListTemplate.tsx";
 import TableTemplate from "./table/TableTemplate.tsx";
 import KanbanTemplate from "./kanban/KanbanTemplate.tsx";
 import TimelineTemplate from "./timeline/TimelineTemplate.tsx";
 import GraphTemplate from "./graph/GraphTemplate.tsx";
 import DetailTemplate from "./detail/DetailTemplate.tsx";
 import FormTemplate from "./form/FormTemplate.tsx";
 import DashboardTemplate from "./dashboard/DashboardTemplate.tsx";

 const MAP: Record<string, any> = {
   list: ListTemplate, table: TableTemplate, kanban: KanbanTemplate,
   timeline: TimelineTemplate, graph: GraphTemplate, detail: DetailTemplate,
   form: FormTemplate, dashboard: DashboardTemplate,
 };

 export function findTemplate(spec: ViewSpec) {
   const key = spec.layout ?? spec.kind;
    return MAP[key] ?? ListTemplate;
 }
 export function listTemplates() { return Object.keys(MAP); }
```

## File: apps/web/src/index.css
```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;650;700&display=swap");

:root {
  --bg: #ffffff;
  --bg-sidebar: #fafaf9;
  --bg-hover: #f3f1ee;
  --bg-active: #eeece9;
  --bg-input: #ffffff;
  --border: #e4e4e7;
  --border-soft: #ececef;
  --border-strong: #e2dfdb;
  --text: #18181b;
  --text-2: #71717a;
  --text-3: #a1a1aa;
  --accent: #5b4bdb;
  --accent-soft: #eeebfc;
  --accent-border: #c9c0f4;
  --accent-fg: #ffffff;
  --ok: #15803d;
  --green: #16a36a;
  --warn: #b45309;
  --amber: #c98913;
  --danger: #b91c1c;
  --red: #dc4c4c;
  --blue: #3978e8;
  --danger-bg: #fef2f2;
  --danger-border: #fecaca;
  --font: "Instrument Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --fs-xs: 12px;
  --fs-sm: 13px;
  --fs-md: 15px;
  --fs-xl: 30px;
  --r-sm: 8px;
  --r-md: 14px;
  --r-lg: 20px;
  --r-pill: 999px;
  --radius-xs: 6px;
  --radius-sm: 9px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --sidebar-w: 260px;
  --panel-w: 340px;
  --topbar-h: 48px;
  --content-w: 720px;
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.035);
  --shadow-composer: 0 1px 2px rgba(28,25,23,.04), 0 8px 24px rgba(28,25,23,.04);
  --transition: 150ms ease;
  --t: 150ms ease-out;

  /* ---- surface aliases ---- */
  --surface: var(--bg);
  --surface-2: var(--bg-hover);
  --surface-3: var(--bg-active);
}

html[data-theme="dark"] {
  --bg: #171514;
  --bg-sidebar: #1c1a19;
  --bg-hover: #262321;
  --bg-active: #2e2a28;
  --bg-input: #1c1a19;
  --border: #292b31;
  --border-soft: #22242a;
  --border-strong: #3a3633;
  --text: #f4f4f5;
  --text-2: #a1a1aa;
  --text-3: #71717a;
  --accent: #8179ff;
  --accent-soft: #1d1a35;
  --accent-border: #393568;
  --ok: #4ade80;
  --warn: #fbbf24;
  --danger: #f87171;
  --danger-bg: #2a1616;
  --danger-border: #5c2323;
  --shadow-composer: 0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.3);
}

* { box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; }
html { color-scheme: light; }
html[data-theme="dark"] { color-scheme: dark; }
body {
  margin: 0;
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
button, input, textarea { font: inherit; }
button { color: inherit; }
button:focus-visible, textarea:focus-visible, input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* BOOT */
.boot-screen { width: 100%; height: 100%; display: grid; place-items: center; background: var(--bg); }
.boot-card { display: flex; align-items: center; gap: 12px; color: var(--text-2); font-size: 13px; }
.brand-mark {
  width: 30px; height: 30px; display: grid; place-items: center;
  border-radius: 9px;
  background: linear-gradient(135deg, #655df7, #8278ff);
  color: white; font-size: 10px; font-weight: 700; letter-spacing: -0.3px;
  box-shadow: 0 3px 10px rgba(99, 91, 255, 0.25);
}
.boot-spinner {
  width: 14px; height: 14px;
  border: 2px solid var(--border); border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}
.connection-error {
  width: min(420px, calc(100% - 32px));
  padding: 30px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  text-align: center;
  box-shadow: var(--shadow-sm);
}
.connection-error-icon {
  width: 36px; height: 36px;
  margin: 0 auto 16px;
  display: grid; place-items: center;
  border-radius: 50%;
  background: #fee2e2; color: #b91c1c;
  font-weight: 700;
}
.connection-error h2 { margin: 0 0 7px; font-size: 16px; }
.connection-error p { margin: 0; color: var(--text-2); font-size: 13px; }

/* APP */
.app-root { height: 100%; display: flex; flex-direction: column; background: var(--bg); }

/* HEADER */
.app-header {
  height: 56px; flex: 0 0 56px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px;
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  border-bottom: 1px solid var(--border);
  position: relative; z-index: 20;
}
.header-left, .header-right { display: flex; align-items: center; gap: 9px; }
.brand { display: flex; align-items: center; gap: 9px; }
.brand-copy { display: flex; flex-direction: column; gap: 1px; }
.brand-name { font-size: 13px; font-weight: 600; letter-spacing: -0.2px; }
.brand-subtitle { color: var(--text-3); font-size: 10px; }
.header-divider { width: 1px; height: 22px; background: var(--border); margin: 0 4px; }
.ghost-icon-button {
  width: 32px; height: 32px;
  display: grid; place-items: center;
  border: 1px solid transparent; border-radius: 8px;
  background: transparent; color: var(--text-2);
  cursor: pointer;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
}
.ghost-icon-button:hover {
  background: var(--surface-2); border-color: var(--border); color: var(--text);
}
.worker-status {
  height: 30px; display: flex; align-items: center; gap: 5px;
  padding: 0 9px;
  background: var(--surface-2); border: 1px solid var(--border-soft);
  border-radius: 8px; font-size: 11px;
}
.worker-indicator { display: flex; color: var(--text-3); }
.worker-indicator.active { color: var(--green); }
.worker-label { color: var(--text-2); }
.worker-running { color: var(--green); font-weight: 600; }
.worker-stopped { color: var(--text-3); }
.worker-time { color: var(--text-3); }
.environment-pill {
  height: 24px; display: flex; align-items: center; gap: 5px;
  padding: 0 8px; border-radius: 20px;
  font-size: 10px; font-weight: 600;
  border: 1px solid var(--border);
}
.environment-pill.live { background: var(--text); border-color: var(--text); color: var(--surface); }
.environment-pill.sample { color: var(--text-2); }
.environment-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.user-menu { display: flex; align-items: center; gap: 7px; padding-left: 5px; }
.user-avatar {
  width: 29px; height: 29px;
  display: grid; place-items: center;
  border-radius: 50%;
  background: #202124; color: white;
  font-size: 9px; font-weight: 600;
}
.user-copy { display: flex; flex-direction: column; gap: 1px; }
.user-copy span { font-size: 11px; font-weight: 500; }
.user-copy small { color: var(--text-3); font-size: 9px; }
.user-menu-button { border: 0; background: transparent; color: var(--text-3); padding: 3px; cursor: pointer; }

/* MAIN */
.main { flex: 1; min-height: 0; display: flex; overflow: hidden; }

/* SIDEBAR */
.sidebar {
  width: 238px; flex: 0 0 238px;
  display: flex; flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  transition: width 180ms ease, opacity 180ms ease;
}
.sidebar.collapsed { width: 0; flex-basis: 0; overflow: hidden; opacity: 0; pointer-events: none; }
.sidebar-top { display: flex; flex-direction: column; gap: 6px; padding: 13px 11px 8px; }
.new-chat-button, .sidebar-search {
  width: 100%; height: 34px;
  display: flex; align-items: center; gap: 8px;
  border-radius: 8px; cursor: pointer;
}
.new-chat-button {
  padding: 0 10px;
  border: 1px solid var(--border);
  background: var(--text); color: var(--surface);
  font-size: 11.5px; font-weight: 500;
  box-shadow: var(--shadow-xs);
}
.new-chat-button:hover { opacity: 0.9; }
.new-chat-button kbd, .sidebar-search kbd {
  margin-left: auto; padding: 2px 5px; border-radius: 4px;
  font-size: 9px;
  color: var(--text-3); background: var(--surface-2); border: 1px solid var(--border);
}
.new-chat-button kbd { color: var(--text-2); background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.15); }
.sidebar-search {
  padding: 0 10px;
  background: transparent; border: 1px solid transparent;
  color: var(--text-2); font-size: 11.5px; text-align: left;
}
.sidebar-search:hover { background: var(--surface-2); }
.sidebar-nav { flex: 1; overflow-y: auto; padding: 6px 8px; }
.nav-section { margin-bottom: 20px; }
.nav-label { color: var(--text-3); font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
.nav-section > .nav-label { display: block; padding: 0 9px 6px; }
.nav-item {
  width: 100%; height: 32px;
  display: flex; align-items: center; gap: 9px;
  padding: 0 9px;
  border: 0; border-radius: 7px;
  background: transparent; color: var(--text-2);
  font-size: 11.5px;
  cursor: pointer; text-align: left;
}
.nav-item:hover { background: var(--surface-2); color: var(--text); }
.nav-item.active { background: var(--surface-2); color: var(--text); font-weight: 500; }
.nav-item svg { color: var(--text-3); }
.nav-item.active svg { color: var(--accent); }
.nav-section-header { display: flex; align-items: center; justify-content: space-between; padding: 0 9px 6px; }
.mini-action {
  width: 20px; height: 20px;
  display: grid; place-items: center;
  border: 0; background: transparent;
  color: var(--text-3); cursor: pointer;
}
.mini-action:hover { color: var(--text); }
.conversation-list { display: flex; flex-direction: column; gap: 2px; }
.conversation-item {
  width: 100%; height: 31px;
  display: flex; align-items: center; gap: 8px;
  padding: 0 9px;
  border: 0; border-radius: 7px;
  background: transparent; color: var(--text-2);
  cursor: pointer; font-size: 11.5px; text-align: left;
}
.conversation-item:hover, .conversation-item.active { background: var(--surface-2); color: var(--text); }
.conversation-item span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sidebar-empty {
  min-height: 90px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 7px; color: var(--text-3); font-size: 10px;
}
.sidebar-bottom { padding: 8px; border-top: 1px solid var(--border-soft); }
.sidebar-upgrade {
  display: flex; align-items: center; gap: 9px;
  padding: 9px; margin-bottom: 5px;
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  border-radius: 9px;
}
.upgrade-icon {
  width: 27px; height: 27px;
  display: grid; place-items: center;
  background: var(--surface); color: var(--accent);
  border-radius: 7px; border: 1px solid var(--accent-border);
}
.sidebar-upgrade > div:last-child { display: flex; flex-direction: column; gap: 2px; }
.sidebar-upgrade strong { font-size: 10px; }
.sidebar-upgrade span { color: var(--text-2); font-size: 9px; }

/* CHAT */
.chat-panel { min-width: 0; flex: 1; display: flex; flex-direction: column; background: var(--bg); }
.chat-toolbar {
  height: 48px; flex: 0 0 48px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-soft);
}
.chat-toolbar-title { display: flex; align-items: center; gap: 9px; }
.chat-title-icon {
  width: 27px; height: 27px;
  display: grid; place-items: center;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 7px; color: var(--accent);
}
.chat-toolbar-title > div:last-child { display: flex; flex-direction: column; gap: 1px; }
.chat-toolbar-title strong { font-size: 11.5px; font-weight: 600; }
.chat-toolbar-title span { color: var(--text-3); font-size: 9px; }
.message-list { flex: 1; min-height: 0; overflow-y: auto; padding: 30px 28px 15px; scroll-behavior: smooth; }
.message-row { width: min(780px, 100%); margin: 0 auto 22px; display: flex; align-items: flex-start; gap: 10px; }
.message-row.user { justify-content: flex-end; }
.assistant-avatar, .user-message-avatar {
  width: 27px; height: 27px;
  flex: 0 0 27px;
  display: grid; place-items: center;
  border-radius: 8px; margin-top: 2px;
}
.assistant-avatar { background: var(--text); color: var(--surface); }
.user-message-avatar { background: var(--surface-3); color: var(--text-2); order: 2; }
.message-content { max-width: min(680px, 80%); display: flex; flex-direction: column; gap: 7px; }
.message-row.user .message-content { align-items: flex-end; }
.message-bubble { font-size: 13.5px; line-height: 1.62; white-space: pre-wrap; }
.message-bubble.user { padding: 10px 13px; background: var(--surface-3); border: 1px solid var(--border-soft); border-radius: 14px 14px 4px 14px; }
.message-bubble.assistant { color: var(--text); padding-top: 1px; }
.streaming-bubble {
  padding: 10px 13px !important;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; box-shadow: var(--shadow-xs);
}
.message-time { color: var(--text-3); font-size: 9px; }
.stream-cursor { opacity: 0.6; animation: blink 900ms infinite; }
.thinking { display: flex; align-items: center; gap: 8px; padding: 7px 0; color: var(--text-2); font-size: 12px; }
.thinking-dots { display: flex; gap: 3px; }
.thinking-dots i { width: 4px; height: 4px; background: var(--text-3); border-radius: 50%; animation: dot 1s infinite; }
.thinking-dots i:nth-child(2) { animation-delay: 150ms; }
.thinking-dots i:nth-child(3) { animation-delay: 300ms; }

.empty-chat {
  width: min(620px, 100%); min-height: 100%; margin: 0 auto;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 50px 20px 90px; text-align: center;
}
.empty-chat-icon {
  width: 46px; height: 46px;
  display: grid; place-items: center; margin-bottom: 17px;
  border-radius: 13px;
  background: var(--surface); color: var(--accent);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.empty-chat h1 { margin: 0; font-size: 23px; letter-spacing: -0.7px; font-weight: 600; }
.empty-chat p { max-width: 440px; margin: 9px 0 26px; color: var(--text-2); font-size: 12.5px; line-height: 1.55; }
.example-grid { width: 100%; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.example-card {
  padding: 13px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface); color: var(--text-2);
  font-size: 11.5px; cursor: pointer; text-align: left;
  transition: transform var(--transition), border-color var(--transition), background var(--transition);
}
.example-card:hover {
  transform: translateY(-1px);
  background: var(--surface-2); border-color: var(--accent-border);
  color: var(--text);
}

.tool-card {
  width: min(520px, 100%);
  padding: 10px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 11px; box-shadow: var(--shadow-xs);
}
.tool-card.running { border-color: var(--accent-border); }
.tool-card-header { display: flex; align-items: center; gap: 8px; }
.tool-card-icon {
  width: 25px; height: 25px;
  display: grid; place-items: center;
  background: var(--accent-soft); color: var(--accent);
  border: 1px solid var(--accent-border);
  border-radius: 7px;
}
.tool-card-name { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.tool-card-name span { font-size: 11px; font-weight: 600; }
.tool-card-name small { color: var(--text-3); font-size: 9px; }
.tool-card-status { margin-left: auto; color: var(--text-3); }
.tool-card-status.done { color: var(--green); }
.tool-card pre {
  margin: 9px 0 0;
  padding: 8px; overflow: auto; max-height: 120px;
  background: var(--surface-2); border: 1px solid var(--border-soft);
  border-radius: 7px; color: var(--text-2);
  font-size: 9px; line-height: 1.5;
  font-family: "SFMono-Regular", Consolas, monospace;
}

.composer-area { width: min(780px, 100%); margin: 0 auto; padding: 8px 20px 16px; }
.composer {
  position: relative;
  padding: 10px 10px 9px 14px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 15px; box-shadow: var(--shadow-sm);
  transition: border-color var(--transition), box-shadow var(--transition);
}
.composer:focus-within, .composer.listening {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent), var(--shadow-sm);
}
.composer textarea {
  display: block; width: 100%;
  min-height: 24px; max-height: 180px;
  resize: none;
  padding: 3px 0 7px;
  border: 0; outline: 0;
  background: transparent; color: var(--text);
  font-size: 13px; line-height: 1.5;
}
.composer textarea::placeholder { color: var(--text-3); }
.composer-bottom { display: flex; align-items: center; justify-content: space-between; }
.composer-tools { display: flex; align-items: center; gap: 3px; }
.composer-tool {
  height: 28px;
  display: flex; align-items: center; gap: 6px;
  padding: 0 8px;
  border: 0; border-radius: 7px;
  background: transparent; color: var(--text-2);
  font-size: 10.5px; cursor: pointer;
}
.composer-tool:hover { background: var(--surface-2); color: var(--text); }
.composer-tool.active { background: var(--accent-soft); color: var(--accent); }
.composer-tool:disabled { opacity: 0.5; cursor: not-allowed; }
.send-button {
  width: 31px; height: 31px;
  display: grid; place-items: center;
  border: 0; border-radius: 9px;
  background: var(--text); color: var(--surface);
  cursor: pointer;
  transition: opacity var(--transition), transform var(--transition);
}
.send-button:hover:not(:disabled) { transform: translateY(-1px); }
.send-button:disabled { background: var(--surface-3); color: var(--text-3); cursor: not-allowed; }
.send-button.stop { background: var(--red); color: white; }
.attachment-chip {
  display: inline-flex; align-items: center; gap: 6px;
  max-width: 260px;
  margin: 2px 0 7px;
  padding: 5px 7px;
  border-radius: 6px;
  background: var(--surface-2); border: 1px solid var(--border);
  color: var(--text-2); font-size: 10px;
}
.attachment-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attachment-chip button {
  display: grid; place-items: center;
  padding: 2px;
  border: 0; background: transparent;
  color: var(--text-3); cursor: pointer;
}
.composer-hint { display: flex; justify-content: center; gap: 6px; padding-top: 7px; color: var(--text-3); font-size: 9px; }

.chat-error {
  width: min(780px, calc(100% - 40px));
  margin: 0 auto 8px;
  padding: 8px 10px;
  border: 1px solid #fecaca; background: #fef2f2; color: #b91c1c;
  border-radius: 8px; font-size: 11px;
}

/* RIGHT PANEL */
.right-panel {
  width: 305px; flex: 0 0 305px;
  display: flex; flex-direction: column;
  background: var(--surface);
  border-left: 1px solid var(--border);
  transition: width 180ms ease, opacity 180ms ease;
}
.right-panel.collapsed { width: 0; flex-basis: 0; opacity: 0; overflow: hidden; pointer-events: none; }
.right-panel-header {
  min-height: 55px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 15px;
  border-bottom: 1px solid var(--border-soft);
}
.right-panel-header > div { display: flex; align-items: center; gap: 7px; }
.right-panel-header strong { font-size: 12px; }
.right-panel-header span { color: var(--text-3); font-size: 9px; }
.right-panel-tabs { display: flex; padding: 7px 9px; border-bottom: 1px solid var(--border-soft); gap: 3px; }
.right-panel-tabs button {
  flex: 1; height: 28px;
  border: 0; background: transparent;
  border-radius: 7px; color: var(--text-3);
  font-size: 10px; cursor: pointer;
}
.right-panel-tabs button:hover { color: var(--text); }
.right-panel-tabs button.active { background: var(--surface-2); color: var(--text); font-weight: 500; }
.right-panel-content { flex: 1; overflow-y: auto; padding: 13px 11px; background: var(--bg); }
.task-column { margin-bottom: 20px; }
.task-column-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; color: var(--text-2); }
.task-column-title { display: flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 600; }
.task-column.todo .task-column-title svg { color: var(--text-3); }
.task-column.running .task-column-title svg { color: var(--blue); }
.task-column.action .task-column-title svg { color: var(--amber); }
.task-column.done .task-column-title svg { color: var(--green); }
.task-count {
  min-width: 19px; height: 18px;
  display: grid; place-items: center;
  padding: 0 5px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 20px; color: var(--text-3); font-size: 9px;
}
.task-list { display: flex; flex-direction: column; gap: 7px; }
.task-empty {
  padding: 11px 8px;
  border: 1px dashed var(--border);
  border-radius: 9px; color: var(--text-3);
  text-align: center; font-size: 9.5px;
}

/* TASK CARDS */
.task-card {
  padding: 10px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; cursor: pointer;
  box-shadow: var(--shadow-xs);
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
}
.task-card:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--border) 70%, var(--text));
  box-shadow: var(--shadow-sm);
}
.task-card.running { border-color: color-mix(in srgb, var(--blue) 30%, var(--border)); }
.task-card.needs-action { border-color: color-mix(in srgb, var(--amber) 35%, var(--border)); }
.task-card-top { display: flex; align-items: center; gap: 5px; margin-bottom: 7px; }
.task-kind, .task-sop {
  padding: 2px 5px; border-radius: 4px;
  font-size: 8px; text-transform: uppercase; letter-spacing: 0.04em;
}
.task-kind { background: var(--surface-2); border: 1px solid var(--border-soft); color: var(--text-2); }
.task-sop { background: var(--accent-soft); border: 1px solid var(--accent-border); color: var(--accent); }
.task-loader { margin-left: auto; color: var(--blue); }
.task-alert { margin-left: auto; color: var(--amber); }
.task-card h3 { margin: 0 0 8px; font-size: 11px; line-height: 1.4; font-weight: 500; }
.task-progress { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
.task-progress > div { flex: 1; height: 3px; overflow: hidden; background: var(--surface-3); border-radius: 99px; }
.task-progress > div > span { display: block; height: 100%; background: var(--blue); border-radius: inherit; }
.task-progress small { color: var(--text-3); font-size: 8px; }
.task-question {
  display: flex; gap: 5px;
  margin-bottom: 8px;
  padding: 6px 7px;
  background: color-mix(in srgb, var(--amber) 8%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--amber) 22%, var(--border));
  border-radius: 7px; color: var(--amber);
  font-size: 9px; line-height: 1.35;
}
.review-button {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  height: 27px;
  margin-bottom: 8px;
  border: 0; border-radius: 6px;
  background: var(--text); color: var(--surface);
  font-size: 9.5px; cursor: pointer;
}
.task-card footer {
  display: flex; align-items: center; justify-content: space-between;
  color: var(--text-3); font-size: 8.5px;
}

/* MODALS */
.modal-overlay {
  position: fixed; inset: 0;
  z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(7px);
}
.modal {
  width: min(560px, 100%);
  max-height: calc(100vh - 40px);
  overflow: hidden;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.18);
  animation: modal-in 160ms ease;
}
.modal.small { width: min(430px, 100%); }
.modal-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-soft);
}
.modal-title { font-size: 13px; font-weight: 600; }
.modal-sub { margin-top: 3px; color: var(--text-3); font-size: 9px; }
.tabs {
  display: flex; gap: 3px;
  padding: 7px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}
.tabs button {
  padding: 6px 9px;
  border: 0; border-radius: 6px;
  background: transparent; color: var(--text-2);
  font-size: 10px; cursor: pointer;
}
.tabs button.active { background: var(--surface); color: var(--text); box-shadow: var(--shadow-xs); }
.modal-body { max-height: 60vh; overflow-y: auto; padding: 16px; }
.muted { color: var(--text-2); font-size: 12px; }
.ctrl-btn {
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface); color: var(--text-2);
  font-size: 10px; cursor: pointer;
}
.ctrl-btn:hover { background: var(--surface-2); }
.ctrl-btn.danger { color: var(--red); }
.primary-btn {
  height: 31px;
  padding: 0 13px;
  border: 0; border-radius: 7px;
  background: var(--text); color: var(--surface);
  font-size: 10px; cursor: pointer;
}
.plan-list { display: flex; flex-direction: column; gap: 8px; }
.plan-item {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 11px;
  background: var(--surface-2); border: 1px solid var(--border-soft);
  border-radius: 8px; font-size: 11px;
}
.plan-num {
  width: 18px; height: 18px;
  display: grid; place-items: center;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 50%;
  font-size: 9px; font-weight: 600;
  flex-shrink: 0;
}
.plan-check { margin-left: auto; color: var(--text-3); }
.control-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.answer-box {
  margin-top: 14px;
  padding: 11px;
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 10px;
}
.answer-box label {
  display: block; margin-bottom: 6px;
  font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--text-2);
}
.answer-box textarea {
  width: 100%;
  padding: 7px 9px;
  border: 1px solid var(--border); border-radius: 7px;
  background: var(--surface); color: var(--text);
  font-size: 11px;
  resize: vertical;
  outline: none;
}

/* ANIMATIONS */
.spin { animation: spin 800ms linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes blink { 0%, 45% { opacity: 1; } 46%, 100% { opacity: 0; } }
@keyframes dot {
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-2px); }
}
@keyframes modal-in {
  from { opacity: 0; transform: translateY(5px) scale(0.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* MOBILE */
.mobile-close { display: none; }
@media (max-width: 1100px) {
  .right-panel { width: 270px; flex-basis: 270px; }
  .sidebar { width: 215px; flex-basis: 215px; }
}
@media (max-width: 860px) {
  .desktop-only { display: none !important; }
  .app-header { padding: 0 10px; }
  .header-divider, .worker-label, .worker-time, .environment-pill, .brand-subtitle { display: none; }
  .main { position: relative; }
  .sidebar { position: absolute; inset: 0 auto 0 0; z-index: 50; width: 270px; box-shadow: 12px 0 40px rgba(0, 0, 0, 0.15); }
  .right-panel {
    position: absolute; inset: auto 0 0; z-index: 50;
    width: 100%; height: 72vh;
    border-left: 0; border-top: 1px solid var(--border);
    border-radius: 18px 18px 0 0;
    transform: translateY(105%); transition: transform 220ms ease;
  }
  .right-panel.mobile-open { transform: translateY(0); }
  .right-panel.collapsed { width: 100%; flex-basis: auto; opacity: 1; pointer-events: none; transform: translateY(105%); }
  .mobile-close { display: grid; }
  .message-list { padding: 22px 14px 10px; }
  .message-content { max-width: 86%; }
  .composer-area { padding: 8px 10px 12px; }
  .composer-tool span { display: none; }
  .example-grid { grid-template-columns: 1fr; }
  .empty-chat { padding-top: 30px; }
}
@media (max-width: 520px) {
  .brand-name { font-size: 12px; }
  .user-copy { display: none; }
  .chat-toolbar { padding: 0 12px; }
  .message-bubble { font-size: 13px; }
  .message-content { max-width: 88%; }
}
/* Contexto / Memoria */
.context-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 9px;
}
.context-item-icon {
  width: 27px; height: 27px;
  display: grid; place-items: center;
  background: var(--surface-2);
  border-radius: 7px;
  font-size: 13px;
  flex-shrink: 0;
}
.context-item-body { min-width: 0; flex: 1; }
.context-item-title {
  font-size: 11px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.context-item-sub {
  color: var(--text-3);
  font-size: 9px;
  margin-top: 2px;
}
.memory-item {
  padding: 9px 11px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 9px;
}
.memory-text {
  font-size: 11px;
  line-height: 1.45;
  color: var(--text);
}
.memory-source {
  margin-top: 5px;
  color: var(--text-3);
  font-size: 9px;
}

/* Vistas de app */
.view-shell {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  overflow: hidden;
}
.view-header {
  height: 56px;
  flex: 0 0 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--surface);
}
.view-header h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.3px;
}
.view-header-meta {
  color: var(--text-3);
  font-size: 11px;
}

/* Tasks view */
.view-tasks-grid {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 22px 30px;
  display: grid;
  grid-template-columns: repeat(4, minmax(260px, 1fr));
  gap: 16px;
  align-items: start;
}
.view-tasks-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.view-tasks-column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px 4px;
}
.view-tasks-column-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
}
.view-tasks-column-title.todo svg { color: var(--text-3); }
.view-tasks-column-title.running svg { color: var(--blue); }
.view-tasks-column-title.action svg { color: var(--amber); }
.view-tasks-column-title.done svg { color: var(--green); }
.view-tasks-column-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 60px;
  padding: 8px;
  background: var(--surface-2);
  border: 1px dashed var(--border);
  border-radius: 12px;
}
.view-tasks-column-body .task-card { box-shadow: none; }
.view-tasks-column-body .task-empty { background: transparent; border: 0; }

@media (max-width: 1100px) {
  .view-tasks-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 700px) {
  .view-tasks-grid { grid-template-columns: 1fr; padding: 14px; }
}

/* Documents view */
.view-docs-grid {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 22px 30px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  align-content: start;
}
.view-doc-card {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 13px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-xs);
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
}
.view-doc-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  border-color: color-mix(in srgb, var(--border) 60%, var(--text));
}
.view-doc-icon {
  width: 36px; height: 36px;
  display: grid; place-items: center;
  background: var(--surface-2);
  border: 1px solid var(--border-soft);
  border-radius: 9px;
  font-size: 17px;
  flex-shrink: 0;
}
.view-doc-body { min-width: 0; flex: 1; }
.view-doc-name {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.view-doc-meta {
  color: var(--text-3);
  font-size: 10px;
  margin-top: 3px;
}
.view-doc-source {
  margin-top: 4px;
  color: var(--text-3);
  font-size: 9px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Memory view */
.view-memory-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 22px 30px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  max-width: 780px;
}
.view-memory-card {
  padding: 13px 15px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 11px;
  box-shadow: var(--shadow-xs);
}
.view-memory-text {
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--text);
}
.view-memory-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
  color: var(--text-3);
  font-size: 10px;
}
.view-memory-source {
  background: var(--surface-2);
  padding: 2px 7px;
  border-radius: 20px;
  border: 1px solid var(--border-soft);
}

/* View empty */
.view-empty {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  color: var(--text-2);
  text-align: center;
}
.view-empty svg { color: var(--accent); margin-bottom: 4px; }
.view-empty p { margin: 0; font-size: 13px; color: var(--text); }
.view-empty small { font-size: 11px; color: var(--text-3); }

/* Nav disabled */
.nav-item:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.nav-item:disabled:hover {
  background: transparent;
  color: var(--text-2);
}
.sidebar-search:disabled { cursor: not-allowed; }

/* --------------------------------------------------
   LOGIN
-------------------------------------------------- */

.login-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(900px 500px at 50% -20%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%),
    var(--bg);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 36px 32px 28px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 12px 40px rgba(0, 0, 0, 0.06);
}

html[data-theme="dark"] .login-card {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 12px 40px rgba(0, 0, 0, 0.4);
}

.login-logo {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 26px;
}

.login-logo .logo-grad {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #655df7, #8278ff);
  color: white;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.3px;
  box-shadow: 0 4px 12px rgba(99, 91, 255, 0.28);
}

.login-logo .logo-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.login-logo .logo-sub {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 2px;
}

.login-card h1 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.5px;
  color: var(--text);
}

.login-card .muted {
  margin: 0 0 22px;
  color: var(--text-2);
  font-size: 12.5px;
  line-height: 1.5;
}

.login-card label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-2);
  text-transform: uppercase;
}

.login-card .input-wrap {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  padding: 0 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;
}

.login-card .input-wrap:focus-within {
  background: var(--surface);
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
}

.login-card .input-wrap input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  padding: 11px 0;
  font-size: 13.5px;
  color: var(--text);
}

.login-card .input-wrap input::placeholder {
  color: var(--text-3);
}

.login-card .primary-btn {
  width: 100%;
  height: 40px;
  margin-top: 6px;
  border: 0;
  border-radius: 10px;
  background: var(--text);
  color: var(--surface);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 150ms ease, transform 150ms ease;
}

.login-card .primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  opacity: 0.92;
}

.login-card .primary-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.login-error {
  margin-bottom: 16px;
  padding: 10px 12px;
  border: 1px solid #fecaca;
  border-radius: 9px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 12px;
  line-height: 1.4;
}

html[data-theme="dark"] .login-error {
  background: color-mix(in srgb, #dc4c4c 12%, var(--surface));
  border-color: color-mix(in srgb, #dc4c4c 30%, var(--border));
  color: #f8b4b4;
}

.login-footer {
  margin-top: 22px;
  text-align: center;
  font-size: 10.5px;
  color: var(--text-3);
  letter-spacing: 0.02em;
}

/* --------------------------------------------------
   USERS VIEW
-------------------------------------------------- */

.users-grid {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 22px 30px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
  align-content: start;
}

.user-card {
  padding: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
}

.user-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.user-card.inactive {
  opacity: 0.65;
}

.user-card-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-card-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #655df7, #8278ff);
  color: white;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-card-info {
  flex: 1;
  min-width: 0;
}

.user-card-name {
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-card-you {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid var(--accent-border);
}

.user-card-email {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card-role {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 7px;
  border-radius: 5px;
  border: 1px solid var(--border);
}

.user-card-role.admin {
  background: color-mix(in srgb, var(--accent) 12%, var(--surface));
  border-color: var(--accent-border);
  color: var(--accent);
}

.user-card-role.user {
  background: var(--surface-2);
  color: var(--text-2);
}

.user-card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 10px;
  color: var(--text-3);
}

.user-card-status {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
}

.user-card-status.on { color: var(--green); }
.user-card-status.off { color: var(--text-3); }

.user-card-time {
  margin-left: auto;
}

.user-card-setup {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  background: var(--surface-2);
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  font-size: 10.5px;
  color: var(--text-2);
}

.user-card-setup-line b {
  color: var(--text);
  font-weight: 600;
}

.user-card-actions {
  display: flex;
  gap: 6px;
  padding-top: 4px;
  border-top: 1px solid var(--border-soft);
  margin-top: auto;
}

.user-card-btn {
  flex: 1;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-2);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 7px;
  cursor: pointer;
  transition: all var(--transition);
}

.user-card-btn:hover {
  color: var(--text);
  background: var(--surface-2);
  border-color: color-mix(in srgb, var(--border) 60%, var(--text));
}

.user-card-btn.danger {
  flex: 0 0 auto;
  padding: 0 8px;
  color: var(--red);
  border-color: color-mix(in srgb, var(--red) 30%, var(--border));
}

.user-card-btn.danger:hover {
  background: color-mix(in srgb, var(--red) 8%, var(--surface));
  border-color: var(--red);
}

/* Field error inline */
.field-error {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  margin-bottom: 8px;
  color: var(--red);
  font-size: 11px;
  line-height: 1.4;
}
.field-error svg { flex-shrink: 0; }

.user-menu-wrap { position: relative; }
.user-menu-trigger { display: flex; align-items: center; gap: 8px; padding: 4px 8px 4px 4px; border: 0; background: transparent; border-radius: 20px; cursor: pointer; color: inherit; transition: background 150ms ease; }
.user-menu-trigger:hover { background: var(--surface-2); }
.user-chevron { color: var(--text-3); }
.user-dropdown { position: absolute; top: calc(100% + 8px); right: 0; min-width: 220px; padding: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04); z-index: 100; animation: modal-in 120ms ease; }
html[data-theme="dark"] .user-dropdown { box-shadow: 0 8px 24px rgba(0,0,0,.5), 0 2px 6px rgba(0,0,0,.3); }
.user-dropdown-header { padding: 10px 12px; }
.user-dropdown-name { font-size: 13px; font-weight: 600; color: var(--text); }
.user-dropdown-role { font-size: 10.5px; color: var(--text-3); margin-top: 2px; }
.user-dropdown-divider { height: 1px; background: var(--border-soft); margin: 4px 0; }
.user-dropdown-item { width: 100%; display: flex; align-items: center; gap: 9px; padding: 9px 12px; border: 0; background: transparent; border-radius: 8px; color: var(--text-2); font-size: 12.5px; cursor: pointer; text-align: left; transition: background 120ms ease; }
.user-dropdown-item:hover { background: var(--surface-2); color: var(--text); }
.user-dropdown-item.danger { color: var(--red); }
.user-dropdown-item.danger:hover { background: color-mix(in srgb, var(--red) 8%, var(--surface)); }
.modal-success { margin-bottom: 16px; padding: 10px 13px; border: 1px solid #bbf7d0; border-radius: 9px; background: #f0fdf4; color: #15803d; font-size: 12px; }
html[data-theme="dark"] .modal-success { background: color-mix(in srgb, #16a36a 15%, var(--surface)); border-color: color-mix(in srgb, #16a36a 35%, var(--border)); color: #86efac; }

/* --------------------------------------------------
   RAG SEARCH (Documents)
-------------------------------------------------- */
.rag-search {
  padding: 14px 22px 6px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--surface);
}
.rag-search-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rag-search-row svg { color: var(--text-3); flex-shrink: 0; }
.rag-search-row input {
  flex: 1;
  min-width: 0;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-2);
  color: var(--text);
  font-size: 12.5px;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.rag-search-row input:focus {
  background: var(--surface);
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
}
.rag-search-row input:disabled { opacity: 0.55; cursor: not-allowed; }
.rag-search-hint {
  margin-top: 8px;
  color: var(--text-3);
  font-size: 11px;
}
.rag-results {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 10px;
  max-height: 280px;
  overflow-y: auto;
}
.rag-result {
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1px solid var(--border-soft);
  border-radius: 9px;
}
.rag-result-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 10px;
}
.rag-result-source {
  color: var(--text-2);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rag-result-score {
  color: var(--accent);
  font-weight: 600;
}
.rag-result-text {
  color: var(--text);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.scroll { overflow-y: auto; scrollbar-width: thin; scrollbar-color: transparent transparent; }
.scroll:hover { scrollbar-color: var(--border-strong) transparent; }
.scroll::-webkit-scrollbar { width: 8px; }
.scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; }
.scroll:hover::-webkit-scrollbar-thumb { background: var(--border-strong); }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
/* --------------------------------------------------
   Estado unico + banner de sesion
-------------------------------------------------- */
.status {
  display: inline-flex; align-items: center; gap: 6px;
  height: 26px; padding: 0 10px;
  border: 1px solid var(--border); border-radius: var(--r-pill);
  font-size: var(--fs-xs); color: var(--text-2);
  background: var(--surface);
}
.status__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); }
.status[data-state="error"] .status__dot   { background: var(--red); }
.status[data-state="working"] .status__dot { background: var(--accent); }
.status[data-state="offline"] .status__dot { background: var(--text-3); }

.banner {
  display: flex; align-items: center; gap: 10px;
  width: min(var(--content-w), 100%);
  margin: 0 auto 8px;
  padding: 10px 12px;
  border: 1px solid var(--border-strong); border-radius: var(--r-sm);
  font-size: var(--fs-sm);
}
.banner__text { flex: 1; }
.banner--error {
  background: var(--danger-bg);
  border-color: var(--danger-border);
  color: var(--danger);
}
.banner--error .btn-sm { color: var(--text); }

.btn-sm {
  height: 28px; padding: 0 12px;
  border: 1px solid var(--border-strong); background: var(--bg);
  border-radius: var(--r-sm);
  font-size: var(--fs-xs); font-weight: 500; color: var(--text);
  cursor: pointer;
  transition: background var(--t);
}
.btn-sm:hover { background: var(--bg-hover); }

/* --------------------------------------------------
   UI kit: workspace switcher, topbar, icon-btn, user, palette, onboard, chips
-------------------------------------------------- */
.ws {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 8px; margin: 4px 4px 6px;
  border: 0; background: transparent; border-radius: var(--r-sm);
  text-align: left; width: calc(100% - 8px);
  color: var(--text-2);
  transition: background var(--t);
  cursor: pointer;
}
.ws:hover { background: var(--bg-hover); }
.ws__logo {
  width: 28px; height: 28px; border-radius: var(--r-sm);
  background: var(--accent); color: var(--accent-fg);
  font-size: var(--fs-xs); font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ws__text { flex: 1; min-width: 0; }
.ws__name { display: block; font-weight: 600; font-size: var(--fs-sm); color: var(--text); }
.ws__sub  { display: block; font-size: var(--fs-xs); color: var(--text-3); }
.ws__chevron { color: var(--text-3); flex-shrink: 0; }

.topbar {
  height: var(--topbar-h); flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px;
}
.topbar__right { display: flex; align-items: center; gap: 8px; }

.icon-btn {
  width: 32px; height: 32px; border: 0; background: transparent;
  border-radius: var(--r-sm); color: var(--text-2);
  display: flex; align-items: center; justify-content: center;
  transition: background var(--t), color var(--t);
  cursor: pointer;
}
.icon-btn:hover { background: var(--bg-hover); color: var(--text); }

.user {
  display: flex; align-items: center; gap: 10px;
  padding: 8px; margin-top: 8px;
  border-top: 1px solid var(--border);
}
.user__avatar {
  width: 28px; height: 28px; border-radius: var(--r-pill);
  background: var(--text); color: var(--bg);
  font-size: var(--fs-xs); font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user__text { flex: 1; min-width: 0; }
.user__name { display: block; font-weight: 500; font-size: var(--fs-sm); }
.user__role { display: block; font-size: var(--fs-xs); color: var(--text-3); }

.palette {
  width: min(560px, calc(100vw - 32px));
  padding: 0; margin: 12vh auto 0;
  border: 1px solid var(--border-strong); border-radius: var(--r-md);
  background: var(--bg); color: var(--text);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
}
.palette::backdrop { background: rgba(0, 0, 0, 0.32); }
.palette__search {
  display: flex; align-items: center; gap: 10px;
  padding: 0 14px; height: 48px;
  border-bottom: 1px solid var(--border);
  color: var(--text-3);
}
.palette__input {
  flex: 1; border: 0; outline: 0; background: transparent;
  font-size: var(--fs-md); color: var(--text);
  font-family: inherit;
}
.palette__list { max-height: 320px; padding: 6px; }
.palette__group { padding: 8px 10px 4px; font-size: var(--fs-xs); color: var(--text-3); }
.palette__opt {
  display: flex; align-items: center; gap: 10px;
  width: 100%; height: 36px; padding: 0 10px;
  border: 0; background: transparent; border-radius: var(--r-sm);
  font-size: var(--fs-sm); text-align: left; color: var(--text);
  cursor: pointer;
}
.palette__opt:hover, .palette__opt[aria-selected="true"] { background: var(--bg-hover); }

.onboard {
  width: min(var(--content-w), 100%);
  margin-top: 40px; padding: 16px 18px;
  background: var(--bg-sidebar);
  border: 1px solid var(--border); border-radius: var(--r-md);
}
.onboard__title { font-size: var(--fs-sm); font-weight: 600; margin: 0; }
.onboard__sub { margin-top: 2px; font-size: var(--fs-xs); color: var(--text-2); }
.onboard__list { list-style: none; margin: 10px 0 0; padding: 0; }
.onboard__row {
  display: flex; align-items: center; gap: 12px;
  height: 40px; border-top: 1px solid var(--border);
}
.onboard__label { flex: 1; font-size: var(--fs-sm); }
.check {
  width: 16px; height: 16px; border-radius: 50%;
  border: 1.5px solid var(--text-3); flex-shrink: 0;
}
.onboard__row[data-done="true"] .check { background: var(--green); border-color: var(--green); }
.onboard__row[data-done="true"] .onboard__label { color: var(--text-3); text-decoration: line-through; }

.chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 16px; }
.chip {
  display: inline-flex; align-items: center; gap: 8px;
  height: 34px; padding: 0 14px;
  border: 1px solid var(--border-strong); background: var(--bg);
  border-radius: var(--r-pill);
  font-size: var(--fs-sm); color: var(--text-2);
  cursor: pointer;
  transition: background var(--t), color var(--t);
}
.chip:hover { background: var(--bg-hover); color: var(--text); }

/* --------------------------------------------------
   Stage / hero / dock / skeleton (chat v2)
-------------------------------------------------- */
.stage {
  flex: 1; min-height: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 0 24px 48px;
  overflow-y: auto;
}
.hero {
  margin: 0 0 24px;
  font-size: var(--fs-xl); font-weight: 500; letter-spacing: -0.02em;
  text-align: center; color: var(--text);
  font-family: var(--font);
}
.dock {
  flex-shrink: 0; display: flex; justify-content: center;
  padding: 0 24px 20px;
  background: linear-gradient(to top, var(--bg) 70%, transparent);
}
.skeleton {
  height: 12px; border-radius: 6px; margin-top: 8px;
  background: linear-gradient(90deg, var(--bg-active), var(--bg-hover), var(--bg-active));
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }
.stream-cursor { opacity: 0.6; animation: blink 900ms infinite; margin-left: 2px; }

@media (max-width: 720px) {
  .stage { padding: 0 16px 24px; }
  .hero { font-size: 24px; }
  .dock { padding: 0 12px 12px; }
}

.pane-empty {
  padding: 32px 16px; text-align: center;
  color: var(--text-2);
}
.pane-empty svg { color: var(--text-3); margin-bottom: 8px; }
.pane-empty__title { font-weight: 500; margin: 0; font-size: var(--fs-sm); color: var(--text); }
.pane-empty__sub { margin-top: 4px; font-size: var(--fs-xs); color: var(--text-3); }

.msg__actions { display: flex; align-items: center; gap: 4px; margin-top: 6px; }
.msg__actions .icon-btn { opacity: 0; transition: opacity var(--t); }
.message-row:hover .msg__actions .icon-btn { opacity: 1; }

/* ============ V2 WARM BEIGE ============ */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --v2-bg: #F3F0EB;
  --v2-bg-card: #FFFFFF;
  --v2-bg-soft: #F7F3ED;
  --v2-bg-softer: #FBF8F3;
  --v2-border: #EDE8E0;
  --v2-border-soft: #F0EBE3;
  --v2-border-strong: #E7E0D6;
  --v2-text: #1A1A1A;
  --v2-text-2: #6B6B6B;
  --v2-text-3: #8A857E;
  --v2-text-4: #B8B2AA;
  --v2-purple: #5E4FF1;
  --v2-purple-soft: #F0EBFF;
  --v2-purple-border: #E7E0FF;
  --v2-green: #22C55E;
  --v2-orange: #FF6B2C;
  --v2-warn-bg: #FFF5D5;
  --v2-warn-border: #FDE68A;
  --v2-warn-text: #92400E;
  --v2-info-bg: #EFF6FF;
  --v2-info-border: #BFDBFE;
  --v2-info-text: #2563EB;
  --v2-r-card: 28px;
  --v2-r-pill: 999px;
  --v2-shadow-card: 0 12px 40px rgba(0,0,0,0.04);
  --v2-shadow-soft: 0 2px 12px rgba(0,0,0,0.04);
  --v2-shadow-composer: 0 2px 18px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1);
}

.v2-app { min-height: 100vh; background: var(--v2-bg); color: var(--v2-text); font-family: var(--font); }
.v2-app-shell { max-width: 1360px; margin: 0 auto; padding: 12px 24px 40px; display: flex; gap: 16px; }

.v2-sidebar { width: 220px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 24px 0; }
@media (max-width: 900px) { .v2-sidebar { display: none; } }

.v2-sidebar-brand { display: flex; align-items: center; gap: 8px; padding: 0 12px; margin-bottom: 32px; }
.v2-sidebar-brand-mark { width: 28px; height: 28px; border-radius: 999px; background: #111; color: #FFF; display: grid; place-items: center; font-size: 11px; font-weight: 700; }
.v2-sidebar-brand-name { font-size: 13px; font-weight: 600; line-height: 1; }
.v2-sidebar-brand-beta { margin-left: auto; font-size: 9px; font-weight: 700; letter-spacing: 0.08em; color: var(--v2-text-3); background: var(--v2-bg-soft); border: 1px solid var(--v2-border); padding: 2px 6px; border-radius: 999px; }

.v2-sidebar-sections { padding: 0 8px; display: flex; flex-direction: column; gap: 24px; }
.v2-sidebar-label { font-size: 10px; letter-spacing: 0.12em; font-weight: 700; color: var(--v2-text-3); padding: 0 8px; margin-bottom: 8px; text-transform: uppercase; }
.v2-sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
.v2-nav-item { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border: 0; border-radius: 12px; background: transparent; color: var(--v2-text-2); font-size: 13.5px; font-weight: 500; text-align: left; cursor: pointer; transition: background 150ms ease, color 150ms ease; }
.v2-nav-item:hover { background: #EFE8DC; color: var(--v2-text); }
.v2-nav-item.active { background: #FFF; border: 1px solid var(--v2-border); box-shadow: var(--v2-shadow-soft); color: #000; }
.v2-nav-item .v2-nav-icon { width: 18px; height: 18px; flex-shrink: 0; }
.v2-nav-item > span { display: flex; align-items: center; gap: 12px; }
.v2-nav-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--v2-orange); }

.v2-sidebar-recent { display: flex; flex-direction: column; gap: 4px; }
.v2-sidebar-recent-title { display: flex; align-items: center; justify-content: space-between; padding: 0 8px 8px; }
.v2-sidebar-recent-item { width: 100%; text-align: left; padding: 8px 12px; border: 1px solid transparent; border-radius: 12px; background: transparent; font-size: 12.5px; line-height: 1.3; color: var(--v2-text-2); cursor: pointer; transition: background 150ms ease; }
.v2-sidebar-recent-item:hover { background: #EFE8DC; }
.v2-sidebar-recent-item.active { background: #FFF; border-color: var(--v2-border); color: #000; font-weight: 500; }

.v2-sidebar-footer { padding: 0 12px; }
.v2-user-chip { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; transition: background 150ms ease; }
.v2-user-chip:hover { background: rgba(255,255,255,0.6); }
.v2-user-chip-avatar { width: 32px; height: 32px; border-radius: 999px; background: #111; color: #FFF; display: grid; place-items: center; font-size: 12px; font-weight: 700; }
.v2-user-chip-name { font-size: 13px; font-weight: 600; line-height: 1.1; }
.v2-user-chip-role { font-size: 11px; color: var(--v2-text-3); display: flex; align-items: center; gap: 4px; }
.v2-status-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--v2-green); display: inline-block; }

.v2-main { flex: 1; min-width: 0; background: var(--v2-bg-card); border: 1px solid var(--v2-border); border-radius: var(--v2-r-card); box-shadow: var(--v2-shadow-card); min-height: calc(100vh - 80px); display: flex; flex-direction: column; overflow: hidden; }
.v2-topbar { height: 56px; flex: 0 0 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; border-bottom: 1px solid var(--v2-bg); }
.v2-topbar-left { display: flex; align-items: center; gap: 12px; }
.v2-topbar-right { display: flex; align-items: center; gap: 8px; }
.v2-status-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: var(--v2-bg-soft); border: 1px solid var(--v2-border); font-size: 12px; font-weight: 500; color: var(--v2-text-3); }
.v2-search-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: var(--v2-bg-soft); border: 1px solid var(--v2-border); font-size: 12px; color: var(--v2-text-3); cursor: pointer; transition: background 150ms ease; }
.v2-search-pill:hover { background: #EFE8DC; }
.v2-search-kbd { margin-left: 8px; padding: 2px 6px; border-radius: 4px; background: #FFF; border: 1px solid var(--v2-border); font-size: 10px; color: var(--v2-text-3); }
.v2-btn-new { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: 0; border-radius: 999px; background: #111; color: #FFF; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 150ms ease; }
.v2-btn-new:hover { background: #000; }
.v2-content { flex: 1; overflow: auto; }

/* 5A END */
/* ============ V2 WARM BEIGE PARTE B ============ */
.v2-home { max-width: 760px; margin: 0 auto; padding: 96px 40px 48px; display: flex; flex-direction: column; align-items: center; }
@media (max-width: 768px) { .v2-home { padding: 64px 24px 48px; } }
.v2-greeting { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 999px; background: var(--v2-purple-soft); border: 1px solid var(--v2-purple-border); color: var(--v2-purple); font-size: 11px; font-weight: 700; letter-spacing: 0.02em; margin-bottom: 12px; }
.v2-hero-title { margin: 0 0 40px; font-size: 48px; font-weight: 800; line-height: 0.95; letter-spacing: -0.03em; text-align: center; color: var(--v2-text); }
@media (max-width: 768px) { .v2-hero-title { font-size: 34px; } }

.v2-composer { width: 100%; border-radius: 22px; border: 1px solid var(--v2-border-strong); background: var(--v2-bg-card); box-shadow: var(--v2-shadow-composer); padding: 12px; transition: border-color 150ms ease; }
.v2-composer:focus-within { border-color: #D8D0C4; }
.v2-composer textarea { width: 100%; min-height: 54px; max-height: 120px; resize: none; outline: none; border: 0; background: transparent; padding: 8px 12px; font-size: 15px; color: var(--v2-text); font-family: inherit; }
.v2-composer textarea::placeholder { color: #9A9590; }
.v2-composer-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 4px; }
.v2-composer-tools { display: flex; align-items: center; gap: 8px; }
.v2-composer-tool { width: 32px; height: 32px; border-radius: 999px; border: 1px solid var(--v2-border-strong); background: transparent; color: var(--v2-text-3); display: grid; place-items: center; cursor: pointer; transition: background 150ms ease; }
.v2-composer-tool:hover { background: var(--v2-bg-soft); }
.v2-composer-chip { height: 32px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--v2-border); background: var(--v2-bg-soft); font-size: 12.5px; font-weight: 500; color: var(--v2-text); display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: background 150ms ease; }
.v2-composer-chip:hover { background: #EFE8DC; }
.v2-send { width: 36px; height: 36px; border-radius: 999px; border: 0; background: var(--v2-purple); color: #FFF; display: grid; place-items: center; cursor: pointer; box-shadow: 0 4px 12px rgba(94,79,241,0.35); transition: background 150ms ease, transform 150ms ease; }
.v2-send:hover { background: #4F40E8; transform: scale(1.02); }
.v2-send:active { transform: scale(0.98); }
.v2-send:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

.v2-suggestion-grid { width: 100%; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 24px; }
@media (max-width: 600px) { .v2-suggestion-grid { grid-template-columns: 1fr; } }
.v2-suggestion-card { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 16px; background: var(--v2-bg-soft); border: 1px solid var(--v2-border); text-align: left; cursor: pointer; transition: background 150ms ease, border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease; }
.v2-suggestion-card:hover { background: #F0E9DC; border-color: #E0D8CC; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
.v2-suggestion-icon { width: 36px; height: 36px; flex-shrink: 0; border-radius: 999px; background: #FFF; border: 1px solid var(--v2-border); display: grid; place-items: center; font-size: 14px; box-shadow: var(--v2-shadow-soft); }
.v2-suggestion-title { font-size: 14px; font-weight: 600; line-height: 1.2; }
.v2-suggestion-desc { font-size: 12.5px; color: var(--v2-text-3); margin-top: 4px; line-height: 1.3; }
.v2-home-footer { margin-top: 48px; font-size: 11px; color: var(--v2-text-4); }

.v2-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 999px; font-size: 12.5px; font-weight: 500; background: var(--v2-bg-soft); border: 1px solid var(--v2-border); color: var(--v2-text); cursor: pointer; transition: background 150ms ease, border-color 150ms ease; }
.v2-pill:hover { background: #EFE8DC; }
.v2-pill.active { background: #FFF; border-color: var(--v2-border); box-shadow: var(--v2-shadow-soft); color: #000; }
.v2-pill.dark { background: #111; color: #FFF; border-color: #111; }
.v2-pill-row { display: inline-flex; gap: 6px; padding: 4px; border-radius: 999px; background: var(--v2-bg); border: 1px solid var(--v2-border); }

.v2-need-action { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 16px 20px; border-radius: 16px; background: var(--v2-warn-bg); border: 1px solid var(--v2-warn-border); margin-bottom: 24px; }
.v2-need-action-icon { width: 32px; height: 32px; flex-shrink: 0; border-radius: 999px; background: #FFF; border: 1px solid var(--v2-warn-border); display: grid; place-items: center; font-size: 14px; }
.v2-need-action-eyebrow { font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--v2-warn-text); }
.v2-need-action-title { font-size: 15px; font-weight: 700; margin-top: 4px; line-height: 1.2; }
.v2-need-action-sub { font-size: 12px; color: var(--v2-text-2); margin-top: 2px; }
.v2-need-action-btn { align-self: center; padding: 10px 20px; border: 0; border-radius: 999px; background: var(--v2-purple); color: #FFF; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(94,79,241,0.25); transition: background 150ms ease; }
.v2-need-action-btn:hover { background: #4F40E8; }

.v2-section-heading { font-size: 11px; font-weight: 800; letter-spacing: 0.12em; color: var(--v2-text-3); text-transform: uppercase; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }

.v2-task-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 14px; background: #FFF; border: 1px solid var(--v2-border); cursor: pointer; transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease; margin-bottom: 8px; }
.v2-task-row:hover { border-color: var(--v2-border-strong); box-shadow: var(--v2-shadow-soft); }
.v2-task-row.soft { background: var(--v2-bg-softer); }
.v2-task-row.done { opacity: 0.6; }
.v2-task-row-title { font-size: 13.5px; font-weight: 500; flex: 1; min-width: 0; }
.v2-task-row-title.done { text-decoration: line-through; color: var(--v2-text-3); }
.v2-task-row-meta { display: flex; align-items: center; gap: 8px; }
.v2-task-row-date { font-size: 11px; color: var(--v2-text-3); }
.v2-task-row-avatar { width: 24px; height: 24px; border-radius: 999px; background: #111; color: #FFF; display: grid; place-items: center; font-size: 10px; font-weight: 700; }

.v2-tag { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 600; border: 1px solid var(--v2-border); background: var(--v2-bg-soft); color: var(--v2-text-2); }
.v2-tag.agent { background: var(--v2-purple-soft); border-color: var(--v2-purple-border); color: var(--v2-purple); }
.v2-tag.info { background: var(--v2-info-bg); border-color: var(--v2-info-border); color: var(--v2-info-text); }

.v2-task-status { width: 20px; height: 20px; flex-shrink: 0; position: relative; }
.v2-task-status.half::before { content: ""; position: absolute; inset: 0; border-radius: 999px; border: 2px solid #9AA8FF; }
.v2-task-status.half::after { content: ""; position: absolute; top: 0; left: 50%; right: 0; bottom: 50%; border-top-right-radius: 999px; background: var(--v2-purple); }
.v2-task-status.empty::before { content: ""; position: absolute; inset: 0; border-radius: 999px; border: 2px solid #D6D0C6; }
.v2-task-status.done { border-radius: 999px; background: #E7F8ED; border: 1px solid var(--v2-green); color: var(--v2-green); display: grid; place-items: center; font-size: 11px; }

.v2-tasks-view { padding: 24px 32px 32px; max-width: 900px; margin: 0 auto; }
@media (max-width: 768px) { .v2-tasks-view { padding: 20px; } }
.v2-tasks-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.v2-tasks-title { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
.v2-tasks-meta { font-size: 12px; color: var(--v2-text-3); }
.v2-tasks-section { margin-top: 32px; }
.v2-tasks-empty { padding: 32px 16px; text-align: center; color: var(--v2-text-3); font-size: 12px; border: 1px dashed var(--v2-border); border-radius: 12px; }

.v2-conv { max-width: 720px; margin: 0 auto; padding: 32px 40px 40px; }
@media (max-width: 768px) { .v2-conv { padding: 20px; } }
.v2-conv-crumb { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; font-size: 13px; color: var(--v2-text-3); }
.v2-conv-crumb-current { color: var(--v2-text); font-weight: 600; }
.v2-conv-status { margin-left: auto; padding: 4px 10px; border-radius: 999px; background: var(--v2-bg-soft); border: 1px solid var(--v2-border); font-size: 11px; font-weight: 500; }
.v2-user-bubble { display: flex; justify-content: flex-end; margin-bottom: 24px; }
.v2-user-bubble-inner { max-width: 80%; padding: 14px 20px; background: var(--v2-bg); border: 1px solid var(--v2-border); border-radius: 18px 18px 6px 18px; font-size: 14px; line-height: 1.5; }
.v2-assistant-row { display: flex; gap: 12px; margin-bottom: 12px; }
.v2-assistant-avatar { width: 28px; height: 28px; flex-shrink: 0; border-radius: 999px; background: #111; color: #FFF; display: grid; place-items: center; font-size: 11px; font-weight: 700; margin-top: 2px; }
.v2-assistant-body { flex: 1; min-width: 0; }
.v2-steps-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: var(--v2-bg-soft); border: 1px solid var(--v2-border); font-size: 12px; font-weight: 500; color: var(--v2-text); cursor: pointer; }
.v2-steps-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--v2-purple); animation: v2-pulse 1.5s infinite; }
@keyframes v2-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.v2-steps-timeline { margin-top: 16px; padding-left: 24px; border-left: 1px solid var(--v2-border); display: flex; flex-direction: column; gap: 16px; position: relative; }
.v2-steps-step { position: relative; }
.v2-steps-step::before { content: ""; position: absolute; left: -29px; top: 4px; width: 12px; height: 12px; border-radius: 999px; background: #FFF; border: 2px solid var(--v2-purple); }
.v2-steps-step.dim::before { border-color: var(--v2-border-strong); }
.v2-steps-step.done::before { background: var(--v2-green); border-color: #FFF; }
.v2-steps-step-title { font-size: 12px; font-weight: 600; }
.v2-steps-step-desc { font-size: 12px; color: var(--v2-text-3); margin-top: 4px; }
.v2-steps-step-card { margin-top: 8px; display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px; background: #FFF; border: 1px solid var(--v2-border); font-size: 11px; color: var(--v2-text-2); }
.v2-assistant-text { margin-top: 24px; font-size: 14.5px; line-height: 1.65; color: var(--v2-text); }
.v2-assistant-text b { font-weight: 700; }
.v2-inline-highlight { padding: 2px 6px; border-radius: 4px; background: var(--v2-warn-bg); border: 1px solid var(--v2-warn-border); font-weight: 600; }
.v2-quote-card { margin-top: 12px; padding: 12px 14px; border-radius: 12px; background: var(--v2-bg-soft); border: 1px solid var(--v2-border); display: flex; align-items: center; justify-content: space-between; }
.v2-inline-action { margin-top: 24px; border-radius: 16px; background: var(--v2-warn-bg); border: 1px solid var(--v2-warn-border); padding: 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.v2-conv-input { position: sticky; bottom: 0; background: #FFF; padding-top: 16px; margin-top: 40px; }
.v2-conv-input-inner { display: flex; align-items: center; gap: 8px; padding: 10px; border-radius: 20px; border: 1px solid var(--v2-border-strong); background: #FFF; box-shadow: var(--v2-shadow-soft); }
.v2-conv-input-inner input { flex: 1; border: 0; outline: 0; background: transparent; font-size: 14px; color: var(--v2-text); }
/* V2 WARM BEIGE PARTE B END */
/* ============ V3 CONTROL CENTER ============ */
.v3-cc-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 0;
}
.v3-cc-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 24px 32px 32px;
}
@media (max-width: 768px) { .v3-cc-main { padding: 20px; } }

.v3-cc-header { margin-bottom: 24px; }
.v3-cc-title { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; color: var(--v2-text); }
.v3-cc-sub { font-size: 13px; color: var(--v2-text-3); margin-top: 4px; }

.v3-cc-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}
@media (max-width: 720px) { .v3-cc-kpis { grid-template-columns: 1fr; } }
.v3-kpi {
  padding: 16px 18px;
  background: var(--v2-bg-soft);
  border: 1px solid var(--v2-border);
  border-radius: 16px;
}
.v3-kpi-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.v3-kpi-icon {
  width: 24px; height: 24px;
  border-radius: 999px;
  background: #FFF;
  border: 1px solid var(--v2-border);
  display: grid; place-items: center;
  color: var(--v2-purple);
}
.v3-kpi-icon.green { color: var(--v2-green); }
.v3-kpi-icon.orange { color: var(--v2-orange); }
.v3-kpi-label { font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--v2-text-3); }
.v3-kpi-value { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: var(--v2-text); line-height: 1; }
.v3-kpi-meta { font-size: 12px; color: var(--v2-text-3); margin-top: 6px; }
.v3-kpi-meta b { color: var(--v2-text); font-weight: 600; }

.v3-cc-section { margin-bottom: 28px; }
.v3-cc-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.v3-cc-section-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--v2-text-3);
}
.v3-cc-section-meta { font-size: 11px; color: var(--v2-text-3); }

.v3-task-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #FFF;
  border: 1px solid var(--v2-border);
  border-radius: 14px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.v3-task-row:hover {
  border-color: var(--v2-border-strong);
  box-shadow: var(--v2-shadow-soft);
}
.v3-task-row.soft { background: var(--v2-bg-softer); }

.v3-spinner {
  width: 22px; height: 22px;
  flex-shrink: 0;
  border-radius: 999px;
  border: 2px solid var(--v2-purple-soft);
  border-top-color: var(--v2-purple);
  animation: v3-spin 900ms linear infinite;
}
@keyframes v3-spin { to { transform: rotate(360deg); } }

.v3-task-body { flex: 1; min-width: 0; }
.v3-task-title {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--v2-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.v3-task-sub {
  font-size: 11.5px;
  color: var(--v2-text-3);
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.v3-task-tags { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.v3-task-avatar {
  width: 24px; height: 24px;
  border-radius: 999px;
  background: #111;
  color: #FFF;
  display: grid; place-items: center;
  font-size: 10px; font-weight: 700;
  flex-shrink: 0;
}

.v3-cc-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 720px) { .v3-cc-bottom { grid-template-columns: 1fr; } }
.v3-cc-panel {
  padding: 18px 20px;
  background: var(--v2-bg-soft);
  border: 1px solid var(--v2-border);
  border-radius: 16px;
}
.v3-cc-panel-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--v2-text-3);
  margin-bottom: 14px;
}
.v3-cc-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 12.5px;
  color: var(--v2-text-2);
}
.v3-cc-stat + .v3-cc-stat { border-top: 1px solid var(--v2-border); }
.v3-cc-stat b { color: var(--v2-text); font-weight: 600; }
.v3-cc-bar {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: #FFF;
  border: 1px solid var(--v2-border);
  margin: 0 10px;
  overflow: hidden;
  max-width: 140px;
}
.v3-cc-bar > span { display: block; height: 100%; background: var(--v2-purple); }
.v3-cc-bar.green > span { background: var(--v2-green); }
.v3-cc-bar.orange > span { background: var(--v2-orange); }
.v3-cc-bar.gray > span { background: #C4BFB7; }

/* Panel chat derecho */
.v3-chat-panel {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--v2-border);
  background: var(--v2-bg-softer);
}
.v3-chat-panel.collapsed { width: 0; overflow: hidden; border-left: 0; }
@media (max-width: 1100px) { .v3-chat-panel { display: none; } }

.v3-chat-head {
  height: 56px;
  flex: 0 0 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--v2-border);
}
.v3-chat-head-left { display: flex; align-items: center; gap: 8px; }
.v3-chat-title { font-size: 13px; font-weight: 700; color: var(--v2-text); }
.v3-chat-status { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 500; color: var(--v2-text-3); }
.v3-chat-collapse {
  width: 26px; height: 26px;
  border: 0;
  background: transparent;
  color: var(--v2-text-3);
  border-radius: 6px;
  cursor: pointer;
  display: grid; place-items: center;
  transition: background 150ms ease;
}
.v3-chat-collapse:hover { background: var(--v2-bg-soft); color: var(--v2-text); }

.v3-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.v3-chat-row { display: flex; gap: 8px; align-items: flex-start; }
.v3-chat-row.user { justify-content: flex-end; }
.v3-chat-avatar {
  width: 24px; height: 24px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #111;
  color: #FFF;
  display: grid; place-items: center;
  font-size: 10px; font-weight: 700;
  margin-top: 2px;
}
.v3-chat-bubble {
  max-width: 85%;
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 12.5px;
  line-height: 1.45;
}
.v3-chat-bubble.ia {
  background: var(--v2-bg-soft);
  border: 1px solid var(--v2-border);
  color: var(--v2-text);
  border-bottom-left-radius: 4px;
}
.v3-chat-bubble.user {
  background: #FFF;
  border: 1px solid var(--v2-border);
  color: var(--v2-text);
  border-bottom-right-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}
.v3-chat-time { font-size: 10px; color: var(--v2-text-3); margin-top: 5px; }
.v3-chat-row.user .v3-chat-time { text-align: right; }

.v3-chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px 16px;
  text-align: center;
  color: var(--v2-text-3);
  font-size: 12px;
  flex: 1;
}

.v3-chat-composer {
  padding: 12px;
  border-top: 1px solid var(--v2-border);
  background: var(--v2-bg-softer);
}
.v3-chat-composer-inner {
  background: #FFF;
  border: 1px solid var(--v2-border);
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.v3-chat-tools {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  padding: 0 4px;
}
.v3-chat-tool {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--v2-bg-soft);
  border: 1px solid var(--v2-border);
  color: var(--v2-text-2);
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease;
}
.v3-chat-tool:hover { background: #EFE8DC; }
.v3-chat-input-row { display: flex; align-items: center; gap: 8px; }
.v3-chat-input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 13px;
  padding: 4px 6px;
  color: var(--v2-text);
  font-family: inherit;
}
.v3-chat-input::placeholder { color: var(--v2-text-3); }
.v3-chat-send {
  width: 32px; height: 32px;
  border-radius: 999px;
  border: 0;
  background: var(--v2-purple);
  color: #FFF;
  display: grid; place-items: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(94,79,241,0.3);
  transition: background 150ms ease, transform 150ms ease;
}
.v3-chat-send:hover:not(:disabled) { background: #4F40E8; transform: scale(1.02); }
.v3-chat-send:disabled { opacity: 0.45; cursor: not-allowed; }
.v3-chat-disclaimer {
  font-size: 10px;
  color: var(--v2-text-3);
  text-align: center;
  margin-top: 8px;
}

.v3-chat-reopen {
  position: absolute;
  top: 68px;
  right: 16px;
  width: 36px; height: 36px;
  border-radius: 999px;
  border: 1px solid var(--v2-border);
  background: #FFF;
  color: var(--v2-purple);
  display: grid; place-items: center;
  cursor: pointer;
  box-shadow: var(--v2-shadow-soft);
  z-index: 5;
}

.v3-cc-empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--v2-text-3);
  font-size: 12px;
  border: 1px dashed var(--v2-border);
  border-radius: 12px;
}

/* V3 CONTROL CENTER END */
/* UI_STREAM_CURSOR_V1 - cursor parpadeante del typewriter. */
.stream-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: currentColor;
  vertical-align: text-bottom;
  margin-left: 1px;
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* UI_CASCADE_CSS_V1 - cascada de aparicion en listas. */
.cascade-item {
  animation: fade-slide-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(min(var(--i, 0), 8) * 70ms);
}
@keyframes fade-slide-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .cascade-item {
    animation: fade-in-only 150ms ease-out both;
    animation-delay: 0ms;
  }
  @keyframes fade-in-only {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}

/* UI_PANEL_SLIDE_V1 - slide-in del panel contextual. */
.panel-slide-in {
  animation: panel-slide-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes panel-slide-in {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}
@media (prefers-reduced-motion: reduce) {
  .panel-slide-in {
    animation: fade-in-only 150ms ease-out both;
  }
}

/* UI_REDUCED_MOTION_V1 - respeto a prefers-reduced-motion. */
.pulse {
  animation: pulse 1.8s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.chip-pop-in {
  animation: chip-pop-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes chip-pop-in {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .pulse { animation: none; opacity: 1; }
  .chip-pop-in { animation: fade-in-only 100ms ease-out both; }
  .stream-cursor { animation: none; opacity: 0.5; }
}

/* B1_SHELL_CSS_V1 - shell 3 columnas plegables. */
.shell {
  display: grid;
  height: 100vh;
  grid-template-columns: 0 1fr 0;
  transition: grid-template-columns 280ms cubic-bezier(.22, 1, .36, 1);
}
.shell[data-left="true"] { grid-template-columns: 260px 1fr 0; }
.shell[data-right="true"] { grid-template-columns: 0 1fr 340px; }
.shell[data-left="true"][data-right="true"] { grid-template-columns: 260px 1fr 340px; }
.shell__left, .shell__right { overflow: hidden; min-width: 0; }
.shell__main { position: relative; min-width: 0; display: flex; flex-direction: column; }
.shell__toggles {
  position: absolute; top: 8px; right: 12px;
  display: flex; gap: 6px; z-index: 10;
}
.shell__toggle {
  width: 30px; height: 30px;
  display: grid; place-items: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-2);
  cursor: pointer;
  font-size: 14px;
}
.shell__toggle:hover { background: var(--bg-hover); color: var(--text); }
@media (prefers-reduced-motion: reduce) {
  .shell { transition: none; }
}
/* B3_LIVEITEM_CSS_V1 - estados nuevos de .live-item (stale, error, queued, done). */
.live-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  border-left: 2px solid transparent;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
  transition: background 140ms ease-out, border-color 140ms ease-out;
}
.live-item:hover { background: var(--bg-hover); }
.live-item[data-active="true"] {
  background: var(--surface);
  border-color: var(--border);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.live-item__title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.live-item__strip {
  height: 18px;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  font-size: 11px;
  color: var(--text-3);
}
.live-item[data-kind="alert"] {
  border-left-color: #ff8c32;
  background: linear-gradient(90deg, rgba(255, 140, 50, 0.09), transparent);
}
.live-item[data-urgent] {
  background: linear-gradient(90deg, rgba(255, 90, 30, 0.18), rgba(255, 90, 30, 0.05));
  animation: live-item-pulse 2.4s ease-in-out infinite;
}
.live-item[data-kind="error"] { border-left-color: var(--red, #dc4c4c); }
.live-item[data-kind="stale"] { opacity: 0.6; }
.live-item[data-kind="done"] { opacity: 0.75; }
.live-value {
  font-variant-numeric: tabular-nums;
  color: var(--accent);
  font-weight: 700;
}
.live-warn {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #ff6b2c;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.live-label--warn { color: #8a5a00; font-weight: 600; }
.live-label--error { color: var(--red, #dc4c4c); font-weight: 600; }
.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--accent);
  flex-shrink: 0;
}
.live-dot--pulse {
  background: var(--accent);
  animation: live-pulse 1.6s ease-in-out infinite;
}
.live-progress {
  flex: 1;
  height: 3px;
  background: var(--border);
  border-radius: 999px;
  overflow: hidden;
  min-width: 40px;
}
.live-progress > i {
  display: block;
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
  transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes live-item-pulse {
  0%, 100% { box-shadow: inset 0 0 0 0 rgba(255, 107, 44, 0); }
  50% { box-shadow: inset 0 0 20px 0 rgba(255, 107, 44, 0.20); }
}
@keyframes live-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}
@media (prefers-reduced-motion: reduce) {
  .live-item[data-urgent] { animation: none; }
  .live-dot--pulse { animation: none; }
}
/* C1_TIMELINE_CSS_V1 - timeline vertical del plan de tarea. */
.tl { list-style: none; margin: 0; padding: 0; }
.tl__step {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 0 0 18px;
  color: var(--text-3);
}
.tl__step::after {
  content: "";
  position: absolute;
  left: 10px;
  top: 24px;
  bottom: 0;
  width: 2px;
  background: var(--border);
}
.tl__step:last-child::after { display: none; }
.tl__dot {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid var(--border);
  background: var(--surface);
  display: grid;
  place-items: center;
  font-size: 11px;
  flex: none;
}
.tl__body { display: flex; flex-direction: column; gap: 2px; }
.tl__title { font-size: 13px; font-weight: 500; }
.tl__meta { font-size: 11px; color: var(--text-3); }
.tl__step[data-status="succeeded"] { color: var(--text); }
.tl__step[data-status="succeeded"] .tl__dot {
  background: var(--green, #16a36a);
  border-color: var(--green, #16a36a);
  color: #fff;
}
.tl__step[data-status="running"] { color: var(--text); }
.tl__step[data-status="running"] .tl__dot {
  border-color: #ff6b2c;
  color: #ff6b2c;
  animation: tl-ring 1.8s infinite;
}
.tl__step[data-status="failed"] .tl__dot {
  background: var(--red, #dc4c4c);
  border-color: var(--red, #dc4c4c);
  color: #fff;
}
.tl__step[data-status="waiting"] .tl__dot { color: var(--accent); border-color: var(--accent); }
@keyframes tl-ring {
  50% { box-shadow: 0 0 0 5px rgba(255, 107, 44, 0.18); }
}
@media (prefers-reduced-motion: reduce) {
  .tl__dot { animation: none !important; }
}
/* C2_SPARKLINE_CSS_V1 - sparkline y su contenedor en KpiCard. */
.sparkline { display: block; }
.v3-kpi-spark {
  margin-top: 8px;
  color: var(--v2-purple);
  opacity: 0.8;
}
/* C3_APPROVAL_CSS_V1 - item de aprobacion con cuenta atras. */
.ap-list { display: flex; flex-direction: column; gap: 10px; }
.ap {
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.ap[data-state="scheduled"] {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 5%, var(--surface));
}
.ap__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ap__title { font-size: 13.5px; font-weight: 600; }
.ap__amount { font-size: 12px; font-weight: 700; color: var(--accent); font-variant-numeric: tabular-nums; }
.ap__meta { color: var(--text-3); font-size: 11px; display: block; margin-top: 4px; }
.ap__countdown { margin-top: 10px; font-size: 12.5px; }
.ap__countdown b { color: var(--accent); font-variant-numeric: tabular-nums; }
.ap__actions { margin-top: 10px; display: flex; gap: 6px; }
.ap .btn {
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  color: var(--text-2);
  font-size: 12px;
  cursor: pointer;
}
.ap .btn:hover:not(:disabled) { background: var(--bg-hover); color: var(--text); }
.ap .btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ap .btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.ap .btn.primary:hover:not(:disabled) { background: #4f40e8; }
.ap-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--text-3);
  font-size: 12.5px;
  border: 1px dashed var(--border);
  border-radius: 12px;
}
/* D3_TEMPLATES_CSS_V1 - templates dashboard y queue + panel contextual. */
.tpl { display: flex; flex-direction: column; gap: 14px; }
.tpl__title { margin: 0; font-size: 14px; font-weight: 700; color: var(--text); }
.tpl-dashboard__kpis {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}
.tpl-kpi {
  padding: 12px;
  background: var(--bg-soft, var(--surface-2));
  border: 1px solid var(--border);
  border-radius: 12px;
}
.tpl-kpi__label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-3);
}
.tpl-kpi__value { font-size: 24px; font-weight: 800; color: var(--text); margin-top: 4px; }
.tpl-kpi__delta { font-size: 11px; color: var(--accent); margin-top: 4px; display: block; }

.tpl-queue__list { display: flex; flex-direction: column; gap: 8px; }
.tpl-queue__item {
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tpl-queue__item[data-status="running"] { border-left: 3px solid #3978e8; }
.tpl-queue__item[data-status="error"] { border-left: 3px solid var(--red, #dc4c4c); }
.tpl-queue__body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.tpl-queue__title { font-size: 13px; font-weight: 500; }
.tpl-queue__sub { font-size: 11px; color: var(--text-3); }
.tpl-queue__actions { display: flex; gap: 6px; flex-wrap: wrap; }
.tpl-queue__empty {
  padding: 20px 12px;
  text-align: center;
  font-size: 12px;
  color: var(--text-3);
  border: 1px dashed var(--border);
  border-radius: 10px;
}

.ctx-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface);
  border-left: 1px solid var(--border);
}
.ctx-panel__head {
  height: 48px;
  flex: 0 0 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
}
.ctx-panel__title { font-size: 13px; font-weight: 600; }
.ctx-panel__body { flex: 1; overflow-y: auto; padding: 14px; }
.ctx-panel__empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--text-3);
  font-size: 12px;
}
.tpl .btn {
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  color: var(--text-2);
  font-size: 11px;
  cursor: pointer;
}
.tpl .btn:hover { background: var(--bg-hover); color: var(--text); }
.tpl .btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
/* E1_MEMORY_BOARD_CSS_V1 - board de memorias. */
.mb { display: flex; flex-direction: column; gap: 14px; }
.mb__filters { display: flex; gap: 8px; flex-wrap: wrap; }
.mb__search, .mb__select {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font-size: 12.5px;
  outline: none;
}
.mb__search { flex: 1; min-width: 180px; }
.mb__search:focus, .mb__select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
}
.mb__groups { display: flex; flex-direction: column; gap: 10px; }
.mb__group {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.mb__group-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-size: 13px;
}
.mb__group-head:hover { background: var(--bg-hover); }
.mb__group-title { font-weight: 600; flex: 1; }
.mb__group-count {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--bg-hover);
  color: var(--text-3);
}
.mb__group-chevron { color: var(--text-3); font-size: 12px; }
.mb__group-body {
  padding: 0 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mb__item {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-soft, var(--surface-2));
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mb__item-text { font-size: 12.5px; line-height: 1.5; color: var(--text); }
.mb__item-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.mb__item-actions { display: flex; gap: 6px; margin-top: 2px; }
.mb__item-actions .btn {
  height: 24px;
  padding: 0 9px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-2);
  font-size: 11px;
  cursor: pointer;
}
.mb__item-actions .btn:hover { background: var(--bg-hover); color: var(--text); }
.mb__item-actions .btn.danger { color: var(--red, #dc4c4c); }
.mb__empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--text-3);
  font-size: 12.5px;
  border: 1px dashed var(--border);
  border-radius: 12px;
}
/* E2_DOCS_CSS_V1 - arbol de documentos + multi-upload. */
.dtree { list-style: none; margin: 0; padding: 0 0 0 12px; font-size: 12.5px; }
.dtree details > summary { cursor: pointer; padding: 3px 0; color: var(--text); }
.dtree__folder { display: flex; align-items: center; gap: 6px; }
.dtree__folder small { color: var(--text-3); font-size: 10px; }
.dtree__file {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--text-2);
  padding: 3px 0;
  cursor: pointer;
  text-align: left;
  font: inherit;
}
.dtree__file:hover { color: var(--text); }
.dtree__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dtree__size { color: var(--text-3); font-size: 10px; }

.mu { display: flex; flex-direction: column; gap: 10px; }
.mu__dropzone {
  display: flex;
  justify-content: center;
  padding: 16px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  background: var(--bg-soft, var(--surface-2));
}
.mu__pick {
  height: 32px;
  padding: 0 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font-size: 12.5px;
  cursor: pointer;
}
.mu__pick:hover { background: var(--bg-hover); }
.mu__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.mu__item {
  display: grid;
  grid-template-columns: 1fr 120px 40px;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  font-size: 12px;
}
.mu__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mu__progress {
  height: 4px;
  border-radius: 999px;
  background: var(--bg-active, #eee);
  overflow: hidden;
}
.mu__bar {
  display: block;
  height: 100%;
  background: var(--accent);
  transition: width 200ms ease;
}
.mu__status { text-align: right; color: var(--text-3); }
.mu__item[data-status="done"] .mu__status { color: var(--green, #16a36a); }
.mu__item[data-status="error"] .mu__status { color: var(--red, #dc4c4c); }
.mu__error {
  grid-column: 1 / -1;
  color: var(--red, #dc4c4c);
  font-size: 11px;
}
/* E3_PERMISSION_MATRIX_CSS_V1 - matriz de permisos. */
.pm {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}
.pm th, .pm td {
  padding: 8px 10px;
  text-align: center;
  border-bottom: 1px solid var(--border);
}
.pm thead th {
  background: var(--bg-soft, var(--surface-2));
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-3);
}
.pm__resource-col, .pm__resource {
  text-align: left !important;
  font-weight: 600;
  color: var(--text);
  position: sticky;
  left: 0;
  background: var(--surface);
  z-index: 1;
}
.pm tbody tr:last-child th,
.pm tbody tr:last-child td { border-bottom: 0; }
.pm[data-locked] .pm__cell { opacity: 0.5; }
.pm__cell { display: inline-flex; justify-content: center; }
.pm__cell input[type="checkbox"] { cursor: pointer; }
.pm__cell input[type="checkbox"]:disabled { cursor: not-allowed; }
.pm__empty { text-align: center; color: var(--text-3); font-size: 12px; padding: 20px; }

/* AGENTS_CSS_IMPORT_V1 - estilos del frente Agentes. */
@import "./components/agents/agents.css";
```

## File: apps/web/src/components/MessageBubble.tsx
```typescript
// BUG03_MESSAGEBUBBLE_V2 - itera message.tools[] + preview.
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { ChatMessage } from "../types/api";
import ToolCallsGroup from "./ToolCallsGroup";
import AttachmentPreview from "./AttachmentPreview";
import type { ToolCall } from "../lib/toolsReducer";

interface Props {
  message: ChatMessage;
  onQuickAction?: (kind: "responder" | "resumir" | "traducir", text: string) => void;
}

export default function MessageBubble({ message, onQuickAction }: Props) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [preview] = useState<{ url: string; name: string; mimeType?: string } | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard bloqueado */ }
  };

  if (isUser) {
    return (
      <div className="v2-user-bubble">
        <div className="v2-user-bubble-inner">{message.content}</div>
      </div>
    );
  }

  const toolList: ToolCall[] = (message.tools ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    startedAt: t.startedAt,
    endedAt: t.endedAt,
  }));

  return (
    <div className="v2-assistant-row">
      <div className="v2-assistant-avatar">IA</div>
      <div className="v2-assistant-body">
        {toolList.length > 0 && <ToolCallsGroup tools={toolList} />}
        <div className="v2-assistant-text" style={{ marginTop: 12 }}>{message.content}</div>

        {message.content && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <button
              onClick={copy}
              title={copied ? "Copiado" : "Copiar"}
              aria-label="Copiar mensaje"
              style={{
                width: 26, height: 26,
                border: "1px solid var(--v2-border)",
                borderRadius: 6,
                background: "transparent",
                color: copied ? "var(--v2-green)" : "var(--v2-text-3)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            {onQuickAction && (
              <>
                <button className="v2-tag" onClick={() => onQuickAction("responder", message.content)}>Responder</button>
                <button className="v2-tag" onClick={() => onQuickAction("resumir", message.content)}>Resumir</button>
                <button className="v2-tag" onClick={() => onQuickAction("traducir", message.content)}>Traducir</button>
              </>
            )}
          </div>
        )}
        {preview && (
          <AttachmentPreview
            url={preview.url}
            name={preview.name}
            mimeType={preview.mimeType}
            onClose={() => { /* noop */ }}
          />
        )}
      </div>
    </div>
  );
}
```

## File: apps/web/src/components/MessageList.tsx
```typescript
// BUG03_MESSAGELIST_V3 - typewriter + ToolCallsGroup.
import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types/api";
import MessageBubble from "./MessageBubble";
import { useTypewriter } from "../hooks/useTypewriter";
import type { ToolCall } from "../lib/toolsReducer";

interface Props {
  messages: ChatMessage[];
  streaming: boolean;
  streamBuf: string;
  tools: ToolCall[];
  onQuickAction?: (kind: "responder" | "resumir" | "traducir", text: string) => void;
}

// FIX_MSGLIST_SLICE_V1 - tope de 50 mensajes visibles. Antes se pintaban
// todos; con 500 mensajes eran ~5.000 DOM nodes y el scroll caia por debajo
// de 30 FPS.
const MAX_RENDERED_MESSAGES = 50;
export default function MessageList({ messages, streaming, streamBuf, tools, onQuickAction }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { text: typed, typing } = useTypewriter(streamBuf, !streaming);
  const visibleMessages = messages.length > MAX_RENDERED_MESSAGES
    ? messages.slice(-MAX_RENDERED_MESSAGES)
    : messages;

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages, typed, tools, streaming]);

  return (
    <div className="v2-assistant-body" ref={ref} style={{ overflow: "visible" }}>
      {visibleMessages.map((m) => (
        <MessageBubble key={m.id} message={m} onQuickAction={onQuickAction} />
      ))}

      {streaming && typed && (
        <div className="v2-assistant-text" style={{ marginTop: 12 }}>
          {typed}
          {typing && <span className="stream-cursor" aria-hidden="true" />}
        </div>
      )}
    </div>
  );
}
```

## File: apps/web/src/components/ControlCenterView.tsx
```typescript
// C2_CONTROLCENTER_V2 - usa KpiCard y Sparkline.
// UI_ANIMATED_NUMBER_V1
import { useEffect, useState } from "react";
// UI_CC_CLEANUP_V1 - quitados Activity, AlertCircle, Briefcase sin usar.
import { ChevronRight } from "lucide-react"; // FIX_02_CCVIEW_CLEAN_V1
import { useTasks } from "../hooks/useTasks";
import KpiCard from "./KpiCard"; // FIX_02_CCVIEW_CLEAN_V1
// WIRE_KPICARD_V1
import { useNotifications } from "../hooks/useNotifications";
import type { AgentTask } from "../types/api";
import { relativeTime } from "../lib/format";

interface Props {
  enabled: boolean;
  onOpenTask?: (taskId: string) => void;
}

function statusLabel(task: AgentTask): string {
  if (task.status === "running") {
    const running = task.plan.find((s) => s.status === "running");
    if (running) return running.title;
    return "Trabajando en ello";
  }
  if (task.status === "waiting_approval") return "Esperando tu aprobación";
  if (task.status === "waiting_input") return "Necesita datos tuyos";
  if (task.status === "queued") return "En cola";
  if (task.status === "scheduled") return "Programada";
  if (task.status === "paused") return "En pausa";
  if (task.status === "succeeded") return "Completada";
  if (task.status === "failed") return "Con error";
  return "Cancelada";
}

function humanKind(kind: string): string {
  if (kind === "sop") return "Proceso";
  if (kind === "document") return "Documento";
  if (kind === "monitor") return "Vigilancia";
  if (kind === "finance") return "Finanzas";
  if (kind === "plan") return "Plan";
  return "Tarea";
}

function initialOf(assignedTo?: string): string {
  if (!assignedTo) return "IA";
  return assignedTo.slice(0, 1).toUpperCase();
}

export default function ControlCenterView({ enabled, onOpenTask }: Props) {
  const tasks = useTasks(3000, enabled);
  const notifications = useNotifications(enabled);
  const [, setTick] = useState(0);

  // Re-render cada 5 s para que "hace X min" y los contadores en vivo se refresquen.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const all = tasks.tasks;
  const running = all.filter((t) => t.status === "running");
  const queued = all.filter((t) => t.status === "queued" || t.status === "scheduled");
  const paused = all.filter((t) => t.status === "paused");
  const needsAction = all.filter(
    (t) => t.status === "waiting_approval" || t.status === "waiting_input",
  );
  const completed = all.filter((t) => t.status === "succeeded");
  const failed = all.filter((t) => t.status === "failed");
  const idle = queued.length + paused.length;

  const banner = needsAction[0];

  const workerBusy = running.length;
  const workerIdle = idle;
  const workerPaused = paused.length;
  const workerTotal = workerBusy + workerIdle + workerPaused;

  const lastError = failed[0];

  return (
    <div className="v3-cc-main">
      <div className="v3-cc-header">
        <h1 className="v3-cc-title">Centro de control</h1>
        <div className="v3-cc-sub">
          {workerTotal > 0
            ? `${workerBusy} agente${workerBusy === 1 ? "" : "s"} trabajando ahora mismo`
            : "Todo en calma"}
          {" · "}
          {needsAction.length > 0
            ? `${needsAction.length} cosa${needsAction.length === 1 ? "" : "s"} esperando tu OK`
            : "nada esperando tu OK"}
        </div>
      </div>

      {/* KPIs */}
      <div className="v3-cc-kpis">
        {/* WIRE_KPICARD_V1 */}
        <KpiCard
          label="Agentes trabajando"
          value={workerBusy}
          icon="green"
          meta={`${workerIdle} esperando · ${workerPaused} en pausa`}
        />
        <KpiCard
          label="Tareas completadas"
          value={completed.length}
          meta={`${failed.length} con error · ${all.length} en total`}
        />
        <KpiCard
          label="Pendientes de tu OK"
          value={needsAction.length}
          icon="orange"
          meta={notifications.unread > 0 ? `${notifications.unread} notificaciones sin leer` : "todo visto"}
        />
      </div>

      {/* Banner "necesita tu accion" */}
      {banner && (
        <div className="v2-need-action">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div className="v2-need-action-icon">⚠️</div>
            <div>
              <div className="v2-need-action-eyebrow">Necesita tu acción</div>
              <div className="v2-need-action-title">{banner.title}</div>
              <div className="v2-need-action-sub">
                {banner.status === "waiting_input"
                  ? "Necesita datos tuyos para continuar"
                  : "Esperando tu aprobación"}
              </div>
            </div>
          </div>
          <button
            className="v2-need-action-btn"
            onClick={() => onOpenTask?.(banner.id)}
          >
            Revisar
          </button>
        </div>
      )}

      {/* Procesos en curso */}
      <div className="v3-cc-section">
        <div className="v3-cc-section-head">
          <span className="v3-cc-section-title">Procesos en marcha</span>
          <span className="v3-cc-section-meta">
            {running.length} en curso
          </span>
        </div>
        {running.length === 0 ? (
          <div className="v3-cc-empty">
            {all.length === 0
              ? "Aún no hay procesos en marcha."
              : "Nada trabajando ahora mismo."}
          </div>
        ) : (
          running.slice(0, 6).map((t) => (
            <div
              key={t.id}
              className="v3-task-row"
              onClick={() => onOpenTask?.(t.id)}
            >
              <div className="v3-spinner" />
              <div className="v3-task-body">
                <div className="v3-task-title">{t.title}</div>
                <div className="v3-task-sub">
                  {humanKind(t.kind)} · {statusLabel(t)} · {relativeTime(t.updatedAt)}
                </div>
              </div>
              <div className="v3-task-tags">
                <span className="v2-tag agent">{humanKind(t.kind)}</span>
                <div className="v3-task-avatar">{initialOf(t.assignedTo)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pendientes */}
      {queued.length > 0 && (
        <div className="v3-cc-section">
          <div className="v3-cc-section-head">
            <span className="v3-cc-section-title">En cola</span>
            <span className="v3-cc-section-meta">{queued.length} esperando</span>
          </div>
          {queued.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="v3-task-row soft"
              onClick={() => onOpenTask?.(t.id)}
            >
              <span className="v2-task-status empty" />
              <div className="v3-task-body">
                <div className="v3-task-title">{t.title}</div>
                <div className="v3-task-sub">
                  {humanKind(t.kind)} · {statusLabel(t)}
                </div>
              </div>
              <div className="v3-task-tags">
                <ChevronRight size={14} style={{ color: "var(--v2-text-3)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado del equipo + Resumen */}
      <div className="v3-cc-bottom">
        <div className="v3-cc-panel">
          <div className="v3-cc-panel-title">Estado del equipo</div>
          <div className="v3-cc-stat">
            <span>Trabajando</span>
            <div className="v3-cc-bar green">
              <span style={{ width: `${workerTotal ? (workerBusy / workerTotal) * 100 : 0}%` }} />
            </div>
            <b>{workerBusy}</b>
          </div>
          <div className="v3-cc-stat">
            <span>Esperando</span>
            <div className="v3-cc-bar gray">
              <span style={{ width: `${workerTotal ? (workerIdle / workerTotal) * 100 : 0}%` }} />
            </div>
            <b>{workerIdle}</b>
          </div>
          <div className="v3-cc-stat">
            <span>En pausa</span>
            <div className="v3-cc-bar orange">
              <span style={{ width: `${workerTotal ? (workerPaused / workerTotal) * 100 : 0}%` }} />
            </div>
            <b>{workerPaused}</b>
          </div>
        </div>

        <div className="v3-cc-panel">
          <div className="v3-cc-panel-title">Resumen del sistema</div>
          <div className="v3-cc-stat">
            <span>Estado</span>
            <b style={{ color: tasks.workerRunning ? "var(--v2-green)" : "var(--v2-text-3)" }}>
              {tasks.workerRunning ? "Funcionando" : "Parado"}
            </b>
          </div>
          <div className="v3-cc-stat">
            <span>Última actividad</span>
            <b>
              {tasks.workerLastTickAt
                ? relativeTime(tasks.workerLastTickAt)
                : "—"}
            </b>
          </div>
          <div className="v3-cc-stat">
            <span>Último problema</span>
            <b style={{ color: lastError ? "var(--v2-warn-text)" : "inherit" }}>
              {lastError ? relativeTime(lastError.updatedAt) : "ninguno"}
            </b>
          </div>
          <div className="v3-cc-stat">
            <span>Notificaciones</span>
            <b>{notifications.unread} sin leer</b>
          </div>
        </div>
      </div>

      {tasks.error && (
        <div className="chat-error" style={{ marginTop: 16 }}>{tasks.error}</div>
      )}
    </div>
  );
}
```

## File: apps/web/src/components/MemoryView.tsx
```typescript
// FIX_02_MEMORYVIEW_CLEAN_V1 - import MemoryBoard pendiente de wire.
// BUG05_MEMORYVIEW_V2 - usa MemoryBoard para agrupacion y filtros.
// E1_MEMORYVIEW_V2 - delega en MemoryBoard para agrupacion y filtros.
// UI_PANEL_SLIDE_V1_USE
import { useMemo, useState } from "react";
import { Brain, Pencil, Search, Trash2, X } from "lucide-react";
import { apiFetch } from "../api/client";
import type { MemoryEntry } from "../hooks/useWorkspaceData";
// WIRE_MEMORY_BOARD_V1

interface Props {
  memories: MemoryEntry[];
}

const CATEGORIES = ["empresa", "cliente", "proceso", "preferencia", "rrhh", "producto", "otro"] as const;
type Category = (typeof CATEGORIES)[number];

interface MemoryDetail extends MemoryEntry {
  category?: Category | null;
  tags?: string[] | null;
}

function relativeTime(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`;
  return `${Math.floor(ms / 86400000)}d`;
}

export default function MemoryView({ memories }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "todas">("todas");
  const [editing, setEditing] = useState<MemoryDetail | null>(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState<Category | "">("");
  const [editTags, setEditTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (memories as MemoryDetail[]).filter((m) => {
      if (category !== "todas" && m.category !== category) return false;
      if (!q) return true;
      const haystack = `${m.text} ${(m.tags ?? []).join(" ")} ${m.source ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [memories, query, category]);

  const openEdit = (m: MemoryDetail) => {
    setEditing(m);
    setEditText(m.text);
    setEditCategory((m.category as Category) ?? "");
    setEditTags((m.tags ?? []).join(", "));
    setError(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      // A1_MEMORY_PATCH_V2 - enviar siempre category y tags; null cuando el usuario los borra.
      await apiFetch(`/api/agent/memories/${encodeURIComponent(editing.id)}`, {
        method: "POST",
        body: {
          text: editText.trim(),
          source: editing.source ?? "You",
          category: editCategory || null,
          tags: editTags.trim()
            ? editTags.split(",").map((t) => t.trim()).filter(Boolean)
            : null,
        },
      });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setBusy(false);
    }
  };

  const forget = async (m: MemoryDetail) => {
    if (!confirm(`Borrar la memoria "${m.text.slice(0, 60)}..."?`)) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/agent/memories/${encodeURIComponent(m.id)}/forget`, { method: "POST", body: {} });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al borrar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="v2-tasks-view" style={{ maxWidth: 820 }}>
      <div className="v2-tasks-header">
        <h1 className="v2-tasks-title">Conocimiento</h1>
        <div className="v2-tasks-meta">{items.length} de {memories.length} entradas</div>
      </div>

      <div className="v2-composer" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={15} style={{ color: "var(--v2-text-3)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en la memoria"
            style={{
              flex: 1, border: 0, outline: 0, background: "transparent",
              fontSize: 14, color: "var(--v2-text)", fontFamily: "inherit",
            }}
          />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          <button
            className={`v2-pill ${category === "todas" ? "active" : ""}`}
            onClick={() => setCategory("todas")}
          >Todas</button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`v2-pill ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {error && <div className="chat-error" style={{ marginBottom: 12 }}>{error}</div>}

      {memories.length === 0 ? (
        <div className="v2-tasks-empty">
          <Brain size={22} style={{ marginBottom: 8, color: "var(--v2-purple)" }} />
          <p style={{ margin: 0, fontSize: 13, color: "var(--v2-text)" }}>El agente aun no ha aprendido nada.</p>
          <small style={{ color: "var(--v2-text-3)" }}>Cuando termines tareas con SOPs, se guardaran recuerdos aqui.</small>
        </div>
      ) : items.length === 0 ? (
        <div className="v2-tasks-empty">
          <Search size={22} style={{ marginBottom: 8, color: "var(--v2-purple)" }} />
          <p style={{ margin: 0, fontSize: 13, color: "var(--v2-text)" }}>Ninguna entrada coincide con el filtro.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((m) => (
            <div
              key={m.id}
              style={{
                padding: 14,
                background: "#FFF",
                border: "1px solid var(--v2-border)",
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--v2-text)" }}>{m.text}</div>
              {m.category && <span className="v2-tag" style={{ marginTop: 8 }}>{m.category}</span>}
              {m.tags && m.tags.length > 0 && (
                <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                  {m.tags.map((t) => <span key={t} className="v2-tag">{t}</span>)}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 10, color: "var(--v2-text-3)" }}>
                {m.source && <span>{m.source}</span>}
                {m.createdAt && <span>{relativeTime(m.createdAt)}</span>}
                <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                  <button className="v2-pill" title="Editar" onClick={() => openEdit(m)}>
                    <Pencil size={12} />
                  </button>
                  <button className="v2-pill" title="Olvidar" onClick={() => void forget(m)}>
                    <Trash2 size={12} />
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">Editar memoria</div>
                <div className="modal-sub">Lo que el agente recordara</div>
              </div>
              <button className="ghost-icon-button" onClick={() => setEditing(null)}><X size={17} /></button>
            </div>
            <div className="modal-body">
              <label className="modal-label">Texto</label>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--v2-border)", borderRadius: 8, background: "#FFF", color: "var(--v2-text)", fontSize: 12.5, fontFamily: "inherit", resize: "vertical" }}
              />
              <label className="modal-label" style={{ marginTop: 14 }}>Categoria</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as Category | "")}
                style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--v2-border)", borderRadius: 8, background: "#FFF", color: "var(--v2-text)", fontSize: 12.5 }}
              >
                <option value="">(sin categoria)</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="modal-label" style={{ marginTop: 14 }}>Tags (separados por coma)</label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--v2-border)", borderRadius: 8, background: "#FFF", color: "var(--v2-text)", fontSize: 12.5 }}
              />
              <div className="control-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button className="v2-pill" onClick={() => setEditing(null)} disabled={busy}>Cerrar</button>
                <button className="v2-need-action-btn" onClick={saveEdit} disabled={busy || !editText.trim()}>
                  {busy ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## File: apps/web/src/components/DocumentsView.tsx
```typescript
// FIX_02_DOCSVIEW_CLEAN_V1 - imports DocumentTree/MultiUpload pendientes de wire.
// BUG05_DOCUMENTS_VIEW_V2 - usa DocumentTree + MultiUpload.
// E2_DOCUMENTS_VIEW_V2 - usar DocumentTree + MultiUpload + search RAG.
// UI_PANEL_SLIDE_V1_USE
// DOCUMENTS_REINGEST_SERVER_V1 - reingesta via endpoint server-side.
import { useCallback, useEffect, useState } from "react";
import { FileText, RefreshCw, Search, Trash2 } from "lucide-react";
import type { FileEntry } from "../hooks/useWorkspaceData";
import AttachmentPreview from "./AttachmentPreview";
// WIRE_DOCS_TREE_UPLOAD_V1
import { formatBytes, relativeTime } from "../lib/format";
import {
  ragDeleteSource,
  ragReingest,
  ragSearch,
  ragStatus,
  type RagHit,
  type RagStatus,
} from "../api/rag";

interface Props {
  files: FileEntry[];
}

export default function DocumentsView({ files }: Props) {
  const [status, setStatus] = useState<RagStatus | null>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<RagHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [busySource, setBusySource] = useState<string | null>(null);
  const [preview, setPreview] = useState<FileEntry | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      setStatus(await ragStatus());
    } catch {
      setStatus({ configured: false, chunks: 0, sources: 0 });
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus, files.length]);

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    try {
      setHits(await ragSearch(q, 8));
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Error en la busqueda");
      setHits(null);
    } finally {
      setSearching(false);
    }
  };

  const ingestFile = async (file: FileEntry) => {
    if (!file.url) {
      setSearchError("Este archivo no tiene URL firmada; no se puede reingestar.");
      return;
    }
    setBusySource(file.id);
    setSearchError(null);
    try {
      await ragReingest(file.id);
      await refreshStatus();
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Error al reingestar");
    } finally {
      setBusySource(null);
    }
  };

  const removeSource = async (sourceId: string) => {
    if (!confirm("Borrar esta fuente del indice RAG?")) return;
    setBusySource(sourceId);
    setSearchError(null);
    try {
      await ragDeleteSource(sourceId);
      await refreshStatus();
      setHits(null);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Error al borrar");
    } finally {
      setBusySource(null);
    }
  };

  return (
    <div className="v2-tasks-view" style={{ maxWidth: 900 }}>
      <div className="v2-tasks-header">
        <h1 className="v2-tasks-title">Documentos</h1>
        <div className="v2-tasks-meta">
          {files.length} archivos
          {status?.configured
            ? ` · ${status.chunks} chunks · ${status.sources} fuentes`
            : " · RAG inactivo"}
        </div>
      </div>

      <div className="v2-composer" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={15} style={{ color: "var(--v2-text-3)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void runSearch(); }}
            placeholder="Buscar en tus documentos (busqueda semantica)"
            disabled={!status?.configured || searching}
            style={{
              flex: 1,
              border: 0,
              outline: 0,
              background: "transparent",
              fontSize: 14,
              color: "var(--v2-text)",
              fontFamily: "inherit",
            }}
          />
          <button
            className="v2-need-action-btn"
            onClick={() => void runSearch()}
            disabled={!status?.configured || searching || !query.trim()}
          >
            {searching ? "Buscando..." : "Buscar"}
          </button>
          <button className="v2-pill" onClick={() => void refreshStatus()} title="Refrescar estado">
            <RefreshCw size={14} />
          </button>
        </div>
        {!status?.configured && (
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--v2-text-3)" }}>
            Falta GEMINI_API_KEY en el servidor para activar la busqueda semantica.
          </div>
        )}
        {searchError && (
          <div className="chat-error" style={{ marginTop: 12 }}>{searchError}</div>
        )}
        {hits && hits.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
            {hits.map((hit) => (
              <div
                key={hit.id}
                style={{
                  padding: 12,
                  background: "var(--v2-bg-soft)",
                  border: "1px solid var(--v2-border)",
                  borderRadius: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 11 }}>
                  <span style={{ fontWeight: 600, color: "var(--v2-text-2)" }}>{hit.sourceName}</span>
                  <span style={{ color: "var(--v2-purple)", fontWeight: 600 }}>{Math.min(100, Math.round(hit.score * 100))}%</span>
                  <button
                    className="v2-pill"
                    onClick={() => void removeSource(hit.sourceId)}
                    disabled={busySource === hit.sourceId}
                    title="Borrar esta fuente del indice"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--v2-text)" }}>{hit.text}</div>
              </div>
            ))}
          </div>
        )}
        {hits && hits.length === 0 && (
          <div style={{ marginTop: 12, fontSize: 11, color: "var(--v2-text-3)" }}>Sin resultados.</div>
        )}
      </div>

      {files.length === 0 ? (
        <div className="v2-tasks-empty">
          <FileText size={22} style={{ marginBottom: 8, color: "var(--v2-purple)" }} />
          <p style={{ margin: 0, fontSize: 13, color: "var(--v2-text)" }}>Aun no has subido documentos.</p>
          <small style={{ color: "var(--v2-text-3)" }}>Adjunta un PDF o un texto desde el chat para empezar.</small>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {files.map((f) => (
            <div key={f.id} className="v2-suggestion-card" style={{ cursor: "default" }}>
              <div className="v2-suggestion-icon">📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  title={f.name}
                >{f.name}</div>
                <div style={{ fontSize: 11, color: "var(--v2-text-3)", marginTop: 4 }}>
                  {formatBytes(f.size)}{f.size && f.createdAt ? " · " : ""}{relativeTime(f.createdAt)}
                </div>
                {f.source && (
                  <div style={{ fontSize: 11, color: "var(--v2-text-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.source}>
                    {f.source}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <button
                    className="v2-pill"
                    onClick={() => void ingestFile(f)}
                    disabled={busySource === f.id || !status?.configured}
                  >
                    {busySource === f.id ? "..." : "Reingestar"}
                  </button>
                  <button
                    className="v2-pill"
                    onClick={() => void removeSource(f.id)}
                    disabled={busySource === f.id || !status?.configured}
                  >
                    <Trash2 size={12} />
                  </button>
                  {f.url && (
                    <button className="v2-pill" onClick={() => setPreview(f)}>Ver</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && preview.url && (
        <AttachmentPreview
          url={preview.url}
          name={preview.name}
          mimeType={preview.mimeType}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
```

## File: apps/web/src/components/TasksView.tsx
```typescript
// FIX_02_TASKSVIEW_CLEAN_V1 - import TaskTimeline pendiente de wire.
// C3_TASKSVIEW_APPROVALS_V1 - usar ApprovalInbox en la seccion 'Necesita tu OK'.
// C1_TASKSVIEW_V2 - usa TaskTimeline en el detalle y filtro por rol.
// TASKS_ROLE_FILTER_V1 - filtro por rol del empleado digital.
// UI_PANEL_SLIDE_V1_USE
import { useMemo, useState } from "react";
import type { AgentTask } from "../types/api";
// WIRE_TASKTIMELINE_V1

interface Props {
  tasks: AgentTask[];
  currentUserId: string | null;
  onOpenTask: (task: AgentTask) => void;
  onReviewTask: (task: AgentTask) => void;
}

type Filter = "todas" | "mias" | "sin_asignar" | "escaladas";

const DEMO_BANNER = {
  title: "Aprobar factura · Consultoría Norte · 7.900 €",
  sub: "Vence mañana · supera el umbral del SOP · 5.000 € → 7.900 € (+58%)",
};

const DEMO_EN_CURSO = [
  { t: "Conciliar banco de septiembre", tag: "Agente", meta: "hace 4 min" },
  { t: "Enviar recordatorios de pago", tag: "Agente", meta: "hace 12 min" },
];
const DEMO_POR_HACER = [
  { t: "Revisar contrato de alquiler", tag: "Legal", meta: "Vie 3" },
  { t: "Actualizar SOP de altas de cliente", tag: "SOP", meta: "Lun 6" },
];
const DEMO_COMPLETADO = [{ t: "Resumen semanal enviado al equipo", meta: "Hoy" }];

export default function TasksView({ tasks, currentUserId, onOpenTask, onReviewTask }: Props) {
  const [filter, setFilter] = useState<Filter>("todas");

  const visible = useMemo(() => {
    if (filter === "mias")
      // TASKS_MIAS_V1 - incluye no asignadas.
      return tasks.filter((t) => t.assignedTo === currentUserId || !t.assignedTo);
    if (filter === "sin_asignar") return tasks.filter((t) => !t.assignedTo);
    if (filter === "escaladas")
      return tasks.filter((t) => Boolean((t.state as Record<string, unknown>)?.escalatedTo));
    return tasks;
  }, [tasks, filter, currentUserId]);

  const needsAction = visible.filter(
    (t) => t.status === "waiting_approval" || t.status === "waiting_input",
  );
  const enCurso = visible.filter((t) => t.status === "running");
  const porHacer = visible.filter(
    (t) => t.status === "queued" || t.status === "scheduled" || t.status === "paused",
  );
  const completado = visible.filter((t) => t.status === "succeeded");

  const banner = needsAction[0];
  const bannerTitle = banner ? banner.title : DEMO_BANNER.title;
  const bannerSub = banner
    ? banner.status === "waiting_input"
      ? "Necesita datos tuyos para continuar"
      : "Esperando tu aprobación"
    : DEMO_BANNER.sub;

  const filters: { id: Filter; label: string }[] = [
    { id: "todas", label: "Todas" },
    { id: "mias", label: "Mías" },
    { id: "sin_asignar", label: "Sin asignar" },
    { id: "escaladas", label: "Escaladas" },
  ];

  return (
    <div className="v2-tasks-view">
      <div className="v2-tasks-header">
        <h1 className="v2-tasks-title">Tareas</h1>
        <div className="v2-tasks-meta">
          {tasks.length} tareas · {needsAction.length} necesitan acción
        </div>
      </div>

      <div className="v2-pill-row" style={{ marginBottom: 20 }}>
        {filters.map((f) => (
          <button
            key={f.id}
            className={`v2-pill ${filter === f.id ? "active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {(needsAction.length > 0 || tasks.length === 0) && (
        <div className="v2-need-action">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div className="v2-need-action-icon">⚠️</div>
            <div>
              <div className="v2-need-action-eyebrow">Necesita tu acción</div>
              <div className="v2-need-action-title">{bannerTitle}</div>
              <div className="v2-need-action-sub">{bannerSub}</div>
            </div>
          </div>
          <button
            className="v2-need-action-btn"
            onClick={() => (banner ? onReviewTask(banner) : undefined)}
          >
            Revisar
          </button>
        </div>
      )}

      <div className="v2-tasks-section">
        <div className="v2-section-heading">● En curso</div>
        {enCurso.length === 0 && tasks.length > 0 ? (
          <div className="v2-tasks-empty">Sin tareas en curso</div>
        ) : enCurso.length === 0 ? (
          DEMO_EN_CURSO.map((row, i) => (
            <div key={i} className="v2-task-row">
              <span className="v2-task-status half" />
              <span className="v2-task-row-title">{row.t}</span>
              <div className="v2-task-row-meta">
                <span className="v2-tag agent">{row.tag}</span>
                <span className="v2-task-row-date">{row.meta}</span>
              </div>
            </div>
          ))
        ) : (
          enCurso.map((t) => (
            <div key={t.id} className="v2-task-row" onClick={() => onOpenTask(t)}>
              <span className="v2-task-status half" />
              <span className="v2-task-row-title">{t.title}</span>
              <div className="v2-task-row-meta">
                <span className="v2-tag agent">{t.kind}</span>
                <span className="v2-task-row-date">{t.updatedAt.slice(11, 16)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="v2-tasks-section">
        <div className="v2-section-heading">○ Por hacer</div>
        {porHacer.length === 0 && tasks.length > 0 ? (
          <div className="v2-tasks-empty">Sin tareas pendientes</div>
        ) : porHacer.length === 0 ? (
          DEMO_POR_HACER.map((row, i) => (
            <div key={i} className="v2-task-row soft">
              <span className="v2-task-status empty" />
              <span className="v2-task-row-title">{row.t}</span>
              <div className="v2-task-row-meta">
                <span className="v2-tag">{row.tag}</span>
                <span className="v2-task-row-date">{row.meta}</span>
              </div>
            </div>
          ))
        ) : (
          porHacer.map((t) => (
            <div key={t.id} className="v2-task-row soft" onClick={() => onOpenTask(t)}>
              <span className="v2-task-status empty" />
              <span className="v2-task-row-title">{t.title}</span>
              <div className="v2-task-row-meta">
                <span className="v2-tag">{t.kind}</span>
                <span className="v2-task-row-date">{t.updatedAt.slice(11, 16)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="v2-tasks-section">
        <div className="v2-section-heading">✓ Completado</div>
        {completado.length === 0 && tasks.length > 0 ? (
          <div className="v2-tasks-empty">Sin tareas completadas</div>
        ) : completado.length === 0 ? (
          DEMO_COMPLETADO.map((row, i) => (
            <div key={i} className="v2-task-row done">
              <span className="v2-task-status done">✓</span>
              <span className="v2-task-row-title done">{row.t}</span>
              <span className="v2-task-row-date">{row.meta}</span>
            </div>
          ))
        ) : (
          completado.map((t) => (
            <div key={t.id} className="v2-task-row done" onClick={() => onOpenTask(t)}>
              <span className="v2-task-status done">✓</span>
              <span className="v2-task-row-title done">{t.title}</span>
              <span className="v2-task-row-date">{t.updatedAt.slice(11, 16)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

## File: apps/web/src/components/ChatPanel.tsx
```typescript
// CHATPANEL_RESOLVEVIEW_V1 - el panel contextual se rellena cuando el usuario
// pide una vista. Antes solo se rellenaba si el backend emitia view.resolved
// al bus, que no ocurre en la practica. Ahora disparamos resolveView cuando
// el usuario envia un mensaje y pasamos el spec al viewResolver.
import { useEffect, useState } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import SuggestionChips from "./SuggestionChips";
import RoleSelector from "./RoleSelector";
import type { ChatMessage } from "../types/api";
import type { ToolCall } from "../lib/toolsReducer";

interface ChatState {
  roleId?: string;
  setRoleId?: (id: string | undefined) => void;
  messages: ChatMessage[];
  streaming: boolean;
  streamBuf: string;
  tools: ToolCall[];
  error: string | null;
  send: (text: string) => void;
  cancel: () => void;
  threadId: string | null;
}

interface Props {
  chat: ChatState;
  onResolveView?: (intent: string) => void;
}

const CHIPS = [
  { id: "resumen", label: "Resumen de mi negocio", prompt: "Dame un resumen de mi negocio." },
  { id: "email", label: "Redactar un email", prompt: "Redacta un email profesional." },
  { id: "doc", label: "Analizar un documento", prompt: "Analiza el ultimo documento que he subido." },
];

export default function ChatPanel({ chat, onResolveView }: Props) {
  const [seed, setSeed] = useState("");
  const isEmpty = chat.messages.length === 0 && !chat.streaming;

  // CHATPANEL_RESOLVEVIEW_V1 - cada vez que el usuario manda un mensaje
  // nuevo, intentamos resolverlo como intencion de vista.
  useEffect(() => {
    if (!onResolveView) return;
    const lastUser = [...chat.messages].reverse().find((m) => m.role === "user");
    if (!lastUser?.content) return;
    onResolveView(lastUser.content);
  }, [chat.messages, onResolveView]);

  if (isEmpty) {
    return (
      <div className="v2-home">
        <div className="v2-greeting">✦ Buenas tardes, Alfonso</div>
        <h1 className="v2-hero-title">¿En qué te ayudo hoy?</h1>
        <ChatInput
          onSend={chat.send}
          onCancel={chat.cancel}
          streaming={chat.streaming}
          seed={seed}
          onSeedConsumed={() => setSeed("")}
        />
        <SuggestionChips chips={CHIPS} onSelect={(p) => setSeed(p)} />
      </div>
    );
  }

  return (
    <div className="v2-conv">
      <RoleSelector value={chat.roleId} onChange={chat.setRoleId} />
      <MessageList
        messages={chat.messages}
        streaming={chat.streaming}
        streamBuf={chat.streamBuf}
        tools={chat.tools}
      />
      <div className="v2-conv-input">
        <ChatInput
          onSend={chat.send}
          onCancel={chat.cancel}
          streaming={chat.streaming}
          seed=""
          onSeedConsumed={() => {}}
        />
      </div>
    </div>
  );
}
```

## File: apps/web/src/App.tsx
```typescript
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
          {view === "agents" && <AgentsPage />}
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
```
