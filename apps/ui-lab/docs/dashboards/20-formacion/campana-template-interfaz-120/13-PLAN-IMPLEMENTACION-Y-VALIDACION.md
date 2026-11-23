# 13 · Plan de ejecución de UI Lab y validación profesional

**Objetivo:** entregar componentes React reales dentro de UI Lab, preview navegable y auditoría comparativa. No tocar `apps/web` ni desplegar producción. Los cambios de UI Lab se harán cuando se ejecute la campaña; este documento solo la prepara.

## Campaña 0 · Reconocimiento y congelación de referencia
Leer `apps/ui-lab/src/vendor/landing/*`, `apps/ui-lab/src/vendor/studio/*`, tokens, rutas y shell de UI Lab, catálogo y prompts. Recuperar `MobileChatSheet.tsx` de la rama/commit real, o dejar explícito que no existe accesible. Registrar commit base, componentes reutilizables, scripts y capturas de referencia.

**Gate:** matriz de fuente de verdad, snapshot desktop/móvil y plan de integración sin colisiones.

## Campaña 1 · Fundamentos visuales
Crear estilos locales `formation-*` que consuman tokens reales, y componentes base: botón, tab, card editorial, portada, metadatos, iconos y focus. No alterar tokens globales ni CSS Studio/Landing. Probar 360/390/1440.

**Gate:** galería de primitivas comparada con Studio/Landing; sin deriva cromática.

## Campaña 2 · Vertical slice escena + sheet
Implementar `FormationScene`, `FormationSheet`, `FormationEpisodeList` y `AdaptiveBottomSheet` reutilizado/extraído. Usar registro real del catálogo, placeholder si vídeo draft. Tres snaps y scroll interior; escritorio panel editorial.

**Gate:** grabación de gestos y accesibilidad; render fiel a la composición del mockup.

## Campaña 3 · Home y biblioteca
`FormationHome`, estanterías, búsqueda, filtros, guardados y colecciones; estado demo local explícito, 120 registros tipados y orden editorial determinista.

**Gate:** búsqueda y navegación verificadas, cero duplicación de shell.

## Campaña 4 · Player y continuidad
Mini-player y player expandido con estado real; si no hay assets de vídeo, UI preview sin falsa reproducción. Cola, transición espacial, preservación de posición y foco.

**Gate:** test de continuidad o bloqueo honesto por media ausente.

## Campaña 5 · Motion premium y polish
Aplicar storyboard 11: entrada editorial, sheet, tabs, cambios de episodio, minimización, salida; reduced motion y móvil real. Sin copiar layout Studio.

**Gate:** walkthrough comparativo, sin jitter/CLS y sin saturación visual.

## Campaña 6 · QA y revisión del founder
Typecheck, build, tests unitarios/integración existentes; screenshots 320/360/390/768/1024/1440, teclado, zoom, safe areas, landscape, errores, vacíos, no media. Comparar con Landing, Studio y mockup en misma resolución. Iterar hasta aprobación explícita.

**Gate final:** PASS técnico + PASS UX + PASS visual + aprobación founder. El deploy de preview de UI Lab es **un paso separado**, solo si la configuración y autorización están verificadas. No promoción a apps/web hasta nueva aprobación.

## Matriz de trazabilidad
| Decisión | Fuente | Implementación objetivo | Test |
|---|---|---|---|
| Marca | landing.css/tokens reales | formation.css alias | screenshot y CSS audit |
| Aire | auditoría Studio | layout hero/sheet | screenshot y densidad |
| Sheet | mockup + MobileChatSheet por recuperar | AdaptiveBottomSheet | touch/keyboard |
| Catálogo | metadata 120 | adapter + viewmodel | 120 IDs |
| Motion | auditoría branding + motion legacy | transiciones UI | video/reduced-motion |
| Retención | algoritmo V2 | selector de modo | consentimiento y cambio |
| Permisos | prompt V3 | CTA LAIA | bloqueos explícitos |

## Registro de ejecución
En cada campaña registrar fecha, commit, paths, dependencias, screenshots, pruebas y resultados exactos, bugs, decisiones y rollback en `06-BITACORA-Y-HANDOFF.md`. No marcar PASS sin evidencia.
