# AgntiaPro — infraestructura de inteligencia distribuida

AgntiaPro es una plataforma generalista para compilar y operar empresas diferentes sobre un mismo sustrato cognitivo y operativo. LAIA es una interfaz conversacional de esa infraestructura, no el sistema completo. AgntiaPro Demo es una instancia de referencia y dogfooding, no el dominio del núcleo.

## Leer primero: arquitectura e invariantes del fundador

La etapa actual cierra la **consciencia operativa sintética**: mecanismos de conocimiento, interpretación, gobierno y ejecución que sostendrán las futuras aplicaciones empresariales. No se presupone consciencia subjetiva. La inferencia LLM es probabilística; las decisiones de autoridad, transiciones y ejecución deben estar gobernadas por contratos deterministas.

**LLM propone, kernel valida y autoriza, runtime ejecuta.**

| Componente | Responsabilidad arquitectónica objetivo |
|---|---|
| Fast LLM | Conversar, comprender el contexto conversacional y comunicar; no elaborar propuestas operativas ni ejecutar herramientas. |
| LAIA, Marcos y otros roles | Interfaces narrativas especializadas mediante prompts, RAG y fine-tuning cuando corresponda. No son agentes autónomos ni runtimes independientes. |
| Slow LLM | Observar, comprender, relacionar, interpretar y elaborar propuestas estructuradas, incluidas cards y propuestas operativas. |
| JEV | Clasificación y evaluación semántica; no concede autoridad de ejecución. |
| Kernel | Invariantes, permisos, validación y autorización de propuestas. |
| Runtime | Ejecutar operaciones autorizadas y producir resultados y evidencias. |
| Bus | Distribuir acontecimientos con identidad, causalidad y trazabilidad. |
| Grafo y RAG | Organizar relaciones y recuperar conocimiento autorizado. |
| Attention vectors | Seleccionar conocimiento pertinente para el contexto. |
| Cards y memorias | Representaciones persistentes, versionadas, con metadata, procedencia y estado epistémico; reutilizables más allá de la UI. |
| Metacognición | Observar y reorganizar conocimiento sobre los propios procesos cognitivos. |
| Observabilidad | Trazabilidad transversal de los circuitos operativos y cognitivos. |

### Circuitos complementarios

- Operativo: interacción humana → registro/contextualización de la intención → circuito de observación y propuesta Slow → validación y autorización del kernel → ejecución por el runtime → receipts y acontecimientos.
- Cognitivo: acontecimientos y evidencias → grafo/bus y observación Slow → interpretación y evaluación JEV → propuestas de cards → validación/proyección y biblioteca de conocimiento → selección por atención → contexto inyectado en Fast → comunicación al humano.

Son circuitos conceptuales, no una afirmación de que todos los enlaces estén ya implementados o certificados. Fast puede recoger y comunicar una petición humana sin convertirse en su autoridad propositiva. Los roles pueden narrar lo que hizo el sistema, pero no deben inventar ejecuciones ni delegaciones sin evidencia.

Las cards pueden encapsular observaciones, hipótesis, patrones y estructuras cognitivas reutilizables (incluidas representaciones tipo skill). No son necesariamente elementos visuales ni código ejecutable. Las memorias episódica, semántica, procedimental, autobiográfica y de trabajo conservan conocimiento con procedencia; una interpretación no adquiere por sí sola categoría de hecho verificado ni permiso de ejecución.

### Alcance de la etapa actual

Core, kernel, runtime, bus, grafo, vectores de atención, cards y metadata, metacognición, memorias, RAG, Slow, JEV, Fast, observabilidad, voz y visión; middleware de ciberseguridad existente como superficie de integración y certificación.

Fuera de alcance: desarrollar agentes especializados, nuevos SOPs empresariales, dominios, ontologías empresariales y brancheado de UX. La ontología cognitiva de cards no debe confundirse con las futuras ontologías de cada empresa. Las capacidades y SOPs existentes pueden servir de pruebas del sustrato sin especializarlo para la demo.

## Coordinación de ingeniería

La campaña de referencia es [convergencia operativa 12×4](https://github.com/uniscrolliabrain-cloud/agente/tree/campaign/convergencia-operativa-12x4/docs/convergencia-operativa-12x4). Sus documentos deben reconciliarse con esta aclaración del fundador y el código real; no se modifican automáticamente por este README.

- Trans01: kernel, runtime, autoridad y causalidad.
- Trans02: Cognition e inteligencia distribuida.
- Trans03: proveedores, puertos y adaptadores.
- Trans04: infraestructura, observabilidad y certificación.

Comprobar las referencias activas y su capitalización en GitHub antes de trabajar. No confundir ramas históricas con ramas autorizadas.

Cada campaña técnica se contrasta con la canónica y el código real de la rama objetivo y de integración. Preservar capacidades existentes; identificar blobs, contratos, consumidores y wiring antes de diseñar patchsets. Exigir diffs concretos, pruebas positivas, negativas y de recuperación, y rollback. Objetivo de calidad superior a 9/10. Los macroturnos deben permitir ejecución autónoma hasta las barreras autorizadas, sin paradas conversacionales entre pasos; los bloqueos reales se documentan y se continúa el trabajo independiente seguro. Los cambios de arquitectura canónica requieren participación y aprobación del fundador.

## Referencia técnica existente

Las secciones siguientes conservan la información técnica e histórica del README anterior. Las referencias a campañas, ramas activas, cifras de tests, instrucciones de patchsets y estado multi-tenant pertenecen a esa etapa histórica y **no constituyen certificación del estado actual**. Verificar contra el código, CI y protocolo de la campaña vigente. En particular, Cognition V2 puede bloquear el modo compartido hasta certificar RLS; no inferir que todo el sistema está certificado por activar una variable.

## Stack

- Node >= 22
- pnpm 11.x
- TypeScript strict
- Hono 4.11
- Zod
- AG-UI / @copilotkit/runtime
- PGlite (dev) / Postgres (prod, pgvector + RLS)
- Docker (computer del agente, opcional)

## Estructura

apps/server - API HTTP + worker + kernel
apps/web - frontend React
packages/domain - tipos y schemas Zod
packages/workspaces - catalogo de workspaces
packages/integrations - Stripe, PDF, Google
docs/audits - auditorias profundas
docs/miniaudits - miniaudits por campana
tests - E2E e integracion

## Instalacion

pnpm install

Copiar .env.example a .env. Minimo:

WORKSPACE_MODE=sample
PORT=8787
HOST=127.0.0.1
DATA_DIR=.agente

Live: DATABASE_URL, AGENTE_ACCESS_KEY, TOKEN_ENCRYPTION_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.

## Comandos

- pnpm dev - API + worker en desarrollo
- pnpm typecheck - tsc --noEmit en todos los paquetes
- pnpm test - tests de integracion
- pnpm build - build de produccion
- pnpm beta:smoke - smoke test

Typecheck por paquete: pnpm --filter @agente/server exec tsc --noEmit
Test por fichero: pnpm test -- tests/tenant-isolation.test.ts

## Variables clave

- WORKSPACE_MODE: sample | live
- DATABASE_URL: si se pasa, usa Postgres real; si no, PGlite
- MULTI_TENANT_SHARED=true: multi-tenant en un solo Postgres (activa RLS)
- FAST_LLM_* / SLOW_LLM_*: modelos fast (chat) y slow (tareas)
- GEMINI_API_KEY / OPENROUTER_API_KEY: atajos para Google/OpenAI
- COMPUTER_ENABLED=true: activa el computer Docker
- STRIPE_API_KEY, WHATSAPP_*: integraciones
- BACKUP_INTERVAL_HOURS, BACKUP_RETENTION_DAYS: backups
- TENANT_CACHE_TTL_MS: TTL de cache de membership
- WORKER_MAX_ACTIVE, WORKER_MAX_PER_OWNER, WORKER_LEASE_MS: worker
- TASK_TIMEOUT_MS: timeout duro por tarea
- LOG_LEVEL, LOG_SAMPLE_RATE: logging

## Estado multi-tenant (Campana 1)

Rama activa: feat/multitenancy-campaign.

Fases cerradas:

- Fase 0: reconocimiento, ID-MAP.md
- Fase 1: TenantScopedStore (tenantId:owner)
- Fase 2: TenantService + assertNotHardcodedTenantId
- Fase 3: rate limit transversal + logContext.tenantId
- Fase 4: RLS transaccional + tenantId en body + auditoria cross-tenant + X-Tenant-Id

Fases pendientes (campana1-fase5.txt a fase9.md):

- Fase 5: default residual + runTenantBackup + computerIdentity(tenantId)
- Fase 6: metricas por tenant, rate limit browser/computer, notificaciones
- Fase 7: membresias, F04.10b/c/d, F04.11
- Fase 8: N06 (Config.multiTenantShared), opcional
- Fase 9: cierre y limpieza

Marcas Fase 4 verificadas:

- TENANT_RLS_TX_V1 (db-rls.ts)
- RLS_REQUIRED_IN_SHARED_V1 (index.ts)
- AUDIT_STORE_TENANT_V1 (store-store.ts)
- APP_TENANT_REQUEST_VALIDATE_BODY_V1 (app.ts)
- TENANT_CROSS_AUDIT_V1 (admin-routes.ts)
- RESPONSE_TENANT_HEADER_V1 (app.ts)
- TENANT_BODY_VALIDATE_V1 (admin-routes.ts, admin-tenants.ts)
- TENANT_RATE_LIMITER_WIRE_V1 (app.ts)

## Arquitectura

### Kernel cognitivo

Kernel.openTurn() abre turno, Kernel.appendThought() escribe, Kernel.closeTurn() cierra. Turnos y thoughts se persisten por tenantId. El kernel es opcional (KERNEL_NONFATAL).

### Tareas durables

AgentService.createTask() encola. TaskWorker reclama con lease + CAS, ejecuta, checkpointa, reintenta con backoff. Si falla persistentemente, va a DeadLetterQueue.

### Multi-tenant

TenantScopedStore compone clave tenantId:owner. TenantService resuelve tenantId con cache TTL. En MULTI_TENANT_SHARED=true, assertNotHardcodedTenantId rechaza default fuera del fallback y withTenantRls envuelve queries en store.transaction + set_config para RLS.

### Event bus

EventBus.emit() escribe a StoreSink, publica a subscribers, opcionalmente deduplica con dedupeKey. Consumidores: audit, metrics, notifications, ReactionEngine.

### Computers (Docker)

ComputerService gestiona un contenedor por owner, sin red, sin privilegios, /workspace persistente. Comandos 30s, output 128 KB, ficheros 256 KB.

## Tests

~165 tests fallan de forma preexistente (browser, auth, agent-api, ZodError en bus). NO es regresion de Fase 4. Campana de limpieza pendiente post Fase 9.

tests/tenant-http-e2e.test.ts es untracked, no commiteado, falla. Referencia para Fase 6.

## Convenciones

Ramas:

- feat/multitenancy-campaign: campana activa
- main: produccion

Marcas: cada patchset anade <MARCA>_V<n> | <fecha> | applied en un comentario. Nunca se quitan.

Reglas para IAs (documento en raiz: REGLAS POWERSHELL v3 - PROMPT UNICO PARA LAS 10.txt):

- Un bloque PowerShell por patchset. Sin && ni ; como separador. Sin exit. Sin Move-Item para escribir.
- Assert-MatchCount antes de .Replace().
- File.Replace con try/catch y fallback a Copy-Item.
- Backup en .tmp/patchset-backups/.
- Typecheck: distinguir errores de worker.ts (preexistentes) de nuevos. Si hay nuevo, revertir.
- No commitear, no git add, no git push. Eso lo decide el humano.
- No tocar worker.ts, service.ts, conversation.ts, tests/*, _multitenant_pendientes.md.

## Handoffs y estado

- HANDOFF-FASE5-9.md
- docs/miniaudits/07-aislamiento-multi-tenant/ESTADO-REAL-MULTITENANT.md
- docs/miniaudits/07-aislamiento-multi-tenant/ID-MAP.md
- docs/miniaudits/07-aislamiento-multi-tenant/missed/_multitenant_pendientes.md

## Repomix

pnpm dlx repomix --include apps/server/src/**,packages/domain/src/**,packages/workspaces/src/**,docs/miniaudits/07-aislamiento-multi-tenant/**/*.md,docs/audits/**/*.md,.github/workflows/ci.yml --output repomix-campaign07-fases5-9.md

Adjuntar README.md + HANDOFF-FASE5-9.md + repo tree.txt + REGLAS POWERSHELL v3...txt.

## Licencia

Privado. uniscrolliabrain-cloud.
