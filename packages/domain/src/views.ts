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

// VIEWSPEC_EXTENDED_V1 - añadidos inbox, board, table, detail y form para
// cubrir los 7 templates que pide docs/TEMPLATES_V2.md. Cada uno con su
// forma especifica y un tope de items para no romper el renderer.
const inboxItem = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  actions: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        label: z.string().min(1).max(80),
        kind: z.enum(["approve", "deny", "open", "edit"]).default("open"),
      }),
    )
    .max(3)
    .default([]),
});

const boardColumn = z.object({
  id: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  status: z.string().min(1).max(100),
});

const boardCard = z.object({
  id: z.string().min(1).max(200),
  columnId: z.string().min(1).max(100),
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional(),
  updatedAt: z.string().max(80).optional(),
});

const tableColumn = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  type: z.enum(["text", "number", "date", "chip", "action"]).default("text"),
  align: z.enum(["left", "right", "center"]).default("left"),
});

const detailProperty = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  provenance: z.enum(["auto", "alta", "media", "sugerido", "tu", "missing"]).default("auto"),
});

const formField = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  type: z.enum(["text", "number", "date", "select", "textarea", "checkbox"]),
  required: z.boolean().default(false),
  options: z.array(z.string().max(200)).max(100).optional(),
  value: z.unknown().optional(),
  provenance: z.enum(["auto", "alta", "media", "sugerido", "tu", "missing"]).default("missing"),
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
  z.object({
    kind: z.literal("inbox"),
    title: z.string().min(1).max(300),
    items: z.array(inboxItem).max(50),
  }),
  z.object({
    kind: z.literal("board"),
    title: z.string().min(1).max(300),
    entityType: z.string().max(100).optional(),
    columns: z.array(boardColumn).max(10),
    cards: z.array(boardCard).max(200),
  }),
  z.object({
    kind: z.literal("table"),
    title: z.string().min(1).max(300),
    columns: z.array(tableColumn).max(20),
    rows: z.array(z.record(z.string(), z.unknown())).max(200),
  }),
  z.object({
    kind: z.literal("detail"),
    title: z.string().min(1).max(300),
    entityId: z.string().max(200).optional(),
    entityType: z.string().max(100).optional(),
    properties: z.array(detailProperty).max(50),
    relations: z
      .array(
        z.object({
          id: z.string().max(200),
          type: z.string().max(100),
          targetName: z.string().max(300),
        }),
      )
      .max(50)
      .default([]),
  }),
  z.object({
    kind: z.literal("form"),
    title: z.string().min(1).max(300),
    entityType: z.string().max(100),
    fields: z.array(formField).max(50),
    submitLabel: z.string().max(80).default("Guardar"),
  }),
]);

export type RuntimeViewSpec = z.infer<typeof runtimeViewSpecSchema>;
export type ViewKpi = z.infer<typeof kpi>;
export type ViewQueueItem = z.infer<typeof queueItem>;

export function parseRuntimeViewSpec(raw: unknown): RuntimeViewSpec | null {
  const r = runtimeViewSpecSchema.safeParse(raw);
  return r.success ? r.data : null;
}