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
}

export interface KernelThought {
  id: string;
  role: string;
  actor: { kind: string; id: string };
  content: string | Record<string, unknown>;
  provenance: { source: string; timestamp: string; parentId?: string };
  edges: Array<{ toThoughtId: string; kind: string; weight: number; confidence: number }>;
  context: { entities: string[]; policies: string[]; skills: string[]; priorThoughts: string[] };
}

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
