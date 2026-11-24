# Arquitectura de componentes (C03)

## Estructura

```
apps/ui-lab/src/apps-launcher/
├── AppsLauncher.tsx        raíz: superficies, modalidad, atajos globales
├── RestScreen.tsx          reposo: reloj, briefing, notificaciones, accesos
├── LauncherHome.tsx        escritorio: favoritas, carpetas, recientes, widgets, dock
├── AppDrawer.tsx           cajón + buscador instantáneo + grupos
├── AppIcon.tsx             icono reutilizable (home, drawer, dock, folder)
├── LauncherDock.tsx        dock inferior
├── LauncherFolder.tsx      carpeta como diálogo modal
├── RecentApps.tsx          pila de apps recientes
├── AppTransition.tsx       superficie de app con transición y cierre
├── LauncherWidgets.tsx     briefing, agenda, pendientes, agentes
├── launcher-catalog.ts     35 apps, iconos, carpetas, widgets, datos sintéticos
├── launcher-state.ts       estado, modalidad de entrada, persistencia, reloj
├── launcher.css            tokens, composición, motion y responsive (namespace alp-*)
└── icons/*.webp            35 iconos 320×320 del bundle
```

## Contratos

### `LauncherApp`

```ts
{ id, name, tagline, category, icon }
```

`id` es el identificador técnico del workspace (`01-gmail`…`35-centro-mando`). `icon` se resuelve con
`import.meta.glob("./icons/*.webp", { eager: true, query: "?url" })`, de modo que Vite emite los
archivos con hash y funcionan offline. Si falta un icono, el catálogo falla en tiempo de módulo: es
preferible un error visible a un icono roto silencioso.

### `useLauncher()`

Devuelve estado y acciones: `screen`, `activeAppId`, `origin`, `selectedId`, `folderId`, `query`,
`favorites`, `recents`, `dock`, `unlock`, `lock`, `openApp`, `closeApp`, `goHome`, `openDrawer`,
`openRecents`, `toggleFavorite`, `isFavorite`, `clearRecents`, `select`, `clearSelection`,
`openFolder`, `closeFolder`, `setQuery`.

- `openApp(id, rect)` guarda el rectángulo del icono, actualiza recientes (máx. 6, sin duplicados) y
  registra el nombre para devolver el foco.
- `closeApp()` vuelve al escritorio y enfoca el icono homónimo ya montado (no un nodo desmontado).
- Favoritos y recientes se persisten en `localStorage` (`agntia_launcher_v3`) con lectura defensiva.

### `useInputModality()`

Combina `matchMedia("(hover: hover) and (pointer: fine)")` con el último evento real
(`pointerdown`/`pointerType`, `touchstart`, `keydown`). Una tablet con ratón usa hover; un portátil
táctil cambia a táctil al tocar. La clase `alp-mod-*` en la raíz permite auditar la modalidad.

### `AppIcon`

Props: `app`, `selected`, `variant`, `onActivate(app, element)`, `onHoverChange`, `badge`.

- `aria-label` con el nombre visible, `aria-describedby` con la descripción, `aria-pressed` cuando
  está seleccionado.
- El nombre visual vive en un `span` superpuesto con `aria-hidden`.
- La activación la decide la raíz según la modalidad.

### `AppTransition`

Props: `app`, `origin`, `closing`, `isFavorite`, `onClose`, `onHome`, `onRecents`,
`onToggleFavorite`.

- `role="dialog"`, `aria-modal`, `tabIndex={-1}` y foco al montar.
- Escape propio en `document` (un único dueño) y cierre con animación de 240 ms.
- Contenido por categoría desde `DEMO_SURFACES`; etiqueta «Demostración» y nota de simulación.

## Aislamiento

- Todo el CSS vive bajo `.alp-root` con prefijo `alp-`. Sin `:root`, sin `!important` (solo el bloque
  de reduced motion, acotado), sin z-index fuera de la pila del launcher (overlay 40, superficie 50).
- Única concesión al marco: `.lab-embed:has(.alp-root)` para que el launcher ocupe la altura exacta
  del laboratorio. Solo se activa con esta vista montada.
- Sin librerías nuevas: React 18, `lucide-react` y el sistema existente.

## Registro

`apps/ui-lab/src/registry.tsx`:

```ts
const AppsLauncher = lazy(() => import("./apps-launcher/AppsLauncher"));

{ id: "apps-launcher-v3", name: "Apps · Launcher V3", category: "Trabajo",
  description: "Launcher empresarial: reposo, escritorio, cajón de 35 apps, carpetas, recientes y apertura con transición",
  Component: AppsLauncher, status: "demo" }
```

La vista anterior de Apps no se sustituye: el catálogo documental sigue siendo la fuente y el
prototipo HTML se conserva como referencia.
