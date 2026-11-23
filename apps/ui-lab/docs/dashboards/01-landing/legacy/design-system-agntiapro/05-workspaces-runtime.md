# 05 — Composición universal, responsive y densidad
**Este capítulo trata solo de diseño.** El nombre histórico del archivo se conserva para no romper enlaces; no contiene especificaciones de runtime ni funcionalidades.

## La identidad no es una plantilla
Cada workspace puede necesitar una composición totalmente distinta. El sistema común regula tipografía, color, geometría, espacio, jerarquía, movimiento y presentación de estados. No obliga a compartir distribución, número de paneles, navegación interna ni componentes funcionales.

## Principios de composición
- Un centro de gravedad visual evidente.
- Agrupar por proximidad y alinear por retículas consistentes.
- Distinguir áreas principales y secundarias por tamaño, contraste y espacio.
- Mantener márgenes exteriores generosos cuando el viewport lo permita.
- Evitar huecos accidentales y zonas excesivamente compactadas.
- Priorizar espacio negativo útil; no rellenar por rellenar.
- Evitar scrolls anidados sin necesidad visual.
- Mantener proporciones armónicas al expandir/contraer paneles.

## Familias de composición
**Editorial:** gran titular, respiración y bloques narrativos.
**Dashboard:** métricas y módulos en rejilla jerárquica, sin mosaico caótico.
**Editor profesional:** área principal amplia, herramientas secundarias y zonas colapsables.
**Split view:** dos zonas coordinadas con divisor y proporciones estables.
**Canvas:** contenido protagonista con controles discretos.
**Feed:** ritmo vertical y separación de unidades.
**Móvil:** superficies apiladas, navegación compacta, sheets y controles al alcance del pulgar.
Son referencias espaciales, no definiciones de qué hace cada pantalla.

## Densidades
Airy (marketing): padding 24–64px, separaciones grandes y lectura lenta.
Comfortable (gestión): padding 16–24px, módulos claros.
Compact (herramienta): padding 8–16px, mayor información por área.
La densidad cambia, pero las proporciones tipográficas, bordes, colores y radios siguen perteneciendo a la misma familia.

## Responsive
Verificar 360, 390, 640, 768, 1024, 1200, 1440 y 1920px. Usar breakpoints por contenido, no por dispositivo comercial. En móvil: evitar textos que rompan botones, scroll horizontal de página, barras tapadas por teclado y zonas táctiles diminutas. Respetar safe areas, notch, orientación y zoom de texto al 200%. Paneles se convierten en sheets o se reordenan cuando la composición lo exige.

## Reglas de navegación visual
Separar navegación global, contextual y local por jerarquía y tratamiento gráfico; no duplicar tres menús de igual peso. Elemento activo inequívoco. Iconos y etiquetas coherentes. El diseño debe funcionar tanto con pocos elementos como con muchos, sin obligar a una estructura funcional específica.

## Color y jerarquía
El violeta guía la mirada hacia la interacción dominante; tinta organiza títulos; muted distingue secundarios; oro aporta detalle editorial. No usar cinco acentos para cinco columnas sin motivo. El peso visual se controla primero por tamaño, espacio y contraste, después por color.

## Checklist de composición
¿Dónde mira primero el usuario? ¿Se distingue claramente lo principal? ¿Hay huecos feos? ¿Demasiadas cajas? ¿Alineación consistente? ¿El contenido respira? ¿La interfaz sigue siendo elegante en móvil? ¿El espacio de trabajo tiene superficie suficiente? ¿Se reconoce la misma marca sin copiar el layout de otra pantalla?