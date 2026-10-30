# BEFORE — NC-P00a: mapa y contratos de la base compartida

| Campo | Valor |
| --- | --- |
| Unidad | NC-P00a (fase 0 compartida, parte documental) |
| Fecha | 2026-10-30 |
| Base | `main` **4f81f22** |
| Rama | `campaign/nc-p00a-foundation-map` |
| Worktree | `C:\Users\Alfonso\Desktop\git hub repos\agente-nc-p00` |
| Autor | Implementador Freebuff |
| Estado | `ready_for_review` (documentos); sin código |
| Asignación de Codex | **No recibida todavía**. Unidad autopropuesta, coherente con `NC-P00-SHARED-FOUNDATION.md` |

## 1. Objetivo y criterio de cierre

Producir el paquete documental de NC-P00a que exige el acuerdo: mapa real de llamadas y firmas, propiedad por archivo, solicitudes de puente, contratos mínimos y patchsets ordenados. Cierre = revisión del jefe VS sobre el mapa y las reservas, y asignación de Codex para NC-P00b.

No es una auditoría general ni una implementación. No modifica código, tests, configuración ni índices de Cline.

## 2. Dependencias y SHA

- `origin/main` = `4f81f22` (PR #6). Comprobado tras `git fetch` el 2026-10-30: no hay commits posteriores.
- Documentos leídos: `HANDOFF-JEFE-NUCLEO.md`, `NC-P00-SHARED-FOUNDATION.md`, `CAMPANA-VERTICAL-AGNTIA.md` (VS-01) y las tres especificaciones `specs/NC-0{1,2,3}-SOURCE.md` (cabeceras y estructura; el diseño completo se usó como contexto, no como prueba de estado).
- No existe `AGENTS.md` ni `CLAUDE.md` en la raíz.

## 3. Archivos que se crean o modifican

**Nuevos**

- `docs/campaigns/NC-COORDINATION/ARCHITECTURE-MAP.md`
- `docs/campaigns/NC-COORDINATION/FILE-OWNERSHIP.md`
- `docs/campaigns/NC-COORDINATION/BRIDGE-REQUESTS.md`
- `docs/campaigns/NC-COORDINATION/CONTRACT-CANDIDATES.md`
- `docs/campaigns/NC-COORDINATION/PATCHSETS.md`
- `docs/campaigns/NC-COORDINATION/reports/NC-P00a-foundation-map/BEFORE.md`
- `docs/campaigns/NC-COORDINATION/reports/NC-P00a-foundation-map/AFTER.md`

**Modificados:** ninguno.

**Fuera del alcance:** todo `apps/server/**`, `packages/**`, `tests/**`, `package.json`, lockfiles, `app.ts`, `config.ts`, `db*.ts`, `events/**`, kernel y cualquier archivo del vertical.

## 4. Comportamiento actual comprobado

Lectura estática del SHA base. Detalle y líneas en `ARCHITECTURE-MAP.md`.

| Hecho observado | Evidencia |
| --- | --- |
| Conviven dos `MemoryService` y dos espacios de clave | `app.ts:183` (Store crudo) vs `service.ts:245` (`tdb`) |
| `BusinessGraph` y `ContextEngine` usan Store crudo; bus/workspace usan `tdb` | `app.ts:137,168,183,184` |
| La tarea durable persiste `tenantId` pero el worker no abre scope | `service.ts:1236,1274`; `worker.ts:181,242` |
| El actor del worker se reconstruye con fallback `legacy` | `worker.ts:372` |
| `emit` captura errores y publica en subscribers de proceso | `events/bus.ts:109,113,146` |
| El vocabulario de eventos es cerrado y exhaustivo | `events/types.ts:1`; `events/schemas.ts:24` |
| `SlowAuthor` solo se usa en SOP, no en `model.ts` | `sop-executor.ts:119`; `model.ts:617` |
| Cromos declarados y sin cablear | `kernel/cromos/cromo.ts:1`; `env-resolver.ts:81` |

**Hipótesis pendiente de prueba:** que `StoreTurnStore.thoughtsOf` caiga siempre al batching porque el prefijo indexado no coincide con la clave real (`store-store.ts:148` vs `app.ts:198-213`). Marcada `[H]`; no se usa como base de ningún fix.

## 5. Necesidad y solución mínima

NC-P00b no puede empezar sin un mapa verificado, reservas explícitas y contratos mínimos acordados: el riesgo es que NC y VS editen los mismos archivos o que el núcleo cree un segundo motor de memoria/eventos.

La solución de esta unidad es **solo documental**: describir el estado real, proponer reservas y puentes, y ordenar los patchsets. Ninguna afirmación se apoya en comentarios del código ni en las especificaciones.

## 6. Contratos reutilizados

- `KernelContext` (`kernel/context/kernel-context.ts:15-30`) como identidad canónica.
- `MemoryService.recall` (`memory.ts:90`) y `RecallResult` (`memory.ts:27`) sin cambiar su contrato público.
- `ContextEngine.assemble` (`context/engine.ts:59`) y `ContextPackage` (`:13`).
- `EventBus.emit` (`events/bus.ts:70`) con extensión aditiva `strict`.
- `AgentTask.tenantId` (`packages/domain/src/agent.ts:76`) ya obligatorio; solo se añaden campos opcionales de actor.

## 7. Impacto

- **Núcleo:** habilita PS-01..PS-04 y NC-P01/P02 sin crear subsistemas paralelos.
- **Vertical:** VS-01 recibe el fix de contexto durable como parte de su propia fase; no se duplica.
- **Riesgo de no hacerlo:** dos equipos escribiendo los mismos archivos sin allowlist, y un proyector cognitivo sobre un namespace de memoria equivocado.

## 8. Pruebas previstas

Esta unidad no tiene pruebas de código. Verificación:

- Existencia de todos los paths citados en el SHA base.
- Enlaces relativos entre documentos resueltos.
- `git status --short` limitado a los archivos declarados.
- Revisión humana de las líneas citadas.

No se ejecuta `pnpm typecheck` ni `pnpm test`: no hay cambios ejecutables y el baseline pertenece a P00b.

## 9. Compatibilidad, riesgos y rollback

- Compatibilidad: ninguna superficie de ejecución cambia.
- Riesgo principal: que Codex ya tenga asignada otra unidad o que el jefe VS rechace reservas. En ese caso, estos documentos se corrigen y no se activa ninguna reserva.
- Riesgo secundario: deriva de líneas si `main` avanza. El SHA base queda fijado en cada documento.
- Rollback: revertir la PR documental; no hay datos ni migraciones.

## 10. Incertidumbres y decisiones pendientes

1. Confirmación de Codex de que esta es la unidad y la rama correctas.
2. Aceptación del jefe VS de NC-BR-001…003 y de las reservas de `FILE-OWNERSHIP.md`.
3. Ontología de 10 dimensiones y 6 polaridades: sin fuente; no se implementa.
4. Proveedor real de Jev: sin verificar; baseline determinista primero.
5. Autorización para publicar la rama y abrir PR en borrador.

## 11. Hechos frente a hipótesis

- **Hechos:** todas las filas de §4 con `archivo:línea`.
- **Hipótesis:** F10 del mapa (índice de thoughts) y el impacto real de los fallos de aislamiento hasta que se reproduzcan con pruebas.
- **No comprobado:** comportamiento en producción, latencias, datos existentes afectados por el namespace de memoria.
