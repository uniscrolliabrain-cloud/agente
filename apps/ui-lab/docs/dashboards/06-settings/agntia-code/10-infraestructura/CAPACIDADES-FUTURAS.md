# Infraestructura — capacidades futuras

Superficie `infraestructura`. Propuesta; el clon dibuja recursos inventados con cifras decorativas.

## Propósito

Hacer comprensible y gobernable la infraestructura que sostiene el producto: qué recursos existen, para qué sirven, cuánto cuestan y qué pasa si fallan. El usuario debe poder crear un recurso nuevo sin convertirse en especialista de Cloudflare, y entender el impacto antes de tocarlo.

## Modelo de trabajo

Cada recurso se declara en una configuración versionada del proyecto (bindings) y se materializa por entorno. La interfaz nunca crea recursos sueltos: toda creación pasa por la configuración y deja un plan de cambio revisable.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Inventario de recursos | Lista Workers, D1, R2, KV y colas con entorno, estado y propietario. | Un recurso sin binding se muestra como huérfano y no se borra solo. |
| Crear recurso | Asistente por tipo con nombre, entorno y propósito. | Nombres únicos por tenant; producción exige confirmación. |
| Bindings | Vista de la relación recurso ↔ variable de entorno (`DB`, `FILES`…). | Cambiar un binding avisa de quién lo usa. |
| Salud | Errores en las últimas 24 h, latencia y consumo de cuota. | Sin datos suficientes se muestra "sin datos", no cero. |
| Plan de cambio | Antes de aplicar, muestra qué se crea, modifica o elimina. | Eliminar exige escribir el nombre del recurso. |
| Coste estimado | Consumo del mes y previsión por recurso. | Etiquetar como estimación y fechar el cálculo. |

## Capacidades · fase V2

- **Plantillas de arquitectura**: app + base de datos + bucket + dominio en un plan único.
- **Límites por entorno**: cuotas de escritura y tamaño para evitar sorpresas.
- **Alertas** de errores, cuota al 80 % y latencia por encima de umbral.
- **Historial de cambios** de infraestructura con autor y motivo.
- **Deriva**: comparación entre configuración declarada y recursos reales.

## Capacidades · fase V3

- **Multi-proveedor** con el mismo contrato (Cloudflare hoy, otros después).
- **Simulación de coste** por escenario de tráfico.
- **Recomendaciones de ajuste** basadas en consumo real, nunca en heuristicas opacas.

## Integraciones y datos

Cloudflare (API de recursos y métricas), despliegues, observabilidad y dominios. Los secretos y variables se referencian desde `13-entornos`; aquí solo se muestran nombres.

## Límites y no-objetivos

- No se exponen credenciales de la cuenta de Cloudflare al navegador.
- No se crean recursos en producción desde un chat sin plan aprobado.
- No se borran datos automáticamente por "limpieza".
- No se promete aislamiento físico ni cumplimiento normativo sin contrato específico.

## Métricas de éxito

- Tiempo de crear un recurso y dejarlo en uso.
- Recursos huérfanos o sin binding.
- Porcentaje de alertas atendidas antes de afectar a usuarios.
- Desviación del coste real frente a la estimación.

## Dependencias y riesgos

Depende de `09-despliegues` y `13-entornos`. Riesgo: tocar producción por accidente; mitigación con plan de cambio, entornos separados y confirmación escrita.
