# Matriz de paridad funcional

Cada control del Centro de Mando original tiene su equivalente en la composición editorial.
«Prueba» indica dónde se verificó (ver `06-QA.md`).

## Cabecera y permisos

| Control original | Control editorial | Handler / estado | Prueba |
|---|---|---|---|
| `BrandLockup` | idéntico (reutilizado) | — | captura 1440 |
| Chip «Empresa · {tenant}» | `.cce-chip` | `overview.tenant.name` | captura |
| Chip activo «Centro de mando» | `.cce-chip--active` | — | captura |
| Chip de rol | `.cce-chip` | `ROLE_LABEL[role]` | captura |
| «Añadir agente» (solo `canManageMembers`) | botón editorial | abre `AgentCreateModal` real | clic + modal |
| «Añadir persona» (solo `canManageMembers`) | botón primario | abre `AddMemberModal` real con `isOwner` | abierto y cerrado |
| «Actualizar» | botón icono con spinner | `onRefresh` → recarga en segundo plano | clic + sin replay de motion |

## Briefing

| Original | Editorial | Contrato |
|---|---|---|
| `briefingText(overview)` | mismo texto | función reutilizada, no reescrita |
| «Preguntar a LAIA» | mismo botón | `onOpenChat` (en laboratorio: aviso honesto) |
| «Ver qué hizo» (solo con trabajo cerrado) | mismo botón | `hasFinishedWork` + scroll a `#cce-timeline` |

## Cifras y filtros

| Original | Editorial | Contrato |
|---|---|---|
| KPI Prioridades = esperando + fallidas | misma fórmula | clic alterna filtro `aprobaciones` |
| KPI En marcha | `overview.tasks.running` | clic alterna `en-marcha` |
| KPI Agentes = activos | filtro de `active` | clic alterna `agentes` |
| KPI Equipo = miembros | `members.length` | clic alterna `equipo` |
| Cinco filtros `Todo / Solo aprobaciones / En marcha / Agentes / Equipo` | mismos, mismo orden | un único `CommandFilter` | verificado: filtro activo con `aria-pressed` |

## Secciones

| Original | Editorial | Contrato |
|---|---|---|
| Requiere tu atención (`isAttention`) | `EditorialAttention` | mismas tarjetas, `onOpenTask`, `onReviewTask` solo en `waiting_approval` |
| En marcha ahora | `EditorialRunning` | `onOpenTask`, estado vacío original |
| Qué hizo tu OS agéntico (`succeeded`, 6) | `EditorialDone` | `onOpenTask` («Ver prueba»), avatar inicial |
| Estado operativo (6 bloques) | `EditorialOperational` | mismo contenido, `aria-expanded`, detalle inline/hoja, acciones reales |
| Equipo y agentes | `EditorialPanels` | `showTeam/showAgents`, «Crear el primero» si `canManageMembers`, enlaces reales |
| Aviso «Datos de ejemplo» + toggle | `SampleBanner` | `sampleAvailable`, `sampleHidden`, mismo copy |

## Añadido sin romper paridad

| Elemento | Por qué | Datos |
|---|---|---|
| «Lo que te has perdido» | El founder pide un feed cronológico de lo ocurrido | `tasks.recent` con estados `queued/scheduled/paused/cancelled`, orden por `updatedAt`. Sin texto inventado |
| Hoja móvil del detalle operativo | El detalle inline era incómodo en móvil | mismo contenido que el detalle de escritorio |

## Descartado a propósito

| Idea | Motivo |
|---|---|
| Sección «Aprobaciones» separada | Duplicaría las mismas tareas de «Requiere tu atención»; la revisión ya ocurre con `onReviewTask` |
| Botón «Aprobar» directo | No existe en la vista original; la aprobación pasa por el flujo existente |
| Cifras animadas | Prohibido: no se animan números ni se simula actividad |
| Sidebar o botón de chat propios | Duplicarían el shell transversal |
| Datos de ingresos, reuniones o conversaciones en el tenant | No hay endpoint; se quedan en el modo ejemplo |

## Estados

| Estado | Original | Editorial |
|---|---|---|
| Cargando | `.cc-loading` con spinner | esqueleto con `aria-busy` y texto para lectores |
| Error | `.chat-error` + botón reintentar | bloque de error con el mismo mensaje y acción |
| Sin empresa cargada | `.cc-empty` | bloque de error recuperable |
| Sin actividad | modo ejemplo + aviso | igual, con copy propio y dashboard de ejemplo reutilizado |
| Sin pendientes | `.cc-empty` | mismo mensaje con icono |
| Fallo de tarea | tarjeta con acento | acento rojo lateral y etiqueta «Error» |
