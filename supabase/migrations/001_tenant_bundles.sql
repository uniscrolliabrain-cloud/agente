-- 001_tenant_bundles.sql
-- Tabla de bundles compilados + tabla de user_tenants para el hook de Supabase.

create table if not exists public.tenant_bundles (
  tenant_id text primary key,
  bundle jsonb not null,
  version int not null default 1,
  compiled_at timestamptz not null default now(),
  compiled_by text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'archived'))
);

create table if not exists public.user_tenants (
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id text not null,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (user_id, tenant_id)
);

create index if not exists user_tenants_tenant_idx on public.user_tenants (tenant_id);

alter table public.tenant_bundles enable row level security;
alter table public.user_tenants enable row level security;

create policy if not exists "service_role_all_tenant_bundles" on public.tenant_bundles
  for all using (auth.role() = 'service_role');

create policy if not exists "service_role_all_user_tenants" on public.user_tenants
  for all using (auth.role() = 'service_role');

-- Custom Access Token Hook: anade tenant_id al JWT.
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