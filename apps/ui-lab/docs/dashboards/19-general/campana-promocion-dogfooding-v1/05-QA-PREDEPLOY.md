# QA pre-deploy

Fecha: 2026-11-24 · Base: `cc57524` · Entorno: sandbox Linux, Node 26.13.1, pnpm 11.19.0.

## Comandos ejecutados

| Comando | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | OK, 24,9 s |
| `pnpm typecheck` (raíz + worker) | PASS |
| `pnpm --filter @agente/web typecheck` | PASS |
| `pnpm --filter @agente/web build` | PASS (589 kB JS; aviso de chunk >500 kB, no bloqueante) |

## Navegador real (Chromium vía panel Cloud)

### Legal

- `/legal` renderiza portada y los seis documentos con `Publicado` y versión 21-nov-2026.
- `/legal?rev=2#privacidad` abre directamente el lector de Privacidad y hace scroll
  (`scrollY=1206`, lector a 137 px del viewport).
- Título del documento: `Política de privacidad · Legal · AgntiaPro`.
- Contenido real: titular, NIF, domicilio, finalidades y derechos, tomados de las páginas
  publicadas; no hay texto inventado.
- Móvil 390×844: `scrollWidth=375` (sin overflow), tipografía Fraunces disponible.

### Login V3

- Renderiza la composición editorial completa a 1024×768 y 390×844.
- OAuth: `href=/api/auth/oauth/google/start` y `/api/auth/oauth/github/start`.
- Demo: «Entrar en el espacio de ejemplo» entra al tenant sintético y monta el shell real.
- Footer: Aviso legal, Privacidad, Cookies y Transparencia IA apuntan a `/legal#…`.
- Errores de contraseña: se muestran en el formulario; validación local de email.

### Cookies

- Primer render: `agntia_cookie_consent_v1=null`, `document.cookie=""`.
- Banner visible a los 5 s en landing y login; oculto si hay decisión válida.
- Aceptar → `measurement=true`; Rechazar → `measurement=false`; ambos persisten.
- Preferencias desde footer abren el diálogo sin esperar; necesarias deshabilitadas.
- Ningún script opcional se carga antes ni después: no hay analítica en el build.

## No verificado (pendiente del founder o de credenciales)

- OAuth Google/GitHub end-to-end y restauración de sesión real (requiere cuenta).
- Contraseña contra producción (requiere credenciales; no se solicitan por chat).
- Viewports 1440×900, 1366×768, 768×1024, 360×800 y 320×568 en esta iteración.
- Chat, transversal, centro de mando y launcher: no integrados, por tanto no probados
  en la app real.

## Capturas

`capturas/login.png`, `login-mobile.png`, `login-banner.png`, `legal.png`,
`legal-reader.png`, `landing-banner.png`.
