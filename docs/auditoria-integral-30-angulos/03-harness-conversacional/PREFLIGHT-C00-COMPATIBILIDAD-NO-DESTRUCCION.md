# C00 — Auditoría preventiva de compatibilidad y no destrucción (opción 3)
**Fecha:** 2026-11-15
**Rama de trabajo:** `audit/preflight-cognition-option3-20261115` (creada desde `main`)
**Estado:** PRE-FLIGHT PARCIAL — BLOQUEO PREVENTIVO A CAMBIOS DE RUNTIME
**Alcance:** lectura directa del código en `agente/main`; no se ha clonado, ejecutado typecheck ni tests; no se ha inspeccionado todo el monorepo ni el código completo del hijo Cyber. Esta auditoría es un primer filtro de impacto, no certificación exhaustiva.

## Decisión operativa
**NO** implementar C01–C15 en secuencia ciega. El plan documental de opción 3 debe rebasarse sobre el grafo de llamadas real. Preservar el flujo existente y realizar patchsets aditivos y protegidos por feature flags. No fusionar ni desplegar.

## Evidencia: wiring real leído
| Superficie | Archivo y observación | Consecuencia |
|---|---|---|
| Slow→Thought→Card | `apps/server/src/engine/model.ts` ~648–708 abre child turn, llama `captureSlowCognition`, emite `cognition.card.created`, cierra child | NO crear segundo autor/capturador; ampliar captura |
| Captura | `kernel/cognition/capture.ts` llama `SlowAuthor.writeReasoning` y `buildCognitionCard` | Punto de extensión |
| Builder | `kernel/cognition/card-builder.ts` inferencia kind por regex, ID hash tenant+dedupeKey, TTL 7 días | Riesgo: revisiones de una tarea deduplicadas indebidamente |
| Schema | `packages/domain/src/cognition-card.ts` es Zod `.strict()`, V1 | Añadir metadata directamente rompe parseo; V2 compatible |
| Store | `kernel/cognition/card-store.ts` `save/list/pending/markConsumed/release/markUseful`, CAS opcional | Separar delivery ledger sin eliminar transiciones V1 |
| Context | `engine/context/cognition-cards.ts` 3 tarjetas, ~700 tokens agregado (chars/4), 700 caracteres/body | No equiparar con presupuesto futuro ~1000 tokens/tarjeta |
| Chat | `engine/conversation.ts` ~985–1020 llama `assembleCognitionCards` y emite `cognition.card.injected` | Conservar integración de prompt y release-on-error |
| Chat fallback | `engine/conversation.ts` ~1028–1090 prioriza fast tenant, incluye slow tenant como fallback, luego global chain; modelo de rol puede ponerse primero | Separar Fast/Slow sin perder fallback o política por rol |
| Chat error | `engine/conversation.ts` ~1160–1175 libera tarjetas reclamadas cuando el stream falla | Migración debe preservar recuperación en fallos |
| API tarjetas | `apps/server/src/cognition-routes.ts` GET /cards y POST /cards/:id/useful, owner y tenant desde auth | No romper rutas ni scopes |
| Bus | `engine/events/bus.ts` ~90–175 valida payload, resuelve tenant, persiste en sink, publica globalSubscribers, dedupe explícito, retorna `persisted:false` en error | No asumir que un `emit` fallido lanza; comprobar resultado |
| Subscribers | `engine/events/subscriber.ts` ~79–109 `subscribeAll` y `publish` síncrono, catch silencioso | No equivale a ACK durable de trabajo asíncrono |
| Kernel subscriber | `kernel/subscribers/events.ts` ~1–128 mapea eventos entity/action/task/sop/etc y lanza `void async runCognitionCycle` | Pérdida potencial de trabajos al caer proceso; necesita proyector durable |
| Bootstrap | `engine/service.ts` ~765–791 registra 6 listeners globales, incluidos thought, turn, metrics, audit, notifications | No duplicar consumidores existentes |
| Meta | `engine/service.ts` ~697–702 y ~836+ ejecuta meta loop en maintain; `observers/meta.ts` contiene reglas | No decir que Meta es inexistente; JEV es puerto nuevo |
| Consolidación | `engine/service.ts` ~728–755 crea context con `owner:tenantId`; `runConsolidateLoop` también usa tenant como owner | Auditar scopes y semántica antes de reescribir memoria |
| Cromos | `kernel/cromos/cromo.ts` declara explícitamente CROMOS_PENDING_V1 | Diseñar wiring, no asumir operativo |
| Tests existentes | `tests/cognition-cards.test.ts`, `tests/kernel-coherence.test.ts` encontrados | Extenderlos antes de migraciones |

## Bloqueos por riesgo destructivo
### P0-A — Romper los turnos padre/hijo
Slow se captura **antes de cerrar el turno padre** porque el store no permite crear hijo de padre cerrado. Si C07 desplaza captura a worker posterior sin mecanismo alternativo de autoría, falla la creación de Thought. **Acción:** mantener secuencia actual o diseñar un mecanismo explícito de proyección tardía con test.

### P0-B — Cambiar semántica de consumo
El código actual reclama `proposed→consumed` antes de inferir y libera en error del stream. Una implementación de snapshots que reutilice `markConsumed` agotaría tarjetas persistentes. **Acción:** delivery ledger independiente, dual-read y pruebas de concurrencia.

### P0-C — Duplicar eventos/ciclos
El bus publica a listeners en memoria y el subscriber kernel dispara `runCognitionCycle` asíncrono; añadir replay durable indiscriminado podría ejecutar la misma proyección dos veces. **Acción:** ledger por eventId+projectorVersion, idempotencia de side effects, cursor por consumidor, evitar replay automático de listeners live sin compatibilidad.

### P0-D — Cambiar modelos sin respetar fallback
El chat construye `chatModelChain` con Fast, Slow y modelo por rol. Quitar Slow de la cadena sin política alternativa puede reducir disponibilidad; mantener Slow en fallback sin distinguirlo puede introducir latencia/coste. **Acción:** contrato de routing y matriz de fallback explícitos, test por tenant/rol/API key ausente.

### P0-E — Contaminar tenants/owners
Las tarjetas se guardan por `owner`, se filtran por tenant y las rutas usan auth. En consolidación aparece `owner:tenantId`. Migrar a stores por tenant sin un mapa de ownership y pruebas puede ocultar o exponer datos. **Acción:** inspeccionar `db.ts`, `tenantService`, RLS, `cognition-routes.ts`, scopes de kernel y migraciones. ACL debe aplicarse antes de scoring.

### P0-F — Cambiar Zod V1 estricto
El contrato `cognitionCardSchema.strict()` rechazará nuevos campos. **Acción:** esquema/envelope V2 separado, migración versionada y regresión V1.

### P0-G — Falsos éxitos de operaciones
`EventBus.emit` puede devolver `persisted:false` sin throw. Una campaña que considere `await emit()` como persistencia confirmada puede perder evidencia. **Acción:** revisar callsites críticos y exigir verificación de resultado.

### P0-H — Desacoplar UX factual y decorativa
La espiral y las cinco fases pueden ser pedagogía; estado `completed` solo puede provenir de receipt/Task. **Acción:** separar tipos y probar que partial/timeout no se presentan como completado.

## Orden corregido (dependencias)
**C00a:** inventario completo de imports/callers y tests, incluyendo Cyber contratos y memorias reales.
**C00b:** tests de caracterización del flujo actual Slow→child→Card→chat→release y Fast chain.
**C00c:** tests de tenant/owner, event persisted:false, restart/replay, duplicados.
**C01:** contratos V2 aditivos + adapters V1, sin migrar writes.
**C02:** proyector durable shadow-only y ledger, no ejecutar efectos.
**C03:** ContextServingFacade shadow-only comparando snapshots con V1.
**C04:** grafo, memorias, atención y cromos tras inventario, sin segunda DB.
**C05:** Slow enriquecimiento con fallback builder y JEV port rules-only.
**C06:** shadow-to-active con feature flags por tenant y métricas.
**C07:** Fast/Slow router y Presenter tras demostrar paridad.
**C08:** Cyber adapter y event types después de contrato Python/TS verificado.
**C09:** voz/Anam y SVG tras fijar estados operativos.
**C10:** E2E, fault injection, seguridad, latencia, rollback, aprobación de merge.
Las campañas C00–C15 originales son **referencia de intención**, no órdenes de ejecución hasta reconciliar patchsets.

## Matriz mínima de pruebas de no regresión
1. Slow completado crea exactamente un Thought y una Card con tenant correcto.
2. Slow captura child antes de cierre del padre.
3. Retry del mismo task no duplica; revisión legítima no desaparece.
4. Card V1 sigue parseando y endpoints responden.
5. Dos turnos simultáneos no reclaman dos veces la misma delta.
6. Error del modelo devuelve la delta al estado recuperable.
7. Snapshot V2 persiste entre turnos sin marcar consumed.
8. Revocación de rol/tenant bloquea Card incluso con cache.
9. Tenant A nunca recibe Card/Graph/Memory de B.
10. Bus emit `persisted:false` bloquea confirmación crítica.
11. Caída entre persist y ACK converge por replay.
12. Reprocesamiento de evento no dispara segundo efecto.
13. Fast key ausente conserva fallback permitido.
14. Modelo de rol conserva precedencia intencional.
15. Slow caído no bloquea chat trivial.
16. Presenter no transforma hipótesis en hecho.
17. Cyber 202/partial/blocked/unknown no equivale a completed.
18. UI SVG no falsea estado de ejecución.
19. Voz y web respetan mismas ACL.
20. Pruebas y métricas con SHA, exit codes y sin secretos.

## Pendiente para certificar la auditoría
- Leer `conversation.ts` completo, `service.ts` completo, `model.ts` completo, `db.ts` y callers de Bus.
- Leer todas las rutas/SDK y contratos del hijo Cyber; no asumir su compatibilidad por docs.
- Inventariar cinco memorias reales, stores, RLS y cromos.
- Ejecutar typecheck, tests de caracterización, integración y fault injection en workspace real.
- Contrastar los SHA actuales y el diff con las ramas de desarrollo activas.
**Por tanto: no declarar auditoría exhaustiva ni PASS de implementación.**

## Entregable y política de no destrucción
Este informe es el primer artefacto ejecutado de C00. Se escribe en rama aislada, sin cambios en código de producción. Los siguientes patchsets deberán pasar la matriz de pruebas y tener rollback. No merge ni deploy sin aprobación del fundador.
