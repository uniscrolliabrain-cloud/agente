# Pruebas y calidad — funcionamiento

## Flujo principal

1. La superficie muestra suites, última ejecución y cobertura vigente.
2. Al abrir una PR, se seleccionan las suites obligatorias y las afectadas por archivos cambiados.
3. La ejecución arranca en sandbox y muestra progreso por test en streaming.
4. Los fallos aparecen con traza, archivo y línea, con opción de reintentar solo ese test.
5. Al terminar, se publica el resultado como check de la PR y se adjunta el artefacto.
6. Si la cobertura del cambio baja del umbral, la puerta queda en rojo con el detalle por archivo.
7. El resultado queda enlazado en revisiones, despliegues y bitácora.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `suite` | id, projectId, nombre, tipo, comando, obligatoria, tiempoMedio |
| `testRun` | id, suiteId, commit, entorno, inicio, fin, estado, artefacto |
| `testCase` | runId, nombre, estado, duración, error, reintentos |
| `coverageReport` | runId, global, porArchivo[], umbral, fuente |
| `qualityGate` | projectId, reglas[], estado, evaluadaEn |

## Estados

Suite: `configurada` → `en-cola` → `ejecutando` → `ok` | `fallo` | `inestable` | `cancelada`. Test: `pendiente` → `ok` | `fallo` | `omitido` | `cuarentena`. Puerta: `pendiente` → `verde` | `roja` | `no-evaluable`.

## Roles y permisos

- `viewer`: ve estado agregado, no trazas.
- `reviewer`: ve trazas y puede marcar inestable.
- `builder`: ejecuta suites y reintenta tests.
- `owner`: cambia umbrales, suites obligatorias y sale de cuarentena.

## Errores, reintentos e idempotencia

- Sandbox no disponible: se encola y se avisa; no se marca fallo por infraestructura.
- Test que agota tiempo: se marca `timeout` con la duración y se ofrece reintento individual.
- Resultado contradictorio en dos ejecuciones: se marca inestable y no bloquea sin revisión.
- Reintentar una ejecución con el mismo commit reutiliza el artefacto si ya existe.

## Rendimiento y límites

- Suite crítica objetivo: menos de 5 min; por encima se avisa y se sugiere dividir.
- Máximo 4 ejecuciones simultáneas por proyecto.
- Artefactos de test hasta 50 MB; capturas comprimidas.
- Retención: 30 días para trazas, 12 meses para resultados agregados.

## Móvil y accesibilidad

- Resultados por suite en tarjetas, con fallos expandibles.
- Trazas con copiar y salto a archivo; sin scroll horizontal obligatorio.
- Estado con texto y color; "inestable" siempre explicado.
- Ejecutar y reintentar con área táctil suficiente y confirmación si cuesta crédito.

## Demo actual frente a conectado

El clon muestra porcentajes de cobertura y suites inventadas; ejecutar solo produce un aviso de simulación. No hay runner ni reporte real.

## Criterios de aceptación

- Toda cifra de cobertura proviene de un reporte con fecha y commit.
- Las puertas bloquean la fusión en servidor cuando están en rojo.
- Un fallo por infraestructura no se confunde con fallo de código.
- Los resultados quedan citables desde la revisión y el despliegue.
