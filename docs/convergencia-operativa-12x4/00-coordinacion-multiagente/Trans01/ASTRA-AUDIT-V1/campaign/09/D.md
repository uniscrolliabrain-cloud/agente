# 09D. Comprobar degradación

Fase 09 · Observabilidad conjunta. Correspondencia con G01, H01–H03 de la especificación original.

Mantener el heartbeat con la cola de trabajo inmóvil y simular el escenario inverso. Registrar frescura, backlog y throughput de manera independiente. Verificar que la alerta refiere el síntoma observado.

**Criterio de salida.** Un worker vivo con trabajo antiguo pendiente aparece degradado aunque responda su endpoint de liveness.

**Superficies de partida.** [Fuente, blob bb1686246e8f](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/metrics-exporter.ts) · [Prueba de referencia, blob 9ac24df1cda2](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/worker-metrics.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/09-observabilidad-v2/PATCHSETS.md)

[Índice de la campaña](../README.md)
