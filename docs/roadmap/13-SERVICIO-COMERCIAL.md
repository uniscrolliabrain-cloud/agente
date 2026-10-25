# Etapa 13 — Preparar y lanzar el servicio comercial

## 1. Objetivo y alcance

Convertir el producto validado en un servicio vendible y entregable: oferta, paquetes, precios, onboarding, contratos, soporte, facturación, casos de uso, criterios de aceptación. Puede empezar en paralelo con la etapa 10.

## 2. Subsistemas involucrados

- `docs/operacion/` — documentación comercial y de onboarding.
- `docs/operacion/CLIENTE.md`, `ONBOARDING-CLIENTE.md`, `DEPLOY-CLIENTE.md` — existentes.
- `apps/server/src/engine/tenant.ts` — multi-tenant.
- `apps/server/src/engine/guardrails/service.ts` — cuotas.
- `apps/server/src/billing-routes.ts`, `packages/integrations/src/stubs/stripe.ts` — facturación.

## 3. Fases y tareas

- [ ] Fase 1 — Definir oferta, paquetes, límites, precios.
- [ ] Fase 2 — Preparar onboarding, contratos, privacidad, responsabilidades.
- [ ] Fase 3 — Definir soporte, monitorización, copias de seguridad, incidencias.
- [ ] Fase 4 — Configurar facturación y control de costes por tenant.
- [ ] Fase 5 — Preparar demostraciones y casos de uso basados en resultados reales.
- [ ] Fase 6 — Establecer criterios de aceptación con cada cliente.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Existe documento de oferta y precios | `docs/operacion/OFERTA.md` (nuevo) |
| A2 | Existe documento de onboarding | `docs/operacion/ONBOARDING-CLIENTE.md` |
| A3 | Existe facturación por tenant | `billing-routes.ts` + Stripe |
| A4 | Existe control de coste por tenant | `guardrails` + métricas |
| A5 | Existe documento de criterios de aceptación | `docs/operacion/ACEPTACION.md` (nuevo) |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | Un tenant puede facturarse | `tests/roadmap/etapa-13.test.ts` | Stripe stub + tenant |
| T2 | El coste del tenant se mide | idem | uso + € |
| T3 | El onboarding se completa en X horas | Documento de medición | — |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| Multi-tenant | `EXISTE` | `engine/tenant.ts`, `db-tenant.ts` |
| Guardrails (cuotas) | `EXISTE` | `engine/guardrails/service.ts` |
| Facturación Stripe | `PARCIAL` | `billing-routes.ts` + stub |
| Documentación de operación | `PARCIAL` | `docs/operacion/` |
| Oferta y precios | `NO_EXISTE` | — |
| Onboarding formal | `PARCIAL` | `ONBOARDING-CLIENTE.md` |
| Criterios de aceptación por cliente | `NO_EXISTE` | — |
| Casos de uso con resultados reales | `NO_EXISTE` | — |

## 7. Brecha

- [ ] Documento de oferta y precios.
- [ ] Onboarding formalizado.
- [ ] Facturación real por tenant.
- [ ] Control de coste por tenant.
- [ ] Criterios de aceptación por cliente.
- [ ] Casos de uso con métricas reales.

## 8. Handoff

- [ ] Oferta + onboarding → etapa 14 (empresas 2–5).
- [ ] Criterios de aceptación → etapa 15.

## 9. Miniroadmaps internos

`13-servicio-comercial/` con fases 1–6.