# 02 — Identidad visual y tokens
## Personalidad
Editorial, premium, cálida, tranquila, sofisticada, contemporánea y muy legible. Tecnología que se siente humana y madura. No estética gamer, neón, futurismo saturado, gradientes de plantilla ni glassmorphism omnipresente.

## Paleta extraída de código
| Rol visual | Color | Evidencia |
|---|---|---|
| Fondo papel | `#fcfaf6` | landing/Studio |
| Superficie | `#ffffff` | Studio |
| Superficie tenue | `#f2efe8` | Studio |
| Tinta | `#242421` | landing/Studio |
| Secundario | `#6e6c66` | landing/Studio |
| Separador | `#e6e1d8` | landing/Studio |
| Acento | `#6550dd` | landing/Studio |
| Lila tenue | `#f0ecfc` | Studio |
| Dorado | `#b49665` | landing/Studio |

No introducir hex nuevos en componentes si existe token equivalente. Reservar el violeta para selección, enlaces destacados, CTA y foco; oro para microdetalles editoriales, no para grandes fondos. Contraste mínimo WCAG AA medido en contexto.

## Tipografía
**Fraunces** 400–500 para títulos editoriales, encabezados de página y momentos de identidad; tracking ligeramente negativo, sin abusar de itálicas. **Manrope** 400–800 para navegación, controles, textos, cifras y etiquetas. Mono solo para fragmentos de apariencia técnica cuando la composición lo requiera. No mezclar Instrument Sans en nuevas superficies salvo excepción aprobada.

Escala recomendada: display 48–72px; H1 28–40; H2 20–28; H3 17–22; cuerpo 14–16; caption 12–13; micro 11–12. Responsive con clamp y pruebas de saltos de línea. Interlineado: titulares 1.1–1.25, cuerpo 1.45–1.65. Máximo dos familias visibles por pantalla.

## Espaciado
Unidad 4px. Escala: 4,8,12,16,20,24,32,40,48,64,80,112. Agrupar por proximidad y separar por intención; mantener ritmo vertical. No convertir todo en cajas. Landing admite espacios amplios; software denso utiliza compactación consistente sin perder respiración.

## Bordes, radios y sombras
Borde fino #e6e1d8; radios 8–9px en botones, 12–16px en cards y paneles, 18–24px en grandes superficies. Píldoras solo cuando su forma aporta significado. Sombra ligera con alfa bajo; preferir borde sobre elevación. Evitar tres niveles de cards anidadas.

## Iconografía
Lucide o set equivalente unificado, 16–20px habitual, stroke consistente, alineación óptica, área táctil cómoda. No mezclar iconos 3D, emojis y lineales como si fueran un mismo sistema. Iconos solos: etiqueta accesible y tooltip cuando corresponda.

## Imágenes, retratos e ilustraciones
Retratos con iluminación, encuadre, tratamiento cromático y proporciones coherentes; evitar bancos de imágenes inconexos. Ilustraciones y mockups de producto deben respetar papel, tinta y violeta; no añadir efectos tecnológicos genéricos. Imágenes sirven a la composición, no la dominan sin intención.

## Tokens semánticos futuros
`--ui-bg-canvas`, `--ui-bg-surface`, `--ui-bg-subtle`, `--ui-text-primary`, `--ui-text-muted`, `--ui-border`, `--ui-accent`, `--ui-accent-soft`, `--ui-focus`, `--ui-radius-card`, `--ui-space-4`, etc. Son propuestas de nomenclatura, NO variables existentes. Migración mediante alias, nunca ruptura global.