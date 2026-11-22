# 01 — Auditoría exclusivamente visual
## Evidencias del código
`landing/landing.css`: papel #fcfaf6, tinta #242421, texto secundario #6e6c66, líneas #e6e1d8, violeta #6550dd y oro #b49665. Fraunces para encabezados y Manrope para cuerpo. Contenedor máximo 1248px, secciones desktop 112px, botón primario de 50px mínimo y radio 9px; transiciones de ~200ms y reveals suaves.

`design-system/agntia-tokens.css`: mismos colores principales, superficie blanca, fondo suave #f2efe8 y lila #f0ecfc, bajo selector `.agntia-workspace`. **Existe un inicio de convergencia gráfica**.

`business-command-studio/studio.css`: tarjetas blancas con borde fino, radios 14px, sombras muy discretas, espacio exterior 20px, gaps 14–16px, títulos Fraunces, controles compactos y responsive a 1200/700px. Su estilo editorial-instrumental es referencia estética, no plantilla funcional.

`35-centro-mando/centro-mando.css`: variables globales antiguas #f6f6f9, #14141f, #8a8a9c. `index.css` y `tailwind.config.js` usan otros acentos y tipografía Instrument Sans. Hay deriva visual entre generaciones.

## Diagnóstico UI
- **Alta**: paletas, fuentes y tokens duplicados provocan identidad desigual.
- **Alta**: variables `:root` del Centro de Mando pueden contaminar otras vistas.
- **Alta**: no hay una especificación visual única para componentes, estados y densidades.
- **Media**: la landing y el Studio aplican diferentes escalas de espacio, apropiadas a sus contextos pero sin una escala común documentada.
- **Media**: motion, responsive y focus están implementados localmente, no como reglas compartidas.
- **Media**: ausencia de biblioteca de screenshots de referencia y comparación visual automatizada.

## Qué preservar
El carácter cálido y premium; titulares serif elegantes; interfaz sans precisa; superficies luminosas; violeta reservado a puntos de atención; detalles dorados sutiles; bordes finos; composiciones despejadas; sensación de producto artesanal, no dashboard genérico.

## Qué evitar
No copiar la estructura de ninguna pantalla a otra. No hacer que todos los workspaces parezcan Kanban ni landing. No confundir similitud de identidad con uniformidad de distribución. No reemplazar todo CSS legacy sin comparar visualmente.

## Límite
Los nombres de las pantallas auditadas identifican **fuentes de diseño**. No se derivan de ellas requisitos funcionales.