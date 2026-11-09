# 13 · Automatización, vínculo de hilo y hechos de ejecución — REPORTE

**Estado:** completa a nivel de producto y pruebas · **Entrada:** `e9f8654` (campaña 12).

## Qué se ha implementado

### 13.P1 · Contrato: proceso instalado, habilitación y ejecución son cosas distintas

El lanzamiento de una automatización devolvía el `threadId` que le pasaban sin guardar nada: no había forma de saber qué proceso, qué persona y qué ejecución estaban detrás de un hilo, ni de volver a él. Ahora `apps/server/src/engine/automation-thread.ts` mantiene el vínculo en la colección `automation-threads`:

```
{ id: <threadId>, tenantId, actorId, personaId, automationId,
  executionId?, entityId?, createdAt, updatedAt }
```

`POST /api/agent-personas/laia/automations/:automationId/chat` abre o reanuda ese vínculo y responde `{ automationId, threadId, personaId, executionId, entityId, references }`. `references` trae **solo** la ejecución vinculada (id, entidad, proceso, estado, título) y el **siguiente responsable**: el humano asignado si la ejecución espera respuesta (`waiting_input`/`waiting_approval`), la persona si no.

Además, `GET /api/threads/:id` publica `automation` y `DELETE /api/threads/:id` retira el vínculo, de modo que un hilo borrado no se puede reanudar. `useChat` expone `automation` para que el panel enlace la evidencia sin adivinar.

### 13.P2 · Conexión: hilo acreditado y verificado al iniciar stream

- Clave `tenantId:actorId`: un vínculo de otra empresa no es visible bajo la clave del actor, así que no se puede reanudar ni citar.
- Reanudar exige el mismo tenant, el mismo actor y la misma automatización y persona; en otro caso `403 Thread belongs to another session` o `409 Thread is bound to another automation`.
- La ejecución se valida contra el store del actor: si no existe `404`, si es de otra empresa `403 Execution belongs to another company`, y si es de otro proceso de la misma empresa `409 Execution belongs to another automation`. El vínculo no se escribe cuando la ejecución se rechaza.
- `conversation.ts` lee el vínculo al arrancar el stream (fallo no fatal: sin vínculo el chat funciona como antes) y pasa `entityId` y `executionId` al ensamblado de contexto.

### 13.P3 · Bordes: ContextEngine y hechos de ejecución

- `ContextEngine.assemble` acepta `executionId` y devuelve `execution {id, title, status, sopId, entityId}` junto a la entidad ya resuelta, y el evento `context.assembled` incluye `executionId`. Una ejecución de otro owner no se resuelve: el contexto sigue sin ella en lugar de inventarla.
- `readExecutionFacts(db, range, { executionId?, sopId? })` en `events/operational-facts.ts` agrega en SQL los eventos de la ejecución (`payload.taskId` / `payload.executionId` / `correlationId`), con el prefijo del tenant y el periodo. Responde a "por qué se paró la reactivación": qué pasos, cuándo y de qué ejecución, excluyendo las demás ejecuciones de la misma empresa.

## Cambios de ruta registrados

- `POST /api/agent-personas/laia/automations/:automationId/chat`: `threadId` pasa a opcional (sin él se abre hilo), acepta `executionId` y añade `executionId`, `entityId` y `references` a la respuesta. `403`/`409` nuevos para vínculo y ejecución ajenos.
- `GET /api/threads/:id`: campo aditivo `automation`.
- `DELETE /api/threads/:id`: borra también el vínculo.
- `POST /api/rag/*`, `/api/drive/*`: sin cambios.

## Pruebas modificadas (rutas de Codex)

- `tests/laia-automation-chat.test.ts`: reescrita sobre store real (PGlite) en vez de un stub de `db.get`, porque el vínculo necesita persistencia. Conserva los casos legacy (401 sin sesión, 403 sin acceso a la automatización, 200) y añade: reanudación del mismo hilo, rechazo de hilo vinculado en otra empresa, cita de `exec-1` con exclusión de `exec-2` de la misma empresa y entidad, siguiente responsable humano en `waiting_input`, rechazo de ejecución de otra empresa (`403`) y de otro proceso (`409`) sin escribir vínculo, y hechos de ejecución filtrados por ejecución y por tenant.
- `tests/context-engine.test.ts`: la ejecución vinculada se resuelve con su entidad y sin vínculo no aparece.

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` | 0 errores |
| Gate 13: `laia-automation-chat` + `context-engine` + `laia-vertical-acceptance` | **11 pass, 0 fail**, 5 `test.todo` heredados |
| Regresión: `event-bus`, `sop-contract`, `sop-triggers` | **11/11 pass, 0 fail** |
| Audits `idempotency`, `anchors`, `tenant-default`, `layers`, `bridges`, `no-console` | 0 |
| `git diff --check` | limpio |

## Pendiente

- **Staging con dos cuentas Google reales**: no ejecutada. Sin `GOOGLE_CLIENT_ID`/`SECRET` ni cuentas de staging, no hay operación real que registrar; la acreditación es sobre store real en PGlite con `fetch` interceptado donde aplica. No se guardan identificadores de proveedor ni contenido privado.
- `tests/laia-vertical-acceptance.test.ts` sigue con sus cinco `test.todo`: exigen la operación real A/B (correo, citas, ficha CRM) que corresponde a las campañas 15–20.

## Rollback

Revertir este commit elimina `automation-thread.ts` y deja la ruta de automatización devolviendo `threadId` sin vínculo; los registros de `automation-threads` quedan inertes, `GET /api/threads/:id` deja de publicar `automation`, `ContextEngine` ignora `executionId` y `readExecutionFacts` desaparece sin tocar otros hechos. No se borran hilos, tareas ni eventos.
