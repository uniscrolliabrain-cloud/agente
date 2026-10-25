# 03 — Supabase Auth + JWT con tenant_id

> Cómo entra el cliente con su Google, cómo Supabase emite el JWT, cómo el backend resuelve el tenant. Este documento es la base del multi-tenant real.

## Modelo

- **Owner**: tú. Un usuario en Supabase (`owner@tuagencia.com`).
- **Tenant**: cada cliente tuyo. Un `tenant_id` (string, ej. `cliente1`).
- **Usuario del cliente**: entra con su Google OAuth. Supabase le crea un `user_id` (`auth.users.id`).
- **Relación**: tabla `user_tenants` (`user_id`, `tenant_id`). Un usuario puede pertenecer a 1 tenant (o varios, si quieres).
- **JWT**: Supabase emite el JWT con `sub = user_id`. El Custom Access Token Hook añade `tenant_id` desde `user_tenants`.
- **Backend**: `verifyJwtMiddleware` valida el JWT. `ActorService.resolve` extrae `actorId` y `tenant_id`. `TenantService` resuelve el tenant. `TenantScopedStore` aísla.

## Paso 1 — Crear proyecto Supabase

1. Ir a https://supabase.com/dashboard
2. New project. Nombre: `agente`. Región: la más cercana. Plan: Free (500MB, 50K MAU).
3. Guardar: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`.
4. Guardar: `DATABASE_URL` (connection string de Postgres, en Settings → Database).

## Paso 2 — Configurar Google OAuth en Supabase

1. Google Cloud Console → APIs & Services → Credentials → Create OAuth Client ID → Web application.
2. Authorized redirect URIs: `https://<tu-proyecto>.supabase.co/auth/v1/callback`.
3. Guardar `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
4. Supabase Dashboard → Authentication → Providers → Google → Enable. Pegar Client ID y Secret.
5. Supabase Dashboard → Authentication → URL Configuration → Site URL: `https://tu-app.com`. Redirect URLs: `https://tu-app.com/auth/callback`.

## Paso 3 — Tabla `user_tenants`

```sql
-- supabase/migrations/001_user_tenants.sql
create table if not exists public.user_tenants (
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id text not null,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (user_id, tenant_id)
);

create index if not exists user_tenants_tenant_idx on public.user_tenants (tenant_id);

alter table public.user_tenants enable row level security;

-- Solo el service_role (backend) puede leer/escribir. El cliente no.
create policy "service_role_all" on public.user_tenants
  for all using (auth.role() = 'service_role');
```

## Paso 4 — Custom Access Token Hook

```sql
-- supabase/migrations/002_custom_access_token_hook.sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  tenant_id text;
begin
  claims := event->'claims';

  select ut.tenant_id into tenant_id
  from public.user_tenants ut
  where ut.user_id = (event->>'user_id')::uuid
  limit 1;

  if tenant_id is not null then
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(tenant_id));
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

grant select on public.user_tenants to supabase_auth_admin;
```

Activar en Supabase Dashboard → Authentication → Hooks → Custom Access Token → `public.custom_access_token_hook`.

## Paso 5 — Backend: `verifyJwtMiddleware` con `tenant_id`

`apps/server/src/engine/auth/jwt.ts` ya existe. Hay que:

1. Validar el JWT con `SUPABASE_JWT_SECRET` (HS256) o JWKS (RS256).
2. Extraer `sub` (actorId), `email`, `tenant_id` (del claim que añade el hook).
3. Pasar `{ actorId, tenantId, email }` al `ActorService.resolve`.
4. `c.set("actor", { id: actorId, tenantId, email })`.
5. El middleware de `ctx` en `app.ts` ya usa `c.get("actor")?.id ?? owner` para `actorId`. **Cambiar para usar `c.get("actor")?.tenantId` como `tenantId`**.

## Paso 6 — Backend: `ActorService.resolve` con `tenant_id`

`apps/server/src/engine/actors/service.ts` ya existe. Hay que:

1. `resolve(jwtPayload)`: extraer `sub` como `actorId`, `tenant_id` como `tenantId`.
2. Si no hay `tenant_id` en el JWT, fallar (deny-by-default). No caer a `owner`.
3. Devolver `{ id, tenantId, roles, email }`.

## Paso 7 — Test de integración

`tests/supabase-jwt.test.ts`:

- Genera un JWT firmado con `SUPABASE_JWT_SECRET` que incluya `sub`, `email`, `tenant_id`.
- Llama `verifyJwtMiddleware` con `Authorization: Bearer <jwt>`.
- Verifica que `c.get("actor").tenantId === "cliente1"`.
- Verifica que `tenantService.tenantIdFor(owner)` resuelve al tenant del JWT.
- Verifica que un JWT sin `tenant_id` es rechazado con 401.

## Variables de entorno

```
SUPABASE_URL=https://<proyecto>.supabase.co
SUPABASE_ANON_KEY=<anon>
SUPABASE_SERVICE_ROLE_KEY=<service>
SUPABASE_JWT_SECRET=<jwt-secret>
DATABASE_URL=postgres://postgres:<password>@db.<proyecto>.supabase.co:5432/postgres
AUTH_PROVIDER=supabase
```

## Coste

- Supabase Free: 500MB DB, 50K MAU, 1GB storage, 2GB bandwidth. **Suficiente para 2–3 clientes piloto.**
- Supabase Pro: $25/mes, 8GB DB, 100K MAU. **Cuando pases de 3 clientes.**
- Postgres directo (Supabase): incluido en el plan.

## Lo que NO se hace en este paso

- **RLS activo**. La capa de aplicación (`TenantScopedStore`) aísla. RLS para Fase B, cuando haya 3+ clientes.
- **Multi-tenant en el mismo usuario**. Cada usuario pertenece a 1 tenant. Si un usuario necesita 2 tenants, se añade después.
- **Custom claims más allá de `tenant_id`**. `role` ya está en `user_tenants`, se lee del backend.