# Chats de construcción — capacidades futuras

Superficie `chats`. Propuesta; el clon muestra conversaciones de ejemplo con "Hace 2 h" fijo.

## Propósito

Dar continuidad al trabajo: retomar una conversación semanas después y que el agente sepa qué se intentó, qué se descartó y qué quedó pendiente. Un chat es un **expediente de cambio**, no un hilo de mensajes suelto.

## Modelo de trabajo

Cada conversación pertenece a un proyecto y a una rama. Dentro, el usuario alterna entre pedir, revisar diffs, ejecutar comandos y aprobar. El chat puede producir un plan, un parche, varios commits o un PR; el resultado se enlaza, nunca se copia.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Composer con contexto | Adjunta archivos, capturas, logs y enlaces; muestra qué se enviará. | Los adjuntos grandes se resumen y se avisa del recorte. |
| Hilo con artefactos | Bloques de diff, salida de terminal, plan y captura de preview dentro del hilo. | Cada bloque indica si es propuesta o resultado ya aplicado. |
| Referencias | `@archivo`, `@sección`, `@issue`, `@preview` para apuntar sin pegar. | Una referencia inexistente se marca antes de enviar. |
| Checkpoints | Punto de retorno por mensaje que cambió código. | Restaurar un checkpoint no borra el historial: crea uno nuevo. |
| Continuidad | Resumen automático del estado al reabrir y "pendiente" explícito. | Si el resumen no puede generarse, se muestra el hilo sin inventar. |
| Coste visible | Tokens y créditos por respuesta y por conversación. | Se avisa antes de superar el presupuesto del proyecto. |
| Compartir lectura | Enlace de solo lectura para `viewer` con código oculto opcional. | Compartir no concede permiso de escritura ni de despliegue. |

## Capacidades · fase V2

- **Hilos paralelos** sobre la misma rama con detección de conflicto antes de aplicar.
- **Plantillas de petición** ("corrige bug con reproducción", "añade integración", "migra esquema").
- **Traspaso a otra persona** con resumen y tareas abiertas.
- **Búsqueda semántica** en el historial del proyecto: "dónde decidimos usar colas".
- **Modo revisión por voz** para dictar cambios desde el móvil.

## Capacidades · fase V3

- **Enjambre**: varias conversaciones especializadas (frontend, datos, tests) coordinadas por un plan común.
- **Reconstrucción de sesión** a partir de commits para explicar cómo se llegó al estado actual.
- **Chat con el cliente** (`viewer`) limitado a lenguaje de producto, con salida únicamente descriptiva.

## Integraciones y datos

GitHub (ramas, commits, issues), terminal sandbox (salida), despliegues (previews) y bitácora (resumen). El contenido del chat se guarda cifrado en reposo y se purga según política de retención del workspace.

## Límites y no-objetivos

- No sustituye a la revisión: un chat no aprueba un PR.
- No guarda secretos pegados por el usuario: se detectan y se pide moverlos a `13-entornos`.
- No mezcla proyectos en un mismo hilo; si el usuario cambia de proyecto, se abre otro.
- No promete reproducir conversaciones borradas por política de retención.

## Métricas de éxito

- Porcentaje de hilos que terminan en diff, PR o decisión registrada.
- Retrabajo por contexto perdido al reabrir un hilo.
- Tiempo medio entre petición y primer diff visible.
- Coste por hilo y porcentaje de hilos con presupuesto excedido.

## Dependencias y riesgos

Depende de `03-agente` (ejecución) y `04-editor` (aplicar cambios). Riesgo: hilos eternos sin salida; mitigación con estado explícito ("abierto", "propuesto", "aplicado", "descartado") y recordatorio de cierre.
