# Dirección artística (C01)

## Tokens (código, no invención)

| Rol | Token | Valor |
|---|---|---|
| Papel | `--alp-paper` | `#FCFAF6` |
| Superficie | `--alp-surface` | `#FFFFFF` |
| Tenue | `--alp-soft` | `#F2EFE8` |
| Tinta | `--alp-ink` | `#242421` |
| Secundario | `--alp-muted` | `#6E6C66` |
| Línea | `--alp-line` | `#E6E1D8` |
| Violeta | `--alp-violet` | `#6550DD` |
| Violeta profundo | `--alp-violet-deep` | `#4F3FC9` |
| Lavanda | `--alp-lilac` | `#F0ECFC` |
| Oro | `--alp-gold` | `#B49665` |

Fraunces 400 para reloj, saludo y títulos; Manrope 400–800 para interfaz. Dos familias visibles como
máximo. Ningún texto esencial por debajo de 11 px.

## Composición

### Reposo

- Fondo papel con dos halos radiales (lavanda arriba a la derecha, cálido abajo a la izquierda) y un
  resplandor muy suave detrás del reloj.
- Reloj Fraunces `clamp(74px, 12.5vw, 168px)` con cifras tabulares y tracking negativo.
- Kicker en oro, fecha en versalitas, briefing de una frase.
- Tres notificaciones empresariales translúcidas, alineadas al pie, con etiqueta de app en violeta.
- Acceso a LAIA en píldora con borde oro, entrada al escritorio en violeta sólido, pista de gesto a la
  derecha. Toda la superficie es zona de desbloqueo (clic, Intro o deslizar hacia arriba).

### Escritorio

- Cabecera: marca real (`AgntiaPro` + marca), empresa, LAIA, recientes y bloqueo.
- Saludo Fraunces como único `h1`; fecha y contexto en una línea secundaria.
- Seis favoritas en rejilla de 6 columnas (4 en tablet, 3 en móvil) con iconos de 100 % del ancho de
  columna y radio 26 %.
- Tres carpetas con miniatura 2×2, nombre y recuento.
- Fila de recientes en píldoras con icono.
- Columna derecha: briefing (pieza editorial), agenda, trabajo pendiente y empleados sintéticos.
- Dock inferior translúcido con cuatro apps, recientes, LAIA y cajón.

Nada de tarjetas KPI cerradas, etiquetas compitiendo ni cajas homogéneas: la jerarquía se construye
con espacio, escala y tipografía.

### Cajón

Rejilla de iconos generosos (96 px mínimos, 74 px en móvil) sin nombres permanentes, agrupada por seis
categorías, con buscador fijo y contador de resultados. En 390 px caben cuatro columnas; en 768, seis.

## Colección de iconos

- Objetos escultóricos 3D, cerámica marfil satinada, esmalte violeta, detalles de oro champán.
- Fondo lavanda continuo (#F0ECFC) e iluminación de estudio con reflejos y sombra de contacto.
- Silueta central, espacio negativo generoso, sin tipografía ni logotipos.
- Cada icono tiene una metáfora propia y reconocible (sobre, burbujas, carpetas, calendario, diana,
  monedas, bolsa, engranajes, escudo, llave, portal, libro, dial, columnas, brújula…).

## Comparación con la landing

| Rasgo | Landing | Launcher V3 |
|---|---|---|
| Papel cálido y tinta | Sí | Sí, mismos hex |
| Serif editorial | Titulares grandes | Reloj y saludo |
| Violeta | CTA y acentos | Acción, selección, foco |
| Oro | Detalle fino | Kicker, LAIA, detalles de iconos |
| Profundidad | Fotografía y escenas | Iconos 3D y superficies translúcidas |
| Densidad | Narrativa amplia | Instrumental, con aire |

No se copia la composición de la landing: se comparte la gramática.
