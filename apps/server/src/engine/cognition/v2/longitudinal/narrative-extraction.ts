import { createHash } from "node:crypto";
import { z } from "zod";
import {
  narrativeDraftSchema,
  narrativeSourceManifestSchema,
} from "../../../../../../../packages/domain/src/longitudinal.ts";
import { cognitiveRefSchema } from "../../../../../../../packages/domain/src/cognitive-reference.ts";
import { provenanceSegmentDigest, type ProvenanceSegment } from "./segments.ts";

const spanSchema = z.strictObject({
  start: z.number().int().nonnegative(),
  end: z.number().int().positive(),
  quote: z.string().min(1).max(64000),
});
const bindingSchema = z.strictObject({
  manifest: narrativeSourceManifestSchema,
  originalText: z.string().max(2_000_000),
  segment: z.strictObject({
    start: z.number().int().nonnegative(),
    end: z.number().int().positive(),
    text: z.string().min(1).max(64000),
    digest: z.string().regex(/^[a-f0-9]{64}$/),
  }),
  allowedRoleIds: z.array(z.string().min(1).max(200)).min(1).max(32),
  // Supplied by the authorized source adapter, not by model output.
  authorizedEvidence: z.array(cognitiveRefSchema).min(1).max(1000),
  now: z.iso.datetime({ offset: true }),
  maxBytes: z.number().int().min(1024).max(64000).default(16000),
});
const extractionSchema = z.strictObject({ draft: narrativeDraftSchema, spans: z.array(spanSchema).min(1).max(32) });
type Binding = Omit<z.input<typeof bindingSchema>, "segment"> & { segment: ProvenanceSegment };
const key = (ref: z.infer<typeof cognitiveRefSchema>) => JSON.stringify([ref.tenantId, ref.kind, ref.id, ref.revision]);

/** Pure P10.3 validation. A returned draft grants neither publication nor serving.
 * Bindings must come from a freshly authorized adapter; this does not validate
 * a grant's legal meaning or prove the factual truth of a paraphrase.
 */
export function validateNarrativeExtraction(raw: unknown, input: Binding) {
  const binding = bindingSchema.parse(input),
    extraction = extractionSchema.parse(raw);
  const { manifest, segment, originalText } = binding,
    { draft, spans } = extraction;
  if (
    draft.tenantId !== manifest.identity.tenantId ||
    draft.sectionId !== manifest.sectionId ||
    draft.locale !== manifest.locale ||
    draft.roleIds.some((id) => !binding.allowedRoleIds.includes(id))
  )
    throw Error("NARRATIVE_EXTRACTION_SCOPE");
  if (!manifest.permittedUses.includes("extraction")) throw Error("NARRATIVE_EXTRACTION_NOT_PERMITTED");
  if (createHash("sha256").update(originalText).digest("hex") !== manifest.sourceDigest)
    throw Error("NARRATIVE_EXTRACTION_SOURCE_CHANGED");
  if (
    segment.end <= segment.start ||
    segment.end > originalText.length ||
    originalText.slice(segment.start, segment.end) !== segment.text ||
    provenanceSegmentDigest(segment.start, segment.end, segment.text) !== segment.digest
  )
    throw Error("NARRATIVE_EXTRACTION_SEGMENT_INVALID");
  const boundary = (offset: number) => {
    const code = originalText.charCodeAt(offset);
    return !(code >= 0xdc00 && code <= 0xdfff);
  };
  for (const character of originalText) {
    const code = character.charCodeAt(0);
    if (character.length === 1 && code >= 0xd800 && code <= 0xdfff) throw Error("NARRATIVE_EXTRACTION_UNICODE");
  }
  if (!boundary(segment.start) || !boundary(segment.end)) throw Error("NARRATIVE_EXTRACTION_UNICODE");
  const authorized = new Set(
    binding.authorizedEvidence.map((ref) => {
      if (ref.tenantId !== manifest.identity.tenantId) throw Error("NARRATIVE_EXTRACTION_SCOPE");
      return key(ref);
    }),
  );
  for (const ref of [manifest.sourceRef, ...manifest.rightsGrantRefs, ...draft.factualRefs])
    if (!authorized.has(key(ref))) throw Error("NARRATIVE_EXTRACTION_UNANCHORED_EVIDENCE");
  // One immutable source per batch. Cross-source synthesis needs another bound variant.
  if (draft.sourceRefs.length !== 1 || key(draft.sourceRefs[0]) !== key(manifest.sourceRef))
    throw Error("NARRATIVE_EXTRACTION_SOURCE_MISMATCH");
  if (draft.runtimePredicates.some((predicate) => !authorized.has(key(predicate.receiptRef))))
    throw Error("NARRATIVE_EXTRACTION_UNANCHORED_RECEIPT");
  const expectedOrigin = manifest.sourceKind === "llm_brief" ? "llm_proposal" : "source_extraction";
  if (draft.origin !== expectedOrigin) throw Error("NARRATIVE_EXTRACTION_ORIGIN");
  if (Date.parse(draft.expiresAt) <= Date.parse(binding.now)) throw Error("NARRATIVE_EXTRACTION_EXPIRED");
  for (const span of spans) {
    if (
      span.end <= span.start ||
      span.start < segment.start ||
      span.end > segment.end ||
      !boundary(span.start) ||
      !boundary(span.end) ||
      originalText.slice(span.start, span.end) !== span.quote
    )
      throw Error("NARRATIVE_EXTRACTION_SPAN_INVALID");
  }
  if (Buffer.byteLength(JSON.stringify(extraction), "utf8") > binding.maxBytes)
    throw Error("NARRATIVE_EXTRACTION_BUDGET");
  return {
    ...extraction,
    provenance: {
      sourceRef: manifest.sourceRef,
      sourceDigest: manifest.sourceDigest,
      normalizationVersion: manifest.normalizationVersion,
      segmentDigest: segment.digest,
    },
  };
}
