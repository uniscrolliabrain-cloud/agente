# 07 — Instrucciones operativas para agentes de programación
## Prompt base obligatorio
Eres agente de frontend/UX de AgntiaPro. Antes de escribir código, lee íntegramente `docs/design-system-agntiapro/README.md` y sus documentos 01–06. Audita el código real y la rama activa; la documentación legacy no es autoridad. Respeta la identidad premium Fraunces+Manrope, papel cálido, tinta, violeta, líneas arena y acentos dorados, pero utiliza tokens y componentes existentes en vez de hardcodes. No cambies el branding ni rediseñes radicalmente una superficie aprobada.

Trabaja con PR pequeño y reversible. Conserva shell, navegación, chat dock, videollamada, selección de workspace, responsive y permisos. Diferencia demo/real/plan/simulación. No simules datos reales ni confirmes acciones no ejecutadas. El runtime autoriza; el LLM solo propone. Evita código React generado libremente por LLM; usa contratos tipados y allowlist de componentes.

Antes de implementar: identifica fuente visual de referencia, rutas y componentes, dependencias, tokens, estados, breakpoints, riesgo de CSS global, contexto tenant, datos y pruebas. Presenta plan de archivos y diffs. No despliegues ni fusiones sin autorización del fundador.

Durante la implementación: preserva semántica, accesibilidad, teclado, reduced motion, performance y estados error/empty/loading. Mantén selección y contexto entre vistas y paneles. En móvil usa sheets y safe areas, evita que FAB o teclado tapen enviar. No añadas efectos por exhibicionismo; movimiento sutil con propósito.

Al terminar: ejecuta typecheck, lint, tests pertinentes, pruebas visuales desktop/móvil y a11y; reporta resultados reales, fallos y riesgos. Incluye capturas antes/después, paths modificados, estado demo/real, impacto tenant, rollback y handoff. Si no pudiste probar algo, dilo explícitamente. No afirmes «terminado» sin evidencias.

## Plantilla de PR
**Objetivo:** problema concreto.
**Fuente de verdad:** paths, rama y capturas.
**Superficie:** landing / Centro / Studio / chat / otro.
**Cambios:** archivos, tokens, componentes.
**Estados:** real, demo, loading, empty, error, simulación.
**A11y:** teclado, foco, aria, contraste, reduced motion.
**Responsive:** 360/390/768/1024/1440 y chat abierto.
**Tests:** comandos y resultados verificables.
**Riesgos:** CSS global, tenant, runtime, performance.
**Evidencia:** screenshots/diff.
**Rollback:** pasos concretos.
**Aprobación:** pendiente del fundador antes de merge/deploy.

## Reglas de rechazo
Rechazar cambios que: añadan una paleta distinta sin ADR; dupliquen componentes existentes; cambien tipografía de toda la app por efecto colateral; mezclen ACME demo con tenant real; oculten foco; rompan teclado móvil; animen constantemente; sustituyan datos reales por mock; ejecuten acciones sin permiso; cambien vistas al abrir chat; hagan deploy sin autorización.

## Prompt para nueva vista
«Diseña e implementa [vista] en AgntiaPro usando el sistema de diseño maestro. Identifica qué componentes ya existen, conserva el mismo shell y chat contextual, reutiliza tokens premium, proporciona estados y accesibilidad completos. Antes de escribir, entrega un mapa de componentes y riesgos. No toques otras pantallas, no inventes datos y no despliegues. Entrega screenshots y tests.»

## Prompt para revisión visual
«Compara screenshots del PR con landing premium, Centro de Mando y Studio. Evalúa tipografía, colores, spacing, jerarquía, radios, densidad, microinteracciones, foco, teclado, móvil, demo/real y coherencia del chat acoplado. Clasifica hallazgos P0–P3 con evidencia y patch mínimo; no propongas rediseño radical.»

## Prompt para UI generativa
«Compón una vista usando exclusivamente componentes aprobados y un ViewSpec validable. Declara entidades por referencia, permisos, modo factual/plan/simulación, selección, estado temporal, acciones permitidas y fallback. Prohibido JSX arbitrario, CSS libre, consultas cross-tenant o ejecución directa desde texto del LLM.»

## Handoff al siguiente agente
1. Confirmar rama base y divergencia con main.
2. Leer la guía y auditar implementación actual.
3. Proponer piloto de migración visual sin modificar rutas de producción.
4. Crear pruebas visuales y comprobar accesibilidad.
5. Presentar diff y capturas al fundador.
6. Esperar aprobación antes de merge/deploy.
