// DEMO_ROUTER_V1 - adaptador de API del tenant demo.
//
// Responde a los mismos endpoints que la API real usando los fixtures en
// memoria. Las mutaciones se aplican al store para que la UI se comporte como
// si hablara con el backend (crear hilos, aprobar acciones, enviar borradores).
import type { ProjectBlock } from "../api/projects";
import type { AgentTask, ChatMessage } from "../types/api";
import {
  demoRagStatus,
  demoStore,
  makeEnvelope,
  nextDemoId,
  searchRag,
  whatsappConnection,
  workspaceDetail,
} from "./fixtures";

export interface DemoRequestOptions {
  method?: string;
  body?: unknown;
  headers?: unknown;
  signal?: AbortSignal | null;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function findTask(id: string): AgentTask | undefined {
  return demoStore.tasks.find((task) => task.id === id);
}

function refreshThreadCount(threadId: string): void {
  const thread = demoStore.threads.find((item) => item.id === threadId);
  if (!thread) return;
  thread.messageCount = thread.messages.length;
  thread.updatedAt = new Date().toISOString();
}

function ensureThread(id: string) {
  let thread = demoStore.threads.find((item) => item.id === id);
  if (!thread) {
    thread = {
      id,
      title: "Conversación nueva",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      messages: [],
    };
    demoStore.threads.unshift(thread);
  }
  return thread;
}

function kindFromIntent(intent: string): string {
  const text = intent.toLowerCase();
  if (/(cola|pendiente|entrega)/.test(text)) return "queue";
  if (/(bandeja|revis|aprob)/.test(text)) return "inbox";
  if (/(tablero|kanban|columna)/.test(text)) return "board";
  if (/(tabla|cartera|listado)/.test(text)) return "table";
  if (/(ficha|detalle|cliente)/.test(text)) return "detail";
  if (/(formulario|alta|nuevo)/.test(text)) return "form";
  return "dashboard";
}

export async function demoRequest<T>(
  path: string,
  options: DemoRequestOptions = {},
): Promise<T> {
  await wait(80);
  if (options.signal?.aborted) throw new Error("Petición cancelada");

  const method = (options.method ?? "GET").toUpperCase();
  const url = new URL(path, "http://demo.local");
  const p = url.pathname;
  const body = asRecord(options.body);
  const store = demoStore;

  /* ---------------------------------------------------------------- auth */
  if (p === "/api/auth/me" && method === "GET") return clone(store.user) as T;
  if (p === "/api/auth/logout") return clone({ ok: true }) as T;
  if (p === "/api/auth/me" && method === "PATCH") {
    if (typeof body.name === "string" && body.name.trim()) store.user.name = body.name.trim();
    const cached = store.users.find((user) => user.id === store.user.id);
    if (cached) cached.name = store.user.name;
    return clone(store.user) as T;
  }
  if (p === "/api/auth/users" && method === "GET") return clone(store.users) as T;
  if (p === "/api/auth/users" && method === "POST") {
    const created = {
      id: nextDemoId("u"),
      email: String(body.email ?? "nuevo@interfaz.studio"),
      name: String(body.name ?? "Nueva persona"),
      role: body.role === "admin" ? ("admin" as const) : ("user" as const),
      active: true,
      setup: { sopIds: [], allowedTools: [], greeting: "" },
      createdAt: new Date().toISOString(),
    };
    store.users.push(created);
    return clone(created) as T;
  }

  const userTasksMatch = p.match(/^\/api\/auth\/users\/([^/]+)\/tasks$/);
  if (userTasksMatch && method === "GET") {
    const userId = decodeURIComponent(userTasksMatch[1]);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const list = store.tasks.filter((task) => task.state.ownerId === userId).slice(0, limit);
    const total = store.tasks.filter((task) => task.state.ownerId === userId).length;
    return clone({
      userId,
      total,
      tasks: list.map((task) => ({
        id: task.id,
        title: task.title,
        kind: task.kind,
        status: task.status,
        updatedAt: task.updatedAt,
        createdAt: task.createdAt,
        attempts: task.attempts,
        result: task.result,
        error: task.error,
      })),
    }) as T;
  }

  const userMatch = p.match(/^\/api\/auth\/users\/([^/]+)$/);
  if (userMatch) {
    const userId = decodeURIComponent(userMatch[1]);
    const index = store.users.findIndex((user) => user.id === userId);
    if (method === "DELETE" && index >= 0) {
      store.users.splice(index, 1);
      return clone({ ok: true }) as T;
    }
    if (method === "PATCH" && index >= 0) {
      const current = store.users[index];
      store.users[index] = {
        ...current,
        ...(typeof body.name === "string" ? { name: body.name } : {}),
        ...(body.role === "admin" || body.role === "user" ? { role: body.role } : {}),
        ...(typeof body.active === "boolean" ? { active: body.active } : {}),
      };
      return clone(store.users[index]) as T;
    }
    if (index >= 0) return clone(store.users[index]) as T;
  }

  /* -------------------------------------------------------------- agentes */
  if (p === "/api/agent/roles" && method === "GET") return clone(store.agents) as T;
  if (p === "/api/agent/roles" && method === "POST") {
    const created = {
      id: String(body.id ?? nextDemoId("agent")),
      name: String(body.name ?? "Agente nuevo"),
      tone: (body.tone === "concise" || body.tone === "thoughtful" ? body.tone : "warm") as
        | "warm"
        | "concise"
        | "thoughtful",
      avatar: (body.avatar === "sky" || body.avatar === "lilac" ? body.avatar : "sand") as
        | "sky"
        | "sand"
        | "lilac",
      greeting: typeof body.greeting === "string" ? body.greeting : "",
      roi: typeof body.roi === "string" ? body.roi : "",
      objetivo: String(body.objetivo ?? ""),
      sops: Array.isArray(body.sops) ? (body.sops as string[]) : [],
      active: body.active !== false,
      memories: Array.isArray(body.memories)
        ? (body.memories as { kind: "identidad" | "dominio" | "preferencias" | "historial"; text: string }[])
        : [],
      createdAt: new Date().toISOString(),
    };
    store.agents.unshift(created);
    return clone(created) as T;
  }

  /* --------------------------------------------------------------- tareas */
  if (p === "/api/agent" && method === "GET") {
    return clone({
      tasks: store.tasks,
      goals: [],
      monitors: [],
      ideas: [],
      memories: store.memories,
      artifacts: Object.values(store.projectArtifacts).flat(),
      notifications: store.notifications,
      identity: { name: "Interfaz", tone: "warm", avatar: "sand" },
      worker: { running: true, lastTickAt: new Date().toISOString() },
    }) as T;
  }

  const taskDetailMatch = p.match(/^\/api\/agent\/tasks\/([^/]+)$/);
  if (taskDetailMatch && method === "GET") {
    const id = decodeURIComponent(taskDetailMatch[1]);
    const found = findTask(id);
    if (!found) throw new Error("Tarea no encontrada en el demo");
    const events = found.plan.map((step, index) => ({
      id: `ev-${found.id}-${index}`,
      taskId: found.id,
      date: found.updatedAt,
      kind: "step" as const,
      title: step.title,
      detail: step.detail ?? step.status,
    }));
    return clone({
      task: found,
      files: [],
      browsers: [],
      events,
      artifacts: Object.values(store.projectArtifacts)
        .flat()
        .filter((artifact) => artifact.taskId === found.id),
    }) as T;
  }

  const taskControlMatch = p.match(/^\/api\/agent\/tasks\/([^/]+)\/control$/);
  if (taskControlMatch && method === "POST") {
    const found = findTask(decodeURIComponent(taskControlMatch[1]));
    if (!found) throw new Error("Tarea no encontrada en el demo");
    const action = String(body.action ?? "");
    if (action === "pause") found.status = "paused";
    if (action === "resume" || action === "retry") found.status = "running";
    if (action === "cancel") found.status = "cancelled";
    found.updatedAt = new Date().toISOString();
    return clone(found) as T;
  }

  const taskInputMatch = p.match(/^\/api\/agent\/tasks\/([^/]+)\/input$/);
  if (taskInputMatch && method === "POST") {
    const found = findTask(decodeURIComponent(taskInputMatch[1]));
    if (!found) throw new Error("Tarea no encontrada en el demo");
    found.status = "running";
    found.question = undefined;
    found.updatedAt = new Date().toISOString();
    found.plan = found.plan.map((step) =>
      step.status === "waiting" ? { ...step, status: "running" } : step,
    );
    return clone(found) as T;
  }

  /* ------------------------------------------------------- notificaciones */
  if (p === "/api/agent/notifications" && method === "GET") {
    return clone({ tenantId: "interfaz", notifications: store.notifications }) as T;
  }
  const notifReadMatch = p.match(/^\/api\/agent\/notifications\/([^/]+)\/read$/);
  if (notifReadMatch && method === "POST") {
    const found = store.notifications.find((item) => item.id === decodeURIComponent(notifReadMatch[1]));
    if (found) found.read = true;
    return clone({ ok: true }) as T;
  }

  /* ------------------------------------------------------------ memorias */
  const memoryMatch = p.match(/^\/api\/agent\/memories\/([^/]+)$/);
  if (memoryMatch && method === "POST") {
    const found = store.memories.find((item) => item.id === decodeURIComponent(memoryMatch[1]));
    if (!found) throw new Error("Memoria no encontrada en el demo");
    if (typeof body.text === "string") found.text = body.text;
    found.category = typeof body.category === "string" ? body.category : "";
    found.tags = Array.isArray(body.tags) ? (body.tags as string[]) : [];
    return clone(found) as T;
  }
  const forgetMatch = p.match(/^\/api\/agent\/memories\/([^/]+)\/forget$/);
  if (forgetMatch && method === "POST") {
    const id = decodeURIComponent(forgetMatch[1]);
    store.memories = store.memories.filter((item) => item.id !== id);
    return clone({ ok: true }) as T;
  }

  /* --------------------------------------------------------------- hilos */
  if (p === "/api/threads" && method === "GET") {
    return clone(
      [...store.threads]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map(({ messages: _messages, ...thread }) => thread),
    ) as T;
  }
  if (p === "/api/threads" && method === "POST") {
    const thread = ensureThread(nextDemoId("thread"));
    if (typeof body.title === "string" && body.title.trim()) thread.title = body.title.trim();
    return clone(thread) as T;
  }
  const threadMatch = p.match(/^\/api\/threads\/([^/]+)$/);
  if (threadMatch) {
    const id = decodeURIComponent(threadMatch[1]);
    const thread = ensureThread(id);
    if (method === "GET") return clone(thread) as T;
    if (method === "DELETE") {
      demoStore.threads = store.threads.filter((item) => item.id !== id);
      return clone({ ok: true }) as T;
    }
    if (method === "PATCH") {
      if (typeof body.title === "string" && body.title.trim()) thread.title = body.title.trim();
      thread.updatedAt = new Date().toISOString();
      return clone(thread) as T;
    }
    if (method === "PUT") {
      const messages = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];
      thread.messages = messages;
      if (thread.title === "Conversación nueva") {
        const firstUser = messages.find((message) => message.role === "user");
        if (firstUser) thread.title = firstUser.content.slice(0, 42).trim();
      }
      refreshThreadCount(id);
      return clone(thread) as T;
    }
  }

  /* ------------------------------------------------------------ proyectos */
  if (p === "/api/projects" && method === "GET") return clone(store.projects) as T;
  if (p === "/api/projects" && method === "POST") {
    const created = {
      id: nextDemoId("proj"),
      name: String(body.name ?? "Proyecto nuevo"),
      description: typeof body.description === "string" ? body.description : "",
      status: "active" as const,
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : [],
      blocks: [] as ProjectBlock[],
      linkedMemoryIds: [],
      linkedArtifactIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.projects.unshift(created);
    store.projectMemories[created.id] = [];
    store.projectArtifacts[created.id] = [];
    return clone(created) as T;
  }
  const projectBlocksMatch = p.match(/^\/api\/projects\/([^/]+)\/blocks$/);
  if (projectBlocksMatch && method === "PUT") {
    const id = decodeURIComponent(projectBlocksMatch[1]);
    const project = store.projects.find((item) => item.id === id);
    if (!project) throw new Error("Proyecto no encontrado en el demo");
    project.blocks = Array.isArray(body.blocks) ? (body.blocks as ProjectBlock[]) : [];
    project.updatedAt = new Date().toISOString();
    return clone(project) as T;
  }
  const projectMatch = p.match(/^\/api\/projects\/([^/]+)$/);
  if (projectMatch) {
    const id = decodeURIComponent(projectMatch[1]);
    const index = store.projects.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Proyecto no encontrado en el demo");
    const project = store.projects[index];
    if (method === "GET") {
      return clone({
        ...project,
        memories: store.projectMemories[id] ?? [],
        artifacts: store.projectArtifacts[id] ?? [],
      }) as T;
    }
    if (method === "PATCH") {
      if (typeof body.name === "string") project.name = body.name;
      if (typeof body.description === "string") project.description = body.description;
      if (typeof body.status === "string") project.status = body.status as typeof project.status;
      project.updatedAt = new Date().toISOString();
      return clone(project) as T;
    }
    if (method === "DELETE") {
      store.projects.splice(index, 1);
      return clone({ ok: true }) as T;
    }
  }

  /* ------------------------------------------------------------- whatsapp */
  if (p === "/api/whatsapp/connection" && method === "GET") {
    return clone(whatsappConnection) as T;
  }
  if (p === "/api/whatsapp/drafts" && method === "GET") {
    return clone({ drafts: store.drafts, nextCursor: null }) as T;
  }
  if (p === "/api/whatsapp/drafts" && method === "POST") {
    const created = {
      id: nextDemoId("wa"),
      to: String(body.to ?? ""),
      text: String(body.text ?? ""),
      status: "awaiting_review",
      revision: `rev-${store.drafts.length + 1}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
      needsReprepare: false,
      requiresReconciliation: false,
      channel: { provider: "meta", accountId: "interfaz-main" },
    };
    store.drafts.unshift(created);
    return clone({ draft: created }) as T;
  }
  const waDraftMatch = p.match(/^\/api\/whatsapp\/drafts\/([^/]+)$/);
  if (waDraftMatch && method === "GET") {
    const draft = store.drafts.find((item) => item.id === decodeURIComponent(waDraftMatch[1]));
    if (!draft) throw new Error("Borrador no encontrado en el demo");
    return clone({ draft }) as T;
  }
  const waDecisionMatch = p.match(/^\/api\/whatsapp\/drafts\/([^/]+)\/(send|reject)$/);
  if (waDecisionMatch && method === "POST") {
    const draft = store.drafts.find((item) => item.id === decodeURIComponent(waDecisionMatch[1]));
    if (!draft) throw new Error("Borrador no encontrado en el demo");
    if (waDecisionMatch[2] === "send") {
      draft.status = "accepted";
      draft.providerId = `wamid.${nextDemoId("demo")}`;
      draft.revision = null;
      return clone({ status: "accepted" }) as T;
    }
    draft.status = "rejected";
    draft.revision = null;
    return clone({ status: "rejected" }) as T;
  }
  const waReconcileMatch = p.match(/^\/api\/whatsapp\/drafts\/([^/]+)\/reconcile$/);
  if (waReconcileMatch && method === "POST") {
    const draft = store.drafts.find((item) => item.id === decodeURIComponent(waReconcileMatch[1]));
    if (!draft) throw new Error("Borrador no encontrado en el demo");
    draft.status = body.result === "provider_accepted" ? "accepted" : "rejected";
    draft.requiresReconciliation = false;
    draft.reconciliation = {
      result: String(body.result ?? "provider_accepted"),
      evidenceRef: String(body.evidenceRef ?? "demo"),
      actorId: "u-ana",
      at: new Date().toISOString(),
    };
    return clone({ ok: true }) as T;
  }
  if (p === "/api/whatsapp/inbox" && method === "GET") {
    return clone({ messages: store.inbox, nextCursor: null }) as T;
  }
  const waReplyMatch = p.match(/^\/api\/whatsapp\/inbox\/([^/]+)\/draft$/);
  if (waReplyMatch && method === "POST") {
    const source = store.inbox.find((item) => item.id === decodeURIComponent(waReplyMatch[1]));
    if (!source) throw new Error("Mensaje no encontrado en el demo");
    const created = {
      id: nextDemoId("wa"),
      inboxId: source.id,
      to: source.from,
      text: String(body.text ?? ""),
      status: "awaiting_review",
      revision: `rev-${store.drafts.length + 1}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
      needsReprepare: false,
      requiresReconciliation: false,
      channel: { provider: "meta", accountId: "interfaz-main" },
    };
    store.drafts.unshift(created);
    return clone({ draft: created }) as T;
  }

  /* ------------------------------------------------------------------ RAG */
  if (p === "/api/rag/status" && method === "GET") return clone(demoRagStatus()) as T;
  if (p === "/api/rag/sources" && method === "GET") {
    return clone({ sources: store.ragSources }) as T;
  }
  if (p === "/api/rag/search" && method === "GET") {
    const query = url.searchParams.get("q") ?? "";
    const limit = Number(url.searchParams.get("limit") ?? 5);
    return clone({ hits: searchRag(query, limit) }) as T;
  }
  const ragReingestMatch = p.match(/^\/api\/rag\/reingest\/([^/]+)$/);
  if (ragReingestMatch && method === "POST") {
    const source = store.ragSources.find(
      (item) => item.sourceId === decodeURIComponent(ragReingestMatch[1]),
    );
    if (source) source.chunks += 2;
    return clone({ ok: true }) as T;
  }
  const ragSourceMatch = p.match(/^\/api\/rag\/source\/([^/]+)$/);
  if (ragSourceMatch && method === "DELETE") {
    const sourceId = decodeURIComponent(ragSourceMatch[1]);
    store.ragSources = store.ragSources.filter((item) => item.sourceId !== sourceId);
    store.ragChunks = store.ragChunks.filter((item) => item.sourceId !== sourceId);
    return clone({ ok: true }) as T;
  }

  /* ----------------------------------------------------------- operaciones */
  if (p === "/api/workspace" && method === "GET") {
    return clone({
      mode: "sample",
      profile: { name: store.user.name, email: store.user.email },
      mail: [],
      events: [],
      files: store.files,
      browsers: [],
      actions: store.actions,
      activity: [],
      connections: store.connections,
      runtime: { provider: "sample", configured: true, openbotConfigured: true, richThreads: true },
    }) as T;
  }
  if (p === "/api/leads" && method === "GET") return clone({ leads: store.leads }) as T;
  const actionMatch = p.match(/^\/api\/actions\/([^/]+)\/(decide|reconcile|cancel)$/);
  if (actionMatch && method === "POST") {
    const action = store.actions.find((item) => item.id === decodeURIComponent(actionMatch[1]));
    if (!action) throw new Error("Acción no encontrada en el demo");
    if (actionMatch[2] === "decide") {
      action.status = body.decision === "approve" ? "succeeded" : "denied";
      action.result = body.decision === "approve" ? "Enviado (demo)" : undefined;
    }
    if (actionMatch[2] === "reconcile") {
      action.status = body.outcome === "executed" ? "succeeded" : "failed";
    }
    if (actionMatch[2] === "cancel") action.status = "cancelled";
    return clone(action) as T;
  }

  /* ------------------------------------------------------------ workspaces */
  if (p === "/api/workspaces" && method === "GET") return clone(store.workspaces) as T;
  const wsViewMatch = p.match(/^\/api\/workspaces\/([^/]+)\/view$/);
  if (wsViewMatch && method === "POST") {
    const workspaceId = decodeURIComponent(wsViewMatch[1]);
    const kind = String(body.viewId ?? "dashboard");
    return clone({ view: makeEnvelope(workspaceId, kind) }) as T;
  }
  const wsMatch = p.match(/^\/api\/workspaces\/([^/]+)$/);
  if (wsMatch && method === "GET") {
    const workspaceId = decodeURIComponent(wsMatch[1]);
    const entry =
      store.workspaces.find((item) => item.id === workspaceId) ?? store.workspaces[0];
    return clone(workspaceDetail(entry)) as T;
  }

  /* ------------------------------------------------------ panel contextual */
  if (p === "/api/views/resolve" && method === "POST") {
    const intent = String(body.intent ?? "");
    return clone({ view: makeEnvelope("interfaz-resolve", kindFromIntent(intent)) }) as T;
  }

  if (method === "GET") {
    console.info(`[demo] endpoint sin fixtures: GET ${p}`);
    return clone([]) as T;
  }
  console.info(`[demo] endpoint sin fixtures: ${method} ${p}`);
  return clone({ ok: true }) as T;
}

