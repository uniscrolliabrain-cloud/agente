# TRABAJO IA-2 — Frontend: UI servida (ViewSpec) · Templates reales · Frontend React

> Documento de trabajo autocontenido. Para una IA que **no ve el repo completo**.
> Dominios: `docs/audits/13-ui-servida-viewspec`, `14-templates-reales`, `15-frontend-react`.
> Fecha: 2026-10-13.

## Cómo usar este documento

- Cada tarea: **ID · Fichero · Problema · Fix · Verificación**.
- **Regla anti-maquillaje:** "hecho" = compila + test pasa + observable + hace lo que debe. Prohibido skipear tests, subir timeouts o `as never`/`void x` para callar errores.
- **Rutas:** frontend `apps/web/src/...`; dominio `packages/domain/src/views.ts`; resolver `apps/server/src/engine/views/resolver.ts`, rutas `apps/server/src/routes/views.ts`.
- **Base de tests:** no hay tests de frontend hoy (0 cobertura). Estos serán de los primeros: usa Vitest/Testing-Library si ya está, si no, `@testing-library/react` + el runner que elija el repo. Verifica antes qué usa `apps/web`.
- **NO toques** `service.ts` (reparado, gigante).

## Resumen

| Dominio | Tareas | Ficheros núcleo |
|---|---|---|
| 13 — UI servida (ViewSpec) | 20 | `packages/domain/src/views.ts`, `engine/views/resolver.ts`, `routes/views.ts`, `apps/web/src/hooks/useViewResolver.ts` |
| 14 — Templates reales | 20 | `apps/web/src/templates/*`, `apps/web/src/view/ViewRenderer.tsx` |
| 15 — Frontend React | 20 | `apps/web/src/*` |
| **Total** | **60** | |

---

# DOMINIO 13 — UI servida (ViewSpec)

**Promesa:** el chat resuelve intenciones y sirve una vista concreta (dashboard, queue, inbox, board, table, detail, form). 7 kinds en el schema.
**Estado real:** `ViewResolver` con regex de intenciones. `runtimeViewSpecSchema` con 7 kinds. `resolveView` en `conversation.ts` ya se llama en el turno. **PERO:** `registerIntent` no se llama en runtime → `resolveView` siempre devuelve `null`. `view.resolved` se emite al bus pero el frontend no lo consume por SSE.

| ID | Hueco | Fichero | Fix | Verificación |
|----|-------|---------|-----|--------------|
| T-13-01 | `registerIntent` no se llama en runtime → `resolveView` siempre null | `engine/views/resolver.ts` | Registra las intenciones reales al arrancar (no solo en tests) | Test: "muéstrame el dashboard" → spec no null |
| T-13-02 | Sin cache por thread (cada mensaje llama a /api/views/resolve) | frontend hook + resolver | Cache por threadId | Test: 10 mensajes mismo thread → 1 request |
| T-13-03 | `resolveView` regex sin normalizar acentos ("factura" sí, "facturá" no) | `engine/views/resolver.ts` | Normaliza (NFD strip diacríticos) antes del match | Test: "facturá" matchea |
| T-13-04 | Sin cache de specs resueltos (no hay LRU) | resolver o frontend | LRU de specs por intención | Test: misma intención → cache hit |
| T-13-05 | Sin "el usuario puede elegir vista" (solo automática) | frontend panel | Botón para forzar tipo de vista | Test: forzar "table" → panel muestra tabla |
| T-13-06 | Sin "vista anterior" (panel se vacía sin historial) | frontend panel | Guarda última vista válida | Test: panel vacío → muestra última |
| T-13-07 | `RuntimeViewSpec` sin `provenance` | `packages/domain/src/views.ts` | Añade campo `provenance` (intención origen) | Test: spec incluye provenance |
| T-13-08 | Sin validación estricta al servir (spec pasa schema pero es incoherente) | `routes/views.ts` | Rechaza specs incoherentes (ej. dashboard sin KPIs) | Test: spec incoherente → 422 |
| T-13-09 | `view.resolved` se emite pero nadie lo consume por SSE | frontend SSE + `routes/events.ts` | Frontend escucha `view.resolved` y pinta el panel | Test: emitir evento → panel se actualiza |
| T-13-10 | Sin "preview" antes de abrir | frontend panel | Confirmación/previa ligera | Test: preview visible antes de abrir |
| T-13-11 | Sin "vista por defecto" si no hay intención | frontend panel | Vista default sensata (no vacío) | Test: sin intención → vista default |
| T-13-12 | Sin "vista persistida por usuario" | backend + frontend | Persiste última vista del usuario | Test: recargar → misma vista |
| T-13-13 | Sin "vista compartida" entre usuarios del tenant | backend | Endpoint para compartir spec | Test: usuario A comparte → B la ve |
| T-13-14 | Sin "vista exportable" (CSV) | frontend template | Botón exportar CSV en table | Test: exportar → descarga CSV |
| T-13-15 | `useViewResolver` sin manejo de errores (sin retry/fallback) | `apps/web/src/hooks/useViewResolver.ts` | Retry + fallback | Test: request falla → retry, luego fallback |
| T-13-16 | Sin "loading state" (no distingue cargando de vacío) | frontend panel | Estado loading explícito | Test: cargando → spinner |
| T-13-17 | Sin "vista cacheada" (cada escritura re-pide) | frontend | Cache invalidada por evento, no por cada tecla | Test: cache sobrevive entre turnos |
| T-13-18 | Sin "spec válido mínimo" (dashboard sin KPIs es válido pero inútil) | `packages/domain/src/views.ts` | Schema exige contenido mínimo por kind | Test: dashboard sin KPIs → schema falla |
| T-13-19 | Sin test de las 20 intenciones reales (solo 4 mock) | `tests/` | Test con las 20 intenciones reales | `pnpm test` 20 intenciones en verde |
| T-13-20 | `ViewResolver` con regex en cliente (ReDoS con input raro) | resolver | Regex segura o motor de intents sin backtracking | Test: input adversarial no cuelga |

<!--DOM14-->
