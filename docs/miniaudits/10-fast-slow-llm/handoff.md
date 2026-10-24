# 10 - Fast / slow LLM - Handoff

> HANDOFF_10_FAST_SLOW_LLM_UPDATE_V1
> Actualizado: 
2026-10-15
> Estado: 10 de 10 fixes aplicados, 3 wires pendientes, kernel corrupto bloquea fix 8b.

---

## Objetivo

Dos velocidades de LLM con cuotas separadas. El fast habla, el slow trabaja. Las tareas durables usan el slow real. Fallback explicito: fast -> slow -> global.

---

## Estado por fix

| # | Fix | Estado | Ficheros tocados | Nota |
|---|---|---|---|---|
| 1 | Fallback fast -> slow -> global | Aplicado | `engine/model-chain.ts` | Firma `modelChain(config, tenant?)`. Chat y tareas aun no le pasan el tenant. Wire pendiente. |
| 2 | Validacion de claves al arrancar | Aplicado | `kernel/config/env-resolver.ts` | `console.warn` si faltan `FAST_LLM_API_KEY` / `SLOW_LLM_API_KEY`. |
| 3 | Cache de `TenantConfig` por tenant | Aplicado | `kernel/config/env-resolver.ts` | `Map` con TTL 5 min. Cache hit al inicio de `resolve()`, antes de leer envs. |
| 4 | Campo `speed` en `recordUsage` | Aplicado | `engine/service.ts`, `engine/conversation.ts` | `speed?: "fast" | "slow"`. Chat pasa `"fast"`, tareas ya pasaban `"slow"`. `speedLabel = speed ?? source` en metricas. |
| 5 | Cuotas por velocidad | Aplicado | `engine/guardrails/service.ts`, `engine/service.ts` | `TenantQuota` con `fastCallsPerHour` / `slowCallsPerHour`. `checkSpeedQuota`. Consumido en `recordUsage` (post-LLM). |
| 6 | Modelo por rol | Aplicado | `kernel/config/tenant-config.ts`, `engine/model.ts` | `TenantConfig.roles?: Record<string, ProviderSpec>`. `executeModelTask` prepende el modelo del rol a la cadena. |
| 7 | Base URL por tenant | Aplicado | `kernel/config/env-resolver.ts` | `FAST_LLM_BASE_URL`, `SLOW_LLM_BASE_URL`, `EMBEDDINGS_LLM_BASE_URL` opcionales. |
| 8a | `maxThoughtsPerTurn` configurable | Aplicado | `kernel/graph/store-store.ts` | `setLimitForTenant` + `limitFor`. Default 500. Falta wire desde el kernel. |
| 8b | `quiescenceMs` en `closeTurn` | Bloqueado | `kernel/kernel.ts` | Kernel corrupto. Arreglar antes de tocar. |
| 9 | Modo degradado en tareas | Aplicado | `engine/model.ts` | `executeModelTask` devuelve `waiting_input` con mensaje humano en vez de `throw`. `generateText` sigue lanzando. |
| 10 | Tests | Aplicado | `tests/fast-slow-llm.test.ts` | 6 tests: cadena con/sin tenant, dedupe, limite por tenant, roles. |

---

## Pendiente

### Bloqueante

**1. Kernel corrupto.**

`apps/server/src/kernel/kernel.ts` tiene bytes corruptos por doble/triple encoding UTF-8. El fichero no es legible ni fiable. Nada que toque `kernel.ts` se puede aplicar hasta arreglarlo.

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
git status --short "apps/server/src/kernel/kernel.ts"
git log --oneline -5 -- "apps/server/src/kernel/kernel.ts"
git checkout -- "apps/server/src/kernel/kernel.ts"
```

Si la corrupcion ya esta commiteada, recuperar del commit anterior:

```powershell
git show <hash-bueno>:apps/server/src/kernel/kernel.ts > kernel-sano.ts
```

### Tras desbloquear kernel

**2. Fix 8b - `quiescenceMs` en `closeTurn`.**

- `Kernel.closeTurn` debe esperar `quiescenceMs` desde el ultimo thought del turno antes de cerrar.
- O bien, `TenantConfig.quiescenceMs` aplicado en `store.closeTurn`.
- Necesita ver el cuerpo completo de `closeTurn` (lineas 216-245) y el `KernelDeps` (lineas 20-45).

**3. Wire de `maxThoughtsPerTurn`.**

El metodo `StoreTurnStore.setLimitForTenant` existe pero nadie lo llama. Hay que llamarlo desde el kernel o el service al resolver el tenant. Depende del kernel.

**4. Wire de `modelChain(config, tenant)`.**

La firma acepta tenant, pero los llamantes no le pasan:
- `conversation.ts`: ya resuelve `tenantConfig`, solo falta pasarlo.
- `model.ts`: ya resuelve `tenantForRole` para el fix 6, falta pasarlo tambien al `modelChain` base.

**5. Fix 5 - wire real de la cuota.**

`checkSpeedQuota` corre dentro de `recordUsage`, que se ejecuta **despues** de la llamada al LLM. La cuota bloquea la siguiente llamada, no la actual. Para pre-check, llamar a `checkSpeedQuota` antes de `runWithModelFallback`.

**6. Fix 9 - modo degradado en chat.**

`conversation.ts` tiene el path sample con mensaje humano. El path real (con modelo) devuelve el error tecnico. Falta el mismo tratamiento que en `executeModelTask`.

**7. Fix 10 - tests mas completos.**

Los 6 tests actuales cubren `modelChain`, `setLimitForTenant` y el schema. Faltan:
- Test de fallback fast -> slow -> global con mock (`tests/helpers/model.ts`).
- Test de que una task usa `"slow"` en `recordUsage`.
- Test de que el chat usa `"fast"` en `recordUsage`.
- Test de cuota por velocidad agotada.

---

## Ficheros globales que la siguiente IA debe ver

Antes de tocar nada:

- `apps/server/src/kernel/kernel.ts` - **corrupto, arreglar primero.**
- `apps/server/src/kernel/config/env-resolver.ts` - fix 2, 3, 7 aplicados.
- `apps/server/src/kernel/config/tenant-config.ts` - fix 6a aplicado.
- `apps/server/src/kernel/config/provider-spec.ts` - schema base.
- `apps/server/src/engine/model.ts` - fix 6b, 9 aplicados.
- `apps/server/src/engine/model-chain.ts` - fix 1 aplicado.
- `apps/server/src/engine/service.ts` - fix 4a, 5b aplicados.
- `apps/server/src/engine/conversation.ts` - fix 4b aplicado.
- `apps/server/src/engine/guardrails/service.ts` - fix 5a aplicado.
- `apps/server/src/kernel/graph/store-store.ts` - fix 8a aplicado.
- `apps/server/src/config.ts` - `quotaPerSpeed` declarado.
- `tests/fast-slow-llm.test.ts` - tests nuevos.

---

## Trampas conocidas

1. **Kernel corrupto.** No tocar hasta arreglar. Cualquier patchset sobre el empeora la corrupcion.
2. **`env-resolver.ts` lee envs en cada `resolve()`.** El fix 3 mete cache hit antes de las lecturas, pero si alguien reordena el codigo, se rompe.
3. **`modelChain` acepta tenant pero nadie se lo pasa.** El fix 1 no surte efecto hasta el wire.
4. **`checkSpeedQuota` corre post-LLM.** No bloquea la llamada actual, solo la siguiente.
5. **`StoreTurnStore.setLimitForTenant` no se llama.** El limite real sigue siendo 500 hardcodeado.
6. **`recordUsage` usa `speed ?? source` como label.** `source` es `"chat" | "task" | "sop"`. `speed` es `"fast" | "slow"`. Si `speed` no llega, el label se mezcla con el de origen.
7. **`ROLE_<id>_LLM_*` no se lee del env.** El fix 6 solo funciona si el `TenantConfig.roles` se puebla desde la DB o desde otro resolver. `EnvTenantConfigResolver` no lee roles.
8. **`generateText` sigue lanzando.** El fix 9 solo cubre `executeModelTask`. Si un SOP usa `generateText` y falla, lanza.

---

## Definicion de terminado

- [ ] Kernel arreglado.
- [ ] `pnpm typecheck` verde (frontend + backend + worker).
- [ ] `pnpm test` verde.
- [ ] Fix 8b aplicado y testeado.
- [ ] `setLimitForTenant` cableado desde el kernel.
- [ ] `modelChain(config, tenant)` cableado desde chat y tareas.
- [ ] `checkSpeedQuota` llamado **antes** del LLM, no despues.
- [ ] Modo degradado en chat (path real).
- [ ] Tests de fallback fast -> slow -> global con mock.

---

## Orden de trabajo recomendado

1. Arreglar kernel (git checkout o recuperar del commit bueno).
2. `pnpm typecheck` para confirmar que los 10 patchsets aplicados compilan.
3. Pegar el cuerpo de `closeTurn` y `KernelDeps` para aplicar fix 8b.
4. Wire de `setLimitForTenant` desde el kernel.
5. Wire de `modelChain(config, tenant)` en chat y tareas.
6. Mover `checkSpeedQuota` antes del LLM.
7. Modo degradado en chat.
8. Tests completos de fallback.

---

FIN DEL HANDOFF.
