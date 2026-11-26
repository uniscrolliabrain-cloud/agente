# Revisiones — funcionamiento

## Flujo principal

1. Se abre la revisión de una PR concreta; se carga resumen, diff y checklist.
2. El revisor recorre archivos y ve hallazgos agrupados por severidad.
3. Puede comentar, aplicar una sugerencia o marcar el hallazgo como resuelto.
4. Si aplica una sugerencia, se crea un commit en la rama y se actualiza el diff.
5. Los checks se reejecutan y la decisión queda bloqueada hasta que estén en verde.
6. Al aprobar o solicitar cambios, se escribe la review en GitHub con el resumen.
7. Al fusionarse, la revisión queda enlazada desde la bitácora.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `reviewSession` | id, prId, revisorId, iniciadaEn, decisión, resumen |
| `finding` | id, prId, path, línea, severidad, mensaje, origen (agente/humano), estado |
| `suggestion` | findingId, parche, aplicadoPor, commitRef |
| `checklistItem` | prId, clave, estado (ok/no-aplica), motivo, autor |
| `reviewDecision` | prId, revisor, decisión, comentario, fecha, firmada |

## Estados

Sesión: `abierta` → `en-revisión` → `decidida` | `abandonada`. Hallazgo: `abierto` → `resuelto` | `descartado` | `justificado`. Sugerencia: `propuesta` → `aplicada` | `rechazada`. Checklist: `pendiente` → `ok` | `no-aplica`.

## Roles y permisos

- `viewer`: no accede a la revisión.
- `reviewer`: comenta, aplica sugerencias y decide.
- `builder`: responde a hallazgos y sube commits; no puede aprobar su propia PR.
- `owner`: define checklist obligatoria y política por ruta.

## Errores, reintentos e idempotencia

- La PR cambia durante la revisión: se avisa, se recarga el diff y los hallazgos se reanclan por commit.
- Aplicar una sugerencia sobre código ya cambiado: se detecta y se convierte en comentario.
- Fallo al publicar la review: se reintenta con la misma clave y no se duplica en GitHub.
- Hallazgo duplicado tras rebase: se reconoce por huella y no se vuelve a mostrar.

## Rendimiento y límites

- Diff de hasta 400 archivos visible; por encima, revisión por lotes.
- Archivos de más de 5000 líneas se colapsan y se revisan por hunks.
- El resumen debe estar listo en menos de 10 s; si no, se muestra el diff sin bloquear.
- Retención de hallazgos: mientras viva la PR y 90 días después.

## Móvil y accesibilidad

- Diff unificado con navegación por archivo y por hallazgo.
- Comentarios con voz disponibles; texto siempre editable antes de enviar.
- Botones de decisión al final, con resumen de consecuencias.
- Severidad anunciada en texto; nunca solo color.

## Demo actual frente a conectado

El clon pinta un diff y un checklist fijos; "Aprobar cambios" lanza un aviso de simulación. No hay PR real, ni comentarios, ni sincronización con GitHub.

## Criterios de aceptación

- Ninguna PR se aprueba con hallazgos bloqueantes abiertos.
- Los comentarios y la decisión aparecen en GitHub con el mismo autor.
- Los hallazgos sobreviven a un rebase sin duplicarse.
- Aplicar una sugerencia actualiza el diff sin recargar toda la página.
