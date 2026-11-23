# Patchsets propuestos (no aplicados a producción)

**R01 — Tests RED de idempotencia y Postgres.** Nuevo archivo de tests de auditoría con DB de prueba, dos `observe` concurrentes, prompt diferente misma clave, política distinta, y rollback por error del sink. No reemplazar tests existentes.

**R02 — Carrera de autorización.** Test controlado que revoca record o cambia policyRevision tras primer resolve y antes de enqueue. Verificar que revalidación en `SlowCognitionQueue.enqueue` rechaza. Si no, corregir frontera de transacción/validación en implementador.

**R03 — Ownership de receipt.** P03b debe derivar operationId, actorId y tenantId de evento/receipt autenticado, nunca de campos libres. Dedupe persistente por eventId/receiptId + revisión, con DLQ.

**R04 — Coste y límites.** Rate limit por tenant/actor/tipo, cuotas, prioridad, backpressure, máximo de jobs, retención y alarmas. No duplicar InferenceLane ni límites existentes.

**R05 — Inyección y factualidad.** Test que introduce contenido hostil en record.body y prompt; verificar que no puede alterar permisos ni publicar acciones y que `inference` no se convierte en `verified_fact`.

**R06 — CI auditoría.** Workflow de auditoría para rama `audit/c06-p03a-slow-observation-20261123` o PR hacia implementador, ejecutando tests nuevos y typecheck; no desplegar.
