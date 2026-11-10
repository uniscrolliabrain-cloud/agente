# E19 · Render y Centro de Mando

**Etapa**: E19 de `ACME_CAMPAIGN_V1`
**Estado**: completada (sin captura de pantalla)
**Verificación**: `tsc --noEmit` 0 · `tests/analytics-overview.test.ts` 5 pass · `acme-queries` 28 · `workspaces-tenant` 5 · `auth-me-tenant` 2 · `tenant-acme-isolation` 6 · `vite build` OK · endpoint real contra `artifacts/demo/acme` en verde.

---

## 1. Endpoint nuevo: `GET /api/analytics/overview?range=7d|30d|90d`

`apps/server/src/routes/analytics.ts`, montado en `app.ts` junto a las rutas de integración con `db: tdb` (el `TenantScopedStore`).

- **Tenant**: `c.get("tenantId") ?? c.get("ctx")?.tenantId`; sin tenant → 403 `TENANT_REQUIRED`. El cliente no elige empresa.
- **Lectura**: `scanByPrefix(kind, tenantId, 2000)` para `tasks`, `projects`, `business-records`, `actions`, `notifications` y `agent-roles`. Mismo filtro SQL por prefijo que el resto del repo.
- **Agregados**: `openTasks` (queued/running/waiting_approval/waiting_input/paused/scheduled), `running`, `awaitingDecision`, `failed`, `done` (succeeded dentro del rango), `newToday` (24 h), `pendingActions` (awaiting_review + scheduled), `pendingAmountEur` (suma directa de `amountEur`, sin parsear textos), `leads`, `activeProjects`.
- **Filas**: devuelve las filas tal cual están guardadas. Nada de confianza calculada, ni insights inventados, ni mapeos por nombre.
- `range` inválido cae a `30d` sin romper.

## 2. Web

- `apps/web/src/api/analytics.ts`: tipos del DTO y `fetchAnalyticsOverview`.
- `hooks/useCentroMandoData.ts` (nuevo): en sesión real llama al endpoint; en sandbox delega en `hooks/useDemoCentroMandoData.ts` (el hook anterior, renombrado, sin cambios de comportamiento). Expone `loading` y `error`.
- `CentroMandoWorkspace.tsx`: se elimina el bloqueo "sin endpoint de analítica". Ahora hay estados de carga y de error explícitos; ya no se pinta nada de ejemplo en sesión real.
- Mapeo a los componentes del panel con los campos del dato:
  - clientes/oportunidades ← `leads` (`name`, `domain`, `status`, `nextStep`, `action`, `detail`, `amountEur`);
  - proyectos ← `projects` (`progressPct`, `checklistDone/Total`, `status`, `clientId` → nombre de cliente);
  - atención requerida ← `tasks` con estado `waiting_approval` / `waiting_input` / `failed` (badge y urgencia por estado, no por título);
  - acciones pendientes ← `actions` con `amountEur` formateado;
  - pipeline ← conteo por estado de lead (`riesgo`, `oportunidad`, `estable`, `ganado`);
  - insights ← notificaciones no leídas con su `cta` ya guardado;
  - **agentes**: lista vacía. `AgentMetric.confidence` es un dato que el seed no tiene; no se calcula una fórmula para rellenar el hueco (era exactamente lo que el panel hacía con el demo).

## 3. Vistas (21)

No requieren cambios: `WorkspaceShell` ya lista las `viewDefinitions` del módulo y ejecuta la vista elegida; desde E15/E17 la respuesta trae datos de ACME con `tenantId` correcto y specs válidos (E16). Esta etapa no toca el shell ni los templates.

## 4. Verificación contra el backend aislado real

`DATA_DIR=artifacts/demo/acme tsx artifacts/acme/verify-e19.ts` (script gitignored):

```
[acme] 200 · kpis={"openTasks":7,"running":2,"awaitingDecision":2,"failed":1,"done":2,
                    "newToday":10,"pendingActions":2,"pendingAmountEur":16900,
                    "leads":4,"activeProjects":2}
  tareas=10 proyectos=3 leads=4 clientes=3 acciones=4 avisos=3 agentes=4
  importe pendiente=16900 €

[default] 200 · todos los kpis a 0 y listas vacías
```

`16 900 €` = 12 600 (awaiting_review) + 4 300 (scheduled). La acción fallida (640 €) y la de resultado desconocido (780 €) **no** suman: no están esperando decisión. Los avisos son 3 de 4 porque uno está leído. Los agentes son 4 roles reales; la confianza no se pinta.

## 5. Lo que no se ha hecho

- **No hay captura de pantalla.** No se ha levantado el backend con `DATA_DIR=artifacts/demo/acme` + la web para mirar el panel y las 7 vistas en el navegador. El build compila y el endpoint devuelve los números, pero el render visual no está verificado.
- El panel de agentes sale vacío hasta que exista `AgentMetric` en el seed (dato, no fórmula).
- El "Centro de Mando" sigue mostrando etiquetas de la UI que no dependen del tenant (`Pipeline de Interfaz Studio` fue eliminado al dejar de usar el hook demo; si queda alguna cadena de "Interfaz" en pantalla será en el sandbox, no en sesión real).
