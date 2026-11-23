# 07 · Auditoría de paridad visual: Landing real vs campaña Formación

**Fecha:** 2026-11-23. **Resultado:** INFERIOR COMO ESPECIFICACIÓN DE DISEÑO. No hay componentes Formación implementados en esta campaña; no es una comparación de pantallas renderizadas. Evidencia: snapshot `01-landing/ejemplo-componentes-reales/{Landing.jsx,ProductScene.jsx,landing.css}`, manual maestro y `01-DESIGN-BRIEF.md`. Código activo y render deben volver a comprobarse en C00.

## Evidencia concreta de la landing

- CSS real snapshot: `--lp-paper:#fcfaf6`, `--lp-ink:#242421`, `--lp-muted:#6e6c66`, `--lp-line:#e6e1d8`, `--lp-violet:#6550dd`, `--lp-gold:#b49665`. En la prompt V3 hay tokens aproximados diferentes: no imponerlos sin revisar el CSS vigente.
- Tipografía Fraunces 400 para encabezados y Manrope para interfaz; line-height base 1.65, container 1248 px, secciones con padding vertical de 112 px, eyebrows 12 px con tracking 0.13em. **No copiar 112 px a un workspace**: trasladar el principio de aire y escala a un espacio operativo.
- Botón principal con altura mínima 50 px, radio 9 px, hover de -2 px y sombra violeta muy medida; foco visible 2 px y offset 5 px.
- `Landing.jsx` usa LAIA, Antonio y Pedro con retratos, quotes y duración de piezas; el lenguaje visual parte de personas y situaciones.
- `ProductScene.jsx` usa escenas diferenciadas Centro de Mando, Conversación, Operaciones, Workspaces y arte de producto, en vez de un grid repetido.
- La auditoría del Estudio Demo documenta carencias de respiración y motion: es benchmark de coherencia, no un patrón que deba clonarse sin mejorar.

## Diagnóstico de nuestra campaña

| Criterio | Landing | Campaña anterior | Brecha |
|---|---|---|---|
| Identidad/tokens | Valores reales y componentes concretos | Descripción genérica y tokens aproximados | ALTA |
| Jerarquía tipográfica | Escala, ritmo, tipografía implementados | «Fraunces + Manrope» sin escalas por superficie | ALTA |
| Narrativa visual | Retratos, escenas, composición variable | Hero + shelves + cards | ALTA |
| Diseño de portadas | Contexto visual con personajes y producto | Sin gramática de portadas | ALTA |
| Motion | Transiciones y microinteracciones concretas | Reglas genéricas 150–300 ms | MEDIA-ALTA |
| Responsive | CSS extenso real | Requisitos y cuatro viewports | MEDIA |
| Arquitectura funcional | Landing comercial | Componentes Formación enumerados | ADECUADA como plan |
| Evidencia de calidad | Código CSS/JSX existente | No hay render ni capturas de Formación | BLOQUEANTE |

**Conclusión:** no dar a la campaña sello «al nivel de la landing». La campaña es un esqueleto de implementación y QA, no un art direction listo para ejecutar sin riesgo de UI genérica.

## Requisitos adicionales obligatorios para el agente

1. **Extraer una hoja de estilo visual medible** desde el CSS activo: tokens, escala tipográfica, sombras, ritmos, densidad, breakpoints y componentes reutilizables. Registrar selectores y screenshots.
2. **Crear tres conceptos de composición** (no tres paletas): A «biblioteca editorial» con portada de autor, B «escenas de trabajo» con protagonistas y casos, C «escucha y practica» con player dominante y continuidad. Seleccionar uno con aprobación del founder antes de construir.
3. **Diseñar un sistema de portadas** para 120 cursos: 3 tracks con gramática visual común, variación por colección, tema y personajes; 9:16 para reels, 4:3/16:9 para hero y 1:1 para colecciones; no repetir 120 gradientes.
4. **Especificar anatomía de componentes**: hero, shelf, card, detalle, player, mini-player, colección, modo y práctica con proporciones, tamaños, tipografía, estados y ejemplos de contenido real.
5. **Crear una escena narrativa de LAIA** coherente con retratos reales aprobados: diálogo contextual, resultado propuesto, revisión y CTA; nunca inventar una ejecución.
6. **Motion storyboard** con entrada, navegación, cambio de colección, tarjeta→detalle, mini-player→player, player→práctica, salida y reduced motion. Definir causa/efecto, duración, easing y conservación de foco.
7. **Comparativa visual obligatoria**: capturas del mismo entorno y viewport de Landing/Studio/Formación, con comentarios de jerarquía, ritmo, densidad, legibilidad y movimiento. No aceptar «parece premium» sin evidencia.
8. **Separar inspiración Spotify de identidad**: biblioteca y continuidad sí; color, iconos, estructura calcada y dark theme no.
9. **No construir la versión definitiva sin un concepto visual aprobado**. Primero prototipo de Home + ficha + player, desktop/móvil, luego componentes restantes.
10. **No maquillar ausencia de media**: portadas editoriales pueden existir como assets propios, pero vídeo en draft se muestra no disponible.

## Estado del gate

- Auditoría documental: realizada.
- Inspección de snapshot Landing: realizada.
- Render actual de Landing y Studio: NO realizado.
- Mockup/Formación implementado y comparado: NO realizado.
- Aprobación founder del concepto: PENDIENTE.
- **Gate de paridad visual: FAIL / no demostrada.**
