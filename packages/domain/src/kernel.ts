// DOMAIN_KERNEL_V1 - contrato del kernel para el dominio.
//
// Por que existe este fichero:
//   engine/ no puede importar de kernel/ sin acoplarse a la implementacion.
//   Este contrato permite que engine/ use el kernel sin saber si es
//   InMemoryTurnStore o StoreTurnStore.
//
// Nota: los tipos Thought, Turn, KernelContext reales viven en
// apps/server/src/kernel/. Aqui solo esta el contrato minimo que el engine
// necesita para no depender de la implementacion.

export type KernelRole = "admin" | "user" | "agent" | "system";

export interface KernelContext {
  tenantId: string;
  owner: string;
  role: KernelRole;
  requestId: string;
  /** KERNEL_THREAD_V1 - threadId de la conversacion. Opcional. */
  threadId?: string;
  /** KERNEL_PARENT_TURN_V1 - si este contexto abre un turno hijo. */
  parentTurnId?: string;
  /** KERNEL_CORRELATION_V1 - correlacion HTTP <-> task <-> turn. */
  correlationId?: string;

  /** KERNEL_PERSONA_V1 - persona funcional que habla en este turno. Opcional. */
  // DOMAIN_KERNEL_PERSONA_FORMAT_V1 - formato limpio.
  personaId?: string;

  /**
   * KERNEL_CONTEXT_ACTOR_PORT_V1 - actorId obligatorio, igual que el contrato
   * real de apps/server/src/kernel/context/kernel-context.ts. Sin actor no hay
   * authz efectiva, asi que el puerto no puede declararlo opcional: si falta,
   * que falle en compilacion y no en runtime.
   */
  actorId: string;
  /** KERNEL_CONTEXT_ACTOR_PORT_V1 - sessionId opcional, como en el kernel. */
  sessionId?: string;
}

/**
 * FIX 03 - KernelThought es un alias minimo de Thought. La representacion
 * canonica es `Thought` de apps/server/src/kernel/graph/thought.ts (Zod).
 * Este tipo solo se mantiene para consumidores que no pueden importar Zod
 * (tests aislados, contratos de dominio puro). Los campos son los mismos
 * que el Thought publico: id, role, actor, content, provenance, edges, context.
 * No es un segundo contrato: es la vista TypeScript del contrato Zod.
 */
export type KernelThought = import("./kernel-thought-view.ts").KernelThoughtView;

export interface KernelTurn {
  id: string;
  parentTurnId?: string;
  status: "open" | "closed" | "promoted";
  closeReason?: string;
  closedBy?: string;
  thoughtIds: string[];
}

/**
 * KERNEL_PORT_V1 - contrato minimo que engine/ usa.
 *
 * Notas:
 *   - openTurn no deduplica. El caller decide si reusar un turno abierto.
 *   - closeTurn cierra tambien los hijos abiertos (la implementacion lo decide).
 *   - listOpenTurnsForThread permite reusar turnos en el mismo thread.
 */
export interface KernelPort {
  openTurn(ctx: KernelContext, trigger: string): Promise<KernelTurn>;
  openChildTurn(ctx: KernelContext, parentTurnId: string, trigger: string): Promise<KernelTurn>;
  closeTurn(
    ctx: KernelContext,
    turnId: string,
    reason: string,
    closedBy: string,
  ): Promise<KernelTurn>;
  appendThought(ctx: KernelContext, input: unknown): Promise<KernelThought>;
  thoughtsOf(ctx: KernelContext, turnId: string): Promise<KernelThought[]>;
  listTurns(ctx: KernelContext, limit: number): Promise<KernelTurn[]>;
  listOpenTurnsForThread(ctx: KernelContext): Promise<KernelTurn[]>;
}

/**
 * KERNEL_WRITER_PORT_V1 - contrato de un autor (user, fast, slow).
 * El engine no necesita saber si es in-memory o persistente.
 */
export interface KernelWriterPort {
  write(ctx: KernelContext, input: unknown): Promise<KernelThought>;
}
