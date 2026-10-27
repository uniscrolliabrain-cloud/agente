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
| `audit:idempotency` | marcas `NOMBRE_V1`: aparcadas en dos sitios con cuerpo distinto o repetidas en el mismo fichero | cualquiera de las dos | **idempotencia**. No ejecuta nada: no comprueba que una operacion con la misma clave ocurra una vez (V1) |
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

## Estado hoy (2026-10-27, `e3787a6` + V0)

Verde: `typecheck`, `typecheck:worker`, `test`, `audit:layers`, `audit:bridges`,
`audit:anchors`, `audit:tenant-default`.
Rojo: `audit:contracts` (154 implementados · 14 PENDING · **150 huerfanos**) y
`audit:idempotency` (**157 duplicadas** · 9 huerfanas · **138 repetidas**).
Advisory: `audit:console` (42 ocurrencias en 226 ficheros).

Los dos rojos son de antes de esta campana y siguen ahi a proposito: **no se relaja un
check para ponerlo verde**. Se vacian con criterio en V1 (idempotencia) y V2
(contratos), cada uno con su test.

## Rendimiento medido (maquina del founder, 2026-10-27)

| Step | Tiempo |
|---|---|
| `typecheck` | 251 s |
| `typecheck:worker` | 2 s |
| `audit:contracts` | 17 s |
| resto de audits | 0,7 – 2,2 s |
| `test` | **no termino en 32 min** (el mismo glob tarda ~151 s en el sandbox de referencia) |

Consecuencia practica: **el gate completo no cabe en una sesion corta** en esta
maquina. Para iterar, `pnpm gate --only=<step>`, que es para lo que existe el flag.

La lentitud del step `test` (>13x el sandbox, con procesos hijos que van rotando: avanza
por lotes, no esta colgado) **no tiene causa establecida**. No se ha medido si es el
sistema de ficheros de Windows, el transform de `tsx` en frio o tests que esperan un
timeout de red. Queda como campana propia, con el dato de que en CI (Linux) el mismo
step tarda dos minutos y medio.
