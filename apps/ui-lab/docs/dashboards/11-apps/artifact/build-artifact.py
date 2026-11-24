#!/usr/bin/env python3
"""Genera el artifact descargable del Launcher V3.

Uso (desde la raíz del repo):
    UI_LAB_BUILD_SHA=<sha> pnpm --filter @agente/ui-lab build
    python3 apps/ui-lab/docs/dashboards/11-apps/artifact/build-artifact.py

Produce:
    artifact/apps-launcher-v3-chromebook/   site, iconos, capturas, documentación, manifiesto
    artifact/apps-launcher-v3-chromebook.zip
"""
from __future__ import annotations

import hashlib
import json
import shutil
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
APPS_DOCS = HERE.parent
REPO = HERE.parents[5]
DIST = REPO / "apps" / "ui-lab" / "dist"
NAME = "apps-launcher-v3-chromebook"
OUT = HERE / NAME
ZIP = HERE / f"{NAME}.zip"
ICONS = APPS_DOCS / "iconos" / "final"
CAPTURAS = APPS_DOCS / "qa" / "capturas"
CAMPANA = APPS_DOCS / "campana-launcher-v3"

INICIAR = """#!/usr/bin/env bash
# AgntiaPro · Launcher Apps V3 · servidor local para Chromebook.
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-4180}"
URL="http://localhost:${PORT}/?embed=1&view=apps-launcher-v3"
if ! command -v python3 >/dev/null 2>&1; then
  echo "Falta python3. En ChromeOS: Ajustes → Linux → activar el entorno." >&2
  exit 1
fi
echo "Sirviendo el launcher en ${URL}"
python3 -m http.server "${PORT}" --directory site >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill ${SERVER_PID} 2>/dev/null || true' EXIT INT TERM
sleep 1
if command -v xdg-open >/dev/null 2>&1; then xdg-open "${URL}" >/dev/null 2>&1 || true; fi
echo "Pulsa Ctrl+C para detener el servidor (PID ${SERVER_PID})."
wait "${SERVER_PID}"
"""

INSTRUCCIONES = """# AgntiaPro · Launcher Apps V3 para Chromebook

1. Descomprime el ZIP.
2. Abre el terminal Linux en la carpeta descomprimida.
3. Ejecuta `bash iniciar.sh`.
4. Se abre http://localhost:4180/?embed=1&view=apps-launcher-v3 (si no, ábrelo a mano).

Contenido:

- `site/` build de UI Lab con los 35 iconos dentro del bundle.
- `iconos/` colección WebP 512 de la campaña.
- `capturas/` evidencia de QA en PC, tablet y móvil.
- `documentacion/` campaña completa (00–09), QA y manifiesto de iconos.

Recorridos:

- Reposo → «Entrar al escritorio» (o Intro / deslizar hacia arriba).
- Escritorio: favoritas, carpetas, widgets y dock.
- Cajón: botón de rejilla del dock; buscador instantáneo.
- Iconos: hover con ratón; en táctil, primer toque selecciona y segundo abre.
- Escape cierra app, cajón, carpeta y recientes.

Nota: los datos son sintéticos y las apps abren una superficie de demostración; no hay backend,
ni autenticación, ni conexiones reales. El ZIP funciona sin red: los iconos y las fuentes del
módulo están en el propio build.
"""


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    if not DIST.exists():
        raise SystemExit(f"No existe el build: {DIST}. Ejecuta antes pnpm --filter @agente/ui-lab build")
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    shutil.copytree(DIST, OUT / "site")
    if (ICONS / "webp").exists():
        shutil.copytree(ICONS / "webp", OUT / "iconos")
    if CAPTURAS.exists():
        shutil.copytree(CAPTURAS, OUT / "capturas")
    docs_out = OUT / "documentacion"
    docs_out.mkdir()
    for name in ("08-QA.md", "09-HANDOFF.md", "06-GENERACION-ICONOS.md", "05-INTERACCIONES-Y-MOTION.md"):
        source = CAMPANA / name
        if source.exists():
            shutil.copy2(source, docs_out / name)
    manifest_src = ICONS / "manifiesto.json"
    if manifest_src.exists():
        shutil.copy2(manifest_src, docs_out / "manifiesto-iconos.json")
    (OUT / "iniciar.sh").write_text(INICIAR, encoding="utf-8")
    (OUT / "iniciar.sh").chmod(0o755)
    (OUT / "INSTRUCCIONES.md").write_text(INSTRUCCIONES, encoding="utf-8")

    version = {}
    version_file = DIST / "version.json"
    if version_file.exists():
        version = json.loads(version_file.read_text(encoding="utf-8"))

    lines = [
        f"# Manifest SHA-256 · {NAME}",
        f"# build.version = {version.get('version', 'desconocido')}",
        f"# build.builtAt = {version.get('builtAt', 'desconocido')}",
        "# Verificación: sha256sum -c MANIFIESTO-SHA256.txt --ignore-missing",
    ]
    for path in sorted(OUT.rglob("*")):
        if path.is_file() and path.name != "MANIFIESTO-SHA256.txt":
            lines.append(f"{sha256(path)}  {path.relative_to(OUT).as_posix()}")
    (OUT / "MANIFIESTO-SHA256.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")

    if ZIP.exists():
        ZIP.unlink()
    with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in sorted(OUT.rglob("*")):
            if path.is_file():
                archive.write(path, f"{NAME}/{path.relative_to(OUT).as_posix()}")

    files = sum(1 for p in OUT.rglob("*") if p.is_file())
    print(f"artifact: {OUT} ({files} archivos)")
    print(f"zip: {ZIP} ({ZIP.stat().st_size / 1_048_576:.1f} MB)")
    print(f"sha256 zip: {sha256(ZIP)}")
    print(f"build version: {version.get('version', 'desconocido')}")


if __name__ == "__main__":
    main()
