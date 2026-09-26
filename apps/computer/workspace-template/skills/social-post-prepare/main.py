#!/usr/bin/env python3
"""Generates 3 social post variants from a single brief. Does not publish."""
import argparse
import json

LINKEDIN_OPENER = "Reflexion:"
INSTAGRAM_OPENER = "*"
FACEBOOK_OPENER = "Compartimos:"

def truncate(text, limit):
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "..."

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--brief", required=True)
    args = parser.parse_args()
    brief = args.brief.strip()
    variants = {
        "linkedin": {
            "text": LINKEDIN_OPENER + chr(10) + chr(10) + brief + chr(10) + chr(10) + "Si te interesa, hablemos.",
            "max_chars": 3000,
        },
        "instagram": {
            "text": INSTAGRAM_OPENER + " " + truncate(brief, 180) + chr(10) + chr(10) + "#negocio #servicios #crecimiento",
            "max_chars": 2200,
        },
        "facebook": {
            "text": FACEBOOK_OPENER + chr(10) + chr(10) + brief + chr(10) + chr(10) + "Te interesa? Escribenos por mensaje.",
            "max_chars": 63206,
        },
    }
    for name in variants:
        variant = variants[name]
        variant["fits"] = len(variant["text"]) <= variant["max_chars"]
    print(json.dumps({"variants": variants}, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
