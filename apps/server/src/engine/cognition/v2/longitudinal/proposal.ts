import { z } from "zod";
import {
  anchorAnnotationSchema,
  longitudinalDeltaSchema,
  longitudinalScopeSchema,
} from "../../../../../../../packages/domain/src/longitudinal.ts";
import { cognitiveRefSchema } from "../../../../../../../packages/domain/src/cognitive-reference.ts";
const bindingSchema = z.strictObject({
  scope: longitudinalScopeSchema,
  expectedRevision: z.number().int().nonnegative(),
  watermark: z.string().regex(/^(0|[1-9][0-9]*)$/),
  skillId: z.string().min(1).max(200),
  skillVersion: z.string().min(1).max(200),
  evidence: z.array(cognitiveRefSchema).min(1).max(30),
  anchors: z.array(anchorAnnotationSchema).max(1000),
});
const key = (ref: z.infer<typeof cognitiveRefSchema>) => JSON.stringify([ref.tenantId, ref.kind, ref.id, ref.revision]);
/** Validate model information against server-owned, freshly authorized job bindings. No persistence. */
export function validateLongitudinalProposal(raw: unknown, serverBinding: z.input<typeof bindingSchema>) {
  const binding = bindingSchema.parse(serverBinding),
    delta = longitudinalDeltaSchema.parse(raw);
  if (
    delta.expectedRevision !== binding.expectedRevision ||
    delta.watermark !== binding.watermark ||
    delta.skillId !== binding.skillId ||
    delta.skillVersion !== binding.skillVersion
  )
    throw Error("LONGITUDINAL_BINDING_MISMATCH");
  const allowed = new Set(
    binding.evidence.map((ref) => {
      if (ref.tenantId !== binding.scope.identity.tenantId) throw Error("LONGITUDINAL_SCOPE_MISMATCH");
      return key(ref);
    }),
  );
  const anchors = new Map<string, z.infer<typeof anchorAnnotationSchema>>();
  for (const anchor of binding.anchors) {
    if (JSON.stringify(anchor.scope) !== JSON.stringify(binding.scope)) throw Error("LONGITUDINAL_SCOPE_MISMATCH");
    const id = key(anchor.cardRef);
    if (anchors.has(id)) throw Error("LONGITUDINAL_DUPLICATE_ANCHOR");
    anchors.set(id, anchor);
  }
  for (const proposal of delta.proposals) {
    if (proposal.evidence.some((ref) => !allowed.has(key(ref)))) throw Error("LONGITUDINAL_UNANCHORED_EVIDENCE");
    if (proposal.target) {
      const anchor = anchors.get(key(proposal.target));
      if (!anchor || anchor.state === "superseded") throw Error("LONGITUDINAL_TARGET_UNAVAILABLE");
      if (anchor.authority === "user_stated" && proposal.op !== "dispute")
        throw Error("LONGITUDINAL_USER_PREMISE_PROTECTED");
    }
  }
  return delta;
}
