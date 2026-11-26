# Ramas y Pull Requests — funcionamiento

## Flujo principal

1. Al abrir, se listan ramas activas y PRs con filtros por estado, autor y proyecto.
2. Al pedir una PR desde un chat o el editor, se propone título, descripción y archivos incluidos.
3. Se eligen revisores y se crea la PR en GitHub; la superficie muestra el identificador real.
4. Los checks llegan por webhook y actualizan el estado en tiempo casi real.
5. Si hay conflicto, se ofrece rebase con vista previa y nueva ejecución de checks.
6. Con checks en verde y revisión aprobada, se habilita "Fusionar" o entra en la cola.
7. Tras la fusión, se sugiere borrar la rama y se escribe la entrada de bitácora.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `branch` | nombre, projectId, autor, base, últimoCommit, prId, actualizadaEn |
| `pullRequest` | id, número, título, descripción, rama, base, estado, revisores[], checks[] |
| `check` | nombre, estado, duración, url, commit |
| `review` | prId, revisor, decisión, comentarios, fecha |
| `mergePolicy` | projectId, revisionesRequeridas, checksRequeridos, rutasProtegidas |

## Estados

PR: `borrador` → `abierta` → `en-revisión` → `lista` → `fusionada` | `cerrada`. Check: `pendiente` → `en-curso` → `ok` | `fallo` | `cancelado` | `desconocido`. Rama: `activa` → `fusionada` → `eliminada` (o `archivada` si no se borra).

## Roles y permisos

- `viewer`: ve estado de PRs y preview, sin código.
- `reviewer`: comenta, aprueba o solicita cambios.
- `builder`: crea ramas y PRs, no fusiona si la política exige revisor.
- `owner`: ajusta política de fusión y puede forzar cola, nunca saltarse checks.

## Errores, reintentos e idempotencia

- PR duplicada para la misma rama: se reutiliza la existente y se informa.
- Check que no reporta: tras 15 min se marca `desconocido` y no cuenta como verde.
- Fusión rechazada por protección de rama: se explica qué falta y no se reintenta en bucle.
- Reintento de "Fusionar" con la misma clave no produce doble merge.

## Rendimiento y límites

- Listado de PRs paginado de 25 en 25, con caché de 30 s.
- Máximo 200 ramas activas por repo; se avisa al superar 150.
- PRs de más de 400 archivos se marcan como "demasiado grande" y se sugiere dividir.
- La cola de fusión procesa una PR a la vez por repo.

## Móvil y accesibilidad

- PRs en tarjetas con estado textual y checks resumidos; detalle en hoja.
- Fusionar nunca es un gesto accidental: confirmación con nombre de rama.
- Estados anunciados con texto además de color.
- Filtros accesibles por teclado y persistentes en la sesión.

## Demo actual frente a conectado

El clon muestra una tabla de ramas y un flujo de PR con estados fijos; no crea nada en GitHub ni recibe webhooks. Los números de PR y los checks son de ejemplo.

## Criterios de aceptación

- Toda PR mostrada tiene un identificador real y enlace funcional a GitHub.
- No se puede fusionar sin cumplir la política vigente.
- Los checks desconocidos bloquean igual que los fallidos.
- Fusionar actualiza ramas, despliegues y bitácora de forma coherente.
