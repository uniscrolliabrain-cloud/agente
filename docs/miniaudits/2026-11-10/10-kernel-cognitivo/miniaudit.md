# Bloque 10 · Kernel cognitivo

> Campaña UX · 2026-11-10 · **14 hallazgos** (S0 2 · S1 5 · S2 5 · S3 2)
> Estado: informe recibido. Validación: parcial (los dos S0 confirmados).

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S0 | `ctx.roleId ?? "default"` contra un rol inexistente: `Role not found: default`, 12 veces en la suite. | **Confirmado**: `orchestrator.ts:70` escribe `roleId: ctx.roleId ?? "default"`. |
| 2 | S0 | El fallo del goal queda en `background_failure` y el goal se queda en `draft`. | Sin verificar |
| 3 | S1 | `assemble` no devuelve `missing[]`: vacío y ausente son indistinguibles. | Sin verificar |
| 4 | S1 | `policyCount: 0` literal en `context.assembled`. | Sin verificar |
| 5 | S1 | Dos ensambladores con contratos distintos: `engine.ts` y `assembly.ts`. | Sin verificar |
| 6 | S1 | El `budget` declarado en `AssembleInput` no se usa en `engine.ts`. | Sin verificar |
| 7 | S1 | `buildMetaHintsBlock` no tiene llamadores: el contexto interno nunca llega al prompt. | Sin verificar (cruce con 12-2: `metaHintsPromptBlock` devuelve `""`) |
| 8 | S2 | Los `learning-facts` se filtran por subcadena y un `catch` vacío los deja en `[]`. | Sin verificar |
| 9 | S2 | `checkTaskCreation` recibe 0. | **Confirmado**: `orchestrator.ts:82` (ver 05-3). |
| 10 | S2 | Las capabilities se validan por existencia, no por esquema de entrada. | Sin verificar |
| 11 | S2 | `observer.observe` se llama con `.catch(() => {})`. | Sin verificar |
| 12 | S2 | El outcome puede salir `achieved` con `verified: false` y resumen genérico. | Sin verificar |
| 13 | S3 | Sin deps, `blocked` comparte estado con un goal real. | Sin verificar |
| 14 | S3 | TTL de aprendizaje y límites de contexto por env, sin traza en el paquete. | Sin verificar |

## Arreglos propuestos

1. **Sin rol por defecto.** Si `ctx.roleId` falta, el kernel no debe inventar `"default"`: o se resuelve el rol del tenant o se falla con `ROLE_REQUIRED`. Un rol inexistente en el 100 % de los turnos sin rol es un error de diseño, no de datos.
2. **El goal no se queda en `draft`.** Un fallo del ciclo debe moverlo a `failed` (o `blocked`) y registrar el motivo; `background_failure` sin transición deja el objetivo colgado.
3. **`missing[]` explícito** en `assemble` y `policyCount` real: hoy ni se distingue vacío de ausente ni se cuenta nada.
4. **Un ensamblador.** `engine.ts` y `assembly.ts` con contratos distintos garantizan que uno de los dos miente; unificar y borrar el otro.
5. **Nada de `catch` vacíos** en observer/learning-facts: el fallo se registra con su motivo, aunque sea para descartarlo.

## Plan

- **P1 (S0)**: rol obligatorio + transición de goal fallido, con test de ambos.
- **P2 (contexto)**: unificar ensambladores, `missing[]`, `policyCount` real, `budget` aplicado.
- **P3 (aprendizaje)**: filtros por campo (no subcadena), observer con error visible, límites en el paquete.

---

## Revisión de destino

El ciclo `Goal → Context → Capabilities → Planner → Executor → Outcome → Verifier → Learning` (`docs/BUSINESS_OS.md`) es el producto. Los dos S0 lo rompen en el primer y último paso: sin rol, no hay autor; con el goal en `draft`, no hay ciclo.

- Rol obligatorio (`ROLE_REQUIRED`) en vez de `"default"`.
- Transición del goal a `failed`/`blocked` cuando el ciclo falla, con motivo.
- Un solo ensamblador y `missing[]` explícito: sin eso no se puede explicar una respuesta.

## Conclusión

Es el bloque que más se aleja de "producto terminado": hoy el kernel arranca con un rol que no existe y deja objetivos colgados. **P0** los dos S0; **P1** unificar ensambladores y contexto.
