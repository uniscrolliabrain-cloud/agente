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
| Archivo recibido en el repositorio | `apps/ui-lab/public/landing/laia.png` (no había PNG en `assets/` al ejecutar; incidencia documentada en `02-AUDITORIA-BASELINE.md`) |
| Original conservado en la campaña | `campana-transversal-v3/assets/laia-original-founder.png` |
| SHA-256 del original | `ab3fd712f77be6947eb42b7aa5dc3897345741439147770782d82d17df078a28` |
| Dimensiones originales | 1254 × 1254, RGB |
| Versión optimizada | `assets/laia-videollamada.webp`, 900 × 900, 86,9 kB |
| SHA-256 del WebP | `6f92e67ce1146349af5f5b60748f0e623b2d3e997ed457e4e3dbd70adc7d854e` |
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
