import { z } from "zod";
import { cognitiveRefSchema } from "../../../../../../../packages/domain/src/cognitive-reference.ts";
const groups = ["anchor", "brief", "narrative", "general"] as const;
const itemSchema = z.strictObject({
  ref: cognitiveRefSchema,
  text: z.string().min(1).max(16_000),
  priority: z.number().int().min(0).max(100),
  group: z.enum(groups),
  mandatory: z.boolean(),
});
export type ContextPackItem = z.infer<typeof itemSchema>;
const budgetSchema = z.number().int().nonnegative().max(64_000);
/** Inputs must already be authorized. Whole JSON clauses and framing count as bytes. */
export function packLongitudinalContext(
  items: readonly ContextPackItem[],
  limit: number,
  quotas: Record<(typeof groups)[number], number>,
) {
  const validated = z.array(itemSchema).max(1000).parse(items);
  budgetSchema.parse(limit);
  const caps = z.record(z.enum(groups), budgetSchema).parse(quotas);
  const used = { anchor: 0, brief: 0, narrative: 0, general: 0 };
  const selected: ContextPackItem[] = [],
    omittedMandatory: ContextPackItem["ref"][] = [];
  const seen = new Map<string, ContextPackItem>();
  for (const item of validated) {
    const key = JSON.stringify(item.ref);
    const previous = seen.get(key);
    if (previous && JSON.stringify(previous) !== JSON.stringify(item)) throw Error("PACK_CONFLICTING_REFERENCE");
    seen.set(key, item);
  }
  const order = new Map(groups.map((group, index) => [group, index]));
  const sorted = [...seen.values()].sort(
    (a, b) =>
      Number(b.mandatory) - Number(a.mandatory) ||
      order.get(a.group)! - order.get(b.group)! ||
      b.priority - a.priority ||
      (JSON.stringify(a.ref) < JSON.stringify(b.ref) ? -1 : 1),
  );
  // Even an empty JSON envelope consumes two bytes.
  if (limit < 2)
    return {
      items: selected,
      serialized: "",
      bytes: 0,
      used,
      omittedMandatory: sorted.filter((x) => x.mandatory).map((x) => x.ref),
      degraded: true,
    };
  let bytes = 2;
  for (const item of sorted) {
    const size = Buffer.byteLength(JSON.stringify(item), "utf8");
    const framed = size + (selected.length ? 1 : 0);
    if (bytes + framed > limit || used[item.group] + size > caps[item.group]) {
      if (item.mandatory) omittedMandatory.push(item.ref);
      continue;
    }
    selected.push(item);
    used[item.group] += size;
    bytes += framed;
  }
  return {
    items: selected,
    serialized: JSON.stringify(selected),
    bytes,
    used,
    omittedMandatory,
    degraded: omittedMandatory.length > 0,
  };
}
