#!/usr/bin/env python3
"""Set B v4 — 20 s / 600 frames, whole watch only, no flashes.

Shot language (deliberately calm; the client said the old cut "flashed"):
  hook   0.0-5.2   whole black watch on blush, tiny push; price type fades up
  colours 5.2-11.4 four colourways, one per ~1.5 s: whole watch centred,
                   straight cut between them, NO wipe, NO glint, NO zoom pop
  guarantee 11.4-14.2 whole watch + seal, gentle push
  five   14.2-17.1  whole watch dimmed, 5% type
  cta    17.1-20.0  whole watch duotone burgundy + CTA, calm
Transitions are 0.28 s cross-dissolves only.
"""
import json, math, os, argparse
import numpy as np
from PIL import Image, ImageFilter

W, H, FPS = 2160, 3840, 30
BASE = 'miqa/products/2026-11-05_set-b-video'
WORK = f'{BASE}/work/v4'
LAY = f'{BASE}/plates/v4'
ART = 'miqa/deliveries/2026-11-05_set-b'
COLORS = [('01_fiyota-floral-black', 'fiyota-floral-black'),
          ('02_fiyota-floral-blue', 'fiyota-floral-blue'),
          ('03_fiyota-floral-white', 'fiyota-floral-white'),
          ('04_fiyota-floral-green', 'fiyota-floral-green')]


def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


# ------------------------------------------------------------------ plates
def watch_bbox(im, tol=34):
    a = np.asarray(im.convert('RGB'), np.float32)
    h, w, _ = a.shape
    c = np.concatenate([a[:60, :60].reshape(-1, 3), a[:60, -60:].reshape(-1, 3),
                        a[-60:, :60].reshape(-1, 3), a[-60:, -60:].reshape(-1, 3)])
    bg = np.median(c, 0)
    m = np.abs(a - bg).max(2) > tol
    cols = np.where(m.mean(0) > 0.004)[0]
    rows = np.where(m.mean(1) > 0.004)[0]
    return int(cols[0]), int(rows[0]), int(cols[-1]), int(rows[-1])


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


def whole_plate(ci, watch_h=0.70, valign=0.40):
    """Entire watch, top bracelet link to the heart end-link."""
    folder, stem = COLORS[ci]
    im = Image.open(f'{ART}/{folder}/website-images/{stem}_01_primary.jpg').convert('RGB')
    x0, y0, x1, y1 = watch_bbox(im)
    mx, my = int((x1 - x0) * 0.05), int((y1 - y0) * 0.025)
    fg = im.crop((max(0, x0 - mx), max(0, y0 - my), min(im.width, x1 + mx), min(im.height, y1 + my)))
    th = int(H * watch_h)
    tw = max(1, int(fg.width * th / fg.height))
    fg = fg.resize((tw, th), Image.LANCZOS)
    out = Image.fromarray(np.clip(field(row_bg(im)), 0, 255).astype(np.uint8))
    out = out.filter(ImageFilter.GaussianBlur(3))
    ry, rx = min(150, th // 3), int(tw * 0.08)
    yy = np.arange(th, dtype=np.float32)[:, None]
    xx = np.arange(tw, dtype=np.float32)[None, :]
    m = np.minimum(np.clip(yy / ry, 0, 1), np.clip((th - 1 - yy) / ry, 0, 1))
    m = np.minimum(m, np.minimum(np.clip(xx / rx, 0, 1), np.clip((tw - 1 - xx) / rx, 0, 1))) ** 0.7
    mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(44))
    py = int(max(0, min(H - th, H * valign - th / 2)))
    out.paste(fg, ((W - tw) // 2, py), mask)
    a = np.asarray(out, np.float32)
    a *= np.array([1.05, 1.005, 0.925], np.float32)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def duotone(plate):
    """Burgundy duotone of a whole-watch plate, for the closing card."""
    a = np.asarray(plate, np.float32) / 255.0
    lum = np.clip(a @ np.array([0.30, 0.59, 0.11], np.float32), 0, 1)
    lum = np.clip((lum - 0.04) * 1.04, 0, 1) ** 1.15
    sh = np.array([0.085, 0.022, 0.036], np.float32)
    hi = np.array([0.70, 0.36, 0.44], np.float32)
    out = (sh + lum[..., None] * (hi - sh)) * 255
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def zoom(plate, p, z0, z1):
    """Gentle push. p=0..1 over the scene."""
    z = z0 + (z1 - z0) * ease(p)
    cw, ch = int(W / z), int(H / z)
    x0 = (W - cw) // 2
    y0 = (H - ch) // 2
    return plate.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, H), Image.BILINEAR)


def soft_overlay(base, color, alpha):
    ov = Image.new('RGBA', (W, H), color + (int(alpha * 255),))
    return Image.alpha_composite(base.convert('RGBA'), ov).convert('RGB')


def paste(base, name, a, dy=0):
    if a <= 0.004:
        return base
    lay = Image.open(f'{LAY}/{name}.png').convert('RGBA')
    if a < 0.999:
        lay = lay.copy()
        lay.putalpha(lay.getchannel('A').point(lambda v: int(v * a)))
    base.paste(lay, (0, dy), lay)
    return base


# ------------------------------------------------------------------ render
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='/tmp/v4frames')
    ap.add_argument('--test', default='')
    ap.add_argument('--start', type=int, default=0)
    ap.add_argument('--end', type=int, default=0)
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    tl = json.load(open(f'{WORK}/timeline.json'))
    total = tl['total']
    NF = int(round(total * FPS))
    print(f'{NF} frames, {total:.2f}s', flush=True)

    print('building plates...', flush=True)
    plates = [whole_plate(ci) for ci in range(4)]
    # hook + closing: watch sits higher so the type owns the lower third
    hook_plate = whole_plate(0, watch_h=0.56, valign=0.30)
    five_plate = whole_plate(1, watch_h=0.56, valign=0.28)
    close_plate = duotone(whole_plate(0, watch_h=0.60, valign=0.30))
    grain = [np.random.default_rng(i).normal(0, 1.6, (H // 2, W // 2)).astype(np.float32)
             for i in range(4)]

    # pearl card base for the 5% pledge scene (built once, reused every frame)
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    top = np.array([251, 244, 241], np.float32)
    bot = np.array([246, 226, 227], np.float32)
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

    def frame(t):
        # ---------------- hook
        if t < 5.2:
            p = t / 5.2
            img = zoom(hook_plate, p, 1.0, 1.045)
            img = finish(img, int(t * FPS))
            img = paste(img, 't_bar', ease(t / 0.45))
            img = paste(img, 't_hook', ease((t - 0.35) / 0.7))
            return img
        # ---------------- colourways: straight cuts, one push each
        if t < 11.4:
            span = (11.4 - 5.2) / 4
            k = min(3, int((t - 5.2) / span))
            lt = (t - 5.2) - k * span
            img = zoom(plates[k], lt / span, 1.0, 1.03)
            img = finish(img, int(t * FPS))
            img = paste(img, 't_bar', 1.0)
            # name fades in quickly and stays (no motion, no bounce)
            img = paste(img, f't_c{k + 1}', 1.0)
            return img
        # ---------------- guarantee
        if t < 14.2:
            p = (t - 11.4) / 2.8
            img = zoom(plates[1], p, 1.0, 1.028)
            img = finish(img, int(t * FPS))
            img = paste(img, 't_bar', 1.0)
            img = paste(img, 't_guarantee', 1.0)
            return img
        # ---------------- five percent (calm pearl card, no product)
        if t < 17.1:
            p = (t - 14.2) / 2.9
            img = pearl_card(p)
            img = finish(img, int(t * FPS))
            # hard cut in, type already there (no fade-up = no flash)
            img = paste(img, 't_five', 1.0)
            return img
        # ---------------- cta + close
        p = (t - 17.1) / 2.9
        img = zoom(close_plate, p, 1.0, 1.02)
        img = finish(img, int(t * FPS))
        img = paste(img, 't_cta', 1.0)
        # last 0.9 s: type only, watch eases back a touch
        return img

    def render(i):
        t = i / FPS
        img = frame(t)
        # ---- transitions: 0.28 s cross-dissolve between the five scenes
        # hard cut INTO the pearl card (a dissolve there reads as a ghost flash)
        BOUNDS = [5.2, 11.4, 17.1]
        for b in BOUNDS:
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
