import { z } from 'zod';
const id=z.string().min(1).max(200);
export const cognitiveRefSchema=z.strictObject({tenantId:id,kind:z.enum(['event','thought','entity','memory','card','document','receipt']),id,revision:z.number().int().positive()});
export type CognitiveRef=z.infer<typeof cognitiveRefSchema>;
