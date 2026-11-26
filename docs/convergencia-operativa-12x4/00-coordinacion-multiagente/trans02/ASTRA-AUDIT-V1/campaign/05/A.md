# 05A. Reconstruir la identidad documental

Fase 05 · Documentos y RAG preparado. Correspondencia con P08 de la especificación original.

Distinguir id de fuente, versión indexada, id de fragmento, texto, política y puntuación dependiente de consulta. Seguir prepare, valid y el evento que escribe el fragmento en la proyección.

**Criterio de salida.** Dos consultas al mismo fragmento comparten la procedencia aunque sus puntuaciones difieran.

**Superficies de partida.** [Fuente, blob 1c90540fe0af](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/rag.ts) · [Prueba de referencia, blob 3c661f5f8925](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-rag.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/05-google/PATCHSETS.md)

[Índice de la campaña](../README.md)
