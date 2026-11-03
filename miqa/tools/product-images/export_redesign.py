#!/usr/bin/env python3
"""Export fully generated square scenes; never segment, overlay or composite a watch.

Usage: python export_redesign.py SOURCE_DIR DELIVERY_DIR PRODUCT_SLUG [--shots SHOT ...]
Requires Pillow. Source images retain their native resolution in the manifest;
2000px delivery resizing is explicitly recorded, not claimed as native detail.
Default shot names preserve the original FIYOTA silver delivery. Use --shots to
select product-specific filenames, e.g. 04_bracelet-closeup instead of a clasp.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import zipfile
from pathlib import Path
from typing import Sequence

from PIL import Image, ImageCms

SHOTS = {
    "01_primary": "01_primary",
    "02_on-wrist": "02_on-wrist",
    "03_angle": "03_angle",
    "04_butterfly-lock": "04_butterfly-lock",
    "05_styled": "05_styled",
}
DEFAULT_SHOTS = tuple(SHOTS)
SHOT_RE = re.compile(r"^[0-9]{2}_[a-z0-9]+(?:-[a-z0-9]+)*$")
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SIZE = 2000
MAX_BYTES = 1_500_000


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def export(source: Path, delivery: Path, slug: str,
           shots: Sequence[str] | None = None) -> None:
    selected = tuple(DEFAULT_SHOTS if shots is None else shots)
    if not SLUG_RE.fullmatch(slug):
        raise ValueError(f"Invalid product slug: {slug!r}")
    if not selected:
        raise ValueError("At least one shot is required")
    if len(set(selected)) != len(selected):
        raise ValueError("Shot names must be unique")
    for stem in selected:
        if not SHOT_RE.fullmatch(stem):
            raise ValueError(f"Invalid shot name: {stem!r}")

    # Validate the complete set before writing any final images.
    for stem in selected:
        path = source / f"{stem}.png"
        with Image.open(path) as im:
            if im.width != im.height:
                raise ValueError(f"Expected a square generated scene: {path}")

    out = delivery / "website-images"
    out.mkdir(parents=True, exist_ok=True)
    profile = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
    records = []
    paths = []
    for stem in selected:
        shot = stem
        path = source / f"{stem}.png"
        with Image.open(path) as im:
            native = list(im.size)
            # Generated outputs are RGB. No watch extraction or generative upscaling.
            im = im.convert("RGB").resize((SIZE, SIZE), Image.Resampling.LANCZOS)
        target = out / f"{slug}_{shot}.jpg"
        for quality in (92, 90, 88, 85, 82):
            buf = io.BytesIO()
            im.save(buf, format="JPEG", quality=quality, subsampling=0,
                    optimize=True, icc_profile=profile)
            if buf.tell() <= MAX_BYTES:
                break
        else:
            raise ValueError(f"Cannot meet delivery byte limit: {target}")
        target.write_bytes(buf.getvalue())
        paths.append(target)
        records.append({
            "file": f"website-images/{target.name}",
            "source": path.name,
            "nativeResolution": native,
            "deliveryResolution": [SIZE, SIZE],
            "resize": "Lanczos; no generative upscaling",
            "jpegQuality": quality,
            "bytes": target.stat().st_size,
            "sha256": sha256(target),
        })

    archive = delivery / f"{slug}_website-images.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in paths:
            zf.write(path, arcname=f"website-images/{path.name}")
    with zipfile.ZipFile(archive) as zf:
        if zf.testzip() is not None:
            raise ValueError("ZIP integrity check failed")

    manifest = {
        "product": slug,
        "revision": delivery.name,
        "method": "Fully generated photographic scenes from product references; no cutout compositing",
        "overlays": "none",
        "addedShadowLayers": False,
        "colorspace": "sRGB",
        "images": records,
        "zip": {"file": archive.name, "sha256": sha256(archive), "bytes": archive.stat().st_size},
        "limitation": "AI-generated reference-based visualization, not a pixel-exact original product photograph",
    }
    (delivery / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    print(f"Exported {len(paths)} images and verified {archive.name}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("delivery", type=Path)
    parser.add_argument("slug")
    parser.add_argument(
        "--shots", nargs="+", default=None, metavar="SHOT",
        help="Source PNG stems without .png, in delivery order. "
             "Defaults to the original FIYOTA silver five-shot set.",
    )
    args = parser.parse_args()
    export(args.source, args.delivery, args.slug, args.shots)
