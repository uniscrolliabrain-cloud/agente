# Auditoría y decisiones de adaptación — prompt Apps V2

**Fuente:** prompt original aportada por el founder el 23-11-2026 (580 líneas, aprox. 31 KB). Se conserva su alcance extenso y las 17 secciones, adaptando los conflictos con el producto real.

## Hallazgos y correcciones

1. **Error conceptual crítico:** la fuente decía que el metadashboard «es el OS». Se corrige: es exclusivamente la sección Apps de AgntiaPro; no redefine la plataforma.
2. **35 nombres inventados:** la lista original «LAIA, Hoy, Ventas… Ajustes» no coincide con los 35 workspaces numerados reales. Se conserva como taxonomía UX ilustrativa y se añade el inventario canónico en el apéndice A. No se inventan equivalencias.
3. **Branding:** la fuente imponía hexadecimales y tamaños como absolutos, pese a que la autoridad visual es la landing premium y Studio Demo. Se mantienen como referencias sujetas a verificación de tokens reales.
4. **Densidad móvil:** exigir 4 × 5 iconos visibles en cualquier teléfono contradice legibilidad y espacio. Se conserva el launcher Android-like, con rejilla responsive.
5. **Arquitectura de componentes:** la fuente exigía un único App.tsx, contrario al objetivo de UI Lab. Se sustituye por componentes pequeños, tipados y testeables.
6. **Simulación:** Ana Ferrer, ACME, factura 1042 y badges son datos ficticios de ejemplo; no deben presentarse como actividad real.
7. **Algoritmo:** no está verificado como implementado. Se describen señales y salvaguardas UX sin inventar pesos, infraestructura ni telemetría ya existente.
8. **Miniapps:** calculadoras de desempeño y presupuestos son ampliaciones del catálogo, no reemplazan los 35 workspaces actuales.
9. **Alcance:** esta es una prompt para diseñar el launcher Apps, no una orden de reestructurar código de backend, rutas, tenants o la navegación general de AgntiaPro.

## Documentos relacionados

- [Concepto Apps y 35 workspaces](./README.md)
- [Catálogo de fichas UI Lab](../README.md)
- [Prompt adaptada completa](./PROMPT-MAESTRA-APPS-V2.md)

**Estado:** documentación en rama, sin implementación ni despliegue.
