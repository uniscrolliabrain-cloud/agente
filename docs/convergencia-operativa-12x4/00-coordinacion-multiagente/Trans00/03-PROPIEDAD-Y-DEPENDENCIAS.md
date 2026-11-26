# Matriz de propiedad y dependencias — D-M1 candidata

Un escritor por path, no por concepto. El supervisor aprueba reservas; si dos agentes requieren el mismo archivo, el consumidor entrega contrato y test, el escritor aplica delta. La propiedad de Trans06 sobre funciones puras cromáticas no incluye almacenamiento kernel compartido. Trans05 no duplica Cognition. Los paths siguientes son familias con propietarios, no licencia para editar todos los descendientes; D-M2 fijará lista exacta con blobs, y cualquier path nuevo requiere reserva previa.

| Superficie | Escritor único propuesto | Consumidores/revisores | Condición |
|---|---|---|---|
| apps/server/src/actions.ts, actions-deferred si existe, engine/execution/*, engine/sop-executor.ts, engine/service.ts, engine/conversation.ts, engine/capabilities/bootstrap.ts | Trans01 | 02,03,04,06 | aprobar ABI y preservar legacy; Trans03 entrega contrato WorkspaceEffect, no edita actions |
| apps/server/src/db.ts, db-tenant.ts, engine/events/*, packages/domain/src/execution-context.ts, index.ts, schema de eventos | Trans01 | 02,03,04,05,06 | transacción/actor/fence; 04 revisa RLS |
| apps/server/src/app.ts, index.ts (composición) | Trans01 | 02,03,04 | 04 suministra alert snapshot y hook; no otro montaje |
| apps/server/src/engine/circuit-breaker.ts | Trans01 | 02,03 | única semántica probe/neutral; 02 cambia inference.ts, 03 adapta caller propio |
| apps/server/src/kernel/audit/*, kernel/graph/store-store.ts, in-memory-store.ts, graph/store.ts, graph/turn.ts y StorePort | Trans01 | 06,02 | atomicidad, idempotencia, cierre; no nueva persistencia |
| apps/server/src/agent.ts; engine/cognition/v2/* incluidos context, attention, runtime, slow, inference, graph, storage, projector, memory, rag, business-read, rls, kernel-receipts | Trans02 | 01,03,04,05,06 | 04 verifica RLS, 05 y 06 aportan tests, 03 aporta media/egress; 01 posee contrato de receipt |
| packages/domain/src/cognition-v2.ts, cognitive-reference.ts (si delta), engine/chromatic/card-ontology.ts y registry compartidos | Trans02 | 01,05,06 | 01 conserva barrel/closed event ABI, 06 aporta helper y test; no nueva ontología |
| engine/voice-v2/*, voice-routes.ts, google-auth.ts, workspace.ts, engine/whatsapp-*, whatsapp-routes.ts, packages/integrations/src/* | Trans03 | 01,02,04 | no segundo Fast ni OAuth; runtime chat binding propiedad 02; route mount 01 |
| engine/leads.ts | Trans03 | 01 | solo opt-out y respuesta malformed; si actions.ts requiere guard, 01 lo implementa |
| metrics/registry.ts, metrics-exporter.ts, middleware/request-logger.ts, alerts/*, scripts/gate*, scripts/secrets*, deploy/secrets.manifest.json, .github/workflows/ci.yml y deploy.yml, backup*.ts, scripts/provision-vertical-slice.ts, scripts/lib/vertical-slice-bundle.ts | Trans04 | 01–06 | sin deploy ni valores reales; preservar main; productor de signals en owner de composición |
| engine/observability/hooks.ts (ya existe en Trans01), H01/H02/H03 | Trans04 define y escribe tras transferencia de reserva | 01/02/03 instrumentan propios callers | incorporar delta existente, no segundo registry/hook; 01 integra en baseline |
| package.json, pnpm-lock.yaml, pnpm-workspace.yaml | Trans04 | todos | cambios mínimos por reserva y una regeneración lock, no revertir UI; 01 escribe domain index |
| módulos longitudinales nuevos únicamente si especificación original los requiere | Trans05 | 02,01,04 | 02 escribe inserción en runtime/proyecciones y RLS; sidecar solo con justificación existente y revisión, no otro selector |
| packages/domain/src/longitudinal.ts (candidato) | Trans05 | 02,01 | antes confirmar necesidad y esquema real; 01 modifica barrel si preciso |
| kernel/graph/attention.ts, consolidate.ts, promote.ts, rules.ts; kernel/observers/meta.ts; primitivas puras Trans06 ya diseñadas | Trans06 | 01,02,05 | no cambios en store ni conversation; owner 01 escribe montaje; no score autoriza |
| tests/trans01-*, tests/trans02-*, tests/trans03-*, tests/trans04-*, tests/trans05-*, tests/trans06-* | propietario prefijo | auditor distinto | reservar cada test histórico por path; un escritor; test de integración común T04, casos de contrato por dueño |
| docs de Trans01–06 | su propio agente | 00 | no tocar desde 00 documental; adendas viven en Trans00 |
| docs/operacion/SECRETOS.md | reserva pendiente, sugerido Trans04 | 00,01 | verificar propietario; no edición durante docu |
| docs Trans00 y ref integración autorizada | Trans00 | todos | integración, no diseño/código de otro owner; conflictos semánticos vuelven al dueño |

Nota sobre rls.ts: 02 posee código cognitivo; 04 define manifest de tablas, prueba rol restringido y exige revisión de migración. No dos escritores por "RLS". T04-S S3: 03 adaptadores, 02 perfil LLM/JEV, 01 bootstrap; S0/S1/S2/S4 04. No asumir worker no usa Google o JEV: derivar targets de consumidores reales. En exportación externa no incluir secretos ni identificadores de negocio/tenant, hashes de secretos, prompts o payloads sensibles.

## Orden topológico mínimo

1. B1: congelar contratos compatibles de identidad (tenant/actor/owner/purpose/revision), causalidad, receipt/efecto, transacción/commit outcome, H01–03 y scopes. Resolver anclas stale. T01 + T02 + T04 revisan juntos; agentes avanzan tests/pure helpers sin activar dependencias.
2. B2: deltas previos T01 kernel/runtime/bus → 02 selector/observador/contexto → 03 adaptadores/credential CAS → 04 composición métricas/gate (hooks ABI publicado antes). Se pueden preparar regresiones en paralelo. T06 helper puro/atención legacy y T05 schema/catalog/segmentation sin montar; no bloquear core por experimento.
3. B3: fixtures y RLS, circuitos WhatsApp/Google, autorización real no activada; 02 proyección exacta consume receipts T01/03; 05 consume journal/snapshots 02; 06 consume grafo, autoridad y cards existentes.
4. B4: resto wiring core/observabilidad y contratos de middleware instalado, longitudinal y primitivas mínimas según especificaciones, pruebas negativas. No domain-specific nuevo.
5. B5: revisión cruzada de todo SHA combinado, pruebas rojas convertidas en regresión y análisis de complejidad/duplicidad.
6. B6: PG restringido real, concurrencia multiproceso, revocación, crash/replay, restore, evidencia de gates y decisiones humanas.

Ciclo de espera: si 02 necesita receipt nuevo y 01 espera tipo adapter 03, primero publicar mínimo discriminante común en 01 revisado por 03; 03 implementa adapter local, 01 wiring, 02 verifica/consume. No esperar a tener proveedor real para definir fixture honesto. Si ABI aún no existe, port/stub fail-closed, no cast que lo simule. Integrar solo deltas compilables y pruebas ejecutadas; bloqueos permanecen visibles.
