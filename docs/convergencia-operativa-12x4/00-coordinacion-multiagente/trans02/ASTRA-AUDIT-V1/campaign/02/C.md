# 02C. Medir backlog y frescura

Fase 02 · Observabilidad de Cognition. Correspondencia con P05 de la especificación original.

Comparar última secuencia publicada, cursor confirmado y antigüedad del evento pendiente. Validar que un consumidor sin eventos tenga backlog cero. Probar un tenant lento junto a otro sano.

**Criterio de salida.** Se identifica el consumidor rezagado y se mantiene visible el avance del tenant sano.

**Superficies de partida.** [Fuente, blob 98ce694e479c](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/workers.ts) · [Prueba de referencia, blob 568846d80296](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-workers.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/02-observabilidad/PATCHSETS.md)

[Índice de la campaña](../README.md)
