# 05D. Migrar las referencias antiguas

Fase 05 · Documentos y RAG preparado. Correspondencia con P08 de la especificación original.

Crear una fixture con referencias históricas y actuales al mismo contenido. Deshabilitar preparación nueva a mitad del backfill y reanudar con checkpoint. Contar duplicados visibles por actor y medir tiempo hasta invalidación.

**Criterio de salida.** El rollback conserva procedencia y deja como máximo una representación elegible por revisión autorizada.

**Superficies de partida.** [Fuente, blob 1c90540fe0af](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/rag.ts) · [Prueba de referencia, blob 3c661f5f8925](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-rag.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/05-google/PATCHSETS.md)

[Índice de la campaña](../README.md)
