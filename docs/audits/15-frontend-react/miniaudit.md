# 15 — Frontend React

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump apps/web/src/*, código real

## Ontología

App, AppShell, SidebarV2, TopBarV2, MessageList, MessageBubble, ContextualPanel, CommandPalette, hooks, templates.

## Estado real

React 18 + Vite + Tailwind + Lucide. MessageList con slice 50. SuggestionChips sin BOM (fix de este pase). App.tsx con AppShell y ContextualPanel.

## Evidencia

Typecheck web limpio. Sin tests de frontend. Sin virtualización real. Sin aria-live en el chat.

## Huecos declarados

- Virtualización real.
- Accesibilidad.
- Estados vacíos honestos.
- Retry visual.
- Lazy loading de templates.

## Huecos profundos (auditoría extendida)

1. **Sin tests de frontend**: 0 tests. Ningún componente tiene cobertura.
2. **`slice 50` en MessageList**: parche para no reventar con 500 mensajes. Con 100, corta los últimos.
3. **Sin virtualización real**: cada mensaje renderiza su DOM. Con 1000, lag.
4. **`aria-live` solo en el chat**: falta en notificaciones, en el panel contextual, en las tareas.
5. **Sin `role="status"` en lugares de estado**: el usuario con lector de pantalla no sabe qué pasa.
6. **Sin focus trap en modales**: el tab va fuera del modal.
7. **Sin `Escape` para cerrar modales**: hay que hacer click fuera.
8. **Sin "skip links"**: navegación con teclado empieza en el logo.
9. **Contraste WCAG AA no verificado**: algunos textos grises sobre blanco no pasan.
10. **Sin `prefers-reduced-motion` en animaciones**: typewriter, cascada, panel slide se activan siempre.
11. **Sin ErrorBoundary global**: si un componente crashea, la app entera se rompe.
12. **Sin ErrorBoundary por vista**: chat vs tasks comparten boundary.
13. **Sin "retry visual" en errores de red**: el usuario ve error pero no puede reintentar.
14. **Sin skeleton screens**: mientras carga, ve "Cargando..." en texto plano.
15. **`ChatPanel` sin manejo de "conexión caída"**: si el SSE cae, el usuario no lo sabe.
16. **Sin "scroll to bottom" automático**: cuando llega un mensaje nuevo, hay que bajar manualmente.
17. **Sin "notificaciones en vivo" sin polling**: `useNotifications` hace polling cada 8s.
18. **Sin "offline mode"**: si la red cae, todo deja de funcionar.
19. **Sin "PWA"**: no se puede instalar en el móvil.
20. **Sin "internacionalización"**: textos hardcoded en español. No hay i18n.

## Interrelación

Cara del sistema. Depende de 13, 14.

## Riesgos

Chat con 500 mensajes a menos de 30fps. Panel rompe layout. Onboarding confuso.

## Tipo de fixes

Virtualización con react-window o slice. aria-live. ErrorBoundary por vista. Lighthouse >85. Tests con Playwright. i18n. PWA. Skeleton. Retry visual.
