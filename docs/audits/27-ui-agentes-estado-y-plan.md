# UI Agentes — estado y plan

> v1 · 2026-10-08 · Estado: active

Log de lo hecho hoy + handoff para lo que falta en la UI de agentes.

---

## 1. Hecho hoy (2026-10-08)

### Backend

- **12 personas en disco** en `clientes/default/personas/<id>/`.
  Ids: `direccion, comercial, atencion, administrativo, finanzas, marketing, contenido, operaciones, compras, rrhh, legal, compliance`.
  Cada una con `persona.json` + `stats.json`. Más `_index.json` con marca `LAIA_12_PERSONAS_V1`.
- **Bootstrap carga `_example`** para que Laia conviva con los 12 en tenant `default`. Marca `LAIA_BOOTSTRAP_EXAMPLE_V1` en `apps/server/src/app.ts`.
- **Kernel cross-persona.** `StoreTurnStore.listTurnsForOwner` y `Kernel.listTurnsAllPersonas`. Marca `KERNEL_LIST_TURNS_ALL_PERSONAS_V1`.
- **Endpoint `GET /api/agent-personas/all/nodes`.** Marca `PERSONAS_ALL_NODES_V1` en `routes.ts`.
- **Fix arquetipo.** `GET /api/agent-personas` devolvía `personality.tone` como `archetype`; ahora devuelve `stats.archetype`. Marca `PERSONAS_ARCHETYPE_FIX_V1`.
- **Notificaciones modo supervisor** para Laia. Marca `NOTIF_SUPERVISOR_MODE_V1` en `notifications-stream.ts`.
- **Meta, Consolidate y Promoter supervisores** en `service.ts`. Marcas `META_LOOP_SUPERVISOR_V1`, `CONSOLIDATE_SUPERVISOR_V1`, `PROMOTER_SUPERVISOR_V1`.
- **Test `tests/laia-hierarchy.test.ts`.** Marca `LAIA_HIERARCHY_TEST_V1`. Se quitó la parte de atención con `LAIA_HIERARCHY_NO_ATTENTION_V1` porque los hunks de atención no están aplicados.
- **`worker.ts` restaurado.** El fichero `apps/server/src/engine/worker.ts` no existía en disco (nunca entró a git, untracked). Se reconstruyó a partir del contenido que se conservaba. Marcas añadidas:
  - `WORKER_DB_UNION_V1` — acepta `Store | TenantScopedStore`.
  - `WORKER_MAX_ACTIVE_V1` — opción `maxActive` en el constructor y getter, tope de tareas concurrentes.
- **Fix `clientsDir`.** El hunk de `ONTOLOGY_BUNDLE_LOAD_V1` usaba `clientsDir` fuera del bloque donde se definía. Se recalculó in situ. Marca `ONTOLOGY_BUNDLE_CLIENSDIR_FIX_V1`.

### Frontend

- **Reescrito** `apps/web/src/components/agents/` entero: `types.ts`, `AgentIcons.tsx`, `AgentCard.tsx`, `AgentSquad.tsx`, `AgentStatsGrid.tsx`, `AgentHeroV2.tsx`, `AgentKnowledgeCard.tsx`, `AgentActivityFeed.tsx`, `AgentAttentionPanel.tsx`, `AgentCommandBar.tsx`, `AgentsPage.tsx`, `agents.css`, `floating/AgentDockLauncher.tsx`, `floating/LaiaFloatingWindow.tsx`.
- **Hooks nuevos:** `apps/web/src/hooks/useAgentPersonas.ts`, `apps/web/src/hooks/useAgentNode.ts`.
- **API nueva:** `apps/web/src/api/agentPersonas.ts`.
- **`App.tsx`** pasa `enabled` a `AgentsPage`. Marca `AGENTS_PAGE_ENABLED_V1`.
- **`AgentsView.tsx` borrado** (huérfano, nadie lo importaba).

### Pendiente técnico

- Hunks de **atención** sin aplicar: `KERNEL_ATTENTION_OF_PERSONA_V1`, `KERNEL_ATTENTION_PAIRS_V1`, `PERSONAS_ATTENTION_V1`. El panel de atención en UI sale vacío hasta que se apliquen.
- Los 12 salen LVL 1 / 0 tasks porque `GET /` no recalcula stats. Se recalcula solo en `GET /:id`.
- `activityForPersona` filtra por `assignedTo` o `state.roleId`. Sin tareas reales, activity vacía.

---

## 2. Lo que falta (handoff)

### 2.1 — Página individual por agente

Hoy la UI es una sola página (`AgentsPage`) que muestra hero + squad + activity + atención + ventana flotante. Todo el estado vive dentro de `AgentsPage`. No hay rutas por agente.

**Necesario:**

- **Ruta individual** `apps/web/src/components/agents/AgentDetailPage.tsx` o equivalente. Muestra la ficha completa de un agente concreto (hero, stats, knowledge, activity, atención, tabs de la ventana flotante).
- **Decidir cómo se enruta.** Hoy `App.tsx` usa `useState<AppView>` y monta un componente por vista. No hay router. Opciones:
  - **(A)** Añadir un estado `selectedAgentId` en `App.tsx` y una `view === "agent-detail"` que monte `AgentDetailPage` con el id.
  - **(B)** Introducir router real (React Router) y ruta `/agents/:id`.
  - **(C)** Reutilizar `AgentProfile.tsx` / `EmployeeProfileView.tsx` si ya cubren esto (verificar qué hacen hoy).
- **Cómo se llega.** Click en `AgentCard` de la squad → va a la página individual.
- **Qué muestra.** Como mínimo: hero (AgentHeroV2), stats, knowledge (memoria), activity, atención, tabs de la ventana flotante (perfil / runtime / squad / memoria) inline en la página, no solo en la ventana.

**Verificar antes de crear:**

- ¿`apps/web/src/components/agents/AgentProfile.tsx` ya hace parte de esto? (leerlo)
- ¿`apps/web/src/components/EmployeeProfileView.tsx` es la ficha vieja? (leerlo)
- ¿`App.tsx` soporta rutas o solo `useState<AppView>`? (leerlo, aunque lo he visto parcialmente)

### 2.2 — Ventana flotante persistente entre pantallas

Hoy `LaiaFloatingWindow` vive **dentro de `AgentsPage`**. Cuando `App.tsx` cambia `view` y desmonta `AgentsPage`, la ventana se cierra y se pierde el estado. Además, aunque no se cierre, `AgentsPage` solo se monta en `view === "agents"`, así que la ventana no puede existir en otras vistas.

**Necesario:**

- **Subir el estado de la ventana a `App.tsx`** (o a un contexto global): `windowOpen`, `minimized`, `maximized`, `position`, `zIndex`, `selectedAgentId`.
- **Montar la ventana a nivel de `AppShell`**, por encima del contenido cambiante. Así, al cambiar de view, la ventana sigue.
- **Comportamiento esperado:** abres ventana flotante de un agente, cambias a Chat, la ventana sigue ahí. Puedes arrastrarla, hablar con el agente, cambiar de pantalla, la ventana persiste.
- **Cierre explícito** solo al pulsar X (no al cambiar de view).
- **Dock** (`AgentDockLauncher`) visible cuando está minimizada, también entre pantallas.

**Verificar antes:**

- ¿`AppShell.tsx` es el sitio natural para montar la ventana persistente? (leerlo)
- ¿Hay ya un contexto global en `apps/web/src` (buscar `createContext`)? (leerlo)

### 2.3 — Abrir la ventana desde fuera de la página de agentes

Hoy el "llama a Laia" del `AgentCommandBar` funciona **dentro** de `AgentsPage`. Desde el chat no hay forma de invocar la ventana.

**Necesario:**

- **Desde el chat**, un comando o botón ("llama a Laia", "abre a X") que abra la ventana flotante del agente correspondiente.
- **Reutilizar el chat existente.** `ChatPanel` ya procesa texto; ver cómo detecta comandos (leer `ChatPanel.tsx`).
- Alternativa: un botón en `TopBarV2` o `SidebarV2` ("Agentes" con dropdown) que abra la ventana de cualquier agente sin cambiar de view.

**Verificar antes:**

- ¿`ChatPanel.tsx` tiene un mecanismo de comandos o solo envía texto al backend? (leerlo)
- ¿`CommandPalette.tsx` sirve para esto? (leerlo)

### 2.4 — Coherencia con backend

- Los 12 salen LVL 1 si `GET /` no recalcula. **Decidir:** aplicar `refreshStats: true` en `GET /`, o dejarlo y aceptar que la UI muestre stats reales solo cuando el agente tenga tareas.
- El panel de atención sale vacío porque `PERSONAS_ATTENTION_V1` no está aplicado. **Decidir:** aplicar los 3 hunks de atención, o dejar el panel con estado "sin datos".
- `activityForPersona` filtra por `assignedTo` / `state.roleId`. **Decidir:** relajar el filtro, o aceptar que la activity esté vacía hasta que el kernel escriba `personaId` en las tareas.

---

## 3. Ficheros a leer antes de tocar UI

Backend:
- `apps/server/src/engine/agents/personas/routes.ts` (forma exacta de los endpoints)
- `apps/server/src/engine/agents/personas/node.ts` (forma de `AgentNode`)
- `apps/server/src/notifications-stream.ts` (SSE para la ventana)

Frontend:
- `apps/web/src/App.tsx` (completo)
- `apps/web/src/components/AppShell.tsx`
- `apps/web/src/components/agents/AgentProfile.tsx`
- `apps/web/src/components/EmployeeProfileView.tsx`
- `apps/web/src/components/ChatPanel.tsx`
- `apps/web/src/components/CommandPalette.tsx`
- `apps/web/src/components/agents/types.ts` (ya leído, pero por si cambia)

---

## 4. Marcas nuevas que habrá que añadir

- `AGENT_DETAIL_PAGE_V1` — página individual.
- `AGENT_DETAIL_ROUTE_V1` — cómo se enruta (estado o router).
- `FLOATING_WINDOW_PERSISTENT_V1` — estado de ventana en `App.tsx` o contexto.
- `FLOATING_WINDOW_MOUNT_V1` — montaje en `AppShell`.
- `CHAT_OPEN_AGENT_V1` — comando desde el chat.
- `AGENT_DETAIL_FROM_SQUAD_V1` — click en card → detalle.

---

## 5. Criterios de cierre del frente UI

- [ ] `GET /api/agent-personas` devuelve 13 personas (Laia + 12).
- [ ] `GET /api/agent-personas/all/nodes` devuelve 12 nodos.
- [ ] `pnpm typecheck` sin errores nuevos.
- [ ] `AgentsPage` se monta con datos reales, sin mock.
- [ ] Click en `AgentCard` abre la página individual del agente.
- [ ] Página individual muestra hero + stats + knowledge + activity + atención + tabs.
- [ ] Ventana flotante persiste al cambiar de view.
- [ ] Desde chat se puede abrir la ventana de un agente.
- [ ] `AgentDockLauncher` visible cuando la ventana está minimizada, en cualquier view.

---

## 6. Referencias

- `docs/audits/SOP.md` — técnica de patchset.
- `docs/audits/POLICY_REPO.md` — reglas del repo.
- `docs/audits/PROTOCOLO_FIXES.md` — reglas de fixes.
- `docs/audits/09-kernel-cognitivo/09z-fundamentos.md` — ontología y kernel.
- `docs/audits/26-capability-e2e-miniaudit (1).md` — capabilities E2E.