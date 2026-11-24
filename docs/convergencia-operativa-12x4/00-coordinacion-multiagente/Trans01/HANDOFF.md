# HANDOFF Trans01 · Kernel y runtime

Lee primero [coordinación común](../README.md), [contrato](../../CONTRATO-TRANSVERSAL.md), [wiring](../../WIRING-INTELIGENCIA-DISTRIBUIDA.md) y [pendientes](../../00-pendientes/README.md). Tu rama es Trans01; destino PR campaign/convergencia-operativa-12x4. No main ni UX/demo.

## Ownership provisional
kernel/**, engine/events/**, engine/execution/**, engine/capabilities/**, engine/sop-executor.ts, engine/sop-triggers.ts, engine/service.ts, app.ts, packages/domain/**; auth/tenancy y migraciones previa reserva. Paths abreviados relativos a apps/server/src salvo packages, scripts, CI y raíz. Antes de editar, registrar lista exacta y confirmar con supervisor; lectura global permitida. No tocar paths de otros agentes, ni siquiera para arreglar tests. Solicitar cambios con diff y prueba.

## Misiones
01 scaffold/docu: Reconciliar C00–C05, acciones V1 y contratos de receipts; inventariar rutas y autorización; congelar schemas con trans02 y Trans03.

02 coding/audit: Cablear app/service, PDP, SOPs, outbox, receipts y capabilities; proveer hooks de observación y telemetría; integrar permisos de owner y middlewares.

03 reaudit/refactor: Revisar Cognition de trans02 sin editar sus paths; probar bypass, escalada de persona, causalidad y replay; devolver findings. Corrige solo tus propios paths tras recibir auditoría.

04 hardening: Postgres restringido, concurrencia, revocación, rollback, cierre de ramas reconciliadas; no eliminar legacy sin paridad.

## Dependencias
trans02: eventos/receipts y solicitud tipada; Trans03: capability/adapter; trans04: métricas, provisionamiento y gates.

## Primera entrega W0
Inventario por SHA de ramas relevantes, mapa productor/consumidor, paths exactos, conflictos, pruebas existentes y nuevas propuestas, comandos, riesgos, rollback y owner actions. No código funcional hasta aprobación de ownership y contratos. Ejecutar gates disponibles y distinguir NOT_RUN de PASS. Después seguir W1–W5 y barreras del documento común. No cambiar autoridad del kernel, no bloquear Fast con Slow, no confundir persona con permisos.

## Reporte obligatorio
Actualizar BITACORA.md con base/HEAD, fase/pasada/oleada, patchset, paths, solicitudes, comandos y exit codes, evidencia, bloqueos y siguiente tarea. Entregar PR pequeño por oleada, sin auto-merge ni force push. No deploy ni cierre de ramas.
