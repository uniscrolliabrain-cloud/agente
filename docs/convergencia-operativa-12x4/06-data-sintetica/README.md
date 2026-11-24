# Repositorio de datos sintéticos

Identificar repo y licencia, fijar SHA, adaptar generadores al esquema canónico; fixtures deterministas desde fase 01; instalación completa aquí. Separar demo, test y producción.

## Superficies candidatas (confirmar contra código)
packages, fixtures, migrations, tests, CI

## Gate específico
Semillas reproducibles, integridad referencial, anonimización, reset seguro, no datos demo en tenant real.

# Contrato transversal obligatorio

LLM propone, sistema dispone. Kernel autoridad única; runtime determinista ejecuta SOPs/skills; bus append-only con correlationId/causationId, schemaVersion, tenant y actor; proyecciones y grafo verificables; cinco memorias con procedencia; fast independiente de slow; slow observa y propone, nunca autoriza. Deny-by-default, fail-closed, leases/fences, idempotencia, outbox/inbox, retry acotado, DLQ, replay, rollback. No duplicar rutas ni adaptadores activos. No cambiar contratos por conveniencia de un mock. No secretos en repo, logs o prompts. No modificar UX ni owner demo. No afirmar PASS sin comando, SHA, entorno y evidencia.

Cada bloque: leer código vivo y AGENTS.md; inventariar paths exactos y dependencias antes de editar; registrar patchsets y migraciones; implementar en rama canónica con commits pequeños; ejecutar typecheck y tests afectados, después suite global y gates de aislamiento; reportar diferencias, riesgos y rollback. Si falta cuenta/API/secret, puerto real verificado + stub fail-closed y ticket OWNER_ACTION; nunca inventar readiness.

## Cuatro pasadas
- [01-scaffold-docu](01-scaffold-docu/README.md)
- [02-coding-audit-transversal](02-coding-audit-transversal/README.md)
- [03-reaudit-refactoring](03-reaudit-refactoring/README.md)
- [04-reaudit-hardening](04-reaudit-hardening/README.md)

## Ajuste de auditoría contra código vivo (24-11-2026)

package.json ya expone demo:seed y verify:slice. Separar fixtures de test de agntia-demo protegido. Adaptar generadores al bundle existente, no cambiar schemas para acomodar datos.

Estado: inspección estática; confirmar HEAD y ejecutar gates durante la campaña.
