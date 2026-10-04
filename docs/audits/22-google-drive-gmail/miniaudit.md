# 22 — Google / Drive / Gmail

## Que tiene

OAuth completo con PKCE, tokens cifrados AES-256-GCM, Gmail read+send,
Calendar CRUD con ETag, Drive read, google-auth.ts con refresco de tokens,
google.ts con paginacion.

## Que le falta

- Drive write completo: trash y rename estan, pero falta create, copy, share.
- Sheets export a CSV.
- Batch operations: leer 100 emails uno a uno es lento.
- Contactos: no hay integracion con Google Contacts.

## Interrelacion con el macro

Es una de las fuentes de datos principales.

## Riesgos

- Que Google revoke el token y todas las tareas fallen sin aviso.
- Que un email se envie dos veces por un outcome_unknown mal reconciliado.
- Que el usuario agote la cuota de Google y no se entere.

## Tipo de fixes que necesitara

- Deteccion de token revocado con notificacion.
- Batch endpoints en google.ts.
- Cuota de Google visible en /api/health-deep.
