#!/usr/bin/env python3
"""Invoice generator. Produces standalone HTML that can be printed to PDF."""
import argparse
import html
import json
import os
from datetime import date

TEMPLATE = """<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Factura {number}</title>
<style>
body{{font:14px -apple-system,system-ui,sans-serif;color:#172125;max-width:720px;margin:40px auto;padding:24px}}
h1{{margin:0 0 4px;font-size:22px}} .muted{{color:#697176}}
table{{width:100%;border-collapse:collapse;margin:24px 0}}
th,td{{text-align:left;padding:10px;border-bottom:1px solid #e9edef}}
.total{{text-align:right;font-weight:600;font-size:16px}}
</style></head><body>
<h1>Factura {number}</h1>
<p class="muted">Emitida {issued}</p>
<p><strong>Cliente:</strong> {client}</p>
<p><strong>Periodo:</strong> {period}</p>
<table><thead><tr><th>Concepto</th><th>Importe</th></tr></thead>
<tbody><tr><td>{concept}</td><td>{amount} EUR</td></tr>
<tr><td>IVA 21%</td><td>{vat} EUR</td></tr></tbody></table>
<p class="total">Total a pagar: {total} EUR</p>
</body></html>"""

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--client", required=True)
    parser.add_argument("--amount", required=True)
    parser.add_argument("--concept", default="Servicios profesionales")
    parser.add_argument("--period", default="")
    parser.add_argument("--out", default="/workspace/factura.html")
    args = parser.parse_args()
    try:
        amount = float(args.amount)
    except ValueError:
        print(json.dumps({"error": "importe invalido: " + args.amount}))
        return 1
    vat = round(amount * 0.21, 2)
    total = round(amount + vat, 2)
    number = "F-" + str(date.today().year) + "-" + date.today().strftime("%m%d")
    rendered = TEMPLATE.format(
        number=html.escape(number),
        issued=date.today().isoformat(),
        client=html.escape(args.client),
        period=html.escape(args.period or date.today().strftime("%B %Y")),
        concept=html.escape(args.concept),
        amount=f"{amount:.2f}",
        vat=f"{vat:.2f}",
        total=f"{total:.2f}",
    )
    folder = os.path.dirname(args.out) or "."
    os.makedirs(folder, exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as fh:
        fh.write(rendered)
    print(json.dumps({
        "number": number,
        "client": args.client,
        "amount": amount,
        "vat": vat,
        "total": total,
        "path": args.out,
    }, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
