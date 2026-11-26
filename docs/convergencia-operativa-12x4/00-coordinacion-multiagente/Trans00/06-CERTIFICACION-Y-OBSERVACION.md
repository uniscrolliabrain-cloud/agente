# Gate transversal y observación cognitiva — D-M1

Objetivo: hacer el sistema observable y fiable antes de intentar optimizar su inteligencia. No cambiar ontología, propagación, pesos, criterios epistémicos ni núcleo axiomático solo por tener métricas. Usar los productores/consumidores, ids y hooks ya existentes. No exponer contenido cognitivo privado a Grafana. Las trazas operativas referencian evidencia local autorizada, no la sustituyen.

## 14 circuitos mínimos de integración (todos NOT_RUN en Trans00)

| Circuito | Dueño de aceptación | Condición y negativos |
|---|---|---|
| 1 Intención humana→Slow→propuesta→kernel→runtime→receipt | 01+02 | no herramienta Fast, aprobación revisión exacta, deny |
| 2 Receipt→bus→grafo→Slow→card | 01+02 | receipt falso, accepted no delivered, unknown no verified |
| 3 Card→atención→snapshot→Fast | 02 | query/budgets/watermark y frío/caliente coherentes; referencias exactas |
| 4 Corrección humana→invalidación→nuevo contexto | 02+05 | revisión vieja no se sirve; conservar histórico |
| 5 Revocación fuente/membership/consent→derivados y stream | 02+03 | dependencias reales, cita omitida, no fuga entre actores |
| 6 Efecto ambiguo→reconciliación | 01+03 | crash, commit unknown, late response, no resend |
| 7 Evento duplicado→dedupe→proyección | 01+02 | un efecto, conflict mismo ID/payload distinto, filtro replay |
| 8 Conversación larga→anchors→skill→brief→Fast | 05+02 | cambio orden/id, corrección y thread, no segundo selector |
| 9 Transformación multiescala→evaluación→propuesta | 06+01 | hipótesis no permiso; unknown vs cero; experimental off igualdad |
| 10 Compilación→artefacto declarativo→operación gobernada | 01+04+05 | infraestructura y fixtures, no dominio nuevo, no auto apply |
| 11 Slow/JEV caídos→Fast/runtime independientes | 02+04 | no fallback cruzado, quota/neutral breaker |
| 12 Recovery/replay/restore | 01+04 | backup coherente, audit chain, outbound off, two-process fences |
| 13 Tenant/actor aislados | 04+02+01 | runtime nonowner NOSUPERUSER NOBYPASSRLS, A/B tenant y A/B actor, no scope leakage |
| 14 Observabilidad y evidencia release | 04 | no contenido/PII/secretos, p99 overflow, alertas reales, gate parcial no PASS |

Responsable de aceptación puede incluir varios revisores; escritor de archivo sigue único según 03. Circuito 1 representa dirección objetivo, no wiring certificado. Un receipt de trabajo Slow no verifica resultado empresarial. Los estados de transport/decision/business/cognitive job no se confunden.

## Instrumentación mínima, sin nuevo bus ni nuevo sistema de almacenamiento cognitivo

- Bus: seq/correlation/causation, schemaVersion, tipo, committed/unknown, cursor consumidor, lag, dedupe y DLQ. Medir hueco/no coverage honesto, retención y replay. No usar timestamp como prueba de orden de commit.
- Kernel/runtime: propuesta, revisión, decisión admitida/denegada, operación/attempt/fence, receipt family, resultado y razón tipada. Identidad/PII solo almacenamiento interno autorizado.
- Slow/JEV: job, política/versión, refs de entrada y digest, clasificación y estado epistémico, proposed/admitted/rejected/revoked, reason code. No exportar prompt, razonamiento privado, texto crudo ni credenciales. JEV no certifica ni autoriza.
- Grafo/cards: id/revision y arista exacta local, source/event causality, aceptación, revocación, projection cursor, dedupe/coverage. Medir latencia por fase; no afirmar que toda arista representa conocimiento útil.
- Attention/serving: snapshot id, watermark, budgets y versión scorer/serializer, candidatos elegibles/seleccionados/truncados, exclusiones por categoría acotada, ledger reserve/rendered/ACK. ACK servidor no equivale a recepción humana. No etiquetar métricas externas con card ids, tenant, actor, queries o contenido; trazabilidad local protegida.
- Voz: session/epoch local, snapshot realmente servido, interrupción, receipt de generación distinto de reproducción. Sin claves en cliente ni transcripts exportados.
- Grafana/OTLP: trazas y métricas de operación con atributos permitidos y cardinalidad acotada; correlation ID opaco si política permite, vínculo local para inspección autorizada. H01–03 no bloqueantes, caída collector no cambia efecto. No duplicar exportadores, medir overhead.
- Inicialmente fixtures y sample, luego dogfooding autorizado. En observación real, estudiar cobertura, saliencia, propagación, correcciones, falsos conflictos, coste, latencia, ciclos; las métricas no deciden autoridad. No activar nuevo núcleo axiomático, ni ajustar pesos o fine-tune sin dataset/holdout y revisión founder.

## Evidencia y comandos

Verificar package.json real y Node/pnpm del runner. Candidatos existentes: pnpm typecheck; ALLOW_NETWORK=0 pnpm test:cognition-v2; pnpm gate; pnpm verify:slice; pnpm gate:cognition-v2. ALLOW_NETWORK=0 es una variable, no prueba de aislamiento de red; usar entorno hermético/sandbox real. Gate CI conservar web/integration/worker hasta equivalencia verificada; nunca retirar pruebas para verde. Correr suites focalizadas antes de full, sin solapar suites que compitan por DB. Registro: SHA exacto, clean incl untracked, comando, start/end, exit, backend, roles, discovered/pass/fail/skipped/todo, log redacted y digest. Un partial report válido no cumple full gate. No sumar suites solapadas. Un test sintético no acredita proveedor. PostgreSQL owner no certifica RLS, SET LOCAL ROLE no certifica login runtime. Restore solo en entorno desechable/outbound disabled, validar DB Supabase + archivos + claves existentes + outbox antes de permitir efecto.

## Decisiones de certificación

DEV_PASS, BLOCKED_EXTERNAL, NOT_RUN, FAIL, INTEGRATED_PASS (solo alcance y SHA demostrados), RELEASE_CANDIDATE, GO (autorización founder específica tras gates). Ninguno se infiere de docs, nota 9+, credenciales presentes o test aislado. D-M1 todos los circuitos NOT_RUN, funcional NO_GO. No afirmar producción lista. 
