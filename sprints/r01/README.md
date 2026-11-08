# Ronda 1 · auditoría profunda de los 10 carriles

Diez carpetas, un carril cada una. Cada agente escribe **solo** dentro de la suya y en su rama.
Yo leo los diez `REPORTE.md` y consolido. Cline corre la suite en paralelo: no toquéis `tests/` compartido.

```
sprints/r01/
  a01-contratos/       BRIEF.md  REPORTE.md
  a02-contexto/        ...
  a10-release/         ...
```

## Cómo se usa una carpeta

1. El agente lee `BRIEF.md` entero antes de escribir una línea.
2. Trabaja en `sprint/r01-aNN-slug` creada desde el SHA que anota en `REPORTE.md`.
3. Rellena `REPORTE.md` mientras trabaja, no al final.
4. Si algo del briefing es falso, **lo escribe en `REPORTE.md` como corrección**, no lo ignora. Yo puedo haberme equivocado, y de hecho ya corregí dos cosas mías en este documento.

## Preparar el entorno (obligatorio antes de medir nada)

El sandbox no trae `node_modules` ni `pnpm` en el PATH: las dependencias son desechables.

```bash
npx --yes pnpm@11.19.0 install --frozen-lockfile
```

Mientras no esté instalado, los tests y `tsc` fallan por módulos ausentes (`react`, `tsx`, `typescript`), no por el código. Los audits estáticos sí funcionan sin dependencias porque Node ≥22.6 ejecuta TypeScript nativo:

```bash
node scripts/audits/contracts.ts        # sin node_modules
node --import tsx scripts/audits/contracts.ts   # con node_modules, igual que el gate
```

## El gate no está verde hoy (medido, no heredado)

Ejecutado sobre `0c8fe81`:

| Audit | Exit | Dato real |
|---|---|---|
| `layers` | 0 | 0 violaciones |
| `bridges` | 0 | 16/16 wired |
| `console` | 0 (advisory) | 24 ocurrencias en 231 ficheros |
| `anchors` | 0 | "No hay bloques para revisar" |
| `contracts` | **1** | OK 149 · MÓDULO 90 · HARNESS 1 · PENDING 0 · ALLOWLIST 0 · **HUÉRFANOS 78** |
| `idempotency` | **1** | **5** bloques pegados dos veces / marcas sin código |
| `tenant-default` | 0 | 131 permitidas · 0 prohibidas |

Consecuencia: `pnpm gate` falla hoy por dos audits bloqueantes. Cualquier agente que diga "el gate está verde" está midiendo otra cosa o no lo ha corrido. Arreglarlo (o declarar cada caso en la allowlist con motivo y fecha) es trabajo real de esta ronda, repartido entre A01 y A10.

**Corrección de mi primer borrador:** había escrito que el registro decía 24 ocurrencias de `console` y un grep daba 53, y que el número del registro estaba obsoleto. Falso. El audit cuenta 24 en su superficie (231 ficheros); mi grep contaba otra cosa (incluye rutas y los propios ficheros de audit). El registro es correcto.

## Lo que ya está medido (baseline de la ronda)

| Dato | Valor | Cómo se midió |
|---|---|---|
| Ficheros de test | 122 (119 en `tests/`, 3 en `apps/` fuera del glob) | `find` + `fs.globSync` |
| Glob de tests | recorre subcarpetas: 119 de 119 | `globSync('tests/**/*.test.ts')` |
| Tests permanentemente skip | 9 E2E + 1 en `b30` | `grep` de `\.skip\(` |
| CI vs gate, timeout de test | CI 10 s · gate 30 s | `package.json` vs `scripts/gate-report.ts` |
| CI con job no bloqueante | `worker` → `continue-on-error: true` | `.github/workflows/ci.yml:42` |
| Audits | 7 en el registro, 6 bloqueantes, `console` advisory | `scripts/audits/registry.ts` |
| `as any` en server | 10 | `grep -rn` |
| `TODO/FIXME/HACK` en server | 5 | `grep -rn` |
| Personas del tenant `agntia` | **0** (las 13 viven en `clientes/default/`) | `ls clientes/*/personas` |
| `pipeline` en `agency.json` de agntia | `[]` | lectura del fichero |
| Componentes web | 31 `.tsx`, 43 ficheros con `fetch` | `find` + `grep` |
| Registros de ruta en `app.ts` | 68 | `grep` |

## Tres hallazgos que cruzan carriles y no son de nadie en concreto

1. **`renderContext` escapa de más** ([assembly.ts:52](apps/server/src/engine/context/assembly.ts#L52), [assembly.ts:77](apps/server/src/engine/context/assembly.ts#L77)): los saltos de línea del contexto son `\n` literales, no saltos. Afecta a todos los prompts, no solo a Laia. Dueño: **A02**.
2. **El feedback del usuario no se usa** ([assembly.ts:36](apps/server/src/engine/context/assembly.ts#L36) `void options.multipliers`), aunque el comentario `FEEDBACK_SCORING_APPLIED_V1` afirme lo contrario. Dueño: **A02**, consumidor **A03**.
3. **El CI no es el gate**: 6 audits a mano en un `run: |` (con `bash -e`, el primero en rojo oculta el resto), timeout de test de 10 s y un job `worker` que no bloquea. `pnpm gate` sí lo hace bien y nadie lo usa en CI. Dueño: **A10**.

## Reglas que no se negocian en esta ronda

- Ninguna tarea de R1 implementa funcionalidad nueva. Si un agente "arregla" algo sin test que lo pruebe, el trabajo se rechaza.
- No tocar `pnpm-lock.yaml`, `package.json`, `app.ts`, `db.ts`, `db-tenant.ts` ni `.github/workflows/` salvo el carril dueño (A10 para CI, A01 para `package.json` si de verdad hace falta).
- Un `REPORTE.md` sin la salida real de un comando es un reporte vacío.
- Prohibido subir timeouts, añadir `skip` o relajar aserciones para poner verde. Se reporta rojo.
