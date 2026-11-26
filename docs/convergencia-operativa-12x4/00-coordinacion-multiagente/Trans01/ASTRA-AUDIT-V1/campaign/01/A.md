# 01A. Reconstruir una decisión

Fase 01 · Consolidación de decisión y despacho. Correspondencia con A01–A03, E01–E03, S01 de la especificación original.

Seguir ActionService.decide desde claim hasta transaction, recordIn, auditIn y action-dispatch. Hacer una segunda traza desde run y desde maintain. Marcar los commits locales que preceden a la invocación externa y a la notificación. Conservar un diagrama separado del caso scheduled.

**Criterio de salida.** La tabla identifica quién puede escribir la acción, la intención y la proyección de aprobación en cada estado.

**Superficies de partida.** [Fuente, blob 1299d51bf999](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/actions.ts) · [Prueba de referencia, blob 8ae764b66679](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-dispatch-outbox.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/01-consolidacion/PATCHSETS.md)

[Índice de la campaña](../README.md)
