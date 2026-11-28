# Informe de convergencia final — Trans00–Trans06 en una rama

**Fecha:** 2026-11-28 · **Rama:** `converge/trans00-core` @ `9340cbc4` · **Estado:** convergido, mergeado en `main` @ `6df1cb56` y con **9 de 10 criterios** cumplidos.

> `main` está incorporado en la rama (merge commit `ac6363b2`, 0 conflictos), el gate orquestado pasó
> **10/10** con **PostgreSQL 17.12 nativo** activo y el PR **#37** se mergeó en `main` con el merge
> commit `6df1cb56`. El rollback se ensayó en seco. No hay tag ni despliegue: nada de esto publica ni
> toca producción.

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
| **Orquestador `scripts/gate-report.ts`** | **GATE OK · 10/10 steps · 319,5 s** en `9340cbc4`, con PostgreSQL 17.12 nativo activo |
| `typecheck` raíz / `typecheck:worker` | OK 10.0 s / OK 1.1 s |
| Siete auditorías (`AUDIT_CHECKS`) | **7/7 exit 0** · layers 0 violaciones · bridges 16/16 · anchors 0 rotos · contracts 318 OK / 9 pending / 0 huérfanos · idempotency 222 duplicadas / 0 huérfanas / 181 repetidas · tenant-default 0 prohibidas · console **24 ocurrencias** (advisory) |
| Suites focales de campaña | 142 (T01) + 116 (T02) + 14 (T03) + 43 (T04) + 12 (T05) + 36 (T06) + 12 (readiness) |
| **Suite completa del gate** | **1.194 tests, 1.177 PASS, 0 FAIL, 12 SKIP, 5 TODO**, 294 s, exit 0 |

La suite completa la ejecutó el gate orquestado sobre `tests/**/*.test.ts`: **1.194 tests, 1.177 PASS,
0 FAIL, 12 SKIP, 5 TODO, 294 s**, exit 0, con `COGNITION_TEST_POSTGRES_URL` y `TEST_DATABASE_URL`
apuntando a un PostgreSQL 17.12 nativo. Frente a la corrida de `ac6363b2`
(1.193/1.163/0/**25**/5) hay **14 PASS más y 13 SKIP menos**: es trabajo de este turno, no una regresión.
De los 12 SKIP restantes, 11 son e2e de campaña 3 marcados `TODO` por fixtures de modelo y kernel, y 1
es `computer_command`, que necesita `ComputerService`; ninguno es infraestructura ausente.

El primer intento del gate orquestado falló **1/10** en `typecheck:worker`: `apps/worker/node_modules/
typescript` no existía porque las dependencias se habían instalado con npm y no con pnpm workspaces. Se
resolvió con `corepack pnpm install --frozen-lockfile` (6.2 s) y el gate pasó 10/10 **sin relajar ningún
check**.

Evidencia: [`EVIDENCIA-GATE-FINAL.json`](../Trans00/EJECUCION/EVIDENCIA-GATE-FINAL.json) y los logs del
gate en `Trans07/EJECUCION/EVIDENCIA/logs/gate-orquestado/` (`report.json`, `summary.txt`, `test.log`,
`typecheck*.log`) con sus sha256.

---

## 5. PostgreSQL 17

Criterio #3: **cumplido**. El sandbox no tenía `postgres` ni `docker`, así que se levantó un
**PostgreSQL 17.12** nativo con binarios embebidos (`@embedded-postgres/linux-x64`), `initdb` en
`/tmp/pgdata` y servidor en `127.0.0.1:55432` con la base `cognition_test`.

| Puerta | Antes | Ahora |
|---|---|---|
| `COGNITION_TEST_POSTGRES_URL` (10 SKIP de Trans02: journal humano, workers concurrentes, RLS, backfill, cuotas, receipts, VOICE/cyber por rol) | 10 SKIP | **83/83 PASS, 0 SKIP** |
| `TEST_DATABASE_URL` (2 SKIP de Trans01: cursor de replay y orden de commit) | 2 SKIP | **2/2 PASS, 0 SKIP** |

No se presentan como PASS los 12 SKIP que quedan: 11 e2e de campaña 3 pendientes de fixtures y 1 de
`ComputerService`.

Evidencia: `Trans07/EJECUCION/EVIDENCIA/logs/trans07-postgres17-suites.log`
(`e06647df…`) y `.../gate-orquestado/trans01-replay-postgres.log` (`e620953b…`).

---

## 6. Matriz y ledger

[`MATRIZ-REQUISITOS.json`](MATRIZ-REQUISITOS.json): **30 requisitos** → 9 `INTEGRATED`,
18 `IMPLEMENTED_TESTED`, 1 `DOCUMENTED_ONLY`, 1 `LIVE_UNVERIFIED`, **0 `BLOCKED`**, 1 `NOT_RUN`.
Los dos `BLOCKED` que había (`T02-05` concurrencia con PostgreSQL y `T05-02` retención/borrado
longitudinal) quedaron cerrados: el primero con PostgreSQL 17.12 real, el segundo con
`LongitudinalMemory.purge` y su test.

El ledger **no se toca**: sigue 288 bloques con **0 `DONE`**. La matriz manda sobre el ledger; no se
promueve ningún bloque porque un turno no cubre 12 fases × 4 pasadas.

---

## 7. Criterios de certificación (§6 del documento de Trans07)

| # | Criterio | Estado |
|---|---|---|
| 1 | `main` incorporado sin divergencia | **sí**: merge `ac6363b2`, 146 archivos, 0 conflictos, 0 detrás |
| 2 | Gate integral verde y reproducible | **sí**: GATE OK 10/10 en 319,5 s, con log y sha256 versionados |
| 3 | SKIP PostgreSQL resueltos o declarados | **resueltos**: 12 SKIP cerrados contra PostgreSQL 17.12 (0 FAIL) |
| 4 | Matriz de requisitos completa | **sí** (30 requisitos) |
| 5 | Ledger coherente | **pendiente**: 0/48 DONE intacto |
| 6 | Proveedores con estado explícito | **sí**: `LIVE_UNVERIFIED` |
| 7 | Secretos fuera del repo y de logs | **sí**: preflight con nombres, 0 valores |
| 8 | PR revisado y autorizado | **hecho**: [#37](https://github.com/uniscrolliabrain-cloud/agente/pull/37) mergeado en `main` como `6df1cb56`, con el CI del PR en verde (`unit`, `web`, `worker`, Vercel) |
| 9 | Rollback probado en seco | **sí**: `git revert -m 1 6df1cb56` en worktree desechable, 0 conflictos, árbol revertido idéntico a `e496dd43` |
| 10 | Documentación de límites | **sí**: este informe |

Falta sólo el **#5** (ledger). Aun así el estado de producto es `LIVE_UNVERIFIED`: certificar no es
vender, y ningún vertical es vendible sin sondas vivas ni recorrido del owner.

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
reversión, nunca con force-push.

**Ensayado en seco el 2026-11-28** (criterio #9): worktree desechable sobre `6df1cb56`,
`git revert -m 1 --no-commit 6df1cb56` → **0 conflictos**, 300 archivos, `+1147 / −34357` (inverso exacto
del merge); `git write-tree` devuelve `f1029256…` y `6df1cb56^1^{tree}` devuelve `f1029256…`:
**el revert restaura exactamente `main @ e496dd43`**. Después `git revert --abort` y
`git worktree remove`, sin push ni force-push.
Log: `EVIDENCIA/logs/trans07-rollback-dryrun.log` (`208e1bb3…`).

---

## 10. Estado y siguiente acción

Hecho en este turno, con tu autorización:

1. **Merge de `main`** en `converge/trans00-core`: `ac6363b2`, 146 archivos, 0 conflictos, rama **0 detrás**.
2. **Gate orquestado** `node --import tsx scripts/gate-report.ts`: **GATE OK · 10/10 · 319,5 s** con
   PostgreSQL 17.12 nativo, evidencia versionada.
3. **PR abierto**: [#37](https://github.com/uniscrolliabrain-cloud/agente/pull/37) — 300 archivos,
   +34.357 / −1.147, 105 commits. No se han reutilizado #32/#34 (rama superada) ni #33/#35/#36 (cerrados
   sin merge).
4. **Merge del PR**, autorizado: #37 mergeado en `main` como `6df1cb56` (`merged_by` la cuenta
   propietaria) tras el CI del PR en verde. `main` ya contiene la convergencia completa.

5. **PostgreSQL 17.12 nativo** (cierre de este turno): 10 SKIP de Trans02 y 2 de Trans01 resueltos,
   85/85 PASS, 0 SKIP. Criterio #3 cumplido.
6. **Retención y borrado por tenant** (`T05-02`): `LongitudinalMemory.purge` con tres criterios
   excluyentes, acotado a la identidad; 13/13 en `trans05-*`.
7. **Rollback ensayado en seco** (criterio #9): `git revert -m 1 6df1cb56` → 0 conflictos, árbol
   idéntico a `e496dd43`, abortado y limpiado, sin push.

Lo que queda y sigue sin hacerse:

- **`main` verde tras el merge**: comprobado. `release gate (main only)` sobre `6df1cb56` terminó en
  `success` a las 01:08:08Z (typecheck, `pnpm test` y `release-check.ts` en verde).
- **Criterio #5 (ledger)**: 288 bloques siguen con **0 `DONE`**; reconciliarlos exige 12 fases × 4 pasadas,
  no un pase de suites.
- **12 SKIP restantes**: 11 e2e de campaña 3 con `TODO` de fixtures de modelo/kernel y 1
  `computer_command` que requiere `ComputerService`. Son código de test pendiente, no infraestructura.
- **Proveedores `LIVE_UNVERIFIED`** y **`07-owner-real` `NOT_RUN`**: hacen falta credenciales de prueba y
  datos reales antes de vender cualquier vertical
  (ver [`PLAN-VERTICALES-Y-VENTA.md`](PLAN-VERTICALES-Y-VENTA.md)).
