> **ACTUALIZACIÓN · 2026-11-18 — COMPATIBILIDAD DE RAMAS**  
> El diseño V2 continúa siendo una propuesta. La rama `feat/voice-avatar-scaffold` contiene implementación de rutas, sesiones, proveedores, snapshot, harness y componentes React; en `apps/server/src/voice/routes.ts` puede inyectarse el servicio existente que reutiliza `ConversationAgent`. No considerar esta rama equivalente a FastConversationV2 ni fusionarla sin M0 (medición), pruebas de aislamiento, barge-in y compatibilidad con IntentBridge. Las estimaciones de latencia previas no son medidas del HEAD actual.  

> **ACTUALIZACIÓN PRIORITARIA 2026-11-15:** este documento fue un diseño parcial de migración y NO recoge por sí solo la arquitectura cognitiva continua acordada. Leer primero [MASTER cognitivo-conversacional](./00-ARQUITECTURA-COGNITIVA-CONVERSACIONAL-MASTER.md), [tarjetas RAC/RAG](./01-TARJETAS-RAC-RAG-ATENCION-MEMORIA.md), [UX SVG y caminos](./02-UX-SVG-Y-CAMINOS-DE-ACCION.md) y [dos motores API y migración](./03-DOS-APIS-FAST-SLOW-HARNESS-Y-MIGRACION.md). El Fast no inicia toda la cognición: consume tarjetas preparadas desde kernel/grafo/bus/memorias/atención/Slow/Presenter. Las cinco fases SVG pueden ser pedagógicas, no equivalentes a pasos reales. **No tratar el diagrama de este documento como topología completa.**

# Rediseño V2 — Fast Conversational Harness y comunicación humana

> Decisión arquitectónica 2026-11-15. **Propuesta de migración, no implementación.** La ruta actual se conservará como legacy hasta que V2 supere gates funcionales y de latencia. Evidencia: `docs/08-auditorias/latencia-anam-2026-11-11.md` (auditó un SHA anterior; revalidar en HEAD).

## 1. Problema verificado y límites de evidencia

El informe previo rastrea `POST /api/copilotkit/run` → `apps/server/src/engine/conversation.ts`: abrir turno, auditar, consultar vistas, RAG/embeddings, contexto, tarjetas, configuración y escanear cuota antes de `runWithModelFallback`. Estima 8–12 viajes en caliente y 15–25 en frío antes del primer token. **No son mediciones actuales**. Fast LLM no elimina este preprocesamiento. Hay SSE de texto, pero el informe no encontró integración Anam/ElevenLabs, VAD, STT o audio WebRTC en ese SHA. El fast path actual debe tratarse como candidato legacy, no como base incuestionable de voz.

## 2. Invariantes del fundador

- Laia y los agentes (incluido finanzas) **solo conversan, acompañan, explican y transmiten solicitudes/resultados**; no necesitan conocer workers, SOPs o detalles del kernel.
- Fast API = conversación en texto/voz, mínima latencia, personalidad y memoria. Slow API = razonamiento de tareas para runtime; no participa en turnos conversacionales normales.
- El harness es **propio** y único para chat y Anam; Anam es adaptador audiovisual, no dueño de identidad, memoria ni decisión. Su LLM turnkey se puede comparar en un benchmark sin hacerlo fuente de verdad.
- El kernel autoriza, el runtime ejecuta; ningún texto generado confirma una acción no corroborada.
- Voz y tareas tienen ciclos de vida separados: barge-in cancela el stream de voz, **no** un trabajo aceptado.

## 3. Arquitectura propuesta

```text
Chat Web ───────────────┐
                       ├─ Channel Adapter ─ SessionGateway ─ FastConversationV2
Anam (voz/avatar) ─────┘                     │                │
                                            │                ├─ precached AgentCard (~1000 tokens máx)
                                            │                ├─ ring buffer de diálogo
                                            │                └─ streaming tokens → texto/audio
                                            │
                                            └─ IntentBridge (no bloquea primer audio)
                                                    │
                                        Kernel / Policy / Approvals
                                                    │
                                        Slow LLM (solo si hace falta)
                                                    │
                                        Runtime / SOP / Workers / repos
                                                    │
                                        Event → ProgressProjector
                                                    │
                                     PresenterCards → conversación/UI
```

## 4. Camino crítico V2 (hot path)

1. Autenticar y resolver sesión **antes** de abrir el turno de audio; no confiar en identidad declarada por cliente.
2. Cargar `AgentCard`, `SessionSnapshot`, políticas de comunicación y memoria resumida de caché local/redis de baja latencia, **sin consultar RAG ni embeddings en el turno**.
3. Aceptar input texto o transcripción incremental; emitir stream del fast LLM tan pronto como el canal y el modelo permitan.
4. Persistir transcript, auditoría y uso mediante cola durable/asíncrona, con estrategia explícita de fallo; no perder trazabilidad ni aceptar efectos si la persistencia obligatoria falla.
5. Clasificar intención con lógica ligera/fast model y enviar `IntentEnvelope` al bridge, separado del stream de voz; ACK de encolado distinto de ACK de ejecución.
6. Actualizar tarjetas por eventos versionados, no recalcular contexto global por turno.

### Fuera del camino crítico

RAG profundo, embeddings, `systemContext` completo, escaneo de cuotas, rehidratación del kernel, discovery de capabilities, plan de slow LLM, SOPs y efectos. La cuota debe tener contador atómico/precargado y una reserva rápida, no una consulta histórica sin límite. Mantener backpressure y límites de seguridad.

## 5. Contratos tipados propuestos

```ts
// Contratos de diseño, NO implementados
interface AgentCardV1 {
  agentId: string; tenantId: string; version: string;
  identity: string; tone: string; userRelationship?: string;
  allowedConversationTopics: string[];
  currentBusinessSummary?: string;
  communicationRules: string[];
  memorySummaryRef?: string;
}
interface IntentEnvelopeV1 {
  intentId: string; tenantId: string; actorId: string;
  agentId: string; sessionId: string; turnId: string;
  utterance: string; locale: string; correlationId: string;
  idempotencyKey: string;
}
interface UserFacingProgressV1 {
  taskId: string; correlationId: string;
  phase: 'received'|'queued'|'analyzing'|'awaiting_approval'|'executing'|'verifying'|'completed'|'failed';
  verifiedStatus: 'pending'|'confirmed'|'failed';
  label: string; sourceEventId?: string;
  occurredAt: string;
}
```

Los schemas definitivos deben vivir en `packages/domain` y validar tenant/actor/mandato en servidor. `utterance` es dato no confiable; nunca autorización.

## 6. Experiencia de usuario: estados y animación SVG

### Estados de conversación (locales, no ejecución)
- `idle`: avatar en reposo, sin animación de tarea.
- `listening`: onda o puntos de escucha, VAD/transcripción si disponible.
- `thinking`: espiral compacta de puntos claros, animada con SVG/CSS; indica **respuesta conversacional en preparación**, no trabajo de runtime.
- `speaking`: pulso suave ligado a salida de voz, cuando exista señal real.
- `interrupted`: transición inmediata tras barge-in, sin cancelar taskId.

### Fases comprensibles para el usuario (trabajo real)

Mostrar, por ejemplo: «Recibido», «Preparando la revisión», «Esperando tu aprobación», «Realizando comprobaciones», «Verificando resultados», «Terminado». **Las etiquetas son abstracciones humanas de estados reales**. No inventar eventos, herramientas, porcentajes ni duraciones. Si solo se conoce que está en cola: «He recibido la solicitud», nunca «Ya estoy auditando». Una frase puente conversacional («Lo revisamos») puede ser natural si no implica una confirmación falsa.

Diseñar componente SVG inline liviano, escalable 16–32 px, fondo transparente/blanco según tema, colores claros y `prefers-reduced-motion` para accesibilidad; evitar GIF pesado. Reusar la espiral de puntos preferida como referencia visual, no depender de assets externos. UI en `apps/web` debe mostrar fase real mediante `ProgressProjector` y no inferirla del texto del LLM.

## 7. Latencia: objetivos iniciales a medir, no promesas

- TTFB fast LLM p50 objetivo < 200 ms tras disponer del prompt, según proveedor y región.
- Preparación de contexto en caliente p50 objetivo < 30 ms; p95 < 80 ms, medido sin red de audio.
- Primer audio tras fin de habla: objetivo aspiracional p50 < 800 ms; p95 < 1500 ms. Depende de VAD/STT, modelo, Anam/TTS, WebRTC y geografía.
- Instrumentar `speech_end`, `transcript_ready`, `context_ready`, `llm_request`, `first_token`, `first_audio`, `avatar_playback`, `interrupt` con traceId y sin almacenar contenido sensible en spans.
- Medir por separado cold start de Anam y latencia por turno de sesión caliente.

## 8. Migración segura: legacy → V2

**M0 Inventario:** auditar endpoints y consumidores del chat actual; capturar baseline con trazas y fixtures; enumerar features y tools que no se deben perder.

**M1 Strangler:** implementar `FastConversationV2` junto a `ConversationAgent` sin reemplazarlo. Flag `conversation_engine=v1|v2` por tenant/sesión, rollback inmediato; versionar rutas.

**M2 Fast path:** precalcular AgentCard, caché de sesión, streaming y persistencia asíncrona segura; medir primer token y primer audio.

**M3 IntentBridge:** pasar solicitudes al kernel y recibir ACK; mantener auditoría y aprobación. El fast no tiene herramientas de efectos directos.

**M4 Presenter:** proyección de eventos a fases y mensajes humanos verificables; reconexión con cursor/snapshot, permisos por actor.

**M5 Anam:** adaptador de custom LLM/streaming, manejo de interrupción y sesión caliente; chat y voz comparten harness. Confirmar las interfaces SDK reales en la versión elegida antes de escribir el adaptador.

**M6 Canary:** 1 tenant interno → 2 tenants dogfood → más usuarios. Comparar p50/p95, error, tasa de cancelación, fidelidad de memoria, exactitud de estados, costes y satisfacción.

**M7 Deprecación:** solo después de paridad funcional, rollback probado y aprobación humana, marcar v1 legacy y retirar rutas gradualmente. No borrar `conversation.ts` por anticipado.

## 9. Smoke/E2E obligatorios

1. Primer turno caliente sin llamadas de embeddings ni full-scan de cuotas.
2. Primer token streaming antes de completar el razonamiento slow.
3. Chat → voz → chat conserva identidad y conversación.
4. Barge-in corta el audio, no la tarea aprobada.
5. `queued` no se anuncia como `executing`.
6. Eventos duplicados/reordenados no producen fases regresivas.
7. Cliente A no recibe estados ni memoria de B.
8. Desconexión Anam recupera conversación y notificaciones autorizadas.
9. Slow LLM caído: conversación normal sigue disponible; tareas informan estado real.
10. Fallo de persistencia crítica: fail-closed para intenciones con efectos; conversación puede informar del error sin fingir aceptación.
11. Reduced motion desactiva animación sin ocultar estado textual.
12. Fallback v2→v1 bajo flag mantiene servicio, sin duplicar intenciones.

## 10. Dependencias y handoff

Vincular ángulos 04, 05, 07, 08, 09, 19, 22, 27, 28 y 29. Empezar con M0 y M1 **antes de implementar Anam**. Documentar por campaña archivos modificados, contratos, pruebas, latencias medidas y rollback.

**Estado:** diseño documentado; no se han implementado componentes, ejecutado tests ni validado la API actual de Anam.
