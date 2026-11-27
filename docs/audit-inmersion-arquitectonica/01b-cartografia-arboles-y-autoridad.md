# Audit 01b — Árboles y autoridad documental
## Evidencia reproducible
GET /repos/uniscrolliabrain-cloud/agente/git/trees/{SHA}?recursive=1, truncated=false en los tres casos.
| SHA | blobs | TS/TSX | MD | test/spec JS/TS | convergencia |
|---|---:|---:|---:|---:|---:|
| ce032d9083ea8ee5332730d973709c442aa523a0 | 4287 | 1537 | 1694 | 208 | 0 |
| 8672f8c1035067e77de76080aabbe8d4c8030fe5 | 3300 | 1364 | 1494 | 206 | 118 |
| 9650aac71abcceef308681ab49a381d20e7584ff | 4303 | 1597 | 1713 | 265 | 46 |
Conteos por extensión, no LOC ni cobertura. Main: server 289 blobs, web 551, ui-lab 1460, workspaces 812, domain 56. Docs/miniaudits 157, implementation 79, vertical-slice-actual 44. No inferir vigencia por volumen.
## Autoridad de la campaña
Leídos completos README.md, CONTRATO-TRANSVERSAL.md y WIRING-INTELIGENCIA-DISTRIBUIDA.md en docs/convergencia-operativa-12x4/ a SHA 8672f8c. La base declarada es 12e535a264d0c4a5da17d7b049e04c82cbcc681c; estado declarado preliminar. Su objetivo es owner real AgntiaPro, excluye UX y agntia-demo; el mandato actual del fundador usa Agntia Demo como PMV. No son el mismo sujeto de certificación: separar demo sintética, dogfooding real y release comercial.
Doce fases: consolidación, observabilidad, proveedores, WhatsApp, Google, datos sintéticos, owner real, ciberseguridad, observabilidad operativa, gestoría, recompilación, validación. Cuatro pasadas: scaffold, coding, refactoring, hardening. 48 bloques no equivalen a 48 ramas.
## Hipótesis técnicas para Audit 02 (no verificadas aún en código)
WIRING declara: runtime CognitionV2Runtime.chat con persona fija y tools vacíos; atención select no usada por chat; contexto preparado TTL 60s; política shared fail-closed; SlowCognitionQueue y SemanticClassifier requieren reconciliar P03a/P03b; RuntimeOutcomeProjector.fromSlowReceipt no acredita resultado empresarial; CardDeliveryLedger no acredita recepción cliente. Cada hipótesis exige contraste con símbolos vivos en main e integración.
Matiz contractual: Fast puede formular solicitud tipada sin ejecutar herramientas ni generar propuesta operativa autorizada. Slow propone, kernel autoriza, runtime ejecuta. JEV no acredita hechos. Circuito canónico incluye receipt, bus, proyección, grafo, observación, clasificación, tarjeta/memoria y snapshot. No confundir diseño con wiring existente.
## Pendiente
Comparar ancestry y cambios de exec/Trans y Trans, leer 48 bloques y patchsets, inspeccionar repos hijos. Sin tests ni certificación. Audit 01 sigue abierta.
