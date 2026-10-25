# Etapa 11 — Testeo integral, endurecimiento y validación de la empresa piloto

## 1. Objetivo y alcance

No basta con que la demo salga bien. Probar procesos completos, conectores y sus fallos, datos y estados, seguridad y aislamiento, reintentos y recuperación, usabilidad con personas reales, coste y tiempo ahorrado. Registrar incidencias y corregir brechas.

## 2. Subsistemas involucrados

- `tests/` — tests existentes.
- `tests/campaign-3/` — E2E transversales.
- `tests/roadmap/` — tests de etapa.
- `scripts/audits/` — auditorías.
- `apps/server/src/` — código bajo prueba.
- `apps/web/src/` — UI bajo prueba.

## 3. Fases y tareas

- [ ] Fase 1 — Pruebas funcionales de procesos completos del piloto.
- [ ] Fase 2 — Pruebas de conectores y sus fallos (timeout, 401, 500, rate limit).
- [ ] Fase 3 — Verificación de datos, estados y resultados.
- [ ] Fase 4 — Pruebas de seguridad, permisos y aislamiento.
- [ ] Fase 5 — Reintentos, operaciones duplicadas, recuperación.
- [ ] Fase 6 — Pruebas de usabilidad con las personas que usarán el sistema.
- [ ] Fase 7 — Medición de coste de IA, mantenimiento y tiempo ahorrado.
- [ ] Fase 8 — Registro de incidencias y corrección de brechas.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Procesos del piloto tienen test E2E verde | `tests/roadmap/piloto/*.test.ts` |
| A2 | Conectores del piloto tienen test de fallo | idem |
| A3 | Aislamiento multi-tenant probado | idem |
| A4 | Reintentos y recuperación probados | idem |
| A5 | Usabilidad validada con usuario real | Documento de validación |
| A6 | Coste medido (tokens, €, tiempo) | Documento de medición |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | Proceso completo del piloto `achieved` | `tests/roadmap/piloto/proceso-completo.test.ts` | flujo real |
| T2 | Conector caído no tumba el proceso | idem | timeout + retry |
| T3 | Tenant A no ve proceso de B | idem | aislamiento |
| T4 | Worker interrumpido recupera | idem | crash-recovery |
| T5 | Operación duplicada no duplica efecto | idem | idempotencia |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| ~75 tests existentes | `EXISTE` | `tests/` |
| `tests/campaign-3/` | `PARCIAL` | 1 test implementado (e2e-06) + esqueletos skip |
| `beta:smoke`, `beta:vertical` | `PARCIAL` | Existen, pero ¿bloquean CI? |
| Validación de piloto | `NO_EXISTE` | — |
| Documento de usabilidad | `NO_EXISTE` | — |
| Documento de coste | `NO_EXISTE` | — |
| Registro de incidencias del piloto | `NO_EXISTE` | — |

## 7. Brecha

- [ ] Tests E2E del piloto.
- [ ] Tests de fallo de conectores.
- [ ] Validación con usuario real.
- [ ] Medición de coste.
- [ ] Registro de incidencias y correcciones.

## 8. Handoff

- [ ] Incidencias corregidas + lecciones → etapa 12 (industrialización).
- [ ] Tests reutilizables → etapa 12.

## 9. Miniroadmaps internos

`11-validacion-piloto/` con fases 1–8.