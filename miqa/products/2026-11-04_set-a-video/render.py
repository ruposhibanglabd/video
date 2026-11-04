#!/usr/bin/env python3
"""MIQA Set-A video v5: 'Lookbook Rail' — continuous smooth glide through 21 real designs.
Frames -> /tmp/vframes/f_%05d.jpg  (2160x3840 @30fps, 74.2s = 2226 frames)"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import os, math, time

W, H, FPS = 2160, 3840, 30
BASE = 'miqa/products/2026-11-04_set-a-video'
L = f'{BASE}/plates/layers'
P4 = f'{BASE}/plates4'
CL = 'miqa/video/set-a/assets/client'
OUT = '/tmp/vframes'
os.makedirs(OUT, exist_ok=True)

SCENES = [
    ('showcase', 0.0, 21.0), ('reveal', 21.0, 25.8), ('lock', 25.8, 31.8),
    ('water', 31.8, 37.0), ('color', 37.0, 42.0), ('replace', 42.0, 47.0),
    ('warranty', 47.0, 51.0), ('board', 51.0, 55.0), ('price', 55.0, 59.0),
    ('five', 59.0, 68.0), ('cta', 68.0, 74.2),
]
TOTAL = 74.2
FRAMES = int(TOTAL * FPS)
XFADE = 0.7
PER = 1.0  # seconds per design on the rail

def smooth(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)

print('loading assets...', flush=True)
ZH = 1.12
BW, BH = int(W * ZH), int(H * ZH)

def crop_frac(im, fr):
    if not fr: return im
    w, h = im.size
    return im.crop((int(fr[0]*w), int(fr[1]*h), int(fr[2]*w), int(fr[3]*h)))

def smart_bg(im, w, h, dim=0.78, contain=0.94):
    bg = im.resize((int(w*1.06), int(h*1.06)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(42))
    bg = bg.crop((int(w*0.03), int(h*0.03), int(w*0.03)+w, int(h*0.03)+h))
    bg = Image.eval(bg, lambda v: int(v*dim))
    s = min(w*contain/im.width, h*contain/im.height)
    fg = im.resize((int(im.width*s), int(im.height*s)), Image.LANCZOS)
    bg.paste(fg, ((w-fg.width)//2, (h-fg.height)//2))
    return bg

def photo_cover(path, fr=None):
    im = Image.open(path).convert('RGB')
    im = crop_frac(im, fr)
    s = max(BW/im.width, BH/im.height)
    im = im.resize((int(im.width*s+0.5), int(im.height*s+0.5)), Image.LANCZOS)
    x = (im.width-BW)//2; y = (im.height-BH)//2
    return im.crop((x, y, x+BW, y+BH))

def photo_smart(path, fr=None):
    im = Image.open(path).convert('RGB')
    im = crop_frac(im, fr)
    return smart_bg(im, BW, BH).crop((0, 0, BW, BH))

def warm_grade(im):
    a = np.asarray(im, np.float32)
    a = a * np.array([1.07, 1.00, 0.92], np.float32)
    a = np.clip(a * 0.97 + 8, 0, 255)
    return Image.fromarray(a.astype(np.uint8))

SLIDES = [
    (f'{P4}/r01.jpg', None), (f'{P4}/r02.jpg', None), (f'{P4}/r03.jpg', None),
    (f'{P4}/r04.jpg', None), (f'{P4}/r11.jpg', None),
    (f'{P4}/r12.jpg', None), (f'{P4}/r05.jpg', None), (f'{P4}/r13.jpg', None),
    (f'{P4}/r14.jpg', None), (f'{CL}/FIYOTA-PearlTank-MAIN.png', (0, 0, 1, 0.82)),
    (f'{P4}/r15.jpg', None),
    (f'{P4}/r08.jpg', None), (f'{P4}/r16.jpg', None), (f'{P4}/r17.jpg', None),
    (f'{P4}/r18.jpg', None),
    (f'{P4}/r06.jpg', None), (f'{P4}/r07.jpg', None), (f'{P4}/r19.jpg', None),
    (f'{P4}/r09.jpg', None), (f'{P4}/r10.jpg', None), (f'{P4}/r20.jpg', None),
]
slide_imgs = []
slide_thumbs = []
for p, fr in SLIDES:
    im = Image.open(p).convert('RGB')
    im = crop_frac(im, fr)
    if 'PearlTank' in p:
        im = warm_grade(im)
    slide_imgs.append(smart_bg(im, BW, BH))
    slide_thumbs.append(im)
print('slides loaded:', len(slide_imgs), flush=True)

plates = {
    'reveal': photo_cover(f'{P4}/r05.jpg'),
    'lock': None,
    'water': photo_cover(f'{P4}/r01.jpg'),
    'color': photo_smart(f'{P4}/r19.jpg', (0.10, 0.18, 0.90, 0.82)),
    'replace': photo_cover(f'{P4}/r06.jpg'),
    'warranty': photo_smart(f'{P4}/r03.jpg', (0.18, 0.10, 0.85, 0.72)),
}
lock_src = Image.open(f'{P4}/r07.jpg').convert('RGB')
w, h = lock_src.size
lock_src = lock_src.crop((int(0.12*w), int(0.30*h), int(0.92*w), int(0.95*h)))
plates['lock'] = smart_bg(lock_src, BW, BH).crop((0, 0, BW, BH))

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
    gl = np.exp(-(((xx - BW * 0.52) / (BW * 0.55)) ** 2 + ((yy - BH * 0.30) / (BH * 0.32)) ** 2))
    b = b + gl[..., None] * np.array([70, 42, 30], np.float32)
    d = (xx / BW * 0.72 + yy / BH * 0.28)
    band = np.exp(-((d - streak_pos) / 0.16) ** 2) * streak_str
    b = b + band[..., None] * np.array([120, 92, 48], np.float32)
    return Image.fromarray(np.clip(b, 0, 255).astype(np.uint8))

plates['price'] = velvet((36, 12, 22), (94, 26, 48), (150, 70, 95), 0.40, 0.6)
plates['cta'] = velvet((30, 10, 18), (88, 26, 46), (122, 42, 68), 0.55, 0.75)

def build_board():
    cols, rows = 7, 3
    tw, thh, gap = 280, 470, 14
    bw = cols*tw + (cols+1)*gap
    bh = rows*thh + (rows+1)*gap
    board = Image.new('RGB', (bw, bh), (246, 236, 233))
    d = ImageDraw.Draw(board)
    for i, im in enumerate(slide_thumbs):
        th = im.copy(); th.thumbnail((tw, thh), Image.LANCZOS)
        x = gap + (i % cols)*(tw+gap) + (tw-th.width)//2
        y = gap + (i // cols)*(thh+gap) + (thh-th.height)//2
        board.paste(th, (x, y))
        d.rectangle([gap + (i % cols)*(tw+gap), gap + (i // cols)*(thh+gap),
                     gap + (i % cols)*(tw+gap)+tw, gap + (i // cols)*(thh+gap)+thh],
                    outline=(216, 183, 121), width=2)
    canvas = plates['pearl'].copy()
    canvas.paste(board, ((W-bw)//2, 560))
    return canvas
plates['board'] = build_board()

def layer_np(name):
    im = Image.open(f'{L}/{name}.png').convert('RGBA')
    a = np.asarray(im)
    return a[..., :3].copy(), (a[..., 3].astype(np.float32) / 255.0)

LAYERS = {}
for nm in ['t_hook', 't_wordmark', 't_lock', 't_water', 't_color', 't_replace',
           't_warranty', 't_collection', 't_price', 't_5', 't_cta', 't_endcard', 't_drop']:
    LAYERS[nm] = layer_np(nm)

def layer_lbl(name):
    im = Image.open(f'{L}/{name}.png').convert('RGBA')
    a = np.asarray(im)[3100:3460]
    return a[..., :3].copy(), (a[..., 3].astype(np.float32) / 255.0)
SLIDE_LBL = [layer_lbl(f's_{i+1:02d}') for i in range(21)]
LBL_Y0 = 3100

rng = np.random.default_rng(11)
GRAIN = [rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32) for _ in range(3)]
r2 = np.sqrt(((xx[:H, :W] / W - 0.5) * 1.15) ** 2 + ((yy[:H, :W] / H - 0.5) * 1.0) ** 2)
VIG = (1.0 - 0.30 * np.clip(r2 - 0.42, 0, 1) ** 1.6).astype(np.float32)
ybinv = np.clip((np.arange(H) - 2500) / 400.0, 0, 1) * 0.28

sprite_r = 90
sy, sx = np.mgrid[-sprite_r:sprite_r, -sprite_r:sprite_r].astype(np.float32)
sprite = np.exp(-((sx**2 + sy**2) / (sprite_r*0.62)**2)).astype(np.float32) * 0.16

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

def comp_lbl(base_np, layer, alpha):
    if alpha <= 0.003:
        return
    rgb, am = layer
    m3 = (am * alpha)[..., None]
    reg = base_np[LBL_Y0:LBL_Y0 + am.shape[0]]
    reg *= (1 - m3)
    reg += rgb * m3

def lalpha(t, tin0, tin1, tout0, tout1):
    return smooth((t - tin0) / (tin1 - tin0)) * (1 - smooth((t - tout0) / (tout1 - tout0)))

# ---------------- Lookbook Rail engine ----------------
def rail_g(lp):
    """eased rail progress within one slot; velocity never zero (0.12 drift)."""
    return 0.12 * lp + 0.88 * smooth(lp)

FRAMES_CACHE = {}
def rail_frame(k):
    """full-frame render of design k at fixed slight overscan zoom, memoized (keep 3)."""
    if k not in FRAMES_CACHE:
        if len(FRAMES_CACHE) > 2:
            FRAMES_CACHE.pop(next(iter(FRAMES_CACHE)))
        FRAMES_CACHE[k] = np.asarray(zoomcrop(slide_imgs[k], 1.035), np.float32)
    return FRAMES_CACHE[k]

def render_showcase(t):
    if t < 20 * PER:
        s = t / PER
        idx = min(19, int(s))
        lp = s - idx
        cam = (idx + rail_g(lp)) * W
        speed = 0.12 + 0.88 * 6 * lp * (1 - lp)  # relative velocity 0.12..1.44
    else:
        idx = 20; lp = 1.0
        cam = 20 * W + 0.02 * W * smooth((t - 20 * PER) / (21.0 - 20 * PER))
        speed = 0.02
    base = np.zeros((H, W, 3), np.float32)
    for k in (idx, idx + 1):
        if k > 20: continue
        left = int(k * W - cam)
        x_s = max(0, left); x_e = min(W, left + W)
        if x_e <= x_s: continue
        img = rail_frame(k)
        base[:, x_s:x_e] = img[:, x_s - left:x_e - left]
    # silk motion blur during the fast part of each glide
    if 0.22 < lp < 0.78 and idx < 20 and speed > 0.6:
        rad = 1.2 + 3.2 * min(1.0, (speed - 0.6) / 0.84)
        blurred = np.asarray(Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).filter(
            ImageFilter.GaussianBlur(rad)), np.float32)
        wgt = smooth((lp - 0.22) / 0.2) * (1 - smooth((lp - 0.58) / 0.2))
        base = base * (1 - wgt) + blurred * wgt
    # labels synced to rail
    if idx < 20:
        comp_lbl(base, SLIDE_LBL[idx], 0.92 * (1 - smooth(lp)))
        comp_lbl(base, SLIDE_LBL[idx + 1], 0.92 * smooth(lp))
    else:
        comp_lbl(base, SLIDE_LBL[20], 0.92)
    # bokeh drift
    for k2 in range(6):
        bxp = int(((k2 * 331 + t * (18 + 9 * k2)) % (W + 400)) - 200)
        byp = int(H * (0.12 + 0.13 * ((k2 * 7 + 3) % 6)) - t * (12 + 6 * k2) % int(H * 0.8))
        y0 = max(0, byp - sprite_r); y1 = min(H, byp + sprite_r)
        x0 = max(0, bxp - sprite_r); x1 = min(W, bxp + sprite_r)
        if y1 <= y0 or x1 <= x0: continue
        sy0 = sprite_r - (byp - y0); sx0 = sprite_r - (bxp - x0)
        base[y0:y1, x0:x1] += sprite[sy0:sy0+(y1-y0), sx0:sx0+(x1-x0), None] * 255
    comp(base, LAYERS['t_hook'], lalpha(t, 0.25, 0.95, 6.5, 7.6))
    base *= smooth(t / 0.5)
    return base

def render_reveal(t):
    z = 1.0 + 0.055 * smooth(t / 4.8)
    px = -70 * smooth(t / 4.8)
    base = np.asarray(zoomcrop(plates['reveal'], z, px, 30 * smooth(t / 4.8)), np.float32)
    comp(base, LAYERS['t_wordmark'], lalpha(t, 0.8, 1.5, 3.6, 4.15))
    return base

def render_lock(t):
    z = 1.06 + 0.05 * smooth(t / 6.0)
    px = 80 * smooth(t / 6.0)
    base = np.asarray(zoomcrop(plates['lock'], z, px, -50 * smooth(t / 6.0)), np.float32)
    base *= 0.88
    base *= (1 - ybinv[:, None, None])
    comp(base, LAYERS['t_lock'], lalpha(t, 0.6, 1.3, 5.3, 5.85))
    return base

def render_water(t):
    z = 1.0 + 0.05 * smooth(t / 5.2)
    base = np.asarray(zoomcrop(plates['water'], z, -60 * smooth(t / 5.2), 0), np.float32)
    base *= (1 - ybinv[:, None, None] * 1.1)
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
    comp(base, LAYERS['t_water'], lalpha(t, 0.5, 1.2, 4.5, 5.05))
    return base

def render_color(t):
    z = 1.12 - 0.08 * smooth(t / 5.0)
    base = np.asarray(zoomcrop(plates['color'], z, 60 * smooth(t / 5.0), -40 * smooth(t / 5.0)), np.float32)
    base *= (1 - ybinv[:, None, None] * 1.1)
    comp(base, LAYERS['t_color'], lalpha(t, 0.5, 1.2, 4.35, 4.9))
    return base

def render_replace(t):
    z = 1.0 + 0.05 * smooth(t / 5.0)
    base = np.asarray(zoomcrop(plates['replace'], z, 60 * smooth(t / 5.0), 40 * smooth(t / 5.0)), np.float32)
    base *= (1 - ybinv[:, None, None] * 1.1)
    comp(base, LAYERS['t_replace'], lalpha(t, 0.5, 1.2, 4.35, 4.9))
    return base

def render_warranty(t):
    z = 1.0 + 0.045 * smooth(t / 4.0)
    base = np.asarray(zoomcrop(plates['warranty'], z, -50 * smooth(t / 4.0), 0), np.float32)
    base *= 0.88
    base *= (1 - ybinv[:, None, None])
    comp(base, LAYERS['t_warranty'], lalpha(t, 0.3, 0.95, 3.25, 3.75))
    return base

def render_board(t):
    z = 1.0 + 0.045 * smooth(t / 4.0)
    base = np.asarray(zoomcrop(plates['board'], z), np.float32)
    comp(base, LAYERS['t_collection'], lalpha(t, 0.25, 0.85, 3.35, 3.85))
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

RENDER = {'showcase': render_showcase, 'reveal': render_reveal, 'lock': render_lock, 'water': render_water,
          'color': render_color, 'replace': render_replace, 'warranty': render_warranty,
          'board': render_board, 'price': render_price, 'five': render_five, 'cta': render_cta}

SWEEPS = [('reveal', 1.2, 2.3), ('color', 1.2, 2.5), ('price', 0.7, 1.8)]
diag = ((np.mgrid[0:H, 0:W][0].astype(np.float32) / H + np.mgrid[0:H, 0:W][1].astype(np.float32) / W) / 2)

def finish(base, t, scene):
    for sc, t0, t1 in SWEEPS:
        if sc == scene and t0 <= t <= t1:
            p = (t - t0) / (t1 - t0)
            d = p * 1.6 - 0.3
            band = np.exp(-((diag - d) / 0.11) ** 2) * 0.18 * math.sin(math.pi * p) ** 0.8
            base += band[..., None] * 255
    base *= VIG[..., None]
    g2 = np.repeat(np.repeat(GRAIN[int(t * FPS) % 3], 2, axis=0), 2, axis=1)
    base += g2[..., None] * 2.0
    return np.clip(base, 0, 255).astype(np.uint8)

if os.environ.get('SMOKE'):
    tests = [('showcase', 0.4), ('showcase', 3.3), ('showcase', 6.7), ('showcase', 12.4), ('showcase', 20.5),
             ('reveal', 2.4), ('lock', 3.0), ('water', 2.6), ('color', 2.5), ('replace', 2.5),
             ('warranty', 2.0), ('board', 2.0), ('price', 2.0), ('five', 4.5), ('cta', 2.0), ('cta', 5.5)]
    for nm, lt in tests:
        fr = RENDER[nm](lt)
        Image.fromarray(finish(fr, lt, nm)).save(f'{OUT}/smoke_{nm}_{str(lt).replace(".","")}.jpg', quality=80)
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
