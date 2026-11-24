# Coordinación Trans01 / trans02 / Trans03 / trans04

Base común inicial 109a3e043a158a7699b76511b95fb4fec3cfbc12. Comparación con main: 4 commits nuevos en main, archivos reportados de documentación UX. No incorporar UX/demo. Cuatro pasadas 01 scaffold, 02 coding, 03 reaudit/refactor, 04 hardening; barrera conjunta al final de cada oleada y pasada.

| Rama | Propiedad exclusiva inicial |
|---|---|
| Trans01 | apps/server/src/kernel/**, engine/events/**, engine/execution/**, engine/capabilities/**, engine/sop-executor.ts, engine/sop-triggers.ts, engine/service.ts, app.ts, auth/tenancy/policy, packages/domain/**, migraciones compartidas |
| trans02 | apps/server/src/engine/cognition/v2/**, engine/chromatic/**, agent.ts, engine/agents/personas/**, cognition-worker-entry.ts (instrumentación mediante solicitud), grafo/memoria/atención previa reserva explícita |
| Trans03 | packages/integrations/**, apps/server/src/google-auth.ts, whatsapp-routes.ts, engine/whatsapp-inbound.ts, engine/whatsapp-outbound.ts, adaptadores media/externos, vendor/** previa reserva |
| trans04 | apps/server/src/metrics/**, metrics-exporter.ts, engine/metrics/**, middleware/request-logger.ts, scripts/gate*, scripts/verify*, scripts/provision-vertical-slice.ts, scripts/lib/vertical-slice-bundle.ts, scripts/lib/agency-bootstrap.ts, CI, package.json y pnpm-lock.yaml |

Paths engine/ relativos a apps/server/src. Propiedad provisional: confirmar árbol y reservar paths exactos antes de escribir. No asumir propiedad de archivos no listados. Kernel metrics-consumer pertenece Trans01; instrumentación solicitada por trans04. Tests nuevos exclusivos con prefijo trans01/trans02/trans03/trans04; tests existentes se reservan por path. Cada agente escribe solo su carpeta de reporte docs/.../00-coordinacion-multiagente/<rama>/. Los contratos comunes y archivos compartidos solo los modifica su propietario mediante solicitud revisada; no cambiar interfaces unilateralmente. Trans01 integra wiring central, trans04 integra dependencias y gates. Ninguno fusiona ramas por su cuenta.

## Oleadas y barreras
W0: inventario de ramas, baseline, ownership exacto, contratos y pruebas rojas; no cambios funcionales hasta revisión.
W1: kernel/receipts/eventos + cognition observación + puertos externos + telemetría; primero contratos congelados.
W2: Fast/Slow/JEV, media y Composio; instrumentación; sandbox solo autorizado.
W3: WhatsApp y cinco slices Google, fixtures mínimas, SOPs y tarjetas; E2E combinado.
W4: repo sintético, owner real (plan antes de apply), seguridad mínima previa; ciberseguridad y observabilidad V2.
W5: gestoría, recompilación dominios/SOP, validación y cierre.
Cada pasada recorre W0–W5 según su propósito; P1 no activa proveedores ni crea owner real. P2 implementa; P3 revisores cruzados (Trans01↔trans02, Trans03↔trans04), correcciones por propietario; P4 rotar revisión y certificar conjunto.

## Protocolo
Antes de cada patchset: SHA base, paths, contratos, dependencias, prueba esperada y rollback. Solicitud de cambio compartido: ID, solicitante, propietario, path/símbolo, diff propuesto, impacto y test. Supervisor aprueba, propietario implementa. Reportar SHA final, comandos/exit codes, evidencia, bloqueos y próxima tarea. PR hacia campaña maestra, nunca main; integración secuencial por supervisor y CI sobre SHA combinado; refrescar ramas desde base aprobada sin force push. No cerrar ramas antiguas sin reconciliar y preservar SHA. No deploy, secretos, efectos reales ni UX/demo. Fallo de gate bloquea dependientes, no trabajo independiente. Aplicar ../WIRING-INTELIGENCIA-DISTRIBUIDA.md y ../CONTRATO-TRANSVERSAL.md.
