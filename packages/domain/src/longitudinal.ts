/** Longitudinal information contracts; parsing never grants authority. */
import { z } from "zod";
import { cognitiveIdentitySchema, cognitiveRefSchema } from "./cognition-v2.ts";
const id = z.string().min(1).max(200);
const refs = z.array(cognitiveRefSchema).min(1).max(32);
export const longitudinalScopeSchema = z.strictObject({ identity: cognitiveIdentitySchema, threadId: id });
export const anchorAnnotationSchema = z
  .strictObject({
    scope: longitudinalScopeSchema,
    cardRef: cognitiveRefSchema.refine((ref) => ref.kind === "card"),
    kind: z.enum([
      "axiom",
      "intent",
      "invariant",
      "finding",
      "distinction",
      "contradiction",
      "hypothesis",
      "decision",
      "question",
      "synthesis",
      "correction",
    ]),
    authority: z.enum(["user_stated", "model_proposed", "authorized_source"]),
    state: z.enum(["active", "disputed", "superseded"]),
    sourceRefs: refs,
  })
  .superRefine((value, ctx) => {
    if ([value.cardRef, ...value.sourceRefs].some((ref) => ref.tenantId !== value.scope.identity.tenantId))
      ctx.addIssue({ code: "custom", message: "cross-tenant anchor" });
  });
export const longitudinalDeltaSchema = z.strictObject({
  expectedRevision: z.number().int().nonnegative(),
  watermark: z.string().regex(/^(0|[1-9][0-9]*)$/),
  skillId: id,
  skillVersion: id,
  proposals: z
    .array(
      z
        .strictObject({
          op: z.enum(["add", "refine", "dispute", "supersede"]),
          target: cognitiveRefSchema.optional(),
          body: z.string().min(1).max(4000),
          evidence: z.array(cognitiveRefSchema).min(1).max(30),
        })
        .refine((p) => (p.op === "add" ? !p.target : !!p.target), "target required only for existing anchors"),
    )
    .max(8),
});
export type LongitudinalScope = z.infer<typeof longitudinalScopeSchema>;
export type AnchorAnnotation = z.infer<typeof anchorAnnotationSchema>;
export type LongitudinalDelta = z.infer<typeof longitudinalDeltaSchema>;

export const narrativeSourceManifestSchema = z
  .strictObject({
    identity: cognitiveIdentitySchema,
    sourceRef: cognitiveRefSchema.refine((ref) => ref.kind === "document"),
    sectionId: id,
    sourceKind: z.enum(["book", "transcript", "interview", "llm_brief"]),
    sourceDigest: z.string().regex(/^[a-f0-9]{64}$/),
    rightsGrantRefs: refs,
    permittedUses: z
      .array(z.enum(["extraction", "publication"]))
      .min(1)
      .max(2),
    locale: z.string().min(2).max(35),
    normalizationVersion: z.literal("original-utf16-v1"),
  })
  .superRefine((value, ctx) => {
    if ([value.sourceRef, ...value.rightsGrantRefs].some((ref) => ref.tenantId !== value.identity.tenantId))
      ctx.addIssue({ code: "custom", message: "cross-tenant source" });
  });
export const narrativeDraftSchema = z
  .strictObject({
    id,
    revision: z.number().int().positive(),
    tenantId: id,
    sectionId: id,
    roleIds: z.array(id).min(1).max(32),
    sourceRefs: refs,
    origin: z.enum(["llm_proposal", "source_extraction", "human_authored"]),
    communicativeIntent: id,
    semanticTriggers: z.array(z.string().min(1).max(200)).min(1).max(16),
    // Receipt conditions describe data; no expression evaluation or tool dispatch.
    runtimePredicates: z
      .array(
        z.strictObject({
          receiptRef: cognitiveRefSchema.refine((ref) => ref.kind === "receipt"),
          state: z.enum(["accepted", "confirmed", "unknown"]),
        }),
      )
      .max(8),
    mandatoryPoints: z.array(z.string().min(1).max(1000)).min(1).max(16),
    optionalExamples: z.array(z.string().min(1).max(1000)).max(8),
    prohibitedClaims: z.array(z.string().min(1).max(1000)).max(16),
    factualRefs: z.array(cognitiveRefSchema).max(32),
    locale: z.string().min(2).max(35),
    tone: z.string().min(1).max(200),
    expiresAt: z.iso.datetime({ offset: true }),
    reviewStatus: z.literal("draft"),
  })
  .superRefine((value, ctx) => {
    if (
      [...value.sourceRefs, ...value.factualRefs, ...value.runtimePredicates.map((p) => p.receiptRef)].some(
        (ref) => ref.tenantId !== value.tenantId,
      )
    )
      ctx.addIssue({ code: "custom", message: "cross-tenant narrative" });
  });
