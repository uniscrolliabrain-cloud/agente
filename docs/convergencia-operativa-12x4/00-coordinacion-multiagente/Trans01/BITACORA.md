# Bitácora Trans01

Estado: W0 PENDING. Base común 751eab413aef2ca124d42dcba602b91696b71c9d. Tests NOT_RUN. Ownership exacto pendiente de confirmación. Registrar entradas append-only por patchset según HANDOFF.md.

## T01 · Pasada 01 · W0–W5 · 24 de noviembre de 2026

- Base de ejecución `a70e2da41154b80d0f5442a0b520dabf6d80bd38`. Rama verificada con `git branch --show-current` → `Trans01`. Maestra leída en `52dcd7ac`. PR de revisión [#32](https://github.com/uniscrolliabrain-cloud/agente/pull/32) hacia la maestra.
- W0: [fuentes](T01-FUENTES.tsv) y [ramas](T01-RAMAS.tsv), referencias fijadas por hash y equivalencia de patches. W1–W5: [auditoría](T01-AUDITORIA.md) de autoridad, rutas, productores/consumidores y doce fases; [propuesta B1](T01-CONTRATOS-B1.md) con reservas, solicitudes R01–R04, migración, rollback y pruebas negativas.
- Pruebas y comandos en [evidencia](T01-EVIDENCIA.md). El fallo C04 se reprodujo en Node 22.23.5 sobre `c8293e8`. Es un bloqueo del candidato combinado y requiere la reserva del archivo de prueba por su propietario.
- Ownership comprobado con `git diff a70e2da4..HEAD --name-only`. Los cambios de este turno se limitan a la carpeta Trans01. El PR puede mostrar un delta anterior del protocolo común debido a la divergencia inicial de la rama; este turno no modificó el protocolo.
- Próximo paso tras B1: supervisor confirma reservas y contratos compartidos, decide la base combinada, asigna la corrección C04 y autoriza T02. El gate del árbol combinado sigue pendiente. El rollback de la entrega documental es revertir sus commits.
- Cierre T01/B1 · READY para revisión. El gate completo pasó 10/10 en `b04e184756b97725d1ceee9773e5de33e7934fbf` (874 pruebas aprobadas, 21 omitidas, 5 TODO). Postgres local cubrió cinco pruebas adicionales, todas aprobadas. T02 queda a la espera de autorización.

## T02 · Pasada 02 · 24 de noviembre de 2026

- Rama `Trans01` verificada después de fetch, base `335e0d4a`. Revisión de trans02 `46dca6ba`, Trans03 `1143d702`, Trans04 `124773c0` y resolución `d341f14f`, en lectura. En [reconciliación y contrato causal-1](T02-RECONCILIACION.md) quedan mapeos, incompatibilidades, solicitudes, puntos de montaje y pruebas combinadas propuestas.
- Patchsets independientes ejecutados en `apps/server/src/actions.ts` (reservado por B1): conservar tenant y actor decisor en la proyección V1, y persistir solo la decisión ganadora junto a su claim en una transacción. Se verificaron las regresiones de ámbito, carrera y rollback sin efectos externos. El único delta de código queda en ese archivo. Los cambios pueden revertirse sin migración.
- [Evidencia y comandos](T02-EVIDENCIA.md): 7/7 archivos de baseline, 8/8 de regresión focal en Node 22, tres casos locales aprobados, C04 rojo sin arnés y defecto de paginación de replay reproducido. La evidencia del gate completo de T01 sigue vinculada a su propio SHA.
- **T02/B2 · BLOCKED** tras ejecutar la secuencia independiente. Pendientes el puerto canónico de recibos y el acuerdo de secuencia/almacenamiento para outbox, selector de trans02, interfaz de telemetría de Trans04 y binding de Trans03. Reserva adicional de `index.ts` y del store si se decide corregir dispatch diferido y paginación. Revisar y fijar los contratos con sus dueños antes de ejecutar el gate combinado. [PR #32](https://github.com/uniscrolliabrain-cloud/agente/pull/32) sigue en borrador.

## Revisión independiente de evaluación · 24 noviembre 2026

- Revisión supervisora `REVISION-EVALUACION-INGENIERIA.md` en base `c6502b569162a1ff1e9e9d20b057d0f0af466248`: valoración provisional 6,5/10; objetivo externo >9/10 antes de programar. NO_GO se mantiene.
- Publicado anexo V2 en `EVALUACION-INGENIERIA-Y-PLAN-DE-PATCHSETS.md`, commit `cc526ef79b9f42f33646ea65d0bee48314c5ff46`. Contraste estático de Store.claim/CAS/transaction, TenantScopedStore, EventBus+StoreQuery+DurableProjector, consumidores kernel, ActionService, CapabilityRunner, PDP, app/agent/conversation, Cognition V2, WhatsAppOutbound, provisioning, kickoff/founder y contratos de Trans02/Trans03/Trans04.
- Documentados K01–K12, matriz doce fases × cuatro pasadas y turnos B1–B6, hunks propuestos, productor/consumidor, migración/rollback, escenarios y tests. `pnpm typecheck`, `pnpm test`, `pnpm gate`, Postgres restringido y gate combinado: **NOT_RUN en esta revisión**. Ningún código funcional modificado, merge o deploy.
- Próxima acción: evaluación independiente del SHA exacto, confirmar contratos y reservas con supervisor; NO programar hasta superar la evaluación y la barrera correspondiente.

## M1 · Macroturno 1 · 24 de noviembre de 2026

- Rama `Trans01` verificada; base de ejecución `85c8fd7`; campaña leída en `2d6aecf` sin integrarla; base común `751eab41`. Sin merge, rebase, force push, deploy ni efecto externo.
- Patchsets independientes de M1 ejecutados y persistidos en [índice M1](M1-PATCHSETS.md) y [evidencia M1](M1-EVIDENCIA.md). Commits de código: `026eca0` (A01 + borde de efecto A02), `5bca1d0` (perfil gobernado A02 + claim CAS A03), `9ccd1a3` (causal-1 E01, cursor E02, afterCommit E03), `ed7b505` (S01 computer_command).
- A01: `claim` acepta `expectedHash` y el predicado corre con estado/expiry/tarea; el recibo de aprobación se construye desde el ganador; 409 si la revisión cambió. A03: claims con `fence`/`attemptId`, transiciones CAS, `failed` legacy sin fence bloqueado para conciliación, worker tardío no pisa `done`. E01/E02: perfil causal-1 aditivo y `pageTenant` con cursor antes del límite. E03: `pendingCommit`/rollback verificados, sin segundo outbox. S01: `computer_command` fail-closed con rol, sin duplicar executor.
- Validación en HEAD: `pnpm typecheck` exit 0; 62/62 pruebas focales (35 nuevas + 27 de regresión focal); regresión ampliada 92 pruebas (90 PASS, 2 SKIP, 0 FAIL); 8/8 audits del gate exit 0. No se ejecutó `pnpm gate` completo ni suite global (fallos preexistentes declarados en README), ni Postgres restringido, ni proveedores reales.
- **M1 · READY FOR REVIEW · B2 PENDING SUPERVISOR.** Bloqueos: C01 selector (ABI trans02), H01 hooks (interfaz Trans04), E03 recibo empresarial (contrato compartido), A03 clasificación de errores de adaptador (Trans03) y activación de `governed_v2` en `service.ts` (inventario de callers + B2).
- Reserva registrada: `apps/server/src/db.ts` y `db-tenant.ts` para el quinto argumento del claim, aditivo y opcional; `null` conserva el comportamiento previo. Confirmar en B2.
- Riesgo residual: sin el discriminante de Trans03, un error no clasificado posterior al despacho se registra como `failed` reintentable (comportamiento previo conservado); los errores que declaran `outcomeUnknown` ya quedan ambiguos. Sin migración nueva. Próximo paso: revisión combinada B2; no se autoriza T03.

## M1.1 · Consolidación de la autoridad del kernel · 24 de noviembre de 2026

- Continuación sobre `fe6eea8`; campaña leída en `2d6aecf` sin integrarla. Sin merge, rebase, deploy, secretos ni efectos externos. No se inicia M2.
- [Índice M1.1](M1.1-PATCHSETS.md), [evidencia M1.1](M1.1-EVIDENCIA.md) y [contratos publicados](M1.1-CONTRATOS.md).
- **K01.** `engine/execution/outcome.ts` define una sola taxonomía (`rejected_before_dispatch`, `failed_without_effect`, `accepted`, `confirmed`, `unknown`). `retrySafe` exige evidencia positiva; un error genérico posterior al despacho queda `outcome_unknown`; el claim nuevo `accepted` no se reenvía. Se aplica también a `ActionService.run`. Esto **cierra el riesgo residual 1 de M1**: el error no clasificado ya no se reintenta.
- **K02.** La autoridad no depende del perfil para lo privilegiado: efecto externo o aprobación exigen actor, rol vigente, PDP y store en cualquier perfil; `governed_v2` extiende la exigencia a lecturas y se elige con `CAPABILITY_RUNNER_PROFILE`, reversible. La aprobación queda atada a tenant, tarea, hash, revisión, caducidad, principal, generación de conexión y consumo único por paso, y se revalida justo antes de `exec.run`.
- **K03.** `computer_command` sin rol se deniega (antes continuaba hacia el sandbox), rol inactivo se deniega, actor = principal que encargó la tarea y abort antes del efecto; `transition_entity` valida rol. Los demás casos de `runStep` quedan clasificados en el código.
- **K04.** El actor causal sale del contexto autorizado; un id distinto es `ACTOR_NOT_AUTHENTICATED`; los procesos internos usan `service:*` con fuente de la allowlist; la personalidad nunca es actor; el legacy sigue legible sin garantías retroactivas.
- **K05.** El replay ordena y pagina por `(updated_at, id)`, la posición durable de inserción: una inserción tardía con `emittedAt` anterior al cursor ya se recupera. El fallback sin SQL falla explícitamente en vez de devolver una ventana truncada.
- **K06.** Decisión + recibo + auditoría + actividad + intención `action-dispatch` en una transacción; `maintain` reconcilia intenciones huérfanas a `outcome_unknown` sin reenviar el efecto.
- **K07.** Seam de telemetría no bloqueante con allowlist de atributos (etapa, estado, duración, capability, clase de error) para T04-H01; una denegación se observa como denegación y un rollback como rollback.
- Validación: `pnpm typecheck` exit 0; 82/82 pruebas focales; regresión ampliada 92 pruebas (90 PASS, 2 SKIP, 0 FAIL); 8/8 audits exit 0. `pnpm gate` completo, Postgres restringido, proveedores reales y OTLP: NOT_RUN.
- Bloqueos vivos: C01 (ABI trans02), E03 (recibo compartido), A03-adapters (Trans03 declare `outcome`), `capabilityId` en la propuesta (trans02) y activación certificada de `governed_v2` (B2).
- **M1.1 · READY FOR REVIEW · B2 PENDING SUPERVISOR.** Sin autorización para T03/M2.
