# Ramas y Pull Requests — capacidades futuras

Superficie `ramas`. Propuesta; el clon muestra ramas y PR ficticias.

## Propósito

Que el cambio tenga un camino claro y reversible: una rama por unidad de trabajo, una PR por cambio revisable, checks que deciden y una fusión que no rompe `main`. Aquí se ve el estado del trabajo en curso, no el código línea a línea (eso es `08-revisiones`).

## Modelo de trabajo

- Rama de trabajo creada desde `main` por el agente o por el usuario, con nombre derivado de la intención.
- Una PR puede agrupar varios commits y varios chats; si el cambio es grande, se propone dividirla.
- `main` protegida: exige PR, checks en verde y al menos una revisión.
- Fusión con cola cuando hay varias PRs listas; sin fuerza, sin saltarse checks.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Lista de ramas | Nombre, autor, último commit, antigüedad, PR asociada. | Ramas sin actividad 30 días se marcan como candidatas a limpieza, nunca se borran solas. |
| Crear PR | Título y descripción propuestos desde el plan y los commits; plantilla del repo. | Sin descripción no se puede abrir; se exige resumen y pasos de prueba. |
| Estado de checks | Build, tests, lint, preview y revisión, con enlace al detalle. | Un check desconocido no cuenta como verde. |
| Revisores | Sugerencia por CODEOWNERS y carga de trabajo; asignación manual. | No se puede fusionar sin la revisión exigida por la política. |
| Conflictos | Detección temprana y aviso con archivos implicados. | Rebase asistido siempre con vista previa del resultado. |
| Cerrar y limpiar | Cerrar PR, borrar rama tras fusión. | Borrar rama requiere que la PR esté fusionada o descartada explícitamente. |

## Capacidades · fase V2

- **PRs apiladas** para cambios dependientes con fusión en orden.
- **Merge queue** con verificación previa a la fusión y cancelación segura.
- **Plantillas por tipo** (feature, fix, migración) con checklist automático.
- **Recordatorios de PR estancada** con motivo y siguiente acción.
- **Enlace bidireccional** con issues y con la bitácora del proyecto.

## Capacidades · fase V3

- **Predicción de riesgo** por tamaño, rutas tocadas e historial de incidentes.
- **Auto-rebase** cuando `main` avanza, con reejecución de checks.
- **Política por ruta**: cambios en pagos requieren dos revisores siempre.

## Integraciones y datos

GitHub (ramas, PRs, checks, reviews), previews de Vercel/Cloudflare y pruebas. Los estados se sincronizan por webhook y se reconcilian con una lectura completa al abrir la superficie.

## Límites y no-objetivos

- No hace push directo a `main`.
- No fusiona con checks en rojo ni con conflictos pendientes.
- No reescribe historia de ramas compartidas sin confirmación explícita.
- No es un tablero de tareas: los pendientes viven en la app principal y se enlazan.

## Métricas de éxito

- Tiempo medio de PR abierta a fusionada.
- Porcentaje de PRs que pasan checks al primer intento.
- PRs estancadas más de 3 días y motivo.
- Reversiones posteriores a fusión atribuibles a una PR.

## Dependencias y riesgos

Depende de `06-repositorios`, `08-revisiones` y `14-pruebas`. Riesgo: acumulación de PRs y ramas muertas; mitigación con recordatorios, límites de tamaño y limpieza guiada.
