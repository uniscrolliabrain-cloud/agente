# Academia — funcionamiento

## Flujo principal

1. La Academia abre con rutas recomendadas según rol y actividad reciente.
2. Al entrar en una ruta, se ve el objetivo, la duración y los requisitos.
3. Cada lección combina explicación breve, ejemplo del propio proyecto y ejercicio.
4. El ejercicio se ejecuta en un sandbox con el estado inicial preparado.
5. La comprobación valida el resultado; si falla, muestra pista y permite reintentar.
6. Al completar, se actualiza el progreso y se registra el hito en la bitácora personal.
7. Si el usuario se bloquea en una superficie real, puede pedir "explícame esto" y abrir la lección relacionada.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `path` | id, título, objetivo, rol, duración, lecciones[], requisitos |
| `lesson` | id, pathId, orden, objetivo, contenido, ejercicio, comprobación |
| `enrollment` | userId, pathId, estado, progreso, iniciadaEn, completadaEn |
| `exerciseAttempt` | lessonId, userId, sandboxId, resultado, intentos, duración |
| `hito` | userId, lessonId, fecha, proyectoId |

## Estados

Ruta: `no-iniciada` → `en-curso` → `completada` | `abandonada`. Lección: `pendiente` → `leyendo` → `practicando` → `superada` | `con-pistas`. Ejercicio: `preparando` → `activo` → `validado` | `fallido` | `expirado`.

## Roles y permisos

- `viewer`: rutas de producto; sin ejercicios de escritura.
- `reviewer`: rutas de revisión y criterio.
- `builder`: todas las rutas técnicas y ejercicios.
- `owner`: rutas de gobierno y certificación interna.

## Errores, reintentos e idempotencia

- Sandbox no disponible: la lección queda en modo lectura y el ejercicio se encola.
- Ejercicio caducado: se prepara uno nuevo con el mismo estado inicial.
- Progreso perdido por cambio de proyecto: se conserva por usuario y se reancla.
- Repetir una comprobación superada no duplica el hito.

## Rendimiento y límites

- Una lección debe cargar en menos de 2 s; el sandbox puede tardar más y se avisa.
- Duración objetivo por lección: 10-20 min; ninguna obliga a más de 30.
- Almacenamiento de intentos: 90 días.
- Máximo 3 sandboxes simultáneos por usuario.

## Móvil y accesibilidad

- Lecciones en columna, texto a 16 px mínimo y ejemplos con scroll propio.
- Ejercicios con instrucciones paso a paso, sin depender del hover.
- Subtítulos y transcripción en cualquier vídeo.
- Progreso con texto y barra; nunca solo color.

## Demo actual frente a conectado

El clon muestra tres rutas y progreso fijo; abrir una lección no reproduce contenido ni evalúa nada. No hay sandbox ni persistencia.

## Criterios de aceptación

- Cada lección tiene ejercicio comprobable o se marca como solo lectura.
- El progreso sobrevive a recargas y cambios de superficie.
- Ningún ejercicio afecta a producción ni a datos reales.
- Las sugerencias contextuales se pueden descartar de forma permanente.
