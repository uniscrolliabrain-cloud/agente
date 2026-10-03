# Log maestro - Campana UI/UX OpenMuse

> **UI_CAMPAIGN_LOG_MAESTRO_V1**
>
> Documento de entrada a la campana. Explica que es, que hay que hacer, y donde
> estamos. Se actualiza al cerrar cada fase.
>
> Ultima actualizacion: 2026-10-03.

---

## 1. Que es esta campana

Reconstruir la UI/UX de OpenMuse para que el sistema no solo navegue pantallas,
sino que sirva vistas. Dos modos conviven:

1. **Modo navegacion** - el usuario clica en Chat, Tareas, Documentos, etc.
2. **Modo servido** - el usuario pide algo y el sistema monta una vista
   contextual (ViewSpec -> template -> render).

El backend ya tiene la data (AgentTask.plan, SystemEvent, ActionProposal,
BusinessEntity.provenance, AgentMemory.roleId, Thought del kernel). La UI
actual usa una fraccion, y con polling plano. Esta campana lo cambia.

## 2. Objetivos concretos

- Chat con typewriter adaptativo y tool calls agrupados.
- Sidebar con LiveItem que "vive" (contadores, progreso, alertas en vivo).
- Tareas con timeline del plan paso a paso.
- Inbox de aprobaciones con undo en servidor (8s).
- Centro de control con KPIs vivos.
- Sistema de UI servida (ViewSpec + ViewResolver + ViewRenderer).
- Conocimiento por rol (board).
- Documentos con arbol y multi-upload.
- Equipo con matriz de permisos.

## 3. Como esta organizado

**5 fases. 15 branches. 39 ficheros nuevos. 50 modificados.**

### Fase A - Cimientos (3 branches)

Dejar el suelo firme. Sin esta fase, el resto se construye sobre arena.

| Branch | Nombre | Estado |
|---|---|---|
| A1 | Hotfix de memorias (category, tags) | EN CURSO |
| A2 | Cimientos de eventos (pickPrimary, LiveActivity) | PENDIENTE |
| A3 | Hooks base (useNow, useReducedMotion, useHotkeys, usePanel) | PENDIENTE |

### Fase B - Shell y chat (3 branches)

La app se ve coherente y el chat respira.

| Branch | Nombre | Estado |
|---|---|---|
| B1 | Shell 3 columnas plegables | PENDIENTE |
| B2 | Chat typewriter + tool calls agrupados | PENDIENTE |
| B3 | LiveItem en sidebar | PENDIENTE |

### Fase C - Vistas core (3 branches)

Las 3 vistas que el usuario usa cada dia.

| Branch | Nombre | Estado |
|---|---|---|
| C1 | Tareas con timeline | PENDIENTE |
| C2 | Centro de control v2 | PENDIENTE |
| C3 | Inbox de aprobaciones con undo en servidor | PENDIENTE |

### Fase D - UI servida (3 branches)

El sistema sirve vistas. El mas grande e incierto.

| Branch | Nombre | Estado |
|---|---|---|
| D1 | ViewSpec tipos y schemas | PENDIENTE |
| D2 | ViewResolver + endpoint | PENDIENTE |
| D3 | ViewRenderer + 2 templates + panel contextual | PENDIENTE |

### Fase E - Vistas secundarias (3 branches)

Cerrar los flujos secundarios.

| Branch | Nombre | Estado |
|---|---|---|
| E1 | Conocimiento por rol | PENDIENTE |
| E2 | Documentos (arbol + multi-upload) | PENDIENTE |
| E3 | Equipo (matriz de permisos) | PENDIENTE |

## 4. Como se trabaja

**Reglas duras:**

1. **Un flujo por branch.** Cada branch entrega un flujo completo de punta a punta.
2. **Commits ordenados dentro del branch.** Contrato -> backend -> hook -> componente -> cableado -> test.
3. **Merge a main solo cuando el flujo funciona completo.**
4. **Backend se toca cuando el flujo lo pide.** No antes, no despues.
5. **Tests de logica pura como prioridad.**
6. **CSS existente se reutiliza.** Nada de duplicar.
7. **Typecheck verde antes de cada merge.**
8. **Cada branch revierte sin tocar otros.**

**Antes de escribir:**

1. Leer el fichero real del repo. Siempre.
2. Comprobar idempotencia (marca XXX_V1).
3. Detectar line endings (CRLF/LF).
4. Escribir UTF-8 sin BOM.
5. Ledger al final de cada bloque.

**Errores ya cometidos (no repetir):**

- Add-Content con arrays de strings.
- Anchors con `$` final y CRLF.
- Mezclar `put()` (no atomico) con `compareAndSwap()` (atomico).
- Aplicar `.strict()` sin verificar.
- Escribir handlers grandes sin tests.

## 5. Que hay en docs/interfaz/

**Transversales:**

| Fichero | Contenido |
|---|---|
| `00-ESTRATEGIA.md` | Las 5 fases y 15 branches. |
| `01-PROTOCOLO.md` | Como trabajamos (ledger, idempotencia, line endings). |
| `02-ARQUITECTURA.md` | Mapa de que fichero toca que branch. |
| `03-DECISIONES.md` | 21 decisiones cerradas (D01-D21). |
| `04-GLOSARIO.md` | Terminos del dominio y la UI. |
| `05-RIESGOS.md` | Riesgos identificados. |
| `06-VERIFICACION.md` | Como se verifica un branch. |
| `07-FLUJOS.md` | Flujos de usuario (F01-F08). |

**Por branch:**

- `A1-memorias.md`, `A2-eventos.md`, `A3-hooks.md`.
- `B1-shell.md`, `B2-chat.md`, `B3-liveitem.md`.
- `C1-tareas.md`, `C2-centro-control.md`, `C3-aprobaciones.md`.
- `D1-viewspec-tipos.md`, `D2-viewresolver.md`, `D3-viewrenderer.md`.
- `E1-conocimiento.md`, `E2-documentos.md`, `E3-equipo.md`.

**Cierre:**

- `99-HISTORIAL.md` - que se cerro, cuando, con que.

## 6. Donde estamos ahora (2026-10-03)

### Hecho

- **Rama `feat/a1-memory-hotfix` creada y mergeada a `main`.**
- **Push a `origin/main`.** Commit `c477694`.
- **Estructura `docs/interfaz/` creada** con los docs transversales.

### Pendiente inmediato

- **Renombrar docs con nombre roto** (doble extension, tildes):
  - `a1-hotfix-de-memorias.md.md` -> `A1-memorias.md`
  - `campana.md.md` -> `99-HISTORIAL.md`
  - `decisiones cerradas-md.md` -> `03-DECISIONES.md`
  - `glosario-ui.md` -> `04-GLOSARIO.md`
  - `riesgos-ui.md.md` -> `05-RIESGOS.md`
  - `verificacion-campana-ui.md` -> `06-VERIFICACION.md`
- **Aplicar el fix real de A1** (codigo):
  - `apps/server/src/engine/routes.ts` (schema + handler).
  - `apps/web/src/components/MemoryView.tsx` (saveEdit).
  - `tests/memory.test.ts` (5 casos).
- **Verificar**: `pnpm typecheck` + `pnpm --filter @openmuse/web typecheck` + `pnpm test`.

### Proximo despues

- **A2** (cimientos de eventos: pickPrimary, LiveActivity, useLiveActivity).
- **A3** (hooks base: useNow, useReducedMotion, useHotkeys, usePanel).
- **B1** (shell 3 columnas).
- **B2** (chat con typewriter).

### Fuera de campana (no tocar ahora)

- Presence en tiempo real.
- Kanban con drag real.
- Notificaciones push.
- Billing con Stripe webhooks.
- Admin console completa.
- WhatsApp via Evolution API.
- Busqueda hibrida completa.

## 7. Totales de la campana

| Concepto | Cantidad |
|---|---|
| Fases | 5 |
| Branches | 15 |
| Ficheros nuevos | 39 |
| Ficheros modificados | 50 |
| Total tocados | 89 |
| Sesiones estimadas | 26-33 |
| Duracion estimada | 2-3 meses |

Desglose por area:

| Area | Nuevos | Modificados |
|---|---|---|
| Frontend | 33 | 28 |
| Backend | 2 | 12 |
| Domain | 2 | 4 |
| Tests | 12 | 0 |
| CSS + config | 0 | 3 |

El 70% del trabajo es frontend.

## 8. Orden de ejecucion recomendado

1. **A1** (hotfix memorias) - independiente.
2. **A2** (cimientos eventos) - base para B3, C2, C3.
3. **A3** (hooks base) - base para B1, B2, B3, C1, C2, C3, D3.
4. **B1** (shell) - base para todo lo demas.
5. **B2** (chat) - independiente de B1.
6. **B3** (liveitem) - depende de A2 + B1.
7. **C1** (tareas) - depende de B1 + A3.
8. **C2** (centro control) - depende de A2 + B1 + A3.
9. **C3** (aprobaciones) - depende de A2 + B1 + A3.
10. **D1, D2, D3** (UI servida) - secuencialmente.
11. **E1, E2, E3** (vistas secundarias) - dependen de B1.

## 9. Como retomar la campana

Si vuelves despues de un tiempo:

1. Leer este `LOG-MAESTRO.md`.
2. Leer `00-ESTRATEGIA.md` (fases y branches).
3. Leer `01-PROTOCOLO.md` (como se trabaja).
4. Leer `02-ARQUITECTURA.md` (que fichero toca que branch).
5. Mirar la seccion 6 de este log: donde estamos.
6. Mirar `99-HISTORIAL.md`: que se cerro.
7. Continuar por el branch pendiente segun el orden de la seccion 8.

## 10. Referencias

- `docs/interfaz/00-ESTRATEGIA.md` - estrategia completa.
- `docs/interfaz/01-PROTOCOLO.md` - protocolo de trabajo.
- `docs/interfaz/02-ARQUITECTURA.md` - mapa de ficheros.
- `docs/interfaz/03-DECISIONES.md` - decisiones cerradas.
- `docs/interfaz/07-FLUJOS.md` - flujos de usuario.
- `docs/interfaz/99-HISTORIAL.md` - historial de cierres.
- `docs/UI-REDESIGN.md` - diseno del shell (referencia).
- `docs/UI_ANIMATIONS.md` - animaciones (referencia).
- `docs/TEMPLATES_V2.md` - 7 templates (referencia).

---

**Fin del log maestro.**