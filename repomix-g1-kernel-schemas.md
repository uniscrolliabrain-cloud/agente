This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: apps/server/src/kernel/context/kernel-context.ts, apps/server/src/kernel/graph/turn.ts, apps/server/src/kernel/graph/thought.ts
- Files matching these patterns are excluded: **/node_modules/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      kernel/
        context/
          kernel-context.ts
        graph/
          thought.ts
          turn.ts
```

# Files

## File: apps/server/src/kernel/graph/turn.ts
```typescript
// KERNEL_TURN_V2 â€” ciclo de vida completo.
//
// Cambios respecto a V1:
//   - parentTurnId: si el slow sigue tras cerrar el padre, abre turno hijo.
//   - quiescentAt / quiescenceMs: el turno se puede cerrar por quiescencia
//     (nadie escribe durante X ms), no solo por tiempo.
//   - closedBy: quien cerro el turno (presenter, quiescence, timeout, user).
//   - childTurnIds: array de turnos hijos.

import { z } from "zod";

export const turnCloseReasonSchema = z.enum(["response", "timeout", "promotion", "quiescence"]);
export const turnStatusSchema = z.enum(["open", "closed", "promoted"]);
export const turnClosedBySchema = z.enum(["presenter", "quiescence", "timeout", "user", "system"]);

export const turnSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  parentTurnId: z.string().max(100).optional(),
  childTurnIds: z.array(z.string().max(100)).max(100).default([]),
  startedAt: z.iso.datetime({ offset: true }),
  closedAt: z.iso.datetime({ offset: true }).optional(),
  quiescentAt: z.iso.datetime({ offset: true }).optional(),
  quiescenceMs: z.number().int().min(0).max(600_000).default(10_000),
  status: turnStatusSchema,
  thoughtIds: z.array(z.string().max(100)).max(500).default([]),
  triggers: z.array(z.string().max(100)).max(50).default([]),

  // TURN_PERSONA_V1 - persona funcional que abrio este turno. Opcional.
  personaId: z.string().min(1).max(80).optional(),  closeReason: turnCloseReasonSchema.optional(),
  closedBy: turnClosedBySchema.optional(),
});

export type TurnStatus = z.infer<typeof turnStatusSchema>;
export type TurnCloseReason = z.infer<typeof turnCloseReasonSchema>;
export type TurnClosedBy = z.infer<typeof turnClosedBySchema>;
export type Turn = z.infer<typeof turnSchema>;
```

## File: apps/server/src/kernel/context/kernel-context.ts
```typescript
// KERNEL_CONTEXT_V1 â€” identidad de cada operacion del kernel.
//
// Por que existe: SOC-2 exige control de acceso y trazabilidad. Cada
// operacion del kernel (abrir turno, escribir pensamiento, cerrar turno,
// promover) recibe un KernelContext. Sin el, no se ejecuta nada. Eso es
// defensa en profundidad: si alguien llama a openTurn sin contexto, no
// compila.

import { z } from "zod";

export const kernelRoleSchema = z.enum(["admin", "user", "agent", "system"]);

// KERNEL_CONTEXT_V2 - anadidos threadId, parentTurnId, correlationId.
// Estos campos permiten reusar turnos abiertos del mismo thread y correlacionar
// HTTP <-> task <-> turn. Son opcionales para no romper llamadas existentes.
export const kernelContextSchema = z.object({
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  role: kernelRoleSchema,
  requestId: z.string().min(1).max(100),
  threadId: z.string().min(1).max(200).optional(),
  parentTurnId: z.string().min(1).max(100).optional(),
  correlationId: z.string().min(1).max(200).optional(),

  // KERNEL_PERSONA_V1 - persona funcional que habla en este turno.
  personaId: z.string().min(1).max(80).optional(),});

export type KernelRole = z.infer<typeof kernelRoleSchema>;
export type KernelContext = z.infer<typeof kernelContextSchema>;

/** Helper para construir contextos de test o de sistema sin repetir campos. */
export function systemContext(tenantId: string, owner: string, requestId: string): KernelContext {
  return kernelContextSchema.parse({ tenantId, owner, role: "system", requestId });
}
```

## File: apps/server/src/kernel/graph/thought.ts
```typescript
// KERNEL_THOUGHT_V2 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â AttentionVector completo en Zod.
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
  // THOUGHT_PERSONA_V1 - persona funcional que escribio este thought.
  personaId: z.string().min(1).max(80).optional(),
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

// ATTENTION_STRICT_V1 - .strict() para que un campo desconocido en provenance
// se detecte (antes se descartaba silenciosamente).
export const thoughtProvenanceSchema = z
  .object({
    source: z.string().min(1).max(300),
    timestamp: z.iso.datetime({ offset: true }),
    parentId: z.string().max(100).optional(),
    // PROVENANCE_CORRELATION_V1 - trazabilidad HTTP -> kernel.
    correlationId: z.string().max(200).optional(),
  })
  .strict();

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
```
