#!/usr/bin/env python3
"""MIQA Set-A video frame renderer: 2160x3840 @30fps, PIL+numpy.
Frames -> /tmp/vframes/f_%05d.jpg. Text layers come from text_layers.mjs (Pango)."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import os, math, time

W, H, FPS = 2160, 3840, 30
BASE = 'miqa/products/2026-11-04_set-a-video'
L = f'{BASE}/plates/layers'
CL = 'miqa/video/set-a/assets/client'
OUT = '/tmp/vframes'
os.makedirs(OUT, exist_ok=True)

SCENES = [
    ('hook', 0.0, 5.0), ('reveal', 5.0, 10.0), ('lock', 10.0, 16.0),
    ('water', 16.0, 21.2), ('color', 21.2, 26.4), ('replace', 26.4, 31.6),
    ('warranty', 31.6, 35.8), ('collection', 35.8, 39.6), ('price', 39.6, 43.6),
    ('five', 43.6, 47.8), ('cta', 47.8, 55.3),
]
TOTAL = 55.3
FRAMES = int(TOTAL * FPS)
XFADE = 0.5

def smooth(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)

def cover(img, w, h):
    s = max(w / img.width, h / img.height)
    im = img.resize((int(img.width * s + 0.5), int(img.height * s + 0.5)), Image.LANCZOS)
    x = (im.width - w) // 2; y = (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

# ---------- load assets ----------
print('loading assets...', flush=True)
ZH = 1.12
BW, BH = int(W * ZH), int(H * ZH)

def photo(path):
    return cover(Image.open(path).convert('RGB'), BW, BH)

plates = {
    'macro': photo(f'{BASE}/plates/macro_dial.jpg'),
    'hero': photo(f'{BASE}/plates/hero_square.jpg'),
    'wrist': photo(f'{BASE}/plates/wrist_life.jpg'),
    'price': photo(f'{BASE}/plates/plate_price.jpg'),
    'cta': photo(f'{BASE}/plates/plate_cta.jpg'),
}
# pearl gradient plate
yy, xx = np.mgrid[0:BH, 0:BW].astype(np.float32)
t = (yy / BH * 0.7 + xx / BW * 0.3)
c0 = np.array([251, 244, 241], np.float32); c1 = np.array([241, 213, 222], np.float32)
g = (c0[None, None, :] * (1 - t[..., None]) + c1[None, None, :] * t[..., None])
glow = np.exp(-(((xx - BW * 0.5) / (BW * 0.55)) ** 2 + ((yy - BH * 0.22) / (BH * 0.30)) ** 2))
g = g + glow[..., None] * 10
plates['pearl'] = Image.fromarray(np.clip(g, 0, 255).astype(np.uint8))

def layer_np(name):
    im = Image.open(f'{L}/{name}.png').convert('RGBA')
    a = np.asarray(im)
    return a[..., :3].copy(), (a[..., 3].astype(np.float32) / 255.0)

LAYERS = {}
for nm in ['t_hook', 't_wordmark', 't_lock', 't_water', 't_color', 't_replace',
           't_warranty', 't_collection', 't_price', 't_5', 't_cta', 't_endcard', 't_drop']:
    LAYERS[nm] = layer_np(nm)

# lock card + replace card (rounded, shadowed) built once
def rounded_card(img, cw, ch, radius=48):
    im = cover(img, cw, ch)
    mask = Image.new('L', (cw, ch), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, cw, ch], radius=radius, fill=255)
    card = Image.new('RGBA', (cw + 160, ch + 160), (0, 0, 0, 0))
    sh = Image.new('RGBA', (cw, ch), (42, 20, 28, 110))
    card.paste(sh, (80, 110), mask.filter(ImageFilter.GaussianBlur(28)))
    card.paste(im, (80, 60), mask)
    return card

lock_card = rounded_card(Image.open('miqa/brand/feature-insets/butterfly-lock.webp').convert('RGB').crop((30, 240, 994, 784)), 1240, 1240)
repl_card = rounded_card(Image.open(f'{CL}/01-main.png').convert('RGB'), 1320, 1500)

# collection photos
coll_imgs = [photo(f'{CL}/{p}') for p in [
    'FIYOTA-CrystalGold-MAIN.png', 'FIYOTA-NoirTwoTone-MAIN.png',
    'FIYOTA-TwoTone-MAIN.png', 'FIYOTA-Gold-MAIN.png',
    'FIYOTA-PearlTank-MAIN.png', 'FIYOTA-SilverSquare-MAIN.png']]

# grain + vignette
rng = np.random.default_rng(11)
GRAIN = [rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32) for _ in range(3)]
r2 = np.sqrt(((xx[:H, :W] / W - 0.5) * 1.15) ** 2 + ((yy[:H, :W] / H - 0.5) * 1.0) ** 2)
VIG = (1.0 - 0.30 * np.clip(r2 - 0.42, 0, 1) ** 1.6).astype(np.float32)

def zoomcrop(src, z, px=0.0, py=0.0):
    ww = int(BW / z); hh = int(BH / z)
    cx = BW / 2 + px; cy = BH / 2 + py
    x0 = int(min(max(0, cx - ww / 2), BW - ww)); y0 = int(min(max(0, cy - hh / 2), BH - hh))
    return src.crop((x0, y0, x0 + ww, y0 + hh)).resize((W, H), Image.BILINEAR)

def comp(base_np, layer, alpha, dy=0):
    """composite RGBA layer (rgb, alphaMap) onto float32 base with global alpha."""
    if alpha <= 0.003:
        return
    rgb, am = layer
    m = am * alpha
    if dy:
        m = np.roll(m, int(dy), axis=0)
        rgb2 = np.roll(rgb, int(dy), axis=0)
    else:
        rgb2 = rgb
    m3 = m[..., None]
    base_np *= (1 - m3)
    base_np += rgb2 * m3

def lalpha(t, tin0, tin1, tout0, tout1):
    return smooth((t - tin0) / (tin1 - tin0)) * (1 - smooth((t - tout0) / (tout1 - tout0)))

# scene renderers: each returns float32 (H,W,3) in 0..255
def render_hook(t):
    z = 1.10 - 0.10 * smooth(t / 4.6)
    base = np.asarray(zoomcrop(plates['macro'], z, py=-40 * (1 - t / 5)), np.float32)
    comp(base, LAYERS['t_hook'], lalpha(t, 0.45, 1.15, 4.25, 4.8), dy=int(26 * (1 - smooth((t - 0.45) / 0.7))))
    return base

def render_reveal(t):
    z = 1.0 + 0.055 * smooth(t / 5)
    base = np.asarray(zoomcrop(plates['hero'], z), np.float32)
    comp(base, LAYERS['t_wordmark'], lalpha(t, 1.15, 1.85, 4.05, 4.6))
    return base

def render_lock(t):
    base = np.asarray(zoomcrop(plates['pearl'], 1.0), np.float32)
    if t > 0.25:
        a = smooth((t - 0.25) / 0.8)
        w2, h2 = lock_card.size
        x = (W - w2) // 2; y = 220 - int(18 * (1 - a))
        crop = lock_card.crop((0, 0, w2, h2))
        rgb = np.asarray(crop.convert('RGB'), np.float32)
        am = np.asarray(crop.split()[3], np.float32) / 255.0 * a
        x0 = max(0, x); y0 = max(0, y)
        rgb2 = rgb[: H - y0, : W - x0]; am2 = am[: H - y0, : W - x0]
        reg = base[y0:y0 + am2.shape[0], x0:x0 + am2.shape[1]]
        m3 = am2[..., None]
        reg *= (1 - m3); reg += rgb2 * m3
    comp(base, LAYERS['t_lock'], lalpha(t, 0.7, 1.4, 5.2, 5.7))
    return base

def render_water(t):
    z = 1.0 + 0.05 * smooth(t / 5.2)
    base = np.asarray(zoomcrop(plates['wrist'], z, py=30 * smooth(t / 5.2)), np.float32)
    # falling droplets
    drops = [(300, 0.2, 150), (1650, 0.7, 120), (760, 1.5, 180), (1350, 2.2, 130), (520, 3.0, 160), (1750, 3.6, 140)]
    d_rgb, d_am = LAYERS['t_drop']
    for x0, t0, sz in drops:
        if t < t0: continue
        lp = min(1.0, (t - t0) / 1.6)
        y0 = int(-200 + lp * (H * 0.72))
        s = sz
        # scaled drop
        im = Image.fromarray(np.dstack([d_rgb, (d_am * 255).astype(np.uint8)])).resize((s, s), Image.BILINEAR)
        arr = np.asarray(im, np.float32)
        a = arr[..., 3] / 255.0 * 0.75
        rgb2 = arr[..., :3]
        yy0 = max(0, y0); xx0 = x0
        hh = min(s, H - yy0); ww = min(s, W - xx0)
        if hh <= 0 or ww <= 0: continue
        reg = base[yy0:yy0 + hh, xx0:xx0 + ww]
        m3 = a[:hh, :ww, None]
        reg *= (1 - m3); reg += rgb2[:hh, :ww] * m3
    comp(base, LAYERS['t_water'], lalpha(t, 0.55, 1.25, 4.5, 5.05))
    return base

def render_color(t):
    z = 1.16 - 0.14 * smooth(t / 5.2)
    base = np.asarray(zoomcrop(plates['hero'], z, py=430), np.float32)
    comp(base, LAYERS['t_color'], lalpha(t, 0.5, 1.2, 4.55, 5.1))
    return base

def render_replace(t):
    base = np.asarray(zoomcrop(plates['pearl'], 1.0), np.float32)
    a = smooth((t - 0.2) / 0.8)
    w2, h2 = repl_card.size
    x = (W - w2) // 2; y = 300
    rgb = np.asarray(repl_card.convert('RGB'), np.float32)
    am = np.asarray(repl_card.split()[3], np.float32) / 255.0 * a
    reg = base[y:y + h2, x:x + w2]
    m3 = am[..., None]
    reg *= (1 - m3); reg += rgb * m3
    comp(base, LAYERS['t_replace'], lalpha(t, 0.75, 1.45, 5.15, 5.7))
    return base

def render_warranty(t):
    z = 1.0 + 0.04 * smooth(t / 4.2)
    base = np.asarray(zoomcrop(plates['macro'], z), np.float32)
    base *= 0.85  # dim for text legibility
    comp(base, LAYERS['t_warranty'], lalpha(t, 0.35, 1.0, 3.55, 4.05))
    return base

def render_collection(t):
    seg = 3.8 / 6
    idx = min(5, int(t / seg))
    lp = (t - idx * seg) / seg
    base = np.asarray(zoomcrop(coll_imgs[idx], 1.0 + 0.05 * smooth(lp)), np.float32)
    if idx > 0 and lp < 0.4:  # dissolve from previous
        prev = np.asarray(zoomcrop(coll_imgs[idx - 1], 1.05), np.float32)
        wgt = smooth(lp / 0.4)
        base = prev * (1 - wgt) + base * wgt
    comp(base, LAYERS['t_collection'], lalpha(t, 0.25, 0.8, 3.35, 3.78))
    return base

def render_price(t):
    z = 1.0 + 0.045 * smooth(t / 4.0)
    base = np.asarray(zoomcrop(plates['price'], z), np.float32)
    comp(base, LAYERS['t_price'], lalpha(t, 0.35, 1.0, 3.35, 3.85), dy=int(20 * (1 - smooth((t - 0.35) / 0.7))))
    return base

def render_five(t):
    base = np.asarray(zoomcrop(plates['pearl'], 1.0), np.float32)
    comp(base, LAYERS['t_5'], lalpha(t, 0.35, 1.0, 3.6, 4.1))
    return base

def render_cta(t):
    z = 1.0 + 0.05 * smooth(t / 7.5)
    base = np.asarray(zoomcrop(plates['cta'], z), np.float32)
    comp(base, LAYERS['t_cta'], lalpha(t, 0.3, 1.0, 3.35, 3.75))
    comp(base, LAYERS['t_endcard'], lalpha(t, 3.55, 4.15, 100, 101))
    return base

RENDER = {'hook': render_hook, 'reveal': render_reveal, 'lock': render_lock, 'water': render_water,
          'color': render_color, 'replace': render_replace, 'warranty': render_warranty,
          'collection': render_collection, 'price': render_price, 'five': render_five, 'cta': render_cta}

# sweep events (scene, t0, t1)
SWEEPS = [('hook', 1.0, 2.2), ('reveal', 2.2, 3.3), ('color', 1.4, 2.7), ('price', 0.7, 1.8)]

def sweep_add(base, t):
    for sc, t0, t1 in SWEEPS:
        pass  # replaced below

diag = ((np.mgrid[0:H, 0:W][0].astype(np.float32) / H + np.mgrid[0:H, 0:W][1].astype(np.float32) / W) / 2)

def finish(base, t, scene):
    # sweep
    for sc, t0, t1 in SWEEPS:
        if sc == scene and t0 <= t <= t1:
            p = (t - t0) / (t1 - t0)
            d = p * 1.6 - 0.3
            band = np.exp(-((diag - d) / 0.11) ** 2) * 0.20 * math.sin(math.pi * p) ** 0.8
            base += band[..., None] * 255
    base *= VIG[..., None]
    g = GRAIN[int(t * FPS) % 3]
    g2 = np.repeat(np.repeat(g, 2, axis=0), 2, axis=1)
    base += g2[..., None] * 2.2
    return np.clip(base, 0, 255).astype(np.uint8)

if os.environ.get('SMOKE'):
    for nm, t0, t1 in SCENES:
        lt = (t1 - t0) / 2
        fr = RENDER[nm](lt)
        Image.fromarray(finish(fr, lt, nm)).save(f'/tmp/vframes/smoke_{nm}.jpg', quality=80)
    print('SMOKE DONE', flush=True)
    raise SystemExit

if os.environ.get('SMOKE'):
    for nm, t0, t1 in SCENES:
        lt = (t1 - t0) / 2
        fr = RENDER[nm](lt)
        Image.fromarray(finish(fr, lt, nm)).save(f'/tmp/vframes/smoke_{nm}.jpg', quality=80)
    print('SMOKE DONE', flush=True)
    raise SystemExit

print(f'rendering {FRAMES} frames...', flush=True)
t_start = time.time()
F0 = int(os.environ.get('STARTF', 0)); F1 = int(os.environ.get('ENDF', FRAMES))
for f in range(F0, F1):
    t = f / FPS
    # active scenes with xfade weights
    active = []
    for i, (nm, t0, t1) in enumerate(SCENES):
        if t0 - XFADE <= t <= t1 + 0.001:
            w = 1.0
            if t < t0:  # fading in over prev scene's tail
                w = smooth((t - (t0 - XFADE)) / XFADE)
            if t > t1 - XFADE and i < len(SCENES) - 1:
                w = min(w, smooth((t1 - t) / XFADE))
            if w > 0.001:
                active.append((nm, w, max(0.0, t - t0)))
    acc = None; wsum = 0.0
    for nm, w, lt in active:
        fr = RENDER[nm](lt)
        if acc is None:
            acc = fr * w
        else:
            acc += fr * w
        wsum += w
    acc /= wsum
    img = finish(acc, t, active[0][0])
    Image.fromarray(img).save(f'{OUT}/f_{f:05d}.jpg', quality=87, subsampling=1)
    if f % 30 == 0 or f == F1 - 1:
        el = time.time() - t_start
        eta = el / (f + 1) * (FRAMES - f - 1)
        print(f'frame {f}/{FRAMES} elapsed {el:.0f}s eta {eta:.0f}s', flush=True)
print('RENDER DONE', flush=True)
