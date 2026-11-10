# Bloque 01 · Coherencia

> Campaña UX · 2026-11-10 · **10 hallazgos** (S0 0 · S1 4 · S2 3 · S3 3)
> Estado: informe recibido. Validación: parcial (marcada por hallazgo).

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | 34 workspaces con `VIEWS = []`; el servidor fabrica una vista `default` (tabla, primera query) en `default-views.ts`. | **Vigente con matiz**: siguen 34 legacy con `VIEWS=[]`, pero el catálogo ya tiene 37 módulos y los 3 de ACME declaran sus 21 vistas. El fallback sólo aplica a los 34. |
| 2 | S1 | `status: "implemented"` en 34/34, pero ninguno importa `@agente/integrations`: las queries leen claves `ws-*` locales. | Sin verificar |
| 3 | S1 | 125 eventos publicados, 100 sin consumidor; `publishes`/`consumes` no se leen en runtime, sólo en un test de texto. | Sin verificar |
| 4 | S1 | 6 eventos consumidos que no existen en `SYSTEM_EVENT_TYPES`: `campaign.created`, `contact.created`, `contract.drafted`, `stock.movement.recorded`, `stock.reserved`, `subscription.renewed`. | Sin verificar |
| 5 | S2 | `audit:layers` verde (0) frente a `audit:bridges` 12/16 rojo; el verde se lee como salud global. | **Confirmado** en E20: el gate da 8/10 con `audit:bridges` y `audit:contracts` en rojo. |
| 6 | S2 | 217 capacidades de workspace contra 236 validadas al arrancar; 19 sin identificar. | Sin verificar |
| 7 | S2 | 39 claves `ws-*` para 34 workspaces; espacio de nombres libre, sin tipos. | Sin verificar |
| 8 | S3 | El manifiesto apunta `entrypoint: ./src/index.ts` y el índice real es `contract.ts`. | Sin verificar |
| 9 | S3 | `order` y `slug` sin validación de continuidad ni de correspondencia con la carpeta. | Sin verificar |
| 10 | S3 | `packages/workspaces/src` comparte nivel con los 34 módulos: 35 entradas donde deberían ser 34. | **Confirmado**: `ls packages/workspaces/*/` da 38 entradas (34 módulos + `src` + `_template` + otros). |

## Arreglos propuestos

1. **Declaración honesta del estado.** `status` de cada módulo debe salir de un dato: `declared` si hay `VIEWS`, `implemented` si además hay query real, `verified` sólo con cobertura HTTP. Nada de escribirlo a mano.
2. **Un namespace por módulo.** Prefijar las claves `ws-*` con el `id` del módulo (`acme-obras:parts`) y validarlas con un schema en el manifest.
3. **Contrato de eventos leído en runtime.** `publishes`/`consumes` deben alimentar el bus (o al menos un `audit:events` que compare declarado contra emitido); hoy es prosa.
4. **Los 6 tipos fantasma**: o se añaden a `SYSTEM_EVENT_TYPES` o se retiran del `consumes` de los módulos. Nunca dejar un consumidor de un evento que el enum no conoce.
5. **`entrypoint`**: apuntar a `contract.ts` (o renombrar el fichero), y validar `order`/`slug` contra la carpeta en el test del catálogo.

## Plan

- **P1 (contrato)**: schema del manifest con `status`, `order`, `slug`, `entrypoint`, `publishes`, `consumes`; test del catálogo que lo valide entero.
- **P2 (higiene)**: cerrar los 6 tipos fantasma y prefijar las claves `ws-*`.
- **P3 (observabilidad del catálogo)**: `audit:workspaces` que compare declarado contra real y falle con lista explícita, en lugar de un test de texto.

---

## Revisión de destino

El repo no va a "37 módulos que devuelven filas": va a **UI servida** sobre un contrato declarado y a una **acción vertical cerrada** (`docs/02-producto/PRODUCT.md`, `docs/2026-11-10/06-futuro-y-plan-de-handoff.md`). Faltan arreglos que el informe no plantea:

- `status` debe derivarse de datos (`declared` / `implemented` / `verified`), no escribirse; hoy un módulo sin vistas puede declararse implementado.
- Las **capabilities deben llegar al template**: sin eso el contrato de UI servida es decorativo (cruce con 15-4).
- Un `audit:workspaces` que falle si un módulo declara `implemented` sin query o sin vista.

## Conclusión

Salvo `status` y `capabilities`, este bloque es higiene de catálogo: no bloquea el piloto. La consecuencia real de no arreglarlo es que el catálogo seguirá prometiendo módulos que no pueden pintar ni ejecutar nada, que es exactamente la confusión entre "contrato implementado" y "producto terminado" que describe el handoff. **Prioridad P2**, con `status` en P1 porque de él dependen la UI y el gate.
