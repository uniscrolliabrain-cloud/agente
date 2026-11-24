# Estado UX — 11-apps

**Fecha de clasificación:** 2026-11-23  
**Estado:** POR DISEÑAR  
**Origen:** decisión del founder; no es una prueba de implementación.

El catálogo documental existe; NO significa que las 34 interfaces estén aprobadas.

**Tratamiento:** recopilar componentes actuales, definir objetivos y flujos, producir mock desktop/móvil y someterlo a aprobación antes de implementar.

**Bitácora y milestones:** [Cuaderno de bitácora UX](../19-general/BITACORA-UX.md).

## Notas y seguimiento

- Pendiente: capturas de referencia y mapeo preciso de componentes.
- Pendiente: estados responsive, accesibilidad, navegación y vacíos/errores.
- Pendiente: decisiones de diseño registradas con fecha y evidencia.

## Campaña Launcher V3 — 2026-11-24

**Estado:** implementado y verificado técnicamente; **pendiente de auditoría estética del founder**.

- Vista `apps-launcher-v3` en UI Lab: reposo con reloj Fraunces y notificaciones, escritorio con seis
  favoritas, tres carpetas, widgets empresariales y dock; cajón con las 35 apps y búsqueda;
  recientes; apertura de apps con transición desde el icono.
- Iconos: 35 originales 1024 generados individualmente (cerámica marfil, violeta, oro, fondo lavanda),
  derivados WebP y manifiesto con prompts. SVG y glifos provisionales quedan como referencia.
- Interacción: hover con ratón, primer toque selecciona y segundo abre en táctil (detección real de
  dispositivo), teclado completo con foco visible, Enter/Espacio y Escape por capa.
- QA: 33 comprobaciones en 7 anchos (360–1440), sin overflow, sin errores de consola, reduced motion
  efectivo. Sin aprobación estética declarada.
- Límites: los 35 workspaces reales no se reinventan; las apps abren una superficie de demostración
  identificada. Sin backend, sin autenticación, sin APIs ni servicios externos.
- Entrega: `campana-launcher-v3/` (00–09), `iconos/final/`, `qa/capturas/` y artifact
  `apps-launcher-v3-chromebook` generado por CI.
