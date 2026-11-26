# 02A. Identificar eventos observables

Fase 02 · Observabilidad de Cognition. Correspondencia con P05 de la especificación original.

Mapear ticks de proyección, progreso de cursor, trabajo Slow, reservas de entrega y salidas de Fast. Registrar reloj y productor de cada señal. Explicitar si una muestra describe admisión, ejecución o commit.

**Criterio de salida.** La evidencia de disponibilidad distingue lazo activo, cola que avanza y fuente sin entradas.

**Superficies de partida.** [Fuente, blob 98ce694e479c](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/workers.ts) · [Prueba de referencia, blob 568846d80296](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-workers.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/02-observabilidad/PATCHSETS.md)

[Índice de la campaña](../README.md)
