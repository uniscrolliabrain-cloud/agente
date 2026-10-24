<!-- CIERRE_MVP_07_V1 -->
# Cierre MVP â€” aislamiento multi-tenant (clone-por-cliente)

> v1 Â· 
2026-10-21
 Â· Creado por la campaÃ±a. Verifica M1â€“M6 contra el cÃ³digo real, no contra el plan.

## Condiciones del MVP y evidencia

| # | CondiciÃ³n | Marca | Estado |
|---|---|---|---|
| M1 | files.import no hardcodea default | APP_FILES_IMPORT_TENANT_V1: NO | verificado en vivo |
| M2 | scan() no filtra por un solo tenant | TENANT_SCAN_ALL_PREFIXES_V1: NO | verificado en vivo |
| M3 | tenantId de request validado contra owner | APP_TENANT_REQUEST_VALIDATE_V1: NO | verificado en vivo |
| M4 | /notifications incluye tenantId | ROUTES_NOTIFICATIONS_TENANT_V1: NO | verificado en vivo |
| M5 | withTenantRls usa misma transacciÃ³n | DB_RLS_TX_CONTEXT_V1: NO | verificado en vivo |
| M6 | Test E2E multi-tenant | TENANT_HTTP_E2E_V1: NO | verificado en vivo |

## QuÃ© se puede afirmar

- Solo lo que la columna Estado diga. Si dice NO, la condiciÃ³n NO se cumple.

## QuÃ© NO se puede afirmar

- SaaS compartido listo.
- RLS protegiendo en producciÃ³n.
- Cuotas aplicadas a chat/RAG/files.
- Tenant switcher existe.
<!-- CIERRE_MVP_CAMPAIGN1_FINAL_V1 -->
## Cierre de la Campaña 1 — 8 fases ejecutadas

> Este cierre lo genera la Fase 8 del plan. Resume qué se cerró, qué queda pendiente y qué se traspasa a la Campaña 2.

### Fases ejecutadas

| Fase | Documento | Foco | Estado |
|---|---|---|---|
| 0 | 01 | Reconocimiento y verdad del repo | Cerrada |
| 1 | 02 | Documentación real (F01) | Cerrada |
| 2 | 03 | B2 aislamiento estricto (N01, N02, N04) | Cerrada |
| 3 | 04 | B3 rate limit + logContext | Cerrada |
| 4 | 05 | B4 RLS tx + body validate + cross audit + X-Tenant-Id | Cerrada |
| 5 | 06 | B5 computer tenant + F04.2/F04.3 verificados | Cerrada |
| 6 | 07 | B6+B7 cuotas + metrics + notificaciones + F02.9b | Cerrada |
| 7 | 08 | B8 switch-tenant + admin CRUD + migrate tx | Cerrada (recortada) |
| 8 | 09 | B9 CI + cierre documental | **Esta fase** |

### Marcas aplicadas (36)

Todas las marcas listadas en `ID-MAP.md` sección "Marcas aplicadas" están en el código. El detalle completo, con archivo y línea, está en `ESTADO-REAL-MULTITENANT.md`.

### Qué queda pendiente para la Campaña 2

- **F04.10b/c/d**: `tenant_members` / `tenant_configs` como tablas SQL. Requiere migración.
- **F04.10-wire**: cablear `bus` a `TenantService`.
- **F04.14c-event**: emitir `tenant.membership.changed` al bus. Requiere `SYSTEM_EVENT_TYPES` con el tipo.
- **F04.30/F04.31/F04.33**: Stripe Connect, reconciliación de uso, tenant switcher frontend.
- **F04.27**: `runTenantBackup` bloqueado hasta que exista en el repo.
- **`delete-tenant-data.ts`**: script para borrar los records de un tenant.
- **Adaptación de resolvers**: `DatabaseTenantResolver` y `DatabaseTenantConfigResolver` requieren tablas SQL.
- **`worker.ts`**: Copilot lo repara en otra rama. CI queda warn-only hasta entonces.
- **Tests de la Campaña 1**: F02.10, F02.7, F02.12, F03.31-test, F03.36-test, F04.20-test, F05.1, F05.4, F05.6, F05.7 — congelados. Cline los corre en la fase de tests.

### Traspaso a la Campaña 2

La Campaña 2 (SaaS compartido SOC 2 Type II) se arranca en el documento 10. Requiere 5 decisiones:

1. ¿SaaS compartido o clone-por-cliente permanente?
2. ¿Postgres gestionado o Supabase?
3. ¿Stripe o facturación manual?
4. ¿SOC 2 Type I (foto) o Type II (3 meses)?
5. ¿Cliente piloto para migración?

Sin esas decisiones, la Campaña 2 no se empieza.