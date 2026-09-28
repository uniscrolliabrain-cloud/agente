# OpenMuse - Auditoria del repo

> Fecha: 28 sep 2026. Commit auditado: 3eedd27 (rama fix/cleanup-and-bugs).
> Metodo: git worktree aislado en %TEMP%\om-audit-wt para no tocar el arbol de
> trabajo compartido (ocupado por feat/ui-and-features). Lectura del codigo mas
> typecheck / test / lint / build ejecutados en ese worktree.
> Verdad: este fichero + TODO.md + HANDOFF.md.

## 0. Verificacion ejecutada (datos duros)

| Comprobacion | Resultado |
| --- | --- |
| pnpm typecheck (raiz: apps/server + packages + tests, y worker) | OK (exit 0). Los "9 errores de projects-routes.ts" del TODO ya NO existen |
| pnpm --prefix apps/web run typecheck | OK (exit 0) |
| pnpm test | 138 tests, 137 pass, 1 skipped, 0 fail (165.8 s) |
| pnpm --prefix apps/web run build (vite 5.4.21) | OK (dist/index.html, 215.44 kB js, 36.00 kB css) |
| pnpm lint (biome 2) | FALLA: 258 errores, 48 warnings, 6 infos |
| CI (.github/workflows/ci.yml) | typecheck + test (ALLOW_NETWORK=0) + worker typecheck. NO ejecuta lint |

Reparto del lint: a11y/useButtonType 45, a11y/noLabelWithoutControl 14,
a11y/useKeyWithClickEvents 11, a11y/noStaticElementInteractions 10,
a11y/noAutofocus 1 (81 fallos de accesibilidad), assist/source/organizeImports 31,
formato (tsconfig.json sale entero como -/+ con el mismo texto: solo finales de
linea; no hay .gitattributes y el checkout Windows es CRLF mientras biome espera
LF), noExplicitAny 23 warnings, correctness/noUnreachable 1,
suspicious/useDefaultSwitchClauseLast 1 y complexity/noUselessSwitchCase 1 (los
tres apuntan al switch de SOPs, ver D2).

## 1. BLOQUEANTES (P0): el producto no funciona en un deploy nuevo

### B1. No se puede entrar en una instalacion nueva (huevo y gallina del admin)

El login de la UI es email + contrasena contra /api/auth/login
(Login.tsx, api/auth.ts:20-39). Los usuarios viven en system/users y solo un
admin puede crearlos (auth-routes.ts:158-174 y 199-205). El primer admin solo se
crea si ADMIN_EMAIL + ADMIN_PASSWORD estan en el entorno (app.ts:395-404), y
esas variables NO estan en .env.example ni en el README (README.md:44-50 solo
dice cp .env.example .env && pnpm dev). Resultado real: login siempre 401. La
propia UsersView.tsx:127-133 dice "Crea el primero con el boton de arriba", que
es imposible sin ser admin. Sigue igual en feat/ui-and-features (esa rama anadio
BACKUP_* pero tampoco ADMIN_*).

Arreglo: documentar ADMIN_EMAIL/ADMIN_PASSWORD/ADMIN_NAME en .env.example y
README, y/o un script pnpm admin:create que cree el primer admin por consola.

### B2. El modo sample (el modo por defecto) sale VACIO en la UI

El sembrado de datos de ejemplo esta solo en POST /api/session y con owner
hardcodeado "local-user" (app.ts:135-137). Esa ruta no la llama nadie del front:
api/session.ts:8 login(accessKey) no tiene llamadores (solo se usa
currentSession). La UI entra por /api/auth/login, donde el owner es user.id, y
workspace.snapshot() no siembra de forma perezosa (workspace.ts:261-281), asi
que el usuario logueado ve mail/eventos/acciones vacios. Los scripts
beta-smoke.ts y beta-vertical.ts si usan /api/session, por eso funcionan.

Extra: useAuth.ts:59 fuerza mode "live" al hacer login con email, asi que el
badge del header miente en sample.

Arreglo: sembrar el owner autenticado (ensureSample + agent.ensure +
refreshIdeas en sample) tras el login, y dejar de usar "local-user" fuera de
/api/session.

### B3. Google no se puede conectar desde la app

Existen POST /api/google/connect y /api/google/disconnect, pero el front no
llama a ninguna ruta de Google (barrido de "/api/..." en apps/web/src). En modo
live todo el valor (leer Gmail/Calendar y aprobar acciones, que exige conexion
en ActionService) depende de esa conexion y no hay boton ni ajuste en la UI.

### B4. /api/auth/login sin rate limit

El unico contador (30/min) esta en el handler de /api/session y es global por
proceso, no por IP (app.ts:124-132). Las contrasenas usan scrypt +
timingSafeEqual (users.ts:40-61), pero /api/auth/login (auth-routes.ts:46-70) no
limita intentos: fuerza bruta ilimitada.
## 2. BUGS E INCONSISTENCIAS (P1)

### D1. every:Nm (cron de SOPs) puede no dispararse nunca

sop-triggers.ts:27 exige minutos % n === 0 && segundos < 30, pero el
mantenimiento corre cada 60 s (service.ts:80-82). Si la fase del interval cae en
>= 30 s, la comprobacion se evalua siempre en el mismo offset y nunca pasa el
filtro: el SOP programado queda mudo en silencio. La deduplicacion ya la da la
idempotencyKey sop-cron:<id>:<bucket> (sop-triggers.ts:95), asi que ese guard
sobra y estorba.

### D2. Switch de SOPs: throw inalcanzable y fallback silencioso a LLM

sop-executor.ts:414-421 tiene default: case "llm_generate" con un
throw new AppError("Unsupported SOP tool") imposible de alcanzar. Cualquier tool
del enum sin case propio se convierte en una llamada LLM silenciosa en lugar de
fallar. Hoy el enum cubre las 14 tools (packages/domain/src/sop.ts:6), asi que
es una bomba de relojeria. Biome ya lo detecta (noUnreachable,
useDefaultSwitchClauseLast, noUselessSwitchCase).

### D3. SQL interpolado del SOP contra la propia base de datos de la app

engine/business.ts:150-163: con DATABASE_URL, queryPostgres ejecuta la query ya
interpolada (viene del SOP / del modelo), sin filtro por owner ni RLS, con un
pg.Pool nuevo por consulta. Un SELECT * FROM records expone datos de todos los
owners. El codigo lo admite ("the role used must have GRANT SELECT only"), pero
el requisito no esta documentado en .env.example / README ni se comprueba.

### D4. analyzeSpending lanza Error plano en vez de AppError

engine/finance.ts:5,16,27,30,32,36,45 devuelve 500 en lugar de 422 con mensaje
util, rompiendo el contrato {error, fields} que el front ya maneja
(api/client.ts:67-80).

### D5. Un 401 en chat/subida no cierra la sesion

api/chat.ts:46-48 y api/files.ts:22 lanzan "Sesion expirada" pero no limpian el
token (solo lo hace apiFetch, client.ts:59-65), asi que la app cree seguir
autenticada con un token muerto hasta recargar.

### D6. GET /api/auth/users/:id/tasks pagina en JS

auth-routes.ts:214-219 carga todas las tareas del usuario y ordena/pagina en
memoria, aunque Store.list ya ordena por updated_at DESC y existe listPaged.
Contradice el TODO de "paginacion por cursor en un unico sitio".

### D7. GET /api/main-thread devuelve existing: true hardcodeado

app.ts:244-249: el campo no refleja el insertIfAbsent real, que graba
existing: false.

### D8. Duplicacion y placeholders de UI

KanbanPanel.tsx (163 lineas) y TasksView.tsx (57) reimplementan las mismas
columnas, filtros y helpers (formatBytes, relativeTime, Column).
ConversationsPanel.tsx:15 pinta una conversacion fake "Conversacion principal"
como si fuera una lista real. En fix/cleanup-and-bugs no existe
apps/web/src/api/threads.ts (en feat/ui-and-features ya hay multi-thread real).
## 3. "MUSCULO FALSO": declarado y no cableado (P2)

1. Cuatro conectores que siempre fallan con 503 y que NO se importan en ningun
   sitio (imports comprobados en todo el repo: 0 resultados, ni runtime ni tests
   ni scripts): packages/integrations/src/stripe.ts, whatsapp.ts, gmb.ts,
   social.ts. Son honestos en el mensaje, pero son superficie muerta.
2. POST /api/skills/:id/install no hace nada y devuelve
   {ok:true, mode:"runtime-bootstrap", message:"..."} (skills/routes.ts:47-51):
   exito falso.
3. skill.entrypoint es decorativo: nada lo lee. El ejecutor copia ficheros a
   /workspace/skills/<id> (sop-executor.ts:425-520) y la ejecucion real va por un
   computer_command con ruta explicita (beta-vertical.ts:14). Skills sin main.py
   (business-intel/kpis.py, facturacion/pipeline.py) rompen cualquier SOP que
   asuma el default main.py.
4. apps/computer/wheels/ solo tiene .gitkeep + README: el mecanismo documentado
   de dependencias offline (wheels/README.md, sop-executor.ts:479-519) no puede
   instalar nada hoy. Ademas alta-cliente/requirements.txt declara pydantic pero
   alta-cliente/main.py solo usa json/sys/re.
5. business-intel/SKILL.md dice "Usa query_business_data", tool que no existe
   (el enum tiene query_business).
6. packages/backends/src/openbot.ts (344 lineas) no se importa en ningun sitio;
   workspace.ts:316-327 devuelve status "unconfigured" y openbotConfigured false
   fijos, y types/api.ts:127-131 expone esos campos como si hubiera runtime.
7. Affordances de UI que parecen funcionar y no hacen nada: "Nuevo chat"
   (App.tsx:94 -> () => {}), boton "+" de conversaciones
   (ConversationsPanel.tsx:55), "Buscar" y "Configuracion" deshabilitados
   (lineas 31 y 88), nav "Agentes" deshabilitado (linea 45). El backend de
   threads, projects, SOPs, skills, monitores, browser y computer existe y no
   tiene UI: solo hay 5 vistas reales (chat, tasks, documents, memory, users).
8. clientes/_example/config.json lleva una contrasena de ejemplo en claro, y
   scripts/provision-client.ts:55-59 imprime "Creando admin nuevo con X..." para
   acto seguido lanzar error.

## 4. Lo que esta solido (no tocar)

- Motor durable real: leases + CAS + heartbeat + recuperacion (engine/worker.ts)
  y claim con expiracion y taskId (db.ts:163-175).
- Aislamiento Docker muy bueno: --read-only, --cap-drop ALL,
  no-new-privileges, --network none, --ipc private, 512m, --pids-limit 128,
  tmpfs nosuid,nodev,noexec, user 1000:1000 y verificacion fail-closed del
  contenedor antes de adjuntar (computer.ts:256-296). El host solo lanza docker
  con shell:false (argv).
- Browser worker: token >= 32 chars con timingSafeEqual, egress proxy con DNS
  pinning (proxy.ts), allowlist de IPs publicas (network.ts) y descargas solo PDF
  con limites y journal recuperable (downloads.ts).
- Google: OAuth con state/PKCE, tokens cifrados AES-256-GCM versionado
  (vault.ts), refresh single-flight y revocacion al desconectar; tests/google.test.ts
  (761 lineas) cubre inyeccion de headers, versiones de evento y outcome_unknown.
- Aprobaciones: hash de propuesta, expiracion 30 min, claim CAS, outcome_unknown
  ante red/5xx y chequeo de scopes (gmail.send / drive / calendar.events) antes
  de ejecutar (workspace.ts:455-464).

## 5. Limitaciones de esta auditoria

- No se audito feat/ui-and-features (multi-thread UI, ProjectsView, backup
  scheduler, Dockerfile raiz, index.html e index.css modificados): no estan en
  fix/cleanup-and-bugs.
- No se ejecutaron los tests que necesitan Docker o red real
  (apps/worker/tests/docker.test.ts, pnpm beta:vertical, test:computer) ni se
  levanto el server contra Google real.
- pnpm lint en Windows mezcla fallos de formato por finales de linea (CRLF sin
  .gitattributes) con hallazgos reales; en CI no se ejecuta.

## 6. Plan de arreglo propuesto (en fix/cleanup-and-bugs)

- Fase 1 (P0, desbloquea vender): ADMIN_* en .env.example y README + script
  admin:create; sembrado de sample para el owner autenticado; rate limit por
  IP + email en /api/auth/login; boton "Conectar Google" (o documentar el flujo
  por API); limpiar o deshabilitar los botones muertos.
- Fase 2 (P1): cron every:Nm; finance.ts -> AppError; 401 -> clearSession en
  chat/files; list como envoltorio de listPaged y users/:id/tasks con listPaged;
  main-thread.existing real; switch de SOPs que falle en vez de generar.
- Fase 3 (P2): decidir los stubs (moverlos a integrations/src/stubs/ con README
  o borrarlos); /api/skills/:id/install -> 501 o eliminarlo; entrypoint real o
  fuera del schema; SKILL.md de business-intel; documentar GRANT SELECT / DSN
  separado para query_business; deduplicar KanbanPanel y TasksView.

---------------------------------------------------

vale te valido casi todo y lo puedes atacar en el orden que quieras solo ten en cuenta este feedback: Validado. Es un audit honesto y exacto contra el repodump. Los 4 bloqueantes y los 8 bugs P1 son reales. Los "músculo falso" también. No he encontrado ninguna afirmación falsa.

## Lo que acierta sin matices

- **B1 admin huevo/gallina**: `app.ts` solo crea admin si `ADMIN_EMAIL` + `ADMIN_PASSWORD`. `.env.example` no los tiene. README no los menciona. Login siempre 401 en deploy nuevo. Correcto.
- **B2 sample vacío**: `/api/session` siembra `local-user`, pero la UI entra por `/api/auth/login` con `user.id`. `useAuth.ts` fuerza `mode: "live"` al login. Correcto.
- **B3 Google sin UI**: ningún componente llama `/api/google/connect`. Correcto.
- **B4 login sin rate limit**: el contador está en `/api/session`, no en `/api/auth/login`. Correcto.
- **D1 cron every:Nm**: el filtro `seconds < 30` con maintain cada 60s puede caer fuera de fase para siempre. Correcto.
- **D2 switch SOPs**: `default: case "llm_generate"` + throw después. Throw inalcanzable. Correcto.
- **D3 SQL interpolado**: `queryPostgres` con `DATABASE_URL` corre la query interpolada sin RLS ni filtro owner. Correcto.
- **D4 `analyzeSpending`**: `throw new Error` plano → cae al 502 del `onError`. Correcto.
- **D5 401 en chat/files**: no llaman `clearSession`. Correcto.
- **D6 `/users/:id/tasks`**: pagina en JS con `all.sort().slice()`. Correcto.
- **D7 `existing: true` hardcoded**: correcto.
- **D8 duplicación KanbanPanel/TasksView + "Conversación principal" fake**: correcto.
- **Sección 3 (músculo falso)**: los 4 stubs sin importar, `/api/skills/:id/install` con éxito falso, `skill.entrypoint` decorativo, `wheels/` vacío, `SKILL.md` con `query_business_data` inexistente, `openbot.ts` sin importar, botones muertos. Todo correcto.

## Lo que omite (menor, pero lo añadiría al audit)

1. **Ingesta RAG serial en `files.ts`.** Un `.txt` de 500 KB = ~600 chunks × `embed()` en serie bloquea la subida minutos. El `TODO.md` original lo tenía como bug. El audit no lo menciona en D.
2. **`RagService.search` full scan.** `db.list("rag-chunks")` + coseno en JS. Aceptable hasta ~10k chunks, después se cae. El audit no lo lista.
3. **Doble identidad en `model.ts`.** El prompt mezcla `"OpenMuse Enterprise enterprise operator"` y `"personal agent"`. Incoherencia de tono, no bug funcional, pero resta calidad.

Estas tres no cambian el veredicto, solo completan la foto.

## Lo que no le veo fallo

- Sección 0: los números de lint (258 errores, reparto por regla) son plausibles contra el repodump.
- Sección 4 ("lo sólido"): coincide con lo que vi en el repodump. Motor durable, Docker isolation, browser worker, Google OAuth, aprobaciones. Correcto.
- Sección 5: dice "no se auditó feat/ui-and-features". Correcto, ese audit es sobre `fix/cleanup-and-bugs`.

## Conclusión

Puedes confiar en el audit. Si Cline va a atacar los P0 y P1, va por buen camino. Las tres omisiones son menores y ya están en `TODO.md` o en el plan de Wave F.

Ledger:
```
No toco ningún fichero.
Dependencia: audit ya escrito en AUDIT.md (según lo que me pasas).
Verificación: contraste punto por punto contra repodump.

Bloques aplicados hasta ahora:
  Wave A + B + E + Dockerfile + HANDOFF: commiteados (e20779b).
  Wave C pasos 1+2+3: aplicados.
  Wave C paso 4.1: se quedó pillado.
  Siguiente: retomar Wave C 4.1 con diagnóstico de App.tsx real.
```