# Idempotencia y concurrencia

Clave puente `digest(['slow-observation-v1',tenantId,actorId,operationId,sourceId,sourceRevision])` (`slow-observation.ts:33-35`). Identidad de job final: `digest([tenantId,actorId,key])` (`slow.ts:62`).

- Mismo actor/tenant/operación/evidencia/revisión/prompt → mismo job ID; `INSERT ... ON CONFLICT DO NOTHING` evita dos filas; `SELECT` y comparación digest del input determinan reuso.
- Prompt distinto con misma clave → `IDEMPOTENCY_CONFLICT`; protección correcta, requiere test de conflicto y decisión de reintento.
- Operación, fuente, revisión, actor o tenant diferentes → claves distintas.
- Cambio de policyRevision con misma clave → input distinto, conflicto, no actualización silenciosa.
- Error tras insertar: la transacción DB debería revertir si `emit` falla; validar contra Store real y DurableEventSink.
- Solicitudes concurrentes: Postgres unique/ON CONFLICT ofrece base sólida, pero no hay prueba simultánea con DB real ni garantías verificadas de orden/latencia.
- Cambiar operationId arbitrariamente permite multiplicar trabajos; el futuro productor debe derivarlo del receipt verificado, no de input del cliente.

Los dos tests originales solo comparan dos llamadas secuenciales a un fake enqueue; **no prueban la idempotencia durable de SlowCognitionQueue**.
