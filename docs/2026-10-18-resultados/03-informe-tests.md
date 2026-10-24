# 03 - Informe de tests

**Runner usado:** `node_modules/.bin/tsx --import ./tests/setup.ts --test --test-timeout=5000 ...`. Se uso el ejecutable local porque `pnpm` intento auto-instalar dependencias y bloqueo la instalacion por la politica de scripts ignorados de `@scarf/scarf`.

## Suite completa

| Total | Pasaron | Fallaron | Cancelados |
|---:|---:|---:|---:|
| 293 | 263 | 29 | 1 |

Los tests HTTP y de servidor se ven afectados por imports de `apps/server/src/app.ts` que resuelven a `apps/server/src/engine/service.ts`, fichero ausente del checkout. La suite tambien registra errores de transformacion asociados a fuentes del engine.

## Tests multi-tenant enfocados

| Seleccion | Resultado |
|---|---|
| `tests/tenant-isolation.test.ts` | Pasa |
| Dos pruebas de concurrencia/aislamiento con 50 tenants | Pasan |
| `scanByPrefix filtra correctamente por tenant` | Paso despues de corregir el escape SQL |
| `scanByOwnerPrefix rechaza prefijos maliciosos` | Falla: no se produce la excepcion esperada |
| Total enfocado | 6 pasaron, 1 fallo |

El test E2E agregado no pudo arrancar: `ERR_MODULE_NOT_FOUND` para `apps/server/src/engine/service.ts`. No se cuenta como prueba de aislamiento aprobada.

## Typecheck

`node_modules/.bin/tsc --noEmit --pretty false` falla con errores de sintaxis en `apps/server/src/engine/worker.ts` a partir de la linea 73. Se corrigio un comentario mal cerrado, pero persisten otros errores de parseo en ese fichero.

## Conclusiones

La carga de 50 tenants y el acceso por prefijo positivo tienen evidencia de aprobacion. El estado general sigue **rojo**. Restaurar el modulo ausente y reparar el parseo antes de interpretar el resto de los fallos como defectos funcionales.
