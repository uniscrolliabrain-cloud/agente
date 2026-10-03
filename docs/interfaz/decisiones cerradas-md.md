# Decisiones cerradas - Campaña UI/UX

> **UI_CAMPAIGN_03_DECISIONES_V1**
>
> Registro de decisiones que afectan a varios branches. Cada decisión lleva fecha y contexto. No se reabren sin motivo.
>
> Última actualización: 2026-10-03.

---

## D01 - Usuario con varios roles (`roleIds: string[]`)
**Estado:** CERRADA. Varios roles por usuario.
`User.setup.roleIds: string[]` en vez de `roleId: string`. Migración compatible: `roleIds: [roleId]`.
Va en branch aparte (`feat/multi-role`) antes de E3.

## D02 - Sidebar como lista de vistas (no árbol ClickUp)
**Estado:** CERRADA. Lista de vistas. La jerarquía puede existir en el modelo, no en el sidebar.

## D03 - Presence en tiempo real: después
**Estado:** CERRADA. Fuera de campaña. Va a campaña futura.

## D04 - `useTypewriter` con API nueva (`target`, `streamDone`)
**Estado:** CERRADA. Reescribir. Devuelve `{ text, typing }`. Va en B2.

## D05 - `ChatMessage.toolCall` → `ChatMessage.tools: ToolCall[]`
**Estado:** CERRADA. Cambio de tipo. Va en B2.

## D06 - `ActionProposal.status: "scheduled"` nuevo
**Estado:** CERRADA. Añadir estado + `signers`, `needed`, `executeAt`. Va en C3.

## D07 - `TaskStep.status` unificado con `done` / `error`
**Estado:** CERRADA. Mapear en frontend. El backend conserva `succeeded` / `failed`. Va en C1.

## D08 - `stale` gana a `pulse` en `pickPrimary`
**Estado:** CERRADA. Prioridad: `alert > error > stale > pulse > progress > counter > timer > queued > done`. Va en A2.

## D09 - Umbral de duplicados de memoria a 0.6
**Estado:** CERRADA. Threshold 0.6 + checksum exacto primero. Va en E1.

## D10 - `ViewSpec` con discriminated union
**Estado:** CERRADA. Migrar. Va en D1 + D3.

## D11 - Solo 2 templates al principio (`dashboard`, `queue`)
**Estado:** CERRADA. Empezar con 2. El resto a branches posteriores. Va en D3.

## D12 - `pickPrimary` en `packages/domain`, no en frontend
**Estado:** CERRADA. En domain. Va en A2.

## D13 - Tests de lógica pura con `tsx --test` (no Vitest)
**Estado:** CERRADA. Sin Vitest. Tests en `tests/*.test.ts`. Aplica a todos los branches.

## D14 - Undo en servidor (no local)
**Estado:** CERRADA. Solo servidor. Va en C3.

## D15 - Doble firma configurable (no fija en 5000 EUR)
**Estado:** CERRADA. Configurable por tenant. Default `null` (sin doble firma). Va en C3.

## D16 - CSS existente se reutiliza (no se duplica)
**Estado:** CERRADA. Reutilizar `.stream-cursor`, `.live-item`, `.cascade-item`, `.panel-slide-in`. Aplica a todos.

## D17 - Panel derecho del shell cerrado por defecto
**Estado:** CERRADA. `usePanel("ui.right", false)`. Va en B1.

## D18 - `/api/events?since=` para polling incremental
**Estado:** CERRADA. Añadir `since` al endpoint. Va en A2.

## D19 - SSE del bus: después
**Estado:** CERRADA. Polling primero, SSE en branch aparte. Va en A2.

## D20 - `memorySchema` sin `.strict()`
**Estado:** CERRADA. Sin `.strict()`. Va en A1.

## D21 - `compareAndSwap` solo (no mezclar con `put()`)
**Estado:** CERRADA. Solo `compareAndSwap`. `null` en JSON = "sin categoría". Va en A1.

---

## Decisiones fuera de la campaña (para no olvidar)

- **D01 (roleIds)** → branch `feat/multi-role`.
- **D03 (presence)** → campaña futura.
- **SSE real del bus** → branch `feat/event-stream-sse`.
- **Kanban drag real** → necesita endpoint nuevo.
- **Notificaciones push** → campaña futura.
- **Billing con Stripe webhooks** → campaña futura.
- **Admin console completa** → campaña futura.
- **121 contratos huérfanos** → limpieza posterior.

---

**Fin de las decisiones.**