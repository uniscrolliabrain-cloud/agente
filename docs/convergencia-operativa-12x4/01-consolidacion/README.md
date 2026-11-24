# Consolidación transversal

Reconciliar C00–C06 y ramas backend, legal, comunicaciones y documentación. Resolver fallo CopilotKit chat undefined, cancelación C04, ownership de receipts, Postgres real y P03b. Inventariar rutas LIVE_V2/LIVE_LEGACY/SHADOW; preservar referencias y rollback.

## Superficies candidatas (confirmar contra código)
app.ts, agent.ts, engine/service.ts, engine/cognition/v2, voice-v2, migrations, tests, workflows

## Gate específico
Comparar por SHA y patch-id; tests de paridad HTTP, RLS, revocación, concurrencia, replay; no eliminar legacy hasta fase 02.

# Contrato transversal obligatorio

LLM propone, sistema dispone. Kernel autoridad única; runtime determinista ejecuta SOPs/skills; bus append-only con correlationId/causationId, schemaVersion, tenant y actor; proyecciones y grafo verificables; cinco memorias con procedencia; fast independiente de slow; slow observa y propone, nunca autoriza. Deny-by-default, fail-closed, leases/fences, idempotencia, outbox/inbox, retry acotado, DLQ, replay, rollback. No duplicar rutas ni adaptadores activos. No cambiar contratos por conveniencia de un mock. No secretos en repo, logs o prompts. No modificar UX ni owner demo. No afirmar PASS sin comando, SHA, entorno y evidencia.

Cada bloque: leer código vivo y AGENTS.md; inventariar paths exactos y dependencias antes de editar; registrar patchsets y migraciones; implementar en rama canónica con commits pequeños; ejecutar typecheck y tests afectados, después suite global y gates de aislamiento; reportar diferencias, riesgos y rollback. Si falta cuenta/API/secret, puerto real verificado + stub fail-closed y ticket OWNER_ACTION; nunca inventar readiness.

## Cuatro pasadas
- [01-scaffold-docu](01-scaffold-docu/README.md)
- [02-coding-audit-transversal](02-coding-audit-transversal/README.md)
- [03-reaudit-refactoring](03-reaudit-refactoring/README.md)
- [04-reaudit-hardening](04-reaudit-hardening/README.md)