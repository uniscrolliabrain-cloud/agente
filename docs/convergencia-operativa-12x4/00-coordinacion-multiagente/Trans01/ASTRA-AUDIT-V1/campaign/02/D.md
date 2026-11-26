# 02D. Aislar fallos de telemetría

Fase 02 · Observación del kernel. Correspondencia con H01 de la especificación original.

Simular sink síncrono que lanza y sink asíncrono que tarda. Instrumentar la decisión, el estado final y las promesas pendientes. Probar presión sostenida con capacidad de cola fija.

**Criterio de salida.** El receipt y las decisiones permanecen coherentes. Se conocen pérdidas de muestras y la cola respeta su límite declarado.

**Superficies de partida.** [Fuente, blob 6c3778ed6520](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/execution/capability-runner.ts) · [Prueba de referencia, blob dbc1eb92e19e](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-telemetry-hooks.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/02-observabilidad/PATCHSETS.md)

[Índice de la campaña](../README.md)
