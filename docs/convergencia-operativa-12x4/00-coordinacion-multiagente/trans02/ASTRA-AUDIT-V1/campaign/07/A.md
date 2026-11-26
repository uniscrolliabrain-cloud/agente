# 07A. Inventariar roles efectivos

Fase 07 · Identidad y multitenencia. Correspondencia con P10 de la especificación original.

Separar cuenta instaladora, rol conectado por el servidor, actor de aplicación y propietario empresarial. Enumerar tablas de Cognition y módulos opcionales presentes. Verificar el rol efectivo en la conexión reservada que ejecuta la prueba.

**Criterio de salida.** El informe registra privilegios relevantes, propiedad y política RLS por tabla del despliegue estudiado.

**Superficies de partida.** [Fuente, blob cde12970d1e7](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/rls.ts) · [Prueba de referencia, blob 3a22ec1c97f2](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-rls.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/07-owner-real/PATCHSETS.md)

[Índice de la campaña](../README.md)
