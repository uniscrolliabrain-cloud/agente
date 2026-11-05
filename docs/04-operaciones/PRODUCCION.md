# Notas de Producción

> v1 · 2026-10-27 · Estado: current

## Consideraciones de producción

### Modo `live`

- Requiere `OPENMUSE_ACCESS_KEY` (24+ caracteres) y `TOKEN_ENCRYPTION_KEY` (32-byte base64).
- `authzEnabled` y `fieldClassificationEnabled` son `true` por defecto.
- HOST puede ser cualquier dirección (no solo loopback).

### Base de datos

- Desarrollo: PGlite embebido.
- Producción: Postgres real con `DATABASE_URL`.
- RLS opcional con `MULTI_TENANT_SHARED=true`.
- `runBackup` no es un dump de Postgres administrado; verificar backup/restore del backend elegido antes de ampliar clientes.

### Worker separado

- `worker-entry.ts` requiere `DATABASE_URL`.
- PGlite embebido corre dentro del proceso de la API.
- En Fly multi-machine, `RateLimiter` es por máquina (mover a Redis si se escala).

### Métricas y alertas

- Parte del snapshot de alertas usa ceros fijos. No presentar como medidas reales.
- `audit:console` termina verde aunque informe ocurrencias; los audits de marcas/contratos detectan convenciones, no reemplazan pruebas funcionales.

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
