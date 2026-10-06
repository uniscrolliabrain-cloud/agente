// SLOW_AUTHOR_PROGRESS_V2 - emite ProgressEvent inicio/ready/failed.
// KERNEL_SLOW_AUTHOR_V2 - escribe razonamiento y delegacion reales al grafo.
//
// Cambios respecto a V1:
//   - writeReasoning recibe content real, no el prompt del task.
//   - Acepta matched, ignored, entities, policies, skills como input.
//   - writeDelegation tiene la misma firma. Antes existia pero nadie la llamaba.
//   - El provenance es "slow.llm" (antes era "slow").
//
// Quien lo llama:
//   model.ts, cuando el slow LLM termina de razonar en una tarea durable.
//   Antes el output se metia en run-events y el kernel nunca lo veia.

import { randomUUID } from "node:crypto";
import type { KernelContext } from "../context/kernel-context.ts";
import type { Thought } from "../graph/thought.ts";
import type { Kernel } from "../kernel.ts";
import { progressStep } from "../graph/progress.ts";

export interface SlowAuthorDeps {
  kernel: Kernel;
}

export interface SlowAuthorWriteInput {
  turnId: string;
  content: string;
  intent?: string;
  confidence?: number;
  // AUTHOR_MATCHED_METADATA_V1 - metadata opcional para que el schema Zod la
  // rellene con {} al parsear. El schema tiene `metadata: Record<string, unknown> = {}`
  // pero el tipo de entrada no lo exigia, y al construir el Thought directo
  // (sin parse) los matched/ignored llegaban sin metadata.
  matched?: Array<{
    node: string;
    weight: number;
    reason: string;
    metadata?: Record<string, unknown>;
  }>;
  ignored?: Array<{
    node: string;
    reason: string;
    metadata?: Record<string, unknown>;
  }>;
  // AUTHOR_METADATA_NORMALIZE_V1 - el schema Zod exige metadata en cada
  // matched/ignored. Normalizamos aqui para que el caller pueda omitirlo.
  entities?: string[];
  policies?: string[];
  skills?: string[];
  parentThoughtId?: string;
}

export class SlowAuthor {
  constructor(private readonly deps: SlowAuthorDeps) {}

  async writeReasoning(ctx: KernelContext, input: SlowAuthorWriteInput): Promise<Thought> {
    const now = new Date().toISOString();
    // SLOW_AUTHOR_PROGRESS_ATTENTION_V1 - antes hacíamos `void progressStep(...)`
    // que descartaba el evento. Ahora lo persistimos como un thought de rol
    // "display" con el ProgressEvent dentro, para que Meta y el Presenter
    // puedan leerlo sin reconstruirlo desde strings.
    const progressEvent = progressStep(0, 1, "slow.reasoning.start");
    return this.deps.kernel.appendThought(ctx, {
      turnId: input.turnId,
      actor: { kind: "slow-llm", id: "slow" },
      role: "reasoning",
      content: input.content,
      attention: {
        id: randomUUID(),
        author: "slow",
        primary: "reasoning",
        secondary: [],
        query: "",
        // SLOW_AUTHOR_ATTENTION_V1
        matched: (input.matched ?? []).length > 0
          ? (input.matched ?? []).map((m) => ({ ...m, metadata: m.metadata ?? {} }))
          : [{ node: "reasoning", weight: 0.6, reason: "slow reasoning", metadata: {} }],
        ignored: (input.ignored ?? []).map((i) => ({ ...i, metadata: i.metadata ?? {} })),
        intent: input.intent ?? "reason",
        confidence: input.confidence ?? 0.8,
        scope: "turn",
        timestamp: now,
        metadata: { progress: progressEvent },
      },
      context: {
        entities: input.entities ?? [],
        policies: input.policies ?? [],
        skills: input.skills ?? [],
        priorThoughts: [],
      },
      edges: [],
      provenance: {
        source: "slow.llm",
        timestamp: now,
        ...(input.parentThoughtId ? { parentId: input.parentThoughtId } : {}),
      },
    });
  }

  async writeDelegation(ctx: KernelContext, input: SlowAuthorWriteInput): Promise<Thought> {
    const now = new Date().toISOString();
    // SLOW_AUTHOR_DELEGATION_PROGRESS_V2 - writeReasoning ya tenia
    // progressEvent local; writeDelegation lo usaba sin declararlo. Lo
    // creamos aqui con un mensaje propio de delegacion.
    const progressEvent = progressStep(0, 1, "slow.delegation.start");
    return this.deps.kernel.appendThought(ctx, {
      turnId: input.turnId,
      actor: { kind: "slow-llm", id: "slow" },
      role: "delegation",
      content: input.content,
      attention: {
        id: randomUUID(),
        author: "slow",
        primary: "delegation",
        secondary: [],
        query: "",
        // SLOW_AUTHOR_DELEGATION_ATTENTION_V1
        matched: (input.matched ?? []).length > 0
          ? (input.matched ?? []).map((m) => ({ ...m, metadata: m.metadata ?? {} }))
          : [{ node: "delegation", weight: 0.5, reason: "slow delegation", metadata: {} }],
        ignored: (input.ignored ?? []).map((i) => ({ ...i, metadata: i.metadata ?? {} })),
        intent: input.intent ?? "delegate",
        confidence: input.confidence ?? 0.8,
        scope: "turn",
        timestamp: now,
        metadata: { progress: progressEvent },
      },
      context: {
        entities: input.entities ?? [],
        policies: input.policies ?? [],
        skills: input.skills ?? [],
        priorThoughts: [],
      },
      edges: [],
      provenance: {
        source: "slow.delegation",
        timestamp: now,
        ...(input.parentThoughtId ? { parentId: input.parentThoughtId } : {}),
      },
    });
  }
}
