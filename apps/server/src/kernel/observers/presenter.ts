// KERNEL_PRESENTER_V1 — decide que contar al usuario.

import type { KernelContext } from "../context/kernel-context.ts";
import type { Thought, ThoughtRole } from "../graph/thought.ts";
import type { Kernel } from "../kernel.ts";

export interface PresenterDeps {
  kernel: Kernel;
}

export interface Presentation {
  turnId: string;
  thoughtId: string;
  role: ThoughtRole;
  content: Thought["content"];
  actor: Thought["actor"];
  reason: string;
}

const PRIORITY: ThoughtRole[] = [
  "response",
  "display",
  "confirmation",
  "correction",
  "reasoning",
  "critic",
  "verifier",
  "observation",
  "action",
  "reflection",
  "delegation",
  "query",
  "intent",
];

/**
   * PRESENTER_SCORE_V1 — combina PRIORITY del rol + confidence +
   * atención. Antes solo se ordenaba por rol, así que un response con
   * confidence 0.3 ganaba a un critic con 0.95.
   * Ver: auditoría profunda 09 (Presenter PRIORITY ignora confidence).
   */
  function score(thought: Thought): number {
    const roleIdx = PRIORITY.indexOf(thought.role);
    const roleScore = roleIdx >= 0 ? 1 / (roleIdx + 1) : 0;
    const confidenceScore = thought.attention.confidence;
    const attentionScore = thought.attention.matched.reduce(
      (sum, m) => sum + (m.node === thought.attention.primary ? m.weight : 0),
      0,
    );
    return roleScore * 0.5 + confidenceScore * 0.3 + attentionScore * 0.2;
  }

  function pickByPriority(thoughts: Thought[]): { thought: Thought; reason: string } | undefined {
  const scored = [...thoughts].sort((a, b) => score(b) - score(a));
    if (scored.length > 0) {
      return {
        thought: scored[0],
        reason: `selected by score (role=${scored[0].role}, conf=${scored[0].attention.confidence.toFixed(2)})`,
      };
    }
  const last = thoughts[thoughts.length - 1];
  return last ? { thought: last, reason: "selected last thought as fallback" } : undefined;
}

export class Presenter {
  constructor(private readonly deps: PresenterDeps) {}

  async present(ctx: KernelContext, turnId: string): Promise<Presentation | undefined> {
    const thoughts = await this.deps.kernel.thoughtsOf(ctx, turnId);
    if (thoughts.length === 0) return undefined;
    const picked = pickByPriority(thoughts);
    if (!picked) return undefined;
    const { thought, reason } = picked;
    return {
      turnId,
      thoughtId: thought.id,
      role: thought.role,
      content: thought.content,
      actor: thought.actor,
      reason,
    };
  }

  /**
   * KERNEL_PRESENT_TURN_V1 - presentacion completa de un turno.
   *
   * Devuelve la presentacion + metadata del turno (cuantos thoughts, cual es el
   * elegido, cuando se cerro). Pensado para el SSE: conversation.ts llama a esto
   * antes de emitir el TEXT_MESSAGE_CONTENT, asi el presenter decide el texto.
   *
   * Si no hay thoughts, devuelve undefined. Si no hay presentation, tambien.
   */
  async presentTurn(
    ctx: KernelContext,
    turnId: string,
  ): Promise<
    | {
        presentation: Presentation;
        totalThoughts: number;
        turnClosedAt?: string;
        closeReason?: string;
      }
    | undefined
  > {
    const thoughts = await this.deps.kernel.thoughtsOf(ctx, turnId);
    if (thoughts.length === 0) return undefined;
    const presentation = await this.present(ctx, turnId);
    if (!presentation) return undefined;
    // Leemos el turno para sacar closeReason / closedAt si ya se cerro.
    const store = (this.deps.kernel as unknown as { deps?: { store?: unknown } }).deps?.store as
      | { getTurn?: (tenantId: string, turnId: string) => Promise<{ closedAt?: string; closeReason?: string } | undefined> }
      | undefined;
    let closedAt: string | undefined;
    let closeReason: string | undefined;
    if (store?.getTurn) {
      const tenantId = await (
        this.deps.kernel as unknown as { deps: { tenants: { resolve: (owner: string) => Promise<string> } } }
      ).deps.tenants.resolve(ctx.owner);
      const turn = await store.getTurn(tenantId, turnId);
      if (turn) {
        closedAt = turn.closedAt;
        closeReason = turn.closeReason;
      }
    }
    return {
      presentation,
      totalThoughts: thoughts.length,
      ...(closedAt ? { turnClosedAt: closedAt } : {}),
      ...(closeReason ? { closeReason } : {}),
    };
  }

  /**
   * KERNEL_PRESENT_FROM_THOUGHTS_V1 - presenta a partir de una lista ya cargada.
   *
   * Evita re-leer el store cuando el caller ya tiene los thoughts. Lo usa
   * conversation.ts: ya tiene los thoughts del turno cuando va a emitir el SSE.
   */
  presentFromThoughts(turnId: string, thoughts: Thought[]): Presentation | undefined {
    if (thoughts.length === 0) return undefined;
    const picked = pickByPriority(thoughts);
    if (!picked) return undefined;
    const { thought, reason } = picked;
    return {
      turnId,
      thoughtId: thought.id,
      role: thought.role,
      content: thought.content,
      actor: thought.actor,
      reason,
    };
  }

  /**
   * PRESENTER_COMPOSE_V1 - compone primary + secondary.
   */
  composeFromThoughts(turnId: string, thoughts: Thought[], max = 3): {
    primary: Presentation;
    secondary: Presentation[];
  } | undefined {
    if (thoughts.length === 0) return undefined;
    const scored = [...thoughts].sort((a, b) => score(b) - score(a)).slice(0, max);
    const [first, ...rest] = scored;
    if (!first) return undefined;
    const toPresentation = (thought: Thought, reason: string): Presentation => ({
      turnId,
      thoughtId: thought.id,
      role: thought.role,
      content: thought.content,
      actor: thought.actor,
      reason,
    });
    return {
      primary: toPresentation(first, `primary (role=${first.role})`),
      secondary: rest.map((t) => toPresentation(t, `secondary (role=${t.role})`)),
    };
  }
}