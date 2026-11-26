import { z } from "zod";
import { createHash } from "node:crypto";
const poles = ["explore", "apply", "generate", "verify", "expand", "protect"] as const;
const triggers = [
  "axiom",
  "contradiction",
  "complex_decision",
  "recurrence",
  "vague_concept",
  "goal_mismatch",
  "causal_claim",
  "decision_uncertainty",
  "checkpoint",
  "topic_transition",
  "goal_constraints",
  "review",
  "correction",
  "evaluation",
  "six_frame_review",
] as const;
export const skillSchema = z.strictObject({
  id: z.string().regex(/^[a-z_]{1,40}$/),
  version: z.literal("1.0.0"),
  triggers: z.array(z.enum(triggers)).min(1).max(triggers.length),
  weights: z.partialRecord(z.enum(poles), z.number().min(0).max(1)),
  cost: z.number().int().positive().max(100),
  output: z.literal("longitudinal_delta_v1"),
  stop: z.string().min(1).max(300),
});
type ParsedSkill = z.infer<typeof skillSchema>;
export type CognitiveSkill = Readonly<
  Omit<ParsedSkill, "triggers" | "weights"> & {
    triggers: readonly ParsedSkill["triggers"][number][];
    weights: Readonly<ParsedSkill["weights"]>;
  }
>;
const catalogSchema = z
  .array(skillSchema)
  .max(64)
  .refine((skills) => new Set(skills.map((s) => s.id)).size === skills.length, "duplicate skill IDs");
const signalSchema = z.strictObject({
  triggers: z.array(z.enum(triggers)).max(triggers.length),
  poles: z.record(z.enum(poles), z.number().min(0).max(1).nullable()),
  remaining: z.number().int().nonnegative().max(100),
});
const entries: Array<[string, CognitiveSkill["triggers"], string]> = [
  ["first_principles", ["axiom", "contradiction"], "All premises anchored or explicitly unknown"],
  ["perspectives", ["complex_decision"], "At most three distinct perspectives"],
  ["abstraction", ["recurrence"], "No generalization without multiple evidenced examples"],
  ["concretization", ["vague_concept"], "One testable example"],
  ["contradiction", ["contradiction"], "Preserve both exact refs without resolving automatically"],
  ["drift", ["goal_mismatch"], "Stop without a material mismatch"],
  ["causal", ["causal_claim"], "List evidence gaps without causal certainty"],
  ["counterfactual", ["decision_uncertainty"], "Bound changed assumptions and alternatives"],
  ["synthesis", ["checkpoint", "topic_transition"], "Only source-backed deltas"],
  ["strategy", ["goal_constraints"], "Conceptual options without dispatch"],
  ["meta_review", ["review"], "Evidence coverage without private reasoning persistence"],
  ["feedback", ["correction", "evaluation"], "Candidate revision without policy mutation"],
  ["six_frame", ["six_frame_review"], "One bounded informational composite without dispatch"],
];
// Empty weights deliberately avoid uncalibrated chromatic tuning.
export const cognitiveSkillCatalog: readonly CognitiveSkill[] = Object.freeze(
  catalogSchema
    .parse(
      entries.map(([id, triggers, stop]) => ({
        id,
        triggers,
        stop,
        version: "1.0.0",
        weights: {},
        cost: 1,
        output: "longitudinal_delta_v1",
      })),
    )
    .map((skill) =>
      Object.freeze({ ...skill, triggers: Object.freeze(skill.triggers), weights: Object.freeze(skill.weights) }),
    ),
);
export const cognitiveSkillCatalogDigest = createHash("sha256")
  .update(JSON.stringify(cognitiveSkillCatalog))
  .digest("hex");

/** Pure proposal selection. Caller must derive triggers from authorized journal data. */
export function selectSkills(
  catalog: readonly CognitiveSkill[],
  input: z.input<typeof signalSchema>,
): CognitiveSkill[] {
  const skills = catalogSchema.parse(catalog);
  const signal = signalSchema.parse(input);
  const active = new Set(signal.triggers);
  const priority = (skill: CognitiveSkill) =>
    active.has("correction") && skill.id === "feedback"
      ? 2
      : active.has("contradiction") && skill.id === "contradiction"
        ? 1
        : 0;
  const mandatory = active.has("correction") ? "feedback" : active.has("contradiction") ? "contradiction" : undefined;
  const candidates = skills.filter(
    (skill) => skill.cost <= signal.remaining && skill.triggers.some((trigger) => active.has(trigger)),
  );
  // A missing or unaffordable correction handler must not launch a lower-priority analysis.
  if (mandatory && !candidates.some((skill) => skill.id === mandatory)) return [];
  const score = (skill: CognitiveSkill) => {
    let sum = 0,
      known = 0;
    for (const pole of poles) {
      const weight = skill.weights[pole] ?? 0,
        value = signal.poles[pole];
      if (value !== null) {
        sum += weight * value;
        known += weight;
      }
    }
    return known ? sum / known : 0;
  };
  return candidates
    .sort((a, b) => priority(b) - priority(a) || score(b) - score(a) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .slice(0, 1);
}
