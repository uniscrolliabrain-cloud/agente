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

## Documentos de esta campaña

- [01 · Design brief y composición](./01-DESIGN-BRIEF.md)
- [02 · Arquitectura de componentes y estados](./02-COMPONENTES-Y-ESTADOS.md)
- [03 · Campañas secuenciales y patchsets](./03-CAMPANAS-SECUENCIALES.md)
- [04 · Prompt maestra para el agente implementador](./04-PROMPT-AGENTE.md)
- [05 · QA visual y criterios de aceptación](./05-QA-Y-ACEPTACION.md)
- [06 · Bitácora de campaña y handoff](./06-BITACORA-Y-HANDOFF.md)

## Condición de salida

No basta con que compile: **capturas reales** escritorio/móvil, interacción reproducible, diseño comparado con Landing y Estudio Demo del mismo commit, validación responsive y aprobación del founder. La campaña no autoriza deploy.
