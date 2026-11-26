# 08C. Seguir el cursor y el ACK

Fase 08 · Observaciones de seguridad. Correspondencia con X01 defensivo de la especificación original.

Ejercer redelivery con dos copias del mismo evento sintético. Observar commit local y reconocimiento posterior del productor. Incluir colisión de identidad con contenido distinto para revisión.

**Criterio de salida.** La proyección local se materializa una vez y el ACK corresponde a la revisión observada.

**Superficies de partida.** [Fuente, blob 81bbd950e045](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/security-v2/event-relay.ts) · [Prueba de referencia, blob b999441d79dd](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-service-principal.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/08-ciberseguridad/PATCHSETS.md)

[Índice de la campaña](../README.md)
