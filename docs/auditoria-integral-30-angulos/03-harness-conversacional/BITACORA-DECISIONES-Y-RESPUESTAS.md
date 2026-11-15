## R-20261115-019 — Turno 16/16: C15 certificación E2E y cierre documental
- **Verificación real:** C00–C14 (15/15) comprobados por fetch GitHub en rama; ADR-009, bitácora, package.json y workspace manifest leídos. HEAD exacto no congelado; blobs no equivalen a commits de baseline.
- **Documento:** [C15](./campanas-redisenio-v2/C15-CERTIFICACION-E2E-ACEPTACION-INTEGRAL-HANDOFF-EJECUCION.md), 24.585 caracteres, 25 hallazgos, 20 patchsets, 14 waves, 30 escenarios de aceptación, DAG de dependencias, matriz GO/NO-GO, handoff Freebuff/Codex/founder.
- **Veredicto:** programa documental 16/16 completado en rama; implementación V2 y pruebas E2E NO acreditadas; PRODUCTION NO-GO. No se debe confundir documentación con código ni CI V1 con aceptación V2.
- **Acciones:** iniciar implementación por slices desde main actualizado con ramas separadas, gates y revisión independiente; sin merge/deploy hasta aprobación founder.
- **Estado:** solo documentación y bitácora; no runtime, tests, merge, deploy ni modificación del hijo.

## R-20261115-018 — Turno 15/16: C14 bridge con repo ciberseguridad
- **Auditoría cruzada:** `uniscrolliabrain-cloud/agente` y `uniscrolliabrain-cloud/agntia-ciberseguridad`; código real Python `app.py`, `auth.py`, `agents/routes.py`, SDK TS package y docs de estado/gates; blobs en campaña.
- **Hallazgos:** hijo ya tiene FastAPI, SDK server-only, gateway gobernado, 84 rutas y 196 tests Python reportados (8 skips), pero `production_enabled=false`, 2 PASS/40 PARTIAL y sin wiring autorizado con padre. No duplicar middleware ni mezclar Adversarial Lab independiente.
- **Documento:** [C14](./campanas-redisenio-v2/C14-BRIDGE-CIBERSEGURIDAD-PYTHON-TS-GOBERNANZA-EVIDENCIA.md), 20.623 caracteres, 27 hallazgos, 20 patchsets, 12 waves, 20 tests propuestos.
- **Decisión:** puente tipado y gobernado parent capability→SDK TS→Python, doble autorización tenant/actor/grant, receipts, outbox/ACK, evidencia y proyección minimizada; Pedro/LAIA no elevan permisos.
- **Estado:** documentación en rama padre; no cambios de código ni repo hijo, sin tests/merge/deploy. **Siguiente:** C15 E2E aceptación integral.

## R-20261115-017 — Turno 14/16: C13 Anam avatar y voz
- **Auditoría real:** `docs/08-auditorias/latencia-anam-2026-11-11.md`, `voice-routes.ts`, `packages/integrations/src/vapi.ts`, `scripts/lib/connections.ts`, `conversation.ts`, `ChatPanel.tsx`; búsqueda Anam/ElevenLabs/WebRTC/voice.
- **Hallazgos:** no cliente Anam identificado en main; Vapi es REST telefónico, ElevenLabs solo health probe; ruta chat pre-LLM pesada; falta STT/VAD/barge-in end-to-end. Las latencias del informe previo son estimaciones.
- **Documento:** [C13](./campanas-redisenio-v2/C13-ANAM-AVATAR-VOZ-REALTIME-INTERRUPCIONES-SESIONES.md), 18.623 caracteres, 26 hallazgos, 19 patchsets, 12 waves, 19 tests, gates, rollback.
- **Decisión:** avatar como canal de presentación, Fast-only speech path, C10 snapshot precalculado, C12 Presenter, interrupción por epoch, consentimiento y cuotas; verificar API Anam y comparar native/custom LLM/passthrough antes de implementar.
- **Estado:** documentación en rama; no runtime/tests/merge/deploy. **Siguiente:** C14 bridge repo ciberseguridad.

## R-20261115-016 — Turno 13/16: C12 Presenter/UX/AG-UI/SVG
- **Auditoría:** `kernel/observers/{presenter,presenter-sse}.ts`, `kernel/graph/progress.ts`, `kernel/authors/slow-author.ts`, `engine/conversation.ts`, `web/components/ChatPanel.tsx`; SHA blobs documentados.
- **Hallazgos:** Presenter score role/confidence/attention no verifica verdad; doble `thoughtsOf`; cast a kernel deps privados; Fast stream y Presenter post-stream pueden divergir; progress en attention.metadata no equivale a evento durable; ChatPanel tiene streaming básico.
- **Documento:** [C12](./campanas-redisenio-v2/C12-PRESENTER-UX-STREAMING-ESTADOS-SVG-ACCESIBILIDAD.md), 18.596 caracteres, 25 hallazgos, 17 patchsets, 11 waves, 18 tests propuestos.
- **Decisión:** Presenter V2 como proyector de eventos/recibos y compositor de mensajes; timeline verídica, SVG espiral decorativa accesible, AG-UI compatible, sin estados ficticios ni chain-of-thought.
- **Estado:** documento en rama, no runtime/tests/merge/deploy. **Siguiente:** C13 Anam avatar/voz.

## R-20261115-015 — Turno 12/16: C11 Fast/Slow APIs independientes
- **Código auditado:** `engine/conversation.ts`, `engine/model.ts`, `engine/model-chain.ts`, `engine/service.ts`, `kernel/authors/{fast,slow}-author.ts`, `engine/context/engine.ts`; blobs y tramos documentados.
- **Hallazgos:** fallback Fast→Slow explícito en conversación; role model puede preceder Fast; circuit/bulkhead compartidos por proveedor y proceso, límite no duro cuando no hay fallback; cuotas scan no atómico; delegación por prompt; AG-UI y cancel existentes.
- **Documento:** [C11](./campanas-redisenio-v2/C11-FAST-SLOW-APIS-INDEPENDIENTES-LATENCIA-STREAMING.md), 20.335 caracteres, 27 hallazgos, 18 patchsets, 12 waves, contratos, pruebas, rollback.
- **Decisión:** Fast/Slow runtime, API, cuotas, pools, fallback y observabilidad independientes; C10 snapshot Fast; Slow durable C02/C07; ACK solo tras receipt real. Sustitución opción 3, legacy temporal.
- **Estado:** documentación confirmada, no runtime/tests/merge/deploy. **Siguiente:** C12 Presenter/UX SVG fases verídicas.

## R-20261115-014 — Turno 11/16: C10 ContextServingFacade V2
- **Auditoría real:** `engine/context/{assembly,budget,cognition-cards}.ts`, `engine/conversation.ts`, `engine/memory.ts`, `engine/rag.ts`; SHA blobs en campaña.
- **Hallazgos:** ensamblaje fragmentado en conversación; budgets por categoría sin límite global probado; RAG+ContextEngine+cards+urgencias en rutas separadas; consumed antes de ACK; private memories requieren filtro estricto; RAG registry/citabilidad reutilizables.
- **Documento:** [C10](./campanas-redisenio-v2/C10-CONTEXT-SERVING-FACADE-SNAPSHOTS-DELTAS-REFERENCIAS.md), 18.122 caracteres, 24 hallazgos, 16 patchsets, 11 waves, contratos, tests, rollback y handoff.
- **Decisión:** fachada única auth-first con snapshots/deltas/refs, provenance, epistemic status, source watermarks, invalidación y presupuesto global tokenizer-aware; Fast independiente de Slow/JEV.
- **Estado:** documentación en rama, no código/tests/merge/deploy. **Siguiente:** C11 Fast/Slow APIs independientes.

## R-20261115-013 — Turno 10/16: C09 CardStore V2 y delivery ledger
- **Auditoría real:** `kernel/cognition/card-store.ts`, `engine/context/cognition-cards.ts`, `packages/domain/src/cognition-card.ts`, `cognition-routes.ts`, `tests/cognition-cards.test.ts`; SHA blobs registrados en campaña.
- **Hallazgos:** consumed antes de ACK, CAS opcional con fallback no atómico, store por owner/tenant filter, rank basado en confidence, pending 20, budget `length/4`, pruebas V1 in-memory sin restart/fence.
- **Documento:** [C09](./campanas-redisenio-v2/C09-CARDSTORE-V2-DELIVERY-LEDGER-LEASE-ACK-REPLAY.md), 14.539 caracteres, 22 hallazgos, 15 patchsets, 10 olas, tests, rollback y handoff.
- **Decisión:** separar card lifecycle/revisions de delivery lease/render/ACK, at-least-once+idempotencia; replay C02, tenant ACL, C10 snapshot serving.
- **Estado:** documentación en rama, no código/tests/merge/deploy. Siguiente C10.

## R-20261115-012 — Turno 09/16: C08 JEV clasificador no autoritativo
- **Auditoría:** búsqueda GitHub Jev/classifier; `classification.ts`, `authz/pdp.ts`, `events/schema-registry.ts`, NC-COORDINATION.
- **Resultado:** sin cliente Jev verificable; la API real está bloqueada en docs NC. Clasificación de sensibilidad no equivale a semántica.
- **Documento:** [C08](./campanas-redisenio-v2/C08-JEV-CLASIFICADOR-SEMANTICO-NO-AUTORITATIVO.md), 20 hallazgos, 14 patchsets, 10 olas, provider discovery obligatorio, baseline, gates y rollback.
- **Estado:** documentación en rama; no código ni tests ni merge/deploy. Siguiente C09.

## R-20261115-011 — Turno 08/16: C07 Slow asíncrono y tarjetas enriquecidas
- **Petición:** «Sigue» tras C06. Repo principal `agente`.
- **Auditoría:** `engine/model.ts`, `kernel/cognition/{capture,card-builder}.ts`, `kernel/authors/slow-author.ts`, `engine/events/types.ts`, `engine/context/cognition-cards.ts`.
- **Hallazgos:** Slow ya ejecuta tareas con fallback/cuotas/abort; captura Thought→card no atómica; dedupe de tarjeta no asegura Thought/event; card kind regex; progreso en metadata; `card.created` emitido tras save; entrega marca consumed antes de ACK Fast.
- **Documento:** [C07](./campanas-redisenio-v2/C07-SLOW-LLM-ASINCRONO-THOUGHTS-TARJETAS-ENRIQUECIDAS.md), 15.218 caracteres, 20 hallazgos, 14 patchsets, 10 waves, contratos, fallos, tests y rollback.
- **Decisión:** separar ejecución Slow, receipt, Thought, extracción estructurada, JEV, verificación, proyección y ContextServing; async independiente de Fast. Kernel dispone; JEV/Slow proponen.
- **Estado:** auditoría estática/documentación; sin código ni tests, merge ni deploy.
- **Siguiente:** C08 JEV classifier no autoritativo, auditar integración y esquema real antes de planificar.

## R-20261115-010 — Turno 07/16: C06 atención global y metacognición
- **Petición:** «Sigue» tras C05. Repo principal `agente`.
- **Código auditado:** `kernel/graph/{attention,thought}.ts`, `kernel/observers/meta.ts`, `kernel/authors/{fast-author,slow-author}.ts`, `engine/context/assembly.ts`.
- **Hallazgos prioritarios:** matching de atención no es autorización; `FastAuthor` deriva foco por substring y confidence 0.9 por defecto; `SlowAuthor` crea nodos fallback y confidence 0.8; `Meta.extractProgress` castea sin validación; `seenHints` es Set local y `evaluate` no lo consulta; `detectAttentionConflict` solo mide divergencia de foco.
- **Documento:** [C06](./campanas-redisenio-v2/C06-ATENCION-GLOBAL-METACOGNICION-SELECTOR-V2.md), 13.794 caracteres, 19 hallazgos, 13 patchsets, 9 waves, contratos, tests, rollback y gates.
- **Decisión:** GlobalAttentionWorkspace V2 tenant/actor scoped, auth-first, scoring versionado, snapshots/deltas y MetaHint durable con ACK C02; no confundir score con evidencia ni foco con contradicción.
- **Estado:** documentación y auditoría estática; no código ni tests, no merge/deploy.
- **Siguiente:** C07 Slow LLM asíncrono, Thoughts enriquecidos y producción de tarjetas, con nueva auditoría.

## R-20261115-009 — Turno 06/16: C05 cromos y ontología cromática
- **Petición:** «Sigue» tras C04. Repo central `agente`, sin tocar Cyber.
- **Auditoría:** `kernel/cromos/{cromo,logic/axioms,physics/field}.ts`, `kernel/graph/{thought,attention}.ts`, `kernel/observers/meta.ts`, `kernel/cognition/card-builder.ts`; contrastado `docs/estado/FUTURE.md`, `docs/campaigns/NC-COORDINATION/CONTRACT-CANDIDATES.md` y `specs/NC-03-SOURCE.md`.
- **Conflicto real:** visión antigua de dos polos por cromo frente a seis polaridades/diez dimensiones no definidas; NO inventar semántica. Ontología aprobada por founder antes de datos reales.
- **Decisión:** kernel agnóstico, motor cromático en `engine/cognition/chromatic/**`; V1 solo adapter legacy; JEV/Slow señales no autoritativas; C02/C03 proyecciones, C06 atención.
- **Documento:** [C05](./campanas-redisenio-v2/C05-CROMOS-ONTOLOGIA-SEIS-POLARIDADES-MOTOR-V2.md), 14.798 caracteres, 17 hallazgos, 13 patchsets, 9 olas, tests, rollback y gates.
- **Estado:** documento en rama, sin código ni tests ni merge/deploy.
- **Siguiente:** C06 atención global y metacognición; revisar resultados de C05 y avanzar auditoría de consumidores.

## R-20261115-008 — Turno 05/16: C04 cinco memorias, RAG y revocación
- **Petición:** «Sigue», continuación de C03. El turno anterior dejó C04 iniciada en respuesta pero sin confirmación de escritura; este turno la completa y verifica en GitHub.
- **Repo central:** `uniscrolliabrain-cloud/agente`. Cyber solo referencia de evidencia; no se toca.
- **Código leído:** `engine/memory.ts`, `engine/rag.ts`, `engine/context/{assembly,budget}.ts`, `packages/domain/src/agent.ts`, especificación histórica NC-01.
- **Hallazgos:** MemoryService ya separa privado/empresa/roles/hechos, pero no cinco memorias cognitivas; cap 2.000 registros; RAG híbrido vector/BM25 con registry y revisiones, ingesta no atómica; context scoring textual y presupuesto chars/4.
- **Documento:** [C04](./campanas-redisenio-v2/C04-CINCO-MEMORIAS-RECUPERACION-RAG-REVOCACION.md), 15.498 caracteres, 20 hallazgos, 13 patchsets, 8 waves, matriz adversarial, gates y rollback.
- **Decisión:** cinco memorias como proyecciones con source refs, política, revocación y vigencia; conservar MemoryService/RagService vía adapter shadow, sin duplicar stores; Slow/JEV proponen, kernel dispone.
- **Estado:** auditoría estática/documentación, sin código ni tests, sin merge/deploy.
- **Siguiente:** C05 cromos, polaridades y atención con auditoría incremental del runtime y consumidores.

## R-20261115-007 — Turno 04/16: C03 grafo cognitivo multicapa
- **Petición:** «Sigue», tras C02.
- **Repo central:** `uniscrolliabrain-cloud/agente`. Cyber solo evidencia referenciada futura.
- **Código auditado:** `kernel/graph/{thought,turn,store,port,attention,consolidate}.ts`, `kernel/kernel.ts`, `kernel/cromos/cromo.ts`.
- **Hallazgos:** `appendThought` genera UUID por llamada; `openTurnIdempotent` solo busca turnos abiertos; GraphPort es de lectura; edges Thought solo Thought→Thought; consolidación por hash y negación textual con cap 200; cromos declarados no cableados.
- **Documento:** [C03 profunda](./campanas-redisenio-v2/C03-REVISION-ULTRAGRANULAR-GRAFO-COGNITIVO-MULTICAPA.md), 17.335 caracteres, 16 hallazgos, 10 patchsets, 7 olas, tests, gates y rollback.
- **Decisión:** grafo cognitivo como proyección reconstruible C02, no segundo kernel ni sustitución inmediata del business graph. Estado epistémico, provenance y ACL por lectura; no acciones por LLM.
- **Pendientes de auditoría:** adapters TurnStore, business graph, Promoter (ruta `kernel/graph/promoter.ts` no existe), consumidores UI; revalidar antes de codificar.
- **Estado:** auditoría estática/documentación; sin tests ni runtime, sin merge/deploy.
- **Siguiente:** C04 cinco memorias, recuperación y RAG, con lectura incremental.

## R-20261115-006 — Turno 03/16: C02 Event Bus durable y proyector cognitivo
- **Petición:** «Sigue» tras C01, manteniendo 16 turnos y auditoría incremental de `agente`.
- **Código leído:** `engine/events/{bus,subscriber,types,schemas,schema-registry,sinks/store}.ts`, `kernel/subscribers/events.ts`, `kernel/cognition/cycle.ts`, `engine/service.ts`, `tests/event-bus.test.ts`.
- **Hallazgos P0:** `emit` agrupa persistencia y efectos posteriores en catch; `StoreSink` ignora retorno de insertIfAbsent; callbacks live no ACK; `replayTenant` existe pero está limitado y sin cursor durable; `sinceId` inconsistente entre SQL y fallback; idempotencia de openTurn no demuestra idempotencia de appendThought; workspace payloads passthrough.
- **Decisión:** extender el bus autoritativo con receipts y proyector durable shadow, inbox, cursor, lease/fence, DLQ, replay paginado, sin segundo bus ni doble escritura cognitiva.
- **Documento:** [C02](./campanas-redisenio-v2/C02-EVENT-BUS-DURABLE-PROYECTOR-COGNITIVO-REPLAY.md), 19.351 caracteres, 16 hallazgos, 10 patchsets, 7 olas, matriz de fallos, gates.
- **Estado:** documentación y auditoría estática; no se ha escrito código V2 ni ejecutado tests. Sin merge ni deploy.
- **Siguiente:** C03 grafo cognitivo multicapa con auditoría adicional y revalidación de C00–C02.

## R-20261115-005 — Turno 02/16: C01 contratos V2, auditoría incremental
- **Petición:** «Ok sigue», tras C00.
- **Repo central:** `uniscrolliabrain-cloud/agente`. Cyber solo interfaz para C14.
- **Código auditado:** cognition-card.ts, card-builder.ts, card-store.ts, capture.ts, graph/thought.ts, authors/slow-author.ts, kernel-context.ts, events/types.ts, cognition-routes.ts, node-ref.ts, tests/cognition-cards.test.ts.
- **Hallazgos:** schema V1 estricto, status de consumo mezcla lifecycle y delivery, owner-store no garantiza compartición cross-owner en tenant, CAS opcional, dedupe taskId colapsa revisiones, eventos schema 1.0 cerrado, NodeRef unknown no es ACL.
- **Documento:** [C01 profunda](./campanas-redisenio-v2/C01-REVISION-ULTRAGRANULAR-CONTRATOS-Y-TAXONOMIA-V2.md), 19.6k caracteres, 12 hallazgos, 7 patchsets, 7 waves, 10 riesgos, tests y rollback.
- **Estado:** diseño y auditoría estática parcial; **sin código V2, sin tests ejecutados, sin merge/deploy**.
- **Próximo:** C02 Event Bus durable y proyector; releer C00/C01, revalidar HEAD y contratos antes de implementar.

## R-20261115-004 — Turno 01/16: auditoría profunda C00 del repo padre
- **Petición:** iniciar reescritura progresiva de 16 campañas con auditoría acumulativa; `agente` es el repo central, Cyber solo integración.
- **Fuente:** código de `main` de `agente` (conversation, model, service, cognition-cards, bus, subscribers, cromos, domain, package scripts) y contratos de `agntia-ciberseguridad`.
- **Documento nuevo:** [C00 revisión ultragranuIar](./campanas-redisenio-v2/C00-REVISION-ULTRAGRANULAR-AUDITORIA-INCREMENTAL.md) (15.9k caracteres), hallazgos F01–F15, olas W0–W6, patchsets, gates, riesgos y reporte.
- **Decisión:** preservar únicamente invariantes y continuidad transitoria; sustituir el diseño que no satisface opción 3. Seguir numeración canónica C00–C15 del plan original, no las campañas alternativas previas.
- **Estado:** lectura estática parcial; sin tests ejecutados, sin cambios de runtime, sin merge ni deploy.
- **Siguiente:** continuar inventario C00 y pasar a C01 en siguiente turno con hallazgos revalidados.

## R-20261115-003 — Redacción de las 16 campañas sustitutivas
- **Petición:** «Ahora sí puedes escribir las campañas».
- **Decisión:** C00–C15 documentadas según ADR-009, opción 3 sustitutiva; sin perpetuar legacy.
- **Entregable:** [Índice y campañas](./campanas-redisenio-v2/README.md), 16 archivos individuales, seis waves por campaña, patchsets, gates, reportes y rollback.
- **Ramas:** documentación escrita en `audit/preflight-cognition-option3-20261115`; la documentación previa más extensa permanece en `docs/audit-30-dominios-runtime-20261115`, pendiente de reconciliar.
- **Estado:** DOCUMENTADO; ningún código de runtime implementado, ningún test ejecutado, ningún merge/deploy.
- **Próximo paso:** ejecutar C00 con inventario exhaustivo y baseline verificable; no iniciar C01 sin resolver los bloqueos P0 de contrato/ownership/eventos.

## R-20261115-002 — Corrección del objetivo: rediseño sustitutivo
- **Petición:** el fundador aclara que el diseño actual no satisface sus necesidades y debe quedar parcialmente como legacy.
- **Decisión:** la opción 3 es arquitectura de sustitución, no de preservación. Compatibilidad solo durante transición; paridad legacy no es criterio de aceptación.
- **Documento vinculante:** `ADR-009-REDISENO-SUSTITUTIVO-LEGACY-TRANSITORIO.md`.
- **Estado:** DOCUMENTADO; sin cambios de runtime ni tests.

# Bitácora de decisiones y respuestas — ChatLLM / Opción 3
**Regla:** append-only semántico. Una entrada por respuesta técnica sustancial, con links a reportes y commit.

## R-20261115-001 — Protocolo de documentación continua
- **Petición:** “Documenta cada respuesta q me des para q el agente q ejecute el código no se lie y tenga contexto”.
- **Decisión:** toda respuesta técnica debe quedar reflejada en esta bitácora y, cuando haga falta, en un documento temático.
- **Acción:** se crea `PROTOCOLO-CONTINUIDAD-RESPUESTAS-Y-HANDOFF.md` y esta bitácora en rama `audit/preflight-cognition-option3-20261115`.
- **Contexto heredado:** opción 3; Slow produce tarjetas con metadatos; JEV clasifica sin autoridad final; Event Bus y grafo alimentan runtime; ContextServingFacade inyecta a Fast; UX SVG pedagógica y timeline factual.
- **Riesgos abiertos:** flujo V1 de tarjetas con CAS y release-on-error; Fast chain con fallback; Event Bus con `persisted:false`; scopes owner/tenant; diferencias entre ramas documentales.
- **Estado:** DOCUMENTADO. No se ha implementado ni probado código de runtime.
- **Siguiente paso:** cerrar preflight C00 con inventario de código y contratos Cyber, tests de caracterización y plan de migración compatible.
