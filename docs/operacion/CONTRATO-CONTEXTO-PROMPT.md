# Contrato del contexto del chat

> v1 · 2026-11-07 · Estado: current para el código de la base 0c8fe81

## Orden observado

| Orden | Bloque | Condición y procedencia |
| --- | --- | --- |
| 1 | Contexto del rol | Si el rol existe para el owner, se antepone el resultado de renderContext. Si falla el ensamblaje, se usan nombre, instrucción de tono, objetivo, SOPs preferidos y memorias del rol. |
| 2 | Prompt base | Se añade después del rol. Si no hay rol, abre el prompt. |
| 3 | Contexto urgente | Se añade al final del prompt base cuando systemContext devuelve avisos. Incluye aprobaciones pendientes, fallos recientes, estado de Google y pistas meta de urgencia media o alta. |
| 4 | Pista de delegación | Se concatena después del bloque urgente cuando se genera. |
| 5 | Contexto recuperado | Cuando memory.recall devuelve texto, se antepone un mensaje system a la lista de mensajes. La consulta usa el último mensaje de usuario y un historial acotado. El texto recuperado se identifica como datos. |
| 6 | Conversación | Los mensajes originales conservan su orden después del mensaje recuperado, cuando existe. |

Los cuatro primeros bloques componen el prompt de sistema. Los dos últimos describen el orden de la lista de mensajes que el chat pasa junto al prompt. La selección de modelo y la lista de herramientas son entradas separadas. Fuente: [ConversationAgent](../../apps/server/src/engine/conversation.ts).

## Orden interno del contexto de rol

renderContext emite nombre y tono del rol, objetivo, memorias del rol, entidad con estado y propiedades, relaciones, eventos recientes, documentos recuperados y aprendizajes previos. Omite las secciones vacías. En esta base el chat pasa roleId y query a assemble. La entidad, las relaciones y los eventos requieren una entidad resuelta y quedan fuera de este camino. El ensamblador consulta eventos por owner cuando recibe una entidad, sin acreditar aún un filtro por entidad. Fuentes: [ensamblador](../../apps/server/src/engine/context/engine.ts), [renderizado](../../apps/server/src/engine/context/assembly.ts).

## Criterio para integrar R02

La sesión acredita tenant y actor. El servidor autoriza la entidad antes de entregarla al ensamblador. El bloque de entidad, relaciones y eventos debe ceñirse a esa entidad y al tenant autorizado. Memorias, documentos y resultados externos conservan su condición de datos. Las credenciales se resuelven fuera del prompt. Antes de acreditar la integración, captura la entrada al modelo con dos entidades del mismo owner, una entidad ajena y un token ficticio. Comprueba el orden, la exclusión de datos ajenos y cero coincidencias del token en prompt, eventos y logs. La selección de tarjetas y los hechos operativos quedan sujetos a las rondas correspondientes. Fuente: [propuesta del vertical](./PROPUESTA-PLAYBOOKS-LAIA-Y-SERVICIOS.md).
