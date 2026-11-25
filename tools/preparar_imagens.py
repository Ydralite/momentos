#!/usr/bin/env python3
"""
Prepara as imagens do estudo PHOTO SAFE e gera manifest.js.

Estrutura esperada da pasta de entrada (fora do repositório!):

    fotos/
      real/
        animais/  comida/  natureza/  pessoas/  cidade/
      ia/
        animais/  comida/  natureza/  pessoas/  cidade/

Mínimo: 3 reais + 3 IA por categoria (30 imagens). Mais é melhor.
Formatos: JPG, PNG, WEBP, HEIC (iPhone).

O que faz:
  - corrige a orientação, recorta ao centro em 4:5 e redimensiona para 1080x1350
  - remove TODOS os metadados (EXIF, C2PA, XMP) e grava JPEG q85
  - dá nomes neutros e baralhados (p01.jpg, p02.jpg...) para que o nome não denuncie a origem
  - nas fotos reais, guarda o modelo do telemóvel e a data de captura (para o painel de origem)
  - escreve manifest.js na raiz do site e um mapeamento privado (original -> id) fora do site

Uso:
    pip install pillow pillow-heif
    python tools/preparar_imagens.py /caminho/para/fotos
"""
import argparse
import csv
import json
import random
import sys
from pathlib import Path

from PIL import Image, ImageOps, ExifTags

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

CATEGORIES = ["animais", "comida", "natureza", "pessoas", "cidade"]
SOURCES = {"real": False, "ia": True}
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}
W, H = 1080, 1350
MIN_PER_CELL = 3

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "images"
MANIFEST = ROOT / "manifest.js"

TAGS = {v: k for k, v in ExifTags.TAGS.items()}


def read_exif(img):
    try:
        exif = img.getexif()
    except Exception:
        return None, None
    make = (exif.get(TAGS["Make"]) or "").strip().strip("\x00")
    model = (exif.get(TAGS["Model"]) or "").strip().strip("\x00")
    date = None
    try:
        sub = exif.get_ifd(0x8769)  # Exif IFD
        date = sub.get(TAGS["DateTimeOriginal"]) or exif.get(TAGS["DateTime"])
    except Exception:
        date = exif.get(TAGS["DateTime"])
    device = model
    if make and model and not model.lower().startswith(make.lower().split()[0]):
        device = f"{make} {model}"
    if device.lower().startswith("apple "):
        device = device[6:]
    iso = None
    if date and isinstance(date, str) and len(date) >= 10:
        iso = date[:10].replace(":", "-")
    return (device or None), iso


def crop_45(img):
    img = ImageOps.exif_transpose(img).convert("RGB")
    return ImageOps.fit(img, (W, H), method=Image.LANCZOS, centering=(0.5, 0.5))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", type=Path, help="pasta com real/ e ia/")
    ap.add_argument("--seed", type=int, default=None)
    args = ap.parse_args()

    files = []
    problems = []
    for src, is_ai in SOURCES.items():
        for cat in CATEGORIES:
            d = args.input / src / cat
            found = sorted(p for p in d.glob("*") if p.suffix.lower() in EXTS) if d.exists() else []
            if len(found) < MIN_PER_CELL:
                problems.append(f"  {src}/{cat}: {len(found)} imagens (mínimo {MIN_PER_CELL})")
            files += [(p, cat, is_ai) for p in found]

    if problems:
        print("Faltam imagens:\n" + "\n".join(problems))
        sys.exit(1)

    rng = random.Random(args.seed)
    rng.shuffle(files)

    OUT_DIR.mkdir(exist_ok=True)
    for old in OUT_DIR.glob("*.jpg"):
        old.unlink()

    manifest, mapping = [], []
    for i, (path, cat, is_ai) in enumerate(files, 1):
        pid = f"p{i:02d}"
        with Image.open(path) as img:
            device, captured = (None, None) if is_ai else read_exif(img)
            out = crop_45(img)
        # gravar sem exif/icc/xmp
        out.save(OUT_DIR / f"{pid}.jpg", "JPEG", quality=85, optimize=True, progressive=True)
        entry = {"id": pid, "file": f"images/{pid}.jpg", "category": cat, "ai": is_ai}
        if not is_ai:
            entry["device"] = device or "Smartphone"
            entry["captured"] = captured
        manifest.append(entry)
        mapping.append({"id": pid, "original": str(path), "category": cat, "ai": is_ai,
                        "device": device or "", "captured": captured or ""})

    MANIFEST.write_text(
        "// Gerado por tools/preparar_imagens.py — não editar à mão\n"
        "window.PHOTO_MANIFEST = " + json.dumps(manifest, ensure_ascii=False, indent=1) + ";\n",
        encoding="utf-8")

    private = args.input / "mapeamento_privado.csv"
    with private.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(mapping[0].keys()))
        w.writeheader()
        w.writerows(mapping)

    n_ai = sum(e["ai"] for e in manifest)
    no_exif = sum(1 for m in mapping if not m["ai"] and not m["device"])
    print(f"OK: {len(manifest)} imagens ({len(manifest) - n_ai} reais, {n_ai} IA) -> {OUT_DIR}")
    print(f"manifest.js escrito. Mapeamento privado: {private}")
    if no_exif:
        print(f"Aviso: {no_exif} fotos reais sem modelo de câmara no EXIF (aparece 'Smartphone').")


if __name__ == "__main__":
    main()
