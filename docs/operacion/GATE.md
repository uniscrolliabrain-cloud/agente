# GATE — el unico comando que dice si el repo esta bien

> `pnpm gate` corre typecheck + typecheck del worker + la suite + las siete
> auditorias, y deja un JSON y un resumen en `artifacts/gate/`.
> Definicion: [scripts/gate-report.ts](../../scripts/gate-report.ts).
> Lista de auditorias: [scripts/audits/registry.ts](../../scripts/audits/registry.ts) (una sola).

## Como se corre

```bash
pnpm gate                                  # todo
pnpm gate --only=test                      # un step (para iterar sin pagar el resto)
pnpm gate --only=audit:contracts,audit:idempotency
```

Exit: **0** todo lo bloqueante en verde · **1** algun step bloqueante en rojo ·
**2** `--only` no selecciona nada (un gate que no corrio no es un gate que pasa).

## Que deja

| Ruta | Que es |
|---|---|
| `artifacts/gate/report.json` | resultado completo, legible por maquina: por step, exit, duracion, contadores y las ultimas lineas |
| `artifacts/gate/summary.txt` | el resumen de una pantalla (el mismo que sale por stdout) |
| `artifacts/gate/logs/<step>.log` | la salida entera de cada step |
| `artifacts/gate/audits/*.md` | los informes de las auditorias (`AUDIT_REPORT_DIR`) |

`artifacts/` esta en `.gitignore`, asi que **nada de esto se versiona**. Antes cada
auditoria escribia su informe dentro de `docs/` en cada corrida: el worktree quedaba
sucio y la copia versionada siempre estaba desfasada.

## Los diez steps

| Step | Que comprueba | Falla cuando | Que NO cubre |
|---|---|---|---|
| `typecheck` | `tsc --noEmit` sobre `apps/server`, `packages` y `tests` (tsconfig raiz) | cualquier error de tipos | `scripts/**` no entra en el `include` del tsconfig raiz: solo se typechequea lo que importa algun test. No cubre `apps/web` (job propio) |
| `typecheck:worker` | `tsc --noEmit` con el tsconfig de `apps/worker` (Playwright) | cualquier error de tipos | el runtime del worker (necesita contenedor y navegador) |
| `test` | `node:test` sobre `tests/**/*.test.ts` con `tests/setup.ts` | cualquier test en rojo | `apps/worker/tests` (Docker), `apps/computer/smoke.test.ts`, y todo lo que exija red o una API key real (sin proveedor, algunos tests se saltan) |
| `audit:layers` | imports prohibidos entre capas (domain→apps, web→server) | alguna violacion. Desde `AUDIT_LAYERS_EXIT_V1` **puede** fallar: antes imprimia el numero y salia 0 | re-export por barrel; solo mira lineas que contienen `import` |
| `audit:bridges` | los 16 puentes declarados existen con sus ficheros y marcas | falta un puente | que el puente **funcione**: verifica presencia, no comportamiento |
| `audit:console` | ocurrencias de `console.*` en `apps/server/src` | nunca: es **advisory** (hoy 42) | logs en `packages/**` y `apps/web`. Convertirlo en error es otra campana, no un cambio de umbral |
| `audit:anchors` | los anclajes de los bloques `.ps1` guardados existen en el arbol real | hay anclajes rotos | bloques que nadie ha pegado en `scripts/audits/blocks/` (hoy 0: el check no tiene nada que revisar) |
| `audit:contracts` | contratos del dominio con implementacion real | hay contratos sin implementar y sin marca `PENDING` | que el contrato **se use**: su heuristica es "el nombre aparece en algun fichero" (V2 la endurece a import real) |
| `audit:idempotency` | marcas `NOMBRE_V1`: defectos reales (marca sin codigo detras, mismo bloque pegado dos veces) + indice informativo de duplicadas/repetidas | un defecto sin revisar en la allowlist | **idempotencia en runtime**. No ejecuta nada: eso lo mide `tests/gate/idempotency-execution.test.ts` (V1) |
| `audit:tenant-default` | usos del tenant `default` fuera de lo permitido | alguna ocurrencia prohibida | que el aislamiento entre tenants funcione en runtime: eso son los tests de `tenant-http-e2e` |

## Los contadores miden el corpus, no el comportamiento

Comprobado en esta campana: al añadir **5 ficheros nuevos** (3 scripts y 2
documentos) sin tocar una linea de aplicacion, `audit:idempotency` paso de 815 a 820
ficheros revisados y de 4 a 9 huerfanas, y `audit:tenant-default` de 492 a 497
ficheros. Los dos audits recorren el arbol entero, `docs/` y `scripts/` incluidos.

Dos consecuencias que conviene tener presentes al leer un numero:

1. Los contadores de `contracts` e `idempotency` se mueven al **documentar**, no al
   programar. Un cambio en `docs/` puede cambiar el veredicto del gate.
2. Los informes versionados en `docs/AUDIT_*.md` son fotografias con fecha
   (`docs/AUDIT_CONSOLE.md` es del 2026-10-26 y declara 24 ocurrencias; hoy el mismo
   audit, sobre los mismos 226 ficheros, cuenta 42). Ya no se regeneran ahi: los
   escribe el gate en `artifacts/gate/audits/`. Su retirada de `docs/` es del corpus
   documental ([HANDOFF-CLINE.md](HANDOFF-CLINE.md)), no de esta campana.

## Lo que el gate no cubre

- **Red y proveedores**: ni una llamada. El gate entero corre en local. Que Supabase,
  Meta, Vapi, Resend o Stripe respondan bien no lo dice este comando.
- **Calidad de las respuestas del modelo**: cero. Hay tests que comprueban contratos y
  flujo, no que el texto sea bueno.
- **Aislamiento entre tenants en runtime**: parcial. El gate cubre el codigo estatico
  (`tenant-default`) y la suite cubre `tenant-http-e2e`; no cubre una base de datos
  real con dos tenants.
- **Visual**: nada de `apps/web`. Que el panel se vea bien no lo verifica esto.
- **Coste real**: nada. Los contadores de uso de tokens son de F2 del mandato LLM.
- **`pnpm lint`** (biome): **no es un gate**. Sale rojo repo-wide y queda como campana
  aparte; el formato de los ficheros que toca cada fase se aplica a mano.

## Estado hoy (2026-10-28, `7ff1a77` + V1)

Verde: `typecheck`, `typecheck:worker`, `test`, `audit:layers`, `audit:bridges`,
`audit:anchors`, `audit:tenant-default` y **`audit:idempotency`** (0 huerfanas, 0
pegadas sin revisar, 152 duplicadas y 141 repetidas como indice).
Rojo: `audit:contracts` (154 implementados · 14 PENDING · **150 huerfanos**).
Advisory: `audit:console`.

`audit:idempotency` paso de rojo a verde con **criterio, no con un umbral**: su
regla anterior fallaba por una campana aplicada en N call sites (`WITH_WRITE_WIRE_V1`
esta 54 veces porque hay 54 rutas que escriben). Ahora bloquea solo dos defectos
objetivos y cada excepcion se revisa en
[`scripts/audits/idempotency-allowlist.json`](../../scripts/audits/idempotency-allowlist.json)
con motivo y fecha. Detalle y numeros en [INFORME-IDEMPOTENCIA.md](../INFORME-IDEMPOTENCIA.md).

`audit:contracts` sigue rojo a proposito: **no se relaja un check para ponerlo
verde**. Se vacia en V2 con su informe, sin borrar contratos (decision del founder).

## Rendimiento medido (maquina del founder, 2026-10-27)

| Step | Tiempo |
|---|---|
| `typecheck` | 251 s |
| `typecheck:worker` | 2 s |
| `audit:contracts` | 17 s |
| resto de audits | 0,7 – 2,2 s |
| `test` | **no termino en 33 min** y se corto la corrida (el mismo glob tarda ~151 s en el sandbox de referencia) |

Consecuencia practica: **el gate completo no cabe en una sesion corta** en esta
maquina. Para iterar, `pnpm gate --only=<step>`, que es para lo que existe el flag.

### Causa medida del step `test` (no es un fichero colgado)

No hay un test que se atasque: **todos los ficheros son caros, y por la base de datos**.
Cada fichero llama a `createStore({ dataDir })` con un directorio temporal nuevo, y sin
`DATABASE_URL` eso levantando un cluster **PGlite** desde cero. Sonda directa
(`om-pglite-probe.ts`, ignorado por `.gitignore`) en esta maquina:

| Operacion | Tiempo | CPU del proceso (todo el guion) |
|---|---|---|
| `createStore` con dataDir **nuevo** | **35,3 s** | user 0,23 s + sys 0,73 s para los 70 s del guion |
| `createStore` con **otro** dataDir nuevo | **24,2 s** | idem |
| `createStore` reabriendo el **mismo** dataDir | 3,7 s | idem |
| `put` | 44 ms | |
| 20 x `get` | 194 ms (10 ms cada uno) | |

Es decir: **~70 s de reloj con menos de 1 s de CPU**. No es calculo, es espera de E/S
(escritura del cluster: initdb en WASM escribe muchos ficheros pequenos). El candidato
mas probable es el antivirus/filtro del sistema de ficheros de Windows, pero **eso no
esta probado** y no se puede probar aqui (sin admin, sin Docker y sin `psql` en la
maquina).

Dos consecuencias duras:

1. 111 ficheros de test x 25-35 s de base de datos por fichero = el step de 50+ minutos.
   En CI (Linux) el mismo glob tarda 151 s.
2. Varios tests **fallan** aqui con `test timed out after 10000ms`: su `before()` no cabe
   en el presupuesto de 10 s porque levantar la base de datos ya se lo come entero
   (`tests/agency-bootstrap.test.ts`, `tests/agent-api.test.ts`). Eso no es producto en
   rojo, es entorno.

Camino de salida, en orden de valor: (1) un Postgres real local o remoto via
`DATABASE_URL`, que elimina el initdb por fichero —es el mismo Neon que hace falta para
el despliegue—; (2) reutilizar un unico dataDir por corrida si se sigue con PGlite
(3,7 s en vez de 35 s, a cambio de tocar el aislamiento entre tests); (3) hacer el
timeout configurable para local, que es una adaptacion, no un arreglo.
