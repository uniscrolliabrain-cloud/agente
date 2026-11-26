// KERNEL_META_V1 â€” metaconsciencia como policy engine.
//
// No es metafora: es un conjunto de reglas explicitas que deciden si el
// fast debe saber algo del slow, y cuando. Sin esto, el fast o ignora al
// slow (y el usuario se queda sin contexto) o lo inunda (y el chat se
// vuelve insoportable).
//
// Reglas:
//   - slow_ready_fast_idle: slow emite ready y fast esta idle -> inyectar
//     en el proximo turno.
//   - slow_long_no_output: slow lleva >30s sin emitir y el usuario pregunta
//     -> responder con presencia ("lo estoy preparando").
//   - slow_failed_urgent: slow emite failed y el usuario espera -> avisar
//     en el proximo turno.
//   - nothing_to_report: no hay nada relevante -> no interrumpir.
//
// El resultado de evaluate() es una lista de "hints" que el presenter
// puede usar para decidir que contar al fast.

import { z } from "zod";
import type { Thought } from "../graph/thought.ts";
import { progressEventSchema, type ProgressEvent } from "../graph/progress.ts";
import { attentionOverlap, totalAttention } from "../graph/attention.ts";

export const metaRuleSchema = z.enum([
  "slow_ready_fast_idle",
  "slow_long_no_output",
  "slow_failed_urgent",
  "nothing_to_report",
]);

export const metaHintSchema = z.object({
  rule: metaRuleSchema,
  urgency: z.enum(["low", "medium", "high"]),
  message: z.string().min(1).max(500),
  thoughtId: z.string().max(100).optional(),
});

export type MetaRule = z.infer<typeof metaRuleSchema>;
export type MetaHint = z.infer<typeof metaHintSchema>;

export interface MetaInput {
  thoughts: Thought[];
  lastFastActivityAt?: string;
  now: string;
}

// FAST_IDLE_MS_WIRE_V1 - respeta TenantConfig.fastIdleMs.
export interface MetaDeps {
  longNoOutputMs?: number;
  fastIdleMs?: number;
}

// META_HINT_CONSUMED_V1 â€” el Meta recuerda quÃ© hints ya emitiÃ³ para no
  // repetirlos. Antes, un ready de hace 5 min se re-emitÃ­a cada minuto.
  // Ver: auditorÃ­a profunda 09 (Meta no distingue slow terminÃ³ / nadie lo leyÃ³).
  export interface MetaHintState {
    seenHints: Set<string>;
    lastCleanupAt: number;
  }

  export class Meta {
  private readonly longNoOutputMs: number;
  private readonly fastIdleMs: number;

  constructor(deps: MetaDeps = {}) {
    this.longNoOutputMs = deps.longNoOutputMs ?? 30_000;
    this.fastIdleMs = deps.fastIdleMs ?? 1000;
    if ([this.longNoOutputMs, this.fastIdleMs].some(value => !Number.isFinite(value) || value < 0)) throw Error("INVALID_META_DURATION");
  }

  // META_HINT_CONSUMED_V1 â€” estado de hints ya emitidos.
  private readonly seenHints = new Set<string>();
  /** Consumption is bounded instance-local state, not a durable ACK. */
  consumeHint(hintId: string): void {
    if (!hintId || hintId.length > 200) return;
    this.seenHints.add(hintId);
    if (this.seenHints.size > 1000) this.seenHints.delete(this.seenHints.values().next().value!);
  }

  evaluate(input: MetaInput): MetaHint[] {
    const progress: ProgressEvent[] = [];
    const thoughtIdByProgressIndex: Record<number, string> = {};
    for (const thought of input.thoughts) {
      const parsed = progressEventSchema.safeParse(thought.attention?.metadata?.progress);
      if (!parsed.success) continue;
      thoughtIdByProgressIndex[progress.length] = thought.id;
      progress.push(parsed.data);
    }
    return this.evaluateWithProgress({ progress, thoughtIdByProgressIndex,
      now: input.now, lastFastActivityAt: input.lastFastActivityAt });
  }

  /**
   * ATTENTION_OVERLAP_META_V1 â€” detecta si dos thoughts del mismo turno
   * estÃ¡n en conflicto (atenciÃ³n divergente). Ãštil para el hint
   * slow_failed_urgent cuando dos autores no coinciden.
   * Ver: auditorÃ­a profunda 09 (attentionOverlap no se usaba).
   */
  // META_EVALUATE_ATTENTION_CONFLICT_V1
  detectAttentionConflict(thoughts: Thought[]): boolean {
    const representatives = new Map<string, Thought>();
    for (const thought of thoughts) {
      if (totalAttention(thought.attention) <= 0) continue;
      const scope = JSON.stringify([thought.tenantId, thought.owner, thought.turnId]);
      const first = representatives.get(scope);
      if (!first) representatives.set(scope, thought);
      else if (attentionOverlap(first.attention, thought.attention) < 0.3) return true;
    }
    return false;
  }


  /**
   * KERNEL_META_PROGRESS_V1 - evalua directamente sobre ProgressEvent[].
   *
   * Mas limpio que evaluate() cuando el caller ya tiene los eventos reales:
   * no hay que envolverlos en Thought solo para que Meta los saque por cast.
   *
   * Se usa desde el bucle de meta cuando el slow emite progreso real.
   */
  // META_EVALUATE_PROGRESS_HINTS_V1
  evaluateWithProgress(input: {
    progress: ProgressEvent[];
    lastFastActivityAt?: string;
    now: string;
    thoughtIdByProgressIndex?: Record<number, string>;
  }): MetaHint[] {
    const hints: MetaHint[] = [];
    const nowMs = Date.parse(input.now);
    const fastActivityMs = input.lastFastActivityAt
      ? Date.parse(input.lastFastActivityAt)
      : 0;

    for (let i = 0; i < input.progress.length; i += 1) {
      const parsed = progressEventSchema.safeParse(input.progress[i]);
      if (!parsed.success || !Number.isFinite(nowMs) || (input.lastFastActivityAt && !Number.isFinite(fastActivityMs))) continue;
      const progress = parsed.data;
      const progressMs = Date.parse(progress.timestamp);
      const thoughtId = input.thoughtIdByProgressIndex?.[i];
      if (progressMs > nowMs || (thoughtId && this.seenHints.has(thoughtId))) continue;

      if (progress.kind === "ready") {
        const fastIsIdle = !input.lastFastActivityAt || nowMs - fastActivityMs > this.fastIdleMs;
        if (fastIsIdle) {
          hints.push({
            rule: "slow_ready_fast_idle",
            urgency: "medium",
            message: `Slow completo: ${progress.message.slice(0, 200)}`,
            ...(thoughtId ? { thoughtId } : {}),
          });
        }
      }

      if (progress.kind === "failed") {
        hints.push({
          rule: "slow_failed_urgent",
          urgency: "high",
          message: `Slow fallo: ${progress.message.slice(0, 200)}`,
          ...(thoughtId ? { thoughtId } : {}),
        });
      }

      if (progress.kind === "progress" && nowMs - progressMs > this.longNoOutputMs) {
        hints.push({
          rule: "slow_long_no_output",
          urgency: "low",
          message: `Slow sigue trabajando: ${progress.message.slice(0, 200)}`,
          ...(thoughtId ? { thoughtId } : {}),
        });
      }
    }

    if (hints.length === 0) {
      hints.push({
        rule: "nothing_to_report",
        urgency: "low",
        message: "Nada relevante que reportar al fast.",
      });
    }

    return hints;
  }
}