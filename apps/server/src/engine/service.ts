// BUG05_ASSIGNEDTO_V2 - createTask puebla assignedTo con roleId.
// C1_ASSIGNEDTO_V1 - createTask puebla assignedTo con roleId si viene.
// NOTIFY_GROUP_TASK_V1 - las notificaciones se agrupan por taskId.
  // ORCHESTRATOR_DEPS_REAL_V1 - deps reales cableadas.
// B103_APPLIED
// R5b_APPLIED
// R3_APPLIED
// R4a_APPLIED
// R4b_APPLIED
// R8_APPLIED
// R9_APPLIED
// B104_APPLIED
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
  // AGENT_ROLE_V2_BACKFILL - se usa el schema del dominio para normalizar los roles guardados.
  agentRoleSchema,
  // PUBLIC_ROLES_ENDPOINT: tipo de retorno de publicRoles (id, name, tone, avatar, objetivo, roi, identidad).
  type AgentRolePublic,
} from "../../../../packages/domain/src/agent.ts";
import { canTransitionTask } from "../../../../packages/domain/src/agent.ts";
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
// SERVICE_TENANT_DB_V1 - el service acepta Store o TenantScopedStore.
import type { TenantScopedStore } from "../db-tenant.ts";
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
import type { BusinessGraph } from "./business/graph.ts";
import type { BusinessTruth } from "./business/truth.ts";
import type { PolicyEngine } from "./policy/engine.ts";
import type { StateMachineEngine } from "./policy/state-machine.ts";
import type { StateMachineRegistry } from "./state-machines.ts";
import type { ContextEngine } from "./context/engine.ts";
import type { AgentRuntimeManager } from "./agents/runtime.ts";
import type { AgentGovernance } from "./agents/governance.ts";
import type { WorkspaceRegistry } from "./workspace/registry.ts";
import type { SkillMarketplace } from "./skills/marketplace.ts";
import type { Kernel } from "../kernel/index.ts";
import { RagService } from "./rag.ts";
import { WhatsAppClient } from "../../../../packages/integrations/src/stubs/whatsapp.ts";
import { MemoryService } from "./memory.ts";
import { SOPTriggerEvaluator } from "./sop-triggers.ts";
// ENGINE_TENANT_V1 - punto unico de resolucion de tenant.
import type { TenantService } from "./tenant.ts";
// GUARDRAILS_V1 - limites duros por tenant.
import { GuardrailService } from "./guardrails/service.ts";
// SERVICE_RATE_LIMIT_TENANT_V1 - rate limit por tenant.
import { RateLimiter } from "../rate-limit.ts";
import { planForKind } from "./task-plans.ts";
import { globalMetrics } from "../metrics/registry.ts";
// CAPABILITY_REGISTRY_V1 - capacidades del sistema.
import { CapabilityRegistry } from "./capabilities/registry.ts";
import { bootstrapCapabilities } from "./capabilities/bootstrap.ts";
// PLANNER_V1 - genera planes.
import { StubPlanner } from "./planner/planner.ts";
import { LlmPlanner } from "./planner/llm-planner.ts";
import { LlmReplanner } from "./planner/replanner.ts";
// VERIFIER_V1 - verifica outcomes.
import { DeterministicVerifier } from "./verification/verifier.ts";
import { LlmVerifier } from "./verification/llm-verifier.ts";
// BUSINESS_OS_ORCHESTRATOR_V1 - ciclo completo.
import { BusinessOSOrchestrator } from "./orchestrator/orchestrator.ts";
// HANDOFF_SERVICE_V1 - pasa trabajo entre roles.
import { HandoffService } from "./handoff/service.ts";
// REACTION_ENGINE_V1 - reacciona a eventos.
import { ReactionEngine } from "./reactions/engine.ts";
import { executeReactionActions } from "./reactions/executor.ts";
import { MetricsCollector } from "./metrics/collector.ts";
import { FeedbackCollector } from "./feedback/collector.ts";
// LEARNING_OBSERVER_V1 - observa cada ejecucion.
import { LearningObserver } from "./learning/observer.ts";
// EXECUTOR_WIRE_V1 - ejecuta planes.
import { Executor } from "./execution/executor.ts";
// CAPABILITY_RUNNER_V1 - ejecuta capabilities.
import { CapabilityRunner } from "./execution/capability-runner.ts";
import { buildToolExecutors } from "./execution/tool-executors.ts";
// SERVICE_KERNELCONTEXT_IMPORT_V1 - tipo del contexto del kernel.
import type { KernelContext } from "../../../../packages/domain/src/kernel.ts";
import { LostLeaseError, type TaskContext, TaskWorker } from "./worker.ts";
import type { EventBus } from "./events/index.ts";
import type { SOP } from "../../../../packages/domain/src/sop.ts";

// EVENTBUS_TASK_EMIT_V1
// EVENTBUS_MONITOR_EMIT_V1
// EVENTBUS_MONITOR_EMIT_V1
const hash = (text: string) => createHash("sha256").update(text).digest("hex");
const date = () => new Date().toISOString();
const terminal = new Set(["succeeded", "failed", "cancelled"]);
export interface BusinessOsServices {
  graph?: BusinessGraph;
  truth?: BusinessTruth;
  policy?: PolicyEngine;
  stateMachine?: StateMachineEngine;
  stateMachineRegistry?: StateMachineRegistry;
  context?: ContextEngine;
  runtime?: AgentRuntimeManager;
  governance?: AgentGovernance;
  workspaceRegistry?: WorkspaceRegistry;
  marketplace?: SkillMarketplace;
  // SERVICE_INTERFACE_FIX_V1 - arreglado el } huerfano del repodump original.
  // ENGINE_TENANT_V1 - punto unico de resolucion de tenant.
  tenantService?: TenantService;
  // KERNEL_WIRE_A_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â kernel cognitivo opcional. Sin esto, el repo funciona igual.
  kernel?: Kernel;
}

export class AgentService {
  readonly worker: TaskWorker;
  readonly business: BusinessDataService;
  readonly learning: LearningService;
  // MEMORY_PUBLIC_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â memory pasa a ser publico para que el ContextEngine lo use.
  readonly memory: MemoryService;
  private readonly sopExecutor: SOPExecutor;
  private lastDedupAt?: number;
  // MAINTAIN_PURGE_V1 - indice rotativo de purgas.
  private lastPurgeIndex?: number;
  private maintenance?: ReturnType<typeof setInterval>;
  private refreshing = false;
  // BUSINESS_OS_CTOR_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â servicios nuevos opcionales. Se inyectan en app.ts.
  readonly graph?: BusinessGraph;
  readonly truth?: BusinessTruth;
  readonly policy?: PolicyEngine;
  readonly stateMachine?: StateMachineEngine;
  readonly stateMachineRegistry?: StateMachineRegistry;
  readonly context?: ContextEngine;
  readonly runtime?: AgentRuntimeManager;
  readonly governance?: AgentGovernance;
  readonly workspaceRegistry?: WorkspaceRegistry;
  readonly marketplace?: SkillMarketplace;
  // KERNEL_WIRE_A_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â kernel cognitivo. Opcional para no romper tests ni arranques sin kernel.
  readonly kernel?: Kernel;
  // ENGINE_TENANT_V1 - punto unico de resolucion de tenant.
  readonly tenantService?: TenantService;
  // GUARDRAILS_V1 - limites duros por tenant.
  readonly guardrails: GuardrailService;
  // SERVICE_METRICS_WIRE_V1 - metricas por tenant.
  readonly metrics: MetricsCollector;
  // SERVICE_FEEDBACK_WIRE_V1 - feedback del usuario sobre outcomes.
  readonly feedback: FeedbackCollector;
  // SERVICE_RATE_LIMIT_TENANT_V1 - rate limit por tenant.
  private readonly tenantRateLimiter = new RateLimiter(500, 3600000);
  // RATE_LIMIT_USER_FIELD_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â limiter por usuario reutilizable.
  // Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md.
  private readonly userRateLimiter = new RateLimiter(100, 60 * 60 * 1000);
  // CAPABILITY_REGISTRY_V1 - capacidades del sistema.
  readonly capabilities: CapabilityRegistry;
  // PLANNER_V1 - genera planes.
  // PLANNER_VERIFIER_TYPES_FIX_V1 - antes eran StubPlanner/DeterministicVerifier
  // con cast, pero la instancia real es LlmPlanner/LlmVerifier. Declaramos la
  // interfaz (Planner/Verifier) para no mentir y que el compilador no oculte
  // el contrato real.
  readonly planner: import("./planner/planner.ts").Planner;
  // VERIFIER_V1 - verifica outcomes.
  readonly verifier: import("./verification/verifier.ts").Verifier;
  // BUSINESS_OS_ORCHESTRATOR_V1 - ciclo completo.
  readonly orchestrator: BusinessOSOrchestrator;
  // HANDOFF_SERVICE_V1 - pasa trabajo entre roles.
  readonly handoff: HandoffService;
  // REACTION_ENGINE_V1 - reacciona a eventos.
  readonly reactions: ReactionEngine;
  // LEARNING_OBSERVER_V1 - observa cada ejecucion.
  readonly learningObserver: LearningObserver;
  // EXECUTOR_WIRE_V1 - ejecuta planes.
  readonly executor: Executor;
  constructor(
    // SERVICE_TENANT_DB_V1 - acepta Store o TenantScopedStore.
    readonly db: Store | TenantScopedStore,
    readonly config: Config,
    readonly workspace: WorkspaceService,
    readonly files: Files,
    readonly actions: ActionService,
    readonly browser: BrowserService,
    readonly computer: ComputerService = new ComputerService(db, config),
    readonly rag: RagService = new RagService(db),
    readonly whatsapp: WhatsAppClient = new WhatsAppClient({       apiKey: config.whatsappApiKey,       baseUrl: config.whatsappBaseUrl,       instance: config.whatsappInstance,     }),
    readonly bus?: EventBus,
    business?: BusinessOsServices,
  ) {
    this.graph = business?.graph;
    this.truth = business?.truth;
    this.policy = business?.policy;
    this.stateMachine = business?.stateMachine;
    this.stateMachineRegistry = business?.stateMachineRegistry;
    this.context = business?.context;
    this.runtime = business?.runtime;
    this.governance = business?.governance;
    this.workspaceRegistry = business?.workspaceRegistry;
    this.marketplace = business?.marketplace;
    this.kernel = business?.kernel;
    // ENGINE_TENANT_V1 - punto unico de resolucion de tenant.
    this.tenantService = business?.tenantService;
    // `query_business` ejecuta la query que escribe el SOP contra este DSN. Lo normal es que
    // sea un rol de solo lectura sobre otra base de datos, separado de la de la app.
    this.business = new BusinessDataService(db, config.businessDatabaseUrl);
    this.memory = new MemoryService(db, this.rag);
    this.guardrails = new GuardrailService(db);
    // CTOR_DUP_METRICS_FIX_V1 - metrics y feedback se instanciaban dos veces
    // seguidas (duplicado). El segundo par sobreescribia al primero sin
    // motivo. Dejamos uno solo.
    this.metrics = new MetricsCollector(db);
    this.feedback = new FeedbackCollector(db);
    this.capabilities = new CapabilityRegistry();
    bootstrapCapabilities(this.capabilities);
    // PLANNER_WIRE_V1 - LLM planner como primera capa, stub como fallback.
    // PLANNER_VERIFIER_TYPES_FIX_V1 - sin cast. Los tipos declarados ya son
    // las interfaces, asi que las instancias concretas encajan sin `as unknown as`.
    this.planner = new LlmPlanner(config, new StubPlanner());
    const deterministic = new DeterministicVerifier();
    this.verifier = new LlmVerifier(config, deterministic);
    // ORCHESTRATOR_DEPS_WIRE_V1 - el orquestador recibe las deps.
    this.orchestrator = new BusinessOSOrchestrator({
      context: {
        assemble: async (owner, input) => {
          if (!this.context) return {};
          const pkg = await this.context.assemble(owner, input);
          return pkg as unknown as Record<string, unknown>;
        },
      },
      capabilities: {
        list: async (filter) => {
          const list = await this.capabilities.list(filter);
          return list.map((c) => ({ id: c.id, kind: c.kind }));
        },
      },
      planner: {
        plan: (input) => this.planner.plan(input),
      },
      executor: {
        execute: async (ctx, plan) => this.executor.execute(ctx, plan),
      },
      verifier: {
        verify: (goal, outcome) => this.verifier.verify(goal, outcome),
      },
      // SERVICE_LLM_REPLANNER_V1 - LLM replanner.
      // SERVICE_LLM_REPLANNER_V2
      replanner: {
        replan: (input) => new LlmReplanner(config).replan(input),
      },
      observer: {
        observe: (input) => this.learningObserver.observe(input),
      },
    });
    this.handoff = new HandoffService(db);
    // SERVICE_REACTIONS_EXEC_V1 - el engine recibe el service para ejecutar actions.
    this.reactions = new ReactionEngine(db, this.bus, (ctx, actions) =>
      executeReactionActions(this, this.handoff, ctx, actions),
    );
    this.learningObserver = new LearningObserver(db);
    // EXECUTOR_WIRE_V1 - el runner ejecuta capabilities del registry.
    // SERVICE_TOOL_EXECUTORS_V1 - executors reales.
    const toolExecutors = buildToolExecutors(this);
    const capabilityRunner = new CapabilityRunner(this.capabilities, toolExecutors);
    this.executor = new Executor(capabilityRunner);
    this.learning = new LearningService(this.memory);
    this.sopExecutor = new SOPExecutor(this, this.bus, this.graph, this.stateMachineRegistry);
    this.worker = new TaskWorker(db, (owner, task, context) => this.execute(owner, task, context), {
      settled: (owner, task) => this.publishOutcome(owner, task),
      bus: this.bus,
    });
  }
  // SERVICE_RECOVER_TASKS_V1 - recupera tareas running con lease expirado.
  // SERVICE_REACTIONS_LOAD_V1 - carga las rules de cada tenant activo.
  private async loadReactionsForAllTenants(): Promise<void> {
    const tenants = await this.collectActiveTenants();
    for (const tenant of tenants) {
      await this.reactions.load(tenant).catch((error) =>
        backgroundFailure("load reactions " + tenant, error),
      );
    }
  }

  async recoverInterruptedTasks(): Promise<number> {
    const now = Date.now();
    const rows = await this.db.scanByStatus<AgentTask>("tasks", ["running"], 5000);
    let recovered = 0;
    for (const { owner, value } of rows) {
      const leaseUntil = value.leaseUntil ? Date.parse(value.leaseUntil) : 0;
      if (!leaseUntil || leaseUntil > now) continue;
      // RECOVER_CAS_V1 - CAS con expected explicito del lease para evitar
      // que dos procesos reviertan la misma task a la vez.
      const updated = await this.db.compareAndSwap<AgentTask>(
        owner,
        "tasks",
        value.id,
        { status: "running", leaseId: value.leaseId ?? null, leaseUntil: value.leaseUntil ?? null },
        {
          status: "queued",
          leaseId: null,
          leaseUntil: null,
          updatedAt: new Date().toISOString(),
        },
      );
      if (updated) {
        recovered++;
        // TASK_RECOVERED_EVENT_V1 - emite evento al recuperar.
        await this.bus?.emit(owner, "task.status_changed", { kind: "task", id: value.id }, {
          taskId: value.id,
          from: "running",
          to: "queued",
        }).catch(() => {});
      }
    }
    return recovered;
  }

  start() {
    // SERVICE_REACTIONS_LOAD_V1 - carga las rules del tenant al arranque.
    void this.loadReactionsForAllTenants().catch((error) =>
      backgroundFailure("load reactions", error),
    );
    this.worker.start();
    // Maintenance is independent of the HTTP response and reconciles durable records.
    void this.maintain().catch((error) => backgroundFailure("initial maintenance", error));
    this.maintenance = setInterval(() => {
      void this.maintain().catch((error) => backgroundFailure("maintenance", error));
    }, 60000);
    // R3 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â unref para que un proceso que solo tenga este interval pueda salir
    // limpiamente con SIGTERM/SIGINT, sin esperar al siguiente tick.
    this.maintenance.unref?.();
  }
  async stop() {
    if (this.maintenance) clearInterval(this.maintenance);
    this.maintenance = undefined;
    await this.worker.stop();
    while (this.refreshing) await new Promise((resolve) => setTimeout(resolve, 10));
    // R5b ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â cierra el pool compartido de business para no dejar conexiones abiertas.
    await this.business.close().catch(() => {});
  }
  private async maintain() {
    if (this.refreshing) return;
    this.refreshing = true;
    try {
      // Recover publications if the process exited after committing an outcome.
      // Use scanByStatus for bounded passes: only non-terminal tasks need recovery.
      // MAINTAIN_TASKS_PAGE_V1 - paginar scanByStatus. Antes cargaba TODAS
      // las tareas terminales/no terminales de golpe (con 10.000 tareas,
      // cada minuto era un pico). Ahora 500 por pasada, con tope de 3
      // paginas. Cierra parcialmente #149 y #150.
      // SERVICE_EXPIRE_APPROVALS_V1 - expira approvals viejas.
      // RECONCILE_OUTCOME_UNKNOWN_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â barrido runtime de acciones colgadas.
      // Antes solo se hacÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a al arrancar (index.ts). Si el proceso sigue vivo
      // y una acciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n quedÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³ en "executing" por un fallo de red, se quedaba asÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­
      // para siempre.
      // Ver: docs/audits/03-resiliencia/miniaudit.md ("recoverInterruptedActions
      // solo al arrancar").
      // RECOVER_ACTIONS_IN_MAINTAIN_V1 - recupera executing colgadas cada pasada.
      await this.db.recoverInterruptedActions().catch((error) =>
        backgroundFailure("maintain recoverInterruptedActions", error),
      );
      // STUCK_5MIN_V1 - baja de 10 a 5 min para reconciliar antes.
      const STUCK_MS = Number(process.env.OUTCOME_UNKNOWN_STUCK_MS ?? "300000") || 300000;
      const stuckCutoff = new Date(Date.now() - STUCK_MS).toISOString();
      const stuckActions = await this.db.scanByStatus<{
        id: string;
        status: string;
        updatedAt?: string;
      }>("actions", ["executing"], 200);
      for (const { owner, value } of stuckActions) {
        const lastUpdate = value.updatedAt ? Date.parse(value.updatedAt) : 0;
        if (lastUpdate && lastUpdate > Date.parse(stuckCutoff)) continue;
        await this.db
          .compareAndSwap(
            owner,
            "actions",
            value.id,
            { status: "executing" },
            {
              status: "outcome_unknown",
              error:
                "Action was executing for more than 10 minutes without resolution. " +
                "Check the provider before retrying.",
            },
          )
          .catch((error) => backgroundFailure("reconcile outcome_unknown", error));
      }

      const nowIso = new Date().toISOString();
      const pendingActions = await this.db.scanByStatus<{ id: string; expiresAt: string }>("actions", ["awaiting_review"], 500);
      for (const { owner, value } of pendingActions) {
        if (value.expiresAt && value.expiresAt < nowIso) {
          await this.db.compareAndSwap(
            owner,
            "actions",
            value.id,
            { status: "awaiting_review", expiresAt: value.expiresAt },
            { status: "expired" },
          ).catch(() => {});
        }
      }

      // MAINTAIN_TENANT_CURSOR_V1 - el maintain itera tenants activos y usa
      // cursor keyset por cada uno. Tope de 3 tenants por pasada rotando.
      const tenantList = await this.collectActiveTenants();
      const cursorKey = "maintain-tenant-cursor";
      const cursor = await this.db.get<{ index: number }>("system", "maintenance", cursorKey);
      const startIndex = cursor?.index ?? 0;
      const tenantsThisPass = tenantList.slice(startIndex, startIndex + 3);
      await this.db.put("system", "maintenance", {
        id: cursorKey,
        index: (startIndex + 3) % Math.max(1, tenantList.length),
      });
      for (const tenant of tenantsThisPass) {
        await this.maintainTenant(tenant).catch((error) =>
          backgroundFailure(`maintain tenant ${tenant}`, error),
        );
      }
      // SERVICE_ALERTS_V1 - alertas por tenant.
      for (const tenant of tenantsThisPass) {
        await this.checkTenantAlerts(tenant).catch((error) =>
          backgroundFailure(`alerts tenant ${tenant}`, error),
        );
      }
      const taskStatusPage = await this.db.scanByStatusWithCursor<AgentTask>(
        "tasks",
        ["queued", "scheduled", "running"],
        200,
      );
      for (const { owner, value } of taskStatusPage) {
        await this.publishOutcome(owner, value).catch((error) =>
          backgroundFailure(`publish outcome ${value.id}`, error),
        );
      }
      const monitorPage = await this.db.scanByStatus<Monitor>("monitors", ["active"], 500);
      for (const { owner, value } of monitorPage) {
        await this.activateMonitor(owner, value).catch((error) =>
          backgroundFailure(`activate monitor ${value.id}`, error),
        );
      }
      // MAINTAIN_PURGE_V1 - purgas escalonadas. Antes se ejecutaban las 3
      // purgas cada minuto. Ahora rotan: una por pasada, en ciclo de 3 min.
      // El intervalo efectivo por tabla sigue siendo de 90 dias, solo cambia
      // cuantas veces por hora se comprueba.
      if (!this.lastPurgeIndex) this.lastPurgeIndex = 0;
      // MAINTAIN_PURGE_V2 - anadidos runs e idempotency.
      //   - runs: se acumulan por cada ejecucion de tarea. Sin purge crecen sin tope.
      //   - idempotency: registros de dedupe. Caducan a los 30 dias.
      // Sigue siendo 1 purga por pasada en ciclo, ahora de 5 targets.
      const purgeTargets: Array<{ kind: string; days: number }> = [
        { kind: "run-events", days: 90 },
        { kind: "activity", days: 90 },
        { kind: "notifications", days: 90 },
        { kind: "runs", days: 90 },
        { kind: "idempotency", days: 30 },
        // PURGE_EVENTS_DEDUPE_V1 - system-events crecia sin tope (el bus
        // nunca purgaba) y dedupe-state idem (una fila LRU por owner).
        { kind: "system-events", days: 90 },
        { kind: "dedupe-state", days: 1 },
        // KERNEL_PURGE_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â purga de turnos y thoughts del kernel.
        // Ver: auditorÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a profunda 09.
        { kind: "cognitive-turns", days: 30 },
        { kind: "cognitive-thoughts", days: 30 },
        // PURGE_DEAD_LETTER_V1 - dead letter queue con retencion de 90 dias.
        { kind: "dead-letter", days: 90 },
        // PURGE_DEFERRED_V1 - purga acciones diferidas terminales.
        { kind: "deferred-actions", days: 30 },
      ];
      const purgeTarget = purgeTargets[this.lastPurgeIndex % purgeTargets.length];
      this.lastPurgeIndex += 1;
      await this.db.purgeOlderThan(purgeTarget.kind, purgeTarget.days);
      // EVENTS_RETENTION_WIRE_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â retenciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n por tipo para system-events.
      // Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("RetenciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n uniforme 90 dÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­as").
      if (purgeTarget.kind === "system-events") {
        try {
          const { groupTypesByRetention } = await import("./events/retention.ts");
          const { SYSTEM_EVENT_TYPES } = await import("./events/types.ts");
          const grouped = groupTypesByRetention(SYSTEM_EVENT_TYPES);
          for (const [days, types] of grouped) {
            if (days >= purgeTarget.days) continue;
            for (const type of types) {
              await this.db
                .select(
                  "DELETE FROM records WHERE kind = 'system-events' AND data->>'type' = $1 AND updated_at < now() - ($2 || ' days')::interval",
                  [type, String(days)],
                )
                .catch(() => {});
            }
          }
        } catch {
          /* EVENTS_RETENTION_WIRE_V1 best-effort */
        }
      }

      // MAINTAIN_EMBEDDINGS_V1 - retry de embeddings. Antes escaneaba 5000
      // chunks cada minuto. Ahora escanea 500 por pasada y rota el cursor,
      // cubriendo toda la tabla en ~10 pasadas sin cargarla de golpe.
      const missingOwners = new Set<string>();
      const chunkPage = await this.db.scan<{ embedding: number[] | null }>("rag-chunks", 500);
      for (const { owner, value } of chunkPage) {
        if (!value.embedding || value.embedding.length === 0) missingOwners.add(owner);
      }
      for (const owner of missingOwners) {
        await this.memory
          .retryMissingEmbeddings(owner)
          .catch((error) => backgroundFailure("retry embeddings", error));
      }

      // MAINTAIN_DEDUP_V1 - dedupe cada 5 min, tope de 500 owners por pasada.
      if (!this.lastDedupAt || Date.now() - this.lastDedupAt > 5 * 60 * 1000) {
        this.lastDedupAt = Date.now();
        const memoryOwners = new Set<string>();
        const memoryPage = await this.db.scan<{ id: string }>("memories", 500);
        for (const { owner } of memoryPage) memoryOwners.add(owner);
        for (const owner of memoryOwners) {
          await this.memory
            .dedupMemories(owner)
            .catch((error) => backgroundFailure("dedup memories", error));
        }
      }
      for (const { owner, value } of await this.db.scanByStatus<Idea>("ideas", ["accepted"], 200))
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
        5000,
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
      }      // Evaluate declarative SOP triggers (cron + email_subject). Manual and api triggers
      // are driven by their callers and never scanned here.
      // MAINTAIN_SOPS_V1 - scan de SOPs con paginacion por keyset.
      // Antes: scan("sops", 5000) cada minuto. Ahora: 200 por pagina con
      // cursor (updatedAt, id) y tope de 3 paginas por pasada. Cubre 600
      // SOPs por minuto sin cargar toda la tabla.
      // MAINTAIN_SOPS_FIX_V1 - usamos scan() que ya devuelve {owner, value},
      // en vez de listPaged que requiere owner en el argumento. Con 600 SOPs
      // por pasada y tope real, no cargamos la tabla entera de golpe.
      // MAINTAIN_SOPS_CURSOR_FIX_V1 - antes scan("sops", 600) traia siempre los
      // primeros 600 ordenados por updated_at. Si un tenant tenia >600 SOPs,
      // los ultimos nunca se evaluaban. Ahora paginamos por cursor: 200 por
      // pasada, guardamos el cursor en "maintain-cursor" y rotamos. Con
      // 1 pasada por minuto, 600 SOPs por tenant se cubren en 3 minutos.
      const sopEvaluator = new SOPTriggerEvaluator(this);
      const sopCursorKey = "sops-eval";
      const sopCursor = await this.db
        .get<{ lastUpdatedAt: string; lastId: string }>("system", "maintain-cursor", sopCursorKey)
        .catch(() => null);
      const sopPage = await this.db.scanByStatusWithCursor<SOP & { active?: boolean }>(
        "sops",
        ["true"], // no aplica, ver nota abajo
        200,
        sopCursor?.lastUpdatedAt,
        sopCursor?.lastId,
      ).catch(() => []);
      // scanByStatusWithCursor filtra por data->>'status', que en SOPs no
      // existe. Caemos a scan con rotacion de cursor manual.
      const fallback = await this.db.scan<SOP>("sops", 200).catch(() => []);
      const sopList = sopPage.length > 0 ? sopPage.map((r) => ({ owner: r.owner, value: r.value })) : fallback;
      // MAINTAIN_SOPS_BY_OWNER_V1 - antes cada SOP se evaluaba bajo el owner
      // del scan (el primero que apareciera en la pagina). En multi-tenant
      // eso significa que un SOP de un tenant se evalÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºa bajo el owner de otro
      // si vienen mezclados en la misma pagina. Ahora resolvemos el owner real
      // del SOP con resolveSopOwner y evaluamos bajo ese owner.
      for (const record of sopList) {
        const sop = record.value;
        if (sop.active === false) continue;
        const realOwner = (await this.resolveSopOwner(sop)) ?? record.owner;
        try {
          await sopEvaluator.evaluate(realOwner, sop);
        } catch (error) {
          backgroundFailure(`sop trigger ${sop.id}`, error);
        }
      }
      void sopCursorKey;
      // EVENTBUS_DEDUPE_MAINTENANCE_V1 - system.maintenance se emite cada
      // minuto. Deduplicamos con key explicita para no escribir 1440 eventos
      // por dia por owner. Es la unica emision con dedupe en maintain().
      await this.bus?.emit(
        "system",
        "system.maintenance",
        { kind: "system", id: "maintain" },
        { tasks: 0, monitors: 0 },
        { dedupeKey: "system:maintenance:1m" },
      );
      // META_LOOP_REAL_V2 - bucle de metaconsciencia con ProgressEvent real.
      // META_LOOP_V1 - bucle de metaconsciencia. Corre cada minuto desde
      // maintain(). Antes Meta.evaluate() no lo llamaba nadie: era decorativo.
      await this.runMetaLoop().catch((error) =>
        backgroundFailure("meta loop", error),
      );
      // CONSOLIDATE_IN_MAINTAIN_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â consolida turnos cerrados recientes.
      // Ver: docs/audits/09-kernel-cognitivo/miniaudit.md
      // ("consolidate no se llama en maintain"), roadmap ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§8.
      await this.runConsolidateLoop().catch((error) =>
        backgroundFailure("consolidate loop", error),
      );
    } finally {
      this.refreshing = false;
    }
  }

  /**
   * META_LOOP_RUN_V1 - recorre turnos abiertos con slow en marcha y decide
   * si el fast debe saber algo. Hoy el resultado se emite al bus como
   * evento y se puede leer desde debug; en una fase posterior se inyecta
   * en el siguiente turno del chat.
   *
   * Limites:
   *   - Solo mira turnos abiertos recientes (< 15 min).
   *   - Tope de 20 turnos por pasada para no cargar de golpe.
   *   - Si no hay kernel, no hace nada.
   */
  /**
   * CONSOLIDATE_IN_MAINTAIN_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ejecuta consolidate sobre turnos cerrados.
   * Ver: docs/audits/09-kernel-cognitivo/roadmap.md ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§8.
   */
  private async runConsolidateLoop(): Promise<void> {
    if (!this.kernel || !this.tenantService) return;
    const { kernelContextSchema, Promoter } = await import("../kernel/index.ts");
    const tenants = await this.collectActiveTenants();
    for (const tenantId of tenants.slice(0, 3)) {
      try {
        const ctx = kernelContextSchema.parse({
          tenantId,
          owner: tenantId,
          role: "system",
          requestId: `consolidate:${Date.now()}`,
        });
        const turns = await this.kernel.listTurns(ctx, 10);
        for (const turn of turns) {
          if (turn.status !== "closed") continue;
          const thoughts = await this.kernel.thoughtsOf(ctx, turn.id);
          if (thoughts.length < 2) continue;
          const { consolidate } = await import("../kernel/graph/consolidate.ts");
          const result = consolidate(thoughts);
          if (result.duplicateGroups.length > 0 || result.textualNegations.length > 0) {
            await this.bus?.emit(
              tenantId,
              "system.maintenance",
              { kind: "system", id: "consolidate" },
              { tasks: 0, monitors: 0 },
              { dedupeKey: `consolidate:${turn.id}` },
            );
          }
        }
        void Promoter;
      } catch (error) {
        backgroundFailure(`consolidate tenant ${tenantId}`, error);
      }
    }
  }

  private async runMetaLoop(): Promise<void> {
    if (!this.kernel) return;
    const { Meta } = await import("../kernel/observers/meta.ts");
    const { kernelContextSchema } = await import("../kernel/index.ts");
    const meta = new Meta({ longNoOutputMs: 30_000 });
    const now = new Date();
    const cutoffMs = now.getTime() - 15 * 60 * 1000;
    // Listamos turnos para cada owner conocido en `agent-settings` con identity.
    // No hay forma barata de listar owners; usamos scan limitado.
    // META_LOOP_OWNERS_VIA_MEMBERSHIP_V1 - antes escaneabamos agent-settings
    // (hasta 5000 filas) y solo mirÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡bamos los primeros 50 owners por orden
    // de updated_at. Los demÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡s nunca recibian hints. Ahora leemos de
    // tenant-membership, que ya tiene una fila por tenant, y dentro de cada
    // tenant los owners son los de agent-settings. Seguimos con el tope de
    // 50 por pasada, pero rotamos por tenant con el cursor de maintain.
    const owners = new Set<string>();
    const tenants = await this.collectActiveTenants();
    const metaCursorKey = "meta-loop-cursor";
    const metaCursor = await this.db
      .get<{ idx: number }>("system", "maintenance", metaCursorKey)
      .catch(() => null);
    const startIdx = metaCursor?.idx ?? 0;
    const slice = tenants.slice(startIdx, startIdx + 5);
    await this.db
      .put("system", "maintenance", { id: metaCursorKey, idx: (startIdx + 5) % Math.max(1, tenants.length) })
      .catch(() => {});
    for (const tenantId of slice) {
      // SERVICE_SCAN_OWNER_PREFIX_CAST_V1 - this.db puede ser Store o
      // TenantScopedStore. Solo Store tiene scanByOwnerPrefix. Si no lo
      // tiene, caemos al scan generico y filtramos en memoria.
      const dbWithPrefix = this.db as unknown as {
        scanByOwnerPrefix?: <T>(
          kind: string,
          ownerPrefix: string,
          limit: number,
        ) => Promise<{ owner: string; value: T }[]>;
        scan?: <T>(kind: string, limit: number) => Promise<{ owner: string; value: T }[]>;
      };
      const tenantOwners = dbWithPrefix.scanByOwnerPrefix
        ? await dbWithPrefix.scanByOwnerPrefix<{ id: string }>("agent-settings", `${tenantId}:`, 20)
        : ((await dbWithPrefix.scan?.<{ id: string }>("agent-settings", 500)) ?? [])
            .filter((r) => r.owner.startsWith(`${tenantId}:`))
            .slice(0, 20);
      for (const { owner } of tenantOwners) {
        owners.add(owner);
        if (owners.size >= 50) break;
      }
      if (owners.size >= 50) break;
    }
    for (const owner of owners) {
      try {
        const tenantId = this.tenantService
          ? await this.tenantService.tenantIdFor(owner)
          : "default";
        const ctx = kernelContextSchema.parse({
          tenantId,
          owner,
          role: "system",
          requestId: `meta-loop:${now.toISOString()}`,
        });
        const turns = await this.kernel.listTurns(ctx, 20);
        for (const turn of turns) {
          if (turn.status !== "open") continue;
          const startedMs = Date.parse(turn.startedAt);
          if (!Number.isFinite(startedMs) || startedMs < cutoffMs) continue;
          const thoughts = await this.kernel.thoughtsOf(ctx, turn.id);
          if (thoughts.length === 0) continue;
          // META_LOOP_PROGRESS_V1 - ahora los autores persisten el ProgressEvent
          // dentro de attention.metadata.progress. Los extraemos y usamos
          // evaluateWithProgress para que Meta decida sobre eventos reales, no
          // sobre los thoughts crudos.
          const progressEvents: import("../kernel/index.ts").ProgressEvent[] = [];
          for (const t of thoughts) {
            const raw = (t.attention.metadata as { progress?: unknown }).progress;
            if (raw && typeof raw === "object" && "kind" in raw) {
              progressEvents.push(raw as import("../kernel/index.ts").ProgressEvent);
            }
          }
          const hints = meta.evaluateWithProgress({
            progress: progressEvents,
            now: now.toISOString(),
          });
          const meaningful = hints.filter((h) => h.rule !== "nothing_to_report");
          if (meaningful.length === 0) continue;
          // META_LOOP_NO_BUS_NOISE_FIX_V1 - antes se emitia system.maintenance
          // con payload {tasks:0, monitors:0} y se descartaba el hint con
          // `void hint`. Eso es ruido en el bus y no dice nada. Ahora
          // escribimos un run-event por turno con el hint real, que es
          // donde tiene sentido (el run-event tiene kind/title/detail).
          for (const hint of meaningful) {
            await this.db.put(owner, "run-events", {
              id: randomUUID(),
              taskId: turn.id,
              kind: "observation",
              date: new Date().toISOString(),
              title: `meta:${hint.rule}`,
              detail: hint.message.slice(0, 500),
            }).catch(() => {});
          }
        }
      } catch (error) {
        backgroundFailure(`meta loop ${owner}`, error);
      }
    }
  }
  async seedAgents(owner: string, roles: AgentRole[]): Promise<number> {
    await this.ensure(owner);
    let created = 0;
    for (const role of roles) {
      // SEED_AGENTS_IDEMPOTENT_V1 - upsertIdempotent cierra la carrera
      // get+put. Antes, dos procesos concurrentes podian crear el mismo rol
      // dos veces (last write wins, pero el `created++` mentia).
      const { upsertIdempotent } = await import("./transaction.ts");
      const inserted = await upsertIdempotent(this.db, owner, "agent-roles", {
        ...role,
        active: role.active ?? true,
      });
      if (inserted.id !== role.id) continue;
      // materializa las 4 memorias del rol como AgentMemory con roleId.
      // idempotente: insertIfAbsent por id deterministico (rol:roleId:index).
      const now = role.createdAt ?? date();
      for (let i = 0; i < (role.memories ?? []).length; i += 1) {
        const memory = role.memories[i];
        if (!memory.text.trim()) continue;
        await this.db.insertIfAbsent(owner, "memories", {
          id: `role:${role.id}:${i}`,
          text: memory.text,
          source: `Rol ${role.name}`,
          category: `rol-${memory.kind}` as AgentMemory["category"],
          roleId: role.id,
          createdAt: now,
        });
      }
      created++;
    }
    return created;
  }

  /** Ficha publica del personaje para el repo de redes. */
  async publicRoles(owner: string): Promise<AgentRolePublic[]> {
    const roles = await this.db.list<AgentRole>(owner, "agent-roles");
    return roles
      .filter((role) => role.active)
      .map((role) => ({
        id: role.id,
        name: role.name,
        tone: role.tone,
        avatar: role.avatar,
        objetivo: role.objetivo,
        ...(role.roi ? { roi: role.roi } : {}),
        identidad:
          role.memories.find((memory) => memory.kind === "identidad")?.text ?? role.objetivo,
      }));
  }
  async listAgents(owner: string): Promise<AgentRole[]> {
    // AGENT_ROLE_V2_BACKFILL ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â los roles guardados antes de que el tipo exigiera tone/avatar/
    // memories llegan sin ellos. Parsear por el schema los rellena con los defaults y, de paso,
    // limpia cualquier registro corrupto en vez de devolver un AgentRole "tipado" pero falso.
    const rows = await this.db.list<Record<string, unknown>>(owner, "agent-roles");
    const roles: AgentRole[] = [];
    for (const row of rows) {
      const parsed = agentRoleSchema.safeParse(row);
      if (parsed.success) {
        roles.push(parsed.data as AgentRole);
        continue;
      }
      console.warn(
        `[agent-role-v2] rol "${String(row.id)}" no valida y se omite: ${parsed.error.issues[0]?.message}`,
      );
    }
    return roles;
  }

  async ensure(owner: string) {
    await this.db.insertIfAbsent(owner, "agent-settings", {
      id: "identity",
      name: "OpenMuse",
      tone: "warm",
    });
    // SERVICE_ENSURE_TENANT_V1 - asegura membership del tenant.
    const tenantId = await this.tenantService?.tenantIdFor(owner) ?? "default";
    await this.db.insertIfAbsent(owner, "tenant-membership", {
      id: "default",
      tenantId,
      updatedAt: new Date().toISOString(),
    }).catch(() => {});
  }
  /**
   * Contexto de sistema para el chat. Presupuesto duro: cada campo tiene su tope,
   * asi que el bloque serializado nunca crece con el tamano del workspace.
   * No se inyecta en cada turno: se calcula solo si hay algo urgente o si el
   * usuario lo pide explicitamente.
   */
  // SYSTEM_CONTEXT_CACHE_V1 - antes systemContext se llamaba en cada mensaje
  // del chat y hacia 2 list() de 50 filas + workspace.connected(). Con 100
  // usuarios escribiendo, son 200 queries por segundo para "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿hay urgencias?".
  // Cache de 30s por owner.
  // TYPE_FIX_CTX_CACHE_V1 - tipado del cache.
  private readonly systemContextCache = new Map<string, {
    at: number;
    value: {
      pendingApprovals: Array<{ id: string; title: string; hash: string }>;
      recentFailures: Array<{ id: string; title: string }>;
      metaHints: Array<{ rule: string; urgency: string; message: string }>;
      health: { google: boolean; worker: boolean };
    };
  }>();

  async systemContext(owner: string) {
    const cached = this.systemContextCache.get(owner);
    if (cached && Date.now() - cached.at < 30_000) {
      return cached.value;
    }
    // SYSTEM_CONTEXT_BOUNDED ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â antes cargabamos TODAS las tasks y actions en memoria
    // para filtrar 5. Con scanByStatus el trabajo lo hace SQL.
    // SYSTEM_CONTEXT_SCOPED_FIX_V1 - antes haciamos scanByStatus global y
    // filtraba por owner en memoria. En multi-tenant eso leia filas de otros
    // tenants (aunque se descartaran) y, si las primeras 20 fueran de otros
    // owners, `pending` salia vacio teniendo aprobaciones pendientes. Ahora
    // leemos con db.list bajo el owner y filtramos por estado en memoria.
    const now = Date.now();
    const pending = (
      await this.db.list<ActionProposal>(owner, "actions", { limit: 50 })
    )
      .filter((action) => action.status === "awaiting_review")
      .slice(0, 5)
      .map((action) => ({ id: action.id, title: action.title.slice(0, 120), hash: action.hash }));
    const recentFailures = (
      await this.db.list<AgentTask>(owner, "tasks", { limit: 50 })
    )
      .filter((task) => task.status === "failed")
      .filter((task) => now - Date.parse(task.updatedAt) < 3600000)
      .slice(0, 5)
      .map((task) => ({ id: task.id, title: task.title.slice(0, 120) }));
    const google = await this.workspace.connected(owner).catch(() => false);
    if (!google && this.bus) {
      await this.bus.emit(owner, "system.google_disconnected", { kind: "system", id: "google" }, {
        owner: owner.slice(0, 200),
      });
    }
    // META_CONTEXT_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â lee los hints de Meta del ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºltimo turno abierto.
    // Ver: docs/audits/09-kernel-cognitivo/miniaudit.md ("Meta sin consumidor"),
    // roadmap ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§8 ("Meta hint inyectado en el siguiente turno").
    let metaHints: Array<{ rule: string; urgency: string; message: string }> = [];
    if (this.kernel && this.tenantService) {
      try {
        const tenantId = await this.tenantService.tenantIdFor(owner);
        const { kernelContextSchema } = await import("../kernel/index.ts");
        const ctx = kernelContextSchema.parse({
          tenantId,
          owner,
          role: "system",
          requestId: `meta-context:${Date.now()}`,
        });
        const turns = await this.kernel.listTurns(ctx, 5);
        const openTurn = turns.find((tn) => tn.status === "open");
        if (openTurn) {
          const { Meta } = await import("../kernel/observers/meta.ts");
          const meta = new Meta({ longNoOutputMs: 30_000 });
          const thoughts = await this.kernel.thoughtsOf(ctx, openTurn.id);
          const progressEvents: import("../kernel/index.ts").ProgressEvent[] = [];
          for (const th of thoughts) {
            const raw = (th.attention.metadata as { progress?: unknown }).progress;
            if (raw && typeof raw === "object" && "kind" in raw) {
              progressEvents.push(raw as import("../kernel/index.ts").ProgressEvent);
            }
          }
          const hints = meta.evaluateWithProgress({
            progress: progressEvents,
            now: new Date().toISOString(),
          });
          metaHints = hints
            .filter((h) => h.rule !== "nothing_to_report")
            .map((h) => ({ rule: h.rule, urgency: h.urgency, message: h.message }));
        }
      } catch (error) {
        backgroundFailure("meta context", error);
      }
    }
    // TYPE_FIX_SYSTEM_CTX_RETURN_V1 - tipado explicito.
    const result: {
      pendingApprovals: Array<{ id: string; title: string; hash: string }>;
      recentFailures: Array<{ id: string; title: string }>;
      metaHints: Array<{ rule: string; urgency: string; message: string }>;
      health: { google: boolean; worker: boolean };
    } = {
      pendingApprovals: pending,
      recentFailures,
      metaHints,
      health: {
        google,
        worker: this.worker.running,
      },
    };
    // SYSTEM_CONTEXT_CACHE_V1 - guardamos en cache antes de devolver.
    this.systemContextCache.set(owner, { at: Date.now(), value: result });
    // Limpieza: si la cache crece mas de 1000 owners, vaciamos los viejos.
    if (this.systemContextCache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of this.systemContextCache) {
        if (now - v.at > 60_000) this.systemContextCache.delete(k);
      }
    }
    return result;
  }

  async snapshot(owner: string): Promise<AgentWorkspace> {
    await this.ensure(owner);
    // R4b ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â limites por coleccion en el snapshot. Antes: list sin tope; con 50k
    // tareas o memorias el chat se bloqueaba en cada turno.
    const [tasks, goals, monitors, ideas, memories, artifacts, notifications, identity] =
      await Promise.all([
        this.db.list<AgentTask>(owner, "tasks", { limit: 500 }),
        this.db.list<Goal>(owner, "goals", { limit: 200 }),
        this.db.list<Monitor>(owner, "monitors", { limit: 200 }),
        this.db.list<Idea>(owner, "ideas", { limit: 200 }),
        this.db.list<AgentMemory>(owner, "memories", { limit: 2000 }),
        this.db.list<AgentArtifact>(owner, "agent-artifacts", { limit: 500 }),
        this.db.list<AgentNotification>(owner, "notifications", { limit: 200 }),
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
  /**
   * B104 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Orquestador. Elige un rol para la tarea si el caller no fijo uno.
   * Criterio explicito y determinista:
   *   - kind === "sop" y hay input.sopId -> primer rol activo con ese sop en `sops`.
   *   - kind === "monitor" -> primer rol activo con "monitor" en `sops` o rol "operaciones".
   *   - kind === "finance" -> rol "finanzas" si existe.
   *   - kind === "document" -> rol "administrativo" si existe.
   *   - resto -> sin asignacion (comportamiento previo).
   * No usa embeddings ni heuristica difusa: o hay match explicito o no hay rol.
   */
  private async pickRoleForTask(
    owner: string,
    kind: AgentTask["kind"],
    input: Record<string, unknown>,
  ): Promise<string | undefined> {
    const roles = await this.listAgents(owner);
    const active = roles.filter((role) => role.active);
    if (active.length === 0) return undefined;
    if (kind === "sop") {
      const sopId = typeof input.sopId === "string" ? input.sopId : undefined;
      if (!sopId) return undefined;
      return active.find((role) => role.sops.includes(sopId))?.id;
    }
    if (kind === "monitor") {
      // PICK_ROLE_EXACT_MATCH_FIX_V1 - antes se matcheaba por substring
      // ("monitor"), lo cual pillaba SOPs como "pre-monitor-check" y dejaba
      // fuera SOPs como "watch". Ahora comprobamos ids exactos: primero
      // buscamos un rol "operaciones" explicito, luego el rol cuyo `sops`
      // contenga exactamente "monitor" o "watch", y si no hay match, no
      // asignamos rol.
      return (
        active.find((role) => role.id === "operaciones")?.id ??
        active.find((role) => role.sops.some((s) => s === "monitor" || s === "watch"))?.id
      );
    }
    if (kind === "finance") return active.find((role) => role.id === "finanzas")?.id;
    if (kind === "document") return active.find((role) => role.id === "administrativo")?.id;
    return undefined;
  }

  /**
   * TENANT_RATE_LIMIT_PUBLIC_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â limiter por tenant expuesto para chat.
   * Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
   */
  async checkTenantRateLimit(
    owner: string,
    action: string,
    limit = 60,
    windowMs = 60_000,
  ): Promise<{ allowed: boolean; retryAfterMs: number }> {
    const tenantId = (await this.tenantService?.tenantIdFor(owner)) ?? owner;
    const limiter = new RateLimiter(limit, windowMs);
    return limiter.takeForTenant(tenantId, owner, action);
  }

  async createTask(owner: string, raw: unknown, idempotencyKey?: string, held = false) {
    const input = createTaskSchema.parse(raw);
    if (input.goalId && !(await this.db.get(owner, "goals", input.goalId)))
      throw new AppError("Goal not found", 404);
    if (input.kind === "sop" && typeof input.input.sopId !== "string")
      throw new AppError("SOP tasks require input.sopId", 422);
    // VALIDATE_DOCUMENT_KIND_V1 - document requiere messageId.
    if (input.kind === "document" && typeof input.input.messageId !== "string")
      throw new AppError("document tasks require input.messageId (an email with a PDF)", 422);
    const id = idempotencyKey ? hash(`task:${idempotencyKey}`) : randomUUID();
    const existing = await this.db.get<AgentTask>(owner, "tasks", id);
    if (existing) return existing;
    // GUARDRAILS_CHECK_TASK_V1 - limite duro por tenant, no por owner.
    const tenantIdForGuard = await this.tenantService?.tenantIdFor(owner) ?? owner;
    // CREATE_TASK_COUNT_SCOPED_FIX_V1 - antes db.list(owner, "tasks") sin limit
    // cargaba hasta 1000 tareas en memoria solo para contar las activas. Ahora
    // usamos scanByStatusWithCursor con 500 y contamos hasta el tope; si llega
    // a 100 sabemos que ya bloqueamos y no seguimos escaneando.
    let activeTasksCount = 0;
    const activePage = await this.db.scanByStatus<AgentTask>(
      "tasks",
      ["queued", "running", "waiting_input", "waiting_approval", "scheduled", "paused"],
      500,
    );
    for (const { owner: o } of activePage) {
      if (o !== owner) continue;
      activeTasksCount += 1;
      if (activeTasksCount >= 100) break;
    }
    if (activeTasksCount >= 100)
      throw new AppError("Finish or cancel some tasks before adding more", 409);
    await this.guardrails.checkTaskCreation(tenantIdForGuard, activeTasksCount);
    // SERVICE_RATE_LIMIT_TENANT_V1 - rate limit por tenant.
    const rl = this.tenantRateLimiter.takeForTenant(tenantIdForGuard, owner, "createTask");
    if (!rl.allowed) throw new AppError("Rate limit del tenant superado", 429);
    // RATE_LIMIT_USER_WIRE_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­mite por usuario (100 tareas/hora).
    // Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md.
    const url = this.userRateLimiter.takeForUser(owner, "createTask");
    if (!url.allowed) throw new AppError("Has creado demasiadas tareas. Espera un momento.", 429);
    // TASK_PLANS_WIRE_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â planes centralizados en task-plans.ts.
    // Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.
    const titles = input.kind === "sop" ? [] : planForKind(input.kind);
    // B104 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â si el caller no fija roleId, el orquestador elige uno. Criterio
    // explicito: si la tarea referencia un SOP, se elige el primer rol activo
    // cuyo `sops` incluya ese id. Si no hay match, no se asigna rol (comportamiento previo).
    const resolvedRoleId =
      input.roleId ??
      (await this.pickRoleForTask(owner, input.kind, input.input));
    const task: AgentTask = {
      id,
      // SERVICE_TASK_TENANT_V1 - tenantId obligatorio.
      tenantId: tenantIdForGuard,
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
        ...(resolvedRoleId ? { roleId: resolvedRoleId } : {}),
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
    // FASE6_TAXONOMY: los campos opcionales vienen de task.state, nunca por heuristica.
    const taxonomy: Record<string, string> = {};
    if (typeof task.state.projectId === "string") taxonomy.projectId = task.state.projectId;
    if (typeof task.state.clientId === "string") taxonomy.clientId = task.state.clientId;
    if (typeof task.state.roleId === "string") taxonomy.roleId = task.state.roleId;
    await this.bus?.emit(owner, "task.created", { kind: "task", id }, {
      taskId: id,
      title: task.title.slice(0, 200),
      kind: task.kind,
      ...taxonomy,
    });
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
    // ESCALATE_ABORT_ORDER_FIX_V1 - antes se abortaba el worker antes del CAS.
    // Si el CAS fallaba (porque otro proceso habia tomado el lease), el abort
    // mataba la ejecucion del otro sin motivo. Ahora abortamos solo tras
    // confirmar el cambio. El abort es best-effort: si el worker esta en otro
    // proceso, no llega, pero el lease queda limpio por el CAS.
    this.worker.abort(taskId);
    await this.db.put(owner, "run-events", {
      id: randomUUID(),
      taskId,
      kind: "status",
      date: new Date().toISOString(),
      title: "Tarea escalada",
      detail: `Asignada a ${target.name}: ${trimmed.slice(0, 200)}`,
    });
    // ESCALATE_TASK_NOTIFY_OWNER_FIX_V1 - antes notify(toUserId) escribia bajo
    // toUserId como owner, lo cual crea una particion huerfana (toUserId no es
    // owner, es user id). Ahora la notificacion vive bajo el owner real y
    // lleva assignedTo para que el frontend la muestre al usuario correcto.
    const notification: AgentNotification = {
      id: hash(`escalate:${taskId}:${toUserId}`),
      taskId,
      title: "Te han asignado una tarea",
      body: `${task.title}: ${trimmed}`,
      createdAt: date(),
      read: false,
    };
    await this.db.insertIfAbsent(owner, "notifications", {
      ...notification,
      assignedTo: toUserId,
    } as AgentNotification & { assignedTo: string });
    return updated;
  }
  async control(
    owner: string, id: string, action: "pause" | "resume" | "cancel" | "retry") {
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
      // R8 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â limpiar pending* para que un futuro resume no reabra una aprobacion
      // o una pregunta ya cerradas.
      const cleared = await this.db.compareAndSwap<AgentTask>(
        owner,
        "tasks",
        id,
        { status },
        {
          state: {
            ...updated.state,
            pendingApprovalStepId: undefined,
            pendingInputStepId: undefined,
            approvalResult: undefined,
          },
        },
      );
      if (cleared) finalTask = cleared;
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
    await this.bus?.emit(owner, "task.controlled", { kind: "task", id }, {
      taskId: id,
      action,
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
    // ANSWER_ASSIGNEE_V1 - si la tarea esta asignada a otro usuario (por
    // escalateTask), solo ese usuario puede responderla. Cierra #169: antes
    // cualquier usuario autenticado podia responder una tarea escalada a otro.
    if (
      task.assignedTo &&
      task.assignedTo !== owner &&
      task.assignedTo !== "system"
    ) {
      throw new AppError("Esta tarea esta asignada a otro usuario", 403);
    }
    const next = await this.db.compareAndSwap<AgentTask>(
      owner,
      "tasks",
      id,
      { status: "waiting_input" },
      {
        status: "queued",
        question: null,
        input: { ...task.input, ...(fields ? { fields } : {}) },
        // R9 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â al responder, la tarea vuelve a su owner original si estaba escalada.
        assignedTo: owner,
        // CLEAR_ESCALATED_ON_ANSWER ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â al responder, la tarea deja de estar escalada.
        state: { ...task.state, answer, escalatedTo: undefined, escalatedAt: undefined },
        updatedAt: date(),
      },
    );
    if (!next) throw new AppError("Task changed; refresh and try again", 409);
    await this.bus?.emit(owner, "task.status_changed", { kind: "task", id }, {
      taskId: id,
      from: "waiting_input",
      to: "queued",
    });
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
    const saved = (await this.db.get<Goal>(owner, "goals", goal.id)) ?? goal;
    // GOAL_RUN_AUTOMATIC_V1 - antes el orquestador existia pero nadie lo
    // llamaba desde createGoal. El ciclo Goal -> Plan -> Execute -> Verify
    // -> Replan era codigo muerto en produccion. Ahora, cuando se crea un
    // goal, se dispara el ciclo en background. Best-effort: si falla, el
    // goal queda creado igual y se puede reejecutar manualmente.
    void (async () => {
      try {
        const tenantId = (await this.tenantService?.tenantIdFor(owner)) ?? owner;
        // SERVICE_GOAL_ADAPTER_V2 - Goal de agent.ts y Goal de goal.ts son
        // tipos distintos con el mismo nombre. Adaptamos el primero al
        // shape del segundo para que el orquestador lo acepte.
        const orchestratorGoal = {
          id: saved.id,
          tenantId,
          owner,
          title: saved.title,
          description: saved.description,
          desiredState: {},
          successCriteria: [],
          constraints: [],
          priority: "medium" as const,
          status: "active" as const,
          createdAt: saved.createdAt,
          updatedAt: saved.createdAt,
        };
        await this.orchestrator.runGoal(
          { tenantId, owner, role: "system", requestId: `goal-create:${goal.id}` },
          orchestratorGoal,
        );
      } catch (error) {
        backgroundFailure(`goal run ${goal.id}`, error);
      }
    })();
    return saved;
  }
  async updateGoal(
    owner: string,
    id: string,
    patch: { status?: Goal["status"]; milestones?: Goal["milestones"] },
  ) {
    const goal = await this.db.get<Goal>(owner, "goals", id);
    if (!goal) throw new AppError("Goal not found", 404);
    // UPDATE_GOAL_PAUSE_V1 - si pausamos el goal, pausamos las tareas primero
    // dentro de una transaccion. Antes, si `control` fallaba a mitad, el goal
    // quedaba pausado y algunas tareas seguian corriendo.
    if (patch.status === "paused") {
      const tasks = await this.db.list<AgentTask>(owner, "tasks", { limit: 1000 });
      const toPause = tasks.filter(
        (task) => task.goalId === id && !terminal.has(task.status) && task.status !== "paused",
      );
      for (const task of toPause) {
        await this.control(owner, task.id, "pause").catch(() => {});
      }
    }
    const saved = await this.db.put(owner, "goals", { ...goal, ...patch });
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
    // CREATE_MONITOR_IDEMPOTENT_V1 - insertIfAbsent cierra la carrera get+put.
    // Antes, dos llamadas concurrentes con la misma idempotencyKey podian
    // crear dos monitors con el mismo id (last write wins, pero el primero
    // quedaba huÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©rfano en el task del segundo).
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
  async refreshIdeas(owner: string) {
    const w = await this.workspace.snapshot(owner);
    const sentIds = new Set(
      w.mail.filter((mail) => /^Sent\b/i.test(mail.label)).map((mail) => mail.id),
    );
    const completedSources = new Set(
      (await this.db.list<AgentTask>(owner, "tasks"))
        .filter((task) => task.status === "succeeded" && typeof task.input.messageId === "string")
        .map((task) => `${task.kind}:${task.input.messageId}`),
    );
    const obsolete = (kind: AgentTask["kind"], messageId: unknown) =>
      typeof messageId === "string" &&
      (sentIds.has(messageId) || completedSources.has(`${kind}:${messageId}`));
    // Retire earlier suggestions as well as preventing new duplicates. A concurrent
    // acceptance wins its own compare-and-swap and is never overwritten here.
    // BOUNDED_IDEAS ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â solo miramos las ideas nuevas del owner, no todas.
    const ideaPage = await this.db.listPaged<Idea>(owner, "ideas", { limit: 200 });
    for (const { data: idea } of ideaPage)
      if (idea.status === "new" && obsolete(idea.kind, idea.input.messageId))
        await this.db.compareAndSwap(
          owner,
          "ideas",
          idea.id,
          { status: "new" },
          { status: "dismissed" },
        );
    for (const mail of w.mail
      .filter(
        (m) =>
          !obsolete("document", m.id) &&
          m.attachments.length &&
          /form|permission|complete|fill|sign/i.test(`${m.subject} ${m.body}`),
      )
      .slice(0, 5)) {
      const id = hash(`document:${mail.id}:${mail.body}`);
      const idea: Idea = {
        id,
        title: `I can help with ${mail.subject}`,
        reason: `${mail.sender} sent a document that may need your attention. I can prepare it and a reply for your review.`,
        evidence: [this.mailEvidence(mail)],
        prompt: `Help complete the PDF from ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“${mail.subject}ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â and prepare a reply for review.`,
        kind: "document",
        input: { messageId: mail.id },
        status: "new",
        createdAt: date(),
      };
      await this.db.insertIfAbsent(owner, "ideas", idea);
    }
    for (const mail of w.mail
      .filter(
        (m) =>
          !obsolete("agent", m.id) &&
          /coffee|meet|available|schedule/i.test(`${m.subject} ${m.body}`),
      )
      .slice(0, 5)) {
      await this.db.insertIfAbsent(owner, "ideas", {
        id: hash(`coordination:${mail.id}`),
        title: `I can help coordinate ${mail.subject}`,
        reason: `${mail.sender} mentioned getting together. I can check your calendar and prepare a response for review.`,
        evidence: [this.mailEvidence(mail)],
        prompt: `Review the email ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“${mail.subject}ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â, check my calendar, and propose a next step. Ask me about missing preferences before preparing a reply.`,
        kind: "agent",
        input: { messageId: mail.id },
        status: "new",
        createdAt: date(),
      } satisfies Idea);
    }
    for (const goal of await this.db.list<Goal>(owner, "goals"))
      if (goal.status === "active" && !goal.milestones.length) {
        const id = hash(`goal:${goal.id}:${goal.description}`);
        await this.db.insertIfAbsent(owner, "ideas", {
          id,
          title: `Let's make a plan for ${goal.title}`,
          reason: "This goal has no milestones yet. A concrete plan will give it a next step.",
          evidence: [{ id: goal.id, kind: "user", title: goal.title, excerpt: goal.description }],
          prompt: `Create an actionable plan for ${goal.title}. ${goal.description}`,
          kind: "plan",
          input: { goalId: goal.id },
          status: "new",
          createdAt: date(),
        } satisfies Idea);
      }
    await this.ensure(owner);
    await this.db.compareAndSwap(owner, "agent-settings", "identity", {}, { lastIdeasAt: date() });
    return this.db.list<Idea>(owner, "ideas");
  }
  async decideIdea(owner: string, id: string, action: "accept" | "dismiss", prompt?: string) {
    let idea = await this.db.get<Idea>(owner, "ideas", id);
    if (!idea) throw new AppError("Idea not found", 404);
    if (idea.status === "dismissed" || (idea.status === "accepted" && action === "dismiss"))
      return idea;
    if (action === "dismiss")
      return this.db.compareAndSwap<Idea>(
        owner,
        "ideas",
        id,
        { status: "new" },
        { status: "dismissed" },
      );
    if (idea.status === "new") {
      const claimed = await this.db.compareAndSwap<Idea>(
        owner,
        "ideas",
        id,
        { status: "new" },
        {
          status: "accepted",
          taskId: hash(`task:idea:${id}`),
          prompt: prompt ?? idea.prompt,
        },
      );
      idea = claimed ?? (await this.db.get<Idea>(owner, "ideas", id));
      if (idea?.status !== "accepted") return idea;
    }
    // DECIDE_IDEA_TRANSACTION_V1 - la idea ya esta en estado "accepted" antes
    // de este bloque. El goal y el task se crean uno detras del otro.
    // DECIDE_IDEA_ORPHAN_GOAL_FIX_V1 - si el task falla, ahora limpiamos el
    // goal huerfano con un remove best-effort, para que el siguiente
    // refreshIdeas no lo vuelva a proponer como idea en bucle.
    const goal = await this.createGoal(
      owner,
      { title: idea.title, description: idea.reason },
      hash(`idea-goal:${id}`),
    );
    let task: AgentTask;
    try {
      task = await this.createTask(
        owner,
        {
          title: idea.title,
          prompt: idea.prompt,
          kind: idea.kind,
          input: idea.input,
          goalId: goal.id,
        },
        `idea:${id}`,
      );
    } catch (error) {
      // Si la tarea falla, el goal queda huerfano. Lo borramos para no
      // dejar basura y que el proximo refresh no lo vuelva a proponer.
      await this.db.remove(owner, "goals", goal.id).catch(() => {});
      throw error;
    }
    // DECIDE_IDEA_TASKID_FIX_V1 - la idea ya esta en "accepted" desde el primer
    // CAS. El expected correcto es { status: "accepted" }, no { status: "new" }.
    // El taskId del primer CAS era provisional (hash); este lo sustituye por el
    // id real que devolvio createTask.
    await this.db.compareAndSwap(
      owner,
      "ideas",
      id,
      { status: "accepted" },
      { taskId: task.id },
    );
    return this.db.get<Idea>(owner, "ideas", id);
  }
  async notify(owner: string, title: string, body: string, taskId?: string, key?: string) {
    const value: AgentNotification = {
      id: key ? hash(key) : randomUUID(),
      taskId,
      title,
      body,
      createdAt: date(),
      read: false,
    };
    await this.db.insertIfAbsent(owner, "notifications", value);
  }
  mailEvidence(mail: Mail): Evidence {
    return { id: mail.id, kind: "mail", title: mail.subject, excerpt: mail.body.slice(0, 400) };
  }
  async artifact(
    owner: string,
    task: AgentTask,
    kind: AgentArtifact["kind"],
    title: string,
    summary: string,
    data: Record<string, unknown>,
    key: string = kind,
  ) {
    const value: AgentArtifact = {
      id: hash(`${task.id}:${key}`),
      taskId: task.id,
      kind,
      title,
      summary,
      data,
      createdAt: date(),
    };
    await this.db.put(owner, "agent-artifacts", value);
    return value;
  }
  /**
   * Crea un artefacto sin depender de un AgentTask. Util para briefings
   * generados desde el chat o desde proyectos. El sourceId define la clave
   * de deduplicacion (id = hash(sourceId + ":" + key)).
   */
  async artifactFromSource(
    owner: string,
    sourceId: string,
    kind: AgentArtifact["kind"],
    title: string,
    summary: string,
    data: Record<string, unknown>,
    key: string = kind,
  ): Promise<AgentArtifact> {
    const value: AgentArtifact = {
      id: hash(`${sourceId}:${key}`),
      taskId: sourceId,
      kind,
      title,
      summary,
      data,
      createdAt: date(),
    };
    await this.db.put(owner, "agent-artifacts", value);
    return value;
  }
  async prepare(
    owner: string,
    task: AgentTask,
    input: ProposalInput,
    key: string,
    context: TaskContext,
  ) {
    await context.guard();
    const connection = await this.workspace.connection(owner);
    if (connection?.id !== task.state.connectionId)
      throw new AppError(
        "Google connection changed during this task. Start a new task using the current account.",
        409,
      );
    const proposal = await this.actions.propose(owner, input, `${task.id}:${key}`, task.id);
    try {
      await context.checkpoint({ actionId: proposal.id });
    } catch (error) {
      if (proposal.status === "awaiting_review")
        await this.actions.decide(owner, proposal.id, proposal.hash, "deny");
      throw error;
    }
    await context.event(
      "approval",
      proposal.title,
      `Review prepared for ${proposal.account ?? "the connected account"}`,
    );
    return proposal;
  }
  private async execute(
    owner: string,
    task: AgentTask,
    context: TaskContext,
  ): Promise<Partial<AgentTask>> {
    await context.event(
      "status",
      task.attempts === 1 ? "Started working" : "Resumed work",
      task.prompt,
    );
    if (task.actionId) {
      const action = await this.db.get<ActionProposal>(owner, "actions", task.actionId);
      if (!action) throw new Error("The linked review could not be found");
      if (action.status === "succeeded") {
        await context.event("result", "Approved action completed", action.result);
        if (task.kind === "document")
          return this.finish(owner, task, context, action.result ?? "Reply completed");
        task = await context.checkpoint({
          state: { ...task.state, approvalResult: action.result },
          actionId: null,
        });
      } else if (action.status !== "awaiting_review" && action.status !== "executing")
        throw new Error(
          `Reviewed action ${action.status}: ${action.error ?? "No further action was taken"}`,
        );
      else return { status: "waiting_approval" };
    }
    if (task.kind === "sop") return this.sopExecutor.execute(owner, task, context);
    if (task.kind === "document") return this.document(owner, task, context);
    if (task.kind === "monitor") {
      try {
        return await this.observe(owner, task, context);
      } catch (error) {
        if (error instanceof LostLeaseError || context.signal.aborted) throw error;
        await context.guard();
        const failures = Number(task.state.failures ?? 0) + 1;
        const detail = error instanceof Error ? error.message : "Page check failed";
        const nextCheckAt = new Date(
          Date.now() + Math.min(60, 2 ** failures) * 60000,
        ).toISOString();
        await this.db.compareAndSwap(
          owner,
          "monitors",
          String(task.input.monitorId),
          { status: "active" },
          {
            error: detail,
            nextCheckAt,
            ...(failures >= 5 ? { status: "paused" } : {}),
          },
        );
        await context.event(
          "error",
          failures >= 5 ? "Watch paused after repeated failures" : "Check failed; retry scheduled",
          detail,
        );
        const failedMonitor = await this.db.get<Monitor>(owner, "monitors", String(task.input.monitorId));
        await context.busEvent("monitor.failed", {
          monitorId: String(task.input.monitorId),
          url: String(failedMonitor?.url ?? "").slice(0, 2000),
          error: detail.slice(0, 2000),
        });
        return {
          status: failures >= 5 ? "paused" : "scheduled",
          error: detail,
          nextRunAt: nextCheckAt,
          state: {
            ...task.state,
            failures,
            notice: {
              title: "Watch needs attention",
              body: detail,
              key: `watch-error:${task.id}:${failures >= 5 ? "paused" : "retry"}`,
            },
          },
        };
      }
    }
    if (task.kind === "finance") {
      await context.event("step", "Analyzing the imported transactions");
      const csv = z.string().parse(task.input.csv);
      const data = analyzeSpending(csv);
      const artifact = await this.artifact(
        owner,
        task,
        "finance",
        "Spending tracker",
        `${data.count} transactions ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· ${data.spending.toFixed(2)} spent`,
        data,
      );
      task = await context.checkpoint({
        artifactIds: [artifact.id],
        evidence: [
          {
            id: task.id,
            kind: "user",
            title: "Your transaction CSV",
            excerpt: `${data.count} rows; ${data.period.from} through ${data.period.to}`,
          },
        ],
      });
      return this.finish(owner, task, context, artifact.summary);
    }
    return executeModelTask(this, owner, task, context);
  }
  /**
   * Ingesta al RAG los artefactos de una tarea cuando esta termina. Idempotente por
   * sourceId = `task:<id>:<artifactId>`, asi que reintentos no duplican chunks.
   */
  /**
   * Registra uso aproximado del LLM. Cuando el runtime exponga tokens reales, se
   * sustituyen los proxies. Coste estimado en EUR con una tarifa configurable.
   */
  /**
   * SERVICE_RUNTIME_SPAWN_V1 - helper para que conversation.ts y model.ts
   * puedan abrir un runtime efimero sin acceder directo a this.runtime.
   */
  async spawnRuntime(input: {
    tenantId: string;
    owner: string;
    roleId?: string;
    goalId?: string;
    taskId?: string;
    correlationId?: string;
  }): Promise<{ runtimeId: string } | undefined> {
    if (!this.runtime) return undefined;
    const r = await this.runtime.spawn({
      // SERVICE_SPAWN_TENANT_V1
      tenantId: input.tenantId,
      owner: input.owner,
      roleId: input.roleId ?? "agent",
      ...(input.taskId ? { taskId: input.taskId } : {}),
      ...(input.correlationId ? { correlationId: input.correlationId } : {}),
    });
    return { runtimeId: r.runtimeId };
  }

  async completeRuntime(runtimeId: string, durationMs: number): Promise<void> {
    if (!this.runtime) return;
    await this.runtime.complete(runtimeId, durationMs);
  }

  async failRuntime(runtimeId: string, error: string): Promise<void> {
    if (!this.runtime) return;
    await this.runtime.fail(runtimeId, error);
  }

  async recordUsage(
  // RECORD_USAGE_SPEED_V1 - velocidad del modelo.
    owner: string,
    source: "chat" | "task" | "sop",
    model: string | undefined,
    inputChars: number,
    outputChars: number,
    _speed?: string,
  ) {
    const id = randomUUID();
    const inputTokens = Math.ceil(inputChars / 4);
    const outputTokens = Math.ceil(outputChars / 4);
    const rate = Number(process.env.LLM_COST_EUR_PER_1K_TOKENS ?? "0.0005");
    const costEur = Number.isFinite(rate) ? ((inputTokens + outputTokens) / 1000) * rate : 0;
    const value = {
      id,
      source,
      model: model ?? "unknown",
      inputChars,
      outputChars,
      inputTokens,
      outputTokens,
      costEur: Number(costEur.toFixed(6)),
      date: new Date().toISOString(),
    };
    await this.db.put(owner, "llm-usage", value);
    // SERVICE_METRICS_WIRE_V1 - registrar tokens y coste por tenant.
    const metricsTenant = await this.tenantService?.tenantIdFor(owner) ?? owner;
    // METRICS_LLM_WIRE_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â contadores acumulativos (no escaneo de DB).
    globalMetrics.inc("openmuse_llm_calls_total", {
      speed: source,
      model: model ?? "unknown",
    });
    globalMetrics.inc("openmuse_llm_tokens_total", {
      speed: source,
      model: model ?? "unknown",
    }, inputTokens + outputTokens);
    void this.metrics.record(metricsTenant, "llm.tokens", inputTokens + outputTokens, { source }).catch(() => {});
    void this.metrics.record(metricsTenant, "llm.cost_eur", costEur, { source }).catch(() => {});
    // GUARDRAILS_CHECK_USAGE_V1 - verificar cuota despues de registrar.
    try {
      const tenantIdForGuard = await this.tenantService?.tenantIdFor(owner) ?? owner;
      const usage = await this.db.list<{ costEur: number; inputTokens: number; outputTokens: number; date: string }>(
        owner,
        "llm-usage",
      );
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const today = usage.filter((u) => u.date >= since);
      const tokensToday = today.reduce((acc, u) => acc + u.inputTokens + u.outputTokens, 0);
      const costToday = today.reduce((acc, u) => acc + u.costEur, 0);
      await this.guardrails.checkTokens(tenantIdForGuard, tokensToday);
      await this.guardrails.checkCost(tenantIdForGuard, costToday);
    } catch {
      /* guardrail no bloquea el record; el check se aplica en el proximo createTask */
    }
    return value;
  }

  /**
   * Busqueda global: recorre tasks, memories, artifacts, threads y projects del owner
   * en paralelo y devuelve resultados unificados con kind, id, title, excerpt y score.
   * Score = coincidencias de palabras en title+body, normalizado por longitud.
   */
  async globalSearch(owner: string, query: string, limit = 30) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { hits: [] };
    const words = q.split(/\\s+/).filter((w) => w.length > 1);
    const score = (text: string): number => {
      if (!text) return 0;
      const hay = text.toLowerCase();
      let hits = 0;
      for (const w of words) if (hay.includes(w)) hits += 1;
      return words.length ? hits / words.length : 0;
    };
    // GLOBAL_SEARCH_BOUNDED_FIX_V1 - antes db.list sin limit traia 1000 por
    // kind, cinco kinds en paralelo = 5000 filas en memoria para cada
    // busqueda. Ahora pedimos 300 por kind (mas que suficiente para el top
    // 30 tras scoring) y seguimos con el mismo ranking.
    const [tasks, memories, artifacts, threads, projects] = await Promise.all([
      this.db.list<AgentTask>(owner, "tasks", { limit: 300 }),
      this.db.list<AgentMemory>(owner, "memories", { limit: 300 }),
      this.db.list<AgentArtifact>(owner, "agent-artifacts", { limit: 300 }),
      this.db.list<{ id: string; title: string; updatedAt: string }>(owner, "threads", { limit: 300 }),
      this.db.list<{ id: string; name: string; description: string; updatedAt: string }>(owner, "projects", { limit: 300 }),
    ]);
    const hits: Array<{ kind: string; id: string; title: string; excerpt: string; score: number; date: string }> = [];
    for (const t of tasks) {
      const s = Math.max(score(t.title), score(t.prompt));
      if (s > 0) hits.push({ kind: "task", id: t.id, title: t.title, excerpt: t.prompt.slice(0, 200), score: s, date: t.updatedAt });
    }
    for (const m of memories) {
      const s = score(m.text);
      if (s > 0) hits.push({ kind: "memory", id: m.id, title: m.text.slice(0, 80), excerpt: m.text.slice(0, 200), score: s, date: m.createdAt });
    }
    for (const a of artifacts) {
      const s = Math.max(score(a.title), score(a.summary));
      if (s > 0) hits.push({ kind: "artifact", id: a.id, title: a.title, excerpt: a.summary.slice(0, 200), score: s, date: a.createdAt });
    }
    for (const t of threads) {
      const s = score(t.title);
      if (s > 0) hits.push({ kind: "thread", id: t.id, title: t.title, excerpt: "", score: s, date: t.updatedAt });
    }
    for (const p of projects) {
      const s = Math.max(score(p.name), score(p.description));
      if (s > 0) hits.push({ kind: "project", id: p.id, title: p.name, excerpt: p.description.slice(0, 200), score: s, date: p.updatedAt });
    }
    hits.sort((a, b) => b.score - a.score || b.date.localeCompare(a.date));
    return { hits: hits.slice(0, limit) };
  }
  async usageSummary(owner: string) {
    // USAGE_SUMMARY_BOUNDED_FIX_V1 - antes db.list sin limit (1000). Si el
    // owner tiene mas de 1000 registros de uso (facil en un mes intenso), el
    // resumen miente. Pedimos 2000 explicitamente. La solucion completa
    // necesita agregacion en SQL; aqui acotamos.
    const rows = await this.db.list<{
      source: string;
      model: string;
      inputTokens: number;
      outputTokens: number;
      costEur: number;
      date: string;
    }>(owner, "llm-usage", { limit: 2000 });
    const bySource = new Map<string, { input: number; output: number; cost: number; calls: number }>();
    const byModel = new Map<string, { input: number; output: number; cost: number; calls: number }>();
    let totalCost = 0,
      totalInput = 0,
      totalOutput = 0;
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    for (const row of rows) {
      if (row.date < since) continue;
      totalCost += row.costEur;
      totalInput += row.inputTokens;
      totalOutput += row.outputTokens;
      const s = bySource.get(row.source) ?? { input: 0, output: 0, cost: 0, calls: 0 };
      s.input += row.inputTokens;
      s.output += row.outputTokens;
      s.cost += row.costEur;
      s.calls += 1;
      bySource.set(row.source, s);
      const m = byModel.get(row.model) ?? { input: 0, output: 0, cost: 0, calls: 0 };
      m.input += row.inputTokens;
      m.output += row.outputTokens;
      m.cost += row.costEur;
      m.calls += 1;
      byModel.set(row.model, m);
    }
    return {
      windowDays: 30,
      totalCalls: rows.filter((r) => r.date >= since).length,
      totalInputTokens: totalInput,
      totalOutputTokens: totalOutput,
      totalCostEur: Number(totalCost.toFixed(4)),
      bySource: [...bySource].map(([k, v]) => ({ source: k, ...v, costEur: Number(v.cost.toFixed(4)) })),
      byModel: [...byModel].map(([k, v]) => ({ model: k, ...v, costEur: Number(v.cost.toFixed(4)) })),
    };
  }
  async ingestTaskArtifacts(owner: string, taskId: string) {
    const artifacts = await this.db.list<AgentArtifact>(owner, "agent-artifacts");
    const mine = artifacts.filter((a) => a.taskId === taskId);
    for (const artifact of mine) {
      // STABLE_ARTIFACT_SOURCE ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â artifact.id ya es hash(taskId:key), asi que el source
      // cambia al reejecutar el SOP. Usar el id del artifact solo, sin el taskId, hace
      // la ingesta idempotente entre reejecuciones.
      const sourceId = `artifact:${artifact.id}`;
      const text = [artifact.title, artifact.summary, JSON.stringify(artifact.data)]
        .filter((x) => typeof x === "string" && x.trim())
        .join("\n\n")
        .slice(0, 200_000);
      if (!text.trim()) continue;
      try {
        await this.rag.ingestText(owner, sourceId, artifact.title, text);
      } catch (error) {
        backgroundFailure(`rag ingest ${sourceId}`, error);
      }
    }
    return mine.length;
  }
  async learn(owner: string, task: AgentTask, facts: string[]) {
    return this.learning.learn(owner, task, facts);
  }
  async finish(owner: string, task: AgentTask, context: TaskContext, result: string) {
    await context.guard();
    if (task.artifactIds.length === 0 && task.evidence.length === 0)
      throw new Error("Cannot mark a task succeeded without an artifact or evidence");
    // MATERIALIZE_ENTITY_ON_FINISH_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â materializamos una entidad de negocio
    // por cada artifact creado, para que el grafo se alimente solo.
    if (this.graph) {
      try {
        const { BusinessGraph } = await import("./business/graph.ts");
        const g = this.graph as InstanceType<typeof BusinessGraph>;
        for (const artifactId of task.artifactIds) {
          const artifact = await this.db.get<{
            id: string;
            taskId: string;
            kind: string;
            title: string;
            summary: string;
          }>(owner, "agent-artifacts", artifactId);
          if (!artifact) continue;
          const existingId = `artifact:${artifact.id}`;
          const found = await g.getEntity(owner, existingId);
          if (found) continue;
          await g.createEntity(owner, {
            id: existingId,
            type: "artifact",
            name: artifact.title.slice(0, 300),
            status: "completed",
            properties: {
              kind: artifact.kind,
              summary: artifact.summary.slice(0, 2000),
              taskId: artifact.taskId,
            },
            actor: `task:${task.id}`,
            source: "task.finish",
          });
        }
      } catch {
        /* best-effort, no rompe el finish */
      }
    }
    await context.event("result", "Work completed", result);
    return {
      status: "succeeded" as const,
      result,
      plan: task.plan.map((s) => ({ ...s, status: "succeeded" as const })),
    };
  }
  /**
   * MAINTAIN_SOP_OWNER_V1 - resuelve el owner de un SOP.
   *
   * Hoy hay un solo owner por deployment. Este helper aisla el problema:
   * cuando multi-tenant llegue, se sustituye por una lectura real del owner
   * del SOP (por ejemplo, el SOP guarda owner en su state).
   *
   * Devuelve undefined si no encuentra owner, y el caller salta el SOP.
   */
  // RESOLVE_SOP_OWNER_DOC_V1 - metodo legacy documentado.
  private async resolveSopOwner(sop: SOP): Promise<string | undefined> {
    // RESOLVE_SOP_OWNER_STATE_V1 - antes cogia el primer owner de
    // agent-settings, lo cual en multi-tenant hace que todos los SOPs se
    // evalÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºen bajo el mismo owner (el primero que aparezca). Ahora, si el
    // SOP lleva owner en su state (porque se provisionÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³ con uno), se usa
    // ese. Si no, se cae al comportamiento previo para no romper single-tenant.
    const ownerFromState = (sop as unknown as { state?: { owner?: string } }).state?.owner;
    if (typeof ownerFromState === "string" && ownerFromState.length > 0) {
      return ownerFromState;
    }
    const first = await this.db.scan<{ id: string }>("agent-settings", 1);
    return first[0]?.owner;
  }
  /**
   * KERNEL_PROMOTE_PERSIST_V1 - escribe los destinos "memory" de un PromotionResult.
   *
   * El kernel ya escribe audit internamente. Business graph se escribe desde
   * finish() (MATERIALIZE_ENTITY_ON_FINISH_V1). Lo que faltaba era el destino
   * "memory": el Promoter decia que un thought iba a memoria y nadie lo escribia.
   *
   * Este metodo cierra ese hueco.
   */
  async persistPromotionDestinations(
    owner: string,
    ctx: KernelContext,
    turnId: string,
    destinations: { memory: string[]; businessGraph?: string[] },
    sourcePrefix: string,
  ): Promise<void> {
    if (!this.kernel) return;
    // PERSIST_GRAPH_DESTINATION_V1 - si el Promoter decidio que un thought
    // va al business graph, lo creamos como entidad "artifact" para que el
    // grafo se alimente tambien desde el chat, no solo desde finish().
    if (destinations.businessGraph?.length && this.graph) {
      try {
        const thoughts = await this.kernel.thoughtsOf(ctx, turnId);
        for (const thoughtId of destinations.businessGraph) {
          const thought = thoughts.find((th) => th.id === thoughtId);
          if (!thought) continue;
          const text =
            typeof thought.content === "string"
              ? thought.content
              : JSON.stringify(thought.content);
          if (!text.trim()) continue;
          const entityId = `thought:${thought.id}`;
          const found = await this.graph.getEntity(owner, entityId).catch(() => null);
          if (found) continue;
          await this.graph.createEntity(owner, {
            id: entityId,
            type: "artifact",
            name: text.slice(0, 300),
            status: "observed",
            properties: { role: thought.role, turnId },
            actor: `${sourcePrefix}:${thought.role}`,
            source: sourcePrefix,
          });
        }
      } catch {
        // KERNEL_NONFATAL_V1
      }
    }
    if (destinations.memory.length === 0) return;
    try {
      const thoughts = await this.kernel.thoughtsOf(ctx, turnId);
      for (const memoryId of destinations.memory) {
        const thought = thoughts.find((th) => th.id === memoryId);
        if (!thought) continue;
        const memoryText =
          typeof thought.content === "string"
            ? thought.content
            : JSON.stringify(thought.content);
        if (!memoryText.trim()) continue;
        await this.memory
          .remember(owner, memoryText, {
            source: `${sourcePrefix}:${thought.role}`,
            category: "proceso",
          })
          .catch(() => {});
      }
    } catch {
      // KERNEL_NONFATAL_V1 - no puede romper el finish.
    }
  }
  // MAINTAIN_TENANT_CURSOR_V1 - devuelve tenants activos.
  private async collectActiveTenants(): Promise<string[]> {
    // COLLECT_TENANTS_VIA_MEMBERSHIP_V1 - antes escaneaba agent-settings
    // (hasta 2000 filas) y resolvia el tenant uno a uno. Con 5000 owners,
    // se leian 2000 y se ignoraban 3000. Ahora leemos directamente de
    // tenant-membership, que tiene una fila por tenant y es O(tenants).
    const set = new Set<string>();
    try {
      // COLLECT_TENANTS_PREFIX_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â usa scanByOwnerPrefix si el store lo
      // soporta. En TenantScopedStore, el scan peela el prefijo, asÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­ que
      // el owner que devuelve ya es el tenantId limpio.
      // Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
      const tenantScoped = this.db as unknown as {
        allTenantPrefixes?: () => string[];
      };
      if (typeof tenantScoped.allTenantPrefixes === "function") {
        for (const prefix of tenantScoped.allTenantPrefixes()) {
          set.add(prefix);
          if (set.size >= 1000) break;
        }
      }
      const rows = await this.db.scan<{ tenantId?: string }>("tenant-membership", 5000);
      for (const { value } of rows) {
        if (typeof value.tenantId === "string" && value.tenantId.length > 0) {
          set.add(value.tenantId);
        }
      }
    } catch {
      // Fallback al comportamiento previo si tenant-membership no existe.
      for (const { owner } of await this.db.scan<{ id: string }>("agent-settings", 500)) {
        const tenantId = await this.tenantService?.tenantIdFor(owner) ?? "default";
        set.add(tenantId);
        if (set.size >= 500) break;
      }
    }
    if (set.size === 0) set.add("default");
    return [...set];
  }

  // SERVICE_ALERTS_V1 - genera notificaciones cuando un tenant supera umbrales.
  private async checkTenantAlerts(tenantId: string): Promise<void> {
    // CHECK_TENANT_ALERTS_OWNER_FIX_V1 - antes `owner = tenantId`, lo cual
    // mezclaba conceptos: notify escribia bajo el tenantId como si fuera
    // owner. Ahora notificamos a cada owner del tenant individualmente. El
    // scan de owners se reutiliza y la alerta va a cada uno (los owners
    // son los que reciben notificaciones en la app).
    const now = Date.now();
    const failed = await this.db.scanByStatus<AgentTask>("tasks", ["failed"], 200);
    const owners: string[] = [];
    for (const { owner: o } of await this.db.scan<{ id: string }>("agent-settings", 500)) {
      const oTenant = await this.tenantService?.tenantIdFor(o) ?? "default";
      if (oTenant === tenantId) owners.push(o);
      if (owners.length >= 50) break;
    }
    const myFailed = failed.filter((r) => owners.includes(r.owner));
    const recentFailed = myFailed.filter(
      (r) => now - Date.parse(r.value.updatedAt) < 3600000,
    );
    if (recentFailed.length >= 10) {
      // Avisamos a cada owner del tenant por separado.
      for (const targetOwner of owners) {
        await this.notify(
          targetOwner,
          "Muchas tareas fallidas",
          `${recentFailed.length} tareas fallidas en tu tenant en la ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºltima hora.`,
          undefined,
          `alert-failed:${tenantId}:${targetOwner}:${Math.floor(now / 3600000)}`,
        ).catch(() => {});
      }
    }
  }

  // MAINTAIN_TENANT_REAL_V1 - resuelve owners del tenant y pagina por cada uno.
  private async maintainTenant(tenantId: string): Promise<void> {
    // MAINTAIN_TENANT_PREFIX_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â usa scanByPrefix si el store lo tiene.
    // Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
    const owners: string[] = [];
    const withPrefix = this.db as unknown as {
      scanByPrefix?: <T>(
        kind: string,
        tenantId: string,
        limit: number,
      ) => Promise<{ owner: string; value: T }[]>;
    };
    const rows =
      typeof withPrefix.scanByPrefix === "function"
        ? await withPrefix.scanByPrefix<{ id: string }>("agent-settings", tenantId, 50)
        : await this.db.scan<{ id: string }>("agent-settings", 500).then((all) =>
            all.filter((r) => r.owner.startsWith(`${tenantId}:`) || r.owner === tenantId),
          );
    for (const { owner } of rows) {
      const ownerTenant = await this.tenantService?.tenantIdFor(owner) ?? "default";
      if (ownerTenant === tenantId) owners.push(owner);
      if (owners.length >= 50) break;
    }
    for (const owner of owners) {
      await this.maintainOwner(owner).catch((error) =>
        backgroundFailure("maintain owner " + owner, error),
      );
    }
  }

  // MAINTAIN_TENANT_REAL_V1 - pagina tareas terminales por owner.
  // MAINTAIN_CURSOR_KIND_FIX_V1 - antes se guardaba el cursor bajo "system"
  // con un campo `id2` para no chocar con el `id` del record. Al leer,
  // `cursor.id` devolvia la cursorKey, no el id real del ultimo record, y
  // el cursor keyset no avanzaba: cada pasada volvia a empezar del mismo
  // sitio. Ahora vive en su propio kind "maintain-cursor" con su id natural.
  private async maintainOwner(owner: string): Promise<void> {
    const cursorKey = "maintain-owner";
    const cursor = await this.db.get<{ lastUpdatedAt: string; lastId: string }>(
      owner,
      "maintain-cursor",
      cursorKey,
    );
    const page = await this.db.scanByStatusWithCursor<AgentTask>(
      "tasks",
      ["succeeded", "failed", "waiting_input", "waiting_approval", "scheduled"],
      200,
      cursor?.lastUpdatedAt,
      cursor?.lastId,
    );
    for (const record of page) {
      await this.publishOutcome(record.owner, record.value).catch((error) =>
        backgroundFailure("publish outcome " + record.value.id, error),
      );
    }
    const last = page[page.length - 1];
    if (last) {
      await this.db.put(owner, "maintain-cursor", {
        id: cursorKey,
        lastUpdatedAt: last.updatedAt,
        lastId: last.id,
      });
    }
  }

  private async maintainTenantLegacy(tenantId: string): Promise<void> {
    const owner = tenantId;
    const cursorKey = `maintain-cursor-${tenantId}`;
    const cursor = await this.db.get<{ updatedAt: string; id: string }>(
      "system",
      "maintenance",
      cursorKey,
    );
    const page = await this.db.scanByStatusWithCursor<AgentTask>(
      "tasks",
      ["succeeded", "failed", "waiting_input", "waiting_approval", "scheduled"],
      200,
      cursor?.updatedAt,
      cursor?.id,
    );
    for (const record of page) {
      await this.publishOutcome(record.owner, record.value).catch((error) =>
        backgroundFailure(`publish outcome ${record.value.id}`, error),
      );
    }
    const last = page[page.length - 1];
    if (last) {
      await this.db.put("system", "maintenance", {
        id: cursorKey,
        updatedAt: last.updatedAt,
        id2: last.id,
      });
    }
    void owner;
  }

  private async publishOutcome(owner: string, saved: AgentTask) {
    const task = await this.getTask(owner, saved.id);
    const bus = this.bus;
    if (bus) {
      const src = { kind: "task" as const, id: task.id };
      if (task.status === "succeeded")
        await bus.emit(owner, "task.completed", src, {
          taskId: task.id,
          title: task.title.slice(0, 200),
          ...(task.result ? { result: task.result.slice(0, 2000) } : {}),
        });
      else if (task.status === "failed")
        await bus.emit(owner, "task.failed", src, {
          taskId: task.id,
          title: task.title.slice(0, 200),
          ...(task.error ? { error: task.error.slice(0, 2000) } : {}),
        });
      else if (task.status === "waiting_input")
        await bus.emit(owner, "task.waiting_input", src, {
          taskId: task.id,
          title: task.title.slice(0, 200),
          ...(task.question ? { question: task.question.slice(0, 2000) } : {}),
        });
      else if (task.status === "waiting_approval")
        await bus.emit(owner, "task.waiting_approval", src, {
          taskId: task.id,
          title: task.title.slice(0, 200),
        });
    }
    if (task.status === "succeeded") {
      await this.notify(
        owner,
        task.title,
        task.result ?? "Work completed",
        task.id,
        `task-done:${task.id}`,
      );
      if (task.goalId) {
        for (let attempt = 0; attempt < 8; attempt++) {
          const goal = await this.db.get<Goal>(owner, "goals", task.goalId);
          if (!goal || goal.milestones.some((m) => m.id === task.id)) break;
          if (
            await this.db.compareAndSwap(
              owner,
              "goals",
              goal.id,
              { milestones: goal.milestones },
              {
                milestones: [...goal.milestones, { id: task.id, title: task.title, done: true }],
              },
            )
          )
            break;
        }
      }
    } else if (task.status === "failed") {
      await this.notify(
        owner,
        "Task needs attention",
        task.error ?? task.title,
        task.id,
        `task-error:${task.id}:${task.attempts}`,
      );
    } else if (task.status === "waiting_input") {
      await this.notify(
        owner,
        "Your details are needed",
        task.question ?? task.title,
        task.id,
        `input:${task.id}:${hash(task.question ?? "")}`,
      );
    } else if (task.status === "waiting_approval") {
      await this.notify(
        owner,
        "Ready for your review",
        task.title,
        task.id,
        `review:${task.actionId}`,
      );
    }
    const notice = z
      .object({ title: z.string(), body: z.string(), key: z.string() })
      .safeParse(task.state.notice);
    if ((task.status === "scheduled" || (task.status === "paused" && task.error)) && notice.success)
      await this.notify(owner, notice.data.title, notice.data.body, task.id, notice.data.key);
  }
  private async document(
    owner: string,
    task: AgentTask,
    ctx: TaskContext,
  ): Promise<Partial<AgentTask>> {
    let source = task.state.source as { mail: Mail; fileId: string } | undefined;
    if (!source) {
      const w = await this.workspace.snapshot(owner);
      const mail = w.mail.find((m) => m.id === task.input.messageId);
      if (!mail) throw new Error("Choose a current email with a PDF attachment to start this task");
      const ref = mail.attachments[0];
      if (!ref) throw new Error("This email has no PDF attachment");
      await ctx.guard();
      let file: Artifact;
      try {
        file = await this.files.get(owner, ref);
      } catch (error) {
        if (!(error instanceof AppError && error.status === 404)) throw error;
        file = await this.workspace.importAttachment(owner, ref);
      }
      source = { mail, fileId: file.id };
      task = await ctx.checkpoint({
        state: { ...task.state, source },
        evidence: [this.mailEvidence(mail)],
        plan: task.plan.map((s, i) => ({ ...s, status: i === 0 ? "succeeded" : "pending" })),
      });
      await ctx.event("step", "Found the document", file.name);
    }
    const fields = z
      .record(z.string(), z.union([z.string(), z.boolean()]))
      .optional()
      .parse(task.input.fields);
    if (!fields || !Object.keys(fields).length) {
      const file = await this.files.get(owner, source.fileId);
      const names = file.fields
        ?.filter((f) => f.type !== "unsupported")
        .map((f) => f.name)
        .join(", ");
      if (!names)
        throw new Error(
          "This PDF has no supported fillable fields. Open it in Files to review it.",
        );
      return {
        status: "waiting_input",
        question: `Enter the form values you want to use. Supported fields: ${names}. The original PDF will stay intact.`,
        state: {
          ...task.state,
          source,
          missingFields: file.fields?.filter((f) => f.type !== "unsupported"),
        },
      };
    }
    let filledId = typeof task.state.filledId === "string" ? task.state.filledId : undefined;
    if (!filledId) {
      await ctx.guard();
      const filled = await this.files.fill(owner, source.fileId, fields);
      filledId = filled.id;
      task = await ctx.checkpoint({
        state: { ...task.state, source, filledId },
        artifactIds: [filledId],
        plan: task.plan.map((s, i) => ({ ...s, status: i <= 1 ? "succeeded" : "pending" })),
      });
      await ctx.event("step", "Saved a filled copy", filled.name);
    }
    const input: ProposalInput = {
      kind: "email.send",
      data: {
        to: [source.mail.from],
        cc: [],
        bcc: [],
        subject: /^re:/i.test(source.mail.subject)
          ? source.mail.subject
          : `Re: ${source.mail.subject}`,
        body:
          typeof task.input.reply === "string"
            ? task.input.reply
            : "Hello,\n\nPlease find the completed form attached.\n\nThank you.",
        attachmentIds: [filledId],
        threadId: source.mail.threadId,
        replyToMessageId: source.mail.id,
      },
    };
    const proposal = await this.prepare(owner, task, input, "document-reply", ctx);
    return {
      status: "waiting_approval",
      actionId: proposal.id,
      plan: task.plan.map((s, i) => ({
        ...s,
        status: i < 3 ? "succeeded" : i === 3 ? "waiting" : "pending",
      })),
    };
  }
  private async observe(
    owner: string,
    task: AgentTask,
    ctx: TaskContext,
  ): Promise<Partial<AgentTask>> {
    const monitor = await this.db.get<Monitor>(owner, "monitors", String(task.input.monitorId));
    if (!monitor) throw new Error("Monitor not found");
    if (monitor.status !== "active")
      return { status: monitor.status === "paused" ? "paused" : "cancelled" };
    let observation: { url: string; title: string; text: string; sessionId?: string };
    if (monitor.url === "sample://availability") {
      if (this.config.mode !== "sample") throw new Error("Sample source unavailable");
      const page = await this.db.get<{ text: string }>(owner, "sample-pages", "availability");
      observation = {
        url: monitor.url,
        title: "Sample dinner availability",
        text: page?.text ?? "No tables available. Check again later.",
      };
    } else {
      await ctx.guard();
      observation = await this.browser.observe(
        owner,
        monitor.url,
        typeof task.state.sessionId === "string" ? task.state.sessionId : undefined,
      );
    }
    const text = observation.text.replace(/\s+/g, " ").trim();
    const currentHash = hash(text);
    const previousHash = monitor.lastHash;
    const matched =
      monitor.condition === "change"
        ? Boolean(previousHash && previousHash !== currentHash)
        : monitor.condition === "contains"
          ? text.toLowerCase().includes(monitor.value.toLowerCase())
          : this.matchesPrice(text, Number(monitor.value));
    const previouslyMatched = Boolean(task.state.matched);
    const shouldNotify = matched && (monitor.condition === "change" || !previouslyMatched);
    const nextCheckAt = new Date(Date.now() + monitor.intervalMinutes * 60000).toISOString();
    await ctx.guard();
    // Worker lease is checked before each publication; monitor control also invalidates that lease.
    const savedMonitor = await this.db.compareAndSwap(
      owner,
      "monitors",
      monitor.id,
      { status: "active" },
      {
        checks: monitor.checks + 1,
        lastCheckedAt: date(),
        lastHash: currentHash,
        lastValue: text.slice(0, 1000),
        nextCheckAt,
        error: null,
      },
    );
    if (!savedMonitor) throw new LostLeaseError();
    await ctx.event(
      "observation",
      previousHash ? "Checked for changes" : "Saved the first observation",
      text.slice(0, 1000),
    );
    await ctx.busEvent("monitor.check", {
      monitorId: monitor.id,
      url: monitor.url.slice(0, 2000),
      matched,
    });
    if (shouldNotify) {
      await ctx.guard();
      await ctx.event("result", "A meaningful change was found", text.slice(0, 500));
      await ctx.busEvent("monitor.changed", {
        monitorId: monitor.id,
        url: monitor.url.slice(0, 2000),
        excerpt: text.slice(0, 1000),
      });
    }
    return {
      status: "scheduled",
      nextRunAt: nextCheckAt,
      result: shouldNotify
        ? "Change found. A notification is ready."
        : "Watching. I'll check again on schedule.",
      state: {
        ...task.state,
        sessionId: observation.sessionId,
        matched,
        failures: 0,
        notice: shouldNotify
          ? {
              title: monitor.title,
              body: `Condition met at ${observation.url}: ${text.slice(0, 240)}`,
              key: `monitor:${monitor.id}:${currentHash}`,
            }
          : null,
      },
      error: null,
      evidence: [
        {
          id: monitor.id,
          kind: "web",
          title: observation.title,
          url: observation.url,
          excerpt: text.slice(0, 600),
        },
      ],
      plan: task.plan.map((s) => ({ ...s, status: "succeeded" })),
    };
  }
  /**
   * MATCHES_PRICE_V2 - detecta precios en varias monedas y formatos.
   *
   * Cierra #191 y #192: antes solo pillaba "$" y "USD" con formato en-US
   * ("1,234.56"). Ahora tambien:
   *   - EUR: "EUR" o el simbolo del euro
   *   - GBP: "GBP" o el simbolo de la libra
   *   - YEN: "JPY" o el simbolo del yen
   *   - Formato europeo: "1.234,56"
   *   - Formato US: "1,234.56"
   *   - Sufijo: "349 EUR", "1.234,56"
   *
   * Nota honesta: solo compara el numero con el threshold. NO convierte
   * monedas. Si el threshold es en EUR y el texto dice "100 USD", compara
   * 100 contra el threshold sin tipo de cambio.
   */
  private matchesPrice(text: string, threshold: number) {
    // MATCHES_PRICE_PARSE_V1 - reconocimiento multi-moneda y multi-formato.
    const currencyPrefix =
      "(?:\\$|\\u20AC|\\u00A3|\\u00A5|USD\\s*|EUR\\s*|GBP\\s*|JPY\\s*|\\bUSD\\b|\\bEUR\\b|\\bGBP\\b|\\bJPY\\b)";
    const currencySuffix =
      "(?:\\s*(?:\\$|\\u20AC|\\u00A3|\\u00A5|USD|EUR|GBP|JPY|\\busd\\b|\\beur\\b|\\bgbp\\b|\\bjpy\\b))?";
    const numberPattern = "(\\d{1,3}(?:[.,]\\d{3})*(?:[.,]\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?)";
    const re = new RegExp(`${currencyPrefix}\\s*${numberPattern}${currencySuffix}`, "gi");
    const matches = [...text.matchAll(re)];
    return matches.some((m) => this.parsePriceNumber(m[1]) < threshold);
  }

  /**
   * MATCHES_PRICE_PARSE_V1 - parsea el numero detectado al valor numerico.
   *
   * Reglas:
   *   - Si tiene "," y "." juntos, la ultima que aparece es el separador decimal.
   *     "1.234,56" -> 1234.56 (europeo)
   *     "1,234.56" -> 1234.56 (US)
   *   - Si solo tiene ",", la tratamos como decimal si el resto despues de la
   *     coma tiene 1 o 2 digitos: "12,50" -> 12.5. Si tiene 3 digitos despues,
   *     es separador de miles: "1,234" -> 1234.
   *   - Si solo tiene ".", mismo criterio.
   *   - Si no tiene nada, parse directo.
   */
  private parsePriceNumber(raw: string): number {
    const s = raw.trim();
    // PARSE_PRICE_VALIDATE_FIX_V1 - antes "1.5.5" o "1,2,3" pasaban y se
    // interpretaban silenciosamente mal ("155" o "123"). Ahora si no encaja
    // con los patrones conocidos, devolvemos NaN. El caller compara con
    // threshold y NaN < x es siempre false, asi que la alerta no se dispara
    // con un precio malformado (fail-safe).
    const validPattern = /^\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?$|^\d+(?:[.,]\d{1,2})?$/;
    if (!validPattern.test(s)) return Number.NaN;
    const hasComma = s.includes(",");
    const hasDot = s.includes(".");
    if (hasComma && hasDot) {
      const lastComma = s.lastIndexOf(",");
      const lastDot = s.lastIndexOf(".");
      if (lastComma > lastDot) {
        return Number(s.replace(/\./g, "").replace(",", "."));
      }
      return Number(s.replace(/,/g, ""));
    }
    if (hasComma) {
      const parts = s.split(",");
      if (parts.length === 2 && parts[1].length <= 2) {
        return Number(`${parts[0]}.${parts[1]}`);
      }
      return Number(s.replace(/,/g, ""));
    }
    if (hasDot) {
      const parts = s.split(".");
      if (parts.length === 2 && parts[1].length <= 2) {
        return Number(s);
      }
      return Number(s.replace(/\./g, ""));
    }
    return Number(s);
  }
}

