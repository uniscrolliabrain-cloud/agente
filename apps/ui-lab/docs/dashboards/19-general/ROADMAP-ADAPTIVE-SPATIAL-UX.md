# AgntiaPro — Adaptive Spatial UX
Fecha: 2026-11-25. Visión del founder. Fuera del scope del PMV de branding. Documento vivo de ideas; no autorización de implementación.

## Ideas originales del founder
- Menú adaptativo: los elementos más utilizados se reordenan para quedar cerca. Settings permitirá tweakear y personalizar ampliamente la lógica del interfaz, shortcuts de teclado y keywords.
- Pantallas infinitas en loop arriba, abajo, derecha e izquierda, tanto PC como móvil. Scroll para cambiar pantallas; en PC click en la zona central del rectángulo revela una flecha tipo slider; en móvil swipe derecha, izquierda y abajo, click arriba para cambiar pantallas.
- Algoritmo que anticipa o intenta anticipar qué necesita el usuario.
- Menú izquierdo de iconos cerrado funciona también como barra espaciadora/desplazamiento: swipe para saltar a subpartes lejanas de un clic (interpretación técnica a validar: barra de navegación espacial/minimapa).
- Botón deslizable del chat transversal abre subpantallas de otros workspaces en columna izquierda o abajo en móvil; al clicar recorre pantallas hasta la deseada.
- Botón convierte una pantalla en ventana flotante de dos o tres tamaños como YouTube o Prime.
- Motion, animaciones, cascadas y transiciones cinematográficas contemporáneas son otra campaña futura, fuera del PMV.

## Propuesta técnica (no decisiones cerradas)
1. SpatialNavigationGraph: nodos workspace/subvista, aristas por dirección, wrap explícito, historial y retorno; no duplicar entidades ni rutas. React + TypeScript, reutilizar shell y router; montar solo vistas activas y precargar vecinos con presupuesto.
2. GestureArbiter: Pointer Events, touch-action por superficie, umbral y dirección dominante; no capturar scroll de tablas, editores, formularios o navegación del navegador. Flechas contextuales en PC con alternativa teclado/foco; móvil respeta zonas seguras y gestos del SO. Loop configurable y salida convencional siempre disponible.
3. AdaptiveMenu: frecuencia, recencia y contexto con decay, ranking estable y cambios discretos; elementos fijados, congelar orden, reset y desactivar. Preferencias por usuario/workspace, no mezclar tenants. Telemetría mínima y transparente.
4. PredictiveNavigation: baseline determinista de transiciones frecuentes, contexto de tarea, hora y recencia; evaluar acierto y latencia, sugerir/precalentar, no navegar sin intención explícita. En futuro Cognition propone y sistema valida; no introducir LLM en gesto crítico.
5. CollapsedSidebarNavigator: modo iconos y modo scrub/minimapa con hit targets, preview de sección, salto confirmado, alternativa accesible; validar qué significa exactamente barra espaciadora con founder.
6. UniversalSecondarySurface: reutilizar MobileChatSheet y chat dock existentes; registro de vistas compatibles, ciclo explícito, abrir en columna izquierda o sheet inferior, expandir a principal, restaurar contexto; no duplicar chat ni montar acciones incompatibles.
7. FloatingWorkspaceHost: tamaños mini/medio/amplio (dos o tres configurables), arrastre, minimizar, restaurar y cerrar; preservar estado mediante store por instancia/entidad; mismo ID y fuente de verdad, no duplicar mutaciones. Picture-in-Picture del navegador no es requisito: overlay React interno funciona en más plataformas; flotación fuera de app sería otra fase.
8. UXBehaviorSettings: presets convencional/adaptativo/espacial, asignación de gestos, shortcuts, keywords, sensibilidad, orden, tamaño de ventanas, predicción y reduced motion. Validar conflictos, export/reset futuro; defaults conservadores.
9. Motion posterior: transiciones compartidas, cascadas, continuidad espacial, animación de objetos; CSS/Motion según necesidad, reduced motion, no bloquear interacción.

## Experimentos y orden futuro
A: inventario shell/router/gestos y prototipo UI Lab con tres workspaces; B: grafo circular y arbitraje scroll; C: sidebar adaptativo y settings; D: subpantallas chat; E: ventanas flotantes y preservación de estado; F: predicción local y medición; G: integración de motion; H: pruebas multidispositivo y accesibilidad; I: auditoría 9+ y aprobación founder. No confundir con roadmaps de branding actuales.

## Gates
No perder scroll, texto sin guardar, foco, historial ni filtros al cambiar vista. No saltos involuntarios, reordenamientos mientras se interactúa ni conflictos con gestos del SO. Probar teclado, lector de pantalla, touch, ratón, reduced motion, memoria y latencia. Mantener navegación tradicional. No tocar backend/kernel/runtime/tenancy ni desplegar producción en esta fase documental. Las ideas son técnicamente viables en aplicación web, pero compatibilidad de gestos y ventanas fuera de la app requieren validación específica. No se ha implementado ni probado nada de esta campaña.

## Principio del founder: profundidad opcional, no intrusiva
Las interacciones reutilizan hábitos digitales conocidos. Si quieres las usas; si no, ni te enteras de que existen. Simplicidad por defecto, profundidad por descubrimiento, personalización por elección. No añadir ruido visual ni tutoriales obligatorios.

## Identidad cromática dinámica — idea del founder
El acento actual es lavanda. En el futuro incorporar siete colores, blanco y negro, combinaciones personalizadas y transiciones cromáticas configurables durante el día. La paleta exacta queda por definir por el founder. Mantener tipografía, composición, materiales, identidad y jerarquía. Propuesta: tokens CSS semánticos, presets y editor de combinaciones, horario local configurable, interpolación gradual, override manual y reset. Separar acento decorativo de colores semánticos de alertas y estados; validar contraste WCAG y reduced motion. No modificar el branding PMV ni implementar ahora.

## Horizonte experimental: UX ambiental y multisensorial
Idea del founder: patrones de iluminación, vibración móvil y frecuencias binaurales sutiles, explorando su relación con ritmos circadianos. Fuera del PMV y de la campaña inmediata. Investigar temperatura cromática, brillo, horarios, háptica y audio estéreo opcional. La influencia circadiana de la luz tiene evidencia, pero no asumir que una interfaz regula ritmos biológicos ni atribuir eficacia clínica a vibraciones o binaurales. Consentimiento explícito, apagado por defecto, control manual inmediato, límites de intensidad y duración, evitar parpadeos y respetar accesibilidad. Validar soporte por navegador/SO: vibración, audio y control de iluminación física tienen restricciones distintas. No implementar ni formular promesas terapéuticas sin evidencia.
