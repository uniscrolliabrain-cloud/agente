# NC-P00 — Registro de propiedad de archivos

> Base: `main` **4f81f22** · Fecha: 2026-10-30 · Estado: propuesta de NC-P00a, pendiente de revisión del jefe VS.
> Este registro es operativo, **no un lock automático de Git**. Se comprueba contra `git diff` en cada patchset.

## 1. Reglas de uso

1. Un archivo tiene **un escritor por ventana**. Leer es libre; escribir exige reserva registrada.
2. Antes de empezar: `git fetch`, comprobar SHA, comprobar esta tabla y el `BRIDGE-REQUESTS.md`.
3. Cada entrega se audita con `git diff --name-only BASE_SHA...HEAD` contra su allowlist exacta. Un archivo no listado detiene esa parte del patchset.
4. Los paths nuevos del núcleo no requieren puente, pero sí declaración en esta tabla.
5. La reserva se libera solo con PR integrada, consumidores actualizados y evidencia de pruebas (ver `NC-P00-SHARED-FOUNDATION.md`).
6. No se revierte trabajo previo de Freebuff/Cline para imponer una reserva.

## 2. Checkout y ramas

| Elemento | Valor |
| --- | --- |
| Checkout del Escritorio | `C:\Users\Alfonso\Desktop\git hub repos\agente` — **solo lectura**, con trabajo de Cline y cambios locales |
| Worktree de esta fase | `C:\Users\Alfonso\Desktop\git hub repos\agente-nc-p00` |
| Rama | `campaign/nc-p00-coordination` |
| Base | `4f81f22` (`Merge pull request #6 … docs/nc-phase0-shared-foundation`) |
| PR de esta entrega | pendiente (solo documentos; sin commit ni push todavía) |

## 3. Superficies exclusivas del núcleo (sin puente)

| Path | Contenido | Escritor | Consumidor previsto |
| --- | --- | --- | --- |
| `apps/server/src/engine/cognition/**` | módulos cognitivos nuevos | NC | `AgentService`, bus, rutas cognitivas |
| `packages/domain/src/cognition.ts` | contratos canónicos de cognición (nuevo) | Jefe NC | NC y VS (solo lectura) |
| `tests/cognition/**` | pruebas del núcleo | NC (subcarpetas por agente) | CI |
| `apps/web/src/components/cognition/**` | inspectores aislados | NC | montaje posterior por VS |
| `apps/web/src/api/cognition.ts` | cliente de inspectores (nuevo) | NC | componentes |
| `apps/server/src/cognition-routes.ts` | rutas de inspección (nuevo) | Jefe NC | montaje posterior en `app.ts` |
| `docs/campaigns/NC-01/**`, `NC-02/**`, `NC-03/**` | documentación de campaña | Jefe NC / Cline bajo encargo | — |
| `docs/campaigns/NC-COORDINATION/**` | coordinación de fase 0 | Jefe NC | ambos equipos |
| `docs/verification/cognition/**` | evidencia con namespace propio | Jefe NC | Copilot |

## 4. Archivos compartidos reservados para NC-P00b

Reserva **propuesta**: no está activa hasta que el jefe VS la revise y Alfonso o el propio jefe VS la acepten por el canal acordado.

| Path | Motivo del cambio | Patchset | Estado | Criterio de liberación |
| --- | --- | --- | --- | --- |
| `apps/server/src/engine/worker.ts` | ejecutar con scope de tenant/actor restaurado | PS-01 | propuesto | prueba de dos tenants + reinicio |
| `apps/server/src/engine/service.ts` | persistir contexto de ejecución y crear la instancia única de memoria/contexto | PS-01, PS-03 | propuesto | igual + equivalencia con flag apagada |
| `packages/domain/src/agent.ts` | campos aditivos de actor/contexto en `AgentTask` | PS-01 | propuesto (puente serial) | compatibilidad con registros antiguos |
| `apps/server/src/app.ts` | resolver Store único para memoria/contexto y montaje posterior de flags | PS-03 | propuesto | diff acotado a las líneas de construcción |
| `apps/server/src/engine/memory.ts` | conservar API y exponer recall tipado para el puerto | PS-03 | propuesto | consumidores legacy sin cambios |
| `apps/server/src/engine/context/engine.ts` | aceptar el puerto de memoria y el Store scoped | PS-03 | propuesto | `context.assembled` compatible |
| `apps/server/src/engine/business/graph.ts` | ampliar tipo de Store para aceptar `tdb` o adaptador | PS-03 | propuesto | sin cambio de comportamiento del grafo |
| `apps/server/src/engine/events/bus.ts` | confirmación explícita sin romper `emit` actual | PS-02 | propuesto | tests de bus + rutas existentes verdes |
| `apps/server/src/engine/events/sinks/store.ts` | devolver resultado de escritura confirmada | PS-02 | propuesto | idempotencia y replay |
| `apps/server/src/config.ts` | flag de capacidad cognitiva (apagada) | PS-04 | propuesto, no iniciar | config por defecto equivalente |
| `.env.example` | documentar la flag | PS-04 | propuesto, no iniciar | sin secretos |

## 5. Puentes seriales (un escritor por PR, ambos revisan)

| Path | Uso | Regla |
| --- | --- | --- |
| `apps/server/src/engine/events/types.ts`, `schemas.ts`, `index.ts` | vocabulario de eventos | una sola PR; no apropiarse del bus creando una carpeta paralela |
| `packages/domain/src/index.ts`, `kernel.ts`, `execution-context.ts` | contratos compartidos | extensión compatible, un escritor |
| `package.json`, `pnpm-lock.yaml`, `tsconfig*.json`, CI, `fly*.toml` | tooling y despliegue | ningún agente los toca para hacer compilar su módulo |
| `apps/server/src/db.ts`, `db-tenant.ts`, `tenant-scope.ts` | aislamiento y storage | solo con puente aceptado; no redefinir tenancy desde NC |
| `apps/server/src/kernel/**` existente | invariantes cognitivos | tras P00, solo archivos enumerados en el manifiesto del patchset |

## 6. Territorio VS (NC solo lectura)

- `apps/server/src/whatsapp-routes.ts`, `google-auth.ts`, `auth-routes.ts`, `billing-routes.ts`, `social-routes.ts`, `gmb-routes.ts`.
- `apps/server/src/engine/workspace*`, `workspaces/**`, `handoff/**`, `billing*`.
- Panel, navegación, conexiones y permisos de UI.
- `docs/operacion/**` (incluida `CAMPANA-VERTICAL-AGNTIA.md`) y `docs/verification/vertical/**`.
- `docs/registro-agentes/**` e índices documentales: Cline.

## 7. Verificación de una entrega

```bash
# En el worktree, con BASE_SHA fijado
BASE_SHA=4f81f22
git fetch origin --prune
git diff --name-only "$BASE_SHA"...HEAD
git diff --name-only            # cambios sin commit
git status --short              # nuevos, renames y untracked
```

Criterio: la unión de las tres salidas debe ser subconjunto de la allowlist del patchset. `git diff --check` solo detecta whitespace: no sustituye esta comprobación.

## 8. Reservas activas en este momento

| ID | Path(s) | Escritor | Patchset | Estado |
| --- | --- | --- | --- | --- |
| NC-RSV-000 | `docs/campaigns/NC-COORDINATION/{ARCHITECTURE-MAP,FILE-OWNERSHIP,BRIDGE-REQUESTS,CONTRACT-CANDIDATES,PATCHSETS}.md` | Jefe NC | PS-00 | **activa** (documentos de esta entrega) |

El resto de la tabla §4 son candidaturas, no reservas. Ninguna habilita a editar todavía.
