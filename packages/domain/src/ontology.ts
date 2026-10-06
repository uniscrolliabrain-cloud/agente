// ONTOLOGY_V1 - bundle de ontologia por tenant + capability specs + validador.
//
// Un OntologyBundle es una foto auditable, congelada y versionada del
// vocabulario efectivo de un tenant. El kernel la valida fail-closed en
// bootstrap y nunca la modifica en runtime.
//
// Simplificacion deliberada vs agentic-os: este validador NO comprueba
// relaciones de instancia (que referencien entidades declaradas). Solo
// valida los kinds. La validacion de instancias vive en el registro
// de entidades del dominio.
//
// Ver: docs/audits/09-kernel-cognitivo/09z-fundamentos.md

import { z } from "zod";
import { actionTypeSchema } from "./actions.ts";
import { taxonomyFamilySchema } from "./taxonomy.ts";

// --- OntologyBundle ---

export const ontologyBundleSchema = z.object({
  version: z.number().int().positive(),
  tenantScope: z.string().max(200),
  entities: z.array(z.string().max(200)).max(1000),
  relations: z.array(z.string().max(200)).max(1000),
  capabilities: z.array(z.string().max(200)).max(1000),
  frozen: z.literal(true),
});

export type OntologyBundle = z.infer<typeof ontologyBundleSchema>;

// --- CognitiveSpec ---

export const cognitiveAttentionSchema = z.object({
  focus: z.string().max(200),
  secondary: z.array(z.string().max(200)).max(20).default([]),
});

export const cognitiveProgressSchema = z.object({
  emits: z.boolean().default(false),
  everyMs: z.number().int().positive().default(30_000),
});

// ONTOLOGY_PROMOTION_DEST_KEY_V1 - la clave es `destination` (singular)
// para coincidir con promote.ts:PromotionDestination. Antes era
// `destinations` (plural) y generaba confusion.
export const cognitivePromotionSchema = z.object({
  destination: z
    .array(z.enum(["response", "memory", "business-graph", "audit", "discard"]))
    .min(1)
    .max(5),
});

export const cognitivePresentationSchema = z.object({
  priority: z
    .array(
      z.enum([
        "response", "display", "confirmation", "correction",
        "reasoning", "critic", "verifier", "observation",
        "action", "reflection", "delegation", "query", "intent",
      ]),
    )
    .min(1)
    .max(13),
});

export const cognitiveSpecSchema = z.object({
  attention: cognitiveAttentionSchema.optional(),
  progress: cognitiveProgressSchema.optional(),
  promotion: cognitivePromotionSchema.optional(),
  presentation: cognitivePresentationSchema.optional(),
});

export type CognitiveSpec = z.infer<typeof cognitiveSpecSchema>;

// --- CapabilitySpec ---

export const capabilitySpecSchema = z.object({
  id: z.string().min(1).max(200),
  actionType: actionTypeSchema,
  family: taxonomyFamilySchema,
  cognitive: cognitiveSpecSchema.default({}),
});

export type CapabilitySpec = z.infer<typeof capabilitySpecSchema>;

// --- Validador del metamodelo ---

const SLUG_RE = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;

export function isCanonicalSlug(kind: string): boolean {
  return SLUG_RE.test(kind);
}

export interface ValidateInput {
  entityKinds?: readonly string[];
  relationKinds?: readonly string[];
  capabilityKinds?: readonly string[];
  tenantScope?: string;
  baseVocabulary?: {
    entities: readonly string[];
    relations: readonly string[];
    capabilities: readonly string[];
  };
}

export interface ValidateResult {
  bundle: OntologyBundle;
  warnings: string[];
}

export class OntologyValidationError extends Error {
  readonly errors: readonly string[];
  constructor(message: string, errors: readonly string[]) {
    super(message);
    this.name = "OntologyValidationError";
    this.errors = errors;
  }
}

/**
 * Valida el vocabulario declarado por un tenant contra el metamodelo.
 * Se llama SOLO en bootstrap. El runtime nunca valida vocabulario.
 */
export function validateAgainstMetamodel(input: ValidateInput): ValidateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const entityKinds = input.entityKinds ?? [];
  const relationKinds = input.relationKinds ?? [];
  const capabilityKinds = input.capabilityKinds ?? [];
  const base = input.baseVocabulary ?? { entities: [], relations: [], capabilities: [] };

  for (const k of entityKinds) {
    if (!isCanonicalSlug(k)) errors.push(`entity kind no canonico: ${k}`);
  }
  for (const k of relationKinds) {
    if (!isCanonicalSlug(k)) errors.push(`relation kind no canonico: ${k}`);
  }
  for (const k of capabilityKinds) {
    if (!isCanonicalSlug(k)) errors.push(`capability kind no canonico: ${k}`);
  }

  const baseEnt = new Set(base.entities);
  const baseRel = new Set(base.relations);
  const baseCap = new Set(base.capabilities);
  for (const k of entityKinds) {
    if (baseEnt.has(k)) errors.push(`colision con vocabulario base (entity): ${k}`);
  }
  for (const k of relationKinds) {
    if (baseRel.has(k)) errors.push(`colision con vocabulario base (relation): ${k}`);
  }
  for (const k of capabilityKinds) {
    if (baseCap.has(k)) errors.push(`colision con vocabulario base (capability): ${k}`);
  }

  if (errors.length > 0) {
    throw new OntologyValidationError(
      `ontologia invalida:\n- ${errors.join("\n- ")}`,
      errors,
    );
  }

  const dup = (xs: readonly string[]) => xs.filter((x, i) => xs.indexOf(x) !== i);
  for (const k of dup(entityKinds)) warnings.push(`entity duplicado: ${k}`);
  for (const k of dup(relationKinds)) warnings.push(`relation duplicado: ${k}`);
  for (const k of dup(capabilityKinds)) warnings.push(`capability duplicado: ${k}`);

  const bundle = ontologyBundleSchema.parse({
    version: 1,
    tenantScope: input.tenantScope ?? "",
    entities: [...new Set([...base.entities, ...entityKinds])],
    relations: [...new Set([...base.relations, ...relationKinds])],
    capabilities: [...new Set([...base.capabilities, ...capabilityKinds])],
    frozen: true,
  });

  return { bundle, warnings };
}