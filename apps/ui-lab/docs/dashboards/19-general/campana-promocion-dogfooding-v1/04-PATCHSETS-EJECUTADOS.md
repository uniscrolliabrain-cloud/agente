# Patchsets ejecutados

## `303cbd6` — Login V3 real

- `apps/web/src/components/login-v3/` (componente, CSS, Manrope/Fraunces, tokens).
- `apps/web/src/App.tsx`: render de `LoginV3` con `auth.login`, `auth.loginDemo` y `auth.error`.
- `apps/web/src/vite-env.d.ts`: tipos de `import.meta.env`.
- OAuth: enlaces reales a `/api/auth/oauth/google/start` y `/api/auth/oauth/github/start`.
- Contraseña: validación local + `onLogin` real; error del servidor visible.
- Demo: botón honesto «Entrar en el espacio de ejemplo» que usa `loginDemo`.
- Rollback: `VITE_LOGIN_V3=false` vuelve al `Login.tsx` anterior.

## `aeef4e4` — Legal V1 + consentimiento

- `apps/web/src/components/legal/LegalV1.tsx` + `legal-v1.css` + `legal-content.ts`.
- `legal-content.ts` generado desde las seis páginas publicadas el 2026-11-21.
- `apps/web/src/main.tsx`: ruta pública `/legal`, redirects de `.html` antiguos.
- `apps/server/src/app.ts`: fallback de `/legal` a `index.html` (solo estático).
- `apps/web/src/components/CookieBanner.tsx` + `cookie-consent.css` + `lib/consent.ts`.
- `apps/web/vite.config.ts`: `allowedHosts` explícito para preview (mismo patrón que dev).

## `cc57524` — Landing preservada y conexión legal

- `apps/site/*`: snapshot exacto de la landing viva (`release/landing-legal-20261122`).
- `apps/site/cookie-consent.{css,js}`: banner de 5 s en la landing, sin dependencias.
- `apps/site/vercel.json`: seis redirects `.html` → `www.agntiapro.com/legal#…` y `/legal`.
- `apps/site/index.html`: solo tres añadidos (CSS, botón de preferencias, script).

## Fase C — superficies operativas (preview, pendiente de deploy)

### Centro de Mando editorial V2

- `apps/web/src/components/command-center-editorial/` (componentes, CSS y fuentes copiados de UI Lab).
- `apps/web/src/components/CommandCenterEditorialView.tsx`: misma carga y contratos que
  `CommandCenterView` (`getCompanyOverview`, polling 30 s, permisos, alta de agente/persona).
- `apps/web/src/App.tsx`: `VITE_COMMAND_CENTER_V2 !== "false"`.
- Reversible: `VITE_COMMAND_CENTER_V2=false` vuelve a la vista anterior sin tocar datos.

### Chat principal UX V2

- `apps/web/src/components/chat-ux-v2/` (panel, compositor, lista, burbujas, markdown, CSS y fuente Manrope).
- `apps/web/src/components/ChatPanel.tsx`: usa el mismo `chat` real (`useChat`), adjuntos vía
  `uploadFile`, rol y cronología reales (`RoleSelector`, `CognitionTimeline`).
- `apps/web/src/App.tsx` no cambia el contrato de `ChatPanel`.
- Reversible: `VITE_CHAT_UX_V2=false` vuelve al panel anterior.

Sin cambios de backend, endpoints, persistencia ni permisos.

## Verificación de no-regresión de la landing

`diff` contra `91576dc:apps/site/index.html` muestra únicamente esas tres líneas.
El resto del HTML es idéntico al que sirve producción.
