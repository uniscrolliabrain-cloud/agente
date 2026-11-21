# Cookies y almacenamiento

| Nombre o clave | Origen y responsable técnico | Activación y finalidad | Duración |
|---|---|---|---|
| `om_oauth_binding` | App, OAuth de login | Inicio Google/GitHub, vincula state al navegador. HttpOnly, SameSite=Lax, Secure bajo HTTPS, path /api/auth/oauth | 600 s, retirada en callback |
| `agente_auth` | App, localStorage | Login/OAuth/demo, credencial de sesión necesaria para enviar Bearer | Hasta logout/401 o limpieza. La validez del token depende del servidor |
| `agente_user` | App, localStorage | Login y edición de perfil, caché para restaurar la interfaz | Hasta logout o limpieza |
| `agente_active_thread` | App, localStorage | Selección de conversación; se retira al deseleccionar | Sin expiración propia |
| `agente_theme`, `ui.left.collapsed` | App, localStorage | Preferencias locales de tema y barra lateral | Sin expiración propia |
| Estado de navegador worker | Worker Playwright, servicios navegados | Sesiones operativas de navegador, fuera de la página pública | Depende del perfil y proveedor; comprobar operación y purga |

Fuentes: oauth-login.ts, api/auth.ts, api/client.ts, App.tsx, hooks/useThreads.ts y usePanel.ts. No hay sessionStorage ni etiquetas analíticas/publicitarias en las entradas inspeccionadas. La API analytics interna calcula métricas de empresa. El proveedor OAuth controla su propio origen después de la navegación. El almacenamiento en navegador de credenciales es sensible a scripts ejecutados en el origen de la app. Falta verificar configuración externa del hosting y perfiles activos del worker.

La entrada HTML de la app también hace preconnect a fonts.googleapis.com y fonts.gstatic.com y solicita una hoja de Google Fonts para Instrument Sans antes del login. Es una solicitud de recursos externos, no una prueba de cookies publicitarias. Verificar cabeceras y tratamiento de IP en el entorno objetivo.
