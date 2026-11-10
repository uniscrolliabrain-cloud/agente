# 01 · Contexto, diagnóstico y contrato

> v1 · 2026-11-10 · Estado: handoff
>
> Audiencia: otra IA que herede el trabajo sobre vistas servidas de `agente`.
>
> Base: `main`, commit `804d8f7`; contrato de gestoría en `155f799`.

## El encargo original

La conversación empezó con una petición concreta: auditar y diagnosticar el legacy de vistas servidas de `agente` antes de tocar código. El usuario no quería otro parche sobre el resolver existente; quería entender por qué el sistema servía vistas de forma incoherente y cómo cerrar esa deuda sin crear un contrato nuevo por encima de los que ya existían. Después de revisar el estado, autorizó ejecutar todo de forma autónoma. El trabajo se hizo en `agente`, no en `agntia-gestoria`. El contrato de integración se dejó en `docs/07-integraciones/GESTORIA.md` para que el usuario lo traslade manualmente al repositorio de gestoría más adelante.

El objetivo de producto era que una vista servida no fuera solo un JSON de presentación. Debía llevar identidad de tenant, procedencia, frescura, permisos y fuente. Además, las vistas de workspace debían ejecutar queries reales, no builders con KPIs a cero. El chat debía resolver una vista como máximo una vez por mensaje, sin duplicar peticiones durante el streaming ni borrar la vista anterior cuando un intent no produjera nada.

## El diagnóstico: cuatro contratos y un evento muerto

El legacy no tenía un solo problema; tenía varios contratos que se solapaban sin una autoridad clara. El primero era `WorkspaceSpec`/`ViewSpec` en `packages/domain/src/workspace-spec.ts`, usado por el generador de workspaces y por la idea de “spec de workspace”. El segundo era `RuntimeViewSpec` en `packages/domain/src/views.ts`, la unión discriminada real que consumía el renderer y que tenía siete kinds: dashboard, queue, inbox, board, table, detail y form. El tercero era `WorkspaceViewDeclaration` en `packages/workspaces/src/contracts/workspace-view.ts`, la declaración que vive dentro de cada módulo de workspace y que incluye `id`, `intent`, `kind`, `title`, `query` y `actions`. El cuarto era un `ViewSpec` duplicado y muerto en `apps/web/src/view/spec.ts`, con un esquema de frontend que no era el que usaba el renderer.

A esos cuatro se sumaba el evento `view.resolved`. `conversation.ts` emitía un evento con un payload mínimo (`kind: "dashboard"`, un título recortado y `spec: {}`) que no servía para pintar nada. El frontend no lo consumía por SSE. El evento estaba en `SYSTEM_EVENT_TYPES` y en `payloadSchemas`, pero era un canal muerto: parecía que el sistema “servía vistas” cuando en realidad solo publicaba una intención vacía. Ese evento se eliminó del enum, del schema, del test y del turno de conversación. No se debe reintroducir como bus de vistas.

El diagnóstico también encontró que 34 módulos de workspace no declaraban ninguna vista (`views: []`). El generador ponía `defaultView: "dashboard"` aunque no existiera un dashboard real. El resolver por regex registraba intenciones globales al importar el módulo y devolvía builders con KPI cero y listas vacías. Solo había dos renderers reales, dashboard y queue; los otros cinco kinds caían en un placeholder o no se renderizaban. Y el disparo estaba duplicado: el chat podía pedir la vista y el turno del servidor también intentaba producirla, sin una clave de correlación que evitara repetir el trabajo.

## La decisión de contrato

La decisión fue no crear un quinto contrato de vistas. `ViewEnvelope` pasa a ser el contrato canónico de una vista servida. `RuntimeViewSpec` queda dentro del envelope como `spec`, porque sigue siendo el payload que entiende el renderer. `WorkspaceViewDeclaration` sigue siendo la declaración que vive en cada módulo y que dice qué vista se puede ejecutar y con qué query. El adapter traduce la declaración y el resultado real de la query a un `ViewEnvelope`. Esa separación es deliberada: la declaración no es el resultado, el resultado no es el layout y el layout no es la identidad ni los permisos.

El envelope añade cinco cosas que antes había que adivinar: `tenantId`, `provenance`, `freshness`, `permissions` y `source`. `provenance` es una lista acotada de fuentes con `source`, `ref`, `label` y `asOf`. `freshness` incluye `generatedAt`, opcionalmente `sourceAsOf`, y un booleano `stale`. `permissions` incluye `canView` y `canAct`. `source` declara proveedor, workspace y, si aplica, entidad. La validación se hace con Zod en `packages/domain/src/view-envelope.ts`; `parseViewEnvelope` devuelve `null` si el envelope no cumple.

La consecuencia práctica es que el frontend ya no recibe “un spec y ya verás”. Recibe un objeto con la vista y su contexto. El panel puede mostrar la fuente, puede negar la vista si `canView` es falso y puede saber si el dato está obsoleto. Hoy la UI solo usa una parte de esa información, pero el contrato ya está preparado para el resto.

## El contrato con `agntia-gestoria`

En paralelo se documentó el contrato de integración con gestoría en `docs/07-integraciones/GESTORIA.md`, commit `155f799`. Ese documento fija principios que condicionan cualquier trabajo futuro. Gestoría es la fuente de verdad de empresas, registros económicos, preparaciones, expedientes, documentos y cálculos. `agente` es dueño de la conversación, la relevancia y la presentación. Odoo es invisible para la UI de `agente`: el adaptador Odoo normaliza dentro de gestoría y `agente` nunca recibe filas crudas. La revisión humana no se delega. Todo dato presentado debe tener procedencia y frescura. Los contratos son versionados y aditivos.

El contrato también define el change feed propuesto (`GET /api/companies/{id}/changes`), los read models que se conservan, el envelope que gestoría debe devolver y las acciones que `agente` puede proponer frente a las que requieren un humano. No se implementó el change feed en este repositorio; queda como trabajo de integración. El documento está en `agente` porque el usuario dijo que lo pasaría él mismo a gestoría. Por eso este workspace no debe modificar `agntia-gestoria/` ni asumir que su `main` remoto contiene el contrato.

## Qué quedó cerrado y qué no

Quedó cerrado el flujo principal: el chat pide una vista por HTTP, el backend ejecuta una query de workspace, el adapter produce un envelope y el frontend lo pinta. Quedó cerrada la eliminación del evento muerto. Quedó cerrada la cobertura de los 34 módulos con una vista table por defecto. Quedó cerrada la limpieza del `view/spec.ts` duplicado. Quedó cerrado el commit `804d8f7` y su push a `main`.

No quedó cerrado el gobierno de permisos real. Las rutas construyen un `WorkspaceContext` con `permissions: []` y el dispatcher no aplica un `PolicyEngine`. `permissions.canView` se rellena con `true` en el adapter, salvo que el resultado sea `forbidden`. Eso es un contrato de transporte, no una autorización completa. Tampoco quedó cerrada la ejecución de acciones desde la UI, ni los templates de timeline/graph, ni la integración real con gestoría. Esas brechas están desarrolladas en el documento 06.

## Reglas para quien herede

No volver a usar `RuntimeViewSpec` como contrato completo. No volver a emitir `view.resolved`. No crear builders por defecto que inventen filas. No exponer filas crudas de proveedores externos. No usar el `tenantId` que mande el navegador; el tenant se resuelve en el servidor. No tocar `agntia-gestoria` desde este workspace. Antes de cambiar el envelope, leer los tests de `view-envelope` y el adapter; antes de cambiar el flujo del chat, leer `useViewResolver` y `ChatPanel`; antes de cambiar workspaces, leer `default-views`, `WorkspaceShell` y `useWorkspaceView`.
