# Auditoría y baseline (C00)

## Superficies implicadas

| Superficie | Ruta | Decisión |
|---|---|---|
| Centro de Mando de inicio (`today`) | `apps/web/src/components/CommandCenterView.tsx` | **Objeto de la campaña**, vía copia aislada en UI Lab. Original intacto |
| Estudio de Operaciones (workspace 35) | `apps/web/src/workspaces/35-centro-mando/` | Fuera de alcance. Sin cambios |
| Control de actividad | `apps/web/src/components/ControlCenterView.tsx` | Fuera de alcance. Sin cambios |
| Shell / sidebar / topbar / chat | `apps/web/src/components/AppShell.tsx`, `TopBarV2.tsx`, `ChatPanel.tsx` | Sin cambios; no se duplica navegación |
| Datos | `GET /api/company` + router demo del navegador | Sin cambios de contrato ni de endpoints |

## Inventario de la vista original

`CommandCenterView.tsx` (289 líneas) compone:

| Pieza | Contrato | Estado tras la campaña |
|---|---|---|
| `CommandCenterHero` | `tenantName`, `role`, `canManageMembers`, `updatedAt`, `refreshing`, `onRefresh`, `onAddAgent`, `onAddPerson` | Recreada como `EditorialHero`, mismos datos y permisos |
| `BriefingCard` + `briefingText` | `overview`, `hasFinishedWork`, `onSeeWork`, `onOpenChat` | Texto reutilizado tal cual; nueva piel |
| `CommandFilters` | 4 cifras + 5 filtros sobre un único `CommandFilter` | `EditorialKpis` + `EditorialFilters`, mismo estado |
| `TaskSections` (atención, en marcha, hecho) | `tasks`, `whoFor`, `onOpenTask`, `onReviewTask` | `EditorialAttention`, `EditorialRunning`, `EditorialDone` |
| `OperationalStatus` | 6 bloques con detalle expandible y acciones | `EditorialOperational` + hoja móvil |
| `CompanyPanels` | equipo y agentes, `canManageMembers` | `EditorialPanels` |
| `SampleDashboard` | ejemplo con datos inventados y su propio filtro | Reutilizado sin copia; re-vestido por CSS |
| Aviso de ejemplo | `sampleAvailable`, `sampleHidden`, toggle | Igual, con `SampleBanner` editorial |
| Notices de alta | `setNotice` tras crear agente/persona | Igual, mismo texto |
| Modales | `AgentCreateModal`, `AddMemberModal` | Reutilizados sin cambios |

## Problemas detectados en el baseline

| # | Observación | Evidencia | Decisión |
|---|---|---|---|
| 1 | Saludo de 30 px en Manrope, sin peso editorial | `.cc-title` en `apps/web/src/index.css` | Saludo Fraunces 52/40/34 px con `clamp` |
| 2 | Briefing visualmente equivalente a una tarjeta más | `.cc-briefing` fondo lila y texto 14 px | Marfil con regla de oro, texto 16,5 px y 72 ch |
| 3 | Cifras en tarjetas cerradas con sombra de color | `.cc-kpi` borde + `box-shadow` | Cifras abiertas con separadores y subrayado de selección |
| 4 | Todo el contenido compite en la misma densidad | 4 secciones de tarjetas idénticas | Jerarquía por sección: tarjetas solo en atención y en marcha; feed y trazabilidad en listas |
| 5 | Sin feed cronológico de lo ocurrido | No existe en la vista original | Sección nueva con datos reales, sin inventar contenido |
| 6 | Detalle operativo solo inline, incómodo en móvil | `.cc-block-detail` bajo la rejilla | Hoja inferior en ≤620 px con foco, Escape y retorno |
| 7 | Fuentes dependientes de Google Fonts | `lab.css` e `index.css` importan CSS remoto | Fraunces y Manrope self-hosted en el módulo |
| 8 | Cero movimiento de entrada | Sin animaciones en `cc-*` | Entrada en tres tiempos, sin replay en polling |

## Elementos que no deben cambiar (verificados)

- Un único `h1` por vista; jerarquía de `h2` por sección.
- Los cinco filtros y su semántica (`todo`, `aprobaciones`, `en-marcha`, `agentes`, `equipo`).
- `canManageMembers` decide la visibilidad de «Añadir agente/persona»; `role === "owner"` viaja
  hasta `AddMemberModal.isOwner`.
- Los botones de tarea solo aparecen con callback real.
- El modo ejemplo no se mezcla con datos reales: siempre bajo el aviso «Datos de ejemplo».
