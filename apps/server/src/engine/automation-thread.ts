// AUTOMATION_THREAD_V1 (campana 13) - vinculo persistente hilo/persona/automatizacion/ejecucion.
//
// Antes la ruta de automatizacion devolvia el threadId que le pasaban sin
// guardar nada: el contexto de conversacion no sabia que ejecucion estaba
// mirando el humano, no podia resolver su entidad y cualquier hilo servia,
// incluido el de otra empresa. El vinculo vive en `automation-threads`, con
// clave `tenantId:actorId`, asi que un hilo ajeno no es visible ni reanudable.

import { randomUUID } from "node:crypto";
import type { AgentTask } from "../../../../packages/domain/src/agent.ts";
import type { Store } from "../db.ts";
import { AppError } from "../errors.ts";

export const AUTOMATION_THREADS = "automation-threads";

export interface AutomationScope {
  tenantId: string;
  actorId: string;
}

export interface AutomationThreadLink {
  id: string;
  tenantId: string;
  actorId: string;
  personaId: string;
  automationId: string;
  executionId?: string;
  entityId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationReference {
  threadId: string;
  automationId: string;
  personaId: string;
  entityId: string | null;
  executions: Array<{
    id: string;
    entityId: string | null;
    sopId: string | null;
    status: string;
    title: string;
  }>;
  nextResponsible: { kind: "human" | "persona"; id: string } | null;
}

export interface OpenAutomationInput {
  threadId?: string;
  personaId: string;
  automationId: string;
  executionId?: string;
}

const stateString = (task: AgentTask, field: "entityId" | "sopId"): string | null =>
  typeof task.state[field] === "string" ? (task.state[field] as string) : null;

// AUTOMATION_STORE_PORT_V1 - sirve igual el store crudo y el acotado por tenant.
type AutomationStore = Pick<Store, "get" | "put" | "remove">;

export class AutomationThreads {
  constructor(private readonly db: AutomationStore) {}

  private key(scope: AutomationScope) {
    return `${scope.tenantId}:${scope.actorId}`;
  }

  async get(scope: AutomationScope, threadId: string): Promise<AutomationThreadLink | null> {
    return (
      (await this.db.get<AutomationThreadLink>(
        this.key(scope),
        AUTOMATION_THREADS,
        threadId,
      )) ?? null
    );
  }

  /**
   * AUTOMATION_THREAD_RESUME_V1 - crear o reanudar el hilo de una automatizacion.
   * Reanudar exige el mismo tenant, el mismo actor y la misma automatizacion.
   */
  async open(scope: AutomationScope, input: OpenAutomationInput): Promise<AutomationThreadLink> {
    const threadId = input.threadId ?? randomUUID();
    const existing = await this.get(scope, threadId);
    if (existing && (existing.tenantId !== scope.tenantId || existing.actorId !== scope.actorId)) {
      throw new AppError("Thread belongs to another session", 403);
    }
    if (
      existing &&
      (existing.automationId !== input.automationId || existing.personaId !== input.personaId)
    ) {
      throw new AppError("Thread is bound to another automation", 409);
    }
    // AUTOMATION_EXECUTION_OWNERSHIP_V1 - la ejecucion se valida contra el
    // store del actor y contra su empresa; no se cita lo que no es suyo.
    const execution = input.executionId
      ? await this.execution(scope, input.executionId, input.automationId)
      : null;
    const now = new Date().toISOString();
    const link: AutomationThreadLink = {
      id: threadId,
      tenantId: scope.tenantId,
      actorId: scope.actorId,
      personaId: input.personaId,
      automationId: input.automationId,
      ...(execution
        ? {
            executionId: execution.id,
            ...(stateString(execution, "entityId")
              ? { entityId: stateString(execution, "entityId")! }
              : {}),
          }
        : existing?.executionId
          ? {
              executionId: existing.executionId,
              ...(existing.entityId ? { entityId: existing.entityId } : {}),
            }
          : {}),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await this.db.put(this.key(scope), AUTOMATION_THREADS, link);
    return link;
  }

  private async execution(
    scope: AutomationScope,
    executionId: string,
    automationId: string,
  ): Promise<AgentTask> {
    const task = await this.db.get<AgentTask>(this.key(scope), "tasks", executionId);
    if (!task) throw new AppError("Execution not found", 404);
    if (task.tenantId !== scope.tenantId) {
      throw new AppError("Execution belongs to another company", 403);
    }
    // AUTOMATION_EXECUTION_MATCH_V1 - dos ejecuciones de la misma empresa y del
    // mismo proceso no son intercambiables: la consulta cita la suya.
    const sopId = stateString(task, "sopId");
    if (sopId && sopId !== automationId) {
      throw new AppError("Execution belongs to another automation", 409);
    }
    return task;
  }

  /** AUTOMATION_REFERENCES_V1 - referencias autorizadas y siguiente responsable. */
  async references(
    scope: AutomationScope,
    threadId: string,
  ): Promise<AutomationReference | null> {
    const link = await this.get(scope, threadId);
    if (!link) return null;
    const task = link.executionId
      ? await this.db.get<AgentTask>(this.key(scope), "tasks", link.executionId)
      : null;
    const visible = task && task.tenantId === scope.tenantId ? task : null;
    const waiting = visible?.status === "waiting_input" || visible?.status === "waiting_approval";
    return {
      threadId: link.id,
      automationId: link.automationId,
      personaId: link.personaId,
      entityId: link.entityId ?? (visible ? stateString(visible, "entityId") : null),
      executions: visible
        ? [
            {
              id: visible.id,
              entityId: stateString(visible, "entityId"),
              sopId: stateString(visible, "sopId"),
              status: visible.status,
              title: visible.title,
            },
          ]
        : [],
      // AUTOMATION_NEXT_RESPONSIBLE_V1 - si la ejecucion espera respuesta, el
      // siguiente responsable es el humano asignado; si no, la persona.
      nextResponsible: waiting
        ? { kind: "human", id: visible?.assignedTo ?? scope.actorId }
        : { kind: "persona", id: link.personaId },
    };
  }

  /** AUTOMATION_FORGET_V1 - borrar el hilo retira tambien su vinculo. */
  async forget(scope: AutomationScope, threadId: string): Promise<void> {
    await this.db.remove(this.key(scope), AUTOMATION_THREADS, threadId);
  }
}
