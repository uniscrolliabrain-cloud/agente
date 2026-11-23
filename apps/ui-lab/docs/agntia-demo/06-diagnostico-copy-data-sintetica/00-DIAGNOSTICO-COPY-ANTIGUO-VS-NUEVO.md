# 00 — Diagnóstico de datos sintéticos: situación anterior, propuesta y límites

**Estado:** borrador de revisión del founder. **No se aplica al código, a bases de datos ni a producción.** Auditoría estática de `main` del 23-11-2026. Fuente empresarial: `../01-kick-off/`, `../02-vision-founder/`, `../03-instrucciones-founder-raw/`; los documentos anteriores de `../03-compilacion-y-dataset/` son propuestas, no fixtures ejecutados.

## Diagnóstico ejecutivo

La divergencia principal no es un fallo de PostgreSQL: hay **tres universos de demostración con fuentes de verdad diferentes** (Interfaz Studio en el navegador, ACME Obras en persistencia y el Estudio de Operaciones en UI Lab), más fixtures aislados para previews. No se deben «fusionar tres tenants de base de datos» porque no son tres tenants persistentes equivalentes. Hay que **construir una sola identidad empresarial simulada** y adaptadores para las vistas existentes. La interfaz actual es patrimonio de UX; sustituir el contenido no significa rediseñar la pantalla.

## A. Inventario del dato anterior y copia semántica (sin perder el origen)

| Origen y ruta real | Datos/contratos observados | Ejemplos anteriores | Diagnóstico | Tratamiento propuesto |
|---|---|---|---|---|
| `apps/web/src/demo/tenant.ts` | `DEMO_TENANT_ID=interfaz`, `DEMO_TOKEN=demo:interfaz` | Interfaz Studio | Identidad de sesión navegador, no tenant DB | Nuevo `agntia-demo` en provider sintético; alias legacy solo durante transición |
| `apps/web/src/demo/fixtures.ts` | `DemoStore` con 18 propiedades: user, users, threads, tasks, memories, files, notifications, agents, projects, projectMemories, projectArtifacts, drafts, inbox, leads, actions, connections, ragSources, ragChunks, workspaces | Ana Ferrer, Diego Salas, Lucía Prats, Marc Oller; agentes Marta, Bruno, Nora, Iker, Vera; Estudio Lumen, Casa Botànica | Dataset completo de agencia creativa; `NOW=Date.now()` mueve las fechas en cada carga | Mantener shapes y endpoints; cambiar **contenido y relaciones** por AgntiaPro; congelar reloj de escenario |
| `apps/web/src/demo/router.ts` | Emulación API in-memory; CRUD de usuarios, tareas, agentes, hilos, propuestas y más | Correo fallback `nuevo@interfaz.studio`; `demoRequest` | Interacciones dependen del store mutable; no basta con sustituir nombres | Adaptador de proyección con mutaciones de sesión y reset; ninguna salida real |
| `apps/web/src/workspaces/35-centro-mando/hooks/useDemoCentroMandoData.ts` | KPIs, agentes, timeline, leads, alertas a partir de demoStore + metadatos heurísticos | `LEAD_META`, confianza estimada y datos por texto | Riesgo de mostrar cifras no derivadas de entidades | Selectores compartidos con reglas de cálculo y procedencia |
| `apps/ui-lab/src/vendor/studio/model.ts` | 5 actores, 3 proyectos, 10 actividades, reducer y reloj intradía | LAIA y Marcos agentes; Antonio **Humano**; Pilar Humana; Manuel Proveedor; ACME, Estudio Norte | Roles y actividad no coinciden con el founder; `scope company id=acme` | Proyectar escenario de jornada desde el mismo dataset, conservando interacciones y layout |
| `apps/ui-lab/src/fixtures.ts` | 3 memorias, 1 fichero, 4 tareas | Manual de marca, Proyecto Aurora, tareas de diseño | Fixture visual aislado | Seleccionar entidades canónicas; preservar casos de UI con datos AgntiaPro |
| `apps/ui-lab/src/registry.tsx` y `FullAppPreview.tsx` | Previews de componentes y app real con token `demo:interfaz` | KPIs de ejemplo, vistas deshabilitadas, hilos vacíos | Parte de la UX no lee la misma fuente | Matriz por preview, reemplazo de hardcodes y estados vacíos honestos |
| `scripts/provision-acme-tenant.ts`, `scripts/seed-acme.ts` | Provision y seed idempotente para `acme`, `TenantScopedStore`, owners y membership | ACME Obras y Reformas, admin Carlos, personal de obra | Infraestructura aprovechable pero semántica vertical y credenciales propias | **No sobrescribir ni renombrar**: crear provision/seed independientes y probar aislamiento |
| `packages/domain/src/acme-dataset.ts` y `packages/workspaces/acme-*` | Tipos y workspaces de obra | Leads/obras/suministros | Vertical de cliente, no empresa AgntiaPro | Mantener como ejemplo de cliente/vertical, sin mezclar sus datos con los del owner |

### Inventario de componentes a validar antes de implementación
`Auth/Users`, `Agents`, `Chat/Threads`, `Tasks`, `Approvals`, `Projects`, `Memory`, `Documents/Files`, `RAG`, `WhatsApp`, `Leads/CRM`, `Connections`, `Workspaces`, `Centro de Mando`, `Kanban`, `Timeline`, `Grafo`, `Digital Twin`, `Empresa 360°`, `Notificaciones`, `Finanzas`, `Calendario`, `Landing/discovery`. Esta es una **lista de cobertura deseada**, no afirmación de que todos tengan ya un consumidor funcional o API.

## B. Contraste con el negocio AgntiaPro

1. **Owner**: fundador de AgntiaPro como propietario de la empresa simulada; identidad sintética no reutiliza cuenta real.
2. **Agentes**: LAIA supervisora, Marcos operario, Antonio finanzas, Juan gestoría, Ana RRHH y Pedro ciberseguridad. **Antonio es agente**, no humano, en el modelo del founder. Pilar y Manuel pueden figurar como colaboradores humanos/proveedores **si su papel se mantiene en la historia**, sin suplantar al equipo IA.
3. **Empresa**: AgntiaPro compila y gestiona empresas de clientes. No es agencia de diseño Interfaz ni constructora ACME.
4. **Ventas**: landing como puerta de entrada canónica, conversación LAIA, discovery, propuesta, contrato, compilación, formación, beta, operación y evolución.
5. **Servicio**: primera entrega de dos capacidades ROI por cliente, verificadas antes de declarar operativas; actualización tecnológica continua como parte del servicio, no nuevo mensaje comercial.
6. **Fases founder**: 0 sandbox; 1 compilación; **2 sin definición aprobada**; 3 formación; 4 beta con validación; 5 deploy completo; 6 feedback/acompañamiento; 7 alpha; 8 scale/digital twin.
7. **Modelo temporal**: documento CEO propone **seis meses** de historia; blueprint anterior propone un escenario de **90 días extensible a seis meses**. **Decisión pendiente**: conservar seis meses como horizonte maestro y 90 días como vista inicial, o generar los seis meses desde el primer seed. No ocultar esta diferencia.

## C. Problemas técnicos y riesgo
- El token `demo:interfaz` es un atajo de frontend, no autenticación equivalente a membership persistente.
- Las fechas `Date.now()` rompen repetibilidad y comparaciones temporales.
- Un mismo concepto (cliente, proyecto, agente) tiene IDs y nombres diferentes entre apps.
- El Studio usa un reducer local y un reloj 08:00–18:00; no es event bus real.
- El backend almacena `records` por `owner/kind/id`, y `TenantScopedStore` aplica namespace `tenantId:owner`; una nueva semilla debe respetarlo.
- La compatibilidad de los endpoints, la paginación, los scopes y los schemas necesita pruebas en runtime, no solo inspección de archivos.
- No se ha inspeccionado Neon, datos reales, despliegue actual ni todas las ramas. Ninguna migración destructiva está justificada.

## D. Dictamen
**Complejidad media para una primera demo visual y media-alta/alta para paridad total entre todos los workspaces y un tenant persistente.** La tarea central es reconciliar **identidad, causalidad, autoridad, fases y relaciones**, no sustituir colores ni textos. La solución debe ser incremental, con un dataset canónico, dos providers (sandbox local y persistente) y tests de coherencia. La aprobación del founder sobre el copy precede a cualquier patch.
