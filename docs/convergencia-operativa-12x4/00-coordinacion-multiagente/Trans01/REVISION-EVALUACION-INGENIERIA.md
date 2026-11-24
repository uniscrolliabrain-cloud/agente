# Revisión independiente de la evaluación Trans01 — 2026-11-24

**Veredicto: PARTIAL / NO_GO para implementación autónoma.** Documento evaluado: `EVALUACION-INGENIERIA-Y-PLAN-DE-PATCHSETS.md`, commit `9e553660cc1359b7898b9a5a68950ac4ffeff007`. Esta revisión coteja estáticamente los puntos K01/K02/K03/K05/K07/K08 con `apps/server/src/actions.ts`, `apps/server/src/db.ts`, `apps/server/src/db-tenant.ts`, `apps/server/src/engine/events/bus.ts`, `apps/server/src/engine/execution/capability-runner.ts`, `apps/server/src/index.ts`, `apps/server/src/engine/capabilities/bootstrap.ts` y `scripts/provision-vertical-slice.ts`. No se han ejecutado tests ni actualizado código funcional en esta revisión.

## Aciertos comprobados

1. **K01:** `ActionService.decide` usa `ActionsStore.transaction` para claim + registro `approval-requests`; no repetir esa corrección. `Store.claim(owner,id,status,now)` filtra `awaiting_review` y **ya comprueba expiración y estado de tarea en SQL** (`db.ts:357–368`), pero no hash; `TenantScopedStore.claim` es wrapper (`db-tenant.ts:72–74`). La carrera edit/approve es plausible y merece prueba reproducible.
2. **K02:** `CapabilityRunner.run` aplica governance únicamente si existen `governance`, `getAgentRole`, `ctx.roleId`, `ctx.actorId` (`capability-runner.ts:25`); `requiresApproval` consulta el Store solo si se inyectó `db` (líneas 43–62). Falta certificar los montajes y distinguir perfiles legados de gobernados antes de cambiar comportamiento.
3. **K03:** claims failed→claimed y claimed stale→outcome_unknown usan `db.put` ordinario, al igual que la finalización; `catch` persiste failed para errores potencialmente ambiguos (`capability-runner.ts:78–142`). No tratar failed como seguro para reenvío externo.
4. **K05:** `replayTenant` hace `scanByPrefix(...,limit)` antes de filtrar `sinceId`, tipo y fechas; además compara `id > sinceId` mientras ordena por `emittedAt,id` (`bus.ts:246–271`). El cursor necesita una única ordenación persistida, no solo subir limit.
5. **K07:** `index.ts:185–201` devuelve `deferred_dispatch_unwired` y emite mantenimiento con payload que necesita cotejo con schema. No activar el callback.
6. **K08:** `bootstrap.ts` ya registra `send_email`, `send_whatsapp` y `create_calendar_event`: reconciliar el catálogo con Trans03 antes de introducir IDs paralelos.

## Brechas de la entrega frente a la prueba solicitada

- Los **12 Kxx no equivalen a 12 fases completamente especificadas**: K08–K12 agrupan fases enteras y remiten a futuros inventarios, sin hunks concretos ni contratos E2E verificables. Es un mapa de riesgos correcto, no un plan exhaustivo por wave/pasada/turno.
- Los hunks de K01 y K05 son explícitamente ilustrativos; faltan interfaces concretas, cambios en todos los implementadores, tipos de retorno, errores, compatibilidad y diffs por consumidor.
- K01 debe documentar que la expiración y estado de tarea ya se verifican dentro de `Store.claim`, y que la carrera pendiente es el **hash** y cualquier revalidación de política/credencial posterior. Proponer `expectedHash` no resuelve por sí solo revocación tras claim.
- K02: el guard propuesto `!this.db` para todo runner gobernado podría bloquear capacidades de lectura/no idempotentes por accidente. Diseñar matriz según `sideEffects`, `requiresApproval`, PDP y perfil de composición real, sin bypass.
- K03 debe trazar el estado exacto de la transición reclamada con `Store.compareAndSwap`, verificar sus garantías y separar caída antes de enviar, después de aceptar y después de persistir receipt; no prometer exactly-once externo.
- K05 debe inspeccionar `StoreQuery`, orden del registro y estrategia de migración de checkpoints; no inventar `queryPageForTenant` como método existente.
- K06 necesita comparar con `DurableProjector`, `KernelReceiptProjector` y mecanismos de transacción `afterCommit` antes de diseñar outbox/inbox nuevos.
- K07–K12: leer directamente `app.ts`, `service.ts`, `conversation.ts`, `scripts/provision-vertical-slice.ts` y cada consumidor; el documento aún los marca sin inspección. `PROVISION_STEPS` sí existe y contiene `tenant`, `actors`, `complete`, pero las firmas/montajes siguen por mapear.
- Falta lectura integral de `apps/ui-lab/docs/agntia-demo/`, historia y deltas relevantes de ramas sin UX, matriz de tests actuales y escenarios owner completos.
- No hay tests ejecutados en el relevo; no presentar pruebas históricas de predecesores como certificación del nuevo candidato.

## Criterio de segunda entrega (solo documentación)

1. Completar trazabilidad **12 fases × 4 pasadas × waves/turnos** por superficie Trans01, con filas N/A justificadas y dependencias owner explícitas. No duplicar 48 bloques genéricos: vincular cada fase a patchsets pequeños y reales con orden topológico.
2. En los patchsets prioritarios K01–K07 dar anclas verificadas por SHA/línea, firma antes/después, implementadores afectados, diff plausible, error mapping, compatibilidad V1, idempotencia, rollback y al menos una prueba positiva, adversarial y de crash.
3. Construir matriz cruzada `producer → EventBus/SystemEvent → receipt → projector → Slow/JEV → context/attention → Fast/LAIA`; distinguir lo que Trans01 posee de contratos que suministrarán trans02/Trans03/Trans04.
4. Contrastar la jornada empresarial de `agntia-demo` con autenticación, SOP, capability, recibo, datos persistidos y LAIA, indicando cada componente realmente existente versus propuesto.
5. Añadir evidencia ejecutada o marcar NOT_RUN; realizar solo pruebas no destructivas permitidas. No modificar código funcional, no merges ni despliegues. Anexar autocrítica de incertidumbres restantes.

**Decisión:** mantener T02/B2 condicionado; no autorizar avance funcional T03 ni dar por superada la evaluación hasta contrastar los cuatro planes entre sí y ejecutar un gate combinado.
