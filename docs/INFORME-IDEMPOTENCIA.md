# Informe · audit de idempotencia (V1 de la campaña VERDAD)

> Fecha: 2026-10-28 · Rama: `campaign/verdad` · Autor: Buffy
> Medido con `pnpm audit:idempotency` sobre `7ff1a77` + los cambios de esta fase.
> Para revisar antes de dar el criterio por bueno: **lee la sección 1 y la 3**.

## 1. Qué cambia y por qué (lo que hay que revisar)

El audit **no auditaba idempotencia**: contaba marcas de campaña (`NOMBRE_V1`) y
fallaba si una marca aparecía en dos ficheros con cuerpo distinto (**152**) o dos
veces en el mismo fichero (**141**). Eso no es un defecto, es la forma normal de
una campaña: un cambio se aplica en N call sites.

La medición que lo demuestra, sobre el repo de hoy:

| Marca | Veces en un fichero | Sitios en total |
|---|---|---|
| `WITH_WRITE_WIRE_V1` | **30** (en `engine/routes.ts`) | **54** |
| `WITH_READ_WIRE_V1` | 12 | 33 |
| `KERNEL_NONFATAL_V1` | — | 10 |
| `TAKE_FOR_TENANT_COMPUTER_V1` | 7 | 7 |

`WITH_WRITE_WIRE_V1` es "withWrite aplica PDP + CAS": está 54 veces porque hay 54
rutas que escriben. Para poner verde el criterio anterior había que **borrar esas
54 marcas** o renombrarlas, es decir, destruir el libro de mantenimiento para
satisfacer al check.

### Criterio nuevo (`IDEMPOTENCY_MARKS_V2`)

| Categoría | Qué es | ¿Bloquea? |
|---|---|---|
| índice · duplicadas con cuerpo distinto | la marca vive en varios sitios | no |
| índice · repetidas en el mismo fichero | la marca se aplicó en N call sites | no |
| defecto · **orphan** | marca en un comentario y **cero** líneas de código detrás en todo el fichero | **sí** |
| defecto · **double-paste** | misma marca, mismo fichero y **mismo cuerpo** dos veces | **sí** |

Dos cambios de heurística, ambos con evidencia:

1. **Huérfana = presencia, no volumen.** V1 pedía ≥3 líneas de código y marcaba
   como hueco `log-reexport.ts` (`export { logInfo } from "../log.ts";`), que es un
   barrel de una línea: implementación, no hueco. V2 pide que exista **alguna**
   línea de código. Eso bajó el recuento de 9 a **1**, y esa 1 era real.
2. **El cuerpo del bloque es lo que hay entre esta marca y la siguiente**, no las
   próximas 30 líneas. Con la ventana de V1, el mismo bloque pegado dos veces
   nunca daba el mismo hash (el primero incluía la segunda marca).

### Los 5 casos de "pegado dos veces" que quedan, revisados uno a uno

`double-paste` seguía dando **5 falsos positivos**, revisados leyendo el código y
registrados en [`scripts/audits/idempotency-allowlist.json`](../scripts/audits/idempotency-allowlist.json)
con motivo y fecha (sin motivo ≥10 caracteres y fecha `YYYY-MM-DD`, el audit falla):

| Marca | Fichero | Por qué es correcto |
|---|---|---|
| `TENANT_SCAN_PEEL_V1` | `db-tenant.ts` | dos marcas de cabecera (`scan()` y `peel()`); su implementación son los métodos que siguen |
| `A1_MEMORY_PATCH_V2` | `engine/routes.ts` | la misma corrección en `POST /memories` y `POST /memories/:id` |
| `TENANT_CACHE_ENDPOINT_V1` | `engine/routes.ts` | el mismo criterio en `/tenant/cache-stats` y `/tenant/cache-invalidate` |
| `KERNEL_NONFATAL_V1` | `engine/conversation.ts` | los dos `catch` son idénticos a propósito: el kernel no puede romper el chat |
| `SLOW_AUTHOR_ATTENTION_QUERY_V1` | `slow-author.ts` | misma corrección de `query` en los dos `attention` (reasoning y delegation) |

Un caso nuevo no pasa: hay que leerlo y escribir por qué es correcto. La lista no
puede crecer copiando una razón de otra entrada.

### El único defecto real que había

`AUTHOR_MATCHED_METADATA_NORMALIZE_V1` en `apps/server/src/kernel/authors/index.ts:6`:
una marca al final del fichero, sin nada debajo y sin aparecer en ningún otro sitio.
Afirmaba un cambio que no existía. Se ha **borrado la marca** (no el fichero).

## 2. Triaje del índice: 152 + 141 marcas

**Duplicadas con cuerpo distinto: 152 marcas en 335 apariciones.** Son campañas que
tocan varios ficheros. El top es `WITH_WRITE_WIRE_V1` (54 sitios) y
`WITH_READ_WIRE_V1` (33).

**Repetidas en el mismo fichero: 141 marcas en 380 apariciones**, media 2,7 sitios
por marca. Reparto: 105 marcas en 2 sitios, 22 en 3, 7 en 4, y una cola con 6, 7,
8, 12 y 30.

Nada de esto se ha borrado. Está en el informe completo que genera el audit
(`artifacts/gate/audits/AUDIT_IDEMPOTENCY.md` y `idempotency.json`, ambos fuera de
git).

## 3. Lo que el audit sigue sin poder decir (y qué lo cubre)

El audit es estático: **no ejecuta nada**. Que una operación con la misma clave
ocurra una sola vez lo mide ahora
[`tests/gate/idempotency-execution.test.ts`](../tests/gate/idempotency-execution.test.ts),
con tres rutas reales con efecto y su control negativo:

| Ruta | Qué mide | Control negativo |
|---|---|---|
| `ActionService.propose` | misma clave → una propuesta y un registro de actividad | sin clave → dos propuestas |
| `ActionService.decide` | aprobar dos veces → el adapter se llama **una** vez | ya cubierto por `actions.test.ts` |
| `CapabilityRunner.run` (`external_write`) | claim `done` → el executor corre una vez, y el resultado se cachea | otro `step.id` → dos efectos |

Además comprueba que un claim `failed` **permite reintentar** (si no, un fallo del
proveedor bloquearía el paso para siempre).

Resultado medido: **6/6 verdes** (31 s en esta máquina, dominado por el arranque de
PGlite; el fichero tarda ~1 s de trabajo real).

## 4. Estado medido

| Check | Antes | Ahora |
|---|---|---|
| `pnpm audit:idempotency` | exit 1 (157 duplicadas + 138 repetidas) | **exit 0** |
| Defectos bloqueantes | no existía la categoría | **0** (1 huérfana real corregida, 5 casos revisados) |
| Criterio con test | no | **12/12** en `tests/gate/idempotency-marks.test.ts` |
| Idempotencia ejecutada | no se probaba | **6/6** |

## 5. Lo que NO cubre esta fase

- **No hay prueba de concurrencia real contra Postgres** con dos procesos: los
  claims se prueban sobre un `Store` en un proceso.
- **No cubre reintentos del proveedor** (Stripe/Gmail/Calendar): mide que el
  efecto ocurre una vez en nuestro lado, no que el proveedor deduplique.
- **`audit:contracts` (150 huérfanos) sigue en rojo** y su informe va aparte
  (`docs/INFORME-CONTRATOS.md`).
- El índice **crecerá** con cada campaña. Es esperado; si algún día molesta, la
  salida no es borrar marcas, es dejar de contarlas.
