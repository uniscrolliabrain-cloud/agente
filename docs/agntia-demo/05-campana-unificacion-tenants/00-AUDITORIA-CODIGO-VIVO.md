# Auditoría de código vivo — unificación de universos demo

Fecha: 2026-11-23. Lectura directa del código en la rama por defecto del repositorio `uniscrolliabrain-cloud/agente`. No se ejecutaron builds, tests, navegador ni consultas a bases de datos. Por tanto, es auditoría estática del código versionado, **no certificación de datos persistidos en Neon**. Documentación histórica ACME revisada como contexto, no como prueba de despliegue actual.

## Hallazgo 1: Interfaz Studio — sandbox de navegador
- `apps/web/src/demo/tenant.ts`: `DEMO_TENANT_ID="interfaz"`, `DEMO_TOKEN="demo:interfaz"`; sin backend.
- `apps/web/src/api/auth.ts`: `loginDemo()` escribe token y `demoUser`.
- `apps/web/src/api/client.ts`: `isDemoSession()` intercepta `apiFetch` y redirige a `demoRequest`.
- `apps/web/src/demo/fixtures.ts`: ~40 KB, equipo de Ana Ferrer/Diego/Lucía/Marc, agentes Marta/Bruno/Nora/Iker/Vera, tareas, proyectos, memorias, documentos, WhatsApp, RAG, acciones, notificaciones, leads y conversaciones.
- `apps/web/src/demo/router.ts`: ~24 KB, adaptador API en memoria con mutaciones locales. No es un backend multi-tenant real.
- `apps/web/src/workspaces/35-centro-mando/hooks/useDemoCentroMandoData.ts`: 12,9 KB, transforma `demoStore` en panel; incorpora `LEAD_META` y reglas por texto, estimación heurística de confianza de agentes y fechas relativas a `Date.now()`.
- `apps/web/src/workspaces/35-centro-mando/hooks/useCentroMandoData.ts`: alterna hook demo y `GET /api/analytics/overview` real; la vista real deja `agents=[]` si faltan métricas explícitas.
- `apps/web/src/App.tsx`: etiqueta de sesión demo `Interfaz`.
**Riesgo:** identidad Interfaz y sus casos de diseño no corresponden al negocio AgntiaPro; ciertos indicadores son calculados en la vista, no desde una ontología común.

## Hallazgo 2: ACME — tenant persistente de backend
- `scripts/provision-acme-tenant.ts`: `TENANT_ID="acme"`; crea registro, usuario, membership, tenant por defecto y verifica `resolveStrict`. Tiene modo unprovision que no elimina datos de negocio.
- `scripts/seed-acme.ts`: ~41 KB, seed idempotente por ID con `TenantScopedStore` y verificación física de prefijo `acme:<owner>`. Contiene identidad de ACME Obras y Reformas, personas, agentes, leads, obras, tareas, facturas, acciones, documentos, etc.
- `apps/server/src/acme-owner.ts`: binding de usuario GitHub a ACME, actualiza `adminUserId` y membership; **punto de alto riesgo si se renombra sin revisar OAuth y datos**.
- `packages/domain/src/acme-dataset.ts`: schemas Zod explícitos de leads, proyectos, tickets y métricas de agente; acoplados nominalmente a ACME.
- `packages/workspaces/acme-obras/`, `acme-clientes/`, `acme-suministros/`: módulos de negocio vertical específicos de construcción, no genéricos de AgntiaPro.
- `docs/campaigns/acme-tenant/RESULT.md`: reporte histórico de 20 etapas, seed de 4 usuarios/4 agentes/10 memorias/10 tareas/3 obras/4 leads/3 clientes/4 facturas/4 acciones y 21 handlers. El documento dice que no hubo commit en ese momento; el código consultado ahora contiene varios de esos archivos, pero no se verificó estado de despliegue.
**Riesgo:** migrar datos o renombrar `acme` ciegamente puede afectar memberships, IDs, registros y módulos especializados.

## Hallazgo 3: Estudio de Operaciones — simulación UI Lab
- `apps/ui-lab/src/vendor/studio/BusinessCommandStudio.tsx`: UX con inspector, visualizador, timeline, Kanban, Grafo, Digital Twin y Empresa 360. Encabezado `ACME`.
- `apps/ui-lab/src/vendor/studio/model.ts`: modelo local de `actors`, `projects`, `initialActivities`, `reducer`, `initialState`; sin API. Actores LAIA, Marcos, Antonio (marcado **Humano** en ese modelo), Pilar y Manuel; ejemplos de ACME y Estudio Norte.
- `model.ts`: cronología intradía en minutos, `clock`, `playing`, `reset`, `save`; es un simulador de jornada, no un historial empresarial causal de 90 días.
**Riesgo:** actores y roles contradicen el perfil founder (Antonio como agente financiero); IDs, actividades y clientes no se comparten con Interfaz ni con ACME persistente.

## Hallazgo 4: UI Lab — fixtures adicionales
- `apps/ui-lab/src/fixtures.ts`: 3 memorias, 1 archivo, 4 tareas con IDs `demo-*`.
- `apps/ui-lab/src/registry.tsx`: 18 previews; algunos usan fixtures, otros modo demo, otros requieren API. KPIs están escritos directamente; ChatPanel recibe mensajes vacíos; varias vistas se montan `enabled={false}`.
- `apps/ui-lab/src/FullAppPreview.tsx`: monta App real inyectando token `demo:interfaz`; controla origen para no ejecutarse sobre `agntiapro.com`.
**Riesgo:** unificar el tenant sin sustituir `registry` y previews dejará componentes con datos de otro universo o vacíos.

## Hallazgo 5: infraestructura de persistencia
- `apps/server/src/db.ts`: `Store` sobre PGlite o Postgres, tabla `records` con `owner`, `kind`, `id`, `data`; lecturas y escrituras por owner/kind; límites de paginación.
- `apps/server/src/db-tenant.ts`: `TenantScopedStore` compone `tenantId:owner`.
- `apps/server/src/engine/tenant.ts`: `TenantService` con memberships, resolver, caché, revocación y suspensión.
- `apps/server/src/auth.ts`: `sessionTenant()` recupera el tenant seleccionado de la sesión.
**Implicación:** la demo persistente puede usar la infraestructura existente. No se justifica migración destructiva ni rediseño general de tablas para el primer paso. Se necesitará modelo de datos y adaptadores de lectura, y quizá kinds/índices nuevos según pruebas de rendimiento.

## Inventario de riesgos comprobados
1. Múltiples identidades y universos.
2. Dos mecanismos de sesión diferentes (token navegador vs usuario/member real).
3. Adaptadores duplicados de datos de Centro de Mando.
4. Roles incompatibles (Antonio humano en Estudio, agente en founder).
5. Datos de negocio de diseño/construcción frente a negocio de compilación agéntica.
6. Vistas desconectadas o con KPIs hardcoded en UI Lab.
7. Fechas móviles que dificultan reproducibilidad y coherencia temporal.
8. ACME especializado en obra: conservar módulos como ejemplo vertical, no forzar su esquema sobre AgntiaPro.
9. Riesgo de colisiones y referencias cruzadas si se reutilizan IDs o se cambia el owner del seed.
10. Sin evidencia directa del contenido real de las bases de datos o de ramas no integradas.

## Alcance y límites
Esta auditoría cubre las superficies citadas, no todo el monorepo, todas las ramas ni todas las colecciones. Antes de cambiar DB, auditar tablas/índices reales, owners y registros con consultas **read-only** y redacción de datos sensibles.
