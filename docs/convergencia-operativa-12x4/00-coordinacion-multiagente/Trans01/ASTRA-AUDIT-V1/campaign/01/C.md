# 01C. Unificar barridos

Fase 01 · Consolidación de decisión y despacho. Correspondencia con A01–A03, E01–E03, S01 de la especificación original.

Inventariar recoverInterruptedActions en el arranque y en maintain, reconcileDispatchIntents y el CAS posterior de acciones atascadas. Sustituir escritores superpuestos por el mismo reconciliador con antigüedad y revisión de intento. Para registros legacy, leer la intención antes de clasificar la acción.

**Criterio de salida.** Una instancia que arranca mientras otra espera al proveedor conserva los intentos recientes. Una acción antigua sin evidencia queda identificada para revisión.

**Superficies de partida.** [Fuente, blob 1299d51bf999](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/actions.ts) · [Prueba de referencia, blob 8ae764b66679](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-dispatch-outbox.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/01-consolidacion/PATCHSETS.md)

[Índice de la campaña](../README.md)
