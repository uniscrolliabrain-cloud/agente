# Audit 01c — Genealogía y gates
Base main ce032d9083ea8ee5332730d973709c442aa523a0. Compare API: ahead/behind.
| ref | ahead | behind | archivos MD/TS modificados desde merge base |
|---|---:|---:|---|
| campaña canónica |136|583|114/0|
| Trans01 |145|583|174/34|
| Trans02 |152|583|183/10|
| Trans03 |131|583|113/3|
| Trans04 |121|583|105/4|
| Trans05 |163|583|143/10|
| Trans06 |21|153|19/0|
| exec/Trans01 |64|29|24/142|
| exec/Trans02 |52|29|18/137|
| exec/Trans03 |39|29|12/129|
| exec/Trans04 |55|29|19/138|
| exec/Trans05 |59|29|21/140|
| exec/Trans06 |61|29|22/140|
| integration/trans00-core |65|29|25/142|
Merge base original 12e535a264d0c4a5da17d7b049e04c82cbcc681c excepto Trans06 (93236a34b2d636debb340bba70cd9c9bbf9cf441). Ejecución e integración comparten df7e0eb671e96cada3a8f7b46f7f45c99d6b1085.
## Cadena comprobada por compare entre ramas
exec/Trans03 → +13 exec/Trans02 → +3 exec/Trans04 → +4 exec/Trans05 → +2 exec/Trans06 → +3 exec/Trans01 → +1 integration/trans00-core. Todas behind=0. Último incremento exclusivamente ACTA-GATE-04.md y EVIDENCIA-GATE-04.json. No sumar cambios de las seis ramas: son acumulativos. No confundir orden de HEADs con orden conceptual de campañas.
## Evidencia declarada por ejecutor
Leídos completos ACTA-GATE-04.md e INFORME-CONVERGENCIA-EN-CURSO.md en integration@9650aac71abcceef308681ab49a381d20e7584ff, docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans00/EJECUCION/.
Gate 04 sobre b11ab2593836bc2ffe1136ed9f300bd49b69b595: 10/10 checks, 1110 PASS de 1140, 25 SKIP, 5 TODO, 0 FAIL. Fixtures sintéticos, sin PG URL ni proveedores. NOT_CERTIFIED/NO_GO. PG17 desechable 1/1 confirma rechazo factory con LOGIN restringido, no aislamiento funcional. Incrementos posteriores: extracción narrativa 11/11, TruthResolver 5/5; no gate integral del último árbol. Gate 03 histórico 1102/1131 PASS, 24 SKIP, 5 TODO. No sumar suites. Logs originales locales no accesibles en esta lectura; resultados reportados, no reejecutados.
Pendientes declarados: migraciones separadas de arranque restringido, autorización durable Slow, persistencia/serving longitudinal, escala/ablación, provisión fencing, CI/config, telemetría y circuitos; externos proveedores/audio/delegaciones. 288 estados no acreditados DONE.
## Conclusión
Integration es baseline candidato de núcleo para contrastar main, no release ni prueba de producción. Confianza alta en genealogía por API, limitada en ejecución por evidencia documental sin logs originales. No merge ni código funcional modificado. Audit 01 aún abierta: repos hijos y cartografía de producto pendientes.
