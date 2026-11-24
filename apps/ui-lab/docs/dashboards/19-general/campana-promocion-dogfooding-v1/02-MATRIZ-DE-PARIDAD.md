# Matriz de paridad

Estados: **UI Lab** (existe en el laboratorio), **Integrada** (código en `apps/web`),
**Desplegada** (servida en producción), **Verificada** (comprobada en navegador real).

| Superficie | UI Lab | Integrada | Desplegada | Verificada | Incidencias |
|---|---|---|---|---|---|
| 01 Landing | sí (vendor) | snapshot vivo en `apps/site` | pendiente del run | preview local | banner y redirects añadidos; sin rediseño |
| 02 Login V3 | sí | sí (`303cbd6`) | pendiente del run | preview local + demo | OAuth/contraseña no probados end-to-end |
| 03 Legal V1 | sí | sí (`aeef4e4`) | pendiente del run | preview local | textos reales del 21-nov; sin aprobación jurídica nueva |
| 04 Chat transversal V3 | sí | no | no | no | requiere cablear `useChat`, voces y permisos |
| 08 Centro de Mando V2 | sí | no | no | no | componente editorial listo sobre `CompanyOverview` |
| 09 Chat principal | sí (`chat-ux-v2`) | no | no | no | falta portar CSS/markup a `ChatPanel` real |
| 11 Apps Launcher V3 | sí | no | no | no | falta mapear 35 ids a workspaces reales |

## Contratos conservados

- `useAuth` (`login`, `loginDemo`, `logout`, `me`, restauración y 401).
- Rutas OAuth existentes, sin cambios de servidor.
- `useChat`, threads, historial, streaming, adjuntos y aprobaciones: intactos.
- `CompanyOverview`, `useWorkspaces`, permisos y router: intactos.
- Ningún fixture del laboratorio entra en `apps/web`.
