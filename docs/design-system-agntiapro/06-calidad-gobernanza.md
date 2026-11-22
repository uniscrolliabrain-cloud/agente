# 06 — Gobierno del lenguaje visual
## Alcance
Solo diseño visual, experiencia de interacción y accesibilidad de presentación. **Prohibido convertir esta guía en roadmap de funcionalidades, backend o arquitectura.**

## Criterios de revisión
1. Marca reconocible: papel cálido, tinta, violeta, oro discreto.
2. Tipografía Fraunces/Manrope con escala coherente.
3. Espaciado y alineación rigurosos.
4. Radios, bordes y sombras uniformes.
5. Una jerarquía visual principal.
6. Densidad apropiada al tipo de pantalla.
7. Iconografía consistente.
8. Estados visuales completos.
9. Motion elegante y reduced motion.
10. Móvil diseñado de verdad.
11. Contraste AA y foco visible.
12. Sin efectos visuales que distraigan.

## Campañas exclusivamente UI/UX
V01 inventario de CSS/tokens y screenshots de superficies existentes.
V02 catálogo visual de colores, tipografía, espaciados y radios.
V03 biblioteca de componentes gráficos y estados.
V04 plantillas de composición y variantes de densidad.
V05 sistema de motion y microinteracciones.
V06 responsive, safe areas, teclado móvil y sheets.
V07 galería de ejemplos visuales aprobados y antipatrones.
V08 pruebas de contraste, teclado y reducción de movimiento.
V09 regresión visual automatizada por viewport.
V10 adopción progresiva en nuevas interfaces y correcciones de deriva.

Cada campaña deja capturas antes/después, lista de tokens usados, excepciones y aprobación visual. No imponer migración masiva a pantallas aprobadas.

## Control de cambios
Tokens visuales canónicos con aliases legacy; componentes compartidos versionados; cambios globales con screenshot comparativo. Una excepción necesita motivo visual, captura y aprobación. No introducir paletas alternativas o nuevas tipografías sin decisión expresa.

## Qué significa «aprobado»
La apariencia ha sido contrastada con referencias reales en escritorio y móvil y aceptada por el fundador. Documentación propuesta no equivale a implementación ni a aprobación. No afirmar que se han ejecutado tests si no se ejecutaron.

## Entrega para agentes
Antes de diseñar: leer manual y localizar tokens reales. Durante: reutilizar componentes visuales. Después: capturas, contraste, responsive, interacción y diferencias respecto a la referencia. No merge/deploy sin autorización.