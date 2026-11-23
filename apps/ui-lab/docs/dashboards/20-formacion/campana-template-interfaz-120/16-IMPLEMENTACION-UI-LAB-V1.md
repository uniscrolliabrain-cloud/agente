# 16 · Implementación de Formación UI Lab V1

**Fecha:** 2026-11-23. **Rama:** main. **Estado:** código implementado, compilación y revisión visual pendientes; no desplegado.

## Archivos
- `apps/ui-lab/src/formation/catalog.ts`: proyección de los 120 cursos desde `METADATA-120-CURSOS.json`, sin editar el origen.
- `apps/ui-lab/src/formation/FormationWorkspace.tsx`: home editorial, hero, filtros, búsqueda, biblioteca de sesión, tarjetas, ficha y relaciones.
- `apps/ui-lab/src/formation/formation.css`: diseño responsive y tokens coherentes con Landing.
- `apps/ui-lab/src/registry.tsx`: entrada `formation` del selector UI Lab.

## Comportamientos
- Tabs Explorar / Mi biblioteca, búsqueda local, filtro de tracks, guardar/quitar curso en memoria de sesión.
- Portada editorial alternable; arte geométrico CSS temporal hasta recibir 12 imágenes.
- Ficha bottom sheet con snaps peek/half/full, gesto táctil/puntero, control accesible de expansión y cierre.
- Vídeos y progreso **no simulados**: muestra estado en preparación y duración objetivo editorial, no tiempo reproducido.
- Los 120 cursos son catálogo draft, no material publicado.

## Pendiente / QA
- Ejecutar `pnpm --filter @agente/ui-lab typecheck` y `pnpm --filter @agente/ui-lab build` en checkout con dependencias; no se han ejecutado en esta sesión.
- Verificar arrastre real y scroll interno en Android, iOS y escritorio; comparar con el sheet de chat si se recupera el código original.
- Auditar capturas a 320/390/768/1440 px y movimiento reducido.
- Validar visualmente composición frente a Landing y Studio.
- Tras aprobación de componentes, redactar 12 prompts de imagen y conectar assets aportados por founder.
- No desplegar UI Lab ni producción sin autorización.
