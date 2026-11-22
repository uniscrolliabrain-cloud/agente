# C05 — Continuación de Codex: reconciliación de voz con Cognition V2

## Base y alcance
Rama creada desde `campaign/c04-conversacion-universal` (PR #19), sin tocar `main`. Fuente a reconciliar: `feat/voice-avatar-scaffold`. Esta primera entrega es auditoría de código y contrato de integración; **no** declara C05 implementada ni pruebas ejecutadas.

## Código revisado
- Base C04: `apps/server/src/voice-session-routes.ts`, `apps/server/src/engine/voice-v2/coordinator.ts`, `apps/server/src/engine/voice-v2/fast-adapter.ts`, informe `C04-REPORT.md`.
- Scaffold legado: `apps/server/src/voice/{agents,harness,providers,routes,sessions,snapshot}.ts`, `apps/web/src/voice/useAvatarCall.ts`.
- Diff del scaffold contra main: también modifica app, DB, engine y UI; **no hacer merge masivo**.

## Decisiones verificables
1. **C04 es la autoridad única** de identidad, consentimiento, hilo, epoch, transacciones, fences, revocación y persistencia. Mantener `/api/cognition-v2/voice`; no montar paralelamente `/api/avatar/llm` como segundo runtime.
2. `voice/harness.ts` crea un `ConversationAgent` independiente y transmite historial desde el cliente. No migrarlo como motor. El adaptador C04 usa Fast/Cognition V2 y recupera historial autorizado del servidor.
3. `voice/sessions.ts` mantiene sesiones en KV por owner; C04 ya usa tablas durables por tenant, límites, receipts y reaper. No duplicar sesiones ni usar IDs de hilo fabricados sin verificar existencia.
4. `voice/snapshot.ts` reconstruye texto con recall y contexto del sistema y admite fallback vacío. C04 tiene snapshots autorizados de Cognition V2; no introducir contexto no autorizado ni un prompt largo paralelo.
5. `voice/agents.ts` contiene perfiles configurables por agente y selección de voz/avatar: recuperar solo el modelo de perfil/configuración, sin registrar por defecto personas ficticias como agentes activos ni exponer IDs sensibles innecesariamente. La autorización y el rol activo siguen viniendo del tenant.
6. `voice/providers.ts` contiene prototipos HTTP de Anam y ElevenLabs sin prueba real. Trasladar a puertos inyectables y aislados de C06, sin llamar a proveedor desde la transacción de sesión; revisar SDK, endpoints y políticas antes de habilitar.
7. `useAvatarCall.ts` consume SSE del endpoint antiguo, guarda historial local y maneja interrupción. En C08 deberá consumir el contrato C04 y la evolución streaming C07, con estado del servidor como fuente canónica. Su `catch` interno del parser SSE no debe ocultar errores terminales.

## Plan de patchsets C05
- **P05.1** Contratos de proveedor/perfil de medios: tipos separados de identidad cognitiva y estado de sesión; sin dependencias de red ni secretos en tests.
- **P05.2** Resolver perfil por rol activo y tenant; ausencia de voz/avatar -> estado no configurado, no fallback a un agente ajeno.
- **P05.3** Adaptador de sesión: iniciar desde hilo persistido, consentimiento y snapshot autorizados; devolver descriptor de capacidades; reutilizar coordinador C04.
- **P05.4** Interfaz de media transport con cancelación, epoch y cierre idempotente; implementación mock primero. Anam/ElevenLabs reales pertenecen a C06.
- **P05.5** Tests: cross-tenant, rol revocado, ausencia de proveedor, replay, sesión cerrada, cancelación durante inicio y sin historial local inyectado.
- **P05.6** Gate: typecheck, pruebas V2, suite global y CI sobre SHA final; reporte de logs, diffstat, riesgos y GO/NO_GO.

## Riesgos y límites
- C04 devuelve JSON tras completar transcripción: no prometer streaming/audio realtime hasta C06/C07.
- El scaffold usa nombres de agentes predeterminados y valores de configuración de 2026-11-11; contrastar con registro actual.
- No crear una ruta de compatibilidad que omita autorización C04.
- No fusionar, desplegar ni eliminar ramas sin aprobación explícita.
- El informe C04 declara pruebas locales, no equivalen a ejecución de tests de esta rama.

## Próximo cambio de código
Implementar P05.1–P05.2 contra los tipos reales de Cognition V2 y el registro de roles, con tests; comprobar compatibilidad antes de tocar montaje HTTP.

## Incremento P05.2 — Descubrimiento de capacidades por rol autorizado

Commit `e3795bc`. Añadido `GET /api/cognition-v2/voice/capabilities/:roleId` a `voice-session-routes.ts` (el prefijo depende del montaje existente). Se obtiene la identidad autenticada y se lee el rol desde el almacén tenant-scoped; se comprueba ID exacto, esquema y estado activo. El descriptor devuelve únicamente nombre de presentación y booleanos de configuración, nunca claves ni IDs del proveedor. Sin credenciales, devuelve `voice: false` y `video: false`; sin rol autorizado, 403. No abre sesiones, no llama proveedores ni modifica el contrato de consentimiento de C04.

Tests unitarios del descriptor añadidos en `tests/voice-v2-media-capabilities.test.ts`. **No se han ejecutado** todavía; tampoco hay prueba HTTP de la ruta ni CI validada. Antes de cerrar C05, comprobar `pnpm typecheck`, tests de voz y tenant, y agregar test HTTP que verifique autorización por tenant y que no se filtran secretos. La presencia de claves solo indica configuración, no conectividad o verificación real del proveedor.

## Incremento P05.3 — Consulta de sesiones durables y autorización consistente

- `cc30b462`: `GET /sessions/:id` bajo el montaje de voz Cognition V2, reutilizando `coordinator.inspect` para verificar identidad, estado, expiración, consentimiento y rol actual. La ruta responde 404 si no existe; no monta sesiones KV del scaffold.
- En `authorizeAgent` se verifica el rol contra el esquema canónico y el ID exacto, además de `active: true`, evitando que un registro parcial con solo `active` autorice una sesión.
- `9aacead3`: extendida la prueba HTTP existente `tests/cognition-v2-http.test.ts` con consulta de capacidades autorizadas, rol desconocido, acceso cross-tenant y consulta de sesión propia/ajena/inexistente.
- **Verificación pendiente**: ejecutar test HTTP con la base compatible y el resto de la suite; estas pruebas se han escrito pero no se han ejecutado. No hay media real ni cambios en el consentimiento. Las sesiones JSON de C04 continúan siendo scaffolding, no una conexión de Anam.

## Incremento P05.4 — Puerto de transporte multimedia simulado

- `b49378a8`: añadido `engine/voice-v2/media-transport.ts` con puerto `open/interrupt/close` abortable y `MockMediaTransport` sin red, tokens, audio ni vídeo. Fencing monotónico por `epoch`; cierre idempotente.
- `72d0b8ed`: añadidas pruebas `tests/voice-v2-media-transport.test.ts` para cancelación, rechazo de epochs obsoletos, cierre y sesiones terminales.
- **No está conectado aún al coordinador HTTP**; es un puerto y doble de pruebas para futuras integraciones. No atribuir a este incremento reproducción, streaming ni integración de Anam/ElevenLabs.
- Pendiente: ejecutar suite y typecheck, comprobar que las rutas usan únicamente sesiones autorizadas y definir el handoff de transportes de C06.

## Incremento P05.5 — Adaptador de ciclo de vida (sin activación de proveedores)

- `bda6582f`: `engine/voice-v2/media-lifecycle.ts` incorpora `VoiceMediaLifecycle`, que compone `VoiceTurnCoordinator.inspect/interrupt/close` con un puerto `MediaTransportPort` inyectado.
- `open` comprueba autorización y consentimiento en el coordinador antes de abrir el transporte y **revalida epoch/revision** después de la apertura. Si cambian, solicita cierre del transporte.
- `interrupt` confirma primero el nuevo epoch durable; `close` confirma primero el cierre durable. Un fallo de transporte nunca debe deshacer la revocación en el coordinador.
- `40bd64ea`: `tests/voice-v2-media-lifecycle.test.ts` cubre aislamiento de tenant, revocación, interrupción, cierre, señal abortada y carrera de epoch durante apertura.
- **No está instalado en rutas HTTP ni en producción.** La prueba usa un coordinador simulado y transporte mock. El puerto externo real y el control de su disponibilidad se diseñarán en C06.
- **Pendiente de validar:** ejecutar `pnpm` typecheck y suites de C05/C04. No hay resultado CI verificado para estos commits. Antes de activar transporte real, revisar limpieza en errores de proveedor, concurrencia multiinstancia y comportamiento ante aborts durante `transport.open`.

## P05.6 — Hardening de apertura parcial (2026-11-22)

- `dfbe4c8f`: `VoiceMediaLifecycle.open` ahora incluye `transport.open` dentro del bloque protegido por cleanup. Antes, si el proveedor reservaba recursos y después rechazaba la promesa, no se ejecutaba `transport.close`. El cierre usa una señal independiente de la petición cancelada y no oculta el error original.
- `2e37d2f5`: dos pruebas de regresión para asignación parcial seguida de error y cancelación durante apertura.
- **Estado de validación**: commits publicados; pruebas y typecheck NO ejecutados en este entorno. No atribuir resultado verde a estos cambios.
- **Riesgos aún abiertos**: el mock de transporte vive en memoria y no ofrece exclusión distribuida; la limpieza de recursos ante timeout de proveedor debe tener límite temporal en C06; `close` después de un fallo del proveedor podría requerir reintento externo; la apertura concurrente de un mismo sessionId debe coordinarse con una lease durable antes de conectar proveedores reales.
- **Gate de cierre C05**: `pnpm exec tsx --import ./tests/setup.ts --test tests/voice-v2-media-capabilities.test.ts tests/voice-v2-media-transport.test.ts tests/voice-v2-media-lifecycle.test.ts`, `pnpm test:cognition-v2`, `pnpm typecheck`, y verificación CI del SHA final. Mantener NO_GO hasta tener logs.
