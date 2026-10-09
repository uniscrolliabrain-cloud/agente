# Mapa UI — Agentes

> v1 · 2026-10-09 · Autor: sesión Laia + UI

Documenta los ficheros de UI de agentes creados/modificados en la sesión 2026-10-08/09.
No cubre el resto del frontend (Chat, Tasks, Documents, Projects, Memory, Users, Control Center).
El resto hay que mapearlo aparte.

---

## 1. Estructura de ficheros

```
apps/web/src/
├── api/
│   └── agentPersonas.ts          NUEVO  — cliente HTTP de personas
├── contexts/
│   └── AgentWindowContext.tsx    NUEVO  — estado global de la ventana flotante
├── hooks/
│   ├── useAgentPersonas.ts       NUEVO  — lista de personas + nodos (refresh 8s)
│   ├── useAgentNode.ts           NUEVO  — node + attention + activity (refresh 10s)
│   └── useAgents.ts              EXISTENTE — lista de roles antiguos (no la usa AgentsPage)
└── components/agents/
    ├── types.ts                  REESCRITO — AgentUI, toArchetype, personaToAgentUI
    ├── AgentIcons.tsx            NUEVO  — icono por arquetipo
    ├── AgentCard.tsx             REESCRITO — card de la squad
    ├── AgentSquad.tsx            REESCRITO — grid de cards
    ├── AgentStatsGrid.tsx        NUEVO  — 4 stats
    ├── AgentHeroV2.tsx           NUEVO  — cabecera del agente
    ├── AgentKnowledgeCard.tsx    NUEVO  — memoria del agente
    ├── AgentActivityFeed.tsx     NUEVO  — activity log
    ├── AgentAttentionPanel.tsx   NUEVO  — panel de atención
    ├── AgentCommandBar.tsx       REESCRITO — barra de comandos
    ├── AgentsPage.tsx            REESCRITO — lista de agentes
    ├── AgentDetailPage.tsx       NUEVO  — página individual por agente
    ├── AgentProfile.tsx          STUB  — ya no se usa
    ├── agents.css                REESCRITO — estilos
    └── floating/
        ├── LaiaFloatingWindow.tsx    REESCRITO — ventana flotante con tabs
        └── AgentDockLauncher.tsx     REESCRITO — dock cuando minimizada
```

---

## 2. Vistas y cómo se montan

### Vista `agents` (lista)

- **Componente:** `AgentsPage.tsx`
- **Montada en:** `App.tsx`, en `view === `agents` && !selectedAgentId`
- **Props:** `enabled: boolean`, `onOpenAgent?: (id: string) => void`
- **Hooks:**
  - `useAgentPersonas(enabled)` -> personas, laia, loading, error, refresh, lastUpdatedAt
  - `useAgentNode(selectedId, enabled)` -> node, attention, activity, loading, error, refresh
  - `useAgentWindow()` -> open, close, minimize, maximize, focus, move, windowOpen
- **Subcomponentes:** AgentHeroV2, AgentStatsGrid, AgentKnowledgeCard, AgentActivityFeed, AgentAttentionPanel, AgentSquad, AgentCommandBar
- **Botón extra:** `Actualizar stats` -> `POST /api/agent-personas/refresh-stats`

### Vista `agent-detail` (página individual)

- **Componente:** `AgentDetailPage.tsx`
- **Montada en:** `App.tsx`, en `view === `agents` && selectedAgentId`
- **Props:** `personaId: string`, `enabled: boolean`, `onBack: () => void`
- **Hooks:**
  - `useAgentPersonas(enabled)`
  - `useAgentNode(personaId, enabled)`
- **Subcomponentes:** AgentHeroV2, AgentStatsGrid, AgentKnowledgeCard, AgentActivityFeed, AgentAttentionPanel
- **Se llega desde:** AgentsPage, cuando el usuario pulsa una AgentCard
- **Se sale con:** botón `Volver` (`onBack` -> `setSelectedAgentId(null)`)

### Ventana flotante (global, persistente)

- **Componente:** `LaiaFloatingWindow.tsx`
- **Montada en:** `App.tsx`, dentro de `AgentWindowLayer`, dentro de `AgentWindowProvider`
- **Estado global:** `AgentWindowContext.tsx`
- **Persistencia:** sobrevive al cambio de view porque el provider envuelve todo el AppShell
- **Se abre desde:**
  - AgentsPage: botón Hablar con X (AgentHeroV2 -> openWindow)
  - AgentCommandBar: llama a Laia
  - TopBarV2: botón Agentes con dropdown (AgentPickerButton)
  - ChatPanel: comando de texto `llama a X` / `abre a X`
- **Tabs:** perfil / runtime / squad / memoria
- **Cómo se cierra:** botón X
- **Cómo se minimiza:** botón -. Aparece AgentDockLauncher abajo a la derecha.

---

## 3. Endpoints consumidos

| Endpoint | api | Quien lo usa |
|---|---|---|
| GET /api/agent-personas | agentPersonas.ts | useAgentPersonas |
| GET /api/agent-personas/all/nodes | agentPersonas.ts | useAgentPersonas |
| GET /api/agent-personas/:id/node | agentPersonas.ts | useAgentNode |
| GET /api/agent-personas/:id/attention | agentPersonas.ts | useAgentNode |
| GET /api/agent-personas/:id/activity?limit=N | agentPersonas.ts | useAgentNode |
| POST /api/agent-personas/refresh-stats | agentPersonas.ts | boton en AgentsPage |

Marcas backend asociadas:
- PERSONAS_ALL_NODES_V1
- PERSONAS_ATTENTION_V1
- PERSONAS_STATS_REFRESH_BUTTON_V1
- PERSONAS_ARCHETYPE_FIX_V1
- NODE_FALLBACK_OWNER_V1

---

## 4. Contexto global — AgentWindowContext.tsx

Estado:
- windowOpen: boolean
- minimized: boolean
- maximized: boolean
- position: { x, y }
- zIndex: number
- agentId: string | null

Acciones:
- open(agentId) / close() / minimize() / maximize() / focus() / move({x,y})

Consumidores: App.tsx (AgentWindowLayer), AgentsPage, TopBarV2, ChatPanel.
Provider: AgentWindowProvider envuelve AppShell y AgentWindowLayer en App.tsx.

---

## 5. Marcas de esta sesion (frontend)

| Marca | Fichero |
|---|---|
| AGENT_PERSONAS_API_V1 | api/agentPersonas.ts |
| USE_AGENT_PERSONAS_V1 | hooks/useAgentPersonas.ts |
| USE_AGENT_NODE_V1 | hooks/useAgentNode.ts |
| AGENT_UI_TYPES_V2 | components/agents/types.ts |
| AGENTS_PAGE_ENABLED_V1 | App.tsx |
| AGENTS_REFRESH_STATS_BUTTON_V1 | api/agentPersonas.ts + AgentsPage.tsx |
| AGENT_DETAIL_PAGE_V1 | components/agents/AgentDetailPage.tsx |
| AGENT_DETAIL_ROUTE_V1 | App.tsx |
| AGENT_DETAIL_FROM_SQUAD_V1 | components/agents/AgentsPage.tsx |
| AGENT_WINDOW_CONTEXT_V1 | contexts/AgentWindowContext.tsx |
| FLOATING_WINDOW_MOUNT_V1 | App.tsx |
| FLOATING_WINDOW_PERSISTENT_V1 | components/agents/AgentsPage.tsx |
| CHAT_OPEN_AGENT_COMMAND_V1 | components/ChatPanel.tsx |
| CHAT_OPEN_AGENT_BUTTON_V1 | components/TopBarV2.tsx |
| AGENT_PROFILE_CLEANUP_V1 | components/agents/AgentProfile.tsx |

---

## 6. Pendiente / por verificar

- **El sidebar no navega a agents.** El boton aparece deshabilitado con cursor de prohibido.
  Hay que localizar el sidebar real que se esta renderizando (puede no ser SidebarV2.tsx).
- **Duplicados de componentes.** Hay varios ficheros con funcionalidad solapada.
  Revisar si quedan mas (AgentsView borrado, EmployeeProfileView stub, AgentProfile stub).
- **Estilos.** agents.css se importa desde AgentsPage.tsx. Verificar si index.css lo importa (doble import).
- **Warnings del server al arrancar:**
  - maintain tenant default -> invalid escape string (PGlite SQL). Preexistente.
  - consolidate tenant default -> ZodError (owner, startedAt, status undefined).
    Puede ser del hunk CONSOLIDATE_SUPERVISOR_V1 o preexistente.
- **AgentProfile.tsx** ahora es stub. Si nadie lo importa, borrar.

---

## 7. Smoke test

1. pnpm dev arranca sin error.
2. En el log: [personas] tenant default: 13 cargadas, 0 fallidas.
3. Navegador -> sidebar -> Agentes.
4. Ver 13 agentes (Laia + 12).
5. Click en una card -> abre AgentDetailPage.
6. Volver a agentes -> vuelve a la lista.
7. Actualizar stats -> no rompe, actualiza.
8. TopBar -> Agentes -> dropdown con la lista -> abrir la ventana.
9. Minimizar ventana -> dock abajo a la derecha.
10. Cambiar a Chat -> la ventana sigue abierta.
11. Escribir en el chat 'llama a direccion' -> abre la ventana de Alex.
12. Cerrar ventana -> X.

---

## 8. Lo que NO esta en este mapa

- Chat, Tasks, Documents, Projects, Memory, Users, Control Center.
- Toda la UI heredada.
- Rutas reales (React Router) — no hay, es useState<AppView>.
- El SidebarV2.tsx real que se renderiza.

Para mapear el resto del frontend, hacer un docs/ui/MAPA-FRONTEND.md aparte.
