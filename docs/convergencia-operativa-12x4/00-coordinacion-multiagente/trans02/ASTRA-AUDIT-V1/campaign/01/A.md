# 01A. Seguir la petición autenticada

Fase 01 · Montaje del chat y autoridad. Correspondencia con P01, P04 de la especificación original.

Trazar desde el handler CopilotKit hasta makeRuntime, ConversationAgent y CognitionV2Runtime.chat. Describir la precedencia de backend sample, AG-UI explícito y tenant inscrito. Verificar dónde se resuelve actor y cuándo se reclama runId.

**Criterio de salida.** Cada fila de la matriz de rutas llega a un solo productor de stream bajo la identidad esperada.

**Superficies de partida.** [Fuente, blob 503e0c7e2bab](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/agent.ts) · [Prueba de referencia, blob 97882a023a9c](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/trans02-candidate-routing.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/01-consolidacion/PATCHSETS.md)

[Índice de la campaña](../README.md)
