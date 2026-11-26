# 06D. Probar consistencia bajo publicación

Fase 06 · Fixtures de atención y contexto. Correspondencia con P02, P09 de la especificación original.

Ejecutar la barrera entre latest y lectura de cursor con un segundo evento más relevante. Repetir con revocación, aumento de maxRefs y aumento de maxTokens. Medir diferencias entre selección caliente y fría.

**Criterio de salida.** El watermark identifica los datos efectivamente leídos y la caché no conserva un subconjunto recortado por una petición anterior.

**Superficies de partida.** [Fuente, blob 84d17ebc6eec](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/context.ts) · [Prueba de referencia, blob c78c805dbb8c](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/trans02-attention.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/06-data-sintetica/PATCHSETS.md)

[Índice de la campaña](../README.md)
