// KERNEL_CONTEXT_V1 — identidad de cada operacion del kernel.
//
// Por que existe: SOC-2 exige control de acceso y trazabilidad. Cada
// operacion del kernel (abrir turno, escribir pensamiento, cerrar turno,
// promover) recibe un KernelContext. Sin el, no se ejecuta nada. Eso es
// defensa en profundidad: si alguien llama a openTurn sin contexto, no
// compila.

import { z } from "zod";

export const kernelRoleSchema = z.enum(["admin", "user", "agent", "system"]);

export const kernelContextSchema = z.object({
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  role: kernelRoleSchema,
  requestId: z.string().min(1).max(100),
});

export type KernelRole = z.infer<typeof kernelRoleSchema>;
export type KernelContext = z.infer<typeof kernelContextSchema>;

/** Helper para construir contextos de test o de sistema sin repetir campos. */
export function systemContext(tenantId: string, owner: string, requestId: string): KernelContext {
  return kernelContextSchema.parse({ tenantId, owner, role: "system", requestId });
}