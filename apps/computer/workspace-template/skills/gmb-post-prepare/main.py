#!/usr/bin/env python3
"""Google My Business post packager. Does not publish."""
import argparse
import json
from datetime import datetime, timezone

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", required=True)
    parser.add_argument("--photo", default="")
    args = parser.parse_args()
    payload = {
        "summary": args.text,
        "languageCode": "es",
        "callToAction": {"actionType": "LEARN_MORE"},
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "photoHint": args.photo or None,
    }
    result = {
        "packaged": payload,
        "requires_api_key": "GMB_API_KEY",
        "note": "Paquete listo. Para publicar hace falta GMB_API_KEY y OAuth del cliente.",
    }
    print(json.dumps(result, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
