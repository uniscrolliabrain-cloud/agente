# 04C. Comprobar deduplicación cruzada

Fase 04 · WhatsApp e inbox. Correspondencia con V01 de la especificación original.

Repetir un webhook, una creación de borrador y una aprobación en distinto orden. Inspeccionar número de mensajes, borradores e intents. Repetir con segundo tenant usando el mismo id externo.

**Criterio de salida.** Una entrega duplicada conserva una sola historia en su ámbito y el segundo tenant conserva sus propios registros.

**Superficies de partida.** [Fuente, blob 7f4401b4ad75](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/whatsapp-outbound.ts) · [Prueba de referencia, blob 33f6690374ea](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/whatsapp-outbound.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/04-whatsapp/PATCHSETS.md)

[Índice de la campaña](../README.md)
