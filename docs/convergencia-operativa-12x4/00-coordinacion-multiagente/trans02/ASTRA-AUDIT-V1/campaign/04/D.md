# 04D. Reordenar confirmación y acuse

Fase 04 · De acuse externo a card. Correspondencia con P03, P07 de la especificación original.

Presentar confirmación tardía, entrega duplicada y replay de la aceptación anterior. Preservar ambas observaciones sin degradar la mejor evidencia vigente. Revocar la fuente y volver a resolver el snapshot.

**Criterio de salida.** El replay no crea otra card equivalente. Una fuente revocada vuelve indisponibles sus derivados.

**Superficies de partida.** [Fuente, blob 6bedfe5913b5](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/runtime-outcome.ts) · [Prueba de referencia, blob ea811e590f45](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-runtime-outcome.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/04-whatsapp/PATCHSETS.md)

[Índice de la campaña](../README.md)
