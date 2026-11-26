# 11D. Invalidar derivados de varios niveles

Fase 11 · Revisiones longitudinales y memorias. Correspondencia con P04, P13 de la especificación original.

Construir cadena episodio, agregado, skill y brief. Corregir el episodio y probar lectura del viejo snapshot antes de ejecutar limpieza asíncrona. Repetir con el mismo actor en otro tenant.

**Criterio de salida.** Ningún derivado obsoleto entra en una nueva respuesta y el historial permitido conserva la revisión que originó la corrección.

**Superficies de partida.** [Fuente, blob 0e94f73cce3d](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/memory.ts) · [Prueba de referencia, blob 292fc0307018](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-memory-attention.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/11-recompilacion/PATCHSETS.md)

[Índice de la campaña](../README.md)
