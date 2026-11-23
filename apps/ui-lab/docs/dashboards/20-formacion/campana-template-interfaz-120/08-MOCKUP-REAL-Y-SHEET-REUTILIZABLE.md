# 08 · Mockup real de Formación + reutilización del chat transversal

**Fecha:** 2026-11-23. **Origen:** imagen facilitada por el founder en conversación (captura de concepto de Formación con serie IA Act). **Estado:** dirección de composición confirmada, no especificación exacta de marca ni prueba de componentes implementados.

## 1. Qué sí indica el mockup

- Cabecera del shell con identidad, estado, notificaciones, búsqueda y avatar; NO crear una segunda cabecera.
- Navegación existente y entrada Formación activa; la barra inferior mostrada es ilustrativa y debe reconciliarse con el shell real.
- Vídeo/hero cinematográfico superior con persona, título, categoría, duración, play y controles discretos.
- **Sheet inferior superpuesto y deslizable** con tirador, radio superior generoso, ficha de serie, acciones y tabs «Episodios / Resumen / Recursos / Transcripción».
- Episodios con miniaturas, duración y texto, sin grid administrativo.
- **Mini-player persistente** con progreso y controles, por encima de navegación existente y sin tapar chat transversal.
- Colores oscuros/verde de la maqueta NO son tokens aprobados: adaptar a branding real marfil/tinta/violeta/oro; las imágenes anteriores de Centro de Mando son referencia del lenguaje operativo.

## 2. Auditoría del código de chat encontrada

- `apps/web/src/App.tsx`: estados `chatDock` y `mobileChat`; botón `chat-fab`, apertura/cierre; `SidebarChat variant="sheet"` en móvil.
- `apps/web/src/components/AppShell.tsx`: composición de sidebar y panel contextual; no implementa un sheet arrastrable.
- `apps/web/src/index.css`: `.chat-fab` botón flotante; `.mobile-chat { position:fixed; inset:0; ... }`, hoja móvil **a pantalla completa**, no snap points.
- `apps/web/src/components/SidebarV2.tsx`: `onOpenChat` y entrada de chat.
- `apps/ui-lab/docs/dashboards/04-chat-boton-transversal/README.md`: referencia a `SidebarV2.tsx (onOpenChat)`.

**Hallazgo:** el chat transversal actual es reutilizable como patrón de apertura, estado, shell, z-index, safe areas y lenguaje de controles; **no está demostrado que ya contenga el drag/snap tipo Google Maps**. No afirmar que basta con cambiar el contenido de `SidebarChat`: el sheet Formación requiere un contenedor genérico nuevo, con comportamiento accesible.

## 3. Diseño de componente compartido

Proponer `AdaptiveBottomSheet` presentacional reutilizable, independiente del contenido de chat y cursos. Props: `open`, `onOpenChange`, `snapPoints` (peek, half, full), `initialSnap`, `onSnapChange`, `title`, `children`, `modal`, `dismissible`. Gestos pointer/touch solo en el handle, con threshold y velocidad controlada; no secuestrar scroll vertical del listado de episodios. Teclado: abrir, cerrar y cambiar snap con botones accesibles; `aria-label`, foco y escape; bloquear scroll de fondo solo en modalidad modal. Safe areas, altura de viewport dinámica, reduced motion y restauración de foco.

**Uso Formación:** sheet de ficha de serie (peek/half/full); contenido pestañas, lista de episodios y recursos. En escritorio el mismo contenido vive en panel editorial lateral o debajo del player; no forzar bottom sheet desktop.

**No reutilizar sin adaptación:** `SidebarChat` como contenedor visual de cursos, `.mobile-chat` full screen, ni un overlay que compita con FAB del chat. Reutilizar las primitivas y estilo del shell, y considerar extraer `AdaptiveBottomSheet` para chat solo tras auditoría y pruebas de regresión.

## 4. Primer vertical slice que se debe construir

**V01 · Serie abierta**: cabecera del shell real + hero audiovisual 16:9/4:3 + ficha sheet en móvil con tres snaps + pestañas y episodios con catálogo real + mini-player con estado honesto de media ausente. En escritorio, player y ficha editorial responsive. Priorizar IA Act como **ejemplo editorial de maqueta**, no inventar que figura en el catálogo 120 o que existen vídeos. Sustituir por un curso real canónico en la demo funcional; IA Act solo si se incorpora como serie editorial con datos validados.

**V02 · Descubrimiento**: Home con estanterías, buscar, biblioteca y cambio de modo Trabajo/Aprender/Explorar, reutilizando V01.

**V03 · Integración**: CTA práctica con LAIA y permisos, cola y persistencia; sin prometer ejecución real no comprobada.

## 5. Gate de calidad

Antes de afirmar paridad: render real en desktop/móvil y comparativa con Landing + Studio Demo + mockup Formación. Evaluar composición, arte, transición hero→sheet, control del espacio, navegación, player, superposición con chat FAB y accesibilidad. No hay autorización de despliegue.

## 6. Actualización de decisiones

- El mockup Formación es la referencia principal de **estructura audiovisual**, no de branding.
- Las imágenes de Centro de Mando y timeline son referencia del **branding operativo**, no mockups de Formación.
- La landing define la calidad editorial general.
- Reutilizar chat transversal **sin falsear su implementación actual**.
