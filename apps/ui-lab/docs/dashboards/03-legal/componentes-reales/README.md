# Snapshot de componentes reales

Origen del snapshot: main `d7260009d71f651dda4b3d6c11e8c7c077a543a1`.
Ampliación: 2026-11-24, vista `legal` añadida en UI Lab.

## Inventario

| Componente | Archivo | Función | Clasificación |
|---|---|---|---|
| `LegalV1` | `apps/ui-lab/src/legal/LegalV1.tsx` | Superficie legal completa: portada, índice, lector, banners y preferencias | activo (UI Lab, `fixture`) |
| `legal-v1.css` | `apps/ui-lab/src/legal/legal-v1.css` | Estilos scoped `.legal-v1` con tokens canónicos | activo |
| Rutas legales | `apps/ui-lab/src/vendor/config/publicSite.ts` | Declara seis rutas (`legalPages`) | declarado, sin página publicada |
| Documentos públicos | `apps/site/` | Solo `index.html` | no localizado |

En main `d726000` no había ninguna vista legal implementada. La superficie actual no reproduce contenido
jurídico: muestra el esquema de secciones con su estado real. Ver
[CAMPANA-LEGAL-V1.md](../CAMPANA-LEGAL-V1.md) para decisiones y evidencia.
