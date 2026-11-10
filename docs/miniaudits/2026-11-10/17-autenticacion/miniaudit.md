# Bloque 17 · Autenticación

> Campaña UX · 2026-11-10 · **13 hallazgos** (S0 0 · S1 5 · S2 6 · S3 2)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | Cambiar la contraseña no invalida sesiones. | Sin verificar |
| 2 | S1 | Desactivar o borrar un usuario no corta su sesión: `auth.owner` no mira `active`. | Sin verificar (grep de `active` en `auth.ts` sin resultados) |
| 3 | S1 | `switch-tenant` emite un token nuevo sin revocar el anterior: dos empresas vivas. | Sin verificar |
| 4 | S1 | Dos caminos de sesión con TTL distinto: `SESSION_TTL_MS` y 7 días fijos en `auth-routes`. | Sin verificar |
| 5 | S1 | El registro público se reabre si un admin deja la lista de usuarios vacía. | Sin verificar |
| 6 | S2 | `login` emite `auth.login` antes de persistir la sesión. | Sin verificar |
| 7 | S2 | Sin revocación global ni tope de sesiones por usuario; `logout` borra una sola. | Sin verificar |
| 8 | S2 | El límite de login confía en `x-forwarded-for` sin validar el proxy. | Sin verificar |
| 9 | S2 | Los límites de IP y email son por proceso. | Sin verificar |
| 10 | S2 | Sin verificación de email ni recuperación de contraseña. | Sin verificar |
| 11 | S2 | El modo de auth se elige por configuración y las dos vías conviven sin camino único. | Sin verificar |
| 12 | S3 | La página de callback OAuth inyecta el token en el HTML. | Sin verificar |
| 13 | S3 | Contraseña mínima de 8 y sin lista de bloqueo. | Sin verificar |

## Arreglos propuestos

1. **Una sesión, una revocación.** Tabla de sesiones con `version`/`epoch` por usuario: cambiar contraseña, desactivar usuario o `switch-tenant` incrementan la época e invalidan lo anterior.
2. **`active` en la verificación**, no sólo en el login: un usuario desactivado no puede seguir operando con un token válido.
3. **Un solo TTL** desde una constante, y `switch-tenant` que revoca el token de origen.
4. **`login` persiste y luego emite**: el evento no puede anunciar una sesión que aún no existe.
5. **`x-forwarded-for` sólo si hay proxy declarado** (`TRUST_PROXY`), y rate limit compartido.

## Plan

- **P1 (invalidez)**: épocas de sesión, `active` en auth, `switch-tenant` revocando.
- **P2 (registro y eventos)**: orden login/evento, límites compartidos, proxy explícito.
- **P3 (cuenta)**: verificación de email, recuperación y política de contraseñas.

---

## Revisión de destino

En un deployment compartido con N tenants, varios usuarios de varias empresas conviven en el mismo proceso: hay que poder cortar el acceso de uno sin reiniciar el servicio ni expulsar a los demás.

- **Épocas de sesión**: cambiar contraseña, desactivar usuario o `switch-tenant` invalidan lo anterior.
- `active` comprobado en cada petición, no sólo en el login.
- Un único TTL y registro público cerrado por defecto.

## Conclusión

Sin revocación, un despido o un cambio de contraseña no surte efecto hasta que caduque el token, y en multitenant un miembro que deja una empresa conserva acceso a ella hasta el TTL. **P1**, y **P0** con el primer cliente de pago.
