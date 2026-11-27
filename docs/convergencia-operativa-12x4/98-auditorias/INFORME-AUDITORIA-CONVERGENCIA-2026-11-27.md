# Informe forense de convergencia — `uniscrolliabrain-cloud/agente`

**Fecha de cierre del análisis:** 2026-11-27, ~19:50 UTC
**Modo:** auditoría de solo lectura sobre objetos Git reales + ejecución de tests en worktrees aislados.
**No se modificó código, no se hizo merge/rebase/cherry-pick, no se borraron ramas, no se tocó `main`, Doppler, secretos ni despliegues.**

> Aviso de ventana móvil: el repositorio estaba siendo trabajado en paralelo. Durante la auditoría
> `main` pasó de `ff54e8f9` a `e496dd43` y `integration/trans00-core` de `0b7ffa55` a `892061c9`;
> aparecieron `exec/Trans03`–`exec/Trans06` e `infra/trans00-provider-readiness`.
> Todos los datos de este informe corresponden al snapshot posterior al `git fetch` de las 19:35 UTC
> y fueron re-verificados contra el head nuevo.

---

## 1. Resumen ejecutivo

1. **Existe una única base de convergencia real y ya consolidada:** `origin/integration/trans00-core`
   en `892061c9`. No es una rama "más nueva": es el **superconjunto** de toda la cadena `exec/*`.
   La cadena de ancestría verificada es
   `exec/Trans03, exec/Trans05, exec/Trans06 ⊂ exec/Trans01 ⊂ exec/Trans02 ⊂ exec/Trans04 ⊂ integration/trans00-core`.
2. **Las ramas originales `Trans00`–`Trans06` y `campaign/convergencia-operativa-12x4` están obsoletas**
   (642 commits por detrás de `integration`, salvo `Trans06` con 212 y `Trans00` con 104). No son
   patch-equivalentes (`git cherry` devuelve `+` en todos sus commits), pero **todo su código ya está
   presente en `integration`** con versiones evolucionadas: 0 archivos de código ausentes.
3. **No hay nada terminado según la propia campaña:** los seis ledgers `ESTADO-48-BLOQUES.json`
   suman **288 bloques y 0 DONE** (281 PENDING, 3 IN_PROGRESS y 4 NOT_RUN; los siete no-PENDING estan todos en Trans05).
   Cualquier afirmación de "campaña completada" contradice la evidencia versionada.
4. **La implementación sí existe y está probada en lo focal.** Re-ejecuté 332 tests de las campañas
   sobre `892061c9`: **319 PASS, 0 FAIL, 13 SKIP**. Typecheck raíz + worker: **exit 0**.
   Los 13 SKIP son tests de concurrencia que requieren PostgreSQL nativo, no módulos ausentes.
5. **Un bloque relevante está implementado, probado y desmontado:** el paquete longitudinal de
   Trans05 (`apps/server/src/engine/cognition/v2/longitudinal/*`) no tiene **ningún consumidor**
   fuera de su carpeta. Estado correcto: `UNMOUNTED`, no `IMPLEMENTED_TESTED` a secas.
6. **`infra/trans00-provider-readiness` no está integrada:** sus 10 commits (validador de 42
   proveedores + tests offline, 10/10 PASS) no son ancestros de `integration`, y
   `scripts/trans-provider-readiness.mjs` **no existe** en `integration`. Estado: `UNMOUNTED`
   con implementación probada.
7. **Ningún proveedor está verificado en vivo.** `LIVE_UNVERIFIED` para Meta/Muse, OpenRouter
   (Fast/JEV/Slow), Gemini, WhatsApp, Resend y Vapi. La ausencia de credenciales **no** es ausencia
   de implementación: hay clientes, contratos y pruebas con dobles; lo que falta es la sonda real.
8. **`integration` está 88 commits por delante y 32 por detrás de `main`.** No está fusionada.
   Antes de converger hay que incorporar `main` (assets + demo) y repetir el gate integral.

---

## 2. Snapshot de referencia

| Ref | SHA | Fecha commit | Rol |
|---|---|---|---|
| `origin/main` | `e496dd43` | 2026-11-27 | Rama de producción |
| `origin/integration/trans00-core` | `892061c9` | 2026-11-27 | **Candidata a base de convergencia** |
| `origin/exec/Trans01` | `bd3a31ec` | 2026-11-27 | Snapshot (contenido ⊂ integration) |
| `origin/exec/Trans02` | `c99951fe` | 2026-11-27 | Snapshot (contenido ⊂ integration) |
| `origin/exec/Trans03` | `5e8b1272` | 2026-11-27 | Snapshot (contenido ⊂ integration) |
| `origin/exec/Trans04` | `9eb03fd5` | 2026-11-27 | Snapshot (contenido ⊂ integration) |
| `origin/exec/Trans05` | `ba56896b` | 2026-11-27 | Snapshot (contenido ⊂ integration) |
| `origin/exec/Trans06` | `7663df43` | 2026-11-27 | Snapshot (contenido ⊂ integration) |
| `origin/infra/trans00-provider-readiness` | `b7c9fb5a` | 2026-11-27 | Readiness de proveedores, **no integrada** |
| `origin/Trans00` | `76abcf48` | 2026-11-26 | Campaña original (docs) |
| `origin/Trans01` | `61b76ac5` | 2026-11-26 | Campaña original |
| `origin/Trans02` | `5fc0ec4a` | 2026-11-26 | Campaña original |
| `origin/Trans03` | `7e847bf8` | 2026-11-26 | Campaña original |
| `origin/Trans04` | `7c422f9a` | 2026-11-26 | Campaña original |
| `origin/Trans05` | `46529cab` | 2026-11-26 | Campaña original |
| `origin/Trans06` | `db5da937` | 2026-11-26 | Campaña original (solo docs) |
| `origin/campaign/convergencia-operativa-12x4` | `8672f8c1` | 2026-11-24 | Campaña maestra documental |

### Divergencia contra `integration/trans00-core`
`git rev-list --left-right --count origin/integration/trans00-core...origin/<ref>` → `(adelante_de_integration, detrás)`

| Ref | integration adelante | ref adelante |
|---|---:|---:|
| `main` | 88 | 32 |
| `Trans00` | 104 | 4 |
| `Trans01` | 642 | 145 |
| `Trans02` | 642 | 152 |
| `Trans03` | 642 | 131 |
| `Trans04` | 642 | 121 |
| `Trans05` | 642 | 163 |
| `Trans06` | 212 | 21 |
| `exec/Trans01` | 4 | 0 |
| `exec/Trans02` | 3 | 0 |
| `exec/Trans03` | 49 | 0 |
| `exec/Trans04` | 1 | 0 |
| `exec/Trans05` | 29 | 0 |
| `exec/Trans06` | 27 | 0 |
| `infra/trans00-provider-readiness` | 104 | 10 |
| `campaign/convergencia-operativa-12x4` | 642 | 136 |

**Lectura:** las seis `exec/*` tienen 0 commits propios fuera de `integration`; son punteros de etapa.
`integration` = `exec/Trans04` + 1 commit documental (`892061c9`).

---

## 3. Topología y equivalencia de parches

### 3.1 Ancestría (`merge-base --is-ancestor`)

```
exec/Trans03 ─┐
exec/Trans05 ─┼─⊂ exec/Trans01 ─⊂ exec/Trans02 ─⊂ exec/Trans04 ─⊂ integration/trans00-core (892061c9)
exec/Trans06 ─┘
```

Verificado con `git merge-base --is-ancestor` para cada par. No hay merges ocultos: la integración
se construyó por publicación incremental sobre una base común `df7e0eb6`.

### 3.2 `git cherry` (equivalencia por `patch-id`)

| Comparación | Resultado |
|---|---|
| `integration` ← `exec/Trans01/02/04/06` | **vacío** (todos los parches contenidos) |
| `integration` ← `Trans01` | 145 `+` (ninguno equivalente) |
| `integration` ← `Trans02` | 152 `+` |
| `integration` ← `Trans05` | 163 `+` |
| `integration` ← `Trans06` | 21 `+` |

**Interpretación:** las ramas originales no son patch-equivalentes porque sus commits se reescribieron
y evolucionaron dentro de `exec/*`; la funcionalidad sí está, pero **no se puede afirmar que un commit
original concreto esté aplicado**. Para auditar un requisito hay que ir al código de `integration`,
no al commit de la rama original.

### 3.3 Matriz de contenido (archivos de código, no `docs/`)

Base: `merge-base(origin/TransXX, origin/main)`. Para cada archivo tocado por la rama original se
compara el blob contra `integration`.

| Rama original | Archivos código | Idénticos | Distintos | Ausentes en integration |
|---|---:|---:|---:|---:|
| `Trans01` | 34 | 23 | 11 | **0** |
| `Trans02` | 10 | 6 | 4 | **0** |
| `Trans03` | 3 | 0 | 3 | **0** |
| `Trans04` | 4 | 0 | 4 | **0** |
| `Trans05` | 10 | 6 | 4 | **0** |
| `Trans06` | 0 (19 docs) | — | — | — |

**Interpretación:** `Trans06` es 100 % documentación (coherente con `DOCUMENTED_ONLY`).
En Trans03/Trans04 ningún archivo coincide byte a byte porque `integration` contiene versiones
posteriores (ABI de receipts compartida, fixtures Gmail actuales, kernel sink). Eso es
`SUPERSEDED`, no pérdida de código.

---

## 4. Evidencia de ejecución (reproducida en esta auditoría)

Worktree aislado `.audit/core` en `892061c9` (detached HEAD), `node_modules` instalado con
lockfile congelado. Comando base:

```
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test \
  --test-isolation=none --test-timeout=60000 --test-force-exit <archivos>
```

| Lote | Suites | Tests | PASS | FAIL | SKIP | Exit |
|---|---|---:|---:|---:|---:|---:|
| `trans01-*` (1–10) | 10 | 71 | 71 | 0 | 0 | 0 |
| `trans01-*` (11–20) | 10 | 34 | 34 | 0 | 0 | 0 |
| `trans01-*` (21–29) | 9 | 37 | 34 | 0 | 3 | 0 |
| `trans02-*` (1–7) | 7 | 19 | 18 | 0 | 1 | 0 |
| `trans02-*` (8–14) | 7 | 25 | 25 | 0 | 0 | 0 |
| `trans03-*` | 4 | 8 | 8 | 0 | 0 | 0 |
| `trans04-*` (1–6) | 6 | 17 | 17 | 0 | 0 | 0 |
| `trans04-*` (7–12) | 6 | 26 | 26 | 0 | 0 | 0 |
| `trans05-*` + `trans06-*` | 5 | 25 | 25 | 0 | 0 | 0 |
| `cognition-v2-*` (1–14) | 14 | 44 | 39 | 0 | 5 | 0 |
| `cognition-v2-*` (15–28) | 14 | 26 | 22 | 0 | 4 | 0 |
| **Total** | **82** | **332** | **319** | **0** | **13** | **0** |

**Typecheck:** `corepack pnpm typecheck` → `tsc --noEmit && npm --prefix apps/worker run typecheck`
→ **exit 0**.

**Motivo de los 13 SKIP:** todos son pruebas de concurrencia multi-conexión que exigen PostgreSQL
nativo (p. ej. *"two Postgres connections cannot execute the same operation concurrently"*,
*"C09 native Postgres workers reconcile one expired lease once"*, *"Postgres human journal: two
connections admit one run"*). No son funcionalidad ausente; el entorno usa PGlite.

**Rama `infra/trans00-provider-readiness`:** `node --test tests/trans-provider-readiness.test.mjs`
→ **10/10 PASS, exit 0** (contratos offline y transporte mockeado, 42 identificadores de proveedor).

### 4.1 Gate documentado (no re-ejecutado completo)

No ejecuté el gate integral (`pnpm gate`) porque su paso de tests tarda ~7 min y el límite de comando
es 5 min; además exige árbol limpio y escribe `artifacts/gate/`. Lo que sí verifiqué:

| Evidencia versionada | SHA auditado | Resultado declarado | Verificación mía |
|---|---|---|---|
| `EVIDENCIA-GATE-03.json` | `94e9b15d` | 10/10 PASS; 1131 tests, 1102 PASS, 0 FAIL, 24 SKIP, 5 TODO | No re-ejecutado |
| `EVIDENCIA-GATE-04.json` | `b11ab259` | 10/10 PASS; 1140 tests, 1110 PASS, 0 FAIL, 25 SKIP, 5 TODO | No re-ejecutado |
| `EVIDENCIA-META-MUSE-CONTRIBUTOR.json` | `9eb03fd5` | 10/10 PASS; 1173 tests, 1143 PASS, 0 FAIL, 25 SKIP, 5 TODO | Código idéntico al head actual |

`892061c9` es **solo documental** sobre `9eb03fd5` (2 archivos, +252 líneas:
`ACTA-META-MUSE-CONTRIBUTOR.md` y `EVIDENCIA-META-MUSE-CONTRIBUTOR.json`). Por tanto el gate de
`9eb03fd5` cubre exactamente el árbol de código del head actual. Comprobado con `git show --stat`.

---

## 5. Estado normalizado por campaña y requisito

Estados usados: `DOCUMENTED_ONLY`, `IMPLEMENTED_UNTESTED`, `IMPLEMENTED_TESTED`, `PARTIAL_IMPLEMENTATION`,
`UNMOUNTED`, `STUB_CONFIG_MISSING`, `STUB_IMPLEMENTATION_MISSING`, `LIVE_UNVERIFIED`, `LIVE_VERIFIED`,
`INTEGRATED`, `CONFLICTED`, `SUPERSEDED`, `UNKNOWN`.

| # | Campaña / requisito | Evidencia (rutas en `integration`) | Verificación | Estado |
|---|---|---|---|---|
| 1 | **Trans01 — kernel, autorización, leases, receipts, outbox, replay** | `apps/server/src/engine/**`, `apps/server/src/engine/events/bus.ts`, `tests/trans01-*.test.ts` (29 suites) | 142 tests, 139 PASS, 3 SKIP, 0 FAIL | **INTEGRATED + IMPLEMENTED_TESTED** |
| 2 | **Trans01 — envelope causal de turno humano** | `tests/trans01-human-turn-envelope.test.ts`, `tests/trans02-human-turn-contract.test.ts` | PASS en lote | **INTEGRATED + IMPLEMENTED_TESTED** |
| 3 | **Trans01 — truth ranking / TruthResolver** | `apps/server/src/engine/business/truth-resolver.ts`, `tests/trans01-truth-integrity.test.ts` | PASS | **INTEGRATED + IMPLEMENTED_TESTED** |
| 4 | **Trans02 — Cognition V2 (atención, contexto, chat-agent, runtime)** | `apps/server/src/engine/cognition/v2/*`, `tests/trans02-*.test.ts` (14 suites) + `tests/cognition-v2-*.test.ts` (28) | 44 + 70 tests, 104 PASS, 10 SKIP, 0 FAIL | **INTEGRATED + IMPLEMENTED_TESTED** |
| 5 | **Trans02 — JEV / Fast / Slow separados** | `tests/trans02-openrouter-jev.test.ts`, `tests/trans01-llm-profiles.test.ts`, `tests/trans01-meta-muse.test.ts` | PASS con dobles/SSE sintético | **INTEGRATED + IMPLEMENTED_TESTED**; proveedor real `LIVE_UNVERIFIED` |
| 6 | **Trans03 — integraciones (Meta WhatsApp, Google, stubs)** | `packages/integrations/src/meta-whatsapp.ts`, `packages/integrations/src/stubs/whatsapp.ts`, `apps/server/src/engine/whatsapp-outbound.ts`, `apps/server/src/google-auth.ts` | 8 tests PASS; el adaptador real está consumido por `whatsapp-outbound.ts` | **INTEGRATED + IMPLEMENTED_TESTED**; envío real `LIVE_UNVERIFIED` |
| 7 | **Trans04 — observabilidad (métricas, request-logger, alertas)** | `apps/server/src/metrics-exporter.ts`, `apps/server/src/metrics/registry.ts`, `apps/server/src/middleware/request-logger.ts`, `tests/trans04-*.test.ts` (12 suites) | 43 tests PASS | **INTEGRATED + IMPLEMENTED_TESTED** |
| 8 | **Trans04 — preflight de secretos / provisión** | `tests/trans04-secrets-preflight.test.ts`, `tests/trans04-provision-read-safety.test.ts` | PASS sin valores reales | **INTEGRATED + IMPLEMENTED_TESTED**; operación real `LIVE_UNVERIFIED` |
| 9 | **Trans05 — extracción narrativa** | `apps/server/src/engine/cognition/v2/longitudinal/narrative-extraction.ts`, `tests/trans05-narrative-extraction.test.ts` | PASS | **IMPLEMENTED_TESTED** |
| 10 | **Trans05 — pack/selector/segments/proposal longitudinal** | `.../longitudinal/{pack,selector,segments,proposal}.ts`, `tests/trans05-pure-longitudinal.test.ts` | PASS; **0 referencias fuera de la carpeta** | **UNMOUNTED** (implementado y probado, sin consumidor/serving) |
| 11 | **Trans06 — diagnóstico de verdad de negocio** | `truth-resolver.ts` (corrección en Trans01), `tests/trans06-*.test.ts` (3 suites), docs `INFORME-TRUTH-DIAGNOSTICO.md` | 25 tests combinados PASS | **INTEGRATED** (corrección) + **DOCUMENTED_ONLY** (resto del diagnóstico) |
| 12 | **Trans00 — arranque, gates, actas** | `docs/.../Trans00/EJECUCION/ACTA-*.md`, `EVIDENCIA-GATE-0{3,4}.json` | Coherentes entre sí | **DOCUMENTED_ONLY** (evidencia de gate; no código) |
| 13 | **`infra/trans00-provider-readiness`** | `scripts/trans-provider-readiness.mjs`, `tests/trans-provider-readiness.test.mjs` (solo en su rama) | 10/10 PASS offline; script ausente en `integration` | **UNMOUNTED** + **IMPLEMENTED_TESTED** |
| 14 | **Proveedores reales (Muse, OpenRouter, Gemini, WhatsApp, Resend, Vapi)** | `.env.example`, readiness de 42 identificadores | Sin credenciales ni llamadas reales | **STUB_CONFIG_MISSING** / **LIVE_UNVERIFIED** |
| 15 | **Campaña 12×4 — 48 bloques por Trans** | `ESTADO-48-BLOQUES.json` ×6 | 288 bloques, **0 DONE** | **PARTIAL_IMPLEMENTATION** (global) |
| 16 | **Ramas UX (`ui-lab`, `ui-lab-pro`, `feat/agntiapro-ui-lab`)** | `apps/ui-lab/**` en `main` | No ancestras de `main`; trabajo separado | **UNMOUNTED / fuera de alcance Trans** |
| 17 | **Ramas originales `Trans00`–`Trans06`** | Contenido evolucionado en `integration` | 0 archivos de código ausentes | **SUPERSEDED** |
| 18 | **`campaign/convergencia-operativa-12x4`** | Docs de arquitectura 12×4 | 642 detrás / 136 delante; docs absorbidos y ampliados en `integration` | **SUPERSEDED** |
| 19 | **PRs de campaña** | #32 (Trans01, abierto, draft), #34 (Trans03, abierto, draft), #33/#35/#36 (cerrados sin merge) | Ninguno fusionado | **no integrados vía PR** |

### 5.1 Ledger de bloques (verificado en el head actual)

| Campaña | PENDING | IN_PROGRESS | NOT_RUN | DONE |
|---|---:|---:|---:|---:|
| Trans01 | 48 | 0 | 0 | **0** |
| Trans02 | 48 | 0 | 0 | **0** |
| Trans03 | 48 | 0 | 0 | **0** |
| Trans04 | 48 | 0 | 0 | **0** |
| Trans05 | 41 | 3 | 4 | **0** |
| Trans06 | 48 | 0 | 0 | **0** |
| **Total** | **281** | **3** | **4** | **0** |

Conclusión obligatoria: **ninguna campaña está DONE** según su propia contabilidad, aunque el código
exista y pase pruebas focales. No confundir "implementado y probado" con "bloque cerrado".

---

## 6. Hallazgos críticos

### H1 — `EVIDENCIA.json` de Trans01 contiene un log vacío declarado como evidencia
`docs/.../Trans01/EJECUCION/EVIDENCIA.json` → clave `tsc`:
`{"sha256":"e3b0c442…b855","file":"/tmp/trans01-tsc.log"}`.
Ese SHA-256 es el de un **archivo vacío**. La evidencia de typecheck de ese acta no es válida.
Mi ejecución independiente de `pnpm typecheck` en `892061c9` sí da exit 0, pero **no repara el acta**.

### H2 — Evidencia de gate no reproducible desde el repositorio
`EVIDENCIA-GATE-04.json` y `EVIDENCIA-META-MUSE-CONTRIBUTOR.json` referencian logs en
`/workspace/trans00-core/artifacts/gate/logs/*` y `/tmp/trans00-*-gate`, y comandos con un runtime
`/opt/codex/...`. Los hashes son verificables solo si esos archivos existieran; no están versionados.
El gate es **creíble pero no reproducible** desde el clon. Lo que sí reproduje: focused suites + typecheck.

### H3 — Trans05 longitudinal desmontado
El módulo existe y sus tests pasan, pero `grep` sobre `apps/server/src` no encuentra **ningún import**
de `longitudinal/{pack,selector,segments,proposal,narrative-extraction}` fuera del propio directorio.
El `INFORME-CONVERGENCIA-EN-CURSO.md` lo reconoce ("persistencia longitudinal, journal consumidor y
serving" pendientes). Clasificación correcta: `UNMOUNTED`, no `INTEGRATED`.

### H4 — `infra/trans00-provider-readiness` es trabajo huérfano
10 commits con un validador de 42 proveedores y tests offline que pasan, pero:
- no es ancestro de `integration`;
- `scripts/trans-provider-readiness.mjs` no existe en `integration`;
- `package.json` de `integration` no lo referencia.
Es la pieza más valiosa no integrada. Debe evaluarse su trasplante (no lo hice: prohibido modificar).

### H5 — Proveedores: implementación ≠ configuración ≠ verificación
Hay clientes reales (`meta-whatsapp.ts`), contratos estrictos y pruebas con SSE sintético, pero:
- `.env.example` documenta `MUSE_API_KEY`, `OPENROUTER_API_KEY`, `OPEN_ROUTER_API_KEY`, `GEMINI_API_KEY`,
  `WHATSAPP_*`, `RESEND_API_KEY`, `VAPI_*` **sin valores**;
- el acta Meta declara explícitamente "tarifas, disponibilidad, entrenamiento y acceso de cuenta no
  verificados mediante servicio real";
- no se hicieron llamadas pagadas.
Estado correcto por proveedor: `STUB_CONFIG_MISSING` (sin config) o `LIVE_UNVERIFIED` (si se aportara
config). Nunca `IMPLEMENTED_UNTESTED` global ni `SUPERSEDED`.

### H6 — `main` no contiene la campaña
`git ls-tree origin/main -- docs/convergencia-operativa-12x4` → **0 archivos**.
La documentación canónica de la convergencia vive solo en `integration`. Si se fusiona `integration`
en `main`, entra también el corpus documental (61 archivos en `integration`).

### H7 — Divergencia con `main` no resuelta
`integration` está **88 adelante / 32 detrás**. Los 32 commits de `main` son assets, demo y UI Lab.
No hice merge ni comprobé conflictos (prohibido). El supervisor debe asumir que habrá que reconciliar
`apps/ui-lab`, `apps/site` y assets antes del gate final.

---

## 7. Riesgos antes de converger

| Riesgo | Severidad | Mitigación recomendada |
|---|---|---|
| Fusionar sin incorporar `main` (32 commits) | Alta | Merge de `main` en `integration` en rama de trabajo + re-gate completo |
| Tomar el ledger como certificación | Alta | Mantener 0/288 DONE; el gate integral no certifica campañas |
| Integrar `infra` sin revisar base antigua | Media | Reaplicar solo `scripts/` + `tests/` sobre `integration`, no la rama completa |
| Declarar proveedores "listos" por pasar tests con dobles | Alta | Sonda real separada con credenciales del owner; hoy `LIVE_UNVERIFIED` |
| Confundir `exec/Trans0x` con trabajo pendiente | Media | Son snapshots contenidos; no re-mergear |
| Evidencia con rutas `/tmp` y `/workspace` ajenas | Media | Aceptar como acta histórica; no como prueba reproducible |
| Tests de concurrencia PG siempre SKIP | Media | Ejecutar una vez contra PostgreSQL 17 desechable antes de certificar |

---

## 8. Recomendación de base de convergencia

**Base única: `origin/integration/trans00-core` @ `892061c9`.**

Justificación mecánica:
- contiene `exec/Trans01`–`06` como ancestros (0 commits propios fuera);
- contiene todo el código de las ramas originales (0 archivos ausentes);
- tiene el corpus documental completo de la campaña;
- su árbol de código es idéntico al SHA con gate integral PASS (`9eb03fd5`);
- typecheck y 332 tests focales verificados en esta auditoría.

Secuencia sugerida al supervisor (no ejecutada):
1. Crear rama de convergencia desde `892061c9`.
2. Incorporar `main` (`e496dd43`) y resolver solapamientos de `apps/ui-lab`/assets.
3. Evaluar trasplante selectivo de `infra/trans00-provider-readiness` (solo `scripts/` + `tests/` + script npm).
4. Re-ejecutar `pnpm gate` completo y una pasada con PostgreSQL 17 para los 13 SKIP.
5. Solo entonces abrir PR a `main`; no reutilizar los PR #32/#34 (apuntan a `campaign/...` y están desfasados).

---

## 9. Limitaciones de esta auditoría

- No ejecuté el gate integral completo (límite de 5 min por comando; su paso de tests dura ~7 min).
- No ejecuté la suite completa de 1.173 tests: solo 332 focalizados de las campañas + 10 de infra.
- No verifiqué ningún proveedor en vivo (sin credenciales; prohibido usar secretos).
- No comprobé conflictos de merge reales contra `main` (prohibido mergear/rebase).
- No audité el mérito funcional de cada símbolo del kernel; verifiqué presencia, montaje y pruebas.
- El repositorio se movió durante la auditoría; los heads pueden haber cambiado después de las 19:50 UTC.

---

## 10. Anexo — comandos reproducibles

```bash
# refrescar refs (solo remoto-tracking)
git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune

# topología
git rev-list --left-right --count origin/integration/trans00-core...origin/<ref>
git merge-base --is-ancestor origin/<a> origin/<b>
git cherry origin/integration/trans00-core origin/<ref>
git range-diff origin/Trans03...origin/integration/trans00-core

# worktree de auditoría (sin tocar ramas)
git worktree add --detach .audit/core origin/integration/trans00-core
cd .audit/core && corepack pnpm install --frozen-lockfile && corepack pnpm typecheck

# tests focales
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test \
  --test-isolation=none --test-timeout=60000 --test-force-exit tests/trans01-*.test.ts
```

**Archivos creados por esta auditoría:** este informe y los worktrees `.audit/core` y `.audit/infra`.
Ningún archivo del repositorio fue modificado.

---

## 11. Anexo — re-verificación de heads al versionar este informe

Re-fetch ejecutado el 2026-11-27 ~21:40 UTC, inmediatamente antes de publicar el informe.
El repositorio volvió a moverse:

| Ref | Snapshot auditado | Head al publicar | Cambio observado |
|---|---|---|---|
| `main` | `e496dd43` | `e496dd43` | sin cambios |
| `integration/trans00-core` | `892061c9` | `892061c9` | sin cambios |
| `exec/Trans01`–`exec/Trans06` | `bd3a31ec`…`7663df43` | idénticos | sin cambios |
| `campaign/convergencia-operativa-12x4` | `8672f8c1` | `8672f8c1` | sin cambios |
| `infra/trans00-provider-readiness` | `b7c9fb5a` | `1bb25aba` | +1 commit de código: cablea el contrato Trans00–06 al registro de conexiones (`scripts/lib/connections.ts`, `apps/server/src/kernel/config/env-resolver.ts`, `docs/TRANS-PROVIDER-READINESS-AUDIT.md`, scripts `infra:readiness` y `infra:readiness:test`). Sigue fuera de `integration`. |
| `Trans00` | `76abcf48` | `d455f0e6` | +1 commit documental: `HANDOFF-FREEBUFF-TRANS00-TRANS06.md`. |
| `docs/provider-infrastructure-registry` | no existía | `bca3d239` | 5 commits documentales de una campaña aislada de proveedores; no es ancestro de `main` ni de `integration`. |

Las conclusiones de topología, divergencia y estado por requisito se mantienen para `892061c9`,
que sigue siendo el head de `integration`. El delta de `infra` **refuerza** el hallazgo H4:
la pieza no integrada creció y ahora incluye cableado del resolver de entorno, por lo que su
trasplante debe evaluarse como unidad (registro + resolver + scripts + tests), no solo como script.

**Corrección aritmética:** el ledger suma 288 bloques con **281 PENDING** + 3 IN_PROGRESS +
4 NOT_RUN. La cifra `282` que circuló en el handoff provenía de un error de suma en la primera
redacción de este informe (282+3+4=289); el denominador correcto es 288 y DONE sigue en 0.
