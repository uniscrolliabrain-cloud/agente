// COGNITION_CARD_BUILDER_V1 - convierte un Thought real en una tarjeta.
//
// Determinista: no llama a ningun LLM. La tarjeta es una proyeccion del
// pensamiento con evidencia, no una segunda interpretacion.

import { createHash } from "node:crypto";
import {
  cognitionCardSchema,
  type CognitionCard,
  type CognitionCardKind,
} from "../../../../../packages/domain/src/cognition-card.ts";
import { parseNodeRef } from "../../../../../packages/domain/src/node-ref.ts";
import type { Thought } from "../graph/thought.ts";

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface BuildCognitionCardInput {
  thought: Thought;
  threadId?: string;
  /** Clave estable de la operacion; evita duplicar la tarjeta en un reintento. */
  dedupeKey?: string;
  /** Modelo que produjo el pensamiento, si el caller lo conoce. */
  model?: string;
  ttlMs?: number;
  now?: Date;
}

function contentText(thought: Thought): string {
  const raw =
    typeof thought.content === "string"
      ? thought.content
      : JSON.stringify(thought.content);
  return raw.replace(/\r\n/g, "\n").trim();
}

function firstLine(text: string): string {
  const line = text
    .split("\n")
    .map((value) => value.trim())
    .find((value) => value.length > 0);
  return (line ?? "Hallazgo del analisis").slice(0, 160);
}

function inferKind(thought: Thought, body: string): CognitionCardKind {
  const haystack = `${thought.attention.intent} ${body}`.toLowerCase();
  if (/\b(riesgo|risk|peligro|amenaza|warning)\b/.test(haystack)) return "risk";
  if (/\b(oportunidad|opportunity|ventaja|upside)\b/.test(haystack)) return "opportunity";
  if (/\b(decision|decisi[oó]n|decidir|elegir)\b/.test(haystack)) return "decision";
  if (/\b(resumen|summary|conclusi[oó]n|conclusion)\b/.test(haystack)) return "summary";
  if (/\?\s*$/.test(body)) return "question";
  return "insight";
}

export function buildCognitionCard(input: BuildCognitionCardInput): CognitionCard {
  const thought = input.thought;
  const body = contentText(thought);
  if (!body) throw new Error("CognitionCard requiere contenido real del slow");
  const createdAt = thought.provenance.timestamp;
  const createdAtMs = Date.parse(createdAt);
  const now = input.now ?? new Date();
  const ttlMs = input.ttlMs ?? DEFAULT_TTL_MS;
  const expiresAt = Number.isFinite(createdAtMs)
    ? new Date(createdAtMs + ttlMs).toISOString()
    : new Date(now.getTime() + ttlMs).toISOString();
  // COGNITION_CARD_ID_V1 - hash estable: reintentar la misma captura devuelve
  // la misma tarjeta y el store no duplica.
  // La clave estable es la operacion (por ejemplo task:<id>), no el thought:
  // un reintento escribe otro thought pero no debe crear otra tarjeta.
  const id = createHash("sha256")
    .update(
      `cognition-card:${thought.tenantId}:${input.dedupeKey ?? thought.id}:1`,
    )
    .digest("hex");
  const entityRefs = thought.context.entities
    .map((entity) => parseNodeRef(entity))
    .slice(0, 20);
  return cognitionCardSchema.parse({
    id,
    tenantId: thought.tenantId,
    owner: thought.owner,
    ...(input.threadId ? { threadId: input.threadId } : {}),
    turnId: thought.turnId,
    thoughtId: thought.id,
    kind: inferKind(thought, body),
    title: firstLine(body),
    body: body.slice(0, 8000),
    status: "proposed",
    scope: "thread",
    confidence: thought.attention.confidence,
    evidence: {
      thoughtIds: [thought.id],
      entityRefs,
    },
    attention: {
      primary: thought.attention.primary,
      matched: thought.attention.matched
        .map((match) => ({ node: match.node, weight: match.weight }))
        .slice(0, 20),
    },
    provenance: {
      source: "slow.llm",
      ...(input.model ? { model: input.model } : {}),
      createdAt,
      expiresAt,
    },
    version: 1,
  });
}
