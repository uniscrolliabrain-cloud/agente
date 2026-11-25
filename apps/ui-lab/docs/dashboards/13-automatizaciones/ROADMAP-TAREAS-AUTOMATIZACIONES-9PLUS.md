# Tareas y Automatizaciones — Roadmap UX hasta 9+

Fecha: 2026-11-25. Rama documental: main. Estado: pausa de implementación por decisión del founder.

## Punto de partida
V3 referida en historial; verificar TasksAutomationsWorkspace y recursos automation-nodes. Conservar capacidades actuales.

## Nueve iteraciones
- V1 — inventario de tareas, SOPs y automatizaciones; verificar baseline.
- V2 — diseño visual y nodos escultóricos; verificar baseline.
- V3 — workspace unificado demo; verificar baseline.
- V4 — auditar 14 iconos y su asignación semántica; mejorar jerarquía, espacio y composición sin sustituir flujos.
- V5 — fixture Agntia Demo coherente: tareas, estados, responsables, dependencias, ejecuciones y aprobaciones; separar definición SOP de ejecución.
- V6 — profundizar detalle, timeline, filtros, búsqueda, kanban y navegación a evidencias existentes; preservar acciones reales y marcar demo.
- V7 — revisar wiring con contratos existentes, sin ejecutar acciones ficticias ni modificar runtime; estados de error, espera, reintento y aprobación.
- V8 — pruebas de navegación, responsive, teclado, rendimiento y regresión; capturas comparativas.
- V9 — auditoría de calidad 9+ y aprobación founder; no promoción automática.

## Protocolo obligatorio por iteración
Leer README, ESTADO-UX, handoff y prompt maestra de esta carpeta; contrastar guía UX transversal, Landing, Login, Chat, Apps y Estudio de Operaciones aprobados, y documentación de Agntia Demo. Inspeccionar componentes reales y commits antes de editar. Mantener shell y contratos; trabajar primero en UI Lab. Cada iteración entrega diff acotado, capturas desktop/tablet/móvil, resultado de typecheck/build y pruebas de interacción, incidencias y siguiente paso. Si falta evidencia marcar pendiente, no aprobado.

## Gate 9+
Puntuar 0–10 fidelidad artística (25%), jerarquía y espacio (15%), cobertura funcional (20%), coherencia de datos (15%), responsive/accesibilidad (15%), rendimiento y regresiones (10%). Exigir media ponderada superior a 9, ninguna dimensión inferior a 8, cero bloqueos críticos, build y pruebas verificadas y aprobación explícita del founder. Nueve iteraciones son hitos, no garantía automática; repetir la que falle. Conservar referencias aprobadas, no tocar backend, kernel, runtime, SOPs, permisos, persistencia ni infraestructura; no desplegar producción. No ejecutar este roadmap hasta nueva autorización.
