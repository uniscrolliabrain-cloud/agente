# Notas de Producción

> Runbook operativo. Sigue [DEPLOY.md](DEPLOY.md) para releases y configuración.

## Consideraciones de producción

### Modo `live`

Consulta los [modos y variables de despliegue](DEPLOY.md#modos-de-operación). En modo live, `authzEnabled` y `fieldClassificationEnabled` son true por defecto.

### Base de datos

Consulta los [requisitos y backups](DEPLOY.md#backups). Verifica el backup y restore del proveedor de Postgres antes de ampliar clientes. RLS opcional con `MULTI_TENANT_SHARED=true`.

### Worker separado

Consulta [ejecución en producción](DEPLOY.md#ejecución-en-producción) y [release en Fly](DEPLOY.md#release-en-fly). PGlite embebido corre dentro del proceso de la API.

### Métricas y alertas

Consulta [métricas y logs](DEPLOY.md#métricas-y-logs). El audit de consola informa ocurrencias aunque termine en verde. Los audits de marcas y contratos comprueban convenciones.

### Límites honestos

- Pip sin red en sandbox falla honesto.
- Kernel stores in-memory `StoreTurnStore` listo pero no activado, falta PG.
- Presenter no wireado intencional (bloque D).

## Runbook

| Situación | Acción |
|-----------|--------|
| Tareas huérfanas tras crash | `worker-entry.ts` ejecuta `recoverInterruptedActions()` y `recoverInterruptedTasks()` al arrancar. |
| Token de Google expirado | `GoogleAuth` refresca automáticamente antes de 60s de expiración. |
| Webhook de WhatsApp sin firma | Configurar `WHATSAPP_WEBHOOK_SECRET` para verificación HMAC. |
| Tarea con `outcome_unknown` | Revisar si la acción externa se completó; reintentar solo si el error es determinista y el status es `failed` (no `outcome_unknown`). |

## Coste

El consumo de LLM se cuenta en **caracteres**, no en EUR fijos. El valor `costEurPerDay: 50` en `GuardrailService` es un default de referencia, no un consumo real medido.
