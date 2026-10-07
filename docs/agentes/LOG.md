# AGENTES - LOG DE PROGRESO

> Ultima actualizacion: 2026-10-07
> Este log sirve para saber donde quedo el trabajo si se corta la sesion.

## Estado

- [x] 1. Estructura + LOG (este archivo)
- [x] 2. types.ts (tipos AgentUI + mock data)
- [x] 3. agents.css (estilos workspace + flotante)
- [x] 4. AgentsPage.tsx
- [x] 5. Subcomponentes
- [x] 6. LaiaFloatingWindow.tsx
- [x] 7. AgentDockLauncher.tsx
- [x] 8. Modificar SidebarV2.tsx
- [x] 9. Modificar App.tsx
- [x] 10. Modificar index.css
- [ ] 11. Typecheck
- [ ] 12. Arrancar pnpm dev y verificar

## Decisiones

- Prefijo CSS: agents- y laia-window-. No choca con --v2- ni --v3-.
- Icono sidebar: Bot (lucide). Users ya esta en Equipo.
- Item en PRIMARY: entre Centro de control y Equipo.
- Datos: mock en types.ts. Backend real despues.
- Un solo CSS: agents.css.
- Ventana flotante clonable para Laia, Lorenzo, Juan, Manu, Marta, Ana.
- NO tocar: AppShell, ChatPanel, useChat, usePanel, useReducedMotion, Tailwind config.
- SOLO anadir, no reescribir.

## Archivos a crear

apps/web/src/components/agents/
  AgentsPage.tsx
  AgentHero.tsx
  AgentProfile.tsx
  AgentSquad.tsx
  AgentCard.tsx
  AgentActivityLog.tsx
  AgentCommandBar.tsx
  agents.css
  types.ts
  floating/
    LaiaFloatingWindow.tsx
    AgentDockLauncher.tsx

## Archivos a modificar

- SidebarV2.tsx: anadir agents a AppView + item en PRIMARY.
- App.tsx: anadir import + case agents.
- index.css: import de agents.css al final.

## Notas

- El boton Agentes que el usuario ve gris y muerto NO esta en el SidebarV2.tsx
  que se paso. Se asume que es de una version posterior. Se anade desde cero.
- Si al arrancar se ve duplicado, verificar el SidebarV2.tsx real del repo.
