# 09B. Coordinar fence y estado de run

Fase 09 · Visibilidad de la entrega. Correspondencia con P02, P05 de la especificación original.

Confirmar la transición del ledger y el receipt del run dentro de la misma transacción. Verificar identificador de consumidor y fence vigente. Reutilizar el recuperador existente para reservas vencidas.

**Criterio de salida.** Un worker antiguo no confirma por encima de una reserva cedida a otro y un ACK repetido conserva el mismo resultado.

**Superficies de partida.** [Fuente, blob bb37fc21dba0](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/delivery-recovery.ts) · [Prueba de referencia, blob b7ce1c543f78](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-delivery-recovery.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/09-observabilidad-v2/PATCHSETS.md)

[Índice de la campaña](../README.md)
