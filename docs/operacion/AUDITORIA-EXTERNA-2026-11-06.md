# Auditoría externa del 2026-11-06: verificación punto por punto

SHA auditado: `8df55c2` (`campaign/conexiones-doppler`). Esta es la respuesta a la
reauditoría: qué era cierto, qué no, y qué se ha corregido con evidencia.

Regla que se ha seguido: **no se acepta un hallazgo por su redacción**. Cada uno se
comprobó contra el código del SHA auditado; los que eran ciertos se arreglaron y los
que estaban mal descritos se corrigen aquí.

| # | Hallazgo | Veredicto | Evidencia | Estado |
|---|---|---|---|---|
| 1 | OAuth sin `state` atado al navegador / no atómico / email sin verificar estricto / lista blanca solo para cuentas nuevas | **CIERTO** (los cuatro) | `oauth-login.ts:115-160` y `:200-215` | Corregido |
| 2 | El worker reclama con `owner` pelado y sin tenant | **CIERTO** | `db-tenant.ts:153`, `worker.ts:181`; el propio comentario de `tick()` lo admitía | Corregido + test |
| 3 | `deploy.yml` despliega en producción con `preview`, importa todos los secretos y el humo no tiene dependencias | **CIERTO** (los cuatro) | `.github/workflows/deploy.yml:35-70` | Corregido |
| 4 | El registro de tenants no está separado en su namespace; solo hay guard | **CIERTO** | `engine/tenant.ts:75` (`TENANT_SYSTEM_NAMESPACE_GUARD_V1`) | Documentado; separación pendiente |
| 5 | El backup copia ficheros locales y presenta `0.00 MB` como respaldo | **CIERTO** | `backup.ts:70` | Corregido (manifiesto + aviso) |
| 6 | Voz: idempotencia check-then-act y metadatos del cliente pueden pisar `tenantId`/`owner` | **CIERTO** | `voice-routes.ts:94-127` | Corregido |
| 7 | `fly.toml` ya declara `fra` | **CIERTO** | `fly.toml:10` | El informe lo daba por resuelto; mi `DESPLIEGUE.md` decía `mad`: corregido |
| 8 | Los tokens amplios de GitHub/Cloudflare pudieron llegar a Fly | **CIERTO, y peor** | `flyctl secrets list`: `CLOUDFLARE_API_TOKEN` en **las dos** apps | Retirado de ambas |

## 1 · Login social (P0)

Lo que había: el `state` se guardaba en el store y se consumía con `get` + `remove`.
Eso deja dos huecos reales:

- **No es atómico.** Dos callbacks simultáneos con el mismo `state` leen la fila antes
  de que ninguno la borre y los dos completan el canje.
- **No está atado al navegador.** Un atacante inicia el flujo con su cuenta, conserva
  la URL de callback y hace que la víctima la abra: la sesión que queda en el navegador
  de la víctima es la del atacante (login CSRF / fijación de sesión). La lista blanca
  reduce el daño, pero no lo elimina si el atacante está en la lista.

Además, `email_verified === false` dejaba pasar un email **sin** el campo, y GitHub
usaba el email del perfil público sin pasar por `/user/emails`. La lista blanca se
saltaba para cualquier cuenta ya existente (`&& !existing`), que es justo la población
para la que existe la barrera.

Corregido en `apps/server/src/oauth-login.ts`:

- `OAUTH_STATE_BINDING_V1`: cookie `HttpOnly`, `SameSite=Lax`, `Path=/api/auth/oauth`,
  `Secure` con `PUBLIC_API_URL` https. El `state` guarda el hash de ese valor y el
  callback exige que coincidan.
- `OAUTH_STATE_ATOMIC_CONSUME_V1`: `db.take()` (`DELETE … RETURNING`). Un solo canje.
- `OAUTH_EMAIL_VERIFIED_STRICT_V1`: se exige `email_verified === true`.
- `OAUTH_GITHUB_VERIFIED_EMAIL_V1`: la identidad sale siempre de `/user/emails`.
- `OAUTH_ALLOWLIST_ALL_USERS_V1`: la lista se aplica también a cuentas existentes.
  El acceso con contraseña de `ADMIN_EMAIL` sigue disponible como break-glass.

Verificado en producción: `start` devuelve 302 con la cookie y el callback **rechaza
el segundo intento con el mismo `state`**.

## 2 · Aislamiento del worker (P0)

El diagnóstico era correcto y el código lo admitía por escrito: «con scanByOwnerPrefix
requiere conocer el tenant activo, que el worker no tiene». La consecuencia exacta:

1. `scanByStatus` devolvía el owner ya **pelado** (`empresa-b:owner` → `owner`).
2. `run()` reclamaba con `compareAndSwap(owner, "tasks", id, …)`.
3. Sin scope de petición, el `TenantScopedStore` resolvía la membership **primaria** del
   usuario (empresa-a).
4. La fila de empresa-b no se encontraba: `compareAndSwap` devolvía `null` y la tarea
   **no se ejecutaba nunca**. No corrompía datos, pero el worker se quedaba mudo para
   toda empresa que no fuera la primaria del usuario.

Corregido:

- `db-tenant.ts`: `scanByStatusWithTenant()` devuelve `{ tenantId, owner, value }`. El
  tenant sale de la propia clave compuesta, así que funciona incluso en el arranque
  del worker, cuando no hay ningún prefijo registrado. También se corrigió `scan()`,
  que usaba **solo el primer** prefijo conocido y omitía las filas de los demás.
- `worker.ts`: el tick fija `runInTenantScope({ tenantId, actorId })` antes de reclamar,
  y la lectura de la acción en `waiting_approval` va dentro del mismo scope
  (`WORKER_TENANT_ACTION_READ_V1`). Las filas sin tenant declarado mantienen el
  comportamiento anterior.

Prueba: `tests/tenant-worker-claim.test.ts`. Siembra la misma tarea en dos empresas de
un mismo usuario y exige que ambas se ejecuten. **Falla con el worker anterior** (solo
corre `empresa-a:alpha`) y pasa con el arreglo.

## 3 · Despliegue y secretos (P0)

Lo que hacía el workflow auditado:

- `environment: preview` **desplegaba sobre `agntiapro-api` y `agntiapro-worker`**, es
  decir producción, sin ningún aviso.
- `doppler secrets download` **entero** a las dos apps: el token de Cloudflare de
  espectro amplio, el de Fly, el de Doppler y los de Vercel acababan dentro del
  servidor web.
- El humo hacía `pnpm exec tsx` en un job **sin `pnpm install`**.
- Nada registraba el SHA desplegado.

Corregido en `.github/workflows/deploy.yml`:

- `DEPLOY_TARGET_RESOLVER_V1`: `preview` exige `FLY_APP_API_PREVIEW` y
  `FLY_APP_WORKER_PREVIEW` y **falla** si no están. Producción usa `FLY_APP_API` /
  `FLY_APP_WORKER` con los nombres actuales como defecto.
- `DEPLOY_SECRETS_DENYLIST_V1`: filtro `jq` que excluye `CLOUDFLARE_*`, `FLY_*`,
  `DOPPLER_*`, `VERCEL_*`, `NEON_*`, `GH_*`, `AWS_*`, `AZURE_*`, `GCP_*`,
  `SUPABASE_ACCESS_*` y `GITHUB_TOKEN`. El runtime no usa ninguno.
- `DEPLOY_IMAGE_LABEL_V1`: `--image-label <sha>` y `flyctl image show` al final.
- `DEPLOY_SMOKE_JOB_V1`: el humo es un job propio con `pnpm install --frozen-lockfile`,
  y solo en producción.

Además se **retiraron** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` y
`CLOUDFLARE_ZONE_ID` de las dos apps de Fly. El único consumidor en el repo es
`scripts/lib/connections.ts` (sondas), no el servidor.

## 4 · Registro de tenants (P1)

El informe dice que el handoff afirma «se separó el namespace» y que el código solo
añade un guard. **Tiene razón**: no se separó nada; se añadió
`TENANT_SYSTEM_NAMESPACE_GUARD_V1`, que impide que `resolve("system")` interprete las
filas del registro como memberships legacy y las reescriba/borre.

El guard está verificado reiniciando la máquina (el registro sobrevive), pero la
separación real exige migrar lectores y escritores a la vez, y hay filas vivas en
producción con el `kind` actual. Queda como deuda explícita, no como hecho.

## 5 · Backup con Neon (P1)

`runBackup` copiaba `DATA_DIR/postgres`, que con `DATABASE_URL` remota no existe: el
resultado `0.00 MB` era literalmente un backup vacío presentado como correcto.

Corregido: `BACKUP_DATABASE_MODE_V1` detecta base externa, no copia ficheros de
Postgres, escribe en el manifiesto `database.mode` y la frase de recuperación, y deja
un `logWarn` con el host. La recuperación real de Neon (PITR / branch / restore) está
documentada en `DESPLIEGUE.md`.

## 6 · Voz (P1)

Check-then-act: dos peticiones concurrentes con la misma `Idempotency-Key` no veían
nada, las dos llamaban a Vapi y el lead recibía dos llamadas. Corregido con
`insertIfAbsent` como reserva **antes** de llamar (`VOICE_IDEMPOTENCY_RESERVE_V1`): el
que pierde la reserva recibe `409` si aún está pendiente o el registro previo si ya
terminó. Si Vapi falla, se libera la reserva; si Vapi acepta y el guardado falla, se
registra el `providerId` en el log para poder reconciliar
(`LOG_FAILURE_PROVIDER_ID_V1`).

También se invirtió el orden de los metadatos
(`VOICE_METADATA_PRECEDENCE_V1`): `tenantId` y `owner` van al final, así que
`body.metadata` ya no puede sobrescribirlos.

## Lo que esta respuesta NO cierra

- **Registrar las callbacks** en Google Cloud y en la OAuth App de GitHub. No hay API
  para eso: lo tiene que hacer el dueño.
- **Prueba con navegador real** de los dos proveedores: requiere las callbacks y una
  cuenta interactiva.
- **Restauración de Neon** en un destino aislado. No hay `NEON_API_KEY` en Doppler;
  con ella se puede crear un branch y verificar allí tenant, membresías y los 8 SOPs.
- **Separación del namespace del registro** (§4) y **relajar/renombrar** las marcas
  duplicadas de los audits, que siguen siendo deuda medida.
- **Rotar** el token de Cloudflare si se considera expuesto. Retirarlo de las apps no
  lo invalida.
