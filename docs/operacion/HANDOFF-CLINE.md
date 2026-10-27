# HANDOFF-CLINE — auditar el corpus, el código y el historial, y dejar una sola verdad

> **Misión**: el repositorio tiene 804 ficheros Markdown (254 solo en `docs/`, 34.885
> líneas) y varios de ellos se contradicen entre sí y con el código. Tu trabajo no es
> "ordenar la documentación": es **auditarla, resolver las contradicciones con la línea
> de código que decide, archivar lo que ya no manda y dejar un índice único** desde el
> que se pueda trabajar sin volver a leer 35.000 líneas.
>
> **Base verificada**: rama `campaign/authz-tenant`, tip `c5a8c7c` (2026-10-27).
> **No escribes código.** Ni una línea de `.ts`, `.tsx`, `package.json`, workflows ni
> `scripts/`. Todo lo técnico que falte lo pides por el PR y lo implementa el lane 1.
>
> Documentos hermanos: [HANDOFF-CODEX.md](HANDOFF-CODEX.md) (mapa de lanes y
> propiedad de ficheros), [HANDOFF-LLM.md](HANDOFF-LLM.md) (la campaña grande, de
> Codex), [AUDITORIA-LLM-WORKSPACE.md](AUDITORIA-LLM-WORKSPACE.md) (los 12 defectos del
> camino LLM), [CAMPANA-VERDAD.md](CAMPANA-VERDAD.md) (mi campaña: el gate).

## 0. Qué se te pide exactamente

| # | Entregable | Fichero que produces |
|---|---|---|
| E1 | Índice único y verificado de la documentación | `docs/README.md` (reescrito) |
| E2 | Archivo del corpus histórico, con su índice y qué lo sustituye | `docs/archive/2026-10-27-corpus/INDICE.md` |
| E3 | Foto verificada del estado real (código + gates + números) | `docs/operacion/ESTADO-REAL.md` |
| E4 | Las contradicciones resueltas, una por una, con la evidencia que decide | `docs/operacion/DECISIONES-DOCS.md` |
| E5 | La historia de campañas con sus hashes y qué quedó de cada una | `docs/operacion/HISTORIA-CAMPANAS.md` |
| E6 | Política para los ~524 docs que viven dentro de `packages/workspaces` y `apps/web` | sección en E1 + lista de vivos en E2 |

Lo que **no** es tu entregable: arreglar el código, tocar los audits, cambiar el CI,
"modernizar" un documento vivo, o decidir producto. Lees, verificas, archivas y escribes.

## 1. Reglas de oro

1. **Un doc viejo no se corrige: se archiva y se escribe el nuevo.** Editar
   `TODO-FOR-PROD.md` para que diga lo contrario de lo que dice es perder la única
   señal de que hubo una decisión anterior.
2. **Nunca borres. Mueve y deja rastro** en el `INDICE.md` del archivo: qué se movió,
   cuántos ficheros, por qué y qué documento lo sustituye.
3. **Sin comando no hay afirmación.** Si dices "el runner ya descubre tests anidados",
   pegas el `grep` o el script `test` de `package.json` que lo demuestra. Si no lo
   corriste, escribes **pendiente**.
4. **Un dato con fecha.** Todo número que cites lleva el commit y la fecha en que lo
   mediste. El corpus actual está lleno de estados reales de hace dos semanas que ya
   no son verdad.
5. **No toques los documentos que mandan a otros lanes**: `docs/roadmap/**`,
   `docs/vertical_slice/**`, `docs/operacion/{HANDOFF-*,SECRETOS,DEPLOY,AUDITORIA-*}`.
   Los citas y, si están mal, lo dejas escrito en E4 para que lo arregle su dueño.
6. **Un PR. Sin reformateos masivos.** Un `git mv` no cambia el contenido: si el diff de
   un fichero supera el 30%, estás reescribiendo en vez de moviendo.

## 2. Estado del repo, medido hoy

Esto es lo que puedes dar por cierto sin volver a medirlo (y lo que tienes que
re-medir antes de escribirlo en E3):

| Comprobación | Resultado | Comando |
|---|---|---|
| `typecheck` | limpio | `pnpm typecheck` |
| Suite | 439 tests · 427 pass · 12 skip · 0 fail **sobre `c69e028`** — re-medir antes de citarlo | `pnpm test` |
| `audit:layers` · `bridges` · `console` · `tenant-default` · `anchors` | **verdes (5/7)** | `pnpm run --silent audit:<x>` |
| `audit:contracts` | **rojo**: 154 OK · 14 PENDING · **150 huérfanos** | idem |
| `audit:idempotency` | **rojo**: 157 duplicadas · 4 huérfanas · **138 repetidas en el mismo fichero** | idem |
| `audit:coherence` | **rojo**: 5/7 | `pnpm audit:coherence` |
| Deploy | no sale de `main`: sale de un tag `v*` (`deploy.yml`) | lectura |
| `pnpm lint` (biome) | rojo repo-wide y **fuera del CI**: no es criterio | — |

Consecuencia que tienes que dejar escrita en E3: **el gate de despliegue hoy no
pasaría**, porque `deploy.yml` exige `audit:coherence` y `ci.yml` exige los seis
audits. No es un detalle: es la razón de que no haya nada publicado.

## 3. El corpus, medido

```
804 ficheros .md (sin node_modules)   ·   254 en docs/ = 34.885 líneas
packages/workspaces  375      apps/web  149      docs/miniaudits  118
docs/ui               27      docs/codespace-automation  24
docs/roadmap          19      docs/operacion  10      docs/archive  10
docs/vertical_slice    9      docs/2026-10-18-resultados  9
docs/kernel            3      docs/estado  3      docs/trabajos  2
```

**Fuente de verdad hoy** (poca cosa, y está bien así):

| Documento | Manda sobre |
|---|---|
| `docs/operacion/SECRETOS.md` | cuentas, claves y orden de necesidad |
| `docs/operacion/DEPLOY.md` | topología, dominios, secretos, Postgres |
| `docs/operacion/HANDOFF-CODEX.md` | lanes, propiedad de ficheros, contratos de adaptadores |
| `docs/operacion/HANDOFF-LLM.md` | la campaña del camino LLM (dueño: Codex) |
| `docs/operacion/AUDITORIA-LLM-WORKSPACE.md` | los 12 defectos con evidencia |
| `docs/roadmap/**` | dirección de producto por etapas (19 docs) |
| `docs/vertical_slice/**` | el plan del primer producto vendible (9 docs) |

Todo lo demás es histórico, duplicado, generado o ruido. Tu trabajo es decirlo con
nombres y números, no con un adjetivo.

## 4. Lo que hay que archivar, con la evidencia que lo justifica

### 4.1 Duplicados exactos (verificado con `diff -rq`, salen idénticos)

| Copia | Original que se queda |
|---|---|
| `docs/codespace-automation/deliverables/**` (9 ficheros) | `docs/2026-10-18-resultados/**` |
| `docs/trabajos/IA-1-fast-slow-chat-memoria.md` | `docs/miniaudits/10-fast-slow-llm/IA-1-…md` |
| `docs/kernel/AUDIT_IDEMPOTENCY.md`, `AUDIT_CONTRACTS.md`, `AUDIT_TENANT_DEFAULT.md` | los de `docs/` raíz — y ojo: **las copias de `docs/kernel/` son del 2026-10-03**; las de la raíz se regeneran en cada audit (hoy, 2026-10-27) |

### 4.2 Generados que no deberían estar versionados

`docs/AUDIT_CONTRACTS.md` (341 líneas) y `docs/AUDIT_IDEMPOTENCY.md` (734) los
**escribe el audit en cada ejecución**. Consecuencia real: cualquiera que corra
`pnpm audit:coherence` deja el worktree sucio, y la copia versionada siempre está
desfasada. En E3/E4 deja la recomendación (mover la salida a `artifacts/audits/` y
guardar en `docs/` solo un resumen de 20 líneas); **no los muevas tú**, es mi lane.

### 4.3 Ruido puro

```
docs/miniaudits/26-capability-e2e-miniaudit (1).md      descarga duplicada, con " (1)"
docs/a.coherencia.summun.md/                            directorio con un fichero de 0 líneas
docs/miniaudits/_backup-10-fast-slow-llm-*/  (×2)       dos backups completos de un miniaudit
20 × docs/miniaudits/*/fixes.md  (<400 bytes)           plantillas vacías, sin contenido
apps/web/src/34-workspaces-pipeline.md.bak-V1           copia de seguridad commiteada
```

### 4.4 Histórico con valor (archivar, no borrar)

`docs/archive/**` (10), `docs/2026-10-18-resultados/**` (9), `docs/miniaudits/**`
(118: 24 miniaudits + backups + SOP/POLICY/PROTOCOLO), `docs/ui/**` (27),
`docs/estado/**` (3), `docs/agentes/LOG.md`, `docs/WHITEPAPER.md` (614),
`docs/PLAN-6-FASES.md` (593), `docs/ESTADO-REAL.md` (346), `docs/agents-snapshot.md`
(2.260), `docs/mockups/TEMPLATES_V2.md` (500), `gpt-audit.md` (raíz),
`protocolo.typescript-v2.md` (raíz), `BETA.md` + `CHANGELOG.md` + `CONTRIBUTING.md`
(raíz: estos se quedan, son el contrato de contribución).

## 5. Las contradicciones, resueltas con evidencia

Esto es lo que de verdad se te paga. Cada fila es un documento que miente hoy.

| # | Documento | Dice | La realidad (evidencia) | Qué hacer |
|---|---|---|---|---|
| C1 | `docs/README.md` (v1, 2026-10-04, "Estado: current") | índice oficial: `./ROADMAP.md`, `./KNOWN_ISSUES.md`, `./future_plans.md`, `./interfaz/…`, `../SECURITY.md`, `WORK_LOG_2026_10_03.md` | Ninguna de esas rutas existe: son `docs/estado/ROADMAP.md`, `docs/estado/KNOWN_ISSUES.md`, `docs/estado/FUTURE.md`, `docs/ui/…`; `SECURITY.md` no existe en la raíz. Y dice "`archive/` pendiente de crear en Wave 2" cuando `docs/archive/` tiene 10 documentos | Reemplazar por E1 |
| C2 | `docs/roadmap/00-BASELINE.md` (2026-10-25) | "Rama: `main`. Último commit: `677f030`". "`pnpm test` **no** descubre `tests/campaign-3/` ni anidados" | El runner es `tests/**/*.test.ts` desde `00adb41` ("el test runner descubre tambien los tests anidados"); el tip es `c5a8c7c` y `main` va por `c69e028` | Caducado: archivar la foto y dejar que E3 la sustituya |
| C3 | `docs/operacion/TODO-FOR-PROD.md` (2026-10-04) | "Multitenancy: un deployment por cliente". "Lo que **NO** se hace en este repo: Multitenancy" | Hay RLS, claim de tenant en JWT, `switch-tenant`, `admin-tenants` y tests de aislamiento; y `DEPLOY.md` §1 decide **un** deployment compartido con tenant por token | Contradicción de producto: resolverla en E4 y archivar el doc |
| C4 | `docs/operacion/PRODUCCION.md` (2026-10-04) | Guardrails como reales: "1M tokens/día", "50 EUR/día" | `AUDITORIA-LLM-WORKSPACE.md` D2/D3: el consumo se cuenta en **caracteres** y la cuota compara owner con tenant | El doc describe un límite que no existe: decirlo en E4 |
| C5 | `docs/operacion/SECRETOS.md` §7 | "el único canal con adaptador real es WhatsApp vía Evolution (`WHATSAPP_API_KEY` + `WHATSAPP_BASE_URL` + `WHATSAPP_INSTANCE`)" | El webhook entrante usa `WHATSAPP_APP_SECRET` + `WHATSAPP_VERIFY_TOKEN`, y el contrato de nombres es `scripts/secrets-check.ts` | Leer `secrets-check.ts` + `.env.example` y dejar **una** tabla de nombres en E4 |
| C6 | Los 34 `packages/workspaces/*/workspace.json` | `"status": "scaffold"` (34 de 34) | El contrato que registra el runtime declara `status: "implemented"` (auditoría D10), y `docs/ui/34-workspaces-pipeline.md` (878 líneas) los cuenta como producto | Tres estados para lo mismo: E3 lo deja escrito; el arreglo es de otro lane |
| C7 | `docs/roadmap/README.md` | 15 etapas con estados fijados el 2026-10-25 sobre `677f030` | Desde entonces: authz JWT, tenants, deploy, SOPs de agencia, webhook firmado, 2 campañas | El mapa macro va una campaña por detrás: anotarlo en E3 sin reescribir el roadmap |
| C8 | `docs/README.md` §Convenciones | "Un doc tiene cabecera `> vN · fecha · Estado: current\|draft\|archived`" | La convención se fijó el 2026-10-04 y la cumplen **77 de 254** docs (medido: `grep -rlE '^> v[0-9]+ · ' docs --include='*.md' \| wc -l`); los otros 177 no declaran estado | E1 la vuelve a fijar y E2 marca lo que no la cumple |

## 6. Criterios de hecho, entregable a entregable

- **E1** — cada entrada del índice tiene ruta, qué es, estado (`vivo` / `histórico` /
  `generado`), dueño y fecha de verificación. **Cero** rutas que no existan. Es
  verificable: cualquier `link` del índice se resuelve con un `test -f`.
- **E2** — el `INDICE.md` del archivo lista cada bloque movido con nº de ficheros,
  motivo y sustituto. Ningún fichero borrado (`git status` debe mostrar `R`, no `D`).
- **E3** — cada afirmación con su comando o su `fichero:línea`. Incluye una sección
  "no verificado" con lo que no pudiste comprobar (red, claves, proveedores).
- **E4** — las 8 contradicciones de §5, cada una con: qué decía, qué es verdad, qué
  evidencia lo prueba y qué documento gana. Las que no puedas cerrar, **abiertas** y
  con la pregunta exacta al dueño.
- **E5** — una campaña por fila: hash inicial→final, qué cambió y qué quedó vivo. Las
  ramas están en el remoto: `git log --oneline` de cada una es la fuente.
- **E6** — la regla: los `docs/` dentro de `packages/workspaces/*` y
  `apps/web/src/workspaces/*` son **especificaciones de workspace** (se quedan, son el
  contrato de cada uno de los 34); los de `apps/web/src/*.md` sueltos son notas de
  traspaso (archivar). Decide y justifica, no lo dejes en "depende".

## 7. Cómo se verifica tu trabajo

```bash
git fetch origin && git switch main && git pull --ff-only
git switch -c docs/auditoria-corpus

# mientras trabajas
git status --short          # cada movimiento debe salir como R, nunca D
git diff --stat             # un mv no debe inflar el diff del contenido

# antes de pedir revisión
git diff --stat origin/main...   # si un .md movido cambia >30%, son dos commits
```

No tienes que compilar nada: no tocas código. Si tu PR toca un `.ts`, está mal.

## 8. Brief para pegar en Cline

```
Repo: uniscrolliabrain-cloud/agente. Base: main. Rama: docs/auditoria-corpus.

Lee entero docs/operacion/HANDOFF-CLINE.md: es tu mandato y tu contrato de verificación.
Eres el lane de documentación: NO escribes código (ni .ts, ni package.json, ni workflows,
ni scripts). Si falta algo técnico, lo pides en el PR.

Entrega 6 cosas (seccion 0): docs/README.md nuevo (indice unico verificado),
docs/archive/2026-10-27-corpus/INDICE.md (mover, nunca borrar), docs/operacion/ESTADO-REAL.md
(foto verificada con comando por afirmacion), docs/operacion/DECISIONES-DOCS.md (las 8
contradicciones de la seccion 5 resueltas con evidencia), docs/operacion/HISTORIA-CAMPANAS.md
(una campana por fila con hashes) y la politica de los ~524 docs de packages/workspaces y
apps/web.

Reglas: un doc viejo no se corrige, se archiva y se escribe el nuevo. Nada de afirmaciones
sin comando; lo que no verifiques va como PENDIENTE. No toques docs/roadmap/**,
docs/vertical_slice/** ni docs/operacion/{HANDOFF-*,SECRETOS,DEPLOY,AUDITORIA-*}: los citas
y, si estan mal, lo dejas escrito en DECISIONES-DOCS.md. Un PR, sin reformateos masivos,
git mv en vez de borrar.

Criterio de hecho: cero rutas inexistentes en el indice, cero ficheros borrados, cada
afirmacion con su evidencia, y las contradicciones o resueltas o abiertas con la pregunta
exacta. Marca como pendiente todo lo que no hayas podido ejecutar; no lo declares hecho.
```

## 9. Lo que NO debes hacer

- Inventar el estado de algo porque "debería estar así". El corpus ya está lleno de eso.
- Reescribir `docs/roadmap/**` o `docs/vertical_slice/**` porque estén desfasados: son
  contratos de dirección y su dueño es otro.
- Mover `docs/operacion/*` vivo al archivo. Si dudas, pregunta en el PR.
- Borrar `docs/miniaudits/**`: son 118 ficheros de historia real de decisiones. Se
  archivan enteros, con índice.
- Convertir este trabajo en un rediseño de la documentación. El objetivo es que se
  pueda trabajar: un índice que no miente, un estado real que se puede citar y un
  archivo con rastro.
