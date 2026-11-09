# Laia — Whitepaper

> v1 · 2026-10-27 · Estado: current

## Resumen ejecutivo

Laia es un **OS agentico para PYMEs y agencias pequeñas**: un sistema operativo de negocio que recibe encargos, lee contexto y datos de empresa, ejecuta procedimientos deterministas, prepara acciones para revisión humana y conserva tareas, artefactos, eventos y memoria. Todo con aislamiento multi-tenant y aprobaciones explícitas para cualquier efecto externo.

## El problema

Las PYMEs y agencias pequeñas necesitan automatización de negocio pero las herramientas existentes (Zapier, n8n, Make) requieren configuración técnica y no ofrecen:
- Aislamiento real entre clientes (multi-tenant)
- Aprobaciones humanas antes de efectos externos (email, WhatsApp, calendario, pagos)
- Memoria de empresa curada y deduplicada
- Tareas durables que sobreviven reinicios
- Un chat conversacional por empresa que prepare emails y gestione la operación

## La solución: Laia

Laia es un **runtime de agentes durables** construido alrededor de cuatro pilares:

| Pilar | Qué hace |
|-------|----------|
| **SOPs deterministas** | Procedimientos JSON con pasos cerrados, `allowedTools` por SOP, aprobaciones en pasos externos |
| **Memoria de empresa** | Hechos curados con categoría y tags, deduplicados, accesibles por RAG |
| **Tareas durables** | Sobreviven reinicios, leases con CAS, checkpoint por paso, DeadLetterQueue |
| **Kernel cognitivo** | Cada turno se registra como Thought con AttentionVector. Audit trail con cadena de hashes SHA-256 |

## Modelo de negocio

| Concepto | Valor |
|----------|-------|
| Instalación por cliente | ~1.200 € |
| Mantenimiento mensual | ~850 €/mes |
| Dogfooding | Primera empresa compilada es la propia agencia |

Casos de uso prioritarios del vertical slice:

1. **Resucitar leads muertos** de campañas de Ads antiguas → automatización con buen ROI.
2. **Encontrar leads nuevos fríos** y entregarlos calientes y listos para cerrar.
3. **Agente de comunicación para clínicas**: contesta WhatsApp y teléfono, agenda citas en Calendar o CRM.
4. **Dashboard simple por empresa**: gestionan su automatización y hablan con su empresa conectada a Gmail, Drive, WhatsApp, Calendar, Google Profile de Negocio.
5. **Chat tipo GPT por empresa**: prepara emails y gestiona la operación.

## Arquitectura de alto nivel

```
Panel React (chat, tareas, revisión)
    ↓ HTTP
Hono API (auth, actor, tenant, rutas)
    ↓
AgentService (dispatch: SOP, task, goal, monitor)
    ↓
SOPExecutor → LLM (proveedor delegado)
    ↓
TaskWorker (lease, CAS, checkpoint, recuperación)
    ↓
Store (PGlite dev / Postgres prod, RLS opcional)
    ↓
EventBus (eventos durables, suscriptores locales)
    ↓
Kernel (turnos, thoughts, auditoría, presentación)
    ↓
34 workspaces (Gmail, WhatsApp, HubSpot, Stripe, Zendesk, etc.)
```

## Modelo de despliegue

- **Un deployment por cliente** (single-tenant por defecto).
- **Multi-tenant compartido opcional** (Campaña 1, Fases 0–7 implementadas; Fase 8 pendiente: `MULTI_TENANT_SHARED=true` con RLS Postgres).
- **Backend**: PGlite en desarrollo, Postgres real en producción.
- **Auth**: Access key + sesiones HMAC SHA-256. Google OAuth con tokens cifrados AES-256-GCM.
- **Authz**: `authzEnabled` y `fieldClassificationEnabled` (solo `false` en modo `sample`).

## Roadmap a 12 meses

| Fase | Objetivo | Criterio de terminado |
|------|----------|----------------------|
| Beta ejecutable (2026-10) | Kernel V2, audit hash chain, computer Docker, browser Playwright, RAG, SOPs con `allowedTools`, ActionService | `pnpm beta:smoke` y `pnpm beta:vertical` pasan |
| Fase 1 - UI servida (2026-10 a 2026-11) | Panel contextual con 7 templates, ViewResolver + ViewRenderer | El usuario escribe y el panel sirve la vista correcta |
| Fase 2 - Producción single-tenant (2026-11 a 2026-12) | Observabilidad, CI/CD, backups automáticos, multi-proceso | El cliente opera 30 días sin intervención |
| Fase 3 - Multi-tenant real (2027-Q1) | RLS Postgres por defecto, tenant resolver por subdominio | Dos tenants coexisten sin verse |
| Fase 4 - Escala (2027-Q2+) | pgvector, Kafka/OTel, kernel en repo separado | Cien tenants sin degradación |

## Fuera del scope permanente

- Chat libre sin aprobaciones.
- Multitenancy compartido sin RLS ni isolación explícita.
- Promesas en docs que el código no cumple.
- Ficheros en `docs/` que no son documentación.

## Licencia

Privado. uniscrolliabrain-cloud.
