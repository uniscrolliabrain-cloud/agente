# 17 — Seguridad básica

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump SECURITY.md, app.ts, .github/workflows/ci.yml

## Ontología

Boundaries (computer, browser, tokens), bodyLimit, CORS, CSP, HSTS, webhook
firma, rate limit distribuido.

## Estado real

SECURITY.md con boundaries. bodyLimit 12MB. CORS por origin. Zod en rutas.
CSP no configurado en frontend. /api/whatsapp/incoming con timingSafeEqual.
Tokens de Google cifrados.

## Evidencia

El test "API protects private data and rejects unrelated web origins"
pasa. El test "vault encrypts with a fresh nonce and authenticates the
entire envelope" pasa. No hay test de CSP.

## Huecos

CSP y HSTS en el frontend servido. Auditoría de dependencias en CI
(pnpm audit). Rotación de secretos. Verificación de firmas en más webhooks.
Rate limit distribuido (hoy en memoria por proceso).

## Interrelación

Transversal. Todo lo externo pasa por aquí. Depende de 16, 20, 21.

## Riesgos

dangerouslySetInnerHTML escapa de una revisión. Webhook sin firma crea
tareas. Error verboso filtra rutas internas.

## Tipo de fixes

CSP en el HTML servido. Headers de seguridad. pnpm audit --production en
CI. Rate limit compartido.
