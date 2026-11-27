# Trans07 — Convergencia final, certificación y publicación

**Rol:** agente de cierre. No construye producto: convierte el trabajo de Trans00–Trans06 en una base
publicable con evidencia reproducible.
**Base:** `origin/integration/trans00-core` (verificar head) + `origin/main` (verificar head).
**Protocolo:** [`00-PROTOCOLO-GENERAL.md`](00-PROTOCOLO-GENERAL.md).
**Predecesores obligatorios:** Trans00 (gate reproducible, ledger reconciliado), Trans01–Trans06
(bloques con evidencia).

> **Autorización.** Todo lo que en este documento implique merge, push a `main`, tag, PR o despliegue
> requiere autorización explícita del operador. Sin ella, Trans07 prepara el trabajo, lo commitea en su
> rama y entrega el resumen. Nunca publica por iniciativa propia.

---

## 1. Misión

Cerrar la convergencia en **un solo SHA certificado**:

1. `main` incorporado, sin divergencia pendiente;
2. `infra` integrada o declarada deuda con decisión escrita;
3. gate integral reproducible desde el clon;
4. SKIP de PostgreSQL ejecutados al menos una vez;
5. matriz de requisitos con estado normalizado y evidencia enlazada;
6. ledger que refleje la realidad;
7. PR revisado a `main`, con rollback documentado.

---

## 2. Estado de partida (verificado el 2026-11-27)

| Hecho | Dato | Implicación |
|---|---|---|
| `integration/trans00-core` vs `main` | 88 adelante / 32 detrás (`892061c9` vs `e496dd43`) | hay que incorporar `main` antes de publicar |
| Contenido de `main` ausente en la base | assets, demo, `apps/ui-lab`, `apps/site` | conflicto probable en UI y assets |
| `infra/trans00-provider-readiness` | `1bb25aba`, no ancestro | trasplante por piezas (Trans00) |
| Gate integral | documentado en `9eb03fd5` (1.173 tests, 1.143 PASS, 0 FAIL, 25 SKIP, 5 TODO) | creíble, **no reproducible** (logs en `/tmp`) |
| SKIP de concurrencia | 13 en la pasada focal del auditor | requieren PostgreSQL 17 |
| Ledger | 288 bloques: 281 PENDING, 3 IN_PROGRESS, 4 NOT_RUN, **0 DONE** | ningún cierre de campaña es legítimo aún |
| PRs de campaña | #32 y #34 abiertos/draft contra `campaign/...`; #33/#35/#36 cerrados sin merge | **no reutilizar**: apuntan a rama superada |
| `main` no contiene la campaña | 0 archivos de `docs/convergencia-operativa-12x4` | el corpus documental entra con la convergencia |

---

## 3. Precondiciones (no empezar sin ellas)

- [ ] Trans00 publicó `ACTA-BASE-05.md` y `EVIDENCIA-GATE-05.json` reproducibles.
- [ ] Decisión escrita sobre `infra` (integrada o deuda aceptada).
- [ ] Trans01–Trans06 entregaron SHA evaluado y estado por bloque.
- [ ] Ledger reconciliado (288 bloques contados desde archivos).
- [ ] El operador autorizó explícitamente la fase de convergencia.

Si falta una precondición, Trans07 se detiene y lo reporta. No "avanza con lo que hay": eso produce
una certificación falsa.

---

## 4. Los 48 bloques vistos desde el cierre

| Fase | Bloques | Foco de cierre |
|---|---|---|
| `01-consolidacion` | `01.01`–`01.04` | base única, sin divergencia, con acta |
| `02-observabilidad` | `02.01`–`02.04` | métricas del gate y del despliegue |
| `03-proveedores` | `03.01`–`03.04` | matriz de proveedores con estado y config |
| `04-whatsapp` | `04.01`–`04.04` | canal declarado `LIVE_UNVERIFIED` o verificado |
| `05-google` | `05.01`–`05.04` | OAuth con scopes mínimos revisados |
| `06-data-sintetica` | `06.01`–`06.04` | fixtures deterministas en CI |
| `07-owner-real` | `07.01`–`07.04` | recorrido del owner, sin producción |
| `08-ciberseguridad` | `08.01`–`08.04` | deny-by-default, secretos, aislamiento |
| `09-observabilidad-v2` | `09.01`–`09.04` | trazas completas del recorrido certificado |
| `10-gestoria` | `10.01`–`10.04` | caso de negocio de punta a punta |
| `11-recompilacion` | `11.01`–`11.04` | build reproducible + lockfile |
| `12-validacion` | `12.01`–`12.04` | gate final + matriz de certificación |

---

## 5. Plan de ejecución

### Fase A — Congelar base y evidencia

```bash
git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune
BASE=$(git rev-parse origin/integration/trans00-core)
MAIN=$(git rev-parse origin/main)
git rev-list --left-right --count $BASE...$MAIN
```

Publicar `ACTA-CONGELACION.md` con ambos SHA, divergencia, versión de Node/pnpm, hash del lockfile y
lista de ramas relevantes. A partir de aquí, cualquier cambio de head invalida la certificación y hay
que repetir la fase.

### Fase B — Ensayo de merge con `main` (sin tocar ramas compartidas)

En un worktree desechable:

```bash
git worktree add --detach .audit/merge $BASE
cd .audit/merge
git merge --no-commit --no-ff origin/main
git diff --name-only --diff-filter=U > /tmp/conflictos.txt
git merge --abort
```

Registrar por archivo: conflicto textual, conflicto semántico (compila pero cambia comportamiento) y
decisión propuesta. Zonas previsibles de conflicto: `apps/ui-lab/**`, `apps/site/**`, assets
generados, `README.md` y `package.json`/lockfile.

**No** se hace el merge real hasta que exista autorización y un plan por archivo.

### Fase C — Trasplante de `infra`

Ejecutado por Trans00 con revisión de Trans07. Como unidad: registro de conexiones + resolución de
entorno + `scripts/trans-provider-readiness.mjs` + tests + entradas `package.json` + documentación.
Verificar con `infra:readiness`, `infra:readiness:test`, `connections` y typecheck. Comprobar que el
registro coincide con los consumidores reales (`unregistered` vacío en modo estricto).

### Fase D — Gate integral

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm typecheck
corepack pnpm gate
```

Registrar: SHA, árbol limpio antes/después, 10/10 comprobaciones, totales `total/pass/fail/skip/todo`,
duración, log versionado y SHA-256 real. El gate debe pasar **después** del merge y del trasplante, no
antes.

### Fase E — PostgreSQL 17

Ejecutar las suites de concurrencia contra una instancia desechable. Objetivo: convertir 13 SKIP en
PASS o en fallo real. Si fallan, son hallazgos, no un problema del entorno. Si el runner no tiene
PostgreSQL, la certificación queda incompleta y se declara así.

### Fase F — Matriz de certificación

Publicar `MATRIZ-REQUISITOS.json` con, por requisito: id, descripción, ruta, símbolo, SHA, tests,
resultado, estado normalizado (los 14 de §4 del protocolo), dependencia y evidencia. Debe coincidir con
el ledger; si no coincide, gana la matriz y el ledger se corrige.

### Fase G — Cierre del ledger

Solo con evidencia de la pasada correspondiente. `DONE` significa §10 del protocolo. Los bloques sin
evidencia se quedan `PENDING`, `IN_PROGRESS` o `BLOCKED`. Un `DONE` sin evidencia se revierte y se
anota.

### Fase H — PR a `main`

Requisitos del PR:

- base actualizada (main incorporado) o merge commit explícito;
- descripción con: qué entra, qué no, evidencia de gate, riesgos, rollback;
- checklist de §10 cumplido por campaña;
- **no** reutilizar #32/#34 (apuntan a `campaign/...`, superada) ni #33/#35/#36 (cerrados sin merge);
- un solo PR de convergencia, no una serie de PRs por campaña.

Merge solo con autorización del operador y revisión humana.

### Fase I — Post-merge y rollback

Tras el merge (autorizado): verificar `main` en el SHA publicado, ejecutar gate en `main`, comprobar
que el corpus documental está presente y que ningún secreto entró. Rollback documentado:

```bash
git revert -m 1 <merge_commit>     # en una rama de reversión, nunca force-push a main
```

Todo tag o release requiere autorización separada.

---

## 6. Criterios de certificación

| # | Criterio | Evidencia exigida |
|---|---|---|
| 1 | `main` incorporado sin divergencia | `ACTA-CONGELACION.md` + merge commit |
| 2 | Gate integral verde y reproducible | `EVIDENCIA-GATE-FINAL.json` + log versionado |
| 3 | SKIP de PostgreSQL resueltos o declarados | log de ejecución con PostgreSQL 17 |
| 4 | Matriz de requisitos completa | `MATRIZ-REQUISITOS.json` |
| 5 | Ledger coherente | `ESTADO-48-BLOQUES.json` ×6 recalculados |
| 6 | Proveedores con estado explícito | matriz de proveedores |
| 7 | Secretos fuera del repo y de logs | `secrets:check` + revisión |
| 8 | PR revisado y autorizado | enlace al PR + aprobación |
| 9 | Rollback probado en seco | procedimiento + commit de reversión de ensayo |
| 10 | Documentación de límites | qué **no** se certifica (producción, escala, coste) |

Sin los diez, el estado es `LIVE_UNVERIFIED` a nivel de producto, aunque el gate esté verde.

---

## 7. Qué NO hace Trans07

- No implementa features nuevas ni "aprovecha" para refactorizar.
- No cambia el alcance de las campañas para que cierren.
- No declara `DONE` bloques sin evidencia.
- No reutiliza PRs obsoletos.
- No despliega, no publica sitios, no toca producción.
- No hace force-push ni reescribe `main`.
- No oculta SKIP ni los presenta como PASS.

---

## 8. Entregables

| Archivo | Contenido |
|---|---|
| `Trans00/EJECUCION/ACTA-CONGELACION.md` | SHA base, SHA main, divergencia, versiones |
| `Trans00/EJECUCION/EVIDENCIA-GATE-FINAL.json` | gate reproducible con log versionado |
| `Trans00/EJECUCION/MATRIZ-REQUISITOS.json` | requisito → estado → evidencia |
| `Trans07/EJECUCION/INFORME-CONVERGENCIA-FINAL.md` | qué entra, qué no, riesgos, rollback |
| `Trans07/EJECUCION/ENSAYO-MERGE.md` | conflictos por archivo y decisión propuesta |
| PR a `main` | descripción, checklist, evidencia, rollback |

---

## 9. Riesgos de cierre

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Merge de `main` con conflicto semántico en UI/assets | Alta | ensayo en worktree + revisión por archivo |
| Gate verde en base pero rojo tras merge | Alta | gate **después** del merge |
| SKIP presentados como cobertura | Alta | declarar ejecución PG17 o deuda |
| PR gigante sin revisión real | Media | descripción por campaña + matriz |
| Pérdida de trabajo de `main` | Alta | merge, nunca rebase de rama publicada |
| Certificar sin probar rollback | Media | ensayo de reversión |

---

## 10. Handoff final

Trans07 termina entregando al operador: SHA certificado, evidencia enlazada, matriz de requisitos,
lista de deudas aceptadas (con dueño y fecha), y el siguiente paso concreto que requiere autorización
(merge del PR o corrección de un fallo concreto). Nada más.
