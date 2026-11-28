# Informe de convergencia final — Trans00–Trans06 en una rama

**Fecha:** 2026-11-28 · **Rama:** `converge/trans00-core` @ `44b68808` · **Estado:** convergido y mergeado en `main` @ `6df1cb56`.

> `main` está incorporado en la rama (merge commit `ac6363b2`, 0 conflictos), el gate orquestado pasó
> **10/10** y el PR **#37** se mergeó en `main` con el merge commit `6df1cb56`. No hay tag ni despliegue:
> nada de esto publica ni toca producción.

---

## 1. Congelación

[`ACTA-CONGELACION.md`](../Trans00/EJECUCION/ACTA-CONGELACION.md): base `892061c9`, `main` `e496dd43`,
HEAD `a843ddfc` → **100 adelante / 32 detrás** (antes del merge). Node `v24.22.1`, pnpm `11.19.0`,
lockfile `1c2851bc…`. Sin PostgreSQL ni Docker en el runner.

**Merge ejecutado:** `ac6363b2` incorpora los 32 commits de `main` (`e496dd43`) en la rama: 146 archivos,
**0 conflictos**. Tras el merge la rama queda **103 delante / 0 detrás** de `main`.

---

## 2. Ensayo de merge con `main` (sin tocar ramas compartidas)

Worktree desechable, `merge --no-commit --no-ff`, comprobación y `--abort`:

| Comprobación | Resultado |
|---|---|
| Conflictos textuales | **0** |
| Archivos que aporta `main` | 146 (`+6298 / −1597`): 122 `apps/ui-lab`, 23 `apps/web`, 1 workflow |
| `tsc` sobre el árbol fusionado | **exit 0** |
| Suites de campaña sobre el árbol fusionado | **113/113 PASS, 0 FAIL** |
| Árbol tras el ensayo | limpio |

Detalle y decisiones por área en [`ENSAYO-MERGE.md`](ENSAYO-MERGE.md). Corrección al corpus: no hay
conflicto en `apps/site` ni en assets generados; el único punto que el ensayo no puede resolver solo es
el diff de `.github/workflows`, que necesita revisión humana.

---

## 3. `infra` integrada

El trasplante de readiness ya está en la rama y se reverifica aquí, no de memoria:

- `node --experimental-strip-types scripts/trans-provider-readiness.mjs --strict` → **exit 0**,
  `unregistered` vacío.
- `--test tests/trans-provider-readiness.test.mjs` → **12/12 PASS**.
- El registro conserva `openrouter-slow`, `meta-muse` y el fallback `JEV_OPENROUTER_API_KEY`.

---

## 4. Gate: lo que sí y lo que no

| Componente | Estado |
|---|---|
| **Orquestador `scripts/gate-report.ts`** | **GATE OK · 10/10 steps · 306 s** en `ac6363b2` |
| `typecheck` raíz / `typecheck:worker` | OK 10.0 s / OK 1.1 s |
| Siete auditorías (`AUDIT_CHECKS`) | **7/7 exit 0** · layers 0 violaciones · bridges 16/16 · anchors 0 rotos · contracts 318 OK / 9 pending / 0 huérfanos · idempotency 222 duplicadas / 0 huérfanas / 181 repetidas · tenant-default 0 prohibidas · console **24 ocurrencias** (advisory) |
| Suites focales de campaña | 142 (T01) + 116 (T02) + 14 (T03) + 43 (T04) + 12 (T05) + 36 (T06) + 12 (readiness) |
| **Suite completa del gate** | **1.193 tests, 1.163 PASS, 0 FAIL, 25 SKIP, 5 TODO**, 273 s, exit 0 |

La suite completa la ejecutó el gate orquestado sobre `tests/**/*.test.ts`: **1.193 tests, 1.163 PASS,
0 FAIL, 25 SKIP, 5 TODO, 284.4 s**, exit 0. Frente a lo documentado en `9eb03fd5` (1.173/1.143/0/25/5)
hay **20 pruebas más y 0 fallos**: es el trabajo de la campaña, no una regresión.

El primer intento del gate orquestado falló **1/10** en `typecheck:worker`: `apps/worker/node_modules/
typescript` no existía porque las dependencias se habían instalado con npm y no con pnpm workspaces. Se
resolvió con `corepack pnpm install --frozen-lockfile` (6.2 s) y el gate pasó 10/10 **sin relajar ningún
check**.

Evidencia: [`EVIDENCIA-GATE-FINAL.json`](../Trans00/EJECUCION/EVIDENCIA-GATE-FINAL.json) y los logs del
gate en `Trans07/EJECUCION/EVIDENCIA/logs/gate-orquestado/` (`report.json`, `summary.txt`, `test.log`,
`typecheck*.log`) con sus sha256.

---

## 5. PostgreSQL 17

`postgres` y `docker` no existen en el runner. Los **25 SKIP** del gate (10 concentrados en Trans02:
journal humano, workers concurrentes, RLS, backfill concurrente, VOICE/cyber por rol restringido) siguen
siendo SKIP. No se presentan como PASS. Criterio #3: **declarado, no cumplido**.

---

## 6. Matriz y ledger

[`MATRIZ-REQUISITOS.json`](MATRIZ-REQUISITOS.json): **29 requisitos** → 6 `INTEGRATED`,
17 `IMPLEMENTED_TESTED`, 1 `DOCUMENTED_ONLY`, 1 `LIVE_UNVERIFIED`, 3 `BLOCKED`, 1 `NOT_RUN`.

El ledger **no se toca**: sigue 288 bloques con **0 `DONE`**. La matriz manda sobre el ledger; no se
promueve ningún bloque porque un turno no cubre 12 fases × 4 pasadas.

---

## 7. Criterios de certificación (§6 del documento de Trans07)

| # | Criterio | Estado |
|---|---|---|
| 1 | `main` incorporado sin divergencia | **sí**: merge `ac6363b2`, 146 archivos, 0 conflictos, 0 detrás |
| 2 | Gate integral verde y reproducible | **sí**: GATE OK 10/10 en 306 s, con log y sha256 versionados |
| 3 | SKIP PostgreSQL resueltos o declarados | **declarados**, no resueltos |
| 4 | Matriz de requisitos completa | **sí** (29 requisitos) |
| 5 | Ledger coherente | **pendiente**: 0/48 DONE intacto |
| 6 | Proveedores con estado explícito | **sí**: `LIVE_UNVERIFIED` |
| 7 | Secretos fuera del repo y de logs | **sí**: preflight con nombres, 0 valores |
| 8 | PR revisado y autorizado | **hecho**: [#37](https://github.com/uniscrolliabrain-cloud/agente/pull/37) mergeado en `main` como `6df1cb56`, con el CI del PR en verde (`unit`, `web`, `worker`, Vercel) |
| 9 | Rollback probado en seco | **no**: ya hay merge commit que revertir, pero no se ha ensayado |
| 10 | Documentación de límites | **sí**: este informe |

Sin los diez, el estado de producto es `LIVE_UNVERIFIED` aunque todo lo focal esté verde.

---

## 8. Riesgos del merge real

| Riesgo | Severidad | Mitigación ya preparada |
|---|---|---|
| Workflow de CI que llega de `main` | Media | revisión humana del único archivo `.github/workflows` antes de mergear |
| Gate rojo tras el merge | Alta | gate **antes** del merge (10/10) y CI del PR en verde; el workflow `release gate (main only)` corre en `main` sobre el commit de merge |
| PR gigante sin revisión real | Media | matriz por requisito + informes por campaña ya publicados |
| Pérdida de trabajo de `main` | Alta | merge commit, **nunca** rebase de rama publicada |
| SKIP leídos como cobertura | Alta | 10 SKIP listados con motivo en cada evidencia |

## 9. Rollback (documentado, no ensayado)

```bash
# en una rama de reversión, nunca force-push a main
git revert -m 1 <merge_commit>
```

Hay dos merges que se pueden revertir: `ac6363b2` (dentro de la rama) y `6df1cb56` (el merge del PR en
`main`). Para deshacer lo que ya está en `main`, el objetivo es `git revert -m 1 6df1cb56` en una rama de
reversión, nunca con force-push. **No se ha ensayado**: criterio #9 sigue no cumplido.

---

## 10. Estado y siguiente acción

Hecho en este turno, con tu autorización:

1. **Merge de `main`** en `converge/trans00-core`: `ac6363b2`, 146 archivos, 0 conflictos, rama **0 detrás**.
2. **Gate orquestado** `node --import tsx scripts/gate-report.ts`: **GATE OK · 10/10 · 306 s**, evidencia
   versionada.
3. **PR abierto**: [#37](https://github.com/uniscrolliabrain-cloud/agente/pull/37) — 300 archivos,
   +34.357 / −1.147, 105 commits. No se han reutilizado #32/#34 (rama superada) ni #33/#35/#36 (cerrados
   sin merge).
4. **Merge del PR**, autorizado: #37 mergeado en `main` como `6df1cb56` (`merged_by` la cuenta
   propietaria) tras el CI del PR en verde. `main` ya contiene la convergencia completa.

Lo que queda y sigue sin hacerse:

- **`main` verde tras el merge**: el workflow `release gate (main only)` corre en `main` sobre el commit
  de merge; comprobar su resultado es lo único que falta del lado de CI.
- **Criterio #5 (ledger)**: 288 bloques siguen con **0 `DONE`**; reconciliarlos exige 12 fases × 4 pasadas,
  no un pase de suites.
- **Criterio #3 (PostgreSQL 17)**: los 25 SKIP necesitan una instancia que este entorno no tiene.
- **Criterio #9 (rollback en seco)**: el procedimiento está escrito y ya existe el merge commit, pero no
  se ha ensayado una reversión.
