# Protocolo general del ejecutor Freebuff — Trans00 a Trans07

**Estado:** documento operativo, no certificación.
**Base de referencia:** `origin/integration/trans00-core` @ `892061c9` (snapshot del 2026-11-27).
**Auditoría de origen:** [`../98-auditorias/INFORME-AUDITORIA-CONVERGENCIA-2026-11-27.md`](../98-auditorias/INFORME-AUDITORIA-CONVERGENCIA-2026-11-27.md).
**Handoff previo que este corpus amplía:** `docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans00/HANDOFF-FREEBUFF-TRANS00-TRANS06.md`, publicado en `origin/Trans00` @ `d455f0e6` (todavía no está en `integration`).

Este documento no autoriza nada por sí mismo. Autoriza el operador humano. Lo que aquí se fija es
**cómo** se ejecuta el trabajo y **qué** cuenta como terminado, para que ningún agente pueda declarar
cierre por haber escrito documentación, por haber hecho un commit o por haber visto un test verde.

---

## 1. Autoridad del sistema

La regla de arquitectura es única y no se negocia en ninguna campaña:

> **Slow propone; el kernel valida y autoriza; el runtime ejecuta; Fast comunica.**

Consecuencias operativas que el ejecutor debe respetar en todo cambio:

1. Un modelo (Fast, Slow, JEV, Muse, OpenRouter, Gemini) **nunca** concede permisos, aprueba
   operaciones ni ejecuta herramientas. Solo propone o clasifica.
2. Toda operación con efecto externo pasa por kernel y deja **receipt**. Sin receipt no hay hecho
   verificado; una inferencia no se convierte en hecho.
3. El runtime es el único que ejecuta y el único que reintenta. Un resultado ambiguo de proveedor se
   reconcilia **antes** de repetir el efecto.
4. Fast recibe contexto preparado y comunica. No elabora propuestas operativas ni llama herramientas.
5. Deny-by-default y fail-closed: si falta configuración, se rechaza, no se degrada en silencio.

Si una tarea de campaña exige violar cualquiera de estos cinco puntos, la tarea está mal especificada:
se detiene y se escala al operador (ver §11).

---

## 2. Regla de oro: cinco cosas distintas

El error más caro de esta convergencia fue tratar como equivalentes cosas que no lo son. El ejecutor
debe declarar siempre en cuál de las cinco está:

| Nivel | Qué significa | Qué NO prueba |
|---|---|---|
| **Documentado** | existe un `.md` o un JSON de evidencia | que exista código |
| **Implementado** | existe el símbolo, la ruta y compila | que esté montado o probado |
| **Probado** | hay test que lo ejerce y pasa en un SHA concreto | que esté conectado al producto |
| **Montado** | hay un consumidor real fuera del propio módulo | que el recorrido completo funcione |
| **En vivo** | una sonda real contra el proveedor devolvió un resultado verificable | que el resto del circuito funcione |

Un módulo probado y sin consumidor es `UNMOUNTED`, no `INTEGRATED`.
Un cliente con dobles y sin credenciales es `LIVE_UNVERIFIED`, no "listo".
La falta de credenciales **no** es falta de implementación, y la existencia de un commit **no** es cierre.

---

## 3. Base de trabajo y verificación de heads

El repositorio se mueve mientras se trabaja. **Ningún documento, SHA o cifra de este corpus debe
usarse sin re-verificarlo** en el clon del ejecutor:

```bash
git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune
git rev-parse --short origin/integration/trans00-core origin/main
git rev-list --left-right --count origin/integration/trans00-core...origin/main
git merge-base --is-ancestor origin/exec/Trans01 origin/integration/trans00-core && echo OK
```

Reglas:

- La base de trabajo es `origin/integration/trans00-core` mientras las seis `exec/*` sigan siendo
  ancestros suyos y su árbol de código siga siendo el de `9eb03fd5` (el último SHA con gate integral
  documentado).
- Las ramas `Trans00`–`Trans06` originales y `campaign/convergencia-operativa-12x4` están
  **superadas**: no se incorporan en bloque ni se re-mergean.
- Cada agente trabaja en **una rama propia** desde la base verificada. Un solo escritor activo por
  rama. No se reescribe historia publicada, no se hace force-push, no se toca `main`.
- Antes de empezar: registrar SHA base, `git status`, versiones de Node/pnpm y lockfile. Al terminar:
  registrar SHA evaluado y diff.

Snapshot de referencia (verificado el 2026-11-27; puede haber cambiado):

| Ref | SHA |
|---|---|
| `main` | `e496dd43` |
| `integration/trans00-core` | `892061c9` |
| `infra/trans00-provider-readiness` | `1bb25aba` (fuera de integration) |
| `exec/Trans01`…`exec/Trans06` | `bd3a31ec`, `c99951fe`, `5e8b1272`, `9eb03fd5`, `ba56896b`, `7663df43` |
| `docs/provider-infrastructure-registry` | `bca3d239` (campaña documental aislada, no fusionada) |

---

## 4. Clasificación obligatoria

Todo requisito auditado se etiqueta con **un** estado de esta lista. No se admiten estados
inventados ni combinaciones ambiguas ("casi listo", "en progreso" sin bloque asociado).

| Estado | Cuándo se usa |
|---|---|
| `DOCUMENTED_ONLY` | solo existe el documento o la evidencia declarada |
| `IMPLEMENTED_UNTESTED` | el código existe y compila, sin test que lo ejerza |
| `IMPLEMENTED_TESTED` | existe y pasa test en un SHA concreto |
| `PARTIAL_IMPLEMENTATION` | cubre parte del requisito; se enumera qué falta |
| `UNMOUNTED` | implementado y probado, sin consumidor real |
| `STUB_CONFIG_MISSING` | hay stub/contrato, falta configuración |
| `STUB_IMPLEMENTATION_MISSING` | hay contrato y configuración, falta implementación |
| `LIVE_UNVERIFIED` | hay implementación y configuración, sin sonda real |
| `LIVE_VERIFIED` | sonda real verificada con evidencia sin secretos |
| `INTEGRATED` | montado en el recorrido real del producto |
| `CONFLICTED` | dos versiones incompatibles conviven o el merge falla |
| `SUPERSEDED` | sustituido por una versión posterior; se conserva evidencia |
| `UNKNOWN` | no se pudo determinar; se explica por qué |

`IMPLEMENTED_TESTED` **no** implica `INTEGRATED`. `INTEGRATED` **no** implica `LIVE_VERIFIED`.

---

## 5. Los 48 bloques canónicos (12 fases × 4 pasadas)

Cada campaña tiene un ledger `ESTADO-48-BLOQUES.json` con 48 bloques. Los 48 bloques son un
**índice de cobertura**, no 48 módulos ni 48 patchsets nuevos. Cada bloque apunta a un README
canónico de la fase, y las cuatro pasadas no son cuatro implementaciones: son cuatro niveles de
madurez documental/verificación.

| Fase | Bloques | Ruta canónica (raíz `docs/convergencia-operativa-12x4/`) |
|---|---|---|
| `01-consolidacion` | `01.01`–`01.04` | `01-consolidacion/<pasada>/README.md` |
| `02-observabilidad` | `02.01`–`02.04` | `02-observabilidad/<pasada>/README.md` |
| `03-proveedores` | `03.01`–`03.04` | `03-proveedores/<pasada>/README.md` |
| `04-whatsapp` | `04.01`–`04.04` | `04-whatsapp/<pasada>/README.md` |
| `05-google` | `05.01`–`05.04` | `05-google/<pasada>/README.md` |
| `06-data-sintetica` | `06.01`–`06.04` | `06-data-sintetica/<pasada>/README.md` |
| `07-owner-real` | `07.01`–`07.04` | `07-owner-real/<pasada>/README.md` |
| `08-ciberseguridad` | `08.01`–`08.04` | `08-ciberseguridad/<pasada>/README.md` |
| `09-observabilidad-v2` | `09.01`–`09.04` | `09-observabilidad-v2/<pasada>/README.md` |
| `10-gestoria` | `10.01`–`10.04` | `10-gestoria/<pasada>/README.md` |
| `11-recompilacion` | `11.01`–`11.04` | `11-recompilacion/<pasada>/README.md` |
| `12-validacion` | `12.01`–`12.04` | `12-validacion/<pasada>/README.md` |

Pasadas, en orden: `01-scaffold-docu`, `02-coding-audit-transversal`, `03-reaudit-refactoring`,
`04-reaudit-hardening`. Un bloque solo puede pasar a `DONE` con evidencia de la pasada que declara.

**Contabilidad vigente (verificada el 2026-11-27 sobre `892061c9`):** 6 ledgers × 48 = **288 bloques**;
**281 PENDING**, **3 IN_PROGRESS**, **4 NOT_RUN**, **0 DONE**. Los siete bloques no-PENDING están
todos en Trans05: `01.02`, `01.03`, `12.02` en progreso y `07.01`–`07.04` no ejecutados.
Ninguna cifra de cierre puede publicarse sin recontar desde los archivos:

```bash
jq -s '[.[].blocks[].state] | group_by(.) | map({(.[0]): length}) | add' \
  $(find docs/convergencia-operativa-12x4 -name ESTADO-48-BLOQUES.json)
```

---

## 6. Ciclo de macroturno (obligatorio)

Cada macroturno de campaña sigue estos diez pasos. Omitir cualquiera invalida la evidencia del turno.

1. **Fijar base.** Fetch, SHA, `git status`, versiones, lockfile sin cambios.
2. **Leer alcance.** Leer el doc de campaña (`TransXX-*.md` de este corpus), el ledger y los
   criterios de aceptación de los bloques que se van a tocar.
3. **Verificar el estado real.** `code_search`/`grep` de consumidores, no solo del símbolo. Comprobar
   si el módulo está montado.
4. **Implementar lo mínimo.** Sin refactors colaterales, sin renames masivos, sin dependencias nuevas
   salvo necesidad demostrada.
5. **Probar en focal.** Suites del prefijo de la campaña, con `ALLOW_NETWORK=0`.
6. **Medir typecheck.** `corepack pnpm typecheck` (raíz + worker) y guardar el código de salida.
7. **Producir evidencia.** `EVIDENCIA.json` del turno con comandos, SHA evaluado, totales y hashes
   reales (ver §7).
8. **Actualizar ledger.** Solo los bloques con evidencia de la pasada correspondiente. Estados
   permitidos: `PENDING`, `IN_PROGRESS`, `DONE`, `NOT_RUN`, `BLOCKED`.
9. **Publicar snapshot.** Commit en la rama de campaña; sin merge a `main`; sin tags; sin deploy.
10. **Entregar informe de turno.** Qué se probó, qué quedó fuera, qué requiere al operador.

---

## 7. Evidencia: qué cuenta y qué no

### 7.1 Formato mínimo de `EVIDENCIA.json`

```json
{
  "turno": "Trans05/E-M2",
  "baseSha": "<sha completo>",
  "testedCommit": "<sha completo del árbol evaluado>",
  "state": "PARTIAL_LOCAL | LOCAL_PASS | BLOCKED",
  "commands": {
    "tests": "<comando exacto, con variables de entorno>",
    "typecheck": "corepack pnpm typecheck"
  },
  "tests": { "total": 0, "pass": 0, "fail": 0, "skip": 0, "todo": 0 },
  "exitCodes": { "tests": 0, "typecheck": 0 },
  "logs": {
    "tests": { "path": "docs/.../logs/<archivo>.log", "sha256": "<64 hex reales>" }
  },
  "notes": "qué demuestra y qué no"
}
```

Reglas:

- **Prohibido el hash de archivo vacío.** `e3b0c442…b855` es el SHA-256 de un fichero vacío; si
  aparece, la evidencia no existe. Ocurrió en `Trans01/EJECUCION/EVIDENCIA.json` (hallazgo H1) y debe
  regenerarse desde el SHA evaluado.
- **Prohibido usar solo rutas efímeras** (`/tmp/...`, `/workspace/...`) como prueba. Los logs deben
  versionarse bajo `docs/convergencia-operativa-12x4/00-coordinacion-multiagente/<Trans>/EVIDENCIA/logs/`
  o, si son demasiado grandes, publicarse su hash **y** un resumen reproducible con el comando exacto.
- El `testedCommit` debe existir en el remoto y ser el árbol realmente evaluado; si hay cambios sin
  commit, se declara `dirty: true` y el resultado no cuenta como cierre.
- Separar siempre `pass`, `fail`, `skip`, `todo` y `not_run`. Un SKIP no es un PASS.
- Los SKIP por falta de PostgreSQL nativo se documentan como SKIP con motivo y entorno; nunca se
  convierten en "PASS implícito".

### 7.2 Comandos canónicos

```bash
corepack pnpm install --frozen-lockfile          # el lockfile no se modifica sin justificación
corepack pnpm typecheck                          # tsc --noEmit && worker typecheck
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test \
  --test-isolation=none --test-timeout=60000 --test-force-exit tests/trans01-*.test.ts
corepack pnpm gate                               # typecheck + suite + 7 audits; escribe artifacts/gate/
corepack pnpm audit:contracts                    # contratos sin huérfanos
corepack pnpm infra:readiness                    # solo disponible tras integrar infra
corepack pnpm infra:readiness:test
```

`pnpm` directo puede no estar en PATH: usar `corepack pnpm`. El gate integral tarda más de cinco
minutos; ejecutarlo en un runner con tiempo suficiente, no trocearlo fingiendo que se ejecutó.

### 7.3 PostgreSQL nativo

Trece tests de concurrencia se saltan de forma legítima bajo PGlite. Para certificarlos hace falta
una instancia PostgreSQL 17 desechable y una ejecución explícita. Si el runner no la tiene, el estado
correcto es `SKIP` documentado, **no** `PASS`.

---

## 8. Git: reglas de convivencia

- Una rama por campaña, desde la base verificada; nombres `exec/TransXX` o `docs/...`, sin reutilizar
  ramas ajenas.
- **Nunca** `main`: ni commits directos, ni merges, ni rebase.
- **Nunca** force-push, `reset --hard` sobre ramas compartidas, ni borrado de ramas.
- **Nunca** cherry-pick de las ramas originales `Trans00`–`Trans06`: su contenido ya está en
  `integration` con versiones posteriores; aplicarlas reintroduce versiones viejas.
- `infra/trans00-provider-readiness` no se fusiona en bloque: se trasplanta por piezas
  (registro + resolver + scripts + tests) con revisión.
- Commits pequeños, mensaje en el estilo del repositorio (`feat(trans05): ...`, `fix(kernel): ...`,
  `docs(trans00): ...`), sin secretos, sin binarios grandes, sin `node_modules`.
- El operador autoriza push, PR, merge, despliegue y publicación. El agente puede dejar el trabajo
  commiteado localmente y el resumen listo.

---

## 9. Prohibiciones absolutas

1. No modificar `main`.
2. No desplegar, ni publicar sitios, ni tocar producción.
3. No llamar proveedores reales que generen coste, envíen mensajes, llamen teléfonos o escriban datos
   sin autorización explícita y específica para esa sonda.
4. No introducir secretos en el repositorio, en logs, en argumentos de comandos, en documentos ni en
   mensajes. Los valores viven en el gestor de secretos del operador.
5. No reimplementar lo que ya existe: primero buscar, leer y montar.
6. No declarar DONE un bloque sin evidencia de la pasada correspondiente.
7. No confundir `SKIP` con `PASS`, ni test focal con gate integral, ni gate con certificación de
   producto.
8. No inventar estados, cifras, SHAs ni rutas. Si no se verificó, se escribe "no verificado".
9. No interferir con otros agentes: no tocar sus ramas, sus worktrees ni sus procesos.

---

## 10. Criterio de DONE (checklist)

Un bloque solo pasa a `DONE` si **todos** los puntos se cumplen:

- [ ] El requisito está descrito con ruta y símbolo exactos.
- [ ] El código existe en el SHA declarado y compila (`typecheck` exit 0).
- [ ] Hay test que lo ejerce y pasa; se indica archivo, número de tests y resultado.
- [ ] Hay consumidor real o, si es módulo puro, se declara explícitamente por qué no lo necesita.
- [ ] La evidencia tiene `testedCommit`, comandos, exit codes y hashes no vacíos.
- [ ] El ledger del bloque se actualizó en la misma rama y commit.
- [ ] Se declaró lo que **no** cubre (proveedor real, PostgreSQL, multi-tenant, escala).
- [ ] Otro agente puede reproducirlo con los comandos escritos, sin leer la conversación.

Si falta un punto: `IN_PROGRESS` (trabajo real en curso) o `BLOCKED` (dependencia externa), nunca
`DONE`.

---

## 11. Escalado al operador

Requiere decisión humana, siempre:

| Situación | Por qué |
|---|---|
| Integrar `infra` en `integration` | cambia el resolver de entorno y el registro de conexiones |
| Merge de `main` en la base | 32 commits de assets/UI Lab; conflicto semántico posible |
| Abrir PR a `main` o fusionar | publicación |
| Cualquier sonda con efecto externo o coste | side effects y facturación |
| Rotar o provisionar credenciales | secretos |
| Cambiar el denominador del ledger o cerrar campaña | certificación |
| Aceptar un SKIP como deuda certificada | riesgo residual |

El escalado debe llegar con: tarea offline ya resuelta, evidencia adjunta y **el siguiente paso
concreto** que se pide autorizar.

---

## 12. Mapa de campañas

| Documento | Campaña | Misión | Evidencia primaria |
|---|---|---|---|
| [`Trans00-COORDINACION.md`](Trans00-COORDINACION.md) | Trans00 | autoridad, gates, ledger, trasplante de infra | `Trans00/EJECUCION/*` |
| [`Trans01-KERNEL.md`](Trans01-KERNEL.md) | Trans01 | kernel, leases, receipts, outbox, replay, verdad | `tests/trans01-*` (29 suites) |
| [`Trans02-COGNITION-V2.md`](Trans02-COGNITION-V2.md) | Trans02 | atención, contexto, roles, ontología | `tests/trans02-*` (14) + `tests/cognition-v2-*` (28) |
| [`Trans03-INTEGRACIONES.md`](Trans03-INTEGRACIONES.md) | Trans03 | Meta WhatsApp, Google, voz, caché | `tests/trans03-*` (4) |
| [`Trans04-OBSERVABILIDAD-Y-SECRETOS.md`](Trans04-OBSERVABILIDAD-Y-SECRETOS.md) | Trans04 | métricas, alertas, preflight de secretos | `tests/trans04-*` (12) |
| [`Trans05-COGNICION-LONGITUDINAL.md`](Trans05-COGNICION-LONGITUDINAL.md) | Trans05 | memoria longitudinal montada y servida | `tests/trans05-*` (2) |
| [`Trans06-VERDAD-DE-NEGOCIO.md`](Trans06-VERDAD-DE-NEGOCIO.md) | Trans06 | diagnóstico de verdad y regresiones | `tests/trans06-*` (3) |
| [`Trans07-CONVERGENCIA-Y-CERTIFICACION.md`](Trans07-CONVERGENCIA-Y-CERTIFICACION.md) | Trans07 | convergencia final, gate, certificación | gate + PR |

Orden de ejecución recomendado: **Trans00 → Trans01 → Trans02 → Trans03 → Trans04 → Trans05 →
Trans06 → Trans07**, con Trans00 reabriendo al final para aprobar el cierre. Un agente puede trabajar
en paralelo solo si no comparte archivos con otro; en caso de duda, secuencial.

---

## 13. Definición de "convergencia terminada"

La convergencia no termina cuando el código compila. Termina cuando, en un mismo SHA publicado:

1. `main` está incorporado en la base y no hay divergencia sin resolver;
2. el gate integral pasa completo y su evidencia es reproducible desde el clon;
3. los SKIP de PostgreSQL se ejecutaron al menos una vez con PostgreSQL 17;
4. cada requisito tiene estado normalizado y su evidencia enlazada;
5. el ledger refleja la realidad (y `DONE` significa lo que dice §10);
6. los proveedores tienen estado `LIVE_VERIFIED` o `LIVE_UNVERIFIED` explícito, nunca "listo";
7. existe un PR revisado a `main` autorizado por el operador, con rollback documentado.

Nada de eso se cumple hoy. Este corpus existe para que se pueda cumplir sin volver a auditar desde
cero.
