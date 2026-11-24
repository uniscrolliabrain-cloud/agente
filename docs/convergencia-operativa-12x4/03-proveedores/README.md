# Activación cognitiva y conectores

Fast y Slow independientes; JEV clasificación semántica con egress; ElevenLabs STT/TTS y Anam avatar; Composio como registro de capacidades OAuth gobernadas. Adaptadores live/stub y kill switches.

## Superficies candidatas (confirmar contra código)
engine/cognition/v2, voice-v2, connector registry, config, routes

## Gate específico
Verificar contratos oficiales y SDK antes de implementar; token efímero, consentimiento, epoch, barge-in, cuotas, receipts, pruebas mock y sandbox autorizado; fast nunca espera slow.

# Contrato transversal obligatorio

LLM propone, sistema dispone. Kernel autoridad única; runtime determinista ejecuta SOPs/skills; bus append-only con correlationId/causationId, schemaVersion, tenant y actor; proyecciones y grafo verificables; cinco memorias con procedencia; fast independiente de slow; slow observa y propone, nunca autoriza. Deny-by-default, fail-closed, leases/fences, idempotencia, outbox/inbox, retry acotado, DLQ, replay, rollback. No duplicar rutas ni adaptadores activos. No cambiar contratos por conveniencia de un mock. No secretos en repo, logs o prompts. No modificar UX ni owner demo. No afirmar PASS sin comando, SHA, entorno y evidencia.

Cada bloque: leer código vivo y AGENTS.md; inventariar paths exactos y dependencias antes de editar; registrar patchsets y migraciones; implementar en rama canónica con commits pequeños; ejecutar typecheck y tests afectados, después suite global y gates de aislamiento; reportar diferencias, riesgos y rollback. Si falta cuenta/API/secret, puerto real verificado + stub fail-closed y ticket OWNER_ACTION; nunca inventar readiness.

## Cuatro pasadas
- [01-scaffold-docu](01-scaffold-docu/README.md)
- [02-coding-audit-transversal](02-coding-audit-transversal/README.md)
- [03-reaudit-refactoring](03-reaudit-refactoring/README.md)
- [04-reaudit-hardening](04-reaudit-hardening/README.md)

## Ajuste de auditoría contra código vivo (24-11-2026)

provider.ts ya implementa CopilotInferenceProvider con FAST/SLOW_LLM_PROVIDER, MODEL, API_KEY, BASE_URL; soporta openai/openrouter/anthropic/google. inference.ts ya tiene admisión durable por tenant/lane, cuotas y circuit breaker. No recrear lanes. Verificar cancelación, límites, egress y costes. JEV gate existente requiere sandbox/DPA; integrar sobre contrato vigente. Activación ordenada fast→slow→JEV→ElevenLabs→Anam; Composio independiente.

Estado: inspección estática; confirmar HEAD y ejecutar gates durante la campaña.
