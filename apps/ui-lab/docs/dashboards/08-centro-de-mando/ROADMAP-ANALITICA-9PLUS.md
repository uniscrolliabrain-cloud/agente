# Analítica — Roadmap UX hasta 9+

Fecha: 2026-11-25. Rama documental: main. Estado: pausa de implementación por decisión del founder.

## Punto de partida
V2 publicada: analytics-v1, entrada centro-mando mediante demoViews. Generación de seis esculturas solicitada, no verificada. No sustituir Centro de Mando real.

## Nueve iteraciones
- V1 — composición bento, cuatro KPIs y seis gráficos; publicada.
- V2 — navegación demo, definiciones y responsive; publicada, sin certificación.
- V3 — revisar rama de assets, aprobar seis esculturas, copiar WebP optimizados a public/analytics; contrastar proporciones con datos; capturas comparativas.
- V4 — reconstruir composición fiel al mockup: barras y curvas como gráficos, no iconos; leyendas HTML, contraste, tamaños y jerarquía.
- V5 — catálogo KPI por finanzas, comercial, marketing, clientes, operaciones, equipo, IA y dirección; fórmulas, unidades y denominadores; fixture común Agntia Demo.
- V6 — periodos y comparativas coherentes: cada imagen fija ligada a su escenario; si no existe variante usar gráfico SVG preciso, nunca cambiar cifra dejando proporción falsa.
- V7 — drill-down hacia entidades existentes, fuentes y evidencias; LAIA interpreta sin fingir causalidad ni ejecución.
- V8 — responsive, teclado, foco, estados vacíos, rendimiento y carga diferida; validar build y capturas.
- V9 — auditoría contra mockup maestro y referencias UX, corregir defectos y obtener aprobación 9+; preparar contrato de sustitución por futuro renderer, sin implementar Motion.

## Protocolo obligatorio por iteración
Leer README, ESTADO-UX, handoff y prompt maestra de esta carpeta; contrastar guía UX transversal, Landing, Login, Chat, Apps y Estudio de Operaciones aprobados, y documentación de Agntia Demo. Inspeccionar componentes reales y commits antes de editar. Mantener shell y contratos; trabajar primero en UI Lab. Cada iteración entrega diff acotado, capturas desktop/tablet/móvil, resultado de typecheck/build y pruebas de interacción, incidencias y siguiente paso. Si falta evidencia marcar pendiente, no aprobado.

## Gate 9+
Puntuar 0–10 fidelidad artística (25%), jerarquía y espacio (15%), cobertura funcional (20%), coherencia de datos (15%), responsive/accesibilidad (15%), rendimiento y regresiones (10%). Exigir media ponderada superior a 9, ninguna dimensión inferior a 8, cero bloqueos críticos, build y pruebas verificadas y aprobación explícita del founder. Nueve iteraciones son hitos, no garantía automática; repetir la que falle. Conservar referencias aprobadas, no tocar backend, kernel, runtime, SOPs, permisos, persistencia ni infraestructura; no desplegar producción. No ejecutar este roadmap hasta nueva autorización.
