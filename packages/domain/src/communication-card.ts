import { z } from "zod";

export const communicationCardSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/).max(80),
  version: z.number().int().positive(),
  status: z.enum(["draft", "approved", "retired"]),
  locale: z.enum(["es-ES", "en-US"]),
  channels: z.array(z.enum(["panel", "email", "whatsapp", "voice"])).min(1),
  roleIds: z.array(z.string().min(1)).min(1),
  intents: z.array(z.string().min(1)).min(1),
  sopIds: z.array(z.string().min(1)),
  states: z.array(z.string().min(1)),
  priority: z.number().int().min(0).max(100),
  mode: z.enum(["guided", "fixed"]),
  structure: z.array(z.string().max(150)).min(1).max(6),
  requiredFacts: z.array(z.string().max(80)).max(12),
  forbiddenClaims: z.array(z.string().max(180)).max(10),
  template: z.string().max(600),
  missingFactScript: z.string().min(1).max(240),
  fallback: z.enum(["explain_missing", "ask", "escalate"]),
}).strict();

export type CommunicationCard = z.infer<typeof communicationCardSchema>;
