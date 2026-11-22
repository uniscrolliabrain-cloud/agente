# 02 — Identidad visual y tokens normativos
## ADN de marca
Editorial premium, humano, cálido, tecnológico sin estética sci-fi recargada. Papel marfil, tinta carbón, líneas arena, acento violeta vivo, detalles dorados discretos. Interfaz sobria y profesional, densidad útil de editor creativo. No neón, no glassmorphism excesivo, no gradientes genéricos, no saturación de chips.

## Colores fuente confirmados
| Semántica | Canonical propuesta | Fuente |
|---|---|---|
| paper | `#fcfaf6` | landing y tokens Studio |
| surface | `#ffffff` | Studio |
| soft | `#f2efe8` | Studio |
| ink | `#242421` | landing y Studio |
| muted | `#6e6c66` | landing y Studio |
| line | `#e6e1d8` | landing y Studio |
| violet | `#6550dd` | landing y Studio |
| lilac | `#f0ecfc` | Studio |
| gold | `#b49665` | landing y Studio |

Estos son valores fuente, no una licencia para usarlos en todos los contextos. Crear roles `color.bg.canvas`, `surface.default`, `surface.subtle`, `text.primary`, `text.secondary`, `border.default`, `interactive.primary`, `focus.ring`, `status.*`; los estados de error, aviso y éxito requieren contraste verificado y no deben deducirse de la paleta decorativa. **No reemplazar** variables `--lp`/`--ag`/`--v2` sin compatibilidad.

## Tipografía
- Titulares editoriales: **Fraunces** 400/500; kerning compacto, altura de línea 1.1–1.25; usar en hero, títulos de workspace y bloques narrativos, nunca en cifras tabulares.
- Interfaz y cuerpo: **Manrope** 400/500/600/700/800; alturas de línea 1.4–1.65; evitar 800 para párrafos.
- Monoespaciada para IDs, timestamps técnicos y logs: fuente del sistema monospace, solo cuando mejora escaneabilidad.
- Escala objetivo propuesta: display 48–72; page title 28–36; section 20–24; body 14–16; meta 12–13; micro 11–12 px. En escritorio denso permitir 12 px para etiquetas secundarias, nunca para controles esenciales.
- Números de métricas: tabular-nums; separadores locales; unidad visible.
- No usar tipografía como único indicador de prioridad.

## Espaciado
Unidad base 4px; escala 4/8/12/16/20/24/32/40/48/64/80/112. En Studio: 16px de gap de layout, 14px entre inspector y visualizador, 20px de padding exterior según CSS auditado. En landing: contenedor máximo 1248px y secciones 112px desktop. Adaptar, no trasplantar el padding de marketing a una tabla operativa.

## Geometría
- Bordes suaves y consistentes: botones 8–9px; cards funcionales 12–16px; contenedores grandes 14–20px; píldoras solo para estados, filtros y acciones compactas.
- Borde fino `--ag-line`; sombra mínima, nunca contorno+shadow pesado simultáneo.
- Un solo nivel principal de tarjeta anidada; evitar cajas dentro de cajas.
- Iconos Lucide de 16–20px, grosor coherente; icono sin etiqueta solo con tooltip y aria-label.

## Contraste y estados
Contraste WCAG AA: 4.5:1 texto normal y 3:1 texto grande y controles relevantes; comprobar sobre el color real. Violet no debe ser color de texto pequeño sobre fondos claros sin verificar. No codificar semántica solo con color: texto+icono+estado. Focus-visible 2px violeta con offset 3–5px, jamás quitar outline sin sustituto.

## Densidades
- Marketing: ritmo editorial, imágenes y bloques respirados.
- Centro de Mando: lectura rápida, briefing, alertas, métricas, aprobaciones.
- Studio: densidad instrumental, columnas, inspector, tracks y canvas; superficies claras y separadores finos.
- Videollamada: contenido humano protagonista, controles agrupados y notas estructuradas debajo.
La identidad se mantiene por tokens, tipografía, tono y comportamiento, no por hacer todas las pantallas iguales.

## Anti-patrones visuales
Cards enormes para un solo dato; sombras oscuras; violeta en todo; bordes de 2px por defecto; texto gris ilegible; animaciones constantes; tipografías mezcladas; widgets de distinta altura sin razón; modales para cada acción; floating chat tapando enviar; toolbars duplicadas; barras laterales que reducen el canvas hasta hacerlo inútil.
