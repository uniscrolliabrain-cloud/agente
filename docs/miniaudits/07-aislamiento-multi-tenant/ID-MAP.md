<!-- ID_MAP_V1 -->
# ID-MAP — Campaña 1 (aislamiento multi-tenant)

**Creado:** 
2026-10-21
 (Fase 0 / PS01e)
**Estado:** PROVISIONAL. Filas TBD se rellenan en Fase 1 cuando se lea miniaudit.md completo.

## Tabla miniaudit ↔ D-ID ↔ 07-A-ID ↔ Plan-Maestro

| Miniaudit # | D-ID | 07-A-ID | Plan-Maestro ID | Título | Estado |
|---|---|---|---|---|---|
| 1 | D1 | 07-A1 | (FP) | Files/Rag/Workspace con db crudo | FP confirmado |
| 2 | D2 | 07-A4 | (FP) | setMembership no invalida cache | FP confirmado |
| 3 | D3 | 07-A9 | F04.2 / F04.3 | 2 usos prohibidos de default | verificar Fase 5 en vivo |
| 4-19 | D4-D19 | 07-A2..A12 | TBD | TBD | TBD — Fase 1 |
| 20 | D20 | — | (C2) | Tenant switcher frontend | Campaña 2 |

## Entradas nuevas (N01–N07)

| ID | Título | Fichero:linea | Estado |
|---|---|---|---|
| N01 | scan<T>() solo primer prefix | db-tenant.ts | Working tree modificado por Copilot, no confirmado |
| N02 | admin-tenants escribe bajo owner system sin invalidar cache | admin-tenants.ts | Confirmado en Repomix |
| N03 | TBD | — | Fase 1 |
| N04 | TBD | — | Fase 1 |
| N05 | AgentService sin rateLimiter | service.ts | Confirmado en Repomix holístico |
| N06 | Config sin MULTI_TENANT_SHARED | config.ts | Confirmado en Repomix holístico |
| N07 | scanByOwnerPrefix no rechaza prefijos maliciosos | db.ts + tests | Confirmado en Repomix |

## Documentación de campaña en old/ (no en raíz)

Los 6 documentos de la campaña están en old/, no en la raíz. La raíz tiene fixes.md, miniaudit.md, roadmap.md como D en git (borrados, existen en old/).

## Marcas verificadas

Ver sección 4 de ESTADO-REAL-MULTITENANT.md (generada en BLOQUE 1).

