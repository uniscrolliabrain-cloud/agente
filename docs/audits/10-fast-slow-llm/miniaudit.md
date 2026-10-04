# 10 — Fast / slow LLM

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump kernel/config/*, conversation.ts, model.ts

## Ontología del área

Conceptos: `TenantConfig`, `ProviderSpec`, `fast`, `slow`, `embeddings`,
`EnvTenantConfigResolver`, `modelChain`, `runWithModelFallback`.

## Estado real del código

- `EnvTenantConfigResolver` lee `FAST_LLM_*` y `SLOW_LLM_*` con defaults
  a Gemini.
- `TenantConfig` con `fast`, `slow`, `embeddings` como `ProviderSpec`.
- `conversation.ts` ya usa el fast si está configurado
  (`FIX_CHAIN_FALLBACK_V1`, fix de este pase).
- `modelChain(config)` con fallback global.

## Evidencia

- `model.ts` **no usa el slow**. `executeModelTask` usa `modelChain(config)`,
  no `TenantConfig.slow`. El fast se aplica en `conversation.ts`, el slow
  se ignora.
- `recordUsage` guarda `source: "chat" | "task" | "sop"` pero **no velocidad**.
- No hay fallback cruzado: si el fast falla, no se pasa al slow.

## Huecos concretos

- `model.ts` no usa el slow.
- Cuotas separadas por velocidad.
- Fallback cruzado `fast → slow → global chain`.
- Elección por complejidad: `shouldDelegateToSlow` es regex.

## Interrelación

Transversal a chat y tareas. Los embeddings usan un tercer modelo.

## Riesgos

- Fast y slow comparten cuota de Google.
- Una task tarda 5 min en el slow y el usuario piensa que está roto.
- El fallback oculta fallos reales.

## Tipo de fixes

1. `executeModelTask` que consulte `KernelContext` y use `TenantConfig.slow`.
2. `recordUsage` con campo `speed: "fast" | "slow"`.
3. Fallback explícito: `fast → slow → global chain → error`.
4. Test que verifica que una task usa el slow.
5. Métrica `openmuse_llm_calls_total{speed,provider,model,status}`.
