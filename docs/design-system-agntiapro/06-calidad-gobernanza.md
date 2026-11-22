# 06 — Calidad, gobernanza y plan de adopción
## Gobierno
Design System Owner: fundador; implementación: agentes de código; revisión: tests, capturas y aprobación explícita. Las normas nuevas se proponen con ADR que incluya problema, variantes, tradeoffs, accesibilidad, compatibilidad y screenshots. No reescribir pantallas aprobadas para cumplir una moda.

## Estados de adopción
- **Observed**: existe en código, puede ser legacy.
- **Proposed**: definido en esta guía, pendiente de aprobación.
- **Approved**: validado por fundador.
- **Implemented**: componente/tokens en código.
- **Verified**: tests y capturas aprobadas.
No etiquetar Proposed como Implemented.

## Estrategia por campañas independientes
C00 inventario real de CSS, rutas y dependencias en todas las ramas relevantes; guardar matriz de fuentes y diffs.
C01 capturas base de landing, Centro de Mando, Studio y chat/vídeo en 360,390,768,1024,1440,1920.
C02 contrastes, fuentes, tokens y mapa de estilos legacy; decidir aliases sin romper.
C03 wrappers de Button, Card, Badge, Tabs, Inspector, EmptyState, Status y Overlay en carpeta compartida.
C04 migrar **solo** un componente piloto por superficie y comparar capturas.
C05 motion tokens y transiciones de paneles; reduced motion.
C06 chat dock, mobile sheet, teclado, safe areas, handoff y notas.
C07 Studio: selección compartida, timeline, grafos y simulaciones visuales.
C08 validar ViewSpec generativo tipado y allowlist, sin LLM CSS libre.
C09 pruebas automáticas de accesibilidad y regresión visual; auditoría performance.
C10 aprobar, documentar excepciones, fusionar por PR y desplegar únicamente con autorización.
Cada campaña: rama, diff mínimo, tests, screenshots, rollback y handoff. No hacer merge automático.

## Checklist de aceptación UX/UI
### Visual
- Paleta y fuentes canónicas o excepción documentada.
- Jerarquía H1/H2, espacios, radios y alineación consistentes.
- Una acción primaria por región.
- Densidad correcta por superficie; sin scroll doble innecesario.
- Componentes compartidos reutilizados; CSS encapsulado.

### Interacción
- Hover, focus, active, disabled, loading, empty, error, success.
- Teclado completo, Escape, tab order, aria, anuncios de cambios.
- Mobile touch targets y teclado virtual sin oclusiones.
- Motion reduced y no animación constante.
- Estado persistente al cambiar vista, agente o chat.

### Datos y seguridad
- Tenant correcto; identidad visible.
- Demo/real/simulación inequívocos.
- Cifras con fuente y timestamp.
- Errores de red no sustituidos por fixtures.
- Aprobaciones no ejecutan antes de consentimiento.
- No claims de éxito hasta respuesta backend.

### QA
- Typecheck, lint, unit, integración y E2E de recorridos críticos.
- Contraste AA, axe o equivalente, pruebas manuales lector de pantalla.
- Capturas Playwright comparadas con baseline y aprobadas.
- Web vitals medidas; performance de timeline con datos voluminosos.
- Sin errores de consola, foco perdido o hydration mismatch.
- Tests de aislamiento de tenant y permisos.

## Definición de terminado
Un workspace está terminado solo cuando diseño, funcionalidad, datos, accesibilidad, responsive, seguridad, pruebas y documentación coinciden. Un mock demo se entrega como **demo**, no como integración final.

## Registro de deuda
D01 unificar fuentes y colores de index.css/Tailwind/landing/Studio.
D02 scope `:root` de Centro de Mando.
D03 distinguir ControlCenterView, CentroMandoWorkspace y BusinessCommandStudio.
D04 construir componentes reutilizables sin reescritura total.
D05 snapshots visuales y catálogo interactivo.
D06 especificar conexión real de reportes de videollamada y notas.
D07 probar responsive Studio con chat abierto y teclado.
D08 documentar criterios para UI generativa y permisos.
D09 mapear ramas y despliegues efectivos.
D10 verificar accesibilidad real en todas las vistas.

## Política de excepciones
Una excepción requiere issue/ADR con screenshot, motivo, fecha, responsable y plan de convergencia. No añadir un nuevo hex hardcodeado sin justificación. No cambiar token global para arreglar un solo workspace. No usar `!important` como solución estándar.

## Mantenimiento
Revisión mensual de tokens/componentes y trimestral de patrones; registrar cambios con semver documental. Un cambio de color no puede entrar sin revisar contraste y capturas. Actualizar esta guía en el mismo PR que introduce patrón nuevo.
