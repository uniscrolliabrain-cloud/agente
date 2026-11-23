# AgntiaPro · referencia de interfaz

La landing premium desplegada en `113dcb7` es la **fuente visual de verdad**. Referencia: `apps/web/src/landing/Landing.jsx`, `landing.css`, `ProductScene.jsx`; no inventar otra identidad para cada workspace. Este estándar traduce esa estética a una herramienta de trabajo, no rediseña el resto del producto.

## Tokens y jerarquía

| Uso | Valor |
| --- | --- |
| Papel | `#fcfaf6` |
| Superficie | `#ffffff`, secundaria `#f2efe8` |
| Tinta | `#242421` |
| Texto secundario | `#6e6c66` |
| Línea | `#e6e1d8` |
| Acento funcional | `#6550dd` |
| Oro de firma | `#b49665`, solo detalles de marca |
| UI | Manrope, fallback system-ui |
| Títulos editoriales | Fraunces, fallback Georgia; uso medido |

Usar `BrandMark`/`BrandLockup` existentes, sin duplicar el nombre al lado ni recrear avatares. Fotografías originales de `public/landing/`; sin cambiar caras. No colocar un logo dentro de cada panel.

## Gramática

Superficies tranquilas, bordes cálidos de 1 px, radios 8–16 px, sombras amplias de baja opacidad. Texto de controles legible; jerarquía por tamaño, peso y espacio antes que por color. Títulos de trabajo 24–30 px, paneles 18–22 px, UI 12–14 px; nunca titular de landing ocupando medio dashboard. Una acción primaria por contexto. Violeta para acción/selección, verde/ámbar/rojo solo para semántica necesaria y acompañado de texto.

Iconos Lucide de trazo coherente, marca original para identidad. Controles de icono centrados, nombre accesible y área táctil suficiente. Evitar adornos 3D en zonas de edición: la dimensionalidad de la landing se traduce en profundidad sutil de superficies, no en ruido detrás de datos.

## Movimiento

Hover/foco 180–220 ms, entrada de panel 250–350 ms con desplazamiento pequeño. No animaciones permanentes de tarjetas, brillos o métricas. Reproducción del timeline solo tras acción del usuario. Desactivar transiciones/animaciones decorativas con `prefers-reduced-motion`; mantener la funcionalidad.

## Cómo pedir nuevas interfaces a un agente

«Lee esta guía y los tokens Agntia. Usa la landing premium como referencia visual, reutiliza marca/componentes y audita las fuentes reales antes de conectar datos. Explica qué es demo. Conserva shell, autenticación, permisos y navegación. Presenta una composición responsive, accesible y con estados vacíos/errores verificables. No rediseñes otras pantallas de paso.»

## Checklist de aceptación visual

- Cabecera de una sola línea en escritorio; sin duplicación de marca/empresa/acciones.
- En Studio: inspector + preview arriba, pistas a todo el ancho debajo; cero hueco artificial.
- Foco visible y selección compartida entre paneles; contenido no cortado por menús.
- 1440/1280 px escritorio, 768 px tablet, 390/320 px móvil; scroll local cuando se necesita comparar pistas.
- Paleta y tipografía fieles a landing incluso si hay CSS legacy o tema global oscuro.
- Datos demo identificados; simulación y resultados reales nunca confundidos.
