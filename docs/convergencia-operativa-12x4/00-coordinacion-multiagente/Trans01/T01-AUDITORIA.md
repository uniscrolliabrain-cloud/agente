# T01 · Auditoría del kernel y su wiring

Base ejecutada `a70e2da41154b80d0f5442a0b520dabf6d80bd38`. Maestra de lectura `52dcd7ace6b88f4e33ec9c828cfbc4093766dade`. Main observado `715da8c41da78b6d7afc8e23ed8ee5202db72b7e`. El merge-base con main fue `12e535a264d0c4a5da17d7b049e04c82cbcc681c`. Los SHA iniciales de los documentos de coordinación pertenecen a cortes anteriores. Para las comparaciones manda el SHA observado.

Se inventariaron los 79 documentos de la maestra, sus 12 fases y 48 bloques, y los 24 documentos de `docs/agntia-demo/` en `d0c05b9e7c16edc9b235b9217c640622e53fc914`, anterior a su traslado. [Manifiesto de fuentes](T01-FUENTES.tsv). El contexto empresarial exige que LAIA informe de la misma realidad que el runtime ejecuta y que una sola operación conserve origen, permiso, responsable, resultado y evidencia en todas las vistas. Los perfiles de demo y sus datos sintéticos quedan fuera del owner real y de la prueba de disponibilidad productiva.

## W0 · Ramas y candidatos

[Inventario por SHA, merge-base, divergencia y patch equivalence](T01-RAMAS.tsv). Se usaron `git rev-list --left-right --count`, `git merge-base` y `git cherry`. Los equivalentes son de patch para commits sin merge. La equivalencia semántica y las reversiones se verifican en el candidato cuando correspondan.

| Fuente | Decisión en T01 |
| --- | --- |
| C00/C01 y coordinación | Conservar procedencia, matriz, ledger e inventario. Los recuentos históricos no describen las ramas nuevas. |
| C02, fix móvil, WIP | C02 conserva el baseline. Fix está contenido en C02 y WIP en fix. El candidato backend debe repetir las regresiones de hilo y cancelación sin modificar UX. |
| C03 y Cognition ya incorporada | C03 aporta una regresión independiente. Runtime, stepwise y worker reliability son ancestros de main. W4/W5/W6 tienen equivalentes `af3b16d`, `812ea36`, `403bc74`. Revisar cableado posterior, conservar el guard de modo compartido y el retiro del stub de escritura. |
| C04 y continuación C05/C06 | `c8293e8` está contenido en `54f7fbfe`. Revisar delta sobre C04, conservar historial único y estado de consentimiento. CI global tiene cancelaciones reproducidas en GitHub. No inferir paridad de un gate específico verde. |
| Auditorías independientes C06 | Preservar sus SHA probados y logs. El fallo histórico HTTP con `chat` indefinido corresponde a snapshots anteriores. La rama candidata incorpora binding y clonación; falta combinar sobre la base aprobada. |
| Scaffold histórico de voz | Fuente de contratos y precedentes. Conservar autorización y el hilo común; revisión y selección de adaptadores corresponden a Trans03. |
| Docs de conversación, Doppler y observabilidad | Referencias de contrato. No acreditar configuración ni despliegue a partir de documentos. |
| UX, demo, legal y releases | Referencias protegidas del trabajo previo. Los posibles cruces de backend requerirán alcance y revisión de los propietarios antes de cualquier integración. |

## W1 · Rutas, autoridad y consumidores en el árbol ejecutado

| Superficie | Código y clasificación | Riesgo o criterio de paridad |
| --- | --- | --- |
| Entrada y tenant | `apps/server/src/app.ts` instala autenticación, `tenant-principal.ts` resuelve pertenencia y `tenant-scope.ts` fija identidad async. `db-tenant.ts` aplica el namespace en el store. | El tenant solicitado por el cliente nunca reemplaza membership. Probar fallo de dependencia, revocación y dos memberships del mismo actor. |
| Conversación | `app.ts` monta CopilotKit y `agent.ts::makeRuntime` selecciona backend. `engine/conversation.ts::run` delega si el runtime V2 está habilitado. `/api/threads`, conversación principal y `/api/cognition` siguen LIVE_LEGACY en la base. `/api/cognition-v2` LIVE_V2 condicional. | AGUI externo es ruta diferenciada y debe probarse para que no eluda gating. El texto que llega de una persona no concede herramientas ni elige tenant/actor. |
| Kernel | `kernel/kernel.ts` abre turnos, guarda pensamientos y aplica contexto y gates. `kernel/audit/entry.ts` y subscriptores enlazan auditoría, índice, métricas y bus. | `personaId` cambia presentación/segmentación, nunca permisos. Conservar historial y visibilidad del owner. |
| Bus | `engine/events/{bus,types,schemas}.ts`, `engine/events/sinks/store.ts`; `EventBus.emit` valida payload, resuelve tenant y publica suscriptores tras commit. Consumidores: kernel, notificaciones, auditoría, métricas y sink V2 condicional. | `correlationId` y `causationId` son opcionales en 1.0; no afirmar causalidad completa. La deduplicación ordinaria observa y registra por separado. Verificar atomicidad bajo procesos rivales antes de prometer efecto único. |
| SOP y ejecución | `engine/service.ts` crea `CapabilityRunner`, `SOPExecutor` y evaluador de triggers. `engine/sop-triggers.ts` planifica; `engine/sop-executor.ts` resuelve y ejecuta pasos; `engine/execution/{executor,capability-runner}.ts` usa registry y adaptadores. | En `CapabilityRunner.run` la comprobación de gobernanza está condicionada a dependencias e identidad presentes. Antes de ampliar superficies de escritura, exigir prueba de rechazo si faltan metadatos o dependencias. |
| Acciones | `actions.ts` y `actions-deferred.ts` conservan V1. El runner verifica aprobación con el owner y estado, y usa claims para efectos externos. | Confirmar vínculo exacto de aprobación, operación, objetivo y tenant. Distinguir timeout con resultado ambiguo de fallo sin efecto antes de reintentar. |
| Cognición y voz | Contexto Fast mediante snapshot, reserve/rendered/ack en ledger, proyección y Slow bajo `engine/cognition/v2/**`. Observador P03b y adaptadores/contratos posteriores son SHADOW en la rama candidata, con montaje propio pendiente. `/api/voice` legacy se mantiene separado del contrato de sesión V2 candidato. | Receipt del runtime Slow acredita trabajo cognitivo, no resultado de negocio. Receipt de servidor no acredita playback. Fuente y propósito deben verificarse al servir contexto. |
| Dominio | `packages/domain/src/{agent,cognition-v2,business}.ts` y `engine/events/types.ts` proporcionan esquemas distintos. | La evolución del envelope debe permitir lectores mixtos y no confundir tipos de evento con contratos de autorización. |

## W2–W5 · Preparación por fase

| Fase | Entrega T01 | Dependencia de la siguiente pasada |
| --- | --- | --- |
| 01 Consolidación | SHA y equivalencias, matriz de rutas y puntos de bloqueo. | Base integrada, selección V2/legacy y CI sobre ese SHA. |
| 02 Observabilidad | Correlación de turnos y eventos, puntos de medición en bus, kernel y ejecución. | trans04 define instrumentación, cardinalidad y prueba de redacción. |
| 03 Proveedores | Fast y Slow separados. Política de puertos fail-closed y diferenciación configured/verified. | trans02 y Trans03 validan contrato y sandbox sin credenciales productivas. |
| 04 WhatsApp | Identidad, dedupe, aprobación y receipt como circuito esperado. | Trans03 confirma transporte y distingue aceptación de entrega. |
| 05 Google | Cinco capacidades separadas, scopes y revocación como entrada al PDP. | Trans03 valida Maps, Calendar, Drive, Gmail y Docs por separado. |
| 06 Datos | Fixtures deterministas de test separadas del owner real y demo. | trans04 identifica upstream, licencia y SHA del bundle. |
| 07 Owner | Solo plan, con pertenencia, roles, consentimientos y rollback. | Supervisor autoriza el apply cuando pase seguridad. |
| 08 Seguridad | Inventario y permisos para capacidades defensivas, evidencia y egress acotado. | Identificar origen y licencia, verificar aislamiento y control del entorno. |
| 09 Operación | Métricas de lag, recuperación, recibos y efectos ambiguos. | trans04 mide pipeline y alarmas sin payload sensible. |
| 10 Gestoría | Especificar autorización y receipt para importación/conciliación. | Definir upstream/licencia y revisión humana de efectos. |
| 11 Recompilación | Matriz dominio→SOP→capacidad→permiso→evento→outcome, preservando versiones. | Probar repetición, compatibilidad y rollback sin eliminar hechos. |
| 12 Validación | Gates y casos detallados en la propuesta B1. | Candidato combinado, Postgres restringido, restore y aprobación externa. |
