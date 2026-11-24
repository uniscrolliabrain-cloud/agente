# Matriz de paridad

Estados: **UI Lab** (existe en el laboratorio), **Integrada** (código en `apps/web`),
**Desplegada** (servida en producción), **Verificada** (comprobada en navegador real).

| Superficie | UI Lab | Integrada | Desplegada | Verificada | Incidencias |
|---|---|---|---|---|---|
| 01 Landing | sí (vendor) | snapshot vivo en `apps/site` | **no**: Vercel sin cuota; sigue la versión del 22-nov | sí, sin cambios | banner y redirects no publicados |
| 02 Login V3 | sí | sí (`303cbd6`) | sí en Fly (`cc57524`) | sí: render, OAuth 302, demo y logout | login completo pendiente de cuenta |
| 03 Legal V1 | sí | sí (`aeef4e4`) | sí en Fly (`cc57524`) | sí: deep link y contenido | redirects del ápice pendientes de Vercel |
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
