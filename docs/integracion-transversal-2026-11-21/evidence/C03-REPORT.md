# C03 · Kernel, aislamiento y Cognition V2 · 2026-11-21

Base de producto `3023637d72994460b1aa4742f558557ec0c69922`. Rama de revisión `campaign/c03-cognition`. El diff añade una regresión del bloqueo en modo compartido y este informe.

## Decisiones por rama

| Origen | Evidencia en main | Decisión |
| --- | --- | --- |
| W4 `88f4246` | `af3b16d` y pruebas de backfill | Equivalente integrado |
| W5 `33f9760` | `812ea36` y pruebas de resultados con receipts | Equivalente integrado |
| W6 `33f9760`, `1f63fa9` | `812ea36`, `403bc74` y pruebas del adaptador Jev | Equivalentes integrados |

`git cherry -v origin/main <rama>` marcó todos esos commits como equivalentes. El runtime de main conserva el backfill gobernado, el proyector de resultados y los contratos del clasificador. W5 es parte del historial de W6.

## Contratos observados

- `apps/server/src/app.ts` instancia Cognition V2 cuando `COGNITION_V2_TENANTS` contiene tenants configurados. `conversation.ts` delega al runtime según el tenant autenticado de la petición.
- `runtime.ts` exige identidad del actor, membresía vigente, usuario activo y tenant sin suspensión. El modo `MULTI_TENANT_SHARED=true` falla cerrado al crear V2 con `COGNITION_V2_SHARED_RLS_NOT_CERTIFIED`.
- `rls.ts` define la instalación de políticas con RLS forzado. Las pruebas de rol restringido son evidencia de la política en PostgreSQL sintético. La certificación del entorno compartido sigue abierta.
- `770f86e` retiró el adaptador experimental de escritura empresarial. Fast mantiene `tools: []`. La escritura requiere un camino aprobado a través de ActionService y queda fuera del cierre de esta campaña.

Fuentes: código y pruebas en main, historial W4–W6, reporte de integración C15/W11 y documentos de coordinación. Revertir el commit retira la regresión y este informe.

## Validación

- Suite V2 de main: 61 aprobadas, 0 fallos y 9 omitidas sin PostgreSQL. Con PostgreSQL 17.9 desechable en loopback: 70 aprobadas, 0 fallos y 0 omitidas. Incluye RLS con rol restringido, transacciones concurrentes, revocación y conectividad del worker.
- Tras añadir la regresión, el archivo HTTP completo pasó (2/2), incluido el flujo autenticado de revocación y aislamiento. Typecheck y coherencia (7/7) pasaron.
- Se reutilizó la instalación congelada de C02. El lockfile y los manifiestos del workspace son idénticos en ambos SHA.

GO para revisión. El código de producción permanece en la base original. La activación compartida y la escritura empresarial requieren su propia verificación y autorización.
