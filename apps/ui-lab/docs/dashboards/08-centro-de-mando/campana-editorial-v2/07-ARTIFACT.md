# Artifact descargable — `command-center-editorial-chromebook`

## Qué es

Un ZIP autocontenido con el **build real de UI Lab** (`site/`), un lanzador local y la evidencia de
QA. No necesita red, backend, credenciales ni instalación más allá de Python 3 (ya presente en
Chromebook con Linux activado, y en cualquier ChromeOS moderno con `python3`).

## Contenido

```
command-center-editorial-chromebook/
├── iniciar.sh                     lanza el servidor local y muestra la URL
├── INSTRUCCIONES-CHROMEBOOK.md    pasos y solución de problemas
├── QA.md                          resultados y rúbrica de la campaña
├── MANIFIESTO-SHA256.txt          SHA del build + hash de cada archivo
├── capturas/                      15 capturas (escritorio, tablet, móvil, estados, hoja, landing)
└── site/                          build de UI Lab (mismo SHA que version.json)
```

## Requisitos

- Python 3 (`python3 --version`).
- Navegador con soporte de `container queries` y `clamp()` (Chrome 105+; cualquier Chromebook
  actualizado).

## Uso

```bash
unzip command-center-editorial-chromebook.zip
cd command-center-editorial-chromebook
bash iniciar.sh          # http://localhost:4173/?embed=1&view=today-editorial
```

`iniciar.sh` sirve `site/` en el puerto 4173 y, si existe `xdg-open`, abre el navegador. La vista
arranca en modo laboratorio (`embed=1`), que activa el tenant demo en memoria: altas de persona y
agente funcionan contra el router demo del navegador y se pierden al recargar (no hay backend).

### Otros recorridos

| URL | Qué muestra |
|---|---|
| `/?embed=1&view=today-editorial` | Centro de Mando editorial (datos de ejemplo) |
| `/?embed=1&view=today-editorial` + «Ver datos reales» | Composición con el tenant demo poblado |
| `...&cce-state=empty` | Empresa recién compilada, sin actividad |
| `...&cce-state=error` | Error recuperable con reintento |
| `...&cce-state=loading` | Esqueleto de carga |
| `/?embed=1&view=today` | Centro de Mando original, para comparar |

`cce-state` es un arnés de QA, no comportamiento de producto.

## Integridad

`MANIFIESTO-SHA256.txt` incluye el SHA del commit de build (`version.json`), la lista de archivos de
`site/` con su hash y los hashes de las capturas. Para comprobar:

```bash
sha256sum -c MANIFIESTO-SHA256.txt --ignore-missing
```

## Generación reproducible

```bash
UI_LAB_BUILD_SHA=$(git rev-parse --short=12 HEAD) pnpm --filter @agente/ui-lab build
python3 apps/ui-lab/docs/dashboards/08-centro-de-mando/artifact/build-artifact.py
```

El script copia `dist/` a `site/`, añade lanzador, instrucciones, QA y capturas, y escribe el
manifiesto con el mismo SHA. El ZIP **no se versiona** (build de 9,1 MB); se regenera con el comando
anterior o desde el workflow `ui-lab.yml`.
