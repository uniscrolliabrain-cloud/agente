// JWT_PAYLOAD_V1 - claims minimos del JWT de Supabase.
// role: authenticated es categoria de acceso a la app, no rol empresarial.
// Se ignora para autorizacion.
import { z } from "zod";

export const jwtPayloadSchema = z.object({
  iss: z.string().min(1).max(500),
  aud: z.union([z.string().min(1).max(500), z.array(z.string().min(1).max(500))]),
  exp: z.number().int().positive(),
  iat: z.number().int().positive().optional(),
  nbf: z.number().int().positive().optional(),
  sub: z.string().min(1).max(200),
  session_id: z.string().min(1).max(200).optional(),
  email: z.email().optional(),
  role: z.string().max(100).optional(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
