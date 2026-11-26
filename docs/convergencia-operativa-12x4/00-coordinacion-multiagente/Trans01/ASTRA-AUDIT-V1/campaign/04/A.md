# 04A. Trazar la respuesta al hilo

Fase 04 · WhatsApp e inbox. Correspondencia con V01 de la especificación original.

Seguir createReply, prepareDraft, review, approve y reconcile en WhatsAppOutbound. Fijar hashes de destinatario, texto y canal en la revisión que recibe el decisor. Identificar el punto donde el proveedor aporta una referencia de mensaje.

**Criterio de salida.** Se puede recorrer del evento entrante al borrador y del borrador al acuse sin inferir entrega.

**Superficies de partida.** [Fuente, blob 7f4401b4ad75](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/whatsapp-outbound.ts) · [Prueba de referencia, blob 33f6690374ea](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/whatsapp-outbound.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/04-whatsapp/PATCHSETS.md)

[Índice de la campaña](../README.md)
