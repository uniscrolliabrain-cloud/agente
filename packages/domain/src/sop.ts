import { z } from "zod";

export const sopStepSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  tool: z.enum(["read_mail_thread","read_workspace","import_pdf","inspect_pdf","fill_pdf","prepare_email","prepare_event","read_web","save_artifact","ask_user","computer_command","query_business","recall_memory","llm_generate","transition_entity"]).default("ask_user"),
  prompt: z.string().max(5000).default(""),
  params: z.record(z.string(), z.unknown()).default(() => ({ type: "manual" as const, value: "" })),
  when: z.string().max(500).optional(),
  required: z.boolean().default(true),
  /** STATE_MACHINE_STEP_V1 — id de la maquina en el kind "state-machines". Solo si tool = transition_entity. */
  stateMachine: z.string().min(1).max(100).optional(),
});

export const sopSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(160),
  description: z.string().max(4000).default(""),
  category: z.string().max(100).default("General"),
  trigger: z.object({ type: z.enum(["manual","api","cron","email_subject","email_body_match"]).default("manual"), value: z.string().max(500).default("") }).default(() => ({ type: "manual" as const, value: "" })),
  // SOP_STEPS_LIMIT_V1 - subido de 12 a 50. 12 era arbitrario y bloqueaba SOPs
  // reales con validacion + preparacion + ejecucion.
  steps: z.array(sopStepSchema).min(1).max(50).superRefine((steps, ctx) => {
    const ids = new Set<string>();
    steps.forEach((step, index) => {
      if (ids.has(step.id)) ctx.addIssue({ code: "custom", path: [index, "id"], message: `Duplicate SOP step id: ${step.id}` });
      ids.add(step.id);
    });
  }),
  // SOP_ALLOWED_TOOLS_V1 - enum cerrado. Antes era z.string() libre:
  // una tool inventada pasaba la validacion y reventaba en runtime.
  // El enum tiene que coincidir con sopStepSchema.tool.
  allowedTools: z
    .array(
      z.enum([
        "read_mail_thread",
        "read_workspace",
        "import_pdf",
        "inspect_pdf",
        "fill_pdf",
        "prepare_email",
        "prepare_event",
        "read_web",
        "save_artifact",
        "ask_user",
        "computer_command",
        "query_business",
        "recall_memory",
        "llm_generate",
        "transition_entity",
      ]),
    )
    .min(1),
  skillId: z.string().min(1).max(100).optional(),
  active: z.boolean().default(true),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type SOP = z.infer<typeof sopSchema>;
export type SOPStep = z.infer<typeof sopStepSchema>;