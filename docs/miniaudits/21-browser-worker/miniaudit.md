# 21 — Browser worker

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump apps/worker/*, browser.ts, compose.yaml, código real

## Ontología

Playwright, BrowserService, BrowserSession, proxy egress, validatePublicUrl, isPublicIp, serial(id), WORKER_TOKEN.

## Estado real

Playwright 1.62.1 en contenedor aparte. Sin red privada. 3 sesiones. 20 perfiles. 30 min idle. Bearer de 32 chars. Uploads 64KB. Descargas 10MB. 20 PDFs. Proxy egress con DNS validation.

## Evidencia

Los 17 tests de browser.test.ts pasan (path traversal, URLs privadas, encoded IPs, DNS rebinding, serialización por sesión, downloads rechazados, egress proxy).

## Huecos declarados

- Self-healing.
- Rate limit por sesión.
- Auditoría de URLs bloqueadas.
- Más idiomas.

## Huecos profundos (auditoría extendida)

1. **Sin "auto-restart" del worker**: si Chromium crashea, el worker queda mudo.
2. **Sin "rate limit por sesión"**: un script puede hacer 1000 navegaciones/min.
3. **Sin "log de URLs bloqueadas"**: no se sabe qué intentó navegar el agente.
4. **Sin "user-agent rotation"**: Chromium firma siempre igual. Bot detection.
5. **Sin "CAPTCHA fallback"**: si una página tiene CAPTCHA, el agente se cuelga.
6. **Sin "screenshot OCR"**: la captura es PNG pero no se procesa texto.
7. **Sin "session recording"**: no se puede replay de lo que hizo el agente.
8. **Sin "cleanup de perfiles viejos"**: 20 perfiles máx, pero si no se usan, se acumulan.
9. **Sin "cleanup de downloads"**: 20 PDFs por sesión, pero si la sesión es vieja, no se borran.
10. **Sin "retry de navegación"**: si una URL falla, el step falla. Sin retry.
11. **Sin "cluster de workers"**: un worker único. Sin alta disponibilidad.
12. **Sin "anti-bot mitigations"**: Cloudflare, DataDome bloquean el agente.
13. **Sin "proxy rotativo"**: una IP. Fácil de bloquear.
14. **Sin "fingerprinting protection"**: Chromium estándar es detectable.
15. **Sin "PDF download con validación"**: descarga cualquier PDF sin comprobar contenido.
16. **Sin "multi-tenant worker pools"**: un worker para todos. Un tenant abusivo afecta a todos.
17. **`serial(id, fn)` sin timeout**: si una operación cuelga, toda la cola espera.
18. **Sin "session state externalizado"**: el estado vive en disco del worker. Sin failover.
19. **Sin "auth state export/import"**: no se puede migrar una sesión entre workers.
20. **Sin "screenshot con marca de tiempo"**: las capturas no indican cuándo se tomaron.

## Interrelación

Navegador del agente. Depende de 06, 17.

## Riesgos

Worker caído deja sesiones colgadas. CAPTCHA bloquea. URL privada se abre.

## Tipo de fixes

Health check y auto-restart. Rate limit por sesión y owner. Log de URLs bloqueadas. Cluster de workers. Proxy rotativo. OCR. Session recording. Cleanup.
