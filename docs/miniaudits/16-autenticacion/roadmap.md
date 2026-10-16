# Roadmap — 16 autenticación

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Login seguro, sin fugas de sesión. SECURITY.md: un owner por deployment.

## 2. Estado verificado
- scrypt, sesiones SHA-256, rate limit IP+email.
- Rotación de signing key cifrada.
- Fuente: repodump users.ts, auth.ts, auth-routes.ts, rate-limit.ts.

## 3. Huecos contra producción
- Sin OIDC / SSO.
- Sin scopes por rol.
- roleIds: string[] pendiente.
- Rotación de signing key manual.

## 4. Objetivo
Auth con roles múltiples. OIDC opcional por tenant.

## 5. Fronteras
- No SSO corporativo todavía.

## 6. Conexiones
- Depende de: 07, 04.
- Archivos compartidos: users.ts, auth.ts.

## 7. Principios del PRODUCT.md
Tareas durables (verificación de quién ejecuta).

## 8. Cómo se verifica el cierre
- Test de sesión expirada bloqueada.
- Test de robo de token bloqueado.
- Migración de roleId a roleIds probada.
