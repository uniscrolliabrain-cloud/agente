# 08A. Delimitar el evento observado

Fase 08 · Observaciones de seguridad. Correspondencia con X01 defensivo de la especificación original.

Revisar installSecurityBridgeV2 y CyberEventRelay.run para identificar identidad del productor, cursor, evento y ACK. Tratar el contenido del evento como evidencia externa con nivel de verificación propio.

**Criterio de salida.** Una observación localiza su origen y conserva el nivel de certeza que aportó el productor.

**Superficies de partida.** [Fuente, blob 81bbd950e045](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/security-v2/event-relay.ts) · [Prueba de referencia, blob b999441d79dd](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-service-principal.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/08-ciberseguridad/PATCHSETS.md)

[Índice de la campaña](../README.md)
