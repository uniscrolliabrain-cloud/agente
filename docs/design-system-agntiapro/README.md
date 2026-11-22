# AgntiaPro — Manual maestro de branding, UI y UX visual
**Edición 2 · 22 noviembre 2026 · Exclusivamente diseño.** Esta documentación establece el lenguaje visual de toda AgntiaPro, independientemente de lo que haga cada workspace.

## Regla fundamental
**Esta guía NO define funcionalidades.** No prescribe operaciones, agentes, datos, workflows, modelos, contratos, permisos, arquitectura, backend ni lógica de producto. Los nombres de pantallas solo sirven para identificar **referencias estéticas**. Cada espacio conserva total libertad funcional; debe compartir la identidad gráfica, la calidad compositiva y el lenguaje de interacción.

## Referencias estéticas
- Landing premium: `apps/web/src/landing/landing.css` y `Landing.jsx`.
- Estudio de Operaciones: `apps/web/src/workspaces/business-command-studio/studio.css`, `BusinessCommandStudio.tsx` y `apps/web/src/design-system/agntia-tokens.css`.
- Centro de Mando: referencias visuales y `apps/web/src/workspaces/35-centro-mando/`; no es referencia funcional.
- Capturas aportadas por el fundador: fuente de preferencias visuales, sujetas a revisión por versión.

## Índice
01. Auditoría estética y diferencias entre fuentes.
02. Identidad, tokens y tipografía.
03. Gramática visual y catálogo de componentes **visuales**.
04. Movimiento, transiciones y feedback.
05. Composición, navegación visual, responsive y densidad.
06. Control de calidad, gobernanza visual y evolución.
07. Prompt universal para agentes de diseño/frontend.

## Los diez principios
1. Belleza editorial y precisión de software profesional.
2. Identidad cálida: marfil, carbón, violeta y oro contenido.
3. Fraunces para titulares, Manrope para interfaz.
4. Una jerarquía evidente, no un mosaico de tarjetas.
5. Espacio negativo deliberado; densidad sin saturación.
6. Un sistema de superficies, bordes y radios coherente.
7. Movimiento corto, suave y con sentido espacial.
8. Adaptación móvil rediseñada por composición, no miniaturizada.
9. Estados visuales completos y accesibles.
10. Consistencia de marca sin imponer un mismo layout a todas las pantallas.

## Alcance y verificación
Auditoría de CSS y componentes concretos en rama `feat/business-command-studio-demo`; no auditoría visual automatizada de navegador. Los valores exactos extraídos del CSS se distinguen de las recomendaciones. La rama es documental, no cambia interfaces ni despliega.