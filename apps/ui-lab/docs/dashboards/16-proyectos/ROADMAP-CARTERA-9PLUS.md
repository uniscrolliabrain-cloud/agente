# Cartera — Roadmap UX hasta 9+

Fecha: 2026-11-25. Rama documental: main. Estado: pausa de implementación por decisión del founder.

## Punto de partida
V2 publicada en cartera-v1; ocho portadas solicitadas y 60 prompts adicionales sin lanzar. No asumir assets incorporados ni ruta montada.

## Nueve iteraciones
- V1 — hero, carruseles, filtros y fichas; publicada.
- V2 — capítulos, galería, subida local y ranking; publicada.
- V3 — auditar los 60 prompts antes de lanzar; revisar ocho portadas, variedad de escenas y coherencia editorial; optimizar variantes WebP.
- V4 — montar Cartera en demo sin eliminar Proyectos real; hero cinematográfico, filas Netflix, búsqueda, filtros, Mi lista, navegación táctil y teclado.
- V5 — enriquecer Agntia Demo con entidades relacionadas y estados coherentes; filas recientes, continuar, top 10, pendientes, cobros, leads y riesgo; mismo ID en todas las filas.
- V6 — fichas inmersivas Netflix/Google Business Profile: galerías, capítulos, entregables, contratos, facturas, campañas y conversaciones según tipo.
- V7 — catálogo semántico con tags, selección determinista demo, override manual, subida validada; generación real solo si capacidad existente, si no documentar; no duplicar CRM.
- V8 — carga diferida, tamaños responsive, presupuesto de imágenes, accesibilidad y pruebas de navegación; comprobar que no se descargan cien fotos de entrada.
- V9 — auditoría visual y funcional frente a mockup aprobado, corregir y obtener aprobación 9+.

## Protocolo obligatorio por iteración
Leer README, ESTADO-UX, handoff y prompt maestra de esta carpeta; contrastar guía UX transversal, Landing, Login, Chat, Apps y Estudio de Operaciones aprobados, y documentación de Agntia Demo. Inspeccionar componentes reales y commits antes de editar. Mantener shell y contratos; trabajar primero en UI Lab. Cada iteración entrega diff acotado, capturas desktop/tablet/móvil, resultado de typecheck/build y pruebas de interacción, incidencias y siguiente paso. Si falta evidencia marcar pendiente, no aprobado.

## Gate 9+
Puntuar 0–10 fidelidad artística (25%), jerarquía y espacio (15%), cobertura funcional (20%), coherencia de datos (15%), responsive/accesibilidad (15%), rendimiento y regresiones (10%). Exigir media ponderada superior a 9, ninguna dimensión inferior a 8, cero bloqueos críticos, build y pruebas verificadas y aprobación explícita del founder. Nueve iteraciones son hitos, no garantía automática; repetir la que falle. Conservar referencias aprobadas, no tocar backend, kernel, runtime, SOPs, permisos, persistencia ni infraestructura; no desplegar producción. No ejecutar este roadmap hasta nueva autorización.
