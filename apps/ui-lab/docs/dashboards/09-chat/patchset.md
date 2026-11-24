# C02 · Patchset — Chat UX V2

## 1. Frontera

- **Solo UI Lab.** No se modifica `apps/web/**`, el shell, el menú lateral ni `04-chat-boton-transversal`.
- El chat original sigue registrado como preview `chat`; la propuesta se añade como `chat-ux-v2`.
- La fixture es explícita, sin red, sin persistencia y sin acciones reales.
- CSS con namespace `.cux-*` dentro de `.chat-ux-v2`; sin `:root`, sin `!important` y sin z-index arbitrarios (solo `z-index: 1` en el dock).

## 2. Archivos nuevos

| Archivo | Función |
| --- | --- |
| `src/chat-ux-v2/ChatUXV2Preview.tsx` | Entrada de preview y parámetros de QA (`state`, `role`, `container`) |
| `src/chat-ux-v2/ChatUXFrame.tsx` | Wrapper scopeado; importa el CSS local |
| `src/chat-ux-v2/ChatPanelUX.tsx` | Estructura de ChatPanel + compositor estable + FLIP |
| `src/chat-ux-v2/ChatComposerUX.tsx` | Copia adaptada de ChatInput (subida inyectada) |
| `src/chat-ux-v2/MessageListUX.tsx` | Lista, typewriter, scroll con pinning |
| `src/chat-ux-v2/MessageBubbleUX.tsx` | Burbujas, acciones, herramientas, markdown |
| `src/chat-ux-v2/Markdown.tsx` | Markdown seguro a nodos React |
| `src/chat-ux-v2/RoleSelectorUX.tsx` | Roles locales con label asociado |
| `src/chat-ux-v2/CognitionTimelineUX.tsx` | Timeline con fases fixture |
| `src/chat-ux-v2/useChatFixture.ts` | API compatible con `useChat`, sin red |
| `src/chat-ux-v2/fixture.ts` | Conversaciones, chips por rol, timeline, uploader |
| `src/chat-ux-v2/chat-ux-v2.css` | Todo el acabado, container queries y motion |
| `src/chat-ux-v2/fonts/manrope-latin-var.woff2` | Fuente local para uso offline |
| `qa/chat-ux-v2.qa.mjs` | QA Playwright reproducible |
| `qa/verify-chat-ux-v2-artifact.mjs` | Render del ZIP con red externa bloqueada |
| `qa/build-chat-ux-v2-artifact.sh` | Empaquetado, SHA256 y verificación |
| `.github/workflows/ui-lab-chat-ux-v2-qa.yml` | CI condicional: typecheck, build, QA, artifact; **sin deploy** |
| `docs/dashboards/09-chat/*.md` | Auditoría, dirección, storyboard, paridad, QA, bitácora |

## 3. Archivos modificados

| Archivo | Cambio |
| --- | --- |
| `apps/ui-lab/src/registry.tsx` | Nueva preview lazy `chat-ux-v2`; la original no cambia |
| `apps/ui-lab/package.json` | `playwright@1.62.1` como devDependency (QA reproducible) |
| `pnpm-lock.yaml` | Resolución de Playwright para el workspace |
| `apps/ui-lab/qa/.gitignore` | Ignora `out/` |
| `docs/dashboards/09-chat/README.md` y `ESTADO-UX.md` | Estado y enlaces de la campaña |

## 4. Reutilización

Se importan sin copiar: `SuggestionChips` (chips reales), `ToolCallsGroup`, `AttachmentPreview`, `ThinkingSpiral`, `useTypewriter`, `useReducedMotion`, tipos `ChatMessage` y `ToolCall`. Se copia solo lo que necesita adaptador de fixture o cambio visual profundo (compositor, lista, burbuja, panel, rol, timeline). La copia final se conserva en `componentes-finales/` y dentro del artifact.

## 5. Decisiones que requieren aprobación

1. Render de markdown en mensajes del asistente (mejora de lectura pedida).
2. Guarda de composición IME en Enter (evita envíos accidentales; no altera Enter normal).
3. Scroll que no arrastra al fondo si el usuario lee historial.
4. Composición vertical centrada de la portada (frente al apoyo superior del baseline).
5. `aria-label` y `aria-pressed` en controles ya existentes (dictado, acciones, enviar).

Ninguna añade funcionalidad, paneles ni flujos. No se aplican a `apps/web`.

## 6. Rollback

1. Quitar la entrada `chat-ux-v2` de `registry.tsx`.
2. Borrar `apps/ui-lab/src/chat-ux-v2/`, `apps/ui-lab/qa/` y el workflow nuevo.
3. Revertir `package.json`/`pnpm-lock.yaml` si no se desea Playwright.
4. El chat original y el shell no requieren cambios: nunca se tocaron.

## 7. Límites comprobados

`min-width: 0` en todos los contenedores flex; `box-sizing: border-box` dentro del scope; sin scroll horizontal global a 320 px; sin llamadas de red de la fixture (la única petición externa potencial del laboratorio son las fuentes del marco, bloqueadas en QA offline).
