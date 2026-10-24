# Roadmap — 21 browser worker

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Navegador aislado, sin fugas. SECURITY.md y apps/worker/README.md.

## 2. Estado verificado
- Playwright 1.62.1 en contenedor aparte.
- Sin red privada (proxy egress con DNS validation).
- 3 sesiones, 20 perfiles, 30 min idle. Bearer de 32 chars.
- Fuente: repodump apps/worker/*, browser.ts.

## 3. Huecos contra producción
- Self-healing si el worker cae.
- Rate limit por sesión y owner.
- Auditoría de URLs bloqueadas.
- Soporte para más idiomas.

## 4. Objetivo
Browser worker con self-healing y rate limit por sesión.

## 5. Fronteras
- No Chrome extension.

## 6. Conexiones
- Depende de: 06, 17.
- Archivos compartidos: apps/worker/*, browser.ts.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Health check con auto-restart probado.
- Rate limit por sesión y owner.
- Log de URLs bloqueadas por el proxy.
