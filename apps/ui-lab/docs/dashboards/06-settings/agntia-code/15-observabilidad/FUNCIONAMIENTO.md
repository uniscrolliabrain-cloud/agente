# Observabilidad — funcionamiento

## Flujo principal

1. La consola abre en vivo con el entorno elegido y pausa al hacer scroll.
2. El usuario filtra por nivel, servicio o texto; la URL refleja el filtro.
3. Al encontrar un error, lo agrupa y ve ocurrencias, primera y última.
4. El panel de correlación muestra el despliegue activo y la PR relacionada en esa ventana.
5. Desde ahí puede abrir la revisión, el despliegue o crear una incidencia con contexto.
6. Guarda la consulta como vista y crea una alerta con umbral y destinatarios.
7. Al dispararse, la alerta enlaza a la ventana exacta y al despliegue implicado.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `logEntry` | id, proyecto, entorno, servicio, nivel, mensajeRedactado, ruta, tiempo |
| `errorGroup` | huella, mensaje, ocurrencias, primera, última, servicios[], estado |
| `savedView` | id, nombre, filtros, ventana, autor, compartida |
| `alertRule` | id, savedViewId, umbral, ventana, destinatarios, estado, últimaPrueba |
| `metricPoint` | proyecto, ruta, ventana, peticiones, errores, p95 |

## Estados

Vista: `borrador` → `guardada` → `compartida`. Alerta: `probando` → `activa` → `silenciada` | `disparada`. Error: `nuevo` → `conocido` → `resuelto` | `ignorado`.

## Roles y permisos

- `viewer`: ve salud agregada; sin logs crudos.
- `reviewer`: ve logs redactados y errores.
- `builder`: crea vistas y consulta logs.
- `owner`: crea y silencia alertas, define retención.

## Errores, reintentos e idempotencia

- Corte del flujo en vivo: se reconecta y recupera desde el último evento, sin duplicar.
- Consulta demasiado costosa: se rechaza con sugerencia de filtro o ventana menor.
- Alerta sin destinatarios válidos: no se activa.
- Repetir "crear incidencia" desde el mismo error reutiliza la abierta.

## Rendimiento y límites

- En vivo con latencia menor de 3 s y buffer de 500 líneas en pantalla.
- Consultas sobre 7 días como máximo en la vista interactiva.
- Retención base: 7 días de logs, 30 de agregados; ampliable.
- Muestreo declarado cuando el volumen supera el plan.

## Móvil y accesibilidad

- Logs en lista con filtros en hoja y pausa por botón, no por gesto delicado.
- Mensajes de error expandibles con copia.
- Gráficos con tabla alternativa y resumen textual.
- Estados de alerta anunciados en texto.

## Demo actual frente a conectado

El clon muestra una consola con líneas de ejemplo y un indicador "Conectado" ficticio; no hay ingesta, ni consultas, ni alertas. Filtrar no cambia datos reales.

## Criterios de aceptación

- Cada línea de log indica entorno, servicio y hora reales.
- Los errores se agrupan por huella y no por texto libre.
- Una alerta no se activa sin prueba y destinatario.
- Los datos personales aparecen redactados según política.
