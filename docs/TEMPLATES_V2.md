# Templates V2 - Panel contextual servido por el OS

> **TEMPLATES_V2_PLAN**
>
> Plan de los 7 templates de Fase 1, la frontera backend/frontend, y el
> catalogo cerrado de `ViewSpec`. Es la vision tecnica de como el LLM sirve
> la UI segun el trabajo del usuario.

---

## Vision

**El usuario no navega pantallas. El usuario pide trabajo.**

En una herramienta tradicional, el usuario abre una vista y luego hace cosas.
En un OS cognitivo, el usuario dice algo y el sistema **monta la vista adecuada**.

Pero **el menu tradicional se queda**. Los dos modos conviven:

1. **Modo navegacion** - el usuario clica en Chat, Tareas, Documentos, etc.
2. **Modo servido** - el usuario pide algo concreto ("como va el pipeline") y
   el OS monta una vista contextual.

El usuario decide cuando navega y cuando pide.

---

## Principio de diseno

**El backend decide QUE se muestra. El frontend decide COMO se ve.**

| Cosa | Backend decide | Frontend decide |
|---|---|---|
| Que template se usa | Si (ViewResolver) | No |
| Que datos lleva el spec | Si (Views.toSpec) | No |
| Que chips de procedencia | Si | No |
| Como se renderiza el template | No | Si |
| Como se anima | No | Si |
| Cuando aparece el panel | No | Si |
| Si el panel va inline, lateral o full | No | Si |

---

## Los 7 templates de Fase 1

Estos cubren el 90% del trabajo real de una pyme. Con estos 7, el producto es
vendible.

### 1. `dashboard` - "Como va"

**Cuando se sirve:** "como va el negocio", "resumen del mes", "como esta el
cashflow", "estado del equipo", "como van las ventas".

**Datos:** KPIs, mini-graficos, listas por area, alertas.

**Componente React:** `DashboardTemplate.tsx`.

### 2. `queue` - "Que esta pasando ahora"

**Cuando se sirve:** "que esta haciendo el agente", "que hay en marcha",
"ensename las tareas de hoy", "mis tareas".

**Datos:** tareas agrupadas por estado (En cola / Trabajando / Esperando OK /
Completado hoy).

**Componente React:** `QueueTemplate.tsx`.

### 3. `inbox` - "Que necesita mi OK"

**Cuando se sirve:** "que tengo pendiente", "aprobaciones", "revisar antes de
enviar".

**Datos:** propuestas pendientes (`ActionProposal` en `awaiting_review`),
tareas en `waiting_input` con pregunta, ordenadas por urgencia.

**Componente React:** `InboxTemplate.tsx`.

### 4. `board` - "Algo en curso"

**Cuando se sirve:** "como va el pipeline", "cliente Acme" (si hay varios),
"proceso de alta", "el proyecto X".

**Datos:** entidades del business graph de un tipo, agrupadas por `status`.

**Componente React:** `BoardTemplate.tsx`.

### 5. `table` - "Comparar y decidir"

**Cuando se sirve:** "comparame estos proveedores", "lista de facturas", "top
clientes", "todas las facturas pendientes".

**Datos:** cualquier coleccion con columnas configurables.

**Componente React:** `TableTemplate.tsx`.

### 6. `detail` - "Un item con contexto"

**Cuando se sirve:** "cliente Acme" (si hay uno solo), "factura 47", "el
contrato del proveedor".

**Datos:** un item + sus propiedades + relaciones + timeline + artifacts.

**Componente React:** `DetailTemplate.tsx`.

### 7. `form` - "Rellenar algo"

**Cuando se sirve:** "alta de cliente", "nueva factura", "datos del proveedor",
"prepara el envio".

**Datos:** campos del formulario, precargados desde business graph + memoria,
con chips de procedencia (auto/alta/media/sugerido/tu).

**Componente React:** `FormTemplate.tsx`.

---

## Templates secundarios (Fase 2+, si el uso lo pide)

No hacen falta para vender, si para madurar:

- `timeline` - cronologia. "Que paso con X", "actividad de la semana".
- `graph` - visualizacion de relaciones. "Mapa de proveedores".
- `chart` - graficos especificos. "Ingresos por mes".
- `compare` - dos o mas items lado a lado. "Comparar propuestas A y B".
- `calendar` - vista de calendario. "Agenda del mes".
- `document` - PDF o artifact con anotaciones.

---

## El catalogo cerrado de `ViewSpec`

El `ViewSpec` es JSON validado con Zod. El backend lo genera. El frontend lo
consume. **Nunca HTML libre del LLM.**

### Estructura base

```ts
export interface ViewSpecBase {
  id: string;
  title: string;
  subtitle?: string;
  provenance: {
    source: string;         // "llm" | "user" | "system"
    intent?: string;
    turnId?: string;
  };
}
```

### `DashboardSpec`

```ts
export interface DashboardSpec extends ViewSpecBase {
  kind: "dashboard";
  kpis: Array<{
    label: string;
    value: number;
    format: "number" | "currency" | "percent";
    trend?: "up" | "down" | "flat";
    trendValue?: number;
  }>;
  sections: Array<{
    title: string;
    kind: "list" | "chart" | "mini-table";
    data: unknown;
  }>;
  alerts: Array<{
    severity: "info" | "warn" | "danger";
    title: string;
    body: string;
  }>;
}
```

### `QueueSpec`

```ts
export interface QueueSpec extends ViewSpecBase {
  kind: "queue";
  columns: Array<{
    id: string;
    label: string;
    filter: { status: string[] };
  }>;
  cards: Array<{
    id: string;
    columnId: string;
    title: string;
    subtitle?: string;
    tag?: { label: string; color: string };
    avatar?: string;
    dueAt?: string;
    status: "running" | "waiting" | "done" | "idle";
    href: string;  // ruta o id de task
  }>;
}
```

### `InboxSpec`

```ts
export interface InboxSpec extends ViewSpecBase {
  kind: "inbox";
  items: Array<{
    id: string;
    type: "approval" | "input" | "info";
    title: string;
    body: string;
    context?: string;
    priority: "low" | "medium" | "high";
    dueAt?: string;
    actions: Array<{
      id: string;
      label: string;
      kind: "approve" | "deny" | "open" | "edit";
    }>;
  }>;
}
```

### `BoardSpec`

```ts
export interface BoardSpec extends ViewSpecBase {
  kind: "board";
  entityType: string;
  columns: Array<{
    id: string;
    label: string;
    status: string;
  }>;
  cards: Array<{
    id: string;
    columnId: string;
    title: string;
    subtitle?: string;
    keyProperty?: { label: string; value: string };
    updatedAt?: string;
    avatar?: string;
  }>;
}
```

### `TableSpec`

```ts
export interface TableSpec extends ViewSpecBase {
  kind: "table";
  columns: Array<{
    key: string;
    label: string;
    type: "text" | "number" | "date" | "chip" | "action";
    sortable?: boolean;
    align?: "left" | "right" | "center";
  }>;
  rows: Array<Record<string, unknown>>;
  totalCount?: number;
  pageSize?: number;
  filters?: Array<{
    key: string;
    label: string;
    options: string[];
  }>;
}
```

### `DetailSpec`

```ts
export interface DetailSpec extends ViewSpecBase {
  kind: "detail";
  entityId: string;
  entityType: string;
  properties: Array<{
    key: string;
    label: string;
    value: unknown;
    provenance: "auto" | "alta" | "media" | "sugerido" | "tu";
  }>;
  relations: Array<{
    id: string;
    type: string;
    targetId: string;
    targetName: string;
    direction: "in" | "out";
  }>;
  timeline: Array<{
    id: string;
    date: string;
    title: string;
    body?: string;
  }>;
  artifacts: Array<{
    id: string;
    kind: string;
    title: string;
    url: string;
  }>;
}
```

### `FormSpec`

```ts
export interface FormSpec extends ViewSpecBase {
  kind: "form";
  entityType: string;
  fields: Array<{
    key: string;
    label: string;
    type: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
    required?: boolean;
    options?: string[];
    placeholder?: string;
    value?: unknown;
    provenance: "auto" | "alta" | "media" | "sugerido" | "tu" | "missing";
  }>;
  submitLabel?: string;
  cancelLabel?: string;
}
```

---

## Donde se renderiza cada `ViewSpec`

**El mismo spec se puede renderizar en 3 sitios:**

1. **Inline en el chat.** Cuando la vista es pequena (una tabla de 5 filas, un
   `detail` corto).
2. **Panel contextual a la derecha.** Cuando la vista es mediana. El chat sigue
   visible a la izquierda.
3. **Panel principal.** Cuando el usuario clica "abrir como vista" o cuando
   navega desde el menu.

**El usuario decide donde.** El backend no sabe donde se va a renderizar.

---

## Flujo completo

```
usuario escribe en el chat
  ↓
IntentResolver detecta intencion (o el LLM lo hace)
  ↓
Views.toSpec(ctx, intent) genera ViewSpec
  ↓
Backend emite el spec por SSE (evento "view.resolved")
  ↓
Frontend recibe el spec
  ↓
Frontend decide: inline en chat, panel contextual, o panel principal
  ↓
ViewRenderer mapea spec.kind → componente
  ↓
Componente renderiza el spec con las animaciones
```

---

## Como se sirve (3 opciones de UX)

### Opcion A - El chat responde con texto + boton "abrir como vista"

El LLM responde: "Este mes has cerrado 3 leads, tienes 5 contactados y 2
perdidos. Quieres verlo como tabla?". El usuario clica y el frontend carga el
`ViewSpec`.

**Ventaja:** no invade.
**Desventaja:** requiere un click.

### Opcion B - El chat responde con la vista inline

El chat **no responde con texto**. Responde con una tabla renderizada dentro del
chat.

**Ventaja:** cero friccion.
**Desventaja:** si la vista es grande, no cabe.

### Opcion C - El chat responde con texto Y panel contextual al lado

El chat dice: "3 leads cerrados este mes." Y **al mismo tiempo**, en el panel
derecho, aparece una tabla con el detalle.

**Ventaja:** texto + dato visual. Lo mejor de los dos mundos.
**Desventaja:** necesita el panel ya montado.

**Recomendacion: C.** Es lo que hacen ChatGPT Canvas, Claude Artifacts. El
usuario lee el resumen y ve el detalle.

---

## Como convive con el menu actual

El menu actual (Chat, Tareas, Documentos, Conocimiento, Proyectos, Centro de
control, Equipo) **no se rompe**. Cada item del menu es internamente un
`ViewSpec` de uno de los 7 templates:

| Menu actual | Template | Notas |
|---|---|---|
| Chat | (siempre) | El chat es siempre el chat. |
| Tareas | `queue` | Vista fija de todas las tareas. |
| Documentos | `table` | Vista fija de archivos. |
| Conocimiento | `table` o `board` | Lista de memorias. |
| Proyectos | `board` o `detail` | Lista de proyectos. |
| Centro de control | `dashboard` | Dashboard fijo. |
| Equipo | `table` | Lista de usuarios. |

**Esto es potente:** cuando anadas un tipo de trabajo nuevo, solo tienes que
ensenarle al LLM a generar el `ViewSpec` adecuado. La vista del menu no cambia.

---

## Regla de oro

**Nunca cambies la vista principal del usuario sin que lo pida.**

Si el usuario esta en "Tareas" y escribe en el chat "como va el mes", **no**
cambies el panel principal a un dashboard. Muestra el dashboard en el **panel
contextual**. El usuario decide si clicar para que ocupe todo.

---

## Que NO se hace

- **No introducir 20 templates.** 7 cubren el 90%.
- **No dejar que el LLM genere HTML.** El `ViewSpec` es JSON validado.
- **No tener un "modo avanzado".** El OS le sirve el template que corresponde.
- **No duplicar vistas en el nav.** El nav es para cambiar de modo de trabajo.
- **No kanban "de verdad" con drag&drop complejo.** El `queue` cubre el 90%.
- **No editor rich text.** No es Notion. El `detail` con notas basta.
- **No multi-panel tipo IDE.** Un dueno de pyme quiere una cosa clara a la vez.
- **No pagina de configuracion con 50 tabs.** El OS se configura por chat.

---

## Fases de implementacion

### Fase 1a - Tipos y contratos

- `packages/domain/src/views.ts` con los 7 tipos de spec.
- `apps/web/src/view/spec.ts` reexportando del dominio.

### Fase 1b - Generacion en backend

- `Views.toSpec()` en `apps/server/src/kernel/graph/views.ts`.
- `ViewResolver` en `apps/server/src/engine/views/resolver.ts`.
- Endpoint `POST /api/views/resolve` en `apps/server/src/routes/views.ts`.

### Fase 1c - Consumo en frontend

- `apps/web/src/view/ViewRenderer.tsx` (mapa template → componente).
- 7 componentes en `apps/web/src/templates/*`.
- Panel contextual en `apps/web/src/components/ContextualPanel.tsx`.
- Cableado en `ChatPanel.tsx`.

### Fase 1d - Mockups y pulido

- Mockups de la otra IA (7 pantallas).
- Conversion a React.
- Animaciones (Fase 2).

---

## Como se pide a la otra IA los mockups

Prompt tipo:

> Disena 7 pantallas de un OS cognitivo para pymes. Cada una usa una paleta
> calida (beige, crema, verde suave, violeta suave). Necesito:
>
> 1. Dashboard: KPIs arriba con numero grande, mini-graficos o listas, alertas abajo.
> 2. Queue: kanban de 4 columnas (En cola / Trabajando / Esperando OK / Completado).
> 3. Inbox: lista vertical de aprobaciones con titulo, tipo, contexto, botones.
> 4. Board: kanban por estado con tarjetas de entidad.
> 5. Table: tabla con columnas, filas, sorting, filtros, paginacion.
> 6. Detail: un item con propiedades, relaciones, timeline, artifacts.
> 7. Form: formulario con campos precargados y chips de procedencia.
>
> Devuelveme el HTML + CSS puro de cada una. Sin React. Sin JS. Solo markup.

Con esas 7 pantallas en HTML+CSS, se convierten a componentes React que consumen
`ViewSpec`.

---

## Criterios de cierre Fase 1

- El usuario escribe "como va el pipeline" y aparece un `board` en el panel.
- El usuario escribe "facturas pendientes" y aparece un `table`.
- El usuario escribe "como va el mes" y aparece un `dashboard`.
- Los 7 templates renderizan specs reales.
- El panel contextual aparece con slide-in suave.
- El menu tradicional sigue funcionando.
- Typecheck frontend en 0.

---

Fin del plan.
