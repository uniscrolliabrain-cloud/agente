# 05D. Cubrir ambigüedad y cuota

Fase 05 · Google y documentos. Correspondencia con V02–V06 de la especificación original.

Combinar lectura interrumpida, escritura con acuse perdido, conflicto de calendario y retiro de scope. Declarar por familia qué lecturas se pueden intentar de nuevo y cuándo se debe pedir conciliación. Medir invocaciones.

**Criterio de salida.** Una incidencia de transporte no produce un segundo correo o evento automáticamente.

**Superficies de partida.** [Fuente, blob 1299d51bf999](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/actions.ts) · [Prueba de referencia, blob b501bd6ae44e](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/vertical-slice-gmail.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/05-google/PATCHSETS.md)

[Índice de la campaña](../README.md)
