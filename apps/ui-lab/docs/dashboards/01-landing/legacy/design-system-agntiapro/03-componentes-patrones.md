# 03 — Gramática de componentes puramente visual
No define para qué sirve ningún workspace ni qué acciones debe contener.

## Anatomía visual común
Cada componente tiene superficie, geometría, tipografía, separación interna, borde, sombra, icono opcional, estados visuales, respuesta al foco, comportamiento en ancho estrecho y variante de densidad. Todas las decisiones derivan de tokens.

## Botones
Primario violeta; secundario claro con borde; oscuro tinta para énfasis instrumental; ghost discreto; icon-only con área clicable generosa. Altura recomendada 40–50px según contexto, radios 8–9px, texto Manrope 600. Hover sutil, active sin salto, focus visible, disabled claramente distinguible. No colocar cinco botones dominantes juntos.

## Cards y paneles
Fondo blanco sobre papel, borde arena, radio 14px aproximado y sombra casi imperceptible. Padding 16–24px; versión compacta 12–16px. Titular arriba, metadatos secundarios, separación por espacio antes que líneas. Card interactiva con hover leve y selección visible; card estática sin falso affordance.

## Barras, pestañas y navegación visual
Alturas consistentes, alineación de iconos y baseline de texto, indicador activo claro. Separación de grupos y jerarquía de primer/segundo nivel. En móvil, priorizar una navegación que respire; no comprimir todas las opciones en una línea. No especificar las secciones ni rutas: solo su presentación.

## Inputs y controles
Borde suave, superficie clara, label visible, placeholder secundario, foco violeta, errores legibles y sin saltos. Campos con alturas compatibles con botones. Sliders, toggles, checkboxes y selectores comparten color de selección, radios y ritmo. Controles densos no deben parecer widgets de proveedores distintos.

## Chips, etiquetas y badges
Tamaño pequeño, padding equilibrado, contraste suficiente, pocas variantes cromáticas. No usar badges por decoración. Los estados visuales se distinguen con texto, forma e icono además de color.

## Tablas, listas y elementos densos
Filas con altura y padding coherentes, cabeceras legibles, divisores finos, números alineados y espacio blanco controlado. Evitar zebra stripes intensas, líneas negras y sombras por fila. Truncamiento solo con acceso al contenido completo.

## Popovers, menús, tooltips, modales y sheets
Misma familia de superficies, sombras y radios. La elevación aumenta discretamente respecto a la base. Animación breve, foco visible, distancias consistentes. Los sheets móviles deben respetar safe areas y teclado; estética de lámina deslizable inspirada en patrones de Maps sin copiar su branding.

## Elementos de estado
Skeleton sobrio, vacío con jerarquía, error legible, progreso discreto, toast con superficie coherente. Sin ilustraciones exageradas ni destellos. El diseño comunica el estado sin dictar lógica funcional.

## Layouts visuales reutilizables
Editorial ancho; tablero de información; editor de tres zonas; lienzo protagonista; split view; mosaico de cards; panel lateral; pantalla de detalle; feed vertical. Son **arquetipos de composición**, no obligaciones ni definiciones de funcionalidades.

## Antipatrones
Exceso de tarjetas; demasiados niveles de borde; radios incoherentes; sombras pesadas; acentos cromáticos arbitrarios; texto microscópico; barras de herramientas recargadas; iconos sin alineación; navegación móvil superpuesta; padding irregular; demasiados tamaños de fuente.