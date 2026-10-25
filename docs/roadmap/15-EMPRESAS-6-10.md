# Etapa 15 — Llegar a 10 empresas operativas y consolidar el OS

## 1. Objetivo y alcance

Incorporar las empresas 6–10. Supervisar la operación simultánea de 10 tenants. Verificar aislamiento, capacidad, consumo, estabilidad. Gestionar actualizaciones y cambios de configuración. Mantener procesos, agentes, conectores. Medir valor, costes, margen, satisfacción. Priorizar la siguiente evolución a partir del uso real.

## 2. Subsistemas involucrados

- `clientes/<empresa-6-10>/`.
- `apps/server/src/admin-*.ts` — admin tenants.
- `apps/server/src/metrics-exporter.ts` — métricas.
- `apps/server/src/alerts/*` — alertas.
- `docs/operacion/` — runbook.

## 3. Fases y tareas

- [ ] Fase 1 — Incorporar empresas 6–10.
- [ ] Fase 2 — Supervisar operación simultánea de 10 tenants.
- [ ] Fase 3 — Verificar aislamiento, capacidad, consumo, estabilidad.
- [ ] Fase 4 — Gestionar actualizaciones y cambios de configuración.
- [ ] Fase 5 — Mantener procesos, agentes, conectores.
- [ ] Fase 6 — Medir valor, costes, margen, satisfacción.
- [ ] Fase 7 — Priorizar siguiente evolución a partir del uso real.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | 10 empresas operativas | Test E2E de cada una |
| A2 | Aislamiento verificado con 10 tenants | Test concurrente |
| A3 | Capacidad y consumo medidos | Métricas |
| A4 | Actualizaciones sin downtime | Runbook |
| A5 | Margen y satisfacción medidos | Documento |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | 10 tenants bootstrappean | `tests/roadmap/etapa-15.test.ts` | bundle por tenant |
| T2 | Aislamiento con 10 tenants concurrentes | idem | test de carga |
| T3 | Actualización sin downtime | idem | rolling update |
| T4 | Métricas de las 10 | idem | export Prometheus |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| Admin tenants | `PARCIAL` | `admin-tenants.ts` |
| Métricas | `EXISTE` | `metrics-exporter.ts` |
| Alertas | `PARCIAL` | `alerts/*` |
| Runbook | `PARCIAL` | `docs/operacion/` |
| 10 tenants operativos | `NO_EXISTE` | — |
| Test de carga con 10 tenants | `PARCIAL` | `tests/load/fifty-tenants.test.ts` (existe, ¿se ejecuta?) |
| Margen y satisfacción | `NO_EXISTE` | — |

## 7. Brecha

- [ ] Incorporar empresas 6–10.
- [ ] Test de carga con 10 tenants reales.
- [ ] Runbook de actualización sin downtime.
- [ ] Medición de margen y satisfacción.
- [ ] Priorización de siguiente evolución.

## 8. Handoff

- [ ] Producto consolidado con 10 tenants → siguiente ciclo de evolución.
- [ ] Lecciones → roadmap de producto v2.

## 9. Miniroadmaps internos

`15-empresas-6-10/` con fases 1–7.