# Macro Audit MetaRepo

> v1 · 2026-10-04 · Estado: current

Auditoria completa del repositorio por 25 ramas. Cada rama tiene su
propio folder con tres documentos:

- `miniaudit.md` — que tiene, que le falta, como se interrelaciona, riesgos, tipo de fixes.
- `roadmap.md` — plan tecnico. **Placeholder por ahora.**
- `fixes.md` — 50 fixes concretos. **Placeholder por ahora.**

## Las 25 ramas

Cada rama toca un aspecto del sistema. Estan numeradas de lo que todo
depende a lo que depende de todo.

| # | Rama | Que es |
|---|---|---|
| 01 | tests | Suite de tests, cobertura, casos raros |
| 02 | observabilidad | Logs, metricas, tracing, alertas |
| 03 | resiliencia | Retry, backoff, circuit breaker, dead letter |
| 04 | multi-usuario-concurrente | Locks, avisos, conflictos entre usuarios |
| 05 | motor-tareas-durable | Leases CAS, heartbeat, checkpoint |
| 06 | aprobaciones-acciones | Hash, idempotencia, outcome_unknown |
| 07 | aislamiento-multi-tenant | TenantScopedStore, RLS, fugas |
| 08 | bus-de-eventos | EventBus, dedupe, SSE |
| 09 | kernel-cognitivo | Thought, Turn, Promoter, Meta, Presenter |
| 10 | fast-slow-llm | Dos velocidades LLM, cuotas, fallback |
| 11 | chat-con-llm | Prompt, tono, tools, RAG |
| 12 | contexto-memoria | MemoryService, ContextEngine, RAG/IDF |
| 13 | ui-servida-viewspec | Resolver, spec, panel contextual |
| 14 | templates-reales | 7 templates React |
| 15 | frontend-react | App, hooks, virtualizacion, a11y |
| 16 | autenticacion | Login, sesiones, OIDC |
| 17 | seguridad-basica | CSP, HSTS, dependencias, rate limit |
| 18 | deploy-infra | Docker, compose, runbook |
| 19 | backups-restore | Backup, retention, restore probado |
| 20 | computer-sandbox | Docker aislado, cuotas, telemetria |
| 21 | browser-worker | Playwright aislado, self-healing |
| 22 | google-drive-gmail | OAuth, Gmail, Calendar, Drive |
| 23 | whatsapp-stripe-gmb | Integraciones externas |
| 24 | business-os-goals | Goal, Plan, Execute, Verify, Replan |
| 25 | docs-operativos | Runbook, glosario, FAQ |

## Los tres fixes prioritarios

Segun la lectura del repo, los tres problemas mas grandes son:

1. **Presenter no wireado al SSE.** El kernel observa pero no dirige. El chat
   emite fullResponse directo.
2. **service.ts monolito con bugs vivos.** createTask cuenta por owner,
   escalateTask TOCTOU, systemContextCache sin limpieza.
3. **Multi-tenant es deuda activa.** scan globales filtrados en memoria.

Estos tres van primero. El resto, por orden de impacto.

## Como se lee esto

- `miniaudit.md` es la fuente de verdad del estado de cada area.
- `roadmap.md` se rellena cuando se decide atacar la rama.
- `fixes.md` se rellena cuando se decide que 50 fixes concretos la cierran.
