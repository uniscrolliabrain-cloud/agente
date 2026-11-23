# 02 · Componentes, datos y wiring

## Inventario propuesto (no afirmar existencia)

| Componente | Responsabilidad | Estados principales |
|---|---|---|
| FormationWorkspace | composición dentro del shell existente | loading, ready, error |
| FormationLocalNav | Inicio, Buscar, Tu biblioteca | active, collapsed, mobile |
| LearningModeSelector | Trabajo, Aprender, Explorar | selected, changing |
| EditorialHero | recomendación editorial, arte y CTA | published, placeholder |
| CourseShelf | carrusel semántico de cursos | empty, loading, ready |
| CourseCoverCard | título, portada, duración estimada, nivel | saved, unavailable, focus |
| CollectionDetail | serie, descripción, episodios | list, filtered, empty |
| CourseSearch | búsqueda textual y facetas | typing, results, no-results |
| CourseDetail | objetivo, prerequisitos, contexto, disponibilidad | ready, blocked |
| PersistentMiniPlayer | continuidad de reproducción local | playing, paused, error |
| ExpandedReelPlayer | vídeo vertical, subtítulos, controles | buffering, playing, ended |
| PlaybackQueue | siguiente, orden y salto | default, reordered |
| PersonalLibrary | guardados, historial consentido, colecciones | empty, populated |
| LearningProgress | vistos vs práctica demostrada | viewed, started, verified |
| PracticeCTA | abrir LAIA o proponer conexión | ready, needs-permission, unavailable |
| RecommendationReason | «Por qué lo ves», ocultar, feedback | visible, hidden |
| CourseSkeleton / EmptyState | estados honestos y consistentes | loading, no-content |
| FormationBottomSheet | ficha de serie y episodios superpuesta a escena, tabs Resumen/Episodios/Recursos/Transcripción; reutilizar motor de gesto del chat solo tras localizar su fuente | closed, peek, half, full, dragging, settling |

## Contratos de integración

**Entrada:** `../METADATA-120-CURSOS.json` con 120 IDs. Crear adaptador UI tipado y validación de seed; NO asumir que existe backend ni que `media.videoStatus=draft` sea reproducible. Definir `CourseViewModel` como proyección de `CourseMetadata`, y `MediaAvailability` discriminado `published | preview | missing | blocked`.

**Estado UI:** modo elegido, búsqueda, filtros, selección de colección, curso activo, tiempo de reproducción, cola, guardados demo. Separar estado efímero de persistencia real; usar mocks locales claramente etiquetados y no afirmar sincronización.

**Recomendador:** inicialmente catálogo editorial determinista y curado; consumir proyección de `DESIGN-ALGORITMO-DISCOVERY-LEARNING-V2.md` solo cuando contrato y gate del kernel estén implementados y probados. No llamar a slow LLM/JEV desde un componente React.

**Práctica:** CTA abre LAIA existente con contexto mínimo y permisos vigentes; no simular ejecución de correo/calendario/conector. En modo demo, mostrar propuesta y bloqueo honesto. Nunca activar OAuth sin interacción explícita.

**Vídeo:** placeholder editorial premium cuando no existe archivo con licencia; no reproducir vídeos ficticios. Subtítulos accesibles si hay vídeo. La pista Suno no se presupone generada.

## Responsabilidades y separación

- Componentes presentacionales sin efectos externos.
- Hooks de UI para búsqueda, biblioteca y player, con contratos definidos.
- Adapter catálogo valida IDs, disponibilidad y estado.
- Acciones remotas a través de API existente y permisos, jamás fetch inventado.
- Diseño reutiliza tokens y componentes activos en vez de clonar landing.css.
- Test unitario para cada estado crítico y test integración para mini-player persistente.
