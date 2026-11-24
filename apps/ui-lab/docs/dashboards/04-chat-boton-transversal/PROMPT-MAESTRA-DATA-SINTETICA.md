# Prompt maestra · data sintética · 04-chat-boton-transversal

Estado: propuesta para revisión; no registros materializados. Leer primero [contrato común del lote](../../agntia-demo/07-proyecciones-dashboards/00-CONTRATO-GENERACION-LOTE-01.md), [dataset](../../agntia-demo/03-compilacion-y-dataset/DATASET-SINTETICO.md), [registros propuestos](../../agntia-demo/06-diagnostico-copy-data-sintetica/01-COPY-Y-REGISTROS-NUEVOS-PROPUESTOS.md) y [componentes reales](./componentes-reales/README.md).

## Mandato de producto
Quiero que el chat transversal sea la misma conversación con LAIA que existe en el chat completo, abierta desde cualquier workspace, sin que el usuario pierda su tarea ni aparezca otro historial.
### Proyección y registros
- Conversation, Message, ToolCallProjection y ContextRef: reutilizar contratos reales de ChatMessage/DockChat y adaptarlos desde el dataset central. Campos lógicos threadId, messageId, actorId, role, content, logicalTimestamp, entityRefs, correlationId; mapear a tipos actuales sin modificarlos.
- Historia B: project-004, task-041, approval-004 de Estudio Caliza. Owner pregunta qué requiere atención; LAIA explica que Marcos preparó campaña y espera aprobación; enlazar tarea y aprobación sin afirmar publicación.
- Historia C: project-005, task-051, incident-005; consulta desde Comunicación sobre conexión pendiente. Respuesta explica bloqueo y siguiente decisión, no afirma canal conectado.
- Historia D: invoice-003, task-antonio-003; consulta desde Data/finanzas sobre cobro pendiente, sin ejecutar pago ni envío.
- PanelState: closed, dock, sheet, full_chat; originViewId, activeThreadId, selectedEntityId, draft, scrollAnchor. Son estados de presentación, no eventos empresariales nuevos.
- StreamingScenario: idle, streaming, cancelled, error, retry, completed; reproducir secuencia determinista local, sin llamar LLM real. Tool results solo de entidades existentes.
### Densidad
Tres recorridos de 4–8 mensajes propuestos, un hilo vacío, un error recuperable y una cancelación. El mismo threadId y messageId se usan en Chat completo; no duplicar conversaciones al cambiar de panel.
### Aceptación
Abrir desde Centro de Mando, Comunicación y Data si existe ruta; preservar selección de origen, borrador e historial; abrir chat completo sin reset; cerrar y restaurar foco. Ninguna aprobación cambia de estado por una respuesta textual. Toda afirmación de LAIA apunta a entidades del escenario.

## Entrega exigida al futuro generador
Proponer schema tipado y mapeo a props existentes; manifest de registros con IDs y fuente; escenarios positivos y negativos; proyección pura con tests de referencias, determinismo y aislamiento; informe de campos no soportados. Guardar datos ejecutables únicamente en la fuente central futura apps/ui-lab/agntia-demo/, no en esta carpeta. No implementar backend, cambiar código activo ni desplegar sin autorización.


## Anexo de contraste con código real · revisión 2
Baseline 21364ef55320ffb46fdcfd65a02802d593f9285b. Lectura focalizada de snapshots y contratos activos; no certifica auditoría exhaustiva de todos los imports transitivos ni QA visual. Esta sección prevalece sobre cualquier descripción anterior incompatible.

| Componente | Contrato / proyección |
|---|---|
| App.tsx | una instancia useChat(auth.isAuthenticated,threads.activeId,threads.touch); chatDock/mobileChat booleanos; desktop sustituye sidebar, móvil dialog; abrir chat completo cambia view a chat |
| SidebarChat | DockChat messages,streaming,streamBuf,tools,error,send,cancel,threadId; tenantLabel; variant dock/sheet; callbacks close/full/settings |
| QUICK_PROMPTS | tres chips exactos: pendientes hoy, estado equipo, preparar email; seed local consumido por ChatInput; no envío automático por seleccionar chip |
| MessageList / ChatInput | mismos componentes en dock y chat completo; no duplicar mensajes ni tool results |
| ChatPanel | estado vacío, chips por roleId, RoleSelector, CognitionTimeline; onResolveView una vez por threadId + último mensaje user |
| SidebarV2 | onOpenChat, onOpenProfile, onOpenSettings, navegación y threads; AppView enum existente |
| usePanel | persistencia boolean localStorage; en App se usa para collapsed, no para persistir chatDock |
| AppShell | composición de paneles; no generar entidades para layout |

Diferenciar actual y propuesta: conservar hilo y mensajes es comportamiento respaldado; conservar borrador al desmontar, selección de entidad y scrollAnchor entre superficies requiere diseño adicional, no afirmar que existe. El texto 'en línea' es copy actual, no presencia verificada. Escenarios: tres chips, envío/cancelación, streaming/error, dock→full, móvil→full, cierre y settings; no duplicar resolución de vista. Datos de cognición deben ser eventos simulados, no razonamiento privado del modelo.
