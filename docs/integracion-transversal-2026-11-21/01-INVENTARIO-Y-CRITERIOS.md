# Inventario, trazabilidad y decisiones de ramas

## Procedimiento obligatorio de descubrimiento
Ejecutar `git fetch --all --prune --tags`, `git branch -a -vv`, `git log --all --date=iso --pretty=format:'%H|%P|%cI|%D|%s' --reverse` y `git log --all --date-order --format=...`; registrar el historial **de más reciente a más antiguo**, sin confundir fecha de autor con fecha de commit. Capturar `git worktree list --porcelain`, `gh pr list --state all`, `gh run list` y `git tag -l`. No usar `git branch -D`, `git push --delete`, `git reset --hard` ni `git push --force`.

Para **cada** rama: HEAD SHA, merge-base con main, ahead/behind, último commit, PR, autor, superficie afectada, paths, tests, dependencia de otra rama, documentación legacy/vigente, estado de despliegue y decisión: ALREADY-IN-MAIN / INTEGRATE / SELECTIVE-CHERRY-PICK / DOCS-ONLY / SUPERSEDED / HOLD / UNKNOWN. La clasificación no implica eliminación. Usar `git cherry -v main <branch>`, `git log --cherry-pick --right-only main...<branch>` y `git range-diff` cuando haya rebase o cherry-picks. Revisar merges y revertidos; no asumir que ahead=0 significa código funcional.

## Mapa inicial, NO definitivo
| Rama | Evidencia | Acción propuesta |
|---|---|---|
| main | SHA 3023637 (21/11) | Baseline actual, revalidar |
| fix/mobile-chat-sheet-keyboard-gestures | +22/-0, PR #16 | Prioridad alta: verificar SHA de demo/producción, pruebas y merge controlado |
| feat/voice-avatar-scaffold | +11/-65 | Extraer componentes selectivamente; rehacer contrato de conversación |
| feat/cognition-v2-runtime-C00-C15 | +0 respecto main | No repetir merge; verificar contenido |
| feat/cognition-v2-stepwise-001-504c0b5b | +0 respecto main | Histórica/ya integrada, comprobar |
| feat/cognition-v2-worker-reliability-504c0b5b | +0 respecto main | Histórica/ya integrada, comprobar |
| feat/cognition-v2-W4-backfill | +1/-36 | Revisar backfill, RLS, adaptador legacy y tests |
| feat/cognition-v2-W5-outcomes | +1/-34 | Revisar outcome/proyector/memorias y tests |
| feat/cognition-v2-W6-jev-contract | +2/-34 | Revisar JEV, contrato y egress; no activar live por defecto |
| audit/preflight-cognition-option3-20261115 | +57/-65 | Revisar documentación y propuestas, no merge masivo |
| wip/mobile-chat-sheet | sin comparar aquí | Revisar si superseded por fix |
| docs/2026-11-17-universal-conversation | sin comparar aquí | Recuperar especificaciones vigentes |
| feat/legal-privacy-ai-compliance | sin comparar aquí | Auditoría y gate de cumplimiento |
| docs/observability-dogfooding-audit-20261117 | sin comparar aquí | Recuperar contratos de telemetría |
| audit/update-docs-20261118 | sin comparar aquí | Consolidar vigencia documental |
| docs/doppler-auth | sin comparar aquí | Contrastar con main y CI recientes |
| docs/vigencia-2026-11-10 | sin comparar aquí | Marcar legado cuando proceda |
| docs/audit-30-dominios-runtime-20261115 | sin comparar aquí | Clasificar por dominio |
| Otras ramas/worktrees/remotas | pendientes | Inventariar sin excepciones |

## Matriz de decisión por archivo
Crear `evidence/BRANCH-MATRIX.md` y `evidence/PATCH-LEDGER.md`. Por cada patch: origen branch/SHA, ruta, motivo, versión actual main, riesgo, pruebas, destino, decisión y responsable. Si el archivo en main cambió después del patch, **reimplementar sobre main** y no sobrescribir. Si docs contradicen código, gana código ejecutable + test + SHA, con anotación de la discrepancia.

## Higiene documental
No editar ramas antiguas en masa: preservar procedencia. Añadir en la rama de integración un `LEGACY-REGISTER.md` con punteros, fecha, superseding SHA y explicación. Solo actualizar documentación de rama antigua mediante PR específico si Codex verifica que es necesario; jamás reescribir historia. No borrar ramas hasta autorización separada y confirmación de no-deploy/no-worktree/no-PR/no-referencia.
