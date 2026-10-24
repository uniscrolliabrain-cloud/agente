<!-- WORKSPACES_UI_PIPELINE_V2 -->
# Pipeline de UI para los 34 workspaces

> Estado: vivo. Se actualiza mientras se construye.
> Base: lo aplicado al workspace 02-whatsapp.
> Uso: manual de instrucciones para la IA que construye cada workspace.

---

## 1. Estructura por workspace

Cada workspace del frontend vive en `apps/web/src/workspaces/NN-nombre/`.
Todos siguen la misma estructura:

```
apps/web/src/workspaces/NN-nombre/
├── README.md                    mapa del workspace            XXX_UI_MAP_V1
├── index.ts                     metadata + export contenedor  XXX_WORKSPACE_INDEX_V2
├── types.ts                     tipos del workspace           XXX_TYPES_V1
├── format.ts                    utilidades puras              XXX_FORMAT_V1
├── <Nombre>Workspace.css        estructura (sin tokens)       XXX_UI_CSS_V1
├── api.ts                       mock en memoria               XXX_API_V1
├── hooks/
│   └── useXxx.ts                estado compartido             XXX_HOOK_V1
├── components/
│   ├── <Nombre>Workspace.tsx    contenedor principal          XXX_WORKSPACE_V1
│   └── ...                      hijos con nombres semanticos
└── docs/
    ├── 01-ui-map.md             mapa real
    ├── 02-roadmap.md            fases reales
    ├── 03-spec.md               spec funcional
    └── 04-handoff-v2.md         handoff para la siguiente IA  XXX_HANDOFF_V2
```

Fuera del workspace, si aplica:

```
apps/web/src/components/layout/AppRail.tsx    APP_RAIL_V1
apps/web/src/components/shared/Xxx.tsx        si varios workspaces lo comparten
```

Reglas de naming de componentes:

- El contenedor lleva el nombre del workspace: `ChatWorkspace`, `GmailWorkspace`.
- Los hijos llevan el nombre de la entidad que representan: `ThreadHeader`,
  `MessageBubble`, `InvoiceRow`. NO usan el prefijo del workspace.
- El CSS usa el nombre del contenedor: `ChatWorkspace.css`, `GmailWorkspace.css`.

---

## 2. Pipeline por workspace

```
FASE 0 - Auditoria
  0.1. Leer estructura del workspace (README, index.ts, docs, components, hooks)
  0.2. Leer registry.ts (confirmar metadata-only)
  0.3. Leer WorkspaceShell.tsx (confirmar como monta)
  0.4. Leer tailwind.config.js (paleta real)
  0.5. Leer index.css (reglas globales)
  0.6. Leer App.tsx y main.tsx (montaje global)
  0.7. Leer api del workspace si aplica

FASE 1 - Decisiones
  1.1. Que UI necesita (lista, board, tabla, kanban, dashboard, chat, ...)
  1.2. Paleta: la real del repo, nunca inventada
  1.3. Fuente: la real del repo (Instrument Sans)
  1.4. Dark mode: no, el repo no lo tiene
  1.5. Tipos necesarios
  1.6. Utilidades necesarias
  1.7. Mock necesario
  1.8. Hook necesario
  1.9. Componentes necesarios
  1.10. Contenedor que orquesta

FASE 2 - Documentacion
  2.1. README del workspace con mapa de componentes
  2.2. Docs internos (01-ui-map, 02-roadmap, 03-spec)

FASE 3 - Contratos y utilidades
  3.1. types.ts
  3.2. format.ts
  3.3. <Nombre>Workspace.css (solo estructura)

FASE 4 - Datos y estado
  4.1. api.ts (mock)
  4.2. hooks/useXxx.ts

FASE 5 - Componentes hoja
  Por dependencia. Primero los que no importan nada del workspace.
  Luego los que importan esos. Luego los contenedores.

FASE 6 - Componentes contenedores
  6.1. Header
  6.2. List
  6.3. Detail / Panel
  6.4. Form / Composer
  6.5. Contenedor principal

FASE 7 - Correccion de paleta
  7.1. Mapear clases inventadas a clases reales del repo
  7.2. Un patchset por fichero
  7.3. pnpm typecheck al final de la fase

FASE 8 - Montaje
  8.1. Actualizar index.ts del workspace
  8.2. Decidir: WorkspaceShell por excepcion o ruta nueva
  8.3. Ver WorkspaceShell.tsx y App.tsx ANTES de decidir
  8.4. Verificar en navegador

FASE 9 - Handoff v2
  9.1. Doc 04-handoff-v2.md con estado actual
  9.2. Lista de ficheros globales que la siguiente IA debe ver
  9.3. Tareas pendientes
```

---

## 3. SOP - Procedimiento estandar

### SOP-1 - Auditoria

Leer del workspace:

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
Get-ChildItem "apps/web/src/workspaces/NN-nombre" -Recurse | Select-Object FullName
Get-Content "apps/web/src/workspaces/NN-nombre/README.md"
Get-Content "apps/web/src/workspaces/NN-nombre/index.ts"
Get-Content "apps/web/src/workspaces/NN-nombre/docs/01-ui-map.md"
Get-Content "apps/web/src/workspaces/NN-nombre/docs/02-roadmap.md"
Get-Content "apps/web/src/workspaces/NN-nombre/docs/03-spec.md"
```

Leer una vez, no por workspace:

```powershell
Get-Content "apps/web/src/workspaces/registry.ts"
Get-Content "apps/web/src/workspaces/WorkspaceShell.tsx"
Get-Content "apps/web/tailwind.config.js"
```

### SOP-2 - Decisiones

Responder por escrito antes de tocar codigo:

1. Que UI necesita
2. Que roles o estados tiene
3. Que acciones ejecuta
4. Que tipos necesita
5. Paleta (la del repo)
6. Componentes reutilizables de otros workspaces
7. Mock necesario
8. Hook propio o estado local
9. Donde se monta

### SOP-3 - Doc del workspace

El README del workspace incluye:

- Objetivo
- Estructura de ficheros
- Mapa de componentes (tabla: fichero | marca | que es)
- Contratos de tipos
- Estado compartido
- Datos (mock)
- Relacion con el resto del repo
- Roadmap por fases
- Pendientes conocidos

### SOP-4 - Contratos y utilidades

- types.ts: tipos puros, sin React, sin colores
- format.ts: utilidades puras, sin React, sin colores
- <Nombre>Workspace.css: solo estructura (display, overflow, grid).
  Sin tokens, sin dark mode, sin fuentes

### SOP-5 - Datos y estado

- api.ts: mock con las firmas reales que tendra la API
- hooks/useXxx.ts: estado. Suscribe al mock. Devuelve estado + setters

### SOP-6 - Componentes hoja

Un patchset por fichero. Orden por dependencia:
primero los que no importan nada del workspace, luego los que
importan esos, luego los que importan los anteriores.

### SOP-7 - Componentes contenedores

Header, List, Detail/Panel, Form/Composer, Contenedor. Uno a uno.

### SOP-8 - Correccion de paleta

Mapear todas las clases Tailwind inventadas a las reales:

| Inventada | Real |
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
| `text-canvas` | `text-white` (solo sobre fondo oscuro) |

Un patchset por fichero con `.Replace()` acotado.

### SOP-9 - Montaje

1. Actualizar index.ts del workspace. Exporta el contenedor y actualiza
   el estado del objeto metadata a `implemented`
2. Ver WorkspaceShell.tsx y App.tsx antes de decidir donde se monta
3. Escribir el bloque de montaje
4. Verificar en navegador

### SOP-10 - Handoff v2

El doc 04-handoff-v2.md incluye:

- Estado actual
- Que falta
- Lista de los ficheros globales que la siguiente IA debe ver antes
  de tocar nada: WorkspaceShell.tsx, registry.ts, index.ts del workspace,
  App.tsx, main.tsx, index.css, api global si aplica
- Tareas pendientes en orden
- Convenciones de patchset
- Trampas conocidas
- Definicion de terminado

---

## 4. Lo que NO hay que hacer

Aprendido a base de romper el 02:

1. No inventar paletas. Usar las del repo: bg-bg-card, bg-bg-soft,
   border-border, text-text, text-text-2, purple, purple-soft, green.
2. No meter dark mode. El repo no lo tiene.
3. No meter fuentes ajenas. Instrument Sans y punto.
4. No meter contexto global si el workspace es el unico consumidor.
   Usar hooks/useXxx.ts dentro del workspace.
5. No tocar api/chat.ts ni otros ficheros globales sin verlos antes.
6. No reescribir tailwind.config.js.
7. No meter componentes en components/ del repo. Van dentro del workspace.
8. No crear contexts/ si no existe.
9. No meter heredocs anidados en PowerShell.
10. No meter 18 ficheros en un solo script. Un patchset = un fichero.
11. No tocar App.tsx ni main.tsx a ciegas. Verlos antes.
12. No montar el workspace hasta decidir donde.
13. No usar && ni ; en PowerShell. Un comando por linea.
14. No usar git add . . git add selectivo por fichero.

---

## 5. Orden recomendado de los 34

Primero (simples, sin deps):
08-chatgpt, 09-airtable, 16-n8n, 33-langsmith.

Segundo (comunicacion, similar al 02):
01-gmail, 14-zendesk, 25-intercom, 31-suitedash, 23-buffer.

Tercero (documentos):
05-google-drive, 32-notion, 15-docusign, 22-canva.

Cuarto (finanzas):
04-holded, 11-holded-tesoreria, 12-odoo-purchase, 20-ramp, 21-stripe, 24-shopify.

Quinto (personas):
10-perdoo, 18-factorial, 19-personio.

Sexto (trabajo):
06-google-calendar, 07-linear, 13-productive, 17-process-street, 34-trello.

Septimo (operaciones):
26-odoo-inventory, 27-maintainx, 28-odoo-manufacturing.

Octavo (gobierno):
29-isms-online, 30-microsoft-entra.

Ya hecho: 02-whatsapp.

---

## 6. Plantilla de prompt para cada workspace

```
Vamos a implementar la UI del workspace NN-nombre.

Sigue el pipeline de apps/web/src/34-workspaces-pipeline.md.

Fase 1 - Auditoria: pásame el contenido de:
- apps/web/src/workspaces/NN-nombre/README.md
- apps/web/src/workspaces/NN-nombre/index.ts
- apps/web/src/workspaces/NN-nombre/docs/01-ui-map.md
- apps/web/src/workspaces/NN-nombre/docs/02-roadmap.md
- apps/web/src/workspaces/NN-nombre/docs/03-spec.md

Fase 2 - Decisiones: dime que UI necesita, que tipos, que componentes.

Fase 3 - Doc: README con mapa de componentes.

Fase 4 - Contratos: types.ts, format.ts, <Nombre>Workspace.css.

Fase 5 - Datos: api.ts, hooks/useXxx.ts.

Fase 6 - Componentes: uno a uno, un patchset por fichero.

Fase 7 - Correccion de paleta.

Fase 8 - Montaje.

Fase 9 - Handoff v2.

Reglas:
- Un patchset = un fichero.
- Paleta real del repo (bg-bg-card, purple, etc).
- Sin dark mode.
- Sin fuentes ajenas.
- Imports con extension .ts/.tsx.
- Sin && ni ;.
- Idempotente por marca.
```

---

FIN DEL PIPELINE.
