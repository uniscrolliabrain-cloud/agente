# Documentación de OpenMuse

> v2 · 2026-10-29 · Estado: draft

Índice de la documentación del repositorio OpenMuse. Cada entrada dice qué es,
dónde vive y su estado (`current` | `draft` | `archived`). Referencia documental:
SHA `83d20b2` de `main` (PR #1), commits Freebuff `c5a8c7c` / `9082fba`.

> Propuesta de reorganizacion basada en la referencia indicada arriba. Los estados de cada entrada reflejan esa revision y requieren comprobacion frente al main actual.

## Panel y destino operativo

- Panel y API: `https://www.agntiapro.com` (destino acordado para el piloto AGNTIA).
- Dominio raíz: puede albergar la web comercial.
- Modelo: piloto multitenant compartido (una empresa, varios tenants, datos aislados).
  Despliegues dedicados futuros son una opción no descartada, no el modelo actual.

## Producto y visión

| Fichero | Qué es | Estado |
|---------|--------|--------|
| [`whitepaper.md`](../whitepaper.md) | Visión ejecutiva para stakeholders | draft |
| [`02-producto/PRODUCT.md`](./02-producto/PRODUCT.md) | Qué es OpenMuse, a dónde va, qué no es | draft |
| [`02-producto/ROADMAP.md`](./02-producto/ROADMAP.md) | Trabajo planeado por fases con fechas y criterios | draft |
| [`08-auditorias/gate-estado.md`](./08-auditorias/gate-estado.md) | Estado de los 7 audits, contratos huérfanos, duplicados | draft |

## Protocolo de trabajo

| Fichero | Qué es | Estado |
|---------|--------|--------|
| [`PROTOCOLO.md`](./PROTOCOLO.md) | Cómo se trabaja: ledger, idempotencia, verificación | current |
| [`05-desarrollo/CONTRIBUTING.md`](./05-desarrollo/CONTRIBUTING.md) | Cómo contribuir al repositorio | current |
| [`05-desarrollo/ENV-VARS.md`](./05-desarrollo/ENV-VARS.md) | Catálogo completo de variables de entorno | draft |
| [`05-desarrollo/TESTING.md`](./05-desarrollo/TESTING.md) | Estrategia de tests, qué falla preexistente | draft |
| [`05-desarrollo/SCRIPTS.md`](./05-desarrollo/SCRIPTS.md) | Catálogo de scripts en `/scripts` | draft |

## Arquitectura

| Fichero | Qué es | Estado |
|---------|--------|--------|
| [`03-arquitectura/ARCHITECTURE.md`](./03-arquitectura/ARCHITECTURE.md) | Capas del sistema (API, engine, kernel, computer) | draft |
| [`03-arquitectura/KERNEL_SPEC.md`](./03-arquitectura/KERNEL_SPEC.md) | Spec del kernel cognitivo (Zod, Thought, Turn) | draft |
| [`03-arquitectura/SECURITY.md`](./03-arquitectura/SECURITY.md) | Boundaries de seguridad (authz, RLS, cifrado) | draft |
| [`03-arquitectura/COMPUTER.md`](./03-arquitectura/COMPUTER.md) | Sandbox Docker aislado, cuotas, límites | draft |

## Operación

| Fichero | Qué es | Estado |
|---------|--------|--------|
| [`04-operaciones/DEPLOY.md`](./04-operaciones/DEPLOY.md) | Cómo desplegar el backend | draft |
| [`04-operaciones/DEPLOY-CLIENTE.md`](./04-operaciones/DEPLOY-CLIENTE.md) | Deploy por cliente (no es el modelo actual) | draft |
| [`04-operaciones/PRODUCCION.md`](./04-operaciones/PRODUCCION.md) | Notas de producción, runbook | draft |
| [`04-operaciones/ONBOARDING-CLIENTE.md`](./04-operaciones/ONBOARDING-CLIENTE.md) | Pasos para dar de alta un cliente | draft |
| [`04-operaciones/CLIENTE.md`](./04-operaciones/CLIENTE.md) | Guía del cliente final | draft |
| [`operacion/HANDOFF-CLINE.md`](./operacion/HANDOFF-CLINE.md) | Handoff para Cline: auditoría con cifras y contradicciones | current |
| [`operacion/CAMPANA-VERDAD.md`](./operacion/CAMPANA-VERDAD.md) | Campaña de verdad: estado real del repo, 6 fases V0-V5 | current |

## API

| Fichero | Qué es | Estado |
|---------|--------|--------|
| [`06-api/ENDPOINTS.md`](./06-api/ENDPOINTS.md) | Referencia de endpoints HTTP (pendiente de contrastar contra montajes reales) | draft |

## Integraciones

| Fichero | Qué es | Estado |
|---------|--------|--------|
| [`07-integraciones/WHATSAPP.md`](./07-integraciones/WHATSAPP.md) | Webhook HMAC, drafts, Evolution API (pendiente de conexión real) | draft |
| [`07-integraciones/GOOGLE.md`](./07-integraciones/GOOGLE.md) | OAuth, Gmail, Calendar, Drive, tokens cifrados | draft |
| [`07-integraciones/STRIPE.md`](./07-integraciones/STRIPE.md) | Pagos, webhooks, reconciliación | draft |
| [`07-integraciones/WORKSPACES.md`](./07-integraciones/WORKSPACES.md) | Catálogo de los 34 workspaces (estado scaffold) | draft |

## Auditorías

| Fichero | Qué es | Estado |
|---------|--------|--------|
| [`AUDIT_CONTRACTS.md`](./AUDIT_CONTRACTS.md) | Contratos del dominio vs implementación | current |
| [`AUDIT_IDEMPOTENCY.md`](./AUDIT_IDEMPOTENCY.md) | Marcas de idempotencia del repo | current |
| [`AUDIT_TENANT_DEFAULT.md`](./AUDIT_TENANT_DEFAULT.md) | Uso de 'default' hardcodeado | current |
| [`miniaudits/`](./miniaudits/) | 25 miniaudits por rama (estado de cada área) | current |

## Interfaz (UI servida)

| Fichero | Qué es | Estado |
|---------|--------|--------|
| [`09-interfaz/UI-REDESIGN.md`](./09-interfaz/UI-REDESIGN.md) | Rediseño del shell | draft |
| [`09-interfaz/UI_ANIMATIONS.md`](./09-interfaz/UI_ANIMATIONS.md) | Animaciones (typewriter, cascada, contadores) | draft |
| [`09-interfaz/VIEWS_AND_TEMPLATES.md`](./09-interfaz/VIEWS_AND_TEMPLATES.md) | 7 templates de UI servida | draft |
| [`mockups/`](./mockups/) | Mockups de referencia | draft |

## Campaña de documentación (esta renovación)

| Fichero | Qué es | Estado |
|---------|--------|--------|
| [`01-campania-documentacion/CAMPANA.md`](./01-campania-documentacion/CAMPANA.md) | Objetivo, fases, criterios, hashes de referencia | current |
| [`01-campania-documentacion/FASE-01-inventario.md`](./01-campania-documentacion/FASE-01-inventario.md) | Inventario de 804 `.md` con estado real | current |
| [`01-campania-documentacion/FASE-02-archive.md`](./01-campania-documentacion/FASE-02-archive.md) | Qué se mueve a archive y por qué | current |
| [`01-campania-documentacion/FASE-03-redaccion.md`](./01-campania-documentacion/FASE-03-redaccion.md) | Qué docs nuevos v2 se escriben | current |
| [`01-campania-documentacion/FASE-04-verificacion.md`](./01-campania-documentacion/FASE-04-verificacion.md) | Cómo se verifica cero rutas rotas | current |
| [`01-campania-documentacion/FASE-05-informe.md`](./01-campania-documentacion/FASE-05-informe.md) | Informe final de la campaña | current |

## Registro buscable de agentes

| Fichero | Qué es | Estado |
|---------|--------|--------|
| [`registro-agentes/index.jsonl`](./registro-agentes/index.jsonl) | Índice legible por máquina de registros documentales | current |
| [`registro-agentes/entries/`](./registro-agentes/entries/) | Registros Markdown con front matter YAML | current |

## Archivo

Documentos históricos que ya cumplieron su función. Se conservan por
trazabilidad, no como referencia activa.

| Fichero | Qué es |
|---------|--------|
| [`archive/2026-10/README-ARCHIVE.md`](./archive/2026-10/README-ARCHIVE.md) | Índice del archive: qué se movió, por qué, fecha, reemplazo |

## Convenciones

- Un doc tiene cabecera: `> vN · YYYY-MM-DD · Estado: current|draft|archived`.
- `draft` significa que falta evidencia contra el código de `main`; no se asume implementado.
- Los docs vivos se actualizan; los obsoletos se mueven a `archive/` con `git mv`.
- Un doc viejo no se corrige: se archiva y se escribe el nuevo (v2).
- Los scripts no viven en `docs/`, viven en `scripts/`.
- El código es la fuente de verdad: si un doc contradice el código, se actualiza el doc.
