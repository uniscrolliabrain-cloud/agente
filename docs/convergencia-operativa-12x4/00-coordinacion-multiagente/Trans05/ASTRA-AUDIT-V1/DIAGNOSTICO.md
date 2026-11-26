# Trans05 · El identificador de una card decide si el selector llega a evaluarla

La continuidad longitudinal depende de que una restricción humana siga siendo recuperable. El store elige la revisión más alta por id y limita las filas ordenándolas por id. El ranking de pertinencia solo actúa sobre las filas que ya entraron en esa ventana.

**Evidencia.** Dos corpus sintéticos tenían el mismo actor, permisos, doce distractores y una card nueva que coincidía exactamente con la consulta. Con maxRefs=1, la card `a-anchor` ganó. Con el id `z-anchor` ganó el distractor `m-0`. En ambos casos se podía resolver el ancla directamente.

**Impacto.** Una conversación puede perder una referencia pertinente por la grafía de su id, incluso si acaba de publicarse. El resultado observado mide la cobertura del selector en PGlite. La calidad en conversaciones reales sigue sin medirse en este ensayo.

[Código examinado](https://github.com/uniscrolliabrain-cloud/agente/blob/b6e2b386fee212379894a9a22c6c82f20b59c015/apps/server/src/engine/cognition/v2/storage.ts#L173) · [Evidencia del ensayo](https://github.com/uniscrolliabrain-cloud/agente/blob/b6e2b386fee212379894a9a22c6c82f20b59c015/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans05/ASTRA-AUDIT-V1/EXPERIMENTO-VENTANA-ANCLAS.md)

## Corregir un episodio impide regenerar su memoria autobiográfica

En PGlite generé una memoria autobiográfica a partir de un episodio en revisión 1. Repetir la operación devolvió el mismo recibo. Después corregí el texto del episodio y comprobé que el contexto ya servía la revisión 2. Al regenerar la autobiografía, el almacén devolvió `EVENT_ID_CONFLICT`. La nueva propuesta incluye la evidencia corregida, pero reutiliza el identificador del evento anterior porque la identidad de la autobiografía solo incorpora el actor y los identificadores de los episodios.

[Derivación de la memoria](https://github.com/uniscrolliabrain-cloud/agente/blob/6eb2bfdcd7a0560a9ea23e960e200db81acb4952/apps/server/src/engine/cognition/v2/memory.ts#L47) · [Comprobación del evento](https://github.com/uniscrolliabrain-cloud/agente/blob/6eb2bfdcd7a0560a9ea23e960e200db81acb4952/apps/server/src/engine/cognition/v2/storage.ts#L72)
