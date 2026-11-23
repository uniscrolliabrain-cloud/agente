# Gate para conectar el consumidor automático C06.P03b

**NO-GO provisional** hasta: (1) pruebas de concurrencia/idempotencia con Postgres real; (2) pruebas de revocación y cambio de política entre resolve y enqueue; (3) ownership verificado de operationId/eventId/actor/tenant; (4) trigger selectivo de eventos empresariales verificables, evitando bucles por `cognition.v2.slow.status` y `cognition.v2.record.proposed`; (5) outbox/inbox durable, reintentos con backoff y DLQ; (6) cuotas y backpressure por tenant/actor; (7) métricas OTel/Grafana y rollback para activación; (8) pruebas E2E de evento → proyección → puente → cola, sin proveedores reales.

No se exige a P03a suscripción automática ni integración con Anam, ElevenLabs o JEV. El contrato de P03a es prometedor; falta certificarlo con pruebas de ejecución.
