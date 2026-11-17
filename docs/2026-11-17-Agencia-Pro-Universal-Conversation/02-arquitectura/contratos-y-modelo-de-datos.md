# Contratos y modelo de datos v1 propuesto

## Entidades
- ConversationThread: id UUID, tenantId, ownerUserId, scope (personal|shared), title, createdAt, updatedAt, version, archivedAt, visibility.
- ActiveConversation: tenantId, userId, scope, threadId, version, changedAt, changedBy; clave única (tenantId,userId,scope).
- ConversationMessage: id UUID/ULID, threadId, tenantId, sequence, role, content, sourceSurface, createdAt, runId?, idempotencyKey?, metadataReference?; clave única (threadId,sequence).
- ConversationRun: runId, threadId, actorId, status (queued|running|awaiting_approval|completed|failed|cancelled), version, timestamps.
- SurfaceContext: surface (agntiapro|gmail|drive|outlook|calendar|teams|other), providerAccountId, resourceType, resourceId, capabilities, expiry, authorizationRef, optional safe summary.
- ConversationEvent: eventId, schemaVersion, type, tenantId, actorId, threadId, runId?, causationId?, correlationId?, at, payloadRef.

## Invariantes
tenantId, userId y permisos se derivan de sesión autenticada; no confiar en valores del cuerpo. threadId se valida contra membresía y ACL. sourceSurface es dato de presentación, no fuente de autorización. No almacenar OAuth tokens en mensajes. No guardar contenido íntegro de emails/Drive por defecto en metadatos del chat; preferir referencias y resúmenes consentidos. El contenido efectivamente conversado sí forma parte del historial bajo retención acordada.

## API v1 orientativa
GET /api/chat/active?scope=personal
PUT /api/chat/active {threadId,expectedVersion}
POST /api/chat/threads {title?,scope?}
GET /api/chat/threads/:id?cursor=...
POST /api/chat/threads/:id/messages {clientMessageId,idempotencyKey,content,contextRefs?}
GET /api/chat/threads/:id/events?after=...
POST /api/chat/runs/:id/cancel
POST /api/chat/approvals/:id/decision

La API exacta debe reconciliarse con /api/threads y /copilotkit/run existentes; no introducir rutas duplicadas sin migración. Responses deben incluir serverSequence, cursor, revision y estados de persistencia.

## Ejemplo conceptual
```json
{
  "threadId": "uuid",
  "messageId": "uuid",
  "role": "user",
  "content": "Busca el presupuesto de Pedro",
  "source": {"app": "google-drive", "resourceRef": "opaque-ref"},
  "sequence": 42,
  "createdAt": "2026-11-17T09:22:00Z"
}
```

## Versionado
Schemas Zod públicos en packages/domain; discriminated unions para eventos, backward compatibility y migraciones SQL explícitas. Usar Postgres y RLS cuando esté habilitado; validar índices, atomicidad y durabilidad.
