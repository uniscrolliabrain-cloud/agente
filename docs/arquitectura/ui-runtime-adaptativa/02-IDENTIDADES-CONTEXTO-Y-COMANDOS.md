# 02 — IDs semánticos, UI Context y UI Commands

## Esquema de identidad
- `screenId`: pantalla estable (p. ej. `screen.today`).
- `workspaceId`: ID del registro de workspaces existente (p. ej. `hubspot`, `centro-mando`). Evitar renumeraciones destructivas.
- `viewId`: instancia de vista servida por runtime, ligada a ViewEnvelope/versión.
- `componentId`: capacidad semántica estable definida por el desarrollador (`crm.customer.form.save`).
- `instanceId`: instancia concreta en una sesión (`customer:8f21/form:edit/save`); no confundir con el tipo de componente.
- `entityRef`: referencia tipada a entidad de negocio, no nombre legible.
- `sessionId`, `threadId`, `actorId`, `tenantId`, `revision`: límites de contexto y concurrencia.

Los IDs son semánticos y no cambian con idioma, branding, orden del menú ni responsive. En listas dinámicas, derivar IDs de claves de entidad, no de índices React. No es necesario instrumentar iconos, divs decorativos o cada nodo DOM.

## Registro de capacidades (propuesta)
```ts
type UIComponentDefinition = {
  componentId: string;
  kind: 'screen'|'workspace'|'dashboard'|'widget'|'form'|'field'|'table'|'action'|'modal'|'navigation';
  parentId?: string;
  capabilities: readonly string[]; // allowlist, no funciones JS serializadas
  requiredPermissions: readonly string[];
  schemaVersion: number;
};
```
El registro de componentes es estático/versionado. El runtime calcula la intersección de capacidades implementadas, permisos efectivos, tenant, estado de UI y datos accesibles.

## Contexto de sesión (propuesta)
```ts
type UIContextSnapshot = {
  schemaVersion: 1;
  sessionId: string;
  tenantId: string; actorId: string;
  threadId?: string; revision: number;
  location: {
    screenId: string; workspaceId?: string; viewId?: string;
    selectedEntityRefs?: string[]; focusedComponentId?: string;
    modalId?: string; panelId?: string;
  };
  visibleCapabilities: { componentId: string; instanceId: string; operations: string[] }[];
  timestamp: string;
};
```
La sesión web emite cambios **semánticos** (navegación, selección, apertura, filtro relevante), no cada hover o keystroke. Un reducer local actualiza el snapshot y transmite deltas/coalescing; backend valida sesión y deriva su proyección. Reconectar implica snapshot + revision; duplicados se deduplican. Eventos tardíos no deben revertir un estado más reciente.

## Proyección mínima al Fast
```text
kind=ui.context scope=session revision=42
workspace=hubspot view=customer.detail
selected=customer:8f21
available=open_detail,prepare_quote
```
El ejemplo es conceptual: no se inyecta el snapshot completo, inventario de 35 workspaces ni valores privados del formulario. La proyección se produce al preparar el turno o ante un cambio que materialmente afecte la respuesta. Presupuesto de tokens, prioridad, TTL, procedencia, trust y filtro por permisos. Datos de tarjetas son datos, nunca instrucciones.

## Comandos UI (propuesta)
```ts
type UICommand = {
  schemaVersion: 1; commandId: string;
  sessionId: string; expectedRevision: number;
  target: { componentId: string; instanceId?: string };
  operation: 'navigate'|'open'|'close'|'focus'|'select'|'applyFilter'|'setDraftValue'|'reorder';
  payload: unknown; // Zod discriminado por operación en implementación
};
type UICommandAck = {
  commandId: string; sessionId: string;
  state: 'applied'|'rejected'|'stale'|'not_found';
  resultingRevision?: number; reasonCode?: string;
};
```
**No incluir `save`, `send`, `approve`, `delete` ni `executeSop` como atajos UI.** Esas son capabilities de negocio con policy, auditoría y recibos propios. `setDraftValue` modifica un borrador, no persistencia.

## Protocolos y seguridad
1. El navegador no decide su tenant/actor autorizado: identidad de servidor.
2. La UI es una observación del cliente, no una prueba de permisos.
3. `expectedRevision` evita comandos obsoletos y efectos en formularios equivocados.
4. Reintentos idempotentes por `commandId`; ACK de éxito solo después de aplicar.
5. Revalidar permisos al ejecutar, incluso si la tarjeta indicaba capacidad.
6. El contexto de un dispositivo/hilo no se mezcla sin una política explícita con otro.
7. Revisiones, TTL, revocación y procedencia de UI/entidades; nunca datos secretos en prompts.
8. Comandos pendientes se cancelan o revalidan tras cambio de tenant, logout, navegación o revocación.

## Paths propuestos (NO existentes verificados)
`packages/domain/src/ui-context.ts`, `packages/domain/src/ui-command.ts`, `apps/web/src/ui-context/{registry.ts,provider.tsx,useUIComponent.ts}`, `apps/server/src/engine/ui-context/`, `apps/server/src/engine/ui-command/`. Antes de crearlos, contrastar convenciones y servicios ya existentes.
