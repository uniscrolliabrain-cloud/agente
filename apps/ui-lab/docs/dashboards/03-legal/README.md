# Legal

**Referencia:** `Rutas legales por verificar`

Páginas legales públicas, consentimiento y enlaces.

Superficie general de UI Lab, fuera del catálogo de 34 Apps. Documentar aquí el UX/UI, los estados, las interacciones, los componentes, las pruebas y la relación con el branding real de AgntiaPro.

## Vista implementada

- `legal` en UI Lab: `apps/ui-lab/src/legal/LegalV1.tsx` + `legal-v1.css`, registrada en
  `apps/ui-lab/src/registry.tsx` (estado `fixture`).
- Campaña, decisiones y correcciones frente al mockup: [CAMPANA-LEGAL-V1.md](./CAMPANA-LEGAL-V1.md).
- Capturas: `capturas/`.

Las seis rutas de `legalPages` están declaradas en `vendor/config/publicSite.ts`, pero `apps/site` solo
publica `index.html`: no hay documentos legales reales. La vista lo declara en lugar de simularlos.

No confundir el Centro de Mando transversal con el workspace técnico 35; no modificar código de producto
desde esta carpeta.
