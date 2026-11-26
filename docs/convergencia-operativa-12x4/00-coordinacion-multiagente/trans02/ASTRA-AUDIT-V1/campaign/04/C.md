# 04C. Contrastar la lectura de Fast

Fase 04 · De acuse externo a card. Correspondencia con P03, P07 de la especificación original.

Ejecutar el recorrido desde receipt hasta evento, cursor, card y snapshot. Comparar el verbo de la representación entregada con el estado normalizado. Repetir para rechazo sin efecto y resultado desconocido.

**Criterio de salida.** Toda afirmación de entrega tiene una fuente de confirmación resoluble por el actor.

**Superficies de partida.** [Fuente, blob 6bedfe5913b5](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/runtime-outcome.ts) · [Prueba de referencia, blob ea811e590f45](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-runtime-outcome.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/04-whatsapp/PATCHSETS.md)

[Índice de la campaña](../README.md)
