# Datos — funcionamiento

## Flujo principal

1. Se abre el explorador con el esquema del entorno elegido (preview por defecto).
2. El usuario selecciona una tabla y ve columnas, tipos, índices y relaciones.
3. Escribe una consulta o usa una guardada; el editor avisa si no es de lectura.
4. Al ejecutar, el servidor valida política, aplica límite y devuelve filas paginadas.
5. El resultado se puede exportar con motivo, o guardar como consulta del proyecto.
6. Para cambiar estructura, se crea una migración con SQL y plan; se revisa y se aplica.
7. Si la migración falla, se restaura el punto previo y se conserva el error para corregir.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `schemaSnapshot` | projectId, entorno, tablas[], generadoEn, commit |
| `table` | nombre, columnas[], índices[], relaciones[], sensibilidad, propietario |
| `queryRun` | id, autor, sql, entorno, inicio, duración, filas, estado, motivo |
| `migration` | id, nombre, sql, autor, estado, aplicadaEn, backupRef |
| `exportJob` | id, queryRunId, formato, motivo, autor, urlFirmada, expiraEn |

## Estados

Consulta: `editando` → `validando` → `ejecutando` → `completada` | `rechazada` | `fallida` | `cancelada`. Migración: `borrador` → `en-revisión` → `aprobada` → `aplicando` → `aplicada` | `fallida` | `revertida`. Exportación: `solicitada` → `generando` → `disponible` → `expirada`.

## Roles y permisos

- `viewer`: sin acceso a SQL; puede ver el catálogo de tablas públicas.
- `reviewer`: lectura y comentarios sobre migraciones.
- `builder`: consultas de lectura, propuestas de migración en preview.
- `owner`: aplica migraciones en producción, autoriza exportaciones y define retención.

## Errores, reintentos e idempotencia

- Consulta que excede tiempo: se cancela y se sugiere índice o filtro.
- Migración con bloqueo: se espera y se informa; nunca se fuerza el cierre de conexiones.
- Fallo de red al exportar: el trabajo continúa y se recupera por identificador.
- Repetir la aplicación de una migración ya aplicada se detecta por versión y no se reejecuta.

## Rendimiento y límites

- Resultado máximo: 100 filas por página, 10 000 en exportación.
- Tiempo máximo de consulta: 5 s en consola, 30 s en exportación.
- Migraciones con más de 100 000 filas afectadas requieren ventana y aviso.
- Copia de seguridad previa obligatoria para cambios destructivos.

## Móvil y accesibilidad

- Explorador en lista con detalle en hoja; SQL con teclado y sin autocompletado que tape.
- Resultados en tabla con scroll horizontal contenido y botón de copiar fila.
- Estados y errores en texto claro, con el fragmento de SQL implicado.
- Exportar siempre pide motivo y avisa de la sensibilidad de los datos.

## Demo actual frente a conectado

El clon muestra una consulta `select` de ejemplo, una lista de tablas y "0 filas"; ejecutar responde con aviso de simulación y no hay base de datos detrás.

## Criterios de aceptación

- Ninguna consulta de escritura se ejecuta desde la consola.
- Los límites de filas y tiempo se aplican en servidor, no solo en la interfaz.
- Toda migración tiene autor, revisión y copia previa.
- Los datos personales se enmascaran según rol y se registran al exportarse.
