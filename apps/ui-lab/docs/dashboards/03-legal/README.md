# 03 · Legal — Centro de confianza

**Referencia:** `Rutas legales por verificar`

Páginas legales públicas, consentimiento y enlaces.

Superficie general de UI Lab, fuera del catálogo de 34 Apps. Documentar aquí el UX/UI, los estados, las interacciones, los componentes, las pruebas y la relación con el branding real de AgntiaPro.

## Vista implementada

- `legal` en UI Lab: `apps/ui-lab/src/legal/LegalV1.tsx` + `legal-v1.css`, registrada en
  `apps/ui-lab/src/registry.tsx` (estado `fixture`).
- Campaña, decisiones y correcciones frente al mockup: [CAMPANA-LEGAL-V1.md](./CAMPANA-LEGAL-V1.md).
- Estado UX: [ESTADO-UX.md](./ESTADO-UX.md). Contratos y gate:
  [CONTRATO-VISUAL.md](./CONTRATO-VISUAL.md), [CONTRATO-FUNCIONAL.md](./CONTRATO-FUNCIONAL.md),
  [CAMPAÑA-EJECUCION.md](./CAMPAÑA-EJECUCION.md), [GATE-ACEPTACION-VISUAL.md](./GATE-ACEPTACION-VISUAL.md).
- Capturas: `capturas/`.

Las seis rutas de `legalPages` están declaradas en `vendor/config/publicSite.ts`, pero `apps/site` solo
publica `index.html`: no hay documentos legales reales. La vista lo declara en lugar de simularlos.

El screenshot y el prompt del founder (24/11/2026) son referencia de composición e interacción, no de
branding ni de copy jurídico; Landing manda sobre identidad. Las tres ramas legales anteriores quedan
preservadas en [`legacy/`](./legacy/README.md). No se publican políticas ni se toca producción sin
aprobación.

No confundir el Centro de Mando transversal con el workspace técnico 35; no modificar código de producto
desde esta carpeta.
