# Dirección visual (C01)

Autoridad de branding: landing real (`apps/ui-lab/src/vendor/landing/landing.css`) y tokens
compartidos (`src/design-system/agntia-tokens.css`). Comparación hecha con la captura
`qa/capturas/referencia-landing-1440.png`.

## Tokens (valores de código, no invención)

| Rol | Token | Valor | Uso |
|---|---|---|---|
| Papel | `--cce-paper` | `#FCFAF6` | fondo |
| Superficie | `--cce-surface` | `#FFFFFF` | tarjetas y paneles |
| Tenue | `--cce-soft` | `#F2EFE8` | briefing, detalle, aviso |
| Tinta | `--cce-ink` | `#242421` | texto principal |
| Secundario | `--cce-muted` | `#6E6C66` | metadatos |
| Línea | `--cce-line` | `#E6E1D8` | bordes de 1 px |
| Violeta | `--cce-violet` | `#6550DD` | acción, selección, foco |
| Lila | `--cce-lilac` | `#F0ECFC` | selección y etiquetas |
| Oro | `--cce-gold` | `#B49665` | firma de LAIA y regla del briefing |

Estados con semántica y contraste medido (AA sobre su propio fondo):

| Estado | Fondo | Texto | Ratio |
|---|---|---|---|
| Atención / falta dato | `#FBF1DE` | `#8A5A12` | 5,28 |
| Error | `#FBEAE8` | `#A02B25` | 6,29 |
| Hecho | `#E9F2E8` | `#2F6A41` | 5,63 |
| En curso | `#EAF0FA` | `#2F4B86` | 7,42 |

Medidos en el QA: 13 pares de texto/fondo entre 4,57 y 14,93. El mínimo (4,57) es el aviso de
datos de ejemplo, por encima del 4,5 exigido.

## Tipografía

- **Fraunces** 400: saludo (52/44/34 px según ancho), títulos de sección (24–30), cifras (32–40),
  nombres de panel (21), título de la hoja (22). Tracking −0,03 a −0,045 em.
- **Manrope** 400–800: cuerpo, controles, etiquetas, metadatos, filas y tablas.
- Ambas **self-hosted** (`fonts/*.woff2`, subsets latin y latin-ext) para que el artifact funcione
  sin red. Verificado: `document.fonts.check` correcto con todas las peticiones externas
  bloqueadas (`qa/capturas/offline-sin-red.png`).
- Dos familias visibles como máximo. Sin microtexto por debajo de 11 px.

## Composición

- Contenedor 1248 px, padding `clamp(16px, 4vw, 48px)`, ritmo vertical de 26–40 px.
- Hero: identidad + rol + acciones; saludo protagonista; fecha y actualización discretas.
- Briefing: pieza de lectura, máximo 72 ch, acciones al final.
- Cifras: cuatro columnas abiertas con separadores de 1 px; selección con línea violeta de 2 px.
- Filtros: píldoras con scroll horizontal y desvanecido en móvil; misma semántica de perspectivas.
- Atención: tarjetas con etiqueta, asunto, contexto y acción existente. Una sola tarjeta con acento
  rojo (el fallo), no saturación.
- Feed y trazabilidad: listas con separadores; cero cajas repetidas.
- Estado operativo: seis bloques con cifra editorial y detalle expandible.
- Equipo y agentes: paneles abiertos con punto de estado y rol.

## Densidad y jerarquía

Un protagonista por escena: hero → briefing → cifras → secciones. Se alternan densidad editorial
(briefing), instrumental (listas) y compacta (bloques). No se añaden gráficos decorativos ni
tarjetas KPI cerradas.

## Diferencias justificadas respecto a la landing

La landing usa narratoria fotográfica y escenas de producto; el Centro de Mando es una superficie
de trabajo. Se comparte gramática (papel cálido, serif editorial, violeta contenido, oro como
detalle), no la composición. El oro se reserva a la firma de LAIA para no competir con el violeta.
