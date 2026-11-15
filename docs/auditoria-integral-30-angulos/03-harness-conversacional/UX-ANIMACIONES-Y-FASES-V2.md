# UX V2 — Animaciones, fases pedagógicas y estados reales

> Decisión del fundador · 2026-11-15 · Estado: especificación inicial, no código implementado. Documento complementario a [REDISENO-V2-FAST-CHAT-VOICE.md](./REDISENO-V2-FAST-CHAT-VOICE.md).

## Principio de producto

Los agentes (Laia y demás) son la interfaz humana del sistema. Cuando el usuario envía un mensaje o habla, la interfaz puede mostrar **cinco fases ilustrativas** del trabajo interno, en lenguaje comprensible y con opacidad animada. **No se exige que cada fase corresponda a un evento técnico real ni que se ejecute en ese instante**: es una representación pedagógica del proceso general. Sí es obligatorio no afirmar que una acción real se ha iniciado o completado sin confirmación del runtime.

Separar dos capas visuales:

1. **Indicador conversacional/narrativo** (client-side): aparece inmediatamente, reproduce frases educativas y una espiral de puntos SVG. No representa estados técnicos exactos, no requiere backend, y se cancela tan pronto como Laia empieza a responder.
2. **Progreso operativo verificado** (event-driven): recibido, en cola, ejecutando, esperando aprobación, verificando, completado, error. Se alimenta de eventos reales y conserva correlación con taskId/tenant/actor. No inventar porcentajes, acciones, éxitos ni tiempos.

## Secuencia pedagógica de cinco fases (copy inicial)

1. «Comprendiendo tu solicitud».
2. «Identificando qué necesitas».
3. «Preparando el trabajo».
4. «Coordinando la operación».
5. «Organizando la respuesta».

Estas frases explican de forma simplificada el sistema; **no son un historial factual**. En la UI se pueden identificar como «Así trabaja Laia» o «Preparando respuesta» para no sugerir auditoría técnica. El copy definitivo debe adaptarse a conversación cotidiana, voz, consultas simples y tareas empresariales; no mostrar «coordinando operación» cuando el usuario solo saluda si resulta artificial. La fase ilustrativa nunca marca tareas como completadas.

## Tiempos UX iniciales: hipótesis de diseño, no estándar normativo

- Primera señal visual: inmediata al aceptar la entrada en la interfaz.
- Cambio de frase/fase: **~800 ms** de referencia, rango experimental **600–1.000 ms**.
- Fundido de opacidad entre frases: **~200 ms**, rango **150–250 ms**.
- Giro de espiral SVG: **~1,5 s**, rango **1,2–1,8 s** por vuelta.
- **No imponer dos segundos por fase**: fue una cifra improvisada durante la conversación, no una decisión ni un estándar.
- **No imponer diez segundos para recorrer cinco pasos**: la animación no retrasa el primer token ni el primer audio. Si Laia responde antes de la segunda fase, se corta inmediatamente; si tarda más, las fases pueden continuar o ciclar con moderación.
- No mostrar una secuencia de cinco fases en un turno tan rápido que apenas haya tiempo de verla. El indicador puede ser solo la espiral o una frase.

No existe un estándar universal que obligue a estos números. Validarlos con prototipos, p50/p95 de latencia real y pruebas con usuarios. Evitar que las fases generen la sensación de latencia artificial.

## SVG propuesto

- **Espiral compacta de puntos claros**, estética de interfaces IA modernas, similar a la primera referencia visual aprobada por el fundador; no oscurecerla ni abrir demasiado la espiral.
- SVG inline (no GIF pesado), escalable 16–32 px, fondo transparente y aspecto compatible con fondo blanco.
- Animación CSS de rotación continua; opacidad suave; sin librerías de animación obligatorias.
- Variantes: listening, thinking, speaking, interrupted, idle. Diferenciar estados locales de fases operativas.
- `prefers-reduced-motion: reduce`: sustituir por indicador estático y mantener texto accesible.
- `aria-live` con moderación: no anunciar cada frase decorativa a lectores de pantalla; sí cambios de estado operativos importantes.
- Barge-in: detener visualización/voz conversacional inmediatamente, **sin cancelar** una tarea empresarial ya aceptada.

## Máquina de estados de UI (propuesta)

```text
input_accepted
  └── conversational_waiting ──> fast_stream_started ──> speaking/rendering ──> idle
         │                              │
         └── illustrative_phase_cycle   └── stop illustrative cycle immediately

intent_accepted (event confirmed)
  └── queued ──> executing ──> verifying ──> completed
           └── awaiting_approval / failed / cancelled (según evento real)
```

No derivar el estado operativo de la frase actual de la animación. Si no llega confirmación de encolado, mostrar «Preparando respuesta» o error, **no** «Ya está en marcha». La animación puede ser narrativa sin fingir resultados.

## Contrato de componente sugerido

```ts
// Boceto, no implementado
interface ConversationalActivityProps {
  channel: 'chat' | 'voice';
  localState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted';
  illustrativePhases?: string[];
  phaseIntervalMs?: number; // default propuesto: 800
  fadeDurationMs?: number; // default propuesto: 200
  spiralPeriodMs?: number; // default propuesto: 1500
  reducedMotion?: boolean;
}
interface OperationalProgressProps {
  taskId: string;
  phase: 'received'|'queued'|'analyzing'|'awaiting_approval'|'executing'|'verifying'|'completed'|'failed';
  eventId: string;
  verified: true;
}
```

## Criterios de aceptación

1. La animación comienza sin esperar DB, RAG ni slow LLM.
2. La salida fast interrumpe el ciclo ilustrativo, sin mínimo de duración.
3. Cinco frases opcionales no implican cinco operaciones reales.
4. No se comunica ejecución, aprobación ni resultado sin evento autorizado.
5. Accesibilidad: reduce motion, contraste y texto alternativo; sin spam de lector de pantalla.
6. Funciona en chat escrito y en canal Anam, con adaptación a escucha/habla.
7. No provoca renders o trabajo JS que degrade streaming ni WebRTC.
8. Se pueden probar timings A/B sin alterar el runtime ni el harness.
9. Al desconectar/reconectar el canal no aparecen fases operativas falsas.
10. Las métricas distinguen tiempo de animación y tiempo real hasta primer token/audio.

## Próxima ampliación

Diseñar variantes visuales reales en `apps/web`, confirmar ubicación exacta tras auditar componentes existentes, implementar Storybook/preview si hay infraestructura, probar en móvil, medir rendimiento y documentar feedback. **Ningún archivo de UI se ha modificado en esta fase.**
