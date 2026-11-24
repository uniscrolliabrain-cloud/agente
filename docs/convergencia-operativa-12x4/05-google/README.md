# Vertical slices Google

OAuth incremental; Maps búsqueda empresarial autorizada, Calendar disponibilidad y agenda, Drive archivos, Gmail lectura/respuesta, Docs creación/edición. Identidad y scopes por tenant; adapter único por capability.

## Superficies candidatas (confirmar contra código)
integrations/google, connector registry, routes, SOPs, RAG, projections

## Gate específico
Cinco slices independientes y composición Maps→lead→Gmail borrador→Calendar→Docs→Drive; validar cuotas, ACL, revocación, aprobación y efectos externos.

# Contrato transversal obligatorio

LLM propone, sistema dispone. Kernel autoridad única; runtime determinista ejecuta SOPs/skills; bus append-only con correlationId/causationId, schemaVersion, tenant y actor; proyecciones y grafo verificables; cinco memorias con procedencia; fast independiente de slow; slow observa y propone, nunca autoriza. Deny-by-default, fail-closed, leases/fences, idempotencia, outbox/inbox, retry acotado, DLQ, replay, rollback. No duplicar rutas ni adaptadores activos. No cambiar contratos por conveniencia de un mock. No secretos en repo, logs o prompts. No modificar UX ni owner demo. No afirmar PASS sin comando, SHA, entorno y evidencia.

Cada bloque: leer código vivo y AGENTS.md; inventariar paths exactos y dependencias antes de editar; registrar patchsets y migraciones; implementar en rama canónica con commits pequeños; ejecutar typecheck y tests afectados, después suite global y gates de aislamiento; reportar diferencias, riesgos y rollback. Si falta cuenta/API/secret, puerto real verificado + stub fail-closed y ticket OWNER_ACTION; nunca inventar readiness.

## Cuatro pasadas
- [01-scaffold-docu](01-scaffold-docu/README.md)
- [02-coding-audit-transversal](02-coding-audit-transversal/README.md)
- [03-reaudit-refactoring](03-reaudit-refactoring/README.md)
- [04-reaudit-hardening](04-reaudit-hardening/README.md)

## Ajuste de auditoría contra código vivo (24-11-2026)

Reutilizar apps/server/src/google-auth.ts: GoogleConnection, vault cifrado, OAuth state/PKCE, generation CAS, membership. READ_SCOPES Gmail/Calendar/Drive; WRITE_SCOPES actuales incluyen permisos amplios y WRITE_MARKER Gmail full. Auditar scopes mínimos por capacidad y compatibilidad de revocación antes de ampliar Docs; Maps es credencial/egress distinto. No crear OAuth paralelo.

Estado: inspección estática; confirmar HEAD y ejecutar gates durante la campaña.
