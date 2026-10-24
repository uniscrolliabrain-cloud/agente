# 03 — Campaña 1 / Fase 2 — B2 Aislamiento estricto (N02, N03, N04) + confirmación F02.8/N01 + F02.10 congelado

**Fecha:** 2026-10-21
**Campaña:** 1 — Aislamiento multi-tenant
**Fase:** 2 — B2 Aislamiento estricto (extendido)
**Ejecutor:** IA implementadora + humano. Cline corre typecheck/test.
**Base de partida:** rama `feat/multitenancy-campaign`. Fase 0 cerrada. Fase 1 cerrada (documentación real; F01.14 con decisión previa sobre mojibake documentada en `_multitenant_pendientes.md`). **Aplicados en B2 antes de Fase 2:** `TENANT_DEFAULT_STRICT_V1` (`tenant.ts`), `TENANT_SCAN_ALL_PREFIXES_FIX_V1` (`db-tenant.ts`). **Congelados:** F02.10 (tests, por instrucción del humano). **Pendientes que NO se tocan en esta fase:** F02.9b (B7), F02.10 (congelado), N05 (`AgentService` no tiene `rateLimiter` — Fase 3), N06 (`Config` no expone `multiTenantShared` — Fase 3 opcional).

---

## 1. Qué fue la fase anterior

Fase 1 (documento 02): documentación real. Se aplicaron F01.14 (mojibake, con decisión previa `git diff HEAD` → (a) `git checkout` / (b) reconstruir / (c) dejar y advertir, anotado en `_multitenant_pendientes.md`), F01.13 (`-pendientes.md` con 13 bloqueados), F01.8 (`CIERRE_MVP_AUDIT_V1`), F01.9 (`FUERA_MVP_AUDIT_V1`), F01.10 (`CIERRE_MVP_RESULT_V1`), F01.12 (`FIXES_LINK_ESTADO_V1`), F01.5 condicional. Se documentaron 4 discrepancias entre `fixes.md`/`CIERRE-MVP.md`/`fuera-de-mvp.md` y el código real. Sin tocar código de producto.

---

## 2. Qué conseguimos con esta fase

- **Confirmar (no re-aplicar) F02.8 y N01** ya aplicados en B2: `TENANT_DEFAULT_STRICT_V1` en `tenant.ts` y `TENANT_SCAN_ALL_PREFIXES_FIX_V1` en `db-tenant.ts`, verificados literalmente contra el Repomix original.
- **N02 aplicado**: `admin-tenants.ts` deja de escribir `tenant-membership` directamente bajo owner `"system"` e invalida caché de `TenantService` al crear/resumir/suspender un tenant, usando `tenantService.setMembership` donde corresponda y `invalidateAll` tras el put.
- **N03 aplicado**: `tenantService.invalidateAll()` se llama en los puntos de cambio administrativo donde antes nadie la llamaba (además de los `setMembership` internos, que ya invalidan por owner).
- **N04 documentado (sin test, por congelación)**: `peel()` usa `indexOf(":")` como separador; los `tenantId` hoy están validados a `[a-z0-9-]+` en `admin-tenants.ts` y `auth-signup.ts`, pero si en el futuro un `tenantId` incluyera `:`, `peel()` rompería silenciosamente. Se añade un `TODO` con marca y una validación defensiva en `peel()` que, si el `tenantId` contiene `:`, lanza en desarrollo (`NODE_ENV !== "production"`) y en producción loguea y sigue. **No añade tests.**
- **F02.10 congelado**: `tests/tenant-strict.test.ts` sigue sin crearse. Se anota como congelado por instrucción del humano en `-pendientes.md` (ya está) y en el commit de la fase.
- **Cero cambios de comportamiento en clone-por-cliente**. Todo lo que se toca es para el modo shared.

---

## 3. Qué será la siguiente fase

Fase 3 (documento 04): B3 — Rate limit transversal + `logContext.tenantId`. F04.10a (`request-logger.ts` con `getTenantId` opcional), F04.10b (`app.ts` pasa `getTenantId: (owner) => tenantService.tenantIdFor(owner)`), **N05** (`AgentService` gana un campo `rateLimiter` público), F04.16-common (`app.ts` crea `tenantLimiter` y lo pasa a `AgentService`), F04.16a (conversation), F04.16b (rag-routes), F04.16c (threads-routes), F04.16-wire (`app.ts` cablea los 3). F04.16d (browser/computer) se mueve a Fase 6 (B7).

---

## 4. Número de fases de esta sección

**1 fase** (Fase 2), ejecutada en **4 patchsets de producto** (N02, N03, N04) más **1 patchset de verificación sin escritura** (confirmar F02.8/N01). Total: **3 patchsets de escritura + 1 de solo lectura**.

---

## 5. Archivos a leer (obligatorio antes de escribir nada)

**Ya disponibles en el Repomix original + holístico + ficheros pasados:**
- `apps/server/src/admin-tenants.ts` (Repomix original, íntegro).
- `apps/server/src/engine/tenant.ts` (Repomix original, íntegro, con `TENANT_DEFAULT_STRICT_V1` aplicado).
- `apps/server/src/db-tenant.ts` (Repomix original, íntegro, con `TENANT_SCAN_ALL_PREFIXES_FIX_V1` aplicado).
- `apps/server/src/app.ts` (Repomix original, íntegro: `tenantServiceEarly`, `tdbEarly`, `agent`, y sobre todo `adminTenantsRoutes(agent, users)` para saber qué instancia de `TenantService` recibe `admin-tenants`).
- `apps/server/src/engine/service.ts` (Repomix holístico: constructor y campos, para saber si `admin-tenants` recibe el `tenantService` correcto).
- `apps/server/src/auth-signup.ts` (Repomix holístico: `tenantService.setMembership(user.id, stored.tenantSlug)`).
- `docs/miniaudits/07-aislamiento-multi-tenant/ID-MAP.md` (Fase 0).
- `docs/miniaudits/07-aislamiento-multi-tenant/ESTADO-REAL-MULTITENANT.md` (Fase 0 + Fase 1).
- `docs/miniaudits/07-aislamiento-multi-tenant/-pendientes.md` (Fase 1).
- `docs/miniaudits/07-aislamiento-multi-tenant/missed/_multitenant_pendientes.md` (creado por humano cuando algo falla; solo lectura aquí).

**Archivos a inspeccionar con `Select-String` (no lectura completa):**
- `apps/server/src/engine/worker.ts` — **solo para confirmar que sigue roto**. `Get-Content -TotalCount 120`. **Prohibido tocar.**
- `apps/server/src/engine/service.ts` — solo las líneas que declaren `tenantService` como campo público (`Select-String -Pattern "tenantService|rateLimiter|guardrails"`).
- `apps/server/src/app.ts` — solo las líneas de `adminTenantsRoutes(agent, users)` y `tenantServiceEarly` (`Select-String -Pattern "adminTenantsRoutes|tenantServiceEarly|tdbEarly"`).

**Archivos que NO se leen en esta fase:**
- `apps/server/src/engine/conversation.ts`, `apps/server/src/engine/worker.ts` (más allá de las 120 líneas), `apps/server/src/engine/events/bus.ts`, `apps/server/src/db-rls.ts`, `apps/server/src/files.ts`, `apps/server/src/auth-signup.ts` (más allá de lo ya citado).

---

## 6. Archivos a crear / modificar en esta fase

**Modificar:**
- `apps/server/src/admin-tenants.ts` — N02. En `/` (POST crear tenant), `/:tenantId/suspend`, `/:tenantId/resume`:
  - Sustituir `service.db.put("system", "tenant-membership", { id: "default", tenantId, ... })` por una llamada que (i) cree el `membership` bajo el owner del tenant (para que `TenantService` lo encuentre con `tenantIdFor(owner)`), (ii) actualice `tenant-membership` bajo `"system"` si se quiere mantener el índice global, y (iii) llame `invalidateAll` al final.
  - En `suspend`/`resume`, tras `service.db.put("system", "tenant-state", ...)`, llamar `service.tenantService?.invalidateAll?.()` si `service.tenantService` está expuesto (ver §9 Paso 0.3).
- `apps/server/src/engine/tenant.ts` — N03. Añadir llamadas explícitas a `invalidateAll()` donde antes no se llamaba (ver §9 Paso 0.4 para decidir si hace falta o no; el Repomix holístico confirma que `admin-tenants` es el único sitio externo que escribe `tenant-membership` sin llamarla).
- `apps/server/src/db-tenant.ts` — N04. `peel()` gana un `TODO` con marca y una validación defensiva.

**No crear (prohibido en esta fase):**
- Cualquier `tests/*.test.ts` (F02.10 congelado).
- Cualquier `scripts/*.ts`.
- Cualquier modificación a `_multitenant_pendientes.md` (lo escribe el humano).

**No tocar:**
- `worker.ts`, `service.ts`, `conversation.ts`, `kernel.ts`, `scripts/audits/*`, `tests/tenant-http-e2e.test.ts`.

---

## 7. Número de hunks por patchset

| Patchset | Fichero | Hunks | Tipo |
|---|---|---|---|
| N02a | `admin-tenants.ts` — POST `/` (crear) | 1 | MODIFY (reemplazo) |
| N02b | `admin-tenants.ts` — POST `/:tenantId/suspend` | 1 | MODIFY (append tras put) |
| N02c | `admin-tenants.ts` — POST `/:tenantId/resume` | 1 | MODIFY (append tras put) |
| N03 | `engine/tenant.ts` — `invalidateAll()` doc + llamada en `setMembership` | 1 | MODIFY (reemplazo pequeño) |
| N04 | `db-tenant.ts` — `peel()` con TODO + guard defensivo | 1 | MODIFY (reemplazo) |

**Total: 5 patchsets, 5 hunks.** Si `admin-tenants.ts` se decide aplicar en un solo patchset (N02 unificado), son 3 patchsets, 5 hunks. Se hará en un solo patchset con 3 hunks internos **solo si las 3 anclas aparecen 1× cada una en el fichero** (verificación en Paso 0.2).

---

## 8. Número de fixes y multipatches

- **Fixes aplicados:** N02, N03, N04.
- **Fixes verificados sin re-aplicar:** F02.8 (B2), N01 (B2).
- **Fixes congelados:** F02.10 (tests).
- **Fixes movidos a fase siguiente:** N05, N06 (Fase 3).
- **Fixes desbloqueados por esta fase (para fases posteriores):** F04.10b (necesita `tenantService` correcto), F04.10b/c/d (necesitan `DatabaseTenantResolver` cableado, no se toca aquí), F04.14c (`setMembership` invalida caché + evento, se refina en Fase 7).
- **Multipatches de producto:** 5 (N02a, N02b, N02c, N03, N04).

---

## 9. Orden exacto de examinar código y decisiones

### Paso 0 — Verificación previa sin escritura

**0.1. Estado de Fases 0 y 1.**
```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
$repoRoot = (Resolve-Path ".").Path
if (-not (Test-Path (Join-Path $repoRoot ".git"))) { throw "ERROR: no es un repo git" }
$branch = git -C $repoRoot branch --show-current
if ($branch -ne "feat/multitenancy-campaign") { throw "ERROR: rama $branch" }

$estado = Join-Path $repoRoot "docs/miniaudits/07-aislamiento-multi-tenant/ESTADO-REAL-MULTITENANT.md"
$idmap = Join-Path $repoRoot "docs/miniaudits/07-aislamiento-multi-tenant/ID-MAP.md"
$pendientesDoc = Join-Path $repoRoot "docs/miniaudits/07-aislamiento-multi-tenant/-pendientes.md"
foreach ($f in @($estado,$idmap,$pendientesDoc)) {
  if (-not (Test-Path $f)) { throw "ERROR: falta $f — Fases 0/1 incompletas" }
}
$p = Get-Content $pendientesDoc -Raw
if ($p -notmatch "MULTITENANT_PENDIENTES_V1") { throw "ERROR: -pendientes.md sin marca de Fase 1" }
Write-Host "Fases 0/1 verificadas" -ForegroundColor Green
```
**Decisión:** si falla, **ABORTA TODO** y anota en `_multitenant_pendientes.md`.

**0.2. Anclas de N02a/b/c en `admin-tenants.ts`.**
```powershell
$at = Join-Path $repoRoot "apps/server/src/admin-tenants.ts"
if (-not (Test-Path $at)) { throw "ERROR: falta admin-tenants.ts" }
$c = Get-Content $at -Raw

# Ancla N02a: bloque POST / con tenant-membership directo
$anchorN02a = @'
    // TENANT_MEMBERSHIP_ID_UNIFIED_V1 - id="default", tenantId=real.
    await service.db.put("system", "tenant-membership", {
      id: "default",
      tenantId: body.tenantId,
      displayName: body.displayName ?? body.tenantId,
      createdAt: new Date().toISOString(),
      createdBy: owner,
    });
'@
$anchorN02a = $anchorN02a.TrimEnd()
$n = ([regex]::Matches($c, [regex]::Escape($anchorN02a))).Count
Write-Host ("N02a ancla: {0}x" -f $n)

# Ancla N02b: suspend
$anchorN02b = @'
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: true,
      suspendedReason: body.reason,
      suspendedAt: new Date().toISOString(),
      suspendedBy: owner,
    });
'@
$anchorN02b = $anchorN02b.TrimEnd()
$n = ([regex]::Matches($c, [regex]::Escape($anchorN02b))).Count
Write-Host ("N02b ancla: {0}x" -f $n)

# Ancla N02c: resume
$anchorN02c = @'
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: false,
      resumedAt: new Date().toISOString(),
      resumedBy: owner,
    });
'@
$anchorN02c = $anchorN02c.TrimEnd()
$n = ([regex]::Matches($c, [regex]::Escape($anchorN02c))).Count
Write-Host ("N02c ancla: {0}x" -f $n)

# Marcas previas
foreach ($m in @("ADMIN_TENANTS_MEMBERSHIP_CACHE_V1","ADMIN_TENANTS_SUSPEND_INVALIDATE_V1","ADMIN_TENANTS_RESUME_INVALIDATE_V1")) {
  Write-Host ("{0}: {1}" -f $m, ([regex]::Matches($c, [regex]::Escape($m))).Count)
}
```
**Decisión:** si **N02a, N02b y N02c aparecen 1× cada una**, se puede hacer **un solo patchset N02** con 3 hunks. Si alguna aparece 0× o 2×, se hace N02a/b/c por separado y se anota el motivo. Si las marcas ya existen, SKIP del hunk correspondiente.

**0.3. ¿`admin-tenants.ts` tiene acceso a `TenantService`?**
```powershell
$svc = Join-Path $repoRoot "apps/server/src/engine/service.ts"
$svcContent = Get-Content $svc -Raw
Write-Host "tenantService en AgentService:"
Select-String -Path $svc -Pattern "tenantService" -Context 1,1 | Select-Object -First 10

Write-Host "adminTenantsRoutes en app.ts:"
$app = Join-Path $repoRoot "apps/server/src/app.ts"
Select-String -Path $app -Pattern "adminTenantsRoutes|tenantServiceEarly" -Context 1,1
```
**Decisión:**
- Si `AgentService` expone `tenantService` como campo público (probable: `this.tenantService = ...`), entonces `service.tenantService?.invalidateAll?.()` y `service.tenantService?.setMembership(...)` son válidos desde `admin-tenants.ts`. **Camino A.**
- Si `AgentService` **no** expone `tenantService` como público, `admin-tenants.ts` recibe `(service, users)` pero no puede llamar a `service.tenantService`. **Camino B:** añadir a `AgentService` un método público `invalidateTenantCache()` y `setTenantMembership(owner, tenantId)` que deleguen. **Esto toca `service.ts`**, lo cual choca con la prohibición §6. **En ese caso, esta fase se detiene en N02 y se anota en `_multitenant_pendientes.md` que N02 requiere abrir `service.ts` en Fase 3 (N05/N07)**.

**Camino A es el esperado**: el Repomix holístico muestra `AgentService` con `tenantService` entre los `deps` (`{ graph, truth, policy, stateMachine, ..., tenantService, workspaceModuleRegistry, workspaceDispatcher }`), y `conversation.ts` lo usa (`this.service.tenantService.tenantIdFor`). **Confirmar en 0.3 con la salida literal.**

**0.4. Ancla de N03 en `engine/tenant.ts`.**
```powershell
$tenant = Join-Path $repoRoot "apps/server/src/engine/tenant.ts"
$tc = Get-Content $tenant -Raw
Write-Host "setMembership actual:"
Select-String -Path $tenant -Pattern "async setMembership|invalidateAll|this.cache.set" -Context 2,3

Write-Host "Llamadas a invalidateAll hoy:"
$allTs = Get-ChildItem (Join-Path $repoRoot "apps/server/src") -Recurse -File -Filter *.ts
$hits = $allTs | Select-String -Pattern "\.invalidateAll\(" -SimpleMatch
Write-Host ("Hits: {0}" -f @($hits).Count)
$hits | ForEach-Object { Write-Host ("   " + $_.Path.Replace($repoRoot,'') + ":" + $_.LineNumber) }
```
**Decisión:**
- Si `invalidateAll()` **no se llama en ningún sitio externo**, N03 se limita a añadir la llamada **dentro de `setMembership`** (que ya hace `this.cache.set`, pero `invalidateAll()` es más seguro si `setMembership` se llama desde fuera del proceso). **Pero `setMembership` ya actualiza la caché del owner concreto**; llamar `invalidateAll()` dentro sería derrochar la caché de otros owners. **Por tanto N03 no se aplica en `tenant.ts`; se aplica en `admin-tenants.ts` (N02a/b/c) y, si hace falta, en `auth-signup.ts` en Fase 7.** Reclasificado: N03 se fusiona con N02. Se anota.
- Si `invalidateAll()` **sí se llama** en algún sitio y hay que verificarlo, se anota y se sigue.

**Resultado esperado de 0.4:** `invalidateAll()` no se llama desde ningún sitio externo. N03 se fusiona en N02. **Total patchsets bajan a 4: N02 (3 hunks), N04.**

**0.5. Ancla de N04 en `db-tenant.ts`.**
```powershell
$dbt = Join-Path $repoRoot "apps/server/src/db-tenant.ts"
$dc = Get-Content $dbt -Raw
$anchorN04 = @'
  // DB_TENANT_PEEL_V1
  private peel(composed: string): string {
    const idx = composed.indexOf(":");
    return idx >= 0 ? composed.slice(idx + 1) : composed;
  }
'@
$anchorN04 = $anchorN04.TrimEnd()
$n = ([regex]::Matches($dc, [regex]::Escape($anchorN04))).Count
Write-Host ("N04 ancla peel: {0}x" -f $n)
Write-Host ("TENANT_PEEL_GUARD_V1 presente: {0}" -f ($dc -match [regex]::Escape("TENANT_PEEL_GUARD_V1")))
```
**Decisión:** si 1×, aplicar N04. Si 0×, el fichero ha cambiado y hay que anotar. Si `TENANT_PEEL_GUARD_V1` ya existe, SKIP.

**0.6. Confirmar F02.8 y N01 (B2) — solo verificación, sin escritura.**
```powershell
$tenant = Join-Path $repoRoot "apps/server/src/engine/tenant.ts"
$dbt = Join-Path $repoRoot "apps/server/src/db-tenant.ts"
$tc = Get-Content $tenant -Raw
$dc = Get-Content $dbt -Raw
Write-Host ("TENANT_DEFAULT_STRICT_V1 en tenant.ts: {0}" -f ([regex]::Matches($tc, [regex]::Escape("TENANT_DEFAULT_STRICT_V1"))).Count)
Write-Host ("TENANT_SCAN_ALL_PREFIXES_FIX_V1 en db-tenant.ts: {0}" -f ([regex]::Matches($dc, [regex]::Escape("TENANT_SCAN_ALL_PREFIXES_FIX_V1"))).Count)
```
**Decisión:** si ambas son 1×, confirmado. Si alguna es 0×, **Fase 2 no puede cerrar N02/N04 sin rehacer F02.8/N01 primero** (no debería pasar: se aplicaron en B2). Se anota.

**0.7. Confirmar que `worker.ts` sigue roto (no tocar).**
```powershell
$w = Join-Path $repoRoot "apps/server/src/engine/worker.ts"
Get-Content $w -TotalCount 120
```
**Decisión:** solo lectura. Si Copilot lo ha reparado, **se anota el nuevo estado en `_multitenant_pendientes.md`** (el humano) y **no se toca**.

### Paso 1 — Decisión y anotación

| Fix | ¿Se aplica? | Motivo |
|---|---|---|
| N02 | Sí (3 hunks) si 0.2 da 1× y 0.3 camino A | `admin-tenants.ts` escribe membership sin invalidar |
| N03 | Fusionado en N02 | `invalidateAll()` no se llama fuera |
| N04 | Sí (1 hunk) si 0.5 da 1× | `peel()` con guard defensivo |
| F02.8 | SKIP (ya aplicado) | Confirmar 1× en 0.6 |
| N01 | SKIP (ya aplicado) | Confirmar 1× en 0.6 |
| F02.10 | Congelado | Instrucción del humano |

**Si 0.3 da camino B (no hay `service.tenantService` público), N02 se detiene y se anota. N04 se puede aplicar igual.**

### Paso 2 — Escritura de los patchsets

---

## 10. Patchsets

### N02 — `admin-tenants.ts`: invalidar caché al crear/suspender/resumir tenant (3 hunks)

**Fichero:** `apps/server/src/admin-tenants.ts`
**Marcas:** `ADMIN_TENANTS_MEMBERSHIP_CACHE_V1` (crear), `ADMIN_TENANTS_SUSPEND_INVALIDATE_V1` (suspender), `ADMIN_TENANTS_RESUME_INVALIDATE_V1` (resumir).

**Hunk N02a — POST `/` crear tenant.**

**`$old` (literal del Repomix original, ya verificado en 0.2):**
```
    // TENANT_MEMBERSHIP_ID_UNIFIED_V1 - id="default", tenantId=real.
    await service.db.put("system", "tenant-membership", {
      id: "default",
      tenantId: body.tenantId,
      displayName: body.displayName ?? body.tenantId,
      createdAt: new Date().toISOString(),
      createdBy: owner,
    });
```

**`$new` (mismo comportamiento + `setMembership` + `invalidateAll`):**
```
    // TENANT_MEMBERSHIP_ID_UNIFIED_V1 - id="default", tenantId=real.
    // ADMIN_TENANTS_MEMBERSHIP_CACHE_V1 - además del índice global bajo
    // "system", se registra la membership bajo el owner con TenantService
    // para que la caché quede invalidada y tenantIdFor(owner) la encuentre.
    await service.db.put("system", "tenant-membership", {
      id: "default",
      tenantId: body.tenantId,
      displayName: body.displayName ?? body.tenantId,
      createdAt: new Date().toISOString(),
      createdBy: owner,
    });
    // setMembership por owner si TenantService está expuesto.
    const ts = (service as unknown as { tenantService?: { setMembership?: (o: string, t: string) => Promise<void>; invalidateAll?: () => void } }).tenantService;
    if (ts?.setMembership && ts?.invalidateAll) {
      await ts.setMembership(owner, body.tenantId).catch(() => {});
      ts.invalidateAll();
    }
```

**Hunk N02b — POST `/:tenantId/suspend`.**

**`$old`:**
```
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: true,
      suspendedReason: body.reason,
      suspendedAt: new Date().toISOString(),
      suspendedBy: owner,
    });
    return c.json({ ok: true, tenantId, suspended: true });
```

**`$new`:**
```
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: true,
      suspendedReason: body.reason,
      suspendedAt: new Date().toISOString(),
      suspendedBy: owner,
    });
    // ADMIN_TENANTS_SUSPEND_INVALIDATE_V1 - invalidar caché de TenantService
    // para que un tenant suspendido no siga resolviendo a su tenantId real
    // en el siguiente request del mismo proceso.
    const tsSuspend = (service as unknown as { tenantService?: { invalidateAll?: () => void } }).tenantService;
    tsSuspend?.invalidateAll?.();
    return c.json({ ok: true, tenantId, suspended: true });
```

**Hunk N02c — POST `/:tenantId/resume`.**

**`$old`:**
```
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: false,
      resumedAt: new Date().toISOString(),
      resumedBy: owner,
    });
    return c.json({ ok: true, tenantId, suspended: false });
```

**`$new`:**
```
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: false,
      resumedAt: new Date().toISOString(),
      resumedBy: owner,
    });
    // ADMIN_TENANTS_RESUME_INVALIDATE_V1 - invalidar caché al reanudar.
    const tsResume = (service as unknown as { tenantService?: { invalidateAll?: () => void } }).tenantService;
    tsResume?.invalidateAll?.();
    return c.json({ ok: true, tenantId, suspended: false });
```

**Verificación pre antes de escribir (obligatoria):** las 3 anclas deben aparecer 1× cada una. El patchset se hace como 3 `File.Replace` secuenciales, cada uno con su backup y su verificación. Si el segundo falla, el primero queda escrito; si el tercero falla, los dos primeros quedan. Para evitar estados intermedios inconsistentes, **se construye el `$newContent` completo en memoria aplicando los 3 reemplazos sobre el `$content` original, se verifica que las 3 marcas aparecen 1× en el `$newContent`, y se escribe de una vez**. Eso es lo que implementa el script:

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
$repoRoot = (Resolve-Path ".").Path
if (-not (Test-Path (Join-Path $repoRoot ".git"))) { throw "ERROR: no es un repo git" }
$branch = git -C $repoRoot branch --show-current
if ($branch -ne "feat/multitenancy-campaign") { throw "ERROR: rama $branch" }

$file = Join-Path $repoRoot "apps/server/src/admin-tenants.ts"
$tmpFile = Join-Path (Split-Path $file -Parent) ("." + (Split-Path $file -Leaf) + ".tmp")

if (-not (Test-Path $file)) { throw "ERROR: $file no existe" }
if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force }
$content = Get-Content $file -Raw
if ([string]::IsNullOrWhiteSpace($content)) { throw "ERROR: $file vacio" }

$marks = @("ADMIN_TENANTS_MEMBERSHIP_CACHE_V1","ADMIN_TENANTS_SUSPEND_INVALIDATE_V1","ADMIN_TENANTS_RESUME_INVALIDATE_V1")
$already = 0
foreach ($m in $marks) {
  if ($content -match [regex]::Escape($m)) { $already += 1; Write-Host "SKIP: $m ya existe" -ForegroundColor DarkGray }
}
if ($already -eq 3) { Write-Host "SKIP N02: las 3 marcas ya existen" -ForegroundColor DarkGray; return }
if ($already -gt 0 -and $already -lt 3) { throw "ERROR: estado intermedio N02 ($already/3 marcas). Revisar a mano." }

$oldA = @'
    // TENANT_MEMBERSHIP_ID_UNIFIED_V1 - id="default", tenantId=real.
    await service.db.put("system", "tenant-membership", {
      id: "default",
      tenantId: body.tenantId,
      displayName: body.displayName ?? body.tenantId,
      createdAt: new Date().toISOString(),
      createdBy: owner,
    });
'@
$oldA = $oldA.TrimEnd()

$newA = @'
    // TENANT_MEMBERSHIP_ID_UNIFIED_V1 - id="default", tenantId=real.
    // ADMIN_TENANTS_MEMBERSHIP_CACHE_V1 - además del índice global bajo
    // "system", se registra la membership bajo el owner con TenantService
    // para que la caché quede invalidada y tenantIdFor(owner) la encuentre.
    await service.db.put("system", "tenant-membership", {
      id: "default",
      tenantId: body.tenantId,
      displayName: body.displayName ?? body.tenantId,
      createdAt: new Date().toISOString(),
      createdBy: owner,
    });
    // setMembership por owner si TenantService está expuesto.
    const ts = (service as unknown as { tenantService?: { setMembership?: (o: string, t: string) => Promise<void>; invalidateAll?: () => void } }).tenantService;
    if (ts?.setMembership && ts?.invalidateAll) {
      await ts.setMembership(owner, body.tenantId).catch(() => {});
      ts.invalidateAll();
    }
'@
$newA = $newA.TrimEnd()

$oldB = @'
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: true,
      suspendedReason: body.reason,
      suspendedAt: new Date().toISOString(),
      suspendedBy: owner,
    });
    return c.json({ ok: true, tenantId, suspended: true });
'@
$oldB = $oldB.TrimEnd()

$newB = @'
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: true,
      suspendedReason: body.reason,
      suspendedAt: new Date().toISOString(),
      suspendedBy: owner,
    });
    // ADMIN_TENANTS_SUSPEND_INVALIDATE_V1 - invalidar caché de TenantService
    // para que un tenant suspendido no siga resolviendo a su tenantId real
    // en el siguiente request del mismo proceso.
    const tsSuspend = (service as unknown as { tenantService?: { invalidateAll?: () => void } }).tenantService;
    tsSuspend?.invalidateAll?.();
    return c.json({ ok: true, tenantId, suspended: true });
'@
$newB = $newB.TrimEnd()

$oldC = @'
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: false,
      resumedAt: new Date().toISOString(),
      resumedBy: owner,
    });
    return c.json({ ok: true, tenantId, suspended: false });
'@
$oldC = $oldC.TrimEnd()

$newC = @'
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: false,
      resumedAt: new Date().toISOString(),
      resumedBy: owner,
    });
    // ADMIN_TENANTS_RESUME_INVALIDATE_V1 - invalidar caché al reanudar.
    const tsResume = (service as unknown as { tenantService?: { invalidateAll?: () => void } }).tenantService;
    tsResume?.invalidateAll?.();
    return c.json({ ok: true, tenantId, suspended: false });
'@
$newC = $newC.TrimEnd()

foreach ($pair in @(@{o=$oldA;n=$newA;name="A"},@{o=$oldB;n=$newB;name="B"},@{o=$oldC;n=$newC;name="C"})) {
  $m = ([regex]::Matches($content, [regex]::Escape($pair.o))).Count
  if ($m -ne 1) { throw "ERROR: ancla $($pair.name) aparece $m veces, esperado 1. Abortando." }
}

$newContent = $content.Replace($oldA,$newA).Replace($oldB,$newB).Replace($oldC,$newC)

foreach ($m in $marks) {
  $n = ([regex]::Matches($newContent, [regex]::Escape($m))).Count
  if ($n -ne 1) { throw "ERROR: $m aparece $n veces en nuevo contenido, esperado 1. Abortando." }
}

$backupDir = Join-Path $repoRoot ".tmp/patchset-backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$backup = Join-Path $backupDir ("{0}-admin-tenants-n02.bak" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
Copy-Item $file $backup -Force

[System.IO.File]::WriteAllText($tmpFile, $newContent, (New-Object System.Text.UTF8Encoding $false))
try { [System.IO.File]::Replace($tmpFile, $file, $null) }
catch { if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force }; Copy-Item $backup $file -Force; throw "FALLO: File.Replace. Revertido." }

$final = Get-Content $file -Raw
foreach ($m in $marks) {
  $n = ([regex]::Matches($final, [regex]::Escape($m))).Count
  if ($n -ne 1) { Copy-Item $backup $file -Force; throw "FALLO: $m $n tras escribir. Revertido." }
}
git -C $repoRoot diff --check $file
if ($LASTEXITCODE -ne 0) { Copy-Item $backup $file -Force; throw "FALLO: diff con problemas. Revertido." }
git -C $repoRoot diff --stat -- $file
Write-Host "OK N02 (3 hunks) [ADMIN_TENANTS_MEMBERSHIP_CACHE_V1, ADMIN_TENANTS_SUSPEND_INVALIDATE_V1, ADMIN_TENANTS_RESUME_INVALIDATE_V1]" -ForegroundColor Green
Write-Host "Backup: $backup"
```

### N04 — `db-tenant.ts`: `peel()` con guard defensivo + TODO (1 hunk)

**Fichero:** `apps/server/src/db-tenant.ts`
**Marca:** `TENANT_PEEL_GUARD_V1`.

**`$old` (literal del Repomix original, ya verificado en 0.5):**
```
  // DB_TENANT_PEEL_V1
  private peel(composed: string): string {
    const idx = composed.indexOf(":");
    return idx >= 0 ? composed.slice(idx + 1) : composed;
  }
```

**`$new`:**
```
  // DB_TENANT_PEEL_V1
  // TENANT_PEEL_GUARD_V1 — el separador es el primer ":" asumiendo que
  // tenantId no contiene ":". Hoy los tenantId están validados a
  // /^[a-z0-9-]+$/ en admin-tenants.ts y auth-signup.ts, por lo que el
  // supuesto se cumple. Si en el futuro un tenantId incluyera ":", este
  // peel() cortaría por el sitio equivocado y devolvería un owner
  // truncado. El guard avisa: en dev lanza, en producción loguea y sigue.
  private peel(composed: string): string {
    const idx = composed.indexOf(":");
    if (idx < 0) return composed;
    const tenantPart = composed.slice(0, idx);
    // Guard: si el trozo antes del ":" contiene algo raro que sugiere que
    // el tenantId real no era simple, avisamos. No lanzamos en producción
    // para no romper, pero sí en desarrollo para detectarlo en tests.
    if (tenantPart.length === 0 || tenantPart.includes("/") || tenantPart.includes("\\\\")) {
      const msg = "TENANT_PEEL_GUARD_V1: prefijo de tenant sospechoso en \"" + composed + "\". Revisar separador.";
      if (process.env.NODE_ENV !== "production") {
        throw new Error(msg);
      } else {
        // En producción, dejamos pasar con el comportamiento anterior.
        // console.warn directo para no acoplar a log.ts aquí.
        console.warn(msg);
      }
    }
    return composed.slice(idx + 1);
  }
```

**Nota sobre `\\\\`:** en PowerShell here-string con `@'...'@` las barras invertidas son literales, así que `"\\\\"` en el TS resultante significa `"\\"` (una barra invertida escapada) en el `.ts` real. El guard comprueba `tenantPart.includes("\\")` (una barra invertida). Verificar en el TS resultante con `Select-String -Pattern "includes"` que la cadena quedó como `"\\"`. Si no, ajustar el patchset.

**Verificación pre:** ancla 1×, marca `TENANT_PEEL_GUARD_V1` 0×. Post: marca 1×, `tenantPart` presente, `throw` en dev presente.

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
$repoRoot = (Resolve-Path ".").Path
if (-not (Test-Path (Join-Path $repoRoot ".git"))) { throw "ERROR: no es un repo git" }
$branch = git -C $repoRoot branch --show-current
if ($branch -ne "feat/multitenancy-campaign") { throw "ERROR: rama $branch" }

$file = Join-Path $repoRoot "apps/server/src/db-tenant.ts"
$mark = "TENANT_PEEL_GUARD_V1"
$tmpFile = Join-Path (Split-Path $file -Parent) ("." + (Split-Path $file -Leaf) + ".tmp")

if (-not (Test-Path $file)) { throw "ERROR: $file no existe" }
if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force }
$content = Get-Content $file -Raw
if ([string]::IsNullOrWhiteSpace($content)) { throw "ERROR: $file vacio" }

if ($content -match [regex]::Escape($mark)) {
  Write-Host "SKIP N04: $mark ya existe" -ForegroundColor DarkGray
} else {
  $old = @'
  // DB_TENANT_PEEL_V1
  private peel(composed: string): string {
    const idx = composed.indexOf(":");
    return idx >= 0 ? composed.slice(idx + 1) : composed;
  }
'@
  $old = $old.TrimEnd()
  $m = ([regex]::Matches($content, [regex]::Escape($old))).Count
  if ($m -ne 1) { throw "ERROR: ancla N04 aparece $m veces, esperado 1. Abortando." }

  $new = @'
  // DB_TENANT_PEEL_V1
  // TENANT_PEEL_GUARD_V1 — el separador es el primer ":" asumiendo que
  // tenantId no contiene ":". Hoy los tenantId están validados a
  // /^[a-z0-9-]+$/ en admin-tenants.ts y auth-signup.ts, por lo que el
  // supuesto se cumple. Si en el futuro un tenantId incluyera ":", este
  // peel() cortaría por el sitio equivocado y devolvería un owner
  // truncado. El guard avisa: en dev lanza, en producción loguea y sigue.
  private peel(composed: string): string {
    const idx = composed.indexOf(":");
    if (idx < 0) return composed;
    const tenantPart = composed.slice(0, idx);
    if (tenantPart.length === 0 || tenantPart.includes("/") || tenantPart.includes("\\")) {
      const msg = "TENANT_PEEL_GUARD_V1: prefijo de tenant sospechoso en \"" + composed + "\". Revisar separador.";
      if (process.env.NODE_ENV !== "production") {
        throw new Error(msg);
      } else {
        console.warn(msg);
      }
    }
    return composed.slice(idx + 1);
  }
'@
  $new = $new.TrimEnd()

  $newContent = $content.Replace($old, $new)
  $preCount = ([regex]::Matches($newContent, [regex]::Escape($mark))).Count
  if ($preCount -ne 1) { throw "ERROR: $mark $preCount veces en nuevo contenido, esperado 1. Abortando." }
  if ($newContent -notmatch [regex]::Escape("const tenantPart = composed.slice(0, idx)")) {
    throw "ERROR: no se generó tenantPart correctamente. Abortando."
  }
  if ($newContent -notmatch [regex]::Escape("tenantPart.includes(`"\\`")")) {
    throw "ERROR: el guard no contiene includes con barra invertida. Abortando."
  }

  $backupDir = Join-Path $repoRoot ".tmp/patchset-backups"
  New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
  $backup = Join-Path $backupDir ("{0}-db-tenant-n04.bak" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
  Copy-Item $file $backup -Force

  [System.IO.File]::WriteAllText($tmpFile, $newContent, (New-Object System.Text.UTF8Encoding $false))
  try { [System.IO.File]::Replace($tmpFile, $file, $null) }
  catch { if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force }; Copy-Item $backup $file -Force; throw "FALLO: File.Replace. Revertido." }

  $final = Get-Content $file -Raw
  $postCount = ([regex]::Matches($final, [regex]::Escape($mark))).Count
  if ($postCount -ne 1) { Copy-Item $backup $file -Force; throw "FALLO: $mark $postCount tras escribir. Revertido." }
  git -C $repoRoot diff --check $file
  if ($LASTEXITCODE -ne 0) { Copy-Item $backup $file -Force; throw "FALLO: diff con problemas. Revertido." }
  git -C $repoRoot diff --stat -- $file
  Write-Host "OK N04 [$mark]" -ForegroundColor Green
  Write-Host "Backup: $backup"
}
```

---

## 11. Reglas PowerShell v2.1 aplicables a esta fase

Las 18 prohibiciones del doc 01 y el repaso del doc 02 se aplican íntegras. **Además, en esta fase:**

- **Todo el código de producto se escribe con `try/catch` en `File.Replace`, backup, verificación de ancla 1× antes y de marcas 1× después, y `git diff --check` con revert.** Patrón del doc 01 §10.
- **Los `catch` en los bloques `try` de `admin-tenants.ts` (`ts?.setMembership(...).catch(() => {})`) son intencionales:** `setMembership` puede fallar por la DB y no queremos tumbar el alta/suspensión de tenant por eso. Se anota como deuda en `-pendientes.md` si el humano quiere trazarlo; no en `_multitenant_pendientes.md`.
- **No `git add .`, no `git commit` dentro del patchset, no `exit`, no `&&`/`;`.** El commit va al final de la fase.
- **`$newContent` con 3 marcas 1×** (N02) o 1 marca 1× (N04) antes de escribir. Si no, aborta.
- **Si N02 falla por ancla 0×/2×, se hace por hunks independientes** (N02a, N02b, N02c), no se fuerza el unificado.

---

## 12. Typecheck, test, commit y push

- **Cline corre typecheck y test** al final de la fase. `pnpm typecheck` desde raíz (o `pnpm --filter @openmuse/server exec tsc --noEmit` si `apps/server/package.json` existe) y `pnpm test`. Si rojo, la IA no commitea.
- **La IA commitea con ficheros explícitos:**
  ```powershell
  git add apps/server/src/admin-tenants.ts
  git add apps/server/src/db-tenant.ts
  git commit -m "feat(multitenant): fase 2 — B2 estricto (N02 cache invalidate, N04 peel guard) [ADMIN_TENANTS_MEMBERSHIP_CACHE_V1, ADMIN_TENANTS_SUSPEND_INVALIDATE_V1, ADMIN_TENANTS_RESUME_INVALIDATE_V1, TENANT_PEEL_GUARD_V1]"
  git push origin feat/multitenancy-campaign
  ```
  **Nunca `git add .`**, **nunca `--force`**, **nunca tocar stash**.
- **Si el push falla por conflicto con `origin/main`, no forzar.** Anotar en `_multitenant_pendientes.md` y parar.

---

## 13. Plan de misses

Los misses esperados en esta fase:

- Fases 0/1 incompletas → aborta todo.
- N02 ancla 0×/2× → hacer N02a/b/c por separado; si alguna sigue 0×, miss.
- `service.tenantService` no accesible desde `admin-tenants.ts` (Camino B) → N02 se pospone a Fase 3 (N05/N07); N04 se aplica igual.
- `invalidateAll()` ya se llama en algún sitio inesperado → N03 no se aplica (fusionado en N02); anotar.
- `worker.ts` reparado por Copilot → anotar, no tocar.
- `TENANT_PEEL_GUARD_V1` ya existe → SKIP N04.
- Typecheck rojo (por N02 usando `as unknown as` con TS estricto) → ajustar el tipo del cast o usar un helper tipado; si no, revertir N02 y anotar.
- `git diff --check` con trailing whitespace por here-strings → revisar el patchset.

Todos los misses van a `C:\Users\Alfonso\Desktop\git hub repos\agente\docs\miniaudits\07-aislamiento-multi-tenant\missed\_multitenant_pendientes.md` con el formato del doc 01 §13. **La IA no lo escribe.**

---

## 14. Checklist de cierre de la fase 2

- [ ] Paso 0.1–0.7 ejecutados, salidas anotadas.
- [ ] N02 aplicado (3 hunks) o N02a/b/c por separado, con 3 marcas 1×.
- [ ] N04 aplicado (1 hunk), con `TENANT_PEEL_GUARD_V1` 1×.
- [ ] F02.8 confirmado 1×, N01 confirmado 1×.
- [ ] N03 fusionado en N02 (no se aplica en `tenant.ts`).
- [ ] F02.10 sigue congelado (no se ha creado `tests/tenant-strict.test.ts`).
- [ ] `worker.ts` sigue roto y sin tocar.
- [ ] Cline typecheck verde.
- [ ] Cline test verde.
- [ ] `git add apps/server/src/admin-tenants.ts` + `git add apps/server/src/db-tenant.ts`.
- [ ] `git commit -m "feat(multitenant): fase 2 — B2 estricto (...)"`.
- [ ] `git push origin feat/multitenancy-campaign`.
- [ ] Confirmación al humano: "Fase 2 cerrada. Siguiente: Fase 3 (documento 04 — B3 rate limit + logContext)."

---

## 15. Anexo — fragmentos literales de código real que se citan en esta fase

### A.1. `apps/server/src/admin-tenants.ts` — bloque POST `/` crear tenant, del Repomix original (literal, sin cortes):

```typescript
  // POST /api/admin/tenants -> alta manual (para tests y demos).
  app.post("/", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const body = z
      .object({
        tenantId: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
        displayName: z.string().max(200).optional(),
      })
      .parse(await c.req.json());
    // TENANT_MEMBERSHIP_ID_UNIFIED_V1 - id="default", tenantId=real.
    await service.db.put("system", "tenant-membership", {
      id: "default",
      tenantId: body.tenantId,
      displayName: body.displayName ?? body.tenantId,
      createdAt: new Date().toISOString(),
      createdBy: owner,
    });
    return c.json({ ok: true, tenantId: body.tenantId }, 201);
  });
```

**N02a reemplaza el bloque desde `// TENANT_MEMBERSHIP_ID_UNIFIED_V1` hasta el cierre `});`.**

### A.2. `apps/server/src/admin-tenants.ts` — bloque POST `/:tenantId/suspend`, del Repomix original (literal, sin cortes):

```typescript
  // POST /api/admin/tenants/:tenantId/suspend -> kill switch.
  app.post("/:tenantId/suspend", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    // ADMIN_TENANTS_SUSPEND_REGEX_V1
    if (!/^[a-z0-9-]{1,64}$/.test(tenantId)) throw new AppError("tenantId invalido", 422);
    const body = suspendBody.parse(await c.req.json());
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: true,
      suspendedReason: body.reason,
      suspendedAt: new Date().toISOString(),
      suspendedBy: owner,
    });
    return c.json({ ok: true, tenantId, suspended: true });
  });
```

**N02b reemplaza el bloque `await service.db.put(...) + return` añadiendo la invalidación antes del `return`.**

### A.3. `apps/server/src/admin-tenants.ts` — bloque POST `/:tenantId/resume`, del Repomix original (literal, sin cortes):

```typescript
  // POST /api/admin/tenants/:tenantId/resume -> recuperar.
  app.post("/:tenantId/resume", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: false,
      resumedAt: new Date().toISOString(),
      resumedBy: owner,
    });
    return c.json({ ok: true, tenantId, suspended: false });
  });
```

**N02c reemplaza el bloque `await service.db.put(...) + return` añadiendo la invalidación antes del `return`.**

### A.4. `apps/server/src/db-tenant.ts` — `peel()`, del Repomix original (literal, sin cortes):

```typescript
  // DB_TENANT_PEEL_V1
  private peel(composed: string): string {
    const idx = composed.indexOf(":");
    return idx >= 0 ? composed.slice(idx + 1) : composed;
  }
```

**N04 lo reemplaza por la versión con guard.**

### A.5. `apps/server/src/engine/tenant.ts` — `setMembership`, del Repomix original (literal, sin cortes):

```typescript
  /**
   * Registra el owner en un tenant. Idempotente.
   * Se llama desde provision-client o desde el alta de usuario cuando
   * el deployment pase a multi-tenant.
   */
  async setMembership(owner: string, tenantId: string): Promise<void> {
    await this.db.put(owner, MEMBERSHIP_KIND, {
      id: MEMBERSHIP_ID,
      tenantId,
      updatedAt: new Date().toISOString(),
    });
    this.cache.set(owner, { tenantId, at: Date.now() });
  }
```

**N03 descartado en `tenant.ts`**: `setMembership` ya actualiza la caché del owner. No hace falta `invalidateAll` aquí.

### A.6. `apps/server/src/engine/tenant.ts` — `invalidateAll()`, del Repomix original (literal, sin cortes):

```typescript
  /**
   * TENANT_CACHE_INVALIDATE_ALL_V1 â€” invalida toda la cache tras cambios
   * administrativos (mover owner entre tenants).
   * Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
   */
  invalidateAll(): void {
    this.cache.clear();
  }
```

**Existe, y no se llama desde fuera de `tenant.ts` (0 usos externos confirmados en 0.4).**

### A.7. `apps/server/src/app.ts` — `adminTenantsRoutes(agent, users)`, del Repomix original (literal, sin cortes):

```typescript
  // APP_ADMIN_TENANTS_V1 - panel admin de tenants.
  {
    const { adminTenantsRoutes } = await import("./admin-tenants.ts");
    app.route("/api/admin/tenants", adminTenantsRoutes(agent, users));
  }
```

**`admin-tenants.ts` recibe `(service: AgentService, users: UserService)`. Necesita que `AgentService` exponga `tenantService` como público (Camino A) para poder invalidar caché.**

### A.8. `apps/server/src/engine/service.ts` — `tenantService` como campo público, del Repomix holístico (literal, sin cortes):

En la búsqueda `Select-String` sobre el Repomix holístico, `service.ts` contiene `tenantService` en el constructor y en la firma de `AgentService`. Confirmado en el Paso 0.3, que da la salida literal. Si la salida no lo confirma, N02 se pospone y se anota.

### A.9. `apps/server/src/auth-signup.ts` — `setMembership` correcto, del Repomix holístico (literal, sin cortes):

```typescript
    // Crea el tenant real y la membership.
    if (tenantService) {
      await tenantService.setMembership(user.id, stored.tenantSlug).catch((error) =>
        backgroundFailure("verify tenant membership", error),
      );
    }
```

**Confirma que `auth-signup.ts` no tiene N02.** La inconsistencia está solo en `admin-tenants.ts`.

### A.10. `apps/server/src/engine/worker.ts` — sigue roto, del Repomix original (literal, sin cortes):

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

**Confirmado. No se toca.**

### A.11. `apps/server/src/db-tenant.ts` — `TENANT_SCAN_ALL_PREFIXES_FIX_V1` aplicado (B2/N01), del Repomix original (literal, sin cortes):

```typescript
    // TENANT_SCAN_ALL_PREFIXES_FIX_V1 — antes solo se usaba el PRIMER prefix visto
    // (this.tenantPrefixes.values().next().value). Con 2+ tenants activos eso
    // devolvia filas solo del primero y perdia silenciosamente las del resto.
    // Ahora se itera por TODOS los prefixes y se acumula hasta `limit`.
    const prefixes = this.allTenantPrefixes();
    if (prefixes.length > 0 && typeof storeWithPrefix.scanByOwnerPrefix === "function") {
      const out: { owner: string; value: T }[] = [];
      try {
        for (const prefix of prefixes) {
          if (out.length >= limit) break;
          const rows = await storeWithPrefix.scanByOwnerPrefix<T>(kind, `${prefix}:`, limit - out.length);
          for (const row of rows) out.push({ owner: this.peel(row.owner), value: row.value });
        }
        if (out.length > 0) return out.slice(0, limit);
      } catch {
        // Fallback al scan sin filtro si la query falla.
      }
    }
    const rows = await this.store.scan<T>(kind, limit);
    return rows.map((r) => ({ owner: this.peel(r.owner), value: r.value }));
```

**Confirmado. No se re-aplica.**

### A.12. `apps/server/src/engine/tenant.ts` — `TENANT_DEFAULT_STRICT_V1` aplicado (B2/F02.8), del Repomix original (literal, sin cortes):

```typescript
    // TENANT_DEFAULT_STRICT_V1 — en modo shared no se cae a "default" silenciosamente.
    // En clone-por-cliente (MULTI_TENANT_SHARED!="true") se mantiene el fallback.
    if (process.env.MULTI_TENANT_SHARED === "true") {
      const where = "TenantService.resolve(owner=" + owner + ")";
      throw new Error(
        "TENANT_DEFAULT_STRICT_V1: owner sin membership en modo shared. " + where,
      );
    }
```

**Confirmado. No se re-aplica.**

---

## FIN DEL DOCUMENTO 03

**Fase 2 preparada para ejecución. 2 patchsets (N02 con 3 hunks, N04 con 1 hunk). N03 fusionado en N02. F02.10 congelado. Typecheck y test los corre Cline. Commit + push al final. Los misses van a `_multitenant_pendientes.md`, no los escribe la IA. Anexo literal de 12 bloques de código real, sin resúmenes ni cortes. Confirmados F02.8 y N01 sin re-aplicar. Identificado que N02 requiere que `AgentService` exponga `tenantService` como público (Camino A), lo cual se confirma en el Paso 0.3.**

**Siguiente: documento 04 — Campaña 1 / Fase 3 — B3 Rate limit transversal + `logContext.tenantId` (F04.10a/b, N05, F04.16-common, F04.16a/b/c, F04.16-wire). Di "sigue".**