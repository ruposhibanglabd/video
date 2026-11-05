#!/usr/bin/env python3
"""Set C covers — 1080×1920.

cover A: price-forward, black watch on blush, type on the lower third
cover B: pink watch raised high, type block on the bottom 40 %

Beds are built here (not taken from the video frames) so no video type is
baked in twice, and the watch sits where the cover type needs it.
"""
import importlib.util
import os
import sys
from PIL import Image

BASE = 'miqa/products/2026-11-05_set-c-video'
LAY = f'{BASE}/plates/covers'
D = 'miqa/deliveries/2026-11-05_set-c-video'
os.makedirs(D, exist_ok=True)

spec = importlib.util.spec_from_file_location('secrender', f'{BASE}/render.py')
R = importlib.util.module_from_spec(spec)
sys.argv = ['covers']
spec.loader.exec_module(R)

BEDS = {
    'A': lambda: R.whole_plate(0, watch_h=0.58, valign=0.30),
    'B': lambda: R.whole_plate(1, watch_h=0.50, valign=0.24),
}

for key, make in BEDS.items():
    bed = make().resize((1080, 1920), Image.LANCZOS).convert('RGBA')
    over = Image.open(f'{LAY}/cover{key}.png').convert('RGBA')
    out = Image.alpha_composite(bed, over).convert('RGB')
    p = f'{D}/cover_{key}_1080x1920.jpg'
    out.save(p, quality=93, subsampling=0)
    print(p, round(os.path.getsize(p) / 1024), 'KB')
