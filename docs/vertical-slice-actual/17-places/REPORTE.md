# 17 · Places, selección y ficha comercial compartida — REPORTE

**Estado:** completa con fixtures; smoke real pendiente de clave de staging · **Entrada:** `2facb52` (campaña 16).

## Qué se ha implementado

### 17.P1 · Contrato: candidatos transitorios, no pipeline

`POST /api/leads/discover` persistía los 20 negocios de cada búsqueda como leads con `status: "new"`: el pipeline se llenaba de ruido y repetir la búsqueda devolvía «existing». Ahora:

- `LeadsService.discover` devuelve **candidatos transitorios** con referencia estable, dominio y estado del negocio, y **no escribe nada**: buscar no modifica el pipeline.
- El cliente de Places expone `PLACES_FIELD_MASK` y `PLACES_MAX_RESULTS` como presupuesto explícito (los campos que la ficha usa, 20 resultados por página); el estado del negocio viaja como `businessStatus` y conserva el alias `status` para callers previos.
- Política de datos: el contenido de Places no se persiste al buscar; se guarda solo la ficha aceptada, con origen acreditado (proveedor, consulta y fecha) y las notas humanas. El resultado de una búsqueda es dato de trabajo, no una fila del CRM.

### 17.P2 · Conexión: aceptación idempotente por empresa

- `POST /api/leads/accept` crea la ficha desde el candidato aceptado: nombre, dirección, teléfono, web, rating, reseñas, enlace de Maps y notas.
- La referencia es `lead_<sha256(tenantId:placeId)>`: estable por empresa. El `placeId` de Google solo es único dentro de Google, así que la misma empresa aceptada por A y por B produce dos fichas con referencias distintas.
- La ficha vive en un **pipeline compartido por la empresa** (`pipeline` dentro del prefijo del tenant): dos comerciales de A que aceptan el mismo negocio obtienen la misma ficha, `acceptedBy` acumula ambos nombres y **las notas existentes nunca se pisan**. La segunda aceptación responde 200 y no crea fila.
- Carreras: `insertIfAbsent` decide el ganador; el perdedor relee la ficha y se une con `compareAndSwap`, así que dos aceptaciones simultáneas no duplican.
- El **dominio es una señal, no la clave**: se deriva de la web (`domainOf`) y se guarda para agrupar, pero dos negocios del mismo dominio son dos fichas distintas.

### 17.P3 · Bordes y compatibilidad: migración y contrato

- **Migración perezosa de filas legacy:** las filas antiguas (id = `placeId`, `status: "new"`, `source: "google_places"` en texto) se normalizan al leer con referencia estable, estado `accepted` y origen acreditado `{ provider, placeId, query, discoveredAt }`. Al aceptar ese negocio se escribe la ficha nueva y **solo entonces** se retira la fila legacy (`remove` tras `insertIfAbsent`), conservando notas y procedencia. Si la escritura falla, la fila antigua permanece.
- **Contrato de callers:** `GET /api/leads` sigue devolviendo `{ leads }`; `POST /api/leads/discover` conserva `found`, `created`, `existing` y `leads` (con `created: 0` porque buscar ya no escribe) y añade `candidates`. La aceptación es un endpoint nuevo (`POST /api/leads/accept`), así que ningún caller previo se rompe.
- Las rutas conservan el middleware de empresa (actor, membresía y `runInTenantScope`) y el almacén aislado obligatorio.

**Cableado:** Places (FieldMask y presupuesto) → candidatos → selección humana (`accept`, idempotente) → ficha compartida por empresa → API.

## Cambios registrados

- `apps/server/src/engine/leads.ts`: nuevo. `LeadsService` (`discover`, `list`, `accept`), `leadRef`, `domainOf`, esquema de aceptación y normalización legacy.
- `apps/server/src/leads-routes.ts`: `GET /`, `POST /discover` (solo lectura) y `POST /accept`; inyección opcional del cliente de Maps para pruebas.
- `packages/integrations/src/google-maps.ts`: `PLACES_FIELD_MASK`, `PLACES_MAX_RESULTS`, `businessStatus` (con alias `status`).
- `tests/vertical-slice-leads.test.ts`: nueva (6 casos). `app.ts` no requirió cambios: la ruta `/api/leads` ya estaba montada.

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` | 0 errores |
| Gate 17: `vertical-slice-leads` + `tenant-http-e2e` | **12/12 pass, 0 fail** |
| Regresión: `connections-adapters` (Places y conectores) | **11/11 pass, 0 fail** |
| Audits `idempotency`, `anchors`, `tenant-default`, `layers`, `bridges`, `no-console` | 0 |
| `git diff --check` | limpio |

Casos de `tests/vertical-slice-leads.test.ts`:

1. **Buscar no escribe:** dos candidatos, referencias por empresa, dominio y estado; cero filas tras buscar dos veces.
2. **Dos comerciales de A:** primera aceptación crea con notas y origen acreditado; la segunda devuelve la misma ficha, suma `acceptedBy` y conserva las notas; una sola fila.
3. **A/B:** B acepta el mismo negocio con su propia referencia y tenant; A no ve la ficha de B ni al contrario.
4. **Dominio como señal:** dos negocios del mismo dominio producen dos fichas con el mismo `domain`.
5. **Legacy:** la fila antigua se lista normalizada con notas y origen preservados; aceptarla migra a la referencia estable, retira la fila antigua y no duplica.
6. **Rutas:** `discover` responde 200 con `created: 0` y candidatos sin escribir; `accept` responde 201 y luego 200 idempotente con `acceptedBy` acumulado.

## Pendiente declarado

- **Smoke real:** no ejecutado. Sin `GOOGLE_MAPS_API_KEY` de staging no hay búsqueda real que registrar; los fixtures usan la normalización real del cliente. Cuando exista la clave, el smoke debe guardar solo el `placeId` y el recuento, nunca el contenido de Places.
- **Alcance:** no hay edición posterior de la ficha (notas, descarte o fusión de duplicados) en este tramo; la aceptación y la procedencia son el mínimo del contrato.
- **Despacho diferido de la campaña 14** sigue sin cablear en `index.ts` (fuera de superficie, declarado allí).

## Rollback

Revertir este commit restaura `POST /discover` persistente y elimina `/accept`, `LeadsService`, `leadRef`/`domainOf` y el `businessStatus` del cliente. Las fichas nuevas quedan en el pipeline compartido y las legacy retiradas no se recuperan del diff: para deshacer datos, seguir el diario de migración y preservar escrituras posteriores. La lectura normalizada ya tolera ambos formatos.

## SHA por patchset

- **17.P1 + 17.P2 + 17.P3:** `ec0ad10` (producto y pruebas en un único commit sobre `2facb52`).
- **Punto de rollback:** `2facb52`.
