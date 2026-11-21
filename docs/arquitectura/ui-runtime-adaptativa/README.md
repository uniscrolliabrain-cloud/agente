# UI runtime adaptativa, branding y personalización — especificación maestra
Estado: DISEÑO / DOCUMENTACIÓN, NO IMPLEMENTADO. Fecha: 2026-11-21. Rama: `docs/ui-runtime-generativa-branding-personalizacion-20261121`.

## Propósito y alcance
AgntiaPro es una empresa compilada: el usuario interactúa con LAIA y otros agentes como si gestionaran toda la aplicación. La autoridad y la ejecución residen en el kernel y runtime deterministas; los agentes visibles son la interfaz conversacional. El Fast LLM no tiene una representación completa de la empresa ni de la UI: recibe tarjetas RAG cortas, seleccionadas por atención, con procedencia y metadatos. Slow LLM, JEV, cinco memorias, grafo multicapa, SOPs y políticas operan por detrás.

**No confundir "interfaz generativa" con generación arbitraria de React, CSS, pantallas o workflows por el LLM.** Generativa aquí significa que la experiencia, la navegación y las vistas aparecen contextualmente como resultado de comandos autorizados del runtime, usando templates y componentes existentes.

## Decisiones de producto — invariantes
1. Templates y componentes programados, reutilizados por todos los tenants. Branding AgntiaPro por defecto; overrides del workspace Branding del tenant, sin reconstruir la app.
2. Personalización de menú, navegación y dashboard programada dentro de los componentes. Preferencias y señales de uso alimentan algoritmos deterministas, no generan comportamientos aleatorios.
3. IDs semánticos estables para pantallas, workspaces, vistas, componentes, instancias y entidades. La identidad no depende del texto visible ni de la posición DOM.
4. El runtime conoce el estado de UI y de empresa; LAIA recibe solo microtarjetas contextuales cuando son pertinentes, nunca snapshots completos del árbol UI.
5. UI commands son comandos de presentación; mutaciones empresariales requieren capabilities/SOPs/policy/approvals y recibos de ejecución.
6. Multitenancy estricto, controles de roles y visibilidad, versionado, deduplicación, fail-closed y auditoría. No aceptar IDs de tenant/actor autodeclarados por el navegador como autoridad.
7. La personalización no altera permisos, no oculta avisos legales/seguridad y no rompe accesibilidad.
8. Convivencia con chat transversal, voz ElevenLabs, vídeo Anam y futura app Android; la UI no depende del canal conversacional.
9. Branding es presentación; personalización es disposición y uso; conocimiento y acción pertenecen al runtime.
10. No merge, deploy, modificación de código productivo ni migración de datos desde esta rama.

## Mapa documental
- [01 — Modelo mental, interacción y límites](01-VISION-EXPERIENCIA-Y-AUTORIDAD.md)
- [02 — Contratos de identidad, UI Context y comandos](02-IDENTIDADES-CONTEXTO-Y-COMANDOS.md)
- [03 — Branding y templates](03-BRANDING-Y-TEMPLATES.md)
- [04 — Menú, dashboard y UX adaptativa](04-MENU-HIPERPERSONALIZADO.md)
- [05 — Integración real con cognition/kernel](05-INTEGRACION-COGNICION-RUNTIME.md)
- [06 — Auditoría, campañas, pruebas y handoff](06-AUDITORIA-CAMPANAS-Y-HANDOFF.md)

## Glosario
**Template**: estructura de UI codificada. **Branding**: tokens/recursos visuales por tenant. **UI context**: proyección efímera de la pantalla activa, guardada por runtime. **UI command**: operación tipada sobre una capacidad UI registrada. **Cognition card**: proyección acotada, autorizada y no ejecutable del conocimiento. **Personalization**: preferencias + reglas programadas. **Workspace**: superficie de trabajo; no implica un agente operativo autónomo.

## Estado de evidencias
Se han inspeccionado archivos puntuales de `main` en 2026-11-21; otras ramas pueden contener implementaciones más recientes. Los paths propuestos no deben tratarse como existentes. Reauditar main, ramas de cognition, kernel, chat, UX móvil, Anam y ElevenLabs antes de codificar.
