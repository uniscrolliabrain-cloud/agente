# Trans06 · El orden de dos referencias equivalentes altera la medida de atención

La comparación de atención del kernel debería dar el mismo valor al reordenar una lista de coincidencias. El esquema acepta las grafías ACME y entity:acme en el mismo vector. attentionOverlap las trata como equivalentes y empareja la primera coincidencia disponible.

**Evidencia.** Se validó con attentionVectorSchema un vector con pesos 0,95 y 0,05 para esas dos grafías. Comparado consigo mismo dio 1. Al invertir únicamente el orden de las dos entradas del segundo vector, dio 0,05263. Ambas entradas y sus pesos permanecían idénticos.

**Impacto.** El segundo valor cae por debajo del umbral 0,3 de Meta.detectAttentionConflict y puede clasificar una permutación como conflicto. La discrepancia se verificó en la función. No se acreditó una alerta visible en producción. Los axiomas futuros descritos por el fundador siguen abiertos y quedan fuera de este hallazgo.

[Código examinado](https://github.com/uniscrolliabrain-cloud/agente/blob/78d8199d6537df8470eb0686f2f052b2a6c00215/apps/server/src/kernel/graph/attention.ts#L39) · [README general](https://github.com/uniscrolliabrain-cloud/agente/blob/19e78b055948796865d2af815e7219eae78d646e/README.md) · [Consumidor Meta](https://github.com/uniscrolliabrain-cloud/agente/blob/78d8199d6537df8470eb0686f2f052b2a6c00215/apps/server/src/kernel/observers/meta.ts#L150)

## El observador declara inactividad antes del umbral del tenant

Con un pensamiento `ready` y 2000 ms desde la última actividad de Fast, `Meta.evaluate` emitió `slow_ready_fast_idle` tanto con `fastIdleMs=1000` como con `fastIdleMs=60000`. En el segundo caso faltaban 58 segundos para el umbral configurado. La conversación pasa la configuración al crear `Meta`, pero el observador compara con 1000 ms fijos. Además, esa llamada de conversación omite la hora de última actividad, lo que satisface por sí solo la condición de inactividad.

[Configuración y llamada](https://github.com/uniscrolliabrain-cloud/agente/blob/9e4dee6e8adbcac1016d89959723286a1e0c596c/apps/server/src/engine/conversation.ts#L1306) · [Condición del observador](https://github.com/uniscrolliabrain-cloud/agente/blob/9e4dee6e8adbcac1016d89959723286a1e0c596c/apps/server/src/kernel/observers/meta.ts#L102)

## La consolidación confunde a dos autores del mismo tipo

Dos trabajadores distintos del mismo tenant y turno registraron la misma observación. Con identificadores de actor `uno` y `dos`, `consolidate` incluyó la segunda observación en `discarded` dentro del grupo de duplicados. La clave usa el tipo de actor y omite su identificador, por lo que el diagnóstico de consolidación pierde la distinción entre dos fuentes independientes. [consolidate.ts, línea 59](https://github.com/uniscrolliabrain-cloud/agente/blob/e07fb13dad32f02400d006383e5813d7d5bd3545/apps/server/src/kernel/graph/consolidate.ts#L59)

## El promotor escribe dos veces lo que declara haber deduplicado

Pasé a `Promoter.promote` dos observaciones idénticas del mismo autor y conté las llamadas a `memory.remember` con un receptor local. El resultado anunció un superviviente tras deduplicar, devolvió dos identificadores en `survivors` y en `destinations.memory`, e invocó dos veces al receptor. El resumen cuenta la lista deduplicada, mientras que la escritura itera sobre los destinos originales. [promote.ts, línea 248](https://github.com/uniscrolliabrain-cloud/agente/blob/e07fb13dad32f02400d006383e5813d7d5bd3545/apps/server/src/kernel/graph/promote.ts#L248) · [promote.ts, línea 326](https://github.com/uniscrolliabrain-cloud/agente/blob/e07fb13dad32f02400d006383e5813d7d5bd3545/apps/server/src/kernel/graph/promote.ts#L326)
