# Actualización de auditoría — 18 noviembre 2026

## Evidencia y alcance

Comparación de ramas GitHub y lectura dirigida de código y documentación; sin acceso a worktrees locales, sin ejecución de tests ni despliegue. Rama base documental: `docs/audit-30-dominios-runtime-20261115`. `main` no se ha modificado.

## Hallazgos priorizados

1. **P0 candidato, verificar exposición:** `apps/server/src/engine/policy/engine.ts` permite roles sin `permissions`. Seguir guards y call graph; implantar deny-by-default para efectos donde proceda.
2. **P1:** `apps/server/src/engine/execution/executor.ts` puede devolver `succeeded` con pasos `skipped`; modelar obligatoriedad y éxito empresarial.
3. **P1:** `feat/voice-avatar-scaffold` contiene código real pero puede reutilizar `ConversationAgent`; no confundir con FastConversationV2 propuesto.
4. **P1 documental:** el atlas de Marketing estaba basado en README parcial; Marketing main ya tiene código, pruebas y hardening.
5. **P2:** auditoría de 30 ángulos sigue siendo diagnóstica; requiere call graphs, gates, tests, evidencias por SHA y revisión de los otros 13 hijos.

## Ramas revisadas

- `main`
- `docs/audit-30-dominios-runtime-20261115`
- `docs/vigencia-2026-11-10`
- `feat/voice-avatar-scaffold`

No se observaron PRs abiertos en la consulta. La ausencia de worktrees visibles en GitHub no significa que no existan localmente.

## Próxima pasada documental

Actualizar cabeceras de los 30 `INFORME.md` tras contrastar cada uno con código, no copiar hallazgos genéricos. Añadir matriz `verified_in_code/documented_only/proposed/not_checked`, SHA, owner, gate y evidencias por informe. Reconciliar ramas sin sobrescribir cambios de agentes.
