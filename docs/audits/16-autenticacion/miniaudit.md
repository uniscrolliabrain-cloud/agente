# 16 — Autenticación

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump users.ts, auth.ts, auth-routes.ts, rate-limit.ts

## Ontología

User, UserService, UserRecord, scrypt, session, token, role
(admin | user), rate limit, signing key.

## Estado real

UserService con scrypt (64 bytes, salt aleatorio). Sesiones con SHA-256.
Rate limit por IP + email. Rotación de signing key cifrada con AES-256-GCM.
auth-routes.ts con login/register/logout/me/users.

## Evidencia

Los 5 tests de auth.test.ts pasan. Rate limit: 20 intentos por IP, 5 por
email, ventana 5 min. El test "the login rate limit answers 429 with
Retry-After" pasa. Firma: `userRoleSchema` con admin | user.

## Huecos

OIDC / SSO. Scopes por rol. roleIds: string[] (un usuario solo tiene un
rol). Rotación de signing key automática.

## Interrelación

Puerta de entrada. Depende de 07 (tenant), 04 (multi-usuario).

## Riesgos

Signup público con SIGNUP_ENABLED=true en single-tenant. Sesiones no
expiran bien. Rotación de signing key se olvida.

## Tipo de fixes

OIDC opcional por tenant. Scopes declarativos por rol. Migración a
roleIds: string[]. Test de sesión expirada y robo de token.
