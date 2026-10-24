# Skill: Audit web

Analiza HTML que ya está en el workspace: HTTPS, meta tags, viewport, OG, canonical, tamaño, h1s, imágenes sin alt.

## Cómo se ejecuta en el sandbox

El computer no tiene red (`--network none`). El SOP trae el HTML antes:

1. Paso `read_web` con la URL objetivo -> devuelve `{url, title, text}`.
2. Paso `computer_command` que le pasa ese JSON al skill por stdin:

       python3 /workspace/skills/audit-web/main.py --stdin < /workspace/audit-input.json

   El SOP escribe el JSON del paso anterior a `/workspace/audit-input.json` y lo redirige.

Devuelve JSON con los hallazgos. Nunca intenta red desde el sandbox.

## Modo --url (fuera del sandbox)

Si se ejecuta en un host con salida a internet:

    python3 main.py --url ejemplo.com

Hace fetch real, mide tiempo, cabeceras, TLS y expiración de certificado. En el
sandbox fallará honestamente con un error de red — es lo esperado.