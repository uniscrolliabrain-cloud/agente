# 03B. Resolver tiempo y cuota bajo lock

Fase 03 · Inferencia y evaluación semántica. Correspondencia con P04, P06 de la especificación original.

Tras bloquear la fila de tenant y lane, leer el reloj y volver a comprobar abort, capacidad y límite diario positivo. Reservar cuota y slot en la misma transacción. Ante expiración ambigua, registrar hasta cuándo la operación remota puede seguir en vuelo.

**Criterio de salida.** Una espera que cruza medianoche consume cuota del día correcto y una cuota cero impide la primera admisión.

**Superficies de partida.** [Fuente, blob a1d8f64543fb](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/inference.ts) · [Prueba de referencia, blob 7fd81dc8eff0](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-slow-lanes.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/03-proveedores/PATCHSETS.md)

[Índice de la campaña](../README.md)
