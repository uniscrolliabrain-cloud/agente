// FIX_02_VIEWS_RENAME_V1 - nombres distintos a workspace-spec.ts para no colisionar.
import { z } from "zod";

const kpi = z.object({
  label: z.string().min(1).max(120),
  value: z.union([z.string(), z.number()]),
  delta: z.string().max(60).optional(),
});

const queueItem = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional(),
  status: z.enum(["pending", "running", "done", "error"]),
  actions: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        label: z.string().min(1).max(80),
        kind: z.enum(["primary", "default", "danger"]).default("default"),
      }),
    )
    .max(3)
    .default([]),
});

export const runtimeViewSpecSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("dashboard"),
    title: z.string().min(1).max(300),
    kpis: z.array(kpi).max(6),
  }),
  z.object({
    kind: z.literal("queue"),
    title: z.string().min(1).max(300),
    items: z.array(queueItem).max(50),
  }),
]);

export type RuntimeViewSpec = z.infer<typeof runtimeViewSpecSchema>;
export type ViewKpi = z.infer<typeof kpi>;
export type ViewQueueItem = z.infer<typeof queueItem>;

export function parseRuntimeViewSpec(raw: unknown): RuntimeViewSpec | null {
  const r = runtimeViewSpecSchema.safeParse(raw);
  return r.success ? r.data : null;
}