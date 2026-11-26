# Estudio de código — funcionamiento

## Flujo principal

1. El usuario entra con un proyecto activo (último usado) o sin proyecto.
2. Escribe la intención; puede adjuntar captura, archivo o enlace y quitar contexto.
3. El sistema verifica permisos (`builder` o superior) y muestra el resumen de contexto.
4. Se estima coste y se pide confirmación si supera el umbral del proyecto.
5. Se genera el plan con tareas, archivos candidatos, dependencias y riesgos.
6. El usuario edita, descarta tareas o pide alternativas.
7. Al aprobar, se crea un borrador de cambio y se abre `04-editor` con el plan fijado.
8. Si el plan requiere datos o secretos, se enlaza a `12-datos` o `13-entornos` antes de continuar.
9. Todo queda en la bitácora del proyecto con autor, fecha lógica y resultado.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `intent` | id, tenantId, projectId, texto, adjuntos[], autorId, creadaEn, estado |
| `plan` | id, intentId, tareas[], riesgo, costeEstimado, modelo, version, estado |
| `task` | id, título, descripción, archivos[], dependeDe[], requiereAprobacion |
| `contextSnapshot` | id, archivos[], esquema, variablesPorNombre[], rama, commit |
| `run` | id, planId, estado, costeReal, duración, errores[], artefactos[] |

Campos obligatorios: `tenantId`, `autorId`, `createdAt`, `version`. Los adjuntos se guardan por referencia y hash, nunca duplicados en cada plan.

## Estados

`borrador` → `analizando` → `plan-listo` → (`necesita-información` → `plan-listo`) → `aprobado` → `en-ejecución` → `ejecutado` | `fallido` | `cancelado`. `aprobado` es reversible solo antes de que exista un diff; después se cancela el run, no se borra la evidencia.

## Roles y permisos

- `viewer`: ve intenciones y planes aprobados; no crea ni edita.
- `reviewer`: comenta planes y veta tareas marcadas como riesgo alto.
- `builder`: crea intenciones, edita planes, ejecuta runs en preview.
- `owner`: además, sube el nivel de autonomía y autoriza gasto por encima del límite.

## Errores, reintentos e idempotencia

- Fallo de contexto (repositorio sin acceso): se explica qué permiso falta y se ofrece reconectar.
- Fallo del modelo: reintento automático una vez con el mismo `runId`; si persiste, se guarda el plan parcial como borrador.
- Fallo al abrir el editor: el plan queda aprobado y reabrible; no se pierde.
- Doble clic en "Construir": la clave de idempotencia evita dos runs para la misma intención.

## Rendimiento y límites

- El plan debe empezar a mostrarse en menos de 3 s; las tareas se completan en streaming.
- Tamaño máximo de contexto: 40 archivos o 200 KB de texto, con recorte explicado.
- Un proyecto puede tener como mucho 3 runs simultáneos; el resto espera en cola visible.
- Adjuntos de hasta 10 MB; capturas se reducen antes de enviarse.

## Móvil y accesibilidad

- 360 px: prompt a ancho completo, chips en una línea con scroll, métricas en columna.
- El editor de plan funciona por pasos, no en tabla horizontal.
- Foco visible, etiquetas asociadas, anuncio del cambio de estado por región viva.
- El botón "Construir" mantiene área táctil de 44 px y no se tapa con la barra de estado.

## Demo actual frente a conectado

En el clon, "Construir" muestra un aviso de simulación y no llama a ningún modelo; las métricas son estáticas y el proyecto es `lorem-app`. Conectado, cada paso anterior requiere contrato de API, control de coste y aislamiento por tenant.

## Criterios de aceptación

- Se puede crear una intención, ver el plan, editarlo y abrir el editor con él fijado.
- Sin proyecto o sin permiso, la interfaz explica el bloqueo en lugar de fallar.
- El coste estimado y el real quedan registrados y son comparables.
- Un plan aprobado sobrevive a recargas y a la navegación entre superficies.
- Todo plan ejecutado aparece en la bitácora con su resultado.
