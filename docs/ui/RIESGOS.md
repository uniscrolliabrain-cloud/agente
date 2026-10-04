# Riesgos - Campaña UI/UX

> **UI_CAMPAIGN_05_RIESGOS_V1**
>
> Riesgos identificados que pueden afectar a la campaña. Cada uno con probabilidad,
> impacto, mitigación y estado.
>
> Última actualización: 2026-10-03.

---

## R01 - El backend cambia mientras la campaña está en curso

**Probabilidad:** media.
**Impacto:** alto.
**Contexto:** el backend se toca cuando el flujo lo pide. Si otro trabajo cambia
`AgentTask`, `ActionProposal` o `SystemEvent`, los branches de la campaña pueden
romperse.

**Mitigación:**
- Cada branch lee los ficheros reales antes de tocarlos.
- Si un contrato del dominio cambia, se actualiza `packages/domain` primero y se
  avisa a los branches afectados.
- Los tests cubren la lógica pura.

**Estado:** vigilado.

---

## R02 - El `AUDIT_CONTRACTS.md` tiene 121 contratos huérfanos

**Probabilidad:** alta (ya existe).
**Impacto:** medio.
**Contexto:** hay 121 tipos del dominio sin implementación real. Muchos son de
UI servida (`ViewSpec`, `FormSpec`, `ProvenanceChip`). Eso significa que el
backend tiene stubs.

**Mitigación:**
- Los branches D1, D2, D3 resuelven parte.
- Los que no se resuelven se quedan y se limpian en una campaña de limpieza.
- No se añaden contratos nuevos sin implementación.

**Estado:** aceptado.

---

## R03 - Los 5 bugs del anexo honesto del TODO

**Probabilidad:** alta (ya existen).
**Impacto:** alto para vender.
**Contexto:** el TODO identifica 5 bugs que hay que arreglar antes del primer
cliente real:

- **#3** lista de fuentes RAG no existe.
- **#5** category/tags no persisten en memoria (A1).
- **#6** assignedTo ambiguo (C1).
- **#9** panel de clientes sin check admin.
- **#15** "Responder" es un botón muerto.

**Mitigación:**
- #5 → branch A1.
- #6 → branch C1.
- #3 → branch E2.
- #9 → fuera de campaña, se hace aparte.
- #15 → fuera de campaña, se hace aparte.

**Estado:** en curso.

---

## R04 - El CSS existente tiene clases duplicadas

**Probabilidad:** alta.
**Impacto:** bajo.
**Contexto:** `index.css` tiene `.v2-*`, `.v3-*` y clases del UI-REDESIGN
(`.status`, `.banner`, `.ws`, `.topbar`). Algunas hacen lo mismo con nombres
distintos.

**Mitigación:**
- Decisión D16: reutilizar lo existente, no duplicar.
- Si un componente necesita una clase que ya existe con otro nombre, se usa la
  existente.
- Limpieza de duplicados en campaña posterior.

**Estado:** aceptado.

---

## R05 - El `useTypewriter` con `requestAnimationFrame` puede consumir CPU

**Probabilidad:** baja.
**Impacto:** medio.
**Contexto:** si hay 50 mensajes montados y todos tienen su `useTypewriter`, 50
loops de `requestAnimationFrame` corriendo. El `if (done && shown >= target.length) return`
los corta, pero solo cuando terminan.

**Mitigación:**
- Solo el último mensaje está activo. Los anteriores tienen `done: true` y
  `shown === target.length`, así que no piden frames.
- Test de rendimiento si se ven problemas.

**Estado:** aceptado.

---

## R06 - El `useLiveActivity` con polling puede saturar `/api/events`

**Probabilidad:** media.
**Impacto:** medio.
**Contexto:** polling cada 5s a `/api/events?since=`. Con muchos usuarios, son
muchas requests.

**Mitigación:**
- D18: `since` para incremental. Cada poll trae solo eventos nuevos.
- Backoff si falla (2x hasta 30s).
- Pausa con `document.hidden`.
- SSE en branch aparte si hace falta.

**Estado:** aceptado.

---

## R07 - El `DeferredActions` puede ejecutar acciones duplicadas tras un reinicio

**Probabilidad:** media.
**Impacto:** alto (dinero).
**Contexto:** si el servidor se reinicia con acciones `scheduled` cuya hora ya
pasó, hay que ejecutarlas. Pero hay que asegurar que no se ejecutan dos veces.

**Mitigación:**
- `claim` es CAS: solo un proceso gana.
- El test de C3 cubre "tick doble no ejecuta dos veces".
- La reconciliación al arranque se prueba.
- Idempotencia del `run` en el `ActionService`.

**Estado:** a verificar en C3.

---

## R08 - Los docs pueden quedar desactualizados

**Probabilidad:** media.
**Impacto:** bajo.
**Contexto:** los docs de la campaña se actualizan al cerrar cada branch. Si un
branch se para a medias y no se cierra, el doc queda en estado incorrecto.

**Mitigación:**
- `01-PROTOCOLO.md` obliga a actualizar el `.md` del branch al cerrar.
- Si un branch se bloquea, se marca `BLOQUEADO` y se anota la razón.
- `99-HISTORIAL.md` es la fuente de verdad de qué se cerró.

**Estado:** aceptado.

---

## R09 - La migración a `roleIds: string[]` rompe usuarios existentes

**Probabilidad:** media.
**Impacto:** medio.
**Contexto:** D01. Cambiar `roleId: string` a `roleIds: string[]` afecta a
`UserService`, `auth-routes.ts`, `UsersView.tsx`.

**Mitigación:**
- Migración compatible: si el usuario tiene `roleId`, se migra a `roleIds: [roleId]`
  al leerlo.
- Script de migración para la DB.
- Se hace en branch aparte (`feat/multi-role`), no en los 15.

**Estado:** fuera de campaña.

---

## R10 - El `ViewRenderer` puede romperse si el LLM devuelve un spec inválido

**Probabilidad:** alta.
**Impacto:** bajo.
**Contexto:** el `ViewSpec` se valida con Zod antes de renderizar. Si falla, se
muestra un mensaje. Pero el LLM puede devolver algo que pase Zod pero no tenga
sentido.

**Mitigación:**
- Validación con Zod estricta.
- Solo 2 templates al principio (`dashboard`, `queue`).
- Resolver por intenciones cerradas, no LLM libre.
- `assertNever` para garantizar exhaustividad.

**Estado:** aceptado.

---

## R11 - El merge de un branch puede romper otro

**Probabilidad:** media.
**Impacto:** alto.
**Contexto:** 15 branches. Si dos tocan el mismo fichero, hay conflicto.

**Mitigación:**
- `02-ARQUITECTURA.md` lista qué ficheros toca cada branch.
- `B1` (shell) toca `App.tsx`, `SidebarV2.tsx`, `TopBarV2.tsx`. Ningún otro
  branch los toca.
- Si dos branches necesitan el mismo fichero, se secuencian.
- Cada branch revierte sin tocar otros.

**Estado:** vigilado.

---

## R12 - El `ActionProposal.status: "scheduled"` puede romper tests existentes

**Probabilidad:** baja.
**Impacto:** medio.
**Contexto:** D06. Añadir un estado al enum puede romper tests que asumen los
estados actuales.

**Mitigación:**
- Revisar tests de `actions.test.ts` (que existen y cubren approve/deny).
- Los tests actuales no prueban `scheduled`, así que no deberían romperse.
- Añadir tests específicos para `scheduled`.

**Estado:** a verificar en C3.

---

## R13 - La campaña puede durar más de 3 meses

**Probabilidad:** alta.
**Impacto:** bajo.
**Contexto:** 26-33 sesiones estimadas. Si cada sesión es de 1 hora y se hacen 2
por semana, son 4 meses. Si se hacen 3, son 3 meses.

**Mitigación:**
- Priorizar A, B, C (cimientos + shell + vistas core) que es lo que da valor
  visible.
- D y E pueden esperar.
- Un branch puede dividirse en sub-branches si es muy grande.

**Estado:** aceptado.

---

**Fin de los riesgos.**