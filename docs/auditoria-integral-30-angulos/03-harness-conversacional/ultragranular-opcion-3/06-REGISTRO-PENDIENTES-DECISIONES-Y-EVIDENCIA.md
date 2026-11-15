# Registro de decisiones, preguntas abiertas, riesgos y evidencias
**Objetivo:** no perder lo conversado ni transformar hipótesis en supuestos de código.

## ADR-001 — Opción 3
**Decidido por fundador:** kernel autoritativo + proyecciones cognitivas asíncronas + servidor de contexto del runtime. **Razón:** aprovecha infraestructura existente, desacopla latencia, facilita evolución sin microservicios prematuros. **No implica:** desplegar Kafka, JEV o nuevos 14 repos.

## ADR-002 — JEV no juez
**Decidido:** JEV AI clasifica y realiza metacognición; sus salidas son propuestas. **Autoridad:** kernel/policy y verificación determinista. **Pendiente:** contrato definitivo de JEV y estrategia de instalación.

## ADR-003 — Slow produce tarjetas RAG
**Decidido:** Slow genera/enriquece tarjetas con metadatos; no solo planes. **Evidencia parcial:** `captureSlowCognition` ya materializa Thought→Card, pero builder clasifica por regex. **Pendiente:** metadata schema, JEV classification, index RAG, budgets.

## ADR-004 — Runtime sirve tarjetas
**Decidido:** servicio de contexto selecciona y entrega tarjetas al Fast; actualización asíncrona desde grafo/bus. **Pendiente:** contratos de snapshots, scopes, delivery ledger, invalidación y caché.

## ADR-005 — Animación SVG pedagógica
**Decidido:** cinco fases/espiral y camino para cliente pueden abstraer runtime; hechos/efectos requieren recibos. **Pendiente:** copy, tiempos y componentes definitivos tras pruebas UX. No fijar dos segundos por fase.

## ADR-006 — Tokens
**Dato conversacional:** ~1000 tokens por tarjeta. **Código actual:** 700 tokens agregados, tres tarjetas, cuerpo de 700 caracteres. **Pendiente:** distribución exacta de tokens histórica, tokenizer, budgets por voz/chat y costes. **No inventar cifras.**

## ADR-007 — Cromos y cinco memorias
**Visión:** grafo multicapa, cromos, attention vectors, cinco memorias. **Código:** cromo schema pendiente de wiring, atención matemática; **no demostradas** cinco memorias end-to-end. **Pendiente:** nombres históricos, stores, graph schema, retention y políticas.

## ADR-008 — Cyber integrado sin duplicar runtime
**Decidido:** Ciberseguridad permanece middleware Python/FastAPI + SDK TS server-only; AgntiaPro conserva tenant, SOP, policy, agentes y UX. **Pendiente:** revisión binaria de contracts.py y SDK, ingest de eventos, validación E2E.

## Riesgos priorizados
| ID | Severidad | Riesgo | Control esperado | Evidencia faltante |
|---|---|---|---|---|
| R01 | P0 | Cross-tenant en cards, graph, memory, retrieval | ACL antes de ranking, tests negativos | end-to-end |
| R02 | P0 | Subscriber live pierde eventos | cursor durable, replay, ACK | fault injection |
| R03 | P0 | `persisted:false` ignorado | fail-closed/reconciliation | call graph |
| R04 | P0 | JEV/Slow promueve instrucciones maliciosas | schema, evidence, no authority | adversarial tests |
| R05 | P0 | Cyber partial como completed | mapeo estados exacto | contrato runtime |
| R06 | P0 | Revocación no llega a sesiones Anam | invalidación, kill session | E2E |
| R07 | P1 | Consumo one-shot pierde contexto vigente | snapshot separado | regression |
| R08 | P1 | DedupeKey task oculta revisiones | source revision en ID | tests |
| R09 | P1 | Budget de tokens falso | tokenizer real | benchmark |
| R10 | P1 | Cromo policy confunde autoridad | solo metadatos | tests |
| R11 | P1 | Cinco memorias no sincronizadas | inventory + projections | wiring |
| R12 | P1 | Meta hints se repiten o pierden | scope y cursor | lifecycle tests |
| R13 | P1 | SVG implica progreso ficticio | dos tipos UI separados | UX tests |
| R14 | P2 | JEV eleva coste/latencia | async + fallback rules | mediciones |
| R15 | P2 | Grafo sobredimensionado | proyecciones incrementales | profiling |

## Evidencia que sí tenemos
**OBSERVADO EN CÓDIGO:** `capture.ts`, `card-builder.ts`, `card-store.ts`, `cognition-card.ts`, `cognition-cards.ts`, `attention.ts`, `cromo.ts`, `meta.ts`, `presenter.ts`, `promote.ts`, `consolidate.ts`, `subscribers/events.ts`, `events/bus.ts` (lectura de archivos, no ejecución).
**REPORTADO POR HIJO:** `docs/ESTADO-VIGENTE.md`, `docs/09-contrato-con-agente.md`, `docs/02-arquitectura-y-confianza.md`.
**RECUPERADO DE CONVERSACIÓN:** opción 3, JEV no juez, Slow tarjetas, runtime sirve tarjetas, UX SVG pedagógica, ~1000 tokens por tarjeta.
**NO DISPONIBLE:** export literal íntegro de conversación con reparto de tokens, pruebas E2E y mediciones HEAD, implementación final de JEV.

## Preguntas que requieren investigación, no interrumpen documentación
Q01 ¿Cuáles son exactamente las cinco memorias y sus stores? Q02 ¿Qué significa RAC literalmente y cómo difiere de RAG? Q03 ¿Cuáles eran los budgets por categoría y canal? Q04 ¿Quién escribe/lee los cromos en código actual? Q05 ¿Cuál es el call graph de Presenter y SlowAuthor? Q06 ¿Hay persistencia durable de cursor? Q07 ¿Qué implementación DB ofrece CAS? Q08 ¿Cuál es el schema exacto Python↔TS del hijo? Q09 ¿Cómo se revoca un snapshot en voz? Q10 ¿Qué eventos Cyber se emiten realmente? Q11 ¿Qué porcentaje del tiempo Fast bloquea por retrieval? Q12 ¿Qué partes de legacy deben conservarse? Q13 ¿Cuáles son los permisos de `markUseful`? Q14 ¿Cómo se calcula prioridad de tarjeta en función de actor/agent? Q15 ¿Qué herramientas de pruebas ya existen para replay y cross-tenant?

## Regla de continuidad
Antes de escribir código, actualizar este registro con respuestas respaldadas por SHA, paths y tests. Los agentes que continúen deben preservar decisiones ADR y no sustituirlas por el diagrama simplificado `Fast→Slow→Kernel`. No afirmar “listo” cuando solo existe schema. El usuario es quien aprueba implementación, merge y despliegue.

## Definition of Ready
- Baseline de `agente` y `agntia-ciberseguridad` con SHA.
- Contratos V1 inventariados y tests actuales ejecutados.
- Riesgos P0 con controles y pruebas previstas.
- Matriz de ownership y scopes por tenant.
- Patchsets por campaña con archivos reales, flags y rollback.
- Presupuesto de tokens parametrizado, no valores inventados.
- Handoff con reporte de cada fase y estado verificable.
