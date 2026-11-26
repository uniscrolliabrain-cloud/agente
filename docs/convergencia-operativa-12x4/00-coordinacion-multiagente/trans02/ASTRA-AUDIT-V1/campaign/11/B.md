# 11B. Corregir la identidad del agregado

Fase 11 · Revisiones longitudinales y memorias. Correspondencia con P04, P13 de la especificación original.

Para un conjunto de episodios crear una identidad lógica estable y una revisión de contenido derivada de referencias exactas, orden temporal y versión de política. Normalizar repetición de ids y resolver cada fuente antes de construir el agregado.

**Criterio de salida.** Una corrección de episodio crea un agregado distinto. Reordenar la entrada equivalente conserva identidad y contenido.

**Superficies de partida.** [Fuente, blob 0e94f73cce3d](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/memory.ts) · [Prueba de referencia, blob 292fc0307018](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-memory-attention.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/11-recompilacion/PATCHSETS.md)

[Índice de la campaña](../README.md)
