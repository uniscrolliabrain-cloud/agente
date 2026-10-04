# Roadmap — 15 frontend React

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Una app usable con 500 mensajes y 100 tareas.

## 2. Estado verificado
- React 18 + Vite + Tailwind + Lucide.
- MessageList con slice 50 (fix de este pase).
- SuggestionChips sin BOM (fix de este pase).
- Fuente: repodump apps/web/src/*.

## 3. Huecos contra producción
- Virtualización real en listas largas.
- Accesibilidad (aria-live, role=status, focus trap).
- Estados vacíos honestos.
- Retry visual de red.
- Lazy loading de templates.

## 4. Objetivo
60fps en scroll con 500 mensajes. Lighthouse performance >85.

## 5. Fronteras
- No React Native.

## 6. Conexiones
- Depende de: 13, 14.
- Archivos compartidos: apps/web/src/*.

## 7. Principios del PRODUCT.md
UI servida.

## 8. Cómo se verifica el cierre
- Lighthouse performance >85.
- aria-live="polite" en el chat.
- ErrorBoundary por vista.
