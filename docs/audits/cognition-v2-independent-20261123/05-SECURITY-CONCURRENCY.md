# Seguridad y concurrencia: inspección

- `runtime.ts:74-78`: V2 fail-closed para `MULTI_TENANT_SHARED=true` hasta certificación RLS. No levantar esta barrera.
- `runtime.ts:82-92`: identity exige tenant habilitado, actor=owner, membership, tenant no suspendido y usuario activo.
- `runtime.ts:98-112`: rol activo y tenant scope; `personaId` debe coincidir con `roleId`.
- `context.ts`: snapshot por actor/tenant/policyRevision/queryDigest, evidencia y revocación revalidadas; leases de entrega.
- `workers.ts`: cuatro lanes por tenant con heartbeat, retry/backoff y checks de dead-letter. Heartbeat no demuestra backlog vacío.
- `voice-session-routes.ts`: `requireThread`, rol activo explícito, consentimiento, epoch y cierre durable. No se ejecutaron carreras reales.
- `external-connectors.ts`: stubs niegan egress. assertConnectorGrant verifica campos y expiración, pero comentario admite que firma y grant durable quedan fuera.

## Pruebas obligatorias pendientes
Tenant A/B, actor owner/otro, rol desactivado entre snapshot y emisión, consentimiento revocado durante render, interrupción concurrente, session close parcial, 2 coordinadores, stale epoch, respuesta tardía de modelo, lease expirado, duplicación de eventos y reintento de entrega. Todos **NO EJECUTADOS** en esta auditoría.
