# Observabilidad — capacidades futuras

Superficie `observabilidad`. Propuesta; el clon simula una consola de logs.

## Propósito

Responder rápido a "¿qué está pasando ahora?" y "¿qué cambió?". La observabilidad debe conectar un error con el despliegue que lo introdujo y con la PR que lo causó, sin obligar a saltar entre herramientas.

## Modelo de trabajo

Tres vistas sobre la misma verdad: **en vivo** (últimos minutos), **explorar** (consulta por filtros y tiempo) y **salud** (SLO, errores y latencia). Cada vista se puede guardar y compartir; las alertas nacen de una consulta guardada.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Consola en vivo | Logs con nivel, servicio, ruta y tiempo; pausa y seguimiento. | La pausa conserva lo recibido; nunca se pierde al reanudar. |
| Filtros | Por entorno, servicio, nivel, texto y rango temporal. | Los filtros se reflejan en la URL para compartir. |
| Errores agrupados | Agrupa por huella, cuenta ocurrencias y muestra la primera y la última. | Un error sin huella no se agrupa por mensaje libre. |
| Correlación | Enlace al despliegue y a la PR activos en la ventana del error. | Si no hay despliegue cercano, se dice, no se inventa. |
| Métricas | Peticiones, errores y latencia p95 por ruta. | Cada gráfico declara ventana y fuente. |
| Alertas | Regla sobre consulta guardada con umbral y destinatarios. | Se prueba antes de activar y avisa del ruido esperado. |

## Capacidades · fase V2

- **Trazas** con muestra de extremo a extremo y mapa de llamadas.
- **Vistas guardadas** por equipo y por incidente.
- **Anomalías** de tráfico y errores con explicación, no solo un pico.
- **Enlaces desde la bitácora** a la ventana exacta de un incidente.
- **Redacción de datos personales** automática en logs.

## Capacidades · fase V3

- **SLO y presupuesto de error** con política de congelación de despliegues.
- **Análisis de causa** asistido que propone hipótesis con evidencia.
- **Comparación entre versiones** de la distribución de latencia.

## Integraciones y datos

Workers/Cloudflare como origen, Vercel para build y serving, despliegues y pruebas. Se guardan referencias y agregados; el texto de log se retiene según política y se redacta antes de persistir.

## Límites y no-objetivos

- No se guardan datos personales en claro en logs.
- No se promete retención infinita ni consultas sin límite de coste.
- No se alerta sin umbral probado y destinatario válido.
- No se afirma causa raíz sin evidencia enlazada.

## Métricas de éxito

- Tiempo de detección y de diagnóstico de un incidente.
- Alertas útiles frente a ruido.
- Porcentaje de errores con despliegue correlacionado.
- Coste de ingesta por proyecto.

## Dependencias y riesgos

Depende de `09-despliegues` y `10-infraestructura`. Riesgo: coste y ruido; mitigación con muestreo, retención declarada y alertas nacidas de consultas probadas.
