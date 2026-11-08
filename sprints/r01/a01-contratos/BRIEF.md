# A01 · Contratos y audits

**Carril:** C1 · **Rama:** `sprint/r01-a01-contratos` · **Superficie de escritura:** `sprints/r01/a01-contratos/` + `packages/domain/src/`

## Estado medido sobre `0c8fe81`

- `packages/domain/src` tiene ~30 ficheros y **0** `: any`. La capa de contratos está limpia; no la ensucies tú.
- `scripts/audits/registry.ts` declara 7 audits: `layers`, `bridges`, `console` (único no bloqueante), `anchors`, `contracts`, `idempotency`, `tenant-default`.
- `console` no bloquea por 24 ocurrencias en 231 ficheros (audit real). Un `grep -rn 'console\.' apps/server/src` da 53 porque cuenta otra superficie: rutas y los propios ficheros de audit. **Corrección medida:** el 24 del registro es correcto para lo que audita.
- **El gate está rojo hoy.** `contracts` exit 1: OK 149 · MÓDULO 90 · HARNESS 1 · PENDING 0 · ALLOWLIST 0 · **HUÉRFANOS 78**. `idempotency` exit 1: **5** bloques pegados dos veces. Los otros cinco, en verde.
- `.github/workflows/ci.yml` corre 6 de los 7 a mano (falta `anchors`) dentro de un solo `run: |`. Con `bash -e`, el primer audit rojo corta la lista y los demás no se ejecutan: el CI puede estar verde con audits rojos detrás.

## Preguntas que tienes que responder con datos

1. ¿Sobre qué rutas exactas cuenta cada audit? Escribe la tabla `audit → glob/extensiones → hits hoy`.
2. De esos 78 huérfanos: ¿cuántos son contratos muertos, cuántos son consumidores sin anotar y cuántos se pueden declarar en `contracts-allowlist.json` con motivo y fecha? Es el entregable de verdad, no un número.
3. ¿Qué superficies **no** audita nadie: `apps/web`, `apps/site`, `apps/worker`, `packages/integrations`, `scripts/`?
4. `contracts-allowlist.json` e `idempotency-allowlist.json`: ¿cuántas entradas tienen, cuántas son deuda real y cuántas están muertas (ya no casan con nada)?
5. ¿`messaging.ts` en `packages/domain/src` tiene test de contrato que falle si el esquema cambia?

## Entregable del sprint

`sprints/r01/a01-contratos/MATRIZ-AUDITS.md` con la tabla de cobertura real y la lista de huecos, **más** un test (`tests/audit-coverage.test.ts`… no: dentro de tu superficie, `sprints/r01/a01-contratos/coverage.test.ts` ejecutable a mano) que falle si un audit del registro no aparece en `ci.yml`.

Si el hueco es solo de configuración, el arreglo va en `.github/workflows/ci.yml` **solo si A10 no lo está tocando**; si hay conflicto, reporta y no toques.

## Gate de esta tarea

```bash
node --import tsx scripts/audits/contracts.ts
node --import tsx scripts/audits/anchors.ts
node --import tsx scripts/audits/idempotency.ts
```

(Si `node_modules` está vacío, cosa normal al restaurar el sandbox: `npx --yes pnpm@11.19.0 install --frozen-lockfile`. Sin dependencias, `node scripts/audits/contracts.ts` también funciona porque Node ≥22.6 ejecuta TS nativo.)

## Trampa

No "arregles" el 53 bajando el número con excepciones. Si `console` debe seguir siendo advisory, el reporte tiene que decir **por qué** y cuántas de esas 53 son legítimas (arranque, CLI, logs de auditoría).
