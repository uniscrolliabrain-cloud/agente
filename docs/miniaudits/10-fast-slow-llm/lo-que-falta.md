<!-- LO_QUE_FALTA_10_FAST_SLOW_LLM_V1 -->
# Lo que falta - 10 fast / slow LLM

> Estado: vivo. Se actualiza a medida que se cierra el frente.
> Base: lectura directa de los ficheros del repo.
> Uso: lista de lo que NO esta, sin contar lo ya aplicado.

---

## Que promete el modulo 10

Segun el handoff:

1. El fast habla, el slow trabaja.
2. Fallback explicito fast -> slow -> global.
3. Cuotas separadas por velocidad.
4. Modelo por rol.
5. Base URL por tenant.
6. Cache de config.
7. Validacion de keys al arrancar.
8. Tiempos por tenant (`quiescenceMs`, `fastIdleMs`, `slowLongMs`, `maxThoughtsPerTurn`).
9. Modo degradado.
10. Tests.

La fontaneria esta puesta (10 patchsets aplicados). Lo que falta es cablearla.

---

## 1. El fast habla, el slow trabaja

**En `conversation.ts`:** el chat resuelve `tenantConfig` y construye `chatModelChain`. Pero lo hace con un bloque try/catch que ignora el resultado si falla. Y hay un `fastSpec` calculado antes que no se usa. Hay tres variables compitiendo: `chain`, `fastSpec`, `chatModelChain`. Solo `chatModelChain` se pasa a `runWithModelFallback`. El codigo esta a medias: se calcula de tres formas y solo una se usa.

**En `model.ts`:** `executeModelTask` llama `runWithModelFallback(modelChain(config), ...)` y ahora `roleChain` si hay rol. Pero `modelChain(config)` no recibe el tenant. El slow declarado en `TenantConfig.slow` nunca entra en la cadena.

**Lo que falta:**
- Decidir cual de las tres variables del chat es la buena y borrar las otras dos.
- Pasar `tenantConfig` a `modelChain` en `model.ts`.
- Que `modelChain` sepa si es chat (fast) o tarea (slow). Hoy es una sola funcion que prepende ambos.

**En claro:** el chat puede estar usando fast+slow+global en lugar de solo fast+global. Las tareas usan global, no slow. Ni el fast ni el slow del tenant estan garantizados.

---

## 2. Fallback fast -> slow -> global

**En `model-chain.ts`:** la funcion `modelChain` construye `[fast, slow, global, fallback]` si hay tenant. Pero los llamantes no le pasan tenant. Sin tenant, es `[global, fallback]`.

**Lo que falta:**
- Que `conversation.ts` y `model.ts` pasen el tenant.
- Que el orden sea correcto: chat deberia ser `[fast, global]`, tarea `[slow, global]`. Hoy es `[fast, slow, global]` para los dos. Si el fast falla en el chat, el chat prueba el slow antes del global. Eso no es lo que el handoff pide ("fast habla, slow trabaja"). El chat no deberia tocar el slow.

**En claro:** el fallback existe pero (a) no se activa y (b) cuando se active, la cadena esta mal. El chat probara slow antes de global.

---

## 3. Cuotas separadas por velocidad

**En `guardrails/service.ts`:** `checkSpeedQuota` existe.

**En `service.ts`:** `recordUsage` llama a `checkSpeedQuota` despues de registrar el uso. El uso se registra despues del LLM.

**Lo que falta:**
- Llamar a `checkSpeedQuota` antes de `runWithModelFallback`, no despues.
- El conteo de llamadas por hora se hace con `usage.filter(...)`, que carga toda la tabla `llm-usage` y filtra en memoria. Con muchas llamadas, eso es lento.
- `quotaPerSpeed` en `config.ts` (declarado) y `TenantQuota` en `guardrails` (usado) duplican la misma informacion. Hay que decidir cual manda.
- No hay cuota separada entre fast y slow en la practica: si el chat pide fast y agota, el fallback puede pasar al slow. El slow no esta protegido del fast.

**En claro:** la cuota por velocidad no bloquea nada. Se comprueba despues. Y aunque se moviera antes, el fallback saltaria de fast a slow sin respetar la cuota del slow.

---

## 4. Modelo por rol

**En `tenant-config.ts`:** `roles?: Record<string, ProviderSpec>` esta.

**En `model.ts`:** `executeModelTask` resuelve `tenantForRole` y prepende el modelo del rol.

**En `env-resolver.ts`:** no lee roles del env. Solo lee `FAST_LLM_*` y `SLOW_LLM_*`.

**Lo que falta:**
- Una fuente para `roles`. Hoy nadie los puebla. Si un rol no tiene entrada, no hay modelo por rol.
- El chat (`conversation.ts`) no usa roles. Solo las tareas.
- Si el rol tiene `ProviderSpec` pero su `apiKey` esta vacia, se ignora silenciosamente. No hay warning ni error.

**En claro:** la infraestructura esta pero no hay forma de configurar un rol. Ni desde env, ni desde fichero, ni desde DB (no se ha visto `database-resolver.ts`).

---

## 5. Base URL por tenant

**En `env-resolver.ts`:** `FAST_LLM_BASE_URL`, `SLOW_LLM_BASE_URL`, `EMBEDDINGS_LLM_BASE_URL` se leen.

**Lo que falta:**
- El chat (`conversation.ts`) construye `fastSpec` como `${provider}/${model}` y lo pasa a `runWithModelFallback`. El `baseUrl` no viaja. El `BuiltInAgent` recibe el spec como string, no el `ProviderSpec`. Si el modelo necesita una base URL distinta, no la tiene.

**En claro:** el `baseUrl` se lee pero no se usa. El `runWithModelFallback` solo entiende `provider/model`, no `baseUrl`. Para que sirva, habria que cambiar `createAgent` para que reciba el `ProviderSpec` completo.

---

## 6. Cache de config

**En `env-resolver.ts`:** cache con TTL 5 min.

**Lo que falta:**
- Invalidacion explicita. Si cambian las envs, la cache no lo sabe hasta que expira.
- Si el `Kernel` instancia dos resolvers (no se sabe, el kernel esta corrupto), cada uno tiene su cache.
- `DatabaseTenantConfigResolver` (no visto) puede tener su propia cache o ninguna. Puede haber dos fuentes de verdad.

**En claro:** la cache funciona pero no se invalida. Y puede haber dos resolvers compitiendo.

---

## 7. Validacion de keys al arrancar

**En `env-resolver.ts`:** `console.warn` si faltan keys.

**Lo que falta:**
- El warning sale en `resolve()`, que corre en cada llamada (o en cada cache miss). No es "al arrancar".
- No hay validacion bloqueante. El sistema sigue arrancando con keys vacias.
- No hay validacion en `config.ts` (donde se leen las envs de arranque).

**En claro:** no se valida al arrancar. Se avisa cuando alguien pide config, que puede ser a los 5 minutos de arrancar.

---

## 8. Tiempos por tenant

**`quiescenceMs`:** no se usa en ningun sitio. El kernel cierra turno cuando el flujo lo dice.

**`fastIdleMs`:** `Meta` usa `1000` hardcodeado. No lee `TenantConfig.fastIdleMs`.

**`slowLongMs`:** `Meta` usa `30_000` hardcodeado. No lee `TenantConfig.slowLongMs`.

**`maxThoughtsPerTurn`:** `StoreTurnStore` tiene `setLimitForTenant`, pero nadie lo llama. El limite real sigue siendo 500.

**Lo que falta:**
- Que `Meta` reciba los tiempos del tenant. Hoy `Meta` se instancia con `{ longNoOutputMs: 30_000 }` hardcodeado en `service.ts` y en `conversation.ts`.
- Que el kernel llame `setLimitForTenant` al resolver el tenant.
- Que `closeTurn` espere `quiescenceMs`.
- Que `conversation.ts` lea `fastIdleMs` para decidir si el fast esta idle.

**En claro:** los 4 tiempos estan declarados en `TenantConfig` pero ninguno se lee. Son decorativos.

---

## 9. Modo degradado

**En `model.ts`:** `executeModelTask` devuelve `waiting_input` con mensaje humano. OK.

**En `conversation.ts`:** el path sample tiene mensaje humano. El path real (con modelo) no. En el path real, si `runError`, se llama a `closeKernelTurn` y se hace `sub.error(error)`. El usuario ve el error tecnico.

**Lo que falta:**
- Modo degradado en el path real del chat.
- Modo degradado en `generateText` (SOPs).
- El mensaje humano solo se devuelve si el error contiene ciertas palabras. Si el error es distinto, el mensaje es generico pero sigue siendo tecnico.

**En claro:** el chat real sigue devolviendo error tecnico. Los SOPs tambien.

---

## 10. Tests

**En `tests/fast-slow-llm.test.ts`:** 6 tests que cubren `modelChain`, `setLimitForTenant`, `roles` schema.

**Lo que falta:**
- Test de que el chat usa fast (no slow).
- Test de que una tarea usa slow (no fast).
- Test de fallback real (fast falla, slow responde) con el fixture.
- Test de cuota agotada.
- Test de `quiescenceMs` aplicado.
- Test de `maxThoughtsPerTurn` cableado.
- Test de que `roles` se puebla desde algun sitio.

**En claro:** los tests que hay prueban la fontaneria. No prueban el flujo. No hay un test que diga "el chat uso el fast del tenant" o "la tarea uso el slow del tenant".

---

## Lista consolidada

1. `conversation.ts`: decidir cual de las tres variables (`chain`, `fastSpec`, `chatModelChain`) es la buena. Hoy las tres coexisten y solo una se usa.
2. `conversation.ts` y `model.ts`: pasar `tenantConfig` a `modelChain`.
3. `model-chain.ts`: separar chat de tarea. El chat debe ser `[fast, global]`, la tarea `[slow, global]`. Hoy es `[fast, slow, global]` para los dos.
4. `conversation.ts` y `model.ts`: llamar `checkSpeedQuota` antes de `runWithModelFallback`.
5. `guardrails/service.ts`: el conteo por hora no puede cargar toda la tabla.
6. `config.ts` y `guardrails`: decidir si `quotaPerSpeed` o `TenantQuota` manda. Hoy hay dos fuentes.
7. `env-resolver.ts` o `database-resolver.ts`: leer `roles` de algun sitio.
8. `conversation.ts`: usar roles en el chat.
9. `env-resolver.ts`: validacion bloqueante en live.
10. `env-resolver.ts`: invalidacion de cache.
11. `Meta`: leer `fastIdleMs` y `slowLongMs` de `TenantConfig`.
12. `kernel.ts`: llamar `setLimitForTenant` al resolver tenant.
13. `kernel.ts`: aplicar `quiescenceMs` en `closeTurn`.
14. `conversation.ts`: leer `fastIdleMs` para decidir si el fast esta idle.
15. `conversation.ts`: modo degradado en path real.
16. `model.ts`: modo degradado en `generateText`.
17. `conversation.ts`: pasar `baseUrl` a `createAgent` (hoy solo se pasa `provider/model`).
18. Tests: 6 tests de flujo real.

---

## Lo que NO falta (aunque parezca)

- `TenantConfig` ya tiene todos los campos.
- `providerSpecSchema` ya soporta `baseUrl`.
- `GuardrailService` ya tiene `checkSpeedQuota`.
- `StoreTurnStore` ya tiene `setLimitForTenant`.
- `modelChain` ya acepta tenant.
- `recordUsage` ya acepta speed.
- `model.ts` ya tiene modo degradado.
- La cache ya existe.
- Los warnings de keys ya existen.

Todo eso esta. Lo que falta es cablearlo.

---

## Bloqueantes

**1. Kernel corrupto.** `apps/server/src/kernel/kernel.ts` tiene bytes corruptos por doble/triple encoding UTF-8. El fichero no es legible ni fiable. Nada que toque `kernel.ts` se puede aplicar hasta arreglarlo.

**2. Fuente de `roles` sin decidir.** Hay que elegir: env (`ROLE_<id>_LLM_*`), DB (`DatabaseTenantConfigResolver`), o fichero de config. Sin esa decision, el fix 6 no sirve.

**3. `quotaPerSpeed` vs `TenantQuota`.** Hay dos fuentes de la misma informacion. Hay que decidir cual manda y borrar la otra.

---

## Lo que se necesita para cerrar

Para 12 de las 18 cosas no hace falta kernel. Se pueden hacer ya.

Para 6 de las 18 cosas (12, 13, y los wires que dependen del kernel) hace falta el kernel sano.

---

## Orden recomendado

1. Arreglar kernel.
2. Decidir fuente de `roles`.
3. Decidir `quotaPerSpeed` vs `TenantQuota`.
4. Cablear `modelChain(config, tenant)` en chat y tareas.
5. Separar chat de tarea en `model-chain.ts`.
6. Mover `checkSpeedQuota` antes del LLM.
7. Cablear `setLimitForTenant` desde el kernel.
8. Aplicar `quiescenceMs` en `closeTurn`.
9. Leer `fastIdleMs` y `slowLongMs` en `Meta`.
10. Modo degradado en chat real y en `generateText`.
11. Pasar `baseUrl` a `createAgent`.
12. Invalidacion de cache.
13. Validacion bloqueante en live.
14. Tests de flujo real.

---

FIN DEL DOC.
