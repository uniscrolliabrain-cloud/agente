// C01_COGNITION_CONTRACTS_V2: information contracts, never execution authority.
import { z } from "zod";
const id = z.string().min(1).max(200);
const time = z.iso.datetime({ offset: true });
const uniqueIds = z.array(id).max(100).refine((xs) => new Set(xs).size === xs.length, "duplicate IDs");
export const cognitiveIdentitySchema = z.strictObject({
  tenantId: id, actorId: id, owner: id, policyRevision: id,
  purpose: z.enum(["chat", "task", "presenter", "audit"]),
});
export type CognitiveIdentity = z.infer<typeof cognitiveIdentitySchema>;
export const cognitiveVisibilitySchema = z.strictObject({
  tenantId: id, ownerActorId: id, scope: z.enum(["private", "tenant"]),
  allowedActorIds: uniqueIds, policyRevision: id,
});
export const cognitiveRefSchema = z.strictObject({
  tenantId: id, kind: z.enum(["event", "thought", "entity", "memory", "card", "document", "receipt"]),
  id, revision: z.number().int().positive(),
});
export const epistemicSchema = z.enum(["reported_fact", "inference", "hypothesis", "unknown", "contradicted", "verified_fact"]);
export const attentionSignalsSchema = z.strictObject({
  relevance: z.number().min(0).max(1), confidence: z.number().min(0).max(1),
  novelty: z.number().min(0).max(1), urgency: z.number().min(0).max(1),
  contradiction: z.number().min(0).max(1),
});
export const memoryKindSchema = z.enum(["episodic", "semantic", "procedural", "autobiographical", "working"]);
export const cognitiveRecordSchema = z.strictObject({
  schemaVersion: z.literal("2.0"), id, tenantId: id, revision: z.number().int().positive(),
  kind: z.enum(["claim", "thought_ref", "entity_ref", "memory", "card", "attention", "meta_hint"]),
  memoryKind: memoryKindSchema.optional(),
  title: z.string().min(1).max(160), body: z.string().min(1).max(16000),
  epistemic: epistemicSchema, evidence: z.array(cognitiveRefSchema).min(1).max(100),
  sourceEventId: id, sourceRevision: z.number().int().positive(),
  visibility: cognitiveVisibilitySchema, signals: attentionSignalsSchema,
  lifecycle: z.enum(["active", "superseded", "revoked", "expired"]),
  createdAt: time, expiresAt: time.optional(),
}).superRefine((r, ctx) => {
  if (r.visibility.tenantId !== r.tenantId || r.evidence.some((e) => e.tenantId !== r.tenantId))
    ctx.addIssue({ code: "custom", message: "cross-tenant reference" });
  if ((r.kind === "memory") !== Boolean(r.memoryKind))
    ctx.addIssue({ code: "custom", message: "memoryKind only on memory" });
  if (r.memoryKind === "working" && !r.expiresAt)
    ctx.addIssue({ code: "custom", message: "working memory requires expiry" });
  if (r.epistemic === "verified_fact" && !r.evidence.some((e) => e.kind === "receipt"))
    ctx.addIssue({ code: "custom", message: "verified fact requires receipt" });
});
export type CognitiveRecord = z.infer<typeof cognitiveRecordSchema>;
export const cognitiveEdgeSchema = z.strictObject({
  id, tenantId: id, from: cognitiveRefSchema, to: cognitiveRefSchema,
  relation: z.enum(["supports", "contradicts", "derived_from", "about", "supersedes", "attends_to"]),
}).refine((e) => e.from.tenantId === e.tenantId && e.to.tenantId === e.tenantId, "cross-tenant edge");
export const classificationV2Schema = z.strictObject({
  classifier: z.enum(["rules", "jev"]), version: id,
  labels: z.array(z.enum(["risk", "question", "summary", "uncertain"])).max(4),
  uncertainty: z.number().min(0).max(1), review: z.literal("proposed"),
});
export const slowOutputSchema = z.strictObject({
  title: z.string().min(1).max(160), body: z.string().min(1).max(16000),
  epistemic: z.enum(["hypothesis", "inference", "unknown"]),
  evidence: z.array(cognitiveRefSchema).min(1).max(100),
});
export const contextRequestV2Schema = z.strictObject({
  query: z.string().max(4000), maxTokens: z.number().int().min(64).max(16000),
  maxRefs: z.number().int().min(1).max(100),
});
export const deliveryAckV2Schema = z.strictObject({
  deliveryId: id, fence: z.number().int().positive(), receiptId: id,
});
export const chromaticOntologyV2Schema = z.strictObject({
  schemaVersion: z.literal("2.0"), ontologyId: id, version: id,
  status: z.enum(["draft", "approved", "retired"]),
  axes: z.array(z.strictObject({ id, positivePole: id, negativePole: id })).max(20),
  dimensions: uniqueIds, approvalReceiptId: id.optional(),
}).refine((o) => o.status !== "approved" || Boolean(o.approvalReceiptId), "approval receipt required")
  .refine((o) => new Set(o.axes.map((a) => a.id)).size === o.axes.length, "duplicate axes");
