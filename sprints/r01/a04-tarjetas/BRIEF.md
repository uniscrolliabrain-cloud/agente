# A04 · Tarjetas de comunicación

**Carril:** C4 · **Rama:** `sprint/r01-a04-tarjetas` · **Superficie:** `sprints/r01/a04-tarjetas/`, `packages/domain/src/messaging.ts`

## Estado medido sobre `0c8fe81`

- `packages/domain/src/messaging.ts` existe: el contrato de mensajería está en la capa de dominio.
- El commit `a317d8d` se llama *"Specify Agntia service pipelines and Laia communication cards"*: hay especificación escrita y hay contrato, pero **no hay ninguna prueba que ate el contrato al render**.
- No hay módulo de tarjetas en `apps/server/src/engine/` ni en `apps/web/src/components/` con ese nombre. Lo más cercano es `MessageBubble.tsx`, `ToolCallsGroup.tsx` y `ProvenanceBadge.tsx`.

## La pregunta que decide todo

Una tarjeta es una afirmación con estructura: *qué*, *a quién*, *con qué fuente*, *qué falta*. Si el contrato permite una tarjeta sin fuente, el vertical entero incumple su propio boundary. Hoy no hay nada que lo impida por test.

## Preguntas

1. ¿Qué campos tiene exactamente el contrato de `messaging.ts`? ¿`source` es obligatorio o opcional?
2. ¿Quién construye hoy una tarjeta: el modelo, un SOP, o el presenter? Busca el camino real (`service.ts`, `sop-executor.ts`, `engine/views/`).
3. ¿Qué ve el usuario cuando la fuente no existe: tarjeta sin badge, badge vacío, o nada?
4. ¿Hay dump de una tarjeta real guardada (fixture) que puedas usar como golden file?
5. Si `ProvenanceBadge` recibe `source` vacío, ¿renderiza algo engañoso?

## Entregable del sprint

Un **test de contrato** que, partiendo de un fixture real, falle si:

- falta `source`, o
- el texto de la tarjeta afirma un dato numérico que no está en `source`, o
- el render produce una tarjeta sin badge de procedencia.

Más `sprints/r01/a04-tarjetas/CONTRATO.md` con la tabla campo → obligatorio → quién lo rellena → qué pasa si falta.

## Gate

```bash
node --import tsx --test --test-timeout=30000 sprints/r01/a04-tarjetas/*.test.ts
node --import tsx tests/business-os-contracts.test.ts
node --import tsx tests/kernel-presenter.test.ts
```

## Trampa

"Tarjeta con fuente opcional y badge que dice `desconocida`" es exactamente el fallo que este carril existe para impedir. Si `source` es opcional en el contrato, el entregable es **hacerlo obligatorio con migración de los fixtures**, no un badge más grande.
