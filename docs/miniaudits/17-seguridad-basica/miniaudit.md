# 17 — Seguridad básica

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump SECURITY.md, app.ts, ci.yml, código real

## Ontología

Boundaries, bodyLimit, CORS, CSP, HSTS, webhook firma, rate limit distribuido.

## Estado real

SECURITY.md con boundaries. bodyLimit 12MB. CORS por origin. Zod en rutas. CSP no configurado. /api/whatsapp/incoming con timingSafeEqual. Tokens de Google cifrados.

## Evidencia

"API protects private data and rejects unrelated web origins" pasa. "vault encrypts with a fresh nonce" pasa. Sin test de CSP.

## Huecos declarados

- CSP y HSTS.
- Auditoría de dependencias.
- Rotación de secretos.
- Firma en más webhooks.
- Rate limit distribuido.

## Huecos profundos (auditoría extendida)

1. **Sin `Strict-Transport-Security`**: HTTP downgrade posible.
2. **Sin `X-Frame-Options` / `frame-ancestors`**: clickjacking posible.
3. **Sin `Referrer-Policy`**: fuga de URLs a terceros.
4. **Sin `Permissions-Policy`**: acceso a cámara/micrófono sin restricción.
5. **`Cache-Control: no-store` en todo**: bien, pero falta en `static
$ErrorActionPreference = "Stop"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$path = "docs/audits/17-seguridad-basica/miniaudit.md"
$body = @'
# 17 — Seguridad básica

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump SECURITY.md, app.ts, ci.yml, código real

## Ontología

Boundaries, bodyLimit, CORS, CSP, HSTS, webhook firma, rate limit distribuido.

## Estado real

SECURITY.md con boundaries. bodyLimit 12MB. CORS por origin. Zod en rutas. CSP no configurado. /api/whatsapp/incoming con timingSafeEqual. Tokens de Google cifrados.

## Evidencia

"API protects private data and rejects unrelated web origins" pasa. "vault encrypts with a fresh nonce" pasa. Sin test de CSP.

## Huecos declarados

- CSP y HSTS.
- Auditoría de dependencias.
- Rotación de secretos.
- Firma en más webhooks.
- Rate limit distribuido.

## Huecos profundos (auditoría extendida)

1. **Sin `Strict-Transport-Security`**: HTTP downgrade posible.
2. **Sin `X-Frame-Options` / `frame-ancestors`**: clickjacking posible.
3. **Sin `Referrer-Policy`**: fuga de URLs a terceros.
4. **Sin `Permissions-Policy`**: acceso a cámara/micrófono sin restricción.
5. **`Cache-Control: no-store` en todo**: bien, pero falta en `static` (que sí cachea).
6. **CORS con wildcard `*` en algún endpoint**: si lo hay, rompe la seguridad. Verificar.
7. **Sin `pnpm audit --production` en CI**: vulnerabilidades conocidas pasan.
8. **Sin SAST (Semgrep, CodeQL)**: bugs de seguridad no detectados en código.
9. **Sin DAST (OWASP ZAP)**: no se prueba la app en runtime.
10. **Sin pentest anual**: no se descubre lo que los tests no ven.
11. **Sin `security.txt`**: sin canal de reporte de vulnerabilidades.
12. **Sin bug bounty**: no hay incentivo para reportar.
13. **Sin WAF**: ataques comunes (SQLi, XSS) dependen de validación propia.
14. **Sin DDoS protection**: capa 7 vulnerable.
15. **`OPENMUSE_ACCESS_KEY` solo validación en modo live**: en sample, no.
16. **`TOKEN_ENCRYPTION_KEY` sin rotación**: si se filtra, hay que re-encriptar todo manualmente.
17. **Sin cifrado en reposo de la DB**: si alguien accede al disco, lee todo.
18. **Sin separación de secretos por servicio**: misma env para API y worker.
19. **`WHATSAPP_WEBHOOK_TOKEN` sin rotación**: mismo problema.
20. **Sin "rate limit distribuido"**: el RateLimiter es in-process. Multi-réplica no funciona.

## Interrelación

Transversal. Depende de 16, 20, 21.

## Riesgos

dangerouslySetInnerHTML. Webhook sin firma. Error verboso filtra rutas.

## Tipo de fixes

CSP en HTML. Headers de seguridad. pnpm audit --production en CI. Rate limit compartido. Vault externo. Rotación de secretos. SAST/DAST. security.txt. WAF.
