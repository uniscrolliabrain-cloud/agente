<!-- WHATSAPP_UI_HANDOFF_V2 -->
# Handoff v2 - Workspace 02-whatsapp (frontend)

> Para otra IA. Autocontenido. No asume nada del repo.
> Estado actual: UI base creada, sin montar.
> Rama: feat/chat-workspace-base

---

## 0. Contexto en una frase

En el repo `agente` se ha creado la UI del workspace 02-whatsapp (chat
multipartiparte de 4 columnas, estilo WhatsApp Web, mockup
`agntia-wassap-v2.png`). Los 18 ficheros existen, compilan y usan la
paleta real del repo. Falta: montar el chat en la app, actualizar el
index del workspace, escribir los docs internos y decidir como se
conecta al backend. Ese es el trabajo del v2.

---

## 1. Entorno

- Repo: `C:\Users\Alfonso\Desktop\git hub repos\agente`
- Shell: PowerShell en Windows. Rutas con espacios SIEMPRE entre comillas dobles.
- Package manager: pnpm. Node >= 22.
- El humano ejecuta los comandos. La IA genera los bloques.
- Un patchset = un bloque PowerShell = un fichero. Nunca un script con 18 ficheros.
- Sin `&&`, sin `;`. Un comando por linea.
- Nunca `git add .`. `git add` selectivo por fichero.
- UTF-8 sin BOM con `[System.IO.File]::WriteAllText(..., (New-Object System.Text.UTF8Encoding $false))`.
- Idempotencia por marca: si el fichero existe y contiene la marca, SKIP. Si existe sin marca, MISS y aviso.

---

## 2. Reglas duras del repo (aprendidas a base de romperlo)

### 2.1. Paleta Tailwind real

El repo NO usa `canvas`, `surface`, `line`, `ink`, `muted`, `accent`,
`accentsoft`, `online`. Esos son inventados. Los colores reales estan en
`apps/web/tailwind.config.js` y son:

- Fondos: `bg`, `bg-card`, `bg-soft`, `bg-softer`
- Bordes: `border`, `border-soft`, `border-strong`
- Texto: `text`, `text-2`, `text-3`, `text-4`
- Acento: `purple`, `purple-soft`
- Estado: `green`, `orange`, `warn`, `warn-border`, `warn-text`, `info`, `info-border`, `info-text`

Mapeo de las clases del chat (ya corregidas en la UI actual):

| Clase inventada | Clase real |
|---|---|
| `bg-canvas` | `bg-bg-card` |
| `bg-surface` | `bg-bg-soft` |
| `border-line` | `border-border` |
| `text-ink` | `text-text` |
| `text-muted` | `text-text-2` |
| `bg-accent` | `bg-purple` |
| `text-accent` | `text-purple` |
| `border-accent` | `border-purple` |
| `bg-accentsoft` | `bg-purple-soft` |
| `bg-online` | `bg-green` |
| `text-canvas` (sobre fondo oscuro) | `text-white` |

### 2.2. Tipografia

El repo usa `Instrument Sans`. NO meter `Inter` ni otra fuente.

### 2.3. Dark mode

El repo NO tiene dark mode. NO meter `@media (prefers-color-scheme: dark)`.
NO meter `data-theme`. Si algun dia se anade, se hace en un frente propio.

### 2.4. Radii y shadows

El repo tiene `rounded-card` (28px), `rounded-pill` (999px),
`shadow-card`, `shadow-soft`, `shadow-composer`. Usarlos cuando toque.

### 2.5. Imports con extension

El `tsconfig` usa `moduleResolution: NodeNext`. Todos los imports locales
llevan extension explicita: `./types.ts`, `../api.ts`, `./Avatar.tsx`.
Sin extension, `tsc` falla.

### 2.6. No tocar ficheros existentes a ciegas

Antes de modificar `api/chat.ts`, `App.tsx`, `main.tsx`, `WorkspaceShell.tsx`,
`index.css` o `index.ts` del workspace 02, la IA debe ver su contenido
completo. Sin verlos, no se tocan. Punto.

---

## 3. Estado actual del workspace 02-whatsapp

### 3.1. Estructura creada

```
apps/web/src/workspaces/02-whatsapp/
├── README.md                          WHATSAPP_UI_MAP_V1
├── index.ts                           metadata scaffold (NO toca el chat)
├── types.ts                           CHAT_UI_TYPES_V1
├── format.ts                          CHAT_FORMAT_V1
├── ChatWorkspace.css                  CHAT_WORKSPACE_CSS_V1 (solo estructura)
├── api.ts                             CHAT_API_V1 (mock en memoria)
├── components/
│   ├── ChatWorkspace.tsx              CHAT_WORKSPACE_V1
│   ├── Avatar.tsx                     CHAT_AVATAR_V1
│   ├── ThreadSearch.tsx               CHAT_THREAD_SEARCH_V1
│   ├── ThreadFilters.tsx              CHAT_THREAD_FILTERS_V1
│   ├── ThreadList.tsx                 CHAT_THREAD_LIST_V1
│   ├── ThreadListItem.tsx             CHAT_THREAD_ITEM_V1
│   ├── ThreadHeader.tsx               CHAT_THREAD_HEADER_V1
│   ├── MessageList.tsx                CHAT_MESSAGE_LIST_V1
│   ├── MessageBubble.tsx              CHAT_MESSAGE_BUBBLE_V1
│   ├── Composer.tsx                   CHAT_COMPOSER_V1
│   └── ContextPanel.tsx               CHAT_CONTEXT_PANEL_V1
├── hooks/
│   └── useChatWorkspace.ts            CHAT_HOOK_V1
└── docs/
    ├── 01-ui-map.md                   pendiente
    ├── 02-roadmap.md                  pendiente
    ├── 03-spec.md                     pendiente
    └── 04-handoff-v2.md               este fichero
```

Fuera del workspace, tambien creado:

```
apps/web/src/components/layout/AppRail.tsx    APP_RAIL_V1
```

### 3.2. Que hace cada pieza

- `types.ts`: tipos compartidos. `ChatRole`, `ChatThread`, `ChatMessage`,
  `ChatContextSnapshot`, `ChatStreamEvent`. Sin React, sin colores.
- `format.ts`: formateo de fechas. `formatThreadTime`, `formatDayLabel`,
  `formatClock`, `formatRelative`, `dayKey`. Sin React, sin colores.
- `api.ts`: mock en memoria. 5 hilos (Lucia, Marta, AGNTia, Operaciones,
  Cierre Q3). Firmas listas para sustituir por fetch + SSE.
- `hooks/useChatWorkspace.ts`: estado compartido del chat. Hilos, mensajes,
  contexto, panel, streaming, coautor, envio. Suscribe al stream del mock.
- `ChatWorkspace.tsx`: layout de 4 columnas. Orquesta todo. Monta el rail,
  la lista, el hilo y el panel.
- Los 10 componentes restantes: piezas del layout.
- `AppRail.tsx`: rail de 64px con navegacion. Fuera del workspace porque
  lo pueden usar mas workspaces.

### 3.3. Que NO esta montado

`ChatWorkspace` no se importa en ningun sitio. Existe pero no se ve. Eso
es lo primero que hay que resolver.

---

## 4. Ficheros que la IA NECESITA VER antes de tocar nada

Estos 7 ficheros NO se han visto todavia. Sin ellos, cualquier cambio
es a ciegas. La IA debe pedirlos antes de proponer nada.

| # | Fichero | Por que |
|---|---|---|
| 1 | `apps/web/src/workspaces/WorkspaceShell.tsx` | Decide si el chat se monta por excepcion aqui o no |
| 2 | `apps/web/src/workspaces/registry.ts` | Ya visto. Solo metadata. Confirmar que no monta componentes |
| 3 | `apps/web/src/workspaces/02-whatsapp/index.ts` | Ya visto. Solo metadata. Decidir si exporta ChatWorkspace |
| 4 | `apps/web/src/App.tsx` | Decide si hay ruta nueva o si el chat entra por shell |
| 5 | `apps/web/src/main.tsx` | Decide si hay que envolver con algun provider |
| 6 | `apps/web/src/index.css` | Decide si hay reglas globales que afecten al chat |
| 7 | `apps/web/src/api/chat.ts` | Decide si el mock del workspace convive con el o lo sustituye |

Comando para pedirlos (uno por uno, no repomix gigante):

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
Get-Content "apps/web/src/workspaces/WorkspaceShell.tsx"
```

Y asi con los 7. Pegar el output en el chat, uno detras de otro.

---

## 5. Tareas pendientes, en orden

### Tarea 1 - Montar el chat

Tres opciones. Elegir una tras ver los 7 ficheros.

**Opcion A - Ruta nueva en App.tsx.**
Anadir una vista `/chat` o similar. `ChatWorkspace` se monta ahi. Rapido,
pero rompe la simetria del catalogo de workspaces.

**Opcion B - Excepcion en WorkspaceShell.**
Si `workspaceId === "whatsapp"`, montar `ChatWorkspace` en vez de
`ViewRenderer`. Alineado con la idea de que el chat es el workspace 02.
Es la recomendada.

**Opcion C - Dejar sin montar.**
Los ficheros existen. Nadie los importa. Esperar al frente de los 34
workspaces.

### Tarea 2 - Actualizar `02-whatsapp/index.ts`

Exportar el `ChatWorkspace` ademas de la metadata. Para que quien lo
monte pueda importarlo desde el workspace.

Contenido propuesto:

```ts
// WHATSAPP_WORKSPACE_INDEX_V2
export { ChatWorkspace } from "./components/ChatWorkspace.tsx";

export const whatsappWorkspaceUi = {
  id: "whatsapp",
  slug: "02-whatsapp",
  family: "comunicacion",
  status: "implemented",
};
```

### Tarea 3 - Escribir los docs internos

- `docs/01-ui-map.md`: mapa de la UI. Que columnas, que componentes.
- `docs/02-roadmap.md`: fases. Que esta hecho, que falta.
- `docs/03-spec.md`: spec funcional. Roles, estados, acciones.

### Tarea 4 - Conectar al backend (si toca)

Hoy `api.ts` es un mock en memoria. Para conectar:

- Decidir endpoint: `/api/threads/*` (ya existe `threads-routes.ts` en
  backend) o `/api/chat/*` (nuevo).
- Sustituir `api.ts` por llamadas fetch + SSE al endpoint elegido.
- No tocar `api/chat.ts` a ciegas. Ver primero si tiene contenido vivo.

### Tarea 5 - Verificar

```powershell
pnpm typecheck
pnpm --filter @openmuse/web exec tsc --noEmit
```

Ambos deben estar verdes.

---

## 6. Convenciones de patchset

Todos los patchsets siguen el mismo patron:

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"

$file = "ruta/al/fichero"
$mark = "MARCA_V1"

if (Test-Path $file) {
  $content = Get-Content $file -Raw
  if ($content -match $mark) {
    Write-Host "SKIP: $mark ya existe" -ForegroundColor DarkGray
  } else {
    Write-Host "AVISO: $file existe sin la marca $mark. No sobreescribo." -ForegroundColor Yellow
  }
} else {
  $lines = @(
    '// MARCA_V1',
    '...',
    ''
  )
  [System.IO.File]::WriteAllText(
    (Join-Path (Get-Location) $file),
    ($lines -join "`r`n"),
    (New-Object System.Text.UTF8Encoding $false)
  )
  Write-Host "OK: $file [$mark]" -ForegroundColor Green
}
```

Reglas:

- Un patchset = un fichero = un bloque.
- Marca unica `_V1` o `_V2`.
- Idempotente por marca.
- UTF-8 sin BOM.
- Sin `&&`. Sin `;`. Un comando por linea.
- Si es correccion sobre fichero existente, `.Replace(a, b)` acotado.
- Si es fichero nuevo, `Test-Path` + `WriteAllText`.
- Verificacion `pnpm typecheck` al final de cada fase, no de cada patchset.

---

## 7. Trampas conocidas

### 7.1. Heredoc anidado en PowerShell

NO meter varios `@'...'@` en el mismo script. PowerShell los confunde.
Usar arrays de lineas con `$lines = @(...)` y un solo `WriteAllText`.

### 7.2. Repomix del repo con `apps/web/**` excluido

El `repomix.config.json` del repo excluye `apps/web/**` por defecto.
Cualquier repomix con `--include apps/web/...` seguira excluyendo esos
ficheros si el ignore del config es mas restrictivo. Pasar los ficheros
con `Get-Content` a mano, no con repomix.

### 7.3. `min-[1120px]:` sin declarar

`ChatWorkspace.tsx` usa `min-[1120px]:static` y `min-[1120px]:z-auto`.
Si Tailwind no compila esa sintaxis, revisar version. Tailwind 3.4+
la soporta. Si no, cambiar a `wide:static` y declarar `wide` en el config.

### 7.4. `text-canvas` sobre fondo oscuro

En `ThreadFilters.tsx`, `AppRail.tsx` y `ContextPanel.tsx` hay botones
con `bg-text text-white`. `text-white` es correcto porque el fondo es
oscuro. No cambiar a `text-bg-card` (seria blanco, ok, pero menos claro).

---

## 8. Definicion de terminado

- [ ] `pnpm typecheck` verde.
- [ ] `ChatWorkspace` se ve en el navegador (montado en A, B o C).
- [ ] `02-whatsapp/index.ts` exporta `ChatWorkspace`.
- [ ] `docs/01-ui-map.md`, `02-roadmap.md`, `03-spec.md` con contenido real.
- [ ] `README.md` del workspace actualizado si cambia algo.
- [ ] `git status --short` limpio de ficheros no relacionados.
- [ ] Commit con mensaje `feat(web): workspace 02-whatsapp UI montada`.

---

## 9. Lo que NO se toca

- `apps/web/src/workspaces/NN-nombre/` excepto `02-whatsapp`.
- `apps/web/src/components/agents/` (frente Laia + 12).
- `apps/web/src/components/ChatPanel.tsx` (chat viejo, decidir despues).
- `apps/web/src/hooks/useChat.ts` (hook viejo, decidir despues).
- `apps/web/src/api/chat.ts` sin verlo.
- `apps/web/tailwind.config.js` (los colores del chat ya existen).
- `apps/server/`, `packages/` (backend).

---

## 10. Referencia rapida

- Mockup: `agntia-wassap-v2.png`
- Mapa del workspace: `apps/web/src/workspaces/02-whatsapp/README.md`
- Handoff original del frente: handoff "Cerrar frente Laia + 12"
- Otros workspaces: `apps/web/src/workspaces/01-gmail/` ... `34-trello/`
- Registry: `apps/web/src/workspaces/registry.ts`
- Shell: `apps/web/src/workspaces/WorkspaceShell.tsx`

---

FIN DEL HANDOFF V2.
