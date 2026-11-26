# Terminal — capacidades futuras

Superficie `terminal`. Propuesta; en el clon escribir un comando solo devuelve texto simulado.

## Propósito

Ejecutar lo que el trabajo necesita —instalar, construir, probar, migrar— en un entorno reproducible y desechable, con la salida disponible para el usuario y para el agente. La terminal es también la evidencia de que algo funciona.

## Modelo de trabajo

Cada ejecución ocurre en un sandbox efímero con la rama montada, dependencias cacheadas y red restringida a una lista de dominios. Nada de lo que se ejecute puede leer secretos de producción: solo los declarados para el entorno de trabajo.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Consola interactiva | Comandos con prompt, historial de sesión y autocompletado de rutas. | Comandos destructivos piden confirmación escrita. |
| Comandos sugeridos | El agente propone el siguiente comando con explicación; un clic lo coloca sin ejecutar. | Nunca se ejecuta solo por sugerencia. |
| Salida estructurada | Detecta build, tests y errores; enlaza archivo y línea cuando puede. | Si no puede interpretar, muestra texto crudo sin adornos. |
| Sesiones | Reabrir una sesión conserva historial y directorio de trabajo. | Las sesiones caducan y se avisa antes de perderlas. |
| Artefactos | Descargar logs, capturas o resultados de pruebas generados. | Tamaño máximo por artefacto y retención declarada. |
| Lista de dominios | Muestra qué red tiene permitida el sandbox. | Añadir un dominio exige motivo y queda auditado. |

## Capacidades · fase V2

- **Recetas**: comandos guardados por proyecto (`dev`, `test`, `lint`, `migrate`) ejecutables con un clic.
- **Reproducción**: volver a ejecutar exactamente la misma sesión con el mismo commit y variables.
- **Paralelo controlado**: lanzar varias tareas y verlas en pestañas con estado.
- **Modo agente**: el agente ejecuta con límites y el usuario ve el comando antes de que corra.
- **Adjuntar salida a la conversación** como artefacto citado.

## Capacidades · fase V3

- **Terminal compartida** con presencia para pairing y control de quién escribe.
- **Depuración visual** con puntos de interrupción en el sandbox.
- **Medición de recursos** por comando (CPU, memoria, red) con aviso de abuso.

## Integraciones y datos

Sandbox de ejecución, repositorio montado, caché de dependencias, pruebas y observabilidad. Los secretos llegan desde `13-entornos` como variables en tiempo de ejecución, nunca escritas en disco.

## Límites y no-objetivos

- No hay acceso a la red abierta ni a la intranet del cliente.
- No se ejecuta nada en el entorno del usuario ni en producción.
- No se guardan credenciales en el historial; los comandos se redactan antes de persistirse.
- No es una máquina de minería ni un servicio de cómputo general: hay cuotas por workspace.

## Métricas de éxito

- Tiempo de arranque de sesión y porcentaje de arranques fallidos.
- Comandos ejecutados por tarea y tasa de éxito al primer intento.
- Coste de cómputo por proyecto y desviación del presupuesto.
- Incidentes por comando destructivo (objetivo: cero no confirmados).

## Dependencias y riesgos

Depende de `03-agente` (quién ejecuta), `06-repositorios` (código) y `13-entornos` (variables). Riesgo: ejecución arbitraria; mitigación con sandbox sin privilegios, red restringida, cuotas y auditoría de comandos.
