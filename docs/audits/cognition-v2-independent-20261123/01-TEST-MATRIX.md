# Matriz T01–T10

Snapshot `b59b2950ee8aff9f476d4f72c7b31a24d54d632d`. **Ningún test local se declara PASS**: el checkout privado no está disponible en el entorno de ejecución y `git ls-remote https://github.com/uniscrolliabrain-cloud/agente.git HEAD` devolvió `Could not resolve host: github.com`. El conector GitHub permite lectura y commits, no ejecutar pnpm o PostgreSQL.

| Campaña | Evidencia estática | Ejecución | Gate pendiente |
|---|---|---|---|
| T01 baseline | package y fuentes accesibles vía GitHub | BLOQUEADO | checkout, pnpm install/typecheck/test, versiones y logs |
| T02 CopilotKit | agent.ts, chat-agent.ts, runtime.ts | NO EJECUTADO | HTTP con tenants on/off, agui, roles, cancelación |
| T03 bus | app.ts EventBus + sink; workers proyección | NO EJECUTADO | idempotencia, causalidad, DLQ y multi-tenant |
| T04 Slow | slow.ts cola durable; workers.ts | NO EJECUTADO | leases, fencing, cancelación, triggers reales |
| T05 tarjetas | context.ts, ledger, runtime.ts | NO EJECUTADO | propuesta→ACK y revocación entre pasos |
| T06 kernel | captura Slow en app.ts | NO EJECUTADO | PDP/ActionService y receipts reales |
| T07 voz | voice-session-routes.ts, lifecycle y stubs | NO EJECUTADO | HTTP, concurrencia y abort |
| T08 latencia | límites fast/slow configurados | NO EJECUTADO | p50/p95 medidos; no inferir de mocks |
| T09 ramas | GitHub compare del snapshot | INSPECCIÓN COMPLETADA PARCIAL | patch-equivalence, conflictos en árbol combinado |
| T10 E2E | componentes identificados | BLOQUEADO | Postgres de prueba, fixtures y flujos completos |

CI: consulta de workflow runs asociados exactamente a `b59b2950ee8aff9f476d4f72c7b31a24d54d632d` devolvió lista vacía en el endpoint de PR-triggered runs; **no equivale a CI fallida ni a CI verde**. Consultar runs por rama y logs con IDs para verificar evidencia posterior.

Comandos recomendados para el runner del repo (no ejecutados): `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm audit:coherence` si está definido; consultar `package.json` y workflows antes de ejecutar. No utilizar producción para pruebas.
