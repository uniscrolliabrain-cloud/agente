# 05 - CI y E2E

## Gate de CI

En `.github/workflows/ci.yml`, el paso `audits` cambio de `continue-on-error: true` a `continue-on-error: false`, conforme a la instruccion del prompt. Con los resultados actuales, el paso fallara hasta que se resuelvan los tres audits rojos. El workflow no se ejecuto en GitHub desde este Codespace.

## Prueba HTTP creada

Se agrego `tests/tenant-http-e2e.test.ts`. El test prepara dos usuarios y membresias de tenant distintas, comprueba tenantId en el endpoint de personas y verifica que un usuario no pueda cambiar la memoria del otro.

**Estado: bloqueada, no aprobada.** Al cargar `createApp`, la aplicacion importa `apps/server/src/engine/service.ts`, que no existe en este checkout. El test se conserva como objetivo de ejecucion una vez restaurada la implementacion faltante.

## Otros desbloqueos aplicados

- `scripts/audits/no-console.ts`: ruta relativa de import corregida para que `audit:console` funcione.
- `apps/server/src/db.ts`: literal SQL de `ESCAPE` corregido; el test positivo de `scanByPrefix` pasa.
- Comentarios mal cerrados ajustados en `conversation.ts` y `worker.ts`; typecheck todavia falla en `worker.ts`.

No se consideraron completos los desbloqueos cuyo test sigue fallando o no puede cargar la app.
