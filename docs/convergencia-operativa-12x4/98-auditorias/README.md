# Auditorías de convergencia

Informes de solo lectura sobre objetos Git reales, con ejecución de pruebas en worktrees aislados.
Ningún informe de esta carpeta modifica código, ramas ni `main`.

| Fecha | Informe | Snapshot auditado | Alcance |
|---|---|---|---|
| 2026-11-27 | [`INFORME-AUDITORIA-CONVERGENCIA-2026-11-27.md`](INFORME-AUDITORIA-CONVERGENCIA-2026-11-27.md) | `integration/trans00-core` @ `892061c9`; `main` @ `e496dd43` | topología, equivalencia de parches, matriz de contenido, 332 tests focales, ledgers, proveedores, PRs y recomendación de base |

## Método

- Refresco de refs con refspec explícito (`git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune`):
  `git fetch --all` no actualizaba refs en el entorno del auditor.
- Topología con `merge-base --is-ancestor`, `rev-list --left-right --count`, `cherry`, `range-diff`,
  `patch-id` y comparación de blobs por rama.
- Pruebas en worktrees `--detach`, con `corepack pnpm install --frozen-lockfile`, para no tocar ramas.
- Suites divididas en lotes por el límite de cinco minutos por comando.

## Límites declarados

- No se ejecutó el gate integral completo (tarda más de cinco minutos y escribe `artifacts/gate/`).
- No se ejecutó la suite completa de 1.173 tests: 332 focalizados + 10 de readiness.
- No se verificó ningún proveedor en vivo (sin credenciales; prohibido usar secretos).
- No se comprobaron conflictos de merge contra `main` (prohibido mergear en la auditoría).

Cada informe incluye su propia sección de limitaciones. Un informe no es una certificación.
