# 10 · Manual maestro de diseño de Formación · V1

**Estado:** especificación para prototipo UI Lab; no implementación ni aprobación visual. **Regla:** ADN de Landing + lenguaje operativo de Studio + composición audiovisual del mockup real, con más espacio y menos controles. Este documento no sustituye la prompt V3 ni el catálogo.

## A. Jerarquía de fuentes
1. Founder: mockup Formación con vídeo arriba, hoja deslizable y mini-player; imágenes Estudio de Operaciones como referencia del software operativo; nunca copiar los colores verde/oscuro del mockup.
2. Código real de `apps/ui-lab/src/vendor/landing/{Landing.jsx,ProductScene.jsx,landing.css}`, `apps/ui-lab/src/vendor/studio/{BusinessCommandStudio.tsx,studio.css}` y `apps/ui-lab/src/design-system/agntia-tokens.css`. Reinspeccionar en commit base.
3. Auditorías `19-general/superficies-transversales/AUDITORIA-ESTUDIO-DEMO-VS-LANDING-2026-11-23.md` y `19-general/galeria-branding/AUDITORIA-BRANDING-UX-Y-MOTION-2026-11-23.md`.
4. Manual legacy `01-landing/legacy/design-system-agntiapro/02-identidad-tokens.md`, `03-componentes-patrones.md`, `04-interaccion-motion.md`, `06-calidad-gobernanza.md` y `07-prompt-agentes.md`. Legacy = referencia, no garantía de implementación.
5. `../PROMPT-MAESTRA-FORMACION-V3-SPOTIFY.md`, `../DESIGN-ALGORITMO-DISCOVERY-LEARNING-V2.md`, `../METADATA-120-CURSOS.json` y campaña 01–09.

## B. Identidad comprobada documentalmente
| Rol | Referencia de código/guía | Aplicación en Formación |
|---|---|---|
| Papel | #fcfaf6 | fondo del workspace |
| Superficie | #fff | ficha, mini-player claro, controles |
| Tenue | #f2efe8 | grupos secundarios, placeholders |
| Tinta | #242421 | textos y controles de mayor contraste |
| Secundario | #6e6c66 | metadatos |
| Borde | #e6e1d8 | separación de capas |
| Violeta | #6550dd | selección, progreso, foco, CTA |
| Oro | #b49665 | detalle editorial LAIA |
| Lila tenue | #f0ecfc | estado activo secundario |

**Implementación:** consumir tokens activos y alias, no hardcodear la tabla ni la paleta divergente de la prompt V3. No introducir el verde del mockup ni una superficie negra general. El vídeo sí puede usar overlay oscuro local para subtítulos legibles.

**Tipografía:** Fraunces 400–500 para título de colección/serie, máximo 1–2 momentos editoriales visibles; Manrope 400–800 para controles, títulos de episodios, duración y descripción. Escalas de referencia de la guía: H1 28–40px, H2 20–28, cuerpo 14–16, caption 12–13; probar `clamp`, no imponer tamaños sin screenshot. Interlineado titular 1.1–1.25, cuerpo 1.45–1.65.

**Espaciado:** unidad 4px, escala 4/8/12/16/20/24/32/40/48/64/80. La crítica a Studio cita padding 20px y gaps 14–16px: Formación debe **respirar más** alrededor de su escena principal; los controles interiores pueden seguir compactos. Propuesta a probar: espacio entre secciones 32–48 móvil y 48–64 escritorio, padding sheet 20–28 móvil, 32–40 desktop; no son tokens canónicos.

**Superficies:** botones 8–9px, cards 12–16px, paneles grandes 18–24px según guía; el sheet puede usar radio superior 24–32px como excepción motivada por gesto y mockup, verificar con diseño real. Bordes finos y sombras suaves; evitar tres cards anidadas.

## C. Gramática visual específica de Formación
- **Escena:** portada/vídeo protagonista con proporción legible, sin miniaturas que compitan. Retratos/arte aprobados; ausencia de vídeo = portada estática + «próximamente», no control play funcional.
- **Sheet:** superficie cálida y estable con tirador visible, cabecera de título, acciones secundarias reducidas y tabs; se ve como una extensión natural del shell, no un modal importado de otra app.
- **Episodios:** filas abiertas, miniatura 16:9, título Manrope, una línea de intención, duración solo si verificada, menú contextual; no bordes por fila salvo selección.
- **Biblioteca:** hero + colecciones horizontales + continuidad, sin cinco grids iguales. Portadas 1:1 colección, 4:3/16:9 serie, 9:16 reel.
- **Mini-player:** progreso real o demo explícito, controls compactos, contraste accesible, área reservada en layout y coexistencia con FAB/chat.
- **Modo:** Trabajo/Aprender/Explorar elegido por persona, no por reloj; modo aprendizaje admite sesiones largas voluntarias.

## D. Composiciones y estados obligatorios
**Home desktop:** título editorial + hero audiovisual + continuar + dos estanterías de densidad variable; columna local opcional solo si cabe sin duplicar shell. **Detalle desktop:** escena dominante con panel lateral o inferior amplio; no imitar inspector/timeline de Studio. **Móvil:** hero y sheet de tres snaps, mini-player y navegación real; no dibujar status bar falsa.

Para cada componente documentar: estado normal, hover/focus, pressed, disabled, loading, empty, error, contenido largo, zoom 200%, ancho 320px, sin media y reduced motion. No inventar botones de descarga si no existe recurso legal y descargable.

## E. Lo que se rechaza
- Curso genérico de LMS, dashboard de KPIs o estética Spotify verde.
- Layout Studio de inspector+visualizador+timeline calcado.
- Cards anidadas, huecos sin propósito, botones simultáneamente dominantes, iconos de librerías mezcladas.
- «Motion premium» entendido como glow, parallax constante, blur grande, scroll-jacking o animar cada fila.
- Fingir reproducción, progreso, permisos, licencia, duración o ejecución de LAIA.

## F. Criterio de aceptación
«¿Se reconoce AgntiaPro por tipografía, tacto, materiales, controles y movimiento, pero se entiende inmediatamente que Formación es una biblioteca audiovisual?» Si no, FAIL. Además, debe sentirse más abierta que Studio y conservar la excelencia editorial de Landing. Validar con capturas reales y aprobación founder.
