# Mapa de la documentación

> v1 · 2026-11-10 · Estado: current
>
> Qué leer, qué es histórico y qué está duplicado. Estado real del repo:
> [00-EMPIEZA-AQUI.md](./00-EMPIEZA-AQUI.md).

## Por directorio

| Directorio | Estado | Para qué sirve |
|---|---|---|
| `00-EMPIEZA-AQUI.md`, `00-MAPA-DOCS.md` | **vigente** | Punto de entrada y este mapa. |
| `02-producto/` | vigente con salvedades | PRODUCT y ROADMAP. Su topología ("un deployment por cliente") está superada; el resto de fases sigue siendo el plan. |
| `03-arquitectura/` | vigente | Capas, kernel, seguridad, computer. Contraste con código antes de citar límites. |
| `04-operaciones/DEPLOY.md` | **vigente** | Único procedimiento de despliegue. |
| `04-operaciones/DEPLOY-CLIENTE.md` | histórico | Modelo anterior de un deployment por cliente. |
| `04-operaciones/PRODUCCION.md`, `ONBOARDING-CLIENTE.md`, `CLIENTE.md` | histórico / revisar | Contienen afirmaciones de aislamiento que ya no son ciertas. |
| `05-desarrollo/` | vigente | Entorno, variables, tests. |
| `06-api/` | vigente | Contrato HTTP. |
| `07-integraciones/GESTORIA.md` | propuesto | Contrato con `agntia-gestoria`; sin implementación aquí. |
| `09-handoffs/` | snapshot | Handoffs por fecha. No son estado actual. |
| `2026-10-18-resultados/`, `2026-11-10/`, `verification/` | snapshot | Evidencia fechada. Cita la fecha al usarla. |
| `vertical-slice-actual/`, `vertical_slice/` | snapshot | Reportes de campaña. |
| `codespace-automation/`, `campaigns/`, `roadmap/` | histórico | Planes de campañas pasadas (19 `roadmap.md`). |
| `miniaudits/` | histórico | 118 ficheros de auditorías anteriores. Útil como pistas, nunca como verdad. |
| `operacion/` | mayormente histórico | Planes y campañas de octubre. Excepción: `ESTADO-VERTICAL-LAIA-Y-DATOS.md` y los documentos comerciales, que se revisan por fecha. |
| `archive/` | histórico | Conservado por trazabilidad. |
| `ui/`, `09-interfaz/` | en curso | Rediseño de shell y templates; puede ir por delante del código. |
| `estado/KNOWN_ISSUES.md` | parcial | Deuda de la Fase 0; la suite pasa hoy, verifica antes de dar cada punto por abierto. |

## Duplicados y cuál manda

| Nombre repetido | Canónico | Nota |
|---|---|---|
| `PRODUCT.md` (2) | `docs/02-producto/PRODUCT.md` | `docs/PRODUCT.md` es v1 (2026-10-04). Ninguno de los dos acierta la topología actual. |
| `VIEWS_AND_TEMPLATES.md` (2) | `docs/09-interfaz/` | El de `docs/2026-11-10/` es el handoff de la campaña. |
| `DEPLOY.md` (2) | `docs/04-operaciones/DEPLOY.md` | El de `operacion/` es el histórico con la decisión de topología. |
| `DEPLOY-CLIENTE.md` (2) | ninguno | Ambos describen el modelo anterior. |
| `ROADMAP.md` / `roadmap.md` (24) | `docs/02-producto/ROADMAP.md` | Los demás son roadmap de un ángulo de auditoría. |
| `PRODUCCION.md` (2), `ONBOARDING-CLIENTE.md` (2), `CLIENTE.md` (2), `COMPUTER.md` (2), `HANDOFF-*` (varios) | `04-operaciones/`, `03-arquitectura/`, `09-handoffs/` | El resto son históricos o copias de campaña. |
| `AUDIT_CONTRACTS.md` | `artifacts/gate/audits/AUDIT_CONTRACTS.md` | El de `docs/` está congelado; el audit lo reescribe en cada ejecución. |

## Documentos con datos caducados

- Cifras de contratos: conviven 150 huérfanos (27-oct), 79 (8-nov) y "0
  pendientes y 0 huérfanos". La medición del 2026-11-10 es **340 contratos, 288
  OK, 43 MODULE, 1 HARNESS, 2 PENDING, 6 huérfanos**.
- Tests: la docu declara 718 casos / 701 pass / 12 skipped / 5 todo. La última
  ejecución completa da **726 casos, exit 0**.
- `pnpm docs:check`: citado en el ROADMAP como gate; **no existe**.

## Reglas para escribir docu nueva

1. Cabecera obligatoria: `> vN · YYYY-MM-DD · Estado: current|draft|archived`.
2. Un tema, un sitio. Si reemplazas un documento, deja una nota de vigencia en
   el viejo apuntando al nuevo; no lo borres ni lo dupliques.
3. Nada de cifras sin comando y fecha al lado.
4. Separa "verificado en código" de "planificado" y de "decisión pendiente".
5. La topología se describe una sola vez, aquí y en `00-EMPIEZA-AQUI.md`.
