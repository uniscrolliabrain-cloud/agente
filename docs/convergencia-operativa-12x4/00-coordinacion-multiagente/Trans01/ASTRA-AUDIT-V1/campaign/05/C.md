# 05C. Contrastar el retorno de cada adaptador

Fase 05 · Google y documentos. Correspondencia con V02–V06 de la especificación original.

Ejecutar con respuestas controladas los slices de Gmail, Calendar, Drive y conexión Google. Seguir el resultado desde WorkspaceService hasta la card y cotejar qué entidad ha quedado realmente observada. La prueba de Places termina en candidato.

**Criterio de salida.** El texto de salida y el receipt reflejan la misma operación y revisión.

**Superficies de partida.** [Fuente, blob 1299d51bf999](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/actions.ts) · [Prueba de referencia, blob b501bd6ae44e](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/vertical-slice-gmail.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/05-google/PATCHSETS.md)

[Índice de la campaña](../README.md)
