#!/usr/bin/env python3
"""Gera 30 imagens provisórias (5 categorias x 3 reais + 3 IA) e manifest.js, só para testar."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "images"
W, H = 1080, 1350
CATS = {
    "animais": ((236, 179, 101), (180, 98, 52)),
    "comida": ((232, 120, 96), (140, 50, 60)),
    "natureza": ((120, 190, 140), (40, 100, 90)),
    "pessoas": ((170, 150, 220), (80, 70, 150)),
    "cidade": ((130, 170, 210), (50, 70, 110)),
}
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def grad(c1, c2):
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(c1, c2)))
    return img


def main():
    OUT.mkdir(exist_ok=True)
    for old in OUT.glob("*.jpg"):
        old.unlink()
    big, small = ImageFont.truetype(FONT, 110), ImageFont.truetype(FONT, 48)
    manifest, i = [], 0
    for cat, (c1, c2) in CATS.items():
        for ai in (False, True):
            for k in range(1, 4):
                i += 1
                pid = f"p{i:02d}"
                img = grad(c1, c2) if not ai else grad(c2, c1)
                d = ImageDraw.Draw(img)
                d.text((W / 2, H / 2 - 70), cat, font=big, fill="white", anchor="mm")
                d.text((W / 2, H / 2 + 60), f"{'IA' if ai else 'REAL'} {k}", font=big, fill="white", anchor="mm")
                d.text((W / 2, H - 90), "imagem provisória", font=small, fill=(255, 255, 255, 180), anchor="mm")
                img.save(OUT / f"{pid}.jpg", "JPEG", quality=80)
                e = {"id": pid, "file": f"images/{pid}.jpg", "category": cat, "ai": ai}
                if not ai:
                    e["device"] = "iPhone 14"
                    e["captured"] = "2026-11-12"
                manifest.append(e)
    (ROOT / "manifest.js").write_text(
        "// PROVISÓRIO — substituir com tools/preparar_imagens.py\n"
        "window.PHOTO_MANIFEST = " + json.dumps(manifest, ensure_ascii=False, indent=1) + ";\n",
        encoding="utf-8")
    print(f"{len(manifest)} placeholders gerados")


if __name__ == "__main__":
    main()
