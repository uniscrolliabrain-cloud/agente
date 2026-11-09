// SLOW_COGNITION_CAPTURE_V1 - puente unico slow -> thought -> tarjeta.
//
// model.ts llama a captureSlowCognition cuando termina el slow LLM. El
// pensamiento se escribe con contenido real y se proyecta en una tarjeta con
// evidencia; no se guarda el prompt como si fuera razonamiento.

import type { KernelContext } from "../context/kernel-context.ts";
import {
  SlowAuthor,
  type SlowAuthorWriteInput,
} from "../authors/slow-author.ts";
import type { Kernel } from "../kernel.ts";
import type { Thought } from "../graph/thought.ts";
import type { CognitionCard } from "../../../../../packages/domain/src/cognition-card.ts";
import { buildCognitionCard } from "./card-builder.ts";
import type { CognitionCardStore } from "./card-store.ts";

export interface CaptureSlowCognitionDeps {
  kernel: Kernel;
  cards: CognitionCardStore;
}

export interface CaptureSlowCognitionInput extends SlowAuthorWriteInput {
  ctx: KernelContext;
  turnId: string;
  content: string;
  threadId?: string;
  dedupeKey?: string;
  model?: string;
  ttlMs?: number;
  now?: Date;
}

export interface CaptureSlowCognitionResult {
  thought: Thought;
  card: CognitionCard;
  created: boolean;
}

export async function captureSlowCognition(
  deps: CaptureSlowCognitionDeps,
  input: CaptureSlowCognitionInput,
): Promise<CaptureSlowCognitionResult> {
  const author = new SlowAuthor({ kernel: deps.kernel });
  const thought = await author.writeReasoning(input.ctx, {
    ...input,
    // COGNITION_SLOW_READY_V1 - el slow ya termino: el ProgressEvent debe ser
    // "ready", no "start". Meta y la UI pueden saber que hay material nuevo.
    progress: "ready",
  });
  const card = buildCognitionCard({
    thought,
    ...(input.threadId ?? input.ctx.threadId
      ? { threadId: input.threadId ?? input.ctx.threadId }
      : {}),
    ...(input.dedupeKey ? { dedupeKey: input.dedupeKey } : {}),
    ...(input.model ? { model: input.model } : {}),
    ...(input.ttlMs !== undefined ? { ttlMs: input.ttlMs } : {}),
    ...(input.now ? { now: input.now } : {}),
  });
  const saved = await deps.cards.save(card);
  return { thought, card: saved.card, created: saved.created };
}
