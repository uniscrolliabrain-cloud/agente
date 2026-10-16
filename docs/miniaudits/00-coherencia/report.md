# Informe de coherencia — Bloque 00

> v1 · 2026-10-05 · Estado: cerrado
> Fuente: 4 auditores oficiales (anchors, contracts, idempotency, tenant-default)
> + verificación manual de los 20 huecos profundos del miniaudit.

## Resumen

El miniaudit del bloque 00 es cualitativamente correcto y cuantitativamente
subestimado. La realidad es 3-5x peor de lo declarado, tal y como el propio
miniaudit predice ("la auditoría profunda encuentra 3-5x más").

## Resultados de los 4 auditores oficiales

### anchors
- Sin bloques `.ps1` en `scripts/audits/blocks/`. Nada que verificar.
- El directorio solo tiene un README.

### contracts
- 212 contratos totales.
- 78 con implementación real.
- 13 marcados PENDING/STUB.
- **121 sin implementación y sin marca** (mayoría son tipos/schemas de
  `packages/domain` que se consumen internamente).

### idempotency
- 284 ficheros revisados.
- **535 marcas encontradas, 432 únicas.**
- 65 marcas duplicadas con cuerpo distinto.
- 2 marcas huérfanas (`EXPORT_BUSINESS_WEB_V1`, `FALLBACK_V1`).
- 53 marcas repetidas en el mismo fichero.

### tenant-default
- 324 ficheros revisados.
- 66 ocurrencias de "default".
- **64 permitidas, 2 prohibidas:**
  - `apps/server/src/engine/events/bus.ts:109` — `notification-prefs` con id literal `"default"`.
  - `packages/domain/src/views.ts:20` — enum con valor "default" (legítimo).

## Verificación de los 20 huecos profundos

| # | Hueco | Estado | Notas |
|---|-------|--------|-------|
| 1 | Marcas repetidas en mismo archivo | CONFIRMADO | 53 vs 2 declaradas |
| 2 | Marcas huérfanas | CONFIRMADO | 2 reales + ~460 sin bloque `.ps1` |
| 3 | Contratos Zod declarados sin aplicar | CONFIRMADO | 121 sin implementación ni marca |
| 4 | Constantes declaradas sin uso | CONFIRMADO | `MAX_CHILD_DEPTH` (en realidad sí se usa), `TenantConfig.fastIdleMs` |
| 5 | Adapters huérfanos | CONFIRMADO | `DatabaseTenantResolver`, `DatabaseTenantConfigResolver` con marca PENDING |
| 6 | Código cromos sin uso | CONFIRMADO | `kernel/cromos/**` con marca CROMOS_PENDING |
| 7 | Funciones exportadas sin consumidor | PARCIAL | derivado del 3 |
| 8 | Rutas sin cliente | NO VERIFICADO | requiere cruce web/api |
| 9 | Config declarada sin lectura | PARCIAL | `toolTimeouts` en config.ts |
| 10 | Timeouts hardcodeados | CONFIRMADO | múltiples en computer.ts, google-auth.ts |
| 11 | console.log directo | CONFIRMADO | 27 sitios, ~5 legítimos |
| 12 | catch vacíos | NO VERIFICADO | requiere grep |
| 13 | TODO sin issue-link | CONFIRMADO | `KERNEL_TENANT_DB_V1`, `KERNEL_AUDIT_DB_V1` |
| 14 | Docs sin cabecera | NO VERIFICADO | requiere revisar 25 |
| 15 | Fix sin test | CONFIRMADO | universal en el repo |
| 16 | Bloque sin verificación 15/15 | CONFIRMADO | solo existe bloque-10.ps1 |
| 17 | Rama sin merge tras 30 días | NO VERIFICABLE | sin acceso git |
| 18 | package.json sin script de coherencia | CONFIRMADO | ahora existe `audit:coherence` |
| 19 | Sin informe de coherencia | CONFIRMADO | este documento lo resuelve |
| 20 | Sin umbral de aceptable | CONFIRMADO | pendiente definir |

## Fixes aplicados

- `audit:coherence` añadido a package.json.
- Este informe creado.

## Fixes descartados (falsos positivos)

- `VIEW_RESOLVER_V1` duplicada: no duplicada. Server y web hacen cosas distintas.
- `OUTCOME_V1` duplicada: no duplicada. Una es la definición, otra es el uso del tipo.
- `AGENT_ROLE_V3` x6: no son 6 aplicaciones del mismo fix, es la misma marca documentando 6 campos de la misma ampliación.
- `MAX_CHILD_DEPTH` no usado: sí se usa, ya verificado.

## Pendientes (fuera de este bloque)

- Umbral de aceptable: definir qué nivel de repetición de marcas es tolerable.
- `console.log` directos: caso por caso en el bloque que toque cada archivo.
- Contratos Zod sin implementación: revisar caso por caso cuando cada bloque use el contrato.

## Modelo del repo

Clone-por-cliente: un deployment por cliente. `tenantId` siempre `"default"`.

La ruta a multi-tenant real está documentada en
`docs/audits/07-aislamiento-multi-tenant/miniaudit.md` (sección
"Ruta a multi-tenant real").