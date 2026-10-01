// INTENT_SCHEMA_V1 - Intent Zod
import { z } from "zod";
export const intentSchema=z.object({
 id:z.string(),raw:z.string(),normalized:z.string(),
 kind:z.enum(["query","action","create","update","delete","navigate","unknown"]),
 entities:z.array(z.string()).default([]),
 confidence:z.number().min(0).max(1).default(1),
 bindings:z.record(z.string(),z.unknown()).default({}),
 timestamp:z.string(),
});
export type Intent=z.infer<typeof intentSchema>;