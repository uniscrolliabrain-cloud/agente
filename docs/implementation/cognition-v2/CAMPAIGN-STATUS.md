# Estado real C00–C15

Ninguna fila PARTIAL/BLOCKED equivale a PASS de campaña. Las decisiones externas no ocultan el trabajo de ingeniería que aún falta.

| Campaña | Estado | Evidencia / límite |
|---|---|---|
| C00 | PARTIAL_BASELINE | SHAs, inventario, callgraph, matriz y pruebas ejecutadas; no auditoría exhaustiva de todas las superficies/proveedores. |
| C01 | PARTIAL_IMPLEMENTED | Schemas strict y adapter explícito; falta backfill/corpus de migración y cierre total del catálogo. |
| C02 | PARTIAL_IMPLEMENTED | Journal/cursor/inbox/fence/retry/DLQ y tx reales probados; RLS de tablas pasa con rol restringido, falta integración compartida extremo a extremo y retención/rebuild operacional completo. |
| C03 | PARTIAL_IMPLEMENTED | Proyección de referencias/revisiones, consultas autorizadas y revocación; consolidación semántica avanzada y escala no certificadas. |
| C04 | PARTIAL_IMPLEMENTED | Cinco tipos funcionales y RAG real preparado, aislamiento/TTL/revocación; cobertura/recall a escala y políticas de retención pendientes. |
| C05 | APPROVED_DESIGN / PARTIAL_IMPLEMENTED | Fundador aprueba ocho familias, seis polos/tres pares y diez dimensiones. Contratos/registro/revocación/Slow/proyección/contexto integrados; faltan ablaciones, calidad y escala. |
| C06 | PARTIAL_IMPLEMENTED | Scoring versionado, selección persistida y hints de resultados durables; calibración multiagente y todos los metacognitive rules pendientes. |
| C07 | PARTIAL_IMPLEMENTED | Jobs/output/Thought/Card recuperables, cancelación y errores; proveedor real/costes y todas las etapas de extracción avanzada no certificadas. |
| C08 | BLOCKED_EXTERNAL | Puerto y baseline rules operativos. Identidad/API/SDK JEV no verificados; no integración fingida. |
| C09 | PARTIAL_IMPLEMENTED | Revisiones y ledger separados, lease/fence/render/ACK/restart/revoke probados; worker de recuperación y auditoría probado en Postgres; retención/operación prolongada y migración masiva pendientes. |
| C10 | PARTIAL_IMPLEMENTED | Facade/snapshot/delta/refs y RAG fuera de Fast; tokenizer de proveedor, todos los collectors y pruebas a escala pendientes. |
| C11 | PARTIAL_IMPLEMENTED | Fast/Slow sin fallback cruzado, admisión/cuotas/circuitos y cancelación independientes; herramientas de negocio V2 y métricas/coste reales pendientes. |
| C12 | PARTIAL_IMPLEMENTED | Journey factual y SVG accesible en UI real comprobados; polling con cursor/reconexión/dedupe probado en Chromium; todos los estados de negocio y auditoría WCAG integral pendientes. |
| C13 | BLOCKED_EXTERNAL | Coordinador durable + adaptador al mismo Fast, 4 tests locales; sandbox/media/ACK físico/DPA y frontend avatar no activados. |
| C14 | PARTIAL_IMPLEMENTED | SDK Python real, ACK añadido en hijo, bridge+relay+contexto probados; broker/PDP/delegaciones y jobs/piloto real no configurados. |
| C15 | NO_GO | Revisión y pruebas locales aportan evidencia parcial. Integrado en `main` por autorización explícita del fundador con gate 10/10, sin desplegar. No aceptación integral, legacy retirado ni founder GO. |

El fundador aprobó explícitamente la ontología propuesta el 16 de noviembre (decisión founder-20261116-card-ontology-001). La API oficial y sandbox de JEV continúan pendientes; su ausencia no se oculta con un adaptador ficticio.
