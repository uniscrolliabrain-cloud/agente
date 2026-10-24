# 07 - Riesgos y trabajo fuera de MVP

`fuera-de-mvp.md` no existe en las rutas comunicadas. El listado de 21 aspectos que menciona el prompt no se reconstruye aqui como si fuera la fuente original. Esta pagina registra solo riesgos visibles en las fuentes locales y en la ejecucion.

## Riesgos confirmados por la ejecucion

1. **Suite no verde:** 29 tests fallidos y 1 cancelado.
2. **Checkout incompleto:** falta `apps/server/src/engine/service.ts`; los tests HTTP y el E2E no pueden iniciar.
3. **Compilacion bloqueada:** quedan errores de sintaxis en `apps/server/src/engine/worker.ts`.
4. **Auditorias de gobernanza rojas:** 16 tenant-default prohibidos, 90 marcas de idempotencia duplicadas y 154 contratos huerfanos.
5. **Contrato de prefijo no claro:** test de rechazo de prefijo malicioso falla aunque el query usa parametros y escape.
6. **Fuentes contradictorias:** la auditoria actual encuentra mas referencias de `default` que los reportes antiguos locales.
7. **Gate fail-on-error antes de saneamiento:** CI ahora hace fallar el job de audits con el estado actual.

## Temas listados en `miniaudit.md` local

Incluyen RLS desactivada por defecto, scans globales, cache de tenant, rate limits, tablas de membresia/configuracion, cuotas, billing, observabilidad, backups y tenant switcher. Son temas de roadmap; su estado actual debe revisarse contra el codigo y la fuente ausente antes de crear compromisos de entrega.

## Siguiente criterio de priorizacion

1. Restaurar las fuentes faltantes y reconciliar el inventario.
2. Recuperar el servicio ausente y dejar typecheck/suite en estado ejecutable.
3. Resolver el test de prefijo malicioso y los 3 audits fallidos.
4. Ejecutar E2E, pruebas RLS y CI remota.
5. Solo entonces convertir items del roadmap fuera de MVP en historias de hardening enterprise.
