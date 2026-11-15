# C13 — LAIA: avatar Anam, voz en tiempo real, sesiones, interrupciones y canales
**Turno 14/16 · 2026-11-15 · Repo principal:** `uniscrolliabrain-cloud/agente` · **rama:** `audit/preflight-cognition-option3-20261115`.
**Estado:** auditoría estática y plan de implementación; NO código de integración, NO tests, NO merge/deploy.
**Precedentes:** C00–C12. **Siguientes:** C14 ciberseguridad bridge, C15 aceptación integral.

## 0. Decisión y alcance
LAIA habla por texto y por avatar audiovisual en la web propia, usando **el mismo cerebro Fast/Slow, kernel, permisos, ContextServing C10, ledger C09 y Presenter C12**. El proveedor de avatar representa audio/video, no decide acciones empresariales. Voz requiere carril de latencia propio, admisión y cancelación real. Separar **canal** (web avatar/llamada/Zoom/Meet/Discord/WhatsApp) de **identidad de agente**, **sesión**, **modelo**, **STT**, **TTS**, **media** y **runtime**. No prometer integración nativa de Zoom/Meet/WhatsApp/Telegram/Discord sin API/capacidad verificada y permisos específicos.

**Decisión de voz:** comparar tres modos de Anam — turnkey, custom LLM y audio passthrough — mediante sandbox y métricas; preferencia por **control del LLM propio**. Audio passthrough + TTS externo (p. ej. ElevenLabs) es opción condicionada a API, coste y latencia; voz Anam nativa es opción válida si mejor y si permite controlar cerebro/identidad según contrato real. No imponer ElevenLabs por inercia. Vapi queda como **legacy telefónico separado**, no es requisito del avatar ni se debe reusar como transporte de vídeo.

## 1. Evidencia auditada en main (SHA blobs)
| Archivo | SHA blob | Observación |
|---|---|---|
| `docs/08-auditorias/latencia-anam-2026-11-11.md` | `b9a03d37ac46a3d2c5d5ea15f59ad39b91ab03f8` | 626 líneas, informe anterior fechado 11-11; confirma que en ese commit no había Anam/ElevenLabs operativo, diseña voice fast path y lista cuellos de botella |
| `apps/server/src/voice-routes.ts` | `7842effd745e397921c8312e9c3cfead08180cc4` | 210 líneas; llamadas salientes/estado Vapi, tenant scope y reserva idempotente; NO pipeline WebRTC de avatar |
| `packages/integrations/src/vapi.ts` | `8df25bc83e36b808738947e0acea394aa68fdcab` | 175 líneas; REST Vapi assistant/call/hangUp, no media realtime |
| `scripts/lib/connections.ts` | `35880df0c2854e9c686fe9f482037fe3e102678c` | sonda ElevenLabs a subscription API; no TTS streaming de producción identificado |
| `apps/server/src/engine/conversation.ts` | `63b5ea67765180a4822b7debde3fd60489cb8000` | chat AG-UI streaming, recall, cuotas y contexto; ruta pesada para voz según auditoría previa |
| `apps/server/src/engine/model-chain.ts` | `602b7ba758e95be25ac73cc3d78b7342fadae099` | timeout/fallback/circuit/bulkhead; C11 separa carriles |
| `apps/web/src/components/ChatPanel.tsx` | `f5006731f5c0306d9867dd5760d3abc22b10de48` | chat con streaming textual, no superficie audiovisual verificada |
**Búsqueda en GitHub:** `anam`, `elevenlabs`, `avatar`, `webrtc`, `voice`, `realtime`. Coincidencias Anam relevantes en documento de latencia, no cliente operativo identificado. **Límite:** indexación y main, no prueba absoluta de ausencia en ramas ni repos hijos. Revalidar HEAD, package lock, routes, env y árbol web antes de implementar.

## 2. Hallazgos C13-F01–F26
1. Anam aparece documentado, pero no se identificó SDK/cliente operativo en main.
2. Auditoría previa es propuesta fechada; cifras de latencia son **estimaciones/objetivos**, no mediciones de cuenta.
3. Vapi actual es telefonía REST, no sesión WebRTC ni TTS avatar.
4. ElevenLabs tiene health probe, no cliente de síntesis streaming identificado.
5. Chat AG-UI tiene streaming textual reutilizable, no protocolo de media bidireccional.
6. `conversation.ts` hace múltiples lecturas antes de primer token; no sirve sin cambios como fast path de voz.
7. `memory.recall` puede lanzar embeddings externos y escaneos; precalcular C10 snapshot por sesión.
8. `context.assemble` y recall pueden duplicar consultas; C10 debe centralizar.
9. Quota check de chat escanea usage; C11 reserva agregada para voz.
10. Fast fallback a Slow puede producir pausas incompatibles con conversación; C11 prohíbe cruce.
11. No hay VAD/STT/turn detection del avatar implementados identificados.
12. No hay protocolo de barge-in extremo a extremo demostrado: micrófono→cancel model/TTS/audio buffer.
13. Cancelación AG-UI del navegador no implica detener generación/audio en sesión Anam.
14. WebRTC signaling, session credentials, reconnect y device permissions requieren contratos propios.
15. Sesión de voz debe vincular tenant/actor/agent/role/thread; no confiar en client tenantId.
16. Claves Anam/ElevenLabs nunca deben llegar al browser; emitir tokens efímeros de sesión solo si proveedor los soporta.
17. Media y transcript contienen PII; consent, retention, encryption y policy requieren diseño explícito.
18. Transcript provisional no debe activar herramientas ni memorias hasta commit de turno validado.
19. Partial speech, correcciones STT y doble detección de fin de turno necesitan dedupe.
20. Audio passthrough exige codecs, sample rate, buffering, TTS stream y lip-sync verificados con proveedor.
21. Interrupción debe revocar audio pendiente, evitar que un resultado viejo hable sobre un nuevo turno.
22. Los resultados Slow pueden llegar después de sesión cerrada; notificar por C12, no reabrir media sin consentimiento.
23. Costes de avatar/voz por minuto y tokens requieren ledger y límites por tenant, sesión y canal.
24. Avatar es presentación; no debe aprobar SOP, firmar transacciones ni decidir policy.
25. Canales externos (Meet, Zoom, WhatsApp, Discord) necesitan bridges específicos y autorización, no quedan implementados con Anam.
26. Observabilidad debe distinguir setup de sesión, end-of-speech→first-audio, RTT, interrupción, calidad y costes.

## 3. Contratos V2 propuestos (no existentes)
```ts
type VoiceChannelV2 = "web_avatar"|"phone"|"zoom"|"meet"|"discord"|"whatsapp"|"telegram";
type VoiceSessionStateV2 = "requested"|"authorized"|"connecting"|"ready"|"listening"|"processing"|"speaking"|"interrupted"|"reconnecting"|"closed"|"failed";
interface VoiceSessionV2 {
 schemaVersion:"2.0"; sessionId:string; tenantId:string; actorId:string;
 agentId:string; roleId:string; threadId:string; channel:VoiceChannelV2;
 provider:"anam"|"other"; state:VoiceSessionStateV2; stateVersion:number;
 consentReceiptId?:string; startedAt:string; expiresAt:string; policyRevision:string;
}
interface VoiceTurnV2 {
 schemaVersion:"2.0"; voiceTurnId:string; sessionId:string; tenantId:string;
 utteranceRevision:number; transcriptStatus:"partial"|"final"|"cancelled";
 transcriptRef?:string; inputAudioDigest?:string; contextSnapshotId?:string;
 fastRequestId?:string; presentationId?:string; outputAudioId?:string;
 status:"listening"|"processing"|"speaking"|"interrupted"|"completed"|"failed";
 sequence:number; interruptionEpoch:number;
}
interface VoiceMediaReceiptV2 {
 sessionId:string; voiceTurnId:string; providerSessionId:string;
 event:"media_connected"|"first_audio"|"playback_complete"|"interrupted"|"media_failed";
 eventId:string; sequence:number; occurredAt:string; outputAudioId?:string;
}
interface VoiceCostReceiptV2 {
 tenantId:string; sessionId:string; provider:string; channel:VoiceChannelV2;
 billableUnits:number; unitType:"minute"|"token"|"character"|"request";
 providerUsageId?:string; estimated:boolean; recordedAt:string;
}
```
**Invariantes:** el `interruptionEpoch` sube al barge-in y descarta todo audio/texto tardío de epochs anteriores. El `VoiceSessionV2` es tenant-scoped; tokens efímeros vinculados a sesión y usuario; `voiceTurnId` idempotente. No asumir que la sesión de media y la sesión de agente comparten ciclo de vida.

## 4. Flujo objetivo
```text
Web user → authenticated voice-session API → PDP+consent+quota
 → Anam session credential (server broker, short-lived)
 → WebRTC/media SDK in browser
 → VAD/STT (Anam or verified provider) → final transcript
 → VoiceTurnCoordinator → C10 cached authorized ContextSnapshot
 → C11 Fast-only inference stream → C12 PresentationModel
 → TTS (Anam native OR external provider verified)
 → Anam lip-sync/avatar media → browser audio/video
                         ↘ barge-in → cancel Fast/TTS/playback, epoch++
                         ↘ durable Slow delegation C02/C07 → async C12 update
```
**No introducir LLM propio dentro de Anam como autoridad de negocio:** incluso si se usa custom LLM, la API apunta a gateway con tenant/role policy y tool allowlist. Las acciones empresariales se ejecutan solo por runtime y aprobaciones existentes. El avatar no ve raw secrets ni memoria privada fuera de scope.

## 5. Tres alternativas de integración a medir
| Modo | Ventaja | Limitación | Gate |
|---|---|---|---|
| Turnkey | STT/LLM/TTS integrados, posible menor latencia | control del cerebro y herramientas limitado | solo aceptable si runtime sigue autorizando acciones y contexto |
| Custom LLM | Anam gestiona media, AgntiaPro conserva Fast | dependencia del contrato streaming real | API sandbox + tests de cancel y latencia |
| Audio passthrough | máximo control TTS y voz personalizada | mayor complejidad audio, codecs, buffer, sincronía | API real + sample rate, codecs, timestamps y cost verificados |
**Recomendación provisional:** empezar con **custom LLM** si el contrato real permite Fast propio y cancelación; medir frente a turnkey; añadir passthrough solo si hay ventaja clara en identidad vocal/coste/control. No dar por verificadas especificaciones antiguas del proveedor sin consultar documentación actual en W0.

## 6. Rendimiento, latencia y coste
Medir por separado: `session_request→media_connected`, `end_of_speech→final_transcript`, `transcript→Fast first token`, `first_token→first_audio`, `first_audio→lip_sync`, `barge_in→playback_stop`, reconnect, media drops y costes. Registrar p50/p95/p99 en red móvil real. **No atribuir como medidos los objetivos** de la auditoría previa (p. ej., 1,2 s percibidos, 4–5 s setup, 24 kHz). Versionar cada supuesto y validar contra API real. Latencia total es suma y solapamiento de etapas; medir ambos.

**Fast path:** prewarm sesión y C10 snapshot, cache con policyRevision, quota reservation C11 O(1), tools mínimas y autorizadas, prompt corto, salida incremental, TTS chunking sin cortar palabras, control de buffer. **Evitar mover operaciones de auditoría a `void async` sin persistencia:** C02 durable queue y receipt antes de confirmar acciones. No sacrificar seguridad/consistencia para ganar milisegundos.

## 7. Seguridad y privacidad
- Permiso de micrófono/cámara del navegador, indicador de sesión activa y controles visibles de mute/end.
- Consentimiento explícito y trazable para grabación/transcripción según finalidad y jurisdicción; no equiparar consentimiento de uso de micro a grabación.
- Política de minimización y retención separada para audio bruto, transcript, embeddings y eventos.
- Tokens Anam efímeros emitidos por backend, vinculados a tenant/actor/agent/session; nunca API key en cliente.
- STT final y transcript revocable; eliminar/retractar fuente invalida memorias C04, cards C09 y snapshots C10.
- Verificar callbacks/webhooks con firmas, timestamps, nonce e idempotencia si proveedor los ofrece; nunca aceptar evento de proveedor como permiso.
- No grabar secretos en logs ni enviar datos de otras empresas al avatar.
- Limitar sesiones simultáneas, coste/minutos, duración y reintentos; reservar/conciliar uso.
- Protección contra prompt injection oral y spoofing de voz; voz del usuario no es autenticación suficiente para acciones sensibles.
- Barge-in no debe cancelar un SOP ya aprobado/ejecutado sin nueva orden autorizada; separar audio de task lifecycle.

## 8. Patchsets PS13.0–PS13.18 (rutas propuestas, verificar árbol)
**PS13.0 Inventario/provider:** `C13/evidence/ANAM-PROVIDER-VERIFICATION.md`, `VOICE-CALLGRAPH.md`, `LATENCY-BASELINE.md`, `SECRETS-REGISTRY.md`; SDK/contratos/región/precio/capacidades reales.
**PS13.1 Domain:** `packages/domain/src/voice-session-v2.ts`, `voice-turn-v2.ts`, `voice-media-receipt-v2.ts`.
**PS13.2 Voice gateway:** `apps/server/src/engine/voice/voice-session-gateway.ts`; auth, tenant, agent/role, consent.
**PS13.3 Provider port:** `engine/voice/avatar-provider-port.ts`; SDK-independent.
**PS13.4 Anam adapter:** `engine/voice/providers/anam-adapter.ts`; **solo tras verificación oficial/sandbox**.
**PS13.5 Session broker:** `engine/voice/session-broker.ts`; ephemeral tokens, TTL, reconnect.
**PS13.6 Voice turn coordinator:** `engine/voice/turn-coordinator.ts`; STT partial/final, dedupe, interruptionEpoch.
**PS13.7 Context:** `engine/voice/context-snapshot.ts`; C10 prewarm and invalidation.
**PS13.8 Fast:** `engine/voice/fast-voice-adapter.ts`; C11 fast-only model, short deadlines, cancellation.
**PS13.9 TTS port:** `engine/voice/tts-port.ts`; native Anam or external streaming, versioned voice profile.
**PS13.10 Optional ElevenLabs:** `engine/voice/providers/elevenlabs-tts.ts` only if verified/approved.
**PS13.11 Barge-in:** `engine/voice/interruption-controller.ts`; abort Fast/TTS/audio, epoch fencing.
**PS13.12 Presenter:** `engine/voice/presentation-adapter.ts`; C12 text/status aligned with spoken content.
**PS13.13 Cost:** `engine/voice/usage-ledger.ts`; provider minute/token/char reconciliation.
**PS13.14 API routes:** `apps/server/src/voice-avatar-routes.ts`; create/inspect/close session, no Vapi route regression.
**PS13.15 Web:** `apps/web/src/features/voice/AvatarSession.tsx`, `useAvatarSession.ts`, `VoiceControls.tsx`; embed in existing chat after UI inventory.
**PS13.16 Telemetry:** `engine/voice/metrics.ts`; E2E audio latency, session setup, interruptions, costs.
**PS13.17 Channel abstraction:** `engine/voice/channel-port.ts`; future Zoom/Meet/Discord/WhatsApp bridges **not implemented in C13**.
**PS13.18 Tests/shadow:** sandbox, contract, security, media e2e, mobile network, fault injection, Codex review.

**REUTILIZAR:** AG-UI text streaming, C10 context, C11 inference, C12 presentation, tenant auth, Vapi telephone routes as separate channel, ElevenLabs health probe as diagnostics. **SUSTITUIR:** voz basada en chat monolítico, escaneo cuotas, fallback Slow, ausencia de barge-in. **LEGACY TEMPORAL:** Vapi telefonía permanece sin forzar migración.

## 9. Waves W0–W11 y gates
**W0 Provider discovery:** API/SDK Anam actual, contratos custom LLM/audio passthrough, autenticación, media region, DPA, precio y límites. Gate: evidencia oficial; si falla, `BLOCKED_EXTERNAL_PROVIDER`.
**W1 Baseline:** freeze HEAD, voz/chat paths, RTT/TTFT reales, frontend hooks, infra. Gate: mapa y medidas reproducibles.
**W2 Contratos:** strict schemas, tenant, consent, epoch, receipts. Gate: no cross-tenant.
**W3 Broker:** token efímero y sesión media, reconnect/expiry. Gate: no API key expuesta.
**W4 Custom LLM:** Fast-only C11, C10 prewarm, C12 text. Gate: no Slow blocking.
**W5 TTS:** elegir nativo vs externo por pruebas reales, audio streaming y lip sync. Gate: no stutter crítico.
**W6 Barge-in:** mic/VAD→cancel→epoch, flush audio y nueva utterance. Gate: audio obsoleto nunca se reproduce.
**W7 Frontend:** avatar, mute, end, permissions, fallback text, mobile and accessibility. Gate: UX segura.
**W8 Privacy/cost:** consent, retention, PII, quotas, reconciling, audit. Gate: policy legal y técnica.
**W9 Faults:** network loss, reconnect, STT revisions, stale audio, provider outage, cancel. Gate: recovery and no duplicate effects.
**W10 Canary:** aprobación founder, limited tenant, p95/quality/cost and rollback. Gate: GO/NO-GO.
**W11 Certification:** pnpm typecheck/test/gate, browser/media e2e, Codex independent review, handoff C14.

## 10. Tests adversariales propuestos
| Test | Aceptación |
|---|---|
| `voice-session-auth.test.ts` | tenant/actor/role/session validated |
| `voice-session-token.test.ts` | ephemeral token, no API key in browser |
| `voice-provider-contract.test.ts` | actual SDK/sandbox, no fake integration |
| `voice-stt-revision.test.ts` | partial transcripts don't execute tools |
| `voice-turn-idempotency.test.ts` | repeated final STT creates one turn |
| `voice-barge-in.test.ts` | old epoch audio discarded |
| `voice-fast-only.test.ts` | no Slow fallback in speech |
| `voice-context-policy.test.ts` | private memory and tenant isolation |
| `voice-presentation-sync.test.ts` | transcript and spoken output consistent |
| `voice-consent.test.ts` | recording/transcript policy enforced |
| `voice-cost-budget.test.ts` | concurrent sessions cannot overspend |
| `voice-reconnect.test.ts` | media reconnect without duplicate tasks |
| `voice-disconnect.test.ts` | end session cleans resources |
| `voice-provider-outage.test.ts` | safe text fallback and clear status |
| `voice-prompt-injection.test.ts` | oral instructions cannot bypass approvals |
| `voice-revocation.test.ts` | revoked transcript no longer served |
| `voice-latency-mobile.test.ts` | measured p50/p95/p99, not assumed |
| `voice-avatar-a11y.test.tsx` | captions, keyboard, mute, reduced motion |
| `voice-vapi-regression.test.ts` | existing phone endpoints preserved |

## 11. P0, rollback y handoff
**P0:** fake Anam SDK; leaked API keys; cross-tenant media; recording without lawful basis; STT partial causing action; voice as authorization; barge-in fails to cancel playback; Slow blocking Fast; TTS/LLM content mismatch; unbounded minutes; stale session reuse; reconnect duplicates tasks; irreversible audio logs; provider lock-in; Vapi regression; no mobile testing.

**Rollback:** `voiceAvatarV2.enabled` flag **propuesto** off, close provider sessions, revoke ephemeral credentials, cancel pending audio and return to text chat. Vapi remains independent; preserve consent/cost/audit receipts under retention policy. Never auto-fallback to unapproved external providers. No merge/deploy without founder approval.

**Reports:** per wave `REPORT-Wx.md` with source commit, paths, diffs, commands+exit codes, API verification, session traces (no raw PII), TTFT/audio p50/p95/p99, consent/security checks, cost, Codex review, GO/NO-GO, rollback. Artifacts `ANAM-PROVIDER-VERIFICATION.md`, `VOICE-CALLGRAPH.md`, `LATENCY-BASELINE.md`, `BARGE-IN-TRACE.jsonl`, `CONSENT-RETENTION-MATRIX.md`, `HANDOFF-C14.md`.

```yaml
campaign: C13
turn: 14/16
repo: uniscrolliabrain-cloud/agente
branch: audit/preflight-cognition-option3-20261115
source_ref: main
source_commit_sha: NOT_VERIFIED
status: STATIC_AUDIT_AND_PLAN
findings: 26
patchsets: 19
waves: 12
runtime_modified: false
tests_executed: false
merge: false
deploy: false
next: C14_cybersecurity_bridge
```
