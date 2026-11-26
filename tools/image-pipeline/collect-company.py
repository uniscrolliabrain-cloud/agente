"""Collect only verified company assets into their documentation folders."""
import json, pathlib, re, shutil, sys
from PIL import Image
root = pathlib.Path(__file__).resolve().parents[2]
batch = int(sys.argv[1])
assert 1 <= batch <= 6
job = json.loads((root / f"tools/image-pipeline/jobs/mi-empresa-v1-lote-{batch}.json").read_text())
source = root / job["outputDir"]
records = json.loads((source / "assets-manifest.json").read_text())["assets"]
expected = {x["id"] for x in job["images"]}
assert len(records) == 12 and {x["id"] for x in records} == expected
base = root / "apps/ui-lab/docs/dashboards/06-settings/mi-empresa"
for record in records:
    ident = record["id"]
    match = re.fullmatch(r"(\d{2}-[a-z-]+)-(0[1-4])", ident)
    assert match
    folder, number = match.groups()
    target = base / folder
    assert (target / "PROMPTS-VISUALES-ICONOS-V1.md").is_file()
    src = source / (ident + ".webp")
    with Image.open(src) as img:
        img.verify()
    dest = target / "visuales" / "v1"
    dest.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest / (ident + ".webp"))
    record["path"] = (dest / (ident + ".webp")).relative_to(root).as_posix()
    (dest / (ident + ".json")).write_text(json.dumps(record, ensure_ascii=False, indent=2)+"\n")
print(f"Collected batch {batch}: {len(records)} review-required assets")
