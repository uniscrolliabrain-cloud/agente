# Auditoría Smart Spatial UX — meta-apps
Fecha: 2026-11-27. Lectura estática de main. No implementación ni despliegue.
## Evidencia
- apps/web/src/App.tsx: 152–159, 250–258, 289–319, 431–433, 469–495: split por drop, ratio .2–.8, teclado, orientación móvil, gate demoViews.
- apps/web/src/components/SidebarV2.tsx: 75–82, 92–106, 211–354, 392–497, 720–724: orden persistente, hold 260ms, cancelación, chats fijados y drop.
- apps/ui-lab/src/adaptive-menu/AdaptiveMenuWorkspace.tsx: prototipo independiente de arrastre.
- apps/ui-lab/src/chat-transversal-v3/ChatTransversalV3.tsx: dock y sheet, snap callback.
- apps/ui-lab/src/smart-ux/smart-ux.tsx: navegación persistente, búsqueda normalizada, recientes, pins, paleta y ayuda.
- apps/ui-lab/src/company-v2/CompanyApp.tsx: 545–685, paleta, chats, atajos.
- apps/ui-lab/src/code-v1/CodeApp.tsx: 1423–1585, paleta, repositorios, terminal, atajos.
- ROADMAP-ADAPTIVE-SPATIAL-UX.md: visión futura, no evidencia de implementación.
## Hallazgos
P0: ambos shells registran keydown global en captura; Ctrl+B/J se interceptan incluso escribiendo; Escape puede cerrar meta-app sin comprobar borrador; centralizar arbitraje, respetar IME, editores y capas. SmartShortcuts no tiene trap Tab equivalente a paleta. No afirmar fallo observado en navegador.
P1: useSmartNav persiste sección/pins/recientes/colapso, pero no orden manual, ratio ni split. Mantener claves separadas y migración compatible; no copiar estado de negocio. Paleta puede duplicar comandos en grupos y fijados; navegación activa no garantiza scroll visible. Corregir con tests.
P1: extraer comportamiento de SidebarV2 sin acoplar AppView, Thread, permisos ni API. IDs tipados por meta-app; drop explícito, cancelar, teclado alternativo, no reordenar al arrastrar fuera.
P1: split compartido con orientación y límites; proteger estado de chat, editor, terminal, filtros y scroll. No duplicar instancia mutable de una entidad. En base, revisar que renderViewContent de dos paneles no comparta selección accidentalmente; no copiar sin auditar.
P2: dock/sheet y ventanas flotantes: reutilizar mecánica, no clonar chats; mantener identidad de cada conversación y repo/versión. Grafo 4 direcciones, predicción, temas dinámicos son fases futuras, no paridad actual.
## Patchsets propuestos
1. smart-ux: contrato de preferencias versionado, arbitraje teclado y foco; pruebas unitarias.
2. smart-ux: rail reordenable genérico, drag/drop con cancelación y alternativa teclado. Adaptadores CompanyApp y CodeApp; mantener grupos y fijados.
3. smart-ux: SplitHost y registro de superficies compatibles. Company: conversación + identidad/modelo/finanzas/SOP; Code: editor + terminal, PR + revisión, despliegue + observabilidad. Solo demo; preservar estado y contexto, sin ejecución.
4. smart-ux: panel de conversaciones redimensionable, fijados por entidad, restauración de foco; no duplicar chat.
5. QA Playwright 390/768/1440, mouse/touch/keyboard, pointercancel, IME, scroll, recarga, Escape, contraste, reduced motion, sin solicitudes externas. Verificar las 36 superficies y 72 assets Company.
## Gates
No modificar runtime, kernel, producción, branding ni datos sintéticos. No regenerar imágenes. No implementar predicción ni navegación infinita sin decisión explícita. No declarar aprobado sin build y navegador. Este audit es estático y parcial: no se ejecutaron tests ni se inspeccionaron todos los componentes de chat/editor.
