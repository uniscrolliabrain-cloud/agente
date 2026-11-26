# 01D. Recuperar una confirmación perdida

Fase 01 · Consolidación de decisión y despacho. Correspondencia con A01–A03, E01–E03, S01 de la especificación original.

Inyectar caída tras commit y antes de la respuesta al decisor. Volver a invocar la decisión con la misma revisión. Comparar decisión autorizada, receipt, evento y estado del intento. Repetir con retirada del permiso antes de que comience la llamada.

**Criterio de salida.** La segunda invocación devuelve el estado persistido o pide reconciliación. La métrica de envíos del proveedor de prueba permanece en uno o cero según el punto de caída.

**Superficies de partida.** [Fuente, blob 1299d51bf999](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/actions.ts) · [Prueba de referencia, blob 8ae764b66679](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-dispatch-outbox.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/01-consolidacion/PATCHSETS.md)

[Índice de la campaña](../README.md)
