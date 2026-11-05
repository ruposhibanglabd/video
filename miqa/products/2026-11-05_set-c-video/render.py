#!/usr/bin/env python3
"""Set C — 31.5 s / 945 frames @30fps, 2160×3840.

Shot language is the one the client approved on Set B v4: whole watch always,
only a slow push, straight cuts between colourways, 0.28 s cross-dissolves
elsewhere, never a wipe / glint / zoom-pop.

  hook      0.0– 5.6   black watch, price type
  run       5.6–12.9   five colourways, 1.45 s each, straight cuts
  water    12.9–18.3   pink watch, water-resistance copy (verbatim)
  replace  18.3–21.8   white watch, 7-day replacement
  five     21.8–26.4   pearl card, 5 % pledge (hard cut in/out)
  cta      26.4–31.5   black watch burgundy duotone, CTA
"""
import json, os, argparse, subprocess
import numpy as np
import cv2
from PIL import Image, ImageFilter

W, H, FPS = 2160, 3840, 30
BASE = 'miqa/products/2026-11-05_set-c-video'
WORK = f'{BASE}/work'
LAY = f'{BASE}/plates/text'
ART = f'{BASE}/work/clean'   # chip-free primaries (clean_plates.py)

# (folder, stem-ish label, text-layer name)
COLOURS = [
    ('01_fiyota-octagon-black', 't_c1'),
    ('02_fiyota-octagon-pink', 't_c2'),
    ('03_trueworth-heart-black', 't_c3'),
    ('04_fiyota-octagon-green', 't_c4'),
    ('05_fiyota-octagon-white', 't_c5'),
]


def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


# ------------------------------------------------------------------ plates
def watch_bbox(im, tol=55, thr=0.012):
    """Subject box that survives the render's own backdrop gradient.

    Compares every pixel against a row-wise background profile taken from the
    outer 8 % strips (the plates are vignetted, so a single corner colour is
    not a backdrop). Only rows/columns carrying a real share of subject pixels
    are kept, then a 2 % margin is added.
    """
    a = np.asarray(im.convert('RGB'), np.float32)
    prof = row_bg(im, pad=0.08)
    m = np.abs(a - prof[:, None, :]).max(2) > tol
    cols = np.where(m.mean(0) > thr)[0]
    rows = np.where(m.mean(1) > thr)[0]
    x0, x1, y0, y1 = int(cols[0]), int(cols[-1]), int(rows[0]), int(rows[-1])
    mx, my = int((x1 - x0) * 0.02), int((y1 - y0) * 0.01)
    return max(0, x0 - mx), max(0, y0 - my), min(im.width, x1 + mx), min(im.height, y1 + my)


def row_bg(im, pad=0.18):
    a = np.asarray(im.convert('RGB'), np.float32)
    k = max(8, int(a.shape[1] * pad))
    strip = np.concatenate([a[:, :k], a[:, -k:]], 1)
    rows = np.median(strip, axis=1)
    ker = np.ones(41, np.float32) / 41
    padded = np.pad(rows, ((20, 20), (0, 0)), mode='edge')
    return np.stack([np.convolve(padded[:, c], ker, 'valid') for c in range(3)], 1)


def field(prof, pool=8.0):
    ys = np.clip((np.arange(H) * (len(prof) - 1) / max(1, H - 1)).astype(int), 0, len(prof) - 1)
    a = prof[ys][:, None, :].repeat(W, 1)
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
    a += np.exp(-(((xx - 0.5) / 0.46) ** 2 + ((yy - 0.40) / 0.36) ** 2))[:, :, None] * pool
    return a


def soft_bg(im, box, hw=540, hh=960):
    """Cheap backdrop field for the 9:16 frame.

    Built from the photo's own row-wise backdrop (so the colour matches the
    render) at quarter resolution, with the same radial lift the render has.
    The sharp square is later composited on a blur of itself, which hides the
    seam completely, so no inpainting is needed here.
    """
    prof = row_bg(im, pad=0.08)
    ys = np.clip((np.arange(hh) * (len(prof) - 1) / max(1, hh - 1)).astype(int), 0, len(prof) - 1)
    f = prof[ys][:, None, :].repeat(hw, 1)
    yy = np.linspace(0, 1, hh, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, hw, dtype=np.float32)[None, :]
    f = f + np.exp(-(((xx - 0.5) / 0.46) ** 2 + ((yy - 0.36) / 0.34) ** 2))[:, :, None] * 9.0
    f = np.clip(f * np.array([1.02, 1.0, 0.985], np.float32), 0, 255)
    return Image.fromarray(f.astype(np.uint8)).resize((W, H), Image.BICUBIC)


def whole_plate(ci, watch_h=0.70, valign=0.40):
    """Entire watch, sized by its own bounding box so all five match.

    The square render is pasted onto a *blurred copy of the same composite*.
    Because the background then carries the square's own luminance, the seam
    of the paste disappears — no visible column or band.
    """
    folder, _ = COLOURS[ci]
    im = Image.open(f'{ART}/{folder}/clean_primary.jpg').convert('RGB')
    x0, y0, x1, y1 = watch_bbox(im)
    want = H * watch_h
    side = int(round(want * im.height / (y1 - y0)))
    sq = im.resize((side, side), Image.LANCZOS)
    k = side / im.height
    cy = (y0 + y1) / 2 * k
    px = (W - side) // 2
    py = int(round(H * valign - cy))
    f = max(24.0, side * 0.09)
    yy = np.arange(side, dtype=np.float32)[:, None]
    xx = np.arange(side, dtype=np.float32)[None, :]
    m = np.minimum(np.clip(yy / f, 0, 1), np.clip((side - 1 - yy) / f, 0, 1))
    m = np.minimum(m, np.minimum(np.clip(xx / f, 0, 1), np.clip((side - 1 - xx) / f, 0, 1))) ** 0.9
    mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(f * 0.55))

    base = soft_bg(im, (x0, y0, x1, y1))
    half = base.resize((W // 2, H // 2), Image.BILINEAR).copy()
    half.paste(sq.resize((side // 2, side // 2), Image.BILINEAR),
               (px // 2, py // 2), mask.resize((side // 2, side // 2), Image.BILINEAR))
    out = half.filter(ImageFilter.GaussianBlur(24)).resize((W, H), Image.BILINEAR)
    out.paste(sq, (px, py), mask)
    a = np.asarray(out, np.float32)
    a *= np.array([1.04, 1.005, 0.94], np.float32)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def duotone(plate):
    a = np.asarray(plate, np.float32) / 255.0
    lum = np.clip(a @ np.array([0.30, 0.59, 0.11], np.float32), 0, 1)
    lum = np.clip((lum - 0.04) * 1.04, 0, 1) ** 1.15
    sh = np.array([0.085, 0.022, 0.036], np.float32)
    hi = np.array([0.70, 0.36, 0.44], np.float32)
    out = (sh + lum[..., None] * (hi - sh)) * 255
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def zoom(plate, p, z0, z1):
    z = z0 + (z1 - z0) * ease(p)
    cw, ch = int(W / z), int(H / z)
    x0, y0 = (W - cw) // 2, (H - ch) // 2
    return plate.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, H), Image.BILINEAR)


_CROP = {}


def _layer(name):
    if name not in _CROP:
        lay = Image.open(f'{LAY}/{name}.png').convert('RGBA')
        bb = lay.getchannel('A').getbbox()
        _CROP[name] = (lay.crop(bb), bb[0], bb[1])
    return _CROP[name]


def paste(base, name, a=1.0, dy=0):
    if a <= 0.004:
        return base
    lay, ox, oy = _layer(name)
    if a < 0.999:
        lay = lay.copy()
        lay.putalpha(lay.getchannel('A').point(lambda v: int(v * a)))
    base.paste(lay, (ox, oy + dy), lay)
    return base


# ------------------------------------------------------------------ render
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='/tmp/cframes')
    ap.add_argument('--test', default='')
    ap.add_argument('--start', type=int, default=0)
    ap.add_argument('--end', type=int, default=0)
    ap.add_argument('--rebuild', action='store_true')
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    tl = json.load(open(f'{WORK}/timeline.json'))
    total = tl['total']
    NF = int(round(total * FPS))
    print(f'{NF} frames, {total:.2f}s', flush=True)

    print('plates...', flush=True)
    PD = f'{WORK}/plates'
    os.makedirs(PD, exist_ok=True)

    def cached(name, fn):
        p = f'{PD}/{name}.png'
        if os.path.exists(p) and not args.rebuild:
            return Image.open(p).convert('RGB')
        im = fn()
        im.save(p)
        return im

    hook_plate = cached('hook', lambda: whole_plate(0, watch_h=0.58, valign=0.32))
    run_plates = [cached(f'run{i}', (lambda i=i: whole_plate(i, watch_h=0.66, valign=0.36)))
                  for i in range(5)]
    water_plate = cached('water', lambda: whole_plate(1, watch_h=0.60, valign=0.30))
    replace_plate = cached('replace', lambda: whole_plate(4, watch_h=0.60, valign=0.30))
    close_plate = cached('close', lambda: duotone(whole_plate(0, watch_h=0.60, valign=0.30)))

    grain = [np.random.default_rng(i).normal(0, 1.6, (H // 2, W // 2)).astype(np.float32)
             for i in range(4)]

    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    top = np.array([252, 245, 242], np.float32)
    bot = np.array([240, 214, 222], np.float32)
    PEARL_CARD = Image.fromarray(
        np.clip(top * (1 - yy) + bot * yy, 0, 255).astype(np.uint8).repeat(W, 1))

    def pearl_card(p):
        z = 1.0 + 0.02 * ease(p)
        cw, ch = int(W / z), int(H / z)
        x0, y0 = (W - cw) // 2, (H - ch) // 2
        return PEARL_CARD.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, H), Image.BILINEAR)

    def finish(img, i):
        a = np.asarray(img, np.float32)
        g = np.repeat(np.repeat(grain[i % 4], 2, 0), 2, 1)[..., None]
        return Image.fromarray(np.clip(a + g, 0, 255).astype(np.uint8))

    RUN0, RUNS = 5.6, (12.9 - 5.6) / 5

    def frame(t, with_type=True):
        # ---------------- hook
        if t < RUN0:
            p = max(0.0, t) / RUN0
            img = zoom(hook_plate, p, 1.0, 1.045)
            img = finish(img, int(t * FPS))
            if with_type:
                img = paste(img, 't_bar', ease(t / 0.45))
                img = paste(img, 't_hook', ease((t - 0.35) / 0.7))
            return img
        # ---------------- colourway run: straight cuts, one push each
        if t < 12.9:
            k = min(4, int((t - RUN0) / RUNS))
            lt = (t - RUN0) - k * RUNS
            img = zoom(run_plates[k], lt / RUNS, 1.0, 1.03)
            img = finish(img, int(t * FPS))
            if with_type:
                img = paste(img, 't_bar', 1.0)
                img = paste(img, COLOURS[k][1], 1.0)
            return img
        # ---------------- water resistance
        if t < 18.3:
            p = (t - 12.9) / 5.4
            img = zoom(water_plate, p, 1.0, 1.03)
            img = finish(img, int(t * FPS))
            if with_type:
                img = paste(img, 't_bar', 1.0)
                img = paste(img, 't_water', 1.0)
            return img
        # ---------------- 7-day replacement
        if t < 21.8:
            p = (t - 18.3) / 3.5
            img = zoom(replace_plate, p, 1.0, 1.028)
            img = finish(img, int(t * FPS))
            if with_type:
                img = paste(img, 't_bar', 1.0)
                img = paste(img, 't_replace', 1.0)
            return img
        # ---------------- 5 % pledge (calm pearl card, no product)
        if t < 26.4:
            p = (t - 21.8) / 4.6
            img = pearl_card(p)
            img = finish(img, int(t * FPS))
            if with_type:
                img = paste(img, 't_five', 1.0)     # hard cut in, type already there
            return img
        # ---------------- CTA + close
        p = (t - 26.4) / (total - 26.4)
        img = zoom(close_plate, p, 1.0, 1.02)
        img = finish(img, int(t * FPS))
        if with_type:
            img = paste(img, 't_cta', 1.0)
        return img

    # dissolves everywhere except into/out of the pearl card (ghosts on a flat card)
    BOUNDS = [5.6, 12.9, 18.3, 21.8, 26.4]
    HARD = {21.8, 26.4}

    def render(i):
        t = i / FPS
        img = frame(t)
        for b in BOUNDS:
            if b in HARD:
                continue
            d = 0.28
            if b - d / 2 <= t < b + d / 2:
                k = ease((t - (b - d / 2)) / d)
                a = frame(b - d / 2 - 0.001)
                c = frame(b + d / 2 + 0.001)
                arr = np.asarray(a, np.float32) * (1 - k) + np.asarray(c, np.float32) * k
                img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
                break
        return img

    if args.test:
        for f in [int(x) for x in args.test.split(',')]:
            render(f).save(f'{args.out}/test_{f:05d}.jpg', quality=90)
            print('test frame', f)
        return

    a, b = args.start, (args.end or NF)
    for i in range(a, b):
        render(i).save(f'{args.out}/f_{i:05d}.jpg', quality=92, subsampling=0)
        if i % 60 == 0:
            print(f'frame {i}/{NF}', flush=True)
    print('DONE', b)


if __name__ == '__main__':
    main()
