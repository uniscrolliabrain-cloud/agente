# HANDOFF trans02 · Cognition distribuida

Lee primero [coordinación común](../README.md), [contrato](../../CONTRATO-TRANSVERSAL.md), [wiring](../../WIRING-INTELIGENCIA-DISTRIBUIDA.md) y [pendientes](../../00-pendientes/README.md). Tu rama es trans02; destino PR campaign/convergencia-operativa-12x4. No main ni UX/demo.

## Ownership provisional
engine/cognition/v2/**, engine/chromatic/**, agent.ts, engine/agents/personas/**, cognition-worker-entry.ts; grafo/memorias legacy previa reserva. Paths abreviados relativos a apps/server/src salvo packages, scripts, CI y raíz. Antes de editar, registrar lista exacta y confirmar con supervisor; lectura global permitida. No tocar paths de otros agentes, ni siquiera para arreglar tests. Solicitar cambios con diff y prueba.

## Misiones
01 scaffold/docu: Reconciliar C06.P02/P03a/P03b, inspeccionar chat, context.prepared, attention.select, slow.enqueue/tick y classifier; reproducir HTTP chat undefined.

02 coding/audit: Fast/Slow independientes, JEV autorizado, observación durable selectiva, evidencia/ontología, atención unificada, persona LAIA por defecto; solicitar wiring app/service a Trans01.

03 reaudit/refactor: Revisar kernel/runtime de Trans01 sin editar; probar receipts falsos, bucles, ACL, snapshot revocado y ranking; devolver findings. Corrige solo tus propios paths tras recibir auditoría.

04 hardening: Slow/JEV caídos no bloquean Fast/runtime; límites, leases, replay, relevancia y latencia; probar persona sin escalada y no cross-tenant.

## Dependencias
Trans01: autoridad y eventos; Trans03: puertos JEV/media; trans04: métricas y pruebas combinadas.

## Primera entrega W0
Inventario por SHA de ramas relevantes, mapa productor/consumidor, paths exactos, conflictos, pruebas existentes y nuevas propuestas, comandos, riesgos, rollback y owner actions. No código funcional hasta aprobación de ownership y contratos. Ejecutar gates disponibles y distinguir NOT_RUN de PASS. Después seguir W1–W5 y barreras del documento común. No cambiar autoridad del kernel, no bloquear Fast con Slow, no confundir persona con permisos.

## Reporte obligatorio
Actualizar BITACORA.md con base/HEAD, fase/pasada/oleada, patchset, paths, solicitudes, comandos y exit codes, evidencia, bloqueos y siguiente tarea. Entregar PR pequeño por oleada, sin auto-merge ni force push. No deploy ni cierre de ramas.
