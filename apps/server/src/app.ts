// EVENTBUS_APP_WIRE_V1
import { randomUUID, timingSafeEqual } from "node:crypto";
import { getConnInfo } from "@hono/node-server/conninfo";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MessageSchema } from "@ag-ui/core";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono, type Context } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { z } from "zod";
import { emailDraftSchema, proposalSchema } from "../../../packages/domain/src/index.ts";
import { ActionService } from "./actions.ts";
import { agentConfigured, makeRuntime } from "./agent.ts";
import { createAuth } from "./auth.ts";
// APP_TENANT_DB_V1 - envuelve el store con aislamiento por tenant.
import { TenantScopedStore } from "./db-tenant.ts";
import { BrowserService } from "./browser.ts";
import { ComputerService, type DockerRunner } from "./computer.ts";
import { computerRoutes } from "./computer-routes.ts";
import type { Config } from "./config.ts";
import type { Store } from "./db.ts";
import { agentRoutes } from "./engine/routes.ts";
import { skillsRoutes } from "./skills/routes.ts";
import { sopRoutes } from "./skills/sop-routes.ts";
import { AgentService } from "./engine/service.ts";
import { EventBus } from "./engine/events/index.ts";
import { eventsRoutes } from "./events-routes.ts";
import { AppError } from "./errors.ts";
import { RateLimiter } from "./rate-limit.ts";
import { requestLogger } from "./middleware/request-logger.ts";
import { logContext } from "./log.ts";
import { Files } from "./files.ts";
import { GoogleAuth } from "./google-auth.ts";
import { WorkspaceService } from "./workspace.ts";
import { UserService } from "./users.ts";
import { authRoutes } from "./auth-routes.ts";
import { RagService } from "./engine/rag.ts";
import { ragRoutes } from "./rag-routes.ts";
import { threadRoutes } from "./threads-routes.ts";
import { projectRoutes } from "./projects-routes.ts";
import { PersonaRegistry, bootstrapPersonas } from "./engine/agents/personas/index.ts";
// WS_ENGINE_WIRE_V1 - import del catalogo de workspaces y del engine de workspaces.
import { ALL_WORKSPACES } from "../../../packages/workspaces/src/index.ts";
import { WorkspaceModuleRegistry, bridgeWorkspaceCapabilities, WorkspaceDispatcher } from "./engine/workspaces/index.ts";
import { personasRoutes } from "./engine/agents/personas/routes.ts";
import {
  Kernel,
  EnvTenantConfigResolver,
  StoreTurnStore,
  StoreAuditStore,
  // SERVICE_TENANT_RESOLVER_WIRE_V1 - adapter que delega en TenantService.
  ServiceTenantResolver,
} from "./kernel/index.ts";
// REFACTOR_REMOVE_DEFAULT_RESOLVER_V1 - DefaultTenantResolver ya no se usa aqui.
// ENGINE_TENANT_V1 - punto unico de resolucion de tenant.
import { TenantService } from "./engine/tenant.ts";

export async function createApp(
  db: Store,
  config: Config,
  options: { docker?: DockerRunner } = {},
) {
  // SERVICE_TENANT_DB_V2 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â creamos primero TenantService y tdb, luego el
// resto de servicios con tdb. Antes se construÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­an con `db` crudo, asÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­ que
// Files/Rag/Workspace escribÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­an con clave plana mientras el resto leÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a
// con clave `tenantId:owner`. Los artifacts no aparecÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­an en agent.detail().
  // Ver: docs/KNOWN_ISSUES.md FASE0_DEBT_FILES_TDB_V1 y
  // docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
  const tenantServiceEarly = new TenantService(db, config);
  const tdbEarly = new TenantScopedStore(db, (owner) => tenantServiceEarly.tenantIdFor(owner));
  const auth = await createAuth(db, config),
    files = new Files(tdbEarly, config, auth),
    google = new GoogleAuth(db, config),
    users = new UserService(db),
    rag = new RagService(tdbEarly),
    workspace = new WorkspaceService(tdbEarly, config, files, google, rag);
  // APP_TENANT_DB_V1 - store con aislamiento por tenant. Se crea antes que el bus
  // porque el bus tambien escribe bajo este store y debe componer la clave de tenant.
  // SERVICE_TENANT_DB_V2 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â reutilizamos los creados arriba.
  const tenantService = tenantServiceEarly;
  const tdb = tdbEarly;
  // PERSONAS_WIRE_V1 - registry de personas del tenant. Se carga al arrancar
  // desde clientes/<tenant>/personas/*.json. Fail-soft: si un JSON no valida,
  // ese se salta.
  const personaRegistry = new PersonaRegistry();
  {
    const clientsDir = process.env.OPENMUSE_CLIENTS_DIR ?? "clientes";
    // LAIA_BOOTSTRAP_EXAMPLE_V1 - carga tambien el tenant _example para que
    // Laia (que vive ahi) entre en el registry bajo "default".
    void Promise.all([
      bootstrapPersonas(personaRegistry, "default", clientsDir),
      bootstrapPersonas(personaRegistry, "default", "clientes/_example"),
    ]).then(([r1, r2]) => {
      const loaded = r1.loaded + r2.loaded;
      const failed = r1.failed + r2.failed;
      if (loaded > 0 || failed > 0) {
        console.log(`[personas] tenant default: ${loaded} cargadas, ${failed} fallidas`);
      }
    }).catch(() => {});
  }
  // BUSINESS_OS_FIXED_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â bus declarado antes de los servicios que lo usan.
  const bus = new EventBus(tdb);
  // POLICY_EARLY_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â policy se necesita antes del ActionService, asi que se instancia aqui.
  const { PolicyEngine: PolicyEngineEarly } = await import("./engine/policy/engine.ts");
  const policy = new PolicyEngineEarly(bus);
  const actions = new ActionService(db, {
    execute: (owner, input, connectionId, targetVersion) =>
      workspace.execute(owner, input, connectionId, targetVersion),
    prepare: (owner, input, connectionId) => workspace.prepare(owner, input, connectionId),
    connected: (owner) => workspace.connected(owner),
    connection: (owner) => workspace.connection(owner),
  }, bus, policy);
  const browser = new BrowserService(db, config, auth, files);
  const { BusinessGraph } = await import("./engine/business/graph.ts");
  const { BusinessTruth } = await import("./engine/business/truth.ts");
  const { PolicyEngine } = await import("./engine/policy/engine.ts");
  const { StateMachineEngine } = await import("./engine/policy/state-machine.ts");
  const { ContextEngine } = await import("./engine/context/engine.ts");
  const { AgentRuntimeManager } = await import("./engine/agents/runtime.ts");
  const { AgentGovernance } = await import("./engine/agents/governance.ts");
  const { WorkspaceRegistry } = await import("./engine/workspace/registry.ts");
  const { SkillMarketplace } = await import("./engine/skills/marketplace.ts");
  const { MemoryService } = await import("./engine/memory.ts");
  const { StateMachineRegistry } = await import("./engine/state-machines.ts");
  const graph = new BusinessGraph(db, bus);
  const truth = new BusinessTruth(graph);
  // policy ya se creo arriba (POLICY_EARLY_V1).
  const stateMachine = new StateMachineEngine(bus, {
    getStatus: async (owner, entityId) => (await graph.getEntity(owner, entityId))?.status,
  });
  const agentRuntime = new AgentRuntimeManager(bus);
  // RUNTIME_SWEEP_WIRE_V1 - cablea AgentRuntimeManager.sweep (RUNTIME_SWEEP_V1):
  // cada 60s cierra runtimes activos con mas de 5 min sin completarse.
  const runtimeSweepTimer = setInterval(() => {
    void agentRuntime.sweep().catch(() => {});
  }, 60_000);
  runtimeSweepTimer.unref?.();
  const governance = new AgentGovernance(policy, bus);
  const workspaceRegistry = new WorkspaceRegistry();
  const marketplace = new SkillMarketplace(db);
  const memory = new MemoryService(db, rag);
  const context = new ContextEngine(db, graph, memory, bus);
  const stateMachines = new StateMachineRegistry(db, stateMachine, bus);
  const computer = new ComputerService(db, config, options.docker);
  // KERNEL_WIRE_B_V1 - kernel cognitivo.
  //
  // Stores:
  //   - Sin DATABASE_URL: in-memory (dev, tests, single-process).
  //   - Con DATABASE_URL: StoreTurnStore + StoreAuditStore persistentes.
  //     Esto es lo que necesita SOC-2 en produccion.
  //
  // El adapter StorePort mapea Store a la interfaz que esperan los stores
  // del kernel. Asi el kernel no depende de la firma exacta de Store.
  const usePersistentKernel = Boolean(config.databaseUrl);
  const storePort = usePersistentKernel
    ? {
        put: async (tenantId: string, kind: string, _id: string, data: unknown) => {
          await db.put(tenantId, kind, data as { id: string });
        },
        get: async (tenantId: string, kind: string, id: string) => {
          return db.get(tenantId, kind, id);
        },
        list: async (tenantId: string, kind: string, limit: number) => {
          const rows = await db.listPaged<unknown>(tenantId, kind, { limit });
          return rows.map((row) => ({ id: (row.data as { id: string }).id, data: row.data }));
        },
        transaction: async <T>(fn: (tx: never) => Promise<T>): Promise<T> =>
          db.transaction(() => fn(storePort as never)),
      }
    : null;
  // KERNEL_STORE_ALWAYS_V1 - antes el kernel usaba InMemoryTurnStore cuando
  // no habia DATABASE_URL. Eso hacia que en dev/test/sample todo el trabajo
  // del kernel (turnos, thoughts, audit) se perdiera al reiniciar, y que la
  // vision de "kernel persistente" fuera falsa. Ahora SIEMPRE StoreTurnStore
  // apoyado en el mismo Store que el resto del sistema. InMemoryTurnStore
  // queda solo para tests que lo instancian a mano.
  const persistentStorePort = storePort ?? {
    put: async (tenantId: string, kind: string, _id: string, data: unknown) => {
      await db.put(tenantId, kind, data as { id: string });
    },
    get: async (tenantId: string, kind: string, id: string) => db.get(tenantId, kind, id),
    list: async (tenantId: string, kind: string, limit: number) => {
      const rows = await db.listPaged<unknown>(tenantId, kind, { limit });
      return rows.map((row) => ({ id: (row.data as { id: string }).id, data: row.data }));
    },
    transaction: async <T>(fn: (tx: never) => Promise<T>): Promise<T> =>
      db.transaction(() => fn(persistentStorePort as never)),
  };
  const kernel = new Kernel({
    store: new StoreTurnStore(persistentStorePort),
    // SERVICE_TENANT_RESOLVER_WIRE_V1 - en vez de DefaultTenantResolver, usamos
    // ServiceTenantResolver que delega en TenantService. Sin esto, el kernel
    // ignoraba el tenantId del contexto y escribia todo en "default".
    tenants: new ServiceTenantResolver(tenantService),
    // AUDIT_STORE_ALWAYS_V1 - mismo razonamiento que KERNEL_STORE_ALWAYS_V1:
    // StoreAuditStore siempre. La cadena de hash se persiste.
    audit: new StoreAuditStore(db),
    config: new EnvTenantConfigResolver(),
  });
  // WS_ENGINE_WIRE_V1 - cablea el catalogo de workspaces al engine.
  const workspaceModuleRegistry = new WorkspaceModuleRegistry();
  workspaceModuleRegistry.registerAll(ALL_WORKSPACES);
  const workspaceCapabilityRegistry = new (await import("./engine/capabilities/registry.ts")).CapabilityRegistry();
  const workspaceCapabilitiesCount = bridgeWorkspaceCapabilities(workspaceCapabilityRegistry, workspaceModuleRegistry.list());
  const workspaceDispatcher = new WorkspaceDispatcher({ db: tdb, bus });
  console.log([workspaces]  workspaces,  capabilities);
    const agent = new AgentService(
    tdb,
    config,
    workspace,
    files,
    actions,
    browser,
    computer,
    rag,
    undefined,
    bus,
    { graph, truth, policy, stateMachine, stateMachineRegistry: stateMachines, context, runtime: agentRuntime, governance, workspaceRegistry, marketplace, kernel, tenantService, workspaceModuleRegistry, workspaceDispatcher }, // APP_RUNTIME_WIRE_V1
    // WS_ENGINE_DISPATCH_V1
  );
  // ONTOLOGY_VALIDATE_WIRE_V1 - valida el vocabulario del tenant contra el
  // metamodelo. Fail-soft: si falla, se loguea y se sigue.
  try {
    const { validateAgainstMetamodel } = await import("../../../packages/domain/src/ontology.ts");
    const { BASE_VOCABULARY } = await import("../../../packages/domain/src/ontology-seed.ts");
    const caps = await agent.capabilities.list();
    validateAgainstMetamodel({
      entityKinds: [],
      relationKinds: [],
      capabilityKinds: caps.map((c) => c.id),
      tenantScope: "default",
      baseVocabulary: BASE_VOCABULARY,
    });
    console.log(`[ontology] validado: ${caps.length} capabilities`);
  } catch (error) {
    console.warn("[ontology] validacion fallida:", error instanceof Error ? error.message : error);
  }

  // ONTOLOGY_BUNDLE_LOAD_V1 - bundle del tenant cargado al arrancar.
  try {
    const { readFile: readOntologyFile } = await import("node:fs/promises");
    const { join: joinOntology } = await import("node:path");
    // ONTOLOGY_BUNDLE_CLIENTSDIR_FIX_V1 - clientsDir vive en otro bloque; se recalcula aqui.
    const ontologyPath = joinOntology(process.env.OPENMUSE_CLIENTS_DIR ?? "clientes", "default", "ontology.json");
    const raw = await readOntologyFile(ontologyPath, "utf8").catch(() => null);
    if (raw) {
      const parsed = JSON.parse(raw);
      const { ontologyBundleSchema } = await import("../../../packages/domain/src/ontology.ts");
      ontologyBundleSchema.parse(parsed);
      console.log(`[ontology] bundle cargado: ${parsed.entities?.length ?? 0} entidades`);
    }
  } catch (error) {
    console.warn("[ontology] bundle no cargado:", error instanceof Error ? error.message : error);
  }

  const runtime = makeRuntime(config, agent, auth);
  const app = new Hono<{ Variables: { owner: string } }>();
  const origins = new Set([...config.allowedOrigins, new URL(config.publicUrl).origin]);
  /**
   * Prepara el workspace de un usuario ya autenticado. El sembrado de ejemplo vivia solo en
   * POST /api/session con el owner "local-user", asi que quien entraba por /api/auth/login
   * (owner = user.id) veia correo, calendario y acciones vacios. Es idempotente y memoizado
   * por owner dentro de WorkspaceService, asi que se puede llamar en cada login y en cada
   * carga del workspace sin coste repetido.
   */
  const ensureOwnerWorkspace = async (owner: string) => {
    await workspace.ensureSample(owner, actions);
    await agent.ensure(owner);
    if (config.mode === "sample") await agent.refreshIdeas(owner);
  };
  // REQUEST_LOGGER_WIRE_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â correlationId por request, logging estructurado.
  // Ver docs/audits/02-observabilidad/miniaudit.md ("Sin traceId").
  app.use("*", requestLogger());
  app.use("*", async (c, next) => {
    const origin = c.req.header("origin");
    if (origin && !origins.has(origin)) return c.json({ error: "Origin is not allowed" }, 403);
    c.header("X-Content-Type-Options", "nosniff");
    c.header("Referrer-Policy", "no-referrer");
    c.header("Cache-Control", "no-store");
    await next();
  });
  app.use(
    "*",
    cors({
      origin: (origin) => (origins.has(origin) ? origin : undefined),
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    }),
  );
  app.use(
    "*",
    bodyLimit({
      maxSize: 12 * 1024 * 1024,
      onError: (c) => c.json({ error: "Request is too large; PDFs must be 10 MB or smaller" }, 413),
    }),
  );
  app.onError((error, c) => {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string> = {};
      for (const issue of error.issues) {
        const path = issue.path.map((p) => String(p)).join(".");
        if (path) {
          if (!fields[path]) fields[path] = issue.message;
        } else if (!fields._error) {
          fields._error = issue.message;
        }
      }
      return c.json({ error: "Revisa los campos marcados", fields }, 422);
    }
    if (error instanceof AppError)
      return c.json(
        { error: error.message, ...(error.fields ? { fields: error.fields } : {}) },
        error.status,
      );
    if (error.name === "PdfError" || error.name === "RecurringEventError")
      return c.json({ error: error.message }, 422);
    if (error instanceof SyntaxError) return c.json({ error: "Invalid request data" }, 400);
    console.error(`[OpenMuse] ${error.name}`);
    return c.json(
      {
        error:
          error.name === "GoogleApiError"
            ? error.message
            : "Request failed. Check the server setup and try again.",
      },
      502,
    );
  });
  app.post("/api/whatsapp/incoming", async (c) => {
    const expected = process.env.WHATSAPP_WEBHOOK_TOKEN;
    if (!expected) throw new AppError("WhatsApp webhook no esta configurado", 503);
    const provided = c.req.header("apikey") ?? c.req.header("authorization")?.replace(/^Bearer /, "");
    // WHATSAPP_RATE_LIMIT ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â timingSafeEqual + rate limit por IP.
    const expectedBuf = Buffer.from(expected);
    const providedBuf = Buffer.from(provided ?? "");
    if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf))
      throw new AppError("Unauthorized", 401);
    const waLimiter = (globalThis as { __waLimiter?: RateLimiter }).__waLimiter ??= new RateLimiter(30, 60000);
    const waAddress = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    if (!waLimiter.take(waAddress).allowed)
      throw new AppError("Too many webhook calls", 429);
    const body = await c.req.json().catch(() => ({}));
    const data = (body as { data?: { key?: { id?: string; remoteJid?: string }; message?: { conversation?: string } } }).data;
    const id = data?.key?.id;
    const from = data?.key?.remoteJid;
    const text = data?.message?.conversation;
    if (!id || !from || !text) return c.json({ ok: true, ignored: true });
    const { retryWithBackoff } = await import("./engine/retry.ts");
    await retryWithBackoff(() => db.put("system", "whatsapp-incoming", {
      id,
      from,
      text: text.slice(0, 4000),
      receivedAt: new Date().toISOString(),
    }), { maxAttempts: 3, baseMs: 200, maxMs: 2000 });
    return c.json({ ok: true });
  });
  // R16 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â healthcheck profundo: comprueba DB (lectura + escritura idempotente),
  // que el bus pueda emitir, y el estado del worker. Devuelve 503 si algo falla,
  // para que Fly/Render sepan cuando reiniciar de verdad.
  app.get("/api/health-deep", async (c) => {
    // HEALTH_DEEP_V2
    const checks: Record<string, unknown> = { ok: true, backend: db.backend, time: new Date().toISOString() };
    // KERNEL_LIFECYCLE_WIRE_V1 - consulta el ciclo de vida del kernel.
    try {
      const { checkKernelHealth } = await import("./kernel/lifecycle.ts");
      const report = await checkKernelHealth(kernel);
      checks.kernelHealth = report;
      if (report.health === "unavailable") checks.ok = false;
    } catch (error) {
      checks.kernelHealth = { health: "unknown", error: error instanceof Error ? error.message : "unknown" };
    }
    try { checks.kernel = (kernel.deps.store as { constructor?: { name?: string } }).constructor?.name ?? "unknown"; } catch { checks.kernel = "error"; }
    try { checks.db = (await db.list("system","sessions",{limit:1})) ? "ok" : "empty"; } catch (e: unknown){ checks.db = e instanceof Error ? e.message : "error"; checks.ok = false; }
    // HEALTH_DEEP_V2 - checks adicionales.
    try {
      checks.worker = agent.worker.running;
      checks.tenantService = Boolean(agent.tenantService);
      checks.kernel = Boolean(agent.kernel);
      checks.capabilities = (await agent.capabilities.list()).length;
      checks.guardrails = Boolean(agent.guardrails);
      checks.metrics = Boolean(agent.metrics);
      // HEALTH_METRICS_V1 - conteo por tenant del worker.
      checks.tenants = typeof (agent as unknown as { tenantService?: unknown }).tenantService === "object" ? "wired" : "absent";
    } catch (e: unknown) {
      checks.internal = e instanceof Error ? e.message : "error";
      checks.ok = false;
    }
    return c.json(checks, checks.ok ? 200 : 500);
  });
app.get("/api/health", async (c) => {
    const checks: Record<string, boolean> = {};
    try {
      await db.put("system", "health", { id: "ping", at: new Date().toISOString() });
      const ping = await db.get<{ at: string }>("system", "health", "ping");
      checks.database = Boolean(ping);
    } catch {
      checks.database = false;
    }
    try {
      await bus.emit("system", "system.startup", { kind: "system", id: "health" }, { mode: config.mode });
      checks.bus = true;
    } catch {
      checks.bus = false;
    }
    checks.worker = true;
    checks.agentConfigured = agentConfigured(config);
    checks.browserConfigured = Boolean(config.workerUrl && config.workerToken);
    const ok = checks.database && checks.bus;
    return c.json(
      {
        ok,
        mode: config.mode,
        checks,
      },
      ok ? 200 : 503,
    );
  });
  // SESSION_RATE_LIMIT ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â rate limit por IP, no global. El RateLimiter ya existe en rate-limit.ts.
  const sessionLimiter = new RateLimiter(30, 60000);
  const sessionAddress = (c: Context) => {
    const fwd = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    if (fwd) return fwd;
    try { return getConnInfo(c as unknown as Context).remote.address ?? "local"; }
    catch { return "local"; }
  };
  app.post("/api/session", async (c) => {
    const verdict = sessionLimiter.take(sessionAddress(c));
    if (!verdict.allowed) {
      c.header("Retry-After", String(Math.max(1, Math.ceil(verdict.retryAfterMs / 1000))));
      throw new AppError("Too many sign-in attempts. Try again in a minute.", 429);
    }
    const body = z.object({ accessKey: z.string().optional() }).parse(await c.req.json());
    const session = await auth.session(body.accessKey);
    await ensureOwnerWorkspace("local-user");
    return c.json(session);
  });
  app.get("/api/google/callback", async (c) => {
    if (c.req.query("error"))
      return c.html("<h1>Google connection cancelled</h1><p>You can return to OpenMuse.</p>", 400);
    const state = c.req.query("state"),
      code = c.req.query("code");
    if (!state || !code) throw new AppError("Google callback is incomplete");
    await google.callback(state, code);
    return c.html(
      "<h1>Google is connected</h1><p>Return to OpenMuse and refresh your workspace.</p>",
    );
  });
  app.use("/api/*", async (c, next) => {
    if (c.req.path === "/api/auth/login" || c.req.path === "/api/auth/logout") {
      await next();
      return;
    }
    const signedRoute =
      /^\/api\/files\/[^/]+\/content$|^\/api\/browsers\/[^/]+\/(?:preview|console)$/.test(
        c.req.path,
      );
    const owner =
      signedRoute && c.req.query("signature")
        ? auth.verify(new URL(c.req.url))
        : await auth.owner(c.req.header("authorization"));
    c.set("owner", owner);
    // OWNER_LOG_CONTEXT_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â propaga owner al contexto de log del request.
    const current = logContext.getStore();
    if (current) {
      logContext.enterWith({ ...current, owner });
    }
    await next();
  });
  app.get("/api/workspace", async (c) => {
    const owner = c.get("owner");
    const snapshot = await workspace.snapshot(owner, c.req.query("q"));
    snapshot.browsers = snapshot.browsers.map((s) => browser.decorate(owner, s));
    return c.json(snapshot);
  });
  // BILLING_AFTER_AUTH ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â billing vive debajo del middleware de auth para que Stripe no quede abierto al mundo.
app.post("/api/billing/customer", async (c) => {
    const body = z.object({ email: z.email(), name: z.string().min(1).max(200) }).parse(await c.req.json());
    const { StripeClient } = await import("../../../packages/integrations/src/stubs/stripe.ts");
    const client = new StripeClient({ apiKey: config.stripeApiKey });
    return c.json(await client.createCustomer(body.email, body.name));
  });
  app.post("/api/billing/payment-link", async (c) => {
    const body = z
      .object({
        amountCents: z.number().int().positive().max(100_000_000),
        currency: z.string().regex(/^[a-z]{3}$/),
        description: z.string().min(1).max(200),
      })
      .parse(await c.req.json());
    const { StripeClient } = await import("../../../packages/integrations/src/stubs/stripe.ts");
    const client = new StripeClient({ apiKey: config.stripeApiKey });
    return c.json(await client.createPaymentLink(body.amountCents, body.currency, body.description));
  });
  app.get("/api/billing/invoices", async (c) => {
    const customerId = z.string().regex(/^cus_[A-Za-z0-9]+$/).parse(c.req.query("customerId"));
    const { StripeClient } = await import("../../../packages/integrations/src/stubs/stripe.ts");
    const client = new StripeClient({ apiKey: config.stripeApiKey });
    return c.json(await client.listInvoices(customerId));
  });

  app.route("/api/agent", agentRoutes(agent));
  app.route("/api/events", eventsRoutes(bus));
  app.route("/api/skills", skillsRoutes(db));
  app.route("/api/sops", sopRoutes(db, agent));
  app.route("/api/auth", authRoutes(db, users, { config, afterLogin: ensureOwnerWorkspace }, bus));
  // APP_SIGNUP_ROUTES_V1 - endpoints publicos de signup y verify.
  {
    const { signupRoutes } = await import("./auth-signup.ts");
    app.route("/api/auth", signupRoutes({ db, config, users, tenantService }));
  }
  app.route("/api/rag", ragRoutes(rag, db, files));
  app.route("/api/threads", threadRoutes(db));
  app.route("/api/projects", projectRoutes(db));
  // PERSONAS_WIRE_V1 - endpoints de personas del tenant.
  // APP_PERSONAS_KERNEL_V1 - pasa el kernel a personasRoutes.
  app.route("/api/agent-personas", personasRoutes({
    registry: personaRegistry,
    db,
    kernel,
    ...(tenantService ? { tenantService } : {}),
  }));
  app.route("/api/computer", computerRoutes(computer, files));
  // ADMIN_ROUTES_WIRE_V1 - endpoints de admin.
  {
    const { adminRoutes } = await import("./admin-routes.ts");
    app.route("/api/admin", adminRoutes(agent, users));
  }
  // APP_ADMIN_CLIENTS_V1 - panel maestro de clientes.
  {
    const { adminClientsRoutes } = await import("./admin-clients.ts");
    app.route("/api/admin/clients", adminClientsRoutes(agent, users));
  }
  // APP_METRICS_V1 - endpoint Prometheus.
  {
    const { metricsRoutes } = await import("./metrics-exporter.ts");
    app.route("/metrics", metricsRoutes(agent, users));
  }
  // APP_ADMIN_TENANTS_V1 - panel admin de tenants.
  {
    const { adminTenantsRoutes } = await import("./admin-tenants.ts");
    app.route("/api/admin/tenants", adminTenantsRoutes(agent, users));
  }
  // APP_NOTIF_STREAM_V1 - SSE de notificaciones.
  {
    const { notificationsStreamRoutes } = await import("./notifications-stream.ts");
    app.route("/api/notifications", notificationsStreamRoutes(agent));
  }
  // APP_NOTIF_PREFS_V1 - preferencias de notificaciones.
  {
    const { notificationPrefsRoutes } = await import("./notification-prefs.ts");
    app.route("/api/notifications", notificationPrefsRoutes(db));
  }
  // APP_FORM_ROUTES_V1 - formularios asistidos.
  {
    const { formRoutes } = await import("./form-routes.ts");
    app.route("/api/forms", formRoutes(agent));
  }
  // APP_INTEGRATIONS_V1 - WhatsApp, Stripe, GMB, Social.
  {
    const { whatsappRoutes } = await import("./whatsapp-routes.ts");
    app.route("/api/whatsapp", whatsappRoutes(agent));
    const { billingRoutes } = await import("./billing-routes.ts");
    app.route("/api/billing", billingRoutes(db));
    const { gmbRoutes } = await import("./gmb-routes.ts");
    app.route("/api/gmb", gmbRoutes(agent));
    const { socialRoutes } = await import("./social-routes.ts");
    app.route("/api/social", socialRoutes(agent));
  }
  // KERNEL_ROUTES_WIRE_V1 - endpoints de debug del kernel.
  {
    const { kernelRoutes } = await import("./kernel-routes.ts");
    // KERNEL_ROUTES_ADMIN_WIRE_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â pasa UserService para validaciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n admin.
    // Ver: docs/audits/09-kernel-cognitivo/miniaudit.md.
    app.route("/api/kernel", kernelRoutes(kernel, users));
  }
  // APP_VIEWS_WIRE_V1 - endpoint publico de resolucion de vistas. Antes solo
  // estaba bajo /api/admin/views/resolve (requireAdmin) y el frontend llamaba
  // a /api/views/resolve, que no existia. Ahora el endpoint publico esta
  // cableado y usa la instancia del resolver del proceso.
  {
    const { viewsRoutes } = await import("./routes/views.ts");
    app.route("/api/views", viewsRoutes());
  // WS_ROUTES_WIRE_V1 - endpoints del catalogo de workspaces.
  {
    const { workspacesRoutes } = await import("./routes/workspaces.ts");
    app.route("/api/workspaces", workspacesRoutes(workspaceModuleRegistry, workspaceDispatcher));
  }
  }
  // BUSINESS_ROUTES_WIRE_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â rutas HTTP del Business Graph.
  const { businessRoutes } = await import("./business-routes.ts");
  app.route("/api/business", businessRoutes(graph, truth, workspaceRegistry, stateMachines));
  app.get("/api/calendars", async (c) => c.json(await workspace.calendars(c.get("owner"))));
  app.get("/api/calendar/events", async (c) => {
    const query = z
      .object({
        calendarId: z.string().min(1).max(1024).optional(),
        timeMin: z.iso.datetime({ offset: true }).optional(),
        timeMax: z.iso.datetime({ offset: true }).optional(),
      })
      .parse(c.req.query());
    if (
      query.timeMin &&
      query.timeMax &&
      (Date.parse(query.timeMax) <= Date.parse(query.timeMin) ||
        Date.parse(query.timeMax) - Date.parse(query.timeMin) > 366 * 86400000)
    )
      throw new AppError("Choose a calendar range between one moment and 366 days", 422);
    return c.json(await workspace.events(c.get("owner"), query));
  });
  app.get("/api/drive/files", async (c) => {
    const query = z.object({ q: z.string().trim().max(500).optional() }).parse(c.req.query());
    return c.json(await workspace.driveFiles(c.get("owner"), query.q));
  });
  app.get("/api/drive/files/:id/content", async (c) =>
    c.json(await workspace.readDriveFile(c.get("owner"), c.req.param("id"))),
  );
  app.get("/api/mail/threads/:id", async (c) =>
    c.json(await workspace.thread(c.get("owner"), c.req.param("id"))),
  );
  app.post("/api/actions", async (c) => {
    const input = proposalSchema.parse(await c.req.json());
    if (input.kind === "email.send")
      for (const id of input.data.attachmentIds) await files.get(c.get("owner"), id);
    return c.json(await actions.propose(c.get("owner"), input), 201);
  });
  app.post("/api/actions/:id/decide", async (c) => {
    const body = z
      .object({ hash: z.string(), decision: z.enum(["approve", "deny"]) })
      .parse(await c.req.json());
    return c.json(
      await actions.decide(c.get("owner"), c.req.param("id"), body.hash, body.decision),
    );
  });
  app.get("/api/drafts", async (c) => c.json(await db.list(c.get("owner"), "drafts")));
  app.post("/api/drafts", async (c) => {
    const body = emailDraftSchema.extend({ id: z.string().optional() }).parse(await c.req.json());
    const existing = body.id
      ? await db.get<{ createdAt: string }>(c.get("owner"), "drafts", body.id)
      : null;
    if (body.id && !existing) throw new AppError("Draft not found", 404);
    return c.json(
      await db.put(c.get("owner"), "drafts", {
        ...body,
        id: body.id ?? randomUUID(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      }),
      201,
    );
  });
  const ensureMainThreadId = async (owner: string) => {
    await db.insertIfAbsent(owner, "conversation-settings", { id: "main", threadId: randomUUID(), existing: false });
    const main = await db.get<{ threadId: string }>(owner, "conversation-settings", "main");
    if (!main) throw new AppError("Main conversation could not be loaded", 503);
    return main.threadId;
  };
  app.get("/api/main-thread", async (c) => {
    const owner = c.get("owner");
    const threadId = await ensureMainThreadId(owner);
    const created = await db.insertIfAbsent(owner, "conversations", {
      id: threadId,
      messages: [],
      createdAt: new Date().toISOString(),
    } as any);
    return c.json({ threadId, existing: !created });
  });
  app.get("/api/conversation", async (c) => {
    const owner = c.get("owner");
    const threadId = await ensureMainThreadId(owner);
    return c.json((await db.get(owner, "conversations", threadId)) ?? { id: threadId, messages: [] });
  });
  app.put("/api/conversation", async (c) => {
    const owner = c.get("owner");
    const threadId = await ensureMainThreadId(owner);
    const body = await c.req.json();
    const messages = z.array(z.unknown()).max(1000).parse(body.messages);
    for (const message of messages) MessageSchema.parse(message);
    await db.put(owner, "conversations", { id: threadId, messages });
    return c.json({ ok: true });
  });
  app.post("/api/files", async (c) => {
    const data = await c.req.parseBody();
    const file = data.file;
    if (!(file instanceof File)) throw new AppError("Choose a PDF file");
    return c.json(
      await files.import(
        c.get("owner"),
        file.name,
        new Uint8Array(await file.arrayBuffer()),
        "Uploaded by you",
        "default", // FALLBACK_TENANT_V1
      ),
      201,
    );
  });
  app.get("/api/files/:id/content", async (c) => {
    const file = await files.get(c.get("owner"), c.req.param("id"));
    c.header("Content-Type", file.mimeType);
    const disposition = file.mimeType.startsWith("image/") || file.mimeType === "application/pdf"
      ? "inline"
      : "attachment";
    c.header("Content-Disposition", `${disposition}; filename*=UTF-8'${encodeURIComponent(file.name)}`);
    return c.body(await files.bytes(c.get("owner"), file.id));
  });
  app.post("/api/files/:id/fill", async (c) => {
    const body = z
      .object({ fields: z.record(z.string(), z.union([z.string(), z.boolean()])) })
      .parse(await c.req.json());
    return c.json(await files.fill(c.get("owner"), c.req.param("id"), body.fields), 201);
  });
  app.post("/api/mail/import-attachment", async (c) => {
    const body = z.object({ reference: z.string() }).parse(await c.req.json());
    return c.json(await workspace.importAttachment(c.get("owner"), body.reference), 201);
  });
  app.post("/api/google/connect", async (c) => {
    const body = z.object({ capability: z.enum(["read", "write"]) }).parse(await c.req.json());
    if (config.mode === "sample") {
      await db.put(c.get("owner"), "settings", {
        id: "google",
        enabled: true,
        connectionId: randomUUID(),
      });
      return c.json({ url: null, connected: true });
    }
    return c.json(await google.connect(c.get("owner"), body.capability === "write"));
  });
  app.post("/api/google/disconnect", async (c) => {
    if (config.mode === "sample")
      await db.put(c.get("owner"), "settings", { id: "google", enabled: false });
    else await google.disconnect(c.get("owner"));
    return c.json({ ok: true });
  });
  app.get("/api/google/status", async (c) => {
    const owner = c.get("owner");
    const connection = await workspace.connection(owner);
    return c.json({
      connected: Boolean(connection),
      account: connection?.account ?? null,
      sample: config.mode === "sample",
      configured: config.mode === "sample" ? true : google.configured(),
    });
  });
  app.post("/api/browsers", async (c) => {
    const body = z.object({ url: z.url().max(4096) }).parse(await c.req.json());
    return c.json(await browser.create(c.get("owner"), body.url), 201);
  });
  app.get("/api/browsers/:id", async (c) => {
    const owner = c.get("owner");
    return c.json(browser.decorate(owner, await browser.get(owner, c.req.param("id"))));
  });
  app.post("/api/browsers/:id/navigate", async (c) => {
    const body = z.object({ url: z.url().max(4096) }).parse(await c.req.json());
    return c.json(await browser.navigate(c.get("owner"), c.req.param("id"), body.url));
  });
  app.post("/api/browsers/:id/close", async (c) =>
    c.json(await browser.close(c.get("owner"), c.req.param("id"))),
  );
  app.get("/api/browsers/:id/read", async (c) =>
    c.json(await browser.read(c.get("owner"), c.req.param("id"))),
  );
  app.post("/api/browsers/:id/reopen", async (c) => {
    const raw = await c.req.text();
    const body = z.object({ url: z.url().max(4096).optional() }).parse(raw ? JSON.parse(raw) : {});
    return c.json(await browser.reopen(c.get("owner"), c.req.param("id"), body.url));
  });
  app.post("/api/browsers/:id/import-downloads", async (c) =>
    c.json(await browser.imports(c.get("owner"), c.req.param("id"))),
  );
  app.get("/api/browsers/:id/preview", async (c) => {
    const response = await browser.preview(c.get("owner"), c.req.param("id"));
    c.header("Content-Type", "image/png");
    return c.body(await response.arrayBuffer());
  });
  app.get("/api/browsers/:id/console", async (c) => {
    await browser.get(c.get("owner"), c.req.param("id"));
    c.header(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' blob:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'",
    );
    return c.html(browser.console(c.get("owner"), c.req.param("id")));
  });
  app.post("/api/browsers/:id/console", async (c) => {
    await browser.input(c.get("owner"), c.req.param("id"), await c.req.json());
    return c.json({ ok: true });
  });
  app.all("/api/copilotkit/*", async (c) => {
    if (!agentConfigured(config))
      throw new AppError(
        "Configure a model and provider API key, or a valid AG-UI endpoint, to start chat",
        503,
      );
    const target = new URL(c.req.url);
    if (target.pathname.replace(/\/$/, "") === "/api/copilotkit/run")
      target.pathname = "/api/copilotkit/agent/default/run";
    const request = target.href === c.req.url ? c.req.raw : new Request(target, c.req.raw);
    const response = await runtime.fetch(request);
    const encoder = new TextEncoder();
    const body = response.body?.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(typeof chunk === "string" ? encoder.encode(chunk) : chunk);
        },
      }),
    );
    return new Response(body, { status: response.status, headers: response.headers });
  });
  const here = dirname(fileURLToPath(import.meta.url));
  const webDist = [
    join(here, "../../../apps/web/dist"),
    join(here, "../../../../apps/web/dist"),
  ].find((dir) => existsSync(dir));
  if (webDist) app.use("/*", serveStatic({ root: webDist }));
  app.get("/", (c) =>
    c.json({ name: "OpenMuse", app: "http://localhost:8081", health: "/api/health" }),
  );
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminName = process.env.ADMIN_NAME?.trim() || "Admin";
  if (adminEmail && adminPassword) {
    await users.ensureAdmin(adminEmail, adminPassword, adminName);
  } else if ((await users.list()).length === 0) {
    console.warn(
      "[OpenMuse] No hay usuarios en la DB y faltan ADMIN_EMAIL/ADMIN_PASSWORD: POST /api/auth/login devolvera 401. Rellena ADMIN_EMAIL, ADMIN_PASSWORD y ADMIN_NAME en .env, o ejecuta `pnpm admin:create -- --email tu@empresa.com --password \"...\"`.",
    );
  }
  if (config.databaseUrl && !process.env.BUSINESS_DATABASE_URL?.trim())
    console.warn(
      "[OpenMuse] BUSINESS_DATABASE_URL no esta definido: los SOPs con la tool query_business ejecutan su SQL contra DATABASE_URL, que es la misma base de datos donde viven los datos de todos los owners. Apunta BUSINESS_DATABASE_URL a un rol de solo lectura (GRANT SELECT) en otra base de datos.",
    );

  return { app, auth, files, actions, workspace, agent, computer, users, bus };
}
// IMPORTS_BACKEND_FIXED ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â anadidos los imports que los bloques 2 y 46 no supieron inyectar.
