# Runbook Ejecutable: 8 Fases / 180 capacidades / 170+ hunks

> v1 · 2026-10-08 · Rama: `feat/ui-campaign` (HEAD `801f9b4`)
>
> **Uso:** esta es la guía única. Un agente lo meta en PowerShell y ejecuta fase por fase.
> Cada fix lleva:
> 1. qué código de la base lo soporta (anchors),
> 2. qué archivos toca (modificados / nuevos),
> 3. cómo se verifica (commandos PowerShell),
> 4. presupuesto de "fallos" (MISS) y regla de oro de no dejar archivos a medias.

---

## 1. Resumen ejecutivo

| Concepto | Valor |
|---|---|
| Rama objetivo | `feat/ui-campaign` |
| Commits parcheados | 17 modificados (incl. 1 borrado: `AgentsView.tsx`) |
| 8 fases | 1, 2, 3, 4, 5, 6, 7, 8 |
| Capacidades totales | 180 |
| Hunks estimados | 170+ |
| Archivos base leídos | `retry.ts`, `events/types.ts`, `kernel.ts`, `service.ts`, `app.ts`, `bootstrap.ts`, `personas/routes.ts`, `graph/in-memory-store.ts`, `graph/store-store.ts`, `graph/store.ts`, `graph/turn.ts`, `index.ts` |
| Folder de reporte | `docs/audits/09-kernel-cognitivo/` |

### Arquitectura que integra el runbook

```
apps/server/src/engine/
  retry.ts            — primitiva de backoff con jitter (RETRY_V1)
  events/types.ts     — SystemEvent (correlación opcional)
  events/bus.ts       — emitir / filtrar eventos (término de bloque 08)
  events/schemas.ts   — Zod schemas de validación (NUEVO en F1)
  service.ts          — AgentService (creador de turnos y contextos)
  app.ts              — inyección de dependencias y rutas HTTP
  personas/routes.ts  — endpoint de personas+modelProps
engine/
  kernel/kernel.ts    — orquestador del grafo cognitivo (Kernel class)
    graph/
      store.ts        — contrato de TurnStore (open, close, append...)
      in-memory-store.ts — implementación en memoria
      store-store.ts  — rediseño de store con cache TTL
      turn.ts         — tipos Turn, TurnCloseReason, TurnClosedBy
      thought.ts      — types Thought + thoughtSchema Zod
      consolidate.ts  — consolidación periódica (CONSOLIDATE_ACTION_V1)
    audit/store-store.ts — store de auditoría (append, verify)
    tenants/
      resolver.ts     — resuelve tenantId de owner
    config/
      tenant-config.ts— capas de configuración del tenant
logs/
  log.ts              — writeLog, writeBackgroundLog (F1 extiende backgroundFailure)
packages/domain/src/
  agent.ts            — Agent definition (task transitions)
  capability.ts       — Capability definition (actionType, family)
  taxonomy.ts         — 15 families de capacidad
  actions.ts          — 16 verbos de acción
  ontology.ts         — OntologyBundle + CapabilitySpec
  sop.ts              — SOP steps + canTransitionTask
```

---

## 2. Método de patches (reglas duras)

1. Un hunk = un fix. Un patchset = todos los hunks de una fase.
2. Marca única `NN-XX` (Fase número - secuencia).
3. Anchor literal de máximo 10 líneas, verificado con `Select-String`.
4. Guard de idempotencia: `if (-not $content.Contains($anchor)) { ... }`.
5. Escritura UTF-8 sin BOM, preservar line endings.
6. Typecheck al cerrar cada fase.
7. MISS → `_pendientes.md`, no bloquea la fase.
8. Solo se tocan los archivos anunciados; sin código huérfano.

### Métrica 15/15 por fase

| Estado | Significado |
|---|---|
| ✅ 15/15 | Fase cerrada, commit listo |
| ⚠️ X/15 | Fase semi-cerrada, MISS en `_pendientes.md` |
| ❌ 0/15 | Fase no emprendida (solo si hay fallo crítico) |

### Pattern de idempotencia (PowerShell)

```powershell
$content = Get-Content -Raw $file
if (-not $content.Contains($anchor)) {
  # insertar patch aquí
} else {
  Write-Host "SKIP: $file ya tiene el anchor" -ForegroundColor Yellow
}
```

---
