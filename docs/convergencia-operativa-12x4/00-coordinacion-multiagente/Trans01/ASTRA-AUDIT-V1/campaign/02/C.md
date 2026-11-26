# 02C. Vincular el ciclo de vida

Fase 02 · Observación del kernel. Correspondencia con H01 de la especificación original.

Contrastar el hook del runner con MetricsCollector montado en service.ts. Crear dos instancias de aplicación dentro del mismo proceso y cerrar una antes de ejercer la otra. Comprobar alta y baja de los suscriptores.

**Criterio de salida.** El conteo de un intento válido cambia una unidad con una instancia, dos instancias y tras cierre de la primera.

**Superficies de partida.** [Fuente, blob 6c3778ed6520](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/execution/capability-runner.ts) · [Prueba de referencia, blob dbc1eb92e19e](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-telemetry-hooks.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/02-observabilidad/PATCHSETS.md)

[Índice de la campaña](../README.md)
