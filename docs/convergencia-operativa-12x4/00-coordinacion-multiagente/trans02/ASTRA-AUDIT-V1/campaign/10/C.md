# 10C. Comparar estados incompatibles

Fase 10 · Hechos empresariales y gestoría. Correspondencia con P03, P12 de la especificación original.

Plantear una factura registrada con una transferencia aceptada pero aún sin confirmación. Preparar el snapshot del actor con permisos y repetir tras una corrección de la transferencia.

**Criterio de salida.** La representación distingue factura, observación sobre pago y estado de confirmación.

**Superficies de partida.** [Fuente, blob 314cc808fd08](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/business-read.ts) · [Prueba de referencia, blob 31521efbbdcb](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-business-read.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/10-gestoria/PATCHSETS.md)

[Índice de la campaña](../README.md)
