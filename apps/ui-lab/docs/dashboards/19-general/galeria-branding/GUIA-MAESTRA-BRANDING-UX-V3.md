# AgntiaPro — Guía Maestra de Branding y UX V3
Fecha: 2026-11-25. Estado: propuesta documental acumulativa, pendiente de aceptación visual del founder. Manual autónomo para agentes de diseño e implementación. No autoriza producción.

## A. Mandato de incorporación: lee este documento entero
Tu misión es crear interfaces originales de AgntiaPro que parezcan diseñadas por el mismo equipo, no copiar pantallas existentes. Este documento contiene el contexto, decisiones, recetas y procedimiento mínimo suficiente para empezar un mockup sin otra conversación. La especificación funcional de cada encargo sigue siendo necesaria: si falta, formula hipótesis explícitas y reversibles, nunca inventes capacidades productivas. Si cuentas con el repositorio verifica los contratos y componentes antes de integrarlos. Entrega un prototipo navegable aislado, no un collage ni un dashboard genérico. La aprobación final pertenece al founder.

AgntiaPro compila y gestiona empresas aumentadas por agentes IA. El empresario habla, delega, supervisa y decide; las personas y agentes trabajan con clientes, procesos y herramientas compartidos. La sofisticación técnica permanece debajo de la experiencia. No es un chatbot, un conjunto de automatizaciones inconexas ni un panel de telemetría. El LLM propone, el kernel y las políticas disponen, los SOPs y capacidades ejecutan, el runtime registra; LAIA presenta y coordina sin ser segunda fuente de verdad. El diseño debe facilitar coordinación, no exhibir complejidad. No cambiar API, permisos, contratos, ejecución, datos reales ni superficies aprobadas para lograr estética.

## B. Canon y precedencia
Según el founder, Landing nueva, Login, Chat, Estudio y Apps son referencias de calidad. Legal es referencia complementaria candidata, inspeccionada estáticamente. Chat transversal conserva patrones de panel y comunicación. Formación, Documentos y Conocimiento NO son canon visual: están en refinamiento aunque tengan implementaciones y múltiples commits. Nunca deduzcas aprobación por número de versión.
Fuentes verificables en main:
- apps/ui-lab/src/vendor/landing/ (Landing.jsx, landing.css, ProductScene.jsx): identidad editorial, retratos, capas, escena de producto.
- apps/ui-lab/src/login-v3/ (LoginV3.tsx, login-v3.css): expansión progresiva, foco, formularios, diálogo, tipografía local.
- apps/ui-lab/src/legal/ (LegalV1.tsx, legal-v1.css): lectura editorial, índice y estados honestos.
- apps/ui-lab/src/chat-ux-v2/ y chat-transversal-v3/: conversación y paneles; ChatPanel, ChatDock, ChatSheet y ChatCall en la segunda carpeta.
- apps/ui-lab/src/vendor/studio/: visualizador, inspector y timeline. Distinguir Estudio Demo de workspace productivo.
- apps/ui-lab/src/apps-launcher/: navegación de espacios, reposo, escritorio, cajón, recientes.
- apps/ui-lab/src/design-system/agntia-tokens.css: paleta opt-in. V2 archivada íntegra abajo.
La autoridad funcional es el código y contrato vigente; la aprobación visual del founder prevalece sobre preferencias genéricas de esta guía. No cambiar una pantalla aprobada para uniformarla. Identidad común no significa layout común.

## C. Recetas ejecutables de composición (propuestas, no componentes certificados)
1. Aplicación editorial de uso diario: fondo papel, cabecera con kicker discreto opcional, H1 Fraunces 32–40, resumen Manrope 14–16, acción principal única a la derecha. Separación 24–32 antes del contenido. Una superficie protagonista, sin hero comercial gigante ni mosaico de KPIs por defecto.
2. Trabajo instrumental: cabecera estable, barra compacta de modos y búsqueda, lienzo principal flexible, inspector contextual bajo demanda. En escritorio de 1440px partir de padding 32, gap 24, inspector 320–360 si abierto; el lienzo debe ganar el espacio al cerrarlo. Si dos paneles abiertos dejan el contenido ilegible, convertir uno en overlay. Estos tamaños son puntos de prueba, no reglas universales.
3. Biblioteca/lectura: diferencia catálogo, selección y detalle; índice contextual, ancho de lectura aproximado 65–75 caracteres, metadatos discretos; seleccionar no debe perder búsqueda ni scroll. No adoptar el diseño actual de Conocimiento o Documentos como aprobado.
4. Conversación: mensajes claros, compositor accesible continuamente, contexto de origen visible, estado de preparación separado de resultado. Panel lateral en escritorio y sheet en móvil; conserva borrador, selección y foco. No inventar conexión a voz, LLM o servicios.
5. Constructor de automatizaciones: lienzo con nodos legibles disparador → condiciones → acciones → revisión → resultado; conexiones de bajo contraste visual con semántica perceptible, inspector de nodo al seleccionar, zoom y desplazamiento accesibles; alternativa lista/teclado. Usa lenguaje humano, muestra límites y aprobaciones. El dibujo no es un motor de ejecución.
6. Launcher: iconos coherentes y agrupación por intención; apertura desde origen, regreso al contexto, objetivos táctiles de 44px como referencia del refinamiento Apps. No simular navegación con botones muertos.
7. Legal/ajustes: jerarquía de lectura, índice y controles desplegables, estado visible cuando no disponible; no convertir sección instrumental en landing.

### C.1 Starter visual autónomo
Usar React + TypeScript y CSS scoped en UI Lab cuando se disponga del repo. Ejemplo CSS de partida, no parche global:
```css
.agntia-workspace.demo-new {
  --ag-paper:#fcfaf6; --ag-surface:#fff; --ag-soft:#f2efe8;
  --ag-ink:#242421; --ag-muted:#6e6c66; --ag-line:#e6e1d8;
  --ag-violet:#6550dd; --ag-lilac:#f0ecfc; --ag-gold:#b49665;
  background:var(--ag-paper); color:var(--ag-ink);
  font:400 14px/1.5 Manrope,system-ui,sans-serif;
  min-height:100dvh; padding:clamp(16px,3vw,40px);
}
.demo-new h1 {font:400 clamp(28px,3vw,40px)/1.12 Fraunces,Georgia,serif;letter-spacing:-.03em;margin:0}
.demo-new .surface {background:var(--ag-surface);border:1px solid var(--ag-line);border-radius:16px;padding:20px;min-width:0}
.demo-new button {font:600 14px Manrope,system-ui,sans-serif;min-height:44px;border-radius:9px;transition:background 160ms,color 160ms,transform 160ms}
.demo-new .primary {background:var(--ag-violet);color:white;border:0;padding:0 18px}
.demo-new :focus-visible {outline:2px solid var(--ag-violet);outline-offset:3px}
.demo-new .layout {display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,340px);gap:24px}
.demo-new .layout.is-closed {grid-template-columns:minmax(0,1fr)}
@media(max-width:900px){.demo-new .layout{grid-template-columns:minmax(0,1fr)}}
@media(prefers-reduced-motion:reduce){.demo-new *, .demo-new *::before,.demo-new *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
```
Use fuentes ya disponibles en el repo (Login/Legal tienen fuentes locales); fallback explícito si no existen. No duplicar tokens si se importa el CSS canónico. Los selectores del ejemplo son deliberadamente locales. No copiar este layout a todos los workspaces.

### C.2 Anatomía y comportamiento
Botón: verbo claro, estado normal/hover/press/focus/disabled/busy, acción destructiva secundaria y confirmación cuando irreversible. Tarjeta: título, contexto esencial, responsable/estado si relevantes, acción explícita, selección no confundida con hover. Lista: fila legible, acción de teclado y menú secundario; filtros persistentes durante navegación, conteos derivados y vacío con recuperación. Formulario: label visible, ayuda/error junto al campo, borrador, guardar/cancelar; progresividad sin esconder datos obligatorios. Inspector: título, contexto, acción primaria y cierre, scroll interno; restaura foco al origen. Diálogo: semántica dialog, foco inicial, Escape, devolución de foco; sheet móvil con safe area, no exigir gesto para cerrar. Tabs: selección y teclado, conservar estado, no remontar toda la shell. Feedback: distinguir pendiente, ejecución, aprobación, éxito, fallo, cancelación y resultado incierto; no falsificar éxitos. No afirmar que una función sin conexión está activa.

### C.3 Motion: receta de implementación
Entrada: estructura visible inmediatamente, título y contenido secundario escalonados 35–70ms en 3 grupos; movimiento de 6–12px y opacidad, 350–600ms solo para escena inicial. Control inmediato 120–200ms; cambiar modo 200–350ms conservando contenedor; panel 240–350ms, mismo eje al cerrar, desmontar después del cierre. Curva editorial cubic-bezier(.22,1,.36,1); interacción cubic-bezier(.2,.8,.2,1). No bloquear clicks. Login usa presencia montada/expandida y doble requestAnimationFrame para entrada; limpia temporizadores al cerrar y respeta reduced-motion. Chat transversal conserva borrador, limpia timers y URLs, restaura foco; Legal usa IntersectionObserver para índice y scroll suave respetando preferencias. Estas son evidencias de patrones locales, no un motor transversal ya implementado. No animar todas las filas ni cada pixel de scroll. Probar aperturas/cierres rápidos y cancelación. Si no hay JS, no ocultar contenido esencial.

## D. Universo Agntia Demo autónomo
Tenant agntia-demo, empresa demo-agntiapro, owner ficticio. Empresa que vende compilación inicial 1.500 EUR y servicio desde 1.000 EUR/mes, objetivo 10 clientes, pequeñas empresas hasta aproximadamente 8 personas. Escenario propuesto de 90 días y ocho clientes ficticios (no resultados reales). Nueve dominios: dirección, comercial, marketing, operaciones, producto/ingeniería, atención, finanzas/gestoría, personas, seguridad/cumplimiento.
Roster: LAIA supervisión/coordina y presenta; Marcos operaciones; Antonio finanzas; Juan gestoría; Ana personas; Pedro ciberseguridad. Owner humano decide acciones sensibles; distinguir humanos, agentes y proveedores. Retratos existentes en landing para LAIA, Antonio, Pedro; no generar retratos nuevos como canónicos sin permiso.
Ejemplo narrativo nuevo para prototipos sin dataset accesible (NO fixture oficial): prospecto ficticio Taller Bruma SL solicita atención; Marcos prepara discovery; LAIA presenta alcance al owner; propuesta 1.500 + 1.000 mensual; aprobación pendiente; tras decisión simulada se crea contrato, implantación y factura. Segundo cliente ficticio Estudio Lumbre pide reactivación; Pedro comprueba integración, bloqueada; Marcos crea tarea de resolución. Antonio revisa cobro pendiente; Ana recibe tarea de incorporación. Usa correos .example y IDs estables. No mezclar cliente con tenant. No convertir propuesta en ingreso.
Contrato local mínimo orientativo (no API): tenantId, businessId, scenarioId, actorId, entityId, correlationId, causationId, logicalTimestamp, simulationMode:'synthetic'; tarea con id, title, status, assigneeId, clientId, projectId, processId, dueAt, approvalId nullable; automatización con id, trigger, conditions, actions, policyState, enabledInSimulation. Las relaciones pueden ser múltiples. Reloj fijo, semilla reproducible, sin huérfanos; eventos y KPIs derivados de los mismos registros. Datos y acciones solo locales, sin llamadas exteriores, pagos o permisos reales. Si hay fixtures compartidos, mapearlos a vista sin duplicar su identidad. Fuente: apps/ui-lab/docs/agntia-demo/03-compilacion-y-dataset/DATASET-SINTETICO.md y respuestas CEO/founder.

## E. Método de iteración y preservación
0. Identificar tarea del usuario, capacidades reales, actor principal, entidades, permisos, estados y recorridos. Si el agente solo tiene este documento, crear contrato demo explícito y declarar incógnitas.
1. Diseñar tres composiciones mentalmente; elegir una por claridad, especificar protagonista, densidad, contraste y flujo. Construir V1 original en carpeta aislada.
2. Refinar tipografía, espacio, jerarquía, alineación, escala, iconos y consistencia. Revisar screenshot, no solo código.
3. Hacer funcional el recorrido principal: navegación, selección, creación/edición local, búsqueda, feedback.
4. Completar recorridos secundarios, variantes y estados adversos según encargo.
5. Afinar relaciones y sincronización entre paneles/entidades.
6. Revisar narrativa sintética, evidencia, IDs y denominaciones.
7. Motion, continuidad, cierre, teclado, foco y accesibilidad.
8. Responsive real y regresión de interacciones.
9. Refinamiento integral, comparación visual y revisión founder. No son fases rígidas; repetir o saltar según evidencia. Un número de versión no es aprobación.
Historial observado: 28b55a1f ajustó targets táctiles Launcher; a5d9447f alineó iconos y touch con founder; 3acd03d2 corrigió retrato LAIA; 88ba9fa3 limpió streaming. Documentos tiene commits V8/V9 (c1a3b7aa, 80317303, 2629479e) sobre filtros, preview, fuentes, adaptación y cierre; Conocimiento V4/V5 (e47f2c85, e7688f89) sobre composición editorial y artículo. Estos últimos enseñan método, NO calidad aprobada. Evidencia basada en títulos de commits, no revisión exhaustiva de diffs.
Cada iteración entrega: versión, motivo, archivos, decisiones preservadas, cambios, escenas probadas, capturas desktop/móvil, fallos pendientes, siguiente hipótesis. Mantener snapshot anterior si se solicita comparar; no etiquetar una vista actual como snapshot histórico. No sobrescribir prototipos aprobados. No modificar main productivo ni desplegar; para documentación seguir destino indicado por founder. Registrar preview en mecanismos reales tras inspeccionarlos, no adivinar rutas.

## F. Puertas de calidad y rúbrica
Gates obligatorios antes de pedir aprobación: sin regresión funcional; aislamiento y no efectos externos; sin controles ficticios presentados como operativos; sin overflow accidental; teclado y foco; reduced-motion; build/typecheck y pruebas de recorridos cuando entorno disponible. Si no se pueden ejecutar, marcar NO VERIFICADO y no certificar.
Rúbrica propuesta 100 puntos: identidad 15, composición/jerarquía 20, precisión visual 15, interacción funcional 15, motion 10, responsive y accesibilidad 10, datos coherentes 10, preservación 5. Objetivo interno 90, no sustituye aprobación founder. Capturas de 1440 y 390 como mínimo, además de breakpoints pertinentes; revisar 360/430/768/1024/1920 si aplica. Probar selección, navegación vuelta, error, vacío, bloqueo, cancelar, cerrar, clicks rápidos, zoom y contraste AA. Una app visualmente saturada no aprueba aunque tenga todo cableado.
Prueba de autonomía: entregar esta guía sin historial a un segundo agente y pedir una pantalla nueva, evaluar contra rúbrica y recoger desviaciones. Pendiente de ejecutar; no afirmar que este manual ya ha demostrado reproducibilidad.

## G. Encargo ejemplo para Tareas (no decisión de layout definitivo)
Diseñar Task Manager + Automatizaciones, relativos a agente, empleado, cliente, proceso y proyecto con relaciones simultáneas. Conservar listado, filtros, detalle, plan, eventos, artifacts, aprobaciones y acciones válidas existentes. Explorar lista/kanban/calendario/timeline y constructor de reglas, vistas personales guardables en simulación, inspector progresivo y chat contextual. Priorizar área de trabajo espaciosa, no tres columnas permanentes comprimidas. Ejemplo: Marcos recibe tarea de onboarding, LAIA supervisa, owner aprueba, Antonio revisa factura; las vistas leen mismos IDs. Definir qué es simulado y qué contrato existe. No diseñar otro Centro de Mando. Contrastar producción TasksView, TaskDetailModal, TaskTimeline, ApprovalModal, hooks/useTasks y api/tasks si accesibles antes de wiring.

## H. Prompt de arranque para cualquier agente
Eres diseñador e ingeniero UX de AgntiaPro. Usa esta guía íntegra como identidad y método. Lee el encargo funcional, no copies layouts. Construye un mockup interactivo original, con datos sintéticos causalmente coherentes y una jerarquía dominante. Mantén el software invisible, el trabajo humano en primer plano y los agentes contextualizados. Reutiliza patrones y assets acreditados cuando existan, no inventes integraciones. Implementa localmente con CSS aislado y estados accesibles, conserva versiones anteriores y no toques producción. Evalúa con la rúbrica y aporta capturas, comandos y resultados reales; deja explícitos los límites. No declares aprobación por tu cuenta.

## I. Apéndice normativo acumulativo: V2 íntegra
La siguiente guía se conserva literalmente como base de identidad y especificación. En caso de conflicto sobre qué pantallas están aprobadas prevalece la clasificación B. Los rangos de motion siguen siendo propuestas. No se ha validado en navegador esta V3 ni se ha creado biblioteca ejecutable nueva; los ejemplos son recetas documentales.


---

# AgntiaPro — Guía Maestra de Branding UX V2
**Fecha:** 2026-11-23 · **Estado:** guía documental consolidada para UI Lab; las especificaciones de movimiento avanzado son objetivo de diseño, NO funcionalidades implementadas ni aprobación visual final.

## 0. Propósito y fuentes de verdad
Esta guía define **cómo se ve, se siente y se mueve AgntiaPro**. No define qué hace cada workspace, su negocio, datos, permisos, endpoints ni runtime. La identidad debe ser común; las composiciones deben ser distintas cuando sus tareas lo exijan.

**Jerarquía obligatoria:** (1) código y assets vigentes de `apps/ui-lab/src/vendor/landing/` para identidad editorial; (2) `apps/ui-lab/src/design-system/agntia-tokens.css` para tokens compartidos; (3) `apps/ui-lab/src/vendor/studio/` para traducción a software instrumental; (4) esta guía para decisiones de diseño; (5) `apps/ui-lab/docs/dashboards/01-landing/legacy/` como archivo histórico, NO como instrucciones de código vigentes. Para copias legibles de los tres archivos principales de landing, ver `apps/ui-lab/docs/dashboards/01-landing/ejemplo-componentes-reales/`.

**No confundir:** `BrandGallery.tsx` es un muestrario parcial; no certifica todo el sistema. El Estudio Demo transversal no equivale automáticamente al workspace 10 «Estudio de Operaciones» ni al Centro de Mando 35.

## 1. ADN y dirección artística
AgntiaPro es **editorial, cálido, humano, tranquilo, preciso y premium**. Debe parecer un producto diseñado deliberadamente, no una colección de dashboards genéricos. La landing aporta narrativa, fotografía, profundidad y pausas; el Estudio Demo aporta disciplina, instrumentos, legibilidad y continuidad de estado.

- **Sí:** papel cálido, blanco, tinta, violeta como énfasis, oro como detalle; títulos serif con personalidad, controles sans precisos, espacios negativos, bordes finos, sombras contenidas, imágenes con dirección artística.
- **No:** dark-tech por defecto, neón, glow constante, partículas, glassmorphism universal, gradientes decorativos, tarjetas anidadas sin necesidad, exceso de badges, texto microscópico, scroll-jacking, animaciones infinitas o efectos sin significado.
- **Una jerarquía dominante por escena:** cada vista debe tener un protagonista claro; el resto acompaña. Evitar simultáneamente demasiados acentos, CTAs, indicadores y movimientos.
- **Coherencia sin clonación:** una app de agenda, un editor, un feed y un centro de operaciones no necesitan la misma rejilla. Comparten gramática visual, no distribución ni funcionalidades.

## 2. Tokens canónicos verificados en código
| Rol | Token actual en `.agntia-workspace` | Valor |
|---|---|---|
| Papel | `--ag-paper` | `#fcfaf6` |
| Superficie | `--ag-surface` | `#ffffff` |
| Superficie tenue | `--ag-soft` | `#f2efe8` |
| Tinta | `--ag-ink` | `#242421` |
| Texto secundario | `--ag-muted` | `#6e6c66` |
| Línea | `--ag-line` | `#e6e1d8` |
| Violeta | `--ag-violet` | `#6550dd` |
| Lila | `--ag-lilac` | `#f0ecfc` |
| Oro | `--ag-gold` | `#b49665` |

La landing tiene variables `--lp-*` de valores equivalentes; **no asumir que sus nombres CSS son intercambiables**. Comprobar selectores y scopes antes de reutilizar. Los hex históricos `#FDFBF7`, `#211D18`, `#5B4BDB`, `#C9A86A` de prompts antiguos **no deben introducirse como segunda paleta**. No reemplazar CSS legacy globalmente: migrar con aliases y revisión visual.

**Uso semántico:** violeta para CTA, selección, foco y vínculo; oro solo en detalles editoriales discretos. Rojo/verde/ámbar para estados únicamente cuando exista semántica y contraste; nunca como adorno. Probar contrastes reales WCAG AA en sus combinaciones, no suponerlos.

## 3. Tipografía editorial e instrumental
- **Fraunces** (400–500) para titulares de marca y títulos editoriales, preferentemente 400 cuando se busca el carácter de la landing. Tracking ligeramente negativo y aire; evitar titulares de peso 700 como patrón indiscriminado.
- **Manrope** (400–800) para cuerpo, navegación, botones, tablas, cifras y metadatos. Mantener alineación y claridad a densidades instrumentales.
- **Escalas orientativas, a contrastar con CSS real:** display 48–72 px; H1 de app 28–40; H2 20–28; H3 17–22; cuerpo 14–16; caption 12–13. Usar `clamp()` cuando corresponda y revisar saltos de línea reales.
- **Ritmo:** titular 1.1–1.25 de line-height; cuerpo 1.45–1.65. No más de dos familias visibles por pantalla sin excepción justificada. Evitar microtexto como solución a saturación.

## 4. Espacio, geometría y profundidad
Escala base de 4 px: 4/8/12/16/20/24/32/40/48/64/80/112. La landing permite grandes respiraciones editoriales; el software concentra información con gaps coherentes, **sin parecer comprimido**. En el Estudio Demo, los gaps de 14–16 px y padding de 20 px son punto de partida observado, no obligación para todas las pantallas.

- Botones: radio ~8–9 px, alturas orientativas 40–50 px; objetivos táctiles adecuados.
- Cards: radios ~12–16 px, padding ~16–24 px, borde fino; sombras muy suaves.
- Grandes superficies: radios ~18–24 px si la composición lo justifica.
- Separar bloques primero con **espacio**, no acumulando líneas, cajas y sombras.
- Profundidad por **superposición intencional**, escala, sombra, contraste y máscara. Usar tarjetas flotantes o escenas 3D solo donde comuniquen algo (como el hero/ProductScene), no en todos los workspaces.
- Prohibidos los «huecos muertos» sin intención y las barras de herramientas que compiten con el contenido.

## 5. Fotografía, escenas, iconografía y assets
La landing usa fotografía de agentes, encuadres y máscaras deliberadas, y escenas de producto compuestas por capas. Documentar por componente: proporción, focal point, tratamiento cromático, comportamiento en móvil, texto superpuesto y fallback. No inventar fotografías ni mezclar bancos de imágenes sin coherencia. Conservar los assets originales salvo decisión expresa.

Iconografía lineal coherente (Lucide o equivalente), 16–20 px usuales, stroke y alineación óptica consistentes. Un icono sin texto necesita nombre accesible; no mezclar emojis, 3D e iconos lineales como si pertenecieran al mismo set.

## 6. Gramática de componentes: ficha obligatoria
Cada componente nuevo debe documentar **anatomía, variantes, tokens, densidad, responsive, interacción, accesibilidad y motion**:
1. **Botones:** primary violeta, secondary claro, ink instrumental, ghost, icon-only; estados default/hover/press/focus/disabled/loading. Una sola acción principal por grupo.
2. **Tarjetas/paneles:** estático vs interactivo distinguibles; selección, vacío, loading y error; sin falso hover en elementos no clicables.
3. **Tabs/navegación:** indicador activo claro, foco visible, teclado correcto, continuidad de panel y de selección; no comprimirse hasta ilegibilidad.
4. **Formularios:** labels estables, ayuda y error, focus violeta, validación legible, estados sin sacudidas ni saltos de layout.
5. **Tablas/listas/feeds:** altura de fila, metadatos, divisores, cifras alineadas, truncamiento accesible, densidad controlada.
6. **Menús, popovers, modales, sheets:** elevación y radios coherentes; Escape, restauración de foco, teclado y safe areas. Sheets móviles de lámina deslizable, no escritorio miniaturizado.
7. **Feedback:** skeleton, vacío, error, toast, progreso y aprobación; no fingir actividad o éxito que no haya ocurrido.

## 7. Arquetipos de composición, no plantillas funcionales
- **Landing editorial:** narrativa por escenas, hero y retratos, producto en contexto, CTA y respiración.
- **Studio / editor instrumental:** inspector izquierda, visualizador protagonista derecha, timeline multicapa inferior; relación visual sincronizada y controles subordinados.
- **Otros:** split view, feed, mosaico, tablero, lienzo, detalle, tabla, panel lateral. Elegir según el trabajo real de esa pantalla.
- **Móvil:** rediseñar jerarquía y orden; no escalar la versión desktop. El visualizador del Studio puede ir primero; inspector accesible y timeline desplazable. Respetar teclado virtual y safe areas.

## 8. Motion Design: coreografía cinematográfica sutil
**Esta es la brecha principal reconocida por el founder tanto en landing como en Estudio Demo.** El objetivo es un acabado comparable en criterio de movimiento al de productos digitales de primera línea, **sin copiar efectos ni añadir espectáculo**. La animación comunica jerarquía, causalidad y continuidad espacial. Un solo foco cinemático a la vez.

### 8.1 Vocabulario
- **Enter:** el contenedor es estable; contenido protagonista aparece con opacidad y `translateY` mínimo, acompañado por escala casi imperceptible si procede.
- **Exit:** salida breve coherente con la dirección del siguiente estado; nunca pantallazo blanco ni desaparición de controles antes de responder.
- **Reveal editorial:** una sección entra una vez cuando aparece, sin volver a ocultarse al subir.
- **Stagger/cascada leve:** secuenciar **grupos semánticos** (título → lead → acción → imagen), no cada letra ni cada fila. El usuario debe poder interactuar desde el inicio.
- **Shared continuity:** el indicador activo, la selección y el panel mantienen una relación visual entre estados; evitar desmontajes bruscos y scroll resets.
- **Microinteracción:** hover/press/focus/selección con respuesta inmediata, sin que una animación retrase el clic.
- **Scroll-linked opcional:** movimiento de capas muy limitado y medido, solo cuando añade profundidad; sin secuestrar scroll.

### 8.2 Ritmos de prototipo (NO tokens aprobados)
| Situación | Rango inicial | Regla |
|---|---|---|
| Feedback inmediato | 120–200 ms | no retrasar acción |
| Tabs y paneles | 200–350 ms | mantener continuidad |
| Modal/sheet | 240–400 ms | foco y cierre correctos |
| Reveal editorial | 500–680 ms | una vez, solo si aporta |
| Cascada entre grupos | 35–85 ms | máximo ~3–5 grupos |
| Escena insignia | hasta ~750 ms | sin bloquear interacción |

Curvas de partida: `cubic-bezier(.22,1,.36,1)` para entrada editorial y `cubic-bezier(.2,.8,.2,1)` para controles; calibrar visualmente. **No mezclar múltiples observers o librerías que animen el mismo transform**.

### 8.3 Storyboards de referencia
**Landing — hero LAIA:** nav y estructura visibles inmediatamente → H1/lead/CTA aparecen escalonados muy levemente → retrato se asienta dentro de su máscara → tarjeta flotante llega al final. Chat inline anima **solo el mensaje nuevo**, no el historial. Hero no debe empeorar LCP.

**Landing — secciones:** títulos, contenidos y escena de producto revelados por grupos; ProductScene hace crossfade/desplazamiento mínimo al cambiar tabs; retratos de agentes entran en secuencia breve; CTA final mantiene legibilidad y destino real. No presentar datos demo como actividad real.

**Estudio Demo — entrada:** cabecera → visualizador → inspector → timeline, con solapamiento temporal y sin esperar segundos. El visualizador domina, la UI no se agita.

**Estudio Demo — cambio de vista:** controles permanecen anclados; el visualizador cambia con continuidad entre Kanban/Grafo/Digital Twin/Empresa 360°, evitando superposición de textos y pérdida de selección.

**Estudio Demo — causalidad:** seleccionar actividad resalta el origen y sincroniza inspector/timeline con feedback suave; abrir inspector móvil o expandir escena no mueve la pantalla de forma caótica.

**Salir de cualquier superficie:** fade/desplazamiento corto y continuidad de navegación; mantener foco, estado, scroll y acciones. Nada de cortinillas, zoom agresivo, flashes o scroll-jacking.

### 8.4 Reglas de seguridad y calidad
- `prefers-reduced-motion: reduce`: sin parallax, stagger ni desplazamientos decorativos; contenido y feedback siguen visibles.
- Preferir `transform`/`opacity`; evitar animar layout, blur masivo, `will-change` global y listeners que causen renders React por pixel.
- Sin JS o si falla el observer, **contenido esencial visible**; no dejar `opacity:0` permanente.
- Medir CLS, LCP, INP, fluidez en móvil, foco y teclado; no afirmar 60 fps sin medición.
- Revisar 360/390/430/768/1024/1440/1920 px según el componente. El motion debe poder cancelarse ante clicks rápidos.

**Plan detallado ya archivado:** `apps/ui-lab/docs/dashboards/01-landing/legacy/motion-design-premium/README.md` (C00–C08). **No crear campaña duplicada ni implementar sin nueva instrucción.**

## 9. Proceso de diseño y aceptación visual
**Antes:** leer esta guía, tokens vigentes, landing y Studio reales; identificar el contenido, restricciones y estado actual; guardar screenshot baseline cuando sea posible.

**Diseñar:** una propuesta de jerarquía y composición; inventario de componentes que reutiliza; tokens concretos; storyboard de entrada/salida/cambio; versión desktop y móvil.

**Implementar (solo con autorización):** cambios pequeños, scoped, reversibles; no tocar backend, rutas ni funcionalidades por motivos estéticos. Evitar contaminar `:root` global.

**Verificar:** capturas antes/después, revisión visual real, keyboard, touch, foco, contraste, reduced-motion, errores/vacíos, breakpoints, rendimiento y regresiones. Registrar resultados medidos y lo que queda pendiente.

**Aprobar:** la aceptación final requiere revisión visual del founder. Pasar build/typecheck no significa alcanzar la calidad de diseño solicitada.

## 10. Instrucción breve para agentes de UI
> Diseña exclusivamente el lenguaje visual y la experiencia de interacción de la pantalla asignada. Usa la landing actual como referencia editorial y el Estudio Demo como traducción instrumental. Respeta tokens y componentes reales; no copies su layout ni inventes funcionalidades. Prioriza jerarquía, respiración, tipografía Fraunces/Manrope, superficies cálidas, violeta contenido, profundidad sutil y motion cinematográfico con entradas/salidas y cascadas ligeras. Diseña móvil de verdad. Documenta estados, accesibilidad, reduced-motion y pruebas; no cambies runtime ni despliegues sin aprobación.

## 11. Estado y deuda documentada
**Observado en código:** tokens y composición de landing; Studio con tokens compartidos y layout instrumental; animaciones locales y estilos responsive. **Documentado como propuesta, no verificado como implementación:** coreografía cinematográfica transversal, biblioteca completa de patrones animados, comparativas visuales automatizadas, métricas de rendimiento y adopción en todos los workspaces.

**Referencias internas:**
- `./AUDITORIA-BRANDING-UX-Y-MOTION-2026-11-23.md`
- `../superficies-transversales/AUDITORIA-ESTUDIO-DEMO-VS-LANDING-2026-11-23.md`
- `../../01-landing/legacy/design-system-agntiapro/`
- `../../01-landing/legacy/motion-design-premium/README.md`
- `../../01-landing/ejemplo-componentes-reales/`

**No se ha modificado código, construido una galería interactiva ni ejecutado pruebas visuales con esta edición documental.**
