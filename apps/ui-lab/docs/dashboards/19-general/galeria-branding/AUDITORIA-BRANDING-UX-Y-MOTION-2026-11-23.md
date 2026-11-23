# Auditoría de branding UX — landing, Estudio Demo y movimiento

**Fecha:** 2026-11-23 · **Tipo:** auditoría documental y estática de componentes CSS/React, sin render en navegador ni pruebas visuales automatizadas. **Estado:** backlog de diseño; NO implementar aún.

## Dictamen

La **landing nueva es la referencia visual principal**, y el **Estudio Demo** está bastante alineado con su identidad, pero la **guía/galería de branding no alcanza el nivel de especificación necesario para reproducir la calidad de ambos**. La valoración cualitativa previa fue: fidelidad de colores/tipografía de la guía 7/10, reproducibilidad del diseño completo 4/10; alineación del Estudio Demo con landing 8,5/10. Son juicios orientativos, no mediciones.

El founder confirma un déficit compartido en **landing y Estudio Demo**: faltan **transiciones de acabado profesional de primer nivel, cascadas leves y coreografía cinematográfica al entrar y salir**. No confundir esa aspiración con efectos espectaculares o animación constante.

## Evidencia de código inspeccionado
- `apps/ui-lab/src/vendor/landing/landing.css`: tokens `#fcfaf6`, `#242421`, `#6e6c66`, `#e6e1d8`, `#6550dd`, `#b49665`; Fraunces/Manrope; composición hero de dos columnas, marco de retrato arqueado, tarjeta flotante, capas, sombras, estados hover y animaciones puntuales.
- `apps/ui-lab/src/vendor/landing/ProductScene.jsx`: demostraciones visuales de superficies de producto y jerarquía.
- `apps/ui-lab/src/design-system/agntia-tokens.css`: tokens compartidos opt-in utilizados por Estudio Demo.
- `apps/ui-lab/src/vendor/studio/BusinessCommandStudio.tsx`, `studio.css`: inspector, visualizador, timeline, pestañas Kanban/Grafo/Digital Twin/Empresa 360°, estados y controles.
- `apps/ui-lab/src/BrandGallery.tsx`: actualmente muestrario simple de marca, paleta y tipografías; no documenta suficiente dirección de arte, composición, componentes ni motion.
- Prompts de Apps y Formación aún contienen colores de referencia divergentes (p. ej. `#FDFBF7`, `#211D18`, `#5B4BDB`, `#C9A86A`): deben remitirse a los tokens efectivos, no crear una segunda marca.

## Brechas prioritarias de la guía
1. **Fuente de verdad:** mapear tokens efectivos de landing a design system y establecer reglas de precedencia; evitar duplicación de valores cromáticos en prompts.
2. **Dirección editorial:** documentar escala fluida, pesos reales (Fraunces 400 en títulos de landing), tracking, espaciado, ritmo de sección, uso del vacío y jerarquía.
3. **Composición avanzada:** documentar hero, fotografías, encuadres, máscaras, tarjetas flotantes, profundidad, capas, estados y cómo adaptar esos patrones a herramientas de trabajo sin convertirlas en landing.
4. **Componentes reales:** inventariar variantes de botones, tabs, controles, paneles, tarjetas, inputs, badges, estados de carga/vacío/error y focus visible; extraer patrones reutilizables.
5. **Motion system compartido (brecha principal reconocida por el founder):** definir entradas, salidas, cascadas, continuidad entre vistas y microinteracciones; no basta con `transition: .2s` genérico.
6. **Pruebas:** establecer revisión desktop/móvil, teclado, reduced-motion, rendimiento y capturas antes/después.

## Dirección de movimiento solicitada: «coreografía cinematográfica sutil»
**Principio:** la interfaz debe sentirse dirigida, no animada por animar. Entrada con jerarquía y cadencia; salida coherente que preserve continuidad espacial. Cascadas muy leves entre bloques relacionados, nunca oleadas largas ni cada fila retrasada artificialmente.

- **Entrada de página:** aparición del fondo y estructura sin flash; encabezado y texto principales revelados de forma breve; imagen/visualizador se asienta con desplazamiento mínimo y opacidad; elementos secundarios entran en secuencia sutil.
- **Salida/transición de ruta:** desvanecimiento breve y/o desplazamiento mínimo coherente con dirección de navegación; evitar pantalla vacía y saltos de layout; respetar el estado de navegación.
- **Cambio de pestaña/escena:** continuidad de contenedor, transición del contenido sin remontar toda la pantalla ni resetear scroll/selección.
- **Cascada:** grupos semánticos (título → apoyo → acción → contenido), no animar individualmente cientos de elementos; evitar retrasar la disponibilidad de controles.
- **Microinteracciones:** hover, press, focus, selección, overlays, diálogos, paneles y feedback con curvas de aceleración coherentes.
- **Scroll:** revelados solo cuando aportan jerarquía; no repetir animación al volver a un elemento ni ocultar contenido esencial hasta que un observador lo active.
- **Accesibilidad:** `prefers-reduced-motion: reduce` elimina desplazamientos, parallax y secuencias; conservar cambios de estado legibles. Focus visible, teclado y lectores de pantalla no dependen de animación.
- **Rendimiento:** preferir `transform` y `opacity`; evitar animar layout costoso, grandes blur/filter y efectos que generen jank en móviles; no bloquear interacción.
- **Especificación inicial a prototipar, NO tokens aprobados:** feedback 120–200 ms; transición entre paneles 200–350 ms; entrada de sección 350–600 ms; stagger leve 35–70 ms entre 3–5 grupos. Ajustar tras pruebas visuales, sin imponer tiempos universales.

## Criterios de aceptación de la futura guía V2
- Cualquier agente puede construir una pantalla nueva que conserve la misma identidad sin copiar una landing completa.
- Los valores de tokens y componentes se referencian desde el código vigente.
- Existe un catálogo con ejemplos **estáticos y animados** de patrones, variantes y estados.
- Se comparan **landing, Estudio Demo y una tercera pantalla** en escritorio y móvil.
- Las transiciones de entrada, salida y cambio de vista se perciben deliberadas, suaves y coherentes; no hay flashes, saltos, animaciones excesivas ni regresiones de accesibilidad.
- La aprobación final es visual del founder, no solo pasar typecheck.

## Alcance
Este archivo registra decisiones y déficits; **no afirma que se hayan implementado transiciones nuevas** ni que exista una revisión de navegador. No cambiar producción, no crear rama ni campaña de implementación sin nueva instrucción.

## Hallazgo posterior: documentación preexistente en ramas (2026-11-23)
**Corrección del alcance inicial:** se localizó documentación más completa, no visible en la galería de UI Lab de main. Antes de escribir una nueva guía V2 o planificar campañas, **reutilizar y reconciliar** estas fuentes; no duplicar trabajo ni asumir que estén integradas:
- [Sistema maestro de diseño (rama `docs/design-system-agntiapro-master-20261122`)](https://github.com/uniscrolliabrain-cloud/agente/tree/docs/design-system-agntiapro-master-20261122/docs/design-system-agntiapro): `01-auditoria-fuentes.md`, `02-identidad-tokens.md`, `03-componentes-patrones.md`, `04-interaccion-motion.md`, `05-workspaces-runtime.md`, `06-calidad-gobernanza.md`, `07-prompt-agentes.md` y README. `04` especifica tiempos y principios de motion, pero no declara implementación.
- [Motion Design Premium landing (rama `feat/landing-premium-funnel`)](https://github.com/uniscrolliabrain-cloud/agente/blob/feat/landing-premium-funnel/docs/landing/motion-design-premium/README.md): propuesta **NO implementada**, taxonomía M0–M6 y campañas C00–C08, hero LAIA, reveals, ProductScene, transiciones de tabs, chat, equipo, CTA, reduced-motion y QA. **Es una fuente de detalle superior a esta auditoría** para la landing.
- [Auditoría y campaña de Business Command Studio](https://github.com/uniscrolliabrain-cloud/agente/tree/docs/design-system-agntiapro-master-20261122/docs/audits/2026-11-22-business-command-studio): `01-audit.md`, `02-campaign.md`, `03-validation.md` en la rama de sistema maestro. El plan C0–C6 incluye identidad, composición, motion, responsive y validación.

**Acción futura:** contrastar las ramas contra `main` archivo por archivo, verificar qué código/documentación ya se integró y qué propuestas siguen pendientes; consolidar la fuente de verdad sin hacer merge ciego. No se ha importado código ni ejecutado ninguna campaña.
