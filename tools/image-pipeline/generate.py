#!/usr/bin/env python3
"""Reusable, fail-closed, opt-in image generation. No external deps except Pillow."""
import base64
import io
import json
import os
import pathlib
import re
import sys
import urllib.error
import urllib.request
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
JOB_ROOT = ROOT / "tools/image-pipeline/jobs"
ALLOWED = ("apps/ui-lab/public/formation/images/", "assets/generated/")
API_URL = "https://openrouter.ai/api/v1/images"
MODEL = os.getenv("IMAGE_MODEL", "openai/gpt-image-2")
VALID_SIZES = {"1024x1024", "1536x1024", "1024x1536"}

def safe_rel(value, *, prefixes=None):
    if not isinstance(value, str) or not value or "\\" in value:
        raise ValueError("Invalid path")
    p = pathlib.PurePosixPath(value)
    if p.is_absolute() or ".." in p.parts or any(x.startswith(".") for x in p.parts):
        raise ValueError("Unsafe path")
    normalized = p.as_posix()
    if prefixes and not any((normalized + "/").startswith(prefix) for prefix in prefixes):
        raise ValueError("Output outside approved asset folders")
    return normalized

def main():
    job_rel = safe_rel(os.getenv("JOB_MANIFEST", "tools/image-pipeline/jobs/formacion-pilot.json"))
    if not (job_rel.startswith("tools/image-pipeline/jobs/") or job_rel == "tools/image-pipeline/requests/generate-now.json") or not job_rel.endswith(".json"):
        raise ValueError("Job must be a tracked approved JSON file")
    job_path = ROOT / job_rel
    if not job_path.is_file() or job_path.is_symlink():
        raise ValueError("Job file not found")
    job = json.loads(job_path.read_text(encoding="utf-8"))
    entries = job.get("images")
    if not isinstance(entries, list) or not 1 <= len(entries) <= 12:
        raise ValueError("One to twelve images per run")
    output_dir = safe_rel(job["outputDir"].rstrip("/") + "/", prefixes=ALLOWED)
    seen = set()
    for item in entries:
        ident = item.get("id")
        if not isinstance(ident, str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]{1,48}", ident) or ident in seen:
            raise ValueError("Invalid or duplicate image id")
        seen.add(ident)
        if not isinstance(item.get("prompt"), str) or not 20 <= len(item["prompt"]) <= 3000:
            raise ValueError("Prompt must be 20..3000 characters")
        if item.get("size", "1536x1024") not in VALID_SIZES:
            raise ValueError("Invalid size")
    dry = os.getenv("DRY_RUN", "true").lower() != "false"
    print(f"Validated {len(entries)} images. dry_run={dry}. output={output_dir}")
    if dry:
        return
    key = os.getenv("OPENROUTER_API_KEY")
    if not key:
        raise ValueError("Missing OPENROUTER_API_KEY GitHub Actions secret")
    dest = ROOT / output_dir
    dest.mkdir(parents=True, exist_ok=True)
    records = []
    for item in entries:
        payload = json.dumps({
            "model": MODEL,
            "prompt": item["prompt"],
            "aspect_ratio": {"1024x1024":"1:1","1536x1024":"3:2","1024x1536":"2:3"}[item.get("size", "1536x1024")],
            "response_format": "b64_json",
            "n": 1,
        }).encode()
        request = urllib.request.Request(API_URL, data=payload, headers={
            "Authorization": "Bearer " + key,
            "Content-Type": "application/json",
        }, method="POST")
        try:
            with urllib.request.urlopen(request, timeout=240) as response:
                result = json.load(response)
        except urllib.error.HTTPError as exc:
            raise RuntimeError(f"Image API HTTP {exc.code}; check key/model/billing") from None
        images = result.get("data")
        if not isinstance(images, list) or not images:
            raise ValueError("Unexpected Image API response: no images")
        datum = images[0]
        if datum.get("b64_json"):
            raw = base64.b64decode(datum["b64_json"], validate=True)
        elif isinstance(datum.get("url"), str) and datum["url"].startswith("https://"):
            with urllib.request.urlopen(datum["url"], timeout=90) as image_response:
                raw = image_response.read(30_000_001)
        else:
            raise ValueError("Unexpected Image API response: no image data")
        if len(raw) > 30_000_000:
            raise ValueError("Image too large")
        with Image.open(io.BytesIO(raw)) as img:
            img = img.convert("RGB")
            out = dest / (item["id"] + ".webp")
            img.save(out, "WEBP", quality=84, method=6)
            w, h = img.size
        records.append({
            "id": item["id"],
            "courseId": item.get("courseId"),
            "path": (pathlib.PurePosixPath(output_dir) / out.name).as_posix(),
            "width": w, "height": h,
            "alt": item.get("alt", ""),
            "model": MODEL,
            "sourceJob": job_rel,
            "status": "review-required",
        })
        print(f"Created {out.relative_to(ROOT)} ({w}x{h})")
    manifest = dest / "assets-manifest.json"
    manifest.write_text(json.dumps({"schemaVersion": 1, "assets": records}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Manifest: {manifest.relative_to(ROOT)}")

if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError, RuntimeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)
