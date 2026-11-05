# AFTER — NC-P00 consolidación

Estado: candidato **en borrador** para revisión. El cierre de PS-01b y la integración
en main requieren las verificaciones pendientes indicadas abajo.

- Base de integración: `4f81f2293b67048ec4f6a32801f5940439b832cf`.
- Candidato de código: `7e50869835e87e778fcca3bbbf858849ab0f1148`. Los commits posteriores pueden añadir evidencia.
- Origen #8 (`9f32817`): conserva `ea66aef` y `004b999` como antecedentes de solicitante,
  configuración y recuperación. La política legacy propuesta se sustituye por cuarentena.
- Origen #9 (`985b2c6`): se trasladan sus intenciones de descubrimiento interempresa,
  aprobación por fila y mantenimiento por contexto. Se comparó el diff y se reaplicaron
  esas intenciones sobre la #8 con los parches locales `d8cdc24` y `e47a739`.
  La parte Google de #9 queda para integración separada con el vertical.
- #7 (`ee2a72e`): mapa y reservas como referencias. Revisión documental independiente,
  con actualización de paths y estado antes de integrar.

| Invariante | Evidencia y alcance |
| --- | --- |
| Fila física y claim | Las regresiones de `current-scan-review.test.ts` y `worker-context-isolation.test.ts` cubren B con prefijo A precalentado, ID homónimo, origen contradictorio y CAS de cuarentena en la fila de origen. |
| Solicitante, asignación y rol | `delegation-http.test.ts` usa dos sesiones autenticadas del mismo usuario. El SOP se crea y ejecuta en B con rol `sales` y el usuario como solicitante. Rechaza rol ausente, inactivo o ajeno al SOP. La herramienta excluida no ejecuta su paso. |
| Tareas antiguas | La fila física concordante con `requestedBy` explícito puede continuar. Las filas ambiguas se pausan con `TASK_CONTEXT_UNVERIFIED`. La ruta de reanudar/reintentar exige contexto válido. No se asigna identidad por membership, owner ni ejecutor a datos antiguos. |
| Checkpoints y recuperación | Las pruebas adversarias cubren tenant/actor y resultado del handler. La ejecución también protege asignación, rol y lease. `worker-process-restart.test.ts` guarda un checkpoint, cierra el almacenamiento para volcarlo a disco y termina el proceso antes del retorno del handler. Otro proceso recupera un lease vencido con reloj de prueba y verifica estado y eventos. |
| Consumidores | `memory-context-isolation.test.ts` verifica memoria, grafo y RAG con dos empresas. `model-context.test.ts` comprueba selección de configuración y clave por rol y tenant, y rechazo de configuración ajena o endpoint incompatible, sin llamar a proveedores. La atribución de uso de tareas parte del scope activo. |
| Eventos | `events-isolation.test.ts` cubre dedupe persistente y separación del SSE. `delegation-http.test.ts` prueba `/api/events/stream` con sesiones reales A/B, consulta histórica, actor del rol y turno de kernel persistido en B. |
| Mantenimiento y aprobaciones | La batería de regresión y las pruebas del worker cubren aprobación A/B, recuperación y descubrimiento independiente del prefijo. El mantenimiento usa un cursor de estados por tenant/owner. Falta prueba de alta cardinalidad para los barridos acotados y el cursor. |
| Laia | Se acredita el turno persistido del especialista y su actor en B. La supervisión de Laia en el producto queda pendiente. El recorrido aún registra errores Zod en el bucle Meta/consolidación al listar algunos turnos. |

## Evidencia y ejecución

```powershell
node --import tsx --import ./tests/setup.ts --test --test-timeout=90000 --test-concurrency=3 (Get-ChildItem tests/cognition/foundation/*.test.ts | ForEach-Object FullName)
node --import tsx --import ./tests/setup.ts --test --test-timeout=240000 --test-concurrency=2 tests/cognition/foundation/delegation-http.test.ts tests/cognition/foundation/task-context.test.ts tests/cognition/foundation/worker-process-restart.test.ts
node --import tsx --import ./tests/setup.ts --test --test-timeout=90000 tests/cognition/foundation/model-context.test.ts
node --import tsx --import ./tests/setup.ts --test --test-timeout=150000 tests/agent-api.test.ts tests/sop-contract.test.ts tests/sop-triggers.test.ts
node ./node_modules/typescript/bin/tsc --noEmit
```

En la tanda amplia intermedia pasaron 22/24. Dos casos se interrumpieron por sus
límites de tiempo al correr en paralelo, incluido el arranque de un subproceso.
La repetición dirigida pasó 6/6, con delegación, cuatro casos de contexto y el
reinicio real. La prueba de modelos pasó 1/1 por separado. La primera comparación
de API contra main (16/16) detectó una regresión de inicialización. Se corrigió el
scope tras autenticar y se ajustó una fixture de alta directa para aportar el
contexto de solicitante que ahora exige el contrato. La repetición final pasó
16/16 con el mismo conjunto de archivos que main.

Auditorías locales comparadas con `4f81f22`: layers 0 violaciones, bridges 16/16,
tenant-default 0 prohibidas y no-console 42 ocurrencias en ambos. Idempotency
falla en ambos (candidato 153 duplicadas, 9 huérfanas, 133 repetidas frente a
157, 9 y 138 en main). Contracts falla con 150 huérfanos en ambos. Se usó
`node --import tsx scripts/audits/<nombre>.ts`, incluido `no-console.ts`.
Las salidas generadas por las auditorías quedan fuera del candidato.

## Contrato para el vertical

- Las altas de tarea deben ejecutarse dentro de `runInTenantScope` tras acreditar
  tenant y actor. `executionContext` persiste tenant, owner y solicitante.
  `assignedTo` conserva el asignado humano y `state.roleId` identifica al especialista
  que ejecuta el SOP. El campo `requestedBy` sigue disponible para consumidores.
- Aprobaciones, persistencia de resultados y SSE usan el ámbito de la tarea y de
  la sesión autorizada. Un worker no debe reconstruir su identidad mediante el
  tenant primario del usuario.
- Los cambios son de núcleo: domain/agent, Store scoped, service, worker,
  modelo/SOP, kernel y eventos. El wiring de arranque/login solo aporta ámbito
  a la inicialización y a los eventos del sistema. WhatsApp, Google/OAuth y
  `db.ts` siguen bajo el vertical. El cursor de #12 y el ajuste de CI #13 se
  revisan por separado.
- Los SOP y datos de grafo que solo existan bajo claves crudas requieren una
  migración con tenant acreditado. El candidato lee las particiones scoped.
- Los nuevos SSE consultan tenant de la sesión. Los consumidores internos
  usan una suscripción de servidor separada y las notificaciones de usuario
  se guardan a través del Store scoped.

## Bloqueos de integración

1. Coordinar la parte Google de #9 con el vertical y verificar que las conexiones
   en vivo y las credenciales quedan vinculadas a la empresa de la tarea. El
   camino sample y las pruebas de configuración no acreditan esa frontera.
2. Verificar PostgreSQL con RLS y reinicio de worker en el entorno de integración.
   La evidencia local de almacenamiento y reinicio usa PGlite, con descarga
   explícita a disco. Falta una prueba real de proveedores, cuotas agregadas por
   empresa y endpoints distintos del configurado globalmente. El agente rechaza
   un endpoint por tenant incompatible antes de exponer su clave.
3. Corregir y verificar la supervisión de Laia y el listado de turnos en Meta.
   Completar el mantenimiento PS-01b con pruebas de barrido/paginación y la
   batería de CI completa antes de liberar los archivos compartidos.
4. Cuando la entrega común cumpla los gates, enlazarla desde #8 y #9 y cerrar
   esas PR como sustituidas. Conservar su historial y trasladar el trabajo de
   Google que siga siendo útil a su propia entrega. #7 se puede revisar por separado.
