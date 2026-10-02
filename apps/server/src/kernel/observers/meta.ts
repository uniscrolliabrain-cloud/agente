// KERNEL_META_V1 — metaconsciencia como policy engine.
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
import type { ProgressEvent } from "../graph/progress.ts";

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

export interface MetaDeps {
  longNoOutputMs?: number;
}

export class Meta {
  private readonly longNoOutputMs: number;

  constructor(deps: MetaDeps = {}) {
    this.longNoOutputMs = deps.longNoOutputMs ?? 30_000;
  }

  evaluate(input: MetaInput): MetaHint[] {
    const hints: MetaHint[] = [];
    const nowMs = Date.parse(input.now);
    const fastActivityMs = input.lastFastActivityAt
      ? Date.parse(input.lastFastActivityAt)
      : 0;

    for (const thought of input.thoughts) {
      const progress = this.extractProgress(thought);
      if (!progress) continue;
      const progressMs = Date.parse(progress.timestamp);

      if (progress.kind === "ready") {
        const fastIsIdle = !input.lastFastActivityAt || nowMs - fastActivityMs > 1000;
        if (fastIsIdle) {
          hints.push({
            rule: "slow_ready_fast_idle",
            urgency: "medium",
            message: `Slow completo: ${progress.message.slice(0, 200)}`,
            thoughtId: thought.id,
          });
        }
      }

      if (progress.kind === "failed") {
        hints.push({
          rule: "slow_failed_urgent",
          urgency: "high",
          message: `Slow fallo: ${progress.message.slice(0, 200)}`,
          thoughtId: thought.id,
        });
      }

      if (progress.kind === "progress" && nowMs - progressMs > this.longNoOutputMs) {
        hints.push({
          rule: "slow_long_no_output",
          urgency: "low",
          message: `Slow sigue trabajando: ${progress.message.slice(0, 200)}`,
          thoughtId: thought.id,
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

  private extractProgress(thought: Thought): ProgressEvent | undefined {
    const raw = (thought as unknown as { progress?: unknown }).progress;
    if (!raw || typeof raw !== "object") return undefined;
    return raw as ProgressEvent;
  }

  /**
   * KERNEL_META_PROGRESS_V1 - evalua directamente sobre ProgressEvent[].
   *
   * Mas limpio que evaluate() cuando el caller ya tiene los eventos reales:
   * no hay que envolverlos en Thought solo para que Meta los saque por cast.
   *
   * Se usa desde el bucle de meta cuando el slow emite progreso real.
   */
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
      const progress = input.progress[i];
      const progressMs = Date.parse(progress.timestamp);
      const thoughtId = input.thoughtIdByProgressIndex?.[i];

      if (progress.kind === "ready") {
        const fastIsIdle = !input.lastFastActivityAt || nowMs - fastActivityMs > 1000;
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