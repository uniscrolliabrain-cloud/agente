# 08A. Seguir recepción y reconocimiento

Fase 08 · Proyección defensiva del relay. Correspondencia con P11 de la especificación original.

Localizar la transacción del consumidor, su cursor e inbox, y la llamada que reconoce el evento de origen. Verificar la identidad autenticada y vigencia del contrato que permite proyectar en Cognition.

**Criterio de salida.** Cada reconocimiento se asocia a un commit local identificable y a la revisión del productor.

**Superficies de partida.** [Fuente, blob 81bbd950e045](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/security-v2/event-relay.ts) · [Prueba de referencia, blob 09e4e2a0427b](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-cyber-bridge.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/08-ciberseguridad/PATCHSETS.md)

[Índice de la campaña](../README.md)
