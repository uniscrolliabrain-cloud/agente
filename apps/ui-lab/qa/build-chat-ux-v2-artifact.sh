#!/usr/bin/env bash
# Empaqueta el artifact descargable para Chromebook de Chat UX V2.
# Requisitos: build de UI Lab, QA ejecutado, python3, zip, node y Playwright.
# Uso: bash apps/ui-lab/qa/build-chat-ux-v2-artifact.sh
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
LAB="$(cd "$HERE/.." && pwd)"
ROOT="$(cd "$LAB/../.." && pwd)"
REV="${UI_LAB_BUILD_SHA:-$(git -C "$ROOT" rev-parse HEAD)}"
OUT="${ARTIFACT_OUT:-$LAB/artifacts/chat-ux-v2-chromebook}"
ZIP="$OUT.zip"
QA_DIR="$LAB/qa/out/chat-ux-v2"
DOCS="$LAB/docs/dashboards/09-chat"

test -f "$LAB/dist/index.html" || { echo "Falta apps/ui-lab/dist. Ejecuta el build."; exit 1; }
test -f "$QA_DIR/RESULTADOS.md" || { echo "Falta el QA. Ejecuta qa/chat-ux-v2.qa.mjs."; exit 1; }

rm -rf "$OUT" "$ZIP" "$OUT.verify"
mkdir -p "$OUT/site" "$OUT/capturas" "$OUT/QA" "$OUT/fuentes" "$OUT/docs"
cp -a "$LAB/dist/." "$OUT/site/"
cp -a "$LAB/src/chat-ux-v2/." "$OUT/fuentes/chat-ux-v2/"
cp "$HERE/chat-ux-v2.qa.mjs" "$HERE/verify-chat-ux-v2-artifact.mjs" "$OUT/QA/"
cp "$QA_DIR/RESULTADOS.md" "$QA_DIR/resultados.json" "$OUT/QA/"
cp "$DOCS"/*.md "$OUT/docs/"

for shot in \
  baseline-original-chat-1440x900 \
  01-portada-1440x900 \
  03a-transicion-90ms \
  03b-transicion-790ms \
  04-streaming-1440x900 \
  05-cancelado-1440x900 \
  06-historial-inicio-1440x900 \
  07-historial-final-1440x900 \
  08-timeline-abierta-1440x900 \
  09-foco-teclado-1440x900 \
  10-chips-finanzas-1280x800 \
  11-adjunto-listo-1280x800 \
  12-adjunto-error-1280x800 \
  12b-dictado-no-disponible-1280x800 \
  13-dictado-1280x800 \
  14-reduced-motion-1280x800 \
  15-home-320x640 \
  15-home-390x844 \
  15-home-1366x599 \
  15-home-1920x1080 \
  16-conversacion-320x640 \
  16-conversacion-390x844 \
  16-conversacion-1366x599 \
  16-conversacion-1920x1080 \
  17-contenedor-480-1440x900 \
  17-contenedor-680-1440x900 \
  17-contenedor-900-1440x900 \
  18-contenedor-480-portada \
  19-panel-simulado-1024x900
do
  cp "$QA_DIR/capturas/$shot.png" "$OUT/capturas/"
done

cat > "$OUT/iniciar.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/site"
PORT="${PORT:-8080}"
echo "Chat UX V2 · UI Lab"
echo "Abre: http://localhost:$PORT/?view=chat-ux-v2"
echo "Vista limpia: http://localhost:$PORT/?embed=1&view=chat-ux-v2"
echo "Para detener el servidor: Ctrl+C"
python3 -m http.server "$PORT" --bind 127.0.0.1
EOF
chmod +x "$OUT/iniciar.sh"

cat > "$OUT/INSTRUCCIONES.txt" <<EOF
AGNTIAPRO · UI LAB · CHAT UX V2 (refinamiento visual)
Revisión: $REV

1. Descomprime este ZIP.
2. Abre una terminal Linux en la carpeta descomprimida.
3. Ejecuta: bash iniciar.sh
4. Abre en Chrome: http://localhost:8080/?view=chat-ux-v2
   Vista limpia sin marco del laboratorio:
   http://localhost:8080/?embed=1&view=chat-ux-v2
5. Estado de cada recorrido con parámetros de QA:
   ...&state=home | conversation | long | streaming
   ...&role=legal | finanzas | comercial | marketing
   ...&container=480 | 680 | 900   (simula el panel transversal abierto)

No necesitas clonar el repositorio, ni Node, ni pnpm, ni conexión a Internet.
Solo Python 3 (incluido en el entorno Linux de Chromebook).
La tipografía Manrope viaja dentro de site/ como woff2: no depende de Google Fonts.
El marco del UI Lab puede mostrar su tipografía con fallback si no hay red; el chat no.

Contenido:
- site/                 UI Lab compilado; contiene la preview chat-ux-v2.
- fuentes/chat-ux-v2/   Copia exacta de los componentes y CSS finales.
- capturas/             Evidencias del QA automatizado.
- QA/                   Script Playwright, resultados.json y RESULTADOS.md.
- docs/                 Documentación de la campaña (09-chat).
- MANIFIESTO.json       Revisión, SHA256 y resumen del QA.
- SHA256SUMS.txt        Integridad de todos los archivos.
- VERIFICACION-ZIP.txt  Render comprobado desde el propio ZIP.

Los datos son sintéticos y la fixture no llama a ninguna API. No hay acciones
reales, ni envío de correo, ni publicación: solo interfaz.
EOF

UI_LAB_BUILD_SHA="$REV" node -e '
const fs = require("node:fs");
const path = require("node:path");
const dir = process.argv[1];
const qa = JSON.parse(fs.readFileSync(path.join(dir, "QA", "resultados.json"), "utf8"));
const walk = (base) => fs.readdirSync(base, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(base, entry.name);
  return entry.isDirectory() ? walk(full) : [path.relative(dir, full)];
});
const crypto = require("node:crypto");
const files = {};
for (const rel of walk(dir).sort()) {
  if (rel === "MANIFIESTO.json" || rel === "SHA256SUMS.txt") continue;
  files[rel] = crypto.createHash("sha256").update(fs.readFileSync(path.join(dir, rel))).digest("hex");
}
const manifest = {
  artifact: "chat-ux-v2-chromebook",
  revision: process.env.UI_LAB_BUILD_SHA,
  generatedAt: new Date().toISOString(),
  previewId: "chat-ux-v2",
  branch: "feat/ui-lab-chat-ux-v2",
  qa: { total: qa.total, passed: qa.passed, failed: qa.failed, generatedAt: qa.generatedAt },
  font: "Manrope latin subset woff2 incluida en site/assets",
  network: "sin llamadas de la fixture; fuentes locales",
  files,
};
fs.writeFileSync(path.join(dir, "MANIFIESTO.json"), JSON.stringify(manifest, null, 2) + "\n");
' "$OUT"

# Primer ZIP, verificación de render desde el ZIP extraído y segundo ZIP con la
# evidencia incorporada. El contenido servido no cambia.
(cd "$OUT" && find . -type f ! -name SHA256SUMS.txt -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS.txt)
(cd "$(dirname "$OUT")" && zip -qr "$ZIP" "$(basename "$OUT")")
mkdir -p "$OUT.verify"
unzip -q "$ZIP" -d "$OUT.verify"
node "$HERE/verify-chat-ux-v2-artifact.mjs" "$OUT.verify/$(basename "$OUT")"
cp "$OUT.verify/$(basename "$OUT")/VERIFICACION-ZIP.txt" "$OUT/VERIFICACION-ZIP.txt"
cp "$OUT.verify/$(basename "$OUT")/QA/verificacion-zip.png" "$OUT/capturas/verificacion-zip.png"

(cd "$OUT" && find . -type f ! -name SHA256SUMS.txt -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS.txt)
rm -f "$ZIP"
(cd "$(dirname "$OUT")" && zip -qr "$ZIP" "$(basename "$OUT")")

rm -rf "$OUT.verify-final"
mkdir -p "$OUT.verify-final"
unzip -q "$ZIP" -d "$OUT.verify-final"
(cd "$OUT.verify-final/$(basename "$OUT")" && sha256sum -c SHA256SUMS.txt > /dev/null)
test -f "$OUT.verify-final/$(basename "$OUT")/capturas/verificacion-zip.png"
test -f "$OUT.verify-final/$(basename "$OUT")/site/assets/$(cd "$OUT/site/assets" && ls | grep -E '^manrope-latin-var.*\.woff2$' | head -1)"
rm -rf "$OUT.verify" "$OUT.verify-final"

echo "Artifact: $ZIP"
ls -lh "$ZIP"
sha256sum "$ZIP"
