# Contrato transversal obligatorio

LLM propone, sistema dispone. Kernel autoridad única; runtime determinista ejecuta SOPs/skills; bus append-only con correlationId/causationId, schemaVersion, tenant y actor; proyecciones y grafo verificables; cinco memorias con procedencia; fast independiente de slow; slow observa y propone, nunca autoriza. Deny-by-default, fail-closed, leases/fences, idempotencia, outbox/inbox, retry acotado, DLQ, replay, rollback. No duplicar rutas ni adaptadores activos. No cambiar contratos por conveniencia de un mock. No secretos en repo, logs o prompts. No modificar UX ni owner demo. No afirmar PASS sin comando, SHA, entorno y evidencia.

Cada bloque: leer código vivo y AGENTS.md; inventariar paths exactos y dependencias antes de editar; registrar patchsets y migraciones; implementar en rama canónica con commits pequeños; ejecutar typecheck y tests afectados, después suite global y gates de aislamiento; reportar diferencias, riesgos y rollback. Si falta cuenta/API/secret, puerto real verificado + stub fail-closed y ticket OWNER_ACTION; nunca inventar readiness.

## Wiring obligatorio para los 48 bloques

Aplicar [WIRING-INTELIGENCIA-DISTRIBUIDA.md](WIRING-INTELIGENCIA-DISTRIBUIDA.md) como gate transversal de cada fase y pasada. Ninguna capacidad se considera integrada hasta demostrar su circuito de ejecución, observación, evidencia y contexto autorizado para Fast.
