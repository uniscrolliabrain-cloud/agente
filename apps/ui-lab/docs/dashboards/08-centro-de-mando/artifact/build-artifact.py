#!/usr/bin/env python3
"""Genera el artifact descargable del Centro de Mando editorial.

Uso (desde la raíz del repo):
    UI_LAB_BUILD_SHA=<sha> pnpm --filter @agente/ui-lab build
    python3 apps/ui-lab/docs/dashboards/08-centro-de-mando/artifact/build-artifact.py

Produce:
    artifact/command-center-editorial-chromebook/   (site, capturas, docs, manifiesto)
    artifact/command-center-editorial-chromebook.zip
"""
from __future__ import annotations

import hashlib
import json
import shutil
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
DOCS = HERE.parent
REPO = HERE.parents[5]
DIST = REPO / "apps" / "ui-lab" / "dist"
NAME = "command-center-editorial-chromebook"
OUT = HERE / NAME
ZIP = HERE / f"{NAME}.zip"
CAPTURAS = DOCS / "qa" / "capturas"
QA_DOC = DOCS / "campana-editorial-v2" / "06-QA.md"
QA_JSON = DOCS / "qa" / "qa-resultados.json"
INSTRUCCIONES = DOCS / "campana-editorial-v2" / "07-ARTIFACT.md"

INICIAR = """#!/usr/bin/env bash
# Centro de Mando editorial · UI Lab · servidor local para Chromebook.
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-4173}"
URL="http://localhost:${PORT}/?embed=1&view=today-editorial"
if ! command -v python3 >/dev/null 2>&1; then
  echo "Falta python3. En ChromeOS: Ajustes → Linux → activar, o usa 'python3' del sistema." >&2
  exit 1
fi
echo "Sirviendo el laboratorio en ${URL}"
python3 -m http.server "${PORT}" --directory site >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill ${SERVER_PID} 2>/dev/null || true' EXIT INT TERM
sleep 1
if command -v xdg-open >/dev/null 2>&1; then xdg-open "${URL}" >/dev/null 2>&1 || true; fi
echo "Pulsa Ctrl+C para detener el servidor (PID ${SERVER_PID})."
wait "${SERVER_PID}"
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
    if CAPTURAS.exists():
        shutil.copytree(CAPTURAS, OUT / "capturas")
    (OUT / "iniciar.sh").write_text(INICIAR, encoding="utf-8")
    (OUT / "iniciar.sh").chmod(0o755)
    if QA_DOC.exists():
        shutil.copy2(QA_DOC, OUT / "QA.md")
    if QA_JSON.exists():
        shutil.copy2(QA_JSON, OUT / "qa-resultados.json")
    if INSTRUCCIONES.exists():
        shutil.copy2(INSTRUCCIONES, OUT / "INSTRUCCIONES-CHROMEBOOK.md")

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
