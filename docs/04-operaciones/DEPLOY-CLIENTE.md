# Deploy por Cliente

> Guía de aprovisionamiento por cliente. Sigue [DEPLOY.md](DEPLOY.md) para publicar y operar la instancia.

## Modelo

**Un deployment por cliente.** Cada cliente tiene su propio despliegue de OpenMuse con su propio tenant, datos y credenciales.

## Pasos de alta de cliente

1. **Crear despliegue**: sigue el [procedimiento vigente](DEPLOY.md) para la instancia del cliente.
2. **Configurar variables**: aplica las [variables de producción](DEPLOY.md#variables-críticas-para-producción) y las de las integraciones habilitadas.
3. **Crear admin**: `pnpm admin:create`.
4. **Provisionar**: `pnpm provision-client` (si se usa Supabase, instanciar el Store con cliente Supabase).
5. **Registrar tenant**: `TenantService.setMembership(owner, tenantId)`.
6. **Conectar Google**: usuario completa OAuth de Google.
7. **Conectar WhatsApp**: configurar Evolution API y webhook.
8. **Verificar**: ejecutar `pnpm beta:smoke`.

## Aislamiento

- Cada cliente tiene su propio `tenantId`.
- `TenantScopedStore` aísla datos por `tenantId:owner`.
- RLS opcional en Postgres compartido (`MULTI_TENANT_SHARED=true`).
- Rate limiting por `tenantId:userId:action`.

## Cuotas por cliente

Configurables vía `GuardrailService.setQuota(tenantId, quota)`:
- `tokensPerDay`, `tasksActive`, `tasksPerHour`, `eventsPerDay`, `turnsActive`
- `costEurPerDay` (valor de referencia)
- `fastCallsPerHour`, `slowCallsPerHour`

## Modelo de negocio

| Concepto | Valor |
|----------|-------|
| Instalación por cliente | ~1.200 € |
| Mantenimiento mensual | ~850 €/mes |

## Dogfooding

La primera empresa compilada es la propia agencia que vende estas automatizaciones. Se usa internamente antes de ofrecerla a clientes externos.
