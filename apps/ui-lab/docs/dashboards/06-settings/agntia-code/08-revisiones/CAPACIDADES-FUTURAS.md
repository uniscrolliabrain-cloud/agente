# Revisiones — capacidades futuras

Superficie `revisiones`. Propuesta; el diff del clon es estático.

## Propósito

Convertir la revisión en una decisión informada: qué cambia, por qué, qué riesgo tiene y qué falta. El agente prepara el terreno (resumen, hallazgos, pruebas sugeridas), pero la aprobación es humana y queda firmada.

## Modelo de trabajo

La revisión tiene tres capas: **resumen** (qué hace la PR en lenguaje llano), **diff por archivo** con hallazgos anclados y **decisión** (aprobar, solicitar cambios, comentar). Los comentarios se sincronizan con GitHub para que la PR siga siendo la fuente de verdad.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Resumen de la PR | Explica intención, alcance y riesgos a partir de commits, plan y diff. | Se marca como generado por IA y admite corrección humana. |
| Diff por archivo | Vista unificada o dividida, plegado por hunks y salto a archivo. | Los binarios y generados se excluyen con aviso. |
| Hallazgos | Comentarios con severidad (bloqueante, importante, sugerencia) y motivo. | Un hallazgo bloqueante impide aprobar hasta resolverse o justificarse. |
| Sugerencia aplicable | Parche listo para aplicar desde el comentario. | Aplicar crea un commit en la rama, nunca en `main`. |
| Checklist | Elementos exigidos: pruebas, migración, accesibilidad, secretos. | Se puede marcar "no aplica" con motivo obligatorio. |
| Decisión | Aprobar, solicitar cambios o comentar, con resumen opcional. | La decisión se firma con usuario y fecha y se replica en GitHub. |

## Capacidades · fase V2

- **Revisión por riesgo**: ordena archivos por probabilidad de incidente usando historial.
- **Detección de secretos y datos personales** con bloqueo previo a la fusión.
- **Comparación con el plan** del Estudio: qué se prometió y qué se entregó.
- **Revisión asíncrona en móvil** con diff unificado y voz para comentar.
- **Plantillas de revisión** por tipo de cambio.

## Capacidades · fase V3

- **Revisión conjunta** en tiempo real con presencia.
- **Aprendizaje del proyecto**: reglas que se añaden al agente tras revisión repetida.
- **Métricas de calidad por autor y por ruta**, sin convertirlas en ranking público.

## Integraciones y datos

GitHub (comentarios, reviews, checks), pruebas y observabilidad para adjuntar evidencia. Los hallazgos se guardan con archivo, línea, commit y estado para no repetirse tras un rebase.

## Límites y no-objetivos

- La IA no aprueba PRs: solo resume y señala.
- No se comentan estilos subjetivos sin regla explícita del proyecto.
- No se descartan hallazgos en bloque sin justificación.
- No se revisan PRs de repos no habilitados ni código de terceros no analizado.

## Métricas de éxito

- Hallazgos bloqueantes detectados antes de fusionar.
- Tiempo medio de revisión por tamaño de PR.
- Porcentaje de sugerencias aplicadas frente a descartadas y motivo.
- Defectos escapados a producción con causa en una revisión omitida.

## Dependencias y riesgos

Depende de `07-ramas` y `06-repositorios`. Riesgo: fatiga de hallazgos y falsos positivos; mitigación con severidades calibradas, silenciado por regla y feedback explícito.
