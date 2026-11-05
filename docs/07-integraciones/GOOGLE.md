# Integración Google

> v1 · 2026-10-27 · Estado: current

## Arquitectura

OpenMuse se integra con **Gmail, Google Calendar y Google Drive** mediante OAuth 2.0 con PKCE. Los tokens se almacenan cifrados con AES-256-GCM.

## Clientes

### `GoogleClient` (`packages/integrations/src/google.ts`)

Implementa:
- **Gmail**: listar mensajes, leer hilos, obtener adjuntos, enviar emails con adjuntos.
- **Calendar**: listar calendarios, listar eventos, crear, actualizar, eliminar eventos.
- **Drive**: listar archivos, obtener metadata, leer texto (Docs/Sheets/Slides exportados, archivos de texto hasta 2 MiB), mover a papelera, renombrar.

### `GoogleAuth` (`apps/server/src/google-auth.ts`)

Gestiona:
- OAuth con PKCE (`code_verifier` + `state` con generación para detección de replay).
- Almacenamiento de tokens cifrados en `records/credentials/google` (AES-256-GCM).
- Refresh automático de access token (antes de 60 segundos de expiración).
- Revocación de tokens al desconectar.
- `configured()`: verifica `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY`.

## Rutas (`apps/server/src/auth-routes.ts`, `apps/server/src/google-auth.ts`)

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/google/connect` | Sesión | Iniciar OAuth (read/write). |
| POST | `/google/disconnect` | Sesión | Revocar y desconectar. |
| GET | `/google/status` | Sesión | Estado de conexión. |
| GET | `/google/callback` | Pública | Callback de OAuth (manejo interno). |

## `WorkspaceService` (`apps/server/src/workspace.ts`)

Provee acceso unificado a Google por owner:
- `google(owner, connectionId)`: devuelve `GoogleClient` con token del owner.
- `connection(owner)`: devuelve conexión activa o null.
- `connected(owner)`: booleano de conexión.
- `calendars(owner)`: lista de calendarios (sample o Google API).
- `events(owner, options)`: lista de eventos filtrados.
- `execute(owner, input)`: ejecuta acción de workspace (email.send, calendar.create, calendar.update, calendar.delete, drive.trash, drive.rename).
- `importAttachment(owner, reference)`: importa adjunto de Gmail.

## Flujo de conexión

1. Usuario inicia `POST /google/connect` con `capability: "read"` o `"write"`.
2. Si `mode === "sample"`, se simula conexión sin OAuth real.
3. Si `mode === "live"`: redirección a Google OAuth con PKCE, callback, intercambio de código por tokens, cifrado y almacenamiento.
4. Los tokens se refrescan automáticamente cuando expiran.

## Manejo de errores

- `OutcomeUnknownError`: Google pudo haber completado la acción pero no se pudo confirmar. Usado en `trashDriveFile`, `renameDriveFile`.
- `GoogleApiError`: error de la API de Google con status code.
- `RecurringEventError`: eventos recurrentes no se pueden modificar aquí todavía.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth. |
| `GOOGLE_CLIENT_SECRET` | Client secret de Google OAuth. |
| `GOOGLE_HTTP_MS` | Timeout HTTP de Google API (default 30000 ms). |
| `TOKEN_ENCRYPTION_KEY` | Clave para cifrar tokens (obligatoria en live). |

## Límites

- Lectura de Drive: máximo 2 MiB de texto por archivo.
- Binarios en Drive: se devuelve nota, no contenido.
- Eventos recurrentes: no modificables desde OpenMuse.
- Adjuntos de Gmail: máximo 10 MB por PDF, 20 MB total.
