# 16 — Autenticación

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump users.ts, auth.ts, auth-routes.ts, rate-limit.ts, código real

## Ontología

User, UserService, UserRecord, scrypt, session, token, role (admin | user), rate limit, signing key.

## Estado real

UserService con scrypt (64 bytes). Sesiones con SHA-256. Rate limit por IP y email. Rotación de signing key cifrada con AES-256-GCM. auth-routes.ts con login/register/logout/me/users.

## Evidencia

Los 5 tests de auth.test.ts pasan. Rate limit 20 IP, 5 email, 5 min. "login rate limit answers 429 with Retry-After" pasa.

## Huecos declarados

- OIDC / SSO.
- Scopes por rol.
- roleIds: string[].

## Huecos profundos (auditoría extendida)

1. **Sesión sin rotación**: un token válido 7 días no se rota. Si se filtra, vale 7 días.
2. **Sin "remember me"**: no hay opción de "recordar" vs "olvidar" al cerrar el navegador.
3. **Sin "logout de todos los dispositivos"**: el usuario no puede invalidar sus sesiones globalmente.
4. **`scrypt` sin parámetros configurables**: N=16384 hardcodeado. No se puede subir sin tocar código.
5. **Sin pepper en el hash**: si la DB se filtra, atacante puede rainbow tables (aunque scrypt lo hace caro).
6. **Sin validación de fortaleza de contraseña**: acepta "12345678" si tiene 8 chars.
7. **Sin "have i been pwned" check**: no verifica si la contraseña está en filtraciones.
8. **Sin `password_changed_at`**: no se puede invalidar sesiones tras cambio de contraseña.
9. **Sin `last_login_at`**: no se sabe cuándo se conectó un usuario.
10. **Sin `failed_login_count`**: no se bloquea una cuenta tras N intentos (solo rate limit por IP).
11. **Sin 2FA**: no hay TOTP, no hay WebAuthn.
12. **Sin recuperación de contraseña**: si el usuario la olvida, no hay flow.
13. **Sin verificación de email**: el registro no verifica que el email sea real.
14. **`role` de string a roleIds: string[]**: un usuario puede tener varios roles.
15. **`ensureAdmin` solo crea si no hay usuarios**: si hay 1 usuario no-admin, no crea admin.
16. **`verifyCredentials` sin timing-safe compare del hash**: aunque scrypt lo hace, mejor explícito.
17. **Sin "política de contraseñas por tenant"**: no se puede exigir más a unos clientes que a otros.
18. **Sin "auditoría de accesos"**: no hay log de quién entró, cuándo, desde dónde.
19. **Sin "SAML"**: solo password local. Enterprise pide SAML.
20. **Sin "session binding"**: el token no está atado a IP / user-agent.

## Interrelación

Puerta de entrada. Depende de 07, 04.

## Riesgos

Signup público con SIGNUP_ENABLED=true en single-tenant. Sesiones no expiran bien. Rotación de signing key olvidada.

## Tipo de fixes

OIDC opcional por tenant. Scopes declarativos. Migración a roleIds. Password strength. HIBP check. 2FA. Recuperación. Verificación de email. Session binding. SAML.
