# 01D. Interrumpir un stream abierto

Fase 01 · Montaje del chat y autoridad. Correspondencia con P01, P04 de la especificación original.

Después de RUN_STARTED, simular caída del proveedor y pérdida de membresía. Registrar si se generó receipt y si se inició otra ruta. Verificar el comportamiento de un runId ya consumido y un runId nuevo.

**Criterio de salida.** Los consumidores ven una terminación inequívoca y no una segunda conversación que reutilice la autoridad o el id del intento.

**Superficies de partida.** [Fuente, blob 503e0c7e2bab](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/agent.ts) · [Prueba de referencia, blob 97882a023a9c](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/trans02-candidate-routing.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/01-consolidacion/PATCHSETS.md)

[Índice de la campaña](../README.md)
