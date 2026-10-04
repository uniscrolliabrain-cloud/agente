# Roadmap — 17 seguridad básica

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
No exponer datos, no ejecutar código ajeno. SECURITY.md lo detalla.

## 2. Estado verificado
- boundaries en SECURITY.md.
- bodyLimit 12MB. CORS por origin. Zod en rutas.
- Tokens de Google cifrados.
- Fuente: repodump SECURITY.md, app.ts, ci.yml.

## 3. Huecos contra producción
- CSP y HSTS en el frontend servido.
- Auditoría de dependencias en CI.
- Rotación de secretos.
- Firma en más webhooks.
- Rate limit distribuido.

## 4. Objetivo
OWASP Top 10 básico cumplido. npm audit sin altos.

## 5. Fronteras
- No pentest externo.

## 6. Conexiones
- Depende de: 16, 20, 21.
- Archivos compartidos: app.ts, ci.yml, SECURITY.md.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- pnpm audit --production sin altos.
- CSP en el HTML servido.
- Headers de seguridad en cada respuesta.
