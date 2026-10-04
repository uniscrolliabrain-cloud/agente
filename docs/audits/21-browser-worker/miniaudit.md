# 21 — Browser worker

## Que tiene

Playwright 1.62.1 en contenedor aparte, sin red privada, 3 sesiones maximas,
20 perfiles guardados, 30min de idle, token Bearer de 32 chars, uploads 64KB,
descargas 10MB, 20 PDFs por sesion.

## Que le falta

- Self-healing: si el worker cae, el API no lo relanza.
- Rate limit por sesion.
- Auditoria de URLs bloqueadas (para saber que intento el LLM).
- Soporte para mas idiomas (localizacion de errores).

## Interrelacion con el macro

Es el navegador del agente. Todo browse_web pasa por aqui.

## Riesgos

- Que un worker caido deje sesiones colgadas.
- Que un sitio con CAPTCHA bloquee al agente y no haya forma de avisar.
- Que una URL privada (por bug) se abra.

## Tipo de fixes que necesitara

- Health check del worker y auto-restart.
- Rate limit por sesion + por owner.
- Log de URLs bloqueadas por el proxy.
