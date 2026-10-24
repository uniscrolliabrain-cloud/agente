# Flujos de usuario

> **UI_CAMPAIGN_07_FLUJOS_V1** · Última actualización: 2026-10-03.

Cada flujo es una secuencia de acciones del usuario. Sirven para decidir qué pantallas construir y cómo conectarlas.

## F01 - Aprobar un cobro desde el sidebar

**Usuario:** Alfonso (dueño).
**Trigger:** el sidebar muestra un LiveItem con `alert: "Cobro 7.900€ · requiere OK"`.

1. Alfonso ve el item en el sidebar.
2. Clica. Se abre el panel contextual con `ApprovalInbox`.
3. Ve el detalle: "Pedido por Lola, hace 12 min, importe 7.900€, requiere doble firma".
4. Clica "Aprobar".
5. Aparece "Se ejecutará en 8s · Deshacer".
6. A los 8s, el servidor ejecuta. El item desaparece del sidebar.
7. Si Alfonso clica "Deshacer" a los 3s, la acción se cancela.

**Branches:** B3 (LiveItem) + C3 (ApprovalInbox) + A2 (useLiveActivity).

## F02 - Ver cómo va el pipeline

**Usuario:** Alfonso.
**Trigger:** escribe en el chat "cómo va el pipeline".

1. El chat recibe el texto.
2. `resolveView` detecta la intención "pipeline".
3. El backend genera un `ViewSpec` de tipo `board`.
4. Se emite `view.resolved` al SSE.
5. El panel contextual se abre con el board.
6. Alfonso ve las 5 columnas (Nuevo, Contactado, Propuesta, Negociación, Cerrado).
7. Clica una tarjeta. Se abre el `detail`.

**Branches:** D2 (resolver) + D3 (renderer) + B1 (panel).

## F03 - Revisar qué ha aprendido Leo

**Usuario:** Alfonso.
**Trigger:** clica "Conocimiento" en el sidebar.

1. Se abre `MemoryBoard`.
2. Ve las memorias agrupadas por categoría: Empresa, Proceso, Cliente, Rol Leo.
3. Filtra por rol "Leo". Solo ve las 4 memorias del rol.
4. Clica una. Se abre el modal de edición.
5. Cambia la categoría. Guarda.
6. La memoria se actualiza.

**Branches:** E1 (MemoryBoard) + A1 (fix).

## F04 - Crear una tarea con plan paso a paso

**Usuario:** Alfonso.
**Trigger:** escribe en el chat "prepara la factura de Acme".

1. El chat llama a `delegate_task`.
2. Se crea una `AgentTask` con plan de 5 pasos.
3. El sidebar muestra un LiveItem con `progress: "procesando · 40%"`.
4. Alfonso clica. Se abre `TasksView`.
5. Ve el plan con el paso activo (anillo naranja).
6. El LiveItem actualiza el progreso.
7. Al terminar, el LiveItem cambia a `done`.

**Branches:** C1 (TasksView) + B3 (LiveItem) + A2 (useLiveActivity).

## F05 - Onboarding de un empleado

**Usuario:** Alfonso.
**Trigger:** clica "Equipo" en el sidebar.

1. Se abre `UsersView` con la lista de usuarios.
2. Clica "Nuevo usuario".
3. `UserModal` pide email, nombre, password, rol.
4. Rellena y guarda.
5. El usuario aparece en la lista.
6. Si Alfonso clica "Editar rol", se abre `PermissionMatrix`.
7. Marca los permisos por recurso.

**Branches:** E3 (UsersView + PermissionMatrix) + D01 (roleIds, fuera).

## F06 - Subir varios PDFs

**Usuario:** Alfonso.
**Trigger:** clica "Documentos".

1. Se abre `DocumentsView` con el árbol de carpetas.
2. Arrastra 5 PDFs.
3. Se abre `MultiUpload` con la cola.
4. 3 suben en paralelo, 2 en espera.
5. Cada uno muestra progreso.
6. Al terminar, aparecen en el árbol.
7. Se ingestan en RAG automáticamente.

**Branches:** E2 (DocumentsView + MultiUpload + DocumentTree).

## F07 - Typewriter en el chat

**Usuario:** Alfonso.
**Trigger:** pregunta algo al agente.

1. El agente empieza a responder.
2. El texto aparece letra a letra (typewriter adaptativo).
3. El cursor parpadea al final.
4. Si el agente llama a tools, aparecen agrupadas: "3 pasos · 8s".
5. Al terminar, el texto se queda quieto y el cursor desaparece.

**Branches:** B2 (typewriter + ToolCallsGroup).

## F08 - Ver el centro de control

**Usuario:** Alfonso.
**Trigger:** clica "Centro de control".

1. Se abre `ControlCenterView`.
2. Ve 3 KPIs: Trabajando, Completadas, Esperando OK.
3. Los números cuentan de 0 al valor.
4. Ve el banner "Necesita tu OK" con botón.
5. Ve la lista de procesos en marcha con estado vivo.
6. Ve el estado del equipo con barras.

**Branches:** C2 (ControlCenterView + KpiCard + Sparkline) + A2 (useLiveActivity).

**Fin de flujos.**
