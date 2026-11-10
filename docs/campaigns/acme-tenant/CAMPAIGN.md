# Campaña ACME · data sintética por el camino real

**Marca**: `ACME_CAMPAIGN_V1`
**Estado**: planificada, sin ejecutar. Este documento no cambia código.
**Objetivo**: que el tenant `acme` tenga datos sintéticos **en su backend aislado** y que esos datos recorran el camino real del repo (store tenant-scoped → servicio → HTTP → `ViewEnvelope` → renderer) hasta imprimirse en el workspace.

---

## 0. Reglas duras (no negociables)

| # | Regla |
|---|---|
| R1 | No se toca lógica de dominio, schemas, RLS ni resolución de tenant para que una interfaz "funcione". Si una vista no puede pintar, se arregla el dato o se deja la vista vacía. |
| R2 | No se rompe el aislamiento multi-tenant. Cada lectura/escritura de ACME va con su `tenantId` y su `owner`, y ninguna fila de ACME puede aparecer en `default` ni al revés. |
| R3 | La data sintética de ACME vive **solo** en el backend aislado de ACME: seed idempotente + `DATA_DIR` propio. Nunca en `apps/web/src/demo`, nunca en `system`, nunca en `default`. |
| R4 | El dato tiene que viajar por el camino del repo: seed → `TenantScopedStore` (`tenantId:owner`) → query handler del workspace → `ViewEnvelope` validado por Zod → `apiFetch` → renderer. |
| R5 | Cero heurísticas en las vistas: prohibido derivar estado, cliente, propietario o importe leyendo texto (`includes`, regex, `LEAD_META`, mapeos por nombre). El dato trae el campo explícito y tipado. |
| R6 | No se relajan contratos (`runtimeViewSpecSchema`, `viewEnvelopeSchema`) con `.optional()` ni campos nuevos "para que pase". Si falta un campo, se añade un schema aditivo en un fichero nuevo. |
| R7 | No se toca el tenant `default` ni los datos de ningún tenant existente. La campaña solo añade el tenant `acme`. |
| R8 | El token `demo:interfaz` del sandbox de UI no sirve como evidencia de ACME: ACME se prueba con sesión real (login + membership). |
| R9 | Antes de cada etapa: gate verde y baseline de fallos preexistentes. Después de cada etapa: typecheck + tests de aislamiento. |
| R10 | Cada etapa es reversible por sí sola y deja marca `<MARCA>_V1` en el código que toca. |
| R11 | Nada de commit, push ni despliegue sin autorización explícita. |
| R12 | Si una etapa no puede cumplir su criterio de aceptación, se para la campaña. No se salta con un parche. |

---

## 1. Auditoría previa (verificada en el árbol)

### 1.1 Piezas reales del camino

| Capa | Fichero | Qué hace |
|---|---|---|
| Resolución de tenant | `apps/server/src/engine/tenant.ts` | `TenantService.resolveStrict(owner)` lee `tenant-membership` y `user-tenants`; `DEFAULT_TENANT_ID = "default"` solo aquí; cache TTL |
| Principal único | `apps/server/src/tenant-principal.ts` | Un punto resuelve tenant + actor + membership; 403 `NO_MEMBERSHIP`/`TENANT_MISMATCH`, 503 `DB_UNAVAILABLE`; `TENANT_QUERY_GUARD_V1` |
| Scope por petición | `apps/server/src/tenant-scope.ts` | `AsyncLocalStorage` con `{ tenantId, actorId }` |
| Store aislado | `apps/server/src/db-tenant.ts` | Clave `${tenantId}:${owner}`; `scanByPrefix`; `peel` |
| RLS | `apps/server/src/db-rls.ts` | `withTenantRls` + `set_config` cuando `MULTI_TENANT_SHARED=true` |
| Registro de tenants | `apps/server/src/admin-tenants.ts` | Lista desde `system/tenant-membership`; kill switch en `system/tenant-state` |
| Rutas de workspace | `apps/server/src/routes/workspaces.ts` | `GET /`, `GET /:id`, `POST /:id/view`, `POST /:id/command`; monta en `app.ts:854` |
| Adaptador de vista | `apps/server/src/engine/views/workspace-adapter.ts` | Convierte `QueryResult` en `ViewEnvelope` con `tenantId`, `workspaceId`, provenance y freshness |
| Contrato de vista | `packages/domain/src/view-envelope.ts` + `views.ts` | `viewEnvelopeSchema` exige `tenantId`, `spec`, `freshness` ISO con offset, `permissions`, `source` |
| Catálogo | `packages/workspaces/src/index.ts` | 34 módulos `WorkspaceModule` exportados a `ALL_WORKSPACES` |
| Contrato de módulo | `packages/workspaces/src/contracts/workspace-module.ts` | Manifest, vistas, queries, commands, `WorkspaceServices { db, bus }` |
| Cliente web | `apps/web/src/api/workspaces.ts` | `getWorkspaceView` hace `POST {viewId}` y devuelve `view` |
| Renderer | `apps/web/src/workspaces/WorkspaceShell.tsx` + `templates/*` | Pinta el `ViewEnvelope` según `kind` |
| Seed existente | `scripts/seed-demo.ts` | Owner `demo`, idempotente, PGlite; roles, tareas, aprobaciones, business records |
| Backend demo aislado | `apps/server/src/demo/entry.ts` | API en `8788`, `DATA_DIR=artifacts/demo/api`, modelo aimock, cwd limpio |
| Tests de aislamiento | `tests/tenant-isolation.test.ts`, `tenant-isolation-extended.test.ts`, `tenant-principal.test.ts`, `tenant-permissions.test.ts`, `tenant-worker-claim.test.ts`, `tenant-cache.test.ts`, `tenant-migration.test.ts`, `tenant-http-e2e.test.ts` | Cobertura existente; ninguno cubre `acme` |

### 1.2 Hallazgos que condicionan la campaña

| # | Hallazgo | Impacto | Etapa que lo cierra |
|---|---|---|---|
| H1 | `routes/workspaces.ts` usa `tenantId = c.get("tenantId") ?? owner`: si el middleware no fija `tenantId`, el owner se convierte en tenant | Puede servir datos con scope equivocado | E16 |
| H2 | El `ViewEnvelope` toma `tenantId` del contexto y el adaptador lo copia | Correcto, pero hay que probar que nunca se fabrica | E17 |
| H3 | El tenant `acme` no existe como dato: solo aparece como texto en copias y fixtures | No hay nada que aislar todavía | E06 |
| H4 | `apps/web/src/demo/*` intercepta `apiFetch` con el token `demo:interfaz` y sirve fixtures en el navegador | Evidencia inválida para ACME; se queda como sandbox de UI | E01, E20 |
| H5 | Centro de Mando deriva métricas de fixtures con heurísticas de texto | Viola R5; hoy no prueba nada del backend | E19 |
| H6 | `scripts/seed-demo.ts` escribe con owner `demo`; en modo shared el tenant sale de la membership | Un seed copiado a ACME podría caer en `default` | E07–E13 |
| H7 | El README declara ~165 tests fallando de forma preexistente | Sin baseline no se distingue regresión | E01, E20 |
| H8 | Los `viewSpecs` del demo de UI son de Interfaz | No se reutilizan para ACME | E15 |
| H9 | `views.ts` tiene `.default("default")` en `action.kind` | Es legítimo; no se "arregla" | — |
| H10 | No existe ningún test con tenant `acme` | El aislamiento de ACME está sin probar | E05 |

### 1.3 Estado del árbol ahora mismo

- HEAD `b37b67d`. 40+ ficheros modificados sin commit del trabajo de UX v2 y del sandbox `apps/web/src/demo/` (token `demo:interfaz`), más `AgentsView.tsx` y `BarList`/`PendingActionsList` sin trackear.
- El plan anterior de "dos tenants en el frontend con derivaciones" **no dejó código**: no existen `DEMO_TENANTS`, `getDemoStore` ni `fixtures-acme` en el árbol.
- **Decisión bloqueante para E01**: esta campaña no arranca con 40 ficheros mezclados. El humano elige una de estas dos:
  - (a) commit del trabajo de UX actual en `main` y campaña en rama `feat/acme-tenant`;
  - (b) rama `feat/acme-tenant` desde `b37b67d` con el trabajo de UX en `git stash` y recuperado al cerrar.

---

## 2. Diseño del tenant ACME

| Campo | Valor |
|---|---|
| `tenantId` | `acme` (regex de admin: `^[a-z0-9-]{1,64}$`) |
| `displayName` | `ACME Obras y Reformas` |
| Owner admin | `acme-admin` · `carlos@acme-obras.es` |
| Membership | fila en `tenant-membership` (id `default`) + fila en `user-tenants` |
| Usuarios | `acme-admin` (Carlos Ruiz, admin), `acme-marta` (Marta Soler, comercial), `acme-javier` (Javier Gil, jefe de obra), `acme-sofia` (Sofía Navarro, administración) |
| `DATA_DIR` | `artifacts/demo/acme` (nunca `.agente` ni el de otro tenant) |
| Workspaces | `acme-clientes`, `acme-obras`, `acme-suministros` (módulos nuevos, datos por tenant) |
| Dominio | Constructora: obras, presupuestos, material, facturación, soporte post-obra |

### 2.1 Modelo explícito (nada de heurísticas)

Toda entidad que una vista necesite pintar trae el campo ya resuelto:

```
Lead         { id, name, domain, status: 'riesgo'|'oportunidad'|'estable'|'ganado',
               amountEur: number|null, nextStep, action, detail, updatedAt }
Project      { id, name, status: 'active'|'paused'|'closed', ownerId,
               alert, blocks[], linkedMemoryIds[] }
AgentTask    { id, title, status, kind, assignedTo, state.ownerId, clientId?, amountEur? }
ActionProposal { id, title, kind, status, amountEur?: number, clientId? }
Ticket       { id, taskId, ownerId, clientId, label, urgency: 'alta'|'media'|'urgente' }
AgentMetric  { agentId, confidence: number, openTasks: number }   // dato, no fórmula
```

Regla: si un valor no está en el dato, la vista lo muestra como ausente. **No se calcula por texto.**

---

## 3. Camino canónico que debe cumplirse

```
scripts/seed-acme.ts
  └─ TenantScopedStore.put("acme:<owner>", kind, value)      [clave con prefijo]
       └─ WorkspaceQueryHandler.handle(services.db, ctx, envelope)
            └─ dispatcher.dispatchQuery(module, ctx, envelope)
                 └─ adaptWorkspaceView() → ViewEnvelope(tenantId:"acme")
                      └─ POST /api/workspaces/acme-obras/view  (Bearer sesión ACME)
                           └─ apiFetch → getWorkspaceView()
                                └─ WorkspaceShell → template por `kind`
                                     └─ pantalla con datos de ACME
```

Condiciones de contorno:
- Ningún paso puede leer `apps/web/src/demo/*`.
- Ningún handler puede recibir `owner`/`tenantId` del body: salen de `WorkspaceContext`.
- El `ViewEnvelope` sale de `adaptWorkspaceView`, no se construye a mano en la ruta.

---

## 4. Las 20 etapas

Resumen:

| # | Etapa | Bloquea a |
|---|---|---|
| E01 | Línea base congelada | todas |
| E02 | Auditoría de aislamiento | E05 |
| E03 | Auditoría del camino de vistas | E13–E17 |
| E04 | Contrato de datos explícitos | E07–E13, E19 |
| E05 | Tests de aislamiento ACME (fallan primero) | E06 |
| E06 | Alta canónica del tenant `acme` | E07 |
| E07 | Seed identidad, equipo, agentes y memorias | E08 |
| E08 | Seed tareas con estado, owner y cliente explícitos | E14 |
| E09 | Seed proyectos, memorias de proyecto y artefactos | E14 |
| E10 | Seed negocio: leads, clientes, facturas | E19 |
| E11 | Seed comunicaciones: WhatsApp | E14 |
| E12 | Seed conocimiento: documentos y RAG | E15 |
| E13 | Seed acciones, aprobaciones y notificaciones | E19 |
| E14 | Módulos de workspace ACME (manifiestos y declaraciones) | E15 |
| E15 | Query handlers tenant-scoped | E16 |
| E16 | Vistas ACME validadas contra `runtimeViewSpecSchema` | E17 |
| E17 | Endpoint `/api/workspaces` con `ViewEnvelope` correcto | E18 |
| E18 | Sesión real de ACME en la web | E19 |
| E19 | Render de las 7 vistas y Centro de Mando sobre endpoint real | E20 |
| E20 | Cierre: gate, doble sesión cruzada, handoff y decisión sobre el sandbox | — |

---

### E01 · Línea base congelada

- **Objetivo**: partir de un árbol conocido, con el trabajo de UX a salvo.
- **Acciones**: decidir (a) o (b) de §1.3; `git status` limpio; capturar baseline de tests y typecheck en `artifacts/acme/baseline.txt`.
- **Comandos**: `pnpm typecheck`; `pnpm test -- tests/tenant-isolation.test.ts tests/tenant-principal.test.ts`; `pnpm gate` (guardar salida tal cual, incluidos fallos preexistentes).
- **Guardas**: no tocar `apps/web/src/demo/*`; no borrar artefactos de auditorías previas.
- **Aceptación**: árbol limpio, baseline guardado, lista de fallos preexistentes firmada en el doc.
- **Rollback**: n/a (no hay cambios).

### E02 · Auditoría de aislamiento

- **Objetivo**: dejar por escrito cómo se resuelve el tenant y dónde podría filtrarse.
- **Ficheros a leer**: `engine/tenant.ts`, `tenant-principal.ts`, `tenant-scope.ts`, `db-tenant.ts`, `db-rls.ts`, `admin-tenants.ts`, `app.ts` (middleware de tenant).
- **Entregable**: tabla owner→tenant, códigos de error, y lista de puntos donde el tenant viene del cliente (`X-Tenant-Id`, body, query).
- **Aceptación**: cada punto marcado como seguro o con etapa que lo cubre (H1 → E17).
- **Rollback**: n/a.

### E03 · Auditoría del camino de vistas

- **Objetivo**: fijar el contrato exacto de `POST /:id/view` y del `ViewEnvelope`.
- **Ficheros**: `routes/workspaces.ts`, `engine/views/workspace-adapter.ts`, `packages/domain/src/view-envelope.ts`, `packages/domain/src/views.ts`, `apps/web/src/api/workspaces.ts`, `WorkspaceShell.tsx`.
- **Entregable**: diagrama de §3 validado contra código, con los campos obligatorios del envelope y qué template pinta cada `kind`.
- **Aceptación**: se sabe qué vista produce qué spec y qué renderer la consume, sin suposiciones.
- **Rollback**: n/a.

### E04 · Contrato de datos explícitos

- **Objetivo**: fijar el modelo de §2.1 antes de sembrar nada.
- **Ficheros**: nuevo `packages/domain/src/acme-dataset.ts` (schemas Zod aditivos: `acmeLeadSchema`, `acmeProjectSchema`, `acmeTicketSchema`, `acmeAgentMetricSchema`).
- **Guardas**: no modificar `views.ts` ni `view-envelope.ts`; los enums son cerrados.
- **Aceptación**: `tsc` verde y un test unitario que rechaza un lead sin `status` o con importe string.
- **Rollback**: borrar el fichero nuevo y su test.

### E05 · Tests de aislamiento ACME (fallan primero)

- **Objetivo**: TDD del aislamiento antes de crear el tenant.
- **Ficheros**: nuevo `tests/tenant-acme-isolation.test.ts`.
- **Casos mínimos**:
  1. `acme` sin membership → 403 `NO_MEMBERSHIP`.
  2. `X-Tenant-Id: acme` con sesión de otro tenant → 403 `TENANT_MISMATCH`.
  3. Filas escritas con `acme:owner` no aparecen al listar `default:owner`.
  4. `scanByPrefix("tasks","acme")` no devuelve filas de `default`.
  5. El envelope de una vista ACME lleva `tenantId: "acme"` y provenance de ACME.
- **Aceptación**: los 5 casos existen y fallan por la razón correcta (tenant inexistente), no por error de sintaxis.
- **Rollback**: borrar el test.

### E06 · Alta canónica del tenant `acme`

- **Objetivo**: crear el tenant por el camino oficial, no a mano en la DB.
- **Ficheros**: nuevo `scripts/provision-acme-tenant.ts` (idempotente, `insertIfAbsent`).
- **Pasos**: registro en `system/tenant-membership` (`{ id:"acme", tenantId:"acme", displayName:"ACME Obras y Reformas" }`), membership del owner admin, `user-tenants`, usuario admin vía `UserService.create`.
- **Guardas**: no tocar `system` de otros tenants; no reescribir si ya existe; tenant id validado con la regex de `admin-tenants.ts`.
- **Verificación**: `GET /api/admin/tenants` lista `acme`; `resolveStrict("acme-admin")` devuelve `{ tenantId:"acme", source:"database" }`.
- **Aceptación**: E05 pasa 1, 2 y 3 sin tocar código de producción.
- **Rollback**: script `--unprovision` que borra solo filas de `acme`.

### E07 · Seed identidad, equipo, agentes y memorias

- **Objetivo**: datos de personas y roles dentro de `acme`.
- **Ficheros**: `scripts/seed-acme.ts` (nuevo), reutilizando patrones de `scripts/seed-demo.ts` pero con tenant explícito.
- **Datos**: 4 usuarios, 4 agentes (Obra, Presupuestos, Soporte, Compras), 8 memorias con categoría y tags.
- **Guardas**: cada `put` usa el owner de ACME y verifica el prefijo; idempotente por id.
- **Verificación**: `list("acme-admin","agent-roles")` = 4; `list("default:<owner>","agent-roles")` no contiene ninguno.
- **Aceptación**: E05 caso 3 en verde.
- **Rollback**: borrar el script y las claves `acme:*` creadas por él.

### E08 · Seed tareas

- **Datos**: 10 tareas en todos los estados (`queued`, `running`, `waiting_approval`, `waiting_input`, `paused`, `scheduled`, `succeeded`, `failed`), con `clientId` y `amountEur` cuando aplique.
- **Guardas**: `state.ownerId` siempre de un usuario de ACME; ninguna tarea sin cliente cuando la vista la muestre.
- **Aceptación**: la vista `queue` de `acme-obras` puede listar 10 tareas sin valores derivados.

### E09 · Seed proyectos

- **Datos**: 3 obras con checklists reales (Tenerife Sur 78%, Las Palmas 64%, Tagoror 42%), 2 memorias de proyecto y 2 artefactos.
- **Guardas**: porcentajes = checklists completados / totales (aritmética sobre campos, no heurística).

### E10 · Seed negocio

- **Datos**: 4 leads con `status` enum e `amountEur` numérico; 3 clientes; 4 facturas con importe y estado.
- **Aceptación**: una consulta puede sumar importes sin parsear strings (`8400`, no `"8.400 €"`).

### E11 · Seed comunicaciones

- **Datos**: conexión WhatsApp de ACME (`instance: acme-demo`), 2 borradores, 2 mensajes de bandeja.
- **Guardas**: `accountId` de ACME; ningún destinatario fuera de `allowedRecipients`.

### E12 · Seed conocimiento

- **Datos**: 4 documentos (uno con `url` data para abrirlo), 3 fuentes RAG, 6 chunks.
- **Guardas**: ids de fuente con prefijo de tenant para que `DELETE /api/rag/source/:id` no cruce.

### E13 · Seed acciones y notificaciones

- **Datos**: 4 acciones (`awaiting_review`, `scheduled`, `failed`, `outcome_unknown`) con `amountEur`; 4 notificaciones con `cta` explícito.
- **Guardas**: ninguna acción de otro tenant en las listas.

### E14 · Módulos de workspace ACME

- **Ficheros**: `packages/workspaces/acme-clientes/`, `acme-obras/`, `acme-suministros/` (manifiesto, vistas declaradas, queries, comandos) + 3 líneas en `packages/workspaces/src/index.ts`.
- **Decisión a documentar**: el catálogo es global; los **datos** son por tenant. El tenant `default` verá los tres módulos con listas vacías, nunca filas de ACME.
- **Guardas**: `status` del manifest honesto (`implemented`, no `verified` hasta E20); sin tocar los 34 módulos existentes.
- **Aceptación**: `GET /api/workspaces` incluye los tres ids; `GET /api/workspaces/acme-obras` devuelve 7 vistas declaradas.

### E15 · Query handlers tenant-scoped

- **Objetivo**: que cada vista lea del store con el `ctx.tenantId`, sin `owner` del body.
- **Guardas**: `services.db` es el store con scope; prohibido `process.env` o rutas de fichero para "datos de demo".
- **Aceptación**: con sesión ACME devuelven datos; con sesión de `default` devuelven vacío.

### E16 · Vistas ACME y contrato de spec

- **Objetivo**: 7 `kind` (`dashboard`, `queue`, `inbox`, `board`, `table`, `detail`, `form`) por módulo, todos válidos.
- **Guardas**: validar con `runtimeViewSpecSchema` en un test; nada de campos extra "porque el renderer los pinta".
- **Aceptación**: 21 specs válidos (3 módulos × 7).

### E17 · Endpoint con `ViewEnvelope` correcto

- **Objetivo**: cerrar H1.
- **Cambio mínimo**: en `routes/workspaces.ts`, exigir `tenantId` del contexto y responder 500/403 si falta, en lugar de caer a `owner`. Añadir test.
- **Verificación HTTP**: `POST /api/workspaces/acme-obras/view` con Bearer de ACME → 200 y `view.tenantId === "acme"`, `freshness.generatedAt` ISO con offset, `provenance.source` de ACME.
- **Aceptación**: E05 caso 5 en verde; ninguna respuesta con `tenantId` distinto del de la sesión.

### E18 · Sesión real de ACME

- **Objetivo**: entrar como ACME sin el sandbox de UI.
- **Cambio web**: `contextLabel` y aviso de tenant derivados de la sesión (`/api/auth/me` + tenant resuelto), no del token demo. `Login` no necesita botón nuevo: basta usuario/contraseña de ACME.
- **Guardas**: no tocar `apps/web/src/demo/*`; no añadir excepciones en `apiFetch`.
- **Aceptación**: sesión ACME ve el menú completo; el sandbox `demo:interfaz` sigue funcionando igual y **no** comparte datos con ACME.

### E19 · Render y Centro de Mando

- **Objetivo**: que el dato se imprima y que el panel deje de inventar.
- **Pantallas**: las 7 vistas × 3 módulos en `WorkspaceShell`; estados vacío/error/cargando.
- **Centro de Mando**: endpoint tenant-scoped `GET /api/analytics/overview` (nuevo), con los campos de §2.1; la vista solo pinta. Si el endpoint no está listo en esta etapa, el módulo se oculta del menú en lugar de mostrar fixtures (decisión explícita, no un parche).
- **Prohibido**: `apps/web/src/demo` como fuente, `includes`/regex sobre títulos, fórmulas de confianza inventadas, mapeos por nombre.
- **Aceptación**: captura de las 7 vistas con datos ACME + panel con importes sumados de `amountEur`; ninguna cadena "Interfaz" en pantalla.

### E20 · Cierre

- **Verificación final**:
  1. `pnpm typecheck` sin errores nuevos respecto al baseline.
  2. `pnpm test` sin fallos nuevos; `tests/tenant-acme-isolation.test.ts` en verde.
  3. `pnpm gate` con la misma lista de fallos preexistentes (o mejor).
  4. Doble sesión simultánea: ACME y `default` en dos navegadores; cero cruces en `/api/agent`, `/api/threads`, `/api/workspaces`.
  5. `acme` suspendido (`POST /api/admin/tenants/acme/suspend`) → 403 `TENANT_SUSPENDED`.
- **Documentación**: `docs/campaigns/acme-tenant/RESULT.md` con evidencias, y decisión sobre el sandbox `apps/web/src/demo` (mantener como demo de UI aislado o retirarlo).
- **Aceptación**: informe firmado con los 5 puntos y las capturas; sin commit sin autorización.

---

## 5. Gates por etapa (comando único)

```bash
pnpm typecheck
pnpm test -- tests/tenant-acme-isolation.test.ts tests/tenant-isolation.test.ts tests/tenant-principal.test.ts
pnpm gate
```

Criterio: **ningún fallo nuevo** frente a `artifacts/acme/baseline.txt`. Un fallo nuevo bloquea la etapa y se revierte.

---

## 6. Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| El seed cae en `default` por resolver el tenant desde membership | Media | Owner admin de ACME con membership cerrada + aserción de prefijo `acme:` en cada `put` |
| `tenantId ?? owner` en las rutas sirve el scope equivocado | Media | E17 lo cierra con test HTTP |
| Añadir módulos al catálogo global "ensucia" a otros tenants | Alta (cosmético) | Documentado: catálogo global, datos por tenant; test de listas vacías |
| Se relajan schemas para que pinte una vista | Media | R6 + revisión de `packages/domain` en cada etapa |
| Se reutiliza el sandbox de UI para "ahorrar" | Alta | R3/R8 + grep de `apps/web/src/demo` en el gate de cierre |
| Tests preexistentes fallando ocultan una regresión | Alta | Baseline E01 y comparación explícita |

## 7. Fuera de alcance

- Conectar proveedores reales (Holded, Meta, Google) para ACME: el dataset es sintético.
- Cambiar `MULTI_TENANT_SHARED` o la política de RLS.
- Un segundo tenant de UI en el frontend.
- Tocar los 34 workspaces existentes o el tenant `default`.
- Commit, push o despliegue.
