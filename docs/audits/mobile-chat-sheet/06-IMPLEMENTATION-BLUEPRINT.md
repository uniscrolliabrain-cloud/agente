# 06 — Blueprint técnico para Codex

## No confundir el objetivo
La hoja inferior tipo Google Maps es una **superficie de conversación transversal**, no un chat nuevo. La app existente tiene `App.tsx` con `useChat` único y `SidebarChat` reutilizado. Debe funcionar en la vista Chat, en cualquier workspace y en escritorio; nunca crear otro historial ni un segundo hook por presentación.

## Árbol de dependencias que Codex debe confirmar leyendo el repo
```
App.tsx
 ├─ useMediaQuery / usePanel / useThreads / useChat
 ├─ AppShell / SidebarV2 / TopBarV2 / WorkspaceShell
 ├─ ChatPanel (vista principal)
 ├─ SidebarChat (dock desktop)
 │   ├─ MessageList → MessageBubble
 │   └─ ChatInput (compositor actual)
 └─ MobileChatSheet (mobile, usa SidebarChat variant=sheet)
     ├─ barra/grip y acciones
     └─ SidebarChat → MessageList + ChatInput
```
Este árbol es parcial y orientativo: confirmar importaciones reales y estilos antes de modificar. Inspeccionar también `index.html`, CSS de AppShell, modal Settings, `useMediaQuery` y todos los selectores `chat-fab`, `side-chat-foot`, `chat-input`, `mobile-sheet`.

## Contratos sugeridos (no imponer si tipos existentes difieren)
```ts
type ChatSurface = "full" | "dock" | "mobile-sheet";
type ComposerAction = "send" | "dictation" | "voice-conversation" | "video-conference";
type ProviderStatus = "unavailable" | "ready" | "connecting" | "active" | "error";
type SheetSnap = 0 | 1 | 2 | 3;
interface SheetMetrics {
  layoutHeight: number;
  visualHeight: number;
  visualOffsetTop: number;
  barHeight: number;
  composerHeight: number;
  safeAreaBottom: number;
}
```
No crear un `ComposerAction` backend ni fingir que un proveedor está disponible. En UI: voz bidireccional ElevenLabs = bocadillo; dictado a texto = mic; videollamada Anam = cámara; texto = flecha. Estado stub explícito y accesible.

## Estrategia de viewport
1. Inspeccionar meta viewport existente y estrategia CSS actual antes de elegir.
2. En Chrome Android moderno evaluar `interactive-widget=resizes-content`; probar regresión en AppShell y modales.
3. Si se usa `visualViewport`, medir `height`, `offsetTop` y la posición del viewport visual; no asumir que `bottom:0` está sobre el teclado. No aplicar dos compensaciones simultáneas.
4. El panel debe limitar su altura a espacio visible y nunca ocultar el compositor. Recalcular tras `visualViewport.resize`, `scroll`, orientación y `ResizeObserver` del footer; evitar bucles de resize.
5. Mantener snap semántico al abrir/cerrar teclado; si el teclado reduce la pantalla por debajo del mínimo, priorizar barra + input y scroll interno. No disparar `blur` durante el arrastre.
6. Safe area: `env(safe-area-inset-bottom)`, sin padding duplicado con ChatInput.

## Gestos y render
- El gesto solo comienza en barra/grip, nunca en input, historial o controles.
- `touch-action:none` en grip; `overflow-y:auto` y `overscroll-behavior:contain` en mensajes.
- Elegir una vía coherente para pointer/touch según evidencia del dispositivo; evitar dos controladores activos sobre un mismo gesto.
- Durante movimiento, escribir transform/altura a través de ref y opcional rAF, sin setState por pixel; al finalizar, commit de snap único y animación.
- Un tap no debe contar como drag; verificar umbral y clicks sobre controles.
- Estado accesible de slider, foco, Escape si aplica, aria-valuenow real, reduced motion.

## FAB
El código previo tiene `showChatFab = !isMobile || !mobileChat`; si el usuario ve FAB al abrir sheet, **no asumir que la condición está mal**. Comprobar SHA desplegado, breakpoint, CSS, duplicados, DOM, stacking y `elementFromPoint`. Una sola fuente de verdad del estado visible. El botón Enviar tiene prioridad táctil; ningún FAB o overlay lo intercepta.

## No hacer
No cambiar backend, seguridad tenant, contratos AG-UI, motor SOP ni workspaces; no instalar ElevenLabs/Anam, no solicitar secretos, no reproducir audio/vídeo falso, no introducir Vaul sin spike; no declarar PASS con solo compilar. Evitar un refactor global del CSS.

## Entregables
Código funcional + tests de regresión + documentación de decisiones + reporte de evidencias con SHA, URL/build y pruebas en Android físico pendientes o completadas. Si no hay dispositivo real, entregar diagnóstico exportable sin PII y solicitar prueba manual.
