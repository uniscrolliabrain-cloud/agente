# 10 agentes · 10 rondas · sprints de 30 minutos

> v1 · 2026-11-07 · Estado: propuesta operativa
> Base: `main` en el SHA que se fije al abrir la ronda. Cada agente cita el SHA que leyó; una copia vieja del documento no es el estado vigente.

## 0. Qué resuelve y qué no

Resuelve el cuello de botella real: hoy el trabajo va de uno en uno, y cada entrega espera a que la anterior cierre. Este plan pone **10 agentes en paralelo durante 30 minutos**, cada uno con **una unidad cerrada** y una rama propia, para que Alfonso revise con Codex y haga push sin convertirse en el integrador a mano.

No resuelve, y conviene decirlo antes de empezar:

- **No permite 10 agentes tocando el mismo fichero.** El paralelismo sale de repartir superficies, no de repartir el mismo archivo.
- **No sustituye el criterio de aceptación.** Un sprint verde es una unidad cerrada, no una fase terminada.
- **No convierte en verde lo que ya estaba rojo.** El número de tests y los marcadores de comentarios no son evidencia de producto.

## 1. Reglas de oro

1. **1 sprint = 1 unidad cerrada.** Cerrada o no cerrada; no existe "casi".
2. **1 rama = 1 tarea.** `sprint/rNN-aNN-slug`, desde el SHA base de su ronda. Sin reutilizar ramas integradas.
3. **1 fichero = 1 escritor por ronda.** Leer es libre; escribir exige que esté en tu superficie declarada.
4. **Ningún sprint toca `package.json`, `pnpm-lock.yaml`, `tsconfig*.json`, `app.ts`, `db.ts`, `db-tenant.ts`, CI ni `fly*.toml`** salvo el carril que la tabla marque como portero esa ronda.
5. **Ningún feature sin test que falle antes y pase después.** Ningún fix sin esa misma prueba.
6. **Prohibido fabricar verde**: no se borran aserciones, no se sube el timeout, no se pone `continue-on-error`, no se añade `skip` para cerrar.
7. **Ningún secreto en el diff, en el log ni en el informe.** Solo nombres de variable y referencias.
8. **30 minutos es un reloj de arena.** Si no cierra, se commitea como `wip:` en su rama y se reporta como abierta o bloqueada. Un `wip:` no se mergea nunca.
9. **El rojo ajeno no se arregla de paso.** Si un test de base falla, se compara con el SHA base y se clasifica; no se silencia.
10. **El informe manda.** Sin informe de sprint (plantilla en §9) la tarea no existe, aunque el código esté.

## 2. Topología: carriles, ramas y worktrees

Diez carriles fijos. Un carril es una superficie de escritura, no una persona: puede cambiar de agente entre rondas, pero dos agentes de la misma ronda nunca comparten carril.

| Carril | Superficie | Dueño natural |
|---|---|---|
| C1 Contratos | `packages/domain/src/**` | contratos |
| C2 Runtime y contexto | `apps/server/src/engine/context/**`, `conversation.ts` | runtime |
| C3 Tenancy y worker | `engine/worker.ts`, `engine/service.ts`, `db-tenant.ts`, `tenant-scope.ts` | runtime |
| C4 Canales | `whatsapp-routes.ts`, `engine/whatsapp-*.ts`, `packages/integrations/**` | canales |
| C5 Google | `google-auth.ts`, `auth-routes.ts`, correo y calendario | integraciones |
| C6 Producto | `leads-routes.ts`, `voice-routes.ts`, `engine/business/**`, `sop-executor.ts` | producto |
| C7 UI | `apps/web/src/**` | panel |
| C8 Calidad | `tests/**`, `scripts/audits/**`, `scripts/gate-report.ts`, `.github/**` | calidad |
| C9 Documentación | `docs/**` (solo documentos de campaña, no de código) | docs |
| C10 Verificación | `docs/verification/**`, artefactos de evidencia | verificación |

**Portero de la ronda.** El carril que figura como portero es el único que puede tocar los ficheros calientes esa ronda. Las peticiones de otro carril se anotan en el informe y se resuelven en la ronda siguiente, no se cuelan.

**Comandos de arranque de un sprint** (idénticos para los 10 agentes):

```bash
BASE=$(git rev-parse origin/main)
git worktree add "../wt-r03-a05" -b "sprint/r03-a05-context-entity" "$BASE"
cd "../wt-r03-a05" && pnpm install --frozen-lockfile
git log -1 --format='base %h %s'
```

**Convención de commit**: `sprint(r03-a05): fix(context): pasa entityId al ensamblador`.
**Convención de PR**: título `[r03-a05] <resultado en una línea>`; cuerpo con la plantilla de §9.

## 3. El sprint de 30 minutos

| Min | Qué pasa | Salida |
|---|---|---|
| 0–3 | Leer el SHA base, la tarea, su superficie y el gate. Nada más. | Confirmación del alcance |
| 3–6 | Escribir el test que falla (o el criterio que se va a medir) y comprobarlo. | Test rojo o criterio medido |
| 6–22 | Implementar solo dentro de la superficie. Un commit por intención. | Código + test verde local |
| 22–26 | Verificación del sprint (§4). | Logs de typecheck y test dirigido |
| 26–30 | Informe de sprint, PR abierta, estados. | Informe + PR |

Si a los 15 minutos el test rojo no se ha escrito, el alcance estaba mal dimensionado: se reduce la tarea, no se alarga el sprint.

## 4. Definition of Done y gate por sprint

Un sprint solo se declara cerrado con **todo** esto:

| Comprobación | Comando | Criterio |
|---|---|---|
| Tipado | `pnpm typecheck` | exit 0 (incluye `apps/worker`) |
| Test del cambio | `npx tsx --import ./tests/setup.ts --test <fichero>` | 0 fail; el test fallaba en `BASE` |
| Auditoría del área | `pnpm audit:<área>` si el carril la afecta | sin empeorar el número de `BASE` |
| Diff acotado | `git diff --name-only "$BASE"...HEAD` | subconjunto de la superficie declarada |
| Sin secretos | `pnpm secrets:check` | exit 0 |
| Higiene | `git diff --check` | sin whitespace roto |

El **gate de ronda** es distinto y se ejecuta una sola vez, en `main` después de integrar las 10 tareas:

```bash
pnpm gate   # typecheck + tests + 7 audits; escribe artifacts/gate/
```

Repetir `pnpm gate` en cada rama multiplica 10 veces 20 minutos de suite y no aporta señal. Se corre por ronda, y su resultado es lo que se compara con la ronda anterior.

## 5. Revisión con Codex y push a `main`

Circuito por tarea, en este orden:

1. El agente abre PR con informe y SHA.
2. Antes de mergear, la rama se **rebasea sobre `origin/main` actual** (no merge de `main` dentro de la rama).
3. Codex revisa con la checklist de §9.3 y solo mira el `git diff "$BASE"...HEAD`.
4. Si Codex corrige, corrige **en la misma rama** y vuelve a medir el test afectado, no la suite entera.
5. Merge con `git merge --no-ff` para conservar el commit de la tarea. Sin squash: el histórico es la evidencia.
6. Tras integrar: `git log -1 origin/main`, comprobar el SHA y registrar el cierre en el informe de ronda.

**Conflictos.** Un conflicto en un fichero caliente lo resuelve el portero de la ronda. Un conflicto en superficie ajena significa que dos carriles se pisaron: se para el segundo merge, se anota como fallo de planificación y se reasigna la tarea a la ronda siguiente.

**Orden de merge dentro de la ronda**: contratos y calidad primero (C1, C8), luego runtime y tenancy (C2, C3), después canales e integraciones (C4, C5), después producto (C6), y por último UI y documentación (C7, C9, C10). Así lo que consume contratos se mergea después de que los contratos existan.

## 6. Las 10 rondas

Cada ronda avanza sobre la anterior porque arregla primero lo que bloquea a las demás, y solo después añade producto. La columna "avance" es la métrica que Codex comprueba al cerrar.

| Ronda | Tema | Avance medible al cerrar |
|---|---|---|
| R1 | Base honesta | `pnpm gate` corre completo y sus números son reales: 0 tests ocultos por el glob, 0 `continue-on-error` |
| R2 | Contexto y tenancy | Un usuario en dos empresas: 0 fugas, 0 caída a `default`, contexto conservado tras reiniciar el worker |
| R3 | Laia con evidencia | Las 5 preguntas de validación del vertical se responden con referencia, o se declaran ausentes explícitamente |
| R4 | Tarjetas de comunicación | 8 tarjetas aprobadas; una afirmación sin fuente es imposible por contrato |
| R5 | WhatsApp saliente aprobado | 50 intentos concurrentes de doble aprobación → 1 envío; estados desconocidos reconciliados |
| R6 | Correo y agenda | Borrador real sin envío; 0 citas duplicadas; revocación de token con estado accionable |
| R7 | Captación con procedencia | 100 % de fichas con fuente y fecha por dato; 0 envíos sin revisión humana |
| R8 | Panel operable | 6 vistas contra endpoints existentes; 0 botones sin backend |
| R9 | Voz y economía | Llamada controlada sin duplicar cita; coste y latencia p50/p95 medidos por tenant |
| R10 | Release acreditado | Tag + smoke en `www.agntiapro.com` + SHA de imagen registrado + rollback probado |

## 7. Detalle de las rondas

Cada fila es un sprint de 30 minutos. "Cierra con" es el gate exacto de esa tarea, no del área.

### R1 · Base honesta — portero C8

| # | Tarea | Superficie | Cierra con |
|---|---|---|---|
| A01 | Medir la base: `pnpm gate`, guardar `artifacts/gate/` y números por check | `docs/verification/**` | informe con exit codes reales |
| A02 | Arreglar el descubrimiento de tests (subdirectorios `campaign-2/3`, `roadmap`, `gate`) | `package.json` (portero) | recuento antes/después, 0 ficheros ocultos |
| A03 | Hacer los tests independientes del `.env` de quien ejecuta | `tests/setup.ts`, `tests/helpers/config.ts` | subset en verde con `env -i` |
| A04 | CI bloqueante: quitar `continue-on-error` del job worker y cachear pnpm | `.github/workflows/ci.yml` (portero) | YAML válido + job que falla cuando debe |
| A05 | Typecheck del worker dentro del gate, sin `tsc no encontrado` | `scripts/gate-report.ts` (portero) | gate lo reporta como check propio |
| A06 | `audit:contracts` mide uso real, allowlist con motivo y fecha | `scripts/audits/contracts.ts`, allowlist | número honesto + 0 huérfanos sin justificar |
| A07 | `audit:idempotency` con índice de marcas y control negativo | `scripts/audits/idempotency.ts` | 0 huérfanas sin revisar |
| A08 | Una sola fuente de verdad de despliegue | `docs/04-operaciones/**`, `docs/archive/**` | 0 enlaces rotos, `DEPLOY.md` único vigente |
| A09 | `secrets:check` cubre las variables nuevas (`.com`, Google, Places, Vapi) | `scripts/secrets-check.ts` | exit 0 y lista sin duplicados |
| A10 | Clasificador de rojos: cada test fallido se repite 3× y se etiqueta | `scripts/**`, `docs/verification/**` | tabla flaky/preexistente/nuevo |

### R2 · Contexto y tenancy — portero C3

| # | Tarea | Superficie | Cierra con |
|---|---|---|---|
| A01 | Pasar `entityId` acreditado desde `conversation.ts` al ensamblador | C2 | test: el prompt incluye la entidad y solo la suya |
| A02 | Filtrar eventos del ensamblador por entidad, no solo por owner y cantidad | C2 | test con dos entidades del mismo owner |
| A03 | Persistir y restaurar `tenantId`/`actorId` al reclamar y reanudar tareas | C3 (portero de `worker.ts`) | test de reinicio entre recepción y ejecución |
| A04 | Prefijo físico por tenant: dos tenants sin lectura cruzada | C3 | test de dos empresas sobre el mismo Store |
| A05 | Campos aditivos de actor y contexto en `AgentTask`, compatibles | C1 | registro antiguo sigue leyéndose |
| A06 | Store único por tenant en `app.ts` | `app.ts` (portero) | diff acotado + suite de rutas verde |
| A07 | Endurecer `tests/tenant-worker-claim.test.ts` con concurrencia | C8 (tests) | 0 reclamaciones dobles en 50 intentos |
| A08 | Credencial de canal resuelta desde la conexión del tenant, no de config global | C4 | test: cuenta desconocida se rechaza |
| A09 | Test que falla si un token aparece en eventos, logs o prompt | C8 | 0 coincidencias en el contexto ensamblado |
| A10 | Contrato escrito de qué entra al prompt y en qué orden | C9 | documento enlazado desde el índice |

### R3 · Laia con evidencia — portero C2

| # | Tarea | Superficie | Cierra con |
|---|---|---|---|
| A01 | Persona Laia provisionada por tenant en el bootstrap | `clientes/agntia/**`, `scripts/lib/agency-bootstrap.ts` | bootstrap idempotente, 2 ejecuciones = mismo estado |
| A02 | Ruta «hablar con Laia» desde una automatización concreta | C2 + `apps/server/src/**routes.ts` | 401 sin sesión, 403 en automatización ajena |
| A03 | Resolución de entidad por enlace directo y aclaración si hay ambigüedad | C2 | dos campañas con el mismo nombre → pregunta, no adivina |
| A04 | Hechos operativos agregados por tenant y rango, fuera del LLM | C3 | cifras con periodo, zona y denominador |
| A05 | Validación de `evidenceRefs` contra el conjunto entregado | C2 | referencia inventada se rechaza |
| A06 | Respuesta explícita de ausencia de dato | C2 | «no puedo verificar» sin cifras |
| A07 | Aislamiento en la traza: usuario de A pregunta por B | C8 | acceso denegado + traza sin contenido de B |
| A08 | Panel: causa, siguiente paso y responsable | C7 | vista contra el endpoint real |
| A09 | Las 5 preguntas del documento del vertical como tests | C8 | 5/5 verdes o 5 declaradas ausentes |
| A10 | Informe: qué se puede afirmar hoy sobre Laia | C9 | respuestas con enlace a evidencia |

### R4 · Tarjetas de comunicación — portero C1

| # | Tarea | Superficie | Cierra con |
|---|---|---|---|
| A01 | `communicationCardSchema` con `strict()` | C1 | test de campos extra rechazados |
| A02 | `PublishedCard` con aprobador, fecha y `contentHash` | C1 + store scoped | hash cambia si cambia el contenido |
| A03 | `selectCard` con prioridad y empate | C1 | empate en publicación falla |
| A04 | Renderer `fixed` con slots escapados y límites por canal | C2 | inyección en slot no ejecuta nada |
| A05 | Modo `guided`: estructura y hechos, validación de la salida | C2 | salida inválida no dispara efectos |
| A06 | Semilla de las 8 tarjetas de Agntia | `clientes/agntia/communication-cards.json` | 8/8 válidas contra el esquema |
| A07 | Publicación desde el panel con revisión inmutable | C7 | una tarjeta aprobada no se edita, se versiona |
| A08 | Test de escalada de privilegios por intención o canal | C8 | actor no gana permisos cambiando la petición |
| A09 | Traza con IDs, versiones, intención y validación | C3 | reconstruible desde el panel |
| A10 | Ciclo de vida `draft/approved/retired` documentado | C9 | quién aprueba y cómo se retira |

### R5 · WhatsApp saliente aprobado — portero C4

| # | Tarea | Superficie | Cierra con |
|---|---|---|---|
| A01 | Aprobación ligada a tenant, canal, destinatario, hash y expiración | C4 | cambiar el cuerpo invalida la aprobación |
| A02 | Exclusión de envío: doble clic y concurrencia → un solo envío | C4 | 50 intentos → 1 efecto |
| A03 | Estados `prepared/approved/sending/accepted/delivered/unknown` | C4 | `unknown` no se pinta como enviado |
| A04 | Adaptador real del proveedor elegido, o 503 honesto | C4 | sin key: 503 explícito, no éxito falso |
| A05 | SOP entrante → borrador → aprobación | C6 | una ejecución, un borrador, una aprobación |
| A06 | `inboxId` ligado en servidor, no enviado por el cliente | C4 | id de otra bandeja se rechaza |
| A07 | Panel con estados reales y errores accionables | C7 | sin botón que finja enviado |
| A08 | Reintentos con backoff idempotentes, sin reenvío ciego | C4 | timeout → reconciliación, no segundo mensaje |
| A09 | Reentrega del proveedor + reinicio del worker | C8 | 0 duplicados tras reinicio |
| A10 | Contrato de aprobación y límites (sin prometer exactly-once externo) | C9 | documento con la política |

### R6 · Correo y agenda — portero C5

| # | Tarea | Superficie | Cierra con |
|---|---|---|---|
| A01 | Aislar la causa del fallo de correo conversacional (2 resultados esperados, 0) | C8 | diagnóstico con comparación contra `BASE` |
| A02 | Lectura del buzón propio por conexión de tenant | C5 | dos tenants, lecturas aisladas |
| A03 | Borrador revisable sin envío | C5 | ningún envío sin aprobación explícita |
| A04 | Calendar con zona horaria explícita y sin duplicar citas | C5 | dos intentos → una cita |
| A05 | Reconciliación por `operationId` de resultado ambiguo | C3 | cita duplicada imposible por reintento |
| A06 | `state` OAuth de un uso ligado a sesión, tenant y actor | C5 | state reutilizado se rechaza |
| A07 | Consentimiento vencido y token revocado → estado accionable | C5 + C7 | mensaje con acción, sin caída a credencial global |
| A08 | Test de revocación y de acceso cruzado | C8 | 401/403 correctos |
| A09 | Métricas de correo: enviado, entregado, rebotado | C3 | contadores por tenant y rango |
| A10 | Matriz de scopes mínimos por función | C9 | una fila por scope con motivo |

### R7 · Captación con procedencia — portero C6

| # | Tarea | Superficie | Cierra con |
|---|---|---|---|
| A01 | Places: deduplicación por `placeId` y fuente fechada | C6 | mismo negocio no entra dos veces |
| A02 | Ficha de evidencia con confianza por campo | C1 | campo sin fuente no se muestra como verificado |
| A03 | ICP explicable con criterios y pesos versionados | C6 | puntuación reproducible y auditable |
| A04 | Contacto verificable antes de primer contacto | C6 | sin contacto fiable → queda en investigación |
| A05 | Exclusión de CRM y lista de no contactar | C6 | el lead excluido no entra en la cola |
| A06 | Cohortes de reactivación y corte inmediato por respuesta o baja | C6 | respuesta detiene la cadencia |
| A07 | Cola de revisión humana antes de cualquier envío | C7 | 0 envíos sin aprobación |
| A08 | Fuentes discrepantes: se conservan ambas evidencias | C1 | ficha con dos fuentes y preferencia explicada |
| A09 | Vista de ficha y motivo de encaje | C7 | contra endpoint existente |
| A10 | Candidato vs lead cualificado, definido y medido | C9 | definición con criterios y fuente |

### R8 · Panel operable — portero C7

| # | Tarea | Superficie | Cierra con |
|---|---|---|---|
| A01 | Seis vistas contra endpoints que existen | C7 | test estático: 0 rutas inventadas |
| A02 | Componente único de estados honestos | C7 | los seis estados, sin sinónimos |
| A03 | Error visible con acción: reintentar, reconciliar, escalar | C7 | 0 errores silenciosos |
| A04 | Selector de empresa sin fugas de estado entre tenants | C7 | cambio de empresa limpia caché y vistas |
| A05 | Bandeja única de inbox y aprobaciones | C7 | una aprobación, un destinatario, un estado |
| A06 | Métricas con definiciones estables (propuestas, confirmadas, celebradas) | C7 | denominador y periodo visibles |
| A07 | Exportación y retención mínima | C7 + C3 | exportación sin secretos ni datos de otros |
| A08 | Textos es-ES y accesibilidad de lo nuevo | C7 | sin literales sueltos en inglés |
| A09 | Test de contrato vista ↔ endpoint | C8 | falla si una vista llama a algo inexistente |
| A10 | Guía del cliente final actualizada | C9 | pasos verificados en la app |

### R9 · Voz y economía — portero C6

| # | Tarea | Superficie | Cierra con |
|---|---|---|---|
| A01 | Idempotencia concurrente en llamadas salientes | C6 | dos disparos → una llamada |
| A02 | Transferencia humana con contexto y medición efectiva | C6 | traspaso abandonado no cuenta como completado |
| A03 | Disposición tipada post-llamada | C1 | intención, fecha y motivo tipados |
| A04 | Cita por voz sin duplicar (reusa R6) | C6 | solo el ID de reserva acredita éxito |
| A05 | Coste por tenant: proveedor, tokens, tiempo humano | C3 | coste por ejecución y por resultado |
| A06 | Límites de gasto y pausa automática | C3 | superar el límite detiene, no avisa tarde |
| A07 | Latencia p50/p95 por canal | C3 | medida real, no estimada |
| A08 | Caída de proveedor → estado desconocido, nunca éxito | C6 | test de proveedor caído |
| A09 | Interruptor de desactivación por tenant | C7 | apagar no pierde datos ni estados |
| A10 | Benchmark con datos propios, sin promesas | C9 | tabla con medición y fecha |

### R10 · Release acreditado — portero C8

| # | Tarea | Superficie | Cierra con |
|---|---|---|---|
| A01 | Tag `v*` y `smoke:deploy` contra `www.agntiapro.com` | `.github/**` (portero) | smoke verde sobre el dominio real |
| A02 | Registrar SHA de imagen Fly por proceso | `docs/verification/**` | API y worker con SHA acreditado |
| A03 | Rollback probado al release anterior | C9 + C10 | volver y verificar en menos de lo pactado |
| A04 | Backup y restore de un tenant | C3 | datos íntegros y aislamiento conservado |
| A05 | `pnpm gate` completo, publicado como artefacto | C8 | 7 audits + tests con números |
| A06 | Correlación por `operationId` y alertas de cola atascada | C3 | una traza de punta a punta |
| A07 | Onboarding reproducible de un segundo tenant | C9 | guía ejecutada por alguien ajeno al cambio |
| A08 | Barrido de secretos en repo e historial reciente | C8 | 0 hallazgos o rotación documentada |
| A09 | Un solo `DEPLOY.md`, un índice, histórico archivado | C9 | 0 enlaces rotos |
| A10 | Acta de release: qué se vende como operativo y qué no | C9 | lista explícita de límites |

## 8. Riesgos y cómo se detectan a tiempo

| Riesgo | Señal temprana | Respuesta |
|---|---|---|
| Dos carriles se pisan | conflicto en merge de superficie ajena | parar el segundo merge, reasignar a la ronda siguiente |
| Verde fabricado | test que cambia de aserción en el diff | el revisor lo rechaza sin discusión |
| Sprint que no cierra | a los 15 min sin test rojo | reducir alcance, no alargar |
| Gate eterno | `pnpm gate` tarda más que la ronda | se corre solo por ronda y en `main`, nunca por rama |
| Dependencia oculta | tarea que necesita la de otro carril | se declara bloqueada, no se simula |
| Fuga entre tenants | cualquier test nuevo con dos tenants en rojo | bloquea el merge de esa entrega, sin excepciones |
| Documentación que miente | documento afirmando algo no verificado | se marca histórico o se corrige con fecha |

## 9. Plantillas

### 9.1 Arranque de agente (copiar y pegar)

```
Eres el agente del sprint <rNN-aNN>. Trabaja en tu worktree, no en el checkout del escritorio.

Lee primero: docs/operacion/SPRINTS-10-AGENTES-10-RONDAS.md (§3, §4 y tu fila),
y este documento si tu tarea lo toca. Cita el SHA que has leído.

Superficie de escritura permitida: <paths exactos>. Cualquier fichero fuera de esa
lista detiene la entrega; anótalo como petición al portero.

Entregable: <una frase>. Cierra con: <gate exacto>.

Prohibido: tocar assertions ajenas, subir timeouts, añadir skip, poner
continue-on-error, introducir secretos, refactorizar fuera del alcance.

Al terminar, entrega el informe de sprint (9.2) y abre PR con el título
[rNN-aNN] <resultado>. Si no cierra en 30 minutos, commit `wip:` en tu rama y
reporta abierta o bloqueada. No mergees tú.
```

### 9.2 Informe de sprint

```
Sprint: rNN-aNN · Rama: sprint/rNN-aNN-slug · Base: <SHA>
Estado: cerrada | abierta | bloqueada
Qué cambia (una frase):
Superficie tocada: <git diff --name-only BASE...HEAD>
Test que fallaba en BASE y pasa ahora: <fichero::test>
Comandos y resultado: typecheck <exit>, test dirigido <pass/fail>, audit <número antes/después>
Riesgo o límite que queda:
Petición al portero (si hay):
```

### 9.3 Checklist de Codex

1. ¿El diff está dentro de la superficie declarada? ¿Hay ficheros calientes sin ser portero?
2. ¿El test nuevo falla en `BASE`? Si no se puede demostrar, no cuenta.
3. ¿Se ha tocado alguna aserción existente, timeout o `skip`? Rechazo directo.
4. ¿Hay secretos, tokens, emails reales o datos de clientes en el diff o en los logs?
5. ¿El cambio cruza tenants, duplica un envío o pierde un mensaje? Bloquea.
6. ¿Los estados nuevos distinguen preparado, pendiente, confirmado, fallido y desconocido?
7. ¿La documentación dice solo lo verificado, con fecha y SHA?
8. ¿El commit cierra una unidad? Si hay tres intenciones, se parte.

## 10. Cómo se mide que cada ronda avanza más

Tres números por ronda, siempre los mismos, siempre comparados con la ronda anterior:

1. **Cobertura del gate**: `pnpm gate` con 0 checks omitidos y el recuento real de tests (antes/después).
2. **Superficie cerrada**: tareas cerradas / 10, con `wip:` contados como abiertas.
3. **Riesgo retirado**: cuántos invariantes de §0 del documento del vertical pasan de "declarado" a "probado" (aislamiento, idempotencia, aprobación ligada al efecto, resultado desconocido reconciliado).

Una ronda que sube (1) pero baja (3) es una ronda que se está mintiendo a sí misma. Es el único criterio que no se negocia.
