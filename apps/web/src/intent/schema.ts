 import { z } from "zod";
 export const intentSchema = z.object({ raw: z.string().min(1), kind: z.enum(["query","action","form","navigation"]).default("query"), confidence: z.number().min(0).max(1).default(0.7) });
 export type Intent = z.infer<typeof intentSchema>;