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
