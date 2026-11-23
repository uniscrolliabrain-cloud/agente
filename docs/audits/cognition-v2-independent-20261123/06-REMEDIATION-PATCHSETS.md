# Patchsets propuestos — sin aplicar a producción

## R01 · Contrato de routing V2 (AUD-01)
Archivos: `apps/server/src/agent.ts`, `apps/server/src/config.ts`, tests HTTP CopilotKit. Definir si AG-UI remoto está permitido en tenant opt-in; si no, fail-closed con error tipado. Primero test de regresión; no romper backend remoto autorizado sin decisión del founder.

## R02 · Atención empresarial hacia Slow (AUD-02)
Archivos candidatos: `engine/cognition/v2/slow.ts`, `workers.ts`, productor/consumidor de eventos, dominio. Diseñar trigger idempotente, filtro por tenant/actor y evidencia, budgets y cola durable. **No crear un LLM que escucha todos los eventos indiscriminadamente**; seleccionar acontecimientos verificables y útiles.

## R03 · V2 y operaciones empresariales (AUD-03)
Crear contrato de intención/propuesta hacia ActionService/kernel, no herramientas en Fast. Receipts y autorización como única fuente de resultado. No retirar ruta legacy sin paridad funcional.

## R04 · E2E tarjeta y ACK (AUD-10)
Fixture sintético aislado, Postgres restringido, prueba con evento real → Slow → proyección → snapshot → Fast y aislamiento cross-tenant. Diferenciar ACK del servidor de entrega UI/audio.

## R05 · Voz/medios (AUD-06/07)
Montar ciclo solo tras validación mock, epoch fencing distribuido y permisos; mantener proveedores externos en stub. Añadir streaming y medición de primer audio en campaña futura, sin simular latencia real.

## R06 · Observabilidad y regresión
Añadir métricas de routing V1/V2, slow enqueue/lease, proyección, entrega y kernel receipts con tenant pseudonimizado; preparar OTel/Grafana antes de retirar legacy. Conservar rollback documentado.

Orden: R01 + pruebas → R02 → R04 → R03 → R05 → R06. Ningún patch aplicado en esta rama; pendiente autorización y runner de tests.
