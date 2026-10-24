# Roadmap — 22 Google Drive y Gmail

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Leer y escribir en Google con OAuth cifrado.

## 2. Estado verificado
- OAuth con PKCE, tokens AES-256-GCM.
- Gmail read+send, Calendar CRUD con ETag, Drive read+trash+rename.
- Fuente: repodump google.ts, google-auth.ts.

## 3. Huecos contra producción
- Drive write completo (create, copy, share).
- Sheets export a CSV.
- Batch operations.
- Contactos.

## 4. Objetivo
Integración completa de Google Workspace.

## 5. Fronteras
- No Google Chat.

## 6. Conexiones
- Depende de: 06, 05.
- Archivos compartidos: google.ts, google-auth.ts.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Test end-to-end de cada acción de Google.
- Detección de token revocado con notificación.
- Cuota visible en health-deep.
