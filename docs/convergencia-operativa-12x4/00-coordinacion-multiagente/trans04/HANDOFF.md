# HANDOFF trans04 · Infraestructura, observabilidad y calidad

Lee primero [coordinación común](../README.md), [contrato](../../CONTRATO-TRANSVERSAL.md), [wiring](../../WIRING-INTELIGENCIA-DISTRIBUIDA.md) y [pendientes](../../00-pendientes/README.md). Tu rama es trans04; destino PR campaign/convergencia-operativa-12x4. No main ni UX/demo.

## Ownership provisional
metrics/**, metrics-exporter.ts, engine/metrics/**, middleware/request-logger.ts, scripts/gate*, scripts/verify*, scripts/provision-vertical-slice.ts, scripts/lib/vertical-slice-bundle.ts, scripts/lib/agency-bootstrap.ts, CI, package.json, pnpm-lock.yaml. Paths abreviados relativos a apps/server/src salvo packages, scripts, CI y raíz. Antes de editar, registrar lista exacta y confirmar con supervisor; lectura global permitida. No tocar paths de otros agentes, ni siquiera para arreglar tests. Solicitar cambios con diff y prueba.

## Misiones
01 scaffold/docu: Inventariar registry, métricas, CI y gates; baseline reproducible, fixtures y upstream sintético; reservar tests por path.

02 coding/audit: OTLP/Grafana sin duplicar registry; instrumentación mediante solicitudes a propietarios; fixtures, plan/apply/check, dashboards y gates E2E; dependencias centralizadas.

03 reaudit/refactor: Revisar integraciones de Trans03 sin editar; reproducir tests, detectar mocks engañosos, métricas duplicadas y secretos; devolver findings. Corrige solo tus propios paths tras recibir auditoría.

04 hardening: Fault injection, carga, restore, alertas, Postgres restringido y certificación SHA combinado; no neutralizar NO_GO.

## Dependencias
Trans01: hooks y seguridad; trans02: lag y latencia; Trans03: dependencias y señales externas.

## Primera entrega W0
Inventario por SHA de ramas relevantes, mapa productor/consumidor, paths exactos, conflictos, pruebas existentes y nuevas propuestas, comandos, riesgos, rollback y owner actions. No código funcional hasta aprobación de ownership y contratos. Ejecutar gates disponibles y distinguir NOT_RUN de PASS. Después seguir W1–W5 y barreras del documento común. No cambiar autoridad del kernel, no bloquear Fast con Slow, no confundir persona con permisos.

## Reporte obligatorio
Actualizar BITACORA.md con base/HEAD, fase/pasada/oleada, patchset, paths, solicitudes, comandos y exit codes, evidencia, bloqueos y siguiente tarea. Entregar PR pequeño por oleada, sin auto-merge ni force push. No deploy ni cierre de ramas.
