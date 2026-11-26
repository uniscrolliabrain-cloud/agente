# Trans06 · El orden de dos referencias equivalentes altera la medida de atención

La comparación de atención del kernel debería dar el mismo valor al reordenar una lista de coincidencias. El esquema acepta las grafías ACME y entity:acme en el mismo vector. attentionOverlap las trata como equivalentes y empareja la primera coincidencia disponible.

**Evidencia.** Se validó con attentionVectorSchema un vector con pesos 0,95 y 0,05 para esas dos grafías. Comparado consigo mismo dio 1. Al invertir únicamente el orden de las dos entradas del segundo vector, dio 0,05263. Ambas entradas y sus pesos permanecían idénticos.

**Impacto.** El segundo valor cae por debajo del umbral 0,3 de Meta.detectAttentionConflict y puede clasificar una permutación como conflicto. La discrepancia se verificó en la función. No se acreditó una alerta visible en producción. Los axiomas futuros descritos por el fundador siguen abiertos y quedan fuera de este hallazgo.

[Código examinado](https://github.com/uniscrolliabrain-cloud/agente/blob/78d8199d6537df8470eb0686f2f052b2a6c00215/apps/server/src/kernel/graph/attention.ts#L39) · [README general](https://github.com/uniscrolliabrain-cloud/agente/blob/19e78b055948796865d2af815e7219eae78d646e/README.md) · [Consumidor Meta](https://github.com/uniscrolliabrain-cloud/agente/blob/78d8199d6537df8470eb0686f2f052b2a6c00215/apps/server/src/kernel/observers/meta.ts#L150)
