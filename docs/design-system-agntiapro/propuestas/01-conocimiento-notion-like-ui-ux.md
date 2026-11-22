# Mini-auditoría UI/UX 01 — Conocimiento
Fecha: 2026-11-22 · Estado: propuesta documental, no implementación.

## Encargo y límite
Transformar la pantalla «Conocimiento» de AgntiaPro en un **workspace documental estilo Notion**, manteniendo el branding premium de la landing. El usuario quiere organizar visualmente conocimiento por actor (IA, agente o trabajador humano), proyecto y sector; editar manualmente o con ayuda de la conversación IA; y que el diseño sea igualmente natural con Notion externo o almacenamiento propio. **Aquí se documenta únicamente interfaz y experiencia visual**, no APIs, bases de datos, conectores, backend ni implementación funcional.

## Evidencia inspeccionada
Captura móvil del usuario (22-11-2026): barra superior con menú/estado/notificaciones/búsqueda/añadir; título «Conocimiento» y contador «8 de 8 entradas»; bloque de búsqueda y 8 chips en varias filas; tarjetas blancas grandes con texto, categorías, etiquetas, fuente, antigüedad, lápiz y papelera; botón flotante de chat sobre la tarjeta inferior.

Código: `apps/web/src/components/MemoryView.tsx` en rama `docs/design-system-agntiapro-master-20261122`. Vista limitada a `maxWidth: 820`, encabezado `v2-tasks-*`, bloque `v2-composer`, chips `v2-pill`, `v2-tag`, tarjetas de `style` inline y modal para edición. Categorías fijas empresa, cliente, proceso, preferencia, rrhh, producto, otro. No hay en este componente navegación documental por actor/proyecto/sector, ni edición de página tipo documento.

También existe `apps/web/src/workspaces/32-notion/`, pero `docs/01-ui-map.md` y `docs/03-spec.md` siguen marcando mockup/layout como pendientes. No afirmar que sea una interfaz ya conectada. `apps/web/src/index.css` conserva tokens legacy diferentes de la landing.

## Diagnóstico visual — móvil
**P1** La cabecera + bloque de búsqueda + chips consumen la mayor parte del primer viewport, antes de acceder al contenido.
**P1** Las tarjetas individuales y sus grandes espacios verticales dan apariencia de «historial de notas», no biblioteca de conocimiento.
**P1** Ausencia de jerarquía documental: no se distinguen páginas, colecciones, ubicaciones ni agrupaciones.
**P1** El FAB de chat se superpone a controles de la tarjeta inferior. La composición debe reservar área segura o integrar el acceso en la navegación.
**P2** Metadatos «You 40d» y etiquetas se dispersan; requieren línea secundaria compacta y consistente.
**P2** Filtros como 8 chips permanentes crean ruido y saltos de línea.
**P2** La tipografía y componentes V2 no expresan completamente Fraunces+Manrope, papel cálido y ritmo editorial premium.

## Diagnóstico visual — PC (código, no screenshot)
**P1** El límite `maxWidth: 820` y una única columna de tarjetas no aprovechan escritorio para navegación documental.
**P1** No hay una composición tipo sidebar + documento + panel opcional.
**P2** Los estilos inline dificultan consolidar tokens, estados y variantes responsive.
**P2** Modal de edición, en lugar de una superficie documental visualmente continua.
No se ha inspeccionado una captura PC real; confirmar composición efectiva con navegador antes de implementar.

## Objetivo visual
«Una biblioteca editorial viva, no una lista de memorias». Inspiración en el modelo de páginas y bases de datos de Notion, pero identidad inequívocamente AgntiaPro. Conocimiento como espacio ordenado de documentos y vistas, donde la IA puede acompañar la edición sin dominar el canvas. Los orígenes externos o internos se presentan con el mismo lenguaje visual, sin crear dos productos estéticos.

## Propuesta móvil
1. Conservar shell general sin duplicar cabeceras. Cabecera del workspace: título editorial «Conocimiento» y una sola acción contextual discreta; contador en texto secundario, no compitiendo con H1.
2. Navegación documental: breadcrumb compacto «Conocimiento / [espacio]» y selector de ámbito en una línea, nunca ocho chips permanentes.
3. Búsqueda: icono y campo que se expande al activarlo, con filtrado visual de alcance claro.
4. Vista inicial: grupos/páginas en lista con icono simple, título Manrope semibold, subtítulo truncado a 1–2 líneas, fecha/autor secundarios y chevron discreto. Divisores sutiles en vez de una tarjeta grande por recuerdo.
5. Filtros «Actor», «Proyecto», «Sector» y «Tipo» como barra compacta horizontal con sheet de filtros; distinguir IA/agente/humano mediante etiqueta textual e icono, nunca solo color.
6. Vista de documento: lienzo de papel cálido o blanco, título Fraunces medido, cuerpo Manrope, bloques con ritmo vertical, edición inline, barra de herramientas contextual mínima.
7. Conversación: acceso integrado con el shell existente, sheet inferior estilo Maps, varios puntos de expansión, safe areas, teclado sin solapamientos y sin segundo FAB encima de controles.
8. Cambiar entre biblioteca/documento preserva visualmente contexto, scroll y título; transiciones 180–260 ms, reduced motion.
9. Responsive 360/390/430/640/768: chips sin overflow, targets >=44px, contenido visible sobre teclado, bottom padding para navegación flotante.

## Propuesta PC
1. Estructura tres zonas **opcionales**: árbol lateral estrecho (aprox. 220–260px), documento/biblioteca central flexible, panel derecho contextual plegable (aprox. 280–340px). No imponer panel derecho cuando no aporta valor visual.
2. Cabecera de documento con breadcrumbs, título, metadatos discretos y toolbar contextual; nada de botones enormes.
3. Biblioteca con selector visual de vistas: lista, tabla, galería compacta; la composición no prescribe las capacidades reales.
4. Agrupaciones visuales por actor, proyecto, sector y espacio; iconografía uniforme y filtros compactos.
5. Documento central con ancho de lectura aprox. 720–860px, centrado, gran respiración, tipografía legible y jerarquía H1/H2/H3.
6. La conversación se acopla como panel colapsable y no desplaza el documento a un ancho ilegible; bajo anchura insuficiente se convierte en overlay/sheet.
7. Densidad adaptable: biblioteca «comfortable», tabla «compact», lectura «airy». No cambiar la marca entre modos.
8. A 1024px colapsar árbol y panel derecho según contenido; a 1440/1920 preservar ancho de lectura sin estirar párrafos.

## Gramática visual AgntiaPro
Fondo #fcfaf6, superficie #fff, tinta #242421, texto secundario #6e6c66, borde #e6e1d8, violeta #6550dd, lila #f0ecfc y oro #b49665 en microdetalles. Fraunces para título de página/documento, Manrope para texto y controles. Espaciado base 4px, escalas 8/12/16/24/32; bordes 1px, radios 8–14px, sombra casi invisible. El violeta señala foco/selección, no todas las etiquetas. Íconos lineales 16–20px. Contraste WCAG AA y foco visible.

## Wireframe textual móvil
```
[Shell global existente, compacto]
Conocimiento                  [···]
Espacio / Biblioteca          [⌄]
[⌕ Buscar documentos ...]
[Todos] [Actor⌄] [Proyecto⌄] [Sector⌄]
─────────────────────────────
▤  Empresa
   12 páginas · actualizado...
─────────────────────────────
◫  Estudio Lumen
   Cliente · Finanzas · editado...
─────────────────────────────
▤  Política de atención
   Proceso · Responsable...
─────────────────────────────
[Chat contextual como sheet del shell]
```
Es una representación de **composición**, no datos ni navegación implementados.

## Wireframe textual PC
```
[Shell global]
[Árbol/espacios] | [Breadcrumb  ·  búsqueda  ·  filtros] | [Panel opcional]
                 | Conocimiento.                      |
                 | [Lista] [Tabla] [Galería]          |
                 | ─ Documentos agrupados ─           |
                 | [Abrir documento: canvas editorial]|
[Chat acoplado opcional; preservar ancho legible]
```

## Referencias de componentes CSS (solo inventario de transformación)
- `apps/web/src/components/MemoryView.tsx`: contenedor, encabezado, chips, tarjetas y modal — reemplazo visual propuesto en fase futura.
- `apps/web/src/index.css`: clases `v2-tasks-*`, `v2-composer`, `v2-pill`, `v2-tag`, estilos `.memory-*` y `.view-memory-*`; revisar selectores reales antes de editar.
- `apps/web/src/design-system/agntia-tokens.css`: fuente de tokens visuales.
- `apps/web/src/landing/landing.css`: referencia estética y tipográfica.
- `apps/web/src/workspaces/32-notion/`: área candidata de diseño, no interfaz implementada verificada.
No se recomiendan cambios de APIs, esquemas ni conexiones en esta mini-auditoría.

## Estados visuales
Biblioteca vacía con invitación editorial discreta; carga con skeleton de filas; búsqueda sin resultados con recuperación de filtros; selección clara; hover sutil; documento en edición sin modal intrusivo; error visual contextual; panel conversacional abierto/cerrado; modo lectura; contraste y reduced motion. Los estados no implican comportamiento backend.

## Criterios de aceptación visual
- Móvil: en el primer viewport aparece contenido documental real o un empty state útil; no 3 filas de chips.
- La lista ocupa menos altura por entrada y presenta jerarquía clara.
- Se distinguen visualmente actor, proyecto y sector sin ensuciar la interfaz.
- Ningún botón flotante tapa edición, texto o navegación.
- Documento abierto se siente como un editor, no como modal de tarjeta.
- PC: árbol lateral, canvas central y panel opcional se acomodan sin huecos extraños.
- Identidad visual alineada con landing; cero nuevos colores/fuentes arbitrarios.
- Capturas comparadas a 360,390,768,1024,1440,1920; teclado móvil, foco, contraste y reduced motion.
- El origen Notion o propio no produce dos estilos visuales distintos.
- No hay cambios funcionales en esta fase.

## Pendiente para siguiente ronda
Solicitar captura PC real y, si es posible, screenshot de un documento abierto; verificar diferencias entre rama, producción y shell global. Obtener aprobación estética antes de cualquier implementación.

## Estado
**Documentación solamente.** Sin modificaciones de código UI, sin tests de navegador, sin merge, sin deploy.
