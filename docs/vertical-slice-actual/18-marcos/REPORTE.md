# 18 · Delegación tipada y cualificación de Marcos — REPORTE

**Estado:** completa con fixtures; smoke real pendiente de staging · **Entrada:** `4d34906` (campaña 17).

## Qué se ha implementado

### 18.P1 · Contrato: trabajo `investigar-leads`

- `clientes/agntia/sops.ts` declara el SOP `investigar-leads` (versión **1**, `trigger: api`, `assignedTo: "marcos"`) con el contrato del trabajo. `service.execute` lo enruta por id al ejecutor tipado: los pasos del catálogo describen el contrato, no son un camino alternativo.
- `apps/server/src/engine/worker.ts` exporta la entrada tipada `leadInvestigationInputSchema` (`leadRefs` del pipeline y `criteria` de empresa: sector, ciudad, palabras clave, rating y reseñas mínimos), la salida `leadInvestigationOutputSchema` (`LEAD_FICHA_V1`) y la versión del contrato.
- `POST` de tarea y `delegate_task` validan la entrada **antes de encolar**: un criterio fuera de rango devuelve 422 y no queda fila. La tarea guarda `state.work = { id, version }` y `state.workInput` normalizado.
- `capabilities/bootstrap.ts` registra `investigar-leads` como capability compuesta (`Transform`/`DATA`, sin efectos externos ni aprobación).

### 18.P2 · Conexión: normalizar, puntuar y acreditar

- El ejecutor lee las **fichas aceptadas de la empresa** desde el pipeline de la 17 (`LeadsService.list`, sin consultar Places) y filtra por `leadRefs` cuando se indican.
- Encaje determinista 0–100 con los criterios de la empresa: rating (25), reseñas (20), web (15), teléfono (15) y coincidencia de sector/ciudad/palabras clave en la ficha (25). `fit` = alto ≥ 70, medio ≥ 40, bajo por debajo.
- **Verificación por campo**: cada campo viaja como `{ value, verified, source }`. Lo que viene de Places va verificado con `source: "google_places"`; el dominio derivado de la web se marca `"derived"`; lo que no existe queda `{ value: null, verified: false, source: null }`. La fuente del negocio (proveedor, consulta y fecha) se copia de la ficha aceptada.
- El resultado se persiste como artefacto (`report`, clave `lead-ficha`, id derivado de `task:<id>`) y la tarea guarda `state.workOutput` y `state.workArtifactId`; la evidencia enlaza la web y el origen acreditado.

### 18.P3 · Bordes: agente, solicitante y contacto ausente

- **Agente autorizado:** `createTask` resuelve `roleId ?? assignedTo ?? "marcos"` y exige el rol de la empresa: inexistente → 422 «no está autorizado»; deshabilitado → 409 «está deshabilitado»; activo sin el SOP → 422 «no tiene autorizado el trabajo». Un rol apagado no encola ni una tarea.
- **Solicitante y agente:** la tarea guarda `assignedBy` (quien delega) y `assignedTo` (el agente autorizado); el resultado repite ambos como `requestedBy` y `agent`, y el artefacto los conserva. No se deducen del owner ni se pierden en el worker.
- **Contacto ausente:** Places no devuelve persona ni correo, así que `contactName` y `contactEmail` se declaran `null`/no verificados, `missing` incluye `contacto`, `missingContact` lista las referencias afectadas y `nextStep` pide el contacto antes de escribir. El trabajo nunca fabrica un contacto.
- **Sin fichas:** si no hay fichas aceptadas (o las referencias no existen en esa empresa) la tarea pasa a `waiting_input` con la petición de aceptar una ficha; no crea artefacto ni ficha vacía.
- **Empresa obligatoria:** sin tenant resuelto el ejecutor falla en claro; no hay caída a `default` (lo cazó el audit y se corrigió).

**Cableado:** Laia/Comercial → `createTask` (entrada y agente validados) → worker (`investigar-leads`) → ficha revisable por campo → artefacto y `waiting_input`/`succeeded` para revisión.

## Cambios registrados

- `apps/server/src/engine/worker.ts`: contrato de entrada/salida, puntuación de encaje, verificación por campo, ejecutor `executeLeadInvestigation` e `isLeadInvestigation`.
- `apps/server/src/engine/service.ts`: validación y autorización en `createTask`, `assignedBy` en la tarea, `state.work`/`workInput` y despacho tipado en `execute`.
- `apps/server/src/engine/conversation.ts`: `delegate_task` anuncia el trabajo tipado y valida la entrada antes de delegar.
- `apps/server/src/engine/capabilities/bootstrap.ts`: capability `investigar-leads`.
- `clientes/agntia/sops.ts`: SOP versionado `investigar-leads`.
- `tests/vertical-slice-marcos.test.ts`: nueva (4 casos).

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` | 0 errores |
| Gate 18: `vertical-slice-marcos` + `laia-hierarchy` + `r02-a03-worker-identity` | **6/6 pass, 0 fail** |
| Regresión: `vertical-slice-leads` + `agency-bootstrap` + `vertical-slice-personas` | **17/17 pass, 0 fail** |
| Audits `idempotency`, `anchors`, `tenant-default`, `layers`, `bridges`, `no-console` | 0 |
| `git diff --check` | limpio |

Casos de `tests/vertical-slice-marcos.test.ts`:

1. Rol deshabilitado (409), rol activo sin el SOP y agente inexistente (422): ninguna tarea queda encolada.
2. Entrada inválida (`minRating: 9`): 422 antes de encolar.
3. Ficha aceptada: la tarea conserva `assignedBy`/`assignedTo`, el worker cualifica, el encaje es alto, cada campo lleva su fuente, el contacto se declara ausente y el artefacto correlaciona con la tarea.
4. Sin fichas aceptadas: `waiting_input`, sin `workOutput` ni artefacto.

## Pendiente declarado

- **Autorización de personas:** el gate lee `agent-roles` de la empresa (la misma fuente que `pickRoleForTask`). Las personas instaladas de la 09 viven en `system/persona-instances` y su `canStartWork` sigue resolviendo en la registry para UI/chat; cablear esa registry en `AgentService` exigía tocar `app.ts`, fuera de superficie. Una persona sin rol equivalente en `agent-roles` queda rechazada para este trabajo: hay que sembrar el rol al instalar la empresa.
- **Smoke real:** sin modelo ni `GOOGLE_MAPS_API_KEY` de staging no hay ejecución real de LLM/Places; el trabajo es determinista y las fichas de prueba se siembran como las deja la 17.
- **Docker** sigue sin `docker.sock`; sin cuentas de staging para el recorrido A/B.
- **`audit:contracts`** continúa en rojo heredado (79 huérfanos) y `coherence` 6/7 solo por eso.

## Rollback

Revertir el commit devuelve `investigar-leads` al executor genérico de SOPs (o lo deja desconocido si no se revierte el SOP) y elimina validación, autorización y ejecutor tipado. Las tareas con `state.work`/`workOutput` y los artefactos `lead-ficha` quedan inertes y legibles; no hay migración de datos que deshacer. `assignedBy` en tareas nuevas es dato añadido: las filas antiguas sin él siguen funcionando.

## SHA por patchset

- **18.P1 + 18.P2 + 18.P3:** pendiente de commit (producto y pruebas en un único commit sobre `4d34906`).
- **Punto de rollback:** `4d34906`.
