# Roadmap de producto — 15 etapas hacia 10 empresas operativas

Este folder es el **mapa macro** del producto. No es código. No es tests. Es el contrato de qué significa que cada etapa esté hecha, cómo se audita y cómo se testea contra el repo real.

## Cómo se usa

1. Cada etapa tiene un documento (`01-...md` a `15-...md`) con el mismo contrato: objetivo, subsistemas, fases, criterios de auditoría, criterios de aceptación, evidencia actual en el repo, brecha, handoff.
2. La **evidencia actual** se rellena cuando el código existe. Hoy muchas etapas dicen `NO_EXISTE`. Es correcto: el producto no está completo.
3. Cuando una etapa se construye, se actualiza su sección de evidencia con fichero + línea + test verde + marca `_V1`.
4. Cada etapa puede tener **miniroadmaps internos** (subcarpetas o ficheros `-miniroadmap.md`) cuando se descompone en fases más pequeñas. El documento de etapa no se reescribe; se enlaza al miniroadmap.

## Estados de etapa

| Estado | Significado |
|---|---|
| `OPERATIVA` | Existe código, está conectado al arranque, se invoca en un flujo real, tiene test de aceptación verde, produce artefacto consumible. |
| `PARCIAL` | Existe parte del código o del cableado, pero falta al menos uno de los 5 criterios. |
| `NO_EXISTE` | No hay código que cubra la etapa. |
| `BLOQUEADA` | Depende de una decisión de producto o de una etapa anterior sin cerrar. |

## Las 15 etapas

### Bloque I — Diseñar el sistema que permite construir empresas

| # | Etapa | Estado | Doc |
|---|---|---|---|
| 1 | Auditoría holística + arquitectura objetivo | `PARCIAL` | [01](01-AUDITORIA-ARQUITECTURA.md) |
| 2 | Workspace compilador de empresas | `PARCIAL` | [02](02-WORKSPACE-COMPILADOR.md) |
| 3 | Sistema holístico de procesos y caminos de ejecución | `PARCIAL` | [03](03-PROCESOS.md) |
| 4 | Sistema de creación, configuración y asignación de agentes | `PARCIAL` | [04](04-AGENTES.md) |

### Bloque II — Hacer que la empresa funcione en el OS

| # | Etapa | Estado | Doc |
|---|---|---|---|
| 5 | Completar compilador + conectar artefactos con runtime | `NO_EXISTE` | [05](05-COMPILADOR-RUNTIME.md) |
| 6 | Runtime empresarial integrado | `PARCIAL` | [06](06-RUNTIME-EMPRESARIAL.md) |
| 7 | Arquitectura UX/UI del OS | `NO_EXISTE` | [07](07-UX-ARQUITECTURA.md) |
| 8 | Implementación e iteración UX | `NO_EXISTE` | [08](08-UX-IMPLEMENTACION.md) |

### Bloque III — Conectar el OS con el mundo empresarial real

| # | Etapa | Estado | Doc |
|---|---|---|---|
| 9 | Integraciones empresariales y conectores | `PARCIAL` | [09](09-INTEGRACIONES.md) |
| 10 | Digitalización y puesta en marcha de empresa piloto | `NO_EXISTE` | [10](10-PILOTO.md) |
| 11 | Testeo integral, endurecimiento y validación del piloto | `NO_EXISTE` | [11](11-VALIDACION-PILOTO.md) |

### Bloque IV — Convertir la digitalización en proceso repetible

| # | Etapa | Estado | Doc |
|---|---|---|---|
| 12 | Industrializar compilación y despliegue | `NO_EXISTE` | [12](12-INDUSTRIALIZACION.md) |
| 13 | Preparar y lanzar servicio comercial | `NO_EXISTE` | [13](13-SERVICIO-COMERCIAL.md) |
| 14 | Desplegar y estabilizar empresas 2–5 | `NO_EXISTE` | [14](14-EMPRESAS-2-5.md) |
| 15 | Llegar a 10 empresas operativas y consolidar OS | `NO_EXISTE` | [15](15-EMPRESAS-6-10.md) |

## Camino principal

`01 → 02–04 → 05–06 → 07–09 → 10–11 → 12–15`

## En paralelo

- Validar clientes y oferta comercial desde la etapa 2.
- Probar UX desde las primeras interfaces (etapa 7).
- Construir primero los conectores del piloto (etapa 9).
- Seguridad, aislamiento e idempotencia durante todo el desarrollo.

## Las 3 conclusiones obligatorias (las pide el audit externo)

1. **¿Qué empresa puede construir hoy el software, si puede construir alguna?**
   Hoy: ninguna completa. Hay piezas parciales (ontología, SOPs, assignments, bootstrap, workspaces, capabilities). Ver `01-AUDITORIA-ARQUITECTURA.md`.

2. **¿Qué recorrido funcional falta para una primera empresa operativa?**
   Definición de negocio → ontología validada → pipelines ejecutables → SOPs compilados → workforce asignado → planificación → bootstrap del tenant → ejecución de un proceso real → verificación → recuperación. Ver `02`–`06`.

3. **¿Cuál es el siguiente cambio de código que más acerca el producto?**
   Pendiente de la auditoría de completitud (`01`). Sin ese documento, no hay respuesta honesta.

## Documentos auxiliares

- [`_TEMPLATE.md`](_TEMPLATE.md) — plantilla de cada etapa.
- [`_AUDIT-CRITERIA.md`](_AUDIT-CRITERIA.md) — contrato de auditoría y test por etapa.
- [`00-BASELINE.md`](00-BASELINE.md) — estado real del repo hoy.

## Regla de oro

Una etapa no se marca `OPERATIVA` porque exista un fichero. Se marca `OPERATIVA` cuando los 5 criterios de `_AUDIT-CRITERIA.md` se cumplen con evidencia. Sin evidencia, `NO_EXISTE` o `PARCIAL`.