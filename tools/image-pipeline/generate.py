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
API_URL = "https://api.openai.com/v1/images/generations"
MODEL = "gpt-image-1"
VALID_SIZES = {"1024x1024", "1536x1024", "1024x1536"}

def safe_rel(value, *, prefixes=None):
    if not isinstance(value, str) or not value or "\\" in value:
        raise ValueError("Invalid path")
    p = pathlib.PurePosixPath(value)
    if p.is_absolute() or ".." in p.parts or any(x.startswith(".") for x in p.parts):
        raise ValueError("Unsafe path")
    normalized = p.as_posix()
    if prefixes and not any(normalized.startswith(prefix) for prefix in prefixes):
        raise ValueError("Output outside approved asset folders")
    return normalized

def main():
    job_rel = safe_rel(os.getenv("JOB_MANIFEST", "tools/image-pipeline/jobs/formacion-pilot.json"))
    if not job_rel.startswith("tools/image-pipeline/jobs/") or not job_rel.endswith(".json"):
        raise ValueError("Job must be a tracked JSON file under tools/image-pipeline/jobs")
    job_path = ROOT / job_rel
    if not job_path.is_file() or job_path.is_symlink():
        raise ValueError("Job file not found")
    job = json.loads(job_path.read_text(encoding="utf-8"))
    entries = job.get("images")
    if not isinstance(entries, list) or not 1 <= len(entries) <= 9:
        raise ValueError("One to nine images per run")
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
    key = os.getenv("IMAGE_API_KEY")
    if not key:
        raise ValueError("Missing OPENAI_API_KEY GitHub Actions secret")
    dest = ROOT / output_dir
    dest.mkdir(parents=True, exist_ok=True)
    records = []
    for item in entries:
        payload = json.dumps({
            "model": MODEL,
            "prompt": item["prompt"],
            "size": item.get("size", "1536x1024"),
            "n": 1,
        }).encode()
        request = urllib.request.Request(API_URL, data=payload, headers={
            "Authorization": "Bearer " + key,
            "Content-Type": "application/json",
        }, method="POST")
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                result = json.load(response)
        except urllib.error.HTTPError as exc:
            raise RuntimeError(f"Image API HTTP {exc.code}; check key/model/billing") from None
        datum = result["data"][0]
        if "b64_json" not in datum:
            raise ValueError("Unexpected image API response: missing b64_json")
        raw = base64.b64decode(datum["b64_json"], validate=True)
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
