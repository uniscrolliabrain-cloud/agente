# Estado UX — 08-centro-de-mando
2026-11-24: base funcional aprovechable, founder solicita refinamiento editorial. Campaña y código presentacional inicial publicados en main. Pendiente integración UI Lab, revisión visual, QA y artifact. Producción permanece intacta. Workspace 35 y control de actividad fuera de alcance.

2026-11-24 · campaña editorial V2 ejecutada en la rama `feat/ui-lab-command-center-editorial` (build `2bda0e581941`):

- Vista nueva `today-editorial` en UI Lab, módulo aislado `command-center-editorial/` con namespace `cce-*`. La vista `today` original sigue disponible para comparar.
- Composición editorial verificada: hero Fraunces, briefing marfil con regla de oro, cuatro cifras abiertas, cinco filtros, atención, en marcha, trabajo cerrado, feed «Lo que te has perdido», seis bloques operativos con hoja móvil, equipo y agentes.
- Paridad completa: mismos callbacks, permisos (`canManageMembers`, `role`), modales reales, modo ejemplo con el `SampleDashboard` original y estados de carga, error y vacío.
- Motion en tres tiempos con `prefers-reduced-motion` efectivo y sin replay en el polling. Fuentes Fraunces y Manrope self-hosted (OFL).
- QA: 26/26 comprobaciones en 320–1920, foco, teclado, hoja modal, contraste AA (mín. 4,57) y consola limpia. Rúbrica del gate: **96/100** (ver `campana-editorial-v2/06-QA.md`).
- Entregables: `campana-editorial-v2/componentes-finales/` (clon con SHA256) y `artifact/command-center-editorial-chromebook.zip` (13,8 MB, no versionado; regenerable).
- Pendiente: revisión visual del founder y decisión de promoción. Sin merge ni deploy. Límites declarados: sin tenant real en el laboratorio (router demo), sin lector de pantalla real y sin zoom 200% medido.
