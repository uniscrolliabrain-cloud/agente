// JWT_PAYLOAD_V1 - claims minimos del JWT de Supabase.
// role: authenticated es categoria de acceso a la app, no rol empresarial.
// Se ignora para autorizacion.
import { z } from "zod";

// JWT_TENANT_CLAIM_V1 - el tenant viaja en el token.
// `app_metadata` solo lo escribe el service role (hook de access token), asi
// que es la fuente fiable; `user_metadata` es editable por el usuario y solo se
// usa como ultimo recurso para no romper proyectos existentes.
const jwtMetadataSchema = z
  .object({
    tenant_id: z.string().min(1).max(100).optional(),
    role: z.string().max(100).optional(),
  })
  .passthrough();

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
  tenant_id: z.string().min(1).max(100).optional(),
  app_metadata: jwtMetadataSchema.optional(),
  user_metadata: jwtMetadataSchema.optional(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

/**
 * Tenant declarado por el token, en orden de fiabilidad.
 * Devuelve null si no hay claim: el middleware lo convierte en 401. Sin tenant
 * no hay zona donde escribir, y adivinarlo con "default" es como se filtran
 * datos entre empresas.
 */
export function tenantClaimOf(payload: JwtPayload): string | null {
  return (
    payload.tenant_id ??
    payload.app_metadata?.tenant_id ??
    payload.user_metadata?.tenant_id ??
    null
  );
}
