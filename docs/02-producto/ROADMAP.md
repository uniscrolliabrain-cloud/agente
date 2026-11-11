# Roadmap

> **NOTA DE VIGENCIA · 2026-11-10.** «Fase 3 - Multi-tenant real» no implica que hoy sea single-tenant: el multitenant clásico ya está en código; faltan RLS forzada y subdominio. Además, `pnpm docs:check` (FASE-04) no existe como script. Estado real: [00-EMPIEZA-AQUI.md](../00-EMPIEZA-AQUI.md).


> v2 · 2026-10-27 · Estado: current

## Fases de producto

| Fase | Objetivo | Entregables | Criterio de terminado | Dependencias |
|------|----------|-------------|----------------------|--------------|
| Beta ejecutable | Kernel V2, audit, computer, browser, RAG, SOPs, ActionService | `beta:smoke`, `beta:vertical` verdes | Ambas pasan | Campaña 1 Fases 0–7 |
| Fase 1 - UI servida | Panel contextual con 7 templates | ViewResolver, ViewRenderer, typewriter, cascada, contadores | Usuario escribe → panel sirve vista correcta | Beta |
| Fase 2 - Producción | Observabilidad, CI/CD, backups, multi-proceso | Deploy por cliente, runbook | Cliente opera 30 días sin intervención | Fase 1 |
| Fase 3 - Multi-tenant real | RLS Postgres, tenant resolver por subdominio | `MULTI_TENANT_SHARED=true` operativo | Dos tenants coexisten sin verse | Fase 2 |
| Fase 4 - Escala | pgvector, Kafka/OTel, kernel separado | Cien tenants sin degradación | Carga estable | Fase 3 |

## Campaña de documentación (esta rama)

| Fase | Nombre | Objetivo | Entregable |
|------|--------|----------|------------|
| FASE-01 | Inventario y evidencia | Catálogo de 804 `.md` con estado real | `FASE-01-inventario.md` |
| FASE-02 | Archive estructurado | Mover docs obsoletos a `docs/archive/2026-10/` | `docs/archive/2026-10/README-ARCHIVE.md` |
| FASE-03 | Redacción v2 | Escribir docs nuevos v2 | Carpetas `docs/02-` a `docs/09-` |
| FASE-04 | Verificación y gate | Script `pnpm docs:check`, cero rutas rotas | `pnpm docs:check` verde |
| FASE-05 | Informe final | Documentar todo lo hecho | `INFORME-LIMPIEZA-DOCU.md` |

## Fuera del scope permanente

- Chat libre sin aprobaciones.
- Multitenancy compartido sin RLS ni isolación explícita.
- Promesas en docs que el código no cumple.
- Borrar documentación: solo archivar.
