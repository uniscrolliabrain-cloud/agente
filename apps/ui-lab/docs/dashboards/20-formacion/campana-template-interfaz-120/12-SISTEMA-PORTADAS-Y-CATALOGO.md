# 12 · Sistema editorial de 120 cursos, portadas y disponibilidad

**Estado:** diseño de presentación; la fuente editorial es `../METADATA-120-CURSOS.json`. IDs canónicos: IA01–IA60, R01–R50, P01–P10. No confundir 120 entradas con 120 vídeos terminados.

## 1. Arquitectura de contenido
- **IA (60):** conceptos y cultura profesional de IA.
- **R (50):** trabajo y vida cotidiana con LAIA.
- **P (10):** introducción práctica a LAIA.
- Una **serie** agrupa episodios; una **colección** agrupa series/episodios por intención; un **curso** puede ser pieza individual o agrupación editorial según contrato. No inventar relaciones de series ni IDs adicionales sin validación.
- IA Act del mockup es **ejemplo visual**, no necesariamente una entrada canónica de la metadata. No mostrarlo como publicado sin registro y media.

## 2. Gramática de portadas
Crear 3 familias reconocibles sin tres identidades separadas: **P = encuentro humano con LAIA**, retrato y conversación; **R = escena aplicada**, documento/agenda/persona/situación real; **IA = concepto visual editorial**, imagen metafórica sobria y tipografía protagonista. Mantener tratamiento de iluminación, textura, contraste, tipografía y paleta compartidos. Evitar caras artificiales inconsistentes, símbolos de cerebro/robot repetidos, gradientes masivos, thumbnails clickbait y stock inconexo.

**Entregables de arte antes de producción masiva:** 3 portadas de serie, 3 de colección y 3 de episodio (9 en total), en 1:1, 4:3 o 16:9 y 9:16 según contexto. Cada portada con título corto, track, objetivo visual, asset/licencia, autor, alt text y variante móvil; aprobar el sistema antes de replicar 120 veces.

## 3. Metadatos para UI (propuesta de proyección, no contrato existente)
`id, title, track, description, category, tags, level, estimatedDuration, coverAsset, coverStatus, videoAsset, videoStatus, transcriptStatus, rightsStatus, publishStatus, collectionIds, nextEpisodeIds, lastReviewedAt`. Solo mapear campos realmente presentes y marcar los demás `unknown` o `missing`. No crear fechas/duraciones ficticias.

**Eligibility de render:** draft → portada editorial/placeholder, nunca botón play operativo; preview → solo si existe asset autorizado; published → asset real, captions y derechos confirmados; blocked → motivo accesible. Descarga/compartir condicionado a permisos/licencias. Progreso verificado ≠ visualización completa.

## 4. Recomendaciones en pantalla
Trabajo: «Resuelve esto ahora» y «Continúa». Aprender: «Sigue profundizando» y «Tu siguiente paso». Explorar: «Descubre algo inesperado». En todos, «Por qué lo ves», «No me interesa» y «Terminar por hoy»; no inferir modo por horario ni usar watch time como métrica única.

## 5. Ejemplo de ficha sin contenido ficticio
Título y objetivo del registro real → portada aprobada → estado «Vídeo en preparación» → episodios o recursos que realmente existan → CTA «Guardar para después» o «Practicar con LAIA» solo si disponible y autorizado. Si falta medio, la composición conserva su calidad sin simular reproducción.

## 6. QA de catálogo
Validar 120 IDs únicos, títulos no vacíos, tracks, estados, orden y enlaces; verificar 10 muestras por track, títulos largos, búsquedas sin resultados, traducciones, imágenes ausentes, duraciones desconocidas y colecciones vacías. No declarar seed publicada.
