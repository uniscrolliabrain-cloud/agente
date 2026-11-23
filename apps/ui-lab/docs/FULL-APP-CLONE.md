# Clon visual completo — modo demo
Esta entrada del catálogo monta **`apps/web/src/App.tsx` original**, en vez de reconstruir manualmente sidebar, topbar, chat y navegación. Incluye los componentes, rutas internas y modales que el App real renderiza. Usa el tenant demo sintético existente `demo:interfaz` y su `demoUser`, sin credenciales reales. El preview corre en un iframe de otro viewport dentro del origen independiente del laboratorio.

## Limitaciones
- Es la aplicación real **en modo demo**, no una captura pixel-perfect de una sesión owner real. Las vistas que dependen de backend pueden mostrar estados de error o carga; no se replican datos privados.
- `FullAppPreview` sobrescribe las claves de sesión **solo del origen UI Lab**. Es obligatorio desplegar en dominio/subdominio diferente de producción, y no apuntar nunca el proyecto Vercel de producción.
- `safety.ts` intercepta fetch a `/api`, pero NO sustituye una auditoría de aislamiento: XHR, WebSocket, servicios externos y enlaces deben comprobarse antes de publicar.
- El catálogo no incorpora todavía snapshots versionados persistentes. Las variantes reales deben existir como componentes/branches versionados, no como etiquetas ficticias.
- Los owners demo adicionales requieren fixtures separados y contratos de permisos; no se debe simular que una cuenta real ha iniciado sesión.

## Validación
Verificar CI, abrir `?view=full-app`, probar navegación de sidebar, chat flotante, sheet móvil, modales y logout. El logout vuelve al login; recargar reinicia demo. No hacer merge/deploy sin revisión de seguridad y QA.
