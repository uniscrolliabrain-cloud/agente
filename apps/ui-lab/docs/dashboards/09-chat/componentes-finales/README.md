# Componentes finales — Chat UX V2

Copia exacta de los componentes de la campaña, con la ruta original conservada. Se generan desde `apps/ui-lab/src/chat-ux-v2/` en la rama `feat/ui-lab-chat-ux-v2`; no se ejecutan desde aquí.

| Archivo | Función |
| --- | --- |
| `ChatUXV2Preview.tsx` | Entrada de preview y parámetros de QA |
| `ChatUXFrame.tsx` | Scope `.chat-ux-v2` |
| `ChatPanelUX.tsx` | Panel, fases y FLIP del compositor |
| `ChatComposerUX.tsx` | Compositor (copia adaptada de `ChatInput`) |
| `MessageListUX.tsx` | Lista, typewriter y pinning de scroll |
| `MessageBubbleUX.tsx` | Burbujas, acciones y herramientas |
| `Markdown.tsx` | Markdown seguro a nodos React |
| `RoleSelectorUX.tsx` | Rol con datos locales |
| `CognitionTimelineUX.tsx` | Timeline con fase fixture |
| `useChatFixture.ts` | Estado compatible con `useChat`, sin red |
| `fixture.ts` | Datos sintéticos y uploader de prueba |
| `chat-ux-v2.css` | Acabado, container queries y motion |
| `fonts/manrope-latin-var.woff2` | Manrope variable local (24 532 bytes) |

Dependencias importadas del código real, no copiadas: `SuggestionChips`, `ToolCallsGroup`, `AttachmentPreview`, `ThinkingSpiral`, `useTypewriter`, `useReducedMotion` y los tipos de `apps/web`. Ver `../matriz-paridad.md`.

`SHA256SUMS.txt` contiene el hash de cada archivo. Verificación:

```bash
cd apps/ui-lab/docs/dashboards/09-chat/componentes-finales
sha256sum -c SHA256SUMS.txt
```

Estos archivos también viajan dentro del artifact (`fuentes/chat-ux-v2/`).
