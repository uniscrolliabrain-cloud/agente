# UI Redesign — Kit de interfaz profesional

> Documento vivo. Explica qué vamos a cambiar en la interfaz, por qué, y cómo migrar sin romper nada.
> Referencia visual: mockup del kit (sidebar izquierdo + centro + panel derecho plegables).

---

## 1. Por qué

La interfaz actual funciona pero tiene ruido. Problemas concretos que vamos a resolver:

- **Dos indicadores de estado** ("Worker Running" + "Live") que confunden. Nadie sabe qué mirar.
- **Jerga técnica** en la navegación ("Memoria", "Usuarios", "Agentes"). El cliente pyme no traduce eso.
- **Cuatro columnas del kanban siempre visibles** aunque estén vacías. Ocupan espacio y no dicen nada.
- **Nombre del workspace duplicado** (header + tarjeta del pie).
- **Banner de sesión caducada** sin acción. Bloquea al usuario.
- **Scrollbar grueso del sistema** dentro del sidebar.
- **Sugerencias del chat** mencionan datos que el usuario no ha conectado ("Acme").

El objetivo: **una interfaz que un empleado reconozca al instante** porque se parece a ChatGPT o Notion, pero con las capacidades de la empresa detrás.

---

## 2. Qué cambia (resumen)

| Actual | Nuevo |
|---|---|
| Header con "Agente IA Pro / Workspace" + 2 indicadores | Workspace switcher único arriba del sidebar |
| "Worker Running" + "Live" | Un solo indicador `.status` con estado real |
| Botón negro "Nuevo chat" | Fila con atajo Cmd+N |
| Buscador deshabilitado | Paleta Cmd+K funcional |
| "Memoria" en nav | "Lo que sabe de tu negocio" |
| "Usuarios" en nav | "Equipo" |
| "Agentes" deshabilitado | Se oculta hasta que exista |
| Tarjeta "Workspace activo" en el pie | Eliminada (ya vive en el switcher) |
| Kanban con 4 columnas fijas | Panel derecho con tabs: Tareas / Contexto / Negocio |
| Tareas vacías = 4 cajas vacías | Un único bloque `.pane-empty` |
| Banner rojo "Sesión expirada" sin salida | `.banner--error` con botón "Iniciar sesión" |
| Sugerencias "Revisa mi pipeline" | Chips genéricos: "Resumen de mi negocio", "Redactar un email", "Analizar un documento" |
| Scrollbar del sistema | `.scroll` fino, aparece al pasar el ratón |
| Paneles sin plegar | Los dos paneles plegables con `data-left` / `data-right` y persistencia |

---

## 3. Tokens de diseño

Los tokens viven en `apps/web/src/index.css` al principio del fichero. Se sustituyen por estos (paleta cálida, no gris industrial):

    :root {
      --bg: #ffffff;
      --bg-sidebar: #fafaf9;
      --bg-hover: #f3f1ee;
      --bg-active: #eeece9;
      --bg-input: #ffffff;
      --border: #eeece9;
      --border-strong: #e2dfdb;
      --text: #1c1917;
      --text-2: #57534e;
      --text-3: #6b655f;
      --accent: #5b4bdb;
      --accent-fg: #ffffff;
      --ok: #15803d;
      --warn: #b45309;
      --danger: #b91c1c;
      --danger-bg: #fef2f2;
      --danger-border: #fecaca;
      --font: "Instrument Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
      --fs-xs: 12px;
      --fs-sm: 13px;
      --fs-md: 15px;
      --fs-xl: 30px;
      --r-sm: 8px;
      --r-md: 14px;
      --r-lg: 20px;
      --r-pill: 999px;
      --sidebar-w: 260px;
      --panel-w: 340px;
      --topbar-h: 48px;
      --content-w: 720px;
      --shadow-composer: 0 1px 2px rgba(28,25,23,.04), 0 8px 24px rgba(28,25,23,.04);
      --t: 150ms ease-out;
    }

Modo oscuro por `[data-theme="dark"]` y por `prefers-color-scheme`. Los valores completos están en el kit.

Fuente Instrument Sans por `<link>` en `index.html`.

---

## 4. Estructura del shell

Tres columnas con estado en atributos del contenedor `.app`:

    <div class="app" data-left="open" data-right="open">
      <aside class="sidebar" id="sidebar" inert={!leftOpen}>...</aside>
      <main class="main">...</main>
      <aside class="panel" id="panel" inert={!rightOpen}>...</aside>
    </div>

- `data-left` / `data-right` = `"open" | "closed"`.
- El CSS anima el plegado por ancho, sin reflow del contenido interno (el `.sidebar__inner` tiene ancho fijo).
- El panel cerrado lleva `inert` para quedar fuera de foco y lectores de pantalla.
- Persistencia por usuario en `localStorage` (`ui.left`, `ui.right`).

En React, un hook `usePanel(key, defaultOpen)` que devuelve `[open, setOpen, toggle]`.

---

## 5. Bloques nuevos

Los componentes actuales se adaptan. Los nuevos:

- **Workspace switcher** (`.ws`): arriba del sidebar. Nombre + subtítulo + chevron. Un solo lugar donde vive esa información.
- **Paleta Cmd+K** (`<dialog class="palette">`): nativo, ya gestiona foco y Esc. Busca chats, tareas, documentos y comandos.
- **Panel derecho con tabs**: Tareas / Contexto / Negocio, `role="tablist"` con flechas.
- **Bloque de onboarding** (`.onboard`): "Primeros pasos" con 3 filas y check. Se retira al completar las tres.
- **Estado único** (`.status`): un solo indicador con `data-state` (`ok | working | offline | error`).
- **Composer central**: el mismo `ChatInput` actual con estilos nuevos. Input de una línea + barra inferior con adjuntos, "Asistente general", micrófono y enviar.
- **Chips de sugerencia** (`.chip`): rellenan el composer, no envían solas. Textos genéricos, sin datos que el usuario no ha conectado.
- **Mensajes con pasos del agente** (`<details class="steps">`): los tool calls se agrupan en un desplegable "N pasos completados".
- **Esqueleto** en streaming en vez de spinner.

---

## 6. Reglas de coherencia

**Una sola fuente de verdad para el estado del sistema.** El topbar, el composer y el banner de sesión se derivan del mismo `appState`:

    const appState = { session: "ok" }; // "ok" | "expired" | "offline" | "working"

- `session === "expired"` → `.status` en error, composer deshabilitado con placeholder "Inicia sesión…", `.banner--error` visible con botón.
- `session === "ok"` → todo normal.
- `working` (agente respondiendo) → `.status` en acento, no bloquea el composer.

**El estado no se comunica solo por color.** Los iconos de tarea cambian de forma (círculo / progreso / alerta / check). Los estados del sistema igual.

**Nombres en lenguaje de pyme.** "Memoria" → "Lo que sabe de tu negocio". "Usuarios" → "Equipo". Cada vez que aparezca jerga interna, se traduce o se oculta.

---

## 7. Orden de migración

Se hace en pasos separados, cada uno con su commit y su typecheck. No se toca todo a la vez.

1. **Tokens y base** (`index.css`). No cambia nada visible. Solo prepara variables y reset.
2. **Sprite de iconos SVG**. Se añade al `index.html`.
3. **Estados coherentes** (`.status` único + banner de sesión). Es lo que más resta credibilidad hoy.
4. **Shell plegable** (`.app` con `data-left` / `data-right` + hook `usePanel`).
5. **Sidebar completo** (workspace switcher + quick actions + nav + historial + user footer).
6. **Paleta Cmd+K**.
7. **Estado vacío del chat** (hero + composer central + chips + onboarding).
8. **Panel derecho con tabs** y estado vacío único.
9. **Conversación** (pasos del agente + acciones por mensaje + esqueleto).
10. **Modo oscuro** y revisión de contraste.

Cada paso se prueba contra el backend actual. La funcionalidad no cambia en ningún paso; solo la forma.

---

## 8. Ficheros afectados

Frontend (`apps/web/src/`):

| Fichero | Cambio |
|---|---|
| `index.css` | Tokens nuevos, reset, `.scroll`, bloques nuevos, media queries |
| `index.html` | Fuente Instrument Sans + sprite SVG |
| `App.tsx` | Shell nuevo, `usePanel` para los dos paneles |
| `components/Header.tsx` | Sustituido por `WorkspaceSwitcher.tsx` + `TopBar.tsx` |
| `components/ConversationsPanel.tsx` | Reescrito: workspace switcher + quick + nav + history + user |
| `components/ChatPanel.tsx` | Composer central cuando vacío, dock cuando hay mensajes |
| `components/MessageList.tsx` | Pasos del agente agrupados, esqueleto en streaming |
| `components/MessageBubble.tsx` | Acciones por mensaje (copiar, regenerar, convertir en tarea) |
| `components/ChatInput.tsx` | Arreglar regex whitespace y acumulación de voz mientras se reescribe |
| `components/KanbanPanel.tsx` | Renombrado a `TasksPanel.tsx`. Tabs + estado vacío único |
| `components/TaskCard.tsx` | Nuevo estilo, iconos por estado |
| `components/Login.tsx` | Reescrito con tokens nuevos |
| `components/ProfileModal.tsx`, `UserModal.tsx`, `UsersView.tsx` | Tokens nuevos, "Usuarios" → "Equipo" en textos |
| `components/DocumentsView.tsx`, `MemoryView.tsx` | Tokens nuevos, "Memoria" → "Lo que sabe de tu negocio" |
| `components/New components/` | `WorkspaceSwitcher.tsx`, `TopBar.tsx`, `CommandPalette.tsx`, `Onboarding.tsx`, `SuggestionChips.tsx` |

Backend: sin cambios. La API no se toca. Si acaso, se añade un campo `state` en `/api/health` para el indicador único, si no existe ya.

---

## 9. Fuera de alcance (por ahora)

- No se cambia el motor ni la API.
- No se migra a Tailwind, router, ni state manager global.
- No se meten librerías de UI (Radix, shadcn, MUI).
- No se rediseña el browser console (sigue como está).
- No se toca el kanban HTML del `web-components/`.

---

## 10. Estado

| Paso | Estado |
|---|---|
| 1. Tokens y base | Pendiente |
| 2. Sprite de iconos | Pendiente |
| 3. Estados coherentes | Pendiente |
| 4. Shell plegable | Pendiente |
| 5. Sidebar completo | Pendiente |
| 6. Paleta Cmd+K | Pendiente |
| 7. Estado vacío del chat | Pendiente |
| 8. Panel derecho con tabs | Pendiente |
| 9. Conversación | Pendiente |
| 10. Modo oscuro | Pendiente |

Cuando se empiece un paso, se marca "En curso" con la fecha. Al terminar, "Hecho". Si se cambia algo respecto al kit, se anota aquí.

---

## Referencia

- Mockup interactivo: https://claude.ai/artifact/Lk3gqU2QtT1uT6JCGbe9DM
- Kit completo con bloques, CSS y JS: pegado en el chat como "Kit de interfaz".