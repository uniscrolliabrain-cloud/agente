// KERNEL_COGNITION_CYCLE_V1 - un solo ciclo perceptir -> atender -> decidir ->
// actuar -> reflexionar -> consolidar.
//
// Antes el orden estaba repartido entre bus-emitter, subscribers, autores y
// presenter: cada uno abria o cerraba turnos a su manera. Este modulo no
// reescribe esos componentes; fija el orden y devuelve las fases para que el
// caller pueda medirlas. El subscriber de eventos ya lo usa.

import type { KernelContext } from "../context/kernel-context.ts";
import type { Kernel } from "../kernel.ts";
import type {
  AttentionVector,
  Thought,
} from "../graph/thought.ts";
import type { TurnCloseReason, TurnClosedBy } from "../graph/turn.ts";

export const COGNITION_PHASES = [
  "perceive",
  "attend",
  "decide",
  "act",
  "reflect",
  "consolidate",
] as const;

export type CognitionPhase = (typeof COGNITION_PHASES)[number];

export interface CognitionPhaseMark {
  phase: CognitionPhase;
  at: string;
}

export interface CognitionObservationInput {
  role: Thought["role"];
  content: Thought["content"];
  attention: AttentionVector;
  actor?: Thought["actor"];
  context?: Thought["context"];
  edges?: Thought["edges"];
}

export interface CognitionDecisionInput {
  role: Thought["role"];
  content: Thought["content"];
  attention?: AttentionVector;
  actor?: Thought["actor"];
  context?: Thought["context"];
  edges?: Thought["edges"];
}

export interface CognitionRunInput {
  ctx: KernelContext;
  trigger: string;
  observation: CognitionObservationInput;
  decision?: CognitionDecisionInput;
  close?: { reason: TurnCloseReason; closedBy: TurnClosedBy };
}

export interface CognitionRunResult {
  turnId: string;
  thoughtIds: string[];
  phases: CognitionPhaseMark[];
  closed: boolean;
}

function mark(phases: CognitionPhaseMark[], phase: CognitionPhase): void {
  phases.push({ phase, at: new Date().toISOString() });
}

/**
 * Ejecuta el ciclo sobre un kernel. Es idempotente en la apertura del turno
 * (`openTurnIdempotent`) para que un reintento del bus no cree un turno nuevo.
 */
export async function runCognitionCycle(
  kernel: Kernel,
  input: CognitionRunInput,
): Promise<CognitionRunResult> {
  const phases: CognitionPhaseMark[] = [];
  mark(phases, "perceive");
  const turn = await kernel.openTurnIdempotent(input.ctx, input.trigger);

  mark(phases, "attend");
  const observation = await kernel.appendThought(input.ctx, {
    turnId: turn.id,
    role: input.observation.role,
    content: input.observation.content,
    attention: input.observation.attention,
    actor: input.observation.actor ?? { kind: "system", id: "cognition-cycle" },
    context: input.observation.context ?? { entities: [], policies: [], skills: [], priorThoughts: [] },
    edges: input.observation.edges ?? [],
  });
  const thoughtIds = [observation.id];

  mark(phases, "decide");
  if (input.decision) {
    const decision = await kernel.appendThought(input.ctx, {
      turnId: turn.id,
      role: input.decision.role,
      content: input.decision.content,
      attention: input.decision.attention ?? input.observation.attention,
      actor: input.decision.actor ?? input.observation.actor ?? { kind: "system", id: "cognition-cycle" },
      context: input.decision.context ?? input.observation.context ?? { entities: [], policies: [], skills: [], priorThoughts: [] },
      edges: input.decision.edges ?? [],
    });
    thoughtIds.push(decision.id);
    mark(phases, "act");
  }

  mark(phases, "reflect");
  let closed = false;
  if (input.close) {
    const stillOpen = await kernel.deps.store
      .getTurn(input.ctx.tenantId, turn.id)
      .catch(() => undefined);
    if (stillOpen?.status === "open") {
      await kernel.closeTurn(
        input.ctx,
        turn.id,
        input.close.reason,
        input.close.closedBy,
      );
      closed = true;
      mark(phases, "consolidate");
    }
  }

  return { turnId: turn.id, thoughtIds, phases, closed };
}
