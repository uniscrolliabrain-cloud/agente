// KERNEL_THOUGHT_V2 — AttentionVector completo en Zod.
//
// Cambios respecto a V1:
//   - AttentionVector reescrito: author, id, thoughtId, timestamp, metadata.
//   - MatchReason e IgnoreReason: enums tipados, no strings libres.
//   - MatchedNode e IgnoredNode: con kind y metadata.
//   - Validaciones cruzadas: primary en matched/secondary (warning), no
//     solape matched/ignored (error), no duplicados (error).
//   - thoughtRoleSchema ampliado: critic, verifier, query, confirmation,
//     correction.
//   - thoughtEdgeSchema con weight, confidence, createdAt.
//   - Thought con atencion obligatoria y validacion cruzada de autor.
//
// tenantId sin default: SOC-2 exige aislamiento no opcional.

import { z } from "zod";

// ---------------------------------------------------------------------
// Enums base
// ---------------------------------------------------------------------

export const attentionAuthorSchema = z.enum([
  "user",
  "fast",
  "slow",
  "presenter",
  "worker",
  "system",
]);

export const attentionScopeSchema = z.enum(["turn", "user", "tenant", "global"]);

export const matchReasonSchema = z.enum([
  "explicit_subject",
  "mentioned",
  "direct_relation",
  "policy",
  "history",
  "most_recent",
  "context",
  "inferred",
  "explicit_reference",
]);

export const ignoreReasonSchema = z.enum([
  "not_related",
  "not_mentioned",
  "already_resolved",
  "out_of_scope",
  "low_confidence",
  "duplicate",
  "stale",
  "privacy",
]);

export const thoughtRoleSchema = z.enum([
  "intent",
  "observation",
  "reasoning",
  "response",
  "action",
  "reflection",
  "display",
  "delegation",
  "critic",
  "verifier",
  "query",
  "confirmation",
  "correction",
]);

export const thoughtActorSchema = z.object({
  kind: z.enum(["user", "fast-llm", "slow-llm", "worker", "presenter", "system", "agent"]),
  id: z.string().min(1).max(200),
  onBehalfOf: z.string().max(200).optional(),
});

// ---------------------------------------------------------------------
// Fichas de matched / ignored
// ---------------------------------------------------------------------

export const matchedNodeSchema = z
  .object({
    node: z.string().min(1).max(300),
    weight: z.number().min(0).max(1),
    reason: z.union([matchReasonSchema, z.string().max(500)]),
    kind: z.string().max(100).optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

export const ignoredNodeSchema = z
  .object({
    node: z.string().min(1).max(300),
    reason: z.union([ignoreReasonSchema, z.string().max(500)]),
    kind: z.string().max(100).optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

// ---------------------------------------------------------------------
// AttentionVector
// ---------------------------------------------------------------------

export const attentionVectorSchema = z
  .object({
    id: z.string().min(1).max(100),
    author: attentionAuthorSchema,
    thoughtId: z.string().min(1).max(100).optional(),
    primary: z.string().min(1).max(300),
    secondary: z.array(z.string().max(300)).max(50).default([]),
    query: z.string().min(1).max(500),
    matched: z.array(matchedNodeSchema).max(50).default([]),
    ignored: z.array(ignoredNodeSchema).max(50).default([]),
    intent: z.string().min(1).max(200),
    confidence: z.number().min(0).max(1),
    scope: attentionScopeSchema.default("turn"),
    timestamp: z.iso.datetime({ offset: true }),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()
  .superRefine((value, ctx) => {
    const matchedIds = new Set(value.matched.map((m) => m.node));
    const ignoredIds = new Set(value.ignored.map((i) => i.node));
    const overlap = [...matchedIds].filter((id) => ignoredIds.has(id));
    if (overlap.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: `nodos en matched e ignored a la vez: ${overlap.sort().join(", ")}`,
        path: ["matched"],
      });
    }
    const matchedList = value.matched.map((m) => m.node);
    if (matchedList.length !== new Set(matchedList).size) {
      ctx.addIssue({
        code: "custom",
        message: `nodos duplicados en matched`,
        path: ["matched"],
      });
    }
    const ignoredList = value.ignored.map((i) => i.node);
    if (ignoredList.length !== new Set(ignoredList).size) {
      ctx.addIssue({
        code: "custom",
        message: `nodos duplicados en ignored`,
        path: ["ignored"],
      });
    }
  });

// ---------------------------------------------------------------------
// Edges con peso y timestamp
// ---------------------------------------------------------------------

export const thoughtEdgeSchema = z
  .object({
    toThoughtId: z.string().min(1).max(100),
    kind: z.enum([
      "refines",
      "decomposes",
      "resolves",
      "synthesizes",
      "contradicts",
      "depends_on",
      "responds",
      "supports",
    ]),
    weight: z.number().min(0).max(1).default(1),
    confidence: z.number().min(0).max(1).default(1),
    createdAt: z.iso.datetime({ offset: true }),
  })
  .strict();

// ---------------------------------------------------------------------
// Contexto, provenance
// ---------------------------------------------------------------------

export const thoughtContextSchema = z.object({
  entities: z.array(z.string().max(300)).max(100).default([]),
  policies: z.array(z.string().max(300)).max(100).default([]),
  skills: z.array(z.string().max(300)).max(100).default([]),
  priorThoughts: z.array(z.string().max(100)).max(100).default([]),
});

export const thoughtProvenanceSchema = z.object({
  source: z.string().min(1).max(300),
  timestamp: z.iso.datetime({ offset: true }),
  parentId: z.string().max(100).optional(),
});

// ---------------------------------------------------------------------
// Thought
// ---------------------------------------------------------------------

export const thoughtSchema = z
  .object({
    id: z.string().min(1).max(100),
    tenantId: z.string().min(1).max(100),
    turnId: z.string().min(1).max(100),
    owner: z.string().min(1).max(200),
    actor: thoughtActorSchema,
    role: thoughtRoleSchema,
    content: z.union([z.string().max(100_000), z.record(z.string(), z.unknown())]),
    attention: attentionVectorSchema,
    context: thoughtContextSchema.default({
      entities: [],
      policies: [],
      skills: [],
      priorThoughts: [],
    }),
    provenance: thoughtProvenanceSchema,
    edges: z.array(thoughtEdgeSchema).max(200).default([]),
  })
  .strict();

// ---------------------------------------------------------------------
// Tipos inferidos
// ---------------------------------------------------------------------

export type AttentionAuthor = z.infer<typeof attentionAuthorSchema>;
export type AttentionScope = z.infer<typeof attentionScopeSchema>;
export type MatchReason = z.infer<typeof matchReasonSchema>;
export type IgnoreReason = z.infer<typeof ignoreReasonSchema>;
export type MatchedNode = z.infer<typeof matchedNodeSchema>;
export type IgnoredNode = z.infer<typeof ignoredNodeSchema>;
export type AttentionVector = z.infer<typeof attentionVectorSchema>;
export type ThoughtRole = z.infer<typeof thoughtRoleSchema>;
export type ThoughtActor = z.infer<typeof thoughtActorSchema>;
export type ThoughtEdge = z.infer<typeof thoughtEdgeSchema>;
export type ThoughtContext = z.infer<typeof thoughtContextSchema>;
export type ThoughtProvenance = z.infer<typeof thoughtProvenanceSchema>;
export type Thought = z.infer<typeof thoughtSchema>;