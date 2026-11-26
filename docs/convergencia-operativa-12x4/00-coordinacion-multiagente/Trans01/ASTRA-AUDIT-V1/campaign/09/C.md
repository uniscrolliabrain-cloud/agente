# 09C. Validar denominadores

Fase 09 · Observabilidad conjunta. Correspondencia con G01, H01–H03 de la especificación original.

Comparar conteos del exporter con eventos del periodo e intents durables. Repetir un replay y reiniciar el proceso. Acordar con Trans04 qué métricas son contadores por proceso y qué magnitudes se reconstruyen de almacenamiento.

**Criterio de salida.** La tasa de confirmación declara su denominador y evita doble conteo al repetir la proyección.

**Superficies de partida.** [Fuente, blob bb1686246e8f](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/metrics-exporter.ts) · [Prueba de referencia, blob 9ac24df1cda2](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/worker-metrics.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/09-observabilidad-v2/PATCHSETS.md)

[Índice de la campaña](../README.md)
