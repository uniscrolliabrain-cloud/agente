# Campaña C15 — Certificación E2E, seguridad, rendimiento y handoff final
**Programa:** rediseño cognitivo/conversacional V2 — opción 3.
**Estado inicial:** PLANEADA; no se ha implementado esta campaña por crear este documento.
**Secuencia:** depende de C14 y de los contratos pertinentes.
**Objetivo:** Demostrar que opción 3 funciona y dejar trazabilidad completa para operación.

## Reglas globales de ejecución
- **Arquitectura vinculante:** `ADR-009-REDISENO-SUSTITUTIVO-LEGACY-TRANSITORIO.md`. **Opción 3 es rediseño sustitutivo**, no paridad con legacy.
- Kernel/policy/SOP son autoridad; Slow y JEV producen propuestas; JEV **no** es juez.
- Revisar SHA/HEAD, imports, callers, schema y tests **antes de editar**. Los paths con “(propuesto)” no están verificados.
- Cada campaña debe trabajar en rama aislada; una superficie de escritura por agente, evitar merges automáticos. No deploy ni merge sin autorización.
- Preservar aislamiento tenant/actor/role, procedencia, revisión, idempotencia, denegación por defecto y secretos.
- El código viejo puede **sustituirse y eliminarse** después de migrar sus consumidores; no arrastrar sus limitaciones a V2.
- Todo resultado requiere reporte con archivos modificados, diff, comandos, exit codes, tests, métricas, bloqueos y rollback.

## Inventario de superficies / patchsets
- **PS15.1:** `tests/` — inspeccionar implementación y dependientes, definir cambios mínimos por contrato, tests y rollback.
- **PS15.2:** `apps/server/src/` — inspeccionar implementación y dependientes, definir cambios mínimos por contrato, tests y rollback.
- **PS15.3:** `apps/web/src/` — inspeccionar implementación y dependientes, definir cambios mínimos por contrato, tests y rollback.
- **PS15.4:** `packages/domain/src/` — inspeccionar implementación y dependientes, definir cambios mínimos por contrato, tests y rollback.
- **PS15.5:** `agntia-ciberseguridad: tests/ (verificar)` — inspeccionar implementación y dependientes, definir cambios mínimos por contrato, tests y rollback.
- **PS15.6:** `docs/auditoria-integral-30-angulos/03-harness-conversacional/` — inspeccionar implementación y dependientes, definir cambios mínimos por contrato, tests y rollback.

## Waves y pasos ejecutables
### W1 — Ejecutar tests de kernel, RLS, Card V2, grafo, memorias, cromos, JEV, Fast y Cyber
1. Registrar SHA de HEAD, rutas y firmas afectadas.
2. Dibujar dependencias de entrada/salida y contratos Zod/Pydantic/eventos.
3. Implementar o documentar el cambio de esta wave en patchset aislado (solo tras validar baseline).
4. Añadir tests positivos, negativos, tenant isolation, idempotencia y fallo relevante.
5. Ejecutar typecheck/tests apropiados; registrar comandos y códigos de salida.
6. Comparar con arquitectura objetivo y anotar qué pasa a LEGACY TEMPORAL, REUTILIZAR o SUSTITUIR.
7. Emitir reporte W1 con diffs, evidencias, métricas, riesgos y siguiente dependencia.

### W2 — Fault injection: bus down, Slow down, JEV down, replay, crash, retry, revocación
1. Registrar SHA de HEAD, rutas y firmas afectadas.
2. Dibujar dependencias de entrada/salida y contratos Zod/Pydantic/eventos.
3. Implementar o documentar el cambio de esta wave en patchset aislado (solo tras validar baseline).
4. Añadir tests positivos, negativos, tenant isolation, idempotencia y fallo relevante.
5. Ejecutar typecheck/tests apropiados; registrar comandos y códigos de salida.
6. Comparar con arquitectura objetivo y anotar qué pasa a LEGACY TEMPORAL, REUTILIZAR o SUSTITUIR.
7. Emitir reporte W2 con diffs, evidencias, métricas, riesgos y siguiente dependencia.

### W3 — Medir TTFT chat, primer audio, lag de proyección, token budgets y coste
1. Registrar SHA de HEAD, rutas y firmas afectadas.
2. Dibujar dependencias de entrada/salida y contratos Zod/Pydantic/eventos.
3. Implementar o documentar el cambio de esta wave en patchset aislado (solo tras validar baseline).
4. Añadir tests positivos, negativos, tenant isolation, idempotencia y fallo relevante.
5. Ejecutar typecheck/tests apropiados; registrar comandos y códigos de salida.
6. Comparar con arquitectura objetivo y anotar qué pasa a LEGACY TEMPORAL, REUTILIZAR o SUSTITUIR.
7. Emitir reporte W3 con diffs, evidencias, métricas, riesgos y siguiente dependencia.

### W4 — Validar dos tenants, roles, tareas, approvals, evidencias y resultados parciales
1. Registrar SHA de HEAD, rutas y firmas afectadas.
2. Dibujar dependencias de entrada/salida y contratos Zod/Pydantic/eventos.
3. Implementar o documentar el cambio de esta wave en patchset aislado (solo tras validar baseline).
4. Añadir tests positivos, negativos, tenant isolation, idempotencia y fallo relevante.
5. Ejecutar typecheck/tests apropiados; registrar comandos y códigos de salida.
6. Comparar con arquitectura objetivo y anotar qué pasa a LEGACY TEMPORAL, REUTILIZAR o SUSTITUIR.
7. Emitir reporte W4 con diffs, evidencias, métricas, riesgos y siguiente dependencia.

### W5 — Auditar ausencia de prompts con secretos y cumplimiento de políticas
1. Registrar SHA de HEAD, rutas y firmas afectadas.
2. Dibujar dependencias de entrada/salida y contratos Zod/Pydantic/eventos.
3. Implementar o documentar el cambio de esta wave en patchset aislado (solo tras validar baseline).
4. Añadir tests positivos, negativos, tenant isolation, idempotencia y fallo relevante.
5. Ejecutar typecheck/tests apropiados; registrar comandos y códigos de salida.
6. Comparar con arquitectura objetivo y anotar qué pasa a LEGACY TEMPORAL, REUTILIZAR o SUSTITUIR.
7. Emitir reporte W5 con diffs, evidencias, métricas, riesgos y siguiente dependencia.

### W6 — Entregar matriz de PASS/FAIL/SKIP, riesgos residuales, ADR, rollback y aprobación final
1. Registrar SHA de HEAD, rutas y firmas afectadas.
2. Dibujar dependencias de entrada/salida y contratos Zod/Pydantic/eventos.
3. Implementar o documentar el cambio de esta wave en patchset aislado (solo tras validar baseline).
4. Añadir tests positivos, negativos, tenant isolation, idempotencia y fallo relevante.
5. Ejecutar typecheck/tests apropiados; registrar comandos y códigos de salida.
6. Comparar con arquitectura objetivo y anotar qué pasa a LEGACY TEMPORAL, REUTILIZAR o SUSTITUIR.
7. Emitir reporte W6 con diffs, evidencias, métricas, riesgos y siguiente dependencia.


## Entregables exigidos
- Certificación con comandos y exit codes, no declaraciones vagas
- Documentación final y listado de legacy retirado
- `BASELINE.md`, `PATCHSETS.md`, `TEST-PLAN.md`, `EXECUTION-REPORT.md`, `ROLLBACK.md` y ADR cuando cambien contratos.
- Mapa de eventos y provenance `eventId→correlationId→causationId→task/Thought/Card`.
- Clasificación de componentes: REUTILIZAR / SUSTITUIR / LEGACY TEMPORAL, con condición de retirada.
- Matriz de seguridad: tenant, actor, rol, permiso, redacción de evidencia, revocación.

## Gate de aceptación
**Criterios funcionales V2 y seguridad pasan; founder aprueba merge/deploy.** No aceptar solo tests legacy: demostrar capacidades V2. No declarar PASS si no se han ejecutado los tests.

## Rollback y no destrucción
Guardar migración de datos y versiones; feature flags donde corresponda; conservar rutas antiguas **solo temporalmente** hasta cortar consumidores. Prohibido migrar esquemas con pérdida silenciosa, publicar duplicados de efectos, conceder permisos por inferencia o eliminar el único camino operativo antes de activar el nuevo.

## Reporte para siguiente agente
```yaml
campaign: C15
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
