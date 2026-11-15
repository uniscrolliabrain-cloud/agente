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
