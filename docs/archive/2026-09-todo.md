# OpenMuse — TODO

para cline: 

Prompt para Cline. Pégaselo tal cual en su ventana.

---

# PROMPT-CLINE-RESULTADO.md — Cierre de los 19 ítems de negocio

## Contexto

Esta ventana y el usuario acabamos de aplicar 19 bloques de negocio sobre `main` (post-merge `82a7d92` + los cambios de hoy). Los 19 ítems están escritos pero **no verificados por typecheck ni por tests**, porque en la otra ventana el protocolo era escribir sin ejecutar checks entre bloques.

**Tú cierras ahora.** Es una tarea de verificación y corrección, no de reescritura. Si un bloque tiene un fallo pequeño, lo corriges. Si tiene un fallo de diseño, lo reportas en `docs/PROMPT-CLINE-RESULTADO.md` y sigues con el siguiente.

## Reglas duras (no negociables)

1. **No reescribas lo que funciona.** Si un typecheck pasa, no toques el fichero.
2. **No inventes features nuevas.** El alcance es exactamente los 19 ítems + limpieza de basura + cerrar `docs/TODO.md`.
3. **No toques `docs/HANDOFF.md`** en este pase. Solo si te pido explícitamente algo ahí.
4. **Un commit por fichero o por grupo funcional.** Mensajes claros en español.
5. **Si un fichero de la lista no existe o no tiene el anchor esperado, no lo crees tú.** Anótalo en el reporte y sigue.
6. **Todo cambio se hace contra el repo real en disco**, no contra lo que crees que hay.
7. **UTF-8 sin BOM**. Detectar CRLF/LF y preservar.
8. **No borres ficheros de tests.** Si un test falla, arregla el código o el test según cuál esté mal.

## Tarea 1 — Typecheck y corrección

Ejecuta `pnpm typecheck` y `pnpm --filter @openmuse/web typecheck`. Corrige **solo** los errores que aparezcan en estos ficheros (los 19 bloques):

- `apps/server/src/engine/service.ts` (ítems 1, 10, 13)
- `apps/server/src/engine/sop-executor.ts` (ítem 1)
- `apps/server/src/workspace.ts` (ítem 2)
- `apps/server/src/app.ts` (ítems 2, 7c, 11)
- `apps/web/src/components/DocumentsView.tsx` (ítems 3, 14)
- `apps/web/src/components/MemoryView.tsx` (ítem 5)
- `apps/web/src/components/TasksView.tsx` + `apps/web/src/App.tsx` (ítems 6, 12, 16)
- `packages/integrations/src/whatsapp.ts` (ítem 7)
- `apps/server/src/config.ts` (ítems 7c, 11)
- `apps/server/src/engine/conversation.ts` (ítem 7b)
- `apps/server/src/engine/rag.ts` (ítems 8, 17)
- `apps/server/src/engine/routes.ts` (ítems 9, 10, 13)
- `apps/server/src/engine/model.ts` (ítem 10)
- `packages/integrations/src/stripe.ts` (ítem 11)
- `apps/web/src/hooks/useNotifications.ts` + `apps/web/src/components/Header.tsx` (ítem 12)
- `apps/web/src/api/search.ts` (ítem 13)
- `apps/web/src/components/AttachmentPreview.tsx` (ítem 14)
- `apps/web/src/components/MessageBubble.tsx` + `MessageList.tsx` + `ChatPanel.tsx` (ítem 15)
- `apps/server/src/db.ts` (ítems 17, 18)
- `apps/server/src/engine/worker.ts` (ítem 19)

**No corrijas errores preexistentes** fuera de esos ficheros. Si aparecen, anótalos en el reporte pero no los toques.

## Tarea 2 — Tests

Ejecuta `pnpm test` (con `ALLOW_NETWORK=0` si aplica). Los tests pueden fallar por:

- El test `tests/rag.test.ts` asume `Math.round(hits[0].score) === 1`. El ítem 8 mezcla coseno 0.7 + BM25 0.3, así que el score puede ser < 1. **Arregla el test, no el código**, ajustando el assert a `>= 0.7` o comprobando que el orden es correcto.
- El ítem 17 hace `CREATE EXTENSION vector` solo si hay `DATABASE_URL`. Los tests usan PGlite, así que no debería tocarlo. Si algún test falla por eso, reporta.
- El ítem 19 cambia `run-event` para deduplicar. Si algún test cuenta eventos exactos, ajusta el test.

Si un test falla por un motivo que no entiendas, **no lo toques**. Anótalo en el reporte.

## Tarea 3 — Limpieza de basura

Elimina, si existen, estos ficheros basura en la raíz del repo (los generamos en ventanas anteriores por accidente):

- `$path`, `$t`, `if`, `pnpm`, `Select-String`, `tsc`, `Write-Host`, `{`, `}`, y cualquier fichero sin extensión creado por error.

**Antes de borrar**: `git status -sb` para confirmar que están sin trackear (`??`). Si están trackeados, no los borres, muévelos a `.gitignore` o repórtalos.

## Tarea 4 — Cerrar `docs/TODO.md`

Actualiza `docs/TODO.md`:

1. Marca los 19 ítems de la sección 5 como **hechos** con fecha 28 sep 2026.
2. Marca la sección 3 (trabajo de Cline) como **cerrada** con tu nombre y fecha.
3. En la sección 2 (backend manual producto), ya están marcados hechos los 3 bloques. Añade debajo: "Cerrado y verificado por Cline el 28 sep 2026".
4. Actualiza la sección 6 (deuda técnica): quita `store.list sin envoltorio`, quita `skill.entrypoint`, quita `ficheros basura`. Deja solo la nota de `@standard-schema/spec`.
5. En la sección 7 (cerrado en main), añade un párrafo con los 19 ítems de negocio, con una línea cada uno.
6. **No borres las secciones 0, 1, 4, 8.** Solo actualiza las que digo.
7. Guarda como UTF-8 sin BOM.

## Tarea 5 — Reporte final

Crea `docs/PROMPT-CLINE-RESULTADO.md` con esta estructura:

```
# PROMPT-CLINE-RESULTADO

> Cierre de los 19 ítems de negocio. Fecha: 28 sep 2026.

## Typecheck

- `pnpm typecheck`: OK / fallo (con detalle)
- `pnpm --filter @openmuse/web typecheck`: OK / fallo (con detalle)

## Tests

- `pnpm test`: X pass / Y fail
- Tests tocados: <lista>

## Ficheros corregidos

- <fichero>: <qué se cambió y por qué>

## Fallos de diseño encontrados

- <ítem>: <descripción honesta>

## Pendientes que no he tocado

- <lista>

## Basura borrada

- <lista>
```

## Lo que NO tocas

- Motor durable (`worker.ts` ya está, no lo reescribas más allá del ítem 19 si hay que ajustar).
- `ActionService` (`actions.ts`).
- `packages/integrations/src/google.ts`, `pdf.ts`, `vault.ts`.
- `apps/worker/` y `apps/computer/`.
- Ramas remotas. Solo `main` local.

## Verificación final

Al cerrar, dime:

- `git status -sb` limpio
- `pnpm typecheck` OK
- `pnpm --filter @openmuse/web typecheck` OK
- `pnpm test` sin fallos nuevos
- Commit con mensaje: `chore: cierre 19 items negocio, typecheck, tests y TODO`

---

**Empieza por `git status -sb` y no escribas nada hasta haber leído los ficheros que vas a tocar.**

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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
------------------------------------------------------------------------------------------------------------------------
anexo de lo que hace falta mejorar: 
Anexo honesto de los 19. Sin adornos.

---

## 1. Auto-ingesta RAG al terminar SOP

**Fuerte:** el hook `ingestTaskArtifacts` se llama al final del SOP y falla en silencio (`.catch(() => {})`), así que no rompe una tarea que ya terminó bien.

**Flojo:**
- Ingesta solo `title + summary + JSON(data)`. Si `data` es enorme (un objeto con miles de filas), mete una sola string de hasta 200 KB. Eso rompe el chunking: el `chunkText` corta por párrafos, y un JSON compacto no tiene párrafos. Resultado: un chunk de 900 caracteres con JSON ilegible.
- El `sourceId` es `task:<taskId>:<artifactId>`, así que reejecutar el SOP crea un `taskId` nuevo y **duplica** el contenido en RAG. No es idempotente entre reejecuciones, solo dentro de la misma tarea.
- No hay forma de borrar la fuente desde la UI por `sourceId`; solo por `fileId`. Los artefactos de SOP quedan huérfanos en el índice.

**Solución:** (a) si `data` es un array, ingestar fila por fila con `sourceId = task:<id>:<artifactId>:<rowIndex>`; (b) `sourceId = artifact:<artifactId>` (estable entre reejecuciones, porque `artifact.id = hash(task.id:key)` y `task.id` sí cambia; usar `task.goalId ?? task.id` como base o `artifact.id` derivado del contenido); (c) endpoint `DELETE /api/rag/source/:id` ya existe, exponerlo también para artefactos.

## 2. Auto-ingesta de documentos largos de Drive

**Fuerte:** se dispara en el momento correcto (después de `readDriveFile`) y no bloquea la respuesta.

**Flojo:**
- **Ciego a errores:** `.catch(() => {})` y ni un `ctx.event`. Si Drive devuelve texto pero el RAG falla, nadie se entera.
- **Umbral arbitrario:** `> 20000` caracteres. Un PDF exportado de Google Docs puede tener 500 páginas y ser `readable`; un CSV de 3 columnas x 200 filas puede tener 8 KB y ser más útil que un doc largo. No hay criterio de "utilidad".
- **`sourceId = drive:<fileId>`** — bien, es estable. Pero si el archivo cambia en Drive, la ingesta sobrescribe sin comparar. No hay `updatedAt` en Drive comparado con el del chunk. Reingesta siempre.

**Solución:** (a) loguear el fallo con `backgroundFailure`; (b) umbral configurable y por tipo: `text/*` de 4 KB, `application/vnd.google-apps.document` siempre, `pdf` si tiene capa de texto; (c) guardar `driveModifiedTime` junto al chunk y no reingestar si no cambió.

## 3. UI real de RAG

**Fuerte:** cubre lo mínimo útil: buscar, reingestar, borrar fuente, ver estado.

**Flojo:**
- **Lista de fuentes no existe.** Solo se ven fuentes a través de un hit de búsqueda. Si el índice tiene 40 fuentes y ninguna matchea con la query, no puedes verlas ni borrarlas. `/api/rag/status` devuelve `sources: number`, no la lista.
- **"Reingestar" descarga el archivo por su URL firmada** desde el navegador y lo envía de vuelta. En archivos de 8 MB eso es un ida y vuelta inútil: el servidor ya tiene el archivo, el endpoint debería hacerlo internamente.
- **El reingestar solo funciona con archivos con `url`.** Los artefactos de SOP y los chunks de Drive no se pueden reingestar desde la UI.
- **No hay botón de "borrar todo el índice".** Para un cliente que cambia de negocio, es útil.

**Solución:** (a) `GET /api/rag/sources` que devuelva la lista (ya hay `stats`, ampliar); (b) endpoint `POST /api/rag/reingest/:sourceId` que haga el fetch en el servidor; (c) mostrar también sources de tipo `drive:` y `task:`; (d) botón "borrar índice" con confirmación de doble paso.

## 4. Auto-linking memorias↔proyectos

**Fuerte:** bidireccional, idempotente por `compareAndSwap`.

**Flojo:**
- **Solo `name`.** No usa `clientId`, `tags` del proyecto, ni tags de la memoria. El TODO decía "por tag, clientId, nombre". Falta el 66%.
- **Match por substring.** Si un proyecto se llama "Acme" y una memoria dice "Acme es cliente desde 2020", funciona. Pero si el proyecto se llama "Acme" y la memoria dice "el cliente Acme S.L." — no matchea porque `"acme s.l."` no contiene `"acme"` como substring (sí lo contiene, pero `toLowerCase()` con caracteres raros y acentos falla).
- **Sin normalización.** `"Acme"` y `"acme"` y `"ACME"` funcionan porque `toLowerCase()`, pero `"Ácme"` no.
- **Solo 2 modos:** al crear memoria, al crear proyecto. Si el proyecto cambia de nombre, no se re-vinculan memorias existentes. Si la memoria se edita, no se re-vinculan.

**Solución:** (a) matchear también por `clientId` y `tags` (intersección no vacía); (b) normalizar con `normalize("NFD").replace(/\p{Diacritic}/gu, "")` antes de comparar; (c) trigger en `PATCH /api/projects/:id` y `POST /api/agent/memories/:id` (ya existe) que re-evalúe.

## 5. UI memoria taxonomizada

**Fuerte:** filtros por categoría, búsqueda, editar, olvidar.

**Flojo:**
- **El backend no acepta `category` ni `tags` en el POST de update.** La UI los muestra editables pero el `saveEdit` los hace `void`. El usuario edita la categoría, guarda, recarga, y sigue igual. **Esto es un bug de UX grave.**
- Sin paginación: si hay 500 memorias, todas se pintan de golpe.
- Sin agrupación visual por categoría: el filtro funciona pero la lista plana no ayuda a ver el panorama.
- Falta CRUD completo: no se puede **crear** una memoria desde la UI, solo editar/borrar. `POST /api/agent/memories` existe.

**Solución:** (a) ampliar `memorySchema` del route para aceptar `category` y `tags` y pasarlos al `compareAndSwap`; (b) paginar con `listPaged`; (c) agrupar por categoría con headers colapsables; (d) botón "nueva memoria" con el mismo modal.

## 6. UI "mis tareas" con assignedTo

**Fuerte:** filtros correctos, usa `state.escalatedTo` que es el campo que escribimos hoy.

**Flojo:**
- **"Mías" es ambiguo.** `assignedTo` hoy solo lo pone `escalateTask`. Por defecto `assignedTo` es el `owner` (el `createTask` del front no lo envía), así que casi todas las tareas son "mías" y el filtro no filtra nada útil.
- **`state.escalatedTo` no se limpia** cuando el usuario responde y la tarea vuelve a `queued`. La tarea sigue apareciendo en "Escaladas" aunque ya está resuelta.
- **No hay forma de reasignar desde la UI.** Solo el backend tiene `escalateTask`.

**Solución:** (a) o `createTask` graba `assignedTo: owner` explícito, o el filtro "Mías" mira `assignedTo === userId || !assignedTo`; (b) limpiar `escalatedTo` cuando la tarea sale de `waiting_input`; (c) botón "Reasignar" en `TaskDetailModal` que llama a `/api/agent/tasks/:id/escalate`.

## 7. WhatsApp vía Evolution API

**Fuerte:** cliente real, con `configured`, `sendText`, validación de número y longitud. Webhook autenticado por token.

**Flojo:**
- **`prepare_whatsapp` no envía nada.** Guarda un "draft" en `whatsapp-drafts` pero no hay endpoint de aprobar ni de enviar. Queda como acción pendiente huérfana.
- **El webhook no está cableado a ningún SOP.** Guarda en `records` y nadie lo lee. El SOP `responder-whatsapp` está en el seed pero no tiene trigger `webhook`.
- **No hay verificación de firma** más allá del token estático. Evolution soporta HMAC; no lo usamos.
- **No hay reintentos ni manejo de errores de red** en `sendText`. Un 502 de Evolution es un `AppError` plano y el caller no tiene instrucciones.
- **No hay rate limit.** Si alguien spamea el webhook con el token correcto, el `records` se llena.

**Solución:** (a) endpoint `POST /api/whatsapp/:draftId/send` que aprueba y envía; (b) trigger de SOP tipo `webhook:whatsapp` que lea `whatsapp-incoming` y cree tareas; (c) HMAC con `WHATSAPP_WEBHOOK_SECRET`; (d) `outcome_unknown` como `ActionService`; (e) rate limit por `from` y por token.

## 8. Búsqueda híbrida (coseno 0.7 + BM25 0.3)

**Fuerte:** mezcla las dos señales, mantiene el keyset pagination, no explota memoria.

**Flojo:**
- **El `maxBm25` se calcula mientras se recorren las páginas, no antes.** El primer candidato de la primera página se normaliza contra un `maxBm25` que puede ser 10x menor que el real. Los scores quedan distorsionados según el orden de iteración.
- **BM25 sin IDF.** Sin el peso inverso a la frecuencia en el corpus, "de" y "la" pesan igual que "acme". No es BM25 de verdad, es un TF normalizado.
- **`avgLen = 200` hardcodeado.** Si tus documentos son de 50 o 2000 palabras, la normalización por longitud está mal calibrada.
- **El score final puede ser > 1** si `bm25` es muy alto. La UI lo pinta como `(score * 100).toFixed(0)%` y puede salir "180%".

**Solución:** (a) hacer una primera pasada para calcular `maxBm25` sobre una muestra o guardarlo en `stats`; (b) usar un IDF calculado del total de chunks, o migrar a `tsvector` de Postgres (que ya tiene BM25 nativo con `ts_rank_cd`); (c) `avgLen` derivado del corpus; (d) clamp `Math.min(1, score)` antes de pintar.

## 9. Panel maestro de clientes

**Fuerte:** lee el repo real, no inventa.

**Flojo:**
- **No comprueba rol admin.** Cualquier usuario autenticado ve todos los clientes configurados. Un `user` ve la lista de todos los tenants potenciales.
- **Lee directorios con `readdir`** en cada request. Si tienes 200 clientes, cada visita escanea 200 carpetas. Sin caché.
- **No distingue "provisionado" de "no provisionado".** Un cliente con `config.json` pero sin ejecutar `pnpm provision-client` se ve igual que uno cargado en la DB.
- **Solo lee.** No hay botón "provisionar ahora" (llamada al script desde la API).

**Solución:** (a) `if (user.role !== "admin") throw new AppError("Solo admin", 403)` usando `UserService`; (b) caché de 60 s o leer solo `config.json` en vez de todos los ficheros; (c) comparar con `sops`/`memorias`/`agentes` ya en la DB del owner; (d) `POST /api/agent/admin/provision` con `child_process.spawn` del script.

## 10. Cost tracking LLM

**Fuerte:** cero dependencias, fórmula explicable.

**Flojo:**
- **No son tokens, son caracteres / 4.** Puede estar off 20-30% según idioma y densidad. Vale como orden de magnitud, no para facturar.
- **`LLM_COST_EUR_PER_1K_TOKENS` es una sola tarifa.** No distingue input de output (que suelen costar distinto), ni modelo, ni proveedor.
- **Solo se llama desde `model.ts` (tasks).** El chat (`conversation.ts`) no está cableado. El 80% del uso real es chat. El número que verás será 5-10% de la realidad.
- **No hay tope ni alerta.** Un bucle infinito de tareas se registra en silencio hasta llenar `records`.
- **No hay agregación por día/semana**, solo ventana fija de 30 días.

**Solución:** (a) capturar tokens reales del runtime (`BuiltInAgent` puede exponer usage si se le pasa `onUsage` o similar; investigar); (b) dos tarifas: input y output; (c) cablear chat; (d) límite duro por owner/día con notificación; (e) serie temporal agrupada.

## 11. Stripe

**Fuerte:** cliente real, endpoints separados por responsabilidad.

**Flojo:**
- **No hay webhooks.** Sin webhook, no sabes cuándo Stripe cobra, falla un pago o cancela una suscripción. El estado real vive en Stripe, no en tu DB.
- **No hay persistencia de customer.** Cada vez que llamas a `createCustomer`, crea uno nuevo si el email ya existe. Se te llena Stripe de duplicados.
- **No hay idempotencia.** Si el request se pierde y el usuario reintenta, se crea otro payment link o customer.
- **`amountCents` sin validación de mínimo por moneda.** Stripe rechaza por debajo de ciertos mínimos y devuelve un error crudo.
- **No hay link a la facturación interna.** `StripeInvoice` no se vincula a `records/invoices`.

**Solución:** (a) endpoint `POST /api/billing/webhook` con verificación `Stripe-Signature` y `express.raw` (o equivalente en Hono); (b) buscar customer por email antes de crear; (c) `Idempotency-Key` en cada `POST` a Stripe; (d) validar mínimos por moneda; (e) vincular `customerId` a `settings/billing` del owner.

## 12. Notificaciones en vivo

**Fuerte:** hook limpio, poll de 8 s, badge con cap a 99+.

**Flojo:**
- **Poll, no push.** 8 s de latencia y N requests por usuario. Un SSE o WebSocket sería lo correcto, pero el patrón actual es poll (lo acepto por consistencia con el resto).
- **Marcar como leída es optimista.** Si falla el POST, el badge se corrige en el siguiente refresh, pero el usuario ve "0 notificaciones" durante 8 s.
- **El click en la campana** hace `markAllRead` y salta a "tasks". No abre un dropdown con las notificaciones. Es una acción agresiva: si tienes 10 notificaciones, no las puedes leer.
- **Sin filtro por tipo.** Todas las notificaciones (`task-done`, `review`, `input`, `escalate`, `watch-error`) van al mismo saco.

**Solución:** (a) dropdown en el header con la lista; (b) botón "marcar todas" explícito; (c) iconos por tipo; (d) SSE cuando sea viable.

## 13. Búsqueda global

**Fuerte:** backend paralelo, ordenación por score y fecha.

**Flojo:**
- **La UI no existe.** El bloque 13 dejó solo el endpoint. El bloque 13b (UI en `CommandPalette`) está pendiente. **No hay forma de usar la búsqueda global desde la app.**
- **Score ingenuo.** Cuenta coincidencias de palabra / total palabras. No tiene en cuenta posición, ni campos (título vs body), ni idioma. "Acme" en el título debería pesar más que en el body.
- **Sin fuzzy matching.** "acne" no encuentra "acme".
- **Sin paginación.** El `limit` es 30 y no hay "ver más".
- **Carga todo en memoria.** `db.list` sobre 5 kinds. Con miles de tareas, es lento.

**Solución:** (a) UI 13b ya; (b) pesos por campo (título x2, body x1); (c) `pg_trgm` de Postgres para fuzzy; (d) cursor keyset; (e) `LIMIT` en SQL por kind, no listar todo.

## 14. Preview de adjuntos

**Fuerte:** `<embed>` para PDF y `<img>` para imágenes, sin librerías.

**Flojo:**
- **Solo desde `DocumentsView` por doble clic.** No hay botón visible; el usuario no sabe que puede. **El descubrimiento es nulo.**
- **No desde `MessageBubble`.** Un adjunto en el chat no tiene preview. Es el caso más frecuente.
- **PDFs con tamaño > N MB** hacen llorar al navegador con `<embed>`. Sin fallback a "descargar".
- **Sin zoom ni scroll horizontal** en el preview de imagen.
- **No cierra con Esc.** Hay que hacer clic fuera.

**Solución:** (a) botón "Ver" explícito junto al nombre; (b) cablear `MessageBubble` con el mismo modal (bloque 14c); (c) si `file.size > 5MB`, mostrar "descargar" en vez de `<embed>`; (d) `useEffect` con listener de `Escape`.

## 15. Botones de respuesta rápida

**Fuerte:** los tres botones caben, no rompen el layout.

**Flojo:**
- **"Responder" no hace nada.** Solo está para pintarlo. `if (kind === "responder") return;` es literal. **Botón muerto.**
- **"Resumir" y "Traducir" envían un prompt prefijado al chat**, lo cual cambia el hilo entero. Es raro: el usuario ve "Resume lo siguiente" en su propio input, no en un modal aparte.
- **Sin contexto:** no se le pasa al modelo el mensaje anterior como referencia explícita, va concatenado al texto. Puede confundir al modelo.
- **Sin feedback visual** de "enviado".

**Solución:** (a) "Responder" rellena el composer con `>` + texto del mensaje, y un `onSeed` en `ChatPanel` (bloque 15c); (b) resumir/traducir como llamada aparte a `/api/agent/tasks` o como tool del chat, no como prefijo al composer; (c) feedback.

## 16. Atajos de teclado

**Fuerte:** Cmd+K, Cmd+N, Cmd+B, Cmd+J. Bien.

**Flojo:**
- **Cmd+N** re-registra el listener cada vez que `threads.createNew` cambia de identidad. Como `createNew` es `useCallback` sin deps, es estable y no pasa. Pero es frágil: cualquier día alguien le añade una dep y el atajo empieza a reengancharse silenciosamente.
- **Sin `Cmd+Shift+F`** para búsqueda global (pendiente 13b).
- **Sin documentación visible.** El usuario no sabe que existen.

**Solución:** (a) test que asegure que el listener solo se registra una vez; (b) Cmd+Shift+F cuando llegue 13b; (c) tooltips en los botones del header que muestren el atajo.

## 17. pgvector pro con fallback

**Fuerte:** no rompe local, no añade dependencias, funciona en producción.

**Flojo:**
- **No hay migración real.** `ALTER TABLE records ADD COLUMN IF NOT EXISTS embedding vector(768)` se ejecuta en cada arranque. Es idempotente pero feo. Sin tabla de migraciones no hay control de versiones.
- **El `UPDATE records SET embedding`** corre **después** del `put`, no en la misma transacción. Si el proceso muere entre los dos, hay chunk en `data` sin embedding nativo. Los huérfanos nunca se recuperan.
- **`embedding IS NOT NULL`** en la query vectorial filtra los chunks sin embedding nativo. Si tienes 80% sin embedding (recién migrado), la búsqueda vectorial devuelve 20% de resultados y **no cae al fallback** porque no falla, simplemente da menos resultados.
- **Dimensión 768 hardcodeada.** Si Gemini cambia de modelo, hay que tocarlo.
- **`rawQuery` devuelve `row.data`** si existe; en este caso la query no selecciona `data`, así que devuelve la fila entera. Funciona de chiripa.
- **`CREATE EXTENSION vector`** requiere superuser en Postgres. Si el rol no lo tiene, falla y cae a coseno. **Nunca sabrás si pgvector está activo** salvo por logs que no existen.

**Solución:** (a) tabla `schema_migrations` y aplicar `ALTER` una vez; (b) transacción `put + UPDATE embedding`; (c) rellenar embeddings huérfanos en `maintain()`; (d) leer `VECTOR_DIM` de config; (e) `SELECT` explícito con alias; (f) log claro al arrancar: `pgvector: activo` / `pgvector: fallback a coseno en JS`.

## 18. Índices en `records`

**Fuerte:** tres índices correctos, idempotentes.

**Flojo:**
- **`CREATE INDEX` sin `CONCURRENTLY`.** En una tabla con millones de filas, bloquea escrituras al arrancar. Para producción real hay que usar `CONCURRENTLY` (fuera de transacción).
- **El índice de `(data->>'status')`** no lo usa `scanByStatus` si el planificador decide que escanear la tabla es más rápido con pocos registros. No hay `ANALYZE`.
- **No hay índice para `purgeOlderThan`** por `updated_at` solo (el de `(kind, updated_at)` ayuda, pero no para purgas cross-kind).
- **Sin `ANALYZE`** tras crear el índice, el planificador puede no usarlos hasta el primer vacuum.

**Solución:** (a) `CONCURRENTLY` en un bloque separado que se ejecute en background; (b) `ANALYZE records` tras crear; (c) índice `(updated_at)` solo.

## 19. Dedupe de `run-events`

**Fuerte:** evita ruido en reintentos.

**Flojo:**
- **El `Map` vive dentro de una sola ejecución del task.** Si el task se reintenta (crash, timeout), el `Map` se pierde. Los duplicados vuelven.
- **Dedupe por `kind:title`, no por contenido.** Dos "steps" con el mismo título pero detalle distinto se fusionan. El detalle del segundo se pierde (solo se ve "2 ocurrencias").
- **`compareAndSwap` con `{ id: previous.id }`** reescribe `detail` cada vez. Si el segundo evento tenía info útil, se sobreescribe con `"2 ocurrencias"`.
- **No hay límite de tamaño** del `Map`. Si una task emite 10.000 títulos distintos, el Map crece sin control. Práctica: en una tarea normal hay 5-20 títulos, pero un loop de reintentos malo podría inflarlo.
- **Solo para `run-events`.** `activity` sigue sin dedupe.

**Solución:** (a) persistir el Map en `task.state.recentEvents` o en un `records/dedupe-state`; (b) dedupe por hash de `kind+title+detail`, no solo `kind+title`; (c) acumular detalles largos como array, no sobrescribir; (d) LRU de tamaño fijo (64 entradas); (e) mismo patrón para `activity`.

---

## Resumen ejecutivo

**Bien hecho y aguanta:** 4 (doble dirección), 16 (atajos), 19 (dedupe básico), 17 (fallback honesto).

**Bien pero le falta músculo:** 1, 2, 7, 8, 10, 11, 12, 13, 14, 18.

**Flojo/flojo, hay que arreglar antes de vender:** 3 (lista de fuentes + reingestar server-side), 5 (category/tags no persisten), 6 (assignedTo ambiguo), 9 (sin check admin), 15 ("Responder" es un botón muerto).

**Solo scaffolding/declarado:** 13 (sin UI), 3 (sin CRUD de fuentes), 10 (chat sin cablear), 11 (sin webhooks), 7 (draft sin enviar, webhook sin SOP).

Si tuviera que arreglar 5 antes del primer cliente real: **3, 5, 6, 9, 15**.
Fin del TODO.