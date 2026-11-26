# Agente de código — funcionamiento

## Flujo principal

1. El usuario abre Agente y ve el nivel actual, las skills activas y los límites vigentes.
2. Cambia el nivel o activa una skill; la interfaz muestra permisos y comandos que se habilitan.
3. Si la skill requiere evaluación, se ejecuta la batería y se muestra el resultado antes de guardar.
4. Al pedir trabajo desde un chat, el agente comprueba nivel, presupuesto y guardarraíles.
5. Si la acción encaja, ejecuta en sandbox y devuelve artefactos (diff, logs, pruebas).
6. Si no encaja, se detiene y crea una solicitud de aprobación con motivo y diff.
7. Cada ejecución deja registro con modelo, versión de skill, comandos y coste.
8. Cambiar de modelo o de skill invalida la evaluación anterior y se avisa.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `agentConfig` | projectId, nivelAutonomia, modelo, presupuesto, version, autorId |
| `skill` | id, nombre, versión, comandos[], permisos[], límites, estado, evaluación |
| `guardrail` | id, tipo (ruta/operación/dominio), patrón, efecto (bloquear/pedir), motivo |
| `approval` | id, ejecuciónId, riesgo, diff, solicitadaEn, caducaEn, resueltaPor |
| `execution` | id, agente, skillVersión, inicio, fin, coste, estado, artefactos[] |

## Estados

`config`: `vigente` → `propuesta` → `vigente` (con historial). `skill`: `disponible` → `evaluando` → `activa` | `rechazada` | `desactivada`. `approval`: `pendiente` → `aprobada` | `rechazada` | `caducada`. `execution`: `en-cola` → `ejecutando` → `completada` | `detenida` | `fallida`.

## Roles y permisos

- `viewer`: no accede.
- `reviewer`: ve configuración y aprueba o rechaza si se le asigna.
- `builder`: activa skills y ejecuta hasta nivel "Parchear".
- `owner`: sube a "Abrir PR" o "Publicar", define guardarraíles y presupuestos.

## Errores, reintentos e idempotencia

- Sandbox no disponible: se degrada el nivel y se explica; el trabajo no se pierde.
- Skill falla a mitad: se restaura el estado del sandbox y se registra el punto de fallo.
- Aprobación caducada: se vuelve a solicitar con el diff actualizado, nunca se reutiliza.
- Reintento de una ejecución con el mismo `executionId` no duplica commits ni despliegues.

## Rendimiento y límites

- Arranque de sandbox objetivo: 5 s; si tarda más, se muestra progreso con opción de cancelar.
- Una ejecución no puede superar 20 minutos ni 2 GB de artefactos.
- Máximo 5 ejecuciones concurrentes por workspace.
- La evaluación de una skill debe terminar en 10 minutos o se marca como no concluyente.

## Móvil y accesibilidad

- Aprobaciones legibles en una columna, con resumen de riesgo antes del diff.
- Los conmutadores de autonomía nunca son solo color: llevan etiqueta y descripción.
- Confirmaciones destructivas exigen escribir el nombre del proyecto.
- Región viva para anunciar cambios de estado de ejecución.

## Demo actual frente a conectado

El clon muestra tarjetas de configuración y skills con estado fijo; ningún control cambia comportamiento ni ejecuta nada. Conectado, esta superficie es la que autoriza al agente y, por tanto, la que más auditoría necesita.

## Criterios de aceptación

- Cambiar de nivel exige confirmación y queda registrado con autor y fecha.
- Un guardarraíl bloquea la acción en servidor aunque la interfaz la permita.
- Cada ejecución es reconstruible: modelo, skill, comandos, coste y resultado.
- Sin evaluación vigente, no se puede subir autonomía.
