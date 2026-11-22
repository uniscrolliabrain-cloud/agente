# 03 — Biblioteca de componentes y patrones
## Contrato general
Cada componente debe tener: nombre, propósito, variantes, tamaño, estado, teclado, accesibilidad, responsive, tokens, eventos, loading/error/empty, test y screenshot. Preferir composición y props tipadas sobre estilos inline arbitrarios. No duplicar componentes sin demostrar diferencia funcional.

## Inventario normativo
### AppShell
Topbar con estado de tenant verificado, búsqueda y nuevo chat; navegación persistente y contextual. Mantener visible la identidad de empresa y el modo demo. El workspace ocupa el área principal. No duplicar nombre de tenant ni toolbar en tres niveles. Sidebars colapsables con persistencia por usuario; cierre de paneles no cambia selección.

### Header editorial
Eyebrow contextual, H1 Fraunces, subtítulo breve, acción primaria derecha y secundarias discretas. En Studio: «Estudio de operaciones.» con punto violeta; etiqueta «Entorno demo» en ACME. No más de una CTA dominante.

### Card
Variantes: información, seleccionable, alerta, resumen, métrica, objeto, vista previa. `hover` solo si interactiva. `selected` claramente diferente de `hover`. Padding 12–24 según densidad; estado deshabilitado semántico; acciones no ocultas exclusivamente tras hover en móvil.

### Button
Primary violeta para acciones destacadas; dark para creación instrumental; secondary de borde; ghost para iconos; danger para destrucción. Estados idle, hover, active, focus-visible, loading, disabled, success/error. Nunca dos primarios compitiendo en una misma zona. Área táctil >=44x44 en móvil, aunque visualmente sea menor. Etiquetas verbales: «Nueva actividad», «Aprobar», «Revisar».

### Tabs y segmentados
Vistas Kanban/Grafo/Digital Twin/Empresa 360° con selección exclusiva; navegación por teclado y rol tablist cuando aplica; preservación de selección de objeto y filtros al cambiar de vista; evitar re-fetch destructivo. Indicador activo con superficie tinta y contraste adecuado.

### Inspector
Panel contextual único, muestra selección, responsable, proyecto, evidencia, dependencias y acciones permitidas. Si no hay selección: estado vacío útil. Si objeto no existe o es de otro tenant: error seguro, nunca fallback a datos ajenos. En móvil se transforma en sheet accesible.

### Kanban
Columnas semánticas Pendiente/En curso/Revisión/Aprobación/Completado, contadores reales, tarjetas con prioridad, responsable y tiempo. Scroll horizontal contenido, no de toda la página. DnD accesible con alternativa por menú. Mover a Aprobación no significa aprobar.

### Timeline
Pistas por persona/agente/proceso; escala de tiempo, cursor presente, scrubbing, zoom, play/pause y vuelta a ahora. La reproducción histórica es visualización, no reejecución. Indicadores diferentes para hechos, tareas futuras y simulaciones. Al seleccionar clip sincronizar inspector y demás vistas. Debe existir alternativa tabular accesible.

### Grafo
Nodos tipados y aristas con significado; layout estable; zoom/fit; filtros; inspector sincronizado; explicar causalidad sin inventarla. Para grafos grandes: agrupación progresiva y búsqueda. Alternativa en lista jerárquica.

### Digital Twin
Etiqueta visible «Simulación» y escenario/versionado. Variables, supuestos, horizonte y nivel de confianza; comparación A/B; jamás mutar datos reales desde un preview. Aplicar cambios solo vía plan y aprobación.

### Empresa 360°
Perspectiva transversal, no otro dashboard duplicado: clientes, agentes, proyectos, finanzas, procesos y riesgos conectados. Acceso progresivo a detalles y origen de métricas.

### Métrica y briefing
Mostrar periodo, origen, unidad y actualización. En demo, badge y texto de datos ficticios; en real, vacío verdadero cuando no hay datos. No inventar conversaciones, ingresos ni resultados.

### Chat acoplado
Una única instancia contextual, abre/cierra sin reiniciar workspace; no duplicar FAB cuando está abierto; no tapar botón enviar ni controles del teclado. Ancho adaptable; en móvil bottom sheet con snap points, safe-area y comportamiento de teclado probado.

### Videoconferencia
Modo dentro del chat, no aplicación independiente. Agente seleccionado, nombre, rol, estado de sesión y controles micro/cámara/finalizar. Si avatar o llamada son demo, etiqueta explícita. Debajo del vídeo: «Ideas destacadas» estructuradas con timestamps, autor, tipo (idea/decisión/tarea/riesgo) y origen. Tras finalizar: reporte persistido solo si el backend confirma guardado; mostrar fallo y reintento sin pérdida silenciosa. Consentimiento y privacidad visibles.

### Switch de agente
Cambiar entre especialistas conserva objeto de trabajo, tenant y contexto autorizado; no arrastrar permisos del agente anterior. Señalizar handoff, responsable actual y estado de la llamada.

### Formularios
Label visible, ayuda concisa, validación contextual, errores por campo, guardado explícito, estados de envío y confirmación real. No confirmar reservas o acciones en demo. Modal solo para decisiones importantes; drawers para edición contextual.

### Notificaciones, toasts y aprobaciones
Toast transitorio para feedback no crítico; inbox persistente para decisiones; aprobaciones con impacto, actor, motivo, permisos, vencimiento y reversibilidad. «Aprobado» solo tras confirmación del servidor.

### Skeleton/empty/error/offline
Skeleton que refleje estructura; empty que explique siguiente acción; error con reintento; offline con estado de sincronización. Nunca sustituir error de red por datos de ejemplo. Fallback demo requiere selección explícita del modo.

## Reglas de contenido
Voz cercana y precisa, sin jerga de runtime; verbos claros; evitar «IA mágica». En UI de operaciones: «Pendiente de tu aprobación» mejor que «waiting_approval». Números y fechas en español local, zona horaria visible cuando importa.

## Checklist de componente
¿Usa tokens? ¿Existe componente equivalente? ¿Teclado completo? ¿Focus visible? ¿Touch? ¿Reduced motion? ¿Estado vacío/error? ¿Tenant? ¿Demo? ¿Selección sincronizada? ¿Prueba visual en 360/390/768/1024/1440? ¿Sin doble CTA? ¿Sin texto inventado?
