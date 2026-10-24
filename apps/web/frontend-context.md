This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
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
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
````
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
  workspaces.ts
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
  layout/
    AppRail.tsx
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
  useWorkspaces.ts
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
workspaces/
  01-gmail/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  02-whatsapp/
    components/
      .gitkeep
      Avatar.tsx
      ChatWorkspace.tsx
      Composer.tsx
      ContextPanel.tsx
      MessageBubble.tsx
      MessageList.tsx
      ThreadFilters.tsx
      ThreadHeader.tsx
      ThreadList.tsx
      ThreadListItem.tsx
      ThreadSearch.tsx
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
      04-handoff-v2.md
    hooks/
      .gitkeep
      useChatWorkspace.ts
    api.ts
    ChatWorkspace.css
    format.ts
    index.ts
    README.md
    types.ts
  03-hubspot/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  04-holded/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  05-google-drive/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  06-google-calendar/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  07-linear/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  08-chatgpt/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  09-airtable/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  10-perdoo/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  11-holded-tesoreria/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  12-odoo-purchase/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  13-productive/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  14-zendesk/
    components/
      .gitkeep
      AgentStatusPill.tsx
      Avatar.tsx
      CoWriteEditor.tsx
      CoWritePanel.tsx
      CoWriteToggle.tsx
      CustomerHeader.tsx
      CustomerQuickActions.tsx
      EmptyState.tsx
      IconButton.tsx
      InsightChips.tsx
      InsightIntent.tsx
      InsightUrgencyNextStep.tsx
      LeadBadge.tsx
      NewTicketButton.tsx
      SidebarNavItem.tsx
      SidebarSearch.tsx
      SidebarSection.tsx
      TicketAvatar.tsx
      TicketChips.tsx
      TicketDetailPanel.tsx
      TicketFilterPill.tsx
      TicketInsightCard.tsx
      TicketList.tsx
      TicketListActions.tsx
      TicketListHeader.tsx
      TicketListItem.tsx
      TicketListPanel.tsx
      WorkspaceBrand.tsx
      ZendeskSidebar.tsx
      ZendeskWorkspace.tsx
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
      04-handoff-v2.md
    hooks/
      .gitkeep
      useZendesk.ts
    api.ts
    format.ts
    index.ts
    README.md
    types.ts
    ZendeskWorkspace.css
  15-docusign/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  16-n8n/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  17-process-street/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  18-factorial/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  19-personio/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  20-ramp/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  21-stripe/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  22-canva/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  23-buffer/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  24-shopify/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  25-intercom/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  26-odoo-inventory/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  27-maintainx/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  28-odoo-manufacturing/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  29-isms-online/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  30-microsoft-entra/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  31-suitedash/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  32-notion/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  33-langsmith/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  34-trello/
    components/
      .gitkeep
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      .gitkeep
    index.ts
    README.md
  35-centro-mando/
    components/
      ActiveProjectsPanel.tsx
      AgentPerformanceCard.tsx
      AgentsPerformancePanel.tsx
      AiActionButton.tsx
      AiInsightsPanel.tsx
      Avatar.tsx
      BlockedInvoiceList.tsx
      CentroMandoSidebar.tsx
      ChartAnnotation.tsx
      ClientDetailModal.tsx
      CriticalTicketsPanel.tsx
      DateRangePicker.tsx
      InsightCard.tsx
      KpiCard.tsx
      KpiGrid.tsx
      MiniBarList.tsx
      PipelineFunnel.tsx
      ProgressBar.tsx
      ProjectProgressRow.tsx
      RetentionChart.tsx
      RetentionStats.tsx
      SectionHeader.tsx
      Sparkline.tsx
      StatusBadge.tsx
      TicketCard.tsx
      Toast.tsx
      TopClientRow.tsx
      TopClientsPanel.tsx
      TopClientsTable.tsx
      UrgencyBadge.tsx
      WorkspaceHeader.tsx
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    hooks/
      useCentroMandoData.ts
      useClientSelection.ts
      useDateRange.ts
      useMobileMenu.ts
      useToast.ts
    centro-mando.css
    CentroMandoWorkspace.tsx
    index.ts
    README.md
    types.ts
  36-centro-mando/
    docs/
      01-ui-map.md
      02-roadmap.md
      03-spec.md
    centro-mando.css
    CentroMando.tsx
    data.ts
    index.ts
    README.md
    types.ts
  centro-mando-context.md
  index.ts
  registry.ts
  WorkspaceShell.tsx
01-34-workspaces-pipeline.md
02-HANDOFF-IA-WORKSPACES.md
03-CONTINUACION-PIPELINE-WORKSPACES.md.md
34-workspaces-pipeline.md.bak-V1
App.tsx
index.css
main.tsx
````

# Files

## File: api/actions.ts
````typescript
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
````

## File: api/agents.ts
````typescript
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
````

## File: api/auth.ts
````typescript
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
````

## File: api/business.ts
````typescript
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
````

## File: api/chat.ts
````typescript
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
````

## File: api/client.ts
````typescript
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
````

## File: api/conversation.ts
````typescript
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
````

## File: api/events.ts
````typescript
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
````

## File: api/files.ts
````typescript
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
````

## File: api/google.ts
````typescript
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
````

## File: api/index.ts
````typescript
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
````

## File: api/projects.ts
````typescript
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
````

## File: api/rag.ts
````typescript
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
````

## File: api/search.ts
````typescript
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
````

## File: api/session.ts
````typescript
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
````

## File: api/tasks.ts
````typescript
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
````

## File: api/threads.ts
````typescript
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
````

## File: api/workspaces.ts
````typescript
// WS_API_V1 - cliente HTTP del catalogo de workspaces.
import { apiFetch } from "./client.ts";

export interface WorkspaceListEntry {
  id: string;
  slug: string;
  family: string;
  title: string;
  reference: string;
}

export async function listWorkspaces(): Promise<WorkspaceListEntry[]> {
  return apiFetch<WorkspaceListEntry[]>("/api/workspaces");
}

export async function getWorkspace(id: string): Promise<WorkspaceListEntry | null> {
  return apiFetch<WorkspaceListEntry | null>("/api/workspaces/" + encodeURIComponent(id));
}
````

## File: components/agents/floating/AgentDockLauncher.tsx
````typescript
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
````

## File: components/agents/floating/LaiaFloatingWindow.tsx
````typescript
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
````

## File: components/agents/AgentActivityLog.tsx
````typescript
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
````

## File: components/agents/AgentCard.tsx
````typescript
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
````

## File: components/agents/AgentCommandBar.tsx
````typescript
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
````

## File: components/agents/AgentHero.tsx
````typescript
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
````

## File: components/agents/AgentProfile.tsx
````typescript
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
````

## File: components/agents/agents.css
````css
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
````

## File: components/agents/AgentsPage.tsx
````typescript
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
````

## File: components/agents/AgentSquad.tsx
````typescript
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
````

## File: components/agents/types.ts
````typescript
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
````

## File: components/layout/AppRail.tsx
````typescript
// APP_RAIL_V1
import { Bookmark, CalendarDays, FileText, Inbox, Layers, MessageSquare, Users, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Item = { icon: LucideIcon; label: string; active?: boolean; badge?: string }

const items: Item[] = [
  { icon: MessageSquare, label: "Chats", active: true },
  { icon: Inbox, label: "Bandeja", badge: "9+" },
  { icon: Users, label: "Personas" },
  { icon: CalendarDays, label: "Agenda" },
  { icon: FileText, label: "Documentos" },
  { icon: Bookmark, label: "Guardados" },
  { icon: Layers, label: "Espacios" },
]

export function AppRail({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Navegacion principal" className={`flex-col items-center gap-2 border-r border-border py-4 ${className}`}>
      <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-text text-sm font-bold text-white">A</div>

      {items.map(({ icon: Icon, label, active, badge }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          aria-current={active ? "page" : undefined}
          className={`relative grid h-11 w-11 place-items-center rounded-xl transition-colors ${
            active ? "bg-text text-white" : "text-text-2 hover:bg-bg-soft hover:text-ink"
          }`}
        >
          <Icon className="h-5 w-5" />
          {badge && (
            <span className="absolute -right-1 -top-1 rounded-full bg-purple px-1.5 text-[10px] font-semibold leading-4 text-white">
              {badge}
            </span>
          )}
        </button>
      ))}

      <div className="mt-auto flex flex-col items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-purplesoft text-purple">
          <Zap className="h-4 w-4" />
        </span>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-text text-xs font-semibold text-white">JD</span>
      </div>
    </nav>
  )
}
````

## File: components/AgentsView.tsx
````typescript
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
````

## File: components/AnimatedNumber.tsx
````typescript
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
````

## File: components/ApprovalInbox.tsx
````typescript
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
````

## File: components/ApprovalItem.tsx
````typescript
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
````

## File: components/ApprovalModal.tsx
````typescript
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
````

## File: components/AppShell.tsx
````typescript
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
````

## File: components/AttachmentPreview.tsx
````typescript
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
````

## File: components/BusinessSchemaEditor.tsx
````typescript
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
````

## File: components/ChatInput.tsx
````typescript
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
````

## File: components/ChatPanel.tsx
````typescript
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
````

## File: components/CommandPalette.tsx
````typescript
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
````

## File: components/ContextChips.tsx
````typescript
// CONTEXT_CHIPS_V1 - auto.alta/media/sugerido/tu
 export type ChipKind = "auto" | "alta" | "media" | "sugerido" | "tu";
 export interface ContextChip { id: string; label: string; kind: ChipKind; score?: number; }
 export default function ContextChips({ chips }: { chips: ContextChip[] }) {
   if (!chips?.length) return null;
   return <div className="flex flex-wrap gap-2">{chips.map(c=><span key={c.id} className={`px-2 py-1 rounded-full text-xs border ${c.kind==="alta"?"bg-green-50 border-green-200":c.kind==="tu"?"bg-blue-50 border-blue-200":"bg-zinc-50 border-zinc-200"}`}>{c.label}</span>)}</div>;
 }
````

## File: components/ContextualPanel.tsx
````typescript
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
````

## File: components/ControlCenterView.tsx
````typescript
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
````

## File: components/DocumentsView.tsx
````typescript
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
````

## File: components/DocumentTree.tsx
````typescript
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
````

## File: components/EmployeeProfileView.tsx
````typescript
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
````

## File: components/KpiCard.tsx
````typescript
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
````

## File: components/LiveItem.tsx
````typescript
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
````

## File: components/Login.tsx
````typescript
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
````

## File: components/MemoryBoard.tsx
````typescript
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
````

## File: components/MemoryView.tsx
````typescript
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
````

## File: components/MessageBubble.tsx
````typescript
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
````

## File: components/MessageList.tsx
````typescript
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
````

## File: components/MultiUpload.tsx
````typescript
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
````

## File: components/NewTaskModal.tsx
````typescript
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
````

## File: components/NotificationsDropdown.tsx
````typescript
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
````

## File: components/Onboarding.tsx
````typescript
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
````

## File: components/PermissionMatrix.tsx
````typescript
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
````

## File: components/ProfileModal.tsx
````typescript
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
````

## File: components/ProjectsView.tsx
````typescript
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
````

## File: components/ProvenanceBadge.tsx
````typescript
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
````

## File: components/RoleSelector.tsx
````typescript
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
````

## File: components/SidebarV2.tsx
````typescript
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
````

## File: components/Sparkline.tsx
````typescript
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
````

## File: components/SuggestionChips.tsx
````typescript
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
````

## File: components/TaskDetailModal.tsx
````typescript
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
````

## File: components/TasksView.tsx
````typescript
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
````

## File: components/TaskTimeline.tsx
````typescript
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
````

## File: components/ToolCallCard.tsx
````typescript
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
````

## File: components/ToolCallsGroup.tsx
````typescript
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
````

## File: components/TopBarV2.tsx
````typescript
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
````

## File: components/UserModal.tsx
````typescript
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
````

## File: components/UsersView.tsx
````typescript
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
````

## File: forms/FormPreview.tsx
````typescript
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
````

## File: forms/FormRenderer.tsx
````typescript
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
````

## File: forms/provenance.tsx
````typescript
import type { ProvenanceKind } from "./spec.ts";
 export function provenanceColor(k: ProvenanceKind) {
   if (k==="alta") return "text-green-700";
   if (k==="tu") return "text-blue-700";
   return "text-zinc-500";
 }
 export function ProvenanceBadge({ kind }: { kind: ProvenanceKind }) {
   return <span className={`text- uppercase tracking-wide ${provenanceColor(kind)}`}>{kind}</span>;
 }
````

## File: forms/spec.ts
````typescript
export interface FormField { key: string; label: string; type: "text"|"number"|"date"|"select"|"textarea"; required?: boolean; options?: string[]; }
 export interface FormSpec { id: string; title: string; fields: FormField[]; provenance: string; }
 export type ProvenanceKind = "auto" | "alta" | "media" | "sugerido" | "tu";
````

## File: hooks/useAgents.ts
````typescript
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
````

## File: hooks/useAuth.ts
````typescript
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
````

## File: hooks/useCascade.ts
````typescript
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
````

## File: hooks/useChat.ts
````typescript
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
````

## File: hooks/useEvents.ts
````typescript
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
````

## File: hooks/useHotkeys.ts
````typescript
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
````

## File: hooks/useLiveActivity.ts
````typescript
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
````

## File: hooks/useNotifications.ts
````typescript
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
````

## File: hooks/useNow.ts
````typescript
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
````

## File: hooks/usePanel.ts
````typescript
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
````

## File: hooks/useProjects.ts
````typescript
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
````

## File: hooks/useReducedMotion.ts
````typescript
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
````

## File: hooks/useTasks.ts
````typescript
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
````

## File: hooks/useThreads.ts
````typescript
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
````

## File: hooks/useTypewriter.ts
````typescript
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
````

## File: hooks/useViewResolver.ts
````typescript
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
````

## File: hooks/useWorkspaceData.ts
````typescript
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
````

## File: hooks/useWorkspaces.ts
````typescript
// WS_HOOK_V1 - listado de workspaces disponible.
import { useEffect, useState } from "react";
import { listWorkspaces, type WorkspaceListEntry } from "../api/workspaces.ts";

export function useWorkspaces(enabled: boolean) {
  const [workspaces, setWorkspaces] = useState<WorkspaceListEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    listWorkspaces()
      .then((list) => { if (!cancelled) { setWorkspaces(list); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [enabled]);

  return { workspaces, loading, error };
}
````

## File: intent/IntentResolver.ts
````typescript
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
````

## File: intent/schema.ts
````typescript
import { z } from "zod";
 export const intentSchema = z.object({ raw: z.string().min(1), kind: z.enum(["query","action","form","navigation"]).default("query"), confidence: z.number().min(0).max(1).default(0.7) });
 export type Intent = z.infer<typeof intentSchema>;
````

## File: lib/applyEvent.ts
````typescript
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
````

## File: lib/format.ts
````typescript
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
````

## File: lib/groupMemories.ts
````typescript
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
````

## File: lib/taskColumns.ts
````typescript
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
````

## File: lib/toolsReducer.ts
````typescript
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
````

## File: templates/dashboard/DashboardTemplate.tsx
````typescript
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
````

## File: templates/detail/DetailTemplate.tsx
````typescript
// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function DetailTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="rounded-xl border p-4"><h2 className="font-semibold">{spec.title}</h2><dl className="mt-3 grid grid-cols-2 gap-2 text-sm">{(spec.columns ?? []).map(c=><div key={c.key}><dt className="text-zinc-500">{c.label}</dt><dd className="font-medium">—</dd></div>)}</dl></div>;
}
````

## File: templates/form/FormTemplate.tsx
````typescript
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
````

## File: templates/graph/GraphTemplate.tsx
````typescript
// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function GraphTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="rounded-xl border p-4"><h2 className="font-semibold">{spec.title} — graph</h2><div className="mt-3 h-40 bg-zinc-100 rounded flex items-center justify-center text-xs">graph entities: {spec.dataSource?.[0]?.query}</div></div>;
}
````

## File: templates/kanban/KanbanTemplate.tsx
````typescript
// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function KanbanTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="grid grid-cols-3 gap-3"><div className="col-span-3 font-semibold p-2">{spec.title} — kanban</div>{["Todo","Doing","Done"].map(s=><div key={s} className="rounded-xl border p-3 bg-zinc-50"><div className="text-xs font-semibold">{s}</div><div className="mt-2 text-xs text-zinc-500">{spec.dataSource?.[0]?.query}</div></div>)}</div>;
}
````

## File: templates/list/ListTemplate.tsx
````typescript
// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function ListTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="space-y-2"><h2 className="text-lg font-semibold">{spec.title}</h2><ul className="divide-y rounded-xl border">{(spec.dataSource ?? []).map((d,i)=><li key={i} className="p-3 text-sm">{d.query}</li>)}</ul></div>;
}
````

## File: templates/queue/QueueTemplate.tsx
````typescript
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
````

## File: templates/table/TableTemplate.tsx
````typescript
// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function TableTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="overflow-auto rounded-xl border"><div className="p-3 font-semibold">{spec.title} — tabla</div><table className="w-full text-sm"><thead><tr>{(spec.columns ?? []).map(c=><th key={c.key} className="text-left p-2 bg-zinc-50">{c.label}</th>)}</tr></thead><tbody><tr><td className="p-2 text-zinc-500" colSpan={(spec.columns ?? []).length}>conecta BusinessGraph para datos reales</td></tr></tbody></table></div>;
}
````

## File: templates/timeline/TimelineTemplate.tsx
````typescript
// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function TimelineTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="space-y-3"><h2 className="font-semibold">{spec.title} — timeline</h2><div className="border-l-2 pl-4 space-y-3">{(spec.dataSource ?? []).map((d,i)=><div key={i} className="text-sm"><div className="font-medium">{d.query}</div><div className="text-xs text-zinc-500">{d.tenantId}</div></div>)}</div></div>;
}
````

## File: templates/registry.ts
````typescript
// TEMPLATES_REGISTRY_V1
import type { ViewSpec } from "../view/spec.ts";
import ListTemplate from "./list/ListTemplate.tsx";
import TableTemplate from "./table/TableTemplate.tsx";
import KanbanTemplate from "./kanban/KanbanTemplate.tsx";
import TimelineTemplate from "./timeline/TimelineTemplate.tsx";
import GraphTemplate from "./graph/GraphTemplate.tsx";
import DetailTemplate from "./detail/DetailTemplate.tsx";
import FormTemplate from "./form/FormTemplate.tsx";
import DashboardTemplate from "./dashboard/DashboardTemplate.tsx";

const MAP: Record<string, unknown> = {
  list: ListTemplate,
  table: TableTemplate,
  kanban: KanbanTemplate,
  timeline: TimelineTemplate,
  graph: GraphTemplate,
  detail: DetailTemplate,
  form: FormTemplate,
  dashboard: DashboardTemplate,
};

const EXTRA: Record<string, unknown> = {
  inbox: ListTemplate,
  queue: ListTemplate,
  chart: DashboardTemplate,
  compare: TableTemplate,
  calendar: TimelineTemplate,
  document: DetailTemplate,
};

for (const k of Object.keys(EXTRA)) {
  if (!(k in MAP)) MAP[k] = EXTRA[k];
}

export function findTemplate(spec: ViewSpec): unknown {
  const key = spec.layout ?? spec.kind;
  return MAP[key] ?? ListTemplate;
}

export function listTemplates(): string[] {
  return Object.keys(MAP);
}
````

## File: types/api.ts
````typescript
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
````

## File: view/fallback.tsx
````typescript
// FALLBACK_V1 - que pintar si nada encaja
export function FallbackView({spec}:{spec:any}){return <div data-fallback>{spec?.title||"No template"} - fallback</div>}
````

## File: view/resolver.ts
````typescript
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
````

## File: view/spec.ts
````typescript
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
````

## File: view/ViewRenderer.tsx
````typescript
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
````

## File: workspaces/01-gmail/components/.gitkeep
````

````

## File: workspaces/01-gmail/docs/01-ui-map.md
````markdown
# UI Map — Correo electronico

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/01-gmail/docs/02-roadmap.md
````markdown
# Roadmap — Correo electronico

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/01-gmail/docs/03-spec.md
````markdown
# Spec de UI — Correo electronico

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/01-gmail/hooks/.gitkeep
````

````

## File: workspaces/01-gmail/index.ts
````typescript
// 01-gmail — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Gmail
export const gmailWorkspaceUi = {
  id: "gmail",
  slug: "01-gmail",
  family: "comunicacion",
  status: "scaffold",
};
````

## File: workspaces/01-gmail/README.md
````markdown
# 01-gmail — Correo electronico (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/02-whatsapp/components/.gitkeep
````

````

## File: workspaces/02-whatsapp/components/Avatar.tsx
````typescript
// CHAT_AVATAR_V1

type Props = {
  initial: string
  color: string
  size?: number
  square?: boolean
  online?: boolean
}

export function Avatar({ initial, color, size = 44, square = false, online = false }: Props) {
  return (
    <span
      className="relative inline-grid shrink-0 place-items-center font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: color,
        borderRadius: square ? size * 0.28 : 9999,
        fontSize: size * 0.36,
      }}
    >
      {initial}
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg-card bg-green" />
      )}
    </span>
  )
}
````

## File: workspaces/02-whatsapp/components/ChatWorkspace.tsx
````typescript
// CHAT_WORKSPACE_V1
import "./ChatWorkspace.css"
import { useMemo, useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { useChatWorkspace } from "../hooks/useChatWorkspace.ts"
import { Composer } from "./Composer.tsx"
import { ContextPanel } from "./ContextPanel.tsx"
import { MessageList } from "./MessageList.tsx"
import { ThreadFilters, filterThreads } from "./ThreadFilters.tsx"
import { ThreadHeader } from "./ThreadHeader.tsx"
import { ThreadList } from "./ThreadList.tsx"
import { ThreadSearch } from "./ThreadSearch.tsx"
import type { ChatFilter } from "../types.ts"

export function ChatWorkspace() {
  const {
    threads,
    activeThread,
    activeThreadId,
    messages,
    context,
    contextPanelOpen,
    contextTab,
    coauthorMode,
    isStreaming,
    selectThread,
    toggleContextPanel,
    setContextTab,
    setCoauthorMode,
    send,
  } = useChatWorkspace()

  const [filter, setFilter] = useState<ChatFilter>("all")
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"list" | "thread">("list")

  const visible = useMemo(() => filterThreads(threads, filter, query), [threads, filter, query])

  const onSelect = (id: string) => {
    selectThread(id)
    setView("thread")
  }

  return (
    <div className="chat-workspace flex h-full overflow-hidden bg-bg-card text-text">
      <aside
        className={`${view === "thread" ? "hidden" : "flex w-full"} min-h-0 shrink-0 flex-col border-r border-border md:flex md:w-[340px]`}
      >
        <div className="flex shrink-0 flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">AGNTia OS</h1>
              <span className="rounded-md bg-purple-soft px-2 py-0.5 text-xs font-medium text-purple">Simple</span>
            </div>
            <button type="button" aria-label="Mas opciones" className="text-text-2 hover:text-text">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <ThreadSearch value={query} onChange={setQuery} />
          <ThreadFilters value={filter} onChange={setFilter} />
        </div>
        <ThreadList
          className="min-h-0 flex-1 overflow-y-auto"
          threads={visible}
          activeId={activeThreadId ?? ""}
          onSelect={onSelect}
        />
      </aside>

      <main className={`${view === "list" ? "hidden" : "flex"} min-h-0 min-w-0 flex-1 flex-col md:flex`}>
        {activeThread ? (
          <>
            <ThreadHeader
              thread={activeThread}
              contextOpen={contextPanelOpen}
              onToggleContext={toggleContextPanel}
              onBack={() => setView("list")}
              className="shrink-0"
            />
            <MessageList
              messages={messages}
              showAuthors={activeThread.kind === "group"}
              className="min-h-0 flex-1 overflow-y-auto"
            />
            <Composer
              key={activeThread.id}
              name={activeThread.name}
              coauthorMode={coauthorMode}
              onCoauthorChange={setCoauthorMode}
              streaming={isStreaming}
              onSend={(text) => void send(text)}
              className="shrink-0"
            />
          </>
        ) : (
          <p className="m-auto text-sm text-text-2">Cargando conversaciones...</p>
        )}
      </main>

      <aside
        aria-label="Detalle del chat"
        className={`${contextPanelOpen ? "flex" : "hidden"} fixed inset-y-0 right-0 z-20 w-80 max-w-full shrink-0 flex-col border-l border-border bg-bg-card min-[1120px]:static min-[1120px]:z-auto`}
      >
        {activeThread && (
          <ContextPanel
            thread={activeThread}
            context={context}
            tab={contextTab}
            onTabChange={setContextTab}
            onClose={toggleContextPanel}
          />
        )}
      </aside>
    </div>
  )
}
````

## File: workspaces/02-whatsapp/components/Composer.tsx
````typescript
// CHAT_COMPOSER_V1
import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { Paperclip, Send, Sparkles } from "lucide-react"

type Props = {
  name: string
  coauthorMode: boolean
  onCoauthorChange: (on: boolean) => void
  streaming: boolean
  onSend: (text: string) => void
  className?: string
}

export function Composer({ name, coauthorMode, onCoauthorChange, streaming, onSend, className = "" }: Props) {
  const [text, setText] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)
  const canSend = text.trim().length > 0 && !streaming

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }, [text])

  const submit = () => {
    const value = text.trim()
    if (!value || streaming) return
    onSend(value)
    setText("")
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className={`border-t border-border p-4 ${className}`}>
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-bg-card p-2 focus-within:border-purple">
        <button
          type="button"
          aria-label="Adjuntar archivo"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-text-2 transition-colors hover:text-text"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <textarea
          id="composer-input"
          ref={ref}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={streaming ? "AGNTia esta respondiendo..." : `Mensaje a ${name}...`}
          className="max-h-32 min-h-9 min-w-0 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-text-2"
        />
        <button
          type="button"
          aria-label="Enviar mensaje"
          disabled={!canSend}
          onClick={submit}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple text-white transition-opacity disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 px-1 text-xs text-text-2">
        <button
          type="button"
          role="switch"
          aria-checked={coauthorMode}
          onClick={() => onCoauthorChange(!coauthorMode)}
          className={`flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-medium transition-colors ${
            coauthorMode ? "border-purple bg-purplesoft text-accent" : "border-border hover:text-text"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Coautor AGNTia
        </button>
        <span className="hidden items-center gap-3 sm:flex">
          <span>Enter para enviar - Shift+Enter salto</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            Encriptado
          </span>
        </span>
      </div>
    </div>
  )
}
````

## File: workspaces/02-whatsapp/components/ContextPanel.tsx
````typescript
// CHAT_CONTEXT_PANEL_V1
import { Clock, FileText, Hash, Mail, MapPin, MoreHorizontal, Phone, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Avatar } from "./Avatar.tsx"
import { formatRelative } from "../format.ts"
import type { ChatContextSnapshot, ChatContextTab, ChatThread } from "../types.ts"

const sectionTitle = "text-xs font-semibold uppercase tracking-widest text-text-2"

const tabs: { id: ChatContextTab; label: string }[] = [
  { id: "info", label: "Info" },
  { id: "files", label: "Archivos" },
  { id: "notes", label: "Notas" },
  { id: "activity", label: "Actividad" },
]

type Props = {
  thread: ChatThread
  context: ChatContextSnapshot | null
  tab: ChatContextTab
  onTabChange: (tab: ChatContextTab) => void
  onClose: () => void
}

export function ContextPanel({ thread, context, tab, onTabChange, onClose }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between px-6 pb-2 pt-6">
        <h3 className={sectionTitle}>Detalle</h3>
        <button type="button" onClick={onClose} aria-label="Cerrar panel" className="text-text-2 hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6 pt-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <Avatar initial={thread.initial} color={thread.color} size={90} square />
          <h4 className="mt-3 text-xl font-bold">{thread.name}</h4>
          <p className="text-sm text-text-2">{thread.subtitle}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-full bg-text px-4 text-sm font-medium text-white"
            >
              <Phone className="h-3.5 w-3.5" />
              Llamar
            </button>
            <button
              type="button"
              className="h-9 rounded-full border border-border bg-bg-soft px-4 text-sm font-medium transition-colors hover:border-purple"
            >
              Email
            </button>
          </div>
        </div>

        <div role="tablist" aria-label="Detalle del chat" className="flex gap-1 rounded-xl bg-bg-soft p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`ctx-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls="ctx-panel"
              onClick={() => onTabChange(t.id)}
              className={`min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                tab === t.id ? "bg-bg-card text-ink shadow-sm" : "text-text-2 hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div id="ctx-panel" role="tabpanel" aria-labelledby={`ctx-tab-${tab}`}>
          {!context ? (
            <p className="text-sm text-text-2">Cargando...</p>
          ) : tab === "info" ? (
            <InfoTab thread={thread} context={context} />
          ) : tab === "files" ? (
            <FilesTab context={context} />
          ) : tab === "notes" ? (
            <NotesTab context={context} />
          ) : (
            <ActivityTab context={context} />
          )}
        </div>
      </div>
    </div>
  )
}

type Row = { icon: LucideIcon; label: string; value: string }

function InfoTab({ thread, context }: { thread: ChatThread; context: ChatContextSnapshot }) {
  const rows: Row[] = [
    { icon: Mail, label: "Email", value: context.email },
    { icon: MapPin, label: "Ubicacion", value: context.location },
    { icon: Clock, label: "Horario", value: context.hours },
    { icon: Hash, label: "ID", value: `#${thread.id} - ${thread.tag}` },
  ]
  return (
    <dl className="flex flex-col gap-3">
      {rows.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-bg-soft text-text-2">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <dt className="text-xs uppercase text-text-2">{label}</dt>
            <dd className="truncate text-sm font-medium">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

function FilesTab({ context }: { context: ChatContextSnapshot }) {
  if (context.files.length === 0) return <p className="text-sm text-text-2">Sin archivos compartidos.</p>
  return (
    <ul className="flex flex-col gap-2">
      {context.files.map((f) => (
        <li key={f.id} className="flex items-center gap-3 rounded-2xl border border-border p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-purplesoft text-purple">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{f.name}</p>
            <p className="text-xs text-text-2">
              {f.size} - {formatRelative(f.addedAt)}
            </p>
          </div>
          <button type="button" aria-label={`Opciones de ${f.name}`} className="text-text-2 hover:text-ink">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}

function NotesTab({ context }: { context: ChatContextSnapshot }) {
  if (context.notes.length === 0) return <p className="text-sm text-text-2">Sin notas.</p>
  return (
    <ul className="flex flex-col gap-2">
      {context.notes.map((n) => (
        <li key={n.id} className="rounded-2xl border border-border p-3">
          <p className="text-sm">{n.text}</p>
          <p className="mt-1 text-xs text-text-2">{n.author}</p>
        </li>
      ))}
    </ul>
  )
}

function ActivityTab({ context }: { context: ChatContextSnapshot }) {
  if (context.activity.length === 0) return <p className="text-sm text-text-2">Sin actividad reciente.</p>
  return (
    <ul className="flex flex-col gap-4">
      {context.activity.map((a) => (
        <li key={a.id} className="flex gap-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-purple" />
          <div className="min-w-0">
            <p className="text-sm">{a.text}</p>
            <p className="text-xs text-text-2">{formatRelative(a.at)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
````

## File: workspaces/02-whatsapp/components/MessageBubble.tsx
````typescript
// CHAT_MESSAGE_BUBBLE_V1
import { Sparkles } from "lucide-react"
import { formatClock } from "../format.ts"
import type { ChatMessage } from "../types.ts"

type Props = { message: ChatMessage; showAuthor: boolean }

export function MessageBubble({ message, showAuthor }: Props) {
  if (message.role === "system") {
    return (
      <p className="mx-auto shrink-0 rounded-full bg-bg-soft px-3 py-1 text-center text-xs text-text-2">
        {message.text} - <span className="tabular-nums">{formatClock(message.createdAt)}</span>
      </p>
    )
  }

  const mine = message.role === "owner"
  const agent = message.role === "agent"

  const tone = mine
    ? "rounded-br-md bg-purple text-white"
    : agent
      ? "rounded-bl-md border border-border bg-purplesoft"
      : "rounded-bl-md border border-border bg-bg-card"

  return (
    <div className={`flex shrink-0 flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
      {!mine && (showAuthor || agent) && (
        <span className="flex items-center gap-1.5 px-1 text-xs font-medium text-text-2">
          {agent && <Sparkles className="h-3 w-3 text-accent" aria-hidden="true" />}
          {message.authorName}
          {agent && <span className="rounded bg-purplesoft px-1 text-[10px] text-accent">agente</span>}
        </span>
      )}
      <p
        className={`max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${tone}`}
      >
        {message.text}
        {message.streaming && (
          <span
            className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-purple motion-safe:animate-pulse"
            aria-hidden="true"
          />
        )}
      </p>
      <span className="px-1 text-xs tabular-nums text-text-2">
        {message.streaming ? "escribiendo..." : formatClock(message.createdAt)}
      </span>
    </div>
  )
}
````

## File: workspaces/02-whatsapp/components/MessageList.tsx
````typescript
// CHAT_MESSAGE_LIST_V1
import { Fragment, useEffect, useRef } from "react"
import { dayKey, formatDayLabel } from "../format.ts"
import { MessageBubble } from "./MessageBubble.tsx"
import type { ChatMessage } from "../types.ts"

type Props = { messages: ChatMessage[]; showAuthors: boolean; className?: string }

export function MessageList({ messages, showAuthors, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const prevCount = useRef(0)
  const lastText = messages[messages.length - 1]?.text

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const countChanged = prevCount.current !== messages.length
    prevCount.current = messages.length
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160
    if (countChanged || nearBottom) el.scrollTop = el.scrollHeight
  }, [messages.length, lastText])

  return (
    <div ref={ref} className={`flex flex-col gap-3 px-5 py-4 ${className}`}>
      {messages.length === 0 && <p className="m-auto text-sm text-text-2">Sin mensajes todavia.</p>}
      {messages.map((m, i) => {
        const newDay = i === 0 || dayKey(m.createdAt) !== dayKey(messages[i - 1].createdAt)
        return (
          <Fragment key={m.id}>
            {newDay && (
              <div className="mx-auto shrink-0 rounded-full border border-border px-3 py-1 text-xs text-text-2">
                {formatDayLabel(m.createdAt)}
              </div>
            )}
            <MessageBubble message={m} showAuthor={showAuthors} />
          </Fragment>
        )
      })}
    </div>
  )
}
````

## File: workspaces/02-whatsapp/components/ThreadFilters.tsx
````typescript
// CHAT_THREAD_FILTERS_V1
import type { ChatFilter, ChatThread } from "../types.ts"

const options: { value: ChatFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "unread", label: "Sin leer" },
  { value: "groups", label: "Grupos" },
  { value: "archived", label: "Archivados" },
]

export function filterThreads(threads: ChatThread[], filter: ChatFilter, query: string): ChatThread[] {
  const q = query.trim().toLowerCase()
  return threads.filter((t) => {
    const byFilter =
      filter === "archived"
        ? t.archived
        : !t.archived &&
          (filter === "all" ||
            (filter === "unread" && t.unread > 0) ||
            (filter === "groups" && t.kind === "group"))
    const byQuery = !q || [t.name, t.preview, t.tag].some((v) => v.toLowerCase().includes(q))
    return byFilter && byQuery
  })
}

type Props = { value: ChatFilter; onChange: (value: ChatFilter) => void }

export function ThreadFilters({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filtrar chats">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`h-8 shrink-0 rounded-full border px-3.5 text-xs font-medium transition-colors ${
            value === o.value
              ? "border-text bg-text text-white"
              : "border-border bg-bg-soft text-text-2 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
````

## File: workspaces/02-whatsapp/components/ThreadHeader.tsx
````typescript
// CHAT_THREAD_HEADER_V1
import { ChevronLeft, MoreHorizontal, PanelRight, Phone, Star, Video } from "lucide-react"
import { Avatar } from "./Avatar.tsx"
import type { ChatThread } from "../types.ts"

const iconBtn =
  "grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-text-2 transition-colors hover:bg-bg-soft hover:text-text"

type Props = {
  thread: ChatThread
  contextOpen: boolean
  onToggleContext: () => void
  onBack: () => void
  className?: string
}

export function ThreadHeader({ thread, contextOpen, onToggleContext, onBack, className = "" }: Props) {
  return (
    <header className={`flex items-center gap-3 border-b border-border px-4 py-3 ${className}`}>
      <button type="button" onClick={onBack} aria-label="Volver a la lista" className={`${iconBtn} md:hidden`}>
        <ChevronLeft className="h-4 w-4" />
      </button>

      <Avatar initial={thread.initial} color={thread.color} size={44} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-sm font-semibold">{thread.name}</h2>
          {thread.online && <span className="h-2 w-2 shrink-0 rounded-full bg-green" aria-label="En linea" />}
          <Star className="h-3.5 w-3.5 shrink-0 text-text-2" aria-hidden="true" />
        </div>
        <p className="truncate text-xs text-text-2">
          {thread.subtitle} - {thread.online ? "activo" : "desconectado"}
        </p>
      </div>

      <button type="button" aria-label="Llamar" className={`${iconBtn} hidden sm:grid`}>
        <Phone className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Videollamada" className={`${iconBtn} hidden sm:grid`}>
        <Video className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Panel de detalle"
        aria-pressed={contextOpen}
        onClick={onToggleContext}
        className={`${iconBtn} ${contextOpen ? "border-purple text-purple" : ""}`}
      >
        <PanelRight className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Mas opciones" className={iconBtn}>
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </header>
  )
}
````

## File: workspaces/02-whatsapp/components/ThreadList.tsx
````typescript
// CHAT_THREAD_LIST_V1
import { ThreadListItem } from "./ThreadListItem.tsx"
import type { ChatThread } from "../types.ts"

type Props = {
  threads: ChatThread[]
  activeId: string
  onSelect: (id: string) => void
  className?: string
}

export function ThreadList({ threads, activeId, onSelect, className = "" }: Props) {
  if (threads.length === 0) {
    return (
      <div className={`grid place-items-center p-8 text-center text-sm text-text-2 ${className}`}>
        No hay chats que coincidan.
      </div>
    )
  }

  return (
    <ul className={`flex flex-col gap-1 px-2 pb-4 ${className}`}>
      {threads.map((t) => (
        <li key={t.id}>
          <ThreadListItem chat={t} active={t.id === activeId} onSelect={() => onSelect(t.id)} />
        </li>
      ))}
    </ul>
  )
}
````

## File: workspaces/02-whatsapp/components/ThreadListItem.tsx
````typescript
// CHAT_THREAD_ITEM_V1
import { Hash, Sparkles } from "lucide-react"
import { Avatar } from "./Avatar.tsx"
import { formatThreadTime } from "../format.ts"
import type { ChatThread } from "../types.ts"

type Props = { chat: ChatThread; active: boolean; onSelect: () => void }

export function ThreadListItem({ chat, active, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${
        active ? "border-border bg-bg-soft" : "border-transparent hover:bg-surface"
      }`}
    >
      <Avatar initial={chat.initial} color={chat.color} size={44} online={chat.online} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{chat.name}</span>
            {chat.kind === "agent" && (
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-purple" aria-label="Agente" />
            )}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-text-2">
            {formatThreadTime(chat.lastMessageAt)}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-sm text-text-2">{chat.preview}</span>
        <span className="mt-1.5 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-xs text-text-2">
            <Hash className="h-3 w-3" />
            {chat.tag}
          </span>
          {chat.unread > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-purple px-1.5 text-[11px] font-semibold text-white">
              {chat.unread}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}
````

## File: workspaces/02-whatsapp/components/ThreadSearch.tsx
````typescript
// CHAT_THREAD_SEARCH_V1
import { Search } from "lucide-react"

type Props = { value: string; onChange: (value: string) => void }

export function ThreadSearch({ value, onChange }: Props) {
  return (
    <label className="relative block" htmlFor="thread-search">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-2" />
      <input
        id="thread-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar chats, personas..."
        className="h-11 w-full rounded-xl border border-border bg-bg-soft pl-10 pr-3 text-sm outline-none placeholder:text-text-2 focus-visible:border-purple"
      />
    </label>
  )
}
````

## File: workspaces/02-whatsapp/docs/01-ui-map.md
````markdown
# UI Map — Mensajeria instantanea

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/02-whatsapp/docs/02-roadmap.md
````markdown
# Roadmap — Mensajeria instantanea

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/02-whatsapp/docs/03-spec.md
````markdown
# Spec de UI — Mensajeria instantanea

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/02-whatsapp/docs/04-handoff-v2.md
````markdown
<!-- WHATSAPP_UI_HANDOFF_V2 -->
# Handoff v2 - Workspace 02-whatsapp (frontend)

> Para otra IA. Autocontenido. No asume nada del repo.
> Estado actual: UI base creada, sin montar.
> Rama: feat/chat-workspace-base

---

## 0. Contexto en una frase

En el repo `agente` se ha creado la UI del workspace 02-whatsapp (chat
multipartiparte de 4 columnas, estilo WhatsApp Web, mockup
`agntia-wassap-v2.png`). Los 18 ficheros existen, compilan y usan la
paleta real del repo. Falta: montar el chat en la app, actualizar el
index del workspace, escribir los docs internos y decidir como se
conecta al backend. Ese es el trabajo del v2.

---

## 1. Entorno

- Repo: `C:\Users\Alfonso\Desktop\git hub repos\agente`
- Shell: PowerShell en Windows. Rutas con espacios SIEMPRE entre comillas dobles.
- Package manager: pnpm. Node >= 22.
- El humano ejecuta los comandos. La IA genera los bloques.
- Un patchset = un bloque PowerShell = un fichero. Nunca un script con 18 ficheros.
- Sin `&&`, sin `;`. Un comando por linea.
- Nunca `git add .`. `git add` selectivo por fichero.
- UTF-8 sin BOM con `[System.IO.File]::WriteAllText(..., (New-Object System.Text.UTF8Encoding $false))`.
- Idempotencia por marca: si el fichero existe y contiene la marca, SKIP. Si existe sin marca, MISS y aviso.

---

## 2. Reglas duras del repo (aprendidas a base de romperlo)

### 2.1. Paleta Tailwind real

El repo NO usa `canvas`, `surface`, `line`, `ink`, `muted`, `accent`,
`accentsoft`, `online`. Esos son inventados. Los colores reales estan en
`apps/web/tailwind.config.js` y son:

- Fondos: `bg`, `bg-card`, `bg-soft`, `bg-softer`
- Bordes: `border`, `border-soft`, `border-strong`
- Texto: `text`, `text-2`, `text-3`, `text-4`
- Acento: `purple`, `purple-soft`
- Estado: `green`, `orange`, `warn`, `warn-border`, `warn-text`, `info`, `info-border`, `info-text`

Mapeo de las clases del chat (ya corregidas en la UI actual):

| Clase inventada | Clase real |
|---|---|
| `bg-canvas` | `bg-bg-card` |
| `bg-surface` | `bg-bg-soft` |
| `border-line` | `border-border` |
| `text-ink` | `text-text` |
| `text-muted` | `text-text-2` |
| `bg-accent` | `bg-purple` |
| `text-accent` | `text-purple` |
| `border-accent` | `border-purple` |
| `bg-accentsoft` | `bg-purple-soft` |
| `bg-online` | `bg-green` |
| `text-canvas` (sobre fondo oscuro) | `text-white` |

### 2.2. Tipografia

El repo usa `Instrument Sans`. NO meter `Inter` ni otra fuente.

### 2.3. Dark mode

El repo NO tiene dark mode. NO meter `@media (prefers-color-scheme: dark)`.
NO meter `data-theme`. Si algun dia se anade, se hace en un frente propio.

### 2.4. Radii y shadows

El repo tiene `rounded-card` (28px), `rounded-pill` (999px),
`shadow-card`, `shadow-soft`, `shadow-composer`. Usarlos cuando toque.

### 2.5. Imports con extension

El `tsconfig` usa `moduleResolution: NodeNext`. Todos los imports locales
llevan extension explicita: `./types.ts`, `../api.ts`, `./Avatar.tsx`.
Sin extension, `tsc` falla.

### 2.6. No tocar ficheros existentes a ciegas

Antes de modificar `api/chat.ts`, `App.tsx`, `main.tsx`, `WorkspaceShell.tsx`,
`index.css` o `index.ts` del workspace 02, la IA debe ver su contenido
completo. Sin verlos, no se tocan. Punto.

---

## 3. Estado actual del workspace 02-whatsapp

### 3.1. Estructura creada

```
apps/web/src/workspaces/02-whatsapp/
├── README.md                          WHATSAPP_UI_MAP_V1
├── index.ts                           metadata scaffold (NO toca el chat)
├── types.ts                           CHAT_UI_TYPES_V1
├── format.ts                          CHAT_FORMAT_V1
├── ChatWorkspace.css                  CHAT_WORKSPACE_CSS_V1 (solo estructura)
├── api.ts                             CHAT_API_V1 (mock en memoria)
├── components/
│   ├── ChatWorkspace.tsx              CHAT_WORKSPACE_V1
│   ├── Avatar.tsx                     CHAT_AVATAR_V1
│   ├── ThreadSearch.tsx               CHAT_THREAD_SEARCH_V1
│   ├── ThreadFilters.tsx              CHAT_THREAD_FILTERS_V1
│   ├── ThreadList.tsx                 CHAT_THREAD_LIST_V1
│   ├── ThreadListItem.tsx             CHAT_THREAD_ITEM_V1
│   ├── ThreadHeader.tsx               CHAT_THREAD_HEADER_V1
│   ├── MessageList.tsx                CHAT_MESSAGE_LIST_V1
│   ├── MessageBubble.tsx              CHAT_MESSAGE_BUBBLE_V1
│   ├── Composer.tsx                   CHAT_COMPOSER_V1
│   └── ContextPanel.tsx               CHAT_CONTEXT_PANEL_V1
├── hooks/
│   └── useChatWorkspace.ts            CHAT_HOOK_V1
└── docs/
    ├── 01-ui-map.md                   pendiente
    ├── 02-roadmap.md                  pendiente
    ├── 03-spec.md                     pendiente
    └── 04-handoff-v2.md               este fichero
```

Fuera del workspace, tambien creado:

```
apps/web/src/components/layout/AppRail.tsx    APP_RAIL_V1
```

### 3.2. Que hace cada pieza

- `types.ts`: tipos compartidos. `ChatRole`, `ChatThread`, `ChatMessage`,
  `ChatContextSnapshot`, `ChatStreamEvent`. Sin React, sin colores.
- `format.ts`: formateo de fechas. `formatThreadTime`, `formatDayLabel`,
  `formatClock`, `formatRelative`, `dayKey`. Sin React, sin colores.
- `api.ts`: mock en memoria. 5 hilos (Lucia, Marta, AGNTia, Operaciones,
  Cierre Q3). Firmas listas para sustituir por fetch + SSE.
- `hooks/useChatWorkspace.ts`: estado compartido del chat. Hilos, mensajes,
  contexto, panel, streaming, coautor, envio. Suscribe al stream del mock.
- `ChatWorkspace.tsx`: layout de 4 columnas. Orquesta todo. Monta el rail,
  la lista, el hilo y el panel.
- Los 10 componentes restantes: piezas del layout.
- `AppRail.tsx`: rail de 64px con navegacion. Fuera del workspace porque
  lo pueden usar mas workspaces.

### 3.3. Que NO esta montado

`ChatWorkspace` no se importa en ningun sitio. Existe pero no se ve. Eso
es lo primero que hay que resolver.

---

## 4. Ficheros que la IA NECESITA VER antes de tocar nada

Estos 7 ficheros NO se han visto todavia. Sin ellos, cualquier cambio
es a ciegas. La IA debe pedirlos antes de proponer nada.

| # | Fichero | Por que |
|---|---|---|
| 1 | `apps/web/src/workspaces/WorkspaceShell.tsx` | Decide si el chat se monta por excepcion aqui o no |
| 2 | `apps/web/src/workspaces/registry.ts` | Ya visto. Solo metadata. Confirmar que no monta componentes |
| 3 | `apps/web/src/workspaces/02-whatsapp/index.ts` | Ya visto. Solo metadata. Decidir si exporta ChatWorkspace |
| 4 | `apps/web/src/App.tsx` | Decide si hay ruta nueva o si el chat entra por shell |
| 5 | `apps/web/src/main.tsx` | Decide si hay que envolver con algun provider |
| 6 | `apps/web/src/index.css` | Decide si hay reglas globales que afecten al chat |
| 7 | `apps/web/src/api/chat.ts` | Decide si el mock del workspace convive con el o lo sustituye |

Comando para pedirlos (uno por uno, no repomix gigante):

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
Get-Content "apps/web/src/workspaces/WorkspaceShell.tsx"
```

Y asi con los 7. Pegar el output en el chat, uno detras de otro.

---

## 5. Tareas pendientes, en orden

### Tarea 1 - Montar el chat

Tres opciones. Elegir una tras ver los 7 ficheros.

**Opcion A - Ruta nueva en App.tsx.**
Anadir una vista `/chat` o similar. `ChatWorkspace` se monta ahi. Rapido,
pero rompe la simetria del catalogo de workspaces.

**Opcion B - Excepcion en WorkspaceShell.**
Si `workspaceId === "whatsapp"`, montar `ChatWorkspace` en vez de
`ViewRenderer`. Alineado con la idea de que el chat es el workspace 02.
Es la recomendada.

**Opcion C - Dejar sin montar.**
Los ficheros existen. Nadie los importa. Esperar al frente de los 34
workspaces.

### Tarea 2 - Actualizar `02-whatsapp/index.ts`

Exportar el `ChatWorkspace` ademas de la metadata. Para que quien lo
monte pueda importarlo desde el workspace.

Contenido propuesto:

```ts
// WHATSAPP_WORKSPACE_INDEX_V2
export { ChatWorkspace } from "./components/ChatWorkspace.tsx";

export const whatsappWorkspaceUi = {
  id: "whatsapp",
  slug: "02-whatsapp",
  family: "comunicacion",
  status: "implemented",
};
```

### Tarea 3 - Escribir los docs internos

- `docs/01-ui-map.md`: mapa de la UI. Que columnas, que componentes.
- `docs/02-roadmap.md`: fases. Que esta hecho, que falta.
- `docs/03-spec.md`: spec funcional. Roles, estados, acciones.

### Tarea 4 - Conectar al backend (si toca)

Hoy `api.ts` es un mock en memoria. Para conectar:

- Decidir endpoint: `/api/threads/*` (ya existe `threads-routes.ts` en
  backend) o `/api/chat/*` (nuevo).
- Sustituir `api.ts` por llamadas fetch + SSE al endpoint elegido.
- No tocar `api/chat.ts` a ciegas. Ver primero si tiene contenido vivo.

### Tarea 5 - Verificar

```powershell
pnpm typecheck
pnpm --filter @openmuse/web exec tsc --noEmit
```

Ambos deben estar verdes.

---

## 6. Convenciones de patchset

Todos los patchsets siguen el mismo patron:

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"

$file = "ruta/al/fichero"
$mark = "MARCA_V1"

if (Test-Path $file) {
  $content = Get-Content $file -Raw
  if ($content -match $mark) {
    Write-Host "SKIP: $mark ya existe" -ForegroundColor DarkGray
  } else {
    Write-Host "AVISO: $file existe sin la marca $mark. No sobreescribo." -ForegroundColor Yellow
  }
} else {
  $lines = @(
    '// MARCA_V1',
    '...',
    ''
  )
  [System.IO.File]::WriteAllText(
    (Join-Path (Get-Location) $file),
    ($lines -join "`r`n"),
    (New-Object System.Text.UTF8Encoding $false)
  )
  Write-Host "OK: $file [$mark]" -ForegroundColor Green
}
```

Reglas:

- Un patchset = un fichero = un bloque.
- Marca unica `_V1` o `_V2`.
- Idempotente por marca.
- UTF-8 sin BOM.
- Sin `&&`. Sin `;`. Un comando por linea.
- Si es correccion sobre fichero existente, `.Replace(a, b)` acotado.
- Si es fichero nuevo, `Test-Path` + `WriteAllText`.
- Verificacion `pnpm typecheck` al final de cada fase, no de cada patchset.

---

## 7. Trampas conocidas

### 7.1. Heredoc anidado en PowerShell

NO meter varios `@'...'@` en el mismo script. PowerShell los confunde.
Usar arrays de lineas con `$lines = @(...)` y un solo `WriteAllText`.

### 7.2. Repomix del repo con `apps/web/**` excluido

El `repomix.config.json` del repo excluye `apps/web/**` por defecto.
Cualquier repomix con `--include apps/web/...` seguira excluyendo esos
ficheros si el ignore del config es mas restrictivo. Pasar los ficheros
con `Get-Content` a mano, no con repomix.

### 7.3. `min-[1120px]:` sin declarar

`ChatWorkspace.tsx` usa `min-[1120px]:static` y `min-[1120px]:z-auto`.
Si Tailwind no compila esa sintaxis, revisar version. Tailwind 3.4+
la soporta. Si no, cambiar a `wide:static` y declarar `wide` en el config.

### 7.4. `text-canvas` sobre fondo oscuro

En `ThreadFilters.tsx`, `AppRail.tsx` y `ContextPanel.tsx` hay botones
con `bg-text text-white`. `text-white` es correcto porque el fondo es
oscuro. No cambiar a `text-bg-card` (seria blanco, ok, pero menos claro).

---

## 8. Definicion de terminado

- [ ] `pnpm typecheck` verde.
- [ ] `ChatWorkspace` se ve en el navegador (montado en A, B o C).
- [ ] `02-whatsapp/index.ts` exporta `ChatWorkspace`.
- [ ] `docs/01-ui-map.md`, `02-roadmap.md`, `03-spec.md` con contenido real.
- [ ] `README.md` del workspace actualizado si cambia algo.
- [ ] `git status --short` limpio de ficheros no relacionados.
- [ ] Commit con mensaje `feat(web): workspace 02-whatsapp UI montada`.

---

## 9. Lo que NO se toca

- `apps/web/src/workspaces/NN-nombre/` excepto `02-whatsapp`.
- `apps/web/src/components/agents/` (frente Laia + 12).
- `apps/web/src/components/ChatPanel.tsx` (chat viejo, decidir despues).
- `apps/web/src/hooks/useChat.ts` (hook viejo, decidir despues).
- `apps/web/src/api/chat.ts` sin verlo.
- `apps/web/tailwind.config.js` (los colores del chat ya existen).
- `apps/server/`, `packages/` (backend).

---

## 10. Referencia rapida

- Mockup: `agntia-wassap-v2.png`
- Mapa del workspace: `apps/web/src/workspaces/02-whatsapp/README.md`
- Handoff original del frente: handoff "Cerrar frente Laia + 12"
- Otros workspaces: `apps/web/src/workspaces/01-gmail/` ... `34-trello/`
- Registry: `apps/web/src/workspaces/registry.ts`
- Shell: `apps/web/src/workspaces/WorkspaceShell.tsx`

---

FIN DEL HANDOFF V2.
````

## File: workspaces/02-whatsapp/hooks/.gitkeep
````

````

## File: workspaces/02-whatsapp/hooks/useChatWorkspace.ts
````typescript
// CHAT_HOOK_V1
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getContext, listMessages, listThreads, sendMessage, subscribeStream } from "../api.ts"
import type {
  ChatContextSnapshot,
  ChatContextTab,
  ChatMessage,
  ChatThread,
} from "../types.ts"

export type ChatWorkspaceState = {
  threads: ChatThread[]
  activeThreadId: string | null
  activeThread: ChatThread | null
  messages: ChatMessage[]
  context: ChatContextSnapshot | null
  contextPanelOpen: boolean
  contextTab: ChatContextTab
  coauthorMode: boolean
  isStreaming: boolean
  selectThread: (id: string) => void
  toggleContextPanel: () => void
  setContextTab: (tab: ChatContextTab) => void
  setCoauthorMode: (on: boolean) => void
  send: (text: string) => Promise<void>
}

const isWideScreen = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 1120px)").matches

export function useChatWorkspace(): ChatWorkspaceState {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [context, setContext] = useState<ChatContextSnapshot | null>(null)
  const [contextPanelOpen, setContextPanelOpen] = useState(isWideScreen)
  const [contextTab, setContextTab] = useState<ChatContextTab>("info")
  const [coauthorMode, setCoauthorMode] = useState(false)

  const activeRef = useRef<string | null>(null)
  activeRef.current = activeThreadId

  const refreshThreads = useCallback(async () => {
    setThreads(await listThreads())
  }, [])

  useEffect(() => {
    let cancelled = false
    listThreads().then((ts) => {
      if (cancelled) return
      setThreads(ts)
      setActiveThreadId((prev) => prev ?? ts.find((t) => !t.archived)?.id ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!activeThreadId) return
    let cancelled = false
    setMessages([])
    setContext(null)

    Promise.all([listMessages(activeThreadId), getContext(activeThreadId)]).then(([msgs, ctx]) => {
      if (cancelled) return
      setMessages(msgs)
      setContext(ctx)
      void refreshThreads()
    })

    const unsubscribe = subscribeStream(activeThreadId, (event) => {
      if (event.type === "start") {
        setMessages((prev) =>
          prev.some((m) => m.id === event.message.id) ? prev : [...prev, event.message],
        )
      } else if (event.type === "token") {
        setMessages((prev) =>
          prev.map((m) => (m.id === event.messageId ? { ...m, text: m.text + event.delta } : m)),
        )
      } else {
        setMessages((prev) =>
          prev.some((m) => m.id === event.message.id)
            ? prev.map((m) => (m.id === event.message.id ? event.message : m))
            : [...prev, event.message],
        )
        void refreshThreads()
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [activeThreadId, refreshThreads])

  const selectThread = useCallback((id: string) => setActiveThreadId(id), [])
  const toggleContextPanel = useCallback(() => setContextPanelOpen((open) => !open), [])

  const send = useCallback(
    async (text: string) => {
      const threadId = activeRef.current
      if (!threadId) return
      const message = await sendMessage(threadId, text, { coauthor: coauthorMode })
      if (activeRef.current === message.threadId) setMessages((prev) => [...prev, message])
      void refreshThreads()
    },
    [coauthorMode, refreshThreads],
  )

  return useMemo<ChatWorkspaceState>(
    () => ({
      threads,
      activeThreadId,
      activeThread: threads.find((t) => t.id === activeThreadId) ?? null,
      messages,
      context,
      contextPanelOpen,
      contextTab,
      coauthorMode,
      isStreaming: messages.some((m) => m.streaming),
      selectThread,
      toggleContextPanel,
      setContextTab,
      setCoauthorMode,
      send,
    }),
    [
      threads,
      activeThreadId,
      messages,
      context,
      contextPanelOpen,
      contextTab,
      coauthorMode,
      selectThread,
      toggleContextPanel,
      send,
    ],
  )
}
````

## File: workspaces/02-whatsapp/api.ts
````typescript
// CHAT_API_V1
// Mock en memoria (Lucia / Alfonso / Marta / AGNTia).
// Cada funcion conserva la firma que tendra la API real.

import type {
  ChatContextSnapshot,
  ChatMessage,
  ChatRole,
  ChatStreamEvent,
  ChatThread,
} from "./types.ts"

const OWNER_NAME = "Alfonso"

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()
const wait = <T>(value: T, ms = 120) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))

const threadStore = new Map<string, ChatThread>()
const messageStore = new Map<string, ChatMessage[]>()

function addThread(t: Omit<ChatThread, "preview" | "lastMessageAt">) {
  threadStore.set(t.id, { ...t, preview: "", lastMessageAt: new Date(0).toISOString() })
  messageStore.set(t.id, [])
}

function seed(threadId: string, role: ChatRole, authorName: string, text: string, ago: number) {
  const list = messageStore.get(threadId)!
  list.push({
    id: `${threadId}-${list.length + 1}`,
    threadId,
    role,
    authorName,
    text,
    createdAt: minutesAgo(ago),
  })
}

function previewOf(m: ChatMessage, kind: ChatThread["kind"]): string {
  if (m.role === "owner") return `Tu: ${m.text}`
  if (kind === "group" && m.role !== "system") return `${m.authorName}: ${m.text}`
  return m.text
}

function refreshThread(id: string) {
  const t = threadStore.get(id)
  const list = messageStore.get(id)
  if (!t || !list || list.length === 0) return
  const last = list[list.length - 1]
  threadStore.set(id, { ...t, preview: previewOf(last, t.kind), lastMessageAt: last.createdAt })
}

addThread({ id: "0001", name: "Lucia", initial: "L", color: "#6C5CD6", kind: "direct", subtitle: "Producto - Equipo", tag: "Linear", unread: 2, online: true, archived: false })
addThread({ id: "0002", name: "Marta", initial: "M", color: "#FF7A59", kind: "direct", subtitle: "Cliente - Pyme", tag: "Propuesta", unread: 1, online: false, archived: false })
addThread({ id: "0003", name: "AGNTia", initial: "A", color: "#0EA5A4", kind: "agent", subtitle: "Agente - Asistente", tag: "Agente", unread: 0, online: true, archived: false })
addThread({ id: "0004", name: "Operaciones", initial: "O", color: "#6B7280", kind: "group", subtitle: "Grupo - Equipo", tag: "AGNTia", unread: 1, online: true, archived: false })
addThread({ id: "0005", name: "Cierre Q3", initial: "C", color: "#F59E0B", kind: "group", subtitle: "Grupo - Archivado", tag: "Q3", unread: 0, online: false, archived: true })

seed("0001", "employee", "Lucia", "Te paso manana el flujo de onboarding con los 3 pasos.", 1560)
seed("0001", "owner", OWNER_NAME, "Perfecto, lo reviso a primera hora.", 1550)
seed("0001", "employee", "Lucia", "Ya subi el flujo de onboarding, echale un ojo cuando puedas.", 135)
seed("0001", "owner", OWNER_NAME, "Lo veo ahora. Quitaste el modal de bienvenida?", 134)
seed("0001", "employee", "Lucia", "Si, directo al grano. Todo visible con scroll, sin cortes.", 133)
seed("0001", "system", "Sistema", "Lucia adjunto onboarding-flow-v2.fig", 131)
seed("0001", "owner", OWNER_NAME, "Perfecto. Reviso los estados vacios y te escribo.", 128)
seed("0001", "employee", "Lucia", "Va. Los deje en el mismo archivo de Figma.", 120)

seed("0002", "client", "Marta", "Hola Alfonso, podeis enviarme la propuesta actualizada?", 1500)
seed("0002", "owner", OWNER_NAME, "Claro, te la mando hoy antes de las 12.", 1488)
seed("0002", "client", "Marta", "Gracias. Incluye tambien la integracion con el correo?", 60)

seed("0003", "agent", "AGNTia", "Resumen diario: 18 tareas, 4 bloqueadas, 2 vencen hoy.", 400)
seed("0003", "owner", OWNER_NAME, "Cuales son las bloqueadas?", 395)
seed("0003", "agent", "AGNTia", "Tres esperan revision de diseno y una depende de la API de pagos.", 394)

seed("0004", "system", "Sistema", "Alfonso creo el grupo", 2900)
seed("0004", "employee", "Lucia", "Recordatorio: cierre de mes el viernes.", 300)
seed("0004", "agent", "AGNTia", "He preparado la lista de pendientes para el cierre.", 299)
seed("0004", "owner", OWNER_NAME, "Gracias, la reviso esta tarde.", 240)

seed("0005", "owner", OWNER_NAME, "Cerramos Q3 con todos los entregables.", 8000)

for (const id of threadStore.keys()) refreshThread(id)

const contexts: Record<string, ChatContextSnapshot> = {
  "0001": {
    threadId: "0001",
    email: "lucia@agntia.os",
    location: "Madrid - GMT+2",
    hours: "09:00 - 18:00",
    files: [
      { id: "f1", name: "onboarding-flow-v2.fig", size: "2.4 MB", addedAt: minutesAgo(131) },
      { id: "f2", name: "onboarding-copy.md", size: "12 KB", addedAt: minutesAgo(180) },
    ],
    notes: [
      { id: "n1", text: "Revisar los estados vacios antes del viernes.", author: OWNER_NAME },
      { id: "n2", text: "Pendiente pasar el flujo a revision de codigo.", author: "Lucia" },
    ],
    activity: [
      { id: "a1", text: "Subio onboarding-flow-v2.fig", at: minutesAgo(131) },
      { id: "a2", text: "Cambio el flujo a 3 pasos", at: minutesAgo(135) },
    ],
  },
  "0002": {
    threadId: "0002",
    email: "marta@pyme-demo.es",
    location: "Valencia - GMT+2",
    hours: "10:00 - 19:00",
    files: [{ id: "f1", name: "propuesta-v2.pdf", size: "380 KB", addedAt: minutesAgo(4000) }],
    notes: [{ id: "n1", text: "Pidio modulo de documentos.", author: OWNER_NAME }],
    activity: [{ id: "a1", text: "Pregunto por la integracion con el correo", at: minutesAgo(60) }],
  },
  "0003": {
    threadId: "0003",
    email: "agente@agntia.os",
    location: "Nube - siempre activo",
    hours: "24/7",
    files: [{ id: "f1", name: "resumen-diario.md", size: "3 KB", addedAt: minutesAgo(400) }],
    notes: [],
    activity: [{ id: "a1", text: "Genero el resumen diario", at: minutesAgo(400) }],
  },
  "0004": {
    threadId: "0004",
    email: "operaciones@agntia.os",
    location: "Equipo - remoto",
    hours: "09:00 - 18:00",
    files: [],
    notes: [{ id: "n1", text: "Cierre de mes el viernes.", author: "Lucia" }],
    activity: [{ id: "a1", text: "AGNTia preparo la lista de pendientes", at: minutesAgo(299) }],
  },
  "0005": {
    threadId: "0005",
    email: "q3@agntia.os",
    location: "Equipo - remoto",
    hours: "09:00 - 18:00",
    files: [],
    notes: [],
    activity: [],
  },
}

type StreamHandler = (event: ChatStreamEvent) => void
const listeners = new Map<string, Set<StreamHandler>>()

function emit(threadId: string, event: ChatStreamEvent) {
  listeners.get(threadId)?.forEach((handler) => handler(event))
}

function bumpUnread(threadId: string) {
  const t = threadStore.get(threadId)
  if (t) threadStore.set(threadId, { ...t, unread: t.unread + 1 })
}

function streamAgentReply(threadId: string, userText: string) {
  const thread = threadStore.get(threadId)
  const short = userText.length > 40 ? `${userText.slice(0, 40)}...` : userText
  const reply =
    thread?.kind === "agent"
      ? `Entendido. Reviso "${short}" y te dejo un resumen con lo que afecta a las tareas abiertas.`
      : "Sugerencia de AGNTia: confirma el plazo, adjunta el documento y deja claro quien valida el siguiente paso."
  const id = `${threadId}-a-${Date.now().toString(36)}`

  setTimeout(() => {
    const draft: ChatMessage = {
      id,
      threadId,
      role: "agent",
      authorName: "AGNTia",
      text: "",
      createdAt: new Date().toISOString(),
      streaming: true,
    }
    emit(threadId, { type: "start", message: draft })

    const chunks = reply.split(/(?<=\s)/)
    let i = 0
    const timer = setInterval(() => {
      if (i < chunks.length) {
        emit(threadId, { type: "token", messageId: id, delta: chunks[i++] })
        return
      }
      clearInterval(timer)
      const done: ChatMessage = { ...draft, text: reply, streaming: false }
      messageStore.get(threadId)?.push(done)
      if ((listeners.get(threadId)?.size ?? 0) === 0) bumpUnread(threadId)
      refreshThread(threadId)
      emit(threadId, { type: "end", message: done })
    }, 45)
  }, 500)
}

export async function listThreads(): Promise<ChatThread[]> {
  const all = [...threadStore.values()]
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
    .map((t) => ({ ...t }))
  return wait(all)
}

export async function getThread(id: string): Promise<ChatThread | null> {
  const t = threadStore.get(id)
  return wait(t ? { ...t } : null)
}

export async function listMessages(threadId: string): Promise<ChatMessage[]> {
  const t = threadStore.get(threadId)
  if (t && t.unread > 0) threadStore.set(threadId, { ...t, unread: 0 })
  return wait((messageStore.get(threadId) ?? []).map((m) => ({ ...m })))
}

export async function sendMessage(
  threadId: string,
  text: string,
  opts: { coauthor?: boolean } = {},
): Promise<ChatMessage> {
  const thread = threadStore.get(threadId)
  const list = messageStore.get(threadId)
  if (!thread || !list) throw new Error(`Hilo ${threadId} no encontrado`)

  const message: ChatMessage = {
    id: `${threadId}-${list.length + 1}`,
    threadId,
    role: "owner",
    authorName: OWNER_NAME,
    text,
    createdAt: new Date().toISOString(),
  }
  list.push(message)
  refreshThread(threadId)

  if (thread.kind === "agent" || opts.coauthor) streamAgentReply(threadId, text)
  return wait({ ...message }, 80)
}

export async function getContext(threadId: string): Promise<ChatContextSnapshot> {
  const ctx = contexts[threadId]
  if (!ctx) throw new Error(`Sin contexto para el hilo ${threadId}`)
  return wait({ ...ctx })
}

export function subscribeStream(threadId: string, handler: StreamHandler): () => void {
  const set = listeners.get(threadId) ?? new Set<StreamHandler>()
  listeners.set(threadId, set)
  set.add(handler)
  return () => {
    set.delete(handler)
  }
}
````

## File: workspaces/02-whatsapp/ChatWorkspace.css
````css
/* CHAT_WORKSPACE_CSS_V1 */

.chat-workspace {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.chat-workspace * {
  scrollbar-width: thin;
}
````

## File: workspaces/02-whatsapp/format.ts
````typescript
// CHAT_FORMAT_V1

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

const yesterdayOf = (now: Date) => {
  const y = new Date(now)
  y.setDate(now.getDate() - 1)
  return y
}

export const dayKey = (iso: string) => new Date(iso).toDateString()

export const formatClock = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })

export function formatThreadTime(iso: string, now = new Date()): string {
  const d = new Date(iso)
  if (sameDay(d, now)) return formatClock(iso)
  if (sameDay(d, yesterdayOf(now))) return "ayer"
  const days = (now.getTime() - d.getTime()) / 86_400_000
  if (days < 7) return d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "")
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "")
}

export function formatDayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso)
  if (sameDay(d, now)) return "Hoy"
  if (sameDay(d, yesterdayOf(now))) return "Ayer"
  return d
    .toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })
    .replace(/\./g, "")
}

export function formatRelative(iso: string, now = Date.now()): string {
  const min = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000))
  if (min < 1) return "ahora"
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  if (d < 7) return `hace ${d} d`
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "")
}
````

## File: workspaces/02-whatsapp/index.ts
````typescript
// 02-whatsapp — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: WhatsApp Web
export const whatsappWorkspaceUi = {
  id: "whatsapp",
  slug: "02-whatsapp",
  family: "comunicacion",
  status: "scaffold",
};
````

## File: workspaces/02-whatsapp/README.md
````markdown
<!-- WHATSAPP_UI_MAP_V1 -->
# 02-whatsapp - Mensajeria instantanea (frontend)

- **Estado:** en construccion
- **Referencia:** WhatsApp Web
- **Familia:** comunicacion
- **Mockup:** agntia-wassap-v2.png

## Objetivo

UI de chat multiparticipante en 4 columnas que clona el mockup de WhatsApp
Web, adaptado al sistema de workspaces de Agntia OS. El chat soporta 5 roles
en un mismo hilo: owner, employee, client, agent, system.

## Estructura del workspace

```
02-whatsapp/
├── README.md                 este fichero
├── index.ts                  metadata del workspace
├── api.ts                    CHAT_API_V1 (mock en memoria)
├── types.ts                  CHAT_UI_TYPES_V1
├── format.ts                 CHAT_FORMAT_V1
├── ChatWorkspace.css         CHAT_WORKSPACE_CSS_V1
├── components/
│   ├── ChatWorkspace.tsx     CHAT_WORKSPACE_V1
│   ├── Avatar.tsx
│   ├── ThreadSearch.tsx
│   ├── ThreadFilters.tsx
│   ├── ThreadList.tsx
│   ├── ThreadListItem.tsx
│   ├── ThreadHeader.tsx
│   ├── MessageList.tsx
│   ├── MessageBubble.tsx
│   ├── Composer.tsx
│   └── ContextPanel.tsx
├── hooks/
│   └── useChatWorkspace.ts   CHAT_HOOK_V1
└── docs/
    ├── 01-ui-map.md
    ├── 02-roadmap.md
    └── 03-spec.md
```

## Mapa de componentes

### Raiz del workspace

| Fichero | Marca | Que es |
|---|---|---|
| `types.ts` | `CHAT_UI_TYPES_V1` | Tipos compartidos del chat |
| `format.ts` | `CHAT_FORMAT_V1` | Formateo de fechas y horas |
| `ChatWorkspace.css` | `CHAT_WORKSPACE_CSS_V1` | Tokens y modo oscuro |
| `api.ts` | `CHAT_API_V1` | Mock en memoria (Lucia, Marta, AGNTia, Operaciones, Cierre Q3) |

### Componentes

| Fichero | Marca | Que es |
|---|---|---|
| `components/ChatWorkspace.tsx` | `CHAT_WORKSPACE_V1` | Layout de 4 columnas. Orquesta todo |
| `components/Avatar.tsx` | - | Avatar con inicial, color y punto online |
| `components/ThreadSearch.tsx` | - | Buscador de hilos |
| `components/ThreadFilters.tsx` | - | Filtros: Todos, Sin leer, Grupos, Archivados |
| `components/ThreadList.tsx` | - | Lista scrollable de hilos |
| `components/ThreadListItem.tsx` | - | Fila de hilo (avatar, nombre, preview, hora, badge) |
| `components/ThreadHeader.tsx` | - | Cabecera del hilo activo |
| `components/MessageList.tsx` | - | Lista de mensajes con separadores de dia |
| `components/MessageBubble.tsx` | - | Burbuja por rol (owner, employee, client, agent, system) |
| `components/Composer.tsx` | - | Input + coautor + enviar |
| `components/ContextPanel.tsx` | - | Panel de detalle (info, files, notes, activity) |

### Hooks

| Fichero | Marca | Que es |
|---|---|---|
| `hooks/useChatWorkspace.ts` | `CHAT_HOOK_V1` | Estado compartido del chat (hilos, mensajes, contexto, streaming) |

### Layout global (fuera del workspace)

| Fichero | Que es |
|---|---|
| `apps/web/src/components/layout/AppRail.tsx` | Rail de navegacion de 64px. Lo usan todos los workspaces |

## Contratos de tipos

Definidos en `types.ts` (`CHAT_UI_TYPES_V1`):

- `ChatRole` = `owner | employee | client | agent | system`
- `ChatFilter` = `all | unread | groups | archived`
- `ChatContextTab` = `info | files | notes | activity`
- `ChatThreadKind` = `direct | group | agent`
- `ChatThread`, `ChatMessage`, `ChatFile`, `ChatNote`, `ChatActivity`
- `ChatContextSnapshot`, `ChatStreamEvent`

## Estado compartido

`hooks/useChatWorkspace.ts` (`CHAT_HOOK_V1`) expone:

- `threads`, `activeThreadId`, `activeThread`
- `messages`, `context`
- `contextPanelOpen`, `contextTab`
- `coauthorMode`, `isStreaming`
- `selectThread`, `toggleContextPanel`, `setContextTab`, `setCoauthorMode`, `send`

## Datos (mock en fase 1)

`api.ts` mantiene las firmas de la API real:

- `listThreads()`, `getThread(id)`
- `listMessages(threadId)`, `sendMessage(threadId, text, opts)`
- `getContext(threadId)`
- `subscribeStream(threadId, handler)`

Cuando se conecte al backend, se sustituye el cuerpo por fetch + SSE
contra `/api/threads/*` o `/api/chat/*` segun decida el frente de backend.

## Relacion con el resto del repo

- **Registry de workspaces:** `apps/web/src/workspaces/registry.ts`. Solo
  metadata (id, slug, family, title, reference). No monta componentes.
- **WorkspaceShell:** `apps/web/src/workspaces/WorkspaceShell.tsx`. Hoy monta
  `ViewRenderer` con un `RuntimeViewSpec`. El chat no encaja en ninguna de
  las 9 plantillas, asi que necesita su propia via de montaje.
- **Montaje pendiente:** decidir si el chat se monta por excepcion en
  `WorkspaceShell` o por ruta propia en `App.tsx`. Fase 2.

## Roadmap por fases

1. **Fase 1 (esta rama):** tipos, format, css, api mock, hook, 11 componentes.
   Todo dentro del workspace 02. Cero cambios fuera.
2. **Fase 2:** montaje en `WorkspaceShell` o `App.tsx`. Decision pendiente.
3. **Fase 3:** cableado al backend real (`api/chat.ts` o `/api/threads/*`).

## Pendientes conocidos

- `coauthorMode` vive en el composer. Si el mockup pide panel IA, mover.
- Panel con 4 tabs (estilo WhatsApp Web). El mockup original pedia panel IA
  unico con resumen, intencion, urgencia, proximo paso. Decision pendiente.
- `lucide-react` debe estar en `apps/web/package.json`. Fase 2.
````

## File: workspaces/02-whatsapp/types.ts
````typescript
// CHAT_UI_TYPES_V1

export type ChatRole = "owner" | "employee" | "client" | "agent" | "system"

export type ChatFilter = "all" | "unread" | "groups" | "archived"

export type ChatContextTab = "info" | "files" | "notes" | "activity"

export type ChatThreadKind = "direct" | "group" | "agent"

export type ChatThread = {
  id: string
  name: string
  initial: string
  color: string
  kind: ChatThreadKind
  subtitle: string
  tag: string
  preview: string
  lastMessageAt: string
  unread: number
  online: boolean
  archived: boolean
}

export type ChatMessage = {
  id: string
  threadId: string
  role: ChatRole
  authorName: string
  text: string
  createdAt: string
  streaming?: boolean
}

export type ChatFile = { id: string; name: string; size: string; addedAt: string }
export type ChatNote = { id: string; text: string; author: string }
export type ChatActivity = { id: string; text: string; at: string }

export type ChatContextSnapshot = {
  threadId: string
  email: string
  location: string
  hours: string
  files: ChatFile[]
  notes: ChatNote[]
  activity: ChatActivity[]
}

export type ChatStreamEvent =
  | { type: "start"; message: ChatMessage }
  | { type: "token"; messageId: string; delta: string }
  | { type: "end"; message: ChatMessage }
````

## File: workspaces/03-hubspot/components/.gitkeep
````

````

## File: workspaces/03-hubspot/docs/01-ui-map.md
````markdown
# UI Map — CRM y ventas

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/03-hubspot/docs/02-roadmap.md
````markdown
# Roadmap — CRM y ventas

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/03-hubspot/docs/03-spec.md
````markdown
# Spec de UI — CRM y ventas

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/03-hubspot/hooks/.gitkeep
````

````

## File: workspaces/03-hubspot/index.ts
````typescript
// 03-hubspot — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: HubSpot
export const hubspotWorkspaceUi = {
  id: "hubspot",
  slug: "03-hubspot",
  family: "comunicacion",
  status: "scaffold",
};
````

## File: workspaces/03-hubspot/README.md
````markdown
# 03-hubspot — CRM y ventas (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/04-holded/components/.gitkeep
````

````

## File: workspaces/04-holded/docs/01-ui-map.md
````markdown
# UI Map — ERP, facturacion y administracion

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/04-holded/docs/02-roadmap.md
````markdown
# Roadmap — ERP, facturacion y administracion

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/04-holded/docs/03-spec.md
````markdown
# Spec de UI — ERP, facturacion y administracion

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/04-holded/hooks/.gitkeep
````

````

## File: workspaces/04-holded/index.ts
````typescript
// 04-holded — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Holded
export const holdedWorkspaceUi = {
  id: "holded",
  slug: "04-holded",
  family: "finanzas",
  status: "scaffold",
};
````

## File: workspaces/04-holded/README.md
````markdown
# 04-holded — ERP, facturacion y administracion (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/05-google-drive/components/.gitkeep
````

````

## File: workspaces/05-google-drive/docs/01-ui-map.md
````markdown
# UI Map — Archivos y documentos

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/05-google-drive/docs/02-roadmap.md
````markdown
# Roadmap — Archivos y documentos

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/05-google-drive/docs/03-spec.md
````markdown
# Spec de UI — Archivos y documentos

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/05-google-drive/hooks/.gitkeep
````

````

## File: workspaces/05-google-drive/index.ts
````typescript
// 05-google-drive — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Google Drive
export const google_driveWorkspaceUi = {
  id: "google-drive",
  slug: "05-google-drive",
  family: "documentos",
  status: "scaffold",
};
````

## File: workspaces/05-google-drive/README.md
````markdown
# 05-google-drive — Archivos y documentos (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/06-google-calendar/components/.gitkeep
````

````

## File: workspaces/06-google-calendar/docs/01-ui-map.md
````markdown
# UI Map — Calendario y agenda

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/06-google-calendar/docs/02-roadmap.md
````markdown
# Roadmap — Calendario y agenda

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/06-google-calendar/docs/03-spec.md
````markdown
# Spec de UI — Calendario y agenda

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/06-google-calendar/hooks/.gitkeep
````

````

## File: workspaces/06-google-calendar/index.ts
````typescript
// 06-google-calendar — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Google Calendar
export const google_calendarWorkspaceUi = {
  id: "google-calendar",
  slug: "06-google-calendar",
  family: "trabajo",
  status: "scaffold",
};
````

## File: workspaces/06-google-calendar/README.md
````markdown
# 06-google-calendar — Calendario y agenda (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/07-linear/components/.gitkeep
````

````

## File: workspaces/07-linear/docs/01-ui-map.md
````markdown
# UI Map — Tareas y proyectos

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/07-linear/docs/02-roadmap.md
````markdown
# Roadmap — Tareas y proyectos

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/07-linear/docs/03-spec.md
````markdown
# Spec de UI — Tareas y proyectos

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/07-linear/hooks/.gitkeep
````

````

## File: workspaces/07-linear/index.ts
````typescript
// 07-linear — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Linear
export const linearWorkspaceUi = {
  id: "linear",
  slug: "07-linear",
  family: "trabajo",
  status: "scaffold",
};
````

## File: workspaces/07-linear/README.md
````markdown
# 07-linear — Tareas y proyectos (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/08-chatgpt/components/.gitkeep
````

````

## File: workspaces/08-chatgpt/docs/01-ui-map.md
````markdown
# UI Map — Chat con IA

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/08-chatgpt/docs/02-roadmap.md
````markdown
# Roadmap — Chat con IA

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/08-chatgpt/docs/03-spec.md
````markdown
# Spec de UI — Chat con IA

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/08-chatgpt/hooks/.gitkeep
````

````

## File: workspaces/08-chatgpt/index.ts
````typescript
// 08-chatgpt — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: ChatGPT
export const chatgptWorkspaceUi = {
  id: "chatgpt",
  slug: "08-chatgpt",
  family: "global",
  status: "scaffold",
};
````

## File: workspaces/08-chatgpt/README.md
````markdown
# 08-chatgpt — Chat con IA (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/09-airtable/components/.gitkeep
````

````

## File: workspaces/09-airtable/docs/01-ui-map.md
````markdown
# UI Map — Tablas y bases de datos

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/09-airtable/docs/02-roadmap.md
````markdown
# Roadmap — Tablas y bases de datos

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/09-airtable/docs/03-spec.md
````markdown
# Spec de UI — Tablas y bases de datos

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/09-airtable/hooks/.gitkeep
````

````

## File: workspaces/09-airtable/index.ts
````typescript
// 09-airtable — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Airtable
export const airtableWorkspaceUi = {
  id: "airtable",
  slug: "09-airtable",
  family: "datos",
  status: "scaffold",
};
````

## File: workspaces/09-airtable/README.md
````markdown
# 09-airtable — Tablas y bases de datos (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/10-perdoo/components/.gitkeep
````

````

## File: workspaces/10-perdoo/docs/01-ui-map.md
````markdown
# UI Map — Direccion, objetivos y planificacion

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/10-perdoo/docs/02-roadmap.md
````markdown
# Roadmap — Direccion, objetivos y planificacion

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/10-perdoo/docs/03-spec.md
````markdown
# Spec de UI — Direccion, objetivos y planificacion

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/10-perdoo/hooks/.gitkeep
````

````

## File: workspaces/10-perdoo/index.ts
````typescript
// 10-perdoo — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Perdoo
export const perdooWorkspaceUi = {
  id: "perdoo",
  slug: "10-perdoo",
  family: "personas",
  status: "scaffold",
};
````

## File: workspaces/10-perdoo/README.md
````markdown
# 10-perdoo — Direccion, objetivos y planificacion (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/11-holded-tesoreria/components/.gitkeep
````

````

## File: workspaces/11-holded-tesoreria/docs/01-ui-map.md
````markdown
# UI Map — Tesoreria y conciliacion bancaria

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/11-holded-tesoreria/docs/02-roadmap.md
````markdown
# Roadmap — Tesoreria y conciliacion bancaria

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/11-holded-tesoreria/docs/03-spec.md
````markdown
# Spec de UI — Tesoreria y conciliacion bancaria

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/11-holded-tesoreria/hooks/.gitkeep
````

````

## File: workspaces/11-holded-tesoreria/index.ts
````typescript
// 11-holded-tesoreria — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Holded / banca online
export const holded_tesoreriaWorkspaceUi = {
  id: "holded-tesoreria",
  slug: "11-holded-tesoreria",
  family: "finanzas",
  status: "scaffold",
};
````

## File: workspaces/11-holded-tesoreria/README.md
````markdown
# 11-holded-tesoreria — Tesoreria y conciliacion bancaria (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/12-odoo-purchase/components/.gitkeep
````

````

## File: workspaces/12-odoo-purchase/docs/01-ui-map.md
````markdown
# UI Map — Compras y proveedores

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/12-odoo-purchase/docs/02-roadmap.md
````markdown
# Roadmap — Compras y proveedores

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/12-odoo-purchase/docs/03-spec.md
````markdown
# Spec de UI — Compras y proveedores

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/12-odoo-purchase/hooks/.gitkeep
````

````

## File: workspaces/12-odoo-purchase/index.ts
````typescript
// 12-odoo-purchase — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Odoo Purchase
export const odoo_purchaseWorkspaceUi = {
  id: "odoo-purchase",
  slug: "12-odoo-purchase",
  family: "finanzas",
  status: "scaffold",
};
````

## File: workspaces/12-odoo-purchase/README.md
````markdown
# 12-odoo-purchase — Compras y proveedores (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/13-productive/components/.gitkeep
````

````

## File: workspaces/13-productive/docs/01-ui-map.md
````markdown
# UI Map — Gestion de proyectos y rentabilidad

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/13-productive/docs/02-roadmap.md
````markdown
# Roadmap — Gestion de proyectos y rentabilidad

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/13-productive/docs/03-spec.md
````markdown
# Spec de UI — Gestion de proyectos y rentabilidad

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/13-productive/hooks/.gitkeep
````

````

## File: workspaces/13-productive/index.ts
````typescript
// 13-productive — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Productive
export const productiveWorkspaceUi = {
  id: "productive",
  slug: "13-productive",
  family: "trabajo",
  status: "scaffold",
};
````

## File: workspaces/13-productive/README.md
````markdown
# 13-productive — Gestion de proyectos y rentabilidad (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/14-zendesk/components/.gitkeep
````

````

## File: workspaces/14-zendesk/components/AgentStatusPill.tsx
````typescript
// ZENDESK_STATUS_V1

import { Zap } from "lucide-react";

interface Props {
  agentName?: string;
}

export default function AgentStatusPill({ agentName = "ACME" }: Props) {
  return (
    <div className="mx-4 mt-1 flex items-center gap-2 rounded-full border border-border bg-bg-card px-3 py-1.5">
      <span className="h-2 w-2 shrink-0 rounded-full bg-green" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-text">Agente activo {agentName}</span>
      <Zap className="h-3.5 w-3.5 shrink-0 text-purple" />
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/Avatar.tsx
````typescript
// ZENDESK_SHARED_AVATAR_V1

interface Props {
  initials: string;
  color: { bg: string; fg: string };
  size?: number;
  square?: boolean;
  online?: boolean;
  className?: string;
}

export default function Avatar({ initials, color, size = 40, square = false, online = false, className = "" }: Props) {
  const radius = square ? Math.round(size * 0.28) : 9999;
  const fontSize = Math.round(size * 0.34);
  const dot = Math.max(8, Math.round(size * 0.22));
  return (
    <span
      className={"relative inline-grid shrink-0 place-items-center font-semibold " + className}
      style={{
        width: size,
        height: size,
        background: color.bg,
        color: color.fg,
        borderRadius: radius,
        fontSize: fontSize,
      }}
    >
      {initials}
      {online && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-bg-card bg-green"
          style={{ width: dot, height: dot }}
        />
      )}
    </span>
  );
}
````

## File: workspaces/14-zendesk/components/CoWriteEditor.tsx
````typescript
// ZENDESK_COWRITE_EDITOR_V1

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export default function CoWriteEditor({ value, onChange, disabled = false }: Props) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      rows={6}
      className="w-full resize-y rounded-xl border border-border bg-bg-card px-3 py-2 text-xs leading-relaxed text-text outline-none placeholder:text-text-3 focus-visible:border-purple disabled:opacity-60"
      placeholder="Escribe aqui tu respuesta o pulsa Reescribir con IA."
    />
  );
}
````

## File: workspaces/14-zendesk/components/CoWritePanel.tsx
````typescript
// ZENDESK_COWRITE_PANEL_V1

import { Paperclip, Send, Sparkles, Wand2 } from "lucide-react";
import CoWriteToggle from "./CoWriteToggle.tsx";
import CoWriteEditor from "./CoWriteEditor.tsx";
import type { CoWriteDraft } from "../types.ts";

interface Props {
  draft: CoWriteDraft | null;
  onGenerate: () => void;
  onToggle: () => void;
  onSetBody: (body: string) => void;
}

export default function CoWritePanel({ draft, onGenerate, onToggle, onSetBody }: Props) {
  if (!draft) return null;
  return (
    <div className="border-t border-border-soft px-5 py-4">
      <CoWriteToggle active={draft.active} onToggle={onToggle} />

      <p className="mt-2 text-[11px] text-text-3">
        Responder a {draft.recipient} - {draft.templateName}
      </p>

      <div className="mt-3">
        <CoWriteEditor value={draft.body} onChange={onSetBody} disabled={!draft.active} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!draft.active}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-purple-soft px-3 text-[11px] font-semibold text-purple hover:bg-purple/15 disabled:opacity-50"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Reescribir con IA
        </button>
        <button
          type="button"
          disabled={!draft.active}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-bg-card px-3 text-[11px] font-semibold text-text-2 hover:text-text disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Usar {draft.templateName}
        </button>
        <button
          type="button"
          disabled={!draft.active}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-bg-card px-3 text-[11px] font-semibold text-text-2 hover:text-text disabled:opacity-50"
        >
          <Paperclip className="h-3.5 w-3.5" />
          Adjuntar propuesta
        </button>
        <button
          type="button"
          disabled={!draft.active}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg bg-text px-3 text-[11px] font-semibold text-white disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          Enviar con IA
        </button>
      </div>
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/CoWriteToggle.tsx
````typescript
// ZENDESK_COWRITE_TOGGLE_V1

import { PenLine } from "lucide-react";

interface Props {
  active: boolean;
  onToggle: () => void;
}

export default function CoWriteToggle({ active, onToggle }: Props) {
  const statusCls = active ? "text-green" : "text-text-3";
  const trackCls = active ? "bg-green" : "bg-border-strong";
  const knobCls = active ? "left-[18px]" : "left-0.5";
  return (
    <div className="flex items-center gap-2">
      <PenLine className="h-4 w-4 text-purple" />
      <span className="text-xs font-bold text-text">Co-escritura IA</span>
      <span className={"ml-1 text-[10px] font-bold " + statusCls}>
        {active ? "Activa" : "Inactiva"}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        onClick={onToggle}
        className={"ml-auto relative h-5 w-9 shrink-0 rounded-full transition-colors " + trackCls}
      >
        <span className={"absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all " + knobCls} />
      </button>
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/CustomerHeader.tsx
````typescript
// ZENDESK_CUSTOMER_V1

import { MoreHorizontal } from "lucide-react";
import TicketAvatar from "./TicketAvatar.tsx";
import { formatLtv } from "../format.ts";
import type { ZendeskCustomer } from "../types.ts";

interface Props {
  customer: ZendeskCustomer;
}

export default function CustomerHeader({ customer }: Props) {
  return (
    <div className="border-b border-border-soft px-5 py-4">
      <div className="flex items-start gap-3">
        <TicketAvatar customer={customer} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-text">{customer.name}</h2>
            <span className="inline-flex shrink-0 items-center rounded-md bg-purple-soft px-1.5 py-0.5 text-[10px] font-bold text-purple">
              LTV {formatLtv(customer.ltv)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-text-2">
            {customer.company} - {customer.email}
          </p>
          <p className="mt-0.5 text-[11px] text-text-3">
            {customer.interactions} interacciones previas - Cliente desde {customer.customerSince}
          </p>
        </div>
        <button
          type="button"
          aria-label="Mas opciones"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-text-3 hover:bg-bg-soft hover:text-text"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/CustomerQuickActions.tsx
````typescript
// ZENDESK_QUICK_ACTIONS_V1

import { ExternalLink } from "lucide-react";

export default function CustomerQuickActions() {
  return (
    <div className="flex gap-2 border-b border-border-soft px-5 py-3">
      <button
        type="button"
        className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-text px-3 text-[11px] font-semibold text-white"
      >
        Ver en HubSpot
        <ExternalLink className="h-3 w-3" />
      </button>
      <button
        type="button"
        className="inline-flex h-8 flex-1 items-center justify-center rounded-lg border border-border bg-bg-card px-3 text-[11px] font-semibold text-text"
      >
        Holded
      </button>
      <button
        type="button"
        className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-green/15 px-3 text-[11px] font-semibold text-green"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-green" />
        En CRM
      </button>
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/EmptyState.tsx
````typescript
// ZENDESK_EMPTY_V1

import type { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      {icon && <span className="text-text-3">{icon}</span>}
      <p className="text-sm font-medium text-text">{title}</p>
      {subtitle && <p className="text-xs text-text-3">{subtitle}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/IconButton.tsx
````typescript
// ZENDESK_ICON_BTN_V1

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "default" | "ghost" | "primary";
type Size = "sm" | "md";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  label: string;
}

const base = "inline-grid place-items-center rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const variants: Record<Variant, string> = {
  default: "border border-border bg-bg-card text-text-2 hover:text-text hover:bg-bg-soft",
  ghost: "border border-transparent text-text-2 hover:text-text hover:bg-bg-soft",
  primary: "border border-text bg-text text-white hover:opacity-90",
};
const sizes: Record<Size, string> = { sm: "h-7 w-7", md: "h-9 w-9" };

export default function IconButton({ variant = "default", size = "md", children, label, className = "", ...rest }: Props) {
  return (
    <button type="button" aria-label={label} title={label} className={base + " " + variants[variant] + " " + sizes[size] + " " + className} {...rest}>
      {children}
    </button>
  );
}
````

## File: workspaces/14-zendesk/components/InsightChips.tsx
````typescript
// ZENDESK_INSIGHT_CHIPS_V1

interface Props {
  chips: string[];
}

export default function InsightChips({ chips }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <span
          key={c}
          className="inline-flex items-center rounded-md border border-border bg-bg-soft px-2 py-0.5 text-[10px] font-medium text-text-2"
        >
          {c}
        </span>
      ))}
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/InsightIntent.tsx
````typescript
// ZENDESK_INSIGHT_INTENT_V1

interface Props {
  intent: string;
}

export default function InsightIntent({ intent }: Props) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-3">Intencion</p>
      <p className="mt-1 text-sm text-text">{intent}</p>
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/InsightUrgencyNextStep.tsx
````typescript
// ZENDESK_INSIGHT_URGENCY_V1

import type { UrgencyLevel } from "../types.ts";

const URGENCY_TONE = {
  ALTA: "text-warn-text",
  Media: "text-text-2",
  Baja: "text-text-3",
};

interface Props {
  urgency: UrgencyLevel;
  urgencyReason: string;
  nextStep: string;
}

export default function InsightUrgencyNextStep({ urgency, urgencyReason, nextStep }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-3">Urgencia</p>
        <p className={"mt-1 text-sm font-bold " + URGENCY_TONE[urgency]}>{urgency}</p>
        <p className="mt-0.5 text-[11px] text-text-3">{urgencyReason}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-3">Proximo paso</p>
        <p className="mt-1 text-sm text-text">{nextStep}</p>
      </div>
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/LeadBadge.tsx
````typescript
// ZENDESK_LEAD_V1

export default function LeadBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-text px-1.5 py-0.5 text-[10px] font-bold text-white">
      Lead IA
    </span>
  );
}
````

## File: workspaces/14-zendesk/components/NewTicketButton.tsx
````typescript
// ZENDESK_NEW_BTN_V1

import { Plus } from "lucide-react";

interface Props {
  label?: string;
  onClick?: () => void;
}

export default function NewTicketButton({ label = "Nuevo email", onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-4 mt-3 flex h-11 w-[calc(100%-32px)] items-center justify-center gap-2 rounded-xl bg-text px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}
````

## File: workspaces/14-zendesk/components/SidebarNavItem.tsx
````typescript
// ZENDESK_SIDEBAR_NAV_V1

import { Bot, Brain, CheckCircle2, FileText, Folder, Inbox, MessageSquare, Star, Users } from "lucide-react";
import type { SidebarNavEntry } from "../types.ts";

const ICONS = {
  chat: MessageSquare,
  tasks: CheckCircle2,
  documents: FileText,
  projects: Folder,
  knowledge: Brain,
  team: Users,
  agents: Bot,
  inbox: Inbox,
  starred: Star,
};

interface Props {
  entry: SidebarNavEntry;
  onSelect?: (id: string) => void;
}

export default function SidebarNavItem({ entry, onSelect }: Props) {
  const Icon = ICONS[entry.icon];
  const active = entry.active === true;
  const cls = active
    ? "bg-bg-card font-medium text-text shadow-sm"
    : "text-text-2 hover:bg-bg-card/60 hover:text-text";
  return (
    <button
      type="button"
      onClick={() => onSelect && onSelect(entry.id)}
      aria-current={active ? "page" : undefined}
      className={"flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors " + cls}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{entry.label}</span>
      {entry.badge !== undefined && (
        <span className="rounded-full bg-bg-card px-1.5 py-0.5 text-[10px] font-semibold text-text-3">
          {entry.badge}
        </span>
      )}
    </button>
  );
}
````

## File: workspaces/14-zendesk/components/SidebarSearch.tsx
````typescript
// ZENDESK_SIDEBAR_SEARCH_V1

import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SidebarSearch({ value, onChange, placeholder = "Buscar o preguntar..." }: Props) {
  return (
    <label className="relative mx-4 mt-3 block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-3" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-xl border border-border bg-bg-card pl-9 pr-3 text-xs text-text outline-none placeholder:text-text-3 focus-visible:border-purple"
      />
    </label>
  );
}
````

## File: workspaces/14-zendesk/components/SidebarSection.tsx
````typescript
// ZENDESK_SIDEBAR_SECTION_V1

import type { ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
}

export default function SidebarSection({ label, children }: Props) {
  return (
    <section className="mt-5">
      <h3 className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-text-3">{label}</h3>
      <div className="flex flex-col gap-0.5 px-2">{children}</div>
    </section>
  );
}
````

## File: workspaces/14-zendesk/components/TicketAvatar.tsx
````typescript
// ZENDESK_AVATAR_V1

import Avatar from "./Avatar.tsx";
import { colorFromCompany } from "../format.ts";
import type { ZendeskCustomer } from "../types.ts";

interface Props {
  customer: ZendeskCustomer;
  size?: number;
}

export default function TicketAvatar({ customer, size = 40 }: Props) {
  return <Avatar initials={customer.avatarInitials} color={colorFromCompany(customer.company)} size={size} />;
}
````

## File: workspaces/14-zendesk/components/TicketChips.tsx
````typescript
// ZENDESK_CHIPS_V1

import type { TicketInsight } from "../types.ts";

const TONES = {
  purple: "bg-purple-soft text-purple",
  warn: "bg-warn text-warn-text",
  green: "bg-green/15 text-green",
  info: "bg-info text-info-text",
};

interface Props {
  insights: TicketInsight[];
}

export default function TicketChips({ insights }: Props) {
  if (insights.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {insights.slice(0, 2).map((i) => (
        <span key={i.id} className={"inline-block max-w-full truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium " + TONES[i.tone]}>
          {i.text}
        </span>
      ))}
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/TicketDetailPanel.tsx
````typescript
// ZENDESK_DETAIL_PANEL_V1

import { Inbox } from "lucide-react";
import CustomerHeader from "./CustomerHeader.tsx";
import CustomerQuickActions from "./CustomerQuickActions.tsx";
import TicketInsightCard from "./TicketInsightCard.tsx";
import CoWritePanel from "./CoWritePanel.tsx";
import EmptyState from "./EmptyState.tsx";
import type { CoWriteDraft, ZendeskTicket } from "../types.ts";

interface Props {
  ticket: ZendeskTicket | null;
  coWrite: CoWriteDraft | null;
  onGenerateReply: () => void;
  onToggleCoWrite: () => void;
  onSetCoWriteBody: (body: string) => void;
}

export default function TicketDetailPanel({
  ticket,
  coWrite,
  onGenerateReply,
  onToggleCoWrite,
  onSetCoWriteBody,
}: Props) {
  if (!ticket) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="zd-workspace__scroll">
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="Sin ticket seleccionado"
            subtitle="Elige un ticket de la lista para ver el detalle."
          />
        </div>
      </div>
    );
  }

  const chips: string[] = [ticket.customer.companyType, ticket.category];
  if (ticket.isLead) chips.push("Lead IA");
  chips.push("LTV " + ticket.customer.ltv.toLocaleString("es-ES"));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CustomerHeader customer={ticket.customer} />
      <CustomerQuickActions />
      <div className="zd-workspace__scroll">
        {ticket.intelligence && <TicketInsightCard intelligence={ticket.intelligence} chips={chips} />}
        <CoWritePanel
          draft={coWrite}
          onGenerate={onGenerateReply}
          onToggle={onToggleCoWrite}
          onSetBody={onSetCoWriteBody}
        />
      </div>
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/TicketFilterPill.tsx
````typescript
// ZENDESK_FILTER_PILL_V1

interface Props {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

export default function TicketFilterPill({ label, count, active, onClick }: Props) {
  const cls = active
    ? "border-text bg-text text-white"
    : "border-border bg-bg-card text-text-2 hover:text-text";
  const countCls = active ? "bg-white/20 text-white" : "bg-bg-soft text-text-3";
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={"inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-medium transition-colors " + cls}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className={"rounded-full px-1.5 text-[10px] " + countCls}>{count}</span>
      )}
    </button>
  );
}
````

## File: workspaces/14-zendesk/components/TicketInsightCard.tsx
````typescript
// ZENDESK_INSIGHT_CARD_V1

import { Sparkles } from "lucide-react";
import InsightIntent from "./InsightIntent.tsx";
import InsightUrgencyNextStep from "./InsightUrgencyNextStep.tsx";
import InsightChips from "./InsightChips.tsx";
import type { TicketIntelligence } from "../types.ts";

interface Props {
  intelligence: TicketIntelligence;
  chips: string[];
}

export default function TicketInsightCard({ intelligence, chips }: Props) {
  const confidence = Math.round(intelligence.confidence * 100);
  return (
    <div className="mx-5 mt-4 rounded-2xl border border-purple/40 bg-purple-soft/50 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple" />
        <span className="text-xs font-bold text-purple">Resumen IA</span>
        <span className="ml-1 inline-flex items-center rounded-md bg-bg-card px-1.5 py-0.5 text-[10px] font-semibold text-text-2">
          {confidence}% confianza
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-green/15 px-2 py-0.5 text-[10px] font-semibold text-green">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          En vivo
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <InsightIntent intent={intelligence.intent} />
        <InsightUrgencyNextStep
          urgency={intelligence.urgency}
          urgencyReason={intelligence.urgencyReason}
          nextStep={intelligence.nextStep}
        />
        <InsightChips chips={chips} />
      </div>
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/TicketList.tsx
````typescript
// ZENDESK_TICKET_LIST_V1

import { Inbox } from "lucide-react";
import TicketListItem from "./TicketListItem.tsx";
import EmptyState from "./EmptyState.tsx";
import type { TicketId, ZendeskTicket } from "../types.ts";

interface Props {
  tickets: ZendeskTicket[];
  activeTicketId: TicketId | null;
  selectedIds: Set<TicketId>;
  starredIds: Set<TicketId>;
  onSelect: (id: TicketId) => void;
  onToggleSelected: (id: TicketId) => void;
  onToggleStar: (id: TicketId) => void;
}

export default function TicketList({ tickets, activeTicketId, selectedIds, starredIds, onSelect, onToggleSelected, onToggleStar }: Props) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="h-6 w-6" />}
        title="No hay tickets"
        subtitle="Prueba a cambiar el filtro o el termino de busqueda."
      />
    );
  }
  return (
    <div className="flex flex-col">
      {tickets.map((t) => (
        <TicketListItem
          key={t.id}
          ticket={t}
          active={t.id === activeTicketId}
          selected={selectedIds.has(t.id)}
          starred={starredIds.has(t.id)}
          onSelect={() => onSelect(t.id)}
          onToggleSelected={() => onToggleSelected(t.id)}
          onToggleStar={() => onToggleStar(t.id)}
        />
      ))}
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/TicketListActions.tsx
````typescript
// ZENDESK_LIST_ACTIONS_V1

import { Archive, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  total: number;
  pageStart: number;
  pageEnd: number;
  onArchive: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function TicketListActions({ total, pageStart, pageEnd, onArchive, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center gap-2 border-b border-border-soft px-4 py-2">
      <label className="flex items-center gap-2 text-xs text-text-2">
        <input type="checkbox" className="h-3.5 w-3.5 cursor-pointer rounded border-border" />
        Seleccionar
      </label>
      <button
        type="button"
        onClick={onArchive}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-card px-2.5 py-1.5 text-xs text-text-2 hover:text-text"
      >
        <Archive className="h-3.5 w-3.5" />
        Archivar IA
      </button>
      <div className="ml-auto flex items-center gap-3 text-xs text-text-3">
        <span>
          {pageStart}-{pageEnd} de {total}
        </span>
        <button
          type="button"
          onClick={onPrev}
          aria-label="Anterior"
          className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-bg-card text-text-3 hover:text-text"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Siguiente"
          className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-bg-card text-text-3 hover:text-text"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/TicketListHeader.tsx
````typescript
// ZENDESK_LIST_HEADER_V1

import { Search, Sparkles } from "lucide-react";
import TicketFilterPill from "./TicketFilterPill.tsx";
import TicketListActions from "./TicketListActions.tsx";
import type { TicketFilter } from "../types.ts";

interface Props {
  query: string;
  onSetQuery: (q: string) => void;
  activeFilter: TicketFilter;
  onSetFilter: (f: TicketFilter) => void;
  counts: { principal: number; prioridad: number; promos: number };
  total: number;
  pageStart: number;
  pageEnd: number;
}

export default function TicketListHeader({
  query,
  onSetQuery,
  activeFilter,
  onSetFilter,
  counts,
  total,
  pageStart,
  pageEnd,
}: Props) {
  return (
    <div className="shrink-0 border-b border-border-soft bg-bg-card">
      <div className="flex items-center gap-2 px-4 pt-4">
        <label className="relative block flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
          <input
            type="search"
            value={query}
            onChange={(e) => onSetQuery(e.target.value)}
            placeholder="Buscar tickets, clientes..."
            className="h-10 w-full rounded-xl border border-border bg-bg-soft pl-10 pr-3 text-sm text-text outline-none placeholder:text-text-3 focus-visible:border-purple"
          />
        </label>
        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-purple bg-purple-soft px-3 text-xs font-semibold text-purple"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Clasificar con IA
        </button>
        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center rounded-xl border border-border bg-bg-card px-3 text-xs font-medium text-text-2 hover:text-text"
        >
          Resumir bandeja
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto px-4 pt-3">
        <TicketFilterPill
          label="Principal"
          active={activeFilter === "principal"}
          onClick={() => onSetFilter("principal")}
        />
        <TicketFilterPill
          label="Prioridad IA"
          count={counts.prioridad}
          active={activeFilter === "prioridad"}
          onClick={() => onSetFilter("prioridad")}
        />
        <TicketFilterPill
          label="Promociones"
          count={counts.promos}
          active={activeFilter === "promos"}
          onClick={() => onSetFilter("promos")}
        />
      </div>

      <div className="pt-2">
        <TicketListActions
          total={total}
          pageStart={pageStart}
          pageEnd={pageEnd}
          onArchive={() => undefined}
          onPrev={() => undefined}
          onNext={() => undefined}
        />
      </div>
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/TicketListItem.tsx
````typescript
// ZENDESK_TICKET_ITEM_V1

import { Star } from "lucide-react";
import TicketAvatar from "./TicketAvatar.tsx";
import LeadBadge from "./LeadBadge.tsx";
import TicketChips from "./TicketChips.tsx";
import { formatTicketDate } from "../format.ts";
import type { ZendeskTicket } from "../types.ts";

interface Props {
  ticket: ZendeskTicket;
  active: boolean;
  selected: boolean;
  starred: boolean;
  onSelect: () => void;
  onToggleSelected: () => void;
  onToggleStar: () => void;
}

export default function TicketListItem({ ticket, active, selected, starred, onSelect, onToggleSelected, onToggleStar }: Props) {
  const articleCls = active ? "bg-bg-soft" : "hover:bg-bg-soft/60";
  const starCls = starred ? "fill-warn-text text-warn-text" : "text-text-3";
  const insights = ticket.intelligence ? ticket.intelligence.insights : [];
  return (
    <article
      onClick={onSelect}
      className={"group cursor-pointer border-b border-border-soft px-4 py-3 transition-colors " + articleCls}
    >
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 flex-col items-center gap-1.5 pt-0.5">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelected}
            onClick={(e) => e.stopPropagation()}
            className="h-3.5 w-3.5 cursor-pointer rounded border-border"
            aria-label="Seleccionar ticket"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
            aria-label={starred ? "Quitar destacado" : "Destacar"}
            className="grid h-4 w-4 place-items-center"
          >
            <Star className={"h-3.5 w-3.5 " + starCls} />
          </button>
        </div>

        <TicketAvatar customer={ticket.customer} size={36} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-text">{ticket.customer.name}</span>
            <span className="truncate text-xs text-text-3">{ticket.customer.company}</span>
            <span className="ml-1 inline-flex shrink-0 items-center rounded-md border border-border bg-bg-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-text-2">
              {ticket.customer.companyType}
            </span>
            <span className="inline-flex shrink-0 items-center rounded-md border border-border bg-bg-card px-1.5 py-0.5 text-[9px] font-bold text-text-2">
              {ticket.category}
            </span>
            {ticket.isLead && (
              <span className="ml-1 shrink-0">
                <LeadBadge />
              </span>
            )}
            <span className="ml-auto shrink-0 text-[11px] text-text-3">
              {formatTicketDate(ticket.updatedAt)}
            </span>
          </div>

          <p className="mt-1 truncate text-sm font-medium text-text">{ticket.subject}</p>
          <p className="mt-0.5 truncate text-xs text-text-2">{ticket.preview}</p>

          {insights.length > 0 && (
            <div className="mt-1.5">
              <TicketChips insights={insights} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
````

## File: workspaces/14-zendesk/components/TicketListPanel.tsx
````typescript
// ZENDESK_LIST_PANEL_V1

import TicketListHeader from "./TicketListHeader.tsx";
import TicketList from "./TicketList.tsx";
import type { TicketFilter, TicketId, ZendeskTicket } from "../types.ts";

interface Props {
  tickets: ZendeskTicket[];
  activeFilter: TicketFilter;
  activeTicketId: TicketId | null;
  selectedIds: Set<TicketId>;
  starredIds: Set<TicketId>;
  query: string;
  loading: boolean;
  error: string | null;
  onSetFilter: (f: TicketFilter) => void;
  onSetQuery: (q: string) => void;
  onSelect: (id: TicketId) => void;
  onToggleSelected: (id: TicketId) => void;
  onToggleStar: (id: TicketId) => void;
}

export default function TicketListPanel({
  tickets,
  activeFilter,
  activeTicketId,
  selectedIds,
  starredIds,
  query,
  loading,
  error,
  onSetFilter,
  onSetQuery,
  onSelect,
  onToggleSelected,
  onToggleStar,
}: Props) {
  const prioridad = tickets.filter((t) => t.priority === "high" || t.priority === "urgent").length;
  const promos = tickets.filter((t) => t.category === "Presupuesto").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TicketListHeader
        query={query}
        onSetQuery={onSetQuery}
        activeFilter={activeFilter}
        onSetFilter={onSetFilter}
        counts={{ principal: tickets.length, prioridad, promos }}
        total={tickets.length}
        pageStart={1}
        pageEnd={Math.min(50, tickets.length)}
      />
      <div className="zd-workspace__scroll">
        {error && (
          <div className="m-4 rounded-lg border border-warn-border bg-warn px-3 py-2 text-xs text-warn-text">
            {error}
          </div>
        )}
        {loading ? (
          <div className="p-6 text-center text-xs text-text-3">Cargando...</div>
        ) : (
          <TicketList
            tickets={tickets}
            activeTicketId={activeTicketId}
            selectedIds={selectedIds}
            starredIds={starredIds}
            onSelect={onSelect}
            onToggleSelected={onToggleSelected}
            onToggleStar={onToggleStar}
          />
        )}
      </div>
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/WorkspaceBrand.tsx
````typescript
// ZENDESK_BRAND_V1

import { MoreHorizontal } from "lucide-react";

export default function WorkspaceBrand() {
  return (
    <div className="flex items-center gap-2.5 px-4 pb-2 pt-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-text text-[11px] font-bold text-white">A</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-text">Agente IA Pro</div>
        <div className="inline-flex items-center rounded-md bg-purple-soft px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-purple">PRO</div>
      </div>
      <button type="button" aria-label="Mas opciones" className="grid h-7 w-7 place-items-center rounded-lg text-text-3 hover:bg-bg-soft hover:text-text">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/ZendeskSidebar.tsx
````typescript
// ZENDESK_SIDEBAR_V1

import { useState } from "react";
import WorkspaceBrand from "./WorkspaceBrand.tsx";
import AgentStatusPill from "./AgentStatusPill.tsx";
import NewTicketButton from "./NewTicketButton.tsx";
import SidebarSearch from "./SidebarSearch.tsx";
import SidebarSection from "./SidebarSection.tsx";
import SidebarNavItem from "./SidebarNavItem.tsx";
import type { SidebarNavEntry } from "../types.ts";

const WORKSPACE: SidebarNavEntry[] = [
  { id: "chat", label: "Chat", icon: "chat" },
  { id: "tasks", label: "Tareas", icon: "tasks", badge: 8 },
  { id: "documents", label: "Documentos", icon: "documents" },
  { id: "projects", label: "Proyectos", icon: "projects" },
  { id: "knowledge", label: "Lo que sabe de tu negocio", icon: "knowledge", active: true },
  { id: "team", label: "Equipo", icon: "team" },
  { id: "agents", label: "Agentes", icon: "agents", badge: 3 },
];

const EMAILS: SidebarNavEntry[] = [
  { id: "inbox", label: "Recibidos", icon: "inbox", badge: 124 },
  { id: "starred", label: "Destacados", icon: "starred", badge: 12 },
];

export default function ZendeskSidebar() {
  const [query, setQuery] = useState("");
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0">
        <WorkspaceBrand />
        <AgentStatusPill />
        <NewTicketButton />
        <SidebarSearch value={query} onChange={setQuery} />
      </div>
      <div className="zd-workspace__scroll">
        <SidebarSection label="Workspace">
          {WORKSPACE.map((entry) => (
            <SidebarNavItem key={entry.id} entry={entry} />
          ))}
        </SidebarSection>
        <SidebarSection label="Emails">
          {EMAILS.map((entry) => (
            <SidebarNavItem key={entry.id} entry={entry} />
          ))}
        </SidebarSection>
      </div>
    </div>
  );
}
````

## File: workspaces/14-zendesk/components/ZendeskWorkspace.tsx
````typescript
// ZENDESK_WORKSPACE_V1

import "../ZendeskWorkspace.css";
import { useZendesk } from "../hooks/useZendesk.ts";
import ZendeskSidebar from "./ZendeskSidebar.tsx";
import TicketListPanel from "./TicketListPanel.tsx";
import TicketDetailPanel from "./TicketDetailPanel.tsx";

export default function ZendeskWorkspace() {
  const zd = useZendesk();

  return (
    <div className="zd-workspace">
      <div className="zd-workspace__col zd-workspace__col--sidebar">
        <ZendeskSidebar />
      </div>
      <div className="zd-workspace__col zd-workspace__col--list">
        <TicketListPanel
          tickets={zd.filteredTickets}
          activeFilter={zd.activeFilter}
          activeTicketId={zd.activeTicketId}
          selectedIds={zd.selectedIds}
          starredIds={zd.starredIds}
          query={zd.query}
          loading={zd.loading}
          error={zd.error}
          onSetFilter={zd.setFilter}
          onSetQuery={zd.setQuery}
          onSelect={zd.selectTicket}
          onToggleSelected={zd.toggleSelected}
          onToggleStar={zd.toggleStar}
        />
      </div>
      <div className="zd-workspace__col zd-workspace__col--detail">
        <TicketDetailPanel
          ticket={zd.activeTicket}
          coWrite={zd.coWrite}
          onGenerateReply={zd.generateReply}
          onToggleCoWrite={zd.toggleCoWrite}
          onSetCoWriteBody={zd.setCoWriteBody}
        />
      </div>
    </div>
  );
}
````

## File: workspaces/14-zendesk/docs/01-ui-map.md
````markdown
# UI Map — Atencion al cliente y tickets

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/14-zendesk/docs/02-roadmap.md
````markdown
# Roadmap — Atencion al cliente y tickets

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/14-zendesk/docs/03-spec.md
````markdown
<!-- ZENDESK_UI_SPEC_V1 -->
# Spec funcional - 14-zendesk

> Estado: vivo. Se actualiza mientras se construye.
> Referencia: backend en packages/workspaces/14-zendesk/.
> Mockup: Agntia Tickets Os (3 columnas).

---

## 1. Objetivo

Cliente de tickets de soporte en 3 columnas. Sidebar de navegacion,
lista de tickets con inteligencia IA por fila, y panel contextual
con resumen IA y co-escritura de respuestas.

Clona el mockup Agntia Tickets Os, adaptado a la paleta real del repo
y a las 7 capabilities del backend de zendesk.

---

## 2. Backend real (packages/workspaces/14-zendesk/)

### Capabilities (7)

| id | kind | risk | requiresApproval |
|---|---|---|---|
| ticket.create | action | low | false |
| ticket.assign | action | low | false |
| ticket.escalate | action | low | false |
| ticket.resolve | action | low | true |
| ticket.reopen | action | low | false |
| ticket.list | query | low | false |
| ticket.read | query | low | false |

### Commands (5)

- ticket.create
- ticket.assign
- ticket.escalate
- ticket.resolve
- ticket.reopen

### Queries (2)

- ticket.list
- ticket.read

### Entidades (5)

- SupportTicket: subject, requester, assignee, priority, status, type, tags, channel, slaId, firstResponseAt, solvedAt
- TicketComment: author, authorKind, body, isInternal, attachments
- SLA: policy, metric, dueAt, breached
- Resolution: summary, rootCause, actions, satisfactionScore
- Macro: title, actions, active

---

## 3. Capa IA (nueva, no esta en el backend)

El mockup exige una capa IA que el backend no declara como entidades.
Se anade como tipos UI. Cuando se conecte al backend real, la servira
un endpoint nuevo que aun no existe.

Tipos UI anadidos:

- TicketIntelligence: summary, intent, urgency, urgencyReason,
  nextStep, confidence, insights
- TicketInsight: id, text, tone (purple | warn | green | info)
- CoWriteDraft: templateName, recipient, body, active

En el mock se rellenan a mano. En produccion los servira un endpoint
de inteligencia que consume el LLM.

---

## 4. Las 3 columnas

### Columna 1 - Sidebar (240px)

Navegacion global del workspace. Marca, estado del agente, boton de
nuevo ticket, buscador, seccion WORKSPACE (Chat, Tareas, Documentos,
Proyectos, Lo que sabe de tu negocio, Equipo, Agentes) y seccion
EMAILS (Recibidos, Destacados).

### Columna 2 - Lista de tickets (flex)

Cabecera con buscador, pills IA (Clasificar con IA, Resumir bandeja),
filtros primarios (Principal, Prioridad IA, Promociones) y barra de
acciones (Seleccionar, Archivar IA, paginacion).

Lista scrollable. Cada fila: checkbox, estrella, avatar, nombre,
empresa, tag de tipo, badge Lead IA si aplica, hora, asunto en
negrita, preview, chips IA.

### Columna 3 - Panel contextual IA (380px)

Cabecera del cliente (avatar, nombre, LTV, email, meta). Botones
rapidos (Ver en HubSpot, Holded, En CRM). Card Resumen IA con
intencion, urgencia, proximo paso y confianza. Panel de co-escritura
con toggle, selector de plantilla, editor y botones de accion.

---

## 5. Estados

- Empty: sin tickets en la lista activa.
- Loading: skeleton mientras carga.
- Error: fallo de red o del backend.
- Selected: ticket activo con panel contextual abierto.
- Composing: modal o panel de nuevo ticket abierto.
- CoWriting: borrador IA activo en el panel derecho.

---

## 6. Paleta real del repo

Del tailwind.config.js:

- Fondos: bg, bg-card, bg-soft, bg-softer
- Bordes: border, border-soft, border-strong
- Texto: text, text-2, text-3, text-4
- Acento: purple, purple-soft
- Estado: green, orange, warn, warn-border, warn-text, info, info-border, info-text

Mapeo del codigo bruto a la paleta real:

| Inventada en el mockup | Real en el repo |
|---|---|
| bg-[#E9E7FF] | bg-purple-soft |
| text-[#6C5CD6] | text-purple |
| bg-[#FEF3C7] | bg-warn |
| text-[#92400E] | text-warn-text |
| bg-canvas | bg-bg-card |
| bg-surface | bg-bg-soft |
| border-line | border-border |
| text-ink | text-text |
| text-muted | text-text-2 |
| bg-accent | bg-purple |
| text-accent | text-purple |
| bg-online | bg-green |

Colores dinamicos (avatar de empresa): se aplican por style={{}}
con hash del nombre. Nunca bg-[#hex] en clases Tailwind.

---

## 7. Decisiones tomadas

- Montaje: Opcion B (excepcion en WorkspaceShell). Diferido. No se toca
  WorkspaceShell.tsx en esta iteracion. index.ts exporta el contenedor
  y el montaje se decide en 04-handoff-v2.md.
- Componentes: en subcarpetas dentro de components/ (sidebar/, list/,
  detail/, shared/) para no tener 26 ficheros en plano. El 02-whatsapp
  los tiene en plano, pero con 11. Aqui son 26 y en plano es
  intrackeable.
- Capa IA: tipos UI en types.ts, no entidades backend.
- Paleta: real del repo, cero invenciones. Colores dinamicos por style.
- Sin dark mode. Sin fuentes ajenas. Instrument Sans.
- Imports con extension .ts / .tsx.

---

## 8. Fuera de scope

- Conectar al backend real. El api.ts es mock.
- Servir vistas desde el backend (VIEWS esta vacio).
- Montar en el shell. Va al handoff v2.
- Traducciones. Todo en castellano como el resto del repo.

---

FIN DEL SPEC.
````

## File: workspaces/14-zendesk/docs/04-handoff-v2.md
````markdown
<!-- ZENDESK_HANDOFF_V2 -->
# Handoff v2 - workspace 14-zendesk

> Para la siguiente IA. Autocontenido.
> Rama: feat/web-zendesk-workspace-ui
> Estado: ficheros creados, pendiente montaje.

---

## 1. Estado actual

El workspace 14-zendesk esta implementado. Tiene 30 ficheros:

- 5 raiz (README, index, types, format, ZendeskWorkspace.css)
- 1 api.ts
- 1 hook (useZendesk.ts)
- 26 componentes en components/ (en plano, sin subcarpetas)
- 4 docs (01-ui-map, 02-roadmap, 03-spec vacios + este handoff)

NO esta montado. No hay excepcion en WorkspaceShell.tsx.

---

## 2. Que falta

### Tarea 1 - Verificar typecheck

Ejecutar en la raiz del repo:

pnpm --filter @openmuse/web exec tsc --noEmit

Si hay errores, arreglarlos uno a uno.

### Tarea 2 - Montar (Opcion B)

Antes de tocar nada, ver estos dos ficheros:

- apps/web/src/workspaces/WorkspaceShell.tsx
- apps/web/src/App.tsx

Anadir excepcion en WorkspaceShell.tsx: si workspaceId es zendesk,
montar ZendeskWorkspace en vez de ViewRenderer.
Marca sugerida: WORKSPACE_SHELL_ZENDESK_MOUNT_V1.

### Tarea 3 - Conectar al backend real

Hoy api.ts es mock. Para conectar:

- Sustituir api.ts por fetch a /api/workspaces/zendesk/tickets.
- El endpoint no existe todavia, hay que crearlo en apps/server.
- Los queries ticket.list y ticket.read ya existen en packages/workspaces/14-zendesk.

### Tarea 4 - Endpoint de inteligencia

TicketIntelligence y TicketInsight son tipos UI, no vienen del backend.

Para servirlos en produccion:

- Crear endpoint /api/workspaces/zendesk/tickets/:id/intelligence.
- El endpoint consume el LLM y devuelve resumen, urgencia, next step, etc.

---

## 3. Ficheros globales que la siguiente IA debe ver

Antes de tocar 14-zendesk, leer:

- apps/web/src/workspaces/registry.ts
- apps/web/src/workspaces/WorkspaceShell.tsx
- apps/web/src/App.tsx
- apps/web/src/main.tsx
- apps/web/src/index.css
- apps/web/tailwind.config.js

Y el 02-whatsapp como referencia:

- apps/web/src/workspaces/02-whatsapp/README.md
- apps/web/src/workspaces/02-whatsapp/hooks/useChatWorkspace.ts

---

## 4. Convenciones de patchset

Un patchset = un fichero. Idempotente por marca. UTF-8 sin BOM.
Sin && ni ;. Un comando por linea. git add selectivo por fichero.

---

## 5. Trampas conocidas

- Paleta real del repo, no inventar. bg-canvas NO existe.
- Sin dark mode.
- Fuente Instrument Sans.
- Imports con extension .ts / .tsx.
- pnpm typecheck corre tambien el worker. Filtrar errores.
- components/ va en plano, no en subcarpetas.

---

## 6. Definicion de terminado

- pnpm --filter @openmuse/web exec tsc --noEmit verde.
- El workspace se ve en el navegador (montado por Opcion B).
- README.md con mapa completo.
- docs/04-handoff-v2.md (este fichero).
- git status --short limpio.

---

FIN DEL HANDOFF V2.
````

## File: workspaces/14-zendesk/hooks/.gitkeep
````

````

## File: workspaces/14-zendesk/hooks/useZendesk.ts
````typescript
// ZENDESK_HOOK_V1

import { useCallback, useEffect, useMemo, useState } from "react";
import { generateCoWriteReply, getCoWriteDraft, listTickets } from "../api.ts";
import type { CoWriteDraft, TicketFilter, TicketId, ZendeskTicket } from "../types.ts";

export interface ZendeskState {
  tickets: ZendeskTicket[];
  filteredTickets: ZendeskTicket[];
  activeFilter: TicketFilter;
  activeTicketId: TicketId | null;
  activeTicket: ZendeskTicket | null;
  selectedIds: Set<TicketId>;
  starredIds: Set<TicketId>;
  query: string;
  coWrite: CoWriteDraft | null;
  loading: boolean;
  error: string | null;
  setFilter: (f: TicketFilter) => void;
  setQuery: (q: string) => void;
  selectTicket: (id: TicketId) => void;
  toggleSelected: (id: TicketId) => void;
  toggleStar: (id: TicketId) => void;
  clearSelection: () => void;
  generateReply: () => Promise<void>;
  toggleCoWrite: () => void;
  setCoWriteBody: (body: string) => void;
}

export function useZendesk(): ZendeskState {
  const [tickets, setTickets] = useState<ZendeskTicket[]>([]);
  const [activeFilter, setActiveFilter] = useState<TicketFilter>("principal");
  const [activeTicketId, setActiveTicketId] = useState<TicketId | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<TicketId>>(new Set());
  const [starredIds, setStarredIds] = useState<Set<TicketId>>(new Set(["1", "3"]));
  const [query, setQuery] = useState("");
  const [coWrite, setCoWrite] = useState<CoWriteDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listTickets(activeFilter)
      .then((list) => {
        if (cancelled) return;
        setTickets(list);
        setActiveTicketId((prev) => prev ?? list[0]?.id ?? null);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error cargando tickets");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeFilter]);

  const activeTicket = useMemo(
    () => tickets.find((t) => t.id === activeTicketId) ?? null,
    [tickets, activeTicketId],
  );

  useEffect(() => {
    if (!activeTicketId) {
      setCoWrite(null);
      return;
    }
    let cancelled = false;
    getCoWriteDraft(activeTicketId)
      .then((draft) => {
        if (cancelled) return;
        setCoWrite(draft);
      })
      .catch(() => {
        if (!cancelled) setCoWrite(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTicketId]);

  const filteredTickets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter((t) => {
      const haystack = (t.subject + " " + t.preview + " " + t.customer.name + " " + t.customer.company).toLowerCase();
      return haystack.includes(q);
    });
  }, [tickets, query]);

  const selectTicket = useCallback((id: TicketId) => setActiveTicketId(id), []);
  const setFilter = useCallback((f: TicketFilter) => setActiveFilter(f), []);

  const toggleSelected = useCallback((id: TicketId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleStar = useCallback((id: TicketId) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const generateReply = useCallback(async () => {
    if (!activeTicketId) return;
    const draft = await generateCoWriteReply(activeTicketId);
    setCoWrite(draft);
  }, [activeTicketId]);

  const toggleCoWrite = useCallback(() => {
    setCoWrite((prev) => (prev ? { ...prev, active: !prev.active } : prev));
  }, []);

  const setCoWriteBody = useCallback((body: string) => {
    setCoWrite((prev) => (prev ? { ...prev, body } : prev));
  }, []);

  return {
    tickets,
    filteredTickets,
    activeFilter,
    activeTicketId,
    activeTicket,
    selectedIds,
    starredIds,
    query,
    coWrite,
    loading,
    error,
    setFilter,
    setQuery,
    selectTicket,
    toggleSelected,
    toggleStar,
    clearSelection,
    generateReply,
    toggleCoWrite,
    setCoWriteBody,
  };
}
````

## File: workspaces/14-zendesk/api.ts
````typescript
// ZENDESK_API_V1

import type { CoWriteDraft, TicketFilter, TicketId, ZendeskTicket } from "./types.ts";
import { initialsOf } from "./format.ts";

const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

interface CustomerInput {
  id: string;
  name: string;
  email: string;
  company: string;
  companyType: "PYME" | "AUTONOMO" | "EMPRESA";
  ltv: number;
  interactions: number;
  customerSince: string;
}

function buildCustomer(input: CustomerInput) {
  return {
    id: input.id,
    name: input.name,
    email: input.email,
    company: input.company,
    companyType: input.companyType,
    ltv: input.ltv,
    interactions: input.interactions,
    customerSince: input.customerSince,
    avatarInitials: initialsOf(input.name),
  };
}

const TICKETS: ZendeskTicket[] = [
  {
    id: "1",
    subject: "Solicitud presupuesto automatizacion ate...",
    preview: "Hola, somos una PYME de 8 empleados saturada por WhatsApp...",
    customer: buildCustomer({ id: "c1", name: "Marta Soler", email: "marta@soluclimpieza.es", company: "Soluciones Limpieza SL", companyType: "PYME", ltv: 4200, interactions: 2, customerSince: "Mar 2023" }),
    status: "new",
    priority: "high",
    category: "Presupuesto",
    tags: ["PYME", "Presupuesto", "Lead IA"],
    createdAt: minutesAgo(30),
    updatedAt: minutesAgo(3),
    unread: true,
    starred: true,
    isLead: true,
    intelligence: {
      summary: "Solicitar presupuesto y demo de agente WhatsApp + Holded",
      intent: "Solicitar presupuesto y demo de agente WhatsApp + Holded",
      urgency: "ALTA",
      urgencyReason: "equipo desbordado 60 msgs/dia",
      nextStep: "Enviar propuesta con 3 planes + agendar demo 30min",
      confidence: 0.94,
      insights: [
        { id: "i1", text: "PYME de 8 empleados saturada por WhatsApp...", tone: "purple" },
        { id: "i2", text: "LTV 4.200 EUR, 2 interacciones previas", tone: "info" },
      ],
    },
  },
  {
    id: "2",
    subject: "Factura 234 no sincroniza con Holded",
    preview: "Buenos dias, tengo 20 facturas al mes y la ultima no aparece...",
    customer: buildCustomer({ id: "c2", name: "Carlos Ruiz", email: "carlos@ruizfontaneria.es", company: "Ruiz Fontaneria", companyType: "AUTONOMO", ltv: 890, interactions: 5, customerSince: "Ene 2023" }),
    status: "open",
    priority: "high",
    category: "Reclamacion",
    tags: ["AUTONOMO", "Reclamacion"],
    createdAt: minutesAgo(50),
    updatedAt: minutesAgo(20),
    unread: true,
    starred: false,
    isLead: false,
    intelligence: {
      summary: "Resolver incidencia sincronizacion Holded",
      intent: "Resolver incidencia sincronizacion Holded",
      urgency: "ALTA",
      urgencyReason: "no puede facturar, cliente final esperando",
      nextStep: "Escalar a soporte tecnico + plantilla incidencia",
      confidence: 0.88,
      insights: [{ id: "i1", text: "Autonomo 20 facturas/mes, bloqueo facturacion", tone: "warn" }],
    },
  },
  {
    id: "3",
    subject: "Duda formacion agentes IA para equipo",
    preview: "Quisiera formar a mi equipo de 4 en el uso de AGNTia para presu...",
    customer: buildCustomer({ id: "c3", name: "Laura Mendez", email: "laura@mendez-arquitectura.es", company: "Mendez Arquitectura", companyType: "PYME", ltv: 2100, interactions: 3, customerSince: "Jun 2023" }),
    status: "open",
    priority: "normal",
    category: "Formacion",
    tags: ["PYME", "Formacion", "Lead IA"],
    createdAt: minutesAgo(120),
    updatedAt: minutesAgo(75),
    unread: true,
    starred: true,
    isLead: true,
    intelligence: {
      summary: "Formacion de equipo interno en AGNTia",
      intent: "Formacion de equipo interno en AGNTia",
      urgency: "Media",
      urgencyReason: "planificacion anual, sin urgencia inmediata",
      nextStep: "Proponer pack de formacion 4 empleados",
      confidence: 0.82,
      insights: [{ id: "i1", text: "PYME 4 empleados, objecion precio formacion", tone: "purple" }],
    },
  },
  {
    id: "4",
    subject: "Automatizar seguimiento obras por WhatsApp",
    preview: "Llevamos 15 obras simultaneas y perdemos info por WhatsApp...",
    customer: buildCustomer({ id: "c4", name: "Javier Gil", email: "javier@gilreformas.es", company: "Gil Reformas", companyType: "PYME", ltv: 3200, interactions: 1, customerSince: "Sep 2023" }),
    status: "new",
    priority: "normal",
    category: "Presupuesto",
    tags: ["PYME", "Presupuesto", "Lead IA"],
    createdAt: minutesAgo(180),
    updatedAt: minutesAgo(150),
    unread: false,
    starred: false,
    isLead: true,
    intelligence: {
      summary: "Automatizar seguimiento de obras via WhatsApp",
      intent: "Automatizar seguimiento de obras via WhatsApp",
      urgency: "Media",
      urgencyReason: "perdida de informacion operativa",
      nextStep: "Demo del modulo WhatsApp + integracion con Holded",
      confidence: 0.79,
      insights: [{ id: "i1", text: "15 obras, perdida info WhatsApp", tone: "purple" }],
    },
  },
  {
    id: "5",
    subject: "El bot no responde fuera de horario",
    preview: "Hemos configurado horario pero el bot sigue respondiendo...",
    customer: buildCustomer({ id: "c5", name: "Ana Torres", email: "ana@clinicatorres.es", company: "Clinica Torres", companyType: "EMPRESA", ltv: 1800, interactions: 4, customerSince: "Nov 2022" }),
    status: "pending",
    priority: "normal",
    category: "Soporte",
    tags: ["EMPRESA", "Soporte"],
    createdAt: minutesAgo(60 * 26),
    updatedAt: minutesAgo(60 * 24),
    unread: false,
    starred: false,
    isLead: false,
    intelligence: {
      summary: "Configuracion horaria del bot",
      intent: "Configuracion horaria del bot",
      urgency: "Media",
      urgencyReason: "afecta a atencion al paciente",
      nextStep: "Revisar regla horaria en panel de configuracion",
      confidence: 0.86,
      insights: [{ id: "i1", text: "Configuracion horaria bot fallando", tone: "green" }],
    },
  },
  {
    id: "6",
    subject: "Precio para autonomo con Holded",
    preview: "Soy autonomo, teneis plan especial? Uso Holded y WhatsApp...",
    customer: buildCustomer({ id: "c6", name: "Roberto Diaz", email: "roberto@diazelectricidad.es", company: "Diaz Electricidad", companyType: "AUTONOMO", ltv: 640, interactions: 2, customerSince: "Feb 2024" }),
    status: "new",
    priority: "low",
    category: "Presupuesto",
    tags: ["AUTONOMO", "Presupuesto", "Lead IA"],
    createdAt: minutesAgo(60 * 30),
    updatedAt: minutesAgo(60 * 28),
    unread: false,
    starred: false,
    isLead: true,
    intelligence: {
      summary: "Precio especial para autonomo con Holded",
      intent: "Precio especial para autonomo con Holded",
      urgency: "Baja",
      urgencyReason: "consulta inicial, sin urgencia",
      nextStep: "Enviar tarifa autonomo + comparar con Holded",
      confidence: 0.72,
      insights: [{ id: "i1", text: "Autonomo, objecion precio, compara", tone: "warn" }],
    },
  },
  {
    id: "7",
    subject: "Reclamacion cobro duplicado",
    preview: "Me habeis cobrado dos veces este mes, adjunto justificantes...",
    customer: buildCustomer({ id: "c7", name: "Sofia Navarro", email: "sofia@navarrol-legal.es", company: "Navarro Legal", companyType: "PYME", ltv: 2400, interactions: 6, customerSince: "Ago 2023" }),
    status: "open",
    priority: "high",
    category: "Reclamacion",
    tags: ["PYME", "Reclamacion"],
    createdAt: minutesAgo(60 * 32),
    updatedAt: minutesAgo(60 * 30),
    unread: false,
    starred: false,
    isLead: false,
    intelligence: {
      summary: "Reclamacion por cobro duplicado",
      intent: "Reclamacion por cobro duplicado",
      urgency: "ALTA",
      urgencyReason: "riesgo de churn, cliente activo con historial",
      nextStep: "Verificar cargo + emitir reembolso + email disculpa",
      confidence: 0.91,
      insights: [{ id: "i1", text: "Cobro duplicado, riesgo churn", tone: "warn" }],
    },
  },
  {
    id: "8",
    subject: "Demo para 25 usuarios",
    preview: "Necesitamos demo para direccion y equipo comercial (25 person...",
    customer: buildCustomer({ id: "c8", name: "Miguel Pons", email: "miguel@ponsconstrucciones.es", company: "Pons Construcciones", companyType: "EMPRESA", ltv: 12000, interactions: 3, customerSince: "Abr 2022" }),
    status: "new",
    priority: "urgent",
    category: "Presupuesto",
    tags: ["EMPRESA", "Presupuesto", "Lead IA"],
    createdAt: minutesAgo(60 * 50),
    updatedAt: minutesAgo(60 * 48),
    unread: false,
    starred: false,
    isLead: true,
    intelligence: {
      summary: "Demo comercial para 25 usuarios",
      intent: "Demo comercial para 25 usuarios",
      urgency: "ALTA",
      urgencyReason: "deal grande, decision inminente",
      nextStep: "Agendar demo direccion + enviar propuesta enterprise",
      confidence: 0.88,
      insights: [{ id: "i1", text: "Empresa 25 usuarios, deal grande", tone: "purple" }],
    },
  },
];

const CONTEXTS: Record<string, CoWriteDraft> = {
  "1": {
    templateName: "plantilla ACME v2",
    recipient: "Marta",
    body: "Hola Marta!\n\nGracias por escribirnos! He revisado vuestra situacion y creo que el agente de WhatsApp + Holded encaja perfectamente.\n\nTe propongo una demo de 30 minutos y una propuesta con 3 planes (basico, medio y premium). Cuando te viene bien esta semana?\n\nUn saludo.",
    active: true,
  },
};

const wait = <T>(value: T, ms = 120) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

export async function listTickets(filter: TicketFilter = "principal"): Promise<ZendeskTicket[]> {
  let out = [...TICKETS];
  if (filter === "prioridad") out = out.filter((t) => t.priority === "high" || t.priority === "urgent");
  if (filter === "promos") out = out.filter((t) => t.category === "Presupuesto");
  return wait(out);
}

export async function getTicket(id: TicketId): Promise<ZendeskTicket | null> {
  return wait(TICKETS.find((t) => t.id === id) ?? null);
}

export async function getCoWriteDraft(id: TicketId): Promise<CoWriteDraft | null> {
  return wait(CONTEXTS[id] ?? null);
}

export async function generateCoWriteReply(id: TicketId): Promise<CoWriteDraft> {
  const t = TICKETS.find((x) => x.id === id);
  const firstName = t ? t.customer.name.split(" ")[0] : "cliente";
  return wait({
    templateName: "plantilla ACME v2",
    recipient: firstName,
    body: "Hola " + firstName + "!\n\nGracias por escribirnos. He revisado tu caso y te propongo una demo de 30 minutos.\n\nCuando te viene bien?",
    active: true,
  }, 400);
}

export async function createTicket(input: { subject: string; body: string }): Promise<void> {
  void input;
  return wait(undefined, 200);
}

export async function assignTicket(id: TicketId, userId: string): Promise<void> {
  void id;
  void userId;
  return wait(undefined, 150);
}

export async function escalateTicket(id: TicketId): Promise<void> {
  void id;
  return wait(undefined, 150);
}

export async function resolveTicket(id: TicketId): Promise<void> {
  void id;
  return wait(undefined, 150);
}

export async function reopenTicket(id: TicketId): Promise<void> {
  void id;
  return wait(undefined, 150);
}
````

## File: workspaces/14-zendesk/format.ts
````typescript
// ZENDESK_FORMAT_V1

const PALETTE = [
  { bg: "#E9E7FF", fg: "#6C5CD6" },
  { bg: "#FEF3C7", fg: "#92400E" },
  { bg: "#DCFCE7", fg: "#166534" },
  { bg: "#DBEAFE", fg: "#1E40AF" },
  { bg: "#FCE7F3", fg: "#9D174D" },
  { bg: "#E0F2FE", fg: "#075985" },
  { bg: "#FEE2E2", fg: "#991B1B" },
  { bg: "#F3E8FF", fg: "#6B21A8" },
];

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function colorFromCompany(company: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < company.length; i += 1) {
    hash = (hash * 31 + company.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function formatLtv(amount: number): string {
  return "EUR " + amount.toLocaleString("es-ES");
}

export function formatTicketDate(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (days < 7) return d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "");
}

export function formatRelative(iso: string, now = Date.now()): string {
  const ms = now - new Date(iso).getTime();
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return "hace " + Math.floor(ms / 60000) + " min";
  if (ms < 86400000) return "hace " + Math.floor(ms / 3600000) + " h";
  return "hace " + Math.floor(ms / 86400000) + " d";
}
````

## File: workspaces/14-zendesk/index.ts
````typescript
// ZENDESK_WORKSPACE_INDEX_V2

export { default as ZendeskWorkspace } from "./components/ZendeskWorkspace.tsx";

export const zendeskWorkspaceUi = {
  id: "zendesk",
  slug: "14-zendesk",
  family: "comunicacion",
  status: "implemented",
};
````

## File: workspaces/14-zendesk/README.md
````markdown
<!-- ZENDESK_UI_MAP_V1 -->
# 14-zendesk - Tickets de soporte

- **Estado:** implementado
- **Referencia:** Zendesk
- **Familia:** comunicacion
- **Mockup:** Agntia Tickets Os (3 columnas)

## Objetivo

Cliente de tickets de soporte en 3 columnas. Sidebar de navegacion,
lista de tickets con inteligencia IA por fila, y panel contextual
con resumen IA y co-escritura de respuestas.

## Estructura

```
14-zendesk/
  README.md                     este fichero
  index.ts                      ZENDESK_WORKSPACE_INDEX_V2
  types.ts                      ZENDESK_TYPES_V1
  format.ts                     ZENDESK_FORMAT_V1
  ZendeskWorkspace.css          ZENDESK_UI_CSS_V1
  api.ts                        ZENDESK_API_V1
  hooks/
    useZendesk.ts               ZENDESK_HOOK_V1
  components/
    ZendeskWorkspace.tsx        ZENDESK_WORKSPACE_V1
    ZendeskSidebar.tsx          ZENDESK_SIDEBAR_V1
    WorkspaceBrand.tsx          ZENDESK_BRAND_V1
    AgentStatusPill.tsx         ZENDESK_STATUS_V1
    NewTicketButton.tsx         ZENDESK_NEW_BTN_V1
    SidebarSearch.tsx           ZENDESK_SIDEBAR_SEARCH_V1
    SidebarSection.tsx          ZENDESK_SIDEBAR_SECTION_V1
    SidebarNavItem.tsx          ZENDESK_SIDEBAR_NAV_V1
    TicketListPanel.tsx         ZENDESK_LIST_PANEL_V1
    TicketListHeader.tsx        ZENDESK_LIST_HEADER_V1
    TicketListActions.tsx       ZENDESK_LIST_ACTIONS_V1
    TicketList.tsx              ZENDESK_TICKET_LIST_V1
    TicketListItem.tsx          ZENDESK_TICKET_ITEM_V1
    TicketFilterPill.tsx        ZENDESK_FILTER_PILL_V1
    TicketAvatar.tsx            ZENDESK_AVATAR_V1
    LeadBadge.tsx               ZENDESK_LEAD_V1
    TicketChips.tsx             ZENDESK_CHIPS_V1
    TicketDetailPanel.tsx       ZENDESK_DETAIL_PANEL_V1
    CustomerHeader.tsx          ZENDESK_CUSTOMER_V1
    CustomerQuickActions.tsx    ZENDESK_QUICK_ACTIONS_V1
    TicketInsightCard.tsx       ZENDESK_INSIGHT_CARD_V1
    InsightIntent.tsx           ZENDESK_INSIGHT_INTENT_V1
    InsightUrgencyNextStep.tsx  ZENDESK_INSIGHT_URGENCY_V1
    InsightChips.tsx            ZENDESK_INSIGHT_CHIPS_V1
    CoWritePanel.tsx            ZENDESK_COWRITE_PANEL_V1
    CoWriteToggle.tsx           ZENDESK_COWRITE_TOGGLE_V1
    CoWriteEditor.tsx           ZENDESK_COWRITE_EDITOR_V1
    IconButton.tsx              ZENDESK_ICON_BTN_V1
    Avatar.tsx                  ZENDESK_SHARED_AVATAR_V1
    EmptyState.tsx              ZENDESK_EMPTY_V1
  docs/
    01-ui-map.md
    02-roadmap.md
    03-spec.md
```

## Mapa de componentes

### Sidebar (columna 1)

| Fichero | Responsabilidad |
|---|---|
| WorkspaceBrand.tsx | Marca "Agente IA Pro" + boton PRO |
| AgentStatusPill.tsx | Pill verde "Agente activo ACME" |
| NewTicketButton.tsx | Boton negro "Nuevo email" |
| SidebarSearch.tsx | Buscador de la sidebar |
| SidebarSection.tsx | Seccion con label (WORKSPACE, EMAILS) |
| SidebarNavItem.tsx | Item de navegacion con icono y badge |
| ZendeskSidebar.tsx | Contenedor de la columna 1 |

### Lista (columna 2)

| Fichero | Responsabilidad |
|---|---|
| TicketListPanel.tsx | Contenedor de la columna 2 |
| TicketListHeader.tsx | Buscador + pills IA + filtros |
| TicketListActions.tsx | Seleccionar + Archivar + paginacion |
| TicketList.tsx | Lista scrollable de tickets |
| TicketListItem.tsx | Fila de ticket completa |
| TicketFilterPill.tsx | Pill de filtro con contador |
| TicketAvatar.tsx | Avatar con iniciales + color por empresa |
| LeadBadge.tsx | Badge negro "Lead IA" |
| TicketChips.tsx | Chips IA con tono por insight |

### Panel detalle (columna 3)

| Fichero | Responsabilidad |
|---|---|
| TicketDetailPanel.tsx | Contenedor de la columna 3 |
| CustomerHeader.tsx | Avatar + nombre + LTV + meta del cliente |
| CustomerQuickActions.tsx | Botones HubSpot / Holded / CRM |
| TicketInsightCard.tsx | Card morada con resumen IA |
| InsightIntent.tsx | Seccion "Intencion" |
| InsightUrgencyNextStep.tsx | Grid Urgencia + Proximo paso |
| InsightChips.tsx | Chips finales del card |
| CoWritePanel.tsx | Panel completo de co-escritura |
| CoWriteToggle.tsx | Switch on/off co-escritura |
| CoWriteEditor.tsx | Textarea del borrador IA |

### Compartidos

| Fichero | Responsabilidad |
|---|---|
| IconButton.tsx | Boton de icono (default/ghost/primary) |
| Avatar.tsx | Avatar generico |
| EmptyState.tsx | Estado vacio reutilizable |

## Tipos (types.ts)

- ZendeskCustomer, ZendeskTicket
- TicketIntelligence, TicketInsight
- CoWriteDraft
- SidebarNavEntry
- TicketStatus, TicketPriority, TicketCategory
- CompanyType, InsightTone, UrgencyLevel, TicketFilter

## Estado compartido (hooks/useZendesk.ts)

Expone: tickets, filteredTickets, activeFilter, activeTicketId,
activeTicket, selectedIds, starredIds, query, coWrite, loading, error.

Acciones: setFilter, setQuery, selectTicket, toggleSelected,
toggleStar, clearSelection, generateReply, toggleCoWrite, setCoWriteBody.

## Datos (api.ts)

Mock en memoria con 8 tickets del mockup. Firmas de la API real:
listTickets, getTicket, getCoWriteDraft, generateCoWriteReply,
createTicket, assignTicket, escalateTicket, resolveTicket, reopenTicket.

## Capa IA (no viene del backend)

TicketIntelligence, TicketInsight y CoWriteDraft son tipos UI.
El backend de zendesk no los declara. Cuando se conecte al backend
real, los servira un endpoint nuevo.

## Montaje

Pendiente. Opcion B (excepcion en WorkspaceShell). Ver docs/04-handoff-v2.md.

## Pendientes conocidos

- Montar en WorkspaceShell (Opcion B).
- Conectar al backend real (sustituir api.ts por fetch).
- Endpoint de inteligencia para la capa IA.
````

## File: workspaces/14-zendesk/types.ts
````typescript
// ZENDESK_TYPES_V1

export type TicketId = string;
export type CustomerId = string;

export type TicketStatus = "new" | "open" | "pending" | "hold" | "solved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketCategory = "Presupuesto" | "Reclamacion" | "Formacion" | "Soporte" | "Otro";
export type CompanyType = "PYME" | "AUTONOMO" | "EMPRESA";
export type InsightTone = "purple" | "warn" | "green" | "info";
export type UrgencyLevel = "Baja" | "Media" | "ALTA";
export type TicketFilter = "principal" | "prioridad" | "promos";

export interface ZendeskCustomer {
  id: CustomerId;
  name: string;
  email: string;
  company: string;
  companyType: CompanyType;
  ltv: number;
  interactions: number;
  customerSince: string;
  avatarInitials: string;
}

export interface TicketInsight {
  id: string;
  text: string;
  tone: InsightTone;
}

export interface TicketIntelligence {
  summary: string;
  intent: string;
  urgency: UrgencyLevel;
  urgencyReason: string;
  nextStep: string;
  confidence: number;
  insights: TicketInsight[];
}

export interface ZendeskTicket {
  id: TicketId;
  subject: string;
  preview: string;
  customer: ZendeskCustomer;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  unread: boolean;
  starred: boolean;
  isLead: boolean;
  intelligence?: TicketIntelligence;
}

export interface CoWriteDraft {
  templateName: string;
  recipient: string;
  body: string;
  active: boolean;
}

export interface SidebarNavEntry {
  id: string;
  label: string;
  icon: "chat" | "tasks" | "documents" | "projects" | "knowledge" | "team" | "agents" | "inbox" | "starred";
  badge?: number;
  active?: boolean;
}
````

## File: workspaces/14-zendesk/ZendeskWorkspace.css
````css
/* ZENDESK_UI_CSS_V1 */

.zd-workspace {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 380px;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--v2-bg);
}

.zd-workspace__col {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.zd-workspace__col--sidebar {
  border-right: 1px solid var(--v2-border);
  background: var(--v2-bg-soft);
}

.zd-workspace__col--list {
  background: var(--v2-bg-card);
}

.zd-workspace__col--detail {
  border-left: 1px solid var(--v2-border);
  background: var(--v2-bg-softer);
}

.zd-workspace__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

@media (max-width: 1100px) {
  .zd-workspace {
    grid-template-columns: 220px minmax(0, 1fr);
  }
  .zd-workspace__col--detail {
    display: none;
  }
}

@media (max-width: 760px) {
  .zd-workspace {
    grid-template-columns: minmax(0, 1fr);
  }
  .zd-workspace__col--sidebar {
    display: none;
  }
}
````

## File: workspaces/15-docusign/components/.gitkeep
````

````

## File: workspaces/15-docusign/docs/01-ui-map.md
````markdown
# UI Map — Contratos y firma electronica

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/15-docusign/docs/02-roadmap.md
````markdown
# Roadmap — Contratos y firma electronica

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/15-docusign/docs/03-spec.md
````markdown
# Spec de UI — Contratos y firma electronica

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/15-docusign/hooks/.gitkeep
````

````

## File: workspaces/15-docusign/index.ts
````typescript
// 15-docusign — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: DocuSign
export const docusignWorkspaceUi = {
  id: "docusign",
  slug: "15-docusign",
  family: "documentos",
  status: "scaffold",
};
````

## File: workspaces/15-docusign/README.md
````markdown
# 15-docusign — Contratos y firma electronica (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/16-n8n/components/.gitkeep
````

````

## File: workspaces/16-n8n/docs/01-ui-map.md
````markdown
# UI Map — Automatizaciones visuales

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/16-n8n/docs/02-roadmap.md
````markdown
# Roadmap — Automatizaciones visuales

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/16-n8n/docs/03-spec.md
````markdown
# Spec de UI — Automatizaciones visuales

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/16-n8n/hooks/.gitkeep
````

````

## File: workspaces/16-n8n/index.ts
````typescript
// 16-n8n — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: n8n
export const n8nWorkspaceUi = {
  id: "n8n",
  slug: "16-n8n",
  family: "trabajo",
  status: "scaffold",
};
````

## File: workspaces/16-n8n/README.md
````markdown
# 16-n8n — Automatizaciones visuales (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/17-process-street/components/.gitkeep
````

````

## File: workspaces/17-process-street/docs/01-ui-map.md
````markdown
# UI Map — Procedimientos y documentacion

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/17-process-street/docs/02-roadmap.md
````markdown
# Roadmap — Procedimientos y documentacion

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/17-process-street/docs/03-spec.md
````markdown
# Spec de UI — Procedimientos y documentacion

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/17-process-street/hooks/.gitkeep
````

````

## File: workspaces/17-process-street/index.ts
````typescript
// 17-process-street — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Process Street
export const process_streetWorkspaceUi = {
  id: "process-street",
  slug: "17-process-street",
  family: "trabajo",
  status: "scaffold",
};
````

## File: workspaces/17-process-street/README.md
````markdown
# 17-process-street — Procedimientos y documentacion (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/18-factorial/components/.gitkeep
````

````

## File: workspaces/18-factorial/docs/01-ui-map.md
````markdown
# UI Map — Recursos humanos

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/18-factorial/docs/02-roadmap.md
````markdown
# Roadmap — Recursos humanos

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/18-factorial/docs/03-spec.md
````markdown
# Spec de UI — Recursos humanos

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/18-factorial/hooks/.gitkeep
````

````

## File: workspaces/18-factorial/index.ts
````typescript
// 18-factorial — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Factorial
export const factorialWorkspaceUi = {
  id: "factorial",
  slug: "18-factorial",
  family: "personas",
  status: "scaffold",
};
````

## File: workspaces/18-factorial/README.md
````markdown
# 18-factorial — Recursos humanos (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/19-personio/components/.gitkeep
````

````

## File: workspaces/19-personio/docs/01-ui-map.md
````markdown
# UI Map — Seleccion y candidatos

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/19-personio/docs/02-roadmap.md
````markdown
# Roadmap — Seleccion y candidatos

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/19-personio/docs/03-spec.md
````markdown
# Spec de UI — Seleccion y candidatos

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/19-personio/hooks/.gitkeep
````

````

## File: workspaces/19-personio/index.ts
````typescript
// 19-personio — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Personio
export const personioWorkspaceUi = {
  id: "personio",
  slug: "19-personio",
  family: "personas",
  status: "scaffold",
};
````

## File: workspaces/19-personio/README.md
````markdown
# 19-personio — Seleccion y candidatos (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/20-ramp/components/.gitkeep
````

````

## File: workspaces/20-ramp/docs/01-ui-map.md
````markdown
# UI Map — Compras y gestion de gastos

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/20-ramp/docs/02-roadmap.md
````markdown
# Roadmap — Compras y gestion de gastos

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/20-ramp/docs/03-spec.md
````markdown
# Spec de UI — Compras y gestion de gastos

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/20-ramp/hooks/.gitkeep
````

````

## File: workspaces/20-ramp/index.ts
````typescript
// 20-ramp — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Ramp
export const rampWorkspaceUi = {
  id: "ramp",
  slug: "20-ramp",
  family: "finanzas",
  status: "scaffold",
};
````

## File: workspaces/20-ramp/README.md
````markdown
# 20-ramp — Compras y gestion de gastos (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/21-stripe/components/.gitkeep
````

````

## File: workspaces/21-stripe/docs/01-ui-map.md
````markdown
# UI Map — Analitica y dashboards

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/21-stripe/docs/02-roadmap.md
````markdown
# Roadmap — Analitica y dashboards

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/21-stripe/docs/03-spec.md
````markdown
# Spec de UI — Analitica y dashboards

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/21-stripe/hooks/.gitkeep
````

````

## File: workspaces/21-stripe/index.ts
````typescript
// 21-stripe — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Stripe Dashboard
export const stripeWorkspaceUi = {
  id: "stripe",
  slug: "21-stripe",
  family: "finanzas",
  status: "scaffold",
};
````

## File: workspaces/21-stripe/README.md
````markdown
# 21-stripe — Analitica y dashboards (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/22-canva/components/.gitkeep
````

````

## File: workspaces/22-canva/docs/01-ui-map.md
````markdown
# UI Map — Diseno y creacion de contenido

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/22-canva/docs/02-roadmap.md
````markdown
# Roadmap — Diseno y creacion de contenido

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/22-canva/docs/03-spec.md
````markdown
# Spec de UI — Diseno y creacion de contenido

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/22-canva/hooks/.gitkeep
````

````

## File: workspaces/22-canva/index.ts
````typescript
// 22-canva — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Canva
export const canvaWorkspaceUi = {
  id: "canva",
  slug: "22-canva",
  family: "documentos",
  status: "scaffold",
};
````

## File: workspaces/22-canva/README.md
````markdown
# 22-canva — Diseno y creacion de contenido (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/23-buffer/components/.gitkeep
````

````

## File: workspaces/23-buffer/docs/01-ui-map.md
````markdown
# UI Map — Redes sociales y publicacion

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/23-buffer/docs/02-roadmap.md
````markdown
# Roadmap — Redes sociales y publicacion

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/23-buffer/docs/03-spec.md
````markdown
# Spec de UI — Redes sociales y publicacion

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/23-buffer/hooks/.gitkeep
````

````

## File: workspaces/23-buffer/index.ts
````typescript
// 23-buffer — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Buffer
export const bufferWorkspaceUi = {
  id: "buffer",
  slug: "23-buffer",
  family: "comunicacion",
  status: "scaffold",
};
````

## File: workspaces/23-buffer/README.md
````markdown
# 23-buffer — Redes sociales y publicacion (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/24-shopify/components/.gitkeep
````

````

## File: workspaces/24-shopify/docs/01-ui-map.md
````markdown
# UI Map — Comercio electronico y pedidos

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/24-shopify/docs/02-roadmap.md
````markdown
# Roadmap — Comercio electronico y pedidos

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/24-shopify/docs/03-spec.md
````markdown
# Spec de UI — Comercio electronico y pedidos

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/24-shopify/hooks/.gitkeep
````

````

## File: workspaces/24-shopify/index.ts
````typescript
// 24-shopify — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Shopify
export const shopifyWorkspaceUi = {
  id: "shopify",
  slug: "24-shopify",
  family: "finanzas",
  status: "scaffold",
};
````

## File: workspaces/24-shopify/README.md
````markdown
# 24-shopify — Comercio electronico y pedidos (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/25-intercom/components/.gitkeep
````

````

## File: workspaces/25-intercom/docs/01-ui-map.md
````markdown
# UI Map — Atencion posventa y exito del cliente

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/25-intercom/docs/02-roadmap.md
````markdown
# Roadmap — Atencion posventa y exito del cliente

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/25-intercom/docs/03-spec.md
````markdown
# Spec de UI — Atencion posventa y exito del cliente

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/25-intercom/hooks/.gitkeep
````

````

## File: workspaces/25-intercom/index.ts
````typescript
// 25-intercom — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Intercom
export const intercomWorkspaceUi = {
  id: "intercom",
  slug: "25-intercom",
  family: "comunicacion",
  status: "scaffold",
};
````

## File: workspaces/25-intercom/README.md
````markdown
# 25-intercom — Atencion posventa y exito del cliente (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/26-odoo-inventory/components/.gitkeep
````

````

## File: workspaces/26-odoo-inventory/docs/01-ui-map.md
````markdown
# UI Map — Inventario y almacen

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/26-odoo-inventory/docs/02-roadmap.md
````markdown
# Roadmap — Inventario y almacen

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/26-odoo-inventory/docs/03-spec.md
````markdown
# Spec de UI — Inventario y almacen

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/26-odoo-inventory/hooks/.gitkeep
````

````

## File: workspaces/26-odoo-inventory/index.ts
````typescript
// 26-odoo-inventory — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Odoo Inventory
export const odoo_inventoryWorkspaceUi = {
  id: "odoo-inventory",
  slug: "26-odoo-inventory",
  family: "operaciones",
  status: "scaffold",
};
````

## File: workspaces/26-odoo-inventory/README.md
````markdown
# 26-odoo-inventory — Inventario y almacen (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/27-maintainx/components/.gitkeep
````

````

## File: workspaces/27-maintainx/docs/01-ui-map.md
````markdown
# UI Map — Activos y mantenimiento

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/27-maintainx/docs/02-roadmap.md
````markdown
# Roadmap — Activos y mantenimiento

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/27-maintainx/docs/03-spec.md
````markdown
# Spec de UI — Activos y mantenimiento

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/27-maintainx/hooks/.gitkeep
````

````

## File: workspaces/27-maintainx/index.ts
````typescript
// 27-maintainx — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: MaintainX
export const maintainxWorkspaceUi = {
  id: "maintainx",
  slug: "27-maintainx",
  family: "operaciones",
  status: "scaffold",
};
````

## File: workspaces/27-maintainx/README.md
````markdown
# 27-maintainx — Activos y mantenimiento (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/28-odoo-manufacturing/components/.gitkeep
````

````

## File: workspaces/28-odoo-manufacturing/docs/01-ui-map.md
````markdown
# UI Map — Produccion y ordenes de trabajo

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/28-odoo-manufacturing/docs/02-roadmap.md
````markdown
# Roadmap — Produccion y ordenes de trabajo

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/28-odoo-manufacturing/docs/03-spec.md
````markdown
# Spec de UI — Produccion y ordenes de trabajo

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/28-odoo-manufacturing/hooks/.gitkeep
````

````

## File: workspaces/28-odoo-manufacturing/index.ts
````typescript
// 28-odoo-manufacturing — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Odoo Manufacturing
export const odoo_manufacturingWorkspaceUi = {
  id: "odoo-manufacturing",
  slug: "28-odoo-manufacturing",
  family: "operaciones",
  status: "scaffold",
};
````

## File: workspaces/28-odoo-manufacturing/README.md
````markdown
# 28-odoo-manufacturing — Produccion y ordenes de trabajo (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/29-isms-online/components/.gitkeep
````

````

## File: workspaces/29-isms-online/docs/01-ui-map.md
````markdown
# UI Map — Cumplimiento y gestion de riesgos

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/29-isms-online/docs/02-roadmap.md
````markdown
# Roadmap — Cumplimiento y gestion de riesgos

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/29-isms-online/docs/03-spec.md
````markdown
# Spec de UI — Cumplimiento y gestion de riesgos

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/29-isms-online/hooks/.gitkeep
````

````

## File: workspaces/29-isms-online/index.ts
````typescript
// 29-isms-online — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: ISMS.online
export const isms_onlineWorkspaceUi = {
  id: "isms-online",
  slug: "29-isms-online",
  family: "gobierno",
  status: "scaffold",
};
````

## File: workspaces/29-isms-online/README.md
````markdown
# 29-isms-online — Cumplimiento y gestion de riesgos (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/30-microsoft-entra/components/.gitkeep
````

````

## File: workspaces/30-microsoft-entra/docs/01-ui-map.md
````markdown
# UI Map — Identidad, accesos y seguridad

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/30-microsoft-entra/docs/02-roadmap.md
````markdown
# Roadmap — Identidad, accesos y seguridad

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/30-microsoft-entra/docs/03-spec.md
````markdown
# Spec de UI — Identidad, accesos y seguridad

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/30-microsoft-entra/hooks/.gitkeep
````

````

## File: workspaces/30-microsoft-entra/index.ts
````typescript
// 30-microsoft-entra — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Microsoft Entra
export const microsoft_entraWorkspaceUi = {
  id: "microsoft-entra",
  slug: "30-microsoft-entra",
  family: "gobierno",
  status: "scaffold",
};
````

## File: workspaces/30-microsoft-entra/README.md
````markdown
# 30-microsoft-entra — Identidad, accesos y seguridad (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/31-suitedash/components/.gitkeep
````

````

## File: workspaces/31-suitedash/docs/01-ui-map.md
````markdown
# UI Map — Portal de clientes y proveedores

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/31-suitedash/docs/02-roadmap.md
````markdown
# Roadmap — Portal de clientes y proveedores

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/31-suitedash/docs/03-spec.md
````markdown
# Spec de UI — Portal de clientes y proveedores

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/31-suitedash/hooks/.gitkeep
````

````

## File: workspaces/31-suitedash/index.ts
````typescript
// 31-suitedash — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: SuiteDash
export const suitedashWorkspaceUi = {
  id: "suitedash",
  slug: "31-suitedash",
  family: "comunicacion",
  status: "scaffold",
};
````

## File: workspaces/31-suitedash/README.md
````markdown
# 31-suitedash — Portal de clientes y proveedores (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/32-notion/components/.gitkeep
````

````

## File: workspaces/32-notion/docs/01-ui-map.md
````markdown
# UI Map — Wiki y conocimiento interno

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/32-notion/docs/02-roadmap.md
````markdown
# Roadmap — Wiki y conocimiento interno

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/32-notion/docs/03-spec.md
````markdown
# Spec de UI — Wiki y conocimiento interno

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/32-notion/hooks/.gitkeep
````

````

## File: workspaces/32-notion/index.ts
````typescript
// 32-notion — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Notion
export const notionWorkspaceUi = {
  id: "notion",
  slug: "32-notion",
  family: "documentos",
  status: "scaffold",
};
````

## File: workspaces/32-notion/README.md
````markdown
# 32-notion — Wiki y conocimiento interno (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/33-langsmith/components/.gitkeep
````

````

## File: workspaces/33-langsmith/docs/01-ui-map.md
````markdown
# UI Map — Observabilidad de agentes

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/33-langsmith/docs/02-roadmap.md
````markdown
# Roadmap — Observabilidad de agentes

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/33-langsmith/docs/03-spec.md
````markdown
# Spec de UI — Observabilidad de agentes

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/33-langsmith/hooks/.gitkeep
````

````

## File: workspaces/33-langsmith/index.ts
````typescript
// 33-langsmith — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: LangSmith
export const langsmithWorkspaceUi = {
  id: "langsmith",
  slug: "33-langsmith",
  family: "gobierno",
  status: "scaffold",
};
````

## File: workspaces/33-langsmith/README.md
````markdown
# 33-langsmith — Observabilidad de agentes (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/34-trello/components/.gitkeep
````

````

## File: workspaces/34-trello/docs/01-ui-map.md
````markdown
# UI Map — Tableros Kanban

## Referencia visual
- **Mockup screenshot:** pendiente
- **Mockup codigo:** pendiente

## Componentes reutilizados de apps/web
| Componente existente | Uso en este workspace | Notas |
|---|---|---|
| | | |

## Componentes nuevos en este workspace
| Componente | Responsabilidad | Depende de |
|---|---|---|
| | | |

## Hooks reutilizados
| Hook existente | Uso |
|---|---|
| | |

## Hooks nuevos
| Hook | Responsabilidad |
|---|---|
| | |

## Vistas servidas
| Intent | Vista resultante | kind de WorkspaceSpec |
|---|---|---|
| | | |

## Estados
- **Vacio:** pendiente
- **Cargando:** pendiente
- **Error:** pendiente

## Panel derecho (contextual)
| Tab | Fuente | Query | Empty state |
|---|---|---|---|
| | | | |

## Notas de diseno
Pendiente.
````

## File: workspaces/34-trello/docs/02-roadmap.md
````markdown
# Roadmap — Tableros Kanban

## Fase 0 — Andamiaje
- [x] Carpeta creada
- [x] README, ui-map, roadmap, spec
- [ ] index.ts placeholder
- [ ] .gitkeep en components y hooks

## Fase 1 — Contratos
- [ ] Intents declaradas
- [ ] kinds de WorkspaceSpec confirmados
- [ ] Capacidades necesarias identificadas
- [ ] Eventos identificados

## Fase 2 — Componentes base
- [ ] Vista principal
- [ ] Estado vacio
- [ ] Estado de error
- [ ] Integracion con ViewRenderer

## Fase 3 — Interaccion
- [ ] Hooks de datos
- [ ] Acciones conectadas a capacidades
- [ ] Confirmaciones y feedback

## Fase 4 — Integracion con el puente
- [ ] intents registradas en el resolver
- [ ] Capacidades registradas en el registry
- [ ] Eventos registrados en el schema-registry

## Fase 5 — Verificacion
- [ ] Prueba de contrato visual
- [ ] Prueba manual documentada
- [ ] Estado integrated en MANIFEST.yaml

## Bloqueos conocidos
- Ninguno.

## Decisiones abiertas
- Ninguna.
````

## File: workspaces/34-trello/docs/03-spec.md
````markdown
# Spec de UI — Tableros Kanban

Pendiente. Se rellena cuando se analice el mockup correspondiente.

## Pantalla principal
- **Layout:** pendiente
- **Acciones:** pendiente
- **Estado vacio:** pendiente

## Pantallas secundarias
Pendiente.

## Interacciones clave
Pendiente.
````

## File: workspaces/34-trello/hooks/.gitkeep
````

````

## File: workspaces/34-trello/index.ts
````typescript
// 34-trello — punto de entrada del workspace en el frontend.
// Estado: scaffold. Pendiente implementar componentes y hooks.
// Referencia: Trello
export const trelloWorkspaceUi = {
  id: "trello",
  slug: "34-trello",
  family: "trabajo",
  status: "scaffold",
};
````

## File: workspaces/34-trello/README.md
````markdown
# 34-trello — Tableros Kanban (frontend)

- **Estado:** scaffold

## Componentes
Pendiente. Ver docs/01-ui-map.md

## Hooks
Pendiente.

## Vistas servidas
Pendiente. Ver docs/03-spec.md
````

## File: workspaces/35-centro-mando/components/ActiveProjectsPanel.tsx
````typescript
import type { Project } from '../types';
import { SectionHeader } from './SectionHeader';
import { ProjectProgressRow } from './ProjectProgressRow';
export function ActiveProjectsPanel({ projects, onReport }: { projects: Project[]; onReport: () => void }) {
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5">
      <SectionHeader title="Obras activas · health" actions={<><span className="text-[11px] px-2 py-1 rounded-full bg-[#F1F0FF]">{projects.length} obras</span><button onClick={onReport} className="text-[11px] h-7 px-3 rounded-full bg-[#111113] text-white">Generar reporte</button></>} />
      <div className="mt-5 space-y-4">
        {projects.map(o => <ProjectProgressRow key={o.name} o={o} />)}
      </div>
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/AgentPerformanceCard.tsx
````typescript
import type { Agent } from '../types';
import { ProgressBar } from './ProgressBar';
type Props = { a: Agent; onEdit: () => void; onLogs: () => void };
export function AgentPerformanceCard({ a, onEdit, onLogs }: Props) {
  const confCls = a.status === 'ok' ? 'bg-[#D1FAE5] text-emerald-700' : 'bg-[#FEF3C7] text-amber-700';
  return (
    <div className="rounded-[14px] border border-[var(--border)] p-3">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium">{a.name}</div>
        <div className={'text-[11px] px-2 py-0.5 rounded-full font-medium ' + confCls}>{a.conf}% confianza</div>
      </div>
      <div className="text-[11px] text-[var(--muted)] mt-1">{a.desc}</div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1"><ProgressBar pct={a.conf} /></div>
        <span className="text-[11px] text-[var(--muted)]">{a.tasks} tareas</span>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={onEdit} className="h-7 px-3 rounded-full bg-[#F8F7FF] border border-[var(--border)] text-[11px] font-medium">Editar agente</button>
        <button onClick={onLogs} className="h-7 px-3 rounded-full bg-[#111113] text-white text-[11px]">Ver logs</button>
      </div>
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/AgentsPerformancePanel.tsx
````typescript
import type { Agent } from '../types';
import { SectionHeader } from './SectionHeader';
import { AgentPerformanceCard } from './AgentPerformanceCard';
type Props = { agents: Agent[]; onEdit: (name: string) => void; onLogs: (name: string, conf: number) => void };
export function AgentsPerformancePanel({ agents, onEdit, onLogs }: Props) {
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5">
      <SectionHeader title="Agentes performance" actions={<span className="text-[10px] px-2 py-1 rounded-full bg-[#D1FAE5] text-emerald-700">{agents.length} activos</span>} />
      <div className="mt-5 space-y-4">
        {agents.map(a => (
          <AgentPerformanceCard key={a.name} a={a} onEdit={() => onEdit(a.name)} onLogs={() => onLogs(a.name, a.conf)} />
        ))}
      </div>
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/AiActionButton.tsx
````typescript
type Props = { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'dark' };
export function AiActionButton({ children, onClick, variant = 'dark' }: Props) {
  const cls = variant === 'primary' ? 'bg-[#6D5BFF] text-white hover:brightness-105' : variant === 'ghost' ? 'bg-white/10 text-white border border-white/10' : 'bg-[#111113] text-white hover:opacity-90';
  return <button onClick={onClick} className={'h-8 px-3 rounded-full text-[11px] font-medium ' + cls}>{children}</button>;
}
````

## File: workspaces/35-centro-mando/components/AiInsightsPanel.tsx
````typescript
import type { Insight } from '../types';
import { InsightCard } from './InsightCard';
type Props = { insights: Insight[]; onAction: (i: Insight) => void };
export function AiInsightsPanel({ insights, onAction }: Props) {
  return (
    <section className="rounded-[20px] bg-[#111113] text-white p-5 lg:p-6 border border-black relative overflow-hidden">
      <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-[#6D5BFF] opacity-30 blur-[36px]" />
      <div className="flex items-start gap-3 relative">
        <div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center text-[16px] shrink-0">✦</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-semibold">Insights IA auto-generados</h3>
            <span className="text-[10px] px-2 py-1 rounded-full bg-[#6D5BFF]">{insights.length} nuevos</span>
            <span className="text-[11px] text-white/60">Actualizado hace 12 min · Modelo AGNTia v4.2</span>
          </div>
          <div className="mt-3 grid md:grid-cols-3 gap-3">
            {insights.map(i => <InsightCard key={i.tag} i={i} onClick={() => onAction(i)} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
````

## File: workspaces/35-centro-mando/components/Avatar.tsx
````typescript
type Props = { label: string; size?: number; tone?: 'lav' | 'dark' };
export function Avatar({ label, size = 32, tone = 'lav' }: Props) {
  const bg = tone === 'dark' ? 'bg-[#111113] text-white' : 'bg-[#F1F0FF] text-[#6D5BFF]';
  return (
    <div className={'rounded-full grid place-items-center text-[11px] font-bold shrink-0 ' + bg} style={{ width: size, height: size }}>
      {label}
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/BlockedInvoiceList.tsx
````typescript
export function BlockedInvoiceList({ onResolve }: { onResolve: () => void }) {
  return (
    <>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-[12px]">
          <div className="w-6 h-6 rounded-full bg-[#111113] text-white grid place-items-center text-[10px] font-bold">CR</div>
          <span className="flex-1 truncate">Carlos Ruiz · Factura 234</span>
          <span className="text-[11px] text-[var(--muted)]">€1.240</span>
        </div>
        <div className="text-[11px] text-[var(--muted)] pl-8">+ 3 más: Gil Proyectos, Torres, Navarro</div>
        <div className="flex gap-1.5 pl-8 pt-1">
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#DBEAFE] text-blue-700">Holded API error</span>
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#FFE4E6] text-red-700">Autónomos 20/mes</span>
        </div>
      </div>
      <button onClick={onResolve} className="mt-4 w-full h-9 rounded-full bg-[#6D5BFF] text-white text-[12px] font-medium hover:brightness-105">Resolver con IA →</button>
    </>
  );
}
````

## File: workspaces/35-centro-mando/components/CentroMandoSidebar.tsx
````typescript
type Props = { onNewChat: () => void; mobileOpen: boolean; onClose: () => void };
const NAV = [
  { label: 'Chat', icon: '💬', count: null },
  { label: 'Tareas', icon: '✓', count: '8' },
  { label: 'Documentos', icon: '📄', count: null },
  { label: 'Proyectos', icon: '📁', count: null },
  { label: 'Lo que sabe de tu negocio', icon: '🧠', count: null },
  { label: 'Equipo', icon: '👥', count: null },
  { label: 'Agentes', icon: '🤖', count: '3' },
  { label: 'CRM', icon: '📇', count: '24' },
  { label: 'Finanzas', icon: '€', count: null },
] as const;
export function CentroMandoSidebar({ onNewChat, mobileOpen, onClose }: Props) {
  return (
    <>
      <aside className={'fixed lg:static inset-y-0 left-0 z-40 w-[260px] bg-white border-r border-[var(--border)] flex flex-col transition-transform lg:translate-x-0 ' + (mobileOpen ? 'translate-x-0' : '-translate-x-full') + ' shadow-[0_8px_40px_rgba(0,0,0,0.08)] lg:shadow-none'}>
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[#111113] text-white flex items-center justify-center font-black text-[16px]">A</div>
            <div className="leading-none">
              <div className="font-semibold text-[14px] tracking-tight">Agente IA Pro</div>
              <div className="text-[10px] font-medium text-white bg-[#111113] inline-flex px-1.5 py-0.5 rounded-full mt-0.5">PRO</div>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <div className="w-5 h-5 rounded-full bg-[#EDE8FF] text-[#6D5BFF] grid place-items-center font-bold">AC</div>
            Agente activo · ACME
          </div>
          <button onClick={onNewChat} className="mt-5 w-full h-9 rounded-full bg-[#111113] text-white text-[13px] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition">
            <span className="text-[16px] leading-none">+</span> Nuevo chat
          </button>
          <div className="mt-6">
            <div className="text-[10px] tracking-[0.14em] font-semibold text-[var(--muted)] mb-3">WORKSPACE</div>
            <nav className="space-y-1">
              {NAV.map(i => (
                <div key={i.label} className="flex items-center gap-3 px-2.5 py-2 rounded-[12px] text-[13px] text-[#4B4B4F] hover:bg-[#F8F7FF] cursor-pointer">
                  <span className="w-5 text-center opacity-70">{i.icon}</span>
                  <span className="flex-1 truncate">{i.label}</span>
                  {i.count && <span className="text-[11px] bg-[#F1F0FF] text-[#6D5BFF] px-1.5 py-0.5 rounded-full font-medium">{i.count}</span>}
                </div>
              ))}
              <div className="flex items-center gap-3 px-2.5 py-2 rounded-[12px] text-[13px] bg-[#111113] text-white shadow-sm cursor-pointer">
                <span className="w-5 text-center">📊</span>
                <span className="flex-1 font-medium">Analítica</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </nav>
          </div>
        </div>
        <div className="mt-auto p-4 border-t border-[var(--border)]">
          <div className="rounded-[16px] bg-[#F8F7FF] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6D5BFF] text-white grid place-items-center text-[12px] font-bold">CR</div>
            <div>
              <div className="text-[12px] font-semibold">Carlos Ruiz</div>
              <div className="text-[11px] text-[var(--muted)]">Admin · Holded sync</div>
            </div>
          </div>
        </div>
      </aside>
      {mobileOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />}
    </>
  );
}
````

## File: workspaces/35-centro-mando/components/ChartAnnotation.tsx
````typescript
export function ChartAnnotation({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <>
      <line x1={x} y1="30" x2={x} y2="95" stroke="#6D5BFF" strokeDasharray="4 4" opacity="0.6" />
      <g transform={'translate(' + (x + 12) + ',22)'}>
        <rect width="112" height="22" rx="11" fill="#111113" />
        <text x="10" y="14" fontSize="10" fill="white" fontWeight="600">{label}</text>
      </g>
      <circle cx={x} cy={y} r="6" fill="#6D5BFF" stroke="white" strokeWidth="2" />
    </>
  );
}
````

## File: workspaces/35-centro-mando/components/ClientDetailModal.tsx
````typescript
import type { Client } from '../types';
import { StatusBadge } from './StatusBadge';
type Props = { client: Client; onClose: () => void; onGenerate: () => void };
export function ClientDetailModal({ client, onClose, onGenerate }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-[520px] bg-white rounded-t-[24px] md:rounded-[24px] border border-[var(--border)] shadow-[0_24px_64px_rgba(0,0,0,0.2)] p-6 max-h-[90vh] overflow-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EDE8FF] text-[#6D5BFF] grid place-items-center font-bold">{client.avatar}</div>
            <div>
              <div className="text-[16px] font-semibold">{client.name}</div>
              <div className="text-[12px] text-[var(--muted)]">{client.company} · {client.ltv}</div>
              <div className="mt-2 flex gap-2">
                <StatusBadge status={client.status} />
                <span className="text-[10px] px-2 py-1 rounded-full bg-[#F1F0FF] text-[#6D5BFF]">{client.amount}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F8F7FF] border border-[var(--border)] grid place-items-center">✕</button>
        </div>
        <div className="mt-5 rounded-[16px] bg-[#F8F7FF] p-4">
          <div className="text-[11px] tracking-widest font-semibold text-[var(--muted)]">DETALLE IA</div>
          <p className="text-[13px] leading-[1.6] mt-2">{client.detail}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[14px] border border-[var(--border)] p-3">
            <div className="text-[10px] text-[var(--muted)]">PRÓXIMO PASO</div>
            <div className="text-[12px] font-medium mt-1">{client.next}</div>
          </div>
          <div className="rounded-[14px] border border-[var(--border)] p-3">
            <div className="text-[10px] text-[var(--muted)]">ACCIÓN IA</div>
            <div className="text-[12px] font-medium mt-1">{client.action}</div>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onGenerate} className="flex-1 h-10 rounded-full bg-[#111113] text-white text-[13px] font-medium">Generar con IA →</button>
          <button onClick={onClose} className="h-10 px-5 rounded-full bg-[#F8F7FF] border border-[var(--border)] text-[13px] font-medium">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/CriticalTicketsPanel.tsx
````typescript
import type { Ticket } from '../types';
import { SectionHeader } from './SectionHeader';
import { TicketCard } from './TicketCard';
type Props = { tickets: Ticket[]; onOpen: (name: string) => void; onFixBot: () => void; onVerCola: () => void };
export function CriticalTicketsPanel({ tickets, onOpen, onFixBot, onVerCola }: Props) {
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5 flex flex-col">
      <SectionHeader title={<>Tickets críticos <span className="w-5 h-5 rounded-full bg-[#FFE4E6] text-red-600 inline-grid place-items-center text-[11px] font-bold">{tickets.length}</span></>} actions={<button onClick={onVerCola} className="text-[11px] px-2.5 py-1 rounded-full bg-[#111113] text-white">Ver cola</button>} />
      <div className="mt-4 space-y-3">
        {tickets.map(t => <TicketCard key={t.name} t={t} onClick={() => onOpen(t.name)} />)}
      </div>
      <div className="mt-auto pt-4">
        <div className="rounded-[12px] bg-[#F8F7FF] p-3 flex items-center justify-between">
          <div className="text-[11px]"><span className="font-semibold">23%</span> respuestas fuera horario fallando</div>
          <button onClick={onFixBot} className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-[var(--border)]">Fix bot</button>
        </div>
      </div>
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/DateRangePicker.tsx
````typescript
import type { DateRange } from '../types';
export function DateRangePicker({ range, onChange }: { range: DateRange; onChange: (r: DateRange) => void }) {
  return (
    <div className="flex p-1 rounded-full bg-[#F8F7FF] border border-[var(--border)]">
      {(['7d','30d','90d'] as DateRange[]).map(r => (
        <button key={r} onClick={() => onChange(r)} className={'px-3 h-7 rounded-full text-[12px] font-medium transition ' + (range === r ? 'bg-[#111113] text-white' : 'text-[var(--muted)] hover:text-[#111113]')}>{r}</button>
      ))}
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/InsightCard.tsx
````typescript
import type { Insight } from '../types';
type Props = { i: Insight; onClick: () => void };
export function InsightCard({ i, onClick }: Props) {
  const btnCls = i.variant === 'light' ? 'bg-white text-black' : i.variant === 'primary' ? 'bg-[#6D5BFF] text-white' : 'bg-white/10 text-white border border-white/10';
  return (
    <div className="rounded-[14px] bg-white/5 border border-white/10 p-3">
      <div className="text-[11px] text-white/60 uppercase tracking-widest">{i.tag}</div>
      <p className="text-[12px] leading-[1.5] mt-2 text-white/90">{i.body}</p>
      <button onClick={onClick} className={'mt-3 h-7 px-3 rounded-full text-[11px] font-medium ' + btnCls}>{i.cta}</button>
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/KpiCard.tsx
````typescript
import type { ReactNode } from 'react';
type Props = { label: string; children: ReactNode; dark?: boolean };
export function KpiCard({ label, children, dark }: Props) {
  if (dark) {
    return (
      <div className="rounded-[20px] bg-[#111113] text-white border border-black shadow-[0_12px_32px_rgba(17,17,19,0.18)] p-5 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#6D5BFF] opacity-20 blur-[24px]" />
        <div className="relative">
          <div className="text-[11px] tracking-[0.12em] font-semibold text-white/60">{label}</div>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5 flex flex-col">
      <div className="text-[11px] tracking-[0.12em] font-semibold text-[var(--muted)]">{label}</div>
      {children}
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/KpiGrid.tsx
````typescript
import type { ReactNode } from 'react';
export function KpiGrid({ children }: { children: ReactNode }) {
  return <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{children}</section>;
}
````

## File: workspaces/35-centro-mando/components/MiniBarList.tsx
````typescript
import type { MessageRow } from '../types';
export function MiniBarList({ rows }: { rows: MessageRow[] }) {
  return (
    <div className="space-y-2">
      {rows.map(r => (
        <div key={r.name} className="flex items-center gap-2">
          <div className="text-[11px] w-[110px] truncate text-[#3A3A3D]">{r.name}</div>
          <div className="flex-1 h-1.5 rounded-full bg-[#F1F0FF] overflow-hidden">
            <div className="h-full bg-[#6D5BFF] rounded-full" style={{ width: r.pct + '%' }} />
          </div>
          <div className="text-[11px] font-medium">{r.msgs}/d</div>
        </div>
      ))}
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/PipelineFunnel.tsx
````typescript
import type { PipelineStage } from '../types';
export function PipelineFunnel({ stages }: { stages: PipelineStage[] }) {
  return (
    <div className="space-y-2">
      {stages.map(s => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="text-[11px] w-[72px] text-white/70">{s.label}</div>
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[#6D5BFF]" style={{ width: s.w }} />
          </div>
          <div className="text-[11px] font-medium w-4">{s.val}</div>
        </div>
      ))}
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/ProgressBar.tsx
````typescript
type Props = { pct: number; color?: string };
export function ProgressBar({ pct, color = '#6D5BFF' }: Props) {
  return (
    <div className="h-2 rounded-full bg-[#F1F0FF] overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: pct + '%', background: color }} />
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/ProjectProgressRow.tsx
````typescript
import type { Project } from '../types';
import { ProgressBar } from './ProgressBar';
export function ProjectProgressRow({ o }: { o: Project }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#EDE8FF] text-[#6D5BFF] grid place-items-center text-[10px] font-bold">{o.avatar}</div>
          <div>
            <div className="text-[13px] font-medium leading-none">{o.name}</div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">{o.owner} · {o.alert}</div>
          </div>
        </div>
        <div className="text-[12px] font-semibold">{o.pct}%</div>
      </div>
      <div className="mt-2"><ProgressBar pct={o.pct} color={o.color} /></div>
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/RetentionChart.tsx
````typescript
import type { DateRange } from '../types';
import { ChartAnnotation } from './ChartAnnotation';
type Props = { data: number[]; range: DateRange };
export function RetentionChart({ data, range }: Props) {
  const annotationX = range === '7d' ? 260 : 300;
  const annotationY = range === '7d' ? 84 : 72;
  return (
    <div className="mt-6 relative">
      <svg viewBox="0 0 520 180" className="w-full h-[180px] overflow-visible">
        <defs>
          <linearGradient id="lav" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#EDE8FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EDE8FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0,1,2,3].map(i => <line key={i} x1="0" x2="520" y1={20 + i * 40} y2={20 + i * 40} stroke="#F1F0FF" strokeDasharray="4 6" />)}
        <path d={'M0,' + (180 - data[0] * 1.2) + ' ' + data.map((v, i) => 'L ' + (i / (data.length - 1)) * 520 + ',' + (180 - v * 1.2)).join(' ') + ' L 520,160 L 0,160 Z'} fill="url(#lav)" />
        <path d={'M0,' + (180 - data[0] * 1.2) + ' ' + data.map((v, i) => 'L ' + (i / (data.length - 1)) * 520 + ',' + (180 - v * 1.2)).join(' ')} fill="none" stroke="#6D5BFF" strokeWidth="2.5" strokeLinecap="round" />
        <ChartAnnotation x={annotationX} y={annotationY} label="Fix deploy · +12% ↑" />
        {data.map((v, i) => {
          if (i % 3 !== 0 && data.length > 7) return null;
          return <circle key={i} cx={(i / (data.length - 1)) * 520} cy={180 - v * 1.2} r="3.5" fill="#6D5BFF" />;
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
        <span>Hace {range}</span><span>Hoy</span>
      </div>
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/RetentionStats.tsx
````typescript
export function RetentionStats() {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      <div className="rounded-[12px] bg-[#F8F7FF] p-3">
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Retención</div>
        <div className="text-[16px] font-semibold mt-1">82%</div>
        <div className="text-[11px] text-emerald-600">+12% tras fix</div>
      </div>
      <div className="rounded-[12px] bg-[#F8F7FF] p-3">
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Churn mensual</div>
        <div className="text-[16px] font-semibold mt-1">4.2%</div>
        <div className="text-[11px] text-[var(--muted)]">-1.1% vs ant</div>
      </div>
      <div className="rounded-[12px] bg-[#EDE8FF] p-3">
        <div className="text-[10px] text-[#6D5BFF] uppercase tracking-widest">Equipo Growth</div>
        <div className="text-[13px] font-medium mt-1">WhatsApp + Fix</div>
        <div className="text-[11px] text-[#6D5BFF]">Ver thread</div>
      </div>
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/SectionHeader.tsx
````typescript
import type { ReactNode } from 'react';
type Props = { title: ReactNode; actions?: ReactNode };
export function SectionHeader({ title, actions }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/Sparkline.tsx
````typescript
export function Sparkline({ points }: { points: string }) {
  return (
    <svg width="100%" height="44" viewBox="0 0 120 44" className="overflow-visible">
      <polyline fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" points={points} />
      <polyline fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" opacity="0.15" points={'0,38 ' + points + ' 120,38'} />
    </svg>
  );
}
````

## File: workspaces/35-centro-mando/components/StatusBadge.tsx
````typescript
import type { ClientStatus } from '../types';
export function StatusBadge({ status }: { status: ClientStatus }) {
  const cls = status === 'riesgo' ? 'bg-[#FFE4E6] text-red-700' : status === 'oportunidad' ? 'bg-[#D1FAE5] text-emerald-700' : 'bg-[#FEF3C7] text-amber-700';
  return <span className={'text-[10px] px-2 py-1 rounded-full font-medium ' + cls}>{status.toUpperCase()}</span>;
}
````

## File: workspaces/35-centro-mando/components/TicketCard.tsx
````typescript
import type { Ticket } from '../types';
import { Avatar } from './Avatar';
import { UrgencyBadge } from './UrgencyBadge';
export function TicketCard({ t, onClick }: { t: Ticket; onClick: () => void }) {
  const initials = t.name.split(' ').map(n => n[0]).join('');
  return (
    <div onClick={onClick} className="group rounded-[14px] border border-[var(--border)] p-3 hover:border-[#6D5BFF]/30 hover:bg-[#FBFAFF] transition cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-2.5 min-w-0">
          <Avatar label={initials} />
          <div className="min-w-0">
            <div className="text-[12px] font-semibold truncate">{t.name}</div>
            <div className="text-[11px] text-[var(--muted)] truncate">{t.company} · {t.issue}</div>
          </div>
        </div>
        <div className={'w-2 h-2 rounded-full ' + t.dot + ' mt-1.5'} />
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className={'text-[10px] px-2 py-1 rounded-full font-medium ' + t.badgeColor}>{t.badge}</span>
        <UrgencyBadge label={t.urgency} />
        <span className="text-[10px] text-[var(--muted)] ml-auto">{t.time} abierto</span>
      </div>
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/Toast.tsx
````typescript
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
      <div className="pointer-events-auto rounded-full bg-[#111113] text-white px-4 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.24)] flex items-center gap-2 text-[12px] font-medium">
        <span className="w-5 h-5 rounded-full bg-[#6D5BFF] grid place-items-center text-[12px]">✦</span>
        {message}
      </div>
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/TopClientRow.tsx
````typescript
import type { Client } from '../types';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';
type Props = { c: Client; onOpen: () => void; onAction: () => void };
export function TopClientRow({ c, onOpen, onAction }: Props) {
  return (
    <tr className="border-b border-[var(--border)] last:border-0 hover:bg-[#FBFAFF] transition">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onOpen}>
          <Avatar label={c.avatar} />
          <div className="text-[13px] font-medium">{c.name}</div>
        </div>
      </td>
      <td className="px-3 py-3.5 text-[12px] text-[#3A3A3D]">{c.company}</td>
      <td className="px-3 py-3.5 text-[12px] font-semibold">{c.ltv}</td>
      <td className="px-3 py-3.5"><StatusBadge status={c.status} /></td>
      <td className="px-3 py-3.5 text-[11px] text-[var(--muted)] max-w-[200px] truncate">{c.next}</td>
      <td className="px-5 py-3.5">
        <button onClick={onAction} className="h-7 px-3 rounded-full bg-[#111113] text-white text-[11px] font-medium hover:opacity-90">{c.action}</button>
      </td>
    </tr>
  );
}
````

## File: workspaces/35-centro-mando/components/TopClientsPanel.tsx
````typescript
import type { Client } from '../types';
import { TopClientsTable } from './TopClientsTable';
type Props = { clients: Client[]; onOpen: (c: Client) => void; onAction: (c: Client) => void };
export function TopClientsPanel({ clients, onOpen, onAction }: Props) {
  return (
    <section className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] overflow-hidden">
      <div className="p-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">Top clientes riesgo / oportunidad</h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-1 rounded-full bg-[#FFE4E6] text-red-700">Roberto León €15.4k silencio 12d riesgo churn</span>
          <span className="hidden md:inline text-[11px] px-2 py-1 rounded-full bg-[#D1FAE5] text-emerald-700">Marta Soler oportunidad €8.4k</span>
        </div>
      </div>
      <TopClientsTable clients={clients} onOpen={onOpen} onAction={onAction} />
    </section>
  );
}
````

## File: workspaces/35-centro-mando/components/TopClientsTable.tsx
````typescript
import type { Client } from '../types';
import { TopClientRow } from './TopClientRow';
type Props = { clients: Client[]; onOpen: (c: Client) => void; onAction: (c: Client) => void };
export function TopClientsTable({ clients, onOpen, onAction }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="text-[10px] tracking-[0.12em] text-[var(--muted)] border-y border-[var(--border)] bg-[#FBFAFF]">
            <th className="text-left font-semibold px-5 py-3">CLIENTE</th>
            <th className="text-left font-semibold px-3 py-3">EMPRESA</th>
            <th className="text-left font-semibold px-3 py-3">LTV</th>
            <th className="text-left font-semibold px-3 py-3">ESTADO</th>
            <th className="text-left font-semibold px-3 py-3">PRÓXIMO PASO IA</th>
            <th className="text-left font-semibold px-5 py-3">ACCIÓN</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => <TopClientRow key={c.id} c={c} onOpen={() => onOpen(c)} onAction={() => onAction(c)} />)}
        </tbody>
      </table>
    </div>
  );
}
````

## File: workspaces/35-centro-mando/components/UrgencyBadge.tsx
````typescript
export function UrgencyBadge({ label }: { label: string }) {
  return <span className="text-[10px] px-2 py-1 rounded-full bg-[#111113] text-white font-medium">{label}</span>;
}
````

## File: workspaces/35-centro-mando/components/WorkspaceHeader.tsx
````typescript
import type { DateRange } from '../types';
import { DateRangePicker } from './DateRangePicker';
type Props = { range: DateRange; onRange: (r: DateRange) => void; onExport: () => void };
export function WorkspaceHeader({ range, onRange, onExport }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-[rgba(248,247,255,0.85)] backdrop-blur-[14px] border-b border-[var(--border)]" style={{ top: 'var(--safe-area-inset-top)' }}>
      <div className="px-4 lg:px-8 h-[68px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-[18px] lg:text-[20px] font-semibold tracking-tight leading-none flex items-center gap-2">
              Centro de Mando <span className="hidden lg:inline text-[var(--muted)] font-normal">· Todas las empresas</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white border border-[var(--border)] ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
              </span>
            </h1>
            <div className="text-[11px] text-[var(--muted)] mt-1 lg:hidden">Todas las empresas · Workspace #9</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker range={range} onChange={onRange} />
          <button onClick={onExport} className="h-9 px-4 rounded-full bg-[#111113] text-white text-[13px] font-medium flex items-center gap-2 hover:opacity-90">
            <span>↗</span>
            <span className="hidden sm:inline">Exportar con IA</span>
            <span className="sm:hidden">Exportar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
````

## File: workspaces/35-centro-mando/docs/01-ui-map.md
````markdown
# 01 — UI Map · Centro de Mando

## Bloques (top -> bottom)

1. Sidebar — nav WORKSPACE + user footer
2. Header — titulo + Live + DateRange + Export
3. KPI Grid (4 tarjetas)
   - Mensajes / día (+ MiniBarList)
   - Facturación bloqueada (+ BlockedInvoiceList)
   - Tiempo medio respuesta (+ Sparkline)
   - LTV total pipeline (dark, + PipelineFunnel)
4. Retención / Churn — RetentionChart + ChartAnnotation + RetentionStats
5. Tickets críticos — CriticalTicketsPanel + TicketCard
6. Obras activas · health — ActiveProjectsPanel + ProjectProgressRow
7. Agentes performance — AgentsPerformancePanel + AgentPerformanceCard
8. Top clientes — TopClientsPanel + TopClientsTable + TopClientRow
9. Insights IA — AiInsightsPanel + InsightCard
10. Modal cliente — ClientDetailModal
11. Toast — Toast

## Transversales del workspace

StatusBadge · UrgencyBadge · ProgressBar · SectionHeader · AiActionButton · Avatar · DateRangePicker
````

## File: workspaces/35-centro-mando/docs/02-roadmap.md
````markdown
# 02 — Roadmap · Centro de Mando

## Fase 1 — Estructura
- [x] Carpetas components/, hooks/, docs/
- [x] README, index.ts, ui-map, roadmap, spec

## Fase 2 — Datos y hooks
- [x] useCentroMandoData
- [x] useDateRange
- [x] useToast
- [x] useClientSelection
- [x] useMobileMenu
- [x] types.ts

## Fase 3 — Componentes base
- [x] Avatar, StatusBadge, UrgencyBadge, ProgressBar, SectionHeader, AiActionButton, DateRangePicker, Toast

## Fase 4 — Bloques
- [x] KpiGrid + KpiCard + sub-bloques
- [x] RetentionChart + ChartAnnotation + RetentionStats
- [x] CriticalTicketsPanel + TicketCard
- [x] ActiveProjectsPanel + ProjectProgressRow
- [x] AgentsPerformancePanel + AgentPerformanceCard
- [x] TopClientsPanel + TopClientsTable + TopClientRow
- [x] AiInsightsPanel + InsightCard
- [x] ClientDetailModal

## Fase 5 — Ensamblaje
- [x] CentroMandoWorkspace.tsx
- [ ] Registro en workspaces/registry.ts
- [ ] Registro en workspaces/index.ts
````

## File: workspaces/35-centro-mando/docs/03-spec.md
````markdown
# 03 — Spec · Centro de Mando

## Objetivo
Vista única de control operativo: KPIs, retención, tickets, obras, agentes,
clientes e insights IA. Sustituye la navegación entre vistas dispersas.

## Alcance
- Solo lectura + acciones IA sobre datos ya existentes.
- No introduce nuevos endpoints en esta fase (los datos llegan por hooks locales).

## Convenciones
- Tokens CSS: --bg, --ink, --border, --muted
- Paleta: #6D5BFF (primario), #111113 (ink), #F8F7FF (surface), #EDE8FF (lavanda),
  #10B981 (ok), #FFE4E6 (riesgo), #FEF3C7 (ámbar)
- Nomenclatura: PascalCase para componentes, useXxx para hooks, tipos en types.ts

## Acciones emitidas (CentroMandoAction)
export-ai, resolve-billing, view-funnel, export-pipeline, view-thread,
view-queue, fix-bot, generate-report, edit-agent, view-logs,
client-action, insight-cta, range-change

## Accesibilidad
- aria-label en secciones
- :focus-visible outline 2px
- prefers-reduced-motion respetado
````

## File: workspaces/35-centro-mando/hooks/useCentroMandoData.ts
````typescript
import { useMemo } from 'react';
import type { Client, Project, Ticket, Agent, Insight, MessageRow, PipelineStage, DateRange } from '../types';
const clients: Client[] = [
  { id:'1', name:'Roberto León', company:'León Constructora', ltv:'€15.4k', status:'riesgo', next:'Llamada rescate · guión IA', action:'Llamar', avatar:'RL', detail:'Silencio 12 días, 3 presupuestos sin respuesta.', amount:'€15.4k en juego' },
  { id:'2', name:'Marta Soler', company:'Soluciones Limpieza', ltv:'€4.2k', status:'oportunidad', next:'Enviar propuesta 3 planes + demo', action:'Enviar propuesta', avatar:'MS', detail:'60 msgs/día en WhatsApp. Upsell €8.4k.', amount:'€8.4k potencial' },
  { id:'3', name:'Javier Gil', company:'Gil Proyectos', ltv:'€12.4k', status:'estable', next:'Centralizar info · checklist obra', action:'Generar checklist', avatar:'JG', detail:'15 obras simultáneas. Tiempo respuesta 4h.', amount:'€12.4k pipeline' },
  { id:'4', name:'Ana Torres', company:'Clínica Torres', ltv:'€6.8k', status:'riesgo', next:'Fix bot fuera horario + disculpa', action:'Resolver con IA', avatar:'AT', detail:'Bot no responde fuera de horario 23%.', amount:'Ticket #8821' },
  { id:'5', name:'Sofia Navarro', company:'Navarro Retail', ltv:'€9.1k', status:'riesgo', next:'Revisar cobro duplicado Holded', action:'Revisar factura', avatar:'SN', detail:'Cobro duplicado. 2 facturas bloqueadas.', amount:'€1.240 duplicado' },
];
const projects: Project[] = [
  { name:'Tenerife Sur', pct:78, owner:'Marta', avatar:'MS', alert:'Retraso 1 día por secado', color:'#6D5BFF' },
  { name:'Residencial Las Palmas', pct:64, owner:'Javier Gil', avatar:'JG', alert:'Falta lechada · 15 obras', color:'#FF8A5B' },
  { name:'Tienda Centro Comercial', pct:91, owner:'Carlos', avatar:'CR', alert:'En tiempo', color:'#10B981' },
  { name:'Villa Tagoror', pct:42, owner:'Roberto', avatar:'RL', alert:'Esperando material', color:'#6D5BFF' },
  { name:'Oficinas ACME', pct:85, owner:'Sofia', avatar:'SN', alert:'Finalizando', color:'#6D5BFF' },
];
const tickets: Ticket[] = [
  { name:'Ana Torres', company:'Clínica Torres', issue:'Bot no responde', time:'18h', badge:'Soporte', badgeColor:'bg-[#DBEAFE] text-blue-700', urgency:'URGENCIA', dot:'bg-red-500' },
  { name:'Sofia Navarro', company:'Navarro Retail', issue:'Cobro duplicado riesgo churn', time:'5h', badge:'Reclamación', badgeColor:'bg-[#FFE4E6] text-red-700', urgency:'ALTA', dot:'bg-amber-400' },
  { name:'Roberto Díaz', company:'Díaz Instalaciones', issue:'Factura Holded no sync', time:'2d', badge:'Pagos', badgeColor:'bg-[#FEF3C7] text-amber-800', urgency:'MEDIA', dot:'bg-[#6D5BFF]' },
];
const agents: Agent[] = [
  { name:'Agente Obra', conf:94, tasks:3, status:'ok', desc:'Checklists, progreso, alertas' },
  { name:'Agente Presupuestos', conf:89, tasks:5, status:'ok', desc:'3 planes + demo, Holded' },
  { name:'Agente Soporte', conf:76, tasks:8, status:'warn', desc:'Fuera horario fallando · Ana Torres caso' },
];
const insights: Insight[] = [
  { tag:'Oportunidad automatización', body:'Detectamos: 60 msgs/día en Soluciones Limpieza = oportunidad automatización WhatsApp + Holded.', cta:'Crear flujo IA', variant:'light' },
  { tag:'Bloqueo facturación', body:'20 facturas/mes autónomos bloqueadas por sync. Holded API error 422.', cta:'Resolver sync', variant:'primary' },
  { tag:'Bot fuera horario', body:'Bot responde fuera de horario 23% fallando. Agente Soporte necesita re-entrenamiento.', cta:'Re-entrenar', variant:'ghost' },
];
const messageRows: MessageRow[] = [
  { name:'Soluciones Limpieza', msgs:60, pct:78 },
  { name:'ACME Obras', msgs:42, pct:55 },
  { name:'Clínica Torres', msgs:31, pct:40 },
];
const pipelineStages: PipelineStage[] = [
  { label:'Lead', val:6, w:'25%' },
  { label:'Presupuesto', val:8, w:'48%' },
  { label:'Obra', val:5, w:'62%' },
  { label:'Facturado', val:5, w:'92%' },
];
const retentionData: Record<DateRange, number[]> = {
  '7d': [68,70,69,71,74,80,82],
  '30d': [62,64,63,66,68,71,70,72,74,75,78,80,82],
  '90d': [58,60,61,60,62,64,63,66,68,70,69,71,73,75,78,80,82],
};
export function useCentroMandoData(range: DateRange) {
  const data = retentionData[range];
  const sparkPoints = useMemo(() => {
    const w = 120, h = 36;
    const max = Math.max(...data);
    const min = Math.min(...data);
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h - 2;
      return x + ',' + y;
    }).join(' ');
  }, [data]);
  return { clients, projects, tickets, agents, insights, messageRows, pipelineStages, retention: data, sparkPoints };
}
````

## File: workspaces/35-centro-mando/hooks/useClientSelection.ts
````typescript
import { useState } from 'react';
import type { Client } from '../types';
export function useClientSelection() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  return { selectedClient, setSelectedClient };
}
````

## File: workspaces/35-centro-mando/hooks/useDateRange.ts
````typescript
import { useState } from 'react';
import type { DateRange } from '../types';
const LABELS: Record<DateRange, string> = { '7d': 'Últimos 7 días', '30d': 'Últimos 30 días', '90d': 'Últimos 90 días' };
export function useDateRange(initial: DateRange = '30d') {
  const [range, setRange] = useState<DateRange>(initial);
  const label = LABELS[range];
  return { range, setRange, label };
}
````

## File: workspaces/35-centro-mando/hooks/useMobileMenu.ts
````typescript
import { useState } from 'react';
export function useMobileMenu() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const toggle = () => setMobileMenu(v => !v);
  const close = () => setMobileMenu(false);
  return { mobileMenu, toggle, close };
}
````

## File: workspaces/35-centro-mando/hooks/useToast.ts
````typescript
import { useState, useCallback, useRef } from 'react';
export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(msg);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);
  return { toast, showToast };
}
````

## File: workspaces/35-centro-mando/centro-mando.css
````css
:root {
  --bg: #f6f6f9;
  --ink: #14141f;
  --muted: #8a8a9c;
  --border: #ececf3;
}
````

## File: workspaces/35-centro-mando/CentroMandoWorkspace.tsx
````typescript
import { useCentroMandoData } from './hooks/useCentroMandoData';
import { useDateRange } from './hooks/useDateRange';
import { useToast } from './hooks/useToast';
import { useClientSelection } from './hooks/useClientSelection';
import { useMobileMenu } from './hooks/useMobileMenu';
import { CentroMandoSidebar } from './components/CentroMandoSidebar';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { KpiGrid } from './components/KpiGrid';
import { KpiCard } from './components/KpiCard';
import { MiniBarList } from './components/MiniBarList';
import { BlockedInvoiceList } from './components/BlockedInvoiceList';
import { Sparkline } from './components/Sparkline';
import { PipelineFunnel } from './components/PipelineFunnel';
import { RetentionChart } from './components/RetentionChart';
import { RetentionStats } from './components/RetentionStats';
import { CriticalTicketsPanel } from './components/CriticalTicketsPanel';
import { ActiveProjectsPanel } from './components/ActiveProjectsPanel';
import { AgentsPerformancePanel } from './components/AgentsPerformancePanel';
import { TopClientsPanel } from './components/TopClientsPanel';
import { AiInsightsPanel } from './components/AiInsightsPanel';
import { ClientDetailModal } from './components/ClientDetailModal';
import { Toast } from './components/Toast';

export default function CentroMandoWorkspace() {
  const { range, setRange } = useDateRange('30d');
  const { toast, showToast } = useToast();
  const { selectedClient, setSelectedClient } = useClientSelection();
  const { mobileMenu, toggle, close } = useMobileMenu();
  const data = useCentroMandoData(range);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex overflow-hidden">
      <CentroMandoSidebar mobileOpen={mobileMenu} onClose={close} onNewChat={() => showToast('Nuevo chat creado con IA')} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-[rgba(248,247,255,0.85)] backdrop-blur-[14px] border-b border-[var(--border)] lg:hidden">
          <div className="px-4 h-[60px] flex items-center gap-3">
            <button onClick={toggle} className="w-9 h-9 rounded-full bg-white border border-[var(--border)] grid place-items-center">☰</button>
            <span className="text-[14px] font-semibold">Centro de Mando</span>
          </div>
        </header>
        <WorkspaceHeader range={range} onRange={setRange} onExport={() => showToast('Exportando informe con IA · PDF + CSV')} />
        <main className="px-4 lg:px-8 py-6 space-y-5 overflow-x-hidden">
          <KpiGrid>
            <KpiCard label="MENSAJES / DÍA">
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold tracking-tight">247</span>
                <span className="text-[12px] px-1.5 py-0.5 rounded-full bg-[#D1FAE5] text-emerald-700 font-medium">+12%</span>
              </div>
              <div className="text-[11px] text-[var(--muted)]">vs mes anterior</div>
              <div className="mt-4"><MiniBarList rows={data.messageRows} /></div>
              <div className="mt-4 rounded-[12px] bg-[#FFE4E6] border border-red-100 px-3 py-2 flex items-center gap-2">
                <span className="text-[11px] font-bold text-red-600 tracking-widest">ALTA</span>
                <span className="text-[11px] text-red-700">Equipo desbordado · automatizar WhatsApp</span>
              </div>
            </KpiCard>
            <KpiCard label="FACTURACIÓN BLOQUEADA">
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold tracking-tight">€4.280</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FEF3C7] text-amber-700 font-medium">4 facturas</span>
              </div>
              <div className="text-[11px] text-[var(--muted)]">No sincronizan con Holded</div>
              <BlockedInvoiceList onResolve={() => showToast('Resolviendo 4 facturas con IA')} />
            </KpiCard>
            <KpiCard label="TIEMPO MEDIO RESPUESTA">
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold tracking-tight">2h 14m</span>
                <span className="text-[12px] px-1.5 py-0.5 rounded-full bg-[#D1FAE5] text-emerald-700 font-medium">-18%</span>
              </div>
              <div className="text-[11px] text-emerald-600">Gracias a agente · -42m vs mes anterior</div>
              <div className="mt-4">
                <Sparkline points={data.sparkPoints} />
                <div className="flex justify-between text-[10px] text-[var(--muted)]"><span>7d</span><span>15d</span><span>Hoy</span></div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded-[10px] bg-[#F8F7FF] p-2"><div className="text-[var(--muted)]">Bot</div><div className="font-semibold">34s</div></div>
                <div className="rounded-[10px] bg-[#F8F7FF] p-2"><div className="text-[var(--muted)]">Humano</div><div className="font-semibold">1h 58m</div></div>
                <div className="rounded-[10px] bg-[#FFE4E6] p-2"><div className="text-red-600">Fuera hrs</div><div className="font-semibold">23% fail</div></div>
              </div>
            </KpiCard>
            <KpiCard label="LTV TOTAL PIPELINE" dark>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold tracking-tight">€84.2k</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10">24 clientes</span>
              </div>
              <div className="text-[11px] text-white/60">€3.5k ticket medio</div>
              <div className="mt-5"><PipelineFunnel stages={data.pipelineStages} /></div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => showToast('Funnel analizado')} className="h-8 px-3 rounded-full bg-white text-black text-[11px] font-medium">Ver funnel</button>
                <button onClick={() => showToast('Pipeline exportado')} className="h-8 px-3 rounded-full bg-white/10 text-white text-[11px]">Exportar</button>
              </div>
            </KpiCard>
          </KpiGrid>
          <section className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
            <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5 lg:p-6">
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight">Retención / Churn</h3>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">Equipo Growth retención subió 12% después del fix · referencia WhatsApp screenshot</p>
              </div>
              <RetentionChart data={data.retention} range={range} />
              <RetentionStats />
            </div>
            <CriticalTicketsPanel tickets={data.tickets} onOpen={(name) => showToast('Abriendo ticket ' + name)} onVerCola={() => showToast('Cola de pagos priorizada')} onFixBot={() => showToast('Agente Soporte re-entrenado')} />
          </section>
          <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
            <ActiveProjectsPanel projects={data.projects} onReport={() => showToast('Checklist generado para 5 obras')} />
            <AgentsPerformancePanel agents={data.agents} onEdit={(name) => showToast('Editando ' + name)} onLogs={(name, conf) => showToast('Logs ' + name + ' · ' + conf + '%')} />
          </section>
          <TopClientsPanel clients={data.clients} onOpen={(c) => setSelectedClient(c)} onAction={(c) => showToast(c.action + ' · ' + c.name)} />
          <AiInsightsPanel insights={data.insights} onAction={(i) => showToast(i.cta)} />
          <div className="h-10" />
        </main>
      </div>
      {selectedClient && <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} onGenerate={() => { showToast('Generando ' + selectedClient.action + ' para ' + selectedClient.name); setSelectedClient(null); }} />}
      <Toast message={toast} />
    </div>
  );
}
````

## File: workspaces/35-centro-mando/index.ts
````typescript
export { default } from './CentroMandoWorkspace';
export * from './types';
````

## File: workspaces/35-centro-mando/README.md
````markdown
# 35 — Centro de Mando

Workspace de control operativo unificado. Vista unica de KPIs, retencion,
tickets criticos, obras activas, performance de agentes, top clientes e
insights IA para todas las empresas del tenant.

## Estructura

- CentroMandoWorkspace.tsx — componente raiz. Acepta data, onAction, initialRange.
- data.ts — CENTRO_MANDO_MOCK, RANGE_LABEL, RANGE_START.
- types.ts — CentroMandoData, CentroMandoAction, y tipos de dominio.
- centro-mando.css — estilos scoped bajo .cm-root.
- docs/ — ui-map, roadmap, spec.
- index.ts — export default from './CentroMandoWorkspace'.

## Uso

  import CentroMandoWorkspace from '@/workspaces/35-centro-mando';

  <CentroMandoWorkspace />

## Acciones emitidas (CentroMandoAction)

export-ai, resolve-billing, view-funnel, export-pipeline, view-thread,
view-queue, fix-bot, generate-report, edit-agent, view-logs,
client-action, insight-cta, range-change.

## Estado

- UI: completa con datos mock.
- Backend: pendiente. CentroMandoData se servira desde un hook de datos real.
````

## File: workspaces/35-centro-mando/types.ts
````typescript
export type DateRange = '7d' | '30d' | '90d';

export type ClientStatus = 'riesgo' | 'oportunidad' | 'estable';

export type Client = {
  id: string;
  name: string;
  company: string;
  ltv: string;
  status: ClientStatus;
  next: string;
  action: string;
  avatar: string;
  detail: string;
  amount: string;
};

export type Project = {
  name: string;
  pct: number;
  owner: string;
  avatar: string;
  alert: string;
  color: string;
};

export type Ticket = {
  name: string;
  company: string;
  issue: string;
  time: string;
  badge: string;
  badgeColor: string;
  urgency: string;
  dot: string;
};

export type Agent = {
  name: string;
  conf: number;
  tasks: number;
  status: 'ok' | 'warn';
  desc: string;
};

export type Insight = {
  tag: string;
  body: string;
  cta: string;
  variant: 'light' | 'primary' | 'ghost';
};

export type MessageRow = { name: string; msgs: number; pct: number };
export type PipelineStage = { label: string; val: number; w: string };
````

## File: workspaces/36-centro-mando/docs/01-ui-map.md
````markdown
# 01 — UI Map · Centro de Mando

## Bloques (top -> bottom)

1. Header — titulo + Live + selector de rango + Exportar con IA.
2. KPIs (grid 4, 2 col desde 500px):
   - MENSAJES / DIA — kpis.messages + data.messages
   - FACTURACION BLOQUEADA — kpis.billing
   - TIEMPO MEDIO RESPUESTA — kpis.response + Sparkline
   - LTV TOTAL PIPELINE — kpis.pipeline + data.pipeline (dark)
3. Retencion / Churn — RetentionChart + data.retention[range] + kpis.retention
4. Tickets criticos — data.tickets
5. Obras activas · health — data.projects
6. Agentes performance — data.agents
7. Top clientes riesgo / oportunidad — data.clients (tabla)
8. Insights IA auto-generados — data.insights + data.insightsMeta

## Clases CSS

Todo bajo .cm-root. Prefijo cm-: cm-card, cm-big, cm-pill, cm-tag,
cm-chip, cm-track, cm-btn, cm-avatar, cm-stat, cm-ticket,
cm-agent, cm-table, cm-insight.

## Responsive

- @container (min-width: 500px) -> KPI grid 2 col.
- @container (min-width: 460px) -> stats retencion 3 col.
- @container (min-width: 520px) -> insights 3 col.
- @media (max-width: 480px) -> padding compacto.
- @media (prefers-reduced-motion: reduce) -> sin transiciones.
````

## File: workspaces/36-centro-mando/docs/02-roadmap.md
````markdown
# 02 — Roadmap · Centro de Mando

## Fase 1 — Estructura
- [x] Carpetas, README, index.ts, docs

## Fase 2 — Tipos y datos
- [x] types.ts
- [x] data.ts (mock)

## Fase 3 — Componente
- [x] CentroMando.tsx completo
- [x] centro-mando.css

## Fase 4 — Registro
- [x] registry.ts (id centro-mando, family datos)
- [x] workspaces/index.ts

## Fase 5 — Backend real (pendiente)
- [ ] Endpoint /analytics/centro-mando (agregador)
- [ ] useCentroMandoData() sustituyendo CENTRO_MANDO_MOCK
- [ ] Cableado de onAction:
  - resolve-billing -> server/engine/finance
  - fix-bot -> server/engine/handoff/service
  - edit-agent / view-logs -> server/engine/agents
  - client-action -> server/business-routes
  - export-ai -> server/metrics-exporter
- [ ] Persistir range en URL o store global
- [ ] Tests E2E de render y acciones
````

## File: workspaces/36-centro-mando/docs/03-spec.md
````markdown
# 03 — Spec · Centro de Mando

## Objetivo

Vista unica de control operativo multi-empresa.

## Props

  type Props = {
    data?: CentroMandoData;
    onAction?: (a: CentroMandoAction, p?: unknown) => void;
    initialRange?: DateRange;
  };

## Contrato de datos

CentroMandoData (ver types.ts): kpis, messages, pipeline,
retention (Record<DateRange, number[]>), tickets, projects, agents,
clients, insights, insightsMeta.

## Contrato de acciones

CentroMandoAction (ver types.ts). range-change emite el nuevo valor como
payload.

## Comportamiento

- Selector de rango: dos instancias sincronizadas (header + chart).
- Menu de rango: aria-haspopup, role=listbox, cierra al seleccionar.
- Chart: marca "Fix deploy" anclada al indice 2.
- Tabla clientes: overflow-x auto, min-width 780px.
- Insights: variantes light, primary, ghost.

## Estilos

- Scoped bajo .cm-root, tokens --cm-*.
- Hereda tipografia de la app.
- Container queries.

## Accesibilidad

- aria-label en secciones y chart.
- aria-selected en tablist.
- role="progressbar" en barras.
- :focus-visible outline 2px --cm-primary.
- prefers-reduced-motion respetado.

## Pendiente

- Datos reales, estados de carga/error/vacio, i18n.
````

## File: workspaces/36-centro-mando/centro-mando.css
````css
/* apps/web/src/workspaces/35-centro-mando/centro-mando.css */
/* La fuente se hereda de la app (no se define aquí). */
.cm-root {
  --cm-bg: #f6f6f9;
  --cm-card: #ffffff;
  --cm-ink: #14141f;
  --cm-ink-2: #2b2b3a;
  --cm-muted: #8a8a9c;
  --cm-line: #ececf3;
  --cm-soft: #f5f5f9;
  --cm-primary: #7c5cff;
  --cm-primary-soft: #eeeaff;
  --cm-green: #16a34a;
  --cm-green-soft: #dcfce7;
  --cm-red: #e5484d;
  --cm-red-soft: #fde4e4;
  --cm-yellow: #b7791f;
  --cm-yellow-soft: #fdf0c8;
  --cm-blue: #2f6fe4;
  --cm-blue-soft: #e1ebff;
  --cm-dark: #0f0f1a;

  container-type: inline-size;
  box-sizing: border-box;
  background: var(--cm-bg);
  color: var(--cm-ink);
  padding: 20px 24px 36px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 13px;
  line-height: 1.35;
}
.cm-root *, .cm-root *::before, .cm-root *::after { box-sizing: border-box; }
.cm-root h1, .cm-root h2, .cm-root p, .cm-root ul { margin: 0; padding: 0; }
.cm-root ul { list-style: none; }
.cm-root :where(button) { font: inherit; color: inherit; }
.cm-root b { font-weight: 700; }

.cm-muted { color: var(--cm-muted); font-weight: 400; }
.cm-green { color: var(--cm-green); }
.cm-sub { color: var(--cm-muted); font-size: 12px; margin-top: 2px; }
.cm-indent { margin-left: 38px; }
.cm-root :focus-visible { outline: 2px solid var(--cm-primary); outline-offset: 2px; }

/* ---------- Header ---------- */
.cm-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.cm-root h1 { font-size: 21px; font-weight: 700; letter-spacing: -0.01em; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.cm-title-muted { color: var(--cm-muted); font-weight: 400; margin-right: 6px; }
.cm-live { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: var(--cm-ink-2); background: #fff; border-radius: 999px; padding: 3px 9px 3px 7px; }
.cm-live i { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; display: inline-block; }
.cm-header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

.cm-select-wrap { position: relative; }
.cm-select { display: inline-flex; align-items: center; gap: 10px; border: 1px solid var(--cm-line); background: #fff; border-radius: 999px; padding: 10px 16px; font-weight: 600; cursor: pointer; }
.cm-caret { width: 4px; height: 4px; border-radius: 50%; background: var(--cm-ink); display: inline-block; }
.cm-menu { position: absolute; right: 0; top: calc(100% + 6px); background: #fff; border: 1px solid var(--cm-line); border-radius: 12px; padding: 6px; z-index: 10; min-width: 170px; box-shadow: 0 10px 28px rgba(20, 20, 40, .1); }
.cm-menu button { width: 100%; text-align: left; border: 0; background: none; padding: 8px 10px; border-radius: 8px; cursor: pointer; }
.cm-menu button:hover, .cm-menu button.is-active { background: var(--cm-primary-soft); color: var(--cm-primary); }

/* ---------- Botones ---------- */
.cm-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 0; border-radius: 999px; padding: 10px 18px; font-weight: 600; font-size: 13px; cursor: pointer; white-space: nowrap; transition: opacity .15s, transform .1s; }
.cm-btn:hover { opacity: .88; }
.cm-btn:active { transform: scale(.98); }
.cm-btn-sm { padding: 7px 13px; font-size: 12px; }
.cm-btn-dark { background: var(--cm-dark); color: #fff; }
.cm-btn-primary { background: var(--cm-primary); color: #fff; }
.cm-btn-light { background: #fff; color: var(--cm-dark); }
.cm-btn-ghost { background: rgba(255, 255, 255, .14); color: #fff; }
.cm-btn-soft { background: #f0f0f6; color: var(--cm-ink); }
.cm-block { width: 100%; margin-top: 16px; padding: 14px; }
.cm-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.cm-actions-end { margin-top: 18px; }

/* ---------- Cards ---------- */
.cm-card { background: var(--cm-card); border-radius: 22px; padding: 22px; box-shadow: 0 1px 2px rgba(20, 20, 40, .04); min-width: 0; }
.cm-wide { padding: 22px 24px; }
.cm-card-dark { background: radial-gradient(120% 90% at 100% 0%, #2a2150 0%, #14122a 45%, #0d0d18 100%); color: #fff; }
.cm-card-dark .cm-sub { color: #a3a3b8; }
.cm-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
.cm-card-head.cm-center { align-items: center; }
.cm-card-head.cm-wrap { flex-wrap: wrap; }
.cm-head-text { min-width: 0; flex: 1; }
.cm-root h2 { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.cm-eyebrow { font-size: 10.5px; letter-spacing: .14em; color: var(--cm-muted); font-weight: 600; }
.cm-card-dark .cm-eyebrow { color: #c9c9dc; }
.cm-icon { width: 34px; height: 34px; border-radius: 50%; background: #f0f0f6; color: #a9a9bb; display: grid; place-items: center; flex: none; font-weight: 700; font-size: 14px; }
.cm-icon-yellow { background: var(--cm-yellow-soft); color: var(--cm-yellow); }
.cm-icon-green { background: var(--cm-green-soft); color: var(--cm-red); }
.cm-icon-ghost { background: rgba(255, 255, 255, .14); color: #fff; }
.cm-big { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-variant-numeric: tabular-nums; }

/* ---------- KPIs ---------- */
.cm-kpis { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
@container (min-width: 500px) {
  .cm-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* ---------- Pills / tags ---------- */
.cm-pill { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 999px; letter-spacing: 0; }
.cm-pill-green { background: var(--cm-green-soft); color: var(--cm-green); }
.cm-pill-yellow { background: var(--cm-yellow-soft); color: var(--cm-yellow); }
.cm-pill-red { background: var(--cm-red-soft); color: var(--cm-red); }
.cm-pill-soft { background: #f0f0f6; color: var(--cm-muted); }
.cm-pill-ghost { background: rgba(255, 255, 255, .14); color: #fff; }
.cm-pill-primary { background: var(--cm-primary); color: #fff; }
.cm-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.cm-tag { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 8px; }
.cm-tag-blue { background: var(--cm-blue-soft); color: var(--cm-blue); }
.cm-tag-red { background: var(--cm-red-soft); color: var(--cm-red); }
.cm-tag-yellow { background: var(--cm-yellow-soft); color: var(--cm-yellow); }
.cm-tag-dark { background: var(--cm-dark); color: #fff; }
.cm-chip { font-size: 11px; font-weight: 600; padding: 6px 12px; border-radius: 999px; }
.cm-chip-red { background: var(--cm-red-soft); color: var(--cm-red); }
.cm-chip-green { background: var(--cm-green-soft); color: var(--cm-green); }

/* ---------- Barras ---------- */
.cm-bars { display: flex; flex-direction: column; gap: 9px; margin-top: 16px; }
.cm-bars li { display: grid; grid-template-columns: minmax(0, 100px) minmax(0, 1fr) 34px; gap: 8px; align-items: center; font-size: 11.5px; }
.cm-bar-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cm-bars b { text-align: right; font-variant-numeric: tabular-nums; }
.cm-bars-dark li { grid-template-columns: 76px minmax(0, 1fr) 16px; }
.cm-bars-dark .cm-bar-label { color: #d6d6e6; }
.cm-track { height: 6px; border-radius: 99px; background: #ecebf6; overflow: hidden; min-width: 0; }
.cm-track > div { height: 100%; border-radius: 99px; background: #6f5cf6; }
.cm-bars-dark .cm-track { background: rgba(255, 255, 255, .12); }
.cm-bars-dark .cm-track > div { background: #7c6cff; }
.cm-track-lg { height: 9px; }
.cm-alert { margin-top: 16px; background: var(--cm-red-soft); color: var(--cm-red); border-radius: 10px; padding: 10px 12px; font-size: 12px; display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }

/* ---------- Facturación ---------- */
.cm-row { display: flex; align-items: center; gap: 10px; margin-top: 16px; }
.cm-row-label { flex: 1; min-width: 0; font-weight: 600; font-size: 12px; }
.cm-row-amount { color: var(--cm-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.cm-card .cm-tags { margin-top: 12px; }
.cm-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--cm-primary-soft); color: var(--cm-primary); display: grid; place-items: center; font-size: 10px; font-weight: 700; flex: none; }
.cm-avatar-dark { background: var(--cm-dark); color: #fff; }

/* ---------- Tiempo de respuesta ---------- */
.cm-spark { width: 100%; height: 64px; margin-top: 12px; display: block; }
.cm-axis { display: flex; justify-content: space-between; color: var(--cm-muted); font-size: 11px; margin-top: 4px; }
.cm-axis-wide { margin-top: 6px; }
.cm-mini-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
.cm-mini { background: var(--cm-soft); border-radius: 10px; padding: 9px 9px; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cm-mini small { color: var(--cm-muted); font-size: 10.5px; white-space: nowrap; }
.cm-mini b { font-size: 12px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.cm-mini-red { background: var(--cm-red-soft); }
.cm-mini-red small, .cm-mini-red b { color: var(--cm-red); }

/* ---------- Retención ---------- */
.cm-seg { background: #f0f0f6; border-radius: 999px; padding: 3px; display: flex; flex: none; }
.cm-seg button { border: 0; background: none; padding: 6px 14px; border-radius: 999px; cursor: pointer; font-weight: 600; font-size: 12px; color: var(--cm-muted); }
.cm-seg button.is-active { background: var(--cm-dark); color: #fff; }
.cm-chart { position: relative; margin-top: 14px; }
.cm-chart svg { display: block; width: 100%; height: auto; }
.cm-chip-fix { position: absolute; top: 0; transform: translateX(-50%); background: var(--cm-dark); color: #fff; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 8px; white-space: nowrap; z-index: 1; }
.cm-stats { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin-top: 18px; }
@container (min-width: 460px) {
  .cm-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
.cm-stat { background: var(--cm-soft); border: 1px solid #f0f0f5; border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.cm-stat small { color: var(--cm-muted); font-size: 10.5px; letter-spacing: .12em; }
.cm-stat b { font-size: 18px; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
.cm-stat em { font-style: normal; font-size: 12px; }
.cm-stat-accent { background: var(--cm-primary-soft); border-color: #e2dcff; }
.cm-link { align-self: flex-start; border: 0; background: none; padding: 0; color: var(--cm-primary); font-size: 12px; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }

/* ---------- Tickets ---------- */
.cm-tickets { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.cm-ticket { position: relative; border: 1px solid var(--cm-line); border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
.cm-dot { position: absolute; top: 16px; right: 16px; width: 7px; height: 7px; border-radius: 50%; }
.cm-ticket-head { display: flex; gap: 10px; align-items: center; padding-right: 20px; }
.cm-ticket-head > div { min-width: 0; }
.cm-ticket-foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.cm-banner { margin-top: 12px; background: var(--cm-soft); border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; font-weight: 500; }

/* ---------- Obras ---------- */
.cm-projects { display: flex; flex-direction: column; gap: 14px; margin-top: 14px; }
.cm-project-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.cm-project-text { flex: 1; min-width: 0; }
.cm-pct { font-variant-numeric: tabular-nums; }

/* ---------- Agentes ---------- */
.cm-agents { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
.cm-agent { border: 1px solid var(--cm-line); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.cm-agent-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.cm-agent-bar { display: flex; flex-direction: column; gap: 6px; }
.cm-agent-bar small { align-self: flex-end; }

/* ---------- Tabla ---------- */
.cm-table-wrap { overflow-x: auto; margin-top: 6px; }
.cm-table { width: 100%; min-width: 780px; border-collapse: collapse; }
.cm-table th { text-align: left; font-size: 10.5px; letter-spacing: .12em; color: var(--cm-muted); padding: 10px 10px 10px 0; border-bottom: 1px solid var(--cm-line); font-weight: 600; white-space: nowrap; }
.cm-table td { padding: 14px 10px 14px 0; border-bottom: 1px solid var(--cm-line); vertical-align: middle; }
.cm-table tbody tr:last-child td { border-bottom: 0; }
.cm-cell { display: flex; align-items: center; gap: 10px; white-space: nowrap; }
.cm-status { display: inline-block; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 8px; letter-spacing: .05em; white-space: nowrap; }
.cm-status-riesgo { background: var(--cm-red-soft); color: var(--cm-red); }
.cm-status-oportunidad { background: var(--cm-green-soft); color: var(--cm-green); }
.cm-status-estable { background: var(--cm-yellow-soft); color: var(--cm-yellow); }

/* ---------- Insights ---------- */
.cm-insights { background: radial-gradient(110% 120% at 100% 100%, #2a2150 0%, #14122a 40%, #0d0d18 100%); color: #fff; border-radius: 22px; padding: 22px 24px; }
.cm-insights-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
.cm-insights-head small { color: #a3a3b8; font-size: 11.5px; }
.cm-insights-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
@container (min-width: 520px) {
  .cm-insights-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
.cm-insight { background: rgba(255, 255, 255, .05); border: 1px solid rgba(255, 255, 255, .09); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.cm-insight-card-ghost { background: linear-gradient(160deg, rgba(124, 92, 255, .38), rgba(124, 92, 255, .1)); border-color: rgba(160, 140, 255, .3); }
.cm-insight small { color: #b4b4c8; letter-spacing: .12em; font-size: 10.5px; font-weight: 600; }
.cm-insight p { font-size: 12.5px; line-height: 1.5; flex: 1; color: #e6e6f2; }
.cm-insight .cm-btn { align-self: flex-start; }
.cm-insight-light { background: #fff; color: var(--cm-dark); }
.cm-insight-primary { background: var(--cm-primary); color: #fff; }
.cm-insight-ghost { background: rgba(255, 255, 255, .16); color: #fff; }

@media (max-width: 480px) {
  .cm-root { padding: 16px; }
  .cm-wide, .cm-card { padding: 18px; }
  .cm-big { font-size: 26px; }
}

@media (prefers-reduced-motion: reduce) {
  .cm-btn { transition: none; }
}
````

## File: workspaces/36-centro-mando/CentroMando.tsx
````typescript
// apps/web/src/workspaces/35-centro-mando/CentroMando.tsx
import { useMemo, useState } from 'react';
import './centro-mando.css';
import type {
  CentroMandoAction,
  CentroMandoData,
  ClientStatus,
  DateRange,
} from './types';
import { CENTRO_MANDO_MOCK, RANGE_LABEL, RANGE_START } from './data';

const RANGES: DateRange[] = ['7d', '30d', '90d'];
const FIX_INDEX = 2;

const STATUS_LABEL: Record<ClientStatus, string> = {
  riesgo: 'RIESGO',
  oportunidad: 'OPORTUNIDAD',
  estable: 'ESTABLE',
};

type Props = {
  data?: CentroMandoData;
  onAction?: (action: CentroMandoAction, payload?: unknown) => void;
  initialRange?: DateRange;
};

/* ---------- iconos ---------- */
const IconBubble = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
  </svg>
);
const IconBolt = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
    <path d="M13.2 2 5 13.5h5.2L9.4 22 18 10.2h-5.4L13.2 2Z" />
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
const IconSpark = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5 14 9l6.5 2L14 13l-2 6.5L10 13l-6.5-2L10 9l2-6.5Z" />
  </svg>
);

/* ---------- gráficos ---------- */
function Sparkline({ values }: { values: number[] }) {
  const w = 280;
  const h = 64;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - 6 - ((v - min) / (max - min || 1)) * (h - 14),
  }));
  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const end = pts[pts.length - 1];
  return (
    <svg className="cm-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={line}
        fill="none"
        stroke="#16b364"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={end.x - 0.5}
        x2={end.x - 0.5}
        y1={end.y}
        y2={h}
        stroke="#16b364"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const RET_W = 760;
const RET_H = 190;
const RET_PAD_X = 30;
const RET_TOP = 40;
const RET_BOTTOM = 26;

function retentionPoints(values: number[]) {
  const min = 55;
  const max = 100;
  return values.map((v, i) => ({
    x: RET_PAD_X + (i / (values.length - 1)) * (RET_W - RET_PAD_X * 2),
    y: RET_TOP + (1 - (v - min) / (max - min)) * (RET_H - RET_TOP - RET_BOTTOM),
  }));
}

function RetentionChart({ values, fixLabel }: { values: number[]; fixLabel: string }) {
  const pts = retentionPoints(values);
  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const base = RET_H - 8;
  const area = `${pts[0].x},${base} ${line} ${pts[pts.length - 1].x},${base}`;
  const fix = pts[Math.min(FIX_INDEX, pts.length - 1)];
  return (
    <div className="cm-chart">
      <span
        className="cm-chip-fix"
        style={{ left: `${(fix.x / RET_W) * 100}%` }}
      >
        {fixLabel}
      </span>
      <svg viewBox={`0 0 ${RET_W} ${RET_H}`} role="img" aria-label="Retención en el rango seleccionado">
        <defs>
          <linearGradient id="cm-ret-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#cm-ret-grad)" />
        <line
          x1={fix.x}
          x2={fix.x}
          y1={RET_TOP - 12}
          y2={fix.y}
          stroke="#7c5cff"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <polyline points={line} fill="none" stroke="#7c5cff" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === FIX_INDEX ? 6 : 4.5}
            fill="#7c5cff"
            stroke="#ffffff"
            strokeWidth="2.5"
          />
        ))}
      </svg>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function CentroMando({
  data = CENTRO_MANDO_MOCK,
  onAction,
  initialRange = '30d',
}: Props) {
  const [range, setRange] = useState<DateRange>(initialRange);
  const [menuOpen, setMenuOpen] = useState(false);

  const { kpis } = data;
  const retention = useMemo(() => data.retention[range], [data.retention, range]);
  const act = (a: CentroMandoAction, payload?: unknown) => () => onAction?.(a, payload);
  const changeRange = (r: DateRange) => {
    setRange(r);
    onAction?.('range-change', r);
  };

  const riskChip = data.clients.find((c) => c.status === 'riesgo');
  const oppChip = data.clients.find((c) => c.status === 'oportunidad');

  return (
    <div className="cm-root">
      {/* ---------- Header ---------- */}
      <header className="cm-header">
        <h1>
          Centro de Mando
          <span className="cm-title-muted"> · Todas las empresas</span>
          <span className="cm-live"><i /> Live</span>
        </h1>
        <div className="cm-header-actions">
          <div className="cm-select-wrap">
            <button
              type="button"
              className="cm-select"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {RANGE_LABEL[range]}
              <span className="cm-caret" aria-hidden="true" />
            </button>
            {menuOpen && (
              <ul className="cm-menu" role="listbox">
                {RANGES.map((r) => (
                  <li key={r} role="option" aria-selected={r === range}>
                    <button
                      type="button"
                      className={r === range ? 'is-active' : ''}
                      onClick={() => {
                        changeRange(r);
                        setMenuOpen(false);
                      }}
                    >
                      {RANGE_LABEL[r]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" className="cm-btn cm-btn-dark" onClick={act('export-ai')}>
            <IconArrow /> Exportar con IA
          </button>
        </div>
      </header>

      {/* ---------- KPIs ---------- */}
      <section className="cm-kpis" aria-label="Indicadores clave">
        <article className="cm-card">
          <div className="cm-card-head">
            <span className="cm-eyebrow">MENSAJES / DÍA</span>
            <span className="cm-icon"><IconBubble /></span>
          </div>
          <div className="cm-big">
            {kpis.messages.perDay}
            <span className="cm-pill cm-pill-green">{kpis.messages.delta}</span>
          </div>
          <p className="cm-sub">vs mes anterior</p>
          <ul className="cm-bars">
            {data.messages.map((m) => (
              <li key={m.name}>
                <span className="cm-bar-label">{m.name}</span>
                <div className="cm-track"><div style={{ width: `${m.pct}%` }} /></div>
                <b>{m.msgs}/d</b>
              </li>
            ))}
          </ul>
          <div className="cm-alert">
            <b>{kpis.messages.alertLevel}</b>
            <span>{kpis.messages.alertText}</span>
          </div>
        </article>

        <article className="cm-card">
          <div className="cm-card-head">
            <span className="cm-eyebrow">FACTURACIÓN BLOQUEADA</span>
            <span className="cm-icon cm-icon-yellow">€</span>
          </div>
          <div className="cm-big">
            {kpis.billing.blocked}
            <span className="cm-pill cm-pill-yellow">{kpis.billing.invoices} facturas</span>
          </div>
          <p className="cm-sub">{kpis.billing.note}</p>
          <div className="cm-row">
            <span className="cm-avatar cm-avatar-dark">{kpis.billing.featured.avatar}</span>
            <span className="cm-row-label">{kpis.billing.featured.label}</span>
            <span className="cm-row-amount">{kpis.billing.featured.amount}</span>
          </div>
          <p className="cm-sub cm-indent">{kpis.billing.more}</p>
          <div className="cm-tags">
            {kpis.billing.tags.map((t) => (
              <span key={t.label} className={`cm-tag cm-tag-${t.tone}`}>{t.label}</span>
            ))}
          </div>
          <button type="button" className="cm-btn cm-btn-primary cm-block" onClick={act('resolve-billing')}>
            Resolver con IA →
          </button>
        </article>

        <article className="cm-card">
          <div className="cm-card-head">
            <span className="cm-eyebrow">TIEMPO MEDIO RESPUESTA</span>
            <span className="cm-icon cm-icon-green"><IconBolt /></span>
          </div>
          <div className="cm-big cm-green">
            {kpis.response.value}
            <span className="cm-pill cm-pill-green">{kpis.response.delta}</span>
          </div>
          <p className="cm-sub cm-green">{kpis.response.note}</p>
          <Sparkline values={kpis.response.spark} />
          <div className="cm-axis"><span>7d</span><span>15d</span><span>Hoy</span></div>
          <div className="cm-mini-grid">
            <div className="cm-mini"><small>Bot</small><b>{kpis.response.bot}</b></div>
            <div className="cm-mini"><small>Humano</small><b>{kpis.response.human}</b></div>
            <div className="cm-mini cm-mini-red"><small>Fuera hrs</small><b>{kpis.response.offHours}</b></div>
          </div>
        </article>

        <article className="cm-card cm-card-dark">
          <div className="cm-card-head">
            <span className="cm-eyebrow">LTV TOTAL PIPELINE</span>
            <span className="cm-icon cm-icon-ghost"><IconArrow /></span>
          </div>
          <div className="cm-big">
            {kpis.pipeline.total}
            <span className="cm-pill cm-pill-ghost">{kpis.pipeline.clients} clientes</span>
          </div>
          <p className="cm-sub">{kpis.pipeline.avgTicket}</p>
          <ul className="cm-bars cm-bars-dark">
            {data.pipeline.map((s) => (
              <li key={s.label}>
                <span className="cm-bar-label">{s.label}</span>
                <div className="cm-track"><div style={{ width: s.w }} /></div>
                <b>{s.val}</b>
              </li>
            ))}
          </ul>
          <div className="cm-actions cm-actions-end">
            <button type="button" className="cm-btn cm-btn-light cm-btn-sm" onClick={act('view-funnel')}>Ver funnel</button>
            <button type="button" className="cm-btn cm-btn-ghost cm-btn-sm" onClick={act('export-pipeline')}>Exportar</button>
          </div>
        </article>
      </section>
      {/* ---------- Retención / Churn ---------- */}
      <section className="cm-card cm-wide">
        <div className="cm-card-head">
          <div className="cm-head-text">
            <h2>Retención / Churn</h2>
            <p className="cm-sub">{kpis.retention.headline}</p>
          </div>
          <div className="cm-seg" role="tablist" aria-label="Rango de retención">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={r === range}
                className={r === range ? 'is-active' : ''}
                onClick={() => changeRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <RetentionChart values={retention} fixLabel={kpis.retention.fixLabel} />
        <div className="cm-axis cm-axis-wide"><span>{RANGE_START[range]}</span><span>Hoy</span></div>
        <div className="cm-stats">
          <div className="cm-stat">
            <small>RETENCIÓN</small>
            <b>{kpis.retention.value}</b>
            <em className="cm-green">{kpis.retention.note}</em>
          </div>
          <div className="cm-stat">
            <small>CHURN MENSUAL</small>
            <b>{kpis.retention.churn}</b>
            <em className="cm-muted">{kpis.retention.churnNote}</em>
          </div>
          <div className="cm-stat cm-stat-accent">
            <small>EQUIPO GROWTH</small>
            <b>{kpis.retention.team}</b>
            <button type="button" className="cm-link" onClick={act('view-thread')}>{kpis.retention.teamNote}</button>
          </div>
        </div>
      </section>

      {/* ---------- Tickets críticos ---------- */}
      <section className="cm-card cm-wide">
        <div className="cm-card-head cm-center">
          <h2>
            Tickets críticos
            <span className="cm-pill cm-pill-red">{data.tickets.length}</span>
          </h2>
          <button type="button" className="cm-btn cm-btn-dark cm-btn-sm" onClick={act('view-queue')}>Ver cola</button>
        </div>
        <ul className="cm-tickets">
          {data.tickets.map((t) => (
            <li key={t.name} className="cm-ticket">
              <span className="cm-dot" style={{ background: t.dot }} aria-hidden="true" />
              <div className="cm-ticket-head">
                <span className="cm-avatar">{initials(t.name)}</span>
                <div>
                  <b>{t.name}</b>
                  <p className="cm-sub">{t.company} · {t.issue}</p>
                </div>
              </div>
              <div className="cm-ticket-foot">
                <div className="cm-tags">
                  <span className={`cm-tag cm-tag-${t.badgeColor}`}>{t.badge}</span>
                  <span className="cm-tag cm-tag-dark">{t.urgency}</span>
                </div>
                <small className="cm-muted">{t.time}</small>
              </div>
            </li>
          ))}
        </ul>
        <div className="cm-banner">
          <span>23% respuestas fuera horario fallando</span>
          <button type="button" className="cm-btn cm-btn-soft cm-btn-sm" onClick={act('fix-bot')}>Fix bot</button>
        </div>
      </section>

      {/* ---------- Obras activas ---------- */}
      <section className="cm-card cm-wide">
        <div className="cm-card-head cm-center">
          <h2>Obras activas · health</h2>
          <div className="cm-actions">
            <span className="cm-pill cm-pill-soft">{data.projects.length} obras</span>
            <button type="button" className="cm-btn cm-btn-dark cm-btn-sm" onClick={act('generate-report')}>Generar reporte</button>
          </div>
        </div>
        <ul className="cm-projects">
          {data.projects.map((p) => (
            <li key={p.name}>
              <div className="cm-project-head">
                <span className="cm-avatar">{p.avatar}</span>
                <div className="cm-project-text">
                  <b>{p.name}</b>
                  <p className="cm-sub">{p.owner} · {p.alert}</p>
                </div>
                <b className="cm-pct">{p.pct}%</b>
              </div>
              <div
                className="cm-track cm-track-lg"
                role="progressbar"
                aria-valuenow={p.pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={p.name}
              >
                <div style={{ width: `${p.pct}%`, background: p.color }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Agentes performance ---------- */}
      <section className="cm-card cm-wide">
        <div className="cm-card-head cm-center">
          <h2>Agentes performance</h2>
          <span className="cm-pill cm-pill-green">{data.agents.length} activos</span>
        </div>
        <ul className="cm-agents">
          {data.agents.map((a) => (
            <li key={a.name} className="cm-agent">
              <div className="cm-agent-head">
                <b>{a.name}</b>
                <span className={`cm-pill ${a.status === 'ok' ? 'cm-pill-green' : 'cm-pill-yellow'}`}>
                  {a.conf}% confianza
                </span>
              </div>
              <p className="cm-sub">{a.desc}</p>
              <div className="cm-agent-bar">
                <div className="cm-track cm-track-lg"><div style={{ width: `${a.conf}%` }} /></div>
                <small className="cm-muted">{a.tasks} tareas</small>
              </div>
              <div className="cm-actions">
                <button type="button" className="cm-btn cm-btn-soft cm-btn-sm" onClick={act('edit-agent', a.name)}>Editar agente</button>
                <button type="button" className="cm-btn cm-btn-dark cm-btn-sm" onClick={act('view-logs', a.name)}>Ver logs</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Top clientes ---------- */}
      <section className="cm-card cm-wide">
        <div className="cm-card-head cm-center cm-wrap">
          <h2>Top clientes riesgo / oportunidad</h2>
          <div className="cm-actions">
            {riskChip && <span className="cm-chip cm-chip-red">{riskChip.detail}</span>}
            {oppChip && <span className="cm-chip cm-chip-green">{oppChip.detail}</span>}
          </div>
        </div>
        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>CLIENTE</th>
                <th>EMPRESA</th>
                <th>LTV</th>
                <th>ESTADO</th>
                <th>PRÓXIMO PASO IA</th>
                <th>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {data.clients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="cm-cell">
                      <span className="cm-avatar">{c.avatar}</span>
                      <b>{c.name}</b>
                    </div>
                  </td>
                  <td>{c.company}</td>
                  <td><b>{c.ltv}</b></td>
                  <td><span className={`cm-status cm-status-${c.status}`}>{STATUS_LABEL[c.status]}</span></td>
                  <td className="cm-muted">{c.next}</td>
                  <td>
                    <button type="button" className="cm-btn cm-btn-dark cm-btn-sm" onClick={act('client-action', c.id)}>
                      {c.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Insights IA ---------- */}
      <section className="cm-insights">
        <div className="cm-insights-head">
          <span className="cm-icon cm-icon-ghost"><IconSpark /></span>
          <h2>Insights IA auto-generados</h2>
          <span className="cm-pill cm-pill-primary">{data.insights.length} nuevos</span>
          <small>{data.insightsMeta}</small>
        </div>
        <div className="cm-insights-grid">
          {data.insights.map((i) => (
            <article key={i.tag} className={`cm-insight cm-insight-card-${i.variant}`}>
              <small>{i.tag}</small>
              <p>{i.body}</p>
              <button
                type="button"
                className={`cm-btn cm-btn-sm cm-insight-${i.variant}`}
                onClick={act('insight-cta', i.tag)}
              >
                {i.cta}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
````

## File: workspaces/36-centro-mando/data.ts
````typescript
// apps/web/src/workspaces/35-centro-mando/data.ts
import type { CentroMandoData, DateRange } from './types';

export const RANGE_LABEL: Record<DateRange, string> = {
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  '90d': 'Últimos 90 días',
};

export const RANGE_START: Record<DateRange, string> = {
  '7d': 'Hace 7d',
  '30d': 'Hace 30d',
  '90d': 'Hace 90d',
};

export const CENTRO_MANDO_MOCK: CentroMandoData = {
  kpis: {
    messages: {
      perDay: 247,
      delta: '+12%',
      alertLevel: 'ALTA',
      alertText: 'Equipo desbordado · automatizar WhatsApp',
    },
    billing: {
      blocked: '€4.280',
      invoices: 4,
      note: 'No sincronizan con Holded',
      featured: { avatar: 'CR', label: 'Carlos Ruiz · Factura 234', amount: '€1.240' },
      more: '+ 3 más: Gil Proyectos, Torres, Navarro',
      tags: [
        { label: 'Holded API error', tone: 'blue' },
        { label: 'Autónomos 20/mes', tone: 'red' },
      ],
    },
    response: {
      value: '2h 14m',
      delta: '-18%',
      note: 'Gracias a agente · -42m vs mes anterior',
      spark: [10, 13, 11, 16, 14, 19, 22, 26, 31, 40],
      bot: '34s',
      human: '1h 58m',
      offHours: '23% fail',
    },
    pipeline: { total: '€84.2k', clients: 24, avgTicket: '€3.5k ticket medio' },
    retention: {
      headline: 'Equipo Growth retención subió 12% después del fix · referencia WhatsApp screenshot',
      value: '82%',
      note: '+12% tras fix',
      churn: '4.2%',
      churnNote: '-1.1% vs ant',
      team: 'WhatsApp + Fix',
      teamNote: 'Ver thread',
      fixLabel: 'Fix deploy · +12% ↑',
    },
  },

  messages: [
    { name: 'Soluciones Limpieza', msgs: 60, pct: 78 },
    { name: 'ACME Obras', msgs: 42, pct: 56 },
    { name: 'Clínica Torres', msgs: 31, pct: 40 },
  ],

  pipeline: [
    { label: 'Lead', val: 6, w: '22%' },
    { label: 'Presupuesto', val: 8, w: '48%' },
    { label: 'Obra', val: 5, w: '72%' },
    { label: 'Facturado', val: 5, w: '92%' },
  ],

  // 5 puntos por rango; el marcador "Fix deploy" cae en el índice 2.
  retention: {
    '7d': [78.5, 79.4, 80.6, 81.3, 82],
    '30d': [74, 75.5, 77, 79.5, 82],
    '90d': [66, 69, 74, 79, 82],
  },

  tickets: [
    {
      name: 'Ana Torres', company: 'Clínica Torres', issue: 'Bot no responde', time: '18h abierto',
      badge: 'Soporte', badgeColor: 'blue', urgency: 'URGENCIA', dot: '#ef4444',
    },
    {
      name: 'Sofía Navarro', company: 'Navarro Retail', issue: 'Cobro duplicado riesgo churn', time: '5h abierto',
      badge: 'Reclamación', badgeColor: 'red', urgency: 'ALTA', dot: '#f59e0b',
    },
    {
      name: 'Roberto Díaz', company: 'Díaz Instalaciones', issue: 'Factura Holded no sync', time: '2d abierto',
      badge: 'Pagos', badgeColor: 'yellow', urgency: 'MEDIA', dot: '#7c5cff',
    },
  ],

  projects: [
    { name: 'Tenerife Sur', pct: 78, owner: 'Marta', avatar: 'MS', alert: 'Retraso 1 día por secador', color: '#6f5cf6' },
    { name: 'Residencial Las Palmas', pct: 64, owner: 'Javier Gil', avatar: 'JG', alert: 'Falta lechada · 15 obras', color: '#fb8c5a' },
    { name: 'Tienda Centro Comercial', pct: 91, owner: 'Carlos', avatar: 'CR', alert: 'En tiempo', color: '#16b364' },
    { name: 'Villa Tagoror', pct: 42, owner: 'Roberto', avatar: 'RL', alert: 'Esperando material', color: '#6f5cf6' },
    { name: 'Oficinas ACME', pct: 85, owner: 'Sofía', avatar: 'SN', alert: 'Finalizado', color: '#6f5cf6' },
  ],

  agents: [
    { name: 'Agente Obra', conf: 94, tasks: 3, status: 'ok', desc: 'Checklists, progreso, alertas' },
    { name: 'Agente Presupuestos', conf: 89, tasks: 5, status: 'ok', desc: '3 planes + demo, Holded' },
    { name: 'Agente Soporte', conf: 76, tasks: 8, status: 'warn', desc: 'Fuera horario fallando · Ana Torres caso' },
  ],

  clients: [
    {
      id: 'c1', name: 'Roberto León', company: 'León Constructora', ltv: '€15.4k', status: 'riesgo',
      next: 'Llamada rescate · guión IA', action: 'Llamar', avatar: 'RL',
      detail: 'Roberto León €15.4k silencio 12d riesgo churn', amount: '€15.4k',
    },
    {
      id: 'c2', name: 'Marta Soler', company: 'Soluciones Limpieza', ltv: '€4.2k', status: 'oportunidad',
      next: 'Enviar propuesta 3 planes + demo…', action: 'Enviar propuesta', avatar: 'MS',
      detail: 'Marta Soler oportunidad €8.4k', amount: '€8.4k',
    },
    {
      id: 'c3', name: 'Javier Gil', company: 'Gil Proyectos', ltv: '€12.4k', status: 'estable',
      next: 'Centralizar info · checklist obra', action: 'Generar checklist', avatar: 'JG',
      detail: 'Javier Gil estable', amount: '€12.4k',
    },
    {
      id: 'c4', name: 'Ana Torres', company: 'Clínica Torres', ltv: '€6.8k', status: 'riesgo',
      next: 'Fix bot fuera horario + disculpa', action: 'Resolver con IA', avatar: 'AT',
      detail: 'Ana Torres bot caído', amount: '€6.8k',
    },
    {
      id: 'c5', name: 'Sofía Navarro', company: 'Navarro Retail', ltv: '€9.1k', status: 'riesgo',
      next: 'Revisar cobro duplicado Holded', action: 'Revisar factura', avatar: 'SN',
      detail: 'Sofía Navarro cobro duplicado', amount: '€9.1k',
    },
  ],

  insights: [
    {
      tag: 'OPORTUNIDAD AUTOMATIZACIÓN',
      body: 'Detectamos: 60 msgs/día en Soluciones Limpieza = oportunidad automatización WhatsApp + Holded. Equipo Growth valida 40% ahorro tiempo.',
      cta: 'Crear flujo IA',
      variant: 'light',
    },
    {
      tag: 'BLOQUEO FACTURACIÓN',
      body: '20 facturas/mes autónomos bloqueadas por sync. Holded API error 422 en campo autónomo. Carlos Ruiz lidera fix.',
      cta: 'Resolver sync',
      variant: 'primary',
    },
    {
      tag: 'BOT FUERA HORARIO',
      body: 'Bot responde fuera de horario 23% del tiempo fallando. Caso Ana Torres. Agente Soporte necesita entrenamiento nuevo + fallback humano.',
      cta: 'Re-entrenar',
      variant: 'ghost',
    },
  ],
  insightsMeta: 'Actualizado hace 12 min · Modelo AGNTia v4.2',
};
````

## File: workspaces/36-centro-mando/index.ts
````typescript
export { default } from './CentroMando';
export * from './types';
````

## File: workspaces/36-centro-mando/README.md
````markdown
# 35 — Centro de Mando

Workspace de control operativo unificado. Vista unica de KPIs, retencion,
tickets criticos, obras activas, performance de agentes, top clientes e
insights IA para todas las empresas del tenant.

## Estructura

- CentroMando.tsx — componente raiz. Acepta data, onAction, initialRange.
- data.ts — CENTRO_MANDO_MOCK, RANGE_LABEL, RANGE_START.
- types.ts — CentroMandoData, CentroMandoAction, y tipos de dominio.
- centro-mando.css — estilos scoped bajo .cm-root.
- docs/ — ui-map, roadmap, spec.
- index.ts — export default from './CentroMando'.

## Uso

  import CentroMando from '@/workspaces/35-centro-mando';

  <CentroMando
    data={centroMandoData}
    initialRange="30d"
    onAction={(action, payload) => dispatch(action, payload)}
  />

## Acciones emitidas (CentroMandoAction)

export-ai, resolve-billing, view-funnel, export-pipeline, view-thread,
view-queue, fix-bot, generate-report, edit-agent, view-logs,
client-action, insight-cta, range-change.

## Estado

- UI: completa con datos mock.
- Backend: pendiente. CentroMandoData se servira desde un hook de datos real.
````

## File: workspaces/36-centro-mando/types.ts
````typescript
// apps/web/src/workspaces/35-centro-mando/types.ts
export type DateRange = '7d' | '30d' | '90d';

export type ClientStatus = 'riesgo' | 'oportunidad' | 'estable';

export type Client = {
  id: string;
  name: string;
  company: string;
  ltv: string;
  status: ClientStatus;
  next: string;
  action: string;
  avatar: string;
  detail: string;
  amount: string;
};

export type Project = {
  name: string;
  pct: number;
  owner: string;
  avatar: string;
  alert: string;
  color: string;
};

export type Ticket = {
  name: string;
  company: string;
  issue: string;
  time: string;
  badge: string;
  badgeColor: string;
  urgency: string;
  dot: string;
};

export type Agent = {
  name: string;
  conf: number;
  tasks: number;
  status: 'ok' | 'warn';
  desc: string;
};

export type Insight = {
  tag: string;
  body: string;
  cta: string;
  variant: 'light' | 'primary' | 'ghost';
};

export type MessageRow = { name: string; msgs: number; pct: number };
export type PipelineStage = { label: string; val: number; w: string };

/* ------------------------------------------------------------------ */
/* Añadidos: todo lo que antes estaba fijo en el JSX, ahora es dato.   */
/* Los tipos de arriba no cambian.                                     */
/* ------------------------------------------------------------------ */

export type Kpis = {
  messages: {
    perDay: number;
    delta: string;
    alertLevel: string;
    alertText: string;
  };
  billing: {
    blocked: string;
    invoices: number;
    note: string;
    featured: { avatar: string; label: string; amount: string };
    more: string;
    tags: { label: string; tone: 'blue' | 'red' }[];
  };
  response: {
    value: string;
    delta: string;
    note: string;
    spark: number[];
    bot: string;
    human: string;
    offHours: string;
  };
  pipeline: { total: string; clients: number; avgTicket: string };
  retention: {
    headline: string;
    value: string;
    note: string;
    churn: string;
    churnNote: string;
    team: string;
    teamNote: string;
    fixLabel: string;
  };
};

export type CentroMandoData = {
  kpis: Kpis;
  messages: MessageRow[];
  pipeline: PipelineStage[];
  retention: Record<DateRange, number[]>;
  tickets: Ticket[];
  projects: Project[];
  agents: Agent[];
  clients: Client[];
  insights: Insight[];
  insightsMeta: string;
};

export type CentroMandoAction =
  | 'export-ai'
  | 'resolve-billing'
  | 'view-funnel'
  | 'export-pipeline'
  | 'view-thread'
  | 'view-queue'
  | 'fix-bot'
  | 'generate-report'
  | 'edit-agent'
  | 'view-logs'
  | 'client-action'
  | 'insight-cta'
  | 'range-change';
````

## File: workspaces/centro-mando-context.md
````markdown
This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
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
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
components/
  ActiveProjectsPanel.tsx
  AgentPerformanceCard.tsx
  AgentsPerformancePanel.tsx
  AiActionButton.tsx
  AiInsightsPanel.tsx
  Avatar.tsx
  BlockedInvoiceList.tsx
  CentroMandoSidebar.tsx
  ChartAnnotation.tsx
  ClientDetailModal.tsx
  CriticalTicketsPanel.tsx
  DateRangePicker.tsx
  InsightCard.tsx
  KpiCard.tsx
  KpiGrid.tsx
  MiniBarList.tsx
  PipelineFunnel.tsx
  ProgressBar.tsx
  ProjectProgressRow.tsx
  RetentionChart.tsx
  RetentionStats.tsx
  SectionHeader.tsx
  Sparkline.tsx
  StatusBadge.tsx
  TicketCard.tsx
  Toast.tsx
  TopClientRow.tsx
  TopClientsPanel.tsx
  TopClientsTable.tsx
  UrgencyBadge.tsx
  WorkspaceHeader.tsx
docs/
  01-ui-map.md
  02-roadmap.md
  03-spec.md
hooks/
  useCentroMandoData.ts
  useClientSelection.ts
  useDateRange.ts
  useMobileMenu.ts
  useToast.ts
centro-mando.css
CentroMandoWorkspace.tsx
index.ts
README.md
types.ts
```

# Files

## File: components/ActiveProjectsPanel.tsx
```typescript
import type { Project } from '../types';
import { SectionHeader } from './SectionHeader';
import { ProjectProgressRow } from './ProjectProgressRow';
export function ActiveProjectsPanel({ projects, onReport }: { projects: Project[]; onReport: () => void }) {
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5">
      <SectionHeader title="Obras activas · health" actions={<><span className="text-[11px] px-2 py-1 rounded-full bg-[#F1F0FF]">{projects.length} obras</span><button onClick={onReport} className="text-[11px] h-7 px-3 rounded-full bg-[#111113] text-white">Generar reporte</button></>} />
      <div className="mt-5 space-y-4">
        {projects.map(o => <ProjectProgressRow key={o.name} o={o} />)}
      </div>
    </div>
  );
}
```

## File: components/AgentPerformanceCard.tsx
```typescript
import type { Agent } from '../types';
import { ProgressBar } from './ProgressBar';
type Props = { a: Agent; onEdit: () => void; onLogs: () => void };
export function AgentPerformanceCard({ a, onEdit, onLogs }: Props) {
  const confCls = a.status === 'ok' ? 'bg-[#D1FAE5] text-emerald-700' : 'bg-[#FEF3C7] text-amber-700';
  return (
    <div className="rounded-[14px] border border-[var(--border)] p-3">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium">{a.name}</div>
        <div className={'text-[11px] px-2 py-0.5 rounded-full font-medium ' + confCls}>{a.conf}% confianza</div>
      </div>
      <div className="text-[11px] text-[var(--muted)] mt-1">{a.desc}</div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1"><ProgressBar pct={a.conf} /></div>
        <span className="text-[11px] text-[var(--muted)]">{a.tasks} tareas</span>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={onEdit} className="h-7 px-3 rounded-full bg-[#F8F7FF] border border-[var(--border)] text-[11px] font-medium">Editar agente</button>
        <button onClick={onLogs} className="h-7 px-3 rounded-full bg-[#111113] text-white text-[11px]">Ver logs</button>
      </div>
    </div>
  );
}
```

## File: components/AgentsPerformancePanel.tsx
```typescript
import type { Agent } from '../types';
import { SectionHeader } from './SectionHeader';
import { AgentPerformanceCard } from './AgentPerformanceCard';
type Props = { agents: Agent[]; onEdit: (name: string) => void; onLogs: (name: string, conf: number) => void };
export function AgentsPerformancePanel({ agents, onEdit, onLogs }: Props) {
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5">
      <SectionHeader title="Agentes performance" actions={<span className="text-[10px] px-2 py-1 rounded-full bg-[#D1FAE5] text-emerald-700">{agents.length} activos</span>} />
      <div className="mt-5 space-y-4">
        {agents.map(a => (
          <AgentPerformanceCard key={a.name} a={a} onEdit={() => onEdit(a.name)} onLogs={() => onLogs(a.name, a.conf)} />
        ))}
      </div>
    </div>
  );
}
```

## File: components/AiActionButton.tsx
```typescript
type Props = { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'dark' };
export function AiActionButton({ children, onClick, variant = 'dark' }: Props) {
  const cls = variant === 'primary' ? 'bg-[#6D5BFF] text-white hover:brightness-105' : variant === 'ghost' ? 'bg-white/10 text-white border border-white/10' : 'bg-[#111113] text-white hover:opacity-90';
  return <button onClick={onClick} className={'h-8 px-3 rounded-full text-[11px] font-medium ' + cls}>{children}</button>;
}
```

## File: components/AiInsightsPanel.tsx
```typescript
import type { Insight } from '../types';
import { InsightCard } from './InsightCard';
type Props = { insights: Insight[]; onAction: (i: Insight) => void };
export function AiInsightsPanel({ insights, onAction }: Props) {
  return (
    <section className="rounded-[20px] bg-[#111113] text-white p-5 lg:p-6 border border-black relative overflow-hidden">
      <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-[#6D5BFF] opacity-30 blur-[36px]" />
      <div className="flex items-start gap-3 relative">
        <div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center text-[16px] shrink-0">✦</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-semibold">Insights IA auto-generados</h3>
            <span className="text-[10px] px-2 py-1 rounded-full bg-[#6D5BFF]">{insights.length} nuevos</span>
            <span className="text-[11px] text-white/60">Actualizado hace 12 min · Modelo AGNTia v4.2</span>
          </div>
          <div className="mt-3 grid md:grid-cols-3 gap-3">
            {insights.map(i => <InsightCard key={i.tag} i={i} onClick={() => onAction(i)} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
```

## File: components/Avatar.tsx
```typescript
type Props = { label: string; size?: number; tone?: 'lav' | 'dark' };
export function Avatar({ label, size = 32, tone = 'lav' }: Props) {
  const bg = tone === 'dark' ? 'bg-[#111113] text-white' : 'bg-[#F1F0FF] text-[#6D5BFF]';
  return (
    <div className={'rounded-full grid place-items-center text-[11px] font-bold shrink-0 ' + bg} style={{ width: size, height: size }}>
      {label}
    </div>
  );
}
```

## File: components/BlockedInvoiceList.tsx
```typescript
export function BlockedInvoiceList({ onResolve }: { onResolve: () => void }) {
  return (
    <>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-[12px]">
          <div className="w-6 h-6 rounded-full bg-[#111113] text-white grid place-items-center text-[10px] font-bold">CR</div>
          <span className="flex-1 truncate">Carlos Ruiz · Factura 234</span>
          <span className="text-[11px] text-[var(--muted)]">€1.240</span>
        </div>
        <div className="text-[11px] text-[var(--muted)] pl-8">+ 3 más: Gil Proyectos, Torres, Navarro</div>
        <div className="flex gap-1.5 pl-8 pt-1">
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#DBEAFE] text-blue-700">Holded API error</span>
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#FFE4E6] text-red-700">Autónomos 20/mes</span>
        </div>
      </div>
      <button onClick={onResolve} className="mt-4 w-full h-9 rounded-full bg-[#6D5BFF] text-white text-[12px] font-medium hover:brightness-105">Resolver con IA →</button>
    </>
  );
}
```

## File: components/CentroMandoSidebar.tsx
```typescript
type Props = { onNewChat: () => void; mobileOpen: boolean; onClose: () => void };
const NAV = [
  { label: 'Chat', icon: '💬', count: null },
  { label: 'Tareas', icon: '✓', count: '8' },
  { label: 'Documentos', icon: '📄', count: null },
  { label: 'Proyectos', icon: '📁', count: null },
  { label: 'Lo que sabe de tu negocio', icon: '🧠', count: null },
  { label: 'Equipo', icon: '👥', count: null },
  { label: 'Agentes', icon: '🤖', count: '3' },
  { label: 'CRM', icon: '📇', count: '24' },
  { label: 'Finanzas', icon: '€', count: null },
] as const;
export function CentroMandoSidebar({ onNewChat, mobileOpen, onClose }: Props) {
  return (
    <>
      <aside className={'fixed lg:static inset-y-0 left-0 z-40 w-[260px] bg-white border-r border-[var(--border)] flex flex-col transition-transform lg:translate-x-0 ' + (mobileOpen ? 'translate-x-0' : '-translate-x-full') + ' shadow-[0_8px_40px_rgba(0,0,0,0.08)] lg:shadow-none'}>
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[#111113] text-white flex items-center justify-center font-black text-[16px]">A</div>
            <div className="leading-none">
              <div className="font-semibold text-[14px] tracking-tight">Agente IA Pro</div>
              <div className="text-[10px] font-medium text-white bg-[#111113] inline-flex px-1.5 py-0.5 rounded-full mt-0.5">PRO</div>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <div className="w-5 h-5 rounded-full bg-[#EDE8FF] text-[#6D5BFF] grid place-items-center font-bold">AC</div>
            Agente activo · ACME
          </div>
          <button onClick={onNewChat} className="mt-5 w-full h-9 rounded-full bg-[#111113] text-white text-[13px] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition">
            <span className="text-[16px] leading-none">+</span> Nuevo chat
          </button>
          <div className="mt-6">
            <div className="text-[10px] tracking-[0.14em] font-semibold text-[var(--muted)] mb-3">WORKSPACE</div>
            <nav className="space-y-1">
              {NAV.map(i => (
                <div key={i.label} className="flex items-center gap-3 px-2.5 py-2 rounded-[12px] text-[13px] text-[#4B4B4F] hover:bg-[#F8F7FF] cursor-pointer">
                  <span className="w-5 text-center opacity-70">{i.icon}</span>
                  <span className="flex-1 truncate">{i.label}</span>
                  {i.count && <span className="text-[11px] bg-[#F1F0FF] text-[#6D5BFF] px-1.5 py-0.5 rounded-full font-medium">{i.count}</span>}
                </div>
              ))}
              <div className="flex items-center gap-3 px-2.5 py-2 rounded-[12px] text-[13px] bg-[#111113] text-white shadow-sm cursor-pointer">
                <span className="w-5 text-center">📊</span>
                <span className="flex-1 font-medium">Analítica</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </nav>
          </div>
        </div>
        <div className="mt-auto p-4 border-t border-[var(--border)]">
          <div className="rounded-[16px] bg-[#F8F7FF] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6D5BFF] text-white grid place-items-center text-[12px] font-bold">CR</div>
            <div>
              <div className="text-[12px] font-semibold">Carlos Ruiz</div>
              <div className="text-[11px] text-[var(--muted)]">Admin · Holded sync</div>
            </div>
          </div>
        </div>
      </aside>
      {mobileOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />}
    </>
  );
}
```

## File: components/ChartAnnotation.tsx
```typescript
export function ChartAnnotation({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <>
      <line x1={x} y1="30" x2={x} y2="95" stroke="#6D5BFF" strokeDasharray="4 4" opacity="0.6" />
      <g transform={'translate(' + (x + 12) + ',22)'}>
        <rect width="112" height="22" rx="11" fill="#111113" />
        <text x="10" y="14" fontSize="10" fill="white" fontWeight="600">{label}</text>
      </g>
      <circle cx={x} cy={y} r="6" fill="#6D5BFF" stroke="white" strokeWidth="2" />
    </>
  );
}
```

## File: components/ClientDetailModal.tsx
```typescript
import type { Client } from '../types';
import { StatusBadge } from './StatusBadge';
type Props = { client: Client; onClose: () => void; onGenerate: () => void };
export function ClientDetailModal({ client, onClose, onGenerate }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-[520px] bg-white rounded-t-[24px] md:rounded-[24px] border border-[var(--border)] shadow-[0_24px_64px_rgba(0,0,0,0.2)] p-6 max-h-[90vh] overflow-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EDE8FF] text-[#6D5BFF] grid place-items-center font-bold">{client.avatar}</div>
            <div>
              <div className="text-[16px] font-semibold">{client.name}</div>
              <div className="text-[12px] text-[var(--muted)]">{client.company} · {client.ltv}</div>
              <div className="mt-2 flex gap-2">
                <StatusBadge status={client.status} />
                <span className="text-[10px] px-2 py-1 rounded-full bg-[#F1F0FF] text-[#6D5BFF]">{client.amount}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F8F7FF] border border-[var(--border)] grid place-items-center">✕</button>
        </div>
        <div className="mt-5 rounded-[16px] bg-[#F8F7FF] p-4">
          <div className="text-[11px] tracking-widest font-semibold text-[var(--muted)]">DETALLE IA</div>
          <p className="text-[13px] leading-[1.6] mt-2">{client.detail}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[14px] border border-[var(--border)] p-3">
            <div className="text-[10px] text-[var(--muted)]">PRÓXIMO PASO</div>
            <div className="text-[12px] font-medium mt-1">{client.next}</div>
          </div>
          <div className="rounded-[14px] border border-[var(--border)] p-3">
            <div className="text-[10px] text-[var(--muted)]">ACCIÓN IA</div>
            <div className="text-[12px] font-medium mt-1">{client.action}</div>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onGenerate} className="flex-1 h-10 rounded-full bg-[#111113] text-white text-[13px] font-medium">Generar con IA →</button>
          <button onClick={onClose} className="h-10 px-5 rounded-full bg-[#F8F7FF] border border-[var(--border)] text-[13px] font-medium">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
```

## File: components/CriticalTicketsPanel.tsx
```typescript
import type { Ticket } from '../types';
import { SectionHeader } from './SectionHeader';
import { TicketCard } from './TicketCard';
type Props = { tickets: Ticket[]; onOpen: (name: string) => void; onFixBot: () => void; onVerCola: () => void };
export function CriticalTicketsPanel({ tickets, onOpen, onFixBot, onVerCola }: Props) {
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5 flex flex-col">
      <SectionHeader title={<>Tickets críticos <span className="w-5 h-5 rounded-full bg-[#FFE4E6] text-red-600 inline-grid place-items-center text-[11px] font-bold">{tickets.length}</span></>} actions={<button onClick={onVerCola} className="text-[11px] px-2.5 py-1 rounded-full bg-[#111113] text-white">Ver cola</button>} />
      <div className="mt-4 space-y-3">
        {tickets.map(t => <TicketCard key={t.name} t={t} onClick={() => onOpen(t.name)} />)}
      </div>
      <div className="mt-auto pt-4">
        <div className="rounded-[12px] bg-[#F8F7FF] p-3 flex items-center justify-between">
          <div className="text-[11px]"><span className="font-semibold">23%</span> respuestas fuera horario fallando</div>
          <button onClick={onFixBot} className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-[var(--border)]">Fix bot</button>
        </div>
      </div>
    </div>
  );
}
```

## File: components/DateRangePicker.tsx
```typescript
import type { DateRange } from '../types';
export function DateRangePicker({ range, onChange }: { range: DateRange; onChange: (r: DateRange) => void }) {
  return (
    <div className="flex p-1 rounded-full bg-[#F8F7FF] border border-[var(--border)]">
      {(['7d','30d','90d'] as DateRange[]).map(r => (
        <button key={r} onClick={() => onChange(r)} className={'px-3 h-7 rounded-full text-[12px] font-medium transition ' + (range === r ? 'bg-[#111113] text-white' : 'text-[var(--muted)] hover:text-[#111113]')}>{r}</button>
      ))}
    </div>
  );
}
```

## File: components/InsightCard.tsx
```typescript
import type { Insight } from '../types';
type Props = { i: Insight; onClick: () => void };
export function InsightCard({ i, onClick }: Props) {
  const btnCls = i.variant === 'light' ? 'bg-white text-black' : i.variant === 'primary' ? 'bg-[#6D5BFF] text-white' : 'bg-white/10 text-white border border-white/10';
  return (
    <div className="rounded-[14px] bg-white/5 border border-white/10 p-3">
      <div className="text-[11px] text-white/60 uppercase tracking-widest">{i.tag}</div>
      <p className="text-[12px] leading-[1.5] mt-2 text-white/90">{i.body}</p>
      <button onClick={onClick} className={'mt-3 h-7 px-3 rounded-full text-[11px] font-medium ' + btnCls}>{i.cta}</button>
    </div>
  );
}
```

## File: components/KpiCard.tsx
```typescript
import type { ReactNode } from 'react';
type Props = { label: string; children: ReactNode; dark?: boolean };
export function KpiCard({ label, children, dark }: Props) {
  if (dark) {
    return (
      <div className="rounded-[20px] bg-[#111113] text-white border border-black shadow-[0_12px_32px_rgba(17,17,19,0.18)] p-5 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#6D5BFF] opacity-20 blur-[24px]" />
        <div className="relative">
          <div className="text-[11px] tracking-[0.12em] font-semibold text-white/60">{label}</div>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5 flex flex-col">
      <div className="text-[11px] tracking-[0.12em] font-semibold text-[var(--muted)]">{label}</div>
      {children}
    </div>
  );
}
```

## File: components/KpiGrid.tsx
```typescript
import type { ReactNode } from 'react';
export function KpiGrid({ children }: { children: ReactNode }) {
  return <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{children}</section>;
}
```

## File: components/MiniBarList.tsx
```typescript
import type { MessageRow } from '../types';
export function MiniBarList({ rows }: { rows: MessageRow[] }) {
  return (
    <div className="space-y-2">
      {rows.map(r => (
        <div key={r.name} className="flex items-center gap-2">
          <div className="text-[11px] w-[110px] truncate text-[#3A3A3D]">{r.name}</div>
          <div className="flex-1 h-1.5 rounded-full bg-[#F1F0FF] overflow-hidden">
            <div className="h-full bg-[#6D5BFF] rounded-full" style={{ width: r.pct + '%' }} />
          </div>
          <div className="text-[11px] font-medium">{r.msgs}/d</div>
        </div>
      ))}
    </div>
  );
}
```

## File: components/PipelineFunnel.tsx
```typescript
import type { PipelineStage } from '../types';
export function PipelineFunnel({ stages }: { stages: PipelineStage[] }) {
  return (
    <div className="space-y-2">
      {stages.map(s => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="text-[11px] w-[72px] text-white/70">{s.label}</div>
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[#6D5BFF]" style={{ width: s.w }} />
          </div>
          <div className="text-[11px] font-medium w-4">{s.val}</div>
        </div>
      ))}
    </div>
  );
}
```

## File: components/ProgressBar.tsx
```typescript
type Props = { pct: number; color?: string };
export function ProgressBar({ pct, color = '#6D5BFF' }: Props) {
  return (
    <div className="h-2 rounded-full bg-[#F1F0FF] overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: pct + '%', background: color }} />
    </div>
  );
}
```

## File: components/ProjectProgressRow.tsx
```typescript
import type { Project } from '../types';
import { ProgressBar } from './ProgressBar';
export function ProjectProgressRow({ o }: { o: Project }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#EDE8FF] text-[#6D5BFF] grid place-items-center text-[10px] font-bold">{o.avatar}</div>
          <div>
            <div className="text-[13px] font-medium leading-none">{o.name}</div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">{o.owner} · {o.alert}</div>
          </div>
        </div>
        <div className="text-[12px] font-semibold">{o.pct}%</div>
      </div>
      <div className="mt-2"><ProgressBar pct={o.pct} color={o.color} /></div>
    </div>
  );
}
```

## File: components/RetentionChart.tsx
```typescript
import type { DateRange } from '../types';
import { ChartAnnotation } from './ChartAnnotation';
type Props = { data: number[]; range: DateRange };
export function RetentionChart({ data, range }: Props) {
  const annotationX = range === '7d' ? 260 : 300;
  const annotationY = range === '7d' ? 84 : 72;
  return (
    <div className="mt-6 relative">
      <svg viewBox="0 0 520 180" className="w-full h-[180px] overflow-visible">
        <defs>
          <linearGradient id="lav" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#EDE8FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EDE8FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0,1,2,3].map(i => <line key={i} x1="0" x2="520" y1={20 + i * 40} y2={20 + i * 40} stroke="#F1F0FF" strokeDasharray="4 6" />)}
        <path d={'M0,' + (180 - data[0] * 1.2) + ' ' + data.map((v, i) => 'L ' + (i / (data.length - 1)) * 520 + ',' + (180 - v * 1.2)).join(' ') + ' L 520,160 L 0,160 Z'} fill="url(#lav)" />
        <path d={'M0,' + (180 - data[0] * 1.2) + ' ' + data.map((v, i) => 'L ' + (i / (data.length - 1)) * 520 + ',' + (180 - v * 1.2)).join(' ')} fill="none" stroke="#6D5BFF" strokeWidth="2.5" strokeLinecap="round" />
        <ChartAnnotation x={annotationX} y={annotationY} label="Fix deploy · +12% ↑" />
        {data.map((v, i) => {
          if (i % 3 !== 0 && data.length > 7) return null;
          return <circle key={i} cx={(i / (data.length - 1)) * 520} cy={180 - v * 1.2} r="3.5" fill="#6D5BFF" />;
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
        <span>Hace {range}</span><span>Hoy</span>
      </div>
    </div>
  );
}
```

## File: components/RetentionStats.tsx
```typescript
export function RetentionStats() {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      <div className="rounded-[12px] bg-[#F8F7FF] p-3">
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Retención</div>
        <div className="text-[16px] font-semibold mt-1">82%</div>
        <div className="text-[11px] text-emerald-600">+12% tras fix</div>
      </div>
      <div className="rounded-[12px] bg-[#F8F7FF] p-3">
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Churn mensual</div>
        <div className="text-[16px] font-semibold mt-1">4.2%</div>
        <div className="text-[11px] text-[var(--muted)]">-1.1% vs ant</div>
      </div>
      <div className="rounded-[12px] bg-[#EDE8FF] p-3">
        <div className="text-[10px] text-[#6D5BFF] uppercase tracking-widest">Equipo Growth</div>
        <div className="text-[13px] font-medium mt-1">WhatsApp + Fix</div>
        <div className="text-[11px] text-[#6D5BFF]">Ver thread</div>
      </div>
    </div>
  );
}
```

## File: components/SectionHeader.tsx
```typescript
import type { ReactNode } from 'react';
type Props = { title: ReactNode; actions?: ReactNode };
export function SectionHeader({ title, actions }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

## File: components/Sparkline.tsx
```typescript
export function Sparkline({ points }: { points: string }) {
  return (
    <svg width="100%" height="44" viewBox="0 0 120 44" className="overflow-visible">
      <polyline fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" points={points} />
      <polyline fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" opacity="0.15" points={'0,38 ' + points + ' 120,38'} />
    </svg>
  );
}
```

## File: components/StatusBadge.tsx
```typescript
import type { ClientStatus } from '../types';
export function StatusBadge({ status }: { status: ClientStatus }) {
  const cls = status === 'riesgo' ? 'bg-[#FFE4E6] text-red-700' : status === 'oportunidad' ? 'bg-[#D1FAE5] text-emerald-700' : 'bg-[#FEF3C7] text-amber-700';
  return <span className={'text-[10px] px-2 py-1 rounded-full font-medium ' + cls}>{status.toUpperCase()}</span>;
}
```

## File: components/TicketCard.tsx
```typescript
import type { Ticket } from '../types';
import { Avatar } from './Avatar';
import { UrgencyBadge } from './UrgencyBadge';
export function TicketCard({ t, onClick }: { t: Ticket; onClick: () => void }) {
  const initials = t.name.split(' ').map(n => n[0]).join('');
  return (
    <div onClick={onClick} className="group rounded-[14px] border border-[var(--border)] p-3 hover:border-[#6D5BFF]/30 hover:bg-[#FBFAFF] transition cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-2.5 min-w-0">
          <Avatar label={initials} />
          <div className="min-w-0">
            <div className="text-[12px] font-semibold truncate">{t.name}</div>
            <div className="text-[11px] text-[var(--muted)] truncate">{t.company} · {t.issue}</div>
          </div>
        </div>
        <div className={'w-2 h-2 rounded-full ' + t.dot + ' mt-1.5'} />
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className={'text-[10px] px-2 py-1 rounded-full font-medium ' + t.badgeColor}>{t.badge}</span>
        <UrgencyBadge label={t.urgency} />
        <span className="text-[10px] text-[var(--muted)] ml-auto">{t.time} abierto</span>
      </div>
    </div>
  );
}
```

## File: components/Toast.tsx
```typescript
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
      <div className="pointer-events-auto rounded-full bg-[#111113] text-white px-4 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.24)] flex items-center gap-2 text-[12px] font-medium">
        <span className="w-5 h-5 rounded-full bg-[#6D5BFF] grid place-items-center text-[12px]">✦</span>
        {message}
      </div>
    </div>
  );
}
```

## File: components/TopClientRow.tsx
```typescript
import type { Client } from '../types';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';
type Props = { c: Client; onOpen: () => void; onAction: () => void };
export function TopClientRow({ c, onOpen, onAction }: Props) {
  return (
    <tr className="border-b border-[var(--border)] last:border-0 hover:bg-[#FBFAFF] transition">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onOpen}>
          <Avatar label={c.avatar} />
          <div className="text-[13px] font-medium">{c.name}</div>
        </div>
      </td>
      <td className="px-3 py-3.5 text-[12px] text-[#3A3A3D]">{c.company}</td>
      <td className="px-3 py-3.5 text-[12px] font-semibold">{c.ltv}</td>
      <td className="px-3 py-3.5"><StatusBadge status={c.status} /></td>
      <td className="px-3 py-3.5 text-[11px] text-[var(--muted)] max-w-[200px] truncate">{c.next}</td>
      <td className="px-5 py-3.5">
        <button onClick={onAction} className="h-7 px-3 rounded-full bg-[#111113] text-white text-[11px] font-medium hover:opacity-90">{c.action}</button>
      </td>
    </tr>
  );
}
```

## File: components/TopClientsPanel.tsx
```typescript
import type { Client } from '../types';
import { TopClientsTable } from './TopClientsTable';
type Props = { clients: Client[]; onOpen: (c: Client) => void; onAction: (c: Client) => void };
export function TopClientsPanel({ clients, onOpen, onAction }: Props) {
  return (
    <section className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] overflow-hidden">
      <div className="p-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">Top clientes riesgo / oportunidad</h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-1 rounded-full bg-[#FFE4E6] text-red-700">Roberto León €15.4k silencio 12d riesgo churn</span>
          <span className="hidden md:inline text-[11px] px-2 py-1 rounded-full bg-[#D1FAE5] text-emerald-700">Marta Soler oportunidad €8.4k</span>
        </div>
      </div>
      <TopClientsTable clients={clients} onOpen={onOpen} onAction={onAction} />
    </section>
  );
}
```

## File: components/TopClientsTable.tsx
```typescript
import type { Client } from '../types';
import { TopClientRow } from './TopClientRow';
type Props = { clients: Client[]; onOpen: (c: Client) => void; onAction: (c: Client) => void };
export function TopClientsTable({ clients, onOpen, onAction }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="text-[10px] tracking-[0.12em] text-[var(--muted)] border-y border-[var(--border)] bg-[#FBFAFF]">
            <th className="text-left font-semibold px-5 py-3">CLIENTE</th>
            <th className="text-left font-semibold px-3 py-3">EMPRESA</th>
            <th className="text-left font-semibold px-3 py-3">LTV</th>
            <th className="text-left font-semibold px-3 py-3">ESTADO</th>
            <th className="text-left font-semibold px-3 py-3">PRÓXIMO PASO IA</th>
            <th className="text-left font-semibold px-5 py-3">ACCIÓN</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => <TopClientRow key={c.id} c={c} onOpen={() => onOpen(c)} onAction={() => onAction(c)} />)}
        </tbody>
      </table>
    </div>
  );
}
```

## File: components/UrgencyBadge.tsx
```typescript
export function UrgencyBadge({ label }: { label: string }) {
  return <span className="text-[10px] px-2 py-1 rounded-full bg-[#111113] text-white font-medium">{label}</span>;
}
```

## File: components/WorkspaceHeader.tsx
```typescript
import type { DateRange } from '../types';
import { DateRangePicker } from './DateRangePicker';
type Props = { range: DateRange; onRange: (r: DateRange) => void; onExport: () => void };
export function WorkspaceHeader({ range, onRange, onExport }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-[rgba(248,247,255,0.85)] backdrop-blur-[14px] border-b border-[var(--border)]" style={{ top: 'var(--safe-area-inset-top)' }}>
      <div className="px-4 lg:px-8 h-[68px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-[18px] lg:text-[20px] font-semibold tracking-tight leading-none flex items-center gap-2">
              Centro de Mando <span className="hidden lg:inline text-[var(--muted)] font-normal">· Todas las empresas</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white border border-[var(--border)] ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
              </span>
            </h1>
            <div className="text-[11px] text-[var(--muted)] mt-1 lg:hidden">Todas las empresas · Workspace #9</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker range={range} onChange={onRange} />
          <button onClick={onExport} className="h-9 px-4 rounded-full bg-[#111113] text-white text-[13px] font-medium flex items-center gap-2 hover:opacity-90">
            <span>↗</span>
            <span className="hidden sm:inline">Exportar con IA</span>
            <span className="sm:hidden">Exportar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
```

## File: docs/01-ui-map.md
```markdown
# 01 — UI Map · Centro de Mando

## Bloques (top -> bottom)

1. Sidebar — nav WORKSPACE + user footer
2. Header — titulo + Live + DateRange + Export
3. KPI Grid (4 tarjetas)
   - Mensajes / día (+ MiniBarList)
   - Facturación bloqueada (+ BlockedInvoiceList)
   - Tiempo medio respuesta (+ Sparkline)
   - LTV total pipeline (dark, + PipelineFunnel)
4. Retención / Churn — RetentionChart + ChartAnnotation + RetentionStats
5. Tickets críticos — CriticalTicketsPanel + TicketCard
6. Obras activas · health — ActiveProjectsPanel + ProjectProgressRow
7. Agentes performance — AgentsPerformancePanel + AgentPerformanceCard
8. Top clientes — TopClientsPanel + TopClientsTable + TopClientRow
9. Insights IA — AiInsightsPanel + InsightCard
10. Modal cliente — ClientDetailModal
11. Toast — Toast

## Transversales del workspace

StatusBadge · UrgencyBadge · ProgressBar · SectionHeader · AiActionButton · Avatar · DateRangePicker
```

## File: docs/02-roadmap.md
```markdown
# 02 — Roadmap · Centro de Mando

## Fase 1 — Estructura
- [x] Carpetas components/, hooks/, docs/
- [x] README, index.ts, ui-map, roadmap, spec

## Fase 2 — Datos y hooks
- [x] useCentroMandoData
- [x] useDateRange
- [x] useToast
- [x] useClientSelection
- [x] useMobileMenu
- [x] types.ts

## Fase 3 — Componentes base
- [x] Avatar, StatusBadge, UrgencyBadge, ProgressBar, SectionHeader, AiActionButton, DateRangePicker, Toast

## Fase 4 — Bloques
- [x] KpiGrid + KpiCard + sub-bloques
- [x] RetentionChart + ChartAnnotation + RetentionStats
- [x] CriticalTicketsPanel + TicketCard
- [x] ActiveProjectsPanel + ProjectProgressRow
- [x] AgentsPerformancePanel + AgentPerformanceCard
- [x] TopClientsPanel + TopClientsTable + TopClientRow
- [x] AiInsightsPanel + InsightCard
- [x] ClientDetailModal

## Fase 5 — Ensamblaje
- [x] CentroMandoWorkspace.tsx
- [ ] Registro en workspaces/registry.ts
- [ ] Registro en workspaces/index.ts
```

## File: docs/03-spec.md
```markdown
# 03 — Spec · Centro de Mando

## Objetivo
Vista única de control operativo: KPIs, retención, tickets, obras, agentes,
clientes e insights IA. Sustituye la navegación entre vistas dispersas.

## Alcance
- Solo lectura + acciones IA sobre datos ya existentes.
- No introduce nuevos endpoints en esta fase (los datos llegan por hooks locales).

## Convenciones
- Tokens CSS: --bg, --ink, --border, --muted
- Paleta: #6D5BFF (primario), #111113 (ink), #F8F7FF (surface), #EDE8FF (lavanda),
  #10B981 (ok), #FFE4E6 (riesgo), #FEF3C7 (ámbar)
- Nomenclatura: PascalCase para componentes, useXxx para hooks, tipos en types.ts

## Acciones emitidas (CentroMandoAction)
export-ai, resolve-billing, view-funnel, export-pipeline, view-thread,
view-queue, fix-bot, generate-report, edit-agent, view-logs,
client-action, insight-cta, range-change

## Accesibilidad
- aria-label en secciones
- :focus-visible outline 2px
- prefers-reduced-motion respetado
```

## File: hooks/useCentroMandoData.ts
```typescript
import { useMemo } from 'react';
import type { Client, Project, Ticket, Agent, Insight, MessageRow, PipelineStage, DateRange } from '../types';
const clients: Client[] = [
  { id:'1', name:'Roberto León', company:'León Constructora', ltv:'€15.4k', status:'riesgo', next:'Llamada rescate · guión IA', action:'Llamar', avatar:'RL', detail:'Silencio 12 días, 3 presupuestos sin respuesta.', amount:'€15.4k en juego' },
  { id:'2', name:'Marta Soler', company:'Soluciones Limpieza', ltv:'€4.2k', status:'oportunidad', next:'Enviar propuesta 3 planes + demo', action:'Enviar propuesta', avatar:'MS', detail:'60 msgs/día en WhatsApp. Upsell €8.4k.', amount:'€8.4k potencial' },
  { id:'3', name:'Javier Gil', company:'Gil Proyectos', ltv:'€12.4k', status:'estable', next:'Centralizar info · checklist obra', action:'Generar checklist', avatar:'JG', detail:'15 obras simultáneas. Tiempo respuesta 4h.', amount:'€12.4k pipeline' },
  { id:'4', name:'Ana Torres', company:'Clínica Torres', ltv:'€6.8k', status:'riesgo', next:'Fix bot fuera horario + disculpa', action:'Resolver con IA', avatar:'AT', detail:'Bot no responde fuera de horario 23%.', amount:'Ticket #8821' },
  { id:'5', name:'Sofia Navarro', company:'Navarro Retail', ltv:'€9.1k', status:'riesgo', next:'Revisar cobro duplicado Holded', action:'Revisar factura', avatar:'SN', detail:'Cobro duplicado. 2 facturas bloqueadas.', amount:'€1.240 duplicado' },
];
const projects: Project[] = [
  { name:'Tenerife Sur', pct:78, owner:'Marta', avatar:'MS', alert:'Retraso 1 día por secado', color:'#6D5BFF' },
  { name:'Residencial Las Palmas', pct:64, owner:'Javier Gil', avatar:'JG', alert:'Falta lechada · 15 obras', color:'#FF8A5B' },
  { name:'Tienda Centro Comercial', pct:91, owner:'Carlos', avatar:'CR', alert:'En tiempo', color:'#10B981' },
  { name:'Villa Tagoror', pct:42, owner:'Roberto', avatar:'RL', alert:'Esperando material', color:'#6D5BFF' },
  { name:'Oficinas ACME', pct:85, owner:'Sofia', avatar:'SN', alert:'Finalizando', color:'#6D5BFF' },
];
const tickets: Ticket[] = [
  { name:'Ana Torres', company:'Clínica Torres', issue:'Bot no responde', time:'18h', badge:'Soporte', badgeColor:'bg-[#DBEAFE] text-blue-700', urgency:'URGENCIA', dot:'bg-red-500' },
  { name:'Sofia Navarro', company:'Navarro Retail', issue:'Cobro duplicado riesgo churn', time:'5h', badge:'Reclamación', badgeColor:'bg-[#FFE4E6] text-red-700', urgency:'ALTA', dot:'bg-amber-400' },
  { name:'Roberto Díaz', company:'Díaz Instalaciones', issue:'Factura Holded no sync', time:'2d', badge:'Pagos', badgeColor:'bg-[#FEF3C7] text-amber-800', urgency:'MEDIA', dot:'bg-[#6D5BFF]' },
];
const agents: Agent[] = [
  { name:'Agente Obra', conf:94, tasks:3, status:'ok', desc:'Checklists, progreso, alertas' },
  { name:'Agente Presupuestos', conf:89, tasks:5, status:'ok', desc:'3 planes + demo, Holded' },
  { name:'Agente Soporte', conf:76, tasks:8, status:'warn', desc:'Fuera horario fallando · Ana Torres caso' },
];
const insights: Insight[] = [
  { tag:'Oportunidad automatización', body:'Detectamos: 60 msgs/día en Soluciones Limpieza = oportunidad automatización WhatsApp + Holded.', cta:'Crear flujo IA', variant:'light' },
  { tag:'Bloqueo facturación', body:'20 facturas/mes autónomos bloqueadas por sync. Holded API error 422.', cta:'Resolver sync', variant:'primary' },
  { tag:'Bot fuera horario', body:'Bot responde fuera de horario 23% fallando. Agente Soporte necesita re-entrenamiento.', cta:'Re-entrenar', variant:'ghost' },
];
const messageRows: MessageRow[] = [
  { name:'Soluciones Limpieza', msgs:60, pct:78 },
  { name:'ACME Obras', msgs:42, pct:55 },
  { name:'Clínica Torres', msgs:31, pct:40 },
];
const pipelineStages: PipelineStage[] = [
  { label:'Lead', val:6, w:'25%' },
  { label:'Presupuesto', val:8, w:'48%' },
  { label:'Obra', val:5, w:'62%' },
  { label:'Facturado', val:5, w:'92%' },
];
const retentionData: Record<DateRange, number[]> = {
  '7d': [68,70,69,71,74,80,82],
  '30d': [62,64,63,66,68,71,70,72,74,75,78,80,82],
  '90d': [58,60,61,60,62,64,63,66,68,70,69,71,73,75,78,80,82],
};
export function useCentroMandoData(range: DateRange) {
  const data = retentionData[range];
  const sparkPoints = useMemo(() => {
    const w = 120, h = 36;
    const max = Math.max(...data);
    const min = Math.min(...data);
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h - 2;
      return x + ',' + y;
    }).join(' ');
  }, [data]);
  return { clients, projects, tickets, agents, insights, messageRows, pipelineStages, retention: data, sparkPoints };
}
```

## File: hooks/useClientSelection.ts
```typescript
import { useState } from 'react';
import type { Client } from '../types';
export function useClientSelection() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  return { selectedClient, setSelectedClient };
}
```

## File: hooks/useDateRange.ts
```typescript
import { useState } from 'react';
import type { DateRange } from '../types';
const LABELS: Record<DateRange, string> = { '7d': 'Últimos 7 días', '30d': 'Últimos 30 días', '90d': 'Últimos 90 días' };
export function useDateRange(initial: DateRange = '30d') {
  const [range, setRange] = useState<DateRange>(initial);
  const label = LABELS[range];
  return { range, setRange, label };
}
```

## File: hooks/useMobileMenu.ts
```typescript
import { useState } from 'react';
export function useMobileMenu() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const toggle = () => setMobileMenu(v => !v);
  const close = () => setMobileMenu(false);
  return { mobileMenu, toggle, close };
}
```

## File: hooks/useToast.ts
```typescript
import { useState, useCallback, useRef } from 'react';
export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(msg);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);
  return { toast, showToast };
}
```

## File: centro-mando.css
```css
:root {
  --bg: #f6f6f9;
  --ink: #14141f;
  --muted: #8a8a9c;
  --border: #ececf3;
}
```

## File: CentroMandoWorkspace.tsx
```typescript
import { useCentroMandoData } from './hooks/useCentroMandoData';
import { useDateRange } from './hooks/useDateRange';
import { useToast } from './hooks/useToast';
import { useClientSelection } from './hooks/useClientSelection';
import { useMobileMenu } from './hooks/useMobileMenu';
import { CentroMandoSidebar } from './components/CentroMandoSidebar';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { KpiGrid } from './components/KpiGrid';
import { KpiCard } from './components/KpiCard';
import { MiniBarList } from './components/MiniBarList';
import { BlockedInvoiceList } from './components/BlockedInvoiceList';
import { Sparkline } from './components/Sparkline';
import { PipelineFunnel } from './components/PipelineFunnel';
import { RetentionChart } from './components/RetentionChart';
import { RetentionStats } from './components/RetentionStats';
import { CriticalTicketsPanel } from './components/CriticalTicketsPanel';
import { ActiveProjectsPanel } from './components/ActiveProjectsPanel';
import { AgentsPerformancePanel } from './components/AgentsPerformancePanel';
import { TopClientsPanel } from './components/TopClientsPanel';
import { AiInsightsPanel } from './components/AiInsightsPanel';
import { ClientDetailModal } from './components/ClientDetailModal';
import { Toast } from './components/Toast';

export default function CentroMandoWorkspace() {
  const { range, setRange } = useDateRange('30d');
  const { toast, showToast } = useToast();
  const { selectedClient, setSelectedClient } = useClientSelection();
  const { mobileMenu, toggle, close } = useMobileMenu();
  const data = useCentroMandoData(range);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex overflow-hidden">
      <CentroMandoSidebar mobileOpen={mobileMenu} onClose={close} onNewChat={() => showToast('Nuevo chat creado con IA')} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-[rgba(248,247,255,0.85)] backdrop-blur-[14px] border-b border-[var(--border)] lg:hidden">
          <div className="px-4 h-[60px] flex items-center gap-3">
            <button onClick={toggle} className="w-9 h-9 rounded-full bg-white border border-[var(--border)] grid place-items-center">☰</button>
            <span className="text-[14px] font-semibold">Centro de Mando</span>
          </div>
        </header>
        <WorkspaceHeader range={range} onRange={setRange} onExport={() => showToast('Exportando informe con IA · PDF + CSV')} />
        <main className="px-4 lg:px-8 py-6 space-y-5 overflow-x-hidden">
          <KpiGrid>
            <KpiCard label="MENSAJES / DÍA">
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold tracking-tight">247</span>
                <span className="text-[12px] px-1.5 py-0.5 rounded-full bg-[#D1FAE5] text-emerald-700 font-medium">+12%</span>
              </div>
              <div className="text-[11px] text-[var(--muted)]">vs mes anterior</div>
              <div className="mt-4"><MiniBarList rows={data.messageRows} /></div>
              <div className="mt-4 rounded-[12px] bg-[#FFE4E6] border border-red-100 px-3 py-2 flex items-center gap-2">
                <span className="text-[11px] font-bold text-red-600 tracking-widest">ALTA</span>
                <span className="text-[11px] text-red-700">Equipo desbordado · automatizar WhatsApp</span>
              </div>
            </KpiCard>
            <KpiCard label="FACTURACIÓN BLOQUEADA">
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold tracking-tight">€4.280</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FEF3C7] text-amber-700 font-medium">4 facturas</span>
              </div>
              <div className="text-[11px] text-[var(--muted)]">No sincronizan con Holded</div>
              <BlockedInvoiceList onResolve={() => showToast('Resolviendo 4 facturas con IA')} />
            </KpiCard>
            <KpiCard label="TIEMPO MEDIO RESPUESTA">
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold tracking-tight">2h 14m</span>
                <span className="text-[12px] px-1.5 py-0.5 rounded-full bg-[#D1FAE5] text-emerald-700 font-medium">-18%</span>
              </div>
              <div className="text-[11px] text-emerald-600">Gracias a agente · -42m vs mes anterior</div>
              <div className="mt-4">
                <Sparkline points={data.sparkPoints} />
                <div className="flex justify-between text-[10px] text-[var(--muted)]"><span>7d</span><span>15d</span><span>Hoy</span></div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded-[10px] bg-[#F8F7FF] p-2"><div className="text-[var(--muted)]">Bot</div><div className="font-semibold">34s</div></div>
                <div className="rounded-[10px] bg-[#F8F7FF] p-2"><div className="text-[var(--muted)]">Humano</div><div className="font-semibold">1h 58m</div></div>
                <div className="rounded-[10px] bg-[#FFE4E6] p-2"><div className="text-red-600">Fuera hrs</div><div className="font-semibold">23% fail</div></div>
              </div>
            </KpiCard>
            <KpiCard label="LTV TOTAL PIPELINE" dark>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold tracking-tight">€84.2k</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10">24 clientes</span>
              </div>
              <div className="text-[11px] text-white/60">€3.5k ticket medio</div>
              <div className="mt-5"><PipelineFunnel stages={data.pipelineStages} /></div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => showToast('Funnel analizado')} className="h-8 px-3 rounded-full bg-white text-black text-[11px] font-medium">Ver funnel</button>
                <button onClick={() => showToast('Pipeline exportado')} className="h-8 px-3 rounded-full bg-white/10 text-white text-[11px]">Exportar</button>
              </div>
            </KpiCard>
          </KpiGrid>
          <section className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
            <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5 lg:p-6">
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight">Retención / Churn</h3>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">Equipo Growth retención subió 12% después del fix · referencia WhatsApp screenshot</p>
              </div>
              <RetentionChart data={data.retention} range={range} />
              <RetentionStats />
            </div>
            <CriticalTicketsPanel tickets={data.tickets} onOpen={(name) => showToast('Abriendo ticket ' + name)} onVerCola={() => showToast('Cola de pagos priorizada')} onFixBot={() => showToast('Agente Soporte re-entrenado')} />
          </section>
          <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
            <ActiveProjectsPanel projects={data.projects} onReport={() => showToast('Checklist generado para 5 obras')} />
            <AgentsPerformancePanel agents={data.agents} onEdit={(name) => showToast('Editando ' + name)} onLogs={(name, conf) => showToast('Logs ' + name + ' · ' + conf + '%')} />
          </section>
          <TopClientsPanel clients={data.clients} onOpen={(c) => setSelectedClient(c)} onAction={(c) => showToast(c.action + ' · ' + c.name)} />
          <AiInsightsPanel insights={data.insights} onAction={(i) => showToast(i.cta)} />
          <div className="h-10" />
        </main>
      </div>
      {selectedClient && <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} onGenerate={() => { showToast('Generando ' + selectedClient.action + ' para ' + selectedClient.name); setSelectedClient(null); }} />}
      <Toast message={toast} />
    </div>
  );
}
```

## File: index.ts
```typescript
export { default } from './CentroMandoWorkspace';
export * from './types';
```

## File: types.ts
```typescript
export type DateRange = '7d' | '30d' | '90d';

export type ClientStatus = 'riesgo' | 'oportunidad' | 'estable';

export type Client = {
  id: string;
  name: string;
  company: string;
  ltv: string;
  status: ClientStatus;
  next: string;
  action: string;
  avatar: string;
  detail: string;
  amount: string;
};

export type Project = {
  name: string;
  pct: number;
  owner: string;
  avatar: string;
  alert: string;
  color: string;
};

export type Ticket = {
  name: string;
  company: string;
  issue: string;
  time: string;
  badge: string;
  badgeColor: string;
  urgency: string;
  dot: string;
};

export type Agent = {
  name: string;
  conf: number;
  tasks: number;
  status: 'ok' | 'warn';
  desc: string;
};

export type Insight = {
  tag: string;
  body: string;
  cta: string;
  variant: 'light' | 'primary' | 'ghost';
};

export type MessageRow = { name: string; msgs: number; pct: number };
export type PipelineStage = { label: string; val: number; w: string };
```

## File: README.md
```markdown
# 35 — Centro de Mando

Workspace de control operativo unificado. Vista unica de KPIs, retencion,
tickets criticos, obras activas, performance de agentes, top clientes e
insights IA para todas las empresas del tenant.

## Estructura

- CentroMandoWorkspace.tsx — componente raiz. Acepta data, onAction, initialRange.
- data.ts — CENTRO_MANDO_MOCK, RANGE_LABEL, RANGE_START.
- types.ts — CentroMandoData, CentroMandoAction, y tipos de dominio.
- centro-mando.css — estilos scoped bajo .cm-root.
- docs/ — ui-map, roadmap, spec.
- index.ts — export default from './CentroMandoWorkspace'.

## Uso

  import CentroMandoWorkspace from '@/workspaces/35-centro-mando';

  <CentroMandoWorkspace />

## Acciones emitidas (CentroMandoAction)

export-ai, resolve-billing, view-funnel, export-pipeline, view-thread,
view-queue, fix-bot, generate-report, edit-agent, view-logs,
client-action, insight-cta, range-change.

## Estado

- UI: completa con datos mock.
- Backend: pendiente. CentroMandoData se servira desde un hook de datos real.
```
````

## File: workspaces/index.ts
````typescript
// WORKSPACES_WEB_INDEX_V1 — punto de entrada del modulo de workspaces del frontend.
export * from "./registry.ts";

export * as CentroMando from './35-centro-mando';
````

## File: workspaces/registry.ts
````typescript
// WORKSPACE_FRONTEND_REGISTRY_V1 — registry de workspaces en el frontend.

export type WorkspaceFamily =
  | "comunicacion"
  | "documentos"
  | "trabajo"
  | "finanzas"
  | "personas"
  | "operaciones"
  | "gobierno"
  | "datos"
  | "global";

export interface WorkspaceFrontendEntry {
  readonly id: string;
  readonly slug: string;
  readonly family: WorkspaceFamily;
  readonly title: string;
  readonly reference: string;
}

export const WORKSPACE_ENTRIES: readonly WorkspaceFrontendEntry[] = [
  { id: "gmail", slug: "01-gmail", family: "comunicacion", title: "Correo electronico", reference: "Gmail" },
  { id: "whatsapp", slug: "02-whatsapp", family: "comunicacion", title: "Mensajeria instantanea", reference: "WhatsApp Web" },
  { id: "hubspot", slug: "03-hubspot", family: "comunicacion", title: "CRM y ventas", reference: "HubSpot" },
  { id: "holded", slug: "04-holded", family: "finanzas", title: "ERP, facturacion y administracion", reference: "Holded" },
  { id: "google-drive", slug: "05-google-drive", family: "documentos", title: "Archivos y documentos", reference: "Google Drive" },
  { id: "google-calendar", slug: "06-google-calendar", family: "trabajo", title: "Calendario y agenda", reference: "Google Calendar" },
  { id: "linear", slug: "07-linear", family: "trabajo", title: "Tareas y proyectos", reference: "Linear" },
  { id: "chatgpt", slug: "08-chatgpt", family: "global", title: "Chat con IA", reference: "ChatGPT" },
  { id: "airtable", slug: "09-airtable", family: "datos", title: "Tablas y bases de datos", reference: "Airtable" },
  { id: "perdoo", slug: "10-perdoo", family: "personas", title: "Direccion, objetivos y planificacion", reference: "Perdoo" },
  { id: "holded-tesoreria", slug: "11-holded-tesoreria", family: "finanzas", title: "Tesoreria y conciliacion bancaria", reference: "Holded" },
  { id: "odoo-purchase", slug: "12-odoo-purchase", family: "finanzas", title: "Compras y proveedores", reference: "Odoo Purchase" },
  { id: "productive", slug: "13-productive", family: "trabajo", title: "Proyectos y rentabilidad", reference: "Productive" },
  { id: "zendesk", slug: "14-zendesk", family: "comunicacion", title: "Atencion al cliente", reference: "Zendesk" },
  { id: "docusign", slug: "15-docusign", family: "documentos", title: "Contratos y firma", reference: "DocuSign" },
  { id: "n8n", slug: "16-n8n", family: "trabajo", title: "Automatizaciones", reference: "n8n" },
  { id: "process-street", slug: "17-process-street", family: "trabajo", title: "Procedimientos", reference: "Process Street" },
  { id: "factorial", slug: "18-factorial", family: "personas", title: "Recursos humanos", reference: "Factorial" },
  { id: "personio", slug: "19-personio", family: "personas", title: "Seleccion y candidatos", reference: "Personio" },
  { id: "ramp", slug: "20-ramp", family: "finanzas", title: "Gastos", reference: "Ramp" },
  { id: "stripe", slug: "21-stripe", family: "finanzas", title: "Pagos y analitica", reference: "Stripe" },
  { id: "canva", slug: "22-canva", family: "documentos", title: "Diseno", reference: "Canva" },
  { id: "buffer", slug: "23-buffer", family: "comunicacion", title: "Redes sociales", reference: "Buffer" },
  { id: "shopify", slug: "24-shopify", family: "finanzas", title: "Ecommerce", reference: "Shopify" },
  { id: "intercom", slug: "25-intercom", family: "comunicacion", title: "Posventa", reference: "Intercom" },
  { id: "odoo-inventory", slug: "26-odoo-inventory", family: "operaciones", title: "Inventario", reference: "Odoo Inventory" },
  { id: "maintainx", slug: "27-maintainx", family: "operaciones", title: "Mantenimiento", reference: "MaintainX" },
  { id: "odoo-manufacturing", slug: "28-odoo-manufacturing", family: "operaciones", title: "Produccion", reference: "Odoo Manufacturing" },
  { id: "isms-online", slug: "29-isms-online", family: "gobierno", title: "Cumplimiento", reference: "ISMS.online" },
  { id: "microsoft-entra", slug: "30-microsoft-entra", family: "gobierno", title: "Identidad", reference: "Microsoft Entra" },
  { id: "suitedash", slug: "31-suitedash", family: "comunicacion", title: "Portal clientes", reference: "SuiteDash" },
  { id: "notion", slug: "32-notion", family: "documentos", title: "Wiki", reference: "Notion" },
  { id: "langsmith", slug: "33-langsmith", family: "gobierno", title: "Observabilidad", reference: "LangSmith" },
  { id: "trello", slug: "34-trello", family: "trabajo", title: "Kanban", reference: "Trello" },
  { id: "centro-mando", slug: "35-centro-mando", family: "datos", title: "Centro de mando y analitica", reference: "Centro de Mando" },
] as const;

export function getWorkspace(id: string): WorkspaceFrontendEntry | undefined {
  return WORKSPACE_ENTRIES.find((w) => w.id === id);
}

export function listByFamily(family: WorkspaceFamily): readonly WorkspaceFrontendEntry[] {
  return WORKSPACE_ENTRIES.filter((w) => w.family === family);
}
````

## File: workspaces/WorkspaceShell.tsx
````typescript
// WORKSPACE_SHELL_V1 - contenedor de un workspace activo.
import { getWorkspace } from "./registry.ts";
import ViewRenderer from "../view/ViewRenderer.tsx";
import type { RuntimeViewSpec } from "@openmuse/domain/views";

interface Props {
  workspaceId: string | null;
  spec: RuntimeViewSpec | null;
}

export default function WorkspaceShell({ workspaceId, spec }: Props) {
  const entry = workspaceId ? getWorkspace(workspaceId) : undefined;
  if (!entry) {
    return (
      <div className="workspace-shell empty">
        <h2>Selecciona un workspace</h2>
        <p>Elige uno en el menu lateral para empezar.</p>
      </div>
    );
  }
  return (
    <div className="workspace-shell">
      <header className="workspace-shell-header">
        <h1>{entry.title}</h1>
        <span className="workspace-shell-family">{entry.family}</span>
      </header>
      <section className="workspace-shell-body">
        {spec ? <ViewRenderer spec={spec} /> : <div className="workspace-shell-empty">Sin vista activa</div>}
      </section>
    </div>
  );
}
````

## File: 01-34-workspaces-pipeline.md
````markdown
<!-- WORKSPACES_UI_PIPELINE_V2 -->
# Pipeline de UI para los 34 workspaces

> Estado: vivo. Se actualiza mientras se construye.
> Base: lo aplicado al workspace 02-whatsapp.
> Uso: manual de instrucciones para la IA que construye cada workspace.

---

## 1. Estructura por workspace

Cada workspace del frontend vive en `apps/web/src/workspaces/NN-nombre/`.
Todos siguen la misma estructura:

```
apps/web/src/workspaces/NN-nombre/
├── README.md                    mapa del workspace            XXX_UI_MAP_V1
├── index.ts                     metadata + export contenedor  XXX_WORKSPACE_INDEX_V2
├── types.ts                     tipos del workspace           XXX_TYPES_V1
├── format.ts                    utilidades puras              XXX_FORMAT_V1
├── <Nombre>Workspace.css        estructura (sin tokens)       XXX_UI_CSS_V1
├── api.ts                       mock en memoria               XXX_API_V1
├── hooks/
│   └── useXxx.ts                estado compartido             XXX_HOOK_V1
├── components/
│   ├── <Nombre>Workspace.tsx    contenedor principal          XXX_WORKSPACE_V1
│   └── ...                      hijos con nombres semanticos
└── docs/
    ├── 01-ui-map.md             mapa real
    ├── 02-roadmap.md            fases reales
    ├── 03-spec.md               spec funcional
    └── 04-handoff-v2.md         handoff para la siguiente IA  XXX_HANDOFF_V2
```

Fuera del workspace, si aplica:

```
apps/web/src/components/layout/AppRail.tsx    APP_RAIL_V1
apps/web/src/components/shared/Xxx.tsx        si varios workspaces lo comparten
```

Reglas de naming de componentes:

- El contenedor lleva el nombre del workspace: `ChatWorkspace`, `GmailWorkspace`.
- Los hijos llevan el nombre de la entidad que representan: `ThreadHeader`,
  `MessageBubble`, `InvoiceRow`. NO usan el prefijo del workspace.
- El CSS usa el nombre del contenedor: `ChatWorkspace.css`, `GmailWorkspace.css`.

---

## 2. Pipeline por workspace

```
FASE 0 - Auditoria
  0.1. Leer estructura del workspace (README, index.ts, docs, components, hooks)
  0.2. Leer registry.ts (confirmar metadata-only)
  0.3. Leer WorkspaceShell.tsx (confirmar como monta)
  0.4. Leer tailwind.config.js (paleta real)
  0.5. Leer index.css (reglas globales)
  0.6. Leer App.tsx y main.tsx (montaje global)
  0.7. Leer api del workspace si aplica

FASE 1 - Decisiones
  1.1. Que UI necesita (lista, board, tabla, kanban, dashboard, chat, ...)
  1.2. Paleta: la real del repo, nunca inventada
  1.3. Fuente: la real del repo (Instrument Sans)
  1.4. Dark mode: no, el repo no lo tiene
  1.5. Tipos necesarios
  1.6. Utilidades necesarias
  1.7. Mock necesario
  1.8. Hook necesario
  1.9. Componentes necesarios
  1.10. Contenedor que orquesta

FASE 2 - Documentacion
  2.1. README del workspace con mapa de componentes
  2.2. Docs internos (01-ui-map, 02-roadmap, 03-spec)

FASE 3 - Contratos y utilidades
  3.1. types.ts
  3.2. format.ts
  3.3. <Nombre>Workspace.css (solo estructura)

FASE 4 - Datos y estado
  4.1. api.ts (mock)
  4.2. hooks/useXxx.ts

FASE 5 - Componentes hoja
  Por dependencia. Primero los que no importan nada del workspace.
  Luego los que importan esos. Luego los contenedores.

FASE 6 - Componentes contenedores
  6.1. Header
  6.2. List
  6.3. Detail / Panel
  6.4. Form / Composer
  6.5. Contenedor principal

FASE 7 - Correccion de paleta
  7.1. Mapear clases inventadas a clases reales del repo
  7.2. Un patchset por fichero
  7.3. pnpm typecheck al final de la fase

FASE 8 - Montaje
  8.1. Actualizar index.ts del workspace
  8.2. Decidir: WorkspaceShell por excepcion o ruta nueva
  8.3. Ver WorkspaceShell.tsx y App.tsx ANTES de decidir
  8.4. Verificar en navegador

FASE 9 - Handoff v2
  9.1. Doc 04-handoff-v2.md con estado actual
  9.2. Lista de ficheros globales que la siguiente IA debe ver
  9.3. Tareas pendientes
```

---

## 3. SOP - Procedimiento estandar

### SOP-1 - Auditoria

Leer del workspace:

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
Get-ChildItem "apps/web/src/workspaces/NN-nombre" -Recurse | Select-Object FullName
Get-Content "apps/web/src/workspaces/NN-nombre/README.md"
Get-Content "apps/web/src/workspaces/NN-nombre/index.ts"
Get-Content "apps/web/src/workspaces/NN-nombre/docs/01-ui-map.md"
Get-Content "apps/web/src/workspaces/NN-nombre/docs/02-roadmap.md"
Get-Content "apps/web/src/workspaces/NN-nombre/docs/03-spec.md"
```

Leer una vez, no por workspace:

```powershell
Get-Content "apps/web/src/workspaces/registry.ts"
Get-Content "apps/web/src/workspaces/WorkspaceShell.tsx"
Get-Content "apps/web/tailwind.config.js"
```

### SOP-2 - Decisiones

Responder por escrito antes de tocar codigo:

1. Que UI necesita
2. Que roles o estados tiene
3. Que acciones ejecuta
4. Que tipos necesita
5. Paleta (la del repo)
6. Componentes reutilizables de otros workspaces
7. Mock necesario
8. Hook propio o estado local
9. Donde se monta

### SOP-3 - Doc del workspace

El README del workspace incluye:

- Objetivo
- Estructura de ficheros
- Mapa de componentes (tabla: fichero | marca | que es)
- Contratos de tipos
- Estado compartido
- Datos (mock)
- Relacion con el resto del repo
- Roadmap por fases
- Pendientes conocidos

### SOP-4 - Contratos y utilidades

- types.ts: tipos puros, sin React, sin colores
- format.ts: utilidades puras, sin React, sin colores
- <Nombre>Workspace.css: solo estructura (display, overflow, grid).
  Sin tokens, sin dark mode, sin fuentes

### SOP-5 - Datos y estado

- api.ts: mock con las firmas reales que tendra la API
- hooks/useXxx.ts: estado. Suscribe al mock. Devuelve estado + setters

### SOP-6 - Componentes hoja

Un patchset por fichero. Orden por dependencia:
primero los que no importan nada del workspace, luego los que
importan esos, luego los que importan los anteriores.

### SOP-7 - Componentes contenedores

Header, List, Detail/Panel, Form/Composer, Contenedor. Uno a uno.

### SOP-8 - Correccion de paleta

Mapear todas las clases Tailwind inventadas a las reales:

| Inventada | Real |
|---|---|
| `bg-canvas` | `bg-bg-card` |
| `bg-surface` | `bg-bg-soft` |
| `border-line` | `border-border` |
| `text-ink` | `text-text` |
| `text-muted` | `text-text-2` |
| `bg-accent` | `bg-purple` |
| `text-accent` | `text-purple` |
| `border-accent` | `border-purple` |
| `bg-accentsoft` | `bg-purple-soft` |
| `bg-online` | `bg-green` |
| `text-canvas` | `text-white` (solo sobre fondo oscuro) |

Un patchset por fichero con `.Replace()` acotado.

### SOP-9 - Montaje

1. Actualizar index.ts del workspace. Exporta el contenedor y actualiza
   el estado del objeto metadata a `implemented`
2. Ver WorkspaceShell.tsx y App.tsx antes de decidir donde se monta
3. Escribir el bloque de montaje
4. Verificar en navegador

### SOP-10 - Handoff v2

El doc 04-handoff-v2.md incluye:

- Estado actual
- Que falta
- Lista de los ficheros globales que la siguiente IA debe ver antes
  de tocar nada: WorkspaceShell.tsx, registry.ts, index.ts del workspace,
  App.tsx, main.tsx, index.css, api global si aplica
- Tareas pendientes en orden
- Convenciones de patchset
- Trampas conocidas
- Definicion de terminado

---

## 4. Lo que NO hay que hacer

Aprendido a base de romper el 02:

1. No inventar paletas. Usar las del repo: bg-bg-card, bg-bg-soft,
   border-border, text-text, text-text-2, purple, purple-soft, green.
2. No meter dark mode. El repo no lo tiene.
3. No meter fuentes ajenas. Instrument Sans y punto.
4. No meter contexto global si el workspace es el unico consumidor.
   Usar hooks/useXxx.ts dentro del workspace.
5. No tocar api/chat.ts ni otros ficheros globales sin verlos antes.
6. No reescribir tailwind.config.js.
7. No meter componentes en components/ del repo. Van dentro del workspace.
8. No crear contexts/ si no existe.
9. No meter heredocs anidados en PowerShell.
10. No meter 18 ficheros en un solo script. Un patchset = un fichero.
11. No tocar App.tsx ni main.tsx a ciegas. Verlos antes.
12. No montar el workspace hasta decidir donde.
13. No usar && ni ; en PowerShell. Un comando por linea.
14. No usar git add . . git add selectivo por fichero.

---

## 5. Orden recomendado de los 34

Primero (simples, sin deps):
08-chatgpt, 09-airtable, 16-n8n, 33-langsmith.

Segundo (comunicacion, similar al 02):
01-gmail, 14-zendesk, 25-intercom, 31-suitedash, 23-buffer.

Tercero (documentos):
05-google-drive, 32-notion, 15-docusign, 22-canva.

Cuarto (finanzas):
04-holded, 11-holded-tesoreria, 12-odoo-purchase, 20-ramp, 21-stripe, 24-shopify.

Quinto (personas):
10-perdoo, 18-factorial, 19-personio.

Sexto (trabajo):
06-google-calendar, 07-linear, 13-productive, 17-process-street, 34-trello.

Septimo (operaciones):
26-odoo-inventory, 27-maintainx, 28-odoo-manufacturing.

Octavo (gobierno):
29-isms-online, 30-microsoft-entra.

Ya hecho: 02-whatsapp.

---

## 6. Plantilla de prompt para cada workspace

```
Vamos a implementar la UI del workspace NN-nombre.

Sigue el pipeline de apps/web/src/34-workspaces-pipeline.md.

Fase 1 - Auditoria: pásame el contenido de:
- apps/web/src/workspaces/NN-nombre/README.md
- apps/web/src/workspaces/NN-nombre/index.ts
- apps/web/src/workspaces/NN-nombre/docs/01-ui-map.md
- apps/web/src/workspaces/NN-nombre/docs/02-roadmap.md
- apps/web/src/workspaces/NN-nombre/docs/03-spec.md

Fase 2 - Decisiones: dime que UI necesita, que tipos, que componentes.

Fase 3 - Doc: README con mapa de componentes.

Fase 4 - Contratos: types.ts, format.ts, <Nombre>Workspace.css.

Fase 5 - Datos: api.ts, hooks/useXxx.ts.

Fase 6 - Componentes: uno a uno, un patchset por fichero.

Fase 7 - Correccion de paleta.

Fase 8 - Montaje.

Fase 9 - Handoff v2.

Reglas:
- Un patchset = un fichero.
- Paleta real del repo (bg-bg-card, purple, etc).
- Sin dark mode.
- Sin fuentes ajenas.
- Imports con extension .ts/.tsx.
- Sin && ni ;.
- Idempotente por marca.
```

---

FIN DEL PIPELINE.
````

## File: 02-HANDOFF-IA-WORKSPACES.md
````markdown
<!-- HANDOFF_IA_WORKSPACES_V1 -->
# Handoff para la IA que construye los 34 workspaces del frontend

> Autocontenido. No asume nada. Lo lee una IA nueva al empezar un chat
> limpio. Incluye: como escribir PowerShell en este repo, como pedir
> el arbol y el repomix sin peso, y todo lo que necesita saber del repo
> para no romperlo.

---

## 0. Contexto en una frase

En el repo `agente` hay 34 workspaces del frontend en
`apps/web/src/workspaces/NN-nombre/`, en estado scaffold. La IA
los implementa uno a uno siguiendo el pipeline que ya se aplico
al 02-whatsapp. Este doc es el manual de como trabajar sin romper
nada.

---

## 1. Entorno

- Repo: `C:\Users\Alfonso\Desktop\git hub repos\agente`
- Shell: PowerShell en Windows.
- Package manager: pnpm. Node >= 22.
- El humano ejecuta los comandos. La IA genera los bloques.
- Un patchset = un bloque PowerShell = un fichero. Nunca 18 ficheros en un script.

---

## 2. Reglas duras de PowerShell

### 2.1. Rutas con espacios

La ruta del repo tiene espacios. SIEMPRE entre comillas dobles:

```powershell
# MAL
cd C:\Users\Alfonso\Desktop\git hub repos\agente

# BIEN
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
```

### 2.2. Nunca && ni ; para encadenar

Un comando por linea. Si hay que encadenar, usar `if ($LASTEXITCODE -ne 0) { ... }`
explicito.

```powershell
# MAL
pnpm typecheck && pnpm test

# BIEN
pnpm typecheck
pnpm test
```

### 2.3. Nunca git add .

El working tree tiene frentes mezclados. `git add` selectivo, archivo por archivo.

```powershell
git add apps/web/src/workspaces/02-whatsapp/types.ts
git add apps/web/src/workspaces/02-whatsapp/components/
```

### 2.4. Heredoc: NO anidar

NO meter varios `@'...'@` en el mismo script. PowerShell los confunde y
revienta. Usar arrays de lineas:

```powershell
$lines = @(
  '// MARCA_V1',
  'export const x = 1;',
  ''
)
[System.IO.File]::WriteAllText(
  (Join-Path (Get-Location) $file),
  ($lines -join "`r`n"),
  (New-Object System.Text.UTF8Encoding $false)
)
```

### 2.5. UTF-8 sin BOM

Siempre `[System.IO.File]::WriteAllText(..., (New-Object System.Text.UTF8Encoding $false))`.
Nunca `Set-Content` ni `Out-File` sin `-Encoding utf8`.

### 2.6. Idempotencia por marca

Todo patchset empieza comprobando si el fichero ya tiene la marca:

```powershell
$file = "ruta/al/fichero"
$mark = "MARCA_V1"

if (Test-Path $file) {
  $content = Get-Content $file -Raw
  if ($content -match $mark) {
    Write-Host "SKIP: $mark ya existe" -ForegroundColor DarkGray
  } else {
    Write-Host "AVISO: $file existe sin la marca $mark. No sobreescribo." -ForegroundColor Yellow
  }
} else {
  # escribir el fichero
}
```

### 2.7. Backticks y escapes

El backtick es escape en PowerShell. Evitarlo en strings. Si hay que
meter un salto de linea en un string, usar `"`r`n"` (con backticks) pero
solo en joins, no dentro de lineas del array.

### 2.8. Variables de entorno

```powershell
$env:OPENMUSE_CLIENTS_DIR = "clientes"
pnpm dev
```

No usar `export` ni `set`.

### 2.9. Redirecciones

```powershell
pnpm typecheck 2>&1 | Out-File -Encoding utf8 typecheck.txt
```

`>` sobreescribe. `>>` anade.

---

## 3. Como pedir el arbol del repo

El arbol completo ya esta en el chat (o se pide con `tree`). Si hace
falta el arbol entero, este es el comando:

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
tree /F /A > arbol.txt
```

Si el arbol es enorme, mejor solo el trozo que interesa:

```powershell
tree "apps/web/src/workspaces" /F /A
```

---

## 4. Como pedir el repomix sin peso

El repo tiene un `repomix.config.json` que excluye `apps/web/**` por
defecto. Por eso cualquier repomix del frontend sale vacio si no se
le pasa `--include` correcto. Reglas duras:

1. Nunca empaquetar el repo entero.
2. Siempre `--include` acotado al frente que se esta tocando.
3. Siempre `--ignore` para node_modules, dist, .git, .env.
4. Un repomix por objetivo. No mezclar frentes.
5. Si el repomix ya existe en el chat, pedir solo el delta.

### 4.1. Comando base

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
npx repomix --style markdown --include "<globs>" --ignore "**/node_modules/**,**/dist/**,**/.git/**,**/.env*" --output repomix-<frente>.md
```

### 4.2. Repomix para un workspace concreto

```powershell
npx repomix --style markdown --include "apps/web/src/workspaces/NN-nombre/**,apps/web/tailwind.config.js,apps/web/src/index.css" --ignore "**/node_modules/**,**/dist/**,**/.git/**" --output repomix-ws-NN.md
```

### 4.3. Repomix de los ficheros globales del frontend

Necesario antes de tocar cualquier workspace, una sola vez:

```powershell
npx repomix --style markdown --include "apps/web/src/workspaces/registry.ts,apps/web/src/workspaces/WorkspaceShell.tsx,apps/web/src/workspaces/index.ts,apps/web/src/App.tsx,apps/web/src/main.tsx,apps/web/src/index.css,apps/web/tailwind.config.js,apps/web/package.json" --ignore "**/node_modules/**,**/dist/**,**/.git/**" --output repomix-web-globales.md
```

### 4.4. Repomix de un fichero suelto

Si el repomix grande pesa demasiado, pedir ficheros uno a uno:

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
Get-Content "apps/web/src/workspaces/WorkspaceShell.tsx"
```

Esto es lo mas eficiente para la IA. El humano pega el output.

### 4.5. Que NO pedir

- No pedir el repo entero.
- No pedir `apps/web/**` sin acotar.
- No pedir ficheros de `apps/server/`, `packages/`, `clientes/`, `docs/`
  salvo que el workspace lo requiera explicitamente.
- No pedir `node_modules`, `dist`, `.git`, `.env`, `artifacts`, `coverage`.

---

## 5. La paleta real del repo

El repo usa estos colores Tailwind (definidos en `apps/web/tailwind.config.js`):

- Fondos: `bg`, `bg-card`, `bg-soft`, `bg-softer`
- Bordes: `border`, `border-soft`, `border-strong`
- Texto: `text`, `text-2`, `text-3`, `text-4`
- Acento: `purple`, `purple-soft`
- Estado: `green`, `orange`, `warn`, `warn-border`, `warn-text`, `info`, `info-border`, `info-text`

NO usar `canvas`, `surface`, `line`, `ink`, `muted`, `accent`, `accentsoft`,
`online`. Esos colores NO existen en el repo.

Mapeo si se ven en algun fichero viejo:

| Inventada | Real |
|---|---|
| `bg-canvas` | `bg-bg-card` |
| `bg-surface` | `bg-bg-soft` |
| `border-line` | `border-border` |
| `text-ink` | `text-text` |
| `text-muted` | `text-text-2` |
| `bg-accent` | `bg-purple` |
| `text-accent` | `text-purple` |
| `border-accent` | `border-purple` |
| `bg-accentsoft` | `bg-purple-soft` |
| `bg-online` | `bg-green` |
| `text-canvas` | `text-white` (solo sobre fondo oscuro) |

---

## 6. Reglas de estilo del repo

- Fuente: `Instrument Sans`. No meter `Inter` ni otra.
- Dark mode: no existe. No meter `@media (prefers-color-scheme: dark)`
  ni `data-theme`.
- Radii: `rounded-card` (28px), `rounded-pill` (999px).
- Shadows: `shadow-card`, `shadow-soft`, `shadow-composer`.
- Imports con extension: `./types.ts`, `../api.ts`, `./Avatar.tsx`.
  Sin extension, `tsc` falla por `moduleResolution: NodeNext`.

---

## 7. Estructura de un workspace

Cada workspace vive en `apps/web/src/workspaces/NN-nombre/`:

```
NN-nombre/
├── README.md                    XXX_UI_MAP_V1
├── index.ts                     XXX_WORKSPACE_INDEX_V2
├── types.ts                     XXX_TYPES_V1
├── format.ts                    XXX_FORMAT_V1
├── <Nombre>Workspace.css        XXX_UI_CSS_V1
├── api.ts                       XXX_API_V1
├── hooks/
│   └── useXxx.ts                XXX_HOOK_V1
├── components/
│   ├── <Nombre>Workspace.tsx    XXX_WORKSPACE_V1
│   └── ...                      hijos semanticos
└── docs/
    ├── 01-ui-map.md
    ├── 02-roadmap.md
    ├── 03-spec.md
    └── 04-handoff-v2.md         XXX_HANDOFF_V2
```

---

## 8. Los 34 workspaces

| # | id | familia |
|---|---|---|
| 01 | gmail | comunicacion |
| 02 | whatsapp | comunicacion |
| 03 | hubspot | comunicacion |
| 04 | holded | finanzas |
| 05 | google-drive | documentos |
| 06 | google-calendar | trabajo |
| 07 | linear | trabajo |
| 08 | chatgpt | global |
| 09 | airtable | datos |
| 10 | perdoo | personas |
| 11 | holded-tesoreria | finanzas |
| 12 | odoo-purchase | finanzas |
| 13 | productive | trabajo |
| 14 | zendesk | comunicacion |
| 15 | docusign | documentos |
| 16 | n8n | trabajo |
| 17 | process-street | trabajo |
| 18 | factorial | personas |
| 19 | personio | personas |
| 20 | ramp | finanzas |
| 21 | stripe | finanzas |
| 22 | canva | documentos |
| 23 | buffer | comunicacion |
| 24 | shopify | finanzas |
| 25 | intercom | comunicacion |
| 26 | odoo-inventory | operaciones |
| 27 | maintainx | operaciones |
| 28 | odoo-manufacturing | operaciones |
| 29 | isms-online | gobierno |
| 30 | microsoft-entra | gobierno |
| 31 | suitedash | comunicacion |
| 32 | notion | documentos |
| 33 | langsmith | gobierno |
| 34 | trello | trabajo |

---

## 9. Flujo de una sesion nueva

Cuando el humano abre un chat limpio con una IA nueva:

1. El humano pega dos docs:
   - `apps/web/src/34-workspaces-pipeline.md`
   - `apps/web/src/HANDOFF-IA-WORKSPACES.md` (este)
2. El humano dice: "trabajamos el workspace NN-nombre".
3. La IA pide el repomix acotado al workspace, o los ficheros uno a uno.
4. La IA sigue el pipeline: auditoria, decisiones, doc, contratos,
   datos, componentes, correccion, montaje, handoff.
5. Cada fichero es un patchset. La IA lo da, el humano lo pega.
6. Al final de la fase, el humano corre `pnpm typecheck` y pega el
   resultado.
7. La IA ajusta si hay errores.
8. Siguiente workspace.

---

## 10. Lo que la IA debe pedir siempre antes de tocar

Antes de escribir un solo fichero del workspace NN, la IA debe ver:

- `apps/web/src/workspaces/NN-nombre/README.md`
- `apps/web/src/workspaces/NN-nombre/index.ts`
- `apps/web/src/workspaces/NN-nombre/docs/01-ui-map.md`
- `apps/web/src/workspaces/NN-nombre/docs/02-roadmap.md`
- `apps/web/src/workspaces/NN-nombre/docs/03-spec.md`

Y una vez por sesion (o si no se han visto en el chat):

- `apps/web/src/workspaces/registry.ts`
- `apps/web/src/workspaces/WorkspaceShell.tsx`
- `apps/web/tailwind.config.js`
- `apps/web/src/index.css`

Si el workspace necesita montarse:

- `apps/web/src/App.tsx`
- `apps/web/src/main.tsx`

---

## 11. Lo que la IA NO debe hacer

1. No inventar paletas.
2. No meter dark mode.
3. No meter fuentes ajenas.
4. No meter contexto global si el workspace es el unico consumidor.
5. No tocar `api/chat.ts` ni otros ficheros globales sin verlos antes.
6. No reescribir `tailwind.config.js`.
7. No meter componentes en `components/` del repo. Van dentro del workspace.
8. No crear `contexts/` si no existe.
9. No meter heredocs anidados en PowerShell.
10. No meter 18 ficheros en un solo script. Un patchset = un fichero.
11. No tocar `App.tsx` ni `main.tsx` a ciegas.
12. No montar el workspace hasta decidir donde.
13. No usar `&&` ni `;`.
14. No usar `git add .`.

---

## 12. Convencion de marcas

| Fichero | Marca |
|---|---|
| `README.md` | `XXX_UI_MAP_V1` |
| `index.ts` | `XXX_WORKSPACE_INDEX_V2` |
| `types.ts` | `XXX_TYPES_V1` |
| `format.ts` | `XXX_FORMAT_V1` |
| `<Nombre>Workspace.css` | `XXX_UI_CSS_V1` |
| `api.ts` | `XXX_API_V1` |
| `hooks/useXxx.ts` | `XXX_HOOK_V1` |
| `components/<Nombre>Workspace.tsx` | `XXX_WORKSPACE_V1` |
| `docs/04-handoff-v2.md` | `XXX_HANDOFF_V2` |
| `components/layout/AppRail.tsx` | `APP_RAIL_V1` (una sola vez) |

Donde `XXX` es el identificador del workspace en mayusculas: `CHAT`,
`GMAIL`, `HUBSPOT`, `HOLDDED`, `TRELLO`, etc.

---

## 13. Definicion de terminado por workspace

- [ ] `pnpm typecheck` verde.
- [ ] El contenedor del workspace se ve en el navegador.
- [ ] `index.ts` del workspace exporta el contenedor.
- [ ] `docs/01-ui-map.md`, `02-roadmap.md`, `03-spec.md` con contenido real.
- [ ] `README.md` con mapa de componentes.
- [ ] `docs/04-handoff-v2.md` para la siguiente IA.
- [ ] `git status --short` limpio de ficheros no relacionados.

---

## 14. Ejemplo de patchset correcto

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"

$file = "apps/web/src/workspaces/02-whatsapp/types.ts"
$mark = "CHAT_UI_TYPES_V1"

if (Test-Path $file) {
  $content = Get-Content $file -Raw
  if ($content -match $mark) {
    Write-Host "SKIP: $mark ya existe" -ForegroundColor DarkGray
  } else {
    Write-Host "AVISO: $file existe sin la marca $mark. No sobreescribo." -ForegroundColor Yellow
  }
} else {
  $lines = @(
    '// CHAT_UI_TYPES_V1',
    '',
    'export type ChatRole = "owner" | "employee" | "client" | "agent" | "system"',
    ''
  )
  [System.IO.File]::WriteAllText(
    (Join-Path (Get-Location) $file),
    ($lines -join "`r`n"),
    (New-Object System.Text.UTF8Encoding $false)
  )
  Write-Host "OK: $file [$mark]" -ForegroundColor Green
}
```

---

FIN DEL HANDOFF.
````

## File: 03-CONTINUACION-PIPELINE-WORKSPACES.md.md
````markdown
<!-- CONTINUACION_PIPELINE_WORKSPACES_V1 -->
# Continuacion del pipeline de workspaces

> Este doc complementa a otros dos. NO los reemplaza.
> Orden de lectura:
> 1. HANDOFF-IA-WORKSPACES.md (reglas de PowerShell, repomix, paleta)
> 2. 34-workspaces-pipeline.md (pipeline y SOP)
> 3. Este. Aumenta y complementa.

---

## 1. Las tres capas de un workspace

Un workspace no es una sola cosa. Tiene tres capas. La IA debe
entenderlas antes de tocar nada. Esto NO esta en los otros dos docs.

### Capa backend (contract)

Vive en `packages/workspaces/NN-nombre/`. Declara el contrato:
capacidades, comandos, queries, eventos, entidades. Cada workspace
backend exporta un `WorkspaceModule` con `manifest`, `capabilities`,
`views`, `publishes`, `consumes`.

Estado real de los 34 backend:

- `capabilities.ts` completo.
- `commands.ts` completo.
- `queries.ts` completo.
- `views.ts` vacio (`VIEWS = []`).
- `contract.ts` con `status: "implemented"`.
- `workspace.json` con `status: "scaffold"`.

Esa incoherencia entre `contract.ts` y `workspace.json` es conocida.
No la arregla este frente. Pero la IA debe saber que existe.

### Capa frontend (UI)

Vive en `apps/web/src/workspaces/NN-nombre/`. Es lo que implementa
la IA. Estructura:

```
NN-nombre/
├── README.md
├── index.ts
├── types.ts
├── format.ts
├── <Nombre>Workspace.css
├── api.ts
├── hooks/
├── components/
└── docs/
```

### Capa de montaje

El `registry.ts` y el `WorkspaceShell.tsx` viven en
`apps/web/src/workspaces/`. Son compartidos por los 34. La IA no los
toca, pero debe entenderlos para saber donde se monta su workspace.

---

## 2. Como se monta un workspace hoy

Esto es critico. La IA que no lo sepa va a fallar. NO esta en los
otros dos docs.

`registry.ts` es **metadata-only**. Define:

```ts
interface WorkspaceFrontendEntry {
  id: string;
  slug: string;
  family: WorkspaceFamily;
  title: string;
  reference: string;
}
```

No tiene `component`, ni `loader`, ni `render`. Solo datos. Funciones:
`getWorkspace(id)`, `listByFamily(family)`.

`WorkspaceShell.tsx` recibe `{ workspaceId, spec }` y monta:

```tsx
<ViewRenderer spec={spec} />
```

`ViewRenderer` pinta un `RuntimeViewSpec` con una de las 9 plantillas
de `apps/web/src/templates/`:

- `dashboard`
- `queue`
- `inbox`
- `board`
- `table`
- `detail`
- `form`
- `timeline`
- `graph`

**Consecuencia para la IA:** un workspace que encaja en una de esas
9 plantillas NO necesita componente React propio. Basta con que el
backend sirva un `RuntimeViewSpec`. Pero un workspace cuya UI no
encaja (chat, kanban con drag&drop, editores ricos) necesita una
via de montaje aparte.

### Las tres opciones de montaje

**Opcion A - Plantilla existente.**
El workspace se sirve con `RuntimeViewSpec` y `ViewRenderer`. No hay
componente React propio. Es la via normal. La mayoria de workspaces
(tablas, listas, dashboards) pueden ir por aqui.

**Opcion B - Excepcion en WorkspaceShell.**
Si `workspaceId === "NN-nombre"`, montar un componente propio en vez
de `ViewRenderer`. Rompe la simetria pero permite UI no-estandar.
Asi se hizo con `02-whatsapp`.

**Opcion C - Ruta propia en App.tsx.**
El workspace vive fuera del sistema de shells. Es lo que menos encaja
con el catalogo. Solo si A y B no valen.

**Antes de decidir cual**, la IA debe ver `WorkspaceShell.tsx` y
`App.tsx`. Sin verlos, no se decide.

---

## 3. Orden de lectura obligatorio antes de tocar nada

La IA NO escribe una sola linea hasta haber leido todo esto. Si no
lo tiene, lo pide. En este orden. NO esta en los otros dos docs.

### 3.1. El arbol del frente

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
tree "apps/web/src/workspaces" /F /A
```

### 3.2. El workspace objetivo

```powershell
Get-ChildItem "apps/web/src/workspaces/NN-nombre" -Recurse | Select-Object FullName
Get-Content "apps/web/src/workspaces/NN-nombre/README.md"
Get-Content "apps/web/src/workspaces/NN-nombre/index.ts"
Get-Content "apps/web/src/workspaces/NN-nombre/docs/01-ui-map.md"
Get-Content "apps/web/src/workspaces/NN-nombre/docs/02-roadmap.md"
Get-Content "apps/web/src/workspaces/NN-nombre/docs/03-spec.md"
```

### 3.3. Los ficheros globales del frontend (una vez por sesion)

```powershell
Get-Content "apps/web/src/workspaces/registry.ts"
Get-Content "apps/web/src/workspaces/WorkspaceShell.tsx"
Get-Content "apps/web/src/workspaces/index.ts"
Get-Content "apps/web/tailwind.config.js"
Get-Content "apps/web/src/index.css"
```

### 3.4. Los ficheros de montaje (si el workspace se monta)

```powershell
Get-Content "apps/web/src/App.tsx"
Get-Content "apps/web/src/main.tsx"
```

### 3.5. La referencia viva: 02-whatsapp

El workspace `02-whatsapp` ya esta implementado. Es la base de este
pipeline. Antes de empezar otro, leer:

```powershell
Get-Content "apps/web/src/workspaces/02-whatsapp/README.md"
Get-Content "apps/web/src/workspaces/02-whatsapp/types.ts"
Get-Content "apps/web/src/workspaces/02-whatsapp/format.ts"
Get-Content "apps/web/src/workspaces/02-whatsapp/api.ts"
Get-Content "apps/web/src/workspaces/02-whatsapp/hooks/useChatWorkspace.ts"
Get-Content "apps/web/src/workspaces/02-whatsapp/components/ChatWorkspace.tsx"
```

Con eso ve el patron real de un workspace implementado.

### 3.6. El backend del workspace (si aplica)

```powershell
Get-Content "packages/workspaces/NN-nombre/workspace.json"
Get-Content "packages/workspaces/NN-nombre/src/contract.ts"
Get-Content "packages/workspaces/NN-nombre/src/application/commands.ts"
Get-Content "packages/workspaces/NN-nombre/src/application/queries.ts"
Get-Content "packages/workspaces/NN-nombre/src/application/capabilities.ts"
Get-Content "packages/workspaces/NN-nombre/src/domain/entities.ts"
```

Con eso la IA sabe que datos, comandos y queries tiene ya declarados
el backend para ese workspace. La UI debe reflejarlos, no inventarlos.

---

## 4. Repomix cuando el config excluye apps/web/

Esto es un bug real que ya ha pasado. NO esta en los otros dos docs.

El `repomix.config.json` del repo excluye `apps/web/**` en sus
`customPatterns`. Eso significa que:

```powershell
npx repomix --include "apps/web/src/..." --output x.md
```

sale **vacio**. Aunque el include parezca correcto. El ignore del
config gana.

### Solucion 1 (recomendada): pedir ficheros uno a uno

```powershell
Get-Content "apps/web/src/workspaces/NN-nombre/README.md"
```

El humano pega el output. Es lo mas eficiente para la IA y lo que
hemos usado para el 02-whatsapp.

### Solucion 2: repomix con override de config

Si de verdad se quiere repomix:

```powershell
npx repomix --style markdown --include "apps/web/src/workspaces/NN-nombre/**" --ignore "**/node_modules/**,**/dist/**,**/.git/**" --config "{\"ignore\":{\"customPatterns\":[\"**/node_modules/**\",\"**/dist/**\",\"**/.git/**\"]}}" --output repomix-ws-NN.md
```

El `--config` override desactiva el `apps/web/**` del config real.

### Lo que NO hay que pedir

- El repo entero.
- `apps/web/**` sin acotar.
- `node_modules`, `dist`, `.git`, `.env`, `artifacts`, `coverage`.
- `apps/server/`, `packages/`, `clientes/`, `docs/` salvo que el
  workspace lo requiera.

---

## 5. Modos de trabajo

Cuando el humano dice "trabajamos el workspace NN-nombre", puede
querer cuatro cosas distintas. La IA debe preguntar cual. NO esta en
los otros dos docs.

**Modo implementar.**
La UI no existe o es scaffold. La IA la construye entera siguiendo
el pipeline de los 9 pasos.

**Modo actualizar docs.**
La UI ya existe pero los docs (README, 01-ui-map, 02-roadmap,
03-spec, 04-handoff-v2) estan a medias o desfasados. La IA los
actualiza contra el codigo real.

**Modo verificar.**
La UI y los docs ya existen. La IA comprueba que todo cuadra:
paleta correcta, imports con extension, typecheck verde, nada
inventado.

**Modo corregir.**
Hay un bug o algo no encaja. La IA lo arregla con un patchset
quirurgico.

---

## 6. Los 34 workspaces backend

NO esta en los otros dos docs. Es importante saberlo porque la UI
debe reflejar el backend.

- Viven en `packages/workspaces/NN-nombre/`.
- Cada uno exporta un `WorkspaceModule`.
- El barrel `packages/workspaces/src/index.ts` exporta `ALL_WORKSPACES`.
- El `MANIFEST.yaml` los agrupa en 9 familias.
- El `views.ts` de los 34 esta vacio (`VIEWS = []`).
- El `workspace.json` dice `status: "scaffold"`, el `contract.ts`
  dice `status: "implemented"`. Incoherencia conocida.

Si la IA implementa la UI de un workspace, debe leer los comandos,
queries y capabilities del backend para saber que datos maneja. No
inventar entidades.

---

## 7. api.ts del workspace vs api global

NO esta en los otros dos docs.

Cada workspace puede tener su `api.ts` dentro del workspace. Es lo
que hemos hecho con `02-whatsapp/api.ts`. Es un mock en memoria con
las firmas reales.

Ademas, el repo tiene `apps/web/src/api/` con ficheros globales:
`chat.ts`, `agents.ts`, `threads.ts`, `tasks.ts`, etc. **No los
hemos visto.** Si existen y tienen contenido vivo, la IA no los
toca sin verlos.

Regla: el `api.ts` del workspace es del workspace. El `api/` global
es del repo. Si el workspace necesita conectar al backend real, se
decide entonces si se sustituye su `api.ts` o se unifica con el
global.

---

## 8. AppShell vs WorkspaceShell

NO esta en los otros dos docs.

- `apps/web/src/components/AppShell.tsx`: shell de la app entera.
  Sidebar, topbar, layout global.
- `apps/web/src/workspaces/WorkspaceShell.tsx`: contenedor del
  workspace activo. Recibe `{ workspaceId, spec }`. Monta
  `ViewRenderer`.

No son lo mismo. Si la IA confunde uno con otro, monta el workspace
en el sitio equivocado.

---

## 9. pnpm typecheck corre tambien el worker

NO esta en los otros dos docs.

En el `package.json` de la raiz:

```json
"typecheck": "tsc --noEmit && npm --prefix apps/worker run typecheck"
```

Si aparecen errores del worker, **no son del workspace**. La IA debe
filtrar y quedarse solo con los de `apps/web/`.

Para chequear solo el frontend:

```powershell
pnpm --filter @openmuse/web exec tsc --noEmit
```

---

## 10. Trampas conocidas (por gravedad)

### Criticas

1. **Repomix vacio.** El config excluye `apps/web/**`. Solucion:
   pedir ficheros con `Get-Content`, o `--config` override.
2. **Montaje mal entendido.** `registry.ts` no monta componentes.
   `WorkspaceShell` monta `ViewRenderer`, no componentes del
   workspace. El chat fue una excepcion.
3. **Paleta inventada.** `bg-canvas`, `bg-surface`, `text-ink`,
   `text-muted`, `bg-accent` NO existen. Usar los reales:
   `bg-bg-card`, `bg-bg-soft`, `border-border`, `text-text`,
   `text-text-2`, `purple`, `purple-soft`, `green`.
4. **Dark mode.** El repo no lo tiene. No meter
   `@media (prefers-color-scheme: dark)` ni `data-theme`.

### Importantes

5. **Heredoc anidado en PowerShell.** Revienta el shell. Usar
   arrays de lineas.
6. **18 ficheros en un script.** Un patchset = un fichero.
7. **Imports sin extension.** El repo usa `moduleResolution:
   NodeNext`. Todos los imports llevan `.ts` o `.tsx`.
8. **`&&` y `;`.** Prohibidos. Un comando por linea.
9. **`git add .`.** Prohibido. Selectivo por fichero.
10. **Fuentes ajenas.** El repo usa `Instrument Sans`. No meter
    `Inter` ni otra.

### Menores

11. **`pnpm typecheck` corre el worker.** Filtrar errores.
12. **`contexts/` no existe.** No crearlo. El estado va en
    `hooks/useXxx.ts` dentro del workspace.
13. **`04-handoff-v2.md`** es parte del boilerplate. Crearlo al
    terminar cada workspace.
14. **Los 34 backend tienen `views.ts` vacio.** Si el workspace
    necesita una vista servida, hay que rellenarlo. Eso es otro
    frente (handoff de 214 fixes).

---

## 11. Checklist antes de escribir la primera linea

La IA no escribe codigo hasta tener todo esto:

- [ ] Arbol del frente (`tree apps/web/src/workspaces`).
- [ ] README, index.ts, docs del workspace objetivo.
- [ ] `registry.ts`, `WorkspaceShell.tsx`, `index.ts` de workspaces.
- [ ] `tailwind.config.js` y `index.css`.
- [ ] `App.tsx` y `main.tsx` si el workspace se monta.
- [ ] El `02-whatsapp` como referencia viva.
- [ ] El backend del workspace (`packages/workspaces/NN-nombre/`).
- [ ] Decidido el modo de trabajo (implementar / docs / verificar /
      corregir).
- [ ] Decidido donde se monta (opcion A, B o C).

---

## 12. Checklist antes de dar por terminado un workspace

- [ ] `pnpm --filter @openmuse/web exec tsc --noEmit` verde.
- [ ] `pnpm typecheck` verde (o errores solo del worker).
- [ ] El contenedor del workspace se ve en el navegador (si se monto).
- [ ] `index.ts` del workspace exporta el contenedor.
- [ ] `README.md` con mapa de componentes.
- [ ] `docs/01-ui-map.md`, `02-roadmap.md`, `03-spec.md` con
      contenido real.
- [ ] `docs/04-handoff-v2.md` para la siguiente IA.
- [ ] Paleta real del repo, sin invenciones.
- [ ] Sin dark mode.
- [ ] Sin fuentes ajenas.
- [ ] Imports con extension `.ts` / `.tsx`.
- [ ] `git status --short` limpio de ficheros no relacionados.

---

## 13. Como se encadena un workspace con el siguiente

Al terminar un workspace, antes de pasar al siguiente:

1. Actualizar `docs/04-handoff-v2.md` del workspace terminado, con:
   - Estado final.
   - Que quedo pendiente.
   - Que ficheros globales toco (si alguno).
2. Actualizar el `README.md` del workspace si cambio algo.
3. `git status --short` y `git add` selectivo por fichero.
4. `git commit` con mensaje `feat(web): workspace NN-nombre UI`.
5. Pasar al siguiente segun el orden recomendado:
   08-chatgpt, 09-airtable, 16-n8n, 33-langsmith, ...

---

## 14. Definicion de "workspace terminado"

Un workspace esta terminado cuando TODO esto es verdad:

- Compila sin errores propios.
- Se ve en el navegador o esta montado por la via decidida.
- Su README dice la verdad de lo que hay.
- Sus 4 docs (`01-ui-map`, `02-roadmap`, `03-spec`, `04-handoff-v2`)
  estan escritos.
- El `index.ts` exporta el contenedor.
- No hay ni una clase Tailwind inventada.
- No hay dark mode.
- No hay fuentes ajenas.
- No hay `&&`, ni `;`, ni `git add .` en su historia de patches.
- Su handoff v2 permite a otra IA continuar sin contexto previo.

---

FIN DEL DOC DE CONTINUACION.
````

## File: 34-workspaces-pipeline.md.bak-V1
````
# Vale. Analizo a fondo el proceso que hemos seguido y lo extraigo como plantilla reutilizable para los 34.

# 

# \---

# 

# \# ANÁLISIS — Proceso aplicado al workspace 02-whatsapp

# 

# \## 1. Qué hemos hecho, en orden real

# 

# 1\. \*\*Identificar el workspace\*\* (02-whatsapp) y su familia (comunicacion).

# 2\. \*\*Ver la estructura existente\*\* (`workspaces/02-whatsapp/{README,index.ts,components,docs,hooks}`).

# 3\. \*\*Ver el registry\*\* (`workspaces/registry.ts`) y confirmar que solo tiene metadata.

# 4\. \*\*Ver el shell\*\* (`WorkspaceShell.tsx`) y confirmar que monta `ViewRenderer` con un `ViewSpec`.

# 5\. \*\*Decidir dónde vive la UI\*\*: dentro del workspace, no en `components/chat/`.

# 6\. \*\*Decidir la paleta\*\*: la real del repo (`bg-bg-card`, `bg-bg-soft`, `border-border`, `text-text`, `text-text-2`, `purple`, `purple-soft`, `green`).

# 7\. \*\*Decidir las fuentes\*\*: la real del repo (`Instrument Sans`).

# 8\. \*\*Decidir dark mode\*\*: no hay, no se mete.

# 9\. \*\*Escribir el README\*\* con mapa de componentes y fases.

# 10\. \*\*Crear `types.ts`\*\* con los tipos del workspace.

# 11\. \*\*Crear `format.ts`\*\* con las utilidades.

# 12\. \*\*Crear el CSS\*\* solo con estructura (sin tokens).

# 13\. \*\*Crear `api.ts`\*\* con mock en memoria.

# 14\. \*\*Crear el hook\*\* (`hooks/useChatWorkspace.ts`) con el estado.

# 15\. \*\*Crear los 10 componentes\*\* uno a uno.

# 16\. \*\*Crear el contenedor\*\* (`ChatWorkspace.tsx`).

# 17\. \*\*Crear `AppRail.tsx`\*\* fuera del workspace.

# 18\. \*\*Corregir la paleta\*\* en 14 ficheros (mapping de clases).

# 19\. \*\*Documentar el handoff v2\*\* para la siguiente IA.

# 20\. \*\*Pendiente\*\*: montar, actualizar index, escribir docs internos.

# 

# \## 2. Patrón extraído

# 

# Todo el proceso se reduce a este pipeline:

# 

# ```

# FASE 0 - Auditoría

# &#x20; 0.1. Leer estructura del workspace (README, index.ts, components, docs, hooks)

# &#x20; 0.2. Leer registry.ts (confirmar metadata-only)

# &#x20; 0.3. Leer WorkspaceShell.tsx (confirmar cómo monta)

# &#x20; 0.4. Leer tailwind.config.js (paleta real)

# &#x20; 0.5. Leer index.css (reglas globales)

# &#x20; 0.6. Leer App.tsx y main.tsx (montaje global)

# &#x20; 0.7. Leer api/chat.ts (o el api existente del workspace)

# 

# FASE 1 - Decisiones

# &#x20; 1.1. ¿La UI vive dentro del workspace o fuera?

# &#x20; 1.2. ¿Qué paleta usa? (la real, no inventada)

# &#x20; 1.3. ¿Qué fuente? (la real)

# &#x20; 1.4. ¿Dark mode? (no, si el repo no lo tiene)

# &#x20; 1.5. ¿Qué tipos necesita?

# &#x20; 1.6. ¿Qué utilidades necesita?

# &#x20; 1.7. ¿Qué mock necesita?

# &#x20; 1.8. ¿Qué hook necesita?

# &#x20; 1.9. ¿Qué componentes necesita?

# &#x20; 1.10. ¿Qué contenedor los orquesta?

# 

# FASE 2 - Documentación

# &#x20; 2.1. README del workspace con mapa de componentes

# &#x20; 2.2. Docs internos (01-ui-map, 02-roadmap, 03-spec)

# 

# FASE 3 - Contratos y utilidades

# &#x20; 3.1. types.ts

# &#x20; 3.2. format.ts

# &#x20; 3.3. CSS solo estructura

# 

# FASE 4 - Datos y estado

# &#x20; 4.1. api.ts (mock)

# &#x20; 4.2. hooks/useXxx.ts

# 

# FASE 5 - Componentes hoja

# &#x20; 5.1. Avatar (o equivalente)

# &#x20; 5.2. Búsquedas, filtros, listas

# &#x20; 5.3. Items de lista

# &#x20; 5.4. Burbujas / tarjetas

# 

# FASE 6 - Componentes contenedores

# &#x20; 6.1. Cabeceras

# &#x20; 6.2. Listas

# &#x20; 6.3. Paneles

# &#x20; 6.4. Composers / formularios

# &#x20; 6.5. Contenedor principal

# 

# FASE 7 - Corrección

# &#x20; 7.1. Mapear clases inventadas a clases reales

# &#x20; 7.2. Un patchset por fichero con .Replace()

# &#x20; 7.3. Verificar con pnpm typecheck

# 

# FASE 8 - Montaje

# &#x20; 8.1. Actualizar index.ts del workspace

# &#x20; 8.2. Montar en WorkspaceShell o App.tsx

# &#x20; 8.3. Verificar en navegador

# 

# FASE 9 - Handoff

# &#x20; 9.1. Doc v2 con estado actual

# &#x20; 9.2. Lista de ficheros que la siguiente IA necesita ver

# &#x20; 9.3. Tareas pendientes

# ```

# 

# \## 3. Boilerplate por workspace

# 

# Cada uno de los 34 workspaces sigue la misma estructura. Esto es lo que hay que generar:

# 

# ```

# apps/web/src/workspaces/NN-nombre/

# ├── README.md                          mapa del workspace (XXX\_UI\_MAP\_V1)

# ├── index.ts                           metadata + export del componente

# ├── types.ts                           tipos del workspace (XXX\_TYPES\_V1)

# ├── format.ts                          utilidades (XXX\_FORMAT\_V1)

# ├── ui.css                             estilos estructurales (XXX\_UI\_CSS\_V1)

# ├── api.ts                             mock en memoria (XXX\_API\_V1)

# ├── hooks/

# │   └── useXxx.ts                      estado (XXX\_HOOK\_V1)

# ├── components/

# │   ├── XxxWorkspace.tsx               contenedor (XXX\_WORKSPACE\_V1)

# │   ├── XxxHeader.tsx

# │   ├── XxxList.tsx

# │   ├── XxxListItem.tsx

# │   ├── XxxFilters.tsx

# │   ├── XxxSearch.tsx

# │   ├── XxxDetail.tsx

# │   ├── XxxForm.tsx

# │   ├── XxxEmptyState.tsx

# │   └── ...                            (los que necesite)

# └── docs/

# &#x20;   ├── 01-ui-map.md                   mapa real

# &#x20;   ├── 02-roadmap.md                  fases reales

# &#x20;   ├── 03-spec.md                     spec real

# &#x20;   └── 04-handoff-v2.md               handoff para la siguiente IA

# ```

# 

# Y fuera, si aplica:

# 

# ```

# apps/web/src/components/layout/AppRail.tsx     (solo si hace falta)

# apps/web/src/components/shared/Xxx.tsx         (si varios workspaces lo comparten)

# ```

# 

# \## 4. SOP — Procedimiento estándar por workspace

# 

# Esto es el SOP que hay que seguir con cada uno de los 34:

# 

# \### SOP-1 — Auditoría (10 min)

# 

# ```powershell

# cd "C:\\Users\\Alfonso\\Desktop\\git hub repos\\agente"

# 

# \# Ver lo que ya existe en el workspace

# Get-ChildItem "apps/web/src/workspaces\\NN-nombre" -Recurse | Select-Object FullName

# 

# \# Ver el README actual

# Get-Content "apps/web/src/workspaces\\NN-nombre\\README.md"

# 

# \# Ver el index.ts actual

# Get-Content "apps/web/src/workspaces\\NN-nombre\\index.ts"

# 

# \# Ver los docs actuales

# Get-Content "apps/web/src/workspaces\\NN-nombre\\docs\\01-ui-map.md"

# Get-Content "apps/web/src/workspaces\\NN-nombre\\docs\\02-roadmap.md"

# Get-Content "apps/web/src/workspaces\\NN-nombre\\docs\\03-spec.md"

# 

# \# Ver el registry y el shell (una vez, no por workspace)

# Get-Content "apps/web/src/workspaces\\registry.ts"

# Get-Content "apps/web/src/workspaces\\WorkspaceShell.tsx"

# ```

# 

# \### SOP-2 — Decisiones (5 min)

# 

# Responder por escrito:

# 

# 1\. ¿Qué UI necesita este workspace? (lista, board, tabla, kanban, dashboard, chat, etc.)

# 2\. ¿Qué roles/estados tiene?

# 3\. ¿Qué acciones ejecuta?

# 4\. ¿Qué tipos necesita?

# 5\. ¿Qué paleta usa? (la del repo, siempre)

# 6\. ¿Qué componentes reutiliza de otros workspaces? (si los hay)

# 7\. ¿Necesita mock? ¿De qué forma?

# 8\. ¿Necesita hook propio o estado local?

# 9\. ¿Dónde se monta? (WorkspaceShell por excepción / ruta propia)

# 

# \### SOP-3 — Doc del workspace (15 min)

# 

# Crear el `README.md` con:

# \- Objetivo

# \- Estructura de ficheros

# \- Mapa de componentes (tabla: fichero | marca | qué es)

# \- Contratos de tipos

# \- Estado compartido

# \- Datos (mock)

# \- Relación con el resto del repo

# \- Roadmap por fases

# \- Pendientes conocidos

# 

# \### SOP-4 — Contratos y utilidades (20 min)

# 

# \- `types.ts`: tipos puros. Sin React, sin colores.

# \- `format.ts`: utilidades puras. Sin React, sin colores.

# \- `ui.css`: solo estructura (display, overflow, grid). Sin tokens, sin dark mode.

# 

# \### SOP-5 — Datos y estado (20 min)

# 

# \- `api.ts`: mock con las firmas reales que tendrá la API.

# \- `hooks/useXxx.ts`: estado. Suscribe al mock. Devuelve estado + setters.

# 

# \### SOP-6 — Componentes hoja (40 min)

# 

# Uno a uno, un patchset por fichero. Orden recomendado:

# 1\. Avatar / Icon / Badge (si aplica)

# 2\. Search

# 3\. Filters

# 4\. Item de lista

# 5\. Burbuja / tarjeta / celda

# 

# \### SOP-7 — Componentes contenedores (40 min)

# 

# 1\. Header

# 2\. List

# 3\. Detail / Panel

# 4\. Form / Composer

# 5\. Contenedor principal

# 

# \### SOP-8 — Corrección (20 min)

# 

# Revisar todas las clases Tailwind. Mapear al sistema real del repo:

# 

# | Inventada | Real |

# |---|---|

# | `bg-canvas` | `bg-bg-card` |

# | `bg-surface` | `bg-bg-soft` |

# | `border-line` | `border-border` |

# | `text-ink` | `text-text` |

# | `text-muted` | `text-text-2` |

# | `bg-accent` | `bg-purple` |

# | `text-accent` | `text-purple` |

# | `border-accent` | `border-purple` |

# | `bg-accentsoft` | `bg-purple-soft` |

# | `bg-online` | `bg-green` |

# | `text-canvas` | `text-white` |

# 

# Un patchset por fichero con `.Replace()`.

# 

# \### SOP-9 — Montaje (variable)

# 

# 1\. Actualizar `index.ts` del workspace.

# 2\. Decidir: `WorkspaceShell` por excepción o ruta nueva.

# 3\. Escribir el bloque.

# 4\. Verificar en navegador.

# 

# \### SOP-10 — Handoff v2 (15 min)

# 

# Crear `docs/04-handoff-v2.md` con:

# \- Estado actual

# \- Qué falta

# \- Ficheros que la siguiente IA necesita ver

# \- Tareas pendientes en orden

# \- Convenciones de patchset

# \- Trampas conocidas

# \- Definición de terminado

# 

# \## 5. Pipeline completo, resumido

# 

# ```

# workspace NN → auditoría → decisiones → doc → contratos → datos → componentes → corrección → montaje → handoff

# &#x20;      ↑                                                                                                ↓

# &#x20;      └──────────────────────── siguiente workspace ←──────────────────────────────────────────────────┘

# ```

# 

# \## 6. Tiempo estimado

# 

# Por workspace, con este SOP:

# 

# \- Auditoría: 10 min

# \- Decisiones: 5 min

# \- Doc: 15 min

# \- Contratos: 20 min

# \- Datos: 20 min

# \- Componentes: 80 min (8-12 componentes)

# \- Corrección: 20 min

# \- Montaje: 10 min

# \- Handoff: 15 min

# 

# \*\*Total: \~3 horas por workspace.\*\*

# 

# 34 workspaces → \*\*\~100 horas\*\*.

# 

# Con paralelización (varias IAs, varios workspaces a la vez): \*\*\~15-20 horas\*\* repartidas entre las IAs.

# 

# \## 7. Lo que NO hay que hacer con los 34

# 

# Aprendido a base de romperlo con el 02:

# 

# 1\. \*\*No inventar paletas.\*\* Usar `bg-bg-card`, `purple`, etc.

# 2\. \*\*No meter dark mode.\*\* El repo no lo tiene.

# 3\. \*\*No meter fuentes ajenas.\*\* `Instrument Sans` y punto.

# 4\. \*\*No meter contexto global si el workspace es el único consumidor.\*\* Usar `hooks/useXxx.ts` dentro del workspace.

# 5\. \*\*No tocar `api/chat.ts`\*\* ni otros ficheros globales sin verlos.

# 6\. \*\*No reescribir `tailwind.config.js`.\*\*

# 7\. \*\*No meter los componentes en `components/`.\*\* Van dentro del workspace.

# 8\. \*\*No crear `contexts/`\*\* si no existe.

# 9\. \*\*No meter heredocs anidados en PowerShell.\*\*

# 10\. \*\*No meter 18 ficheros en un solo script.\*\*

# 11\. \*\*No tocar `App.tsx` ni `main.tsx`\*\* a ciegas.

# 12\. \*\*No montar el workspace\*\* hasta decidir dónde.

# 

# \## 8. Orden recomendado de los 34

# 

# Por dependencia, familia y complejidad:

# 

# \*\*Primero (simples, sin deps):\*\*

# \- 08-chatgpt (global, simple)

# \- 09-airtable (datos, tablas)

# \- 16-n8n (trabajo, workflows)

# \- 33-langsmith (gobierno, observabilidad)

# 

# \*\*Segundo (comunicación, similar al 02):\*\*

# \- 01-gmail

# \- 14-zendesk

# \- 25-intercom

# \- 31-suitedash

# \- 23-buffer

# 

# \*\*Tercero (documentos):\*\*

# \- 05-google-drive

# \- 32-notion

# \- 15-docusign

# \- 22-canva

# 

# \*\*Cuarto (finanzas):\*\*

# \- 04-holded

# \- 11-holded-tesoreria

# \- 12-odoo-purchase

# \- 20-ramp

# \- 21-stripe

# \- 24-shopify

# 

# \*\*Quinto (personas):\*\*

# \- 10-perdoo

# \- 18-factorial

# \- 19-personio

# 

# \*\*Sexto (trabajo):\*\*

# \- 06-google-calendar

# \- 07-linear

# \- 13-productive

# \- 17-process-street

# \- 34-trello

# 

# \*\*Séptimo (operaciones):\*\*

# \- 26-odoo-inventory

# \- 27-maintainx

# \- 28-odoo-manufacturing

# 

# \*\*Octavo (gobierno):\*\*

# \- 29-isms-online

# \- 30-microsoft-entra

# 

# \*\*Último (ya hecho):\*\*

# \- 02-whatsapp

# 

# \## 9. Plantilla de prompt para cada workspace

# 

# Cuando quieras arrancar otro workspace, este es el prompt que le pasas a la IA:

# 

# ```

# Vamos a implementar la UI del workspace NN-nombre.

# 

# Sigue el SOP que ya aplicamos al 02-whatsapp. El patrón está en

# apps/web/src/workspaces/02-whatsapp/docs/04-handoff-v2.md.

# 

# Fase 1 - Auditoría: pásame el contenido de:

# \- apps/web/src/workspaces/NN-nombre/README.md

# \- apps/web/src/workspaces/NN-nombre/index.ts

# \- apps/web/src/workspaces/NN-nombre/docs/01-ui-map.md

# \- apps/web/src/workspaces/NN-nombre/docs/02-roadmap.md

# \- apps/web/src/workspaces/NN-nombre/docs/03-spec.md

# 

# Fase 2 - Decisiones: dime qué UI necesita, qué tipos, qué componentes.

# 

# Fase 3 - Doc: README con mapa de componentes.

# 

# Fase 4 - Contratos: types.ts, format.ts, ui.css.

# 

# Fase 5 - Datos: api.ts, hooks/useXxx.ts.

# 

# Fase 6 - Componentes: uno a uno, un patchset por fichero.

# 

# Fase 7 - Corrección de paleta.

# 

# Fase 8 - Montaje.

# 

# Fase 9 - Handoff v2.

# 

# Reglas:

# \- Un patchset = un fichero.

# \- Paleta real del repo (bg-bg-card, purple, etc).

# \- Sin dark mode.

# \- Sin fuentes ajenas.

# \- Imports con extensión .ts/.tsx.

# \- Sin \&\& ni ;.

# \- Idempotente por marca.

# ```

# 

# \## 10. Lo que falta para hacerlo bien en serie

# 

# 1\. \*\*Un fichero maestro\*\* (`docs/ui/WORKSPACES-UI-SOP.md`) con este SOP, para que cualquier IA lo lea antes de tocar un workspace.

# 2\. \*\*Una plantilla\*\* (`docs/ui/WORKSPACES-UI-TEMPLATE/`) con los ficheros vacíos y las marcas `\_V1` puestas. Solo hay que rellenar.

# 3\. \*\*Un registry de estados\*\* para saber en qué fase está cada workspace: `scaffold`, `types-done`, `mock-done`, `components-done`, `mounted`, `verified`.

# 4\. \*\*Un checklist\*\* por workspace, en `docs/ui/CHECKLIST-NN-nombre.md`, con las 9 fases.

# 

# \## 11. Qué propongo ahora

# 

# Tres opciones:

# 

# \*\*A. Crear primero el SOP maestro\*\* (`docs/ui/WORKSPACES-UI-SOP.md`) con este proceso entero, para que las IAs lo sigan sin reinventarlo cada vez.

# 

# \*\*B. Crear primero la plantilla\*\* (`docs/ui/WORKSPACES-UI-TEMPLATE/`) con los ficheros vacíos y las marcas, para clonarla por workspace.

# 

# \*\*C. Arrancar el siguiente workspace\*\* (por ejemplo 08-chatgpt) siguiendo el SOP, y dejar el SOP maestro para después.

# 

# Yo recomiendo \*\*A\*\* primero (SOP), luego \*\*B\*\* (plantilla), luego \*\*C\*\* (workspaces en serie). Pero tú decides.

# 

# Dime qué opción y arrancamos.

# 

# \-------------------------------------------------Views and Templates Fase2

VIEWS\_AND\_TEMPLATES V2

## Catalogo cerrado

accepts spec {kind data}
ViewSpec kind=collection|timeline|form|chart
FormSpec fields provenance chips
Intent Resolver input user+fast -> spec

## ViewRenderer

readView precomputada fast
collection cards con provenance
timeline turn.thoughts orden
chips auto-alta media sugerido tu

## FormRenderer

computeView lenta profunda
provenance chips por campo
POST /api/views/resolve spec -> view

## Flujo

fast-author -> readView -> UI inmediata
slow-author -> computeView -> progress
Meta hints slow\_ready\_fast\_idle slice 0..200
Presenter PRIORITY elige response display etc

## Endpoint debug

GET /api/kernel/turns/:turnId debug
POST /api/views/resolve {spec}
````

## File: App.tsx
````typescript
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
// WS_UI_APP_SHELL_V1
import WorkspaceShell from "./workspaces/WorkspaceShell";
import { useWorkspaces } from "./hooks/useWorkspaces";
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
  const [activeWorkspaceId] = useState<string | null>(null);
  const { workspaces: _workspaces } = useWorkspaces(auth.isAuthenticated);

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
          {view === "workspace" && <WorkspaceShell workspaceId={activeWorkspaceId} spec={viewResolver.spec} />}
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
````

## File: index.css
````css
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
````

## File: main.tsx
````typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
````
