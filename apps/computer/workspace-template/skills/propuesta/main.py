#!/usr/bin/env python3
"""Proposal generator. Produces standalone HTML with the given scope."""
import argparse
import html
import json
import os
from datetime import date

TEMPLATE = """<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Propuesta {client}</title>
<style>
body{{font:14px -apple-system,system-ui,sans-serif;color:#172125;max-width:800px;margin:40px auto;padding:24px}}
h1{{margin:0 0 8px;font-size:24px}} h2{{margin:32px 0 8px;font-size:16px}}
.muted{{color:#697176}} pre{{background:#f7f9fa;padding:16px;border-radius:8px;white-space:pre-wrap}}
</style></head><body>
<h1>Propuesta para {client}</h1>
<p class="muted">Fecha: {issued}</p>
<h2>Alcance y paquetes</h2>
<pre>{scope}</pre>
<h2>Proximos pasos</h2>
<ol><li>Confirmar paquete elegido</li><li>Firma del contrato</li><li>Kickoff en 5 dias</li></ol>
</body></html>"""

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--client", required=True)
    parser.add_argument("--scope", required=True)
    parser.add_argument("--out", default="/workspace/propuesta.html")
    args = parser.parse_args()
    rendered = TEMPLATE.format(
        client=html.escape(args.client),
        issued=date.today().isoformat(),
        scope=html.escape(args.scope),
    )
    folder = os.path.dirname(args.out) or "."
    os.makedirs(folder, exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as fh:
        fh.write(rendered)
    print(json.dumps({"client": args.client, "path": args.out}, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
