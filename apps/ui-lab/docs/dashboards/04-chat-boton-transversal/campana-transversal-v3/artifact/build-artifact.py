#!/usr/bin/env python3
"""Genera el artifact descargable del Chat transversal V3.

Uso (desde la raíz del repo):
    UI_LAB_BUILD_SHA=<sha> pnpm --filter @agente/ui-lab build
    python3 apps/ui-lab/docs/dashboards/04-chat-boton-transversal/campana-transversal-v3/artifact/build-artifact.py

Produce:
    artifact/chat-transversal-v3-chromebook/   site, recursos, capturas, documentación, manifiesto
    artifact/chat-transversal-v3-chromebook.zip
"""
from __future__ import annotations

import hashlib
import json
import shutil
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
CAMPANA = HERE.parent
CHAT_DOCS = CAMPANA.parent
REPO = HERE.parents[6]
DIST = REPO / "apps" / "ui-lab" / "dist"
NAME = "chat-transversal-v3-chromebook"
OUT = HERE / NAME
ZIP = HERE / f"{NAME}.zip"
CAPTURAS = CAMPANA / "qa" / "capturas"
QA_JSON = CAMPANA / "qa" / "qa-resultados.json"
RECURSO = CAMPANA / "assets" / "laia-videollamada.webp"
MODULE_ASSET = REPO / "apps" / "ui-lab" / "src" / "chat-transversal-v3" / "assets" / "laia-videollamada.webp"

INICIAR = """#!/usr/bin/env bash
# AgntiaPro · Chat transversal V3 · servidor local para Chromebook.
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-4190}"
URL="http://localhost:${PORT}/?embed=1&view=chat-transversal-v3"
if ! command -v python3 >/dev/null 2>&1; then
  echo "Falta python3. En ChromeOS: Ajustes → Linux → activar el entorno." >&2
  exit 1
fi
echo "Sirviendo el chat en ${URL}"
python3 -m http.server "${PORT}" --directory site >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill ${SERVER_PID} 2>/dev/null || true' EXIT INT TERM
sleep 1
if command -v xdg-open >/dev/null 2>&1; then xdg-open "${URL}" >/dev/null 2>&1 || true; fi
echo "Pulsa Ctrl+C para detener el servidor (PID ${SERVER_PID})."
wait "${SERVER_PID}"
"""

INSTRUCCIONES = """# AgntiaPro · Chat transversal V3 para Chromebook

1. Descomprime el ZIP.
2. Abre el terminal Linux en la carpeta descomprimida.
3. Ejecuta `bash iniciar.sh`.
4. Se abre http://localhost:4190/?embed=1&view=chat-transversal-v3 (si no, ábrelo a mano).

Contenido:

- `site/` build de UI Lab con el módulo y el retrato dentro del bundle.
- `recursos/laia-videollamada.webp` retrato optimizado (900 × 900) y su ficha.
- `capturas/` evidencia real de QA en escritorio, tablet y móvil.
- `documentacion/` campaña completa, QA y manifiesto de la versión.

Recorridos:

- FAB inferior derecho: abre el chat. En PC entra a la izquierda; en móvil, como hoja inferior.
- Tirador: arrastra para cambiar el ancho/altura, o toca para pasar a la siguiente posición.
- «+»: diez acciones en dos grupos. Las de empresa preparan un borrador.
- Micrófono: pulsa para dictar, mantén para grabar una nota (según permisos del navegador).
- Teléfono y cámara: conversación simulada; la cámara propia usa permiso real y se libera al cerrar.

Nota: todo es demostración con datos sintéticos. No hay backend, autenticación, MCP ni llamadas
reales. El ZIP funciona sin red para la interfaz; el retrato viaja dentro del build.
"""


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def copy_docs(target: Path) -> None:
    target.mkdir(parents=True, exist_ok=True)
    for doc in sorted(CAMPANA.glob("*.md")):
        shutil.copy2(doc, target / doc.name)
    if QA_JSON.exists():
        shutil.copy2(QA_JSON, target / QA_JSON.name)


def main() -> None:
    if not DIST.exists():
        raise SystemExit(f"No existe el build: {DIST}. Ejecuta el build de UI Lab antes.")

    if OUT.exists():
        shutil.rmtree(OUT)
    if ZIP.exists():
        ZIP.unlink()

    (OUT / "site").mkdir(parents=True)
    shutil.copytree(DIST, OUT / "site", dirs_exist_ok=True)

    (OUT / "recursos").mkdir()
    shutil.copy2(RECURSO, OUT / "recursos" / "laia-videollamada.webp")

    shutil.copytree(CAPTURAS, OUT / "capturas")
    copy_docs(OUT / "documentacion")

    INICIAR_PATH = OUT / "iniciar.sh"
    INICIAR_PATH.write_text(INICIAR, encoding="utf-8")
    INICIAR_PATH.chmod(0o755)
    (OUT / "INSTRUCCIONES.md").write_text(INSTRUCCIONES, encoding="utf-8")

    version = json.loads((DIST / "version.json").read_text(encoding="utf-8"))
    manifiesto = {
        "nombre": NAME,
        "version": version.get("version"),
        "builtAt": version.get("builtAt"),
        "preview": "/?embed=1&view=chat-transversal-v3",
        "retrato": {
            "archivo": "recursos/laia-videollamada.webp",
            "sha256": sha256(RECURSO),
            "original": "apps/ui-lab/public/landing/laia.png",
            "dimensiones": "900x900",
        },
        "capturas": sorted(path.name for path in (OUT / "capturas").glob("*.png")),
        "documentacion": sorted(path.name for path in (OUT / "documentacion").glob("*")),
        "sinRed": True,
        "datos": "sintéticos",
    }
    (OUT / "manifiesto.json").write_text(json.dumps(manifiesto, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    sums = []
    for path in sorted(OUT.rglob("*")):
        if path.is_file() and path.name != "SHA256SUMS":
            sums.append(f"{sha256(path)}  {path.relative_to(OUT)}")
    (OUT / "SHA256SUMS").write_text("\n".join(sums) + "\n", encoding="utf-8")

    with zipfile.ZipFile(ZIP, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for path in sorted(OUT.rglob("*")):
            if path.is_file():
                archive.write(path, arcname=f"{NAME}/{path.relative_to(OUT)}")

    files = sum(1 for path in OUT.rglob("*") if path.is_file())
    print(f"artifact: {OUT} ({files} archivos)")
    print(f"zip: {ZIP} ({ZIP.stat().st_size / (1 << 20):.1f} MB)")
    print(f"sha256 zip: {sha256(ZIP)}")
    print(f"build version: {version.get('version')}")
    print(f"retrato: {MODULE_ASSET.relative_to(REPO)}")


if __name__ == "__main__":
    main()
