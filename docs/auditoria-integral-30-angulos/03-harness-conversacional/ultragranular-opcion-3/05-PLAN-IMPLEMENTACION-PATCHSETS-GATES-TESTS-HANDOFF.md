# Programa ultradetallado de implementación: opción 3, sin ejecutar código
**Estado:** handoff técnico de documentación. **Regla:** cada campaña requiere informe de estado antes/después, patchsets concretos, tests y rollback; ninguna campaña autoriza despliegue. No asumir que el path de archivo nuevo existe hasta inspeccionar repo.

## Modelo de trabajo
Para cada campaña: `README` de alcance, `BASELINE.md` con SHA y comandos, `PATCHSET.md` con paths y cambios, `TEST-PLAN.md`, `EXECUTION-REPORT.md` con evidencia y bloqueos, `ADR.md` si cambia contrato, `ROLLBACK.md`. El agente no declara PASS sin ejecutar y adjuntar comandos, exit codes y resultados. Separar “diseño”, “implementado”, “testeado”, “integrado” y “producción”.

### C00 — Baseline y árbol de dependencias
**Leer:** `apps/server/src/kernel/`, `apps/server/src/engine/`, `packages/domain/src/`, `apps/web/src/`, `package.json`, workspace pnpm, tests; hijo `typescript/`, `contracts.py`, `jobs/schema.py`, API FastAPI. **Generar:** `docs/.../baseline/CODE-MAP.md`, `CALL-GRAPH.md`, `CONTRACT-MATRIX.md`, `TEST-BASELINE.md`. **Tareas:** obtener SHA de ambos main; buscar imports/callers; listar 5 memorias si existen; listar eventos y schemas; enumerar productores/consumidores de tarjetas; identificar Fast/Slow provider real; ejecutar typecheck/tests con evidencia. **Gate:** no hay dependencia crítica sin owner y estado. **Rollback:** documentación solamente.

### C01 — Contratos y taxonomía
**Tocar propuesto:** `packages/domain/src/cognition-card-v2.ts` (nuevo), schemas de event envelope y context snapshot en `packages/domain/src/`; adapters `apps/server/src/kernel/cognition/`. **No tocar aún:** `cognition-card.ts` V1 sin compatibilidad. **Tareas:** definir metadata de JEV, sourceRefs, scopes, delivery modes, epistemia, version/revision, invalidación; contratos de Cyber job statuses; validación Zod; tests JSON malformado/tenant mismatch/revisión/unknown enum. **Gate:** tests V1 intactos y V2 estrictos. **Rollback:** feature flag V2 off.

### C02 — EventBus durable y proyector
**Leer/tocar:** `apps/server/src/engine/events/bus.ts`, `subscriber.ts`, `types.ts`, `apps/server/src/kernel/subscribers/events.ts`, stores existentes. **Proponer:** `apps/server/src/kernel/cognition/projector.ts`, cursor store y retry/dead-letter con interfaces. **Tareas:** idempotency por eventId+projectorVersion, persistencia antes de ACK, replay tras caída, backpressure, manejo `persisted:false`, métricas de lag, sin loops kernel.*. **Gate:** fault injection reinicio entre persist y ACK, replay converge, duplicados no duplican. **Rollback:** subscriber anterior detrás de flag, sin perder eventos durables.

### C03 — Grafo multicapa
**Leer/tocar:** `kernel/graph/thought.ts`, `promote.ts`, `consolidate.ts`, repositorios de grafo de negocio y relaciones. **Proponer:** proyección `GraphLayerIndex` sin duplicar stores. **Tareas:** definir nodos y edges tipados; provenance; tenant scope; revisión; consolidación por fuente; detectar contradicciones semánticas solo como propuesta; evitar traversal global Fast. **Gate:** entidad y finding Cyber enlazados con evidence y tenant, rollback por replay. **Rollback:** proyector off, hechos autoritativos intactos.

### C04 — Cinco memorias
**Leer:** `engine/memory/`, `engine/rag/`, `kernel/graph/`, stores y tests. **Primero:** documentar las cinco memorias reales o marcar diseño pendiente. **Tareas:** scopes, retention, delete/tombstones, provenance, versiones, embeddings, promotion, retrieval; integrar con grafo por refs, no copia masiva. **Gate:** delete/revoke no deja recuperación por vector, tenant isolation y consistencia con hechos. **Rollback:** index rebuilding desde fuentes válidas.

### C05 — Cromos
**Leer:** `kernel/cromos/cromo.ts`, referencias de CROMOS_PENDING, grafo y policy. **Tareas:** definir relación cromo→axioma→Thought/Memory/Entity, indexación y versionado, evaluación determinista donde corresponda; separar `policy cromo` de enforcement; registrar events de actualización si aprobados. **Gate:** no se eleva privilegio desde cromo, no hay ciclos de eventos, tests de invariantes. **Rollback:** cromo feature off.

### C06 — Attention vectors y metacognición
**Leer/tocar:** `kernel/graph/attention.ts`, `observers/meta.ts`, Presenter, perfiles. **Tareas:** attention projection por tenant+agent+task, ranking con explicación, decaimiento, límites, conflictos; meta hints sin loops ni leak; tests de prioridades y aislamiento. **Gate:** scores no modifican permisos; hints no disparan ejecución no autorizada. **Rollback:** ranking determinista V1.

### C07 — Slow productor de tarjetas enriquecidas
**Leer/tocar:** `kernel/cognition/capture.ts`, `card-builder.ts`, `authors/slow-author.ts`, callers Slow, `card-store.ts`. **Tareas:** Slow produce JSON metadata tipada, no solo body; registrar Thought, evidence y event refs; encolar enriquecimiento; fallback determinista; idempotencia por revisión de fuente, no solo taskId; pruebas de clasificación errónea y TTL. **Gate:** no se pierde una tarjeta si Slow falla; no se duplica si retry; source refs verificables. **Rollback:** builder V1.

### C08 — Puerto JEV AI (sin instalar proveedor aún)
**Proponer:** `apps/server/src/kernel/cognition/classifiers/interface.ts`, `rules.ts`, `jev-adapter.ts` stub tipado. **Tareas:** contratos de entrada/salida, schema, timeouts, redacción, versiones, logs, feature flags, políticas; mock de clasificación y fallback. **Gate:** JEV no puede cambiar ACL, tenant, facts o approvals; ausencia JEV no bloquea Fast ni kernel. **Rollback:** rules-only.

### C09 — CardStore V2 y delivery ledger
**Leer/tocar:** `kernel/cognition/card-store.ts`, `engine/context/cognition-cards.ts`; schema V2 y store. **Tareas:** separar delta/snapshot/reference; CAS y cursor por destinatario; upsert por revision; TTL y revocación; migración V1; métricas; tests de carreras. **Gate:** tarjeta persistente visible en turnos consecutivos; delta exactamente una entrega lógica por ACK sin afirmar exactly-once de red; card revocada invisible. **Rollback:** V1 read y V2 flag off.

### C10 — ContextServingFacade
**Proponer:** `apps/server/src/engine/context/context-serving.ts` y snapshot builder; mantener imports reales. **Tareas:** auth-derived scopes, ACL antes de ranking, atención, dedupe, tokenizador real, reserve críticos, cache invalidation, snapshots inmutables, card refs. **Gate:** p95 dentro de objetivo medido, cero cross-tenant, cambios de permisos invalidan snapshot. **Rollback:** ensamblador actual con modo degradado honesto.

### C11 — Fast/Slow APIs independientes
**Leer/tocar:** ConversationAgent, `engine/conversation`, model provider/router, rutas de chat, streaming, tests. **Tareas:** separar clientes y cuotas, no bloquear Fast por Slow, mantener legacy, integrar snapshot, intents tipados y receipts, circuit breakers; métricas TTFT. **Gate:** saludo Fast sin Slow; acción sensible pasa por kernel; stream funciona con fallback. **Rollback:** feature flag legacy.

### C12 — Presenter y UX SVG
**Leer/tocar:** `kernel/observers/presenter.ts`, componentes `apps/web/src/` de chat/tasks/control center. **Tareas:** CardPresenter + JourneyPresenter, estados pedagógicos vs operativos, espiral SVG clara, cinco fases opcionales, timeline con eventos, a11y y reduce-motion. **Gate:** animación nunca afirma completado, no bloquea stream, replay reconstruye estado factual. **Rollback:** UI anterior.

### C13 — Anam
**Leer:** adaptadores actuales voz, streaming, session. **Tareas:** conectar mismo Fast y ContextServingFacade, no crear segundo cerebro; interrupciones/barge-in, token budgets voz, reconexión y scopes; test con proveedor mock antes de cuenta real. **Gate:** interrupción de voz no cancela task, primera respuesta medible, revocación aplicada. **Rollback:** chat web funcional.

### C14 — Cyber bridge
**Leer/tocar propuesto:** módulo server-only `apps/server/src/integrations/cybersecurity/` (ubicación por decidir tras inventario), registry de capabilities, policy, SOP, event types y projector. **Tareas:** SDK TS con credenciales scoped, mapeo envelope Python/TS, operaciones nominadas, statuses, outbox/ACK, evidence refs, sandbox/offline. **Gate:** 202 ≠ completed, partial/blocked/reconciliation_required correctos, no shell arbitraria, cross-tenant tests. **Rollback:** adapter off; Cyber independiente.

### C15 — End-to-end y aceptación
**Escenarios:** dos tenants y LAIA, Pedro Cyber, un job autorizado, findings y tarjetas, cambio de rol, revocación, Slow/JEV caídos, replay, event duplicates, UI, Anam mock. **Medir:** lag, tokens, TTFT, p95, coste, reintentos. **Gate:** todos tests críticos, aprobación del founder antes de fusionar/desplegar; reporte por campaña. **Rollback:** desactivar flags, preservar hechos/receipts.

## Estrategia de patchsets
Patches pequeños, uno por superficie de escritura; evitar que dos agentes modifiquen `bus.ts` o `cognition-card.ts` simultáneamente. Cada PR declara migración, flags, reversibilidad y tests. **No ejecutar todas las campañas ciegamente:** cada una lee reporte anterior, reconcilia HEAD y actualiza el siguiente plan.

## Reportes obligatorios por campaña
```md
# EXECUTION REPORT
Commit base / branch / fecha / agente:
Objetivo:
Archivos inspeccionados:
Archivos modificados:
Schemas alterados:
Comandos ejecutados + exit codes:
Tests PASS/FAIL/SKIP:
Hallazgos de seguridad:
Riesgos nuevos:
Deuda y bloqueos:
Métricas antes/después:
Rollback comprobado:
Estado: PASS | PARTIAL | BLOCKED | FAIL
Próxima campaña / dependencias:
```
**Nota:** la ruta `docs/.../baseline/` es una sugerencia; el agente deberá crearla si el plan se aprueba. Esta entrega solo escribe documentación de diseño.
