<!-- CIERRE_MVP_07_V1 -->
# Cierre MVP — aislamiento multi-tenant (clone-por-cliente)

> v1 · 2026-10-17
> Campaña ejecutada: 4 bloques, 11 patchsets.
> Los documentos previos están archivados en `old/`.

## Condiciones del MVP y evidencia

| # | Condición | Evidencia | Estado |
|---|---|---|---|
| M1 | `files.import` no hardcodea `"default"` | Marca `APP_FILES_IMPORT_TENANT_V1` en `app.ts` | verified |
| M2 | `scan()` no filtra por un solo tenant | Marca `TENANT_SCAN_ALL_PREFIXES_V1` en `db-tenant.ts` | implemented |
| M3 | `tenantId` de request validado contra owner | Marca `APP_TENANT_REQUEST_VALIDATE_V1` en `app.ts` | verified |
| M4 | `/notifications` incluye `tenantId` | Marca `ROUTES_NOTIFICATIONS_TENANT_V1` en `routes.ts` | implemented |
| M5 | `withTenantRls` usa misma transacción | Marca `DB_RLS_TX_CONTEXT_V1` en `db-rls.ts` | implemented |
| M6 | Test E2E multi-tenant | `tests/tenant-http-e2e.test.ts` | esqueleto |

## Falsos positivos descartados

- D1: Files/Rag/Workspace ya reciben `tdb`.
- D8: índice `(owner, kind)` ya existe.
- D2: `setMembership` ya actualiza caché.

## Riesgos residuales

1. **RLS no está activa por defecto.** `db-rls.ts` solo actúa si `MULTI_TENANT_SHARED=true` y backend postgres. En clone-por-cliente no aplica.
2. **Test E2E es esqueleto.** Puede fallar en rutas no cableadas en modo sample. Ajustar antes de CI.
3. **21 aspectos fuera del MVP.** Ver `fuera-de-mvp.md`.
4. **`service.ts` no verificado.** No estaba en el Repomix. D4/D5/D21 quedan pendientes.

## Qué se puede afirmar con este cierre

- El deployment clone-por-cliente no escribe en `"default"` por accidente en `files.import`.
- Un request con `tenantId` que no coincide con el owner autenticado devuelve 403.
- `scan()` no asume un único tenant.
- `/notifications` expone `tenantId` explícito.
- `withTenantRls` garantiza misma conexión para RLS (cuando se active).

## Qué NO se puede afirmar

- Que el sistema esté listo para SaaS compartido.
- Que RLS esté protegiendo en producción.
- Que las cuotas se apliquen a chat/RAG/files.
- Que exista tenant switcher.
- Que el test E2E pase en verde (es esqueleto).

## Próximos pasos

1. Ejecutar `pnpm test -- tests/tenant-http-e2e.test.ts` y ajustar hasta verde.
2. Decidir Supabase (ver `estado-supabase.md`).
3. Atacar Bloque P1: D6 (cuotas), D25 (logContext), D13 (tenantId en respuestas).
4. Solo después, Fase 2 del roadmap (membresías, switch-tenant).
