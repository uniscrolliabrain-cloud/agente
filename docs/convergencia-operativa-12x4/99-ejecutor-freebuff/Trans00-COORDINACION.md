# Trans00 — Coordinación, autoridad y gates

**Rol:** agente coordinador. No implementa producto; gobierna la evidencia y autoriza el avance.
**Base:** `origin/integration/trans00-core` @ `892061c9`.
**Documento hermano:** [`00-PROTOCOLO-GENERAL.md`](00-PROTOCOLO-GENERAL.md) — se aplica entero.
**Handoff previo:** `docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans00/HANDOFF-FREEBUFF-TRANS00-TRANS06.md`, en `origin/Trans00` @ `d455f0e6`.

---

## 1. Misión

Convertir el trabajo disperso de Trans01–Trans06 en una **base convergente certificable**, y hacerlo
sin inventar una campaña nueva. Trans00 no escribe features: fija la base, ejecuta el gate, mantiene
la contabilidad de bloques, decide el trasplante de `infra` y aprueba o rechaza el paso a `main`.

Autoridad del circuito que Trans00 hace cumplir:

> **Slow propone; el kernel valida y autoriza; el runtime ejecuta; Fast comunica.**

Trans00 es el guardián de que esa frase siga siendo cierta cuando alguien tenga prisa.

---

## 2. Estado forense al 2026-11-27 (`892061c9`)

| Hecho | Evidencia | Estado |
|---|---|---|
| Acta de arranque con autorización del founder | `Trans00/EJECUCION/ACTA-ARRANQUE.md` | `DOCUMENTED_ONLY` (es una autorización, no código) |
| Gate 03: 10/10 checks, 1.131 tests, 1.102 PASS, 0 FAIL, 24 SKIP, 5 TODO | `EVIDENCIA-GATE-03.json` @ `94e9b15d` | declarado, **no re-ejecutado** por el auditor |
| Gate 04: 10/10 checks, 1.140 tests, 1.110 PASS, 0 FAIL, 25 SKIP, 5 TODO | `EVIDENCIA-GATE-04.json` @ `b11ab259` | ídem |
| Gate Meta Muse: 10/10 checks, 1.173 tests, 1.143 PASS, 0 FAIL, 25 SKIP, 5 TODO | `EVIDENCIA-META-MUSE-CONTRIBUTOR.json` @ `9eb03fd5` | ídem; el árbol de código de `892061c9` es idéntico a `9eb03fd5` |
| Los logs del gate viven en `/tmp/...` y `/workspace/...` | H2 del informe forense | **no reproducible desde el clon** |
| Los seis ledgers suman 288 bloques y **0 DONE** | `ESTADO-48-BLOQUES.json` ×6 | `PARTIAL_IMPLEMENTATION` global |
| `infra/trans00-provider-readiness` no está integrada | `scripts/trans-provider-readiness.mjs` ausente en `integration` | `UNMOUNTED` + `IMPLEMENTED_TESTED` |
| `main` no contiene la campaña | `git ls-tree origin/main -- docs/convergencia-operativa-12x4` → 0 archivos | divergencia abierta |

**Conclusión que Trans00 debe sostener:** el gate existe y es creíble, pero **no es reproducible** con
lo versionado. Mientras eso no cambie, nadie puede certificar la base.

---

## 3. Alcance propio

Trans00 **sí** toca:

1. `docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans00/EJECUCION/*` — actas,
   evidencias, informes de gate.
2. El trasplante controlado de `infra/trans00-provider-readiness` (registro, resolver, scripts, tests).
3. La contabilidad de los seis ledgers y el acta de cierre de campaña.
4. El documento de handoff y la decisión de orden entre campañas.

Trans00 **no** toca:

- módulos funcionales de Trans01–Trans06 (los revisa, no los reescribe);
- `main`;
- secretos, Doppler, producción;
- el diseño de la arquitectura cognitiva.

---

## 4. Los 48 bloques, leídos desde coordinación

Los 48 bloques son un índice de cobertura de 12 fases × 4 pasadas (§5 del protocolo). Trans00 no los
cierra por su cuenta: verifica que cada campaña cierre los suyos con evidencia y mantiene el
denominador.

Contabilidad verificada (recontar antes de citar):

| Campaña | PENDING | IN_PROGRESS | NOT_RUN | DONE |
|---|---:|---:|---:|---:|
| Trans01 | 48 | 0 | 0 | 0 |
| Trans02 | 48 | 0 | 0 | 0 |
| Trans03 | 48 | 0 | 0 | 0 |
| Trans04 | 48 | 0 | 0 | 0 |
| Trans05 | 41 | 3 (`01.02`, `01.03`, `12.02`) | 4 (`07.01`–`07.04`) | 0 |
| Trans06 | 48 | 0 | 0 | 0 |
| **Total** | **281** | **3** | **4** | **0** |

La cifra `282` que circuló en el handoff es un error de suma corregido en el informe forense: el
denominador es 288, no 289.

---

## 5. Plan de ejecución

### Paso 1 — Fijar y publicar la base

```bash
git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune
git rev-parse --short origin/integration/trans00-core origin/main
git merge-base --is-ancestor origin/exec/Trans01 origin/integration/trans00-core && echo OK
```

Registrar en un acta nueva (`ACTA-BASE-05.md`): SHA de base, divergencia con `main`, heads de
`exec/*`, estado de `infra`, versión de Node/pnpm y hash del lockfile. Sin esto, cualquier número
posterior es incomparable.

### Paso 2 — Reproducir el gate y versionar su evidencia

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm typecheck
corepack pnpm gate          # tarda > 5 min: usar runner con tiempo suficiente
```

Producir `ACTA-GATE-05.md` + `EVIDENCIA-GATE-05.json` con:

- SHA evaluado (árbol limpio antes y después);
- las 10 comprobaciones del gate, una por una, con nombre y resultado;
- totales `total/pass/fail/skip/todo`;
- **ruta versionada** del log (no `/tmp`) y su SHA-256 real;
- comando exacto y duración.

Criterio de aceptación: otra persona clona el repo en ese SHA, ejecuta el comando escrito y obtiene
el mismo resultado. Si no, el gate no está certificado.

### Paso 3 — Decidir y ejecutar el trasplante de `infra`

`infra/trans00-provider-readiness` está en `1bb25aba`, con 11 commits sobre una base anterior a
`integration`. El último commit cablea el contrato Trans00–06 al registro de conexiones
(`scripts/lib/connections.ts`, `apps/server/src/kernel/config/env-resolver.ts`,
`docs/TRANS-PROVIDER-READINESS-AUDIT.md`, scripts `infra:readiness` y `infra:readiness:test`).

Reglas del trasplante:

1. **No** fusionar la rama completa: su base no contiene los arreglos posteriores de `integration`.
2. Portar como unidad coherente: registro de conexiones + resolución de entorno + script de
   readiness + tests offline + entradas de `package.json` + documentación.
3. Comparar antes de portar: `git diff 892061c9:apps/server/src/kernel/config/env-resolver.ts 1bb25aba:apps/server/src/kernel/config/env-resolver.ts`
   y revisar que no revierte comportamiento de `integration`.
4. Conservar los contratos existentes de `integration` (`tests/trans01-openrouter-app-wiring.test.ts`,
   `tests/trans02-openrouter-jev.test.ts`): el registro debe alinearse con ellos, no sustituirlos.
5. Verificar separación de lanes: cuenta OpenRouter de Slow y de JEV deben validarse por separado,
   incluso cuando falta una clave.
6. Leer la semántica de `--strict` en el script antes de usarlo como gate: qué considera
   "no registrado" y qué exit code devuelve.

```bash
corepack pnpm infra:readiness
corepack pnpm infra:readiness:test
corepack pnpm connections
corepack pnpm typecheck
```

Criterio de aceptación: `unregistered` vacío en modo estricto, 12/12 pruebas offline (cifra reportada
por otro agente en `1bb25aba`, re-verificar), y ningún secreto impreso.

Si el trasplante no se autoriza: registrar la decisión y dejar `infra` como deuda explícita. No
simular que está integrada.

### Paso 4 — Recontar y reconciliar el ledger

```bash
jq -s '[.[].blocks[].state] | group_by(.) | map({(.[0]): length}) | add' \
  $(find docs/convergencia-operativa-12x4 -name ESTADO-48-BLOQUES.json)
```

Verificar que cada `DONE` tenga evidencia enlazada y que ningún bloque se haya cerrado por documento.
Si una campaña declara un cierre sin evidencia, Trans00 lo revierte a `IN_PROGRESS` y lo comunica.

### Paso 5 — Handoff y orden

Actualizar `HANDOFF-FREEBUFF-TRANS00-TRANS06.md` (o su sucesor `…-TRANS07.md`) con: base vigente,
SHA de gate, estado de `infra`, contabilidad del ledger y siguientes pasos por campaña. El handoff es
el único documento que un agente nuevo debe leer antes de tocar código; si está desactualizado, es un
bug de coordinación.

### Paso 6 — Aprobación final

Trans00 aprueba el paso a `main` **solo** cuando se cumpla §13 del protocolo general, con Trans07
como ejecutor de la convergencia técnica. La aprobación se escribe: no se sobreentiende.

---

## 6. Criterios de DONE de Trans00

- [ ] `ACTA-BASE-05.md` publicada con SHA, divergencia y versiones.
- [ ] `EVIDENCIA-GATE-05.json` reproducible desde el clon, con log versionado y hash real.
- [ ] Decisión sobre `infra` escrita: integrada (con pruebas) o deuda aceptada con motivo.
- [ ] Ledger reconciliado; 288 bloques contados desde archivos; `DONE` respaldado por evidencia.
- [ ] Handoff actualizado y coherente con los heads del día.
- [ ] Ninguna campaña declarada cerrada sin cumplir §10 del protocolo.

---

## 7. Errores que Trans00 debe impedir (ya ocurrieron)

| Error | Dónde ocurrió | Prevención |
|---|---|---|
| Hash de log vacío como evidencia | `Trans01/EJECUCION/EVIDENCIA.json` (`tsc`) | validar tamaño > 0 antes de hashear |
| Evidencia solo en `/tmp` | gates 03/04 | logs versionados o resumen reproducible |
| Suma del ledger inconsistente | handoff (282+3+4) | recontar con `jq`, nunca copiar cifras |
| Declarar integrado un módulo sin consumidor | Trans05 longitudinal | `grep` de consumidores antes de `DONE` |
| Trasplantar `infra` en bloque | riesgo H4 | portar por piezas y probar |
| Confundir `exec/*` con trabajo pendiente | topología | son snapshots contenidos en `integration` |

---

## 8. Entrega esperada

1. Acta de base + evidencia de gate reproducible.
2. Decisión de `infra` con diff revisado y pruebas.
3. Ledger reconciliado con evidencia por bloque.
4. Handoff actualizado.
5. Lista de bloqueos que requieren operador, cada uno con el siguiente paso concreto.
