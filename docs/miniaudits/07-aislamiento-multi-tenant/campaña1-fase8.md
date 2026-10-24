# 09 — Campaña 1 / Fase 8 — B9 CI + cierre documental de la Campaña 1

**Fecha:** 2026-10-21
**Campaña:** 1 — Aislamiento multi-tenant
**Fase:** 8 — B9 CI + cierre Campaña 1
**Ejecutor:** IA implementadora + humano. Cline corre typecheck/test.
**Base de partida:** rama `feat/multitenancy-campaign`. Fases 0–7 cerradas. **Aplicados en el repo:** todas las marcas de Fases 2–7 más `MEMBERSHIP_CACHE_INVALIDATE_V1`, `SWITCH_TENANT_ENDPOINT_V1`, `ADMIN_TENANTS_CRUD_V1`, `MIGRATE_SCOPE_TX_V1`. **Pospuestos a Campaña 2:** F04.10b/c/d (tablas SQL `tenant_members`, `tenant_configs`), F04.10-wire (`bus` en `TenantService`), F04.14c-event (evento al bus, requiere reordenar `bus`). **Congelados:** F02.10 (tests). **Bloqueados:** F04.27 (`backup-tenant.ts` no existe en Repomix). **En esta fase:** F05.3 (CI `continue-on-error`), F05.5 (`tsc` en CI), F05.9 (`worker.ts` typecheck en CI), cierre documental (CIERRE-MVP, `-pendientes.md`, `ID-MAP.md`).

---

## 1. Qué fue la fase anterior

Fase 7 (documento 08): B8 recortado. Se aplicaron F04.14c (`invalidateAll` en `setMembership`, evento al bus pospuesto), F04.14b (`/api/auth/switch-tenant`), F04.12 (`DELETE` y `PATCH` en `admin-tenants.ts`), F04.11 (`db.transaction` en `migrate-tenant-scope.ts`), F04.11b (verificado sin cambios). **No se aplicaron F04.10b/c/d ni F04.10-wire** porque requieren tablas SQL que no existen. F04.27 sigue bloqueado. Deudas anotadas para Fases 8/9: adaptar `DatabaseTenantResolver`/`DatabaseTenantConfigResolver` a leer de `records` (Fase 8/9), cablear `bus` a `TenantService` (Fase 9), `delete-tenant-data.ts` (Fase 9).

---

## 2. Qué conseguimos con esta fase

- **CI falla cuando los audits fallan** (F05.3): en `.github/workflows/ci.yml`, el job `audits` deja de tener `continue-on-error: true`. Si un audit (layers, bridges, console, tenant-default, idempotency, contracts) devuelve rojo, el PR no pasa.
- **CI ejecuta typecheck del server** (F05.5): el job `unit` añade `pnpm --filter @openmuse/server exec tsc --noEmit` (o `pnpm typecheck` desde raíz si `apps/server/package.json` no existe). Si hay errores de tipo, el PR no pasa.
- **CI ejecuta typecheck del worker** (F05.9): el job `worker` ya corre `npm run typecheck` en `apps/worker`. Se anota que **`apps/server/src/engine/worker.ts` sigue roto** y **no se puede arreglar en esta fase** (Copilot lo repara en otra rama). **CI seguirá en rojo por `worker.ts` hasta que Copilot lo arregle**, así que **el job `unit` no debe bloquear el merge por `worker.ts` todavía**. Se anota `F05.9` como bloqueado por Copilot y se marca el job como "warn-only" para `worker.ts` hasta que Copilot commitee. **Riesgo asumido:** el CI en `main` seguirá en rojo por `worker.ts`, pero **`feat/multitenancy-campaign` no empeora la situación**. Se anota en `-pendientes.md`.
- **`CIERRE-MVP.md` actualizado** con secciones:
  - `CIERRE_MVP_AUDIT_V1` (ya existe de Fase 1, corregido).
  - `CIERRE_MVP_RESULT_V1` (ya existe de Fase 1).
  - **`CIERRE_MVP_CAMPAIGN1_FINAL_V1`** (nuevo): resumen de las 8 fases de la Campaña 1, qué se cerró, qué queda pendiente, traspaso a Campaña 2.
- **`-pendientes.md` consolidado**: los 13 bloqueados del original + deudas nuevas de Fases 2–8 (F04.10b/c/d, F04.10-wire, F04.14c-event, F04.27, `delete-tenant-data.ts`, `worker.ts` reparado por Copilot, `bus` en `TenantService`, adaptación de resolvers a `records`).
- **`ID-MAP.md` final**: tabla completa de IDs mapeados: miniaudit 1–20, D1–D20, 07-A1–A12, F02.8, F02.9, F02.10, F02.9b, F03.11, F03.30, F03.31, F03.35, F03.38, F04.2, F04.3, F04.10, F04.10b/c/d, F04.11, F04.11b, F04.12, F04.14, F04.14b, F04.14c, F04.15, F04.16-common, F04.16a/b/c, F04.16d, F04.17, F04.20, F04.21, F04.22, F04.23, F04.24, F04.25, F04.27, F04.30, F04.31, F04.33, F05.1–F05.9, N01–N07. **Cada uno con su estado: aplicado / congelado / bloqueado / pospuesto a Campaña 2.**
- **`ESTADO-REAL-MULTITENANT.md` final**: confirmación final de las marcas (36 marcas), verificación de que no quedan `"default"` hardcodeados fuera de `DEFAULT_TENANT_ID`, y estado de los 13+ deudas.
- **Preparación del traspaso a Campaña 2**: en `-pendientes.md` y en `CIERRE-MVP.md`, sección "Traspaso a Campaña 2", con los 5 disparadores (shared vs clone, Postgres vs Supabase, Stripe vs manual, SOC 2 Type I vs II, cliente piloto).
- **Cero cambios de comportamiento** en código. Solo `.github/workflows/ci.yml` y documentación.

---

## 3. Qué será la siguiente fase

**Fase 9 (documento 10): Campaña 2 — arranque**. Documento de decisión. No ejecuta nada. Contiene: 5 decisiones pendientes, mapa de tablas SQL nuevas, plan de migración con rollback, checklist de RLS `FORCE`, `switch-tenant` real multi-membership, Stripe Connect, reconciliación de uso, SOC 2 Type II, 10 controles documentados, plan de `delete-tenant-data.ts`, plan de reparación de `worker.ts` por Copilot, plan de adaptación de `DatabaseTenantResolver`/`DatabaseTenantConfigResolver` a `records`, y **la lista completa de trabajo pendiente con criterios de aceptación y riesgos**. **Es el último documento de los 10.**

---

## 4. Número de fases de esta sección

**1 fase** (Fase 8), ejecutada en **1 patchset de código** (`.github/workflows/ci.yml`) más **4 patchsets de documentación** (CIERRE-MVP, `-pendientes.md`, `ID-MAP.md`, `ESTADO-REAL-MULTITENANT.md`) más **1 patchset de verificación sin escritura** (confirmar Fases 0–7 cerradas). Total: **5 patchsets de escritura + 1 de solo lectura**.

---

## 5. Archivos a leer (obligatorio antes de escribir nada)

**Ya disponibles en el Repomix original + holístico:**
- `.github/workflows/ci.yml` (Repomix original, íntegro).
- `apps/server/src/engine/worker.ts` (Repomix original: **roto, no se toca**. Solo para verificar que sigue roto y anotar).
- `apps/server/src/app.ts` (Repomix original + Fases 3–6: `createApp`, `bus`, `tenantServiceEarly`, `kernel`).
- `apps/server/src/db-rls.ts` (Repomix original + Fase 4).
- `apps/server/src/engine/tenant.ts` (Repomix original + Fase 7).
- `apps/server/src/admin-tenants.ts` (Repomix original + Fases 2 y 7).
- `apps/server/src/auth-routes.ts` (Repomix original + Fase 7).
- `apps/server/src/engine/service.ts` (Repomix holístico: constructor y `deps`).
- `apps/server/src/middleware/request-logger.ts` (Repomix original + Fases 3 y 6).
- `apps/server/src/metrics/registry.ts` (Repomix original + Fase 6).
- `apps/server/src/metrics-exporter.ts` (Repomix original + Fase 6).
- `apps/server/src/notification-prefs.ts` (Repomix original + Fase 6).
- `apps/server/src/notifications-stream.ts` (Repomix original + Fase 6).
- `apps/server/src/browser.ts` (Repomix original + Fase 6).
- `apps/server/src/computer.ts` (Repomix original + Fases 5 y 6).
- `apps/server/src/computer-routes.ts`, `computer-tools.ts` (Repomix original + Fases 5 y 6).
- `apps/server/src/rag-routes.ts`, `threads-routes.ts`, `engine/conversation.ts` (Repomix original + Fases 3 y 6).
- `apps/server/src/index.ts` (Repomix original + Fase 4).
- `apps/server/src/kernel/audit/store-store.ts` (Repomix holístico + Fase 4).
- `apps/server/src/kernel/tenancy/database-resolver.ts`, `kernel/config/database-resolver.ts` (Repomix original: SQL esperado, para documentar la deuda).
- `scripts/migrate-tenant-scope.ts`, `scripts/migrate-tenant-membership.ts` (Repomix original + holístico + Fase 7).
- `docs/miniaudits/07-aislamiento-multi-tenant/CIERRE-MVP.md`, `fuera-de-mvp.md`, `fixes.md`, `ESTADO-REAL-MULTITENANT.md`, `ID-MAP.md`, `-pendientes.md`, `_multitenant_pendientes.md` (Fases 0–7).
- `docs/miniaudits/07-aislamiento-multi-tenant/missed/_multitenant_pendientes.md` (creado por humano; solo lectura).

**Archivos a inspeccionar con `Select-String` (no lectura completa):**
- `apps/server/src/engine/worker.ts` — solo `Get-Content -TotalCount 120`. **Prohibido tocar.**
- `apps/server/src/app.ts` — `Select-String -Pattern "const bus|new TenantService|const kernel = new Kernel"` con `-Context 1,2`.
- `apps/server/src/engine/tenant.ts` — `Select-String -Pattern "MEMBERSHIP_CACHE_INVALIDATE_V1|invalidateAll"` con `-Context 1,2`.

**Archivos que NO se leen en esta fase:**
- `apps/server/src/engine/worker.ts` (más allá de las 120 líneas).
- Cualquier fichero de `apps/server/src/` que no sea `worker.ts` o `app.ts`. **No se toca código de producto.**

---

## 6. Archivos a crear / modificar en esta fase

**Modificar:**
- `.github/workflows/ci.yml` — F05.3 + F05.5 + F05.9. Quitar `continue-on-error: true` del job `audits`; añadir `pnpm --filter @openmuse/server exec tsc --noEmit` (o `pnpm typecheck`) al job `unit`; anotar `worker.ts` como warn-only (no bloquea merge hasta que Copilot lo arregle). Marcas en comentarios: `CI_AUDITS_ENFORCED_V1`, `CI_TYPECHECK_SERVER_V1`, `CI_WORKER_TYPECHECK_WARN_V1`.
- `docs/miniaudits/07-aislamiento-multi-tenant/CIERRE-MVP.md` — append `CIERRE_MVP_CAMPAIGN1_FINAL_V1` con resumen de las 8 fases y traspaso a Campaña 2.
- `docs/miniaudits/07-aislamiento-multi-tenant/-pendientes.md` — consolidar los 13 bloqueados + deudas de Fases 2–8. **Reescribir el fichero entero** (no append), porque la lista cambia mucho.
- `docs/miniaudits/07-aislamiento-multi-tenant/ID-MAP.md` — append `ID_MAP_FINAL_V1` con tabla completa.
- `docs/miniaudits/07-aislamiento-multi-tenant/ESTADO-REAL-MULTITENANT.md` — append `ESTADO_REAL_FINAL_V1` con confirmación de marcas.

**No crear (prohibido en esta fase):**
- Cualquier `tests/*.test.ts` (F02.10 congelado).
- Cualquier `scripts/*.ts`.
- Cualquier modificación a `_multitenant_pendientes.md` (lo escribe el humano).
- Cualquier modificación a `worker.ts`, `service.ts`, `kernel.ts`.

**No tocar:**
- `worker.ts`, `service.ts`, `conversation.ts`, `kernel.ts`, `scripts/audits/*`, `tests/tenant-http-e2e.test.ts`.
- `backup-tenant.ts` (no existe).
- Cualquier otro fichero de `apps/server/src/`.

---

## 7. Número de hunks por patchset

| Patchset | Fichero | Hunks | Tipo |
|---|---|---|---|
| F05.3+F05.5+F05.9 | `.github/workflows/ci.yml` | 3 (audits sin continue-on-error, tsc en unit, worker warn-only) | MODIFY |
| CIERRE-FINAL | `CIERRE-MVP.md` | 1 (append) | APPEND |
| PENDIENTES-FINAL | `-pendientes.md` | 1 (reescritura completa) | MODIFY (reemplazo) |
| ID-MAP-FINAL | `ID-MAP.md` | 1 (append) | APPEND |
| ESTADO-FINAL | `ESTADO-REAL-MULTITENANT.md` | 1 (append) | APPEND |

**Total: 5 patchsets, 7 hunks.**

---

## 8. Número de fixes y multipatches

- **Fixes aplicados:** F05.3, F05.5, F05.9 (parcial, warn-only por `worker.ts`).
- **Fixes documentales aplicados:** consolidación de `CIERRE-MVP.md`, `-pendientes.md`, `ID-MAP.md`, `ESTADO-REAL-MULTITENANT.md`.
- **Fixes congelados:** F02.10 (tests), F02.7/F02.12/F03.31-test/F03.36-test/F04.20-test/F05.1/F05.4/F05.6/F05.7 (todos los tests de la Campaña 1).
- **Fixes bloqueados:** F04.27 (`backup-tenant.ts`), F05.9 (parcialmente, `worker.ts`).
- **Fixes pospuestos a Campaña 2:** F04.10b/c/d, F04.10-wire, F04.14c-event, F04.30, F04.31, F04.33, `delete-tenant-data.ts`, adaptación de resolvers a `records`.
- **Fixes desbloqueados por esta fase:** ninguno directo. **La Campaña 1 queda documentalmente cerrada y traspasada.**

---

## 9. Orden exacto de examinar código y decisiones

### Paso 0 — Verificación previa sin escritura

**0.1. Estado de Fases 0–7.**
```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
$repoRoot = (Resolve-Path ".").Path
if (-not (Test-Path (Join-Path $repoRoot ".git"))) { throw "ERROR: no es un repo git" }
$branch = git -C $repoRoot branch --show-current
if ($branch -ne "feat/multitenancy-campaign") { throw "ERROR: rama $branch" }

$checks = @{
  "apps/server/src/admin-tenants.ts" = "ADMIN_TENANTS_CRUD_V1"
  "apps/server/src/db-tenant.ts" = "TENANT_PEEL_GUARD_V1"
  "apps/server/src/middleware/request-logger.ts" = "METRICS_TENANT_LABEL_V1"
  "apps/server/src/engine/service.ts" = "TENANT_RATE_LIMITER_FIELD_V1"
  "apps/server/src/app.ts" = "TENANT_RATE_LIMITER_WIRE_V1"
  "apps/server/src/engine/conversation.ts" = "TAKE_FOR_TENANT_TENANTID_V1"
  "apps/server/src/rag-routes.ts" = "TAKE_FOR_TENANT_TENANTID_V1"
  "apps/server/src/threads-routes.ts" = "TAKE_FOR_TENANT_TENANTID_V1"
  "apps/server/src/db-rls.ts" = "TENANT_RLS_TX_V1"
  "apps/server/src/index.ts" = "RLS_REQUIRED_IN_SHARED_V1"
  "apps/server/src/kernel/audit/store-store.ts" = "AUDIT_STORE_TENANT_V1"
  "apps/server/src/computer.ts" = "TAKE_FOR_TENANT_COMPUTER_V1"
  "apps/server/src/browser.ts" = "TAKE_FOR_TENANT_BROWSER_V1"
  "apps/server/src/notification-prefs.ts" = "NOTIFICATION_PREFS_TENANT_V1"
  "apps/server/src/notifications-stream.ts" = "NOTIFICATIONS_STREAM_TENANT_V1"
  "apps/server/src/metrics-exporter.ts" = "METRICS_EXPORTER_TENANT_V1"
  "apps/server/src/auth-routes.ts" = "SWITCH_TENANT_ENDPOINT_V1"
  "apps/server/src/engine/tenant.ts" = "MEMBERSHIP_CACHE_INVALIDATE_V1"
  "scripts/migrate-tenant-scope.ts" = "MIGRATE_SCOPE_TX_V1"
}
foreach ($k in $checks.Keys) {
  $c = Get-Content (Join-Path $repoRoot $k) -Raw
  if ($c -notmatch [regex]::Escape($checks[$k])) { throw "ERROR: falta $($checks[$k]) en $k" }
}
Write-Host "Fases 0-7 verificadas" -ForegroundColor Green
```
**Decisión:** si falla, **ABORTA TODO** y anota.

**0.2. Ancla de F05.3 en `.github/workflows/ci.yml`.**
```powershell
$ci = Join-Path $repoRoot ".github/workflows/ci.yml"
if (-not (Test-Path $ci)) { throw "ERROR: falta ci.yml" }
$cc = Get-Content $ci -Raw

Write-Host "=== job audits con continue-on-error ==="
Select-String -Path $ci -Pattern "audits|continue-on-error" -Context 1,2

Write-Host ("CI_AUDITS_ENFORCED_V1 presente: {0}" -f ($cc -match [regex]::Escape("CI_AUDITS_ENFORCED_V1")))
Write-Host ("CI_TYPECHECK_SERVER_V1 presente: {0}" -f ($cc -match [regex]::Escape("CI_TYPECHECK_SERVER_V1")))
Write-Host ("CI_WORKER_TYPECHECK_WARN_V1 presente: {0}" -f ($cc -match [regex]::Escape("CI_WORKER_TYPECHECK_WARN_V1")))
```
**Decisión:** si `continue-on-error: true` está en `audits` y las 3 marcas están 0×, aplicar F05.3+F05.5+F05.9.

**0.3. Verificar si `apps/server/package.json` existe para F05.5.**
```powershell
$pkg = Join-Path $repoRoot "apps/server/package.json"
Write-Host ("apps/server/package.json existe: {0}" -f (Test-Path $pkg))
```
**Decisión:**
- Si existe con `name: "@openmuse/server"`, F05.5 usa `pnpm --filter @openmuse/server exec tsc --noEmit`.
- Si no existe, F05.5 usa `pnpm typecheck` (raíz). **Comando alternativo:** `corepack pnpm typecheck` en el job `unit`. Se anota en `-pendientes.md` que `apps/server/package.json` no existe (deuda del repo).

**0.4. Confirmar `worker.ts` sigue roto.**
```powershell
Get-Content (Join-Path $repoRoot "apps/server/src/engine/worker.ts") -TotalCount 120
```
**Decisión:** solo lectura. Si sigue roto, F05.9 anota `worker.ts` como warn-only en CI. Si Copilot lo ha reparado, **se aplica F05.9 sin warn-only** y se anota en `-pendientes.md` que Copilot ha publicado fix.

**0.5. Verificar los 36 marcadores aplicados (para `ID-MAP-FINAL` y `ESTADO-REAL-FINAL`).**
```powershell
$marks = @(
  "TENANT_DEFAULT_STRICT_V1","TENANT_SCAN_ALL_PREFIXES_FIX_V1","TENANT_PEEL_GUARD_V1",
  "ADMIN_TENANTS_MEMBERSHIP_CACHE_V1","ADMIN_TENANTS_SUSPEND_INVALIDATE_V1","ADMIN_TENANTS_RESUME_INVALIDATE_V1",
  "LOG_CONTEXT_TENANT_V1","TENANT_RATE_LIMITER_FIELD_V1","TENANT_RATE_LIMITER_WIRE_V1","TENANT_RATE_LIMITER_WIRE_ROUTES_V1",
  "TAKE_FOR_TENANT_CHAT_V1","TAKE_FOR_TENANT_RAG_V1","TAKE_FOR_TENANT_THREADS_V1","TAKE_FOR_TENANT_TENANTID_V1",
  "TENANT_RLS_TX_V1","RLS_REQUIRED_IN_SHARED_V1","AUDIT_STORE_TENANT_V1",
  "APP_TENANT_REQUEST_VALIDATE_BODY_V1","TENANT_CROSS_AUDIT_V1","RESPONSE_TENANT_HEADER_V1",
  "COMPUTER_IDENTITY_TENANT_V1","COMPUTER_ROUTES_TENANT_V1","COMPUTER_TOOLS_TENANT_V1","COMPUTER_ROUTES_WIRE_V1","COMPUTER_TOOLS_WIRE_V1",
  "TAKE_FOR_TENANT_BROWSER_V1","TAKE_FOR_TENANT_COMPUTER_V1","METRICS_TENANT_LABEL_V1","METRICS_EXPORTER_TENANT_V1",
  "NOTIFICATION_PREFS_TENANT_V1","NOTIFICATIONS_STREAM_TENANT_V1","TENANT_ASSERT_NOT_DEFAULT_WIRED_V1",
  "TENANT_LIMITER_WIRE_BROWSER_COMPUTER_V1","TENANT_WIRE_NOTIFICATIONS_V1",
  "MEMBERSHIP_CACHE_INVALIDATE_V1","SWITCH_TENANT_ENDPOINT_V1","ADMIN_TENANTS_CRUD_V1","MIGRATE_SCOPE_TX_V1"
)
$missing = @()
foreach ($m in $marks) {
  $hits = Get-ChildItem (Join-Path $repoRoot "apps/server/src"),(Join-Path $repoRoot "scripts") -Recurse -File -Include *.ts -ErrorAction SilentlyContinue |
          Select-String -SimpleMatch $m
  if (@($hits).Count -eq 0) { $missing += $m; Write-Host "FALTA  $m" -ForegroundColor Red }
}
if ($missing.Count -gt 0) { throw "ERROR: faltan $($missing.Count) marcas: $($missing -join ', ')" }
Write-Host "Las $($marks.Count) marcas aplicadas" -ForegroundColor Green
```

**0.6. Verificar que no quedan `"default"` fuera de `DEFAULT_TENANT_ID`.**
```powershell
$files = Get-ChildItem (Join-Path $repoRoot "apps/server/src") -Recurse -File -Filter *.ts
$hits = $files | Select-String -Pattern '"default"' -SimpleMatch
$report = @()
foreach ($h in $hits) {
  $rel = $h.Path.Replace($repoRoot, "")
  $line = $h.Line.Trim()
  # Excluir las lineas donde "default" es legitimo:
  # - DEFAULT_TENANT_ID = "default"
  # - action.kind default (UI)
  # - prefs id "default" (ya cambiado en Fase 6 a tenantId real, no deberia aparecer)
  # - fallback en catch(() => "default")
  # - mensaje de error
  $legit = $false
  if ($line -match 'DEFAULT_TENANT_ID\s*=\s*"default"') { $legit = $true }
  if ($line -match '\.default\("default"\)') { $legit = $true }  # UI action kind
  if ($line -match 'catch\(\(\)\s*=>\s*"default"\)') { $legit = $true }
  if ($line -match '\?\?\s*"default"') { $legit = $true }
  if (-not $legit) {
    $report += "$rel : $line"
  }
}
if ($report.Count -eq 0) { Write-Host "Sin 'default' sospechosos" -ForegroundColor Green }
else {
  Write-Host "Revision manual de $($report.Count) lineas:" -ForegroundColor Yellow
  $report | ForEach-Object { Write-Host $_ }
}
```
**Decisión:** el reporte se incluye en `ESTADO-REAL-FINAL`. **No se cambia nada en esta fase**; si hay líneas sospechosas, se anotan en `-pendientes.md` como deuda para Campaña 2.

### Paso 1 — Decisión y anotación

| Fix | ¿Se aplica? | Motivo |
|---|---|---|
| F05.3 | Sí (1 hunk) | quitar `continue-on-error: true` de audits |
| F05.5 | Sí (1 hunk) | `tsc` en job `unit` |
| F05.9 | Sí (1 hunk, warn-only) | `worker.ts` en CI warn-only |
| CIERRE-FINAL | Sí (1 hunk) | `CIERRE_MVP_CAMPAIGN1_FINAL_V1` |
| PENDIENTES-FINAL | Sí (1 hunk) | reescritura completa |
| ID-MAP-FINAL | Sí (1 hunk) | `ID_MAP_FINAL_V1` |
| ESTADO-FINAL | Sí (1 hunk) | `ESTADO_REAL_FINAL_V1` |

---

## 10. Patchsets

### F05.3 + F05.5 + F05.9 — `.github/workflows/ci.yml` (3 hunks)

**Fichero:** `.github/workflows/ci.yml`
**Marcas:** `CI_AUDITS_ENFORCED_V1`, `CI_TYPECHECK_SERVER_V1`, `CI_WORKER_TYPECHECK_WARN_V1`.

**Hunk 1 — F05.3: `audits` sin `continue-on-error`.**

**`$old` (Repomix original, literal):**
```yaml
      - name: audits
        run: |
          pnpm audit:layers
          pnpm audit:bridges
          pnpm audit:console
          pnpm audit:tenant-default
          pnpm audit:idempotency
          pnpm audit:contracts
        continue-on-error: true
```

**`$new`:**
```yaml
      # CI_AUDITS_ENFORCED_V1 — antes los audits tenían `continue-on-error: true`,
      # así que un audit rojo no rompía el CI. Ahora sí lo rompe: un PR con
      # findings de aislamiento/contratos/layers no pasa.
      - name: audits
        run: |
          pnpm audit:layers
          pnpm audit:bridges
          pnpm audit:console
          pnpm audit:tenant-default
          pnpm audit:idempotency
          pnpm audit:contracts
```

**Hunk 2 — F05.5: `tsc` en job `unit`.**

**`$old`:**
```yaml
      - run: pnpm typecheck
      - run: pnpm test
        env:
          ALLOW_NETWORK: "0"
```

**`$new`:**
```yaml
      # CI_TYPECHECK_SERVER_V1 — typecheck explícito del server.
      # Nota: si apps/server/package.json no existe, `pnpm typecheck` desde
      # raíz ya cubre el server. La línea del `--filter` se conserva solo si
      # el package.json aparece en el futuro.
      - run: pnpm typecheck
      - name: typecheck server (filter)
        if: hashFiles('apps/server/package.json') != ''
        run: pnpm --filter @openmuse/server exec tsc --noEmit
      - run: pnpm test
        env:
          ALLOW_NETWORK: "0"
```

**Hunk 3 — F05.9: `worker.ts` warn-only.**

**`$old`:**
```yaml
  worker:
    name: worker (typecheck)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - working-directory: apps/worker
        run: npm ci
      - working-directory: apps/worker
        run: npm run typecheck
```

**`$new`:**
```yaml
  # CI_WORKER_TYPECHECK_WARN_V1 — worker.ts sigue roto (Copilot lo repara en
  # otra rama). Este job es warn-only hasta que Copilot commitee el fix.
  # No bloquea el merge.
  worker:
    name: worker (typecheck)
    runs-on: ubuntu-latest
    continue-on-error: true
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - working-directory: apps/worker
        run: npm ci
      - working-directory: apps/worker
        run: npm run typecheck
```

**Verificación pre:** `continue-on-error: true` en `audits` 1×, `- run: pnpm typecheck` en `unit` 1×, `worker:` job sin `continue-on-error` 1×, marcas 0×. Post: `continue-on-error: true` en `audits` 0×, en `worker` 1×, `CI_AUDITS_ENFORCED_V1` 1×, `CI_TYPECHECK_SERVER_V1` 1×, `CI_WORKER_TYPECHECK_WARN_V1` 1×.

**Nota:** `CI_WORKER_TYPECHECK_WARN_V1` añade `continue-on-error: true` al **job worker**, no al step. Así el job entero puede fallar sin romper el PR. **Esto es lo que pide el plan**: `worker.ts` roto no bloquea merge hasta que Copilot lo repare. Cuando Copilot commitee, se quita la línea y se anota en `-pendientes.md` como "worker.ts reparado por Copilot, quitar warn-only".

### CIERRE-FINAL — `CIERRE-MVP.md`: `CIERRE_MVP_CAMPAIGN1_FINAL_V1` (1 hunk)

**Fichero:** `docs/miniaudits/07-aislamiento-multi-tenant/CIERRE-MVP.md`
**Marca:** `CIERRE_MVP_CAMPAIGN1_FINAL_V1`.

**Ancla:** append al final del fichero.

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
$repoRoot = (Resolve-Path ".").Path
$file = Join-Path $repoRoot "docs/miniaudits/07-aislamiento-multi-tenant/CIERRE-MVP.md"
$mark = "CIERRE_MVP_CAMPAIGN1_FINAL_V1"
if (-not (Test-Path $file)) { throw "ERROR: falta CIERRE-MVP.md" }
$content = Get-Content $file -Raw
if ($content -match $mark) {
  Write-Host "SKIP CIERRE-FINAL: $mark ya existe"
} else {
  $append = @'
<!-- CIERRE_MVP_CAMPAIGN1_FINAL_V1 -->
## Cierre de la Campaña 1 — 8 fases ejecutadas

> Este cierre lo genera la Fase 8 del plan de 10 documentos.
> Resume qué se cerró, qué queda pendiente y qué se traspasa a la Campaña 2.

### Fases ejecutadas

| Fase | Documento | Foco | Estado |
|---|---|---|---|
| 0 | 01 | Reconocimiento y verdad del repo | Cerrada |
| 1 | 02 | Documentación real (F01) | Cerrada |
| 2 | 03 | B2 aislamiento estricto (N01, N02, N04) | Cerrada |
| 3 | 04 | B3 rate limit + logContext | Cerrada |
| 4 | 05 | B4 RLS tx + body validate + cross audit + X-Tenant-Id | Cerrada |
| 5 | 06 | B5 computer tenant + F04.2/F04.3 verificados | Cerrada |
| 6 | 07 | B6+B7 cuotas + metrics + notificaciones + F02.9b | Cerrada |
| 7 | 08 | B8 switch-tenant + admin CRUD + migrate tx | Cerrada (recortada) |
| 8 | 09 | B9 CI + cierre documental | **Esta fase** |

### Marcas aplicadas (36)

Todas las marcas listadas en `ID-MAP.md` sección "Marcas aplicadas" están en el código.
El detalle completo, con archivo y línea, está en `ESTADO-REAL-MULTITENANT.md`.

### Qué queda pendiente para la Campaña 2

- **F04.10b/c/d**: `tenant_members` / `tenant_configs` / `tenant_invites` / `tenant_audit_events` como **tablas SQL** (no kinds de `records`). Requiere migración.
- **F04.10-wire**: cablear `bus` a `TenantService` moviendo `const bus = new EventBus(tdb)` antes de `new TenantService`.
- **F04.14c-event**: emitir `tenant.membership.changed` al bus. Requiere `SYSTEM_EVENT_TYPES` con el tipo.
- **F04.30/F04.31/F04.33**: Stripe Connect, reconciliación de uso, tenant switcher frontend.
- **F04.27**: `runTenantBackup` bloqueado hasta que exista `backup-tenant.ts` en el repo.
- **`delete-tenant-data.ts`**: script para borrar los records de un tenant (tasks, files, etc.) al hacer `DELETE /api/admin/tenants/:tenantId`.
- **Adaptación de resolvers**: `DatabaseTenantResolver` y `DatabaseTenantConfigResolver` requieren tablas SQL. Alternativa: adaptarlos a leer de `records` con kinds nuevos. Decisión en Campaña 2.
- **`worker.ts`**: Copilot lo repara en otra rama. CI queda warn-only hasta entonces.
- **Tests de la Campaña 1**: F02.10, F02.7, F02.12, F03.31-test, F03.36-test, F04.20-test, F05.1, F05.4, F05.6, F05.7 — todos congelados por instrucción del humano. Cline los corre en la fase de tests (Campaña 2 o posterior).
- **F05.4 E2E a verde**: depende de que `worker.ts` esté reparado.
- **F05.6/F05.7**: audits en CI ya enforzados (F05.3); E2E en CI en Campaña 2.

### Traspaso a la Campaña 2

La Campaña 2 (SaaS compartido SOC 2 Type II) se arranca en el documento 10. Requiere 5 decisiones:
1. ¿SaaS compartido o clone-por-cliente permanente?
2. ¿Postgres gestionado o Supabase?
3. ¿Stripe o facturación manual?
4. ¿SOC 2 Type I (foto) o Type II (3 meses)?
5. ¿Cliente piloto para migración?

Sin esas decisiones, la Campaña 2 no se empieza.

### Estado del repo al cierre de la Campaña 1

- Rama `feat/multitenancy-campaign` con commits de las fases 0–8.
- `main` con `stash@{0}` de Copilot. **No tocado.**
- `worker.ts` roto en `main` (Copilot lo repara en otra rama).
- `apps/server/package.json` puede no existir; `pnpm typecheck` desde raíz cubre el server.
- `tests/tenant-strict.test.ts` **no existe** (F02.10 congelado).
- `backup-tenant.ts` **no existe** (F04.27 bloqueado).
'@
  $newContent = $content.TrimEnd() + "`r`n" + $append
  $preCount = ([regex]::Matches($newContent, [regex]::Escape($mark))).Count
  if ($preCount -ne 1) { throw "ERROR: $mark $preCount veces" }
  $tmpFile = Join-Path (Split-Path $file -Parent) ("." + (Split-Path $file -Leaf) + ".tmp")
  $backupDir = Join-Path $repoRoot ".tmp/patchset-backups"
  New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
  $backup = Join-Path $backupDir ("{0}-cierre-final.bak" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
  Copy-Item $file $backup -Force
  [System.IO.File]::WriteAllText($tmpFile, $newContent, (New-Object System.Text.UTF8Encoding $false))
  try { [System.IO.File]::Replace($tmpFile, $file, $null) }
  catch { if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force }; Copy-Item $backup $file -Force; throw "FALLO: File.Replace. Revertido." }
  $final = Get-Content $file -Raw
  $postCount = ([regex]::Matches($final, [regex]::Escape($mark))).Count
  if ($postCount -ne 1) { Copy-Item $backup $file -Force; throw "FALLO: $mark $postCount tras escribir. Revertido." }
  git -C $repoRoot diff --check $file
  if ($LASTEXITCODE -ne 0) { Copy-Item $backup $file -Force; throw "FALLO: diff con problemas. Revertido." }
  Write-Host "OK CIERRE-FINAL [$mark]" -ForegroundColor Green
  Write-Host "Backup: $backup"
}
```

### PENDIENTES-FINAL — `-pendientes.md`: reescritura completa (1 hunk)

**Fichero:** `docs/miniaudits/07-aislamiento-multi-tenant/-pendientes.md`
**Marca:** `MULTITENANT_PENDIENTES_FINAL_V1`.

**Ancla:** reemplazo completo del fichero (la lista cambió mucho respecto a Fase 1). **Verificación pre:** el fichero existe con `MULTITENANT_PENDIENTES_V1`. **Verificación post:** `MULTITENANT_PENDIENTES_FINAL_V1` 1×, `MULTITENANT_PENDIENTES_V1` 0×.

**Contenido (reescritura, no append):**

```powershell
$file = Join-Path $repoRoot "docs/miniaudits/07-aislamiento-multi-tenant/-pendientes.md"
if (-not (Test-Path $file)) { throw "ERROR: falta -pendientes.md" }
$content = Get-Content $file -Raw
if ($content -match [regex]::Escape("MULTITENANT_PENDIENTES_FINAL_V1")) {
  Write-Host "SKIP PENDIENTES-FINAL: ya reescrito"
} else {
  $newContent = @'
<!-- MULTITENANT_PENDIENTES_FINAL_V1 -->
# -pendientes.md — trabajo pendiente de la Campaña 1 (cierre)

> Actualizado en Fase 8. Consolida los 13 bloqueados originales más las
> deudas de las Fases 2–8.
> Los misses de ejecución van a `missed/_multitenant_pendientes.md`, no aquí.

## Bloqueados por dependencia externa

| ID | Fix | Bloqueado por | Desbloquea con |
|---|---|---|---|
| F00.5 | 16 prohibidas clasificadas | `AUDIT_TENANT_DEFAULT.md` sin lista explícita | humano confirma lista |
| F01.5 | A.5 (16 default) | F00.5 | humano confirma lista |
| F02.1–F02.4 | `worker.ts` | fichero roto, Copilot lo repara en otra rama | Copilot publica fix |
| F02.10 | tests tenant-strict | congelado por instrucción | reactivar tests |
| F02.7, F02.12 | tests worker-* | idem | idem |
| F04.1 | clasificar 16 default | F00.5 | humano confirma lista |
| F04.7 | índice por prefijo | requiere `EXPLAIN` real en Postgres prod-like | entorno con datos reales |
| F04.8, F04.9 | worker y DLQ con tenant | `worker.ts` roto | F02.1–F02.4 |
| F04.10b | `tenant_members`/`tenant_configs` SQL | requiere migración SQL (tablas nuevas) | Campaña 2 |
| F04.10c | `DatabaseTenantResolver` cableado | requiere tabla `tenant_members` | Campaña 2 |
| F04.10d | `DatabaseTenantConfigResolver` cableado | requiere tabla `tenant_configs` | Campaña 2 |
| F04.10-wire | `bus` en `TenantService` | requiere reordenar `const bus` antes de `new TenantService` | Campaña 2 (Fase 8/9) |
| F04.14c-event | evento `tenant.membership.changed` al bus | requiere `SYSTEM_EVENT_TYPES` | Campaña 2 |
| F04.20-test | test quota-tenant | congelado | reactivar tests |
| F04.27 | `runTenantBackup` | `backup-tenant.ts` no existe en Repomix | humano pasa fichero |
| F04.30 | Stripe Connect | requiere decisión Campaña 2 | decisión 3 |
| F04.31 | reconciliación uso | requiere `usage_events`/`tenant_quotas` | Campaña 2 |
| F04.33 | tenant switcher frontend | requiere `/switch-tenant` con multi-membership | Campaña 2 |
| F05.1 | test N=500 | congelado | reactivar tests |
| F05.2 | ejecutar E2E | congelado | reactivar tests |
| F05.3 | ejecutar test CI | idem | idem |
| F05.4 | E2E a verde | requiere `worker.ts` reparado | Copilot + tests |
| F05.5 | ejecutar CI multi-tenant | requiere `worker.ts` reparado | Copilot |
| F05.6, F05.7 | audits/E2E en CI | E2E requiere `worker.ts` | Copilot |
| F05.9 | `worker.ts` typecheck bloqueante | `worker.ts` roto | Copilot |
| `delete-tenant-data.ts` | script de borrado de datos tenant | requiere decisión Campaña 2 | decisión 1 |
| Adaptación de resolvers a `records` | alternativa a tablas SQL | decisión Campaña 2 | decisión 1/2 |
| `apps/server/package.json` | no existe | el repo no lo tiene | revisar en Campaña 2 |

## Deudas de las Fases 2–8 (no bloqueantes)

- **F02.8** (aplicado): F02.8 ya está en `tenant.ts`. Confirmado 1× en Fase 2.
- **N01** (aplicado): `TENANT_SCAN_ALL_PREFIXES_FIX_V1` en `db-tenant.ts`. Confirmado 1× en Fase 2.
- **F04.2, F04.3** (FPs): verificados en Fase 5 como falsos positivos. **Descartados.** Se mantienen aquí por trazabilidad.
- **F04.16a/b/c-refinamiento** (aplicado en Fase 6): el rate limit se hace dentro del IIFE async. **Deuda menor: pre-check síncrono antes del IIFE no existe.** Se anota para Campaña 2.
- **F04.21** (aplicado): `X-Tenant-Id` se añade al response. **Deuda menor: si `tenantService.tenantIdFor(owner)` falla, el header no se añade.** Correcto. Se anota.
- **F04.23** (aplicado): SSE filtra por tenant. **Deuda menor: notificaciones legacy sin `tenantId` se asumen del tenant actual.** Backfill en Campaña 2.
- **Migración de nombres de contenedor computer** (F04.24): contenedores viejos con nombre sin `tenantHash` quedan huérfanos. **Deuda operativa.** El humano limpia con `docker rm -f openmuse-*` en dev.
- **`getMaxActive` / `activeSize` en `worker.ts`**: rotos por comentarios sin cerrar. **Deuda de Copilot.**

## Traspaso a Campaña 2

Ver `CIERRE-MVP.md` sección "Traspaso a la Campaña 2".
Los 5 disparadores son: shared vs clone, Postgres vs Supabase, Stripe vs manual, SOC 2 Type I vs II, cliente piloto.
'@
  $preCount = ([regex]::Matches($newContent, [regex]::Escape("MULTITENANT_PENDIENTES_FINAL_V1"))).Count
  if ($preCount -ne 1) { throw "ERROR: $preCount marcas nuevas" }
  $tmpFile = Join-Path (Split-Path $file -Parent) ("." + (Split-Path $file -Leaf) + ".tmp")
  $backupDir = Join-Path $repoRoot ".tmp/patchset-backups"
  New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
  $backup = Join-Path $backupDir ("{0}-pendientes-final.bak" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
  Copy-Item $file $backup -Force
  [System.IO.File]::WriteAllText($tmpFile, $newContent, (New-Object System.Text.UTF8Encoding $false))
  try { [System.IO.File]::Replace($tmpFile, $file, $null) }
  catch { if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force }; Copy-Item $backup $file -Force; throw "FALLO: File.Replace. Revertido." }
  $final = Get-Content $file -Raw
  $postCount = ([regex]::Matches($final, [regex]::Escape("MULTITENANT_PENDIENTES_FINAL_V1"))).Count
  if ($postCount -ne 1) { Copy-Item $backup $file -Force; throw "FALLO: $postCount marcas tras escribir. Revertido." }
  if ($final -match [regex]::Escape("MULTITENANT_PENDIENTES_V1") -and $final -notmatch [regex]::Escape("MULTITENANT_PENDIENTES_FINAL_V1")) {
    Copy-Item $backup $file -Force; throw "FALLO: marca vieja presente. Revertido."
  }
  git -C $repoRoot diff --check $file
  if ($LASTEXITCODE -ne 0) { Copy-Item $backup $file -Force; throw "FALLO: diff con problemas. Revertido." }
  Write-Host "OK PENDIENTES-FINAL" -ForegroundColor Green
}
```

### ID-MAP-FINAL — `ID-MAP.md`: append (1 hunk)

**Fichero:** `docs/miniaudits/07-aislamiento-multi-tenant/ID-MAP.md`
**Marca:** `ID_MAP_FINAL_V1`.

**Ancla:** append. Contenido: tabla completa de los 20 huecos del miniaudit × D-ID × 07-A-ID × F0x.y × estado final × marca. Se genera a partir de `ESTADO-REAL-MULTITENANT.md` y de las marcas verificadas en Paso 0.5.

### ESTADO-FINAL — `ESTADO-REAL-MULTITENANT.md`: append (1 hunk)

**Fichero:** `docs/miniaudits/07-aislamiento-multi-tenant/ESTADO-REAL-MULTITENANT.md`
**Marca:** `ESTADO_REAL_FINAL_V1`.

**Ancla:** append. Contenido: confirmación de las 36 marcas (archivo + línea), reporte de `"default"` sospechosos de Paso 0.6, y estado de las deudas.

---

## 11. Reglas PowerShell v2.1 aplicables a esta fase

Las 18 prohibiciones del doc 01 y los repasos de docs 02–08 se aplican íntegras. **Además, en esta fase:**

- **`.github/workflows/ci.yml` es el único fichero de "código" tocado.** El YAML es sensible a indentación. El patchset usa `here-strings` con la indentación exacta del Repomix original. **Si `git diff --check` da trailing whitespace, se revierte y se revisa la indentación.**
- **`-pendientes.md` se reescribe completo.** Ancla: `MULTITENANT_PENDIENTES_V1` 1×. Post: `MULTITENANT_PENDIENTES_FINAL_V1` 1×, `MULTITENANT_PENDIENTES_V1` 0×. **Si el post check falla, se revierte.**
- **`CIERRE-MVP.md`, `ID-MAP.md`, `ESTADO-REAL-MULTITENANT.md` son append.** Ancla: ninguna, se appendea al final. Marca nueva 1×.
- **No `git add .`, no `--force`, no `commit` dentro del patchset.**

---

## 12. Typecheck, test, commit y push

- **Cline corre typecheck y test** al final de la fase. `pnpm typecheck` desde raíz y `pnpm test`. Si rojo, la IA no commitea. **Nota:** `worker.ts` sigue roto, así que `pnpm typecheck` puede fallar por él. **Se anota en `-pendientes.md` como esperado.** Si el typecheck falla por `worker.ts`, Cline **no commitea** y la IA anota el fallo en `_multitenant_pendientes.md`. Si falla por otra cosa, **se revierte el patchset correspondiente**.
- **Cline prueba además:**
  - `git commit` + `git push` al final.
  - En el PR de la rama, los jobs `unit` (con audits enforzados) y `worker` (warn-only) reflejan el cambio.
  - `pnpm test` verde o rojo según `worker.ts`.
- **La IA commitea con ficheros explícitos:**
  ```powershell
  git add .github/workflows/ci.yml
  git add docs/miniaudits/07-aislamiento-multi-tenant/CIERRE-MVP.md
  git add docs/miniaudits/07-aislamiento-multi-tenant/-pendientes.md
  git add docs/miniaudits/07-aislamiento-multi-tenant/ID-MAP.md
  git add docs/miniaudits/07-aislamiento-multi-tenant/ESTADO-REAL-MULTITENANT.md
  git commit -m "docs(multitenant): fase 8 — cierre Campaña 1 + CI enforzado [CI_AUDITS_ENFORCED_V1, CI_TYPECHECK_SERVER_V1, CI_WORKER_TYPECHECK_WARN_V1, CIERRE_MVP_CAMPAIGN1_FINAL_V1, MULTITENANT_PENDIENTES_FINAL_V1, ID_MAP_FINAL_V1, ESTADO_REAL_FINAL_V1]"
  git push origin feat/multitenancy-campaign
  ```
  **Nunca `git add .`**, **nunca `--force`**, **nunca tocar stash**.
- **Si el push falla por conflicto con `origin/main`, no forzar.** Anotar en `_multitenant_pendientes.md` y parar.

---

## 13. Plan de misses

Los misses esperados en esta fase:

- Fases 0–7 incompletas → aborta todo.
- F05.3 `continue-on-error: true` en `audits` 0× → `ci.yml` cambió; abortar F05.3.
- F05.5 `- run: pnpm typecheck` en `unit` 0× → abortar F05.5.
- F05.9 `worker:` job 0× o ya con `continue-on-error` → abortar F05.9.
- PENDIENTES-FINAL: `MULTITENANT_PENDIENTES_V1` 0× → `-pendientes.md` cambió; abortar reescritura.
- PENDIENTES-FINAL post: `MULTITENANT_PENDIENTES_FINAL_V1` ≠ 1 → revertir.
- Typecheck rojo por `worker.ts` → esperado. Cline anota en `_multitenant_pendientes.md` y **no commitea**. Se reintenta en Fase 9 o cuando Copilot commitee.
- `worker.ts` reparado por Copilot → anotar en `-pendientes.md` "worker.ts reparado, quitar warn-only del CI" y aplicar F05.9 completo (sin warn-only).
- `.github/workflows/ci.yml` con trailing whitespace → revertir y revisar indentación.
- `git diff --check` con problemas → revertir el fichero afectado.

**Todos los misses van a `C:\Users\Alfonso\Desktop\git hub repos\agente\docs\miniaudits\07-aislamiento-multi-tenant\missed\_multitenant_pendientes.md` con el formato del doc 01 §13. La IA no lo escribe.**

---

## 14. Checklist de cierre de la fase 8 (y de la Campaña 1)

- [ ] Paso 0.1–0.6 ejecutados, salidas anotadas.
- [ ] F05.3 aplicado (1 hunk, `CI_AUDITS_ENFORCED_V1` 1×).
- [ ] F05.5 aplicado (1 hunk, `CI_TYPECHECK_SERVER_V1` 1×).
- [ ] F05.9 aplicado (1 hunk, `CI_WORKER_TYPECHECK_WARN_V1` 1×).
- [ ] CIERRE-FINAL aplicado (`CIERRE_MVP_CAMPAIGN1_FINAL_V1` 1×).
- [ ] PENDIENTES-FINAL aplicado (`MULTITENANT_PENDIENTES_FINAL_V1` 1×, `MULTITENANT_PENDIENTES_V1` 0×).
- [ ] ID-MAP-FINAL aplicado (`ID_MAP_FINAL_V1` 1×).
- [ ] ESTADO-FINAL aplicado (`ESTADO_REAL_FINAL_V1` 1×).
- [ ] F02.10 sigue congelado.
- [ ] `worker.ts` sigue roto y sin tocar.
- [ ] Cline typecheck: verde o rojo solo por `worker.ts` (anotado).
- [ ] Cline test: verde o rojo solo por `worker.ts` (anotado).
- [ ] Cline probó `.github/workflows/ci.yml` en el PR.
- [ ] `git add` explícito de los 5 ficheros.
- [ ] `git commit -m "docs(multitenant): fase 8 — ..."`.
- [ ] `git push origin feat/multitenancy-campaign`.
- [ ] Confirmación al humano: "Fase 8 y Campaña 1 cerradas. Siguiente: Fase 9 (documento 10 — arranque Campaña 2, solo decisiones y plan, sin ejecución)."

---

## 15. Anexo — fragmentos literales de código real que se citan en esta fase

### A.1. `.github/workflows/ci.yml` — job `unit` completo (Repomix original, literal, sin cortes):

```yaml
  unit:
    name: unit (typecheck + test, no network)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: corepack enable
      - run: corepack pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm test
        env:
          ALLOW_NETWORK: "0"
      - name: audits
        run: |
          pnpm audit:layers
          pnpm audit:bridges
          pnpm audit:console
          pnpm audit:tenant-default
          pnpm audit:idempotency
          pnpm audit:contracts
        continue-on-error: true
```

**F05.3 quita `continue-on-error: true`. F05.5 añade `pnpm --filter @openmuse/server exec tsc --noEmit` (condicional al `package.json`).**

### A.2. `.github/workflows/ci.yml` — job `worker` completo (Repomix original, literal, sin cortes):

```yaml
  worker:
    name: worker (typecheck)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - working-directory: apps/worker
        run: npm ci
      - working-directory: apps/worker
        run: npm run typecheck
```

**F05.9 añade `continue-on-error: true` al job (warn-only por `worker.ts`).**

### A.3. `apps/server/src/engine/worker.ts` — sigue roto (Repomix original, literal, sin cortes):

```typescript
  get running() {
    return Boolean(this.timer);
  }

  /** WORKER_ACTIVE_SIZE_V1
  activeSize(): number {
    return this.active.size;
  }

  /** WORKER_MAX_ACTIVE_GET_V1
  getMaxActive(): number {
    return this.maxActive;
  }
  start = () => {
```

**Confirmado. F05.9 lo anota como warn-only hasta que Copilot lo repare.**

### A.4. `apps/server/src/engine/tenant.ts` — `setMembership` con `invalidateAll` (post-Fase 7, literal):

```typescript
  async setMembership(owner: string, tenantId: string): Promise<void> {
    await this.db.put(owner, MEMBERSHIP_KIND, {
      id: MEMBERSHIP_ID,
      tenantId,
      updatedAt: new Date().toISOString(),
    });
    this.cache.set(owner, { tenantId, at: Date.now() });
    // MEMBERSHIP_CACHE_INVALIDATE_V1 — invalidar TODA la caché tras un
    // cambio administrativo. Un admin puede estar moviendo un owner entre
    // tenants y otros owners pueden verse afectados si el admin también
    // reasigna sus memberships. Es más seguro invalidar todo que solo el
    // owner cambiado.
    this.invalidateAll();
    // MEMBERSHIP_CACHE_INVALIDATE_V1 — emitir evento al bus si está
    // disponible. El evento lo consumen audit y metrics (Fase 6 los cableó).
    if (this.bus) {
      try {
        await this.bus.emit("system", "tenant.membership.changed", { kind: "tenant", id: tenantId }, {
          owner,
          tenantId,
          changedAt: new Date().toISOString(),
        });
      } catch { /* best-effort */ }
    }
  }
```

**Confirmado. El evento al bus no se emite en Fase 7 (bus undefined), pero `invalidateAll` sí.**

### A.5. `apps/server/src/auth-routes.ts` — `POST /switch-tenant` (post-Fase 7, literal):

```typescript
  // SWITCH_TENANT_ENDPOINT_V1 — cambia el tenant activo del usuario.
  // Valida que el usuario tiene membership en el tenantId solicitado, y
  // devuelve un nuevo JWT con tenantId en el payload. El cliente debe
  // guardar el nuevo token y usarlo en futuras requests.
  // Si el usuario no tiene membership en el tenant, 403.
  app.post("/switch-tenant", async (c) => {
    const owner = c.get("owner");
    const body = z.object({ tenantId: z.string().min(1).max(100) }).parse(await c.req.json());
    const currentTenantId = await db
      .get<{ tenantId: string }>(owner, "tenant-membership", "default")
      .then((r) => r?.tenantId ?? null)
      .catch(() => null);
    if (currentTenantId === null) {
      throw new AppError("SWITCH_TENANT_ENDPOINT_V1: el usuario no tiene membership", 403);
    }
    if (body.tenantId !== currentTenantId) {
      throw new AppError(
        "SWITCH_TENANT_ENDPOINT_V1: el usuario no tiene membership en " + body.tenantId,
        403,
      );
    }
    const token = randomBytes(32).toString("base64url");
    await db.put("system", "sessions", {
      id: digest(token),
      owner,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      tenantId: body.tenantId,
    });
    return c.json({ ok: true, tenantId: body.tenantId, token });
  });
```

**Confirmado. Funciona en clone-por-cliente (devuelve 403 si el usuario no tiene membership). En shared, requiere multi-membership (Campaña 2).**

### A.6. `apps/server/src/admin-tenants.ts` — `DELETE` y `PATCH` (post-Fase 7, literal):

```typescript
  // ADMIN_TENANTS_CRUD_V1 — borra un tenant. Elimina membership y state.
  // No borra los records del tenant (tasks, files, etc.): esos los borra
  // un operador con un script dedicado (Fase 9 si hace falta).
  app.delete("/:tenantId", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    if (!/^[a-z0-9-]{1,64}$/.test(tenantId)) throw new AppError("tenantId invalido", 422);
    await service.db.remove("system", "tenant-membership", tenantId);
    await service.db.remove("system", "tenant-state", tenantId);
    const ts = (service as unknown as { tenantService?: { invalidateAll?: () => void } }).tenantService;
    ts?.invalidateAll?.();
    return c.json({ ok: true, tenantId, deleted: true });
  });

  // ADMIN_TENANTS_CRUD_V1 — actualiza displayName u otros campos editables.
  app.patch("/:tenantId", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    if (!/^[a-z0-9-]{1,64}$/.test(tenantId)) throw new AppError("tenantId invalido", 422);
    const body = z.object({ displayName: z.string().min(1).max(200).optional() }).parse(await c.req.json());
    if (body.displayName === undefined) {
      throw new AppError("Nada que actualizar (displayName)", 422);
    }
    const existing = await service.db.get<{ id: string; tenantId: string; displayName?: string; createdAt: string; createdBy: string }>(
      "system",
      "tenant-membership",
      tenantId,
    );
    if (!existing) throw new AppError("Tenant no encontrado", 404);
    await service.db.put("system", "tenant-membership", {
      ...existing,
      displayName: body.displayName,
      updatedAt: new Date().toISOString(),
    });
    return c.json({ ok: true, tenantId, displayName: body.displayName });
  });
```

**Confirmado. `DELETE` no borra datos del tenant. `delete-tenant-data.ts` va a Campaña 2.**

### A.7. `scripts/migrate-tenant-scope.ts` — transaccional (post-Fase 7, literal):

```typescript
    const rows = await db.select<{ owner: string }>(
      "SELECT DISTINCT owner FROM records WHERE owner NOT LIKE 'default:%' AND owner NOT LIKE '%:%'",
    );
    console.log(`Owners sin prefijo: ${rows.length}`);
    // MIGRATE_SCOPE_TX_V1 — transacción atómica.
    await db.transaction(async () => {
      for (const row of rows) {
        await db.select("UPDATE records SET owner = 'default:' || owner WHERE owner = $1", [row.owner]);
      }
    });
    console.log(`OK: ${rows.length} owners reescritos`);
```

**Confirmado. Si una fila falla, rollback.**

### A.8. `apps/server/src/kernel/tenancy/database-resolver.ts` — SQL esperado (Repomix original, literal, sin cortes, comentario):

```typescript
//   create table tenant_members (
//     user_id text not null,
//     tenant_id text not null,
//     role text not null default 'member',
//     is_default boolean not null default false,
//     created_at timestamptz not null default now(),
//     primary key (user_id, tenant_id)
//   );
//   create index on tenant_members (user_id);
//   alter table tenant_members enable row level security;
```

**Confirmado. F04.10b/c/d pospuestos a Campaña 2.**

### A.9. `apps/server/src/kernel/config/database-resolver.ts` — SQL esperado (Repomix original, literal, sin cortes, comentario):

```typescript
//   create table tenant_configs (
//     tenant_id text primary key,
//     fast_provider text not null,
//     fast_model text not null,
//     fast_api_key text not null,
//     slow_provider text not null,
//     slow_model text not null,
//     slow_api_key text not null,
//     embeddings_provider text,
//     embeddings_model text,
//     embeddings_api_key text,
//     capabilities jsonb not null default '{}'::jsonb,
//     quiescence_ms int not null default 10000,
//     fast_idle_ms int not null default 1000,
//     slow_long_ms int not null default 30000,
//     max_thoughts_per_turn int not null default 500,
//     updated_at timestamptz not null default now()
//   );
//   alter table tenant_configs enable row level security;
```

**Confirmado. F04.10d pospuesto a Campaña 2.**

### A.10. `apps/server/src/db.ts` — `db.transaction` (Repomix original, literal, sin cortes):

```typescript
  private inTransaction = false;
  async transaction<T>(fn: (tx: Store) => Promise<T>): Promise<T> {
    if (this.inTransaction) return fn(this);
    const raw = this.db as { query: (sql: string, params?: unknown[]) => Promise<unknown> };
    await raw.query("BEGIN");
    this.inTransaction = true;
    try {
      const result = await fn(this);
      await raw.query("COMMIT");
      return result;
    } catch (error) {
      try { await raw.query("ROLLBACK"); } catch { /* rollback best-effort */ }
      throw error;
    } finally {
      this.inTransaction = false;
    }
  }
```

**Confirmado. F04.11 lo usa.**

### A.11. `apps/server/src/engine/tenant.ts` — `DEFAULT_TENANT_ID` y `assertNotHardcodedTenantId` (Repomix original, literal, sin cortes):

```typescript
const DEFAULT_TENANT_ID = "default";
```

```typescript
export function assertNotHardcodedTenantId(value: string, where: string): void {
  if (value === DEFAULT_TENANT_ID) {
    throw new Error(
      `TENANT_ID_HARDCODED_V2: "${DEFAULT_TENANT_ID}" hardcodeado en ${where}. ` +
        "Usa TenantService.tenantIdFor(owner) en su lugar.",
    );
  }
}
```

**Confirmado. En Paso 0.6 se verifica que no quedan `"default"` fuera de `DEFAULT_TENANT_ID` y de los usos legítimos (UI, fallbacks).**

### A.12. `apps/server/src/index.ts` — `enableRls` y `RLS_REQUIRED_IN_SHARED_V1` (post-Fase 4, literal):

```typescript
// INDEX_ENABLE_RLS_V1 - RLS opcional (solo Postgres + MULTI_TENANT_SHARED=true).
// RLS_REQUIRED_IN_SHARED_V1 — si MULTI_TENANT_SHARED=true y el backend es
// postgres, enableRls DEBE devolver true. Si devuelve false (backend
// inesperado, falta de permisos, columna inexistente), abortamos el arranque:
// un deployment shared sin RLS es un deployment sin defensa en profundidad.
{
  const { enableRls } = await import("./db-rls.ts");
  const enabled = await enableRls(db);
  if (enabled) {
    console.log("[OpenMuse] RLS activo en records");
  } else if (process.env.MULTI_TENANT_SHARED === "true") {
    if (db.backend === "postgres") {
      throw new Error(
        "RLS_REQUIRED_IN_SHARED_V1: MULTI_TENANT_SHARED=true y backend postgres, pero enableRls devolvio false. Abortando arranque.",
      );
    } else {
      throw new Error(
        "RLS_REQUIRED_IN_SHARED_V1: MULTI_TENANT_SHARED=true requiere backend postgres; el backend actual es " + db.backend + ".",
      );
    }
  }
}
```

**Confirmado. En CI, Cline debe probar que con `MULTI_TENANT_SHARED=true` y backend `pglite` el arranque falla.**

### A.13. `apps/server/src/middleware/request-logger.ts` — `METRICS_TENANT_LABEL_V1` (post-Fase 6, literal):

```typescript
      // METRICS_TENANT_LABEL_V1 — tenantId del logContext (si lo hay) para
      // que los logs y las métricas HTTP lleven el label `tenant`.
      const tenantIdForLabels = logContext.getStore()?.tenantId;
      logInfo("http.request", { method, path, ...(tenantIdForLabels ? { tenantId: tenantIdForLabels } : {}) });
```

**Confirmado. En `GET /metrics?tenant=X` filtra por label `tenant`.**

---

## FIN DEL DOCUMENTO 09

**Fase 8 y cierre de la Campaña 1 preparados. 5 patchsets (~7 hunks), 5 ficheros tocados. **Solo `.github/workflows/ci.yml` es código; los otros 4 son documentación.** `CI_WORKER_TYPECHECK_WARN_V1` deja `worker.ts` como warn-only hasta que Copilot lo repare. F05.3 enforza audits. F05.5 añade tsc filtrado (condicional al `package.json`). Los 4 documentos (`CIERRE_MVP_CAMPAIGN1_FINAL_V1`, `MULTITENANT_PENDIENTES_FINAL_V1`, `ID_MAP_FINAL_V1`, `ESTADO_REAL_FINAL_V1`) cierran la trazabilidad de las 8 fases. F02.10 congelado. Typecheck/test pueden fallar por `worker.ts` (se anota y no se commitea hasta que Copilot lo repare). Commit + push al final. Anexo literal de 13 bloques de código real, sin resúmenes ni cortes. Se documentan las 36 marcas aplicadas, los 13+ bloqueados, las deudas de Fases 2–8 y los 5 disparadores de Campaña 2. La Campaña 1 queda documentalmente cerrada.**

**Siguiente (y último): documento 10 — Campaña 2 / Fase 0 — Arranque de la Campaña 2 (SaaS compartido SOC 2 Type II). Solo decisiones y plan, sin ejecución. Di "sigue".**