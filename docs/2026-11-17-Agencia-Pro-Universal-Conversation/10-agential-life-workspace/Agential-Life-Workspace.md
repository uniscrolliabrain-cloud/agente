# Agential Life Workspace

**Fecha:** 2026-11-17  
**Estado:** concepto maestro y arquitectura objetivo, no funcionalidad ya implementada.  
**Relación:** extensión de Agencia Pro Universal Conversation.

## Visión

Agential Life Workspace es un espacio de colaboración humano–agente en vivo. El usuario conversa con un agente mediante vídeo/avatar, voz o texto, mientras ambos observan y modifican un mismo artefacto: documento Writer, hoja Calc, presentación, presupuesto u otro workspace. La experiencia debe parecerse a colaborar digitalmente con otra persona: presencia, conversación, cursores, selección, sugerencias, cambios verificables y continuidad.

**Ejemplo central:** panel izquierdo con videoconversación con el copywriter; panel derecho con Agntia Office simplificado o Collabora completo. El usuario habla o escribe, el agente propone y ejecuta cambios visibles en el documento. El usuario también edita directamente. Ambos trabajan sobre el mismo documento y una única línea de conversación persistente.

## Experiencia y UX

- Vista dividida adaptable: vídeo/chat a la izquierda; editor a la derecha. Proporciones ajustables, especialmente en móvil.
- Modo Agntia Office: interfaz React propia, branding, operaciones frecuentes y asistencia contextual.
- Modo Collabora: editor completo cuando se necesiten funciones avanzadas.
- Cambio de modo sobre el mismo documento, con persistencia y coordinación de versiones; no mantener dos copias divergentes.
- El agente muestra identidad, cursor, selección, región editada, cambios propuestos y estados reales de trabajo.
- El usuario puede hablar, interrumpir, escribir en el chat o editar el documento; las modificaciones humanas tienen prioridad y no se sobrescriben silenciosamente.
- Mostrar propuesta/diff antes de cambios sensibles; permitir aceptar, rechazar, deshacer y consultar historial.
- El vídeo es opcional: la sesión continúa por voz o texto y persiste aunque se cierre el avatar.
- La conversación universal sigue disponible desde Gmail, Drive, AgntiaPro y futuras superficies; la sesión audiovisual es una modalidad, no otro chat.

## Arquitectura

```text
  Usuario ── vídeo/voz/texto ──> Agntia Live Session
     │                                │
     ├── edición directa              ├── Universal Conversation (threadId)
     │                                ├── transcripción/turnos/contexto
     ▼                                └── harness/LAIA/agente especializado
  Agntia Office UI  <── document events ──> Document Transaction Coordinator
  Collabora UI      <── document state  ──>   │
                                              ├── permisos y aprobaciones
                                              ├── SOPs tipados + MCP tools
                                              ├── LibreOffice UNO worker
                                              ├── versionado/diffs/reversión
                                              └── almacenamiento documental
```

**Separar cuatro planos:**
1. Presencia audiovisual: avatar, voz, STT/TTS, estado de llamada; no es fuente de verdad documental.
2. Conversación: mensajes y transcripción relevantes en hilo autoritativo de AgntiaPro.
3. Documento: contenido, versión, revisiones, permisos, selección y cambios.
4. Ejecución: acciones deterministas, validaciones, evidencias, aprobaciones y auditoría.

## Contratos propuestos

- `LiveSession`: sessionId, tenantId, userId, threadId, documentId, agentId, status, startedAt, endedAt.
- `DocumentRef`: documentId, tenantId, format, storageRef, revision, editorMode, permissions.
- `SelectionContext`: documentId, revision, anchor/range, actorId, expiresAt.
- `DocumentOperation`: operationId, documentId, baseRevision, actorId, type, payload tipado, idempotencyKey, expectedEffects.
- `DocumentChange`: operationId, beforeRevision, afterRevision, diffRef, verification, auditRef.
- `PresenceEvent`: actorId, sessionId, documentId, cursor/selection, ephemeralTimestamp.
- `ConversationEvent`: threadId, sessionId?, runId?, sourceSurface, causationId, sequence.

Todos los identificadores de tenant/actor deben derivarse de identidad autenticada; validar ACL y revision antes de editar. Los eventos efímeros de cursor no deben saturar el bus durable.

## Flujo de ejemplo

1. Usuario abre un documento de campaña y llama al copywriter mediante avatar.
2. El copywriter recibe la selección autorizada y el contexto de la conversación, no acceso indiscriminado a todo el Drive.
3. Usuario: «No me gusta este párrafo; deja mi primera frase y reescribe el resto».
4. El agente produce una operación tipada anclada a la revisión y al rango.
5. El runtime valida permisos, conflicto de edición, alcance y política; genera propuesta/diff.
6. El usuario observa la propuesta y aprueba cuando corresponda.
7. El worker aplica el cambio, verifica resultado, guarda revisión y emite evento.
8. Ambas interfaces reciben el estado actualizado; la conversación registra la decisión y el resultado.
9. Si el usuario cambia el texto mientras el agente trabaja, la operación se revalida o se rechaza por conflicto; jamás se pisa el cambio sin aviso.
10. Si termina la videollamada, documento y conversación permanecen accesibles.

## Consideraciones técnicas críticas

- WOPI conecta Collabora con almacenamiento y permisos; **no es** por sí solo una API universal para editar cada celda o párrafo.
- Collabora/LibreOffice UNO puede servir como motor de operaciones, con worker separado del servidor TS y coordinación de sesiones.
- El editor Agntia simplificado no debe pretender representar perfectamente todas las funciones DOCX/XLSX. Debe preservar contenido no soportado y abrir Collabora para edición profunda.
- En el MVP, operaciones versionadas sobre copia de trabajo o mecanismo controlado; la colaboración humano–agente realmente simultánea necesita investigación y pruebas específicas de compatibilidad con sesiones activas de Collabora.
- Latencia: optimizar voz/streaming y feedback; no bloquear la conversación esperando conversiones pesadas. Diferenciar «proponiendo», «aplicando», «verificado».
- Seguridad: prompt injection en documentos, mínimo privilegio, consentimiento audiovisual, tratamiento de transcripciones, aislamiento multitenant y aprobación para acciones externas.
- El agente no debe simular una edición completada si el backend no ha confirmado el cambio.

## Campañas de implementación propuestas

| Fase | Entrega | Gate |
|---|---|---|
| ALW-00 | Auditoría Collabora/WOPI/UNO, UX y límites de APIs | Matriz de capacidades verificada |
| ALW-01 | Contratos LiveSession, DocumentRef, Operation y revision | Tests de schemas y authz |
| ALW-02 | Middleware agntia-office, WOPI host y storage | Abrir/guardar documento seguro |
| ALW-03 | Collabora embebido + interfaz Agntia simplificada | Cambio de modo sin divergencias |
| ALW-04 | MCP + SOPs Writer/Calc y workers UNO | Operaciones deterministas verificadas |
| ALW-05 | Coordinador transaccional, conflictos y undo | No pérdida de ediciones humanas |
| ALW-06 | Sesión vídeo/voz/avatar + transcripción | Chat persistente sin depender del vídeo |
| ALW-07 | Presencia, selección y propuestas visibles | Usuario ve cambios reales y diff |
| ALW-08 | E2E multiusuario, multitenant, seguridad, rendimiento | Gates de producción |

## Criterios de aceptación

- Hablar con el copywriter por vídeo mientras se ve el documento en otra mitad de pantalla.
- Usuario y agente pueden modificar el mismo documento sin sobrescribir cambios ajenos.
- La operación del agente es rastreable, verificable y reversible.
- Cambiar entre Agntia Office y Collabora conserva el mismo documento.
- La sesión audiovisual puede finalizar sin perder historial, archivo ni trabajo.
- Continuar por Gmail/Drive/AgntiaPro utiliza el mismo hilo de Universal Conversation.
- Ningún acceso cross-tenant; permisos, aprobaciones y auditoría aplicados por el harness.

## Decisión de producto

**Agential Life Workspace = Universal Conversation + presencia audiovisual + documento compartido + runtime determinista.** No construir un segundo chat ni un nuevo motor ofimático desde cero. Construir una experiencia de colaboración propia sobre componentes existentes y contratos controlados por AgntiaPro.

No implementar ni desplegar sin campaña aprobada.