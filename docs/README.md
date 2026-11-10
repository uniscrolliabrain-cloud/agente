# Documentación de Laia

> v2 · 2026-11-07 · Estado: current

Índice de la documentación del repositorio. Cada entrada dice qué es,
dónde vive y si está viva o archivada.

## Vertical comercial de Agntia

- [Estado del piloto, Laia y flujo de datos](./operacion/ESTADO-VERTICAL-LAIA-Y-DATOS.md)
- [Benchmark de servicios y criterios de calidad](./operacion/BENCHMARK-SERVICIOS-AGNTIA.md)
- [Especificación de servicios, pipelines y tarjetas de comunicación](./operacion/PROPUESTA-PLAYBOOKS-LAIA-Y-SERVICIOS.md)

## Desarrollo en paralelo

- [Plan de 10 agentes y 10 rondas de sprint](./operacion/SPRINTS-10-AGENTES-10-RONDAS.md)

## Producto y visión

| Fichero | Qué es |
|---|---|
| [PRODUCT.md](./02-producto/PRODUCT.md) | Qué es Laia, a dónde va, qué no es, fases hasta 1.0 |
| [ROADMAP.md](./02-producto/ROADMAP.md) | Trabajo planeado por fases |
| [KNOWN_ISSUES.md](./estado/KNOWN_ISSUES.md) | Issues abiertos del repo |

## Protocolo de trabajo

| Fichero | Qué es |
|---|---|
| [PROTOCOLO.md](./PROTOCOLO.md) | Cómo se trabaja aquí: ledger, idempotencia, verificación |

## Arquitectura

- [Contrato del contexto del chat](./operacion/CONTRATO-CONTEXTO-PROMPT.md)

| Fichero | Qué es |
|---|---|
| [ARCHITECTURE.md](./03-arquitectura/ARCHITECTURE.md) | Capas del sistema (API, engine, kernel, computer) |
| [KERNEL_SPEC.md](./03-arquitectura/KERNEL_SPEC.md) | Spec del kernel cognitivo (Zod, Thought, Turn) |
| [SECURITY.md](./03-arquitectura/SECURITY.md) | Boundaries de seguridad |
| [COMPUTER.md](./03-arquitectura/COMPUTER.md) | Sandbox Docker aislado |

## Operación

| Fichero | Qué es |
|---|---|
| [DEPLOY.md](./04-operaciones/DEPLOY.md) | Cómo desplegar el backend |
| [DEPLOY-CLIENTE.md](./04-operaciones/DEPLOY-CLIENTE.md) | Deploy por cliente (un deployment por cliente) |
| [PRODUCCION.md](./04-operaciones/PRODUCCION.md) | Notas de producción |
| [ONBOARDING-CLIENTE.md](./04-operaciones/ONBOARDING-CLIENTE.md) | Pasos para dar de alta un cliente |
| [CLIENTE.md](./04-operaciones/CLIENTE.md) | Guía del cliente final |
| [operacion/](./operacion/) | Planes, campañas y auditorías (incluye el DEPLOY histórico con la decisión de topología) |

## Kernel

Auditorías del kernel y su estado:

| Fichero | Qué es |
|---|---|
| [KERNEL_SPEC.md](./03-arquitectura/KERNEL_SPEC.md) | Spec del kernel cognitivo |
| [AUDIT_CONTRACTS.md](./AUDIT_CONTRACTS.md) | Contratos del dominio vs implementación |
| [AUDIT_IDEMPOTENCY.md](./AUDIT_IDEMPOTENCY.md) | Marcas de idempotencia del repo |
| [AUDIT_TENANT_DEFAULT.md](./AUDIT_TENANT_DEFAULT.md) | Uso de 'default' hardcodeado |

## UI servida

Campaña de UI/UX: shell, chat, panel contextual, templates. En curso.

| Fichero | Qué es |
|---|---|
| [UI-REDESIGN.md](./09-interfaz/UI-REDESIGN.md) | Rediseño del shell |
| [UI_ANIMATIONS.md](./09-interfaz/UI_ANIMATIONS.md) | Animaciones (typewriter, cascada, contadores) |
| [VIEWS_AND_TEMPLATES.md](./09-interfaz/VIEWS_AND_TEMPLATES.md) | 7 templates de UI servida |
| [mockups/](./mockups/) | Mockups de referencia |

## Estado

| Fichero | Qué es |
|---|---|
| [BETA.md](../BETA.md) | Beta readiness (raíz del repo) |

## Handoffs por fecha

- [Vistas servidas · 2026-11-10](./2026-11-10/README.md)

## Archivo

Documentos históricos que ya cumplieron su función. Se conservan por
trazabilidad, no como referencia activa. Ver [archive/2026-10/](./archive/2026-10/README-ARCHIVE.md).

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
- `riesgos-ui.md` → consolidar con `09-interfaz/05-RIESGOS.md`
- `AUDITORIA_TENANT.ps1` → `scripts/`
- `Vídeos - Acceso directo.lnk` → borrar del git

## Reorganización documental

La [propuesta de Cline](./INDICE-REORGANIZACION.md) recoge los borradores de octubre y su referencia de revisión. El [registro de agentes](./registro-agentes/index.jsonl) conserva el historial en formato buscable. La [auditoría de agentes y LLM](./AUDITORIA-AGENTES-LLM.md) describe el código en el SHA indicado en el informe.
