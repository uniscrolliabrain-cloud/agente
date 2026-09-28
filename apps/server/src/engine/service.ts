import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import {
  type AgentArtifact,
  type AgentIdentity,
  type AgentRole,
  type AgentMemory,
  type AgentNotification,
  type AgentTask,
  type AgentWorkspace,
  createTaskSchema,
  type Evidence,
  type Goal,
  goalInputSchema,
  type Idea,
  type Monitor,
  monitorInputSchema,
  type RunEvent,
} from "../../../../packages/domain/src/agent.ts";
import type {
  ActionProposal,
  Artifact,
  BrowserSession,
  Mail,
  ProposalInput,
} from "../../../../packages/domain/src/index.ts";
import type { ActionService } from "../actions.ts";
import type { BrowserService } from "../browser.ts";
import { ComputerService } from "../computer.ts";
import type { Config } from "../config.ts";
import type { Store } from "../db.ts";
import { AppError } from "../errors.ts";
import { UserService } from "../users.ts";
import type { Files } from "../files.ts";
import { backgroundFailure } from "../log.ts";
import type { WorkspaceService } from "../workspace.ts";
import { analyzeSpending } from "./finance.ts";
import { executeModelTask } from "./model.ts";
import { BusinessDataService } from "./business.ts";
import { LearningService } from "./learning.ts";
import { SOPExecutor } from "./sop-executor.ts";
import { RagService } from "./rag.ts";
import { WhatsAppClient } from "../../../packages/integrations/src/stubs/whatsapp.ts";
import { MemoryService } from "./memory.ts";
import { SOPTriggerEvaluator } from "./sop-triggers.ts";
import { LostLeaseError, type TaskContext, TaskWorker } from "./worker.ts";
import type { SOP } from "../../../../packages/domain/src/sop.ts";

const hash = (text: string) => createHash("sha256").update(text).digest("hex");
const date = () => new Date().toISOString();
const terminal = new Set(["succeeded", "failed", "cancelled"]);
export class AgentService {
  readonly worker: TaskWorker;
  readonly business: BusinessDataService;
  readonly learning: LearningService;
  readonly memory: MemoryService;
  private readonly sopExecutor: SOPExecutor;
  private lastDedupAt?: number;
  private maintenance?: ReturnType<typeof setInterval>;
  private refreshing = false;
  constructor(
    readonly db: Store,
    readonly config: Config,
    readonly workspace: WorkspaceService,
    readonly files: Files,
    readonly actions: ActionService,
    readonly browser: BrowserService,
    readonly computer: ComputerService = new ComputerService(db, config),
    readonly rag: RagService = new RagService(db),
    readonly whatsapp: WhatsAppClient = new WhatsAppClient({
      apiKey: config.whatsappApiKey,
      baseUrl: config.whatsappBaseUrl,
      instance: config.whatsappInstance,
    }),
  ) {
    this.business = new BusinessDataService(db, config.businessDatabaseUrl);
    this.memory = new MemoryService(db, this.rag);
    this.learning = new LearningService(this.memory);
    this.sopExecutor = new SOPExecutor(this);
    this.worker = new TaskWorker(db, (owner, task, context) => this.execute(owner, task, context), {
      settled: (owner, task) => this.publishOutcome(owner, task),
    });
  }
  start() {
    this.worker.start();
    void this.maintain().catch((error) => backgroundFailure("initial maintenance", error));
    this.maintenance = setInterval(() => {
      void this.maintain().catch((error) => backgroundFailure("maintenance", error));
    }, 60000);
  }
  async stop() {
    if (this.maintenance) clearInterval(this.maintenance);
    this.maintenance = undefined;
    await this.worker.stop();
    while (this.refreshing) await new Promise((resolve) => setTimeout(resolve, 10));
  }
  private async maintain() {
    if (this.refreshing) return;
    this.refreshing = true;
    try {
      for (const { owner, value } of await this.db.scanByStatus<AgentTask>("tasks", [
        "succeeded",
        "failed",
        "waiting_input",
        "waiting_approval",
        "scheduled",
      ]))
        await this.publishOutcome(owner, value);
      for (const { owner, value } of await this.db.scanByStatus<Monitor>("monitors", ["active"]))
        await this.activateMonitor(owner, value);
      await this.db.purgeOlderThan("run-events", 90);
      await this.db.purgeOlderThan("activity", 90);
      await this.db.purgeOlderThan("notifications", 90);

      const missingOwners = new Set<string>();
      for (const { owner, value } of await this.db.scan<{ embedding: number[] | null }>("rag-chunks")) {
        if (!value.embedding || value.embedding.length === 0) missingOwners.add(owner);
      }
      for (const owner of missingOwners) {
        await this.memory
          .retryMissingEmbeddings(owner)
          .catch((error) => backgroundFailure("retry embeddings", error));
      }

      if (!this.lastDedupAt || Date.now() - this.lastDedupAt > 5 * 60 * 1000) {
        this.lastDedupAt = Date.now();
        const memoryOwners = new Set<string>();
        for (const { owner } of await this.db.scan<{ id: string }>("memories")) memoryOwners.add(owner);
        for (const owner of memoryOwners) {
          await this.memory
            .dedupMemories(owner)
            .catch((error) => backgroundFailure("dedup memories", error));
        }
      }
      for (const { owner, value } of await this.db.scan<Idea>("ideas"))
        if (
          value.status === "accepted" &&
          value.taskId &&
          !(await this.db.get(owner, "tasks", value.taskId))
        )
          await this.decideIdea(owner, value.id, "accept").catch(async (error) => {
            backgroundFailure("recover accepted idea", error);
            await this.notify(
              owner,
              "Accepted idea needs attention",
              "Open the idea again after making room for another task.",
              undefined,
              `idea-recovery:${value.id}`,
            );
          });
      for (const { owner, value } of await this.db.scan<{ id: string; lastIdeasAt?: string }>(
        "agent-settings",
      )) {
        if (value.id !== "identity") continue;
        if (!value.lastIdeasAt || Date.now() - Date.parse(value.lastIdeasAt) > 15 * 60000)
          await this.refreshIdeas(owner).catch(async () => {
            await this.notify(
              owner,
              "Source refresh needs attention",
              "Reconnect the source or refresh Ideas to see the error.",
              undefined,
              `source-error:${Math.floor(Date.now() / 3600000)}`,
            );
          });
      }
      const sopEvaluator = new SOPTriggerEvaluator(this);
      for (const { owner, value } of await this.db.scan<SOP>("sops")) {
        try {
          await sopEvaluator.evaluate(owner, value);
        } catch (error) {
          backgroundFailure(`sop trigger ${value.id}`, error);
        }
      }
    } finally {
      this.refreshing = false;
    }
  }
  async seedAgents(owner: string, roles: AgentRole[]): Promise<number> {
    await this.ensure(owner);
    let created = 0;
    for (const role of roles) {
      const existing = await this.db.get<AgentRole>(owner, "agent-roles", role.id);
      if (existing) continue;
      await this.db.put(owner, "agent-roles", { ...role, active: role.active ?? true });
      created++;
    }
    return created;
  }

  async listAgents(owner: string): Promise<AgentRole[]> {
    return this.db.list<AgentRole>(owner, "agent-roles");
  }

  async ensure(owner: string) {
    await this.db.insertIfAbsent(owner, "agent-settings", {
      id: "identity",
      name: "OpenMuse",
      tone: "warm",
    });
  }
  async snapshot(owner: string): Promise<AgentWorkspace> {
    await this.ensure(owner);
    const [tasks, goals, monitors, ideas, memories, artifacts, notifications, identity] =
      await Promise.all([
        this.db.list<AgentTask>(owner, "tasks"),
        this.db.list<Goal>(owner, "goals"),
        this.db.list<Monitor>(owner, "monitors"),
        this.db.list<Idea>(owner, "ideas"),
        this.db.list<AgentMemory>(owner, "memories"),
        this.db.list<AgentArtifact>(owner, "agent-artifacts"),
        this.db.list<AgentNotification>(owner, "notifications"),
        this.db.get<AgentIdentity>(owner, "agent-settings", "identity"),
      ]);
    const heartbeat = await this.db.get<{ lastTickAt: string }>("system", "worker-status", "tasks");
    return {
      tasks,
      goals,
      monitors,
      ideas,
      memories,
      artifacts,
      notifications,
      identity: identity ?? { name: "OpenMuse", tone: "warm" },
      worker: {
        running:
          this.worker.running ||
          Boolean(heartbeat && Date.now() - Date.parse(heartbeat.lastTickAt) < 15000),
        lastTickAt: heartbeat?.lastTickAt ?? this.worker.lastTickAt,
      },
    };
  }
  async getTask(owner: string, id: string) {
    const task = await this.db.get<AgentTask>(owner, "tasks", id);
    if (!task) throw new AppError("Task not found", 404);
    return task;
  }
  async detail(owner: string, id: string) {
    const task = await this.getTask(owner, id);
    const files = (await this.db.list<Artifact>(owner, "files")).filter((file) =>
      task.artifactIds.includes(file.id),
    );
    const browsers = (await this.db.list<BrowserSession>(owner, "browsers")).filter((browser) =>
      [task.state.browserId, task.state.sessionId].includes(browser.id),
    );
    return {
      task,
      files: files.map((file) => this.files.signed(owner, file)),
      browsers: browsers.map((browser) => this.browser.decorate(owner, browser)),
      events: (await this.db.list<RunEvent>(owner, "run-events"))
        .filter((e) => e.taskId === id)
        .sort((a, b) => a.date.localeCompare(b.date)),
      artifacts: (await this.db.list<AgentArtifact>(owner, "agent-artifacts")).filter(
        (a) => a.taskId === id,
      ),
    };
  }
  async createTask(owner: string, raw: unknown, idempotencyKey?: string, held = false) {
    const input = createTaskSchema.parse(raw);
    if (input.goalId && !(await this.db.get(owner, "goals", input.goalId)))
      throw new AppError("Goal not found", 404);
    if (input.kind === "sop" && typeof input.input.sopId !== "string")
      throw new AppError("SOP tasks require input.sopId", 422);
    const id = idempotencyKey ? hash(`task:${idempotencyKey}`) : randomUUID();
    const existing = await this.db.get<AgentTask>(owner, "tasks", id);
    if (existing) return existing;
    if (
      (await this.db.list<AgentTask>(owner, "tasks")).filter((t) => !terminal.has(t.status))
        .length >= 100
    )
      throw new AppError("Finish or cancel some tasks before adding more", 409);
    const titles =
      input.kind === "sop"
        ? []
        : input.kind === "document"
        ? [
            "Find the source document",
            "Fill a new copy",
            "Prepare a reply",
            "Wait for your decision",
            "Record the outcome",
          ]
        : input.kind === "monitor"
          ? ["Check the source", "Compare with the last observation", "Report a meaningful change"]
          : input.kind === "finance"
            ? ["Validate transactions", "Calculate the summary", "Save your tracker"]
            : ["Understand the outcome", "Plan the work", "Use connected tools", "Return a result"];
    const task: AgentTask = {
      id,
      title: input.title ?? input.prompt.slice(0, 90),
      prompt: input.prompt,
      kind: input.kind,
      goalId: input.goalId,
      assignedTo: input.assignedTo ?? owner,
      status: held ? "paused" : "queued",
      plan: titles.map((title, i) => ({ id: String(i), title, status: "pending" })),
      evidence: [],
      input: input.input,
      state: {
        connectionId: (await this.workspace.connection(owner))?.id ?? null,
        ...(input.roleId ? { roleId: input.roleId } : {}),
        ...(input.kind === "sop" ? { sopId: input.input.sopId, sopStepIndex: 0, sopResults: {}, sopStack: [input.input.sopId] } : {}),
        ...(held && input.kind === "monitor" ? { initializingMonitor: true } : {}),
      },
      createdAt: date(),
      updatedAt: date(),
      attempts: 0,
      leaseId: null,
      leaseUntil: null,
      artifactIds: [],
    };
    await this.ensure(owner);
    await this.db.insertIfAbsent(owner, "tasks", task);
    return (await this.db.get<AgentTask>(owner, "tasks", id)) ?? task;
  }
  /**
   * Escala una tarea a otro usuario del deployment. La tarea pasa a waiting_input,
   * assignedTo cambia, y la notificacion va al usuario escalado (no al owner).
   */
  async escalateTask(owner: string, taskId: string, toUserId: string, reason: string) {
    const task = await this.getTask(owner, taskId);
    if (terminal.has(task.status))
      throw new AppError("No se puede escalar una tarea cerrada", 409);
    const target = await new UserService(this.db).getById(toUserId);
    if (!target || !target.active)
      throw new AppError("El usuario destino no existe o esta inactivo", 422);
    const trimmed = reason.trim().slice(0, 2000);
    if (!trimmed) throw new AppError("Falta el motivo del escalado", 422);
    const updated = await this.db.compareAndSwap<AgentTask>(
      owner,
      "tasks",
      taskId,
      { status: task.status, leaseId: task.leaseId ?? null },
      {
        assignedTo: toUserId,
        status: "waiting_input",
        question: trimmed,
        state: {
          ...task.state,
          escalatedTo: toUserId,
          escalatedAt: new Date().toISOString(),
        },
        leaseId: null,
        leaseUntil: null,
        updatedAt: new Date().toISOString(),
      },
    );
    if (!updated) throw new AppError("La tarea cambio; refresca e intentalo de nuevo", 409);
    this.worker.abort(taskId);
    await this.db.put(owner, "run-events", {
      id: randomUUID(),
      taskId,
      kind: "status",
      date: new Date().toISOString(),
      title: "Tarea escalada",
      detail: `Asignada a ${target.name}: ${trimmed.slice(0, 200)}`,
    });
    await this.notify(
      toUserId,
      "Te han asignado una tarea",
      `${task.title}: ${trimmed}`,
      taskId,
      `escalate:${taskId}:${toUserId}`,
    );
    return updated;
  }
  async control(owner: string, id: string, action: "pause" | "resume" | "cancel" | "retry") {
    const task = await this.getTask(owner, id);
    if (action === "cancel" && task.status === "succeeded")
      throw new AppError("This task is already complete", 409);
    if (action === "retry" && task.status !== "failed")
      throw new AppError("Only failed tasks can be retried", 409);
    if (action === "resume" && task.status !== "paused")
      throw new AppError("Only paused tasks can be resumed", 409);
    if (action === "pause" && (terminal.has(task.status) || task.status === "paused")) return task;
    const status =
      action === "cancel"
        ? "cancelled"
        : action === "pause"
          ? "paused"
          : task.actionId
            ? "waiting_approval"
            : "queued";
    if (action === "retry" && task.actionId) {
      const a = await this.db.get<ActionProposal>(owner, "actions", task.actionId);
      if (a && a.status !== "succeeded")
        throw new AppError(
          "Check the reviewed action before retrying; its outcome may be uncertain. Start a new task when reconciled.",
          409,
        );
    }
    const updated = await this.db.compareAndSwap<AgentTask>(
      owner,
      "tasks",
      id,
      { status: task.status, leaseId: task.leaseId ?? null },
      {
        status,
        leaseId: null,
        leaseUntil: null,
        error: null,
        updatedAt: date(),
        result:
          action === "cancel"
            ? "Stopped by you."
            : action === "pause"
              ? "Paused. Resume when you're ready."
              : "",
        ...(task.kind === "monitor" && action === "resume"
          ? { state: { ...task.state, failures: 0, notice: null } }
          : {}),
      },
    );
    if (!updated) throw new AppError("Task changed; refresh and try again", 409);
    this.worker.abort(id);
    if (task.kind === "monitor")
      await this.db.compareAndSwap(
        owner,
        "monitors",
        String(task.input.monitorId),
        {},
        {
          status: action === "cancel" ? "stopped" : action === "pause" ? "paused" : "active",
          nextCheckAt: date(),
        },
      );
    let finalTask = updated;
    if (action === "cancel" && task.actionId) {
      const proposal = await this.db.get<ActionProposal>(owner, "actions", task.actionId);
      if (proposal?.status === "awaiting_review")
        await this.actions.decide(owner, proposal.id, proposal.hash, "deny");
      if (proposal?.status === "executing" || proposal?.status === "outcome_unknown") {
        const withWarning = await this.db.compareAndSwap<AgentTask>(
          owner,
          "tasks",
          id,
          { status },
          { state: { ...updated.state, externalActionMayComplete: true } },
        );
        if (withWarning) finalTask = withWarning;
      }
    }
    await this.db.put(owner, "run-events", {
      id: randomUUID(),
      taskId: id,
      kind: "status",
      date: date(),
      title: `Task ${status}`,
      detail: "Changed by you",
    });
    return finalTask;
  }
  async answer(
    owner: string,
    id: string,
    answer: string,
    fields?: Record<string, string | boolean>,
  ) {
    const task = await this.getTask(owner, id);
    if (task.status !== "waiting_input")
      throw new AppError("This task is not waiting for input", 409);
    const next = await this.db.compareAndSwap<AgentTask>(
      owner,
      "tasks",
      id,
      { status: "waiting_input" },
      {
        status: "queued",
        question: null,
        input: { ...task.input, ...(fields ? { fields } : {}) },
        state: { ...task.state, answer },
        updatedAt: date(),
      },
    );
    if (!next) throw new AppError("Task changed; refresh and try again", 409);
    return next;
  }
  async createGoal(owner: string, raw: unknown, id?: string) {
    const input = goalInputSchema.parse(raw);
    const goal: Goal = {
      id: id ?? randomUUID(),
      title: input.title,
      description: input.description,
      category: input.category,
      status: "active",
      milestones: input.milestones.map((title) => ({ id: randomUUID(), title, done: false })),
      createdAt: date(),
    };
    await this.db.insertIfAbsent(owner, "goals", goal);
    return (await this.db.get<Goal>(owner, "goals", goal.id)) ?? goal;
  }
  async updateGoal(
    owner: string,
    id: string,
    patch: { status?: Goal["status"]; milestones?: Goal["milestones"] },
  ) {
    const goal = await this.db.get<Goal>(owner, "goals", id);
    if (!goal) throw new AppError("Goal not found", 404);
    const saved = await this.db.put(owner, "goals", { ...goal, ...patch });
    if (patch.status === "paused")
      for (const task of await this.db.list<AgentTask>(owner, "tasks"))
        if (task.goalId === id && !terminal.has(task.status) && task.status !== "paused")
          await this.control(owner, task.id, "pause");
    return saved;
  }
  async createMonitor(owner: string, raw: unknown, idempotencyKey?: string) {
    const input = monitorInputSchema.parse(raw);
    const url = new URL(input.url);
    if (url.protocol === "sample:" && this.config.mode !== "sample")
      throw new AppError("Sample sources are unavailable in live workspaces", 422);
    if (!["https:", "http:", "sample:"].includes(url.protocol) || url.username || url.password)
      throw new AppError("Use a public HTTP(S) page", 422);
    if (url.protocol === "sample:" && input.url !== "sample://availability")
      throw new AppError("Unknown sample source", 422);
    const id = idempotencyKey ? hash(`monitor:${idempotencyKey}`) : randomUUID();
    const existing = await this.db.get<Monitor>(owner, "monitors", id);
    if (existing) {
      await this.activateMonitor(owner, existing);
      return existing;
    }
    const task = await this.createTask(
      owner,
      {
        kind: "monitor",
        title: input.title,
        prompt: `Watch ${input.url} for ${input.condition}${input.value ? `: ${input.value}` : ""}`,
        input: { monitorId: id },
      },
      `monitor:${id}`,
      true,
    );
    const monitor: Monitor = {
      id,
      taskId: task.id,
      ...input,
      status: "active",
      nextCheckAt: date(),
      checks: 0,
    };
    await this.db.insertIfAbsent(owner, "monitors", monitor);
    await this.activateMonitor(owner, monitor);
    return monitor;
  }
  private async activateMonitor(owner: string, monitor: Monitor) {
    if (monitor.status !== "active") return;
    const task = await this.getTask(owner, monitor.taskId);
    if (task.status !== "paused" || !task.state.initializingMonitor) return;
    await this.db.compareAndSwap(
      owner,
      "tasks",
      task.id,
      { status: "paused", attempts: 0, state: { initializingMonitor: true } },
      {
        status: "queued",
        state: { ...task.state, initializingMonitor: false },
      },
    );
  }
  async controlMonitor(owner: string, id: string, action: "pause" | "resume" | "stop" | "check") {
    const monitor = await this.db.get<Monitor>(owner, "monitors", id);
    if (!monitor) throw new AppError("Monitor not found", 404);
    if (monitor.status === "stopped" && action !== "stop")
      throw new AppError("Create a new watch to restart this stopped monitor", 409);
    const status = action === "pause" ? "paused" : action === "stop" ? "stopped" : "active";
    const saved = await this.db.put(owner, "monitors", { ...monitor, status, nextCheckAt: date() });
    const task = await this.getTask(owner, monitor.taskId);
    if (action === "pause" || action === "stop")
      await this.control(owner, task.id, action === "pause" ? "pause" : "cancel");
    else {
      this.worker.abort(task.id);
      await this.db.compareAndSwap(
        owner,
        "tasks",
        task.id,
        { status: task.status, leaseId: task.leaseId ?? null },
        {
          status: "queued",
          nextRunAt: date(),
          leaseId: null,
          leaseUntil: null,
          error: null,
          state: { ...task.state, failures: 0, notice: null },
        },
      );
    }
    return saved;
  }