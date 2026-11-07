# A09 · Voz y economía

**Carril:** C9 · **Rama:** `sprint/r01-a09-voz-economia` · **Superficie:** `sprints/r01/a09-voz-economia/`, `apps/server/src/voice-routes.ts`

## Estado medido sobre `0c8fe81`

`apps/server/src/voice-routes.ts` (209 líneas) expone:

- `GET /status` — estado local, no llama a Vapi, se puede sondear sin coste.
- `GET /calls` — historial.
- `POST /calls` — marca, con `Idempotency-Key` por hash: reintentar devuelve la llamada creada en vez de marcar dos veces.
- `GET /calls/:id` — detalle.
- Scope por `currentTenantScope()` con fallback a membership única, igual que leads.

## Los huecos

1. **No hay coste por llamada ni duración**: `costUsd` aparece en el motor (`engine/model.ts`, `engine/service.ts`) para LLM, pero el registro de llamada de voz no guarda tokens, segundos ni precio. Sin eso, la frase "horas ahorradas" y el margen del pricing de 490 EUR no se pueden calcular.
2. **No hay p95**: `metrics-exporter.ts` existe, pero no hay ninguna ruta que publique latencia de acción o de llamada.
3. **La idempotencia está probada en outbound y no aquí**: no hay test que reintente `POST /calls` y compruebe una sola llamada.
4. **Nada impide que una llamada agende dos citas**: el flujo llamada → cita no tiene el equivalente al ledger de WhatsApp.

## Preguntas

1. ¿Qué campos guarda `callSchema` y cuál de ellos serviría para atribuir coste?
2. ¿`VOICE_OUTBOUND_ENABLED` es un flag de producto o una condición de seguridad? ¿Qué pasa si está a `false` y alguien llama a `POST /calls`?
3. ¿Existe algún camino que cree una cita desde una llamada? Con qué idempotencia.
4. ¿Qué métricas publica hoy `metrics-exporter.ts` y quién las lee?

## Entregable del sprint

`sprints/r01/a09-voz-economia/idempotencia.test.ts`: dos `POST /calls` con la misma `Idempotency-Key` → **1** llamada al cliente de Vapi y el mismo `id`. Y `COSTE.md` con la fórmula propuesta para coste por llamada y por conversación, con las variables que hoy existen.

## Gate

```bash
node --import tsx --test --test-timeout=30000 sprints/r01/a09-voz-economia/*.test.ts
node --import tsx tests/worker-metrics.test.ts
```

## Trampa

Inventar el precio por minuto de Vapi en el documento. Si no está en config ni en una tarifa declarada, se escribe `PENDIENTE DE TARIFA` y se calcula solo la parte de duración.
