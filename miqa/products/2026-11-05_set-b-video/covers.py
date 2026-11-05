#!/usr/bin/env python3
"""Set B covers (1080x1920): A = hero dial + ৳350, B = 4-colour strip + ৳350."""
import os
import numpy as np
from PIL import Image, ImageFilter

BASE = 'miqa/products/2026-11-05_set-b-video'
import sys
sys.path.insert(0, BASE)
import render as RD   # whole_plate + full-watch framing, single source of truth
ART = 'miqa/deliveries/2026-11-05_set-b'
OUT = 'miqa/deliveries/2026-11-05_set-b-video'
COLORS = ['01_fiyota-floral-black', '02_fiyota-floral-blue',
          '03_fiyota-floral-white', '04_fiyota-floral-green']
STEMS = ['fiyota-floral-black', 'fiyota-floral-blue',
         'fiyota-floral-white', 'fiyota-floral-green']
W, H = 1080, 1920


def cover(im, w, h):
    s = max(w / im.width, h / im.height)
    im = im.resize((int(im.width * s + .5), int(im.height * s + .5)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def warm(im):
    a = np.asarray(im, np.float32)
    a *= np.array([1.055, 1.005, 0.915], np.float32)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def smart(path, w, h, contain=0.80, valign=0.30, env=None, ramp=360):
    im = Image.open(path).convert('RGB')
    bg = cover(warm(Image.open(env).convert('RGB')), w, h).filter(ImageFilter.GaussianBlur(10))
    s = contain * (w / im.width)
    fg = im.resize((int(im.width * s + .5), int(im.height * s + .5)), Image.LANCZOS)
    if fg.height > h:
        k = h / fg.height
        fg = fg.resize((int(fg.width * k), h), Image.LANCZOS)
    if fg.width < w:
        k = w / fg.width
        fg = fg.resize((w, int(fg.height * k)), Image.LANCZOS)
    fg = warm(fg)
    mh, mw = fg.height, fg.width
    yy = np.arange(mh, dtype=np.float32)
    r = min(ramp, mh // 2)
    m = np.minimum(np.clip(yy / r, 0, 1), np.clip((mh - 1 - yy) / r, 0, 1)) ** 1.3
    mask = Image.fromarray((np.repeat(m[:, None], mw, 1) * 255).astype(np.uint8))
    mask = mask.filter(ImageFilter.GaussianBlur(40))
    y0 = max(0, min(h - mh, int((h - mh) * valign)))
    bg.paste(fg, (0, y0), mask)
    return bg


def whole(ci, w, h, watch_h=0.62, valign=0.33):
    """Whole-watch plate at cover resolution (render.py builds at 2160x3840)."""
    plate = RD.whole_plate(ci, watch_h=watch_h, valign=valign)
    return plate.resize((w, h), Image.LANCZOS) if (w, h) != plate.size else plate


def main():
    os.makedirs(OUT, exist_ok=True)
    txtA = Image.open('/tmp/cover_text_A.png').convert('RGBA')
    txtB = Image.open('/tmp/cover_text_B.png').convert('RGBA')

    # ---- Cover A: hero black dial, price block bottom
    plate = whole(0, W, H, watch_h=0.60, valign=0.315)
    a = np.asarray(plate, np.float32)
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    a *= (1.06 - 0.20 * yy ** 1.3)
    plate = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA')
    plate = Image.alpha_composite(plate, txtA)
    plate.convert('RGB').save(f'{OUT}/cover_A_1080x1920.jpg', quality=94, subsampling=0)

    # ---- Cover B: pearl field, price block, 4 colour thumbs (text layer B)
    bgB = txtB.copy()
    bgB = Image.alpha_composite(Image.new('RGBA', (W, H), (0, 0, 0, 0)), bgB)
    # soft florals only at the very top and bottom edges
    for envp, box, amt in [(f'{BASE}/plates/env_vanity.jpg', (0, 0, W, 320), 0.50)]:
        env = cover(warm(Image.open(envp).convert('RGB')), W, H)
        band = np.zeros((H, W), np.float32)
        y0, y1 = box[1], box[3]
        ramp = 120
        for y in range(y0, y1):
            v = 1.0
            if y < y0 + ramp:
                v = (y - y0) / ramp
            if y > y1 - ramp:
                v = min(v, (y1 - y) / ramp)
            band[y, :] = max(0.0, v) * amt
        env_a = Image.fromarray((band * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(24))
        prev = bgB.convert('RGB')
        bgB = Image.composite(env.convert('RGBA'), prev.convert('RGBA'), env_a)
    bgB = Image.alpha_composite(bgB.convert('RGBA'), txtB)
    bgB.convert('RGB').save(f'{OUT}/cover_B_1080x1920.jpg', quality=94, subsampling=0)
    print('covers written')


if __name__ == '__main__':
    main()
