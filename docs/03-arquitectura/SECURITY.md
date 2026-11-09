# Seguridad

> v2 · 2026-10-27 · Estado: current

## Boundaries de seguridad

### Autenticación

- **Access key**: `AGENTE_ACCESS_KEY` (24+ caracteres en modo `live`). Validación con `timingSafeEqual` contra hash SHA-256.
- **Sesiones**: token aleatorio de 32 bytes (base64url), almacenado en `records/system/sessions` con TTL configurable (`SESSION_TTL_MS`, default 7 días).
- **URLs firmadas**: HMAC SHA-256 con `owner\npath\nexpirations`. Expiración a 15 minutos. Verificación con `timingSafeEqual`.
- **Google OAuth**: códigos de autorización con PKCE (`code_verifier`), state con generación para detección de replay. Tokens cifrados con AES-256-GCM (`TOKEN_ENCRYPTION_KEY`).

### Autorización (authz)

- `authzEnabled`: `true` por defecto en modo `live`, configurable en `sample`.
- `fieldClassificationEnabled`: clasificación de campos sensible, `true` por defecto en `live`.
- `assertNotHardcodedTenantId()`: rechaza el uso hardcodeado de `"default"` como tenantId fuera de `TenantService`.
- Políticas ABAC declarativas (`packages/domain/src/policy.ts`): sujeto, acción, recurso, efecto (allow/deny), condición, `tenantId` opcional.

### Multi-tenant y aislamiento

- `TenantScopedStore`: clave compuesta `tenantId:owner`. Dos owners idénticos en tenants distintos no colisionan.
- `TenantService`: resuelve `tenantId` por owner con cache TTL configurable (`TENANT_CACHE_TTL_MS`, default 5 min). Fallback a `"default"`.
- `db-rls.ts`: Row Level Security opcional para Postgres real (`MULTI_TENANT_SHARED=true`). Columna `tenant_id`, política `tenant_isolation`, `FORCE ROW LEVEL SECURITY`.
- `withTenantRls()`: envuelve queries en `SET LOCAL app.tenant_id` dentro de transacción.

### Cifrado de credenciales

- `vault.ts`: AES-256-GCM envelope versionado (`v1.nonce.tag.ciphertext`). Clave de 32 bytes base64 (`TOKEN_ENCRYPTION_KEY`).
- `google-auth.ts`: tokens de Google cifrados antes de guardar en `records/credentials/google`. Rotación de generación con CAS para evitar races.

### Rate limiting

- `RateLimiter`: bucket en memoria por clave arbitraria (IP, email, tenant+user+action).
- Ventana configurable. Límite de 5000 claves máximas con prune de las más antiguas.
- `takeForTenant(tenantId, userId, action)`: key compuesta `tenantId:userId:action` para evitar que un tenant agote el límite de otro.

### Guardas-costas por tenant

- `GuardrailService`: cuotas por tenant (tokens/día, tareas activas, tareas/hora, eventos/día, turnos activos, coste EUR/día, llamadas fast/slow por hora).
- Default: `costEurPerDay: 50` (valor de referencia, no consumo real medido).
- `checkTaskCreation`, `checkTokens`, `checkCost`, `checkSpeedQuota`: lanzan `AppError 429` al exceder cuota.

### Límites conocidos

- `RateLimiter` es por máquina (no distribuido). En Fly multi-machine, mover a Redis.
- `GuardrailService` lee cuotas de `records/guardrail-quotas`. Si no hay fila, usa defaults.
- RLS solo aplica en Postgres real, no en PGlite.
