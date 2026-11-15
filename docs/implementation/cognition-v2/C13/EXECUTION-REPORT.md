# C13 · canal de voz V2 — implementación parcial, proveedor bloqueado

Fecha: 2026-11-15. Base funcional del padre: `54b8d5407a8576459448c4d059a877297d18ca7a`. Rama de implementación: `feat/cognition-v2-runtime-C00-C15`.

## Evidencia y clasificación

ADR-009 y C13 completos leídos. Rama `origin/feat/voice-avatar-scaffold` inspeccionada mediante `git show` para `voice/sessions.ts`, `voice/providers.ts` y `voice/llm.ts`.

- **REUTILIZAR:** sesión vinculada a tenant/actor/hilo, reaper por silencio/duración y ruta de conversación compartida. Los defaults de 45 s/15 min son límites técnicos provisionales de la rama existente; no son precios, SLA ni mediciones.
- **SUSTITUIR:** read+put de sesiones sin concurrencia ni epoch por transacciones SQL, final-STT dedupe, render claim, fencing y receipts durables. La clave de tenant no depende de la voz del usuario.
- **LEGACY TEMPORAL:** Vapi telefónico y scaffold de avatar de otra rama. No se han fusionado, alterado ni presentado como proveedor probado.

## Código real

`engine/voice-v2/contracts.ts`: esquemas estrictos de sesión y STT, puerto audiovisual, proveedor explícitamente no disponible y puerto Fast compartido.

`engine/voice-v2/coordinator.ts`: tablas aditivas `cognition_v2_voice_*`, consentimiento explícito de transcripción sin grabación, comprobación de snapshot y política actual, agente/rol verificados por callback servidor obligatorio, límites concurrentes, sesiones privadas, TTL, reaper recuperable, STT parcial sin inferencia, final STT idempotente, digest sin texto crudo persistido, turnos con lease y fence, epoch al interrumpir/cerrar/renovar contexto, revocación del consentimiento y receipts de transición.

`engine/voice-v2/fast-adapter.ts`: consume `CognitionV2Runtime.chat` bajo scope autorizado. El canal no incorpora un LLM, tools ni fallback propios. Valida el snapshot de sesión; el runtime prepara después su contexto C10 vigente. La optimización de reutilizar directamente ese snapshot dentro de Fast todavía no está implementada. No se atribuye latencia al adaptador sin medición.

`tests/cognition-v2-voice.test.ts`: pruebas PGlite reales de persistencia/reinicio, aislamiento, consentimiento, final-STT dedupe, ausencia de transcripción cruda, fencing de dos renderers, rechazo de salida de epoch antigua y reaper sin timers. Los proveedores de estas pruebas son fixtures locales declarados, no Anam.

## Integración por el padre

El módulo no arranca workers ni instala tablas al importarse. El host debe ejecutar `installVoiceV2(db)` y construir `VoiceTurnCoordinator` con ContextServing, autoridad de agente y `CognitionFastVoiceAdapter(runtime)`. La autoridad debe consultar registro/roles reales, no devolver `true` por defecto. No se modificaron `app.ts`, manifiestos ni rutas del host desde este patchset.

No hay rutas públicas de media ni frontend que aparenten una llamada operativa. La creación local devuelve `authorized`, nunca `ready` de media. Los receipts `fast_output_completed` acreditan fin del texto en el puerto Fast, no reproducción audiovisual ni lectura humana. El coordinador no cancela tareas/SOP empresariales al interrumpir voz.

## Verificación

- `node node_modules/typescript/bin/tsc --noEmit`: última ejecución global completada con exit 2 por `preparedContext` implícito `any[]` en `engine/cognition/v2/slow.ts:81,88`, superficie editada por el padre. Ningún diagnóstico en archivos C13 en esa salida. No equivale a typecheck PASS; el padre debe repetir en su SHA final.
- `node --import tsx --test --test-isolation=none tests/cognition-v2-voice.test.ts`: resultados y exit final registrados en `TEST-RESULTS.md` al terminar.

## Bloqueos y límites

**BLOCKED_EXTERNAL_PROVIDER**: no hay sandbox autorizado/configurado de Anam, prueba de media, selección de modo aprobada, región/DPA/precio/límites confirmados para la cuenta. Ver `ANAM-PROVIDER-VERIFICATION.md`. No se inventó un cliente Anam ni se ejecutaron llamadas de proveedor, se contrataron servicios o activaron costes.

C13 permanece **PARTIAL**, A25/A26 de proveedor real no certificados. Faltan media/STT/TTS/VAD reales, token broker verificado, interrupción de reproducción remota, navegador/móvil, costes conciliados y accesibilidad del avatar. Los tests locales de epoch no prueban barge-in físico.

No deploy, merge, push ni cambios en empresas reales. Rollback del módulo: no montarlo; detener nuevos renderers y cerrar sesiones por el coordinador, conservando receipts conforme a retención. Las tablas son aditivas y no se borran datos.
