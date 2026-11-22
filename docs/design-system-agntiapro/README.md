# AgntiaPro — Sistema de diseño maestro v1.0
Fecha: 2026-11-22. Estado: **normativa propuesta, pendiente de aprobación visual del fundador**. Rama documental: `docs/design-system-agntiapro-master-20261122`. Sin modificaciones de aplicación ni despliegue.

## Propósito
Fuente de verdad para todas las interfaces nuevas: landing pública, aplicación autenticada, Centro de Mando, Estudio de Operaciones, chat y videoconferencia, móvil y workspaces futuros. Mantener el lenguaje visual premium de la landing y el Estudio de Operaciones sin hacer rediseños radicales. Priorizar claridad, calma, espacio, jerarquía, densidad controlada, velocidad, accesibilidad, continuidad contextual y confianza.

## Índice de lectura obligatoria
1. [01-auditoria-fuentes.md](01-auditoria-fuentes.md) — evidencias y deuda real.
2. [02-identidad-tokens.md](02-identidad-tokens.md) — colores, tipografía, espacio, superficies, iconografía.
3. [03-componentes-patrones.md](03-componentes-patrones.md) — biblioteca de componentes y reglas.
4. [04-interaccion-motion.md](04-interaccion-motion.md) — microinteracciones, estados, transiciones.
5. [05-workspaces-runtime.md](05-workspaces-runtime.md) — shell, chat/vídeo, Studio, vistas generativas y contratos.
6. [06-calidad-gobernanza.md](06-calidad-gobernanza.md) — criterios de aceptación, QA y adopción.
7. [07-prompt-agentes.md](07-prompt-agentes.md) — instrucciones copiables para Codex/Cline/otros.

## Jerarquía de autoridad
- La implementación en la rama auditada es evidencia, no norma eterna.
- Los tokens `agntia-tokens.css` son el punto de partida operativo **opt-in**.
- Estas normas son la dirección objetivo, no afirmaciones de que todo ya esté implementado.
- Un componente compartido aprobado prevalece sobre una copia local.
- El branding no debe romperse para introducir un workspace nuevo.
- Ninguna UI puede falsear datos, acciones ejecutadas, reservas o conexiones.
- Cambios que afecten a producto, API, tenant, permisos o despliegue requieren revisión separada.

## Principios innegociables
1. **Una empresa, múltiples perspectivas**: misma entidad y selección en Kanban, Grafo, Timeline, Digital Twin y Empresa 360°.
2. **Humano dirige, agentes ejecutan**: permisos y aprobación explícita antes de acciones sensibles.
3. **La conversación no es otra aplicación**: panel acoplado y videollamada conviven con el workspace sin destruir contexto.
4. **Editorial + instrumental**: belleza de la landing y precisión de un editor profesional.
5. **Un foco principal por pantalla**: información secundaria progresiva.
6. **Demo, real, planificado y simulado son estados distinguibles**.
7. **Movimiento explica causalidad**: nunca animación decorativa que dificulte operar.
8. **Accesible por teclado, táctil y lector de pantalla**.
9. **Móvil no es escritorio reducido**: sheets, safe areas y teclado virtual.
10. **La coherencia es verificable**: tokens, componentes, screenshots, tests y revisión.

## Alcance y límites de la auditoría
Inspección del código GitHub en `feat/business-command-studio-demo` y documentos heredados, además de las capturas aportadas en conversación. No se ejecutaron builds, tests visuales ni inspección de navegador real. La landing y Studio son demos deliberadas en partes; no se infiere conexión real de una captura. El árbol de `main` no contenía Studio ni landing premium en la misma forma que la rama elegida; antes de integrar, comparar ramas y resolver divergencias. No copiar documentación legacy como autoridad.
