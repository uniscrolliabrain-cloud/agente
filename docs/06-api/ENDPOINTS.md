# Referencia de Endpoints API

> v1 · 2026-10-27 · Estado: current

Base: `http://{HOST}:{PORT}/api`. Autenticación: `Bearer <token>` de sesión o access key en modo `live`.

## Auth

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | Pública | Login con email + password. Rate limit: 20/IP, 5/email c/5 min. |
| POST | `/auth/users` | Admin | Crear usuario (solo admin). |
| PATCH | `/auth/users/:id` | Admin | Editar usuario (solo admin). |
| DELETE | `/auth/users/:id` | Admin | Eliminar usuario (solo admin). |
| GET | `/auth/users/:id/tasks` | Admin | Últimas tareas de un usuario (paginación keyset). |

## Conversación y chat

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/copilotkit/run` | Sesión | Chat AG-UI con SSE. Delegado al vendor (sample/model/agui). |
| GET | `/conversation` | Sesión | Obtener thread principal del owner. |
| PUT | `/conversation` | Sesión | Reemplazar mensajes del thread (máx. 1000). |

## Tareas durables

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/agent/tasks` | Sesión | Crear tarea (kind: agent\|document\|monitor\|finance\|plan\|sop). |
| GET | `/agent/tasks` | Sesión | Listar tareas del owner con filtros y paginación. |
| POST | `/agent/goals/:id/run` | Sesión | Ejecutar ciclo de objetivo (planner → executor → verifier → replanner). |

## Archivos

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/files` | Sesión | Importar archivo (PDF, imagen, etc.). |
| GET | `/files/:id/content` | Sesión | Obtener contenido de archivo. |
| POST | `/files/:id/fill` | Sesión | Rellenar campos de un PDF. |
| POST | `/mail/import-attachment` | Sesión | Importar adjunto de Gmail. |

## Google

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/google/connect` | Sesión | Iniciar OAuth de Google (read/write). |
| POST | `/google/disconnect` | Sesión | Revocar y desconectar Google. |
| GET | `/google/status` | Sesión | Estado de conexión de Google. |

## Eventos

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/events` | Sesión | Listar eventos con filtros (type, since, sinceId, until, limit, taskId). |
| GET | `/events/stream` | Sesión | SSE de eventos en vivo del owner (heartbeat c/15s). |
| GET | `/events/aggregate` | Sesión | Agregados de eventos (últimas N horas). |
| GET | `/events/schemas` | Sesión | Tipos de evento y versión. |
| GET | `/events/timeline` | Sesión | Timeline de eventos por hora. |
| GET | `/events/replay` | Sesión | Replay de eventos por rango de fechas. |
| GET | `/events/snapshot` | Sesión | Snapshot agregado del bus. |

## WhatsApp

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/whatsapp/drafts` | Sesión | Listar drafts pendientes de revisión. |
| POST | `/whatsapp/drafts/:id/send` | Sesión | Aprobar y enviar draft (crea tarea SOP si webhook entrante). |
| POST | `/whatsapp/drafts/:id/reject` | Sesión | Rechazar draft. |
| POST | `/whatsapp/webhook` | Firma HMAC | Webhook público de Evolution API. Verifica firma `x-hub-signature-256` o `x-signature`. |

## Admin

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/admin/tenants` | Admin | CRUD de tenants. |
| POST | `/admin/tenants` | Admin | Crear tenant. |
| PATCH | `/admin/tenants/:id` | Admin | Editar tenant. |

## Workspaces

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/workspaces` | Sesión | Listar workspaces disponibles (34 catálogo). |
| GET | `/workspaces/:id` | Sesión | Detalle de un workspace. |

## Convenciones de respuesta

- Todas las respuestas son JSON.
- Errores: `{ error: string, status?: number }` con código HTTP apropiado (400, 401, 403, 404, 409, 422, 429, 502, 503).
- `outcome_unknown`: usado cuando una acción externa puede haber tenido efecto pero no se pudo confirmar (ej. timeout de Google API).
