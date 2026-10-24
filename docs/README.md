# Documentación de OpenMuse

> v1 · 2026-10-04 · Estado: current

Índice de la documentación del repositorio. Cada entrada dice qué es,
dónde vive y si está viva o archivada.

## Producto y visión

| Fichero | Qué es |
|---|---|
| [PRODUCT.md](./PRODUCT.md) | Qué es OpenMuse, a dónde va, qué no es, fases hasta 1.0 |
| [ROADMAP.md](./ROADMAP.md) | Trabajo planeado por fases (raíz del repo) |
| [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) | Issues abiertos del repo |

## Protocolo de trabajo

| Fichero | Qué es |
|---|---|
| [PROTOCOLO.md](./PROTOCOLO.md) | Cómo se trabaja aquí: ledger, idempotencia, verificación |

## Arquitectura

| Fichero | Qué es |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Capas del sistema (API, engine, kernel, computer) |
| [KERNEL_SPEC.md](./KERNEL_SPEC.md) | Spec del kernel cognitivo (Zod, Thought, Turn) |
| [SECURITY.md](../SECURITY.md) | Boundaries de seguridad (raíz del repo) |
| [COMPUTER.md](./COMPUTER.md) | Sandbox Docker aislado |

## Operación

| Fichero | Qué es |
|---|---|
| [DEPLOY.md](./DEPLOY.md) | Cómo desplegar el backend |
| [DEPLOY-CLIENTE.md](./DEPLOY-CLIENTE.md) | Deploy por cliente (un deployment por cliente) |
| [PRODUCCION.md](./PRODUCCION.md) | Notas de producción |
| [ONBOARDING-CLIENTE.md](./ONBOARDING-CLIENTE.md) | Pasos para dar de alta un cliente |
| [CLIENTE.md](./CLIENTE.md) | Guía del cliente final |

## Kernel

Auditorías del kernel y su estado:

| Fichero | Qué es |
|---|---|
| [KERNEL_SPEC.md](./KERNEL_SPEC.md) | Spec del kernel cognitivo |
| [AUDIT_CONTRACTS.md](./AUDIT_CONTRACTS.md) | Contratos del dominio vs implementación |
| [AUDIT_IDEMPOTENCY.md](./AUDIT_IDEMPOTENCY.md) | Marcas de idempotencia del repo |
| [AUDIT_TENANT_DEFAULT.md](./AUDIT_TENANT_DEFAULT.md) | Uso de 'default' hardcodeado |

## UI servida

Campaña de UI/UX: shell, chat, panel contextual, templates. En curso.
Ver [interfaz/indice-campaña-ui.md](./interfaz/indice-campaña-ui.md).

| Fichero | Qué es |
|---|---|
| [UI-REDESIGN.md](./interfaz/UI-REDESIGN.md) | Rediseño del shell |
| [UI_ANIMATIONS.md](./interfaz/UI_ANIMATIONS.md) | Animaciones (typewriter, cascada, contadores) |
| [VIEWS_AND_TEMPLATES.md](./interfaz/VIEWS_AND_TEMPLATES.md) | 7 templates de UI servida |
| [mockups/](./mockups/) | Mockups de referencia |

## Estado

| Fichero | Qué es |
|---|---|
| [BETA.md](../BETA.md) | Beta readiness (raíz del repo) |
| [WORK_LOG_2026_10_03.md](./WORK_LOG_2026_10_03.md) | Log del pase de reconciliación del 2026-10-03 |
| [future_plans.md](./future_plans.md) | Conceptos para iteraciones futuras |

## Archivo

Documentos históricos que ya cumplieron su función. Se conservan por
trazabilidad, no como referencia activa. Ver [archive/](./archive/)
(pendiente de crear en Wave 2).

## Convenciones

- Un doc tiene cabecera: `> vN · YYYY-MM-DD · Estado: current|draft|archived`.
- Los docs vivos se actualizan; los obsoletos se mueven a `archive/` con fecha.
- Los protocolos, roadmaps y TODOs viven en un solo sitio.
- Los scripts no viven en `docs/`, viven en `scripts/`.

## Pendiente de mover (Wave 2)

- `AGENTES-PROYECTOS.txt` → archive (desactualizado)
- `HANDOFF.md` (raíz) → archive + trocear contenido útil
- `LEDGER.md` (raíz) → archive
- `PROMPT-CLINE-*.md` → archive
- `ROADMAP_112.md` → borrar (contenía solo `615`)
- `event-bus-y-agente-omnisciente.txt` → archive
- `riesgos-ui.md` → consolidar con `interfaz/05-RIESGOS.md`
- `AUDITORIA_TENANT.ps1` → `scripts/`
- `Vídeos - Acceso directo.lnk` → borrar del git

