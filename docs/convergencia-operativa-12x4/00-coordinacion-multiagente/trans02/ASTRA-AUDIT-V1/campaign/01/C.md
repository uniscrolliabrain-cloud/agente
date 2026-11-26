# 01C. Comprobar los límites de Fast

Fase 01 · Montaje del chat y autoridad. Correspondencia con P01, P04 de la especificación original.

Ejercer el handler normal con messages, tools, state y forwardedProps sintéticos. Verificar la forma que el proveedor recibe tras la selección en servidor. Si hay intención operativa, registrar la entrada humana por el contrato de Trans01 separado de la generación conversacional.

**Criterio de salida.** La respuesta conversacional y la recepción de intención se pueden auditar por separado. El stream no confiere una decisión de despacho.

**Superficies de partida.** [Fuente, blob 503e0c7e2bab](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/agent.ts) · [Prueba de referencia, blob 97882a023a9c](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/trans02-candidate-routing.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/01-consolidacion/PATCHSETS.md)

[Índice de la campaña](../README.md)
