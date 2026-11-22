# C01 — Estado de implementación UI Conocimiento
Fecha: 2026-11-22. Rama `feat/ui-conocimiento-notion-like-c01`. **Sin merge y sin deploy**.

## Código escrito
- `apps/web/src/components/MemoryView.tsx`: nueva composición, biblioteca/documento, filtro, edición/borrado preservados con endpoints originales.
- `apps/web/src/components/knowledge/knowledge.types.ts`: tipos de presentación, categorías, formateadores.
- `apps/web/src/components/knowledge/KnowledgePieces.tsx`: header, toolbar, sidebar, lista, documento, sheet de filtros, estados vacíos.
- `apps/web/src/components/knowledge/knowledge.css`: estilo premium scoped, responsive y reduced-motion.

## Implementado visualmente
- Lista compacta móvil y escritorio, modos lista/tabla compacta/galería.
- Título Fraunces, interfaz Manrope, papel cálido, bordes finos, violeta moderado.
- Sidebar desktop, búsqueda, categorías y filtros en sheet móvil.
- Documento de lectura y editor existente estilizado.
- Padding móvil adicional para reducir superposición con chat flotante.
- Categorías existentes y etiquetas sin datos inventados; actor/proyecto/sector no se activan porque no constan campos verificados.

## Pendiente de verificación y posibles ajustes
**No se han ejecutado typecheck, build, Playwright ni capturas**: la herramienta GitHub disponible permite editar repositorio, pero no ejecutar su entorno. Un agente con Codespaces/CI debe ejecutar `pnpm --filter @agente/web typecheck`, `pnpm --filter @agente/web build`, `git diff --check` y E2E pertinentes antes de fusionar. Debe inspeccionar estilos reales del shell, prueba de teclado, focus trap del sheet, superposición del FAB, y confirmar persistencia visual tras editar/borrar (la lista depende del refresh externo de `memories`).
El selector «tabla» es una variante visual compacta, no tabla semántica de columnas; revisar denominación o construir tabla accesible en una segunda iteración.
El editor usa textarea y conserva el contrato existente; no es un editor de bloques rico.
El sheet tiene cierre por Escape y restauración de foco, pero falta focus trap completo; revisar accesibilidad.
La fuente `agntia-tokens.css` está importada de forma scoped; revisar posibles efectos de carga de fuentes en producción.

## Instrucciones al revisor
1. Revisar el diff y ejecutar tests.
2. Abrir Conocimiento con y sin datos en móvil y PC.
3. Probar búsqueda, categorías, edición, borrado, documento y chat abierto.
4. Corregir defectos en esta rama.
5. Enviar capturas al fundador para aprobación.
6. No mergear ni desplegar sin autorización explícita.

**Estado: código inicial implementado; QA y aprobación visual pendientes.**
