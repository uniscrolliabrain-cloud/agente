# Product

> v1 · 2026-10-04 · Estado: current

## Que es OpenMuse

Runtime de agentes durables alrededor de: Tasks - SOPs - Skills - Tools
- Validation - Learning. Asistente personal que sabe cosas de tu empresa
y hace cosas de verdad, con aprobaciones para todo lo externo.

## A quien sirve

PYMEs y agencias pequenas. Un deployment por cliente. Varios usuarios
dentro del deployment (admin / user). Sin multitenancy compartido.

## Diferencial

- SOPs deterministas: procedimientos JSON con pasos cerrados, allowedTools
  por SOP, aprobaciones en pasos externos.
- Memoria de empresa: hechos curados con categoria y tags, deduplicados.
- Tareas durables: sobreviven reinicios, leases con CAS, checkpoint por paso.
- Kernel cognitivo: cada turno se registra como Thought con AttentionVector.
  Audit trail con cadena de hashes.
- UI servida: el sistema sirve vistas (ViewSpec - template) segun intencion.

## Que NO es

- No es multitenant compartido. Cada cliente su deployment.
- No es un CMS.
- No es un chat libre con LLM. Todo lo externo pasa por aprobacion.
- No es autonomo sin supervision. El agente prepara; el humano aprueba.
- No sustituye a ERP/CRM. Los lee y los escribe.

## A donde va

### Beta ejecutable (2026-10)

Kernel V2, audit hash chain, computer Docker, browser Playwright, RAG,
SOPs con allowedTools, ActionService.

### Fase 1 - UI servida (2026-10 a 2026-11)

- Panel contextual con 7 templates.
- ViewResolver + ViewRenderer.
- Typewriter, cascada, contadores.

### Fase 2 - Produccion single-tenant (2026-11 a 2026-12)

- Observabilidad, CI/CD, backups automaticos, multi-proceso.

### Fase 3 - Multi-tenant real (2027-Q1)

- RLS Postgres por defecto, tenant resolver por subdominio.

### Fase 4 - Escala (2027-Q2+)

- pgvector, Kafka/OTel, kernel en repo separado.

## Criterio de terminado

- Beta: beta:smoke y beta:vertical pasan.
- Fase 1: el usuario escribe y el panel sirve la vista correcta.
- Fase 2: el cliente opera 30 dias sin intervencion.
- Fase 3: dos tenants coexisten sin verse.
- Fase 4: cien tenants sin degradacion.

## Fuera permanentemente

- Multitenancy compartido en un mismo deployment.
- Chat libre sin aprobaciones.
- Ficheros en docs/ que no son docs.
- Promesas en docs que el codigo no cumple.

