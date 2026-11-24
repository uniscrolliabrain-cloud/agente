# Formación V4 · Bitácora de ejecución y auditoría provisional
**2026-11-24 · Estado: implementación parcial real; QA y publicación pendientes.** No afirmar nivel 9/10 sin capturas y tests.

## Decisión de alcance
El founder descarta implementar 120 cursos para V4. Se presentan **12 microlecciones seleccionadas**, reutilizando datos canónicos del catálogo legacy; las otras 108 no forman parte de la experiencia V4. No se han creado vídeos ni consumido créditos adicionales.

## Cambios efectuados
- `apps/ui-lab/src/formation-v4/FormationV4Workspace.tsx`: entrypoint independiente; Inicio, Buscar, Tu biblioteca, hero rotativo, tres colecciones editoriales, doce tarjetas, ficha accesible, guardados de sesión y recomendaciones.
- `apps/ui-lab/src/formation-v4/formation-v4.css`: identidad cálida, tipografía Fraunces/Manrope, composición editorial, imágenes, motion con reduced-motion, breakpoints, overlay y sheet.
- `apps/ui-lab/src/registry.tsx`: nueva vista `formation-v4`; `formation` renombrada como Legacy. No se sustituye la ruta de la antigua Formación.
- Imágenes: 12 WebP existentes en `apps/ui-lab/public/formation/images/`. No hay reproductor simulado; se muestra vídeo pendiente de producción.
- Acceso local UI Lab: `?view=formation-v4`; comparación con `?view=formation`.

## Campañas y evidencia
| Fase | Estado | Evidencia | Pendiente |
|---|---|---|---|
| C00 Inventario | Parcial | Catálogo, registry, V3, workflow y plan V4 revisados | Comparación visual con Landing/Studio |
| C01 Dirección de arte | Implementada en código | 12 imágenes mapeadas y CSS | Hoja de contacto, aprobación visual |
| C02 Navegación | Implementada en código | Inicio, Buscar, Biblioteca, Colecciones | E2E de recorridos |
| C03 Ficha | Implementada en código | Dialog, Escape, foco inicial, trap de Tab, recomendaciones | Tests de scroll y táctil |
| C04 Datos sintéticos | Implementada con alcance 12 | IDs reales, biblioteca local, textos demo | Revisión editorial por curso |
| C05 Motion | Implementada en CSS | Entradas, hover, sheet, reduced motion | Capturas/vídeo de transiciones |
| C06 Responsive/a11y | Implementada parcialmente | Breakpoints 420/760/1080, focus-visible | Pruebas 320/390/768/1440 y lector pantalla |
| C07 Build/deploy | Pendiente | Actions automáticas activadas por push | Resultado typecheck, build y Vercel |
| C08 Auditoría final | Pendiente | Esta bitácora provisional | QA visual comparativo, aceptación |
| C09 Promoción | No autorizada | Legacy preservado | Decisión explícita founder |

## Gates que aún no están demostrados
1. Typecheck/build del commit de V4 y ausencia de errores runtime.
2. Capturas reales de móvil y escritorio comparadas con Landing y Studio.
3. Verificación de los doce assets en el bundle y HTTP 200 en preview.
4. Foco, Escape, Tab, zoom 200%, VoiceOver/TalkBack, safe areas y touch.
5. Despliegue UI Lab: problema histórico Vercel Root Directory duplicado; **no corregir a ciegas** sin validar la configuración del proyecto dedicado.
6. Aprobación del founder para sustituir legacy.

## Riesgos conocidos
- Los guardados existen solo durante la sesión React, no son persistencia de usuario.
- El catálogo legacy se usa como origen de 12 cursos; descripciones aún breves y duración objetivo no es duración real.
- Las doce imágenes son reutilizadas en hero y tarjetas; recorte requiere inspección visual.
- La vista V4 no reproduce vídeo ni conecta LAIA a sistemas reales.

## Rollback
Eliminar la entrada `formation-v4` de registry; el componente legacy permanece intacto. No borrar assets compartidos. Revertir commits de V4 individualmente si el build falla.
