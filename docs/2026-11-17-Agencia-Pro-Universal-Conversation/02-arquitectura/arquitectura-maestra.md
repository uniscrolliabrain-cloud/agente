# Arquitectura maestra

```text
Gmail add-on ─┐
Drive add-on ─┤
Outlook add-in ├─> Surface Adapter + AgntiaPro Auth ─> Universal Chat API
AgntiaPro web ┤                                          │
Future hosts ─┘                                   Active Thread Resolver
                                                        │
                                                  Authoritative Store
                                                        │
                                              Conversation Orchestrator
                                                        │
                                          LAIA / agents / SOPs / policies
                                                        │
                                      tools/MCP adapters / approvals / audit
                                                        │
                                       Event stream -> all subscribed UIs
```

## Capas
**Identity Gateway:** autenticación propia de AgntiaPro, tenant y actor derivados del servidor. OAuth del proveedor separado para acceso a Gmail/Drive/Graph.
**Conversation Service:** resolver hilo activo, crear hilo, append de mensajes, lectura paginada, revisiones, estados de run, suscripción.
**Conversation Engine:** una ejecución por turno que usa el mismo ConversationAgent, policy, herramientas y runtime determinista del core.
**Surface Context Adapter:** transforma contexto autorizado de Gmail, Drive, Outlook en referencias tipadas, con origen y expiración.
**Surface Renderer:** presenta texto, progreso, tarjetas y aprobaciones según capacidades del host. Puede ser UI diferente, contrato común.
**Event Bus:** eventos durables para auditoría; canal SSE/WebSocket para entrega; la entrega en tiempo real no sustituye la persistencia.

## Propiedad de datos
Servidor es dueño de thread, messages, active-thread pointer y run. Cliente puede tener caché y drafts, nunca guardar todo el hilo como operación autoritativa. Mensajes append-only con secuencia del servidor. Un cursor permite ponerse al día.

## Límites de integración
MCP es interfaz de herramientas y recursos; no es el sistema de sincronización del chat ni de autenticación de interfaz. Los adaptadores Gmail API y Microsoft Graph exponen capacidades al harness bajo políticas. El chat universal se implementa sobre API propia y eventos. Google Workspace Add-ons y Microsoft Office add-ins no garantizan las mismas capacidades de UI que una extensión de Chrome.

## Despliegue
Core en backend AgntiaPro; superficies independientes y reemplazables; contratos versionados; ninguna dependencia directa de internals de otros repos. Prohibido introducir un segundo ConversationAgent exclusivo de Gmail.
