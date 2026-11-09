# Campaña de Documentación Laia

> v1 · 2026-10-27 · Estado: current

## Objetivo

Renovar toda la documentación del repositorio Laia para que refleje el código real, esté organizada profesionalmente y sea útil y manejable. Un doc viejo no se corrige: se archiva y se escribe el nuevo (v2 con metadata).

## Alcance

- **En esta rama (`limpieza-docu`)**: toda la documentación de `docs/` y raíz.
- **No se toca código TypeScript**: cero líneas cambiadas.
- **No se borra nada**: los docs obsoletos se mueven a `docs/archive/` con `git mv` y metadata.
- **No se toca `main`**, `campaign/authz-tenant`, `campaign/verdad`, `feat/compiler-scaffold`, ni `dev/equipo-cuentas`.

## Contexto del negocio (vertical slice)

Laia es un OS agentico para PYMEs y agencias pequeñas. El modelo de monetización es:

- **Instalación por cliente**: ~1.200 €
- **Mantenimiento mensual**: ~850 €/mes

Casos de uso prioritarios del vertical slice:

1. **Resucitar leads muertos** de campañas de Ads antiguas → automatización con buen ROI.
2. **Encontrar leads nuevos fríos** y entregarlos calientes y listos para cerrar.
3. **Agente de comunicación** para clínicas: contesta WhatsApp y teléfono, agenda citas en Calendar o CRM.
4. **Dashboard simple** por empresa donde gestionan su automatización y hablan con su empresa conectada a Gmail, Drive, WhatsApp, Calendar, Google Profile de Negocio.
5. **Chat tipo GPT** por empresa que prepara emails y gestiona la operación.

Dogfooding radical: la primera empresa compilada es la propia agencia que vende estas automatizaciones.

## Fases de la campaña

| Fase | Nombre | Objetivo | Entregable |
|------|--------|----------|------------|
| **FASE-01** | Inventario y evidencia | Catálogo de 804 `.md` con estado real, duplicados, ruido, contradicciones docs↔código | `FASE-01-inventario.md` |
| **FASE-02** | Archive estructurado | Mover docs obsoletos a `docs/archive/2026-10/` con `git mv`, crear `README-ARCHIVE.md` | `docs/archive/2026-10/README-ARCHIVE.md` |
| **FASE-03** | Redacción v2 | Escribir docs nuevos v2 (whitepaper, README, ROADMAP, ENDPOINTS, ENV-VARS, TESTING, integraciones) | Carpeta `docs/02-` a `docs/09-` |
| **FASE-04** | Verificación y gate | Script `pnpm docs:check`, cero rutas rotas, cabeceras válidas, contradicciones resueltas o abiertas | `pnpm docs:check` verde |
| **FASE-05** | Informe final | Documentar todo lo hecho, métricas antes/después, próximos pasos | `INFORME-LIMPIEZA-DOCU.md` |

## Criterios de terminado

- [ ] `docs/README.md` tiene cero enlaces rotos
- [ ] Cada doc en `docs/` tiene cabecera `> vN · YYYY-MM-DD · Estado: current|draft|archived`
- [ ] Ningún doc describe funcionalidad que el código no cumpla
- [ ] `whitepaper.md` existe en la raíz
- [ ] `docs/archive/` contiene docs movidos con `git mv` (no `git rm`)
- [ ] `README.md` refleja rama activa real y estado Campaña 1/2
- [ ] `pnpm docs:check` pasa con 0 errores
- [ ] `INFORME-LIMPIEZA-DOCU.md` entregado

## Rama de referencia

- Rama de trabajo: `limpieza-docu`
- Rama base: `campaign/authz-tenant` (c5a8c7c)
- Rama en revisión separada: `campaign/authz-tenant` (espera merge a `main`)
- `main`: `c69e028` (no se toca en esta campaña)

## Convenciones aplicadas

- Cabecera de cada doc: `> vN · YYYY-MM-DD · Estado: current|draft|archived`
- Un doc viejo no se corrige: se archiva y se escribe el v2
- Los docs de `packages/workspaces/*/docs` y `apps/web/src/workspaces/*/docs` (524 archivos) se documentan pero no se mueven (fuera de alcance)
