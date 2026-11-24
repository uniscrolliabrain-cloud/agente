# Componentes finales · Chat transversal V3

Copia exacta y ejecutable del módulo entregado. Cualquier corrección debe hacerse en las rutas
originales de `src` y volver a sincronizar esta copia con `SHA256SUMS`.

## Rutas originales

| Copia | Ruta original |
| --- | --- |
| `ChatTransversalV3.tsx` | `apps/ui-lab/src/chat-transversal-v3/ChatTransversalV3.tsx` |
| `ChatDock.tsx` | `apps/ui-lab/src/chat-transversal-v3/ChatDock.tsx` |
| `ChatSheet.tsx` | `apps/ui-lab/src/chat-transversal-v3/ChatSheet.tsx` |
| `ChatPanel.tsx` | `apps/ui-lab/src/chat-transversal-v3/ChatPanel.tsx` |
| `ChatComposer.tsx` | `apps/ui-lab/src/chat-transversal-v3/ChatComposer.tsx` |
| `ChatActions.tsx` | `apps/ui-lab/src/chat-transversal-v3/ChatActions.tsx` |
| `ChatCall.tsx` | `apps/ui-lab/src/chat-transversal-v3/ChatCall.tsx` |
| `chat-data.ts` | `apps/ui-lab/src/chat-transversal-v3/chat-data.ts` |
| `chat-v3.css` | `apps/ui-lab/src/chat-transversal-v3/chat-v3.css` |
| `assets/laia-videollamada.webp` | `apps/ui-lab/src/chat-transversal-v3/assets/laia-videollamada.webp` |
| Registro | `apps/ui-lab/src/registry.tsx` (entrada `chat-transversal-v3`, fuera del clon) |

## Verificación

```bash
cd apps/ui-lab/docs/dashboards/04-chat-boton-transversal/campana-transversal-v3/componentes-finales
sha256sum -c SHA256SUMS
diff -r . ../../../../../src/chat-transversal-v3 --exclude README.md --exclude SHA256SUMS
```

`SHA256SUMS` cubre todos los archivos del clon, incluido el retrato optimizado.

## Dependencias externas al clon

- `apps/ui-lab/src/registry.tsx` (preview independiente).
- `apps/web/src/components/BrandMark.tsx` (marca real; solo lectura).
- `apps/ui-lab/src/login-v3/fonts/*.woff2` (Fraunces y Manrope locales, OFL).

No hay dependencias de backend: todo el contenido es sintético.
