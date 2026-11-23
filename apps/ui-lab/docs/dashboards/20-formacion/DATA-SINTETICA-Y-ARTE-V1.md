# Datos sintéticos de Formación · Diseño de fixtures y arte V1

**Estado:** especificación de demo, no contenido audiovisual publicado. **Fuente canónica:** `METADATA-120-CURSOS.json` (schemaVersion 0.1.0-draft; total 120; IA 60, R 50, P 10). **Destino:** UI Lab, nunca datos reales de tenants.

## 1. Principio
No crear otro catálogo. Las fixtures referencian IDs de los 120 cursos y conservan título, track, duración objetivo y estado editorial originales. `durationTargetSeconds` es **duración objetivo**, no duración de vídeo. `videoStatus:not-produced` y `publicationStatus:draft` prohíben simular play real. La UI usa arte estático con rótulo «Vídeo en preparación».

## 2. Entidades demo separadas
| Entidad | Campos mínimos | Regla |
|---|---|---|
| CourseCatalog | id, title, track, category, objective, durationTargetSeconds, media/publicationStatus | leer directamente de catálogo |
| DemoCollection | id, title, description, coverAssetId, orderedCourseIds, curator | referencias a IDs válidos; colecciones inventadas marcadas sintéticas |
| DemoUser | id sintético, displayName, role ficticio, learningMode | sin correo, DNI, datos personales reales |
| DemoLibrary | userId, savedCourseIds, followedCollectionIds, queueCourseIds | solo IDs del catálogo |
| DemoProgress | userId, courseId, positionSeconds?, completionState, source=synthetic | si no hay vídeo real, progreso **ilustrativo**, nunca progreso reproducido |
| DemoRecommendation | courseId, mode, reason, source=editorial-fixture | sin supuesta personalización por IA |
| DemoMedia | courseId, posterAssetId?, imageStatus, videoStatus=not-produced, rightsStatus | imagen estática; vídeo ausente |
| DemoScene | id, courseId, sheetSnap, activeTab, selectedEpisodeId, miniPlayerState | escenarios de pruebas deterministas |

## 3. Escenarios visuales mínimos
1. **Primer acceso:** biblioteca vacía, modo Trabajo, sugerencias editoriales, portada protagonista sin vídeo.
2. **Owner en Aprender:** varios cursos guardados, colección seguida, continuación ilustrativa etiquetada DEMO.
3. **Empleado en Explorar:** búsqueda y recomendaciones variadas sin inferir datos laborales.
4. **Ficha abierta:** IA01 «La IA no piensa por ti», hoja peek/half/full, episodios relacionados solo si los IDs están en metadata.
5. **Sin medios:** portada ausente, vídeo no producido, transcripción pendiente y CTA honesto.
6. **Estados límite:** título largo, búsqueda vacía, 320px, orientación horizontal, navegación con teclado.

## 4. Selección editorial inicial para portadas
Primer lote propuesto, usando títulos confirmados en metadata: `IA01` «La IA no piensa por ti»; `IA02` «Qué es la cognición aumentada»; `IA03` «Qué es un LLM»; `IA04` «Cómo hacer buenas preguntas»; `IA05` «Qué es un prompt»; `IA08` «Cómo contrastar una respuesta». Para familias R/P seleccionar **después de leer sus títulos reales**; no inventar nombres. Primeras nueve piezas visuales: 3 conceptuales IA, 3 escenas prácticas R, 3 encuentros LAIA P. Las tres familias comparten papel cálido, tinta, violeta y oro de Landing.

## 5. Arte generado
**Prueba visual inicial:** escena editorial cálida de libro abierto, diagrama de nodos, objeto facetado violeta/oro y escritorio. Fue generada en conversación como **exploración**, no está todavía subida al repositorio ni aprobada como portada. No presentarla como imagen oficial de AgntiaPro.

**Pipeline recomendado:** generar originales sin tipografía incrustada, aprobar estilo y encuadre, optimizar a WebP/AVIF, guardar originales en carpeta de arte fuente y derivados web en assets de UI Lab, crear `assets-manifest.json` con `id, courseId, variant, width, height, alt, provenance, status, path`. No insertar imágenes base64 en TSX ni enlazar URLs temporales del chat. El contenido visual debe poder revisarse en UI Lab y versionarse en GitHub.

## 6. Rutas propuestas, pendientes de comprobar en el código
- `apps/ui-lab/src/formation/fixtures/`: usuarios, colecciones, biblioteca, progreso, recomendaciones y escenarios demo.
- `apps/ui-lab/public/formation/images/`: imágenes web optimizadas.
- `apps/ui-lab/docs/dashboards/20-formacion/arte/`: manifiesto, prompts, decisiones y registro de derechos.
No crear rutas incompatibles con el build existente; comprobar el router y estructura antes.

## 7. Gates
- IDs de fixtures son subconjunto de los 120 IDs canónicos, sin huérfanos ni duplicados.
- Ninguna fixture altera `METADATA-120-CURSOS.json`.
- Los datos sintéticos se distinguen de datos de tenant, acciones ejecutadas y aprendizaje verificado.
- Cada imagen se vincula a un curso/colección y tiene alt text, proporción y procedencia.
- Primera tanda de 9 imágenes se aprueba antes de escalar a 120.
- Ningún asset entra en UI Lab ni producción sin verificar que el archivo existe en el repo y que su uso está permitido.

## 8. Pendiente inmediato
Leer el resto del catálogo R/P y producir fixtures JSON concretas, no solo el esquema. Crear una segunda y tercera familia visual antes de fijar el lenguaje de portada. El usuario puede revisar las imágenes aquí; el asistente puede generarlas y preparar los archivos, sin que el founder tenga que generarlas manualmente.
