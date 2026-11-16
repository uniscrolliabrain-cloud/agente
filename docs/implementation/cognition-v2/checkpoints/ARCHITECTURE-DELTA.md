# Delta de arquitectura

Checkpoint UTC: 2026-11-16T13:47:34.208372+00:00. Código auditado: [640a55db01fc9f934bf927dec53e97035f0455f3](https://github.com/uniscrolliabrain-cloud/agente/commit/640a55db01fc9f934bf927dec53e97035f0455f3). Base: [54b8d5407a8576459448c4d059a877297d18ca7a](https://github.com/uniscrolliabrain-cloud/agente/commit/54b8d5407a8576459448c4d059a877297d18ca7a). Evidencia local sintética; no certificación de producción.

| Superficie | V2 real en este checkpoint | Legacy activo / compatibilidad | Pendiente de sustitución o prueba |
|---|---|---|---|
| Kernel y contratos | Zod estricto, identidad/referencias/versiones/epistemología; captura idempotente de turnos y outcomes Slow | Kernel determinista sigue autoritativo; modelos no conceden permisos | Capacidades empresariales V2 y paridad de acciones |
| Eventos y persistencia | Conexión transaccional fijada, afterCommit, journal/cursor/inbox/leases/fencing/DLQ/replay | Bus y suscriptores antiguos siguen usados | Auditar/migrar todos los consumidores, outbox transversal y restore a escala |
| Grafo/cromos | Nodos/edges/revisiones/revocación; ontología aprobada 8 familias/6 polos/10 dimensiones | Cromos históricos conservados mientras se migran consumidores | Consolidación, entidades de dominio, ranking/calibración y cutover |
| Cinco memorias/RAG | Tipos funcionales, TTL, procedencia, recuperación y revocación; PreparedRag reutiliza RagService | engine/memory.ts y rag.ts no retirados | Consolidación completa, agentes/permisos ampliados y evaluación de retrieval |
| Atención/metacognición | Estados y hints persistentes, scoring estable versionado | Primitivas legacy siguen disponibles | Workspace multiagente global/ranking integral y validación empresarial |
| Slow/JEV | Worker durable, cancel/retry/raw-output, Thoughts/cards; clasificador determinista | Slow antiguo para flujos no migrados | W6 adaptador Typesafe/JEV separado y no activado; gateway real y ensayos con consentimiento |
| CardStore/ledger | Revisiones no one-shot, leases/fence/ACK interno y recovery | Consumidores legacy temporales | P1-01 correlación por run; ACK de cliente y retiro one-shot |
| ContextServing | Snapshots/deltas/refs/budgets, caché con query digest/policy/source watermark, invalidación | Context builder V1 en ruta por defecto | Consumidores empresariales y control global/tokenizador |
| Fast/Slow | Pools/config/circuitos/cuotas SQL separados, streaming Fast sin esperar Slow | Conversation/model-chain V1 para tenants sin allowlist | TTFT/costes reales, carga/caos, delegación gobernada y P1-02 allowlist de eventos públicos |
| Presenter/UI | Timeline de recibos reales, polling/cursor/reconexión; SVG ligero/reduced-motion | Chat V1 y UI existentes | UX empresarial completa, browser actual, WCAG integral, ACK cliente |
| Anam/ElevenLabs | Solo contratos/coordinador durable/consent/epochs/reaper y fake provider | Ninguna integración nueva real activada | SDK/contrato oficial, sesiones remotas, voz/media y barge-in físico |
| Ciberseguridad | SDK real alpha.2 hijo, ACK endpoint existente, relay durable/minimización | Middleware Python independiente; no remediaciones | PDP/broker/jobs/delegaciones reales y pruebas autorizadas de activos sintéticos |
| Auth/auditoría | Sesión -> tenant/actor, membership+usuario activo, propósito/policy revision, aislamiento focal SQL/RLS | Servicios authz/runtime existentes siguen autoridad | Roles/capacidades completas; shared RLS deshabilitado hasta prueba transversal |

Las tablas cognitivas son aditivas: rag_refs, import_plans, import_receipts, attention, chat_runs, lane_locks, lane_slots, lane_usage, slow_jobs, sequences, events, cursors, inbox, objects, edges, revocations, deliveries, delivery_recoveries y snapshots (prefijo cognition_v2_). Instalación explícita y pruebas locales; no se ejecutaron migraciones de empresas reales ni se borraron stores legacy. Voz y bridge tienen persistencia adicional propia, fuera de esta lista; deben entrar en el inventario RLS integral.

Nuevas dependencias principales: clientes directos @ai-sdk de proveedores y SDK hijo file:vendor alpha.2. No dependencia Anam/ElevenLabs/JEV añadida por adivinar un SDK. W6 usa fetch con contrato oficial. Ningún componente cognitivo es un segundo kernel.

La implementación opt-in falla cerrada en MULTI_TENANT_SHARED. En el carril V2 Fast no se conectan tools empresariales. Este corte reemplaza funciones concretas; no acredita aún sustitución integral Opción 3 ni permite retirar V1. Los documentos originales de C00–C15 se conservaron como referencia y no se contabilizan como código.

