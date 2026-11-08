# 12 · Fuentes de Drive y ciclo de indexación — REPORTE

**Estado:** completa a nivel de producto y pruebas; falta el disparador HTTP de selección (declarado abajo) · **Entrada:** `f4fd89c` (campaña 11).

## Qué se ha implementado

### 12.P1 · Contrato: leer no es seleccionar

`WorkspaceService.readDriveFile` ya no escribe en el índice. Antes indexaba en segundo plano y **solo** si el texto superaba 20000 caracteres, con un `.catch(() => {})`: un documento corto nunca entraba y un fallo no dejaba rastro en ningún sitio.

La indexación es ahora una operación explícita, `indexDriveFile(owner, fileId, { force })`, que relee el archivo de Drive y persiste un registro de fuente en `rag-sources`:

```
{ id, sourceId: "drive:<fileId>", sourceName, kind: "drive", connectionId, revision,
  status: "indexed" | "failed", chunks, embedded, attempts, indexedAt, updatedAt, error? }
```

La revisión es `modifiedTime`, con `createdTime` y un hash del texto como respaldo cuando Drive no informa fechas. Reindexar la misma revisión devuelve `unchanged: true` sin gastar embeddings ni invalidar citas vigentes.

`GET /api/rag/sources` publica ahora `drive: [...]` con estado, revisión, conexión, intentos y error: el panel puede distinguir "indexado", "fallo" y "sin indexar" sin mirar chunks sueltos.

### 12.P2 · Conexión: documentos cortos, revisión y reintento observable

- **Documentos cortos admitidos**: `RagService.ingestSource` guarda el texto entero como un chunk cuando `chunkText` no produce ninguno (antes se descartaba con `chunks: 0` y sin error).
- **Reingesta que sustituye**: tras escribir la revisión nueva se podan los chunks con `chunkIndex` sobrantes de la anterior. Antes una versión más larga dejaba colas citándose para siempre.
- **Reintento observable**: si la lectura falla, `recordSourceFailure` deja `status: "failed"`, `attempts` incrementado y `error`; la fuente deja de citarse (no se sirve la revisión vieja como actual) y un reintento posterior la vuelve a marcar `indexed` con `attempts + 1`.

### 12.P3 · Bordes: revocación, borrado y cita verificada

- **Revocación**: `reconcileDriveSources` compara la conexión de cada fuente con la conexión vigente del tenant; si no coincide (o no hay conexión), se retiran chunks y registro. Se ejecuta al listar Drive, al listar fuentes y al indexar.
- **Borrado**: `forgetDriveSource` (y `DELETE /api/rag/source/:id`) elimina chunks **y** el registro: una cita verificada no puede apuntar a lo que el usuario retiró. `RagService.removeSource` borra ambos.
- **Citas verificadas**: `search` solo devuelve chunks de fuentes registradas y vigentes; un chunk de Drive sin registro, con la última ingesta fallida o revocado no se devuelve. Los hits llevan `verified` y `revision`, de modo que la cita identifica la revisión concreta que se indexó. Los chunks heredados de subidas (sin registro) siguen citándose por compatibilidad.
- **Fallo ≠ ausencia de coincidencia**: `RagService.searchReport` devuelve `{ hits, status: "ok" | "no_match", degraded }` y `GET /api/rag/search` lo publica. `degraded` avisa de que no se pudo calcular el vector (solo hubo palabras clave); antes ambos casos eran la misma lista vacía.

## Defecto heredado corregido (afecta a pruebas legacy)

`bm25Score`, `computeIdf` y `bm25WithIdf` troceaban con `split(/\\W+/)` (barra doble, literal en el fichero): no separaban por espacios, así que la señal de palabras clave era siempre 0 y una búsqueda sin vector no encontraba nada aunque el texto contuviera el término. Corregido en `engine/rag.ts` junto con el troceado de la consulta. `tests/rag.test.ts` sigue verde: el caso de ranking híbrido esperaba `0.7` y sigue dando `0.7` (la consulta no aparece en el chunk).

## Cambio de ruta registrado

- `GET /api/rag/sources`: campo nuevo `drive` (aditivo).
- `GET /api/rag/search`: devuelve `{ hits, status, degraded }` (antes `{ hits }`; aditivo para clientes que solo leen `hits`).
- `DELETE /api/rag/source/:id`: ahora borra también el registro de fuente.

**Pendiente declarado:** el disparador HTTP de selección. Las rutas `/api/drive/*` viven en `apps/server/src/app.ts`, fuera de la superficie de esta campaña, así que `indexDriveFile` queda cableado a nivel de servicio y no hay `POST` público que lo invoque. El punto exacto para cerrarlo es una ruta en `app.ts` (`POST /api/drive/files/:id/index` → `workspace.indexDriveFile(owner, id)`), con la misma autorización que `/api/drive/files/:id/content`. No se ha tocado `app.ts` para respetar la superficie.

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` | 0 errores |
| Gate: `rag` + `google` + `vertical-slice-drive` | **34/34 pass, 0 fail** |
| Regresión: `context-engine`, `kernel-meta-context`, `vertical-slice-memory`, `vertical-slice-google-connection` | **20/20 pass, 0 fail** |
| Audits `idempotency`, `anchors`, `tenant-default`, `layers`, `bridges`, `no-console` | 0 |
| `git diff --check` | limpio |

Casos de `tests/vertical-slice-drive.test.ts`:

1. **Documento corto**: leer no escribe chunks; seleccionar indexa 1 chunk con conexión y revisión; reindexar la misma revisión no reindexa; los hits llevan `verified` y `revision`. Tras cerrar y reabrir el almacén, un `RagService` nuevo recupera el documento.
2. **Actualización**: la versión larga deja varios chunks; tras cambiar el documento y reindexar, `chunks` vuelve a 1, el término viejo no se encuentra y el nuevo sí, con la revisión nueva y `attempts: 2`.
3. **Revocación**: al desconectar A, `driveSources` queda vacío, A no cita el documento y sus chunks desaparecen; B conserva su fuente, su conexión y su hit.
4. **Fallo y reintento**: la lectura falla, la fuente queda `failed` con `attempts: 1` y error, y no se cita; el reintento la deja `indexed` y citable. Al retirarla, la búsqueda devuelve `no_match` con `degraded: false`; sin embeddings, `degraded: true`.

## Pendiente adicional

- **Prueba real con Drive**: no ejecutada. Sin `GOOGLE_CLIENT_ID`/`SECRET` ni cuentas de staging, la lectura se acredita con `fetch` interceptado (metadatos, export de Google Docs y 500 de prueba) sobre store real en PGlite. No se registran identificadores de proveedor ni contenido privado.

## Rollback

Revertir este commit devuelve `readDriveFile` a la autoingesta de textos largos; los registros `rag-sources` quedan inertes (nadie los lee), `search` vuelve a citar cualquier chunk y `ingestText` deja de podar colas. Los chunks escritos por esta campaña siguen siendo válidos para la búsqueda anterior porque conservan el mismo formato (`id: "<sourceId>-<i>"`). El rollback no borra documentos de Drive ni credenciales.
