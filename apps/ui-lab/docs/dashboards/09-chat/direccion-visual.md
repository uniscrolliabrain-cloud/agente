# C01 · Dirección visual — Chat UX V2

## 1. Principio

Chat de IA convencional con acabado AgntiaPro. La composición, los controles y el comportamiento se conservan; la mejora viene de tipografía, superficies, ritmo, foco y movimiento. Sin hero editorial, sin Fraunces en el titular, sin logo, avatar nuevo, eslogan, paneles ni flujos añadidos.

## 2. Tokens

Scope único `.chat-ux-v2`; no se contaminan `:root` ni `index.css`.

| Rol | Token local | Valor | Uso |
| --- | --- | --- | --- |
| Papel | `--cux-paper` | `#FCFAF6` | Fondo y degradado base |
| Superficie | `--cux-surface` | `#FFFFFF` | Compositor |
| Suave | `--cux-soft` | `#F2EFE8` | Hover y bordes de control |
| Tinta | `--cux-ink` | `#242421` | Texto principal |
| Secundario | `--cux-muted` | `#6E6C66` | Metadatos, placeholder (5.04:1) |
| Línea | `--cux-line` / `--cux-line-strong` | `#E6E1D8` / `#DED7CB` | Bordes |
| Violeta | `--cux-violet` | `#6550DD` | Enviar, foco, enlaces |
| Lila | `--cux-lilac` | `#F0ECFC` | Saludo, selección, cita |
| Oro | `--cux-gold` | `#B49665` | Reservado; sin uso decorativo nuevo |

Fondo: papel cálido con un halo lila casi imperceptible en la parte superior (`radial-gradient` al 75 % de opacidad sobre lila claro). Sin glassmorphism, sin neón.

## 3. Tipografía

- **Manrope** 400–800, woff2 variable local (`fonts/manrope-latin-var.woff2`, subset latin, 24 532 bytes, `font-display: swap`). Sin red.
- Titular: `clamp(30px, 5.4cqw, 48px)` / 700 / `-0.045em` / 1.08. Móvil 30–34 px.
- Cuerpo: 14.8 px / 1.7; usuario 14.5 px / 1.55; UI 12–13 px.
- Código: `ui-monospace` con tamaño 12.6–12.8 px.
- Contraste verificado: cuerpo 14.93:1, burbuja 13.80:1, metadatos 5.04:1.

## 4. Geometría y espacio

Escala 4 px. Radios: compositor 22 (18 en móvil), burbuja usuario 18/6, controles 12–13, tarjetas 12. Alturas: controles 40, select 30, chips 34, enviar 40. Sombra del compositor en dos capas muy contenidas; foco `0 0 0 3px rgba(101,80,221,.10)`. La separación se resuelve con espacio, no con cajas.

## 5. Fichas de componente

### Compositor
Anatomía: textarea autoajustable + fila de herramientas + chip SOP + enviar/detener. Variantes: vacío, con texto, adjunto subiendo/listo/error, streaming (detener), foco. Sin iconos nuevos. Objetivo táctil 40 px (excepción documentada frente a 44 px). El texto de ayuda y el placeholder existentes se conservan.

### Burbujas y lectura
Usuario a la derecha, superficie cálida, radio con esquina inferior derecha reducida. Asistente a la izquierda con avatar `IA` existente (círculo 26 px, anillo lila), texto markdown: párrafos, listas, títulos, citas, código con scroll local, tablas con región enfocable y scroll propio. Acciones (copiar, responder, resumir, traducir) visibles al hover o foco; siempre visibles en contenedor ≤680.

### Herramientas y timeline
Píldora «N pasos · duración» con `<details>` cerrado salvo ejecución (comportamiento real). Timeline «Tus análisis recientes» con chevron, panel de tres columnas ligeras y horas tabulares. No se inventan estados nuevos.

### Estados
Vacío (portada), conversación, streaming, cancelación, adjunto listo/error, dictado activo/no disponible, foco de teclado, reduced motion. El error de `chat.error` no tiene superficie en el componente real; se conserva y se documenta como deuda funcional.

## 6. Comparación Landing / Studio

- Landing aporta papel cálido, tinta, violeta contenido y fotografía; aquí solo se toma la paleta y la contención, no su narrativa ni titulares serif.
- Studio aporta disciplina instrumental (foco, densidad, estados); aquí se traduce a controles de 40 px, metadatos 12 px y jerarquía sin tablas densas.
- No se copian composiciones: el chat mantiene su gramática de conversación.

## 7. Responsive y convivencia con el panel

`container-type: inline-size` en `.chat-ux-v2`; las decisiones dependen del ancho real del contenedor, no del viewport. Cortes en 680, 520 y 400 px más una regla de altura ≤620 px. Con 480/680/900 px de contenedor el compositor, los chips y el titular se adaptan sin recortes (QA 76/76). El panel transversal no se modifica: solo reduce el ancho disponible.

## 8. Prohibiciones respetadas

Sin logo, avatar nuevo, eslogan, Fraunces, paneles, pestañas, resultados embebidos, funcionalidades nuevas, botones ficticios, tema oscuro, partículas, parallax, glassmorphism, animaciones infinitas decorativas ni cambios globales.
