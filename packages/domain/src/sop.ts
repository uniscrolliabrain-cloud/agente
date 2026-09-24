import { z } from "zod";

export const sopStepSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  tool: z.enum(["read_mail_thread","read_workspace","import_pdf","inspect_pdf","fill_pdf","prepare_email","prepare_event","read_web","save_artifact","ask_user","computer_command","run_sop","query_business","install_python_lib"]).default("ask_user"),
  prompt: z.string().max(5000).default(""),
  params: z.record(z.string(), z.unknown()).default({}),
  required: z.boolean().default(true),
});

export const sopSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(160),
  description: z.string().max(4000).default(""),
  category: z.string().max(100).default("General"),
  trigger: z.object({ type: z.enum(["manual","email_subject","cron","api","skill"]).default("manual"), value: z.string().max(500).default("") }).default({}),
  steps: z.array(sopStepSchema).min(1).max(12).superRefine((steps, ctx) => {
    const ids = new Set<string>();
    steps.forEach((step, index) => {
      if (ids.has(step.id)) ctx.addIssue({ code: "custom", path: [index, "id"], message: `Duplicate SOP step id: ${step.id}` });
      ids.add(step.id);
    });
  }),
  allowedTools: z.array(z.string()).default([]),
  pythonRequirements: z.array(z.string().min(1).max(200)).max(50).default([]),
  skillId: z.string().min(1).max(100).optional(),
  active: z.boolean().default(true),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type SOP = z.infer<typeof sopSchema>;
export type SOPStep = z.infer<typeof sopStepSchema>;
