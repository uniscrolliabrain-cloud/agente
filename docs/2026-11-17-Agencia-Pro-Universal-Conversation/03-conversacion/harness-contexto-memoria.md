# Harness, agentes, contexto y memoria

El hilo universal no sustituye el harness: lo alimenta. ConversationAgent recibe tenant/actor autorizados, threadId, último mensaje, contexto situacional y permisos efectivos. LAIA puede delegar a agentes (gestoría, finanzas, operario, RRHH) y ejecutar SOPs deterministas. LLM propone; políticas, aprobaciones y runtime disponen.

## Tres planos
1. Historial conversacional: lo que usuario y agentes dijeron y qué decisiones se notificaron. Persistente y secuencial.
2. Contexto temporal del host: email abierto, documento seleccionado, calendario. Limitado a recursos autorizados y turno; puede expirar.
3. Memoria empresarial: hechos consolidados con procedencia, clasificación y reglas de retención; nunca promover automáticamente cualquier email o texto inyectado.

## Ejemplo
Gmail: «responde a Pedro» con reference del email. LAIA pide presupuesto; Drive: «usa este documento» con referencia temporal. AgntiaPro: «envíalo»; runtime requiere aprobación de envío si política lo exige. La conversación recuerda lo ocurrido, pero el sistema vuelve a validar acceso al recurso antes de usarlo.

## Progreso y acciones
Los eventos de herramientas pueden mostrarse como estados resumidos («Consultando Drive», «Preparando borrador»), no fingir pasos ejecutados. Registro de runId, approvalId, actionId y evidenceRef; evitar incluir secretos y payloads sensibles en eventos del chat. Presentador puede transformar progreso real en lenguaje accesible.

## Identidad de agente
LAIA es interfaz principal; especialistas operan bajo el mismo tenant/harness. roleId/personaId se conserva por hilo o turno según política, sin crear una nueva conversación al cambiar de superficie.

## Integración con workspaces
Los 34 workspaces siguen como vistas y capacidades; no exportarlos enteros a complementos. Las superficies embebidas consumen tarjetas ligeras o enlaces profundos cuando la UI no soporte la operación.
