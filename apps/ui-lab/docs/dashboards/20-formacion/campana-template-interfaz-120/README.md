# Campaña · Template audiovisual Formación para 120 microcursos

**Estado:** propuesta ejecutable de implementación, solo documentación. **Rama:** main para esta documentación. **Prohibido:** modificar runtime, desplegar, inventar APIs o dar por aprobada una pantalla sin validación del founder.

## Objetivo

Construir **el template reusable de Formación** para albergar IA01–IA60, R01–R50 y P01–P10: biblioteca audiovisual premium, colecciones, búsqueda, fichas, reproductor persistente, cola, biblioteca personal, progreso honesto, modo Trabajo/Aprender/Explorar y práctica con LAIA cuando exista capacidad autorizada. El catálogo ya está en `../METADATA-120-CURSOS.json`.

**Umbral visual no negociable:** calidad, jerarquía, respiración, tipografía, composición, motion y coherencia **igual o superior a Landing y Estudio Demo REALES del repo**. Un mockup antiguo no es el patrón. Si la pantalla parece plantilla genérica de cursos, **rechazar**.

## Precedencia de verdad

1. Decisiones del founder: nivel de Landing + Estudio Demo, no clones de Spotify, calidad premium y 120 cursos.
2. **Código activo**: `apps/ui-lab/src/vendor/landing/Landing.jsx`, `apps/ui-lab/src/vendor/landing/landing.css`, `apps/ui-lab/src/vendor/studio/BusinessCommandStudio.tsx`, `apps/ui-lab/src/vendor/studio/studio.css`, `apps/ui-lab/src/design-system/agntia-tokens.css`; comprobar rutas en main antes de ejecutar.
3. Shell, navegación y componentes existentes; no duplicar chat global, menú ni cabecera.
4. `../PROMPT-MAESTRA-FORMACION-V3-SPOTIFY.md`, `../UX-FORMACION.md`, `../CONTRATOS-Y-DATOS.md`, `../DESIGN-ALGORITMO-DISCOVERY-LEARNING-V2.md`.
5. Mockups fotográficos existentes: **solo referencias de intención**, no especificaciones exactas de píxel ni fuente de branding.
6. Este paquete de campaña.

## Referencias verificadas documentalmente

- [Snapshot de Landing real](../../01-landing/ejemplo-componentes-reales/README.md): snapshot fechado, subordinado al código activo.
- [Auditoría comparativa Estudio Demo/Landing](../../19-general/superficies-transversales/AUDITORIA-ESTUDIO-DEMO-VS-LANDING-2026-11-23.md): Studio aprovecha el branding pero necesita mejor coreografía y respiración; no copiar sus déficits.
- [Bitácora UX](../../19-general/BITACORA-UX.md): Landing y Estudio Demo son referencias aprovechables, no garantía de producción final.
- [Prompt V3 Formación](../PROMPT-MAESTRA-FORMACION-V3-SPOTIFY.md): fuente funcional principal.
- [Metadata de 120 cursos](../METADATA-120-CURSOS.json): seed editorial; contenido todavía draft.

**Auditoría posterior:** la campaña original NO acredita paridad visual con Landing; leer [07 · Auditoría de paridad visual](./07-AUDITORIA-PARIDAD-VISUAL.md) antes de C00. Deben aprobarse concepto de composición, sistema de portadas y prototipo Home + ficha + player antes de construir el resto.

## Documentos de esta campaña

- [01 · Design brief y composición](./01-DESIGN-BRIEF.md)
- [02 · Arquitectura de componentes y estados](./02-COMPONENTES-Y-ESTADOS.md)
- [03 · Campañas secuenciales y patchsets](./03-CAMPANAS-SECUENCIALES.md)
- [04 · Prompt maestra para el agente implementador](./04-PROMPT-AGENTE.md)
- [05 · QA visual y criterios de aceptación](./05-QA-Y-ACEPTACION.md)
- [06 · Bitácora de campaña y handoff](./06-BITACORA-Y-HANDOFF.md)
- [07 · Auditoría crítica de paridad visual](./07-AUDITORIA-PARIDAD-VISUAL.md)
- [08 · Mockup audiovisual y sheet reutilizable](./08-MOCKUP-REAL-Y-SHEET-REUTILIZABLE.md) — referencia visual aportada, hallazgos reales de chat FAB y plan de vertical slice.
- [09 · Criterios de componentes desde auditorías Landing + Studio](./09-CRITERIOS-COMPONENTES-DESDE-AUDITS.md) — reglas de composición abierta, densidad, motion, componentes reutilizables y gates de calidad.

## Manual premium para construir (V2)

Esta campaña se complementa con un manual de diseño de calidad equivalente en **profundidad documental** al sistema de Landing. Las especificaciones no acreditan todavía paridad visual ni implementación.

- [10 · Manual maestro de diseño](./10-MANUAL-MAESTRO-DISENO.md) — fuente de verdad, tokens, tipografía, composición, densidad y antipatrones.
- [11 · Sistema de motion y sheet](./11-SISTEMA-MOTION-Y-SHEET.md) — máquina de estados, arrastre, storyboard, accesibilidad y continuidad.
- [12 · Portadas y catálogo de 120](./12-SISTEMA-PORTADAS-Y-CATALOGO.md) — gramática editorial, disponibilidad, portadas y recomendaciones.
- [13 · Plan de implementación y validación](./13-PLAN-IMPLEMENTACION-Y-VALIDACION.md) — siete campañas, gates y trazabilidad.
- [14 · Prompt maestra de ejecución V2](./14-PROMPT-MAESTRA-EJECUCION-V2.md) — handoff para implementar en UI Lab sin alterar producción.

**Nota de coherencia:** las fases C00–C09 del documento 03 y las campañas 0–6 del documento 13 NO son dos ejecuciones distintas. La correspondencia y el orden de implementación corregido están en [15 · Auditoría transversal](./15-AUDITORIA-TRANSVERSAL-Y-CORRECCIONES.md). Para dirección de arte y QA, prevalecen 10–15 sobre los borradores 01–05 cuando haya contradicción.

- [15 · Auditoría transversal y correcciones](./15-AUDITORIA-TRANSVERSAL-Y-CORRECCIONES.md) — hallazgos priorizados, reconciliación de fases, criterios de sheet y QA UX16–UX20.

## Condición de salida

No basta con que compile: **capturas reales** escritorio/móvil, interacción reproducible, diseño comparado con Landing y Estudio Demo del mismo commit, validación responsive y aprobación del founder. La campaña no autoriza deploy.
