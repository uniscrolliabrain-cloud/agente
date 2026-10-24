# 10 — Campaña 2 / Fase 0 — Arranque de la Campaña 2 (SaaS compartido SOC 2 Type II)

**Fecha:** 2026-10-21
**Campaña:** 2 — SaaS compartido (SOC 2 Type II enterprise prod)
**Fase:** 0 — Arranque, decisiones y plan (NO ejecuta código)
**Ejecutor:** IA implementadora + humano. Cline corre typecheck/test.
**Base de partida:** rama `feat/multitenancy-campaign`, Campaña 1 cerrada (documentos 01–09 aplicados). Repo en estado estable de clone-por-cliente con todas las marcas de aislamiento de las 8 fases. **Este documento NO escribe código de producto, NO crea tests, NO crea ficheros, NO commitea cambios al repo de código.** Es el documento de decisión que desbloquea la Campaña 2. Si el humano decide arrancar la Campaña 2, se convierte en el **documento 11** del plan y se ejecuta con la misma disciplina de patchsets que las fases de Campaña 1.

---

## 1. Qué fue la fase anterior

Fase 8 (documento 09): B9 CI + cierre documental de la Campaña 1. Se aplicaron F05.3 (`CI_AUDITS_ENFORCED_V1`), F05.5 (`CI_TYPECHECK_SERVER_V1`), F05.9 (`CI_WORKER_TYPECHECK_WARN_V1`), `CIERRE_MVP_CAMPAIGN1_FINAL_V1`, `MULTITENANT_PENDIENTES_FINAL_V1`, `ID_MAP_FINAL_V1`, `ESTADO_REAL_FINAL_V1`. Campaña 1 cerrada. `worker.ts` sigue roto (warn-only en CI). F02.10 congelado. F04.27 bloqueado. F04.10b/c/d, F04.10-wire, F04.14c-event pospuestos a Campaña 2. `delete-tenant-data.ts` pendiente. `apps/server/package.json` puede no existir.

---

## 2. Qué conseguimos con esta fase

**Nada en código.** Lo que conseguimos es **desbloquear la decisión de arrancar la Campaña 2** con:

- Las **5 decisiones obligatorias** identificadas y con contexto técnico para decidir.
- El **mapa completo de tablas SQL nuevas** (`tenants`, `tenant_members`, `tenant_configs`, `tenant_invites`, `tenant_audit_events`, `usage_events`, `tenant_quotas`, `quota_consumption`), con esquema, índices, RLS y migración.
- El **plan de adaptación de `DatabaseTenantResolver` y `DatabaseTenantConfigResolver`** a la realidad del repo (tablas SQL nuevas, no `records`), con dos alternativas: (a) crear las tablas, (b) adaptar los resolvers a leer de `records`.
- El **checklist de RLS `FORCE`** para que en shared no haya duda de que RLS está activa.
- El **plan de `/api/auth/switch-tenant` multi-membership real** (el actual solo funciona con una membership).
- El **plan de Stripe Connect** con webhooks idempotentes y reconciliación de uso.
- El **plan de `delete-tenant-data.ts`** para que `DELETE /api/admin/tenants/:tenantId` no deje huérfanos.
- El **plan de SOC 2 Type II**: 10 controles documentados, dashboard de compliance, evidencia de 3 meses.
- El **plan de migración clone→shared** con rollback probado.
- El **plan de tests** que desbloquea F02.10, F05.1, F05.4, F05.6, F05.7.
- El **plan de reparación de `worker.ts`** por Copilot y cómo encaja en CI.
- El **backlog completo priorizado** con impacto × esfuerzo × riesgo y **criterios de aceptación** por fix.
- Los **riesgos y bloqueantes** de la propia Campaña 2.
- Las **métricas de éxito** medibles.
- La **lista de lo que NO es Campaña 2** (CRDTs, Kafka, Redis, SAML, WebAuthn, Pgvector dedicado, federación identidades) con disparador para cada uno.

**No escribimos código porque las 5 decisiones no están tomadas.** Si el humano las toma ahora, este documento se convierte en el documento 11 ejecutable y las fases 1–N de Campaña 2 se escriben con la misma disciplina que las 8 de Campaña 1.

---

## 3. Qué será la siguiente fase

Depende de las 5 decisiones. Los tres escenarios posibles:

- **Escenario A — todo sí** (SaaS compartido, Postgres gestionado, Stripe, SOC 2 Type II, cliente piloto): la Campaña 2 arranca con las 12 fases del §10. Documento 11 = Fase 1 (crear tablas SQL + `DatabaseTenantResolver` cableado). Documento 12 = Fase 2 (`DatabaseTenantConfigResolver` + `tenant_configs`). Documento 13 = Fase 3 (multi-membership real + `/switch-tenant`). Documento 14 = Fase 4 (`tenant_invites` + onboarding). Documento 15 = Fase 5 (Stripe Connect + `usage_events`). Documento 16 = Fase 6 (`tenant_quotas` + `quota_consumption`). Documento 17 = Fase 7 (`tenant_audit_events` + RLS FORCE + SOC 2 controles 1–5). Documento 18 = Fase 8 (SOC 2 controles 6–10 + dashboard compliance). Documento 19 = Fase 9 (migración clone→shared con cliente piloto + rollback). Documento 20 = Fase 10 (tests desbloqueados: F02.10, F05.1, F05.4, F05.6, F05.7). Documento 21 = Fase 11 (`delete-tenant-data.ts` + `worker.ts` reparado por Copilot + cierre). **11 documentos más, 22 en total.**
- **Escenario B — solo tablas y resolvers** (SaaS compartido sin Stripe ni SOC 2 todavía): 5 fases. Documentos 11–15. **15 documentos en total.**
- **Escenario C — no arrancar** (mantener clone-por-cliente): la Campaña 2 queda aparcada. **Este documento es el último.** Los 10 documentos del plan quedan cerrados. Se actualiza `-pendientes.md` con "Campaña 2 no arrancada por decisión del humano" y se cierra la campaña.

---

## 4. Número de fases de esta sección

**0 fases de ejecución.** Este documento es solo de decisión. Si el humano decide arrancar, se convierte en 11 fases más (Escenario A) o 5 fases más (Escenario B).

---

## 5. Archivos a leer (obligatorio antes de decidir)

**Todos los documentos y código de la Campaña 1 ya están en el contexto** (Repomix original + holístico + ficheros pasados + documentos 01–09). En esta fase no se lee nada nuevo del repo. Lo que sí hay que revisar **mentalmente** (no con `Get-Content`, solo con la memoria del contexto) son:

- `-pendientes.md` final (post-Fase 8): los 26 bloqueados + 8 deudas.
- `CIERRE-MVP.md` final: el traspaso a Campaña 2.
- `ID-MAP.md` final: el estado de cada ID.
- `ESTADO-REAL-MULTITENANT.md` final: las 36 marcas aplicadas.

**Si el humano quiere verificar algo antes de decidir**, estos comandos sirven:
```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
$repoRoot = (Resolve-Path ".").Path
Write-Host "=== -pendientes.md ===" -ForegroundColor Cyan
Get-Content (Join-Path $repoRoot "docs/miniaudits/07-aislamiento-multi-tenant/-pendientes.md") -Raw | Select-Object -First 1
Write-Host "=== CIERRE-MVP.md sección traspaso ===" -ForegroundColor Cyan
Select-String -Path (Join-Path $repoRoot "docs/miniaudits/07-aislamiento-multi-tenant/CIERRE-MVP.md") -Pattern "Traspaso a la Campaña 2" -Context 0,20
Write-Host "=== ID-MAP.md final ===" -ForegroundColor Cyan
Select-String -Path (Join-Path $repoRoot "docs/miniaudits/07-aislamiento-multi-tenant/ID-MAP.md") -Pattern "ID_MAP_FINAL_V1" -Context 0,30
```
Pero **este documento no depende de esa lectura**; está construido con la información de los documentos 01–09 que ya están en el contexto.

---

## 6. Archivos a crear / modificar en esta fase

**Nada.** En esta fase no se toca el repo. **Ni siquiera `-pendientes.md`**. La decisión de arrancar (o no) la Campaña 2 es del humano y no se documenta en el repo hasta que se tome. **Si el humano decide "no arrancar" (Escenario C)**, en ese momento se añade una línea en `-pendientes.md` con `CAMPAIGN2_NOT_STARTED_V1` y se cierra la campaña. **Si decide arrancar**, se aplica el documento 11 (Fase 1 de Campaña 2) y la Campaña 2 empieza con la misma disciplina.

---

## 7. Las 5 decisiones obligatorias

**Sin estas 5 decisiones, la Campaña 2 no arranca.** Este documento las presenta con contexto técnico para que el humano decida.

### Decisión 1 — ¿SaaS compartido o clone-por-cliente permanente?

**Contexto:** el repo actual está en modelo clone-por-cliente (un deployment por empresa). El modelo SaaS compartido es donde varios tenants comparten DB. La diferencia técnica:

| Aspecto | Clone-por-cliente | SaaS compartido |
|---|---|---|
| Aislamiento | Deployment separado por cliente | RLS + `tenantId:owner` en cada query |
| Coste operativo | 1 deployment por cliente | 1 deployment para todos |
| Complejidad código | Baja | Media (RLS, multi-membership) |
| Complejidad operativa | Alta (N deployments) | Media (1 deployment) |
| Complejidad SOC 2 | Baja (1 cliente = 1 isolation) | Alta (evidencia por tenant) |
| Coste por cliente | Alto | Bajo |

**Recomendación técnica:** el código actual está **suficientemente preparado** para SaaS compartido (todas las marcas de Campaña 1 lo confirman). Lo único que falta es crear las tablas SQL y cablear los resolvers. **Recomiendo SaaS compartido.** Pero es decisión del humano.

**Si es "SaaS compartido":** arranca Campaña 2 completa.
**Si es "clone-por-cliente permanente":** no arranca Campaña 2. Documento 10 es el último. `-pendientes.md` se actualiza con `CAMPAIGN2_NOT_STARTED_V1` y se cierra.

### Decisión 2 — ¿Postgres gestionado o Supabase?

**Contexto:** el repo tiene dos backends: `pglite` (embebido) y `postgres` (pg.Pool). `db.ts` detecta `pgvector` en `postgres`. `db-rls.ts` solo funciona en `postgres`. `DatabaseTenantResolver` y `DatabaseTenantConfigResolver` esperan `query(sql, params)` que devuelve `{ rows }`.

| Aspecto | Postgres gestionado | Supabase |
|---|---|---|
| Complejidad setup | Alta | Baja (ya gestionado) |
| Coste | Medio | Alto si crece |
| RLS nativo | Sí | Sí (Postgres) |
| `pgvector` | Sí (extensión) | Sí (extensión) |
| Auth propio | Hay que construir | Supabase Auth incluido |
| Vendor lock-in | Bajo | Alto |
| Migración | Manual | Supabase CLI |
| Coste SOC 2 | Medio | Alto (auditorías Supabase) |

**Recomendación técnica:** si el humano quiere **SaaS compartido + SOC 2 Type II + equipo pequeño**, **Supabase**. Si el equipo es grande y quiere control total, **Postgres gestionado (Neon, AWS RDS, Render)**. **Recomiendo Supabase** por el vendor del `DatabaseTenantResolver` (el Repomix lo documenta como "Supabase" en los comentarios). Pero es decisión del humano.

**Si es "Supabase":** el repo ya tiene código preparado para Supabase (comentarios, `SupabasePort`).
**Si es "Postgres gestionado":** el repo ya tiene `pg.Pool` + `db.select`. Cero cambios en `db.ts`.

### Decisión 3 — ¿Stripe o facturación manual?

**Contexto:** el repo tiene `packages/integrations/src/stubs/stripe.ts` con `StripeClient` (stub). `billing-routes.ts` tiene webhook HMAC. `admin-tenants.ts` puede leer `tenant-state` pero no hay `usage_events` ni `tenant_quotas`.

| Aspecto | Stripe | Facturación manual |
|---|---|---|
| Setup | Medio | Bajo |
| Coste operativo | Bajo | Alto (facturas manuales) |
| Idempotencia | Nativa | Hay que construir |
| Webhooks | Nativo | Hay que construir |
| Conciliación | Nativa | Hay que construir |
| SOC 2 | Stripe está certificado | Manual |

**Recomendación técnica:** si el humano quiere **facturar por uso o por plan**, **Stripe Connect**. Si no hay billing en el día 1, **facturación manual** (F04.30 se pospone a Campaña 3). **Recomiendo Stripe Connect** si el humano quiere Campaña 2 completa. **Recomiendo facturación manual** si el humano quiere Campaña 2 sin billing todavía (Escenario B).

**Si es "Stripe":** F04.30 y F04.31 se aplican en Campaña 2 (Fases 5–6).
**Si es "manual":** F04.30 y F04.31 se posponen a Campaña 3.

### Decisión 4 — ¿SOC 2 Type I (foto) o Type II (3 meses)?

**Contexto:** SOC 2 Type I certifica que los controles existen en un momento (foto). Type II certifica que los controles han funcionado durante 3 meses (evidencia continua). El repo tiene `kernel/audit/store-store.ts` con hash chain y `StoreAuditStore` (base para SOC 2). Pero no hay dashboard de compliance.

| Aspecto | Type I | Type II |
|---|---|---|
| Tiempo | 1 mes | 3 meses + 1 mes de auditoría |
| Coste | Medio | Alto |
| Evidencia | Configuración | 3 meses de logs |
| Requisito enterprise | A veces | Siempre |
| Bloquea venta | Depende del cliente | Sí |

**Recomendación técnica:** si el humano tiene un **cliente enterprise esperando**, **Type II**. Si no, **Type I** y Type II en 6 meses. **Recomiendo Type II** si el humano ya tiene un cliente piloto (Decisión 5 = sí). **Recomiendo Type I** si no hay cliente piloto todavía.

**Si es "Type II":** la Campaña 2 dura 4+ meses (3 meses de evidencia + auditoría).
**Si es "Type I":** la Campaña 2 dura 1-2 meses.

### Decisión 5 — ¿Cliente piloto para migración?

**Contexto:** la migración clone→shared necesita un cliente piloto para validar el proceso. Sin cliente, la migración es teórica. Con cliente, la migración es real y bloquea la Campaña 2 hasta que el cliente esté listo.

| Aspecto | Con cliente | Sin cliente |
|---|---|---|
| Migración | Real | Teórica (documentada) |
| Riesgo | Controlado | Sin validar |
| Bloquea | Sí | No |
| Duración | 2-3 semanas de migración | 1 semana de documentación |

**Recomendación técnica:** si hay un **cliente pequeño dispuesto a ser piloto**, **sí**. Si no, **no** y la migración se pospone a Campaña 3. **Recomiendo sí** si el humano tiene un cliente que ya usa el producto y quiere probar SaaS. **Recomiendo no** si no hay cliente disponible.

**Si es "con cliente":** Fase 9 (migración clone→shared) es obligatoria en Campaña 2.
**Si es "sin cliente":** Fase 9 se documenta pero no se ejecuta.

### Resumen de las 5 decisiones

| # | Decisión | Opciones | Recomendación |
|---|---|---|---|
| 1 | Modelo | SaaS compartido / clone-permanente | SaaS compartido |
| 2 | Backend | Postgres gestionado / Supabase | Supabase |
| 3 | Billing | Stripe / manual | Stripe |
| 4 | SOC 2 | Type I / Type II | Type II (si hay cliente) |
| 5 | Migración | Con cliente / sin cliente | Con cliente (si hay) |

**Escenarios resultantes:**

- **Escenario A (todo sí):** las 5 recomendaciones se aceptan. 11 fases más, 21 documentos en total.
- **Escenario B (SaaS compartido + Postgres gestionado + manual + Type I + sin cliente):** 5 fases más, 15 documentos en total.
- **Escenario C (no arrancar):** 10 documentos en total. Campaña 2 aparcada.

---

## 8. Mapa de tablas SQL nuevas (si se arranca)

Solo se crean si Decisión 1 = SaaS compartido. Todas las tablas son **SQL**, no kinds de `records`. Los resolvers las leen. Los `usage_events` se escriben desde `request-logger.ts` y `conversation.ts`.

### 8.1. `tenants`

```sql
CREATE TABLE tenants (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tenants_status_idx ON tenants(status);
```

**Propósito:** metadatos del tenant (display name, plan, status). `id` es el `tenantId` que ya circula por todo el código.

### 8.2. `tenant_members`

```sql
CREATE TABLE tenant_members (
  user_id text NOT NULL,
  tenant_id text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tenant_id)
);
CREATE INDEX tenant_members_user_idx ON tenant_members(user_id);
CREATE INDEX tenant_members_tenant_idx ON tenant_members(tenant_id);
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_members_self ON tenant_members FOR SELECT USING (user_id = current_setting('app.user_id', true));
CREATE POLICY tenant_members_self_write ON tenant_members FOR ALL USING (user_id = current_setting('app.user_id', true));
```

**Propósito:** miembros de cada tenant con su rol. `DatabaseTenantResolver` la lee para resolver el tenant de un owner.

### 8.3. `tenant_configs`

```sql
CREATE TABLE tenant_configs (
  tenant_id text PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  fast_provider text NOT NULL,
  fast_model text NOT NULL,
  fast_api_key text NOT NULL,
  slow_provider text NOT NULL,
  slow_model text NOT NULL,
  slow_api_key text NOT NULL,
  embeddings_provider text,
  embeddings_model text,
  embeddings_api_key text,
  capabilities jsonb NOT NULL DEFAULT '{}'::jsonb,
  quiescence_ms int NOT NULL DEFAULT 10000,
  fast_idle_ms int NOT NULL DEFAULT 1000,
  slow_long_ms int NOT NULL DEFAULT 30000,
  max_thoughts_per_turn int NOT NULL DEFAULT 500,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE tenant_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_configs_tenant ON tenant_configs USING (tenant_id = current_setting('app.tenant_id', true));
```

**Propósito:** config por tenant (LLM keys, capabilities, timeouts). `DatabaseTenantConfigResolver` la lee.

### 8.4. `tenant_invites`

```sql
CREATE TABLE tenant_invites (
  id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tenant_invites_email_idx ON tenant_invites(email);
CREATE INDEX tenant_invites_tenant_idx ON tenant_invites(tenant_id);
```

**Propósito:** invitaciones a un tenant. `/api/auth/invite/accept` consume la invitación y crea `tenant_members`.

### 8.5. `tenant_audit_events`

```sql
CREATE TABLE tenant_audit_events (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  actor_id text NOT NULL,
  action text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  hash text NOT NULL,
  previous_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tenant_audit_events_tenant_idx ON tenant_audit_events(tenant_id, created_at DESC);
CREATE INDEX tenant_audit_events_actor_idx ON tenant_audit_events(actor_id);
```

**Propósito:** auditoría cross-tenant (F03.31 escalada). Distinta de `records kind="audit-entries"` (que sigue siendo la auditoría por tenant). Esta tabla es la auditoría **entre** tenants para SOC 2.

### 8.6. `usage_events`

```sql
CREATE TABLE usage_events (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  user_id text NOT NULL,
  kind text NOT NULL,
  amount numeric NOT NULL,
  unit text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX usage_events_tenant_idx ON usage_events(tenant_id, created_at DESC);
CREATE INDEX usage_events_kind_idx ON usage_events(tenant_id, kind, created_at DESC);
```

**Propósito:** cada vez que un tenant consume algo (LLM tokens, tareas, RAG búsquedas), se escribe una fila. Reconciliación y facturación leen de aquí.

### 8.7. `tenant_quotas`

```sql
CREATE TABLE tenant_quotas (
  tenant_id text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  kind text NOT NULL,
  limit_per_period numeric NOT NULL,
  period text NOT NULL DEFAULT 'month',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, kind)
);
```

**Propósito:** cuotas por tenant y por tipo de consumo. `takeForTenant` en `rate-limit.ts` las consulta (o las cachea).

### 8.8. `quota_consumption`

```sql
CREATE TABLE quota_consumption (
  tenant_id text NOT NULL,
  kind text NOT NULL,
  period_start timestamptz NOT NULL,
  consumed numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, kind, period_start)
);
```

**Propósito:** consumo acumulado por tenant, tipo y periodo. Se actualiza con `usage_events`.

---

## 9. Plan de adaptación de resolvers

### 9.1. `DatabaseTenantResolver` (F04.10c)

**Estado actual:** existe en `apps/server/src/kernel/tenancy/database-resolver.ts`, lee `tenant_members`, no está cableado en `app.ts`.

**Plan (Escenario A, decisión 2 = Supabase):**
1. La tabla `tenant_members` la crea la migración (Fase 1 de Campaña 2).
2. `app.ts` cablea `new DatabaseTenantResolver(supabasePort, new ServiceTenantResolver(tenantService))` si `MULTI_TENANT_SHARED=true`.
3. `supabasePort` es `{ query: async (sql, params) => ({ rows: await db.select(sql, params) }) }`. `db.select` ejecuta SQL arbitrario contra el backend. En `postgres` con `pg.Pool`, funciona. En `pglite`, la tabla no existe y falla → cae al fallback.
4. Marca `DB_TENANT_RESOLVER_WIRED_V1`.

**Plan (Escenario B, decisión 2 = Postgres gestionado):** idéntico, `db.select` funciona igual.

**Alternativa (sin tocar `app.ts`):** adaptar `DatabaseTenantResolver` a leer de `records` con `kind="tenant-members"`. **Descartado** porque `DatabaseTenantResolver` está documentado para `tenant_members` SQL y cambiar el contrato rompe el kernel. **Mejor crear la tabla.**

### 9.2. `DatabaseTenantConfigResolver` (F04.10d)

**Estado actual:** existe, lee `tenant_configs`, no está cableado.

**Plan:** igual que 9.1, con `tenant_configs`. Marca `DB_TENANT_CONFIG_RESOLVER_WIRED_V1`.

---

## 10. Plan de `/api/auth/switch-tenant` multi-membership (F04.14b extendido)

**Estado actual:** el endpoint existe (Fase 7), pero solo funciona si el usuario tiene una membership (id="default", tenantId real). El JWT no lleva `tenantId` en el payload, solo en `sessions`.

**Plan:**
1. La tabla `tenant_members` permite N memberships por usuario.
2. `/switch-tenant` valida contra `tenant_members` (no contra `tenant-membership` kind).
3. El JWT nuevo lleva `{ userId, tenantId, role }` en el payload.
4. `/api/auth/me` lee el `tenantId` del JWT.
5. `TenantService.tenantIdFor(owner)` lee el `tenantId` de la sesión (no de la DB) si está presente.
6. Marca `SWITCH_TENANT_ENDPOINT_MULTI_V1`.

**Riesgo:** cambiar el JWT puede romper clientes existentes. **Mitigación:** el JWT actual sigue funcionando si no lleva `tenantId` (fallback a `tenant_members`).

---

## 11. Plan de Stripe Connect (F04.30)

Si decisión 3 = Stripe:

1. Implementar `packages/integrations/src/stripe.ts` (real, no stub) con `StripeClient`.
2. `billing-routes.ts` ya tiene webhook HMAC. Idempotencia: `db.put("system", "stripe-events", ...)` ya dedupe por `event.id`.
3. Añadir endpoint `/api/billing/checkout` que crea `CheckoutSession`.
4. Añadir endpoint `/api/billing/portal` que crea `BillingPortalSession`.
5. `usage_events` se escriben desde `conversation.ts` (chat) y `worker.ts` (tareas).
6. Reconciliación: `usage_events` agregados vs `invoices` de Stripe.
7. Marca `STRIPE_CONNECT_V1`, `STRIPE_CHECKOUT_V1`, `STRIPE_PORTAL_V1`, `STRIPE_RECON_V1`.

**Si decisión 3 = manual:** F04.30 y F04.31 se posponen a Campaña 3. `usage_events` se escriben igual (para billing futuro) pero no se concilian.

---

## 12. Plan de `delete-tenant-data.ts`

**Estado actual:** `DELETE /api/admin/tenants/:tenantId` borra `tenant-membership` y `tenant-state`, pero **no** los records del tenant (tasks, files, etc.). Quedan huérfanos.

**Plan:**
1. Script `scripts/delete-tenant-data.ts` que recibe `tenantId` y `--confirm`.
2. Borra en orden: `quota_consumption`, `usage_events`, `tenant_audit_events`, `tenant_invites`, `tenant_members`, `tenant_configs`, `tenants`.
3. Borra records con `owner LIKE '<tenantId>:%'` (todos los kinds del tenant): tasks, files, memories, agent-roles, sops, etc.
4. Borra ficheros físicos en `dataDir/tenants/<tenantId>/files/`.
5. Dry-run por defecto. `--confirm` para ejecutar.
6. Log de todo lo borrado en `records kind="deletion-audit"` (nunca se borra).
7. Marca `DELETE_TENANT_DATA_V1`.

**Riesgo:** borrar `records` con `LIKE '<tenantId>:%'` es **irreversible**. Mitigación: dry-run obligatorio + confirmación explícita + log de auditoría + backup previo.

---

## 13. Plan de SOC 2 Type II

Si decisión 4 = Type II:

### 10 controles documentados

1. **CC6.1 — Control de acceso lógico:** `tenant_members` con roles, `switch-tenant`, `JWT` con `tenantId`.
2. **CC6.2 — Registro de accesos:** `tenant_audit_events`, `audit-entries`, hash chain.
3. **CC6.3 — Restricción de accesos:** RLS FORCE, `assertNotHardcodedTenantId`.
4. **CC6.6 — Autorización:** `PolicyEngine`, `AgentGovernance`.
5. **CC7.1 — Detección:** `metrics/registry`, `openmuse_cross_tenant_attempts_total`, `http_errors_by_route_total`.
6. **CC7.2 — Monitorización:** dashboard compliance, alertas.
7. **CC7.3 — Respuesta a incidentes:** runbook (documento 14 de Campaña 2 si se arranca).
8. **A1.2 — Disponibilidad:** backups por tenant, `runTenantBackup` (F04.27 desbloqueado).
9. **A1.3 — Recuperación:** restore por tenant, rollback probado.
10. **PI1.1 — Integridad de procesamiento:** hash chain de audit, tests E2E.

### Dashboard de compliance

- Panel admin en `apps/web/src/views/ComplianceView.tsx` (Campaña 2, Fase 8).
- Muestra: cobertura RLS, tenants activos, audit events últimos 30 días, cross-tenant attempts, uptime.
- Exportable a PDF para el auditor.

### Evidencia de 3 meses

- Logs de `tenant_audit_events` de 90 días (retención mínima).
- Métricas Prometheus de 90 días (retención en Prometheus o similar).
- Backups de 90 días (retención configurable).
- Tests E2E en CI verdes durante 90 días (F05.4).

**Si decisión 4 = Type I:** solo se documentan los 10 controles. No se espera 3 meses. Campaña 2 dura 1-2 meses.

---

## 14. Plan de migración clone→shared con rollback probado

Si decisión 5 = con cliente:

### Fase 9 de Campaña 2 (migración)

1. **Pre-migración:** snapshot completo del cliente (`pg_dump` + backup de `dataDir`).
2. **Schema:** crear `tenants`, `tenant_members`, `tenant_configs` en el shared.
3. **Backfill:** por cada cliente existente, crear fila en `tenants`, `tenant_members` (con el owner como admin), `tenant_configs` (copiando de `.env`).
4. **Datos:** migrar records del cliente a shared con `owner = '<tenantId>:<ownerOriginal>'` (ya está el prefijo por la migración de Fase 7 `migrate-tenant-scope.ts`).
5. **Ficheros:** mover `dataDir/tenants/<cliente>/files/*` a `dataDir/tenants/<tenantId>/files/*`.
6. **Cutover:** DNS del cliente apunta al shared. Rollback = DNS al deployment original.
7. **Validación:** el cliente usa el producto durante 1 semana. Si algo falla, rollback.
8. **Cleanup:** tras 1 mes estable, se borra el deployment original del cliente.

### Rollback probado

- **Rollback DNS:** 1 comando (`fly dns set` o similar).
- **Rollback datos:** `pg_restore` del snapshot.
- **Rollback ficheros:** `rsync` del backup.
- **Tiempo objetivo:** < 1h para rollback completo.
- **Test de rollback:** obligatorio antes del cutover real. Se hace con un tenant de prueba.

---

## 15. Plan de tests desbloqueados

Los tests congelados en Campaña 1 se desbloquean aquí:

- **F02.10** (`tenant-strict.test.ts`): 5 tests, ya definidos en el documento 02. Se aplica en Fase 10.
- **F02.7** (`worker-tenant-isolation.test.ts`): requiere `worker.ts` reparado. Fase 10.
- **F02.12** (`worker-entry-isolation.test.ts`): idem.
- **F03.31-test** (`rls-integration.test.ts`): requiere Postgres real + tabla `tenant_members` + `enableRls` funcional. Fase 10.
- **F03.36-test** (`tenant-request.test.ts`): puede correr sin shared, solo con `app.ts` + middleware de body. Fase 10.
- **F04.20-test** (`quota-tenant.test.ts`): requiere `tenant_quotas` + `quota_consumption`. Fase 10.
- **F05.1** (`five-hundred-tenants.test.ts`): requiere `tenant_members` para crear 500 tenants. Fase 10.
- **F05.4** (`tenant-http-e2e.test.ts` a verde): requiere `worker.ts` reparado + `switch-tenant`. Fase 10.
- **F05.6** (audits en CI): ya enforzado (Fase 8). Aquí solo se añade E2E al CI.
- **F05.7** (E2E en CI): Fase 10.

---

## 16. Plan de reparación de `worker.ts` por Copilot

**Estado actual:** `apps/server/src/engine/worker.ts` está roto (comentarios `/** ...` sin cerrar, líneas truncadas). CI está en warn-only (Fase 8). Copilot trabaja en `main` para arreglarlo.

**Plan:**
1. Copilot commitea el fix en `main` (o en su rama).
2. Se rebasa `feat/multitenancy-campaign` sobre `main`.
3. Se verifica `worker.ts` arreglado: `pnpm --filter @openmuse/server exec tsc --noEmit` verde.
4. Se quita `continue-on-error: true` del job `worker` en CI (marca `CI_WORKER_TYPECHECK_WARN_V1` → `CI_WORKER_TYPECHECK_ENFORCED_V1`).
5. Se desbloquean F02.7, F02.12, F04.8, F04.9, F05.4, F05.9.

**Si Copilot no commitea en X tiempo:** la Campaña 2 puede empezar con `worker.ts` roto (no es dependencia de las tablas SQL). Los tests E2E y F02.7/F02.12 se posponen hasta que Copilot commitee.

---

## 17. Backlog completo de la Campaña 2, priorizado

### Bloqueantes previos (Fase 0 de Campaña 2, este documento)

- **D1–D5:** las 5 decisiones. Sin ellas, no arranca.

### Fase 1 — Tablas SQL + `DatabaseTenantResolver` cableado

- **T01** `CREATE TABLE tenants`.
- **T02** `CREATE TABLE tenant_members` + RLS.
- **T03** `CREATE TABLE tenant_configs` + RLS.
- **T04** Migración inicial: por cada `tenant-membership` en `records`, crear `tenants` + `tenant_members`. Script `scripts/migrate-records-to-sql.ts`.
- **T05** Cablear `DatabaseTenantResolver` en `app.ts`.
- **T06** Cablear `DatabaseTenantConfigResolver` en `app.ts`.
- **Criterio de aceptación:** `MULTI_TENANT_SHARED=true` arranca con DB shared. `tenantIdFor(owner)` lee de `tenant_members`. `config(tenantId)` lee de `tenant_configs`. Test E2E de Fase 10 valida.
- **Marca:** `TENANT_SQL_SCHEMA_V1`, `DB_TENANT_RESOLVER_WIRED_V1`, `DB_TENANT_CONFIG_RESOLVER_WIRED_V1`.

### Fase 2 — `tenant_invites` + onboarding

- **T07** `CREATE TABLE tenant_invites`.
- **T08** Endpoint `POST /api/admin/tenants/:tenantId/invites`.
- **T09** Endpoint público `POST /api/auth/invite/accept`.
- **T10** Onboarding: al aceptar, se crea `tenant_members` y se emite JWT.
- **Criterio de aceptación:** invitar a un email → aceptar → usuario con membership. Test E2E.
- **Marca:** `TENANT_INVITES_V1`, `TENANT_INVITE_ACCEPT_V1`.

### Fase 3 — Multi-membership `/switch-tenant`

- **T11** `/switch-tenant` valida contra `tenant_members` (no contra kind).
- **T12** JWT con `{ userId, tenantId, role }`.
- **T13** `TenantService.tenantIdFor(owner)` lee `tenantId` del JWT si está.
- **T14** `/api/auth/me` devuelve `tenantId`.
- **T15** Frontend `TenantSwitcher.tsx` (F04.33).
- **Criterio de aceptación:** usuario con 2 memberships cambia entre tenants. Frontend refleja el cambio. Test E2E.
- **Marca:** `SWITCH_TENANT_ENDPOINT_MULTI_V1`, `TENANT_SWITCHER_FE_V1`.

### Fase 4 — `usage_events` + `tenant_quotas` + `quota_consumption`

- **T16** `CREATE TABLE usage_events`.
- **T17** `CREATE TABLE tenant_quotas`.
- **T18** `CREATE TABLE quota_consumption`.
- **T19** Escribir `usage_events` desde `conversation.ts` (chat) y `worker.ts` (tareas).
- **T20** `takeForTenant` en `rate-limit.ts` consulta `tenant_quotas` (o caché).
- **Criterio de aceptación:** cada chat y cada tarea escribe `usage_events`. Cuota agotada → 429. Test E2E.
- **Marca:** `USAGE_EVENTS_V1`, `TENANT_QUOTAS_V1`, `QUOTA_CONSUMPTION_V1`.

### Fase 5 — Stripe Connect (si D3 = Stripe)

- **T21** `StripeClient` real (no stub).
- **T22** `POST /api/billing/checkout`.
- **T23** `POST /api/billing/portal`.
- **T24** `POST /api/billing/webhook` (ya existe HMAC, verificar).
- **T25** Reconciliación `usage_events` vs `invoices`.
- **Criterio de aceptación:** cliente paga plan → `invoice.paid` webhook → `tenant_configs.plan` actualizado. Test E2E con Stripe test mode.
- **Marca:** `STRIPE_CONNECT_V1`, `STRIPE_CHECKOUT_V1`, `STRIPE_PORTAL_V1`, `STRIPE_RECON_V1`.

### Fase 6 — `tenant_audit_events` + RLS FORCE + SOC 2 controles 1–5

- **T26** `CREATE TABLE tenant_audit_events`.
- **T27** `ALTER TABLE records FORCE ROW LEVEL SECURITY` (ya lo hace `enableRls`).
- **T28** `ALTER TABLE tenant_members FORCE ROW LEVEL SECURITY`.
- **T29** `ALTER TABLE tenant_configs FORCE ROW LEVEL SECURITY`.
- **T30** Controles CC6.1, CC6.2, CC6.3, CC6.6, CC7.1 documentados.
- **Criterio de aceptación:** RLS FORCE en todas las tablas tenant. `cross_tenant_attempts` registrados. Documento de controles firmado.
- **Marca:** `TENANT_AUDIT_EVENTS_V1`, `RLS_FORCE_ALL_V1`, `SOC2_CONTROLS_1_5_V1`.

### Fase 7 — SOC 2 controles 6–10 + dashboard compliance

- **T31** Controles CC7.2, CC7.3, A1.2, A1.3, PI1.1 documentados.
- **T32** `apps/web/src/views/ComplianceView.tsx`.
- **T33** Alertas en `metrics/registry.ts` para `cross_tenant_attempts > 0` y `rls_bypass_attempts > 0`.
- **Criterio de aceptación:** dashboard muestra cobertura RLS, tenants activos, audit events 30 días, uptime. Exportable a PDF.
- **Marca:** `SOC2_CONTROLS_6_10_V1`, `COMPLIANCE_DASHBOARD_V1`.

### Fase 8 — Migración clone→shared con cliente piloto (si D5 = con cliente)

- **T34** Script `scripts/migrate-clone-to-shared.ts`.
- **T35** Test de rollback con tenant de prueba.
- **T36** Cutover real del cliente piloto.
- **T37** Validación 1 semana.
- **Criterio de aceptación:** cliente piloto en shared. Rollback probado < 1h. Sin pérdida de datos.
- **Marca:** `CLONE_TO_SHARED_MIGRATION_V1`, `ROLLBACK_PROBADO_V1`.

### Fase 9 — Tests desbloqueados

- **T38** F02.10 (`tenant-strict.test.ts`).
- **T39** F02.7 (`worker-tenant-isolation.test.ts`) si `worker.ts` está reparado.
- **T40** F02.12 (`worker-entry-isolation.test.ts`) idem.
- **T41** F03.31-test (`rls-integration.test.ts`).
- **T42** F03.36-test (`tenant-request.test.ts`).
- **T43** F04.20-test (`quota-tenant.test.ts`).
- **T44** F05.1 (`five-hundred-tenants.test.ts`).
- **T45** F05.4 (`tenant-http-e2e.test.ts` a verde).
- **T46** F05.6, F05.7 (audits + E2E en CI).
- **Criterio de aceptación:** `pnpm test` verde. CI verde en todos los jobs.
- **Marca:** `TESTS_UNFROZEN_V1`, `CI_E2E_V1`.

### Fase 10 — `delete-tenant-data.ts` + cierre

- **T47** `scripts/delete-tenant-data.ts`.
- **T48** `DELETE /api/admin/tenants/:tenantId` invoca el script (dry-run + `--confirm`).
- **T49** Cierre documental de Campaña 2 (`CIERRE-CAMPAÑA-2.md`).
- **T50** Actualizar `ID-MAP.md` con los IDs de Campaña 2.
- **Criterio de aceptación:** borrar un tenant de prueba no deja huérfanos. Documentación cerrada.
- **Marca:** `DELETE_TENANT_DATA_V1`, `CIERRE_CAMPAIGN2_V1`.

### Bloqueantes de `worker.ts` (Copilot)

- **W1** Copilot commitea fix de `worker.ts`.
- **W2** Rebase de `feat/multitenancy-campaign` sobre `main`.
- **W3** Quitar `continue-on-error: true` del job `worker` en CI (`CI_WORKER_TYPECHECK_ENFORCED_V1`).
- **W4** Desbloquear F02.7, F02.12, F04.8, F04.9, F05.4, F05.9.

### Bloqueantes de `backup-tenant.ts` (F04.27)

- **B1** El humano pasa `backup-tenant.ts` (o el repo lo publica).
- **B2** Se cruza con `Files.import` que escribe en `dataDir/tenants/<tenantId>/files`.
- **B3** Se aplica F04.27 (`BACKUP_TENANT_PATH_V1`).

### Bloqueantes de `apps/server/package.json`

- **P1** El humano decide si crear `apps/server/package.json` o mantener `pnpm typecheck` raíz.

### Bloqueantes de `AUDIT_TENANT_DEFAULT.md`

- **A1** El humano pasa la lista real de las 16 prohibidas.
- **A2** Se aplica F01.5 (`MULTITENANT_FIXES_A5_V1`) y F04.1 (`CLASSIFY_16_DEFAULTS_V1`).

---

## 18. Riesgos y bloqueantes de la Campaña 2

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Las 5 decisiones no se toman | Campaña 2 no arranca | Este documento, §7 |
| `worker.ts` no se repara | F02.7, F02.12, F04.8, F04.9, F05.4, F05.9 bloqueados | Copilot, W1–W4 |
| `backup-tenant.ts` no llega | F04.27 bloqueado | B1–B3 |
| `apps/server/package.json` no existe | F05.5 puede no filtrar | P1 |
| `AUDIT_TENANT_DEFAULT.md` sin lista | F01.5 y F04.1 bloqueados | A1–A2 |
| Migración clone→shared pierde datos | Catastrófico | Fase 8, rollback probado |
| Stripe test mode ≠ producción | Facturación puede fallar en prod | Tests en test mode + validación manual |
| RLS FORCE rompe queries existentes | Producción caída | `enableRls` ya prueba en dev, tests RLS |
| SOC 2 Type II no se cierra en 3 meses | Bloquea venta enterprise | Type I como parada intermedia |
| `delete-tenant-data.ts` borra datos equivocados | Catastrófico | Dry-run obligatorio + confirmación + backup previo |
| Multi-membership rompe clientes con 1 membership | Regresión | Fallback a `tenant_members` con 1 fila |
| Cambio de JWT con `tenantId` | Rompe clientes existentes | Fallback a `tenant_members` si JWT no trae `tenantId` |

---

## 19. Métricas de éxito de la Campaña 2

- **Cobertura RLS:** 100% de las tablas tenant con RLS FORCE.
- **Cross-tenant attempts:** 0 por semana (o investigados si >0).
- **Tenants activos:** ≥ 1 cliente piloto en shared.
- **Rollback:** < 1h probado en Fase 8.
- **SOC 2 Type II:** 10 controles documentados + 90 días de evidencia + auditoría.
- **Cobertura tests:** `pnpm test` verde, E2E verde, CI verde.
- **Uptime:** ≥ 99.5% (objetivo SOC 2).
- **Latencia P99:** ≤ 500ms en endpoints críticos.
- **Stripe reconciliación:** 0 discrepancias entre `usage_events` e `invoices` (o justificadas).

---

## 20. Lista de lo que NO es Campaña 2

Estos se documentan en `docs/estado/FUTURE.md` con disparador para cada uno:

| ID | Aspecto | Disparador |
|---|---|---|
| FUT.01 | CRDTs para colaboración | 2+ usuarios editan mismo recurso simultáneamente |
| FUT.02 | Kafka / Redis | QPS > 10k o multi-región |
| FUT.03 | SAML / WebAuthn | Cliente enterprise lo pide |
| FUT.04 | Pgvector dedicado | RAG > 100k docs por tenant |
| FUT.05 | Federación de identidades | > 5 IdPs |
| FUT.06 | Tenant por subdominio | > 50 tenants |
| FUT.07 | Facturación multi-moneda | Cliente fuera de EUR/USD |
| FUT.08 | Puerto de cliente a cliente | Cliente pide export completo de datos |
| FUT.09 | Region routing | Multi-región con GDPR estricto |
| FUT.10 | Análisis de coste por tenant en tiempo real | > 100 tenants |

---

## 21. Escenario C — no arrancar

Si el humano decide **no arrancar la Campaña 2**:

1. **Este documento es el último.** Los 10 documentos quedan cerrados.
2. **Campaña 1 cerrada** con todas las marcas aplicadas.
3. **`-pendientes.md`** se actualiza con:
   ```
   <!-- CAMPAIGN2_NOT_STARTED_V1 -->
   ## Campaña 2 — no arrancada

   Decisión del humano: mantener clone-por-cliente.
   Los 26 fixes bloqueados + 8 deudas de Campaña 1 quedan documentados.
   Si en el futuro se decide arrancar, el plan está en el documento 10 del
   plan de 10 documentos (o donde se guarde).
   ```
4. **No se commitea nada en esta fase.** El humano escribe el cambio en `-pendientes.md` (es su decisión, no de la IA).
5. **El repo queda estable.** `feat/multitenancy-campaign` con todas las marcas. `worker.ts` sigue roto (Copilot lo repara en `main`).
6. **La Campaña 2 se puede arrancar en cualquier momento** aplicando el documento 10 → documento 11 (Fase 1 de Campaña 2).

---

## 22. Escenario B — arrancar solo tablas y resolvers

Si el humano decide arrancar con **SaaS compartido + Postgres gestionado + manual + Type I + sin cliente**:

- **Fases 1–4** del §17 se aplican (tablas + resolvers + invites + switch-tenant multi).
- **Fases 5–8** se posponen a Campaña 3 (Stripe, SOC 2 Type II, migración con cliente).
- **Fase 9** (tests) se aplica parcialmente: F02.10, F03.36-test, F04.20-test, F05.1. F02.7, F02.12, F03.31-test, F05.4 dependen de `worker.ts` (Copilot) o Postgres real (si Supabase, se puede).
- **Fase 10** (`delete-tenant-data.ts`) se aplica.
- **Total: 15 documentos** (10 de Campaña 1 + 5 de Campaña 2).

---

## 23. Escenario A — arrancar todo

Si el humano decide arrancar con las **5 recomendaciones aceptadas**:

- **Fases 1–10** del §17 se aplican.
- **Total: 21 documentos** (10 de Campaña 1 + 11 de Campaña 2).
- **Duración estimada:** 3-4 meses (Fases 1–8) + 3 meses de evidencia SOC 2 = 6-7 meses.

---

## 24. Qué NO se hace en esta fase

- **No se escriben documentos 11–21.** Se escriben si el humano decide arrancar.
- **No se modifica `-pendientes.md`.** La decisión de no arrancar la escribe el humano, no la IA.
- **No se ejecuta código.** No se crean tablas SQL. No se cablean resolvers. No se toca `worker.ts`.
- **No se commitea nada.** Este documento es de decisión, no de ejecución.

---

## 25. Firmas de decisiones

Si el humano decide arrancar, marca cada decisión y se convierte en la entrada de la Fase 0 de Campaña 2:

```
Decisión 1 (Modelo): [ ] SaaS compartido  [ ] clone-permanente
Decisión 2 (Backend): [ ] Postgres gestionado  [ ] Supabase
Decisión 3 (Billing): [ ] Stripe  [ ] manual
Decisión 4 (SOC 2): [ ] Type I  [ ] Type II
Decisión 5 (Migración): [ ] Con cliente  [ ] Sin cliente

Escenario resultante: [ ] A (todo sí)  [ ] B (tablas y resolvers)  [ ] C (no arrancar)
```

**Fecha de la decisión:** ____
**Decidido por:** ____
**Documento 11 (Fase 1 de Campaña 2) se escribe si:** escenario A o B.

---

## FIN DEL DOCUMENTO 10

**Documento de decisión de arranque de la Campaña 2 (SaaS compartido SOC 2 Type II). 5 decisiones obligatorias con contexto técnico. Mapa de 8 tablas SQL nuevas. Plan de adaptación de resolvers. Plan de `/switch-tenant` multi-membership. Plan de Stripe Connect. Plan de `delete-tenant-data.ts`. Plan de SOC 2 Type II con 10 controles y dashboard de compliance. Plan de migración clone→shared con rollback probado. Plan de tests desbloqueados. Plan de reparación de `worker.ts` por Copilot. Backlog priorizado con 50 tareas (T01–T50) + bloqueantes de `worker.ts` (W1–W4), `backup-tenant.ts` (B1–B3), `apps/server/package.json` (P1), `AUDIT_TENANT_DEFAULT.md` (A1–A2). Riesgos y bloqueantes. Métricas de éxito. Lista de lo que NO es Campaña 2 (FUT.01–FUT.10). 3 escenarios (A: 21 documentos, B: 15 documentos, C: 10 documentos). Firmas de decisión.**

**Este es el último documento de los 10. El plan maestro queda cerrado. La Campaña 1 está ejecutada. La Campaña 2 queda a la espera de las 5 decisiones del humano.**

**Si el humano decide arrancar la Campaña 2 (Escenario A o B), se escribe el documento 11 como Fase 1 de Campaña 2, con la misma disciplina de patchsets, verificación pre/post, backup, rollback, `git diff --check`, typecheck/test por Cline y misses en `_multitenant_pendientes.md`.**

**Si el humano decide no arrancar (Escenario C), el plan maestro queda cerrado en 10 documentos y la Campaña 1 es el único trabajo real entregado.**