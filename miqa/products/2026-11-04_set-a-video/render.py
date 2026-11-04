#!/usr/bin/env python3
"""MIQA Set-A video v2 frame renderer: 2160x3840 @30fps, PIL+numpy.
Design-first hook, per-feature visuals, 12-variant collection glance.
Frames -> /tmp/vframes/f_%05d.jpg. Text layers from text_layers.mjs (Pango)."""
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
    ('hook', 0.0, 5.2), ('reveal', 5.2, 10.2), ('lock', 10.2, 16.0),
    ('water', 16.0, 21.2), ('color', 21.2, 26.2), ('replace', 26.2, 31.2),
    ('warranty', 31.2, 35.2), ('collection', 35.2, 41.4), ('price', 41.4, 45.2),
    ('five', 45.2, 54.2), ('cta', 54.2, 60.4),
]
TOTAL = 60.4
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

print('loading assets...', flush=True)
ZH = 1.12
BW, BH = int(W * ZH), int(H * ZH)

def photo(path):
    return cover(Image.open(path).convert('RGB'), BW, BH)

plates = {
    'macro': photo(f'{BASE}/plates2/base_macro.jpg'),
    'hero': photo(f'{BASE}/plates2/base_hero.jpg'),
    'wrist': photo(f'{BASE}/plates2/base_wrist.jpg'),
    'u_gold': photo(f'{BASE}/plates2/hero_u_gold.jpg'),
    'u_group': photo(f'{BASE}/plates2/hero_u_group.jpg'),
    'f_lock': photo(f'{BASE}/plates2/feat_lock.jpg'),
    'f_water': photo(f'{BASE}/plates2/feat_water.jpg'),
    'f_chain': photo(f'{BASE}/plates2/feat_chain.jpg'),
}
# pearl gradient plate
yy, xx = np.mgrid[0:BH, 0:BW].astype(np.float32)
t = (yy / BH * 0.7 + xx / BW * 0.3)
c0 = np.array([251, 244, 241], np.float32); c1 = np.array([241, 213, 222], np.float32)
g = (c0[None, None, :] * (1 - t[..., None]) + c1[None, None, :] * t[..., None])
glow = np.exp(-(((xx - BW * 0.5) / (BW * 0.55)) ** 2 + ((yy - BH * 0.22) / (BH * 0.30)) ** 2))
g = g + glow[..., None] * 10
plates['pearl'] = Image.fromarray(np.clip(g, 0, 255).astype(np.uint8))

def velvet(c_top, c_mid, c_bot, streak_pos=0.42, streak_str=0.55):
    v = (yy / BH).astype(np.float32)
    top = np.array(c_top, np.float32); mid = np.array(c_mid, np.float32); bot = np.array(c_bot, np.float32)
    b = np.where(v[..., None] < 0.5, top + (mid - top) * (v[..., None] / 0.5),
                 mid + (bot - mid) * ((v[..., None] - 0.5) / 0.5))
    glow = np.exp(-(((xx - BW * 0.52) / (BW * 0.55)) ** 2 + ((yy - BH * 0.30) / (BH * 0.32)) ** 2))
    b = b + glow[..., None] * np.array([70, 42, 30], np.float32)
    d = (xx / BW * 0.72 + yy / BH * 0.28)
    band = np.exp(-((d - streak_pos) / 0.16) ** 2) * streak_str
    b = b + band[..., None] * np.array([120, 92, 48], np.float32)
    d2 = (xx / BW * 0.72 + yy / BH * 0.28)
    band2 = np.exp(-((d2 - streak_pos - 0.30) / 0.10) ** 2) * streak_str * 0.5
    b = b + band2[..., None] * np.array([100, 70, 40], np.float32)
    return Image.fromarray(np.clip(b, 0, 255).astype(np.uint8))

plates['price'] = velvet((36, 12, 22), (94, 26, 48), (150, 70, 95), 0.40, 0.6)
plates['cta'] = velvet((30, 10, 18), (88, 26, 46), (122, 42, 68), 0.55, 0.75)

def layer_np(name):
    im = Image.open(f'{L}/{name}.png').convert('RGBA')
    a = np.asarray(im)
    return a[..., :3].copy(), (a[..., 3].astype(np.float32) / 255.0)

LAYERS = {}
for nm in ['t_hook', 't_wordmark', 't_lock', 't_water', 't_color', 't_replace',
           't_warranty', 't_collection', 't_price', 't_5', 't_cta', 't_endcard', 't_drop']:
    LAYERS[nm] = layer_np(nm)

# 12 collection renders
coll_imgs = [photo(f'{BASE}/plates2/{n}.jpg') for n in [
    'coll_u_gold', 'coll_u_silver', 'coll_u_tt',
    'coll_sq_gold', 'coll_sq_tt', 'coll_sq_silver',
    'coll_round_tt', 'coll_tank_black', 'coll_tank_pearl',
    'coll_tank_gold', 'coll_cushion_gold', 'coll_cutcorner_black']]

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
    if alpha <= 0.003:
        return
    rgb, am = layer
    m = am * alpha
    if dy:
        m = np.roll(m, int(dy), axis=0)
        rgb = np.roll(rgb, int(dy), axis=0)
    m3 = m[..., None]
    base_np *= (1 - m3)
    base_np += rgb * m3

def lalpha(t, tin0, tin1, tout0, tout1):
    return smooth((t - tin0) / (tin1 - tin0)) * (1 - smooth((t - tout0) / (tout1 - tout0)))

def blend_beat(imgs, ts, t, positions):
    """montage helper: list of (img, start, end) with dissolve over first 35% of each beat."""
    idx = 0
    for i, (im, t0, t1) in enumerate(positions):
        if t >= t0:
            idx = i
    im, t0, t1 = positions[idx]
    lp = (t - t0) / (t1 - t0)
    base = np.asarray(zoomcrop(im, 1.0 + 0.05 * smooth(lp)), np.float32)
    if idx > 0 and lp < 0.35:
        prev = np.asarray(zoomcrop(positions[idx - 1][0], 1.05), np.float32)
        wgt = smooth(lp / 0.35)
        base = prev * (1 - wgt) + base * wgt
    return base

# ---------- scene renderers ----------
def render_hook(t):
    beats = [(plates['u_gold'], 0.0, 2.2), (plates['hero'], 2.2, 3.8), (plates['u_group'], 3.8, 5.2)]
    base = blend_beat(None, None, t, beats)
    comp(base, LAYERS['t_hook'], lalpha(t, 0.45, 1.15, 4.35, 4.9), dy=int(26 * (1 - smooth((t - 0.45) / 0.7))))
    return base

def render_reveal(t):
    z = 1.0 + 0.055 * smooth(t / 5)
    base = np.asarray(zoomcrop(plates['u_group'], z), np.float32)
    comp(base, LAYERS['t_wordmark'], lalpha(t, 1.15, 1.85, 4.05, 4.6))
    return base

def render_lock(t):
    z = 1.0 + 0.05 * smooth(t / 5.8)
    base = np.asarray(zoomcrop(plates['f_lock'], z), np.float32)
    comp(base, LAYERS['t_lock'], lalpha(t, 0.7, 1.4, 5.2, 5.7))
    return base

def render_water(t):
    z = 1.0 + 0.05 * smooth(t / 5.2)
    base = np.asarray(zoomcrop(plates['f_water'], z), np.float32)
    drops = [(300, 0.2, 150), (1650, 0.7, 120), (760, 1.5, 180), (1350, 2.2, 130), (520, 3.0, 160), (1750, 3.6, 140)]
    d_rgb, d_am = LAYERS['t_drop']
    for x0, t0, sz in drops:
        if t < t0: continue
        lp = min(1.0, (t - t0) / 1.6)
        y0 = int(-200 + lp * (H * 0.72))
        s = sz
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
    z = 1.0 + 0.06 * smooth(t / 5.0)
    base = np.asarray(zoomcrop(plates['f_chain'], z, py=120 * smooth(t / 5.0)), np.float32)
    comp(base, LAYERS['t_color'], lalpha(t, 0.5, 1.2, 4.35, 4.9))
    return base

def render_replace(t):
    z = 1.0 + 0.05 * smooth(t / 5.0)
    base = np.asarray(zoomcrop(plates['wrist'], z), np.float32)
    comp(base, LAYERS['t_replace'], lalpha(t, 0.55, 1.25, 4.35, 4.9))
    return base

def render_warranty(t):
    z = 1.0 + 0.04 * smooth(t / 4.0)
    base = np.asarray(zoomcrop(plates['macro'], z), np.float32)
    base *= 0.85
    comp(base, LAYERS['t_warranty'], lalpha(t, 0.35, 1.0, 3.35, 3.85))
    return base

def render_collection(t):
    seg = 6.2 / 12
    positions = [(im, i * seg, (i + 1) * seg) for i, im in enumerate(coll_imgs)]
    base = blend_beat(None, None, t, positions)
    # bottom scrim for text legibility
    yb = np.clip((np.arange(H) - 2500) / 400.0, 0, 1) * 0.30
    base *= (1 - yb[:, None, None])
    comp(base, LAYERS['t_collection'], lalpha(t, 0.3, 0.9, 5.55, 6.1))
    return base

def render_price(t):
    z = 1.0 + 0.045 * smooth(t / 3.8)
    base = np.asarray(zoomcrop(plates['price'], z), np.float32)
    comp(base, LAYERS['t_price'], lalpha(t, 0.35, 1.0, 3.15, 3.65), dy=int(20 * (1 - smooth((t - 0.35) / 0.7))))
    return base

def render_five(t):
    base = np.asarray(zoomcrop(plates['pearl'], 1.0), np.float32)
    comp(base, LAYERS['t_5'], lalpha(t, 0.35, 1.0, 8.15, 8.75))
    return base

def render_cta(t):
    z = 1.0 + 0.05 * smooth(t / 6.2)
    base = np.asarray(zoomcrop(plates['cta'], z), np.float32)
    comp(base, LAYERS['t_cta'], lalpha(t, 0.3, 1.0, 3.15, 3.6))
    comp(base, LAYERS['t_endcard'], lalpha(t, 3.4, 3.95, 100, 101))
    return base

RENDER = {'hook': render_hook, 'reveal': render_reveal, 'lock': render_lock, 'water': render_water,
          'color': render_color, 'replace': render_replace, 'warranty': render_warranty,
          'collection': render_collection, 'price': render_price, 'five': render_five, 'cta': render_cta}

SWEEPS = [('hook', 1.0, 2.0), ('reveal', 2.2, 3.3), ('color', 1.2, 2.5), ('price', 0.7, 1.8)]
diag = ((np.mgrid[0:H, 0:W][0].astype(np.float32) / H + np.mgrid[0:H, 0:W][1].astype(np.float32) / W) / 2)

def finish(base, t, scene):
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
        Image.fromarray(finish(fr, lt, nm)).save(f'{OUT}/smoke_{nm}.jpg', quality=80)
    print('SMOKE DONE', flush=True)
    raise SystemExit

F0 = int(os.environ.get('STARTF', 0)); F1 = int(os.environ.get('ENDF', FRAMES))
print(f'rendering frames {F0}-{F1} of {FRAMES}...', flush=True)
t_start = time.time()
for f in range(F0, F1):
    t = f / FPS
    active = []
    for i, (nm, t0, t1) in enumerate(SCENES):
        if t0 - XFADE <= t <= t1 + 0.001:
            w = 1.0
            if t < t0:
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
    if f % 60 == 0 or f == F1 - 1:
        el = time.time() - t_start
        eta = el / (f - F0 + 1) * (F1 - f - 1)
        print(f'frame {f}/{F1} elapsed {el:.0f}s eta {eta:.0f}s', flush=True)
print('RENDER DONE', flush=True)
