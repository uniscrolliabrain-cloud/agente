# Campaña UX · 10 de noviembre de 2026

> Documento único de la campaña. Recoge qué se hizo, por qué se decidió así, qué se
> verificó y qué no. Las evidencias por etapa viven en
> `docs/campaigns/acme-tenant/` (`E02…E19`, `RESULT.md`); este documento las ordena y
> las explica para que se pueda leer de una vez.

## 1. Ficha

| Campo | Valor |
|---|---|
| Nombre | **Campaña UX** (codename técnico `ACME_CAMPAIGN_V1`) |
| Fecha | 10 de noviembre de 2026 |
| Objetivo | Un tenant real, aislado y poblado para probar el camino completo de una vista: datos → query → envelope → endpoint → UI |
| Rama de trabajo | `feat/acme-tenant` |
| Baseline | `6b9b28c` (`docs(campaña): plan de 20 etapas para el tenant ACME`) |
| Commit de cierre | `05126b1` — 52 ficheros, +4979 / −361 |
| Push | `6b9b28c..05126b1` a `main` (fast-forward, sin force) |
| Etapas | E01 – E20 |
| Entorno | Node v26.13.0 · PGlite · Vite · Hono · pnpm 11.19.0 |

## 2. Resumen ejecutivo

El repo tenía 37 workspaces y un tenant `default`, pero ningún tenant con datos
reales que permitiese comprobar de punta a punta que una vista pintaba lo que el
store contenía. La campaña construye ese tenant (**ACME**, una constructora
sintética) **sin relajar ningún contrato** y **sin romper el aislamiento**:

- 3 módulos nuevos de workspace (`acme-obras`, `acme-clientes`,
  `acme-suministros`) con **21 vistas** y **21 queries** tenant-scoped.
- Un dataset sintético completo sembrado **sólo** bajo el prefijo `acme:` en
  `DATA_DIR=artifacts/demo/acme`.
- Dos endpoints nuevos: vista de workspace con tenant del contexto y
  `/api/analytics/overview`.
- El Centro de Mando de la web pasa de fixtures a datos del endpoint, con estados
  de carga y error; el sandbox de UI queda intacto.
- 8 suites nuevas, **72 pruebas**, todas en verde; suite completa **603 pruebas, 0
  fallos**.
- Gate **sin fallos nuevos** frente al baseline: siguen fallando exactamente los
  mismos dos steps y por los mismos motivos que antes de empezar.

El resultado práctico: entrar como Carlos en `acme` y ver sus obras, sus clientes,
sus facturas (27 450 € sembrados), sus pedidos y su panel con **16 900 €** de
importe pendiente de decisión, sin que `default` vea nada.

## 3. Punto de partida

`artifacts/acme/baseline.txt` (E01):

```
fecha: 2026-11-10T15:30:37Z
rama: feat/acme-tenant
commit: 6b9b28c96f3dcaa8882566aa91ddea7af4ece681
node: v26.13.0

## typecheck raiz   exit=0
## typecheck worker exit=0
## tests            exit=0
```

Ese baseline se capturó **antes** de tocar nada y es la referencia de todas las
comparaciones posteriores. El gate completo no estaba en el baseline, así que para
E20 se midió de verdad: worktree limpio en `6b9b28c` con `node_modules` enlazado y
los mismos audits.

## 4. Reglas que condicionaron todo

Estas reglas no son burocracia: cada una descartó un atajo que habría funcionado
hoy y roto el repo mañana.

| Regla | Qué impide | Cómo se respetó |
|---|---|---|
| No romper la lógica del repo para que “funcionen” las interfaces | Cambiar adapters, registry o schemas para que pinte | Los 34 módulos existentes no se tocaron; sólo 3 imports y 3 entradas en el catálogo |
| Aislamiento multi-tenant intacto | Resolver el tenant desde el owner, el body o el nombre | Tenant siempre de `ctx.tenantId`; sin tenant → 403 `TENANT_REQUIRED` |
| Datos sintéticos sólo en `acme`, backend aislado | Sembrar en `default` o en el store compartido | `DATA_DIR=artifacts/demo/acme`, prefijo `acme:` verificado en cada `put` |
| Nada de heurísticas ni derivaciones por texto | Deducir estado/urgencia/importe de un título o de un string | Filtros por campos reales (`status`, `type`, `read`, `amountEur`) |
| No relajar `views.ts` ni `view-envelope.ts` | Ampliar el envelope para que quepa el dato | Los 21 specs se validan tal cual con `parseRuntimeViewSpec` |
| No tocar `agntia-gestoria/` ni `agente-integration.patch` | Mezclar trabajo ajeno | Siguen sin trackear, también después del commit |
| Sin commit sin autorización | Cierre silencioso | Todo quedó sin commit hasta que se pidió expresamente |

## 5. Decisiones de arquitectura

Cinco decisiones explican el diseño. Se nombran con el identificador que usan los
documentos de etapa.

### H11 · El tenant no puede salir del `owner`

`apps/server/src/routes/workspaces.ts` hacía `c.get("tenantId") ?? owner`. `owner`
es un userId: cuando el middleware no dejaba `tenantId`, el `ViewEnvelope` salía
con un uuid en el campo `tenantId` y las queries leían un tenant inexistente.

Ahora:

```ts
const owner = c.get("owner");
const tenantId = c.get("tenantId") ?? c.get("ctx")?.tenantId;
if (!tenantId) return c.json({ error: "Sesion sin empresa resuelta", code: "TENANT_REQUIRED" }, 403);
```

`ctx.tenantId` es lo que `app.ts` deja resuelto para toda `/api/*` tras
`resolveTenantPrincipal` (JWT → tenant de sesión → membership). El cliente no
elige empresa y no se inventa una cuando falta.

### H18 · Un módulo con vistas propias no necesita tocar el registry

El registry daba a los 34 módulos históricos una única vista `table:"default"`
porque todos declaraban `VIEWS = []`. `withDefaultViews` respeta las vistas
declaradas, así que ACME declara las suyas y los 7 `kind` llegan al adapter sin
modificar registry, adapter ni schemas.

### H19 · Aislamiento por el mismo mecanismo que ya existía

La clave física del store es `${tenantId}:${owner}`. El tenant lo resuelve
`currentTenantScope()`, nunca el body. No hay ninguna rama
`if (tenant === "acme")` en el código: ACME está protegido por lo mismo que
protege al resto.

### H25 · Leer por tenant, no por owner

`WorkspaceStoreLike` sólo declara `list(owner, kind)`: devuelve lo que **ese**
owner escribió. Las 10 tareas de ACME son de Carlos, Marta, Javier y Sofía; leer
por owner daría un workspace distinto a cada compañero.

`packages/workspaces/src/runtime/tenant-rows.ts` detecta **estructuralmente** si
el store expone `scanByPrefix(kind, tenantId, limit)` —el patrón que ya usan
`engine/events/bus.ts` y `engine/leads.ts`— y lo usa con el tenant del contexto.
Si no lo expone (dobles de test), cae a `list(owner, kind)`, que sigue limitado
por la clave. Con `tenantId` vacío o con `:` no se consulta: se devuelve vacío
antes de tocar el store. No se añadió ningún método a `workspace-module.ts`.

### H23 / H24 · Nada que la UI no pueda ejecutar o justificar

- **H23**: el adapter sólo produce dos KPIs genéricos (“Elementos”, “Workspace”)
  aunque el schema admita seis. No se tocó el adapter: los importes se suman de
  `amountEur` en el endpoint de analítica y el dashboard sigue mostrando dos KPIs.
  Queda abierto.
- **H24**: las 21 vistas declaran `actions: []`. Con acciones vacías,
  `permissions.canAct` sale vacío y la UI no pinta botones que el runtime no sepa
  ejecutar. `commands` también está vacío a propósito.

## 6. Cronología de las 20 etapas

| Etapa | Qué se hizo | Evidencia |
|---|---|---|
| E01 | Baseline medido antes de tocar nada | `artifacts/acme/baseline.txt` |
| E02 | Auditoría del aislamiento existente (clave, scope, membership) | `E02-isolation.md` |
| E03 | Auditoría del camino de una vista (declaración → envelope → adapter → shell) | `E03-view-path.md` |
| E04 | Modelo explícito del dominio ACME con zod, aditivo y cerrado | `packages/domain/src/acme-dataset.ts` · 9 tests |
| E05 | Suite de aislamiento del tenant ACME (incluye el caso HTTP que luego cerró E17) | `tests/tenant-acme-isolation.test.ts` · 6 tests |
| E06 | Script de provisión del tenant (usuarios, memberships, roles) | `scripts/provision-acme-tenant.ts` |
| E07–E13 | Dataset sintético completo, idempotente, ejecutado 2× | `scripts/seed-acme.ts` · 998 líneas |
| E14 | 3 módulos de workspace con 7 vistas cada uno (21) | `E14-workspaces.md` · 12 tests |
| E15 | 21 queries tenant-scoped y lectura de equipo | `E15-queries.md` · 28 tests |
| E16 | Validación de los 21 specs reales contra el envelope | `E16-view-specs.md` · 5 tests |
| E17 | Endpoint de vista con tenant del contexto (cierra H11) | `E17-endpoint-tenant.md` · 5 tests |
| E18 | La sesión sabe en qué empresa está (`/api/auth/me`) | `E18-sesion-tenant.md` · 2 tests |
| E19 | Endpoint de analítica y Centro de Mando sin fixtures | `E19-centro-mando.md` · 5 tests |
| E20 | Verificación contra baseline, gate comparado e informe de cierre | `RESULT.md` |

## 7. Qué se construyó

### 7.1 Modelo de dominio: `packages/domain/src/acme-dataset.ts`

Cinco entidades con schemas cerrados y sin derivaciones:

| Schema | Campos que importan |
|---|---|
| `acmeLeadSchema` | `status` (`riesgo`/`oportunidad`/`estable`/`ganado`), `amountEur` numérico o `null` declarado, `nextStep` y `action` ya redactados |
| `acmeProjectSchema` | `status`, `ownerId`, `alert` (`null` = sin alerta), `blocks`, `linkedMemoryIds` |
| `acmeTicketSchema` | `taskId`, `clientId`, `urgency` (`alta`/`media`/`urgente`) |
| `acmeAgentMetricSchema` | `confidence` como **dato**, no como fórmula |
| `acmeTicketUrgencySchema` | tres niveles cerrados |

El fichero es aditivo: no importa ni modifica `views.ts` ni `view-envelope.ts`.
Sus 7 alias de tipo (`AcmeLead`, `AcmeProject`, `AcmeTicket`, estados y
`AcmeAgentMetric`) están declarados `PENDING(2026-11-30)` con motivo, porque los
schemas se usan pero las vistas aún no anotan sus filas; sin esa declaración el
audit de contratos los contaba como huérfanos nuevos.

### 7.2 Tenant y usuarios

`scripts/provision-acme-tenant.ts` crea la empresa y el equipo con
`UserService.create` (la fuente de verdad de los ids), membership cerrada y roles:

| Persona | Papel en el dataset |
|---|---|
| Carlos | admin de ACME; es el usuario con el que se prueba la UI |
| Marta | jefa de obra; su equipo ve las mismas 10 tareas que Carlos |
| Javier | comercial; leads y facturas |
| Sofía | administración; pedidos y avisos |

El owner de los datos es el UUID real de Carlos
(`2f8e8a03-2f20-4cab-965b-da55c35e7ee9`), no un id inventado: el dataset entra
por los mismos servicios que usaría una petición HTTP.

### 7.3 Dataset sembrado (E07–E13)

`DATA_DIR=artifacts/demo/acme node_modules/.bin/tsx scripts/seed-acme.ts`,
idempotente, ejecutado dos veces con exit 0:

| Entidad | Cantidad | Detalle |
|---|---|---|
| Usuarios | 4 | Carlos, Marta, Javier, Sofía |
| Agentes (roles) | 4 | con nombre, arquetipo y capacidades |
| Memorias | 10 | conocimiento de obra y cliente |
| Tareas | 10 | **8 estados distintos** (queued, running, waiting_approval, waiting_input, paused, scheduled, failed, succeeded) |
| Proyectos/obras | 3 | avance 78 %, 64 %, 42 %; checklist y bloques |
| Artefactos | 2 | partes de obra (`agent-artifacts`) |
| Leads | 4 | los cuatro estados comerciales, con importe |
| Clientes | 3 | cartera |
| Facturas | 4 | **27 450 €** en total |
| WhatsApp | 1 sesión (`acme-demo`) | 2 borradores + 2 mensajes de bandeja |
| Documentos | 4 | con **3 fuentes** `acme:src-*` y **6 chunks** |
| Acciones | 4 | awaiting_review 12 600 €, scheduled 4 300 €, failed 640 €, outcome_unknown 780 € |
| Notificaciones | 4 | una leída (por eso el panel cuenta 3) |

Cada `put` comprueba el prefijo `acme:` antes de escribir: si un id no lo lleva, el
seed falla en vez de contaminar `default`.

### 7.4 Tres módulos, 21 vistas

| Módulo | dashboard | board | queue | inbox | table | detail | form |
|---|---|---|---|---|---|---|---|
| `acme-obras` — “Obras y ejecución” | Resumen de obras | Tablero de obras | Tareas en curso | Incidencias abiertas | Partes de obra | Ficha de obra | Nuevo parte |
| `acme-clientes` — “Clientes y negocio” | Resumen comercial | Oportunidades | Facturas pendientes | Bandeja de clientes | Cartera de clientes | Ficha de cliente | Alta de cliente |
| `acme-suministros` — “Suministros y compras” | Resumen de compras | Pedidos por estado | Aprobaciones pendientes | Avisos de suministro | Documentos y fuentes | Ficha de suministro | Nuevo pedido |

Cada módulo son 6 ficheros: `index.ts`, `contract.ts` y
`application/{views,queries,commands,capabilities}.ts`. `contract.ts` declara
`status: "implemented"` (no `verified`: eso exige el camino HTTP real).

Guardas comprobadas por test: las 21 declaraciones pasan
`workspaceViewDeclarationSchema`; los 7 `kind` aparecen una vez por módulo; la
serialización no contiene `DATA_DIR`, `artifacts/`, `.agente` ni `owner`; ningún
`query` lleva prefijo de tenant; `publishes`/`consumes` vacíos.

### 7.5 Las 21 queries

Cada vista tiene su propia query, con filtros por campos reales:

| Vista | Fuente | Filtro |
|---|---|---|
| obras/resumen, obras/tablero | `projects` | — (columnas = `status`) |
| obras/tareas | `tasks` | — |
| obras/incidencias | `tasks` | `status === "waiting_input"` |
| obras/partes | `agent-artifacts` | — |
| obras/detalle | `projects` | `entityId` o primera fila |
| clientes/resumen | `business-records` | `type ∈ {client, lead, invoice}` |
| clientes/oportunidades | `business-records` | `type === "lead"` |
| clientes/facturas | `business-records` | `type === "invoice"` y `status !== "cobrada"` |
| clientes/bandeja | `whatsapp-inbox` | — |
| clientes/cartera | `business-records` | `type === "client"` |
| clientes/ficha | `business-records` | `entityId` o primer cliente |
| suministros/resumen, suministros/pedidos | `actions` | — (columnas = `status`) |
| suministros/aprobaciones | `actions` | `awaiting_review` o `scheduled` |
| suministros/avisos | `notifications` | — |
| suministros/documentos | `files` | — |
| suministros/ficha | `actions` | `entityId` o primera acción |
| los tres `form` | — | vista vacía válida (`fields: []`) |

Los estados no se inventan: el tablero sale `[active, paused]` y las acciones
`[awaiting_review, failed, outcome_unknown, scheduled]`, que es lo que hay.

### 7.6 Endpoints

**`POST /api/workspaces/<id>/view`** (y `/query`, `/command` del mismo router)

- tenant de `ctx.tenantId` (o `tenantId` ya resuelto por la ruta), nunca del body;
- sin tenant → `403 {"error":"Sesion sin empresa resuelta","code":"TENANT_REQUIRED"}`;
- respuesta `ViewEnvelope` validada: `tenantId` correcto, `id` tipo
  `acme-obras:tablero`, `freshness.generatedAt` ISO con offset,
  `provenance.ref = acme-obras/obras.tablero`.

**`GET /api/analytics/overview?range=7d|30d|90d`**

- lectura `scanByPrefix(kind, tenantId, 2000)` sobre `tasks`, `projects`,
  `business-records`, `actions`, `notifications`, `agent-roles`;
- agregados: `openTasks`, `running`, `awaitingDecision`, `failed`, `done`,
  `newToday`, `pendingActions`, `pendingAmountEur`, `leads`, `activeProjects`;
- devuelve las filas tal cual, sin confianza calculada ni insights inventados;
- `range` inválido cae a `30d` sin romper.

### 7.7 Web

| Fichero | Cambio |
|---|---|
| `apps/web/src/api/auth.ts` | `AuthUser` incluye `tenantId` |
| `apps/server/src/auth-routes.ts` | `/api/auth/me` devuelve `tenantId` |
| `apps/web/src/App.tsx` | `contextLabel` con la empresa de la sesión |
| `apps/web/src/components/SidebarV2.tsx` | aviso de empresa en la barra |
| `apps/web/src/api/analytics.ts` | tipos del DTO y `fetchAnalyticsOverview` |
| `hooks/useCentroMandoData.ts` | nuevo: sesión real → endpoint; sandbox → demo |
| `hooks/useDemoCentroMandoData.ts` | el hook anterior, `git mv`, sin cambios de comportamiento |
| `CentroMandoWorkspace.tsx` | estados de carga y error; sin fixtures en sesión real |

Mapeo del panel, siempre con campos del dato: oportunidades ← `leads`; proyectos ←
`projects` (avance y checklist); atención requerida ← tareas en `waiting_*`/`failed`
(badge por estado, no por título); acciones ← `actions` con `amountEur`; pipeline ←
conteo por estado de lead; insights ← notificaciones no leídas con su `cta`
guardado; **agentes vacío**, porque `AgentMetric.confidence` no existe en el seed y
no se calcula.

La etiqueta “Pipeline de Interfaz Studio” que estaba escrita a mano en el panel se
sustituyó por `Pipeline de {data.tenant}`. Verificado con `grep`: en sesión real no
queda ninguna cadena “Interfaz”.

## 8. Pruebas

Suite completa: **603 pruebas en 130 ficheros, exit 0, 0 fallos**.

Suites nuevas de la campaña:

| Fichero | Pruebas | Qué fija |
|---|---|---|
| `tests/acme-dataset.test.ts` | 9 | schemas cerrados, importes numéricos, fechas con offset |
| `tests/tenant-acme-isolation.test.ts` | 6 | prefijo `acme:` en cada escritura; `/api/agent` y `/api/threads` sin fugas; caso 5b del envelope con servidor real |
| `tests/acme-workspaces.test.ts` | 12 | 3 módulos, 21 vistas, 7 `kind`, declaraciones sin datos incrustados |
| `tests/acme-queries.test.ts` | 28 | 21 handlers con el número exacto de filas, `entityId`, tenant ajeno vacío, `acme-otro` no capturado, fallback sin `scanByPrefix` |
| `tests/acme-view-specs.test.ts` | 5 | los 21 specs reales pasan `parseRuntimeViewSpec` |
| `tests/workspaces-tenant.test.ts` | 5 | tenant de `ctx`, 403 sin tenant, 404 de vista inexistente, prioridad del tenant de ruta |
| `tests/auth-me-tenant.test.ts` | 2 | `/api/auth/me` con y sin `tenantId` |
| `tests/analytics-overview.test.ts` | 5 | KPIs por tenant, 403 sin tenant, `default` a cero, `range` inválido |
| **Total** | **72** | |

Ninguna suite existente se modificó para que pasara: los 34 módulos, el adapter, el
registry y el envelope siguen con sus tests originales.

## 9. Verificación contra el backend real

No sólo tests: los scripts de verificación (gitignored) leen el PGlite real de
`artifacts/demo/acme`.

Vistas (E15) — 21 de 21 con spec válido:

```
acme-obras       resumen 3 · tablero 3 · tareas 10 · incidencias 1 · partes 2 · detalle 1 · form 0
acme-clientes    resumen 11 · oportunidades 4 · facturas 2 · bandeja 2 · cartera 3 · detalle 1 · form 0
acme-suministros resumen 4 · pedidos 4 · aprobaciones 2 · avisos 4 · documentos 4 · detalle 1 · form 0
lectura de equipo: admin=10 marta=10 tareas
OK: 21 vistas con spec válido, lectura de equipo y 0 filas en default
```

Panel (E19):

```
[acme] 200 · kpis={openTasks:7, running:2, awaitingDecision:2, failed:1, done:2,
                  newToday:10, pendingActions:2, pendingAmountEur:16900,
                  leads:4, activeProjects:2}
        tareas=10 proyectos=3 leads=4 clientes=3 acciones=4 avisos=3 agentes=4
[default] 200 · todos los kpis a 0 y listas vacías
```

`16 900 €` = 12 600 (awaiting_review) + 4 300 (scheduled). La acción fallida (640) y
la de resultado desconocido (780) no suman porque no esperan decisión. Los avisos
son 3 de 4 porque uno está leído.

## 10. Gate y comparación con el baseline

`node_modules/.bin/tsx scripts/gate-report.ts` → **8/10 steps**, 86 s.

| Step | Baseline `6b9b28c` | Cierre |
|---|---|---|
| `typecheck` | OK | **OK** (9,9 s) |
| `typecheck:worker` | OK | **OK** (1,4 s) |
| `test` | OK | **OK** (66,7 s) |
| `audit:layers` | OK · 0 violaciones | **OK** · 0 |
| `audit:bridges` | FAIL · 12/16 wired | **FAIL · 12/16** (los mismos 4) |
| `audit:console` | OK | **OK** · 25 ocurrencias |
| `audit:anchors` | OK | **OK** |
| `audit:contracts` | FAIL · 6 huérfanos | **FAIL · los mismos 6** |
| `audit:idempotency` | OK | **OK** · 183 duplicadas, 0 huérfanas |
| `audit:tenant-default` | OK | **OK** · 158 permitidas, 0 prohibidas |

Cómo se obtuvo la columna del baseline, sin trampa: `git worktree add --detach
/tmp/e20-base 6b9b28c`, `node_modules` enlazado, y los mismos
`scripts/audits/{contracts,bridges}.ts` en ese árbol.

- **Contratos**: los 6 huérfanos preexistentes son `ActionSpec`, `ColumnSpec`,
  `DataSourceSpec`, `CognitionCardScope`, `CognitionCardStatus` y
  `ViewProvenance`. Los 7 alias de ACME aparecieron como nuevos durante la
  campaña y se declararon `PENDING(2026-11-30)` con motivo: el contador `PENDING`
  pasó de 2 a 9 y los huérfanos volvieron a 6.
- **Puentes**: faltan `bus-to-kernel`, `kernel-audit-consumer`,
  `kernel-metrics-consumer` y `kernel-notifications-consumer`, todos de
  `apps/server/src/kernel/subscribers/`, código que esta campaña no toca.

## 11. Cómo se garantiza el aislamiento

La cadena completa, de arriba abajo:

1. **JWT → tenant de sesión → membership.** `resolveTenantPrincipal` en `app.ts`
   deja `ctx.tenantId`. Si no hay empresa, no hay contexto.
2. **Endpoints.** El tenant se lee de `ctx` (o de una ruta que ya validó
   membership). Sin tenant: 403 `TENANT_REQUIRED`. Nunca del body ni del owner.
3. **Lectura.** `readTenantRows` usa `scanByPrefix(kind, tenantId, limit)`; rechaza
   `tenantId` vacío o con `:`. El store valida además el prefijo.
4. **Escritura.** Clave `${tenantId}:${owner}`; el seed comprueba `acme:` en cada
   `put` antes de escribir.
5. **Envelope.** `tenantId` del envelope es el del contexto; `provenance` apunta a
   `acme-obras/obras.tablero`.
6. **UI.** La etiqueta de empresa sale de `/api/auth/me`; el sandbox se reconoce por
   su token `demo:interfaz`, no por una cadena de texto.

Pruebas que lo sostienen: `tenant-acme-isolation` (6), `workspaces-tenant` (5),
`analytics-overview` (5) y las históricas `tenant-isolation`,
`tenant-isolation-extended`, `tenant-http-e2e`, `tenant-principal`,
`tenant-permissions`.

Verificado además a nivel HTTP con dos sesiones: `/api/threads` sin cruces,
`/api/agent` de ACME sin nada de `default`, `/api/workspaces/<id>/view` con filas
para ACME y vacío para otro tenant, y analítica con `default` a cero.

**Suspensión**: `tenant-permissions.test.ts` cubre
`POST /api/admin/tenants/<id>/suspend` → `GET /api/agent` responde 403
`{"error":"Empresa suspendida","code":"TENANT_SUSPENDED"}` → `resume` devuelve 200.
El mecanismo es común a todos los tenants; no se suspendió `acme` en el backend de
demo para no dejar el dataset inservible.

## 12. Sandbox de UI: se mantiene

`apps/web/src/demo` sigue existiendo, aislado y sin backend:

- sólo se activa con el token `demo:interfaz`; `apiFetch` corta antes de la red;
- sus datos viven en `useDemoCentroMandoData.ts`, el hook anterior renombrado sin
  cambios;
- en sesión real no se pinta ninguna cadena de la demo.

Retirarlo habría cambiado el comportamiento de la demo sin que la campaña lo
pidiera, y reutilizarlo habría sido exactamente el atajo que la campaña prohíbe.

## 13. Git

- Commit `05126b1` — `feat(acme): tenant sintético aislado con tres workspaces,
  panel y analítica`. 52 ficheros, +4979 / −361.
- Push fast-forward `6b9b28c..05126b1 → main`, verificado con un `fetch` posterior
  (`FETCH_HEAD = 05126b1`).
- Fuera del commit, a propósito: `agntia-gestoria/` y `agente-integration.patch`.
- `artifacts/` (baseline, logs de gate, scripts de verificación) es gitignored.

## 14. Lo que queda abierto

| Tema | Estado | Por qué |
|---|---|---|
| Revisión visual del panel y las 21 vistas | **No hecha** | No se abrió backend + web en navegador; compilan y los datos están verificados por HTTP, pero el render no se ha visto |
| Agentes del panel | Vacío a propósito | No hay `AgentMetric` en el seed y no se inventa confianza calculada |
| Formularios (`parte-nuevo`, `alta`, `pedido-nuevo`) | Sólo lectura | `commands` vacío; no hay alta de datos en el alcance E14–E19 |
| KPIs del dashboard (H23) | Abierto | El adapter produce 2 KPIs genéricos; el schema admite 6 |
| Catálogo global | Documentado | Los 37 módulos los ve cualquier tenant; uno sin datos ve las vistas vacías |
| Gate | 2 steps preexistentes | Contratos (6 huérfanos) y puentes (4 de kernel): ajenos a la campaña |
| Tests de contrato de los endpoints nuevos | Cubiertos por tests de ruta | No hay `audit:contracts` específico para las rutas nuevas |

## 15. Cómo reproducir

```bash
# comprobaciones
node_modules/.bin/tsc --noEmit
npm --prefix apps/worker run typecheck
node_modules/.bin/tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests
node_modules/.bin/tsx scripts/gate-report.ts

# tenant y dataset (aislados)
DATA_DIR=artifacts/demo/acme node_modules/.bin/tsx scripts/provision-acme-tenant.ts
DATA_DIR=artifacts/demo/acme node_modules/.bin/tsx scripts/seed-acme.ts
DATA_DIR=artifacts/demo/acme node_modules/.bin/tsx artifacts/acme/verify-e15.ts
DATA_DIR=artifacts/demo/acme node_modules/.bin/tsx artifacts/acme/verify-e19.ts

# web
CI=1 npx --yes pnpm@11.19.0 --filter @agente/web build
```

Sesión de prueba: `carlos@acme-obras.es` / `acme-demo-2026`.

## 16. Anexo · ficheros del commit

**Nuevos (44)**

```
apps/server/src/routes/analytics.ts
apps/web/src/api/analytics.ts
apps/web/src/workspaces/35-centro-mando/hooks/{useCentroMandoData.ts,useDemoCentroMandoData.ts}
docs/campaigns/acme-tenant/{E02-isolation,E03-view-path,E14-workspaces,E15-queries,
  E16-view-specs,E17-endpoint-tenant,E18-sesion-tenant,E19-centro-mando}.md
docs/campaigns/acme-tenant/RESULT.md
packages/domain/src/acme-dataset.ts
packages/workspaces/acme-obras/**            (6)
packages/workspaces/acme-clientes/**         (6)
packages/workspaces/acme-suministros/**      (6)
packages/workspaces/src/runtime/tenant-rows.ts
scripts/provision-acme-tenant.ts
scripts/seed-acme.ts
tests/{acme-dataset,acme-queries,acme-view-specs,acme-workspaces,analytics-overview,
  auth-me-tenant,tenant-acme-isolation,workspaces-tenant}.test.ts
```

**Modificados (8)**

```
apps/server/src/app.ts                  +3   monta /api/analytics en el bloque de integraciones
apps/server/src/auth-routes.ts          +7   tenantId en /api/auth/me
apps/server/src/routes/workspaces.ts   +19   tenant de ctx, 403 TENANT_REQUIRED
apps/web/src/App.tsx                    +8   contextLabel con la empresa
apps/web/src/api/auth.ts                +2   AuthUser.tenantId
apps/web/src/components/SidebarV2.tsx  +13   aviso de empresa
apps/web/.../CentroMandoWorkspace.tsx  +37   carga/error, sin fixtures
packages/workspaces/MANIFEST.yaml      +28   3 módulos y familias
packages/workspaces/src/index.ts        +6   3 imports + 3 entradas
```

## 17. Glosario

- **Tenant**: empresa; la unidad de aislamiento. `default` es el tenant histórico.
- **Owner**: userId dueño de una escritura. No es el tenant.
- **Store con scope**: store cuya clave física es `${tenantId}:${owner}`.
- **`scanByPrefix(kind, tenantId, limit)`**: lectura por prefijo de tenant.
- **Envelope / `ViewEnvelope`**: respuesta normalizada de una vista (`tenantId`,
  `id`, `spec`, `freshness`, `provenance`, `permissions`).
- **`kind`**: los 7 tipos de vista (`dashboard`, `board`, `queue`, `inbox`, `table`,
  `detail`, `form`).
- **Spec**: el envelope ya convertido a lo que pinta el shell
  (`parseRuntimeViewSpec`).
- **H11 / H18 / H19 / H23 / H24 / H25**: identificadores de las decisiones de este
  documento y de los `E*.md`.
