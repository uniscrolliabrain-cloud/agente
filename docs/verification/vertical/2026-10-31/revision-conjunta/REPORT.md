# Revisión conjunta — Codex, Freebuff y dependencias del vertical

Fecha: 2026-10-31. Estado: **changes_required**. No se aprueba integración ni activación de producción.

## Alcance y fuentes

Revisión del diff completo de VS-02a, puntos de identidad/tenancy/recuperación de VS-01, transporte de eventos compartido y paquete anterior de gate/audits. Lectura del scaffold de compilador y de los informes de núcleo. No equivale a auditoría exhaustiva de todo el repositorio o de proveedores desplegados.

| Entrega | Identificador inspeccionado | Dictamen |
| --- | --- | --- |
| Base ya integrada | main `4f81f2293b67048ec4f6a32801f5940439b832cf` | Parcial operativo; no acredita piloto completo |
| Codex, WhatsApp y panel | PR #10, `38d7a81`, código `5a2852e` | Cambios necesarios: carrera de canal reproducida |
| Freebuff, VS-01 | PR #9, `985b2c6` | Cambios necesarios: contrato de identidad incompleto y contexto mutable |
| Freebuff, paquete conservado | bundle `campaign/scaffold-vivo`, `c2d1f9fd3b3119d709d29372770bc08a2ff10af1` | Rescatar por partes; no integrar íntegro |
| Núcleo PS-01 | PR #8, remoto `9f32817` | Informe leído; no sustituye aceptación de la base compartida |
| Compiler scaffold, autoría no atribuida | `feat/compiler-scaffold`, `eecafa0` | Esqueleto incompleto; no provisiona una empresa real |

El bundle se importó solo en `refs/audit/freebuff-preserved`. VS-01 se ejecutó en un worktree aislado y detached. No se cambió el checkout del escritorio, ni se aplicó ningún stash, ni se modificó código del núcleo. Esta revisión no contiene fixes de runtime.

## Hallazgos prioritarios

### R1 — P1 — Mi respuesta manual puede adoptar un canal distinto durante su preparación

En `apps/server/src/engine/whatsapp-outbound.ts:169`, `createReply` valida inbox contra una conexión; después `prepareDraft` vuelve a cargarla (`:131`). Una rotación entre las dos lecturas permite que el borrador adopte la generación de otra instancia sin repetir la comprobación contra el canal de inbox. La aprobación valida esa nueva generación y no vuelve a contrastar la fuente. El panel tampoco muestra la cuenta de salida antes de existir operación.

**Reproducción:** rotar la instancia en la segunda lectura; se esperaba rechazo y la creación resuelve correctamente. Log `own-channel-race.txt`. No se envió nada a un proveedor real.

**Corrección propuesta, VS:** pasar a preparación la conexión ya verificada o una expectativa inmutable de proveedor/cuenta/generación, validar esa expectativa al persistir y al aprobar, y mostrar el canal revisado. Añadir regresión de rotación entre lecturas. Mi aprobación anterior de 36 casos era insuficiente para este escenario.

### R2 — P1 — Eventos en vivo separados por owner, sin frontera de tenant

`apps/server/src/events-routes.ts:73` se suscribe con owner. `engine/events/subscriber.ts:40,58` indexa y publica solo por owner. Si el mismo usuario pertenece a A y B, el suscriptor abierto bajo A recibe un evento de B. Es un defecto compartido preexistente en main y permanece en ambas entregas; no se atribuye como regresión nueva de Freebuff o VS-02a.

**Reproducción:** suscripción en scope A y publicación con tenant B y mismo owner; recibe un evento cuando debía recibir cero. Log `sse-isolation.txt`. Prueba del registro real; no es una prueba HTTP/SSE desplegada. La ruta leída usa exactamente ese registro sin filtro de tenant.

**Corrección propuesta, NC:** clave tenant+owner y tenant obligatorio de emisión/suscripción, conservado desde autenticación; comprobar dos streams simultáneos del mismo usuario y cierre de conexión. Mantener la reserva de archivos compartidos.

### R3 — P1 — Freebuff permite cambiar tenant durante checkpoint

En `985b2c6:apps/server/src/engine/worker.ts`, `checkpoint(patch: Partial<AgentTask>)` pasa `...patch` al CAS sin impedir cambios de identidad. Un handler cambia el tenant de B a A aunque la fila física y el scope siguen siendo B. Esto corrompe el contexto durable y puede dejar la tarea en cuarentena al reanudar.

**Reproducción:** el valor persistido termina en `empresa-a` dentro de la clave `empresa-b:u1`. Log `freebuff-runtime.txt`.

**Corrección propuesta, NC:** contexto de ejecución canónico e inmutable; whitelist de campos mutables en checkpoint y resultado del handler. Proteger también solicitante, ejecutor y claves de lease/identidad que no sean parte del protocolo autorizado. Probar intento de mutación y recuperación posterior.

### R4 — P1 — VS-01 aún atribuye kernel y cuotas a membership primaria

El worker abre scope por fila, pero `985b2c6:apps/server/src/engine/model.ts` sigue llamando a `tenantIdFor(owner)` para `KernelContext.tenantId` y `tenantIdForQuota`. Ejecutar la tarea de B con membership primaria A sigue construyendo contexto/cómputo de cuota para A. Las cinco pruebas de la rama no recorren ese model real.

**Evidencia:** lectura directa del consumidor; no se ejecutó una llamada LLM ni un test adicional del model en esta revisión. PS-01 del núcleo declara cambios en esos puntos; todavía requiere integración y comprobación conjunta con procedencia física de fila.

**Corrección propuesta, NC:** consumir el mismo contexto probado en modelo, cuota, mantenimiento y recuperación. Integrar la unidad común revisada; no copiar los dos parches de worker en paralelo.

### R5 — P2 — Solicitante y compatibilidad no demostrados en VS-01

`taskActor` cae a `assignedTo`/owner; la emisión usa `compat = task.assignedTo || task.assignedBy ? "real" : "legacy"`. Una tarea con solo ejecutor se ejecuta sin solicitante demostrado y se presenta como identidad real. Es una incompatibilidad con el contrato estricto de identidad; esta prueba por sí sola no demuestra que un usuario externo pueda insertar tareas arbitrarias.

**Reproducción:** una tarea sin delegante ejecuta una vez; la política estricta esperaba cero. Log `freebuff-runtime.txt`.

**Corrección propuesta, NC:** separar solicitante y ejecutor, persistir procedencia y decidir explícitamente cuarentena o migración legacy. No llamar real a un fallback. La rama NC introduce requestedBy, pero el informe mantiene fallbacks de ejecución: debe cerrarse la política, no solo cambiar la etiqueta.

### R6 — P1 — Evento persistido con tenantId igual al usuario

El worker de VS-01 emite sin `options.tenantId`; `engine/events/bus.ts:100` usa entonces `owner`. El evento se guarda bajo B por el store, pero su tenant declarado es `u1`. Cambiar únicamente el scope no arregla la envoltura del evento ni sus consumidores. El fallback ya existe en main.

**Reproducción:** existen eventos bajo B y su `tenantId` no es `empresa-b`. Log `freebuff-runtime.txt`.

**Corrección propuesta, NC:** derivación única del tenant probado y rechazo de discrepancias entre sobre, scope y almacenamiento. Cubrir la emisión real y sus lectores, no solo un bus simulado.

## Gate y audits antiguos de Freebuff

El paquete conservado contiene mejoras aprovechables: registro de checks, logs fuera de docs, resultados estructurados y pruebas del gate. Detecté estos límites concretos:

1. **P2, uso de contratos:** `contracts-criterion.ts` cuenta ocurrencias en líneas no declarativas; `const unrelated = "Unused"` hace que un contrato sin consumidor quede clasificado como `code`. Reproducido en `gate-claims.txt`. Usar análisis de símbolos/imports o etiquetar el resultado como heurística, sin presentarlo como prueba de consumo real.
2. **P2, resumen engañoso:** `renderSummary` resta solo fallos bloqueantes del total y llama al resultado «steps en verde». Un único check advisory con exit 1 produce «GATE OK · 1/1 steps en verde». Reproducido en `gate-claims.txt`. Separar aprobados, fallidos bloqueantes y advisory.
3. **P2, portabilidad:** `idempotency-allowlist.json` guarda paths Windows y el matching usa igualdad literal; el walker usa `path.join`. Las excepciones no coinciden en Linux. Hallazgo por lectura, no ejecución Linux de este paquete. Normalizar ambos lados a paths relativos POSIX y añadir caso multiplataforma.
4. `gate-report.ts` hereda el entorno aunque comenta `ALLOW_NETWORK=0`; no lo fuerza. Los workflows siguen llamando a las listas antiguas y no al gate nuevo. Son pendientes de integración; no se ha demostrado «un único gate CI».

Este paquete parte de c5a8c7c, anterior a los arreglos posteriores ya integrados. Sus informes de producto son instantáneas históricas. No reemplazan la campaña transversal actual ni justifican recuperar íntegra una rama vieja.

## Compiler scaffold

`bootstrapTenant` devuelve cero registros, `TenantBundleStore` solo guarda en memoria aunque reciba Supabase, `compileBundle` ignora template y `validateAgents`/`validateSOPs` siempre dan ok. `scripts/provision-client.ts` imprime éxito y el modo solicitado sin construir almacenamiento Supabase ni registries reales. Son stubs explícitos, pero ese comando no acredita aprovisionamiento. La rama además sustituye el script existente: no integrar sobre main como si fuera implementación terminada. No ejecuté migraciones ni esta CLI.

## Qué sí conserva valor y qué prueban los tests

- **VS-01:** sus cinco pruebas originales pasan en esta revisión. La procedencia del tenant físico y el descubrimiento tras reinicio de objetos son mejoras reales. Reiniciar objetos no demuestra matar y recuperar un proceso.
- **VS-02a:** la evidencia anterior registra 36/36 pruebas, typechecks y build correctos sobre el código revisado. Cubre decisión única persistida, aislamiento, credenciales cifradas y resultado incierto sin reenvío automático. No repetí los 36: añadí pruebas adversarias que descubrieron R1. El resultado anterior sigue siendo válido para esos casos, no para aprobar la rama completa.
- **Entrada WhatsApp ya integrada:** hay verificación del proveedor y registro durable, no un simple webhook detrás de login. La respuesta automática sigue pendiente de puente con chat/SOP, base común y proveedor real.
- **Campaña/inventario:** sirven para repartir trabajo y preparar cuentas. No se inspeccionaron valores de Doppler ni se verificó operatividad de esas cuentas; tener una clave registrada no es una integración activa.

## Comprobaciones de esta revisión

| Comprobación | Resultado |
| --- | --- |
| Freebuff original + tres casos adversarios | 8 tests: 5 pass, 3 fail; sin cancelaciones |
| Carrera de conexión en mi rama | 1 fail: falta rechazo esperado |
| Registro compartido de eventos | 1 fail: un evento de B llega a suscripción A |
| Sondas de gate | dos salidas reproducen clasificación y resumen incorrectos |
| CI PR #10, run 41202844672 | unit falla por timeouts, worker falla `tsc: not found`, web pasa |

El job unit registra `fail 0` y siete cancelaciones: no significa suite aprobada. No se atribuyen esos fallos como preexistentes sin comparación de baseline equivalente en esta revisión. Integración y release gate están skipped. La CI completa no está verde.

Los casos y logs reproducibles están junto a este informe, en `evidence/`. Las copias de pruebas se guardan como `.txt` para no añadir intencionadamente tests rojos a la suite normal. Para reproducir, usar un worktree aislado del SHA indicado y copiar cada fixture a su ruta original bajo tests. Freebuff usa su test original ampliado; la fixture propia corresponde a `tests/review-whatsapp-audit.test.ts`. Ejecutar Node con `--import tsx --import ./tests/setup.ts --test --test-concurrency=1 --test-timeout=60000` y el archivo. La fixture propia contiene dos pruebas; los logs separados usaron filtro para el caso SSE. No precisa claves ni hace envíos reales.

## Orden de remediación y decisión

1. **VS:** cerrar R1 en la PR #10 y convertir la reproducción en regresión que pase. Revisar canal visible en la aprobación y acceso a operaciones antiguas: hoy el listado corta en 100 sin paginación, de modo que no basta para seguimiento indefinido.
2. **NC:** entregar una sola base común que cierre R2–R6, con contexto físico, solicitante explícito, inmutabilidad y transporte de eventos. Conservar de VS-01 lo útil mediante revisión del diff; no mergear PR #8 y #9 a ciegas sobre los mismos archivos.
3. **Verificación:** reparar el job worker y diagnosticar timeouts contra baseline, manteniendo una comprobación reproducible. No subir el timeout como sustituto del diagnóstico.
4. **VS:** probar sobre la base integrada, inspección visual y un envío real controlado cuando estén definidos cuenta y destinatario. Después enlazar chat/SOP y comprobar recuperación de proceso.
5. **Gate/compilador:** mantenerlos como unidades aparte. Rescatar el gate con los fixes anteriores; completar o dejar explícitamente experimental la CLI del compilador.

**Conclusión:** hay trabajo de implementación aprovechable y pruebas útiles de ambas partes. No valido el cierre de VS-01, VS-02 ni el vertical completo. No se ha mergeado, desplegado ni activado ningún proveedor durante esta revisión.
