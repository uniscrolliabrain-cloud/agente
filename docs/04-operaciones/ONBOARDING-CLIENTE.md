# Onboarding de Cliente

> v1 · 2026-10-27 · Estado: current

## Pasos para dar de alta un cliente

| Paso | Acción | Comando / Herramienta |
|------|--------|----------------------|
| 1 | Preparar la instancia del cliente | [Procedimiento de despliegue](DEPLOY.md) |
| 2 | Configurar variables de entorno | [Variables de producción](DEPLOY.md#variables-críticas-para-producción) |
| 3 | Crear usuario admin | `pnpm admin:create` |
| 4 | Provisionar cliente | `pnpm provision-client` |
| 5 | Registrar tenant del cliente | `TenantService.setMembership(owner, tenantId)` |
| 6 | Conectar Google OAuth | Usuario completa flujo de `POST /google/connect` |
| 7 | Conectar WhatsApp (Evolution API) | Configurar `WHATSAPP_API_KEY`, `WHATSAPP_BASE_URL`, `WHATSAPP_INSTANCE` |
| 8 | Configurar cuotas del tenant | `GuardrailService.setQuota(tenantId, quota)` |
| 9 | Verificar despliegue | `pnpm beta:smoke` |
| 10 | Entregar dashboard al cliente | URL del panel del cliente |

## Aislamiento del cliente

- Cada cliente tiene su propio `tenantId`.
- Datos aislados por `tenantId:owner` en `TenantScopedStore`.
- Rate limiting compuesto por `tenantId:userId:action`.
- Cuotas independientes por tenant.

## Entregable al cliente

- URL de su panel privado.
- Credenciales de acceso (email/password o access key).
- Instrucciones para conectar Google, WhatsApp, etc.
- Soporte de mantenimiento mensual (~850 €/mes).
