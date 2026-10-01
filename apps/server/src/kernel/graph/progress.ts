// KERNEL_PROGRESS_V1 — eventos de progreso del slow LLM.
//
// El fast necesita saber si el slow esta trabajando para decir "dame un
// momento" sin mentir ni inventar. Esto requiere que el slow emita eventos
// de progreso, no solo de finalizacion:
//   - progress: paso X de Y, "consultando business graph".
//   - partial:  resultado parcial disponible.
//   - ready:    resultado completo disponible.
//   - failed:   error.
//
// El fast lee estos eventos del grafo del turno y los usa para disimular
// bien: "lo estoy preparando, dame un momento" cuando hay progress, y
// "aqui tienes" cuando hay ready.

import { z } from "zod";

export const progressKindSchema = z.enum(["progress", "partial", "ready", "failed"]);

export const progressEventSchema = z.object({
  kind: progressKindSchema,
  step: z.number().int().min(0).max(1000),
  totalSteps: z.number().int().min(0).max(1000),
  message: z.string().min(1).max(1000),
  timestamp: z.iso.datetime({ offset: true }),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type ProgressKind = z.infer<typeof progressKindSchema>;
export type ProgressEvent = z.infer<typeof progressEventSchema>;

export function progressStep(
  step: number,
  totalSteps: number,
  message: string,
): ProgressEvent {
  return progressEventSchema.parse({
    kind: "progress",
    step,
    totalSteps,
    message,
    timestamp: new Date().toISOString(),
    metadata: {},
  });
}

export function partialResult(message: string): ProgressEvent {
  return progressEventSchema.parse({
    kind: "partial",
    step: 0,
    totalSteps: 0,
    message,
    timestamp: new Date().toISOString(),
    metadata: {},
  });
}

export function readyResult(message: string): ProgressEvent {
  return progressEventSchema.parse({
    kind: "ready",
    step: 0,
    totalSteps: 0,
    message,
    timestamp: new Date().toISOString(),
    metadata: {},
  });
}

export function failedResult(message: string): ProgressEvent {
  return progressEventSchema.parse({
    kind: "failed",
    step: 0,
    totalSteps: 0,
    message,
    timestamp: new Date().toISOString(),
    metadata: {},
  });
}