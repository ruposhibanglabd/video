#!/usr/bin/env python3
"""Set C — Facebook post: all five watches in one frame, 1080×1350."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

BASE = 'miqa/products/2026-11-05_set-c-video'
CUT = f'{BASE}/work/cut'
TEXT = f'{BASE}/plates/facebook_text.png'
OUT = 'miqa/deliveries/2026-11-05_set-c-video'
W, H = 1080, 1350

SLUGS = ['01_fiyota-octagon-black', '02_fiyota-octagon-pink',
         '03_trueworth-heart-black', '04_fiyota-octagon-green',
         '05_fiyota-octagon-white']
XS = [150, 345, 540, 735, 930]
HEAD_Y = 560
HEAD_W = 185


def gradient():
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    top = np.array([255, 247, 243], np.float32)
    bot = np.array([244, 201, 214], np.float32)
    arr = top[None, None, :] * (1 - yy[..., None]) + bot[None, None, :] * yy[..., None]
    yy2 = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
    r2 = ((xx - 0.5) / 0.55) ** 2 + ((yy2 - 0.38) / 0.42) ** 2
    arr = arr + np.exp(-r2 * 2.4)[..., None] * np.array([255, 252, 248], np.float32) * 0.55
    r2b = ((xx - 0.5) / 0.62) ** 2 + ((yy2 - 0.92) / 0.30) ** 2
    arr = arr + np.exp(-r2b * 2.8)[..., None] * np.array([255, 228, 214], np.float32) * 0.22
    # vignette
    vig = np.clip(1.0 - 0.30 * (((xx - 0.5) / 0.62) ** 2 + ((yy2 - 0.48) / 0.62) ** 2), 0, 1)
    arr = arr * vig[..., None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB').convert('RGBA')


def bokeh():
    im = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(im)
    rng = np.random.default_rng(5)
    for _ in range(26):
        x = rng.uniform(0, W); y = rng.uniform(0, H)
        r = rng.uniform(18, 90)
        a = int(rng.uniform(6, 26))
        d.ellipse([x - r, y - r, x + r, y + r], fill=a)
    im = im.filter(ImageFilter.GaussianBlur(18))
    a = np.asarray(im, np.float32) / 255.0
    col = np.array([255, 238, 220], np.float32)
    layer = (a[..., None] * col).astype(np.uint8)
    return Image.fromarray(np.dstack([layer, (a * 255).astype(np.uint8)]), 'RGBA')


def arch():
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # quadratic bezier from (70,780) via (540,250) to (1010,780)
    pts = []
    for i in range(101):
        t = i / 100
        x = (1 - t) ** 2 * 70 + 2 * (1 - t) * t * 540 + t ** 2 * 1010
        y = (1 - t) ** 2 * 780 + 2 * (1 - t) * t * 250 + t ** 2 * 780
        pts.append((x, y))
    d.line(pts, fill=(184, 146, 90, 70), width=2, joint='curve')
    glow = im.filter(ImageFilter.GaussianBlur(6))
    im = Image.alpha_composite(glow, im)
    return im


def place_watch(base, idx):
    im = Image.open(f'{CUT}/{SLUGS[idx]}_trim.png').convert('RGBA')
    a = np.asarray(im)[:, :, 3]
    widths = (a > 40).sum(1)
    h = im.height
    head_row = int(np.argmax(widths[:int(h * 0.85)]))
    head_w = int(widths[head_row])
    xs = np.where(a[head_row] > 40)[0]
    head_cx = int((xs.min() + xs.max()) / 2)
    s = HEAD_W / head_w
    nw, nh = max(1, int(im.width * s)), max(1, int(im.height * s))
    im = im.resize((nw, nh), Image.LANCZOS)
    # fade the bracelet into the background
    fade_start = int(nh * 0.62)
    alpha = np.asarray(im)[:, :, 3].astype(np.float32)
    yy = np.arange(nh, dtype=np.float32)[:, None]
    f = np.clip((yy - fade_start) / max(1, nh - fade_start), 0, 1)
    alpha = alpha * (1 - f * 0.96)
    a2 = np.asarray(im).copy()
    a2[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)
    im = Image.fromarray(a2, 'RGBA')
    hx = head_cx * s
    hy = head_row * s
    px = int(round(XS[idx] - hx))
    py = int(round(HEAD_Y - hy))
    # shadow
    sh = Image.new('RGBA', im.size, (60, 20, 34, 0))
    sh.putalpha(im.getchannel('A').filter(ImageFilter.GaussianBlur(16)).point(lambda v: int(v * 0.35)))
    base.alpha_composite(sh, (px + 8, py + 14))
    base.alpha_composite(im, (px, py))


def main():
    os.makedirs(OUT, exist_ok=True)
    bg = gradient()
    bg.alpha_composite(bokeh())
    bg.alpha_composite(arch())
    for i in range(5):
        place_watch(bg, i)
    # gold frame
    d = ImageDraw.Draw(bg)
    d.rectangle([24, 24, W - 25, H - 25], outline=(184, 146, 90, 120), width=2)
    d.rectangle([32, 32, W - 33, H - 33], outline=(184, 146, 90, 60), width=1)
    # grain
    rng = np.random.default_rng(9)
    g = rng.normal(0, 2.0, (H, W)).astype(np.float32)
    arr = np.asarray(bg.convert('RGB'), np.float32) + g[..., None]
    bg = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB').convert('RGBA')
    # text
    txt = Image.open(TEXT).convert('RGBA')
    bg.alpha_composite(txt)
    out = bg.convert('RGB')
    p = f'{OUT}/facebook-post_1080x1350.jpg'
    out.save(p, quality=95, subsampling=0)
    print(p, round(os.path.getsize(p) / 1024), 'KB')
    # square 1080 version for feed
    sq = out.resize((1080, 1080), Image.LANCZOS)
    p2 = f'{OUT}/facebook-post_1080x1080.jpg'
    sq.save(p2, quality=95, subsampling=0)
    print(p2, round(os.path.getsize(p2) / 1024), 'KB')


if __name__ == '__main__':
    main()
