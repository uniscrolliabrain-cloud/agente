# 03 · Campañas secuenciales de implementación

**Ejecutar en main conforme a la política UX del founder, sin desplegar.** Antes de tocar código verificar estado de main y cambios concurrentes; commits pequeños, sin sobrescribir trabajo ajeno. Si una fase no pasa, no empezar la siguiente. Documentar evidencia en 06.

| Fase | Objetivo | Archivos/superficies a inspeccionar o modificar (candidatos, verificar rutas) | Gate |
|---|---|---|---|
| C00 | Reconocimiento y benchmark | `apps/ui-lab/src/vendor/landing/*`, `apps/ui-lab/src/vendor/studio/*`, `apps/ui-lab/src/design-system/*`, shell y rutas actuales | inventario real + capturas |
| C01 | Design system Formación | tokens compartidos, primitivas de UI y estilos locales nuevos | contraste visual con referencias |
| C02 | Catalog adapter | `METADATA-120-CURSOS.json`, schema Zod y viewmodels; tests | 120 IDs, 0 duplicados, drafts bloqueados |
| C03 | Home y colecciones | FormationWorkspace, Hero, CourseShelf, Cards, local nav | desktop y móvil premium |
| C04 | Búsqueda y biblioteca | CourseSearch, CollectionDetail, PersonalLibrary | teclado, vacíos, filtros |
| C05 | Reproductor persistente | MiniPlayer, ExpandedReelPlayer, Queue, captions | continuidad, foco, no vídeos inventados |
| C06 | Detalle y práctica | CourseDetail, PracticeCTA, estados de conexión | sin acciones externas no aprobadas |
| C07 | Modos y recomendaciones | mode selector, razones, ranking editorial demo | modos voluntarios, no perfilado oculto |
| C08 | Motion y polish | transiciones, sheets, breakpoints, accesibilidad | no CLS, reduced-motion, móvil real |
| C09 | Validación integral | tests, build, capturas, walkthrough, auditoría final | revisión del founder antes de dar por terminado |

## Procedimiento obligatorio por fase

1. `git status` y registrar commit base; revisar trabajo concurrente en main.
2. Leer componentes y CSS reales. No crear nuevos componentes si hay equivalentes reutilizables.
3. Implementar solo el vertical slice acordado; sin placeholders de éxito.
4. Ejecutar typecheck, tests relevantes, build y smoke según scripts reales del repo.
5. Capturar escritorio 1440 px, tablet 768 px, móvil 390 px y móvil estrecho 360 px, y compararlos lado a lado con Landing y Estudio Demo en mismo entorno.
6. Documentar archivos tocados, evidencia, bugs, decisiones, limitaciones y rollback.
7. Registrar resultado PASS/FAIL; si no alcanza nivel visual, iterar antes de avanzar.

**No modificar:** backend Cognition, JEV, kernel, autorización, conectores, despliegue, Landing, Studio Demo ni navegación global sin campaña separada y aprobación expresa. Cualquier wiring real queda pendiente si falta contrato.

## Dependencias

Reutilizar React, Vite, Tailwind/CSS y lucide si ya instalados; Zod solo si ya disponible en el paquete o aprobado en la fase correspondiente. Evitar bibliotecas de carruseles, reproductores y animación adicionales salvo auditoría de necesidad y coste de bundle. No ejecutar instalaciones desde este documento.
