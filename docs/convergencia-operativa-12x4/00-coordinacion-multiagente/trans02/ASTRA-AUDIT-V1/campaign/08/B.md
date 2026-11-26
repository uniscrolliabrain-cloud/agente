# 08B. Validar proyección opcional

Fase 08 · Proyección defensiva del relay. Correspondencia con P11 de la especificación original.

Registrar el consumidor cognitivo solo si el callback requerido y el store transaccional son coherentes. Conservar el contrato genérico del relay para otros consumidores. Limitar la salida a observaciones atribuibles y autorizadas.

**Criterio de salida.** La ausencia del callback deja explícito el estado del consumidor cognitivo.

**Superficies de partida.** [Fuente, blob 81bbd950e045](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/security-v2/event-relay.ts) · [Prueba de referencia, blob 09e4e2a0427b](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-cyber-bridge.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/08-ciberseguridad/PATCHSETS.md)

[Índice de la campaña](../README.md)
