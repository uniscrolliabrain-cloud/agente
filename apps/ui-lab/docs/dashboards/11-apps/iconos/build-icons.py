#!/usr/bin/env python3
"""Deriva los assets de iconos de AgntiaPro desde los originales 1024×1024.

Entrada:  iconos/original/<id>.jpg  (generación individual, una imagen por app)
Salida:   iconos/final/png/<id>.png     original 1024×1024 (PNG, metadatos fuera)
          iconos/final/webp/<id>.webp   optimizado 512×512 para documentación
          ../../src/apps-launcher/icons/<id>.webp   320×320 para la app (bundle)
          iconos/final/manifiesto.json  id, nombre, prompt, rutas, dimensiones, sha256
          iconos/prompts-definitivos.json  prompts exactos usados por generación

Uso: python3 apps/ui-lab/docs/dashboards/11-apps/iconos/build-icons.py
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
DOCS = HERE.parent
PIPELINE = DOCS.parents[2] / "src" / "apps-launcher" / "icons"
ORIGINAL = HERE / "original"
PNG = HERE / "final" / "png"
WEBP = HERE / "final" / "webp"

BASE = (
    "Create a single premium three-dimensional enterprise application icon for AgntiaPro. "
    "Design an exquisite sculptural object using warm ivory ceramic with a satin finish, sophisticated "
    "violet enamel and restrained champagne-gold metallic accents, placed against a seamless soft lavender "
    "studio background (#F0ECFC). Use carefully art-directed studio lighting, delicate reflections, precise "
    "rounded bevels, realistic material depth and subtle contact shadows. The composition must feel like "
    "luxury industrial product photography rather than generic SaaS illustration. Give the object a "
    "distinctive, immediately recognizable silhouette, centered with generous negative space. Square "
    "composition, high resolution, no typography, no labels, no external logos, no watermarks, no interface "
    "elements, no additional icons. Subject: "
)

# id, nombre visible, sujeto del prompt
APPS: list[tuple[str, str, str]] = [
    ("01-gmail", "Correo", "a single sealed envelope, folded thick ivory ceramic with a soft crease, closed by a violet wax-seal disc with a fine champagne-gold rim."),
    ("02-whatsapp", "Conversaciones", "two overlapping rounded speech bubbles, the larger in ivory ceramic and the smaller in violet enamel, joined by a fine champagne-gold seam."),
    ("03-hubspot", "Clientes", "three ivory ceramic spheres of different sizes connected by slender champagne-gold arcs, like a small constellation of relationships."),
    ("04-holded", "Facturación", "a crisp ivory ceramic invoice sheet with softly embossed horizontal ruled lines and a raised violet circular seal edged in champagne gold, tilted slightly in space."),
    ("05-google-drive", "Archivos", "three stacked ivory ceramic file folders with softly rounded corners, the front folder opening in violet enamel and a thin champagne-gold tab."),
    ("06-google-calendar", "Agenda", "a single calendar tile in ivory ceramic with rounded corners, one raised violet date block and a champagne-gold ring binding at the top."),
    ("07-linear", "Plan de trabajo", "three stacked ivory ceramic task cards fanned in depth, the front card carrying a single raised champagne-gold check mark."),
    ("08-chatgpt", "Asistente", "a faceted four-pointed star sculpted in violet enamel with a small champagne-gold sphere at its center, floating above a subtle ivory ceramic base."),
    ("09-airtable", "Registros", "a precise three-by-three grid of nine small ivory ceramic tiles set in a violet enamel frame, with one tile slightly raised in champagne gold like a selected record."),
    ("10-perdoo", "Objetivos", "a concentric target of three ivory ceramic rings with violet inner rings and a small champagne-gold sphere at the exact center."),
    ("11-holded-tesoreria", "Tesorería", "a short stack of thick ivory ceramic coins with champagne-gold rims and one coin standing upright on edge in violet enamel."),
    ("12-odoo-purchase", "Compras", "a sculptural ivory ceramic shopping bag with softly inflated body, a violet enamel handle and a small champagne-gold tag."),
    ("13-productive", "Rentabilidad", "three ascending beveled ivory ceramic bars of increasing height with champagne-gold top edges, the middle bar inlaid with a thin violet enamel stripe."),
    ("14-zendesk", "Atención", "a sculptural customer-support headset in ivory ceramic with two violet enamel ear cushions connected by a slim champagne-gold arch, one earpiece turned toward the viewer with a fine boom microphone."),
    ("15-docusign", "Firmas", "an elegant fountain-pen nib sculpted in champagne gold standing upright, set into a violet enamel grip section, its slit and breather hole crisply defined."),
    ("16-n8n", "Automatizaciones", "two interlocking mechanical gears, one in ivory ceramic and one in violet enamel, with champagne-gold tooth edges and a visible machined axle hole."),
    ("17-process-street", "Procedimientos", "three stepped ivory ceramic slabs ascending like a staircase, each with a shallow engraved rounded square, the top step inlaid with a small champagne-gold check mark."),
    ("18-factorial", "Equipo", "three abstract figures sculpted as smooth ivory ceramic forms with rounded heads and softly tapered shoulders, standing shoulder to shoulder, the central figure in violet enamel, a fine champagne-gold line unifying their bases."),
    ("19-personio", "Personas", "a single abstract portrait bust sculpted in smooth ivory ceramic with a softly rounded head and shoulders, a slender champagne-gold arc tracing the back of the head like a delicate hairline, on a violet enamel base."),
    ("20-ramp", "Gastos", "a rolled ivory ceramic receipt scroll with softly curling edges, wrapped by a violet enamel band with a tiny champagne-gold clasp."),
    ("21-stripe", "Cobros", "a thick ivory ceramic payment card standing slightly tilted with a champagne-gold chip and one embossed stripe, accompanied by a small violet enamel sphere resting beside it."),
    ("22-canva", "Diseño", "an artist's oval palette sculpted in ivory ceramic with a violet enamel thumb hole and a small mound of violet paint, alongside a slim champagne-gold brush resting across it."),
    ("23-buffer", "Publicaciones", "three slim ivory ceramic cards floating in a fanned stack, the front card inlaid with a violet enamel broadcast arc and a small champagne-gold dot at its origin."),
    ("24-shopify", "Tienda", "a miniature sculptural shopfront with a softly arched ivory ceramic facade and a scalloped awning of alternating violet and ivory panels, a champagne-gold door handle at the center."),
    ("25-intercom", "Soporte", "a sculptural lifebuoy ring in ivory ceramic with four violet enamel segments and a fine champagne-gold rope looped around it."),
    ("26-odoo-inventory", "Inventario", "two stacked ivory ceramic storage crates with softly rounded edges and slatted sides, the upper crate bearing a small violet enamel label plate with a champagne-gold corner."),
    ("27-maintainx", "Mantenimiento", "an elegant open-end wrench sculpted in champagne-gold metal with a violet enamel handle insert, angled diagonally with a crisp jaw opening."),
    ("28-odoo-manufacturing", "Producción", "a compact sculptural production line: an ivory ceramic base with three small violet enamel blocks moving along it and a slim champagne-gold robotic arm arched above the middle block."),
    ("29-isms-online", "Cumplimiento", "a heraldic shield sculpted in ivory ceramic with a softly beveled border, a violet enamel field and a raised champagne-gold check mark at its center."),
    ("30-microsoft-entra", "Accesos", "a large sculptural key with a rounded violet enamel bow, an ivory ceramic shaft and two crisp champagne-gold teeth."),
    ("31-suitedash", "Portal cliente", "an elegant arched portal sculpted in ivory ceramic with a deep violet enamel interior, standing on a slim champagne-gold threshold, like a private client doorway."),
    ("32-notion", "Conocimiento", "an open book sculpted in ivory ceramic with softly curved pages, a violet enamel spine and delicate champagne-gold page edges, seen from a three-quarter angle."),
    ("33-langsmith", "Observabilidad IA", "a circular instrument dial in ivory ceramic with a violet enamel outer ring and a slender champagne-gold needle pointing upward, like a precision observability gauge."),
    ("34-trello", "Tableros", "three vertical ivory ceramic board columns of different heights, each holding two or three small violet enamel tiles, the tallest column topped with a champagne-gold cap."),
    ("35-centro-mando", "Centro de Mando", "a circular command console sculpted in ivory ceramic with a violet enamel inset ring and a champagne-gold compass needle, four subtle gold cardinal marks around the bezel."),
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    for folder in (PNG, WEBP, PIPELINE):
        folder.mkdir(parents=True, exist_ok=True)
    (HERE / "prompts-definitivos.json").write_text(
        json.dumps({app_id: BASE + subject for app_id, _, subject in APPS}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    entries = []
    for app_id, name, subject in APPS:
        source = ORIGINAL / f"{app_id}.jpg"
        if not source.exists():
            raise SystemExit(f"Falta el original {source}")
        image = Image.open(source).convert("RGB")
        if image.size != (1024, 1024):
            raise SystemExit(f"{app_id}: tamaño inesperado {image.size}")

        png_path = PNG / f"{app_id}.png"
        image.save(png_path, "PNG", optimize=True)

        webp_path = WEBP / f"{app_id}.webp"
        image.resize((512, 512), Image.LANCZOS).save(webp_path, "WEBP", quality=88, method=6)

        app_icon = PIPELINE / f"{app_id}.webp"
        image.resize((320, 320), Image.LANCZOS).save(app_icon, "WEBP", quality=84, method=6)

        entries.append({
            "id": app_id,
            "name": name,
            "prompt": BASE + subject,
            "original": f"original/{app_id}.jpg",
            "png": f"final/png/{app_id}.png",
            "webp": f"final/webp/{app_id}.webp",
            "appIcon": f"apps/ui-lab/src/apps-launcher/icons/{app_id}.webp",
            "dimensions": {"original": "1024x1024", "png": "1024x1024", "webp": "512x512", "appIcon": "320x320"},
            "sha256": {"png": sha256(png_path), "webp": sha256(webp_path), "appIcon": sha256(app_icon)},
        })

    manifest = {
        "collection": "AgntiaPro Apps · iconos V3",
        "generatedAt": "2026-11-24",
        "count": len(entries),
        "artDirection": {
            "material": "cerámica marfil satinada, esmalte violeta, metal oro champán",
            "background": "#F0ECFC",
            "lighting": "estudio, reflejos delicados, contacto realista",
            "constraints": "sin tipografía, sin logotipos externos, sin marcas de agua, sin UI",
        },
        "approval": "pendiente de auditoría estética del founder",
        "items": entries,
    }
    (HERE / "final" / "manifiesto.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    png_mb = sum(p.stat().st_size for p in PNG.glob("*.png")) / 1_048_576
    webp_kb = sum(p.stat().st_size for p in WEBP.glob("*.webp")) / 1024
    app_kb = sum(p.stat().st_size for p in PIPELINE.glob("*.webp")) / 1024
    print(f"iconos: {len(entries)} · png {png_mb:.1f} MB · webp512 {webp_kb:.0f} KB · app320 {app_kb:.0f} KB")


if __name__ == "__main__":
    main()
