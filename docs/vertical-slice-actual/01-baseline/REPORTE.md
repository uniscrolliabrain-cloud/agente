# Campaña 01 · Baseline ejecutable y superficie autorizada — REPORTE

**Fecha:** 2026-11-08T16:55Z
**Base:** `main` = `a3faf00` (el plan se auditó sobre `5292455`, dos commits por detrás; se trabaja sobre el HEAD actual)
**Rama:** trabajo local sobre `main`, sin push (pendiente de tu OK)
**Estado:** **gate de campaña CUMPLIDO** (ver "Aserción de cierre")

## Qué se ha creado y modificado

### Crear

- `scripts/verify-vertical-slice.ts` — nuevo comando del slice. Encadena entorno → typecheck → typecheck del worker → tests focalizados → smoke HTTP autenticado. Flags: `--only <paso>` (coma separada). Cada paso imprime su exit real; exit 1 si falla cualquiera.

### Modificar

- `package.json` — script `verify:slice`. No toca ningún script existente.
- `.github/workflows/ci.yml` — paso `vertical slice smoke` tras los audits: `pnpm verify:slice --only smoke`. No sustituye al gate: typecheck y suite ya corren antes en el mismo job.

## Evidencia (comandos y exits reales)

**Entorno medido:** Node `v26.13.0`, pnpm `11.19.0` (fijado en `packageManager`), `pnpm-lock.yaml` presente, instalación congelada ya aplicada (`--frozen-lockfile`, "Already up to date").

### Paso a paso (`pnpm verify:slice`)

```
[verify:slice] OK   entorno             0.0s  node v26.13.0 · pnpm@11.19.0 · lockfile presente
[verify:slice] OK   typecheck           9.4s  exit=0
[verify:slice] OK   typecheck:worker    1.3s  exit=0
[verify:slice] OK   test:focalizado     4.5s  exit=0
[verify:slice] OK   smoke               3.6s  ok modo sample · ok health 200 · ok sin sesión no entra (401)
                                              · ok login devuelve token (200) · ok con sesión responde 200 (200)
[verify:slice] 5/5 pasos OK
exit=0
```

El smoke es real: arranca `createApp` contra un store temporal, crea el admin, hace login y recorre `/api/health`, `/api/agent` sin token y `/api/agent` con token. Sin proveedores ni red (`ALLOW_NETWORK=0`).

### Build desde árbol limpio

```
pnpm build:server   -> exit=0   (tsc -p tsconfig.build.json)
```

`dist/` no queda rastreado (0 ficheros en `git ls-files dist`).

### Clasificación del modo live

```
env -u AGENTE_ACCESS_KEY -u TOKEN_ENCRYPTION_KEY WORKSPACE_MODE=live node --import tsx -e 'readConfig()'
ERROR: Live mode requires AGENTE_ACCESS_KEY (24+ characters) and TOKEN_ENCRYPTION_KEY (32-byte base64)
exit=1
```

Fallo heredado, reproducible y **correcto**: modo live no arranca sin credenciales. No es un defecto de esta campaña.

## Aserción de cierre

> Un checkout limpio arranca o deja un fallo reproducible con ruta exacta; CI devuelve el exit real.

**Cumplida.** El checkout arranca con `pnpm verify:slice` (5/5, exit 0), el fallo de live deja mensaje y exit exactos, y el CI ejecuta el smoke con el exit real del comando.

## Fallos heredados (fuera del alcance de la 01)

| Fallo | Comando | Exit | Reproducción |
|---|---|---|---|
| `contracts`: 79 contratos sin uso ni decisión | `pnpm audit:contracts` | 1 | Inventario en `limpieza-general/pendientes.md` §4 y `artifacts/gate/audits/AUDIT_CONTRACTS.md` |
| 12 tests permanentemente saltados | `pnpm test` | 0 | 9 E2E vacíos en `tests/campaign-3/e2e-02..12-skip.test.ts` + `b30`; 2 con `{skip: "TODO"}` |
| 219 `console.*` fuera de la superficie del audit | `pnpm audit:console` | 0 (advisory) | Incluye tests y scripts |

`pnpm gate` sigue en exit 1 **sólo** por `contracts`; el resto verde (typecheck, worker, suite 572/555/0 fail, layers, bridges, console, anchors, idempotency, tenant-default).

## No verificado en este sandbox

- **Imagen final**: Docker CLI presente (29.1.3) pero sin permiso al socket (`permission denied ... /var/run/docker.sock`). El `Dockerfile` existe y su `CMD` es `node dist/apps/server/src/index.js`; el build de TypeScript sí está acreditado (exit 0). Requiere un entorno con daemon accesible.
- **Live con credenciales reales**: no hay claves ni entorno de staging aquí.

## Diferencia a decidir

CI usa Node 22 y este entorno Node 26; `engines` exige `>=22.6`. No es un fallo, pero la 01 pedía "fijar Node/pnpm": hoy el pin real es pnpm 11.19.0 + Node 22 en CI. Si quieres un único Node de referencia, se cambia en `ci.yml` y en `engines`, y se anota aquí.

## Rollback

1. Borrar `scripts/verify-vertical-slice.ts`.
2. Quitar `verify:slice` de `package.json`.
3. Quitar el paso `vertical slice smoke` de `.github/workflows/ci.yml`.

Sin migración de datos ni cambios de contrato; la 02 no consume nada de esta campaña salvo el arnés de smoke.

## Entrega a la campaña 02

- `pnpm verify:slice` como comprobación de arranque reutilizable (el smoke crece con el slice).
- Contrato que consume 02: `createApp(db, config)` en modo sample, con login y `/api/agent` ya acreditados por HTTP.
- Pendiente heredado que 02 debe mirar: `/api/agent` sin token ya devuelve **401** hoy; el trabajo de 02 es que un tenant ajeno, un scope alterado y una DB caída fallen sin caer a `default`.
