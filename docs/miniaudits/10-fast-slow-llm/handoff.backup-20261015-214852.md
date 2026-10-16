# 10 — Fast / slow LLM

> Consolidado · 2026-10-04 · Estado: audited-deep
> Origen: miniaudit.md + roadmap.md + handoff.md
> `fixes.md` omitido por ser placeholder vacío (50 fixes se documentarán al atacar la rama).

## Objetivo

Dos velocidades de LLM con cuotas separadas. El **fast** habla, el **slow**
trabaja. Las tareas durables usan el slow real. El fallback entre modelos
es explícito: **fast → slow → global**.

## Estado del módulo

- **Auditoría:** `audited-deep` — 20 huecos profundos identificados.
- **Roadmap:** `planned` — objetivo definido, sin fases.
- **Fixes:** `placeholder` — pendiente de concretar 50 fixes.
- **Handoff:** checklist de 10 fixes priorizados.

## Qué NO entra en este módulo

- No LLM local (fuera de alcance por decisión de arquitectura).
- No reescritura del kernel cognitivo (módulo 09).
- No cuotas por tenant a nivel de facturación (módulo 24).

## Cómo se verifica el cierre

- `pnpm test` pasa los tests de `model-chain.ts`, `record-usage.ts` y
  `config.ts`.
- `recordUsage` tiene `speed: "fast" | "slow"` y se incrementa
  correctamente.
- `TenantConfig.load()` valida claves en `FAST_LLM_API_KEY` y
  `SLOW_LLM_API_KEY`.
- `modelChain(tenantConfig)` usa `TenantConfig.slow` cuando `config.fast`
  falla.
- Test que verifica que una **task** usa slow.
- Test de fallback fast → slow → global con mock.
- Test de cuota: agotar fast no accede a slow.

---

## Índice

1. Ontología
2. Estado real
3. Evidencia
4. Huecos declarados
5. Huecos profundos (20)
6. Interrelación
7. Riesgos
8. Tipo de fixes
9. Fronteras y conexiones
10. Ficheros relevantes
11. Checklist de fixes
12. Cómo verificar el cierre
13. Notas del audit

---

## 1. Ontología

`TenantConfig`, `ProviderSpec`, `fast`, `slow`, `embeddings`,
`EnvTenantConfigResolver`, `modelChain`, `runWithModelFallback`,
`KernelContext`.

---

## 2. Estado real

- `EnvTenantConfigResolver` lee `FAST_LLM_*` y `SLOW_LLM_*`.
- `TenantConfig` tiene `fast`, `slow`, `embeddings`.
- `conversation.ts` usa el fast (fix del pase anterior).
- `modelChain` tiene fallback global.

---

## 3. Evidencia

- `model.ts` no usa el slow.
- `executeModelTask` usa `modelChain(config)`, no `TenantConfig.slow`.
- `recordUsage` guarda `source` pero no velocidad.
- Sin fallback cruzado.

---

## 4. Huecos declarados

- `model.ts` no usa el slow.
- Cuotas por velocidad.
- Fallback cruzado.
- Elección por complejidad (hoy regex).

---

## 5. Huecos profundos (auditoría extendida)

1. **`modelChain(config)` ignora el tenant config**: lee solo `config.model`
   global. El tenant no puede tener su propio modelo.
2. **`TenantConfig.fast` y `.slow` sin validación al arrancar**: si la apiKey
   está vacía, el error aparece en el primer mensaje, no al arrancar.
3. **`EnvTenantConfigResolver` lee envs cada vez**: no cachea. Con 100
   turns/min, 100 lecturas de `process.env`.
4. **Sin caché de `TenantConfig` por tenant**: cada llamada a
   `kernel.config(ctx)` recalcula el objeto completo.
5. **Sin fallback fast → slow**: si el fast falla, salta al global, no al
   slow del tenant.
6. **Sin fallback slow → global**: si el slow falla, salta al global, no al
   fast del tenant.
7. **Sin medición de latencia por velocidad**: `recordUsage` no distingue
   fast vs slow. Métricas agregadas sin sentido.
8. **Sin cuotas por velocidad**: un tenant con cuota agotada en fast puede
   seguir usando slow.
9. **`shouldDelegateToSlow` con regex**:
   `/(analiza|investiga|prepara|resume|planifica|revisa|compara|estudia|calcula)/i`.
   Se olvida de idiomas y de contexto.
10. **Sin "cambio dinámico de modelo"**: no se puede empezar en fast y pasar
    a slow a mitad del turno si el fast no puede resolverlo.
11. **`provider-spec.ts` valida pero el resolver no parsea**: `providerEnv`
    cae a `"google"` silenciosamente si el valor es raro.
12. **Sin `baseUrl` por tenant**: `providerSpecSchema` lo soporta pero el
    resolver no lo lee del env.
13. **Sin "modelo por rol"**: un rol podría preferir un modelo distinto
    (ej. legal usa uno más caro). No implementado.
14. **`fastIdleMs` no se usa en `conversation.ts`**: `TenantConfig.fastIdleMs`
    declarado pero el chat no lo consulta.
15. **`quiescenceMs` no se usa en `closeTurn`**: `TenantConfig.quiescenceMs`
    declarado pero el kernel no lo aplica al cerrar turnos.
16. **`slowLongMs` no se usa en Meta**: `TenantConfig.slowLongMs` declarado
    pero Meta usa `longNoOutputMs` hardcodeado.
17. **`maxThoughtsPerTurn` no se usa en `StoreTurnStore`**:
    `TenantConfig.maxThoughtsPerTurn` declarado pero el store usa
    `MAX_THOUGHTS_PER_TURN` constante.
18. **Sin "modo degradado"**: si ambos modelos fallan, el chat devuelve un
    error técnico, no un mensaje humano.
19. **Sin test de que un tenant con config propia funciona**: no hay test
    que verifique que el fast del tenant se usa.
20. **`embeddings` en `TenantConfig` sin usar**: `TenantConfig.embeddings`
    declarado pero `RagService` usa `process.env.GEMINI_API_KEY` directo.

---

## 6. Interrelación

Transversal a chat y tareas. Los embeddings usan un tercer modelo.

---

## 7. Riesgos

- Fast y slow comparten cuota.
- Task tarda 5 min en el slow.
- Fallback oculta fallos reales si no hay tests.

---

## 8. Tipo de fixes

- `executeModelTask` con `KernelContext` y `TenantConfig.slow`.
- `recordUsage` con `speed`.
- Fallback fast → slow → global.
- Cache de `TenantConfig`.
- Modelo por rol.
- Wire de los tiempos (`fastIdleMs`, `quiescenceMs`, `slowLongMs`,
  `maxThoughtsPerTurn`).

---

## 9. Fronteras y conexiones

### Fronteras
- No LLM local.

### Conexiones
- Depende de: 09.
- Dependen de esta: 11, 24.
- Archivos compartidos: `conversation.ts`, `model.ts`, `kernel/config/*`.

### Principios del PRODUCT.md
Tareas durables, kernel cognitivo.

---

## 10. Ficheros relevantes

| Archivo | Rol |
|---|---|
| `apps/server/src/kernel/model.ts` | `modelChain()` ignora `TenantConfig.slow`. Es el centro del fix. |
| `apps/server/src/kernel/config.ts` | `TenantConfig` con `fast`, `slow`, `embeddings`. |
| `apps/server/src/kernel/model-chain.ts` | Implementación del fallback. Debe mutar para soportar fast → slow → global. |
| `apps/server/src/conversation.ts` | Usa el fast. Debe consultar `fastIdleMs` y aplicar `quiescenceMs`. |
| `apps/server/src/kernel/recordUsage.ts` | `recordUsage()` guarda `source` pero no `speed`. Falta el campo `speed`. |
| `apps/server/src/kernel/EnvTenantConfigResolver.ts` | Resuelve `FAST_LLM_*` y `SLOW_LLM_*`. Sin cacheo. |
| `apps/server/src/kernel/provider-spec.ts` | `providerSpecSchema` soporta `baseUrl` y `env`, pero `EnvTenantConfigResolver` no los parsea. |

---

## 11. Checklist de fixes

1. **Fallback fast → slow → global**
   - En `model-chain.ts`, `modelChain(config)` debe intentar `config.fast`
     primero, luego `config.slow`, finalmente `config.model`.
   - Cada intento debe capturar errores y continuar con la siguiente opción.

2. **Validación de claves de API al arrancar**
   - En `TenantConfig` o `EnvTenantConfigResolver`, validar que `apiKey` no
     esté vacía para el modelo seleccionado.
   - Error con mensaje claro: `"FAST_LLM_API_KEY no configurada"` (no fallos
     en el primer mensaje).

3. **Cache de `TenantConfig` por tenant**
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
   - `providerSpecSchema` soporta `baseUrl`.
   - `EnvTenantConfigResolver` debe leer `FAST_LLM_BASE_URL` y
     `SLOW_LLM_BASE_URL`.

8. **Render de tiempo en chat**
   - `fastIdleMs` aplicado en `conversation.ts` (time to first token).
   - `quiescenceMs` en `closeTurn()`.

9. **Modo degradado**
   - Si fast y slow fallan, devolver mensaje humano, no error técnico.
   - `ConversationAgent` debe tener un `fallbackError` visible al usuario.

10. **Tests**
    - Test que un tenant con `TenantConfig.slow` usa slow en `modelChain()`.
    - Test de fallback: fast falla, slow intenta, global como último recurso.
    - Test de cuota: agotar fast no accede a slow.
    - Test de `recordUsage` con `speed` correcto.

---

## 12. Cómo verificar el cierre

- `pnpm test` pasa tests de `model-chain.ts`, `record-usage.ts` y
  `config.ts`.
- `recordUsage` tiene `speed: "fast" | "slow"` y se incrementa
  correctamente.
- `TenantConfig.load()` valida claves en `FAST_LLM_API_KEY` y
  `SLOW_LLM_API_KEY`.
- `modelChain(tenantConfig)` usa `TenantConfig.slow` cuando `config.fast`
  falla.
- Test que verifica que una **task** usa slow.
- Test de fallback fast → slow → global con mock.
- Test de cuota: agotar fast no accede a slow.

---

## 13. Notas del audit

- Fast y slow comparten cuota.
- Task tarda 5 min en el slow.
- Fallback oculta fallos reales si no hay tests.
- Sin `baseUrl` por tenant, el env puede ser diferente por modelo.