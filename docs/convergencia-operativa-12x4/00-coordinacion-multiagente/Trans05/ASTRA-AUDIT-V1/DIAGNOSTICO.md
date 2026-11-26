# Trans05 · El identificador de una card decide si el selector llega a evaluarla

La continuidad longitudinal depende de que una restricción humana siga siendo recuperable. El store elige la revisión más alta por id y limita las filas ordenándolas por id. El ranking de pertinencia solo actúa sobre las filas que ya entraron en esa ventana.

**Evidencia.** Dos corpus sintéticos tenían el mismo actor, permisos, doce distractores y una card nueva que coincidía exactamente con la consulta. Con maxRefs=1, la card `a-anchor` ganó. Con el id `z-anchor` ganó el distractor `m-0`. En ambos casos se podía resolver el ancla directamente.

**Impacto.** Una conversación puede perder una referencia pertinente por la grafía de su id, incluso si acaba de publicarse. El resultado observado mide la cobertura del selector en PGlite. La calidad en conversaciones reales sigue sin medirse en este ensayo.

[Código examinado](https://github.com/uniscrolliabrain-cloud/agente/blob/b6e2b386fee212379894a9a22c6c82f20b59c015/apps/server/src/engine/cognition/v2/storage.ts#L173) · [Evidencia del ensayo](https://github.com/uniscrolliabrain-cloud/agente/blob/b6e2b386fee212379894a9a22c6c82f20b59c015/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans05/ASTRA-AUDIT-V1/EXPERIMENTO-VENTANA-ANCLAS.md)

## Corregir un episodio impide regenerar su memoria autobiográfica

En PGlite generé una memoria autobiográfica a partir de un episodio en revisión 1. Repetir la operación devolvió el mismo recibo. Después corregí el texto del episodio y comprobé que el contexto ya servía la revisión 2. Al regenerar la autobiografía, el almacén devolvió `EVENT_ID_CONFLICT`. La nueva propuesta incluye la evidencia corregida, pero reutiliza el identificador del evento anterior porque la identidad de la autobiografía solo incorpora el actor y los identificadores de los episodios.

[Derivación de la memoria](https://github.com/uniscrolliabrain-cloud/agente/blob/6eb2bfdcd7a0560a9ea23e960e200db81acb4952/apps/server/src/engine/cognition/v2/memory.ts#L47) · [Comprobación del evento](https://github.com/uniscrolliabrain-cloud/agente/blob/6eb2bfdcd7a0560a9ea23e960e200db81acb4952/apps/server/src/engine/cognition/v2/storage.ts#L72)

## El grafo devuelve dos veces la misma relación al recorrer dos niveles

Proyecté dos tarjetas y una sola relación `derived_from`. Desde la tarjeta derivada, `neighbors` devolvió una arista a profundidad 1 y dos entradas con idéntico identificador a profundidad 2. El recorrido visita el otro extremo y vuelve a añadir la misma arista. Contar las entradas duplica la evidencia de esa relación. [graph.ts, línea 21](https://github.com/uniscrolliabrain-cloud/agente/blob/95b6a8b5ece34ffffe72e079901c919bc2c151bb/apps/server/src/engine/cognition/v2/graph.ts#L21)

## El grafo de la revisión actual incorpora evidencia de una revisión sustituida

La revisión 1 de una tarjeta citaba a `alpha`. La revisión 2 sustituyó esa fuente por `beta`. Después de proyectar ambas, `evidence` de la tarjeta actual devolvió solo `beta`, pero `neighbors` a profundidad 1 devolvió tanto `alpha` como `beta`, junto a la tarjeta en revisión 2. Las aristas conservan su revisión de origen, pero la búsqueda de vecinos solo filtra por identificador. [graph.ts, línea 16](https://github.com/uniscrolliabrain-cloud/agente/blob/95b6a8b5ece34ffffe72e079901c919bc2c151bb/apps/server/src/engine/cognition/v2/graph.ts#L16) · [projector.ts, línea 16](https://github.com/uniscrolliabrain-cloud/agente/blob/95b6a8b5ece34ffffe72e079901c919bc2c151bb/apps/server/src/engine/cognition/v2/projector.ts#L16)
