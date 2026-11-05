# FASE-01 — Inventario y evidencia de documentación

> v1 · 2026-10-27 · Estado: current

## Métricas del corpus (medido)

| Métrica | Valor |
|---------|-------|
| `.md` totales en repo (sin `node_modules`) | 804 |
| `.md` en `docs/` | 254 (34.885 líneas) |
| `.md` en `packages/workspaces/*/docs` | 375 |
| `.md` en `apps/web/src/workspaces/*/docs` | 149 |
| Docs con cabecera de versión válida (`> vN · YYYY-MM-DD · Estado: ...`) | 77 / 254 |

## Audits del gate (resultado real medido)

| Audit | Resultado | Detalle |
|-------|-----------|---------|
| `layers` | Verde | 0 |
| `bridges` | Verde | 0 |
| `console` | Verde | 0 |
| `anchors` | Verde | 0 |
| `tenant-default` | Verde | 0 |
| `contracts` | Rojo | 154 OK / 14 PENDING / **150 huérfanos** |
| `idempotency` | Rojo | **157 duplicadas** / 4 huérfanas / 138 repetidas mismo fichero |
| `coherence` | Rojo | 5/7 verdes (contracts e idempotency bloquean) |

## Duplicados exactos detectados

| Grupo | Archivos | Notas |
|-------|----------|-------|
| `docs/codespace-automation/deliverables/` | 9 ficheros | Calcados a `docs/2026-10-18-resultados/` |
| `docs/trabajos/IA-1…` | 1 | Copia de `miniaudits/10/IA-1…` |
| `docs/kernel/AUDIT_*` | 3 copias | Del 2026-10-03, frente a las de la raíz de hoy |

## Ruido localizado

| Elemento | Descripción |
|----------|-------------|
| `26-capability-e2e-miniaudit (1).md` | Duplicado con paréntesis |
| `a.coherencia.summun.md` | Directorio ruidoso |
| `_backup-10-fast-slow-llm-*/` | 2 directorios de backup |
| 20 `fixes.md` | Menos de 400 bytes cada uno |
| `34-workspaces-pipeline.md.bak-V1` | Backup con extensión .bak |

## 8 contradicciones docs ↔ código (cada una con línea de código que decide)

| # | Documento | Afirmación del doc | Qué dice el código real | Línea de código decisiva |
|---|-----------|-------------------|------------------------|-------------------------|
| 1 | `docs/README.md` | Índice "Estado: current" con rutas que no existen | Apunta a `./ROADMAP.md`, `./interfaz/…`, `../SECURITY.md` que no existen | `docs/README.md` líneas 12-14, 28-29, 37-38, 55, 68 |
| 2 | `TODO-FOR-PROD.md` | "Multitenancy no se hace en este repo" | RLS, claim de tenant, `switch-tenant`, tests de aislamiento existen | `db-rls.ts`, `tenant.ts`, `auth-routes.ts` |
| 3 | `PRODUCCION.md` | "50 EUR/día de cuota como real" | El consumo se cuenta en caracteres, no en EUR fijos | `guardrails/service.ts:25` (`costEurPerDay: 50` es default, no real) |
| 4 | `README.md` (raíz) | Rama activa: `feat/multitenancy-campaign` | Rama real: `campaign/authz-tenant` (c5a8c7c) | `git branch -a` |
| 5 | `PRODUCT.md` | "No es multitenant compartido" | Código tiene multi-tenant implementado (Campaña 1, Fases 0–7) | `db-tenant.ts`, `tenant.ts` |
| 6 | `BETA.md` | "Presenter no wireado intencional bloque D" | Presenter existe pero no está wireado al SSE | `engine/events/index.ts`, `events-routes.ts` |
| 7 | `docs/ARCHITECTURE.md` | Persistencia: pglite dev, pg prod | Dual backend PGlite/Postgres implementado | `db.ts` |
| 8 | `docs/KERNEL_SPEC.md` | Spec del kernel V2 | Kernel V2 implementado con AttentionVector, Meta, Presenter, hash chain | `kernel/index.ts` |

## Estado de archivos de raíz (referenciados pero ausentes)

| Archivo | Estado | Notas |
|---------|--------|-------|
| `whitepaper.md` | ❌ No existe | Se crea en FASE-03 |
| `PRODUCT.md` | ❌ No existe en raíz | Está en `docs/02-producto/PRODUCT.md` |
| `ROADMAP.md` | ❌ No existe en raíz | Se crea en `docs/02-producto/ROADMAP.md` |
| `KNOWN_ISSUES.md` | ❌ No existe | Se crea en FASE-03 |
| `DEPLOY.md` | ❌ No existe | Se crea en `docs/04-operaciones/DEPLOY.md` |
| `DEPLOY-CLIENTE.md` | ❌ No existe | Se crea en `docs/04-operaciones/DEPLOY-CLIENTE.md` |
| `PRODUCCION.md` | ❌ No existe | Se crea en `docs/04-operaciones/PRODUCCION.md` |
| `ONBOARDING-CLIENTE.md` | ❌ No existe | Se crea en `docs/04-operaciones/ONBOARDING-CLIENTE.md` |
| `CLIENTE.md` | ❌ No existe | Se crea en `docs/04-operaciones/CLIENTE.md` |
| `SECURITY.md` | ❌ No existe | Se crea en `docs/03-arquitectura/SECURITY.md` |
| `WORK_LOG_2026_10_03.md` | ❌ No existe | Se archiva si aparece |
| `future_plans.md` | ❌ No existe | Se consolida en ROADMAP.md |
| `HANDOFF-LLM.md` | ❌ No existe | Se crea en `docs/09-handoffs/HANDOFF-LLM.md` |
| `HANDOFF-CODEX.md` | ❌ No existe | Se crea en `docs/09-handoffs/HANDOFF-CODEX.md` |
| `AUDITORIA-LLM-WORKSPACE.md` | ❌ No existe | Se crea en `docs/09-handoffs/AUDITORIA-LLM-WORKSPACE.md` |

## Entrada para FASE-02

Todos los docs de `docs/` raíz que no tengan una cabecera válida actual o que describan funcionalidad no implementada se mueven a `docs/archive/2026-10/` con `git mv`.
