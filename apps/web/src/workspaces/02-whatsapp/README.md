<!-- WHATSAPP_UI_MAP_V1 -->
# 02-whatsapp - Mensajeria instantanea (frontend)

- **Estado:** en construccion
- **Referencia:** WhatsApp Web
- **Familia:** comunicacion
- **Mockup:** agntia-wassap-v2.png

## Objetivo

UI de chat multiparticipante en 4 columnas que clona el mockup de WhatsApp
Web, adaptado al sistema de workspaces de Agntia OS. El chat soporta 5 roles
en un mismo hilo: owner, employee, client, agent, system.

## Estructura del workspace

```
02-whatsapp/
├── README.md                 este fichero
├── index.ts                  metadata del workspace
├── api.ts                    CHAT_API_V1 (mock en memoria)
├── types.ts                  CHAT_UI_TYPES_V1
├── format.ts                 CHAT_FORMAT_V1
├── ChatWorkspace.css         CHAT_WORKSPACE_CSS_V1
├── components/
│   ├── ChatWorkspace.tsx     CHAT_WORKSPACE_V1
│   ├── Avatar.tsx
│   ├── ThreadSearch.tsx
│   ├── ThreadFilters.tsx
│   ├── ThreadList.tsx
│   ├── ThreadListItem.tsx
│   ├── ThreadHeader.tsx
│   ├── MessageList.tsx
│   ├── MessageBubble.tsx
│   ├── Composer.tsx
│   └── ContextPanel.tsx
├── hooks/
│   └── useChatWorkspace.ts   CHAT_HOOK_V1
└── docs/
    ├── 01-ui-map.md
    ├── 02-roadmap.md
    └── 03-spec.md
```

## Mapa de componentes

### Raiz del workspace

| Fichero | Marca | Que es |
|---|---|---|
| `types.ts` | `CHAT_UI_TYPES_V1` | Tipos compartidos del chat |
| `format.ts` | `CHAT_FORMAT_V1` | Formateo de fechas y horas |
| `ChatWorkspace.css` | `CHAT_WORKSPACE_CSS_V1` | Tokens y modo oscuro |
| `api.ts` | `CHAT_API_V1` | Mock en memoria (Lucia, Marta, AGNTia, Operaciones, Cierre Q3) |

### Componentes

| Fichero | Marca | Que es |
|---|---|---|
| `components/ChatWorkspace.tsx` | `CHAT_WORKSPACE_V1` | Layout de 4 columnas. Orquesta todo |
| `components/Avatar.tsx` | - | Avatar con inicial, color y punto online |
| `components/ThreadSearch.tsx` | - | Buscador de hilos |
| `components/ThreadFilters.tsx` | - | Filtros: Todos, Sin leer, Grupos, Archivados |
| `components/ThreadList.tsx` | - | Lista scrollable de hilos |
| `components/ThreadListItem.tsx` | - | Fila de hilo (avatar, nombre, preview, hora, badge) |
| `components/ThreadHeader.tsx` | - | Cabecera del hilo activo |
| `components/MessageList.tsx` | - | Lista de mensajes con separadores de dia |
| `components/MessageBubble.tsx` | - | Burbuja por rol (owner, employee, client, agent, system) |
| `components/Composer.tsx` | - | Input + coautor + enviar |
| `components/ContextPanel.tsx` | - | Panel de detalle (info, files, notes, activity) |

### Hooks

| Fichero | Marca | Que es |
|---|---|---|
| `hooks/useChatWorkspace.ts` | `CHAT_HOOK_V1` | Estado compartido del chat (hilos, mensajes, contexto, streaming) |

### Layout global (fuera del workspace)

| Fichero | Que es |
|---|---|
| `apps/web/src/components/layout/AppRail.tsx` | Rail de navegacion de 64px. Lo usan todos los workspaces |

## Contratos de tipos

Definidos en `types.ts` (`CHAT_UI_TYPES_V1`):

- `ChatRole` = `owner | employee | client | agent | system`
- `ChatFilter` = `all | unread | groups | archived`
- `ChatContextTab` = `info | files | notes | activity`
- `ChatThreadKind` = `direct | group | agent`
- `ChatThread`, `ChatMessage`, `ChatFile`, `ChatNote`, `ChatActivity`
- `ChatContextSnapshot`, `ChatStreamEvent`

## Estado compartido

`hooks/useChatWorkspace.ts` (`CHAT_HOOK_V1`) expone:

- `threads`, `activeThreadId`, `activeThread`
- `messages`, `context`
- `contextPanelOpen`, `contextTab`
- `coauthorMode`, `isStreaming`
- `selectThread`, `toggleContextPanel`, `setContextTab`, `setCoauthorMode`, `send`

## Datos (mock en fase 1)

`api.ts` mantiene las firmas de la API real:

- `listThreads()`, `getThread(id)`
- `listMessages(threadId)`, `sendMessage(threadId, text, opts)`
- `getContext(threadId)`
- `subscribeStream(threadId, handler)`

Cuando se conecte al backend, se sustituye el cuerpo por fetch + SSE
contra `/api/threads/*` o `/api/chat/*` segun decida el frente de backend.

## Relacion con el resto del repo

- **Registry de workspaces:** `apps/web/src/workspaces/registry.ts`. Solo
  metadata (id, slug, family, title, reference). No monta componentes.
- **WorkspaceShell:** `apps/web/src/workspaces/WorkspaceShell.tsx`. Hoy monta
  `ViewRenderer` con un `RuntimeViewSpec`. El chat no encaja en ninguna de
  las 9 plantillas, asi que necesita su propia via de montaje.
- **Montaje pendiente:** decidir si el chat se monta por excepcion en
  `WorkspaceShell` o por ruta propia en `App.tsx`. Fase 2.

## Roadmap por fases

1. **Fase 1 (esta rama):** tipos, format, css, api mock, hook, 11 componentes.
   Todo dentro del workspace 02. Cero cambios fuera.
2. **Fase 2:** montaje en `WorkspaceShell` o `App.tsx`. Decision pendiente.
3. **Fase 3:** cableado al backend real (`api/chat.ts` o `/api/threads/*`).

## Pendientes conocidos

- `coauthorMode` vive en el composer. Si el mockup pide panel IA, mover.
- Panel con 4 tabs (estilo WhatsApp Web). El mockup original pedia panel IA
  unico con resumen, intencion, urgencia, proximo paso. Decision pendiente.
- `lucide-react` debe estar en `apps/web/package.json`. Fase 2.
