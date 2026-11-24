# QA post-deploy

Verificado en el dominio real el 2026-11-24 tras el run `45483309302`.

## Comprobado

- [x] `https://www.agntiapro.com/` sirve Login V3 con el bundle nuevo
  (`assets/index-CbQzsTvG.js`, idéntico al `dist` local).
- [x] `/legal` responde 200 y renderiza la portada editorial.
- [x] `/legal#privacidad` abre directamente el documento correcto, con scroll y título
  `Política de privacidad · Legal · AgntiaPro`.
- [x] Los seis documentos aparecen como `PUBLICADO`, versión 21-nov-2026, con contenido
  real (titular, NIF, domicilio, derechos).
- [x] OAuth: `/api/auth/oauth/google/start` y `/github/start` responden 302 a Google y
  GitHub con `redirect_uri=https://www.agntiapro.com/api/auth/oauth/.../callback` y
  `state`. No se completó el consentimiento (requiere cuenta).
- [x] Demo: «Entrar en el espacio de ejemplo» autentica contra la API real y monta el
  shell completo, con aviso «Tenant demo · Datos sintéticos».
- [x] Logout: «Salir» vuelve al login y limpia la sesión.
- [x] `/api/health` en verde (database, bus, worker, agentConfigured).
- [x] Fuentes Manrope/Fraunces servidas desde el dominio; sin errores de JS.
- [x] Landing del ápice intacta (`last-modified` 22-nov, cache HIT).
- [x] `favicon.ico` es el único 404 de consola (no bloqueante).

## Pendiente / no verificado

- [ ] Login completo con Google/GitHub o contraseña y restauración de sesión con una
  cuenta real. Requiere credenciales del founder; no se solicitan por chat.
- [ ] Redirects de `agntiapro.com/{aviso-legal,privacidad,...}.html`: el job de Vercel
  falló por cuota, así que las URLs antiguas siguen respondiendo 200 con su HTML.
- [ ] Banner de cookies en la landing: no publicado por el mismo bloqueo.
- [x] Responsive en 1440×900, 1366×768, 1024×768, 768×1024, 390×844, 360×800 y
  320×568: sin overflow horizontal, `<h1>` y enlaces OAuth presentes en los siete.
  (`scrollWidth` = viewport − ancho de scrollbar en todos).
- [ ] Centro de Mando, chat principal, chat transversal y Launcher: no integrados.

## Capturas reales

- `capturas/live-login.png` (1024×768, dominio real, banner visible).
- `capturas/live-legal.png` (deep link `#privacidad`).
