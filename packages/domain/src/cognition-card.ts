// COGNITION_CARD_V1 - tarjeta cognitiva generada desde un Thought del slow.
//
// No es una CommunicationCard (plantilla fija de mensaje) ni una OperationsCard
// (tarjeta operativa publicada). Es una proyeccion con evidencia del
// razonamiento lento: se guarda aparte del grafo de negocio y solo se inyecta
// como dato en el contexto del chat.

import { z } from "zod";
import { nodeRefSchema } from "./node-ref.ts";

export const cognitionCardKindSchema = z.enum([
  "insight",
  "risk",
  "opportunity",
  "decision",
  "summary",
  "question",
]);

export const cognitionCardStatusSchema = z.enum([
  "proposed",
  "consumed",
  "expired",
  "superseded",
]);

// COGNITION_CARD_SCOPE_V1 - por defecto vive en el hilo y owner que la creo.
// Si el usuario la marca como util, se promueve a tenant y puede verse desde
// otros hilos del mismo owner.
export const cognitionCardScopeSchema = z.enum(["thread", "tenant"]);

export const cognitionCardSchema = z
  .object({
    id: z.string().min(1).max(200),
    tenantId: z.string().min(1).max(100),
    owner: z.string().min(1).max(200),
    threadId: z.string().min(1).max(200).optional(),
    turnId: z.string().min(1).max(100),
    thoughtId: z.string().min(1).max(100),
    kind: cognitionCardKindSchema,
    title: z.string().min(1).max(160),
    body: z.string().min(1).max(8000),
    status: cognitionCardStatusSchema.default("proposed"),
    scope: cognitionCardScopeSchema.default("thread"),
    confidence: z.number().min(0).max(1),
    evidence: z.object({
      // COGNITION_CARD_EVIDENCE_V1 - una tarjeta sin pensamiento de origen no
      // es una tarjeta: es una ocurrencia sin trazabilidad.
      thoughtIds: z.array(z.string().min(1).max(100)).min(1).max(20),
      entityRefs: z.array(nodeRefSchema).max(20).default([]),
      memoryIds: z.array(z.string().min(1).max(100)).max(20).optional(),
    }),
    attention: z.object({
      primary: z.string().min(1).max(300),
      matched: z
        .array(
          z.object({
            node: z.string().min(1).max(300),
            weight: z.number().min(0).max(1),
          }),
        )
        .max(20)
        .default([]),
    }),
    provenance: z.object({
      source: z.enum(["slow.llm", "sop", "system"]),
      model: z.string().min(1).max(200).optional(),
      createdAt: z.iso.datetime({ offset: true }),
      expiresAt: z.iso.datetime({ offset: true }).optional(),
    }),
    usefulAt: z.iso.datetime({ offset: true }).optional(),
    consumedAt: z.iso.datetime({ offset: true }).optional(),
    version: z.number().int().positive().default(1),
  })
  .strict();

export type CognitionCardKind = z.infer<typeof cognitionCardKindSchema>;
export type CognitionCardStatus = z.infer<typeof cognitionCardStatusSchema>;
export type CognitionCardScope = z.infer<typeof cognitionCardScopeSchema>;
export type CognitionCard = z.infer<typeof cognitionCardSchema>;
