# Laia · afirmaciones acreditadas y preguntas abiertas

> v1 · 2026-11-07 · Estado: current para la revisión estática de 0c8fe81

| Afirmación que permite el repositorio | Evidencia y alcance |
| --- | --- |
| Existe una persona de ejemplo llamada Laia. | [Ficha de ejemplo](../../clientes/_example/personas/laia/persona.json). Acredita el catálogo de ejemplo. El alta idempotente por tenant requiere evidencia de A01. |
| El panel dispone de chat y envía el rol seleccionado. El servidor ofrece un agente de conversación con contexto de rol. | [Panel](../../apps/web/src/components/ChatPanel.tsx), [registro del agente](../../apps/server/src/agent.ts) y [conversación](../../apps/server/src/engine/conversation.ts). La evidencia describe el chat general. La ruta contextual por automatización requiere A02. |
| El chat puede aportar memorias y documentos recuperados. El ensamblador admite una entidad opcional. | [Contrato de prompt](./CONTRATO-CONTEXTO-PROMPT.md) y [ensamblador](../../apps/server/src/engine/context/engine.ts). El camino revisado del chat aún pasa rol y consulta. |
| Agntia tiene un catálogo de ocho SOPs en el repositorio. | [Catálogo](../../clientes/agntia/sops.ts) y [bootstrap](../../scripts/lib/agency-bootstrap.ts). La existencia del catálogo acredita configuración disponible. Cada ejecución comercial requiere evidencia propia. |

## Preguntas pendientes para el recorrido de Laia

| Pregunta | Evidencia que permite responder | Dependencia |
| --- | --- | --- |
| ¿Por qué se paró la reactivación ayer? | ID de ejecución autorizada, paso, hora y causa registrada. | A02 ruta, A03 entidad y A08 causa en panel. |
| ¿Cuántas citas se confirmaron esta semana? | Consulta con fechas, zona, denominador y reservas confirmadas. | A04 agregación. |
| ¿Qué sabes de este lead y por qué encaja? | Entidad autorizada y fuentes fechadas de sus datos y criterios. | A03 resolución y A05 referencias acreditadas. |
| ¿Puedes preparar una respuesta para este cliente? | Borrador revisable vinculado al canal y evidencia de que la preparación carece de efecto externo. | A09 prueba del vertical y R04/R05 para el recorrido integrado. |
| ¿Qué ocurre si el actor pregunta desde A por una campaña de B? | Denegación o ausencia de resultado, y captura que demuestre aislamiento en respuesta, prompt y traza. | A07 aislamiento y A09 evidencia del vertical. |

Si falta un dato verificable, la aceptación exige que la respuesta declare qué falta. Si dos campañas autorizadas comparten nombre, exige aclaración o un enlace directo autorizado. Las cinco preguntas proceden del [diagnóstico del vertical](./ESTADO-VERTICAL-LAIA-Y-DATOS.md). El informe se limita a evidencia del repositorio. La disponibilidad en producción, la ruta de Laia y los resultados por tenant requieren pruebas integradas.
