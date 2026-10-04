# 15 — Frontend React

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/web/src/*

## Ontología

App, AppShell, SidebarV2, TopBarV2, MessageList, MessageBubble,
ContextualPanel, CommandPalette, hooks (useChat, useTasks, useThreads,
useWorkspaceData, useViewResolver), templates.

## Estado real

React 18 + Vite + Tailwind + Lucide. MessageList con slice 50.
SuggestionChips sin BOM (fix de este pase). App.tsx con AppShell y
ContextualPanel.

## Evidencia

El typecheck web está limpio (typecheck-web.txt exit 0). No hay tests de
frontend (ninguno en tests/*.test.ts toca apps/web). No hay virtualización
real. No hay aria-live en el chat.

## Huecos

Virtualización real en listas largas. Accesibilidad (aria-live, role=status,
focus trap en modales). Estados vacíos honestos. Errores de red con retry
visual. Lazy loading de templates.

## Interrelación

Cara del sistema. Todo lo demás se ve desde aquí. Depende de 13, 14.

## Riesgos

Chat con 500 mensajes a menos de 30fps. Panel contextual rompe el layout.
Onboarding confuso.

## Tipo de fixes

Virtualización con react-window o slice. aria-live="polite" en el chat.
ErrorBoundary por vista. Lighthouse performance >85.
