# README — ViewSpec y vistas servidas de AgntiaPro

> Documento raíz de orientación para agentes. Actualizado: 2026-11-26. **La documentación enlazada es mayoritariamente legacy o handoff histórico; no debe tratarse como especificación vigente sin contrastarla con el código y los tests actuales.**
>
> Estado: guía de arquitectura e intención de producto, **no certificación de implementación completa**.

## 1. Visión actual del producto (fuente de intención)

LAIA es la interfaz conversacional y presentadora: comunica, pregunta, propone y explica; **no ejecuta acciones empresariales por su cuenta**. El motor de interpretación/planificación propone intenciones tipadas; el runtime ejecuta de forma determinista y el kernel gobierna identidad, autorización, políticas, aprobaciones, auditoría y aislamiento por empresa. Los contratos de vistas servidas permiten materializar el resultado en interfaces web, Android y PC. **No crear otro sistema paralelo de navegación agéntica.**

Objetivo de experiencia: el usuario habla naturalmente con LAIA, y el runtime selecciona y presenta el destino adecuado; LAIA también puede sugerir abrir una vista y pedir confirmación. Ejemplos:
- «Abre facturación y muéstrame las pendientes» → consultar datos autorizados y servir una vista filtrada.
- «¿Recuerdas aquel chat donde diseñamos la facturación?» → buscar semánticamente hilos accesibles, ofrecer coincidencias si hay ambigüedad, recuperar un mini-resumen con decisiones y pendientes, abrir el hilo correcto y **continuar en su contexto persistente**.
- «No, el de los bancos» → refinar la búsqueda sin inventar resultados.
- «Abre el Estudio de Operaciones y enséñame qué hace Marcos» → seleccionar workspace/vista y datos reales.
- LAIA: «Hay tres aprobaciones pendientes, ¿abrimos la bandeja?» → con el consentimiento, el runtime sirve el destino. Aprobar o ejecutar es una acción distinta, gobernada por kernel.

El mismo usuario/tenant y las mismas conversaciones, tareas, memorias y auditoría deben funcionar desde web, APK Android (incluido modo asistente del teléfono cuando el SO lo permita) y PC; más adelante otros canales. Los clientes son **superficies de presentación**: el servidor determina el destino, el cliente ejecuta la navegación. Si la app está cerrada, usar deep links/notificaciones o mecanismos permitidos por el SO; no prometer apertura automática universal. No mezclar empresas ni permitir que una conversación recuperada reejecute acciones pasadas.

## 2. Contratos actuales: distinguir las capas

| Pieza | Ruta | Responsabilidad |
|---|---|---|
| `RuntimeViewSpec` | `packages/domain/src/views.ts` | Spec tipado de render; siete kinds: dashboard, queue, inbox, board, table, detail, form |
| `ViewEnvelope` | `packages/domain/src/view-envelope.ts` | Contrato canónico de **vista servida**: tenant, spec, provenance, freshness, permissions, source |
| `WorkspaceViewDeclaration` | `packages/workspaces/src/contracts/workspace-view.ts` | Declara vista, intención, query y acciones de cada módulo |
| `WorkspaceSpec/ViewSpec` | `packages/domain/src/workspace-spec.ts` | Especificación de workspace/generación; **no confundir** con el spec runtime |
| Adaptador | `apps/server/src/engine/views/workspace-adapter.ts` | QueryResult → spec validado → envelope |
| Resolver | `apps/server/src/engine/views/resolver.ts` | Ruta legacy por regex; no extenderla como arquitectura objetivo |
| API | `apps/server/src/routes/views.ts` | `POST /api/views/resolve` |
| API workspace | `apps/server/src/routes/workspaces.ts` | Catálogo, vista, query y comando |
| Hook web | `apps/web/src/hooks/useViewResolver.ts` | Solicitud correlacionada, cancelación, conservar vista si null |
| UI | `apps/web/src/view/`, `apps/web/src/` | Renderer, templates, chat y shell: inspeccionar componentes concretos antes de editar |

**Flujo deseado:** voz/texto → intención tipada → resolución de hilo/workspace/vista y permisos → query real con tenant → adapter → ViewEnvelope → renderer/navegación del cliente → recibo/auditoría. El modelo no genera HTML libre ni salta políticas. Navegar, leer y ejecutar comandos son operaciones diferentes.

## 3. Documentación localizada (índice comentado)

### Handoff del 10 de noviembre (leer primero, contrastar con HEAD)
- [01 Contexto, diagnóstico y contrato](docs/2026-11-10/01-contexto-diagnostico-y-contrato.md): cuatro contratos solapados, evento `view.resolved` inservible y decisión de `ViewEnvelope` como contrato canónico. **No reintroducir el evento muerto**.
- [02 Backend, envelope y rutas](docs/2026-11-10/02-backend-view-envelope-y-rutas.md): campos, adapter, consultas, fallback legacy, endpoints y límites de autorización.
- [06 Futuro y handoff](docs/2026-11-10/06-futuro-y-plan-de-handoff.md): deudas de gobierno, acciones, datos reales, resolución por intención, deep links, UI y tests.

### Diseño y campañas de UI (referencias históricas)
- [Índice UI](docs/ui/INDICE.md): mapa de fases y documentos.
- [D1 ViewSpec tipos](docs/ui/branches/D1-viewspec-tipos.md): discriminated union y validación.
- [D2 ViewResolver](docs/ui/branches/D2-viewresolver.md): diseño histórico de resolución; **puede mencionar `view.resolved` eliminado**.
- [D3 ViewRenderer](docs/ui/branches/D3-viewrenderer.md): renderer y templates; validar cobertura real.
- [Glosario UI](docs/ui/GLOSARIO.md): términos de ViewSpec.
- [Flujos UI](docs/ui/FLUJOS.md): casos de uso; eventos ilustrativos pueden estar obsoletos.
- [Vistas y templates](docs/ui/VIEWS_AND_TEMPLATES.md): catálogo e intención, no necesariamente código vigente.
- [Templates V2](docs/mockups/TEMPLATES_V2.md): visión de siete templates y frontera frontend/backend.
- [UI redesign](docs/09-interfaz/UI-REDESIGN.md): observaciones de builders con datos vacíos.

### Auditorías y validación (no confundir hallazgos históricos con bugs actuales)
- [Mini-auditoría 13](docs/miniaudits/13-ui-servida-viewspec/miniaudit.md): diagnóstico anterior.
- [Mini-auditoría 14 del 10/11](docs/miniaudits/2026-11-10/14-ui-servida-viewspec/miniaudit.md): 15 hallazgos (4 S1, 8 S2, 3 S3), validación parcial.
- [Roadmap UI servida](docs/miniaudits/13-ui-servida-viewspec/roadmap.md): planificación histórica.
- [Trabajo IA-2](docs/trabajos/IA-2-ui-templates-frontend.md): guía para implementación y pruebas.
- [Campaña ACME E16](docs/campaigns/acme-tenant/E16-view-specs.md): specs y tests de un vertical con datos de tenant.
- [Resultado ACME](docs/campaigns/acme-tenant/RESULT.md): cobertura reportada de workspaces, queries y specs.
- [Roadmap general](docs/estado/ROADMAP.md): tareas antiguas; **puede contener checks ya resueltos**.

## 4. Hallazgos confirmados al consultar GitHub el 26/11/2026

- `packages/domain/src/views.ts` define los siete kinds con Zod.
- `view-envelope.ts` contiene tenantId, spec, provenance, freshness, permissions y source.
- `routes/views.ts` **ya exige tenant del contexto** y devuelve `TENANT_REQUIRED` (403) si falta. El hallazgo histórico sobre fallback `?? owner` **no debe repetirse como vigente** sin revisar HEAD.
- La selección `findDeclaration` todavía contiene fallback a `views[0]` cuando la intención no coincide: puede devolver una vista no solicitada.
- La ruta mantiene fallback legacy por regex cuando no hay `workspaceId`.
- `WorkspaceContext.permissions` se inicializa como `[]` en la ruta inspeccionada: **no asumir autorización de vista completa** solo por disponer de `permissions` en el envelope.
- `useViewResolver` cancela peticiones anteriores y no borra la vista cuando recibe null.
- Los documentos del 10/11 reconocen deuda en acciones, procedencia/frescura reales, navegación y tests. Verificar qué cambió desde entonces.

## 5. Brechas para la experiencia conversacional deseada

1. **Recuperar conversaciones:** búsqueda semántica por usuario/tenant y permisos; devolver referencias estables de hilos, mini-resumen verificable, decisiones y pendientes. Confirmar API y almacenamiento existentes antes de implementar.
2. **Activar hilo y contexto:** abrir threadId correcto en cliente, hidratar historial y estado, permitir continuar; no basta con pintar una tarjeta de resumen.
3. **Resolución tipada de destinos:** elegir workspace/viewId/threadId mediante catálogo y validación determinista; ambigüedad → pedir aclaración, nunca caer arbitrariamente en la primera vista.
4. **Served Views + navegación:** separar payload de vista y comando de navegación/deep link; correlacionar con messageId, threadId, tenantId y dispositivo/sesión, sin crear un contrato de vista duplicado.
5. **Permisos reales:** PDP/PolicyEngine, scope de tenant, actor y entidad antes de query y acción. Deny-by-default; no confiar en `canView: true` como sustituto.
6. **Acciones y propuestas:** LAIA comunica; runtime propone y ejecuta solo acciones autorizadas. Aprobación humana, idempotencia, versión esperada y recibo para cambios sensibles.
7. **Multicliente:** web/Android/PC presentan el mismo estado de servidor; navegación dirigida al cliente activo, con fallback a enlace/notificación si el SO impide abrir la UI.
8. **Pruebas E2E:** recuperar hilo → resumen → abrir → continuar; tenant cruzado denegado; intención ambigua; vista sin datos; carrera de respuestas; acciones sensibles; dispositivo desconectado.

## 6. Protocolo para agentes que reciban este README

1. **Leer este documento como intención de producto, no como prueba de implementación.**
2. Abrir los tres handoffs 01/02/06, la auditoría 14 y los archivos de dominio/rutas/hooks actuales.
3. Comparar cada afirmación legacy con HEAD y tests. Clasificar: implementado y probado / implementado sin prueba / parcial / obsoleto / ausente.
4. Mapear los componentes reales de conversaciones, búsqueda, memoria, router frontend, renderer, workspace y kernel; **no inventar APIs**.
5. Proponer cambios mínimos sobre contratos existentes; respetar interfaces aprobadas, no rediseñar landing/chat/Estudio de Operaciones sin encargo.
6. Exigir tests de aislamiento, permisos, correlación, idempotencia y E2E antes de declarar listo para clientes.
7. Si se detecta divergencia, actualizar este README con fecha, commit, evidencia y enlaces; preservar historia en los documentos legacy.

**Principio rector:** LAIA comunica; el runtime determina y ejecuta; el kernel gobierna; ViewEnvelope/RuntimeViewSpec describen lo que la interfaz puede presentar. Una sola fuente de estado empresarial para todos los canales.
