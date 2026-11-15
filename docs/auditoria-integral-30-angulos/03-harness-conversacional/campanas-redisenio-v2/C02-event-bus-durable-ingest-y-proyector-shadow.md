# Campaña C02 — Event Bus durable, ingest y proyector shadow
**Programa:** rediseño cognitivo/conversacional V2 — opción 3.
**Estado inicial:** PLANEADA; no se ha implementado esta campaña por crear este documento.
**Secuencia:** depende de C01 y de los contratos pertinentes.
**Objetivo:** Construir entrega de eventos al sistema cognitivo con replay e idempotencia sin duplicar efectos.

## Reglas globales de ejecución
- **Arquitectura vinculante:** `ADR-009-REDISENO-SUSTITUTIVO-LEGACY-TRANSITORIO.md`. **Opción 3 es rediseño sustitutivo**, no paridad con legacy.
- Kernel/policy/SOP son autoridad; Slow y JEV producen propuestas; JEV **no** es juez.
- Revisar SHA/HEAD, imports, callers, schema y tests **antes de editar**. Los paths con “(propuesto)” no están verificados.
- Cada campaña debe trabajar en rama aislada; una superficie de escritura por agente, evitar merges automáticos. No deploy ni merge sin autorización.
- Preservar aislamiento tenant/actor/role, procedencia, revisión, idempotencia, denegación por defecto y secretos.
- El código viejo puede **sustituirse y eliminarse** después de migrar sus consumidores; no arrastrar sus limitaciones a V2.
- Todo resultado requiere reporte con archivos modificados, diff, comandos, exit codes, tests, métricas, bloqueos y rollback.

## Inventario de superficies / patchsets
- **PS02.1:** `apps/server/src/engine/events/bus.ts` — inspeccionar implementación y dependientes, definir cambios mínimos por contrato, tests y rollback.
- **PS02.2:** `apps/server/src/engine/events/subscriber.ts` — inspeccionar implementación y dependientes, definir cambios mínimos por contrato, tests y rollback.
- **PS02.3:** `apps/server/src/kernel/subscribers/events.ts` — inspeccionar implementación y dependientes, definir cambios mínimos por contrato, tests y rollback.
- **PS02.4:** `apps/server/src/kernel/cognition/projector.ts (propuesto)` — inspeccionar implementación y dependientes, definir cambios mínimos por contrato, tests y rollback.
- **PS02.5:** `apps/server/src/kernel/cognition/projector-cursor-store.ts (propuesto)` — inspeccionar implementación y dependientes, definir cambios mínimos por contrato, tests y rollback.

## Waves y pasos ejecutables
### W1 — Inspeccionar sink persistente y significado de persisted:false
1. Registrar SHA de HEAD, rutas y firmas afectadas.
2. Dibujar dependencias de entrada/salida y contratos Zod/Pydantic/eventos.
3. Implementar o documentar el cambio de esta wave en patchset aislado (solo tras validar baseline).
4. Añadir tests positivos, negativos, tenant isolation, idempotencia y fallo relevante.
5. Ejecutar typecheck/tests apropiados; registrar comandos y códigos de salida.
6. Comparar con arquitectura objetivo y anotar qué pasa a LEGACY TEMPORAL, REUTILIZAR o SUSTITUIR.
7. Emitir reporte W1 con diffs, evidencias, métricas, riesgos y siguiente dependencia.

### W2 — Definir inbox/cursor/ACK por tenant, consumer y schemaVersion
1. Registrar SHA de HEAD, rutas y firmas afectadas.
2. Dibujar dependencias de entrada/salida y contratos Zod/Pydantic/eventos.
3. Implementar o documentar el cambio de esta wave en patchset aislado (solo tras validar baseline).
4. Añadir tests positivos, negativos, tenant isolation, idempotencia y fallo relevante.
5. Ejecutar typecheck/tests apropiados; registrar comandos y códigos de salida.
6. Comparar con arquitectura objetivo y anotar qué pasa a LEGACY TEMPORAL, REUTILIZAR o SUSTITUIR.
7. Emitir reporte W2 con diffs, evidencias, métricas, riesgos y siguiente dependencia.

### W3 — Introducir proyector shadow-only; no publicar efectos en el primer rollout
1. Registrar SHA de HEAD, rutas y firmas afectadas.
2. Dibujar dependencias de entrada/salida y contratos Zod/Pydantic/eventos.
3. Implementar o documentar el cambio de esta wave en patchset aislado (solo tras validar baseline).
4. Añadir tests positivos, negativos, tenant isolation, idempotencia y fallo relevante.
5. Ejecutar typecheck/tests apropiados; registrar comandos y códigos de salida.
6. Comparar con arquitectura objetivo y anotar qué pasa a LEGACY TEMPORAL, REUTILIZAR o SUSTITUIR.
7. Emitir reporte W3 con diffs, evidencias, métricas, riesgos y siguiente dependencia.

### W4 — Aplicar idempotencia tenant+eventId+projectorVersion y fencing por revision
1. Registrar SHA de HEAD, rutas y firmas afectadas.
2. Dibujar dependencias de entrada/salida y contratos Zod/Pydantic/eventos.
3. Implementar o documentar el cambio de esta wave en patchset aislado (solo tras validar baseline).
4. Añadir tests positivos, negativos, tenant isolation, idempotencia y fallo relevante.
5. Ejecutar typecheck/tests apropiados; registrar comandos y códigos de salida.
6. Comparar con arquitectura objetivo y anotar qué pasa a LEGACY TEMPORAL, REUTILIZAR o SUSTITUIR.
7. Emitir reporte W4 con diffs, evidencias, métricas, riesgos y siguiente dependencia.

### W5 — Reprocesar tras crash entre persist y ACK, sin duplicar Thought ni Card
1. Registrar SHA de HEAD, rutas y firmas afectadas.
2. Dibujar dependencias de entrada/salida y contratos Zod/Pydantic/eventos.
3. Implementar o documentar el cambio de esta wave en patchset aislado (solo tras validar baseline).
4. Añadir tests positivos, negativos, tenant isolation, idempotencia y fallo relevante.
5. Ejecutar typecheck/tests apropiados; registrar comandos y códigos de salida.
6. Comparar con arquitectura objetivo y anotar qué pasa a LEGACY TEMPORAL, REUTILIZAR o SUSTITUIR.
7. Emitir reporte W5 con diffs, evidencias, métricas, riesgos y siguiente dependencia.

### W6 — Añadir DLQ, backpressure, métricas de lag y reconciliación
1. Registrar SHA de HEAD, rutas y firmas afectadas.
2. Dibujar dependencias de entrada/salida y contratos Zod/Pydantic/eventos.
3. Implementar o documentar el cambio de esta wave en patchset aislado (solo tras validar baseline).
4. Añadir tests positivos, negativos, tenant isolation, idempotencia y fallo relevante.
5. Ejecutar typecheck/tests apropiados; registrar comandos y códigos de salida.
6. Comparar con arquitectura objetivo y anotar qué pasa a LEGACY TEMPORAL, REUTILIZAR o SUSTITUIR.
7. Emitir reporte W6 con diffs, evidencias, métricas, riesgos y siguiente dependencia.


## Entregables exigidos
- Proyector durable probado con fault injection
- No se retiran subscribers antiguos hasta equivalencia de hechos y cobertura
- `BASELINE.md`, `PATCHSETS.md`, `TEST-PLAN.md`, `EXECUTION-REPORT.md`, `ROLLBACK.md` y ADR cuando cambien contratos.
- Mapa de eventos y provenance `eventId→correlationId→causationId→task/Thought/Card`.
- Clasificación de componentes: REUTILIZAR / SUSTITUIR / LEGACY TEMPORAL, con condición de retirada.
- Matriz de seguridad: tenant, actor, rol, permiso, redacción de evidencia, revocación.

## Gate de aceptación
**Replay converge y no produce doble ejecución.** No aceptar solo tests legacy: demostrar capacidades V2. No declarar PASS si no se han ejecutado los tests.

## Rollback y no destrucción
Guardar migración de datos y versiones; feature flags donde corresponda; conservar rutas antiguas **solo temporalmente** hasta cortar consumidores. Prohibido migrar esquemas con pérdida silenciosa, publicar duplicados de efectos, conceder permisos por inferencia o eliminar el único camino operativo antes de activar el nuevo.

## Reporte para siguiente agente
```yaml
campaign: C02
branch: ""
base_sha: ""
head_sha: ""
status: PLANNED
waves:
  completed: []
  blocked: []
paths_created: []
paths_modified: []
legacy_to_retire: []
tests:
  commands: []
  pass: []
  fail: []
  skipped: []
security_findings: []
cross_module_impacts: []
metrics: {}
rollback_tested: false
next_dependency: ""
```
