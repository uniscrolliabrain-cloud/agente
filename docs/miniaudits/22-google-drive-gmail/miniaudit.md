# 22 — Google / Drive / Gmail

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump google.ts, google-auth.ts, código real

## Ontología

GoogleClient, GoogleAuth, OAuth con PKCE, tokens AES-256-GCM, Gmail read y send, Calendar CRUD con ETag, Drive read y trash y rename.

## Estado real

OAuth completo con PKCE. Tokens cifrados AES-256-GCM. Gmail read+send con attachments. Calendar CRUD con ETag y reviews. Drive read+trash+rename. google-auth.ts con refresco de tokens.

## Evidencia

Los 30 tests de google.test.ts pasan (MIME anidado, CRLF, attachments, OAuth PKCE, ETag mismatch, recurrencia rechazada, red failure → outcome_unknown). Los 7 de oauth.test.ts pasan. Los 2 de vault.test.ts pasan.

## Huecos declarados

- Drive write completo.
- Sheets export CSV.
- Batch operations.
- Contactos.

## Huecos profundos (auditoría extendida)

1. **Drive write incompleto**: solo trash y rename. Falta create, update, delete.
2. **Sin Drive watch**: no se detectan cambios en archivos del usuario.
3. **Sin Gmail push notifications**: solo polling.
4. **Sin "Gmail label management"**: no se pueden crear labels.
5. **Sin "Gmail filter"**: no se pueden crear filters.
6. **Sin "Calendar reminders"**: no se configuran notificaciones de eventos.
7. **Sin "Calendar recurrence expansion"**: los eventos recurrentes no se expanden.
8. **Sin "Calendar attendees response"**: no se sabe si los invitados aceptaron.
9. **Sin "Drive permission management"**: no se puede compartir/descompartir archivos.
10. **Sin "Drive folder tree"**: solo se listan archivos, no carpetas.
11. **Sin "Sheets cell-level update"**: solo export CSV.
12. **Sin "Docs creation"**: no se pueden crear Docs.
13. **Sin "batch API usage"**: 1 request por archivo, no batch.
14. **Sin "quota management"**: si se agota la cuota, falla sin aviso previo.
15. **Sin "token rotation"**: el refresh token vive hasta que se revoca.
16. **Sin "revoked token detection"**: el token puede ser revocado por el usuario y no lo sabemos.
17. **Sin "Gmail search con labels"**: solo search básico.
18. **Sin "Gmail thread-level actions"**: solo read, no archive/mark.
19. **Sin "Drive shortcuts"**: no se pueden crear shortcuts.
20. **Sin "Workspace admin API"**: no se puede gestionar el dominio.

## Interrelación

Fuente de datos principal. Depende de 06, 05.

## Riesgos

Token revocado sin aviso. Email enviado dos veces por outcome_unknown. Cuota agotada.

## Tipo de fixes

Detección de token revocado con notificación. Batch endpoints. Cuota de Google en health-deep. Drive write completo. Calendar reminders. Sheets cell-level. Drive permissions.
