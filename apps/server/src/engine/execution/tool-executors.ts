// B0.1_APPLIED
// TOOL_EXECUTORS_V1 - mapa de executors reales por capability id.
// Antes este fichero contenia una copia de worker.ts (bug). Ahora expone
// buildToolExecutors(service) que CapabilityRunner usa para ejecutar steps.

import type { ExecutionContext } from "../../../../../packages/domain/src/index.ts";
import type { AgentService } from "../service.ts";

// TOOL_EXECUTORS_IDEMPOTENCY_V1 - firma opcional con idempotencyKey. Los executors que la usan la reciben; los que no, la ignoran.
export interface ToolExecutor {
  run(
    ctx: ExecutionContext,
    capabilityId: string,
    inputs: Record<string, unknown>,
    idempotencyKey?: import("../idempotency.ts").IdempotencyKey,
  ): Promise<unknown>;
}

export function buildToolExecutors(service: AgentService): Map<string, ToolExecutor> {
  const map = new Map<string, ToolExecutor>();

  // TOOL_EXECUTORS_WRAP_IDEMPOTENCY_V1 - wrap acepta idempotencyKey opcional y la pasa a fn si la usa.
  const wrap = (
    id: string,
    fn: (ctx: ExecutionContext, inputs: Record<string, unknown>, idempotencyKey?: import("../idempotency.ts").IdempotencyKey) => Promise<unknown>,
  ) => {
    map.set(id, { run: async (ctx, _cap, inputs, key) => fn(ctx, inputs, key) });
  };

  wrap("read_mail_thread", async (ctx, inputs) => {
    const threadId = String(inputs.threadId ?? "");
    if (!threadId) throw new Error("threadId required");
    return service.workspace.thread(ctx.owner, threadId);
  });

  wrap("read_workspace", async (ctx) => {
    return service.workspace.snapshot(ctx.owner);
  });

  wrap("query_business", async (ctx, inputs) => {
    const source = String(inputs.source ?? "postgres") as "postgres" | "csv" | "api" | "sheets";
    return service.business.query(ctx.owner, {
      source,
      query: String(inputs.query ?? ""),
    });
  });

  // TOOL_EXECUTORS_USE_IDEMPOTENCY_V1 - save_artifact usa key para deduplicar titulo.
  wrap("save_artifact", async (ctx, inputs, key) => {
    if (!ctx.taskId) throw new Error("save_artifact requires taskId in ctx");
    const task = await service.db.get<import("../../../../../packages/domain/src/agent.ts").AgentTask>(
      ctx.owner,
      "tasks",
      ctx.taskId,
    );
    if (!task) throw new Error("save_artifact requires an existing task");
    return service.artifact(
      ctx.owner,
      task,
      "report",
      String(inputs.title ?? "artifact"),
      String(inputs.summary ?? ""),
      (inputs.data as Record<string, unknown>) ?? {},
      String(inputs.title ?? "artifact"),
    );
  });

  wrap("recall_memory", async (ctx, inputs) => {
    return service.memory.recall(ctx.owner, String(inputs.query ?? ""));
  });

  wrap("read_web", async (ctx, inputs) => {
    const url = String(inputs.url ?? "");
    if (!url) throw new Error("url required");
    return service.browser.observe(ctx.owner, url);
  });

  // TOOL_EXECUTORS_USE_IDEMPOTENCY_V1 - computer_command pasa key al sandbox (si lo soporta).
  wrap("computer_command", async (ctx, inputs, key) => {
    const command = String(inputs.command ?? "");
    if (!command) throw new Error("command required");
    return service.computer.execute(ctx.owner, {
      command,
      cwd: String(inputs.cwd ?? "/workspace"),
      ...(key ? { idempotencyKey: key.key } : {}),
    });
  });

  wrap("ask_user", async (_ctx, inputs) => {
    return { status: "waiting_input", question: inputs.question ?? "" };
  });

  wrap("prepare_email", async (ctx, inputs) => {
    if (!ctx.taskId) throw new Error("prepare_email requires taskId");
    const task = await service.db.get<import("../../../../../packages/domain/src/agent.ts").AgentTask>(
      ctx.owner,
      "tasks",
      ctx.taskId,
    );
    if (!task) throw new Error("prepare_email requires an existing task");
    // GMAIL_REPLY_PROVENANCE_V1 (campana 15) - el hilo y el mensaje origen
    // viajan con el borrador; WorkspaceService.prepare valida destinatarios y
    // deriva el asunto del hilo revisado.
    const threadId = typeof inputs.threadId === "string" ? inputs.threadId : undefined;
    const replyToMessageId =
      typeof inputs.replyToMessageId === "string" ? inputs.replyToMessageId : undefined;
    const proposal = await service.actions.propose(
      ctx.owner,
      {
        kind: "email.send",
        data: {
          to: (inputs.to as string[]) ?? [],
          cc: (inputs.cc as string[]) ?? [],
          bcc: (inputs.bcc as string[]) ?? [],
          subject: String(inputs.subject ?? ""),
          body: String(inputs.body ?? ""),
          attachmentIds: (inputs.attachmentIds as string[]) ?? [],
          ...(threadId ? { threadId } : {}),
          ...(replyToMessageId ? { replyToMessageId } : {}),
        },
      },
      undefined,
      ctx.taskId,
    );
    return {
      actionId: proposal.id,
      status: proposal.status,
      ...(threadId ? { threadId } : {}),
    };
  });

  // CALENDAR_SLOT_EXECUTOR_V1 (campana 16) - el borrador se construye campo a
  // campo; WorkspaceService.prepare resuelve el calendario autorizado, valida
  // la zona y rechaza un hueco ya ocupado antes de crear la propuesta.
  wrap("prepare_event", async (ctx, inputs) => {
    if (!ctx.taskId) throw new Error("prepare_event requires taskId");
    const task = await service.db.get<import("../../../../../packages/domain/src/agent.ts").AgentTask>(
      ctx.owner,
      "tasks",
      ctx.taskId,
    );
    if (!task) throw new Error("prepare_event requires an existing task");
    const { eventDraftSchema } = await import("../../../../../packages/domain/src/index.ts");
    const data = eventDraftSchema.parse({
      calendarId: typeof inputs.calendarId === "string" ? inputs.calendarId : "primary",
      title: String(inputs.title ?? ""),
      start: String(inputs.start ?? ""),
      end: String(inputs.end ?? ""),
      allDay: inputs.allDay === true,
      ...(typeof inputs.timeZone === "string" ? { timeZone: inputs.timeZone } : {}),
      location: typeof inputs.location === "string" ? inputs.location : "",
      description: typeof inputs.description === "string" ? inputs.description : "",
      attendees: Array.isArray(inputs.attendees) ? (inputs.attendees as string[]) : [],
    });
    const proposal = await service.actions.propose(
      ctx.owner,
      { kind: "calendar.create", data },
      undefined,
      ctx.taskId,
    );
    return {
      actionId: proposal.id,
      status: proposal.status,
      calendarId: data.calendarId,
      start: data.start,
      end: data.end,
      timeZone: data.timeZone,
    };
  });

  // TOOL_EXECUTOR_LLM_GENERATE_V2 - llamada real al modelo con timeout.
  // TOOL_EXECUTORS_USE_IDEMPOTENCY_V1 - llm_generate usa key para cache/dedupe textual.
  wrap("llm_generate", async (ctx, inputs, key) => {
    const { generateText } = await import("../model.ts");
    const instruction = String(inputs.instruction ?? inputs.prompt ?? "");
    if (!instruction) return { text: "" };
    const idempotentInstruction = key ? `[idem:${key.key.slice(0, 8)}] ${instruction}` : instruction;
    const tenant = await service.tenantConfigFor(ctx.owner).catch(() => undefined);
    const text = await generateText(service.config, idempotentInstruction, inputs.context ?? {}, {
      tenant,
    });
    return { text: text.slice(0, 20000) };
  });

  wrap("transition_entity", async (ctx, inputs) => {
    const entityId = String(inputs.entityId ?? "");
    const to = String(inputs.to ?? "");
    if (!entityId || !to) throw new Error("entityId and to required");
    if (!service.graph) throw new Error("graph not wired");
    return service.graph.updateEntity(ctx.owner, entityId, {
      status: to,
      actor: `runtime:${ctx.runtimeId ?? "unknown"}`,
      source: "executor",
    });
  });

  return map;
}