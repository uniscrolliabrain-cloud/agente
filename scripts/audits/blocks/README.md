# Bloques pendientes de auditar

Mete aqui los bloques .ps1 que quieras revisar antes de aplicarlos.
El script `scripts/audits/anchors.ts` los lee y verifica que cada anclaje
existe en el fichero destino.

Uso:
    pnpm exec tsx scripts/audits/anchors.ts
    pnpm exec tsx scripts/audits/anchors.ts --file scripts/audits/blocks/mi-bloque.ps1

Cuando un bloque ya se aplico y esta verificado, se puede borrar de aqui.