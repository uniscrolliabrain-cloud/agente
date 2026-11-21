# C00 · Preflight y snapshot · 2026-11-21

Base de campaña `3023637d72994460b1aa4742f558557ec0c69922` (origin/main). Handoff `114c1c60e9e810e493a35dfcefdb09683ad2757a`. Checkout inicial limpio en la rama del handoff. Un único worktree visible, `/workspace/agente`, con remoto `origin` en GitHub. Se verificaron 19 ramas remotas, 651 commits alcanzables y cinco tags: `pre-limpieza-2026-10-25` y `v0.2.0-beta.2` a `v0.2.0-beta.5`. Los worktrees de otros entornos quedan fuera de esta observación.

Fuentes: cinco documentos de coordinación, workflow Deploy, configuraciones Fly, Dockerfile, informe móvil y auditoría del scaffold de voz. GitHub mostró 16 PRs. El #16 sigue abierto en borrador desde `18ee1c1` contra `3023637`.

CI en main: ejecución [44763859319](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44763859319), success. CI del PR: [44834661610](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44834661610), success. El [gate de despliegue](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44898256365/job/136828446600) sobre `18ee1c1` completó instalación congelada, typecheck, 874 aprobadas, 0 fallos, 21 omitidas, 5 TODO y auditoría de coherencia 7/7. El gate se constató en los logs de GitHub.

Decisión por archivo: únicamente evidencia bajo este directorio. Sin patches funcionales. El rollback de esta campaña consiste en revertir su commit documental. GO para arqueología de solo lectura. NO_GO para cambios en el chat mientras se confirma el estado activo en los proveedores y la procedencia de la demo privada. Véase [procedencia](DEPLOY-PROVENANCE.md).
