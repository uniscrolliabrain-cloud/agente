# Informe de convergencia final — Trans00–Trans06 en una rama

**Fecha:** 2026-11-28 · **Rama:** `converge/trans00-core` @ `a843ddfc` · **Estado:** preparado, **no publicado**.

> No se ha hecho merge a `main`, ni PR, ni tag, ni despliegue. Trans07 § Autorización exige permiso
> explícito del operador para publicar; sin él, este turno prepara y entrega.

---

## 1. Congelación

[`ACTA-CONGELACION.md`](../Trans00/EJECUCION/ACTA-CONGELACION.md): base `892061c9`, `main` `e496dd43`,
HEAD `a843ddfc` → **100 adelante / 32 detrás**. Node `v24.22.1`, pnpm `11.19.0`, lockfile
`1c2851bc…`. Sin PostgreSQL ni Docker en el runner.

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
| `tsc --noEmit` raíz | exit 0 |
| `tsc --noEmit` worker | exit 0 |
| Siete auditorías (`AUDIT_CHECKS`) | **7/7 exit 0** · layers 0 violaciones · bridges 16/16 · anchors 0 rotos · contracts 318 OK / 9 pending / 0 huérfanos · idempotency 222 duplicadas / 0 huérfanas / 181 repetidas · tenant-default 0 prohibidas · console **24 ocurrencias** (advisory) |
| Suites focales de campaña | 142 (T01) + 116 (T02) + 14 (T03) + 43 (T04) + 12 (T05) + 36 (T06) + 12 (readiness) |
| **Suite completa del gate (≈1.173 pruebas)** | **NO EJECUTADA**: el lote excede el límite de 5 min del runner |

El criterio #2 de certificación exige gate integral reproducible con log versionado. **No se cumple**,
y por eso este informe **no certifica** la convergencia: la deja preparada.

---

## 5. PostgreSQL 17

`postgres` y `docker` no existen en el runner. Los **10 SKIP** de Trans02 (journal humano, workers
concurrentes, RLS, backfill concurrente, VOICE/cyber por rol restringido) siguen siendo SKIP. No se
presentan como PASS. Criterio #3: **no cumplido**.

---

## 6. Matriz y ledger

[`MATRIZ-REQUISITOS.json`](MATRIZ-REQUISITOS.json): **29 requisitos** → 5 `INTEGRATED`,
17 `IMPLEMENTED_TESTED`, 1 `DOCUMENTED_ONLY`, 1 `LIVE_UNVERIFIED`, 3 `BLOCKED`, 2 `NOT_RUN`.

El ledger **no se toca**: sigue 288 bloques con **0 `DONE`**. La matriz manda sobre el ledger; no se
promueve ningún bloque porque un turno no cubre 12 fases × 4 pasadas.

---

## 7. Criterios de certificación (§6 del documento de Trans07)

| # | Criterio | Estado |
|---|---|---|
| 1 | `main` incorporado sin divergencia | **no**: ensayado, no mergeado (falta autorización) |
| 2 | Gate integral verde y reproducible | **no**: suite completa no ejecutada |
| 3 | SKIP PostgreSQL resueltos o declarados | **declarados**, no resueltos |
| 4 | Matriz de requisitos completa | **sí** (29 requisitos) |
| 5 | Ledger coherente | **pendiente**: 0/48 DONE intacto |
| 6 | Proveedores con estado explícito | **sí**: `LIVE_UNVERIFIED` |
| 7 | Secretos fuera del repo y de logs | **sí**: preflight con nombres, 0 valores |
| 8 | PR revisado y autorizado | **no**: no creado |
| 9 | Rollback probado en seco | **no**: sin merge no hay commit que revertir |
| 10 | Documentación de límites | **sí**: este informe |

Sin los diez, el estado de producto es `LIVE_UNVERIFIED` aunque todo lo focal esté verde.

---

## 8. Riesgos del merge real

| Riesgo | Severidad | Mitigación ya preparada |
|---|---|---|
| Workflow de CI que llega de `main` | Media | revisión humana del único archivo `.github/workflows` antes de mergear |
| Gate rojo tras el merge | Alta | ejecutar gate **después** del merge, no antes |
| PR gigante sin revisión real | Media | matriz por requisito + informes por campaña ya publicados |
| Pérdida de trabajo de `main` | Alta | merge commit, **nunca** rebase de rama publicada |
| SKIP leídos como cobertura | Alta | 10 SKIP listados con motivo en cada evidencia |

## 9. Rollback (documentado, no ensayado)

```bash
# en una rama de reversión, nunca force-push a main
git revert -m 1 <merge_commit>
```

No se puede ensayar en seco sin un merge real: declarado como criterio #9 no cumplido.

---

## 10. Siguiente acción que requiere autorización

1. Autorizar el merge de `origin/main` en `converge/trans00-core` (merge commit; 0 conflictos
   previstos, 146 archivos).
2. Ejecutar el gate integral en un runner con tiempo suficiente (o por tandas versionadas) y publicar
   `EVIDENCIA-GATE-FINAL.json` con log y sha256.
3. Abrir **un** PR de convergencia a `main` con la matriz, los informes y el rollback. No reutilizar
   #32/#34 (rama superada) ni #33/#35/#36 (cerrados sin merge).

Nada de esto se ha hecho por iniciativa propia.
