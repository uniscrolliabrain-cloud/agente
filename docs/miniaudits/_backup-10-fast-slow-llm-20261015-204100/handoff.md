# Handoff — 10 fast / slow LLM

## Estado actual

- **Auditoría:** miniaudit.md (estatus: audited-deep)
- **Roadmap:** roadmap.md (estatus: planned)
- **Fixes:** fixes.md (estatus: placeholder, 50 fixes pendientes)

## Problema

El kernel de LLM soporta dos velocidades: `fast` y `slow`. El propósito es usar `fast` para respuestas cortas y `slow` para tareas complejas, con cuotas separadas. Sin embargo, **el código actual no implementa el fallback ni las cuotas por velocidad**:

- `modelChain(config)` solo lee `config.model` global.
- `TenantConfig.fast` y `.slow` no tienen fallback entre ellas.
- `recordUsage` guarda `source` pero no la velocidad (`speed`).
- No hay cuotas por velocidad.
- `EnvTenantConfigResolver` lee `process.env` en cada llamada sin cachear.

## Archivos relevantes

| Archivo | Rol |
|---|---|
| `apps/server/src/kernel/model.ts` | `modelChain()` ignora `TenantConfig.slow`. Es el centro del fix. |
| `apps/server/src/kernel/config.ts` | `TenantConfig` con `fast`, `slow`, `embeddings`. |
| `apps/server/src/kernel/model-chain.ts` | Implementación del fallback. Debe mutar para soportar fast → slow → global. |
| `apps/server/src/conversation.ts` | Usa el fast. Debe consultar `fastIdleMs` y aplicar `quiescenceMs`. |
| `apps/server/src/kernel/recordUsage.ts` | `recordUsage()` guarda `source` pero no `speed`. Falta el campo `speed`. |
| `apps/server/src/kernel/EnvTenantConfigResolver.ts` | Resuelve `FAST_LLM_*` y `SLOW_LLM_*`. Sin cacheo. |
| `apps/server/src/kernel/provider-spec.ts` | `providerSpecSchema` soporta `baseUrl` y `env`, pero `EnvTenantConfigResolver` no los parseda. |

## Fixes pendientes (checklist)

1. **Fallback fast → slow → global**
   - En `model-chain.ts`, `modelChain(config)` debe intentar `config.fast` primero, luego `config.slow`, finalmente `config.model`.
   - Cada intento debe capturar errores y continuar con la siguiente opción.

2. **Validación de claves de API al arrancar**
   - En `TenantConfig` o `EnvTenantConfigResolver`, validar que `apiKey` no esté vacía para el modelo seleccionado.
   - Error con mensaje claro: `"FAST_LLM_API_KEY no configurada"` (no fallos en el primer mensaje).

3. **Cache de TenantConfig por tenant**
   - En `kernel.config(ctx)`, memorizar el `TenantConfig` resuelto por tenant.
   - Invalidar si cambia el entorno.

4. **Campo `speed` en `recordUsage`**
   - Agregar `speed?: "fast" | "slow"` a `RecordUsageData`.
   - Usar en `conversation.ts` y `engine.ts`.

5. **Cuotas por velocidad**
   - Agregar `fastQuota` y `slowQuota` en `TenantConfig`.
   - Probar consumo en `recordUsage` y decrementar.

6. **Modelo por rol**
   - `TenantConfig.roles: Record<string, ModelSpec>`.
   - `modelChain()` consulta el rol del usuario si existe.

7. **Base URL por tenant**
   - `providerSpecSchema` soporta `baseUrl`. `EnvTenantConfigResolver` debe leer `FAST_LLM_BASE_URL` y `SLOW_LLM_BASE_URL`.

8. **Render de tiempo en chat**
   - `fastIdleMs` aplicado en `conversation.ts` (time to first token).
   - `quiescenceMs` en `closeTurn()`.

9. **Modo degradado**
   - Si fast y slow fallan, devolver mensaje humano, no error técnico.
   - `ConversationAgent` debe tener un `fallbackError` visible para el usuario.

10. **Tests**
   - Test que un tenant con `TenantConfig.slow` usa slow en `modelChain()`.
   - Test de fallback: fast falla, slow intenta, global como último recurso.
   - Test de cuota: agotar fast no accede a slow.
   - Test de `recordUsage` con `speed` correcto.

## Cómo verificar el cierre

- `pnpm test` pasa tests de `model-chain.ts`, `record-usage.ts` y `config.ts`.
- `recordUsage` tiene `speed: "fast" | "slow"` y se incrementa correctamente.
- `TenantConfig.load()` valida claves en `FAST_LLM_API_KEY` y `SLOW_LLM_API_KEY`.
- `modelChain(tenantConfig)` usa `TenantConfig.slow` cuando `config.fast` falla.

## Dependencias

- **Depende de:** 09 (kernel cognitivo), 08 (bus de eventos)
- **Dependen de esta:** 11 (chat con LLM), 24 (business OS goals)
- **Archivos compartidos:** `conversation.ts`, `model.ts`, `kernel/config/*`

## Notas del audit

- Fast y slow comparten cuota. Task tarda 5 min en el slow.
- Fallback oculta fallos reales si no hay tests.
- Sin `baseUrl` por tenant, el env puede ser diferente por modelo.