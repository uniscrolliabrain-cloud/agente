# 10 — Fast / slow LLM

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump kernel/config/*, conversation.ts, model.ts, model-chain.ts, código real

## Ontología

TenantConfig, ProviderSpec, fast, slow, embeddings, EnvTenantConfigResolver, modelChain, runWithModelFallback, KernelContext.

## Estado real

EnvTenantConfigResolver lee FAST_LLM_* y SLOW_LLM_*. TenantConfig con fast, slow, embeddings. conversation.ts usa el fast (fix de este pase). modelChain con fallback global.

## Evidencia

model.ts no usa el slow. executeModelTask usa modelChain(config), no TenantConfig.slow. recordUsage guarda source pero no velocidad. Sin fallback cruzado.

## Huecos declarados

- model.ts no usa el slow.
- Cuotas por velocidad.
- Fallback cruzado.
- Elección por complejidad (hoy regex).

## Huecos profundos (auditoría extendida)

1. **`modelChain(config)` ignora el tenant config**: lee solo `config.model` global. El tenant no puede tener su propio modelo.
2. **`TenantConfig.fast` y `.slow` sin validación al arrancar**: si la apiKey está vacía, el error aparece en el primer mensaje, no al arrancar.
3. **`EnvTenantConfigResolver` lee envs cada vez**: no cachea. Con 100 turns/min, 100 lecturas de process.env.
4. **Sin caché de TenantConfig por tenant**: cada llamada a `kernel.config(ctx)` recalcula el objeto completo.
5. **Sin fallback fast → slow**: si el fast falla, salta al global, no al slow del tenant.
6. **Sin fallback slow → global**: si el slow falla, salta al global, no al fast del tenant.
7. **Sin medición de latencia por velocidad**: `recordUsage` no distingue fast vs slow. Métricas agregadas sin sentido.
8. **Sin cuotas por velocidad**: un tenant con cuota agotada en fast puede seguir usando slow.
9. **`shouldDelegateToSlow` con regex**: `/(analiza|investiga|prepara|resume|planifica|revisa|compara|estudia|calcula)/i`. Se olvida de idiomas y de contexto.
10. **Sin "cambio dinámico de modelo"**: no se puede empezar en fast y pasar a slow a mitad del turno si el fast no puede resolverlo.
11. **`provider-spec.ts` valida pero el resolver no parsea**: `providerEnv` cae a `"google"` silenciosamente si el valor es raro.
12. **Sin `baseUrl` por tenant**: `providerSpecSchema` lo soporta pero el resolver no lo lee del env.
13. **Sin "modelo por rol"**: un rol podría preferir un modelo distinto (ej. legal usa uno más caro). No implementado.
14. **`fastIdleMs` no se usa en conversation.ts**: `TenantConfig.fastIdleMs` declarado pero el chat no lo consulta.
15. **`quiescenceMs` no se usa en closeTurn**: `TenantConfig.quiescenceMs` declarado pero el kernel no lo aplica al cerrar turnos.
16. **`slowLongMs` no se usa en Meta**: `TenantConfig.slowLongMs` declarado pero Meta usa `longNoOutputMs` hardcodeado.
17. **`maxThoughtsPerTurn` no se usa en StoreTurnStore**: `TenantConfig.maxThoughtsPerTurn` declarado pero el store usa `MAX_THOUGHTS_PER_TURN` constante.
18. **Sin "modo degradado"**: si ambos modelos fallan, el chat devuelve un error técnico, no un mensaje humano.
19. **Sin test de que un tenant con config propia funciona**: no hay test que verifique que el fast del tenant se usa.
20. **`embeddings` en TenantConfig sin usar**: `TenantConfig.embeddings` declarado pero `RagService` usa `process.env.GEMINI_API_KEY` directo.

## Interrelación

Transversal a chat y tareas. Los embeddings usan un tercer modelo.

## Riesgos

Fast y slow comparten cuota. Task tarda 5 min en el slow. Fallback oculta fallos reales.

## Tipo de fixes

executeModelTask con KernelContext y TenantConfig.slow. recordUsage con speed. Fallback fast → slow → global. Cache de TenantConfig. Modelo por rol. Wire de los tiempos (fastIdleMs, quiescenceMs, slowLongMs, maxThoughtsPerTurn).
