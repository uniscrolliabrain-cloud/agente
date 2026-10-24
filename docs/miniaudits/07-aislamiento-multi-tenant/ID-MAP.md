<!-- ID_MAP_V1 -->
# ID-MAP â€” CampaÃ±a 1 (aislamiento multi-tenant)

**Creado:** 
2026-10-21
 (Fase 0 / PS01e)
**Estado:** PROVISIONAL. Filas TBD se rellenan en Fase 1 cuando se lea miniaudit.md completo.

## Tabla miniaudit â†” D-ID â†” 07-A-ID â†” Plan-Maestro

| Miniaudit # | D-ID | 07-A-ID | Plan-Maestro ID | TÃ­tulo | Estado |
|---|---|---|---|---|---|
| 1 | D1 | 07-A1 | (FP) | Files/Rag/Workspace con db crudo | FP confirmado |
| 2 | D2 | 07-A4 | (FP) | setMembership no invalida cache | FP confirmado |
| 3 | D3 | 07-A9 | F04.2 / F04.3 | 2 usos prohibidos de default | verificar Fase 5 en vivo |
| 4-19 | D4-D19 | 07-A2..A12 | TBD | TBD | TBD â€” Fase 1 |
| 20 | D20 | â€” | (C2) | Tenant switcher frontend | CampaÃ±a 2 |

## Entradas nuevas (N01â€“N07)

| ID | TÃ­tulo | Fichero:linea | Estado |
|---|---|---|---|
| N01 | scan<T>() solo primer prefix | db-tenant.ts | Working tree modificado por Copilot, no confirmado |
| N02 | admin-tenants escribe bajo owner system sin invalidar cache | admin-tenants.ts | Confirmado en Repomix |
| N03 | TBD | â€” | Fase 1 |
| N04 | TBD | â€” | Fase 1 |
| N05 | AgentService sin rateLimiter | service.ts | Confirmado en Repomix holÃ­stico |
| N06 | Config sin MULTI_TENANT_SHARED | config.ts | Confirmado en Repomix holÃ­stico |
| N07 | scanByOwnerPrefix no rechaza prefijos maliciosos | db.ts + tests | Confirmado en Repomix |

## DocumentaciÃ³n de campaÃ±a en old/ (no en raÃ­z)

Los 6 documentos de la campaÃ±a estÃ¡n en old/, no en la raÃ­z. La raÃ­z tiene fixes.md, miniaudit.md, roadmap.md como D en git (borrados, existen en old/).

## Marcas verificadas

Ver secciÃ³n 4 de ESTADO-REAL-MULTITENANT.md (generada en BLOQUE 1).
<!-- ID_MAP_FINAL_V1 -->
## Estado final de la Campaña 1 (Fase 8)

### Marcas aplicadas (36)

Todas las marcas de las Fases 2–7 están en el código. El detalle completo, con archivo y línea, está en `ESTADO-REAL-MULTITENANT.md`.

### Fixes por estado

| Estado | Fixes | Motivo |
|---|---|---|
| **Aplicados** | F02.8, F03.11, F03.30, F03.31, F03.35, F03.38, F04.11, F04.12, F04.14, F04.14b, F04.14c (parcial), F04.15, F04.16a/b/c, F04.16-common, F04.17, F04.21, F04.22, F04.23, F04.24, F04.25, F05.3, F05.5, F05.9 (warn-only) | Cerrados en Fases 2–8 |
| **Verificados (sin cambio)** | F04.2 (FP), F04.3 (FP), F04.11b | Confirmados |
| **Congelados** | F02.10, F02.7, F02.12, F03.31-test, F03.36-test, F04.20-test, F05.1, F05.4, F05.6, F05.7 | Reactivar en fase de tests |
| **Bloqueados** | F02.1–F02.4, F04.7, F04.8, F04.9, F04.27 | `worker.ts`, `backup-tenant.ts`, Postgres real |
| **Pospuestos Campaña 2** | F04.10b/c/d, F04.10-wire, F04.14c-event, F04.30, F04.31, F04.33 | Requieren tablas SQL, Stripe, frontend |

### Deudas documentadas en `-pendientes.md`

Ver `MULTITENANT_PENDIENTES_FINAL_V1` en `-pendientes.md`. Las principales: `worker.ts` roto, mojibake en em-dashes, `rag-routes.ts` con duplicado, `app.ts` con `FALLBACK_TENANT_V1` en `/api/files`, `tenantLimiterShared` y `tenantLimiter` como instancias paralelas.