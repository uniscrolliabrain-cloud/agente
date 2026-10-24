<!-- MULTITENANT_PENDIENTES_FINAL_V1 -->
# -pendientes.md — trabajo pendiente de la Campaña 1 (cierre)

> Actualizado en Fase 8. Consolida los 13 bloqueados originales más las deudas de las Fases 2–8.
> Los misses de ejecución van a `missed/_multitenant_pendientes.md`, no aquí.

## Bloqueados por dependencia externa

| ID | Fix | Bloqueado por | Desbloquea con |
|---|---|---|---|
| F00.5 | 16 prohibidas clasificadas | `AUDIT_TENANT_DEFAULT.md` sin lista explícita | humano confirma lista |
| F01.5 | A.5 (16 default) | F00.5 | humano confirma lista |
| F02.1–F02.4 | `worker.ts` | fichero roto, Copilot lo repara en otra rama | Copilot publica fix |
| F02.10 | tests tenant-strict | congelado por instrucción | reactivar tests |
| F02.7, F02.12 | tests worker-* | idem | idem |
| F04.1 | clasificar 16 default | F00.5 | humano confirma lista |
| F04.7 | índice por prefijo | requiere `EXPLAIN` real en Postgres prod-like | entorno con datos reales |
| F04.8, F04.9 | worker y DLQ con tenant | `worker.ts` roto | F02.1–F02.4 |
| F04.10b | `tenant_members`/`tenant_configs` SQL | requiere migración SQL | Campaña 2 |
| F04.10c | `DatabaseTenantResolver` cableado | requiere tabla `tenant_members` | Campaña 2 |
| F04.10d | `DatabaseTenantConfigResolver` cableado | requiere tabla `tenant_configs` | Campaña 2 |
| F04.10-wire | `bus` en `TenantService` | requiere reordenar `const bus` antes de `new TenantService` | Campaña 2 |
| F04.14c-event | evento `tenant.membership.changed` al bus | requiere `SYSTEM_EVENT_TYPES` | Campaña 2 |
| F04.20-test | test quota-tenant | congelado | reactivar tests |
| F04.27 | `runTenantBackup` | `backup-tenant.ts` no verificado | humano pasa fichero |
| F04.30 | Stripe Connect | requiere decisión Campaña 2 | decisión 3 |
| F04.31 | reconciliación uso | requiere `usage_events`/`tenant_quotas` | Campaña 2 |
| F04.33 | tenant switcher frontend | requiere `/switch-tenant` con multi-membership | Campaña 2 |
| F05.1 | test N=500 | congelado | reactivar tests |
| F05.2 | ejecutar E2E | congelado | reactivar tests |
| F05.3 | ejecutar test CI | idem | idem |
| F05.4 | E2E a verde | requiere `worker.ts` reparado | Copilot + tests |
| F05.5 | ejecutar CI multi-tenant | requiere `worker.ts` reparado | Copilot |
| F05.6, F05.7 | audits/E2E en CI | E2E requiere `worker.ts` | Copilot |
| F05.9 | `worker.ts` typecheck bloqueante | `worker.ts` roto | Copilot |
| `delete-tenant-data.ts` | script de borrado de datos tenant | requiere decisión Campaña 2 | decisión 1 |
| Adaptación de resolvers a `records` | alternativa a tablas SQL | decisión Campaña 2 | decisión 1/2 |
| `apps/server/package.json` | no existe | el repo no lo tiene | revisar en Campaña 2 |

## Deudas de las Fases 2–8 (no bloqueantes)

- **F02.8** (aplicado): F02.8 ya está en `tenant.ts`. Confirmado 1× en Fase 2.
- **N01** (aplicado): `TENANT_SCAN_ALL_PREFIXES_FIX_V1` en `db-tenant.ts`. Confirmado 1× en Fase 2.
- **F04.2, F04.3** (FPs): verificados en Fase 5 como falsos positivos. Descartados.
- **F04.16a/b/c-refinamiento** (aplicado en Fase 6): el rate limit se hace dentro del IIFE async. Deuda menor: pre-check síncrono antes del IIFE no existe.
- **F04.21** (aplicado): `X-Tenant-Id` se añade al response.
- **F04.23** (aplicado): SSE filtra por tenant. Deuda menor: notificaciones legacy sin `tenantId` se asumen del tenant actual.
- **Migración de nombres de contenedor computer** (F04.24): contenedores viejos con nombre sin `tenantHash` quedan huérfanos. Deuda operativa.
- **`getMaxActive` / `activeSize` en `worker.ts`**: rotos por comentarios sin cerrar. Deuda de Copilot.
- **F04.14c** (aplicado parcialmente): `invalidateAll` sí, evento al bus pospuesto a Campaña 2.
- **Mojibake en em-dashes**: `app.ts`, `computer-routes.ts`, `computer-tools.ts`, `rag-routes.ts`, `threads-routes.ts`, `engine/tenant.ts`. Fase de limpieza.
- **`rag-routes.ts` tiene `POST /reingest/:id` duplicado**: bug preexistente. Fase de limpieza.
- **`app.ts` `FALLBACK_TENANT_V1` en `/api/files`**: hardcode de `"default"`. Campaña 2.

## Traspaso a Campaña 2

Ver `CIERRE-MVP.md` sección "Traspaso a la Campaña 2". Los 5 disparadores son: shared vs clone, Postgres vs Supabase, Stripe vs manual, SOC 2 Type I vs II, cliente piloto.