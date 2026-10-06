// KERNEL_FAST_AUTHOR_V2 - escribe la respuesta real del fast LLM al grafo.
//
// Cambios respecto a V1:
//   - Acepta matched, ignored, entities, policies, skills como input.
//   - El AttentionVector lleva esa informacion en vez de arrays vacios.
//   - El provenance es "fast.llm" (antes era "fast").
//   - El content es el output real del LLM, no un placeholder.
//
// Quien lo llama:
//   conversation.ts, cuando el fast LLM termina de responder al usuario.
//   Antes el output iba directo al SSE y el kernel nunca lo veia.

import { randomUUID } from "node:crypto";
import type { KernelContext } from "../context/kernel-context.ts";
import type { Thought } from "../graph/thought.ts";
import type { Kernel } from "../kernel.ts";

export interface FastAuthorDeps {
  kernel: Kernel;
}

export interface FastAuthorWriteInput {
  turnId: string;
  response: string;
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

export class FastAuthor {
  constructor(private readonly deps: FastAuthorDeps) {}

  async writeResponse(ctx: KernelContext, input: FastAuthorWriteInput): Promise<Thought> {
    const now = new Date().toISOString();
    // FAST_AUTHOR_ATTENTION_V1 - si el caller no pasa matched/ignored, los
    // derivamos de las entidades mencionadas en la respuesta. Busqueda por
    // substring simple: si el nombre de una entidad aparece en el texto,
    // cuenta como matched con weight proporcional a la longitud del match.
    const matched =
      input.matched ??
      (input.entities ?? []).flatMap((entity) => {
        const idx = input.response.toLowerCase().indexOf(entity.toLowerCase());
        if (idx < 0) return [];
        const weight = Math.min(1, entity.length / Math.max(1, input.response.length / 10));
        return [{ node: entity, weight, reason: "mentioned", metadata: { idx } }];
      });
    const ignored = input.ignored ?? [];
    return this.deps.kernel.appendThought(ctx, {
      turnId: input.turnId,
      actor: { kind: "fast-llm", id: "fast" },
      role: "response",
      content: input.response,
      attention: {
        id: randomUUID(),
        author: "fast",
        primary: "response",
        secondary: [],
        query: input.response.slice(0, 500) || "respond", // FAST_AUTHOR_QUERY_V1
        matched: matched.map((m) => ({ ...m, metadata: m.metadata ?? {} })),
        ignored: ignored.map((i) => ({ ...i, metadata: i.metadata ?? {} })),
        intent: input.intent ?? "respond",
        confidence: input.confidence ?? 0.9,
        scope: "turn",
        timestamp: now,
        metadata: {},
      },
      context: {
        entities: input.entities ?? [],
        policies: input.policies ?? [],
        skills: input.skills ?? [],
        priorThoughts: [],
      },
      edges: [],
      provenance: {
        source: "fast.llm",
        timestamp: now,
        ...(input.parentThoughtId ? { parentId: input.parentThoughtId } : {}),
      },
    });
  }
}
