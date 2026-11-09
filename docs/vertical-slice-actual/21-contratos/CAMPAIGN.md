# Campana 21 - contratos cableados

## Objetivo

Que los contratos declarados en `packages/domain` y sin consumidor dejen de estar
en verde por una marca `PENDING` y pasen a tipar codigo que ya existe. Un
`PENDING` con fecha no cambia el producto; un tipo consumido si.

## Superficie de trabajo

- `packages/domain/src/{capability,learning,entity-resolution,plan,outcome,runtime,business-schema,reaction}.ts`
- `apps/server/src/engine/{capabilities,business,agents,learning,verification,planner,reactions}/`
- `apps/server/src/engine/sop-executor.ts`
- `tests/contracts-wiring.test.ts`

Fuera de superficie: rutas HTTP, esquema de base de datos, UI, dependencias.

## Criterio

1. Solo se consume un contrato donde ya hay un productor o consumidor real.
2. Nada de helpers muertos: si un tipo se usa, se usa en una funcion que se
   ejecuta en el camino de produccion o en un test que valida la forma.
3. Nada de borrar contratos: lo que no tiene consumidor conserva su `PENDING`
   con motivo concreto.
4. Un contrato consumido implica comprobar que el valor cumple el schema, no solo
   que compila.

## Aceptacion

- `tsc --noEmit` en 0.
- `audit:contracts` con `HUERFANOS: 0` y menos `PENDING` que al empezar (76).
- `audit:coherence` 7/7.
- `tests/contracts-wiring.test.ts` verde, y sin romper `tests/entity-resolver.test.ts`.
