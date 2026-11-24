# Handoff de ejecución

# Contrato transversal obligatorio

LLM propone, sistema dispone. Kernel autoridad única; runtime determinista ejecuta SOPs/skills; bus append-only con correlationId/causationId, schemaVersion, tenant y actor; proyecciones y grafo verificables; cinco memorias con procedencia; fast independiente de slow; slow observa y propone, nunca autoriza. Deny-by-default, fail-closed, leases/fences, idempotencia, outbox/inbox, retry acotado, DLQ, replay, rollback. No duplicar rutas ni adaptadores activos. No cambiar contratos por conveniencia de un mock. No secretos en repo, logs o prompts. No modificar UX ni owner demo. No afirmar PASS sin comando, SHA, entorno y evidencia.

Cada bloque: leer código vivo y AGENTS.md; inventariar paths exactos y dependencias antes de editar; registrar patchsets y migraciones; implementar en rama canónica con commits pequeños; ejecutar typecheck y tests afectados, después suite global y gates de aislamiento; reportar diferencias, riesgos y rollback. Si falta cuenta/API/secret, puerto real verificado + stub fail-closed y ticket OWNER_ACTION; nunca inventar readiness.

Orden: pasada completa 01, después 02, 03 y 04. Cada fase tiene cuatro bloques; no avanzar si falla un gate obligatorio. Las dependencias que necesitan observabilidad o seguridad se preparan temprano y se certifican antes de activar efectos reales. El cierre físico de ramas se difiere hasta conservar SHA, equivalencia, PR, evidencia y rollback; no borrar ramas UX/demo. No merge a main ni deploy sin aprobación. Usar lockfile y versiones existentes; verificar pnpm y scripts reales. No crear otra arquitectura paralela.

Reporte por bloque: SHA base/final, archivos, comandos y salida, PASS/FAIL/SKIP/BLOCKED, riesgos, owner actions, rollback, siguiente bloque. Un auditor diferente debe revisar las pasadas 03 y 04. 