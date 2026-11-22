# Conocimiento agéntico — Notion V1 (UI Lab)

## Alcance aprobado
La entrada «Conocimiento» contiene seis pestañas horizontales: **Documentos, Wiki, Investigación, Memoria, Grafo y Gobernanza**. **Solo Documentos** tiene UX desarrollada en esta primera iteración. Las otras cinco muestran un estado explícito de futura implementación; no se simulan capacidades operativas.

## Diseño y navegación
- Se conserva el menú principal de AgntiaPro fuera del workspace (el shell del UI Lab representa su contenedor).
- Dentro de Documentos hay una **columna de iconos de 47 px**, con tooltip nativo al pasar el ratón y nombres accesibles; al lado, un árbol contextual de páginas de 216 px que puede ocultarse.
- En móvil, el árbol pasa a un **drawer** con fondo modal; la columna de iconos permanece compacta. La pestaña superior se desplaza horizontalmente. Es una hipótesis UX pendiente de prueba, no una decisión definitiva.
- El editor ocupa todo el ancho disponible con una columna de lectura de máximo 770 px. Sin dashboards, KPIs ni tarjetas de navegación.
- Diseño de referencia: jerarquía de páginas y edición directa de Notion, adaptadas a tokens cálidos de AgntiaPro. No se copia código, marca ni activos de terceros.

## Datos sintéticos
Fixtures en `apps/ui-lab/src/KnowledgeNotionLab.tsx`: AgntiaPro (empresa en lanzamiento), Producto y plataforma, Equipo de agentes, Operaciones, Comercial y lanzamiento y Notas de reuniones. No se conectan APIs, no se escriben datos persistentes, y no se ejecutan acciones del runtime. El editor, creación de páginas y búsqueda funcionan solo en memoria de la sesión.

## Auditoría inicial
1. **Riesgo de navegación duplicada:** el menú principal de AgntiaPro y la barra interna de herramientas pueden competir. Verificar en ancho 390 px y 768 px.
2. **Tooltips:** hover nativo sirve para escritorio; en móvil, botones con nombres accesibles y navegación contextual. No depender de hover para acciones críticas.
3. **Edición:** la versión actual es un editor lineal de líneas y encabezados, **no** un motor de bloques Notion completo; faltan selección de bloques, arrastrar, formato enriquecido, historial y persistencia.
4. **Integración:** los datos de Conocimiento no deben mezclarse con memoria del runtime ni RAG sin contratos, procedencia y permisos.
5. **Permisos:** futuras vistas Memoria/Gobernanza necesitan aislamiento por tenant, actor y objeto; no aceptar datos de terceros en fixtures sin autorización.

## Campañas secuenciales
### C01 — Prototipo y evaluación visual (implementado en rama)
Archivos: `apps/ui-lab/src/KnowledgeNotionLab.tsx`, `knowledge.css`, `registry.tsx`.
Criterios: seis pestañas visibles, solo Documentos funcional; búsqueda Ctrl/⌘+K, árbol expandible, añadir páginas, edición y navegación móvil. Todos los datos sintéticos.

### C02 — Revisión de UX real (pendiente)
Comparar la navegación con el menú izquierdo existente en producción; medir densidad, scroll, foco, accesibilidad y comportamiento del drawer móvil. Decidir si la rail debe ocultarse en móvil y sustituirse por un botón único. Registrar capturas 390/768/1440.

### C03 — Editor de bloques (pendiente)
Evaluar TipTap/ProseMirror u otro motor de edición. Requisitos: bloques, markdown, teclado, historial, drag & drop, enlaces internos y colaboración eventual. No instalar librerías sin evaluación de coste y seguridad.

### C04 — Contratos de backend (pendiente)
Definir `Page`, `Block`, `Revision`, `Permission`, `Citation` y eventos append-only; guardar por tenant y workspace, con autorización deny-by-default, control de versiones, auditoría y migraciones.

### C05 — Wiki (pendiente)
Vista enciclopédica con índices, referencias y artículos generados desde fuentes trazables; distinguir borrador, propuesto y publicado.

### C06 — Investigación (pendiente)
Experiencia tipo Perplexity: consulta, fuentes verificables, citas y guardado en Conocimiento; diferenciar web e información corporativa autorizada.

### C07 — Memoria (pendiente)
Ámbitos: empresa, agente, empleado, cliente y proyecto. Procedencia, vigencia, edición, permisos y conflictos de contexto.

### C08 — Grafo y Gobernanza (pendiente)
Explorador de relaciones; misión, visión, cultura, políticas y especialmente permisos granulares con auditoría. Sin autorizar acciones por simple visibilidad de un nodo.

## Validación de entrega
`pnpm --filter @agente/ui-lab typecheck` y `pnpm --filter @agente/ui-lab build` según los scripts reales; CI de UI Lab y prueba manual antes de merge. No modificar `apps/web` en C01.
