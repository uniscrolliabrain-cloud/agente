# Bitácora — capacidades futuras

Superficie `bitacora`. Propuesta; el clon lista entradas decorativas.

## Propósito

Que el proyecto tenga memoria. Cuando alguien pregunta "¿por qué se hizo así?", la respuesta debe estar aquí, con fecha, autor y evidencia, sin depender de recordar un chat. Es el puente entre el trabajo técnico y quien lo encarga.

## Modelo de trabajo

La bitácora se **genera** a partir de hechos (commits, PRs fusionadas, despliegues, migraciones, incidentes) y se **escribe** con notas humanas (decisiones, contexto, aprendizajes). Cada entrada enlaza a su evidencia y nunca se reescribe: se corrige con una entrada nueva que referencia la anterior.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Timeline | Entradas por fecha con tipo, autor, proyecto y enlace a evidencia. | Orden por fecha del hecho, no por cuándo se registró. |
| Entrada automática | Resume PR fusionada, despliegue o migración con datos verificables. | Se marca como automática y admite una nota humana. |
| Nota manual | Texto con título, tipo (decisión, aprendizaje, incidencia) y etiquetas. | Editable 24 h; después se corrige con entrada nueva. |
| Decisiones | Registro ADR ligero: contexto, decisión, alternativas, consecuencias. | Sin contexto no se guarda como decisión. |
| Búsqueda | Por texto, etiqueta, tipo, autor y rango de fechas. | Resultados siempre muestran la evidencia enlazada. |
| Exportar | PDF o Markdown para cliente o archivo interno. | El export declara qué se omitió (código, secretos). |

## Capacidades · fase V2

- **Resumen semanal** del proyecto: qué se entregó, qué se rompió, qué queda.
- **Vista cliente** con lenguaje de producto y sin detalles internos.
- **Enlaces bidireccionales** con Tu Empresa: una decisión técnica puede citar una idea de negocio.
- **Plantillas de entrada** por tipo de hito.
- **Recordatorio de cierre**: PR fusionada sin entrada explicativa.

## Capacidades · fase V3

- **Línea de tiempo comparada** entre versiones publicadas.
- **Reconstrucción de incidente** uniendo logs, despliegue y decisiones.
- **Publicación automática** de un changelog para usuarios finales.

## Integraciones y datos

GitHub, despliegues, migraciones, pruebas, observabilidad y Academia. Las entradas guardan referencias, no copias; si la evidencia desaparece, la entrada lo indica.

## Límites y no-objetivos

- No es un chat ni un sustituto del historial de Git.
- No se editan hechos pasados para que "queden mejor".
- No se publica nada fuera del workspace sin acción explícita.
- No se generan entradas con cifras no verificadas.

## Métricas de éxito

- Porcentaje de PRs fusionadas con entrada explicativa.
- Tiempo de respuesta a "¿por qué se hizo así?".
- Entradas de decisión con contexto completo.
- Uso del export por parte de clientes y equipo.

## Dependencias y riesgos

Depende de `07-ramas`, `09-despliegues`, `12-datos` y `15-observabilidad`. Riesgo: bitácora automática sin criterio que se vuelva ruido; mitigación con agrupación por hito, resumen y posibilidad de silenciar tipos de evento.
