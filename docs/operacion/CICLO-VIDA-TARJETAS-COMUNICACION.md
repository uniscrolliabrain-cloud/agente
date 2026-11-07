# Ciclo de vida de las tarjetas de comunicación

> v1 · 2026-11-07 · Estado: draft · Política de publicación de R04

Esta política concreta la [especificación de tarjetas](./PROPUESTA-PLAYBOOKS-LAIA-Y-SERVICIOS.md). Aplica por tenant y revisión de tarjeta. La publicación de una tarjeta y la aprobación de un efecto externo son decisiones separadas.

| Estado | Uso | Transición y autoridad |
| --- | --- | --- |
| draft | Edición, previsualización y validación. | Un editor autorizado del tenant prepara la revisión. El responsable de la empresa aprueba tono y límites. El responsable técnico valida el enlace con herramientas y estados antes de publicar. El servidor comprueba la autoridad sobre el tenant. |
| approved | Revisión inmutable, seleccionable si está activa y corresponde al caso autorizado. | La publicación registra ID, versión, aprobador, fecha y contentHash. Un cambio de contenido abre un draft con versión nueva. |
| retired | Histórico disponible para trazabilidad. Queda fuera de nuevas selecciones. | El responsable de la empresa, o una persona con autoridad delegada en el tenant, autoriza la retirada. El operador registra motivo, fecha y actor, y revisa el reemplazo con el responsable técnico. |

## Publicar una revisión

1. Verifica tenant, rol del actor y alcance por intención, canal y demás criterios del selector.
2. Valida esquema estricto, placeholders, hechos requeridos, ejemplos y ausencia de empate con tarjetas activas. Comprueba los límites del canal y el comportamiento cuando falten datos.
3. Registra la aprobación de la revisión exacta y su huella de contenido. Activa la revisión publicada mediante el flujo de publicación del panel.
4. Comprueba que una nueva selección devuelve la revisión activa esperada. Conserva la referencia de las tareas ya persistidas y la evidencia de validación.

## Retirar una revisión

1. Identifica tenant, tarjeta y revisión activa. Registra solicitud, motivo, autorizador y momento.
2. Antes de retirar, comprueba si la revisión aprobada anterior sigue siendo elegible y está libre de empates. Si carece de reemplazo elegible, aplica el fallback del caso.
3. Marca la revisión como retirada y actualiza la selección activa. Conserva su contenido, huella, aprobaciones y referencias históricas.
4. Comprueba una selección nueva y otra consulta histórica. Si hay efectos pendientes ligados a la revisión retirada, revisa su autorización antes de ejecutarlos y registra la decisión.

## Criterios de integración

A01 acredita esquema estricto. A02 acredita huella y revisión publicada. A03 acredita prioridad y rechazo de empates. A07 acredita revisión inmutable desde el panel. A08 comprueba que intención o canal no elevan permisos. A09 acredita que la traza reconstruye la decisión. La comprobación integrada debe cubrir publicación, edición como versión nueva, retirada con reemplazo o fallback y consulta de la versión histórica.
