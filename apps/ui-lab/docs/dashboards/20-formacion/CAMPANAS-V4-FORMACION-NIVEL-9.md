# FORMACIÓN · CAMPAÑAS V4.1 · PLAN MAESTRO PREMIUM 9+/10
**Fecha:** 2026-11-24 · **Estado:** especificación de implementación, NO implementación. **Fuente vigente:** este documento sustituye íntegramente el plan V4 anterior; no cambia el código actual. **Destino:** UI Lab. **Versión actual:** LEGACY FUNCIONAL, preservada hasta validación de la nueva versión.

> **Promesa editorial invariable:** «Deja de aprender la IA y empieza a trabajar con LAIA». Formación no es una academia, ni un clon de Spotify, ni un dashboard de administración. Es una biblioteca audiovisual de trabajo y descubrimiento, con la identidad de AgntiaPro y la continuidad de uso de una aplicación de medios.

## 0. Decisión arquitectónica: legacy intacto y nueva versión controlada
- **No sobrescribir** `apps/ui-lab/src/formation/FormationWorkspace.tsx`, `formation.css` ni `catalog.ts` en esta fase documental. Son el baseline legacy y siguen disponibles para comparación y rollback.
- La futura implementación vive en `apps/ui-lab/src/formation-v4/` con su propio entrypoint `FormationV4Workspace.tsx`, componentes, estilos y fixtures. Reutilizar los tokens y componentes compartidos reales; evitar duplicación de lógica cuando sea posible.
- Exponer la V4 como **preview aislada de UI Lab**, bajo ruta nueva que deberá verificarse contra el router real. No sustituir el acceso a Formación legacy hasta que QA, aceptación del founder y despliegue de laboratorio sean correctos.
- El catálogo de 120 IDs, las 12 imágenes y los documentos canónicos se reutilizan como datos de solo lectura. No crear otros 120 títulos por comodidad.
- La V4 reemplaza la **prioridad del plan**, no borra los documentos de campañas antiguas. Toda decisión nueva se registra como ADR/bitácora.

## 1. Jerarquía de fuentes verificables
1. Instrucciones explícitas del founder, branding de Landing nueva y Studio Demo **en código real**, no capturas antiguas.
2. `apps/ui-lab/src/vendor/landing/Landing.jsx`, `landing.css`, `apps/ui-lab/src/vendor/studio/BusinessCommandStudio.tsx`, `studio.css`, `apps/ui-lab/src/design-system/agntia-tokens.css`; **verificar existencia antes de usar**.
3. `PROMPT-MAESTRA-FORMACION-V3-SPOTIFY.md`, `UX-FORMACION.md`, `CONTRATOS-Y-DATOS.md`, `METADATA-120-CURSOS.json`, `DESIGN-ALGORITMO-DISCOVERY-LEARNING-V2.md`.
4. Campaña anterior `campana-template-interfaz-120/`: leer en especial **07** auditoría paridad, **09** criterios de componentes, **10** manual diseño, **11** motion y sheet, **12** portadas, **13** implementación, **15** auditoría transversal. Son evidencia y restricciones, no planes paralelos a ejecutar.
5. Assets reales: 12 WebP generados (workflow 45287170675, PR #31) y manifest. Los vídeos de los 120 cursos **no están producidos**.
6. Baseline legacy (2026-11-24): búsqueda, filtros, sheet y catálogo existen; typecheck/build PASS en run 45291068107; deploy FAIL por raíz Vercel duplicada `apps/ui-lab/apps/ui-lab`. No inferir de ello que la V4 esté implementada.

## 2. Experiencia objetivo: escenas y recorridos, no una colección de tarjetas
### 2.1 Desktop
Composición editorial asimétrica con tres densidades: **respiración** en hero, **ritmo** en estanterías y **detalle** en ficha. Navegación local Inicio / Buscar / Tu biblioteca; jamás segundo shell global. Hero con un único foco, foto editorial con espacio negativo para texto, titulares Fraunces, UI Manrope, violeta para acción, oro como acento LAIA. Bloques alternados: colección destacada, estanterías horizontales, lista de episodios, continuación y editorial de práctica. Nada de grid infinito homogéneo.
### 2.2 Móvil
El producto ocupa el ancho real. Cabecera local compacta, una acción principal visible, carruseles táctiles con controles accesibles, sheets con safe-area. Nada de falsa status bar, miniatura ilegible ni chat flotante duplicado. El mini-player **no aparece sin media reproducible**; mostrar ficha/estado de producción honesto.
### 2.3 Recorridos obligatorios
- Owner descubre un tema → abre colección → consulta ficha → guarda curso → lo encuentra en Tu biblioteca.
- Empleado busca un ejercicio → filtra 120 cursos → abre detalle → ve objetivo y siguiente recomendado.
- Usuario vuelve a un curso guardado → mantiene contexto local sin fingir progreso de vídeo.
- Usuario sin vídeos ni conectores → ve «Vídeo en preparación» y «Demostración de interfaz» sin CTA falsa.
- Usuario de teclado/móvil → abre, navega, cierra y recupera foco, sin bloqueos.
Cada recorrido requiere storyboard de 5–8 estados, estados vacío/carga/error, y pruebas reproducibles.

## 3. Sistema visual con decisiones medibles
**Branding:** derivar tokens del código activo, no reintroducir hexadecimales divergentes. Tipografía Fraunces solo en titulares editoriales y Manrope en controles; jerarquía visible 1 título primario por pantalla; máximo 1 CTA primario por zona. Definir escala de espaciado, densidad, radios, superficies, elevaciones y capas de overlay en `formation-v4/tokens.css` como alias de tokens compartidos.
**Composición:** mínimo tres patrones distintos de portada (hero panorámico, colección cuadrada/4:3, episodio 16:9), alternancia intencional y espacio en blanco. Rechazar estética de plantilla LMS, exceso de chips, repetición de cards y degradados decorativos sin propósito.
**Arte:** elaborar hoja de contacto de las 12 fotos con evaluación de tema, iluminación, paleta, foco, espacio negativo, legibilidad de overlay, recorte 3:2/4:3/1:1/16:9 y posible sensibilidad cultural. Asignación explícita `courseId/collectionId -> assetId` con fallback; **no usar reparto modular por número de curso como dirección artística final**. Evitar re-generación pagada salvo autorización nueva.
**Microcopy:** humano, claro, orientado a trabajar con LAIA; no atribuir a LAIA acciones que el sistema no ejecutó; no prometer vídeos ni integraciones. Etiquetar fixtures como «Demostración».
**Motion:** coreografía definida por storyboard: entrada de hero, revelado de colección, foco/hover, transición portada→ficha, cierre y retorno. Parámetros iniciales orientativos (ajustar tras QA): microinteracciones 120–200 ms, entrada de bloque 280–450 ms, sheet 260–420 ms, desplazamientos 8–24 px; nunca encadenar animaciones que retrasen lectura. CSS primero; View Transitions/IntersectionObserver solo con fallback. Respetar reduced motion y evitar CLS.

## 4. Contratos funcionales y honestidad
Modelo tipado con `courseId`, `collectionId`, `mediaStatus`, `durationTargetSeconds`, `saved`, `queueIds`, `activeTab`, `sheetState`, `connectionState` **solo si está realmente conectado al backend**. Distinguir `not-produced`, `ready`, `error`. No generar player, seek, play/pause, progreso o transcripciones falsos cuando `mediaStatus=not-produced`.
Guardar favoritos en estado local demo con etiqueta y ciclo de vida claro; persistencia real requiere contrato, consentimiento y pruebas. No simular OAuth ni pagos, no guardar secretos, no ejecutar SOPs desde una maqueta. «Visto» ≠ «Conectado» ≠ «Completado». Recomendaciones demo explicables por categoría, sin afirmar personalización real.
Preservar 60 IA01–IA60, 50 R01–R50 y 10 P01–P10; resolver discrepancias entre documentación y catálogo antes de cambios. Serie «IA Act» de V3 es **ejemplo editorial separado**, no sumarla a los 120 ni presentar duraciones de maqueta como vídeos reales.

## 5. Campañas secuenciales y patchsets
**Regla:** cada campaña produce archivos, tests, capturas, bitácora y commit identificable. El siguiente gate no se abre si el anterior falla. No crear ramas para documentación; la implementación V4 puede permanecer aislada en carpetas/ruta sin tocar legacy.

### C00 — Reconocimiento, baseline y decisiones
**Leer:** fuentes §1, router de UI Lab, componentes legacy, tokens, manifest e imágenes. **Crear:** `docs/dashboards/20-formacion/v4/AUDITORIA-BASELINE.md`, `INVENTARIO-ARTE.md`, `BITACORA.md`, `ADR-001-LEGACY-V4.md`. **Hacer:** matriz legacy vs Landing vs Studio (tokens, tipografía, espaciado, motion, overlays); lista de 120 IDs y 12 assets; estado de deploy. **Gate:** no fuentes pendientes sin clasificar, divergencias documentadas, rutas verificadas.

### C01 — Prototipo de dirección de arte (gate del founder)
**Crear:** `formation-v4/artwork.ts`, `tokens.css`, `components/EditorialHero.tsx`, `components/CollectionCover.tsx`, `v4/ART-DIRECTION.md`. **Hacer:** 2 composiciones alternativas usando assets existentes; elegir una para implementación, hoja de contacto, crops por breakpoint, text-on-image AA. **Gate:** capturas desktop y móvil de hero + colección + ficha, comparadas lado a lado con Landing y Studio; **sin aprobación visual del founder no propagar el lenguaje a 120 cursos**.

### C02 — Arquitectura de experiencia y estado
**Crear:** `formation-v4/types.ts`, `fixtures.ts`, `state.ts`, `components/LocalLibraryNav.tsx`, `components/CollectionShelf.tsx`, `components/CourseCard.tsx`, `components/SearchPanel.tsx`, `components/LibraryPanel.tsx`. **Hacer:** rutas Inicio/Buscar/Biblioteca/Colección, búsqueda diacrítica y filtros coherentes, colecciones con enlaces reales de UI, guardados demo. **Gate:** 120 cursos localizables, 0 acciones sin respuesta, estado reproducible y pruebas de búsqueda.

### C03 — Ficha y máquina de estados del sheet
**Crear:** `components/CourseDetailSheet.tsx`, `components/QueuePanel.tsx`, `components/MediaUnavailable.tsx`, `sheet-machine.ts`. **Hacer:** estados closed/peek/half/full; transiciones con botón, Escape, swipe cuando corresponda; body-scroll lock reversible; restauración foco; contenido del curso y cola de sugeridos. **Gate:** test teclado + touch + scroll anidado, sin «play» ficticio, sin overlay sobre chat/shell.

### C04 — Catálogo sintético y semántica editorial
**Crear:** `content-adapter.ts`, `editorial-collections.ts`, `synthetic-demo.ts`, `v4/TRACEABILITY-120.md`. **Hacer:** enlazar 120 IDs con taxonomía y metadatos canónicos; objetivos, microcopy, ejemplos de pyme y recomendaciones justificables, no datos personales reales; validación programática de IDs, relaciones, duplicados y estado media. **Gate:** 120/120 trazables, cero enlaces rotos, datos de ejemplo rotulados.

### C05 — Coreografía cinematográfica transversal
**Crear:** `motion.css` y `v4/MOTION-STORYBOARD.md`; modificar solo V4. **Hacer:** secuencia de llegada/salida, estanterías, tarjeta→ficha, overlay y foco; evitar animar layout costoso; fallback sin JS/reduced-motion. **Gate:** comparativa antes/después, sin CLS, sin pérdida de foco, sin animación que retrase interacción.

### C06 — Responsive, a11y y rendimiento
**Crear:** `v4/QA-MATRIX.md`; tests de interacción con herramientas disponibles. **Probar:** 320, 360, 390, 768, 1024, 1440 y 1920 px; zoom 200%; keyboard-only; lector de pantalla; contraste WCAG AA; pointer coarse; safe areas; imágenes y carga lenta; 120 cursos con búsqueda y filtros. **Objetivos de ingeniería:** 0 scroll horizontal de página, 0 imágenes 404, 0 botones tapados, foco visible, navegación completa por teclado. Medir LCP/CLS/INP en preview si el entorno lo permite, sin inventar valores. **Gate:** cero bloqueantes P0/P1.

### C07 — Build, preview y despliegue aislado
**Leer:** workflow real de UI Lab, `package.json`, configuración Vercel del proyecto **dedicado**. **Hacer:** typecheck/build, smoke de rutas y assets; investigar duplicación `apps/ui-lab/apps/ui-lab` y corregir raíz en el lugar apropiado sin tocar Vercel de producción principal. Desplegar **solo preview de laboratorio** cuando esté autorizado por la configuración y las aprobaciones de la campaña. Verificar URL, version y 12 WebP HTTP 200. **Gate:** build + smoke PASS y preview verificable. Si Vercel bloquea, reportar fallo y conservar legacy.

### C08 — Auditoría adversarial y aceptación
**Crear:** `v4/AUDITORIA-FINAL.md`, `v4/HANDOFF.md`, actualizar bitácora con commits, evidencia, deuda, rollback y decisión del founder. Auditor distinto del implementador cuando sea posible; inspección visual de capturas comparadas del **mismo commit**. Probar 5 recorridos §2.3. **Rúbrica 100:** identidad 15; composición 15; arte 10; motion 15; biblioteca 15; ficha/continuidad 10; responsive+a11y 15; veracidad 5. **Aprobación 9/10:** ≥90 puntos respaldados por capturas y tests, 0 P0/P1, preview accesible y aceptación explícita del founder. No conceder puntuación por documentación.

### C09 — Promoción controlada (fuera del alcance automático)
Solo tras C08 y decisión explícita: plan de sustitución de ruta legacy por V4, smoke y rollback inmediato. **No ejecutar por defecto.** Legacy se conserva como referencia hasta que el founder indique retiro.

## 6. Matriz de trazabilidad de aceptación
| ID | Requisito | Evidencia mínima | Bloquea |
|---|---|---|---|
| UX01 | Paridad de identidad Landing/Studio | capturas comparadas mismo commit | Sí |
| UX02 | Biblioteca no genérica | Home + Colección + Biblioteca + Buscar | Sí |
| UX03 | 12 fotos con criterio editorial | hoja de contacto y mapping | Sí |
| UX04 | 120 cursos canónicos | test IDs y referencias | Sí |
| UX05 | Media honesta | prueba sin vídeos | Sí |
| UX06 | Sheet accesible | teclado, Escape, foco, touch | Sí |
| UX07 | Motion cinematográfico | storyboard y vídeo/capturas | Sí |
| UX08 | Responsive | matriz 320–1920 y zoom | Sí |
| UX09 | Sin duplicar shell | inspección del router y capturas | Sí |
| UX10 | Preview aislada | CI, Vercel y smoke | Sí |

## 7. Antipatrones que obligan a rechazar
- Grid genérico de cursos; landing convertida en academia; fotografía repetida sin narrativa.
- Copiar colores/branding de Spotify, exceso de degradados, efectos sin jerarquía.
- Mini-player, seek, subtítulos o progreso falsos sin media.
- CTAs de OAuth/LAIA que afirman éxito sin backend, enlaces muertos o pantallas huecas.
- Segunda navegación global, chat duplicado, overlays que tapan controles.
- «9/10» autodeclarado por el agente sin capturas, pruebas ni aceptación.
- Sobrescribir legacy antes de que la V4 supere los gates.

## 8. Protocolo del agente ejecutor
1. Antes de tocar código: leer §1 y registrar qué rutas existen; si falta una fuente, documentar sustituto verificable.
2. Cada campaña: `PLAN → PATCHSET → TYPECHECK/BUILD → TESTS → CAPTURAS → AUDIT → COMMIT → BITÁCORA`. Documentar `files_created`, `files_modified`, `tests`, `run_id`, `risks`, `rollback`, `next_gate`.
3. No mezclar campañas ni alterar backend. Un commit por cambio lógico, no un megacommit opaco.
4. Al fallar un gate: marcar BLOCKED, conservar evidencia, reparar y repetir. Nunca saltar de C01 a C08 por haber compilado.
5. Ningún deploy a producción principal. No generar imágenes de pago ni vídeos adicionales sin aprobación.
6. El founder decide dirección artística y promoción; el agente puede preparar y probar sin pedir clics innecesarios.

## 9. Estado y siguiente acción
**Legacy:** código actual congelado conceptualmente como referencia, no degradado ni borrado. **V4.1:** documento maestro aprobado para futura ejecución, aún sin código, capturas ni nota de interfaz. **Primera ejecución:** C00 y prototipo C01; **no** sustituir Formación existente.
