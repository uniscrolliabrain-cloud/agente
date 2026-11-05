# Product

> v2 · 2026-10-27 · Estado: current

## Qué es OpenMuse

Runtime de agentes durables alrededor de: Tasks - SOPs - Skills - Tools - Validation - Learning. Asistente personal que sabe cosas de tu empresa y hace cosas de verdad, con aprobaciones para todo lo externo.

## A quién sirve

PYMEs y agencias pequeñas. Un deployment por cliente. Varios usuarios dentro del deployment (admin / user). Multi-tenant compartido opcional (Campaña 1, Fases 0–7 implementadas).

## Diferencial

- **SOPs deterministas**: procedimientos JSON con pasos cerrados, `allowedTools` por SOP, aprobaciones en pasos externos.
- **Memoria de empresa**: hechos curados con categoría y tags, deduplicados.
- **Tareas durables**: sobreviven reinicios, leases con CAS, checkpoint por paso.
- **Kernel cognitivo**: cada turno se registra como Thought con AttentionVector. Audit trail con cadena de hashes.
- **UI servida**: el sistema sirve vistas (ViewSpec - template) según intención.

## Qué NO es

- No es un CMS.
- No es un chat libre con LLM. Todo lo externo pasa por aprobación.
- No es autónomo sin supervisión. El agente prepara; el humano aprueba.
- No sustituye a ERP/CRM. Los lee y los escribe.
- No es multitenancy compartido sin RLS ni isolación explícita.

## A dónde va

### Beta ejecutable (2026-10)

Kernel V2, audit hash chain, computer Docker, browser Playwright, RAG, SOPs con `allowedTools`, ActionService.

### Fase 1 - UI servida (2026-10 a 2026-11)

- Panel contextual con 7 templates.
- ViewResolver + ViewRenderer.
- Typewriter, cascada, contadores.

### Fase 2 - Producción single-tenant (2026-11 a 2026-12)

- Observabilidad, CI/CD, backups automáticos, multi-proceso.

### Fase 3 - Multi-tenant real (2027-Q1)

- RLS Postgres por defecto, tenant resolver por subdominio.

### Fase 4 - Escala (2027-Q2+)

- pgvector, Kafka/OTel, kernel en repo separado.

## Criterio de terminado

- Beta: `beta:smoke` y `beta:vertical` pasan.
- Fase 1: el usuario escribe y el panel sirve la vista correcta.
- Fase 2: el cliente opera 30 días sin intervención.
- Fase 3: dos tenants coexisten sin verse.
- Fase 4: cien tenants sin degradación.

## Vertical slice (negocio inmediato)

La primera empresa compilada es la propia agencia que vende automatizaciones de IA a empresas (~1.200 € instalación + ~850 €/mes mantenimiento):

1. Resucitar leads muertos de campañas de Ads antiguas.
2. Encontrar leads nuevos fríos y entregarlos calientes.
3. Agente de comunicación para clínicas (WhatsApp + teléfono → Calendar/CRM).
4. Dashboard simple por empresa (Gmail, Drive, WhatsApp, Calendar, Google Profile).
5. Chat tipo GPT por empresa (prepara emails, gestiona operación).

Dogfooding radical: la propia empresa usa el OS antes de venderlo a clientes.
