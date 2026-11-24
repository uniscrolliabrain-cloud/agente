# Entrega Login V3 · run 336

Paquete y evidencias de la campaña Login V3, tal como los produjo el workflow
`.github/workflows/ui-lab.yml` disparado con `deploy: false` y `browser_qa: true`.

| Dato | Valor |
|---|---|
| Run | 336 · https://github.com/uniscrolliabrain-cloud/agente/actions/runs/45448506079 |
| Build empaquetado | `59022b17ff184f607cc8cd0f79ae8cc177e92140` |
| Estado | `success` (job `deploy`: `skipped`) |
| QA de navegador | **43/43** checks, 0 fallos |
| Playwright / Chromium | 1.65.1 / 159.0.8154.6 |

## Archivos

- `login-v3-chromebook.zip` — paquete servible: `site/` con el build, `version.json` con el SHA,
  `QA.md`, `BITACORA-EJECUCION.md`, `INSTRUCCIONES.txt`, `iniciar.sh`, `capturas/` (10) y `qa/`.
- `login-v3-qa-evidence.zip` — evidencias del runner: `qa.log`, `qa-report.json`, `entorno.log`,
  `npm.log`, `preview.log` y `capturas-ci/` (7 capturas a 390, 768, 1366 y 1920).
- `SHA256SUMS.txt` — hashes de los dos ZIP; ambos coinciden con el `digest` que declara GitHub.

## Abrir el paquete

```bash
unzip login-v3-chromebook.zip -d login-v3 && cd login-v3
sh iniciar.sh            # sirve site/ en http://127.0.0.1:8080
```

Comprobar los hashes: `sha256sum -c SHA256SUMS.txt`.

## Correspondencia

`VERSION.txt` y `site/version.json` del paquete declaran `59022b1`, y `qa/qa-report.json` informa
43/43 sobre ese mismo build. El commit que añade esta carpeta es posterior y solo incorpora estos
archivos de entrega y documentación: ni el código ni los estilos de la vista cambian.

Sin merge a `main` y sin deploy: esta carpeta es el entregable de la campaña, no una publicación.
La aprobación visual queda del lado del founder.
