<!-- CIERRE_CAMPANA_1_DECISION_CAMPANA_2_V1 -->
# Cierre de la Campaña 1 y decisión sobre la Campaña 2

**Fecha:** 2026-10-22
**Campaña 1:** Aislamiento multi-tenant — **CERRADA**
**Campaña 2:** SaaS compartido SOC 2 Type II — **NO ARRANCADA (decisión del humano)**

---

## 1. Estado final de la Campaña 1

8 fases ejecutadas. 36 marcas de aislamiento aplicadas. Todos los fixes en su estado final.

| Fase | Foco | Estado |
|---|---|---|
| 0 | Reconocimiento y verdad del repo | Cerrada |
| 1 | Documentación real (F01) | Cerrada |
| 2 | B2 aislamiento estricto (N01, N02, N04) | Cerrada |
| 3 | B3 rate limit + logContext | Cerrada |
| 4 | B4 RLS tx + body validate + cross audit + X-Tenant-Id | Cerrada |
| 5 | B5 computer tenant + F04.2/F04.3 verificados | Cerrada |
| 6 | B6+B7 cuotas + metrics + notificaciones + F02.9b | Cerrada |
| 7 | B8 switch-tenant + admin CRUD + migrate tx | Cerrada (recortada) |
| 8 | B9 CI + cierre documental | Cerrada |

Detalle de las 36 marcas en `ESTADO-REAL-MULTITENANT.md` (sección `ESTADO_REAL_FINAL_V1`).

---

## 2. Lo que se puede afirmar

- **36 marcas de aislamiento multi-tenant** aplicadas y verificadas en código.
- **27 fixes de código** cerrados en Fases 5–7.
- **5 fixes de CI y documentación** cerrados en Fase 8.
- **3 fixes verificados** sin cambio (F04.2 FP, F04.3 FP, F04.11b).
- **CI enforzado:** audits bloqueantes, typecheck server explícito, worker warn-only (Copilot lo repara en otra rama).
- **Aislamiento a nivel de código:** cada query pasa por `TenantScopedStore` con clave `tenantId:owner`.
- **Rate limiting por tenant** en chat, RAG, threads, browser y computer.
- **Métricas con label `tenant`** en HTTP, exportables con `?tenant=X`.
- **Notificaciones filtradas por tenant** en SSE y prefs.
- **`X-Tenant-Id`** en respuestas autenticadas.
- **RLS transaccional** (`withTenantRls`) lista para activarse con `MULTI_TENANT_SHARED=true` + Postgres.
- **Admin CRUD de tenants** (`DELETE`, `PATCH`) operativo.
- **Migración transaccional** de owners (`migrate-tenant-scope.ts`).

---

## 3. Lo que NO se puede afirmar

- **SaaS compartido listo.** Requiere las tablas SQL de la Campaña 2.
- **RLS protegiendo en producción.** Requiere Postgres real + `MULTI_TENANT_SHARED=true`.
- **Cuotas aplicadas a chat/RAG/files.** Requiere `tenant_quotas` (Campaña 2).
- **Tenant switcher funcional para múltiples tenants.** El `/switch-tenant` actual solo valida la membership única.
- **SOC 2 listo.** Requiere `tenant_audit_events` + controles documentados (Campaña 2).

---

## 4. Fixes pospuestos o bloqueados

| Fix | Motivo | Desbloquea con |
|---|---|---|
| F04.10b | Tablas SQL `tenant_members`/`tenant_configs` | Campaña 2 |
| F04.10c | `DatabaseTenantResolver` cableado | Campaña 2 |
| F04.10d | `DatabaseTenantConfigResolver` cableado | Campaña 2 |
| F04.10-wire | `bus` en `TenantService` | Campaña 2 |
| F04.14c-event | Evento `tenant.membership.changed` al bus | Campaña 2 |
| F04.27 | `runTenantBackup` | `backup-tenant.ts` verificado |
| F04.30 | Stripe Connect | Campaña 2 |
| F04.31 | Reconciliación de uso | Campaña 2 |
| F04.33 | Tenant switcher frontend | Campaña 2 |
| `delete-tenant-data.ts` | Script de borrado | Campaña 2 |
| F02.1–F02.4 | `worker.ts` | Copilot |
| F02.10 y tests | Congelados | Reactivar fase de tests |
| F05.4, F05.9 | `worker.ts` reparado | Copilot |

Detalle completo en `-pendientes.md` (sección `MULTITENANT_PENDIENTES_FINAL_V1`).

---

## 5. Deudas de calidad (no bloqueantes)

- **Mojibake en em-dashes** (`â€"` en vez de `—`) en `app.ts`, `computer-routes.ts`, `computer-tools.ts`, `rag-routes.ts`, `threads-routes.ts`, `engine/tenant.ts`. Fase de limpieza pendiente.
- **`rag-routes.ts` tiene `POST /reingest/:id` duplicado** (bug preexistente).
- **`app.ts` `FALLBACK_TENANT_V1` en `/api/files`** (hardcode de `"default"`).
- **`tenantLimiterShared` y `tenantLimiter`** son dos instancias paralelas en `app.ts`. Unificación opcional.
- **`worker.ts` roto** (Copilot lo repara en otra rama).

---

## 6. Decisión sobre la Campaña 2

**Campaña 2 — SaaS compartido SOC 2 Type II — NO ARRANCADA.**

Las 5 decisiones de arranque quedan pospuestas por decisión del humano:

1. ¿SaaS compartido o clone-por-cliente permanente? — **Pospuesta**
2. ¿Postgres gestionado o Supabase? — **Pospuesta**
3. ¿Stripe o facturación manual? — **Pospuesta**
4. ¿SOC 2 Type I (foto) o Type II (3 meses)? — **Pospuesta**
5. ¿Cliente piloto para migración? — **Pospuesta**

**Consecuencia:** el deployment se queda en **clone-por-cliente permanente**. Un tenant por cliente, un deployment por cliente. El código de aislamiento multi-tenant (36 marcas) queda operativo pero el modelo compartido no se activa.

**Si en el futuro se decide arrancar:** el plan completo está en `campaña1-fase9.md` (documento 10 del plan de 10 documentos). Contiene las 5 decisiones con contexto técnico, el mapa de 8 tablas SQL nuevas, el plan de adaptación de resolvers, el backlog T01–T50, los riesgos y las métricas de éxito.

---

## 7. Estado del repo al cierre

- **Rama:** `feat/multitenancy-campaign`. Lista para merge a `main` cuando el humano lo decida.
- **`worker.ts`:** roto. Copilot lo repara en otra rama. CI queda warn-only.
- **Tests de Campaña 1:** congelados. Reactivar en fase de tests.
- **CI:** audits bloqueantes, typecheck server explícito, worker warn-only.
- **Documentación:** `CIERRE-MVP.md`, `-pendientes.md`, `ID-MAP.md` y `ESTADO-REAL-MULTITENANT.md` actualizados con las secciones finales de Fase 8.

---

## 8. Siguiente paso (cuando el humano decida)

1. **Fase de tests:** reactivar F02.10, F02.7, F02.12, F03.31-test, F03.36-test, F04.20-test, F05.1, F05.4, F05.6, F05.7. Requiere `worker.ts` reparado para algunos.
2. **Fase de limpieza:** arreglar mojibake en em-dashes, unificar `POST /reingest/:id`, quitar `FALLBACK_TENANT_V1` de `/api/files`, unificar `tenantLimiterShared` y `tenantLimiter`.
3. **Fase de merge:** cuando `worker.ts` esté reparado y los tests verdes, merge `feat/multitenancy-campaign` a `main`.
4. **Campaña 2 (si se decide):** aplicar `campaña1-fase9.md` (documento 10) como arranque.

---

**La Campaña 1 queda formalmente cerrada. La Campaña 2 queda pospuesta.**