# UX compartido: del lab a la web sin fricción y sin pérdida

Estado: **paso 1 hecho** en `0a6f7652` (menú y chats de las tres meta-apps con el gesto compartido, verificado en Pages). Pendiente: el panel dividido y el soltar fuera de la barra.

Base: `36ee89ec`. Línea base verde medida: `WEB_TSC=0`, `LAB_TSC=0`.

## 1. Regla de oro

**El comportamiento se escribe una vez, en `apps/web/src/ux/`; las meta-apps solo ponen la piel.**

Un gesto (pulsación larga, tolerancia, hueco, fantasma, teclado, persistencia) no puede existir dos veces. Si se cambia, cambia en la app y en las tres meta-apps a la vez, porque es el mismo código. Lo único distinto es el markup y el CSS de cada piel.

Consecuencia: migrar una meta-app a la web real no reescribe gestos. Se mueve la carpeta, se cambia la fuente de datos y se decide el flag.

## 2. Lo que no se toca nunca

| Zona | Por qué |
|---|---|
| `apps/site` (landing) | HTML estático (`index.html`, legales, confianza). No importa nada de `apps/web` ni de `apps/ui-lab` —verificado, 0 coincidencias— y se publica desde su propia carpeta con `vercel` en `deploy.yml`. Es imposible romperla sin editar `apps/site`, y aquí no se edita. |
| `apps/server`, `apps/worker`, `apps/computer` | Fuera de alcance. Sin cambios. |
| Datos, esquema, API, despliegues | Sin cambios. Nada de migraciones, secretos ni publicaciones. |

## 3. Lo que no se pierde del lab

Nada se borra. Las tres meta-apps conservan su aspecto exacto: los hooks sustituyen el gesto, no la pintura. Lo que solo existe en el lab (zonas de demostración, fixtures) se queda y se marca como demo, fuera de la capa compartida.

Inventario de lo avanzado, por área (todo se conserva):

| Área | Ficheros | Qué se mantiene |
|---|---|---|
| Chat transversal V3 (`chat-transversal-v3/`) | `ChatTransversalV3`, `ChatDock`, `ChatPanel`, `ChatSheet`, `ChatComposer`, `ChatCall`, `ChatActions`, `chat-data`, `chat-v3.css` | Completo. No se toca en esta fase. |
| Chat UX V2 (`chat-ux-v2/`) | 12 ficheros: `ChatUXFrame`, `MessageListUX`, `MessageBubbleUX`, `ChatComposerUX`, `Markdown`, `RoleSelectorUX`, `CognitionTimelineUX`, fixtures | Completo. |
| Capa compartida (`smart-ux/`) | `smart-ux.tsx` (487), `MetaDock.tsx` (344), `MetaChats.tsx` (31), 3 CSS (714) | Completo; solo gana los hooks de orden y split. |
| Meta-apps | `company-v2/`, `code-v1/`, `observability-v1/` | Aspecto intacto; solo cambia el gesto por el hook. |
| Menú adaptativo (`adaptive-menu/`) | `AdaptiveMenuWorkspace`, `adaptive-menu.css` | Completo. |
| Centro de mando editorial (`command-center-editorial/`) | `CommandCenterEditorial` | Completo. |
| Conocimiento (`knowledge-v1/`, `knowledge-v4/`) | navegación y workspace | Completo. |
| Resto del lab | `apps-launcher`, `analytics-v1`, `cartera-v1`, `documents-explorer`, `formation`, `formation-v4`, `legal`, `login-v3`, `tasks-automations-v1`, `team-v1`, `comunicaciones`, `design-system`, `vendor` | Completo. |

## 4. Capacidades: dónde viven hoy

Verificado en el código, no supuesto.

| Capacidad | App (`apps/web`) | Meta-apps | Destino |
|---|---|---|---|
| Dock: arrastrar para reordenar, fijar | `DockRail` (`DOCK_RAIL_V1`) | **Sí**: `MetaDock`, por `namespace` | Compartido; el dock ya está resuelto |
| Menú: reordenar y `Alt+↑↓` | `SidebarV2` (`SIDEBAR_ORDER_V1`, `agntia_sidebar_order_v1`) | **Hecho**: `useOrderedList` en `useSmartNav`, una por meta-app | Compartido en el lab; falta que la app importe el hook |
| Chats: reordenar y triple clic arriba | `SidebarThreads` (`CHATS_ORDER_V1`) | **Hecho**: `useOrderedList` en `MetaChats` | Compartido en el lab; falta que la app importe el hook |
| Sacar una fila y duplicar pantalla | `App` + `SidebarV2` + `SidebarThreads` (`SPLIT_PANE_V1`) | No | `useSplitDrop` + capa de dos paneles |
| Plegar menú, paleta ⌘K, atajos, recientes | Sí | **Sí**: `useSmartNav`, `SmartCommandPalette`, `SmartShortcuts` | Ya compartido |

## 5. Protocolo por paso

1. **Move-only.** El hook se extrae del código actual, línea por línea. Si no reproduce el original, es un bug de la app, visible.
2. **Un call site por commit.** Primero `SidebarV2`; verificar; después `SidebarThreads`; verificar. Nunca dos a la vez.
3. **Props y flags intactos.** `reorderableNav`, `chatsPanel`, `onSplitDrop` siguen siendo la puerta. Producción sigue apagada como hoy.
4. **Reversible.** Cada paso es un commit que se puede revertir solo. Sin `--force`, sin tags, sin reescribir historia.

Comprobaciones de cada paso:

```bash
corepack pnpm --filter @agente/web exec tsc --noEmit
corepack pnpm --filter @agente/ui-lab typecheck
UI_LAB_BASE=/agente/ corepack pnpm --filter @agente/ui-lab build
```

Y en la raíz, lo que ya corre el despliegue: `pnpm typecheck`, `pnpm test`, `pnpm audit:coherence`.

## 6. Garantía mecánica: nada desaparece

- **Antes de mover:** se guarda la lista de rutas y de etiquetas de feature del lab (`grep -rE "[A-Z][A-Z0-9_]{2,}_V[0-9]+"`).
- **Después de cada paso:** el mismo `grep` debe devolver las mismas rutas, salvo renombrados que se anoten aquí. Si aparece una pérdida no planificada, `git revert` de ese commit.
- **Ninguna feature se elimina.** Si un tag deja de ser localizable, es un fallo del paso, no una limpieza.
- `git diff --stat` en cada paso: si hay más borrados que los del fichero movido, se para.

## 7. Checklist para migrar una meta-app a la web

1. Mover la carpeta a `apps/web/src/`.
2. Sustituir fixtures por props (el componente no importa datos).
3. Reutilizar los hooks de `apps/web/src/ux/`; no reimplementar gestos.
4. Tokens y variables del tema, no colores sueltos.
5. Detrás de flag, apagado en producción hasta que se decida.
6. Gates en verde y comprobación manual de los cinco gestos.

Si alguno de esos seis puntos exige trabajo extra, la capa compartida está mal cortada y se arregla allí, no en la meta-app.

## 8. Riesgos y respuesta

| Riesgo | Respuesta |
|---|---|
| Las dos implementaciones divergen otra vez | Prohibido reimplementar un gesto; una spec escrita por gesto |
| El refactor cambia el comportamiento de producción | Move-only, un call site por commit, flags apagados por defecto |
| Se pierde una pieza avanzada del lab | Inventario de la sección 3 y comprobación de etiquetas de la sección 6 |
| La landing se ve afectada | No comparte código; no se edita `apps/site` |
