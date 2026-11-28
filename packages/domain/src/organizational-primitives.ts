/** Experimental, pure descriptions. No storage, policy decisions or authority. */
import { z } from "zod";
import { cognitiveRefSchema } from "./cognitive-reference.ts";
const id = z.string().min(1).max(200);
const exactRef = cognitiveRefSchema.refine((ref) => Number.isSafeInteger(ref.revision), "unsafe revision");
export const exactOrganizationalRefKey = (input: z.input<typeof exactRef>) => {
  const ref = exactRef.parse(input);
  return JSON.stringify([ref.tenantId, ref.kind, ref.id, ref.revision]);
};
const score = z.number().min(0).max(1).nullable();
export const organizationalAssessmentDraftSchema = z
  .strictObject({
    subject: exactRef,
    whole: exactRef,
    goal: exactRef.optional(),
    axis: z.strictObject({ ontologyId: id, version: id, definitionDigest: z.string().regex(/^[a-f0-9]{64}$/), id }),
    positive: score,
    negative: score,
    evidence: z.array(exactRef).min(1).max(30),
  })
  .superRefine((value, ctx) => {
    const refs = [value.subject, value.whole, ...(value.goal ? [value.goal] : []), ...value.evidence];
    if (refs.some((ref) => ref.tenantId !== value.subject.tenantId))
      ctx.addIssue({ code: "custom", message: "cross-tenant assessment" });
    if (new Set(value.evidence.map(exactOrganizationalRefKey)).size !== value.evidence.length)
      ctx.addIssue({ code: "custom", message: "duplicate evidence" });
  });
const checkSchema = z.strictObject({ id, state: z.enum(["satisfied", "violated", "unknown"]) });
export function summarizeChecks(input: readonly z.input<typeof checkSchema>[], required: readonly string[]) {
  const parsed = z.array(checkSchema).max(100).safeParse(input);
  const expected = z.array(id).max(100).safeParse(required);
  if (!parsed.success || !expected.success) return "unknown" as const;
  const checks = parsed.data,
    names = new Set(expected.data),
    actual = new Set(checks.map((check) => check.id));
  if (
    !names.size ||
    names.size !== expected.data.length ||
    actual.size !== checks.length ||
    actual.size !== names.size ||
    checks.some((check) => !names.has(check.id))
  )
    return "unknown" as const;
  if (checks.some((check) => check.state === "violated")) return "violated" as const;
  if (checks.some((check) => check.state === "unknown")) return "unknown" as const;
  return "satisfied" as const;
}
const pairSchema = z.strictObject({ positive: score, negative: score });
export type PolePair = z.infer<typeof pairSchema>;
export function describePair(
  input: PolePair,
  epsilon = 0.05,
): { direction: "positive" | "negative" | "balanced" | "unknown"; intensity: number | null; balance: number | null } {
  const pair = pairSchema.parse(input);
  z.number().min(0).max(1).parse(epsilon);
  if (pair.positive === null || pair.negative === null) return { direction: "unknown", intensity: null, balance: null };
  const balance = pair.positive - pair.negative;
  return {
    direction: Math.abs(balance) <= epsilon ? "balanced" : balance > 0 ? "positive" : "negative",
    intensity: Math.max(pair.positive, pair.negative),
    balance,
  };
}
/** Optional experiment, never mounted or used to decide permissions. */
export function candidateRank(base: number, pair: PolePair | undefined, enabled: boolean, weight = 0.1) {
  z.number().min(0).max(1).parse(base);
  z.number().min(0).max(0.1).parse(weight);
  if (!enabled || !pair) return base;
  const { balance } = describePair(pair);
  return balance === null ? base : Math.max(0, Math.min(1, base + weight * balance));
}

const keySchema = z.tuple([
  id,
  z.enum(cognitiveRefSchema.shape.kind.options),
  id,
  z.number().int().positive().refine(Number.isSafeInteger),
]);
function parseKey(key: string) {
  if (typeof key !== "string" || key.length > 1000) throw Error("INVALID_REFERENCE_KEY");
  const parsed = keySchema.parse(JSON.parse(key));
  if (JSON.stringify(parsed) !== key) throw Error("NONCANONICAL_REFERENCE_KEY");
  return parsed;
}
/** Authorized reader must bound real I/O and count edges before materialization/deduplication. */
export function boundedReach(
  root: string,
  adjacency: ReadonlyMap<string, readonly string[]>,
  limits: { depth: number; nodes: number; edges: number },
) {
  const cap = z
    .strictObject({
      depth: z.number().int().min(0).max(3),
      nodes: z.number().int().min(1).max(50),
      edges: z.number().int().min(1).max(100),
    })
    .parse(limits);
  if (adjacency.size > 50 || !adjacency.has(root)) throw Error("INVALID_AUTHORIZED_ADJACENCY");
  const tenant = parseKey(root)[0];
  let inputEdges = 0;
  for (const [key, targets] of adjacency) {
    if (
      parseKey(key)[0] !== tenant ||
      !Array.isArray(targets) ||
      targets.length > 100 ||
      (inputEdges += targets.length) > 100
    )
      throw Error("INVALID_AUTHORIZED_ADJACENCY");
    let previous: string | undefined;
    for (const target of targets) {
      if (parseKey(target)[0] !== tenant || !adjacency.has(target)) throw Error("UNAUTHORIZED_ENDPOINT");
      if (previous !== undefined && previous >= target) throw Error("UNORDERED_OR_DUPLICATE_ADJACENCY");
      previous = target;
    }
  }
  const seen = new Set([root]),
    queue = [{ key: root, depth: 0 }];
  let examined = 0,
    truncated = false,
    depthLimited = false;
  outer: for (let index = 0; index < queue.length; index++) {
    const current = queue[index],
      targets = adjacency.get(current.key)!;
    if (current.depth >= cap.depth) {
      if (targets.some((target) => !seen.has(target))) depthLimited = true;
      continue;
    }
    for (const target of targets) {
      if (examined >= cap.edges) {
        truncated = true;
        break outer;
      }
      examined++;
      if (seen.has(target)) continue;
      if (seen.size >= cap.nodes) {
        truncated = true;
        break outer;
      }
      seen.add(target);
      queue.push({ key: target, depth: current.depth + 1 });
    }
  }
  return { refs: [...seen], examined, truncated, depthLimited };
}
export function coverage(expected: readonly string[], actual: readonly string[]) {
  const e = new Set(expected),
    a = new Set(actual);
  if (e.size !== expected.length || a.size !== actual.length) throw Error("DUPLICATE_ORACLE_REFS");
  const hit = [...e].filter((ref) => a.has(ref)).length;
  return { hit, total: e.size, ratio: e.size ? hit / e.size : null };
}
