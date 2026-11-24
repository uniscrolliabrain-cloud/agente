# 06 · Patchset ejecutado

## Módulo nuevo

```
apps/ui-lab/src/chat-transversal-v3/
├── ChatTransversalV3.tsx
├── ChatDock.tsx
├── ChatSheet.tsx
├── ChatPanel.tsx
├── ChatComposer.tsx
├── ChatActions.tsx
├── ChatCall.tsx
├── chat-data.ts
├── chat-v3.css
└── assets/laia-videollamada.webp
```

`apps/ui-lab/src/registry.tsx` gana una entrada `chat-transversal-v3` y su `lazy()`. No se modifica ninguna otra vista.

## Fotografía de LAIA

| Dato | Valor |
| --- | --- |
| Archivo recibido del founder | `campana-transversal-v3/assets/file_00000000bad881f4a18a32b6c6edc2c8.png` (nombre numérico, conservado sin renombrar; llegó en `c9364fc4`) |
| SHA-256 del original | `0aa55fbe7001e9fb1c7e2724692899b0fb8b25652a851e38d9550b8e0adeb24a` |
| Dimensiones originales | 1254 × 1254, RGB |
| Versión optimizada | `assets/laia-videollamada.webp` y `src/chat-transversal-v3/assets/laia-videollamada.webp`, 900 × 900, 68,2 kB |
| SHA-256 del WebP | `e5ca0db0ac58685d4ab63c7571d6467e712f4619b3701c81b71aa3fa86433f09` |
| Descartado | Copia provisional de `public/landing/laia.png` (`ab3fd712…`): misma modelo, **otra fotografía**; sustituida por la del founder |
| Encuadre | `object-fit: cover`, `object-position: center 26 %`; sin deformar el rostro |
| Uso | Retrato protagonista de la videollamada; etiqueta «fotografía real, vídeo simulado» |

No se generó ninguna persona ni se alteró el rostro: el WebP es un recorte cuadrado centrado del original.

## CSS

Toda la capa visual está bajo `.ctv`, `.ctv-actions` y `.ctv-settings`. Se añaden tres reglas de encaje con UI Lab (`.lab-embed:has(.ctv)`, su insignia y `body:has(.ctv)`) siguiendo el patrón ya aprobado por el launcher, porque la insignia de 26 px dejaba la hoja fuera del viewport en móvil.

Las fuentes Fraunces y Manrope se sirven locales desde `../login-v3/fonts/*.woff2` con `@font-face` propio; el módulo no depende de Google Fonts.

## Adaptador demo

No se recuperaron `uploadFile`, `types/api`, `toolsReducer` ni `useTypewriter`: eran dependencias de backend. `chat-data.ts` aporta respuestas, ideas, acta y acciones sintéticas. Ninguna petición sale del navegador.

## Artifact

`artifact/build-artifact.py` genera `chat-transversal-v3-chromebook/` y su ZIP: preview compilada, retrato optimizado, capturas, documentación, manifiesto y `SHA256SUMS`. El ZIP no se versiona (`.gitignore` local de la carpeta). El workflow de UI Lab incorpora el paso que lo publica como artifact de Actions.
