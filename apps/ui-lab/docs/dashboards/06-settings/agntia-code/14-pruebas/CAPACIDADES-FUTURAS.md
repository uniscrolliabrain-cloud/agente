# Pruebas y calidad — capacidades futuras

Superficie `pruebas`. Propuesta; el clon muestra porcentajes fijos.

## Propósito

Que "funciona" sea una afirmación comprobable. Aquí se ve qué se prueba, qué se rompió, qué se cubre y qué falta para poder fusionar o publicar con criterio.

## Modelo de trabajo

Las suites viven en el repositorio y se ejecutan en el sandbox o en CI. Cada PR ejecuta el conjunto mínimo obligatorio más las suites afectadas por los archivos cambiados. Los resultados son artefactos citables desde revisiones, despliegues y bitácora.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Suites del proyecto | Lista unitarias, integración y e2e con comando y duración media. | Una suite sin comando no se considera configurada. |
| Ejecutar | Lanza la suite elegida y muestra progreso y resultado por test. | Nunca se ejecuta contra producción. |
| Cobertura | Porcentaje por archivo y por cambio de la PR. | Se muestra "sin datos" si el reporte falta; nunca 100 % por defecto. |
| Fallos legibles | Error, traza y archivo/línea; reintento individual. | Un test inestable se marca como tal tras dos resultados distintos. |
| Puertas | Umbrales mínimos de cobertura y suites obligatorias. | Se aplican en servidor y bloquean la fusión. |
| Historial | Resultados por commit con tendencia y duración. | Se conserva el artefacto 30 días mínimo. |

## Capacidades · fase V2

- **Pruebas visuales** con capturas por viewport y diff tolerante a ruido.
- **Accesibilidad automatizada** con reglas y resultado por pantalla.
- **Presupuesto de rendimiento** (tamaño, LCP) medido en preview.
- **Detección de tests frágiles** con cuarentena y propietario.
- **Cobertura de rutas** que une tests con pantallas reales del producto.

## Capacidades · fase V3

- **Generación de tests** desde una intención o desde un bug reproducido, con revisión humana obligatoria.
- **Análisis de mutaciones** por módulo crítico.
- **Comparación entre proyectos** de la misma plantilla, sin ranking público.

## Integraciones y datos

Sandbox de ejecución, CI del repositorio, despliegues (preview) y observabilidad para relacionar fallos con errores reales. Los artefactos se guardan por commit y se referencian, no se duplican.

## Límites y no-objetivos

- No se promete cobertura total ni ausencia de bugs.
- No se ejecutan pruebas en producción ni con datos personales reales.
- No se desactivan suites obligatorias sin aprobación y motivo.
- No se muestran porcentajes sin reporte que los respalde.

## Métricas de éxito

- Escapes de defectos a producción con test ausente.
- Tiempo de suite crítica y porcentaje de PRs que la pasan a la primera.
- Tests en cuarentena y tiempo de salida.
- Cobertura del código cambiado en PRs fusionadas.

## Dependencias y riesgos

Depende de `05-terminal`, `07-ramas` y `09-despliegues`. Riesgo: pruebas lentas o frágiles que se ignoran; mitigación con presupuestos de tiempo, cuarentena explícita y puertas mínimas razonables.
