# 06 · Futuro y plan de handoff

> v1 · 2026-11-10 · Estado: handoff
>
> Este documento asume que el lector ya leyó 01–05. Su objetivo es evitar que el siguiente agente confunda “contrato implementado” con “producto terminado”.

## Qué está resuelto y qué no

Está resuelto el circuito mínimo: una vista de workspace se declara, se ejecuta contra una query, se adapta a un `RuntimeViewSpec`, se envuelve en un `ViewEnvelope` y se renderiza. Está resuelto el flujo del chat con una resolución por mensaje y cancelación de peticiones anteriores. Está resuelta la cobertura de los 34 workspaces con una vista table por defecto. Está resuelta la limpieza del evento muerto y del contrato duplicado.

No está resuelto el gobierno de datos. `permissions.canView` se rellena, pero el backend no aplica un `PolicyEngine` real a las rutas de vistas. `WorkspaceContext.permissions` se construye vacío. No se comprueba que el workspace o la entidad pertenezcan al tenant del actor. El `tenantId` se toma del contexto del servidor, lo cual es correcto, pero eso solo evita que el navegador lo elija; no demuestra que el actor tenga derecho a ver el dato. Antes de conectar datos reales de gestoría, esta es la prioridad número uno.

Tampoco está resuelta la acción. `POST /api/workspaces/:id/command` existe y el dispatcher ejecuta comandos, pero la UI no los usa. `form` es de solo lectura. `queue` e `inbox` ocultan sus acciones porque `WorkspaceShell` y `ContextualPanel` no pasan `onAction`. No hay endpoint genérico de acciones de vista, ni idempotencia de acciones, ni confirmación, ni estados de “resultado desconocido”. El contrato de gestoría sí define estas reglas; el código de `agente` todavía no las implementa.

## Brecha 1: autorización, tenant y RLS

La ruta construye un contexto con `actorId: owner`, `actorKind: "user"` y `permissions: []`. El adapter pone `canView: true` salvo que el resultado sea `forbidden`. Eso significa que la vista se sirve si la query existe, no si el actor puede verla. Para cerrar esta brecha:

1. Resolver el principal autenticado y sus permisos efectivos antes de ejecutar la query.
2. Pasar esos permisos en `WorkspaceContext.permissions`; no confiar en el body.
3. Aplicar el `PolicyEngine` o el servicio equivalente en cada handler o en un wrapper común.
4. Comprobar que el workspace y la entidad pertenecen al tenant.
5. Devolver 404, no 403, cuando el recurso pertenece a otro tenant y no se quiere revelar su existencia.
6. Añadir tests de dos tenants y de actor sin permiso.
7. No reutilizar el token owner de gestoría para agentes; el contrato lo prohíbe expresamente.

Mientras esto no esté hecho, `permissions.canView` es una promesa del contrato, no una garantía. La UI puede mostrar “No tienes permiso” si el valor llega en falso, pero el backend es quien debe decidirlo. Cualquier demo con datos reales debe declarar esta limitación.

## Brecha 2: acciones y comandos

El backend ya tiene `dispatchCommand` y la ruta `POST /:id/command`. Falta el puente de producto:

- Definir un contrato de acción de vista (`actionId`, `itemId`, `workspaceId`, `parameters`, `idempotencyKey`, `expectedVersion`).
- Exponer un endpoint o reutilizar el de comandos con validación de acción.
- Pasar `onAction` desde `App`/`WorkspaceShell`/`ContextualPanel` hasta `ViewRenderer`, `QueueTemplate` e `InboxTemplate`.
- Añadir confirmación para acciones destructivas y estados de carga/error.
- Mapear `outcomeUnknown` y no convertir un timeout en éxito.
- Respetar las acciones que requieren humano: revisar, aprobar, cerrar, presentar. Un LLM no debe ejecutarlas.
- Añadir idempotencia y pruebas de reintento.

El adapter hoy deja `actions: []` en queue e inbox. Eso es correcto para no prometer botones que no funcionan, pero significa que las plantillas de acción están sin datos. La primera acción vertical debería ser una sola, con permiso, idempotencia y recibo; no conviene abrir diez acciones a la vez.

## Brecha 3: datos reales, procedencia y frescura

El adapter declara `source: "workspace"` y `freshness.stale: false` siempre. No hay `sourceAsOf` real. La procedencia es una entrada genérica `workspaceId/query`, no la fuente de negocio. Para que el envelope sea útil de verdad:

- Cada query debe devolver metadatos de fuente (`source`, `source_updated_at`, `content_hash`, `sync_run_id`) o el adapter debe recibirlos de un read model.
- `freshness.sourceAsOf` debe venir del dato, no de `generatedAt`.
- `stale` debe calcularse contra una política (por ejemplo, si el change feed tiene cambios posteriores).
- La UI debe mostrar procedencia y frescura, no solo el proveedor.
- Los adapters de proveedores deben normalizar; nunca exponer filas crudas de Odoo, HubSpot, Gmail, etc.
- Las queries deben ser multi-tenant y no mezclar empresas.

El contrato de gestoría ya propone el change feed y el envelope de read model. La integración real requiere implementar `GET /companies/{id}/changes`, el `BusinessMoment`, el `ViewPlanner` y el `ViewMaterializer` en `agente`. Ese es un proyecto de integración, no un parche de la ruta actual.

## Brecha 4: resolver del chat y selección de workspace

El resolver legacy por regex sigue vivo. Sin `workspaceId`, `/api/views/resolve` puede devolver un envelope `legacy` con `stale: true`. El chat no sabe elegir un workspace a partir de la intención; el usuario tiene que tener un workspace activo o el backend cae en el fallback. Las mejoras posibles:

- Sustituir el regex por una selección explícita de workspace/vista basada en el catálogo y, si se usa LLM, con una tool tipada.
- No permitir que el modelo genere HTML ni specs libres.
- Persistir la resolución por `messageId`/`threadId` para auditoría y para evitar recomputar.
- Definir qué pasa cuando hay ambigüedad: preguntar, no adivinar.
- Retirar el fallback legacy cuando ya no haya consumidores.
- Añadir historial de vistas y un botón de refresco.

La regla de “null no borra” debe mantenerse. Si se añade un botón de refresco, debe tener una clave explícita; no conviene reutilizar el efecto del último mensaje para todo.

## Brecha 5: shell y navegación

`WorkspaceShell` empieza sin workspace seleccionado, no guarda la selección en la URL y no tiene búsqueda ni filtros. Con 34 workspaces, la lista de tarjetas se vuelve incómoda. Mejoras:

- Deep link (`/workspaces/:id/:viewId`) o estado en query string.
- Persistir el último workspace por usuario.
- Búsqueda y agrupación por familia.
- Refresco explícito y orden de peticiones en `useWorkspaceView` con `AbortController` y secuencia.
- Evitar la doble carga de detalle y vista cuando se puede reutilizar el detalle.
- Skeleton de carga y estados de error con reintento.
- Pasar `onAction` y manejar el resultado.
- Tests de navegación y de cambio rápido de vista.

`useWorkspaceView` hoy usa un booleano `cancelled`, no una secuencia. Si el usuario cambia de vista dentro del mismo workspace, una respuesta anterior puede pisar la nueva. Es un bug latente, no visible en la demo porque las queries son rápidas, pero debe corregirse antes de producción.

## Brecha 6: templates y accesibilidad

Los siete templates existen, pero no todos tienen la misma profundidad:

- `dashboard` usa KPIs genéricos; falta semántica de negocio.
- `timeline` y `graph` se adaptan a `table`; no hay componente propio.
- `table` no tiene ordenación, filtros, paginación ni virtualización.
- `queue` e `inbox` no tienen acciones conectadas.
- `form` no tiene submit, validación ni estados de error.
- `detail` no navega a relaciones ni edita.
- `board` no tiene drag and drop.
- No hay estados de “stale” ni cabecera de procedencia.
- No hay tests de renderizado ni revisión visual.

Para accesibilidad: las tabs necesitan navegación por teclado y `aria-selected`; el panel necesita foco gestionado al abrir/cerrar; las tablas necesitan `scope` y nombres accesibles; los formularios necesitan `label` asociado y mensajes de error; los estados de carga deben anunciarse. Nada de esto está verificado.

## Brecha 7: pruebas y observabilidad

La suite es amplia pero no cubre esta capa de extremo a extremo. Faltan:

- Tests de `POST /api/workspaces/:id/view`, no solo de `/api/views/resolve`.
- Tests de permisos y de dos tenants.
- Tests de componentes para los siete templates.
- Test de `useViewResolver` con respuestas fuera de orden.
- Test de `ChatPanel` que cuente una sola petición por mensaje.
- Test de `useWorkspaceView` con cambio rápido de vista.
- E2E con backend y base real.
- Pruebas de contrato con gestoría (status, changes, errores, idempotencia).
- Métricas de latencia de resolución, queries vacías, errores 403/422 y vistas stale.
- Logs con `correlationId`, sin datos personales ni tokens.

La ruta de test actual usa un store fake. Eso es útil para el contrato HTTP, pero no demuestra que las queries reales funcionen. Antes de un piloto, hay que probar al menos un workspace con base real y un tenant aislado.

## Brecha 8: configuración y despliegue

La configuración del preview añadió `VITE_ALLOWED_HOSTS` con un hostname exacto por proceso. No se debe hardcodear el hostname ni usar comodines. El proxy `/api` apunta a `127.0.0.1:8787`; en producción habrá que revisar el origen y la autenticación. No se verificó el comportamiento de `allowedHosts` en el build de producción. No se tocó el despliegue ni se publicó nada.

El contrato de gestoría está en `agente`, no en `agntia-gestoria`. El usuario lo moverá. Cualquier trabajo de integración debe empezar por verificar que el otro repositorio tiene la versión correcta y que su `GET /api/status` declara `contract_version`. No se debe asumir que el clon local está actualizado ni hacer push desde este workspace sin autorización.

## Plan por fases

**Fase A · Hardening (prioridad alta).** Conectar autorización real, añadir tests de tenants y permisos, corregir la secuencia de `useWorkspaceView`, añadir `sourceAsOf`/`stale` reales y tests de la ruta de workspace. No añadir acciones hasta que los permisos estén claros.

**Fase B · Primera acción vertical.** Elegir una acción (por ejemplo, enviar a revisión o marcar una cola como hecha), implementar contrato, endpoint, idempotencia, UI y recibo. Medir el flujo completo. No abrir un catálogo de acciones genéricas antes de cerrar una.

**Fase C · Datos de gestoría.** Implementar el change feed y los read models; construir `BusinessMoment`, `ViewPlanner` y `ViewMaterializer`; añadir provenance/freshness de proveedor; probar con una empresa y un tenant. Mantener el envelope como frontera.

**Fase D · UX y templates.** Añadir timeline/graph, filtros/orden/paginación, formularios con submit, deep links, refresco, historial y accesibilidad. Medir con datos reales, no solo con specs de ejemplo.

**Fase E · Operación.** Observabilidad, métricas, alertas, contratos versionados, pruebas de carga, revisión de seguridad y documentación de rollback. Solo entonces tiene sentido hablar de piloto amplio.

## Preguntas abiertas para el siguiente agente

1. ¿El workspace activo lo elige el usuario o lo infiere el sistema? Si lo infiere, ¿con qué tool y con qué regla de ambigüedad?
2. ¿La vista del chat y la del shell deben compartir un mismo endpoint o mantenerse separadas?
3. ¿Qué significa `canAct` exactamente: acciones declaradas, acciones permitidas o ambas?
4. ¿La frescura se calcula por vista, por entidad o por fuente?
5. ¿Se persiste cada `ViewEnvelope` para auditoría o solo se genera al vuelo?
6. ¿Cómo se representa una vista vacía por falta de permiso frente a una vista vacía por falta de datos?
7. ¿Qué se hace con un `viewId` que ya no existe en una URL guardada?
8. ¿Se retira el resolver legacy o se mantiene como compatibilidad indefinida?

## Checklist de continuación

Antes de tocar código: leer 01–05, comprobar `git status`, confirmar el commit `804d8f7`, ejecutar typecheck y la suite. Antes de tocar permisos: escribir el test de dos tenants primero. Antes de tocar templates: añadir un spec de ejemplo por kind y un test de render. Antes de tocar gestoría: verificar el contrato en el otro repositorio y no mezclar `agente-integration.patch` con el código. Antes de decir “listo”: distinguir entre compilado, testeado y verificado visualmente.
