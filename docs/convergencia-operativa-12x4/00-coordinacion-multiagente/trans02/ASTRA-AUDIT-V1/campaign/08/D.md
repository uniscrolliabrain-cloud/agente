# 08D. Retirar al productor

Fase 08 · Proyección defensiva del relay. Correspondencia con P11 de la especificación original.

Revocar el principal del productor en el origen de prueba y reiniciar con backlog. Validar que el contexto existente obedece la política de conservación y que las nuevas observaciones requieren autoridad vigente.

**Criterio de salida.** La salida de Fast conserva procedencia y alcance de las evidencias admitidas antes de la retirada.

**Superficies de partida.** [Fuente, blob 81bbd950e045](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/security-v2/event-relay.ts) · [Prueba de referencia, blob 09e4e2a0427b](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-cyber-bridge.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/08-ciberseguridad/PATCHSETS.md)

[Índice de la campaña](../README.md)
