# Bitácora — campaña editorial Centro de Mando V2

| Dato | Valor |
|---|---|
| Fecha | 2026-11-24 |
| Rama | `feat/ui-lab-command-center-editorial` (desde `main` @ `2bda0e581941`) |
| Agente | Buffy (Codebuff) |
| Alcance | UI Lab, vista nueva `today-editorial`. Producción, shell, workspace 35 y ControlCenterView intactos |
| Build del artifact | `2bda0e581941` (version.json; commit base, árbol de `src` sin cambios después del build) |

## Decisiones

1. **No se edita `apps/web`.** Toda la campaña vive en `apps/ui-lab/src/command-center-editorial/`.
   El baseline `componentes-reales/` queda intacto; los componentes finales se clonan en
   `componentes-finales/`.
2. **Se reutiliza lo que ya era presentacional**: `briefingText`, `labels.ts` (estados, filtros,
   `isAttention`), `relativeTime`, `BrandLockup`, `SampleDashboard`, `AddMemberModal` y
   `AgentCreateModal`. No se duplica el fixture de ejemplo ni el contrato de altas.
3. **El modo ejemplo sigue siendo el mismo componente de producción.** Se re-viste por CSS
   dentro de `.cce-root`, sin copiar sus números inventados.
4. **Las acciones que salen de la vista** (abrir tarea, revisar aprobación, abrir tareas/agentes/
   equipo, abrir LAIA) conservan su callback original. En el laboratorio, donde esas superficies
   no están montadas, la prop `labNavigation` explica la navegación en un aviso: no se simula una
   acción de negocio.
5. **No se añaden secciones con datos repetidos.** «Aprobaciones» no se duplica como sección
   propia: las decisiones pendientes se resuelven en «Requiere tu atención» con el flujo existente
   (`onReviewTask`) y en el bloque operativo. Se documenta en la matriz de paridad.
6. **«Lo que te has perdido»** se construye con `overview.tasks.recent` filtrando estados sin
   decisión ni ejecución (`queued`, `scheduled`, `paused`, `cancelled`), ordenados por `updatedAt`
   verificable. Si no hay registros, la sección no se pinta.

## Archivos creados

- `apps/ui-lab/src/command-center-editorial/CommandCenterEditorial.tsx` — composición.
- `apps/ui-lab/src/command-center-editorial/CommandCenterEditorialPreview.tsx` — datos + arnés de QA.
- `apps/ui-lab/src/command-center-editorial/EditorialFrame.tsx` — marco aislado.
- `apps/ui-lab/src/command-center-editorial/command-center-editorial.css` — tokens, composición,
  motion, responsive y re-vestido de `cc-*`.
- `apps/ui-lab/src/command-center-editorial/fonts/*.woff2` — Fraunces y Manrope (OFL) self-hosted.
- `apps/ui-lab/src/command-center-editorial/components/` — 9 componentes presentacionales.

## Archivos modificados

- `apps/ui-lab/src/registry.tsx` — nueva entrada `today-editorial` (21 vistas). No se toca `today`.

## Pruebas ejecutadas

`pnpm --filter @agente/ui-lab typecheck` (0), `pnpm --filter @agente/ui-lab build` (0) y batería
Playwright sobre el build servido: 34 comprobaciones, 0 fallos (detalle en `06-QA.md`).

## Bloqueos y límites

- El navegador local del sandbox no puede arrancar (faltan `libnss3` y no hay root). La batería se
  ejecutó con el navegador cloud del entorno sobre el mismo build; `qa/qa-cce.mjs` queda listo para
  una máquina con Chromium instalado.
- No hay tenant real en el laboratorio (`/api/company` bloqueado por `safety.ts`). El estado «real»
  se prueba con el router demo; vacío, error y carga se prueban con `?cce-state=`.
- El ZIP del artifact no se versiona (9,1 MB de build); se genera con el script documentado.

## Siguiente acción

Revisión visual del founder sobre `?view=today-editorial` y decisión de promoción. No fusionar ni
desplegar sin esa aprobación.
