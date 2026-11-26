# 01B. Cerrar el intento con la acción

Fase 01 · Consolidación de decisión y despacho. Correspondencia con A01–A03, E01–E03, S01 de la especificación original.

Reutilizar Store.transaction para confirmar la transición local junto al cierre de la intención. Introducir un identificador de intento en el registro existente y conservar hash de propuesta. En un conflicto de intento, conservar la observación tardía para reconciliación. Dejar la llamada externa fuera de la transacción.

**Criterio de salida.** Los dos órdenes de la prueba de barreras convergen al mismo resultado observable con exactamente una llamada al doble de adaptador.

**Superficies de partida.** [Fuente, blob 1299d51bf999](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/actions.ts) · [Prueba de referencia, blob 8ae764b66679](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-dispatch-outbox.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/01-consolidacion/PATCHSETS.md)

[Índice de la campaña](../README.md)
