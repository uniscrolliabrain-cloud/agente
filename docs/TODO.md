# OpenMuse — TODO

> Verdad: este fichero + HANDOFF.md + el repo actualizado que el usuario mantiene.
> Ultima actualizacion: 28 sep 2026 (post-merge 85853b1, main).
> Este fichero NO es un changelog. Es lo que queda por hacer, ordenado por valor, con el estado real del repo.

---

## 0. Pendiente de resolver antes de tocar nada

- **Merge de `feat/client-onboarding` a `main` a medias.** 7 conflictos resueltos a mano
  (`.env.example`, `README.md`, `apps/server/src/app.ts`, `apps/server/src/auth-routes.ts`,
  `apps/server/src/engine/model.ts`, `scripts/admin-create.ts`, `scripts/provision-client.ts`),
  mas un bug de `conversation.ts` (`await` fuera de `async`, TS1308) y un duplicado de
  `roleId`/`roleContext`/`finalPrompt` (TS2451 x6) que puede o no estar resuelto. El commit
  del merge no esta confirmado.
- **Backups pre-merge.** `backup/pre-merge-20260928-191836` y
  `backup/pre-merge-20260928-191923`, ambos apuntando a `25d64b9`. Solo en local. Es el
  unico punto de retorno si el merge se rompe. **No borrar.**
- **`PROMPT-CLINE-RESULTADO.md` no existe.** Cline lo iba a escribir y no aparece en el
  repodump. Confirma que Cline no termino los 10 bloques.
- **No escribir docs ni codigo sobre `feat/client-onboarding` hasta que el merge se cierre.**
  Si se aborta, lo que se escriba se pierde.

---

## 1. Estado del repo

### Ramas y merge

- `main` = post-merge `85853b1` con el trabajo de Cline (AUDIT B1-B4, D1-D11, P2 resueltos).
- `feat/client-onboarding` = rama local con AgentRole, seedAgents, `/api/agent/roles`,
  provision-client ampliado, `clientes/_example/` con memorias/agentes/users, docs nuevos.
  **No mergeada en `main`.** El merge esta a medias (ver seccion 0).
- `backup/pre-merge-*` = punto de retorno pre-merge, solo en local.
- Cline trabaja en paralelo en `feat/agent-ui`, `chore/tech-debt`, `feat/pgvector`.
  No tocar esas ramas ni `main` mientras trabaja.

### Frentes activos (4)

1. Backend manual producto (esta ventana): los 3 bloques de la seccion 2.
2. Cline: `feat/agent-ui`, `chore/tech-debt`, `feat/pgvector`.
3. UI/UX y multi-thread: ya cerrado en `main` (viene de `feat/ui-and-features`).
4. Manual de producto (documento externo, ~150 secciones): lo que promete y el backend aun
   no cumple. Es lo que cierran los 3 bloques de la seccion 2.

### Ficheros con riesgo de choque

No tocar sin coordinar:

- `clientes/_example/` (C4, C10 pendientes en Cline).
- `.gitattributes` (C1 pendiente, no verificado).
- `.gitignore` (C5 pendiente, no verificado).
- `docs/TODO.md` (este fichero: C7 pendiente; lo esta reescribiendo esta ventana).
- `docs/HANDOFF.md` (C8 pendiente en Cline; ademas contiene la seccion 0.12b que solo existe
  en `feat/client-onboarding`, ver seccion 5).

### Lo que no se ha ejecutado nunca

- `scripts/seed-agents.ts` (creado en `feat/client-onboarding`): codigo muerto hasta que ese
  merge se cierre. Prueba del flujo de agentes requiere:
  1. Merge de `feat/client-onboarding` a `main`.
  2. `pnpm dev` arrancado.
  3. `pnpm seed-agents clientes/_example` con `OPENMUSE_ACCESS_KEY` definido.
  4. Verificar que `/api/agent/roles` devuelve los 6 roles.

---

## 2. Backend manual producto (PENDIENTE, mas valor)

Tres bloques backend puros, sin UI, acotados. Cierran la brecha entre lo que promete el
manual de producto y lo que el backend hace hoy.

### 2.1 `when` en SOPs (condicionales)

**Problema**: los SOPs son lineales. El manual promete "procedimientos con decisiones":
"Si A y B, continua; si C, solicita revision."

**Ficheros**:

- `packages/domain/src/sop.ts`: anadir `when?: string` al `sopStepSchema` (opcional).
- `apps/server/src/engine/sop-executor.ts`: en el bucle `while (index < sop.steps.length)`,
  antes de ejecutar el paso, si `step.when` existe, interpolar con el motor `interpolate()`
  que ya existe y evaluar como verificacion simple: `""`, `"0"`, `"false"` -> falsy, se salta
  el paso (marcar `skipped`, no `succeeded`); cualquier otro string -> truthy.

**Decision tecnica**: no meter un evaluador de expresiones nuevo. Cero dependencias.

**Verificacion**: `pnpm typecheck` + SOP manual de 2 pasos donde el paso 2 solo corre si el
paso 1 devuelve algo.

### 2.2 `escalate_task`

**Problema**: `AgentTask.assignedTo` existe y nadie lo usa. El manual promete "escalado a
persona". `ask_user` pausa, pero no escala a otro usuario con notificacion dirigida.

**Ficheros**:

- `apps/server/src/engine/service.ts`: nuevo metodo `escalateTask(owner, taskId, toUserId, reason)`.
  Verifica que `toUserId` es usuario activo (`UserService.getById`), actualiza
  `task.assignedTo = toUserId`, `task.status = "waiting_input"`, `task.question = reason`,
  guarda `task.state.escalatedTo` y `task.state.escalatedAt`. Notifica al usuario escalado
  (no al owner).
- `apps/server/src/engine/routes.ts`: `POST /api/agent/tasks/:id/escalate` con body
  `{ toUserId, reason }`.

**Verificacion**: `pnpm typecheck` + test que cree tarea, la escale a otro usuario y confirme
`assignedTo` y que la notificacion llego al usuario correcto.

### 2.3 `email_body_match`

**Problema**: `sop-triggers.ts` tiene `email_subject`. El manual pide "email por reglas"
que tambien dispare por contenido.

**Ficheros**:

- `apps/server/src/engine/sop-triggers.ts`: nuevo trigger `email_body_match`. En `evaluate()`
  anadir el caso. En `evaluateEmail()` generalizar para aceptar `matchField: "subject" | "body"`
  que decida contra que comparar (`Mail.body`).

**Verificacion**: `pnpm typecheck` + test que cree SOP con trigger `email_body_match` y
compruebe que dispara cuando el cuerpo contiene el patron.

---

## 3. Trabajo de Cline a medias (NO TOCAR, esperar a que cierre)

De los 10 bloques C1-C10 del `PROMPT-CLINE.md`:

| # | Bloque | Estado real |
| --- | --- | --- |
| C1 | `.gitattributes` | No verificado (puede estar en rama suya sin mergear) |
| C2 | `business-intel/SKILL.md` con `query_business` | Hecho (repodump v9) |
| C3 | `/api/skills/:id/install` -> 501 | Hecho (repodump v9) |
| C4 | `clientes/_example/config.json` sin password en claro | No hecho (sigue con `cambiar-esta-clave-2026`) |
| C5 | `.gitignore` basura | No verificado |
| C6 | stubs a `integrations/src/stubs/` | No hecho (siguen en `integrations/src/`) |
| C7 | `docs/TODO.md` actualizado | No hecho (lo hace esta ventana) |
| C8 | `docs/HANDOFF.md` seccion 1 | No hecho |
| C9 | `.env.example` completo | Cubierto por el merge de Cline, no verificado como bloque |
| C10 | READMEs de ejemplo en `clientes/_example/` | No hecho |

---

## 4. Contexto que no esta en el repodump

Cosas que viven en `feat/client-onboarding` o en la maquina del usuario, no en `main`:

- **`docs/HANDOFF.md` seccion 0.12b** ("Reglas duras de comportamiento": no pedir ficheros del
  dump, no preguntar decisiones resueltas, typecheck auto al final del bloque, no tests como
  verificacion de bloque, `$PSScriptRoot` prohibido en terminal interactiva, ledger calculado
  antes de escribir). Solo existe en `feat/client-onboarding`. **Si el HANDOFF se reescribe
  desde `main`, se pierde.**
- **`docs/AUDIT.md` secciones 7-8.** La seccion 7 tiene los arreglos aplicados y la seccion 8
  el memo de ejecucion de Cline. El AUDIT ya **no es trabajo activo**, es referencia. No
  reabrir B1-B4 ni D1-D11.
- **Backups pre-merge** `backup/pre-merge-20260928-191836` y
  `backup/pre-merge-20260928-191923`. Solo en local. No borrar hasta cerrar el merge.
- **`PROMPT-CLINE-RESULTADO.md` no existe.** Cline lo iba a escribir. Su ausencia confirma que
  no termino los 10 bloques.
- **Ficheros exclusivos de `feat/client-onboarding`** (si el merge no se cierra, viven en
  local pero no en `main`):
  - `docs/TODO-FOR-PROD.md`
  - `docs/ONBOARDING-CLIENTE.md`
  - `docs/PROMPT-CLINE.md`
  - `docs/TODO-CLINE.md` (v2)
  - `scripts/seed-agents.ts`
  - `clientes/_example/memorias.json`
  - `clientes/_example/agentes.json`
  - `clientes/_example/users.json`
  - `clientes/_example/sops/README.md`
  - `clientes/_example/skills/README.md`
  - `clientes/_example/docs/README.md`
- **Cambios que `main` no tiene** (vienen de `feat/client-onboarding`):
  - `packages/domain/src/agent.ts` — sin `AgentRole`.
  - `apps/server/src/engine/service.ts` — sin `seedAgents`/`listAgents`, `createTask` sin guardar `roleId`.
  - `apps/server/src/engine/routes.ts` — sin `/roles`.
  - `apps/server/src/engine/conversation.ts` — sin `finalPrompt` con rol.
  - `apps/server/src/engine/model.ts` — sin `rolePrompt`.
  - `scripts/provision-client.ts` — sin `provisionMemorias`/`provisionAgentes`/`provisionDocs`.
  - `clientes/_example/README.md` — sin seccion Provision/Estructura.
  - `clientes/_example/config.json` — con password en claro.

---

## 5. Alto valor de negocio (pendiente, sin bloque asignado)

- Auto-ingesta al terminar SOP con artefacto (`save_artifact` -> RAG).
- Auto-ingesta de documentos largos de Drive (`read_drive_file` > N caracteres).
- UI real de RAG: listar fuentes, contar chunks, borrar fuente, reingestar manual.
- Auto-linking de memorias y briefings a proyectos (por tag, clientId, nombre).
- UI memoria taxonomizada: filtros por categoria, tags, busqueda, CRUD manual.
- UI "mis tareas" con `assignedTo`.
- WhatsApp via Evolution API: webhook, tool `prepare_whatsapp`, SOP.
- Busqueda hibrida completa (RAG hoy solo coseno; pgvector lo lleva Cline).

### Admin y operacion

- Panel maestro de clientes.
- Cost tracking del LLM por cliente.
- Billing con Stripe.

### UI/UX

- Atajos de teclado (Cmd+K, Cmd+N) — CommandPalette ya esta en `main`.
- Notificaciones en vivo (badge en el header).
- Busqueda global (mensajes + tareas + memorias + archivos).
- Preview de adjuntos (imagenes inline, PDFs en modal).
- Botones de respuesta rapida (Responder / Resumir / Traducir).

### Escalado

- pgvector en vez de coseno en JS (Cline, `feat/pgvector`).
- Indices en `records` para consultas frecuentes.
- Deduplicacion temporal de `run-events` / `activity`.

---

## 6. Deuda tecnica (lo que sigue vivo)

- `store.list` sin ser envoltorio de `listPaged` (se usa `listPaged` donde aporta, pero la API
  compatible sigue duplicando el SQL). Fichero: `apps/server/src/db.ts`.
- `skill.entrypoint` decorativo: el bootstrap copia el directorio entero y no lo usa. Se
  mantiene en el schema porque forma parte del contrato de skills.
- Ficheros basura en la raiz (`$path`, `$t`, `if`, `pnpm`, `Select-String`, `tsc`, `Write-Host`).
  Borrar. **No verificado en el repodump v9.**
- BOM UTF-8: RESUELTO en `fix/cleanup-and-bugs` (verificado byte a byte).
- `@standard-schema/spec@1.1.0` se publica con `dist/index.js` de 0 bytes. Workaround: crear el
  fichero a mano. Reportar upstream o fijar la version con override de pnpm. Nota de entorno,
  no del repo.

---

## 7. Cerrado en `main` (referencia, no re-abrir)

- **B1-B4 del AUDIT**: admin bootstrap, seed sample post-login, boton conectar Google +
  `GET /api/google/status`, rate limit login por IP+email (`rate-limit.ts`).
- **D1-D11 del AUDIT**: cron `every:Nm` sin filtro de segundos, switch de SOPs con `default`
  que lanza 422, `BUSINESS_DATABASE_URL` separado para `query_business`, `finance.ts` ->
  `AppError`, `handleUnauthorized()` centralizado en `api/client.ts`, paginacion SQL en
  `/api/auth/users/:id/tasks`, `existing` real en `/api/main-thread`, dedupe `lib/format.ts` +
  `lib/taskColumns.ts`, ingesta RAG con concurrencia acotada, `RagService.search` por keyset,
  una sola identidad en `model.ts`.
- **P2 del AUDIT**: `/api/skills/:id/install` -> 501, `business-intel/SKILL.md` con
  `query_business` correcto, `facturacion/SKILL.md` corregido, `provision-client.ts` sin el log
  que miente, OpenBot anunciado como no disponible.
- **UI/UX y multi-thread**: `feat/ui-and-features` mergeado. Incluye ProjectsView,
  CommandPalette, Onboarding, TopBar, WorkspaceSwitcher, threads.
- **UI-REDESIGN**: los 10 pasos cerrados.

---

## 8. Como verificar el estado real

- Mirar el repo actualizado (fuente de verdad).
- `pnpm typecheck` y `pnpm --filter @openmuse/web typecheck`.
- Busquedas puntuales con `Get-ChildItem -Recurse | Select-String` para comprobar cosas
  concretas antes de escribir sobre ellas.
- `git status -sb` para saber en que rama estas y si hay merge en curso.

---

Fin del TODO.