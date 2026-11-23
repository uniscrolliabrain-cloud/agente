# Campaña integral — AGNTIA-DEMO-UNIFY

**Objetivo:** unificar universos demo en un dataset empresarial sintético coherente de AgntiaPro, sin degradar UX ni runtime. **Estado:** propuesta documental, no ejecutada.

## Reglas no negociables
- Leer primero `../01-kick-off`, `../02-vision-founder`, `../03-instrucciones-founder-raw` **completos**; usar `../04-plantilla-derivada` después.
- No redefinir la propuesta comercial de la landing.
- No borrar ni sustituir Interfaz/ACME/Studio hasta tener paridad, tests y rollback.
- No usar auditoría del backend como limitación creativa para el diseño UX. Auditar integración **después** del diseño.
- No tocar `main`, DB de producción, OAuth real, conectores externos, kernel o cognición sin aprobación explícita.
- Entregar en rama separada, commits pequeños, reportes de evidencias y rutas de reversión.
- No confundir fases de compilación del cliente con olas técnicas de esta campaña.

## Ola C00 — Congelar evidencias y superficies
**Lectura:** `apps/web/src/demo/*`, `apps/ui-lab/src/*`, `apps/ui-lab/src/vendor/studio/*`, `apps/web/src/workspaces/*`, `apps/server/src/{db,db-tenant,auth,acme-owner}.ts`, `scripts/{seed-acme,provision-acme-tenant}.ts`, `packages/workspaces/acme-*`.
**Acciones:** inventario completo de workspaces, hooks, fetches, fixtures, datos hardcoded, IDs y ramas relevantes; ejecutar pruebas baseline, build y capturas visuales de cada vista.
**Reportes:** `reports/C00-SURFACES.md`, `reports/C00-BASELINE.md`, `reports/C00-VISUALS.md`.
**Gate:** catálogo de consumidores y rutas comprobado; ninguna modificación funcional.

## Ola C01 — Ontología y narrativa aprobada
**Fuentes:** documentos raw y plantilla de 18 taxonomías/6 ejes.
**Acciones:** compilar perfil AgntiaPro como empresa demo, actores y capacidades; separar `real`, `propuesta`, `simulada`, `beta`, `verificada`; preservar fases founder sin inventar fase 2. Escenarios de clientes ficticios con dolores y soluciones diversos.
**Salidas:** `packages/demo-data/src/schema.ts`, `catalog.ts`, `business-profile.ts` (rutas propuestas; verificar estructura del monorepo antes).
**Gate:** revisión de coherencia comercial y ontológica; sin cifras reales inventadas.

## Ola C02 — Dataset canónico reproducible
**Acciones:** reloj lógico, semilla estable, 90 días de actividad, ocho historias completas, generación causal `lead→discovery→propuesta→contrato→compilación→formación→beta→servicio→cobro→feedback`; variaciones y fallos; eventos, correlaciones, evidencias y KPIs derivados.
**Salidas:** `packages/demo-data/src/{seed,scenarios,generate,validate,selectors}.ts`, tests de invariantes.
**Gate:** determinismo, integridad referencial, balances y cronología; sin envíos externos.

## Ola C03 — Adaptador demo navegador
**Modificar:** `apps/web/src/demo/{tenant,fixtures,router}.ts`, `apps/web/src/api/{auth,client}.ts` y tests relacionados.
**Acciones:** crear identidad `agntia-demo`, compatibilidad con `demoStore`, rutas y acciones simuladas; conservar token anterior como alias temporal solo en entorno de desarrollo si es necesario.
**Gate:** full-app demo funciona sin red; login/logout; chat, tareas, usuarios, documentos, RAG, proyectos, WhatsApp, aprobaciones sin regresiones.

## Ola C04 — UI Lab y Estudio de Operaciones
**Modificar:** `apps/ui-lab/src/{fixtures,registry,FullAppPreview}.tsx` (comprobar extensión exacta), `apps/ui-lab/src/vendor/studio/{model,BusinessCommandStudio,Inspector,Visualizer,Timeline}.tsx` según consumidores.
**Acciones:** Studio usa selectores del dataset canónico, sin cambiar diseño aprobado; adaptar actores, proyectos, cronología y modo Game Master. UI Lab consume mismo universo para tarjetas, chat, memoria, tareas, documentos y previews.
**Gate:** inspector/visualizador/timeline sincronizados; Kanban, Grafo, Twin, 360 sin pérdida de UX.

## Ola C05 — Centro de Mando y workspaces existentes
**Modificar:** `apps/web/src/workspaces/35-centro-mando/hooks/{useDemoCentroMandoData,useCentroMandoData}.ts`; componentes afectados según inventario C00.
**Acciones:** KPIs y listas de una sola fuente, IDs compartidos; eliminar inferencias por texto libre; no mostrar métricas de confianza sin dato explícito.
**Gate:** reconciliación de cifras entre Chat, Hoy, CRM, Kanban, documentos, finanzas y timeline.

## Ola C06 — Tenant persistente aislado
**Crear:** `scripts/provision-agntia-demo.ts`, `scripts/seed-agntia-demo.ts` (rutas propuestas), tests de provisión, seed y aislamiento.
**Acciones:** reutilizar `TenantService`/`TenantScopedStore`, `records`, kinds y contratos existentes. Cargar solo en PGlite/Neon staging autorizado; `datasetVersion`, idempotencia y rollback.
**Gate:** aislamiento de `agntia-demo` respecto a `acme`/`default`; snapshots; conteos; pruebas de acceso; sin tocar producción.

## Ola C07 — Convergencia de providers
**Acciones:** comparación navegador vs DB por `scenarioId`, `entityId`, KPI, fechas y respuestas de workspaces; validación de endpoints `/api/analytics/overview`, `/api/workspaces/*/view`, auth y permisos.
**Gate:** paridad semántica y funcional sin fusionar sesiones demo y reales; ninguna escritura cruzada.

## Ola C08 — Fases de compilación en el dataset
**Acciones:** representar estados 0,1,3,4,5,6,7,8 del founder; training por actor, evidencias de beta, feedback semanal y Digital Twin; fase 2 pendiente de decisión, no presentada como decisión oficial.
**Gate:** simulaciones separadas de autorizaciones reales, escenarios y fases con trazabilidad.

## Ola C09 — Cobertura completa de componentes
**Acciones:** inventariar **cada** componente y vista del catálogo, clasificar `datos compartidos | fixture aislado | API real | sin datos | solo presentación`; crear adapters/selectors sin sobreescribir UX.
**Gate:** matriz de cobertura 100% de vistas registradas, estados vacíos honestos y ningún dato ficticio desconectado que parezca del tenant.

## Ola C10 — Validación y handoff
**Tests:** typecheck raíz y web, unitarios de schema/generador, integridad y referencias, auth/sesiones, e2e aislamiento, comparación KPI, build UI Lab, regresión visual desktop/móvil, navegación entre vistas, rollback de seed.
**Reportes:** `reports/C10-TESTS.md`, `reports/C10-DIFFS.md`, `reports/C10-RISKS.md`, `reports/HANDOFF.md`.
**Gate:** pruebas en verde o bloqueos explícitos; no merge/deploy automático.

## Orden recomendado
C00→C01→C02→C03→C04→C05→C06→C07→C08→C09→C10. C04/C05 pueden desarrollarse en paralelo tras C02 con archivos de escritura separados; integrar mediante revisión y tests. Cada ola deja cambios verificables, lista de archivos y deuda documentada.

## Criterios finales
- Una identidad empresarial demo `agntia-demo` en las vistas de la simulación.
- Una historia de negocio coherente; ocho clientes ficticios con IDs y relaciones rastreables.
- Misma cifra en dashboard y vistas origen; la cifra no se escribe directamente en UI.
- Sandbox sin red ni efectos reales; tenant persistente solo en entorno autorizado.
- Conservación de ACME como ejemplo vertical/regresión y de las experiencias UX del Studio.
- Sin cambios destructivos ni degradación de componentes.
- Documentación raw intacta; diferencias de interpretación registradas aparte.
