# Bitácora — funcionamiento

## Flujo principal

1. La bitácora abre en el timeline del proyecto, con filtros por tipo y fecha.
2. Los hechos (PR fusionada, despliegue, migración, incidente) crean entradas automáticas con enlace.
3. El usuario puede añadir una nota a una entrada automática para explicar el porqué.
4. Las decisiones se registran con contexto, alternativas y consecuencias.
5. La búsqueda devuelve entradas con su evidencia y permite abrir el hecho original.
6. El resumen semanal agrupa lo entregado, lo pendiente y lo que requiere atención.
7. Exportar genera un documento con lo seleccionado y declara las omisiones.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `entry` | id, projectId, tipo, título, resumen, autor, fechaHecho, evidencia[], automática |
| `decision` | entryId, contexto, decisión, alternativas[], consecuencias, estado |
| `entryLink` | entryId, tipoDestino, destinoId (pr, deployment, migration, incident) |
| `digest` | projectId, periodo, entregado[], pendiente[], atención[] |

## Estados

Entrada: `borrador` → `publicada` → `corregida` (por nueva entrada que la referencia). Decisión: `propuesta` → `aceptada` | `rechazada` | `superada`. Exportación: `solicitada` → `generando` → `disponible` → `expirada`.

## Roles y permisos

- `viewer`: vista cliente sin detalles internos.
- `reviewer`: lectura completa y comentarios.
- `builder`: crea notas y entradas de decisión.
- `owner`: publica resúmenes para clientes y configura qué hechos generan entrada.

## Errores, reintentos e idempotencia

- Hecho duplicado por webhook repetido: se reconoce por tipo y referencia y no se duplica.
- Evidencia eliminada: la entrada se conserva y se marca "evidencia no disponible".
- Exportación fallida: se reintenta con el mismo identificador sin generar dos documentos.
- Edición fuera de plazo: se convierte en corrección enlazada, no en sobrescritura.

## Rendimiento y límites

- Timeline paginado de 30 en 30 con carga incremental.
- Búsqueda sobre 12 meses por defecto; el resto, exportación.
- Adjuntos por entrada: 10 MB; imágenes comprimidas.
- Retención: permanente salvo borrado del proyecto, con exportación previa ofrecida.

## Móvil y accesibilidad

- Timeline vertical con tipo, fecha y resumen; detalle en hoja.
- Filtros accesibles y persistentes en la URL.
- Texto seleccionable y enlaces con foco visible.
- Exportar anuncia el formato y el contenido omitido.

## Demo actual frente a conectado

El clon muestra cinco entradas con fechas y tipos fijos; no hay generación automática, ni búsqueda, ni exportación real.

## Criterios de aceptación

- Cada entrada automática enlaza al hecho que la originó.
- Ninguna decisión se guarda sin contexto y alternativas.
- Los hechos no se reescriben: las correcciones quedan enlazadas.
- El export indica explícitamente qué se ha omitido.
