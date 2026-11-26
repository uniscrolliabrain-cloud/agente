# 04B. Preservar la semántica de aceptación

Fase 04 · WhatsApp e inbox. Correspondencia con V01 de la especificación original.

Definir la traducción al receipt común con Trans03. Mantener el identificador de proveedor y la evidencia de aceptación. Cerrar entrega únicamente con confirmación propia de la familia. Revisar interoperabilidad con el ledger ya presente antes de introducir columnas.

**Criterio de salida.** Un HTTP exitoso con aceptación produce lenguaje de aceptación, incluso tras recargar la vista.

**Superficies de partida.** [Fuente, blob 7f4401b4ad75](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/whatsapp-outbound.ts) · [Prueba de referencia, blob 33f6690374ea](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/whatsapp-outbound.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/04-whatsapp/PATCHSETS.md)

[Índice de la campaña](../README.md)
