# Vertical slice WhatsApp

Webhook autenticado, dedupe, contacto, hilo, recepción, clasificación, respuesta aprobada, entrega y estado; plantillas y ventana de conversación según proveedor.

## Superficies candidatas (confirmar contra código)
routes, integrations, SOPs, bus, workers, workspace projections

## Gate específico
Firma, replay, orden, idempotencia, opt-in, revocación, entrega fallida y receipt; no enviar a terceros sin autorización.

# Contrato transversal obligatorio

LLM propone, sistema dispone. Kernel autoridad única; runtime determinista ejecuta SOPs/skills; bus append-only con correlationId/causationId, schemaVersion, tenant y actor; proyecciones y grafo verificables; cinco memorias con procedencia; fast independiente de slow; slow observa y propone, nunca autoriza. Deny-by-default, fail-closed, leases/fences, idempotencia, outbox/inbox, retry acotado, DLQ, replay, rollback. No duplicar rutas ni adaptadores activos. No cambiar contratos por conveniencia de un mock. No secretos en repo, logs o prompts. No modificar UX ni owner demo. No afirmar PASS sin comando, SHA, entorno y evidencia.

Cada bloque: leer código vivo y AGENTS.md; inventariar paths exactos y dependencias antes de editar; registrar patchsets y migraciones; implementar en rama canónica con commits pequeños; ejecutar typecheck y tests afectados, después suite global y gates de aislamiento; reportar diferencias, riesgos y rollback. Si falta cuenta/API/secret, puerto real verificado + stub fail-closed y ticket OWNER_ACTION; nunca inventar readiness.

## Cuatro pasadas
- [01-scaffold-docu](01-scaffold-docu/README.md)
- [02-coding-audit-transversal](02-coding-audit-transversal/README.md)
- [03-reaudit-refactoring](03-reaudit-refactoring/README.md)
- [04-reaudit-hardening](04-reaudit-hardening/README.md)

## Ajuste de auditoría contra código vivo (24-11-2026)

packages/integrations/src/stubs/whatsapp.ts no es solo stub: WhatsAppClient llama Evolution API y distingue OutcomeUnknownError; configured requiere API key, base URL e instance. app.ts monta webhook y rutas autenticadas. No reintentar envíos ambiguos sin reconciliar proveedor. Verificar si Evolution es canal elegido o migrar explícitamente a Cloud API; no imponer contratos de Meta a Evolution sin verificar.

Estado: inspección estática; confirmar HEAD y ejecutar gates durante la campaña.
