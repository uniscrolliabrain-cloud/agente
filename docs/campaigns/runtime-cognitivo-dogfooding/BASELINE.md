# Baseline, inventario y decisiones

> v1 · 2026-11-16 · Estado: **baseline documental; no re-ejecutado en este patchset**

## 1. Propósito

El objetivo expresado en la conversación es avanzar artesanalmente: instalar primero ciberseguridad, ajustar el kernel hacia primitivas pequeñas y agnósticas, dogfoodear con tres empresas propias con owners distintos, después agregar empleados-actores y agentes por empresa, y luego probar gestoría como segundo child. Las herramientas nativas de `/agente` (Drive, inbox/email, resúmenes, borradores y envíos) también deben estar bajo el mismo modelo de gobierno y observabilidad.

El diseño debe aprender del código y del uso; no presupone un compilador empresarial global terminado, una nueva plataforma de plugins o que JEV tenga autoridad. JEV sigue fuera de esta campaña y no se activa.

## 2. Lo que ya existe en el padre

### Identidad, tenant y aislamiento

- `apps/server/src/tenant-principal.ts` resuelve owner, actor, tenant, requestId y membresía; rechaza tenant no autorizado (`403`), ausencia de membresía multi-tenant (`403`), empresa suspendida (`403`) y caída de store (`503`). El tenant pedido debe coincidir con el autenticado/resuelto.
- `apps/server/src/engine/tenant.ts` tiene memberships múltiples, `resolveStrict`, lectura fresca `findMembership`, revocación, estado/suspensión y cache para enrutamiento.
- `apps/server/src/db-tenant.ts` separa claves por `tenantId:owner`; hay defensas por scope y scans que preservan tenant para workers.
- `apps/server/src/engine/authz/tenant-permissions.ts` define roles de empresa (`owner`, `admin`, `member`) y permisos fail-closed. La campaña 03 registra pruebas HTTP de algunas fronteras y revocación.
- Hay setup de RLS de Postgres (`db-rls.ts`) condicional en `MULTI_TENANT_SHARED`; la existencia de la función no acredita que todos los accesos usen transacción/scope ni que el escenario de tres owners esté ejecutado en Postgres de staging.

### Provisionamiento y actores

- `scripts/lib/vertical-slice-bundle.ts` valida bundles versionados y secretos ausentes; `scripts/provision-vertical-slice.ts` instala tenant/actores reanudablemente.
- `docs/vertical-slice-actual/08-provision/REPORTE.md` y sus pruebas documentan dos empresas, seis actores totales, doble apply/reanudación y aislamiento con IDs/scopes. Ese fixture reutiliza un owner de cuenta para las dos empresas: **no equivale** al nuevo escenario solicitado de tres owners con identidades y correos distintos.
- Las campañas 09/10 documentan personas instaladas, pertenencia humana, hechos compartidos y recuerdos privados por actor. Falta acreditar empleados/agentes del dogfood objetivo con identidades reales y sus capacidades finales.

### Kernel, Thoughts, grafo y bus

- `apps/server/src/kernel/kernel.ts`, `graph/thought.ts`, `graph/turn.ts` y `cognition/cycle.ts` aportan turnos, Thoughts, procedencia, atención, relaciones y el orden estructural de fases. El ciclo no equivale a un decisor empresarial completo.
- `apps/server/src/engine/events/bus.ts` persiste eventos, ofrece publicación a subscribers y replay por tenant; maneja receipts de transacción y puede informar resultado desconocido. La publicación en vivo no es por sí sola entrega durable/reconstruible de todos los consumidores.
- `apps/server/src/kernel/subscribers/events.ts` crea ciclos cognitivos para un conjunto explícito de eventos de entidad, acción, tarea, SOP, policy, estado y verificación. **Revalidación en el intento RUN-2026-11-16-02:** se añadió mapping de `email.received`/`email.sent` a Thoughts con referencias minimizadas; siguen sin mapping eventos de documento y `assistant.tool.invoked`. El estado anterior de esta frase era correcto para el SHA base, no para el árbol de trabajo actual.
- `apps/server/src/engine/service.ts` monta el subscriber del kernel y consumidores de Thoughts/turnos/auditoría/métricas/notificaciones. `app.ts` monta `KernelBusEmitter` para turnos/Thoughts del kernel. La conexión existe; quedan por verificar payloads, orden de confirmación, recuperación, deduplicación y límites de datos por cada productor.
- En `packages/workspaces/01-gmail/src/application/commands.ts`, `email.import_message` y `email.send` emiten `email.received`/`email.sent`; el publisher de Google Drive declara eventos de documento, pero declarar eventos no demuestra que haya producers conectados al flujo Drive nativo.
- El event bus y los subscribers deben observar artefactos con minimización; no replicar bodies completos, tokens ni secretos del proveedor en el log.

### Capabilities y policy

- `apps/server/src/engine/capabilities/bootstrap.ts` registra herramientas nativas con riesgo, side effects y parte de la metadata cognitiva. `CapabilityRegistry` y `TenantScopedCapabilityRegistry` existen.
- `apps/server/src/engine/service.ts` conecta el resolver tenant-scoped a las capacidades globales con `version: 1`; el orquestador usa el catálogo global y no exige por sí mismo que una capability esté instalada en un bundle de tenant.
- `CapabilityRunner` tiene un punto de autorización y validación de aprobación para ejecuciones que pasan por él; rutas/handlers de acciones también tienen controles particulares.
- `tenantAccess`/`assertPermission` están definidos y probados, pero la inspección de esta campaña no encontró su uso generalizado en handlers. `ActionService` tiene validaciones de estado, conexión, policy legacy en casos con role, CAS y aprobación; eso no demuestra que todo el modelo `actions.approve` esté aplicado a cada actor/route.
- El PDP/PEP ABAC, `PolicyEngine`, permisos por rol tenant y checks del `CapabilityRunner` son superficies relacionadas, pero distintas. La campaña debe mapear consumers y elegir una puerta existente por efecto; no añadir un quinto motor ni duplicar ActionService.

### Operaciones nativas: Google Drive

- `WorkspaceService.driveFiles` y `readDriveFile` buscan/leen en live; leer no debería indexar automáticamente.
- `indexDriveFile` selecciona/relee e indexa explícitamente, persistiendo fuente, conexión, revisión, intentos y fallos; `reconcileDriveSources` retira fuentes ligadas a conexión revocada; RAG sirve citas verificadas por revisión.
- `docs/vertical-slice-actual/12-drive/REPORTE.md` registra pruebas de documentos cortos, reingesta, revocación y recuperación local.
- El reporte histórico declara pendiente el disparador HTTP de selección. **RUN-2026-11-16-02 añadió** `POST /api/drive/files/:id/index` después de revisar que faltaba en el árbol de trabajo; usa principal autenticado y la ruta del servicio. Test HTTP local comprueba 401 sin sesión, 403 con Origin ajeno y 409 sin conexión Google. No prueba indexación por ruta con Google real ni sustituye la prueba de proveedor.
- `search_drive_files`/`read_drive_file` se ofrecen a chat y tareas. La capacidad ejecutada por el modelo no queda automáticamente representada como evento de herramienta ni Thought semántico.

### Operaciones nativas: Gmail / inbox / aprobaciones

- Chat/tareas pueden `search_mail`, `read_mail_thread`, `prepare_email`; respuestas se validan contra hilo/mensaje origen y participantes. El LLM puede resumir o redactar, pero no debe controlar tenant, permiso, aprobación ni recibo.
- `ActionService.propose/decide/run` persiste propuesta/aprobación y emite eventos genéricos `action.proposed/approved/denied/executed/failed/outcome_unknown`; `WorkspaceService.execute` valida conexión/cuenta/generación y distingue resultados ambiguos. `messageReceipt` permite evidencia mínima releíble de Gmail.
- `docs/vertical-slice-actual/14-aprobacion/REPORTE.md` y `15-gmail/REPORTE.md` describen gates locales con fixtures. Smoke con proveedores/cuentas reales sigue siendo externo/no ejecutado en el historial consultado.
- El workspace Gmail tiene comandos de importación/envío que emiten `email.received`/`email.sent`, y contracts de eventos. Hay que verificar qué comandos se usan en el producto real y si su envío respeta ActionService/approval; no confundir ese módulo con el flujo `WorkspaceService` de Google.
- `docs/vertical-slice-actual/REPORTE-GENERAL.md` (9 nov) declara dispatch diferido pendiente en `index.ts`, route de alta de follow-up faltante y gate final A/B sin ejecutar. Comprobar el HEAD actual antes de reproducir esos pendientes; el reporte es una snapshot histórica.

### Ontología, negocio y grafo

- `packages/domain/src/business-schema.ts` declara entidades, campos, estados, relaciones y cardinalidad; hay contratos V1/V2 y `BusinessGraph` que persiste entidades/relaciones.
- `packages/domain/src/ontology.ts`/`ontology-seed.ts` valida vocabulario/slug/colisión; no compila por sí mismo cada negocio en policy y restricciones completas ejecutables.
- `BusinessGraph.createRelation` y validaciones existentes deben inspeccionarse contra restricciones actuales de schema; no presumir enforcement de cardinalidad/relaciones por tener un modelo declarativo.
- `apps/server/src/engine/workspace/generator.ts` aún consume contratos de negocio heredados en parte. La ontología cromática de Cards (aprobada en la campaña V2) es diferente de la ontología empresarial.
- El runtime debe guardar referencias y hechos de dominio en el grafo según el schema que el tenant instaló; Thoughts son representación cognitiva/proveniencia, no reemplazo del grafo empresarial ni de policy.

### Primer child: `agntia-ciberseguridad`

- El repo child consultado expone middleware Python/FastAPI, laboratorio separado y SDK TypeScript server-only. Su estado documentado mantiene gates de producción/aceptación abiertos; no inferir readiness de cliente.
- El padre contiene `apps/server/src/engine/security-v2/{contracts,sdk-adapter,event-relay,cognition-adapter,capabilities}.ts` y tests `tests/cognition-v2-cyber-bridge.test.ts` / `cognition-v2-security-context.test.ts`.
- El puente define identidad tenant/actor/agente/revisión policy, lecturas nominadas, grant de un uso, validación de respuesta y minimización; relay usa inbox/cursor y confirma ACK después del commit local; `cognitiveSecurityProjector` escribe registro propuesto con evidencia/visibilidad.
- Las búsquedas de callsite encontraron instalación/uso en tests, pero no wiring de producción para `installSecurityBridgeV2`, `CyberEventRelay`, `governedSecurityTools` o `cognitiveSecurityProjector`. Tratarlo como infraestructura implementada y probada en composición de test, **no como bridge ya activo**.
- El hijo separa middleware de laboratorio adversarial y sus propios datos/roles. Padre conserva identidad, autorización y decisión sobre efectos; un finding externo no es un hecho de garantía ni habilita remediación.

### Segundo child: `agntia-gestoria`

- Repo Python/FastAPI independiente, SDK TypeScript/Hono server-side, herramientas nominadas y servicio Odoo opt-in. Su documentación exige autenticar/autorización en el anfitrión, token agent acotado, revisión humana y pruebas Odoo reales pendientes.
- No importarlo directamente a procesos TypeScript; frontera a verificar es SDK o transporte privado server-to-server. No compartir token owner con agentes.
- Diferencia de dominio valiosa para probar: empresa/documentos/expedientes de gestión, datos sensibles, cálculos limitados y revisión humana; no presentar borrador o cálculo como declaración fiscal presentada/certificada.

### JEV y autoridad

- `docs/implementation/cognition-v2/C08/JEV-PROVIDER-VERIFICATION.md` declara documentación y contratos locales verificados, `LIVE_DISABLED`, sin llamada de inferencia real/gateway de egreso o calibración.
- A03 sigue `NOT_RUN`; C15 sigue `NO_GO`; no activar JEV ni usarlo como policy engine o autoridad del kernel en esta campaña.

## 3. Distinciones que no se deben colapsar

1. **Instalado** (código/dependencia presente) ≠ **registrado** (capability disponible) ≠ **habilitado** (tenant lo consiente) ≠ **autorizado ahora** (principal/membership/policy vigente) ≠ **ejecutado** (efecto ocurrió) ≠ **confirmado** (receipt verificable).
2. El child es dueño de semántica y procesamiento especializados; el padre es dueño del principal, límites/capabilities autorizadas, decisión de effects, bus/runtime y observabilidad común.
3. El bus transporta hechos/propuestas minimizados. No es fuente de permisos ni prueba automáticamente de delivery/replay.
4. Thought: observación, interpretación, decisión/propuesta del actor; cada clase preserva provenance/epistemicidad. Thought no eleva autoridad ni se promueve automáticamente a entidad de negocio.
5. Grafo cognitivo de referencias/Thoughts != BusinessGraph de entidades/relaciones != ontology de Cards != ontology empresarial del tenant.
6. Resumen generado del inbox es interpretación referenciada a los mensajes/revisiones fuente; no es hecho independiente. Una regeneración/modelo distinto crea nueva versión de interpretación.
7. Preparar borrador != aprobar != ejecutar != recibir confirmación del proveedor. `outcome_unknown` bloquea retry automático y requiere reconciliación.
8. Owner separados con emails distintos sí prueban varias fronteras de identidad en el dogfood, aunque no son operadores humanos independientes. Aislamiento requiere negativos cruzados deliberados, no solo éxito de lectura propia.

## 4. Plan de dogfood

- Tres tenants A/B/C, cada cual con owner distinto y una identidad/correo diferente. El tenant nunca procede de una elección arbitraria del LLM o solo del payload.
- Primero una capacidad por recorrido, en orden creciente de riesgo: leer fuentes → resumir con evidencias → preparar borrador → aprobar → enviar/recibo; para child ciber, primero lectura nominal no destructiva.
- Luego por tenant: dos empleados humanos con roles de actor de prueba (owner + empleado), tres agentes con IDs/roles/capability grants diferentes. Reconciliar con el diseño acordado antes de sembrar; no asumir que paquetes anteriores crean exactamente estos cardinales.
- Pruebas negativas A→B/C, B→A/C, C→A/B con IDs repetidos/conocidos para recurso, hilo, documento, job, evento, receipt, memory, relation, callback OAuth y background worker.
- Revocar membership/conexión/capability durante operación; suspender tenant; reiniciar con job pendiente/ACK perdido; confirmar fail-closed, scope durable y no duplicación.
- No introducir datos privados de clientes; el primer dogfood es con activos sintéticos/controlados propios y con consentimiento aplicable.

## 5. Fuentes consultadas

- `apps/server/src/{tenant-principal.ts,db-tenant.ts,db-rls.ts,workspace.ts,actions.ts,app.ts}`.
- `apps/server/src/engine/{tenant.ts,authz/tenant-permissions.ts,capabilities/*,events/*,security-v2/*}`.
- `apps/server/src/kernel/{kernel.ts,cognition/cycle.ts,subscribers/*,graph/*}`.
- `packages/domain/src/{business-schema.ts,ontology.ts,business.ts}`.
- `packages/workspaces/01-gmail/src/application/commands.ts`, WorkspaceService de Google Drive, contracts del workspace.
- `tests/cognition-v2-cyber-bridge.test.ts`, `tests/cognition-v2-security-context.test.ts`, `tests/tenant-principal.test.ts`, `tests/tenant-acme-isolation.test.ts`, `tests/vertical-slice-provision.test.ts`.
- `docs/vertical-slice-actual/README.md` + reportes 02–15 y `REPORTE-GENERAL.md`; `docs/implementation/cognition-v2/{CAMPAIGN-STATUS.md,IMPLEMENTATION-MAP.md,C08/JEV-PROVIDER-VERIFICATION.md,C15/ACCEPTANCE-MATRIX.md}`.
- Repositorios GitHub `agntia-ciberseguridad` y `agntia-gestoria`: README, docs de estado/contrato y contratos SDK consultados; no se ejecutaron esos proyectos en este patchset.
