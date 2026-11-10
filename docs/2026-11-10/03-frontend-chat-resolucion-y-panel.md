# 03 · Frontend: resolución desde el chat y panel contextual

> v1 · 2026-11-10 · Estado: handoff
>
> Base: commit `804d8f7`. Archivos clave: `apps/web/src/hooks/useViewResolver.ts`, `apps/web/src/components/ChatPanel.tsx`, `apps/web/src/components/ContextualPanel.tsx`, `apps/web/src/App.tsx`.

## El problema que se corrigió

En el legacy, el chat podía disparar la resolución de una vista más de una vez por el mismo mensaje. El streaming provoca re-renders; el panel se montaba con un spec suelto; y si el resolver no encontraba nada, la vista anterior desaparecía. Además, no había correlación entre la petición y el mensaje que la había originado, así que una respuesta lenta podía pisar el resultado de una petición más reciente. El frontend tampoco distinguía entre “cargando”, “error” y “no hay vista”: el panel aparecía vacío y el usuario no sabía si el sistema estaba trabajando o si se había roto.

La corrección se hizo en tres capas: el hook `useViewResolver`, el disparo desde `ChatPanel` y la presentación en `ContextualPanel`. `App` es el punto donde se conectan las tres y donde se decide si el panel se monta o no. La regla de oro es: **una resolución por mensaje de usuario, una sola petición viva y la vista anterior se conserva si el nuevo intent no produce nada**.

## `useViewResolver`

El hook mantiene `view`, `loading`, `error`, una `sequence` numérica y un `AbortController` en refs. `resolve(intent, options)` hace lo siguiente:

1. Incrementa `sequence` y guarda el `requestId`.
2. Aborta la petición anterior si existe.
3. Crea un `AbortController` nuevo y lo guarda en `abortRef`.
4. Marca `loading` y limpia el error.
5. Hace `apiFetch<{ view: ViewEnvelope | null }>("/api/views/resolve", { method: "POST", body: { intent, ...options }, signal })`.
6. Si el `requestId` ya no es el actual, ignora la respuesta.
7. Si `res.view` existe, actualiza el estado; si es `null`, **no borra** la vista actual.
8. Si hay error y la petición no fue abortada, solo actualiza el error si sigue siendo la petición actual.
9. En `finally`, solo apaga `loading` si sigue siendo la petición actual.

`clear()` incrementa la secuencia, aborta la petición viva, pone el controller a `null`, limpia la vista, el loading y el error. Eso evita que una respuesta tardía vuelva a abrir un panel que el usuario acababa de cerrar.

El hook devuelve `{ view, spec: view?.spec ?? null, loading, error, resolve, clear }`. `spec` se conserva por compatibilidad con consumidores antiguos, pero el contrato nuevo es `view`. Cualquier código nuevo debe usar `view` y no `spec` para leer permisos, fuente o frescura.

`ResolveViewOptions` acepta `workspaceId`, `viewId`, `entityId`, `messageId` y `threadId`. El hook no decide el workspace ni el hilo; los recibe del host. Eso permite que el mismo hook sirva al chat global y a una vista contextual de workspace.

## `ChatPanel`: una resolución por mensaje

`ChatPanel` recibe `chat` y `onResolveView(intent, messageId?)`. Tiene un `lastResolvedRef` que guarda la última clave resuelta. En un `useEffect` sobre `chat.messages` y `chat.threadId`:

1. Busca el último mensaje con `role === "user"`.
2. Si no tiene contenido, no hace nada.
3. Construye la clave `${chat.threadId ?? "no-thread"}:${lastUser.id}`.
4. Si la clave ya es la última resuelta, sale.
5. La guarda y llama a `onResolveView(lastUser.content, lastUser.id)`.

La clave incluye el hilo y el id del mensaje. Eso resuelve dos problemas: el streaming o un re-render no vuelven a pedir la misma vista, y dos mensajes distintos con el mismo texto sí se resuelven por separado. Si el hilo cambia, la clave cambia y se permite una nueva resolución.

El panel no usa el contenido del asistente para decidir la vista. Usa el último mensaje del usuario. Es una decisión deliberada: la vista responde a la intención humana, no a la narración del modelo. Si en el futuro el modelo propone una vista con una tool, ese será un camino distinto y deberá tener su propia correlación; no conviene mezclarlo con este efecto.

## `App`: el puente entre chat y panel

`App` llama a `useViewResolver`, desestructura `view`, `loading`, `error`, `resolve` y `clear`, y define `handleResolveView` con `useCallback`. Ese callback añade al intent el `messageId`, el `activeWorkspaceId` y el `threads.activeId`. Si no hay workspace activo, no manda `workspaceId`; si no hay hilo, no manda `threadId`. `ChatPanel` recibe `onResolveView={handleResolveView}`.

El panel se monta solo si hay `resolvedView`, `viewLoading` o `viewError`:

```tsx
const panel = resolvedView || viewLoading || viewError ? (
  <ContextualPanel
    view={resolvedView}
    loading={viewLoading}
    error={viewError}
    onClose={clearView}
  />
) : undefined;
```

Eso elimina el panel vacío permanente del legacy. `AppShell` recibe `panel` como `undefined` cuando no aplica y no reserva un hueco inútil. Cuando el usuario escribe y aún no hay respuesta, el panel aparece con “Resolviendo vista...”; si la petición falla, aparece el error; si el backend devuelve `view: null` y no había vista previa, el panel no se monta.

## `ContextualPanel`

El panel recibe un `ViewEnvelope | null`, `loading`, `error`, `onClose` y `onAction`. Si no hay vista, ni loading, ni error, devuelve `null`. Si hay vista, muestra el título de `view.spec.title`, el proveedor de `view.source.provider` y el botón de cerrar. En el cuerpo:

- Si `loading`, muestra “Resolviendo vista...”.
- Si `error`, muestra un `div` con `role="alert"`.
- Si `view.permissions.canView` es falso, muestra “No tienes permiso para ver esta vista.”
- Si hay vista y permiso, renderiza `<ViewRenderer spec={view.spec} onAction={onAction} />`.
- Si no hay vista ni loading ni error, muestra el texto de “Escribe en el chat...”, aunque en la práctica el panel no se monta en ese caso.

El panel no muestra todavía `provenance`, `freshness` ni `canAct`. El contrato los lleva, pero la UI solo usa `source.provider` y `canView`. Eso es una brecha de producto, no de contrato: la información está disponible para el siguiente paso.

## Qué pasa cuando el backend no devuelve vista

Hay tres casos que conviene distinguir:

1. **El intent no produce vista y ya había una**: el hook conserva la anterior. Es el comportamiento correcto para no parpadear.
2. **El intent no produce vista y no había ninguna**: el panel no se monta. El chat sigue funcionando; no se inventa una vista vacía.
3. **La petición falla**: se muestra el error, pero la vista anterior se conserva si existía. El usuario puede cerrar el panel o seguir escribiendo.

No hay un botón de reintento en el panel. Tampoco hay un indicador de “vista obsoleta” aunque `freshness.stale` pueda ser `true` en el fallback legacy. El panel legacy muestra el proveedor `legacy`, pero no advierte de que el dato es stale. Esa es una mejora pendiente.

## Concurrencia y ciclo de vida

El hook usa `AbortController`, no solo un booleano `cancelled`. Eso cancela la petición HTTP real cuando llega otra, no solo ignora el resultado. La secuencia protege además contra respuestas que lleguen fuera de orden si el abort no se propaga. `clear()` también aborta, así que cerrar el panel no deja una petición que pueda reabrirlo.

`ChatPanel` no aborta la resolución al desmontarse; el hook vive en `App`, que no se desmonta mientras hay sesión. Si en el futuro el hook se mueve a un componente que se monta y desmonta, habrá que añadir un cleanup que aborte al desmontar. Hoy la protección está en `clear()` y en el reemplazo de peticiones.

## Límites y deuda de esta capa

- No hay tests unitarios de `useViewResolver` ni de `ChatPanel`. La verificación fue typecheck y la suite del backend; el comportamiento de concurrencia no tiene un test de React.
- No hay test E2E que demuestre que un mensaje produce una sola petición. La clave `threadId:messageId` es la garantía de diseño, pero no está cubierta por un test de navegador.
- El panel no muestra procedencia, frescura ni acciones. `onAction` existe en el tipo, pero `App` no lo pasa.
- El fallback legacy sigue vivo. Si el chat no tiene `workspaceId`, el backend puede devolver un envelope `legacy` con `stale: true`; la UI no lo distingue visualmente.
- No hay historial de vistas ni forma de volver a una vista anterior. El panel solo tiene la última.
- No hay deep link ni persistencia de la vista en la URL.

Para el siguiente agente: si se toca la resolución, mantener la clave por mensaje y la semántica de “null no borra”. Si se añade un botón de refresco, debe reutilizar el mismo `messageId` o generar una clave nueva explícita; no conviene disparar el efecto por un re-render. Si se añade un test, el caso más valioso es “dos mensajes seguidos, la primera respuesta llega tarde y no pisa la segunda”.
