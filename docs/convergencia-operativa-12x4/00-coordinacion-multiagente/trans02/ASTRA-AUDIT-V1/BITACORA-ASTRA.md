# Bitácora de Trans02

26 de noviembre de 2026. Captura del árbol de la rama y contraste del contrato con la implementación real. Ejecución local de las pruebas seleccionadas y comprobación del resumen del runner.

Para continuar, partir del SHA documentado en el baseline y comprobar las diferencias desde la publicación. El primer escenario pendiente se especifica en [contraste de contrato](CONTRASTE-DE-CONTRATO.md). Revisar el resto de superficies de la rama, la campaña canónica y los documentos fundacionales antes de consolidar patchsets, puntuaciones y los 48 bloques.

Se siguió el montaje real desde app.ts, makeRuntime y ConversationAgent hasta el stream y el receipt del servidor. El estudio de readSnapshot había establecido vigencia de refs, pero omitía la consistencia entre el conjunto leído y el watermark. Se reprodujeron la carrera y la reutilización de presupuesto reducido. Quedó confirmada la invalidación de una referencia supersedida. Se publican el rediseño, C1–C3 y los 48 bloques de campaña. Como siguiente comprobación transversal, contrastar el contrato de candidatos de Trans05 y la retirada de derivados antes de consolidar la especificación final.
