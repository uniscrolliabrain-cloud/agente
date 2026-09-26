#!/usr/bin/env python3
"""Classifies an incoming WhatsApp message and drafts a reply. Does not send."""
import argparse
import json
import re

CATEGORIES = [
    ("precio", r"\b(precio|cuanto|coste|tarifa|presupuesto)\b"),
    ("horario", r"\b(horario|abierto|cerrado|hora)\b"),
    ("cita", r"\b(cita|reserva|agendar|disponibilidad|hueco)\b"),
    ("soporte", r"\b(problema|error|no funciona|ayuda|averia)\b"),
    ("ubicacion", r"\b(donde|direccion|ubicacion|llegar)\b"),
]

TEMPLATES = {
    "precio": "Hola, gracias por escribirnos. Nuestras tarifas dependen del servicio. Cuentame un poco mas para darte un presupuesto ajustado.",
    "horario": "Estamos disponibles de lunes a viernes de 9:00 a 18:00. En que podemos ayudarte?",
    "cita": "Perfecto. Que dia y hora te vienen mejor para agendar?",
    "soporte": "Lamento la molestia. Cuentame que esta pasando y lo reviso ahora mismo.",
    "ubicacion": "Te paso la ubicacion exacta en un momento. Prefieres venir o que te llamemos?",
    "general": "Hola, gracias por escribir. En que podemos ayudarte?",
}

def classify(text):
    lowered = text.lower()
    for name, pattern in CATEGORIES:
        if re.search(pattern, lowered):
            return name
    return "general"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--message", required=True)
    parser.add_argument("--tone", choices=["formal", "cercano"], default="cercano")
    args = parser.parse_args()
    category = classify(args.message)
    draft = TEMPLATES[category]
    print(json.dumps({
        "category": category,
        "draft": draft,
        "requires_evolution_key": "EVOLUTION_API_KEY",
        "note": "Borrador listo. Para enviar por WhatsApp hace falta Evolution API configurada.",
    }, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
