#!/usr/bin/env python3
"""Set B "Petal Light" renderer — 2160x3840 @30fps frames.

Plates: cream-marble vanity envs (AI, defocused) + real client watch photos,
feathered together, warm golden-hour graded.  Text is pre-rendered by
text_layers.mjs (Skia/Pango) and composited with fade + drift.

Usage:  python render.py [--test 0,240,700]  [--out /tmp/vframes]
"""
import json, os, sys, math, argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H, FPS = 2160, 3840, 30
BASE = 'miqa/products/2026-11-05_set-b-video'
WORK = f'{BASE}/work'
LAY = f'{BASE}/plates/layers'
PL = f'{BASE}/plates'
ART = 'miqa/deliveries/2026-11-05_set-b'
COLORS = [('01_fiyota-floral-black', 'fiyota-floral-black'),
          ('02_fiyota-floral-blue', 'fiyota-floral-blue'),
          ('03_fiyota-floral-white', 'fiyota-floral-white'),
          ('04_fiyota-floral-green', 'fiyota-floral-green')]
ENVS = [f'{PL}/env_vanity.jpg', f'{PL}/env_petals.jpg', f'{PL}/env_curtain.jpg']

ZF = 1.14                      # plate oversample for zoom headroom
PW, PH = int(W * ZF), int(H * ZF)


def smooth(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def ease_io(x):
    x = min(1.0, max(0.0, x))
    return 0.5 - 0.5 * math.cos(math.pi * x)


def load_rgb(p):
    return Image.open(p).convert('RGB')


def cover(im, w, h):
    s = max(w / im.width, h / im.height)
    im = im.resize((max(1, int(im.width * s + .5)), max(1, int(im.height * s + .5))), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def warm(im, k=1.0):
    a = np.asarray(im, np.float32)
    a *= np.array([1.055, 1.005, 0.915], np.float32) * k
    a = (a - 4) * 1.015 + 6
    # shadows stay rosewood-warm: lift red slightly, keep blue down
    a += np.clip(70.0 - a.mean(axis=2, keepdims=True), 0, 70) * 0.0
    a[..., 0] += 2.0
    a[..., 2] -= 1.5
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def vignette_mask():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 * 0.85 + ((yy - H / 2) / (H / 2)) ** 2)
    v = 1.0 - 0.30 * np.clip((r - 0.55) / 0.85, 0, 1) ** 1.7
    return v[..., None].astype(np.float32)


VIG = None
GRAIN = [np.random.default_rng(i).normal(0, 2.4, (H // 2, W // 2)).astype(np.float32) for i in range(6)]


def finish(arr, gid=0):
    """vignette + grain + light bloom on a float array HxWx3 (0-255)."""
    global VIG
    if VIG is None:
        VIG = vignette_mask()
    a = arr * VIG
    g = GRAIN[gid % len(GRAIN)]
    a += np.repeat(np.repeat(g, 2, 0), 2, 1)[..., None]
    return a


# ------------------------------------------------------------------ plates
ENV_FOR = {'dial': ENVS[0], 'wrist': ENVS[1], 'bracelet': ENVS[2]}


def smart_plate(path, contain=1.0, ramp=520, blur_bg=64, zoom=1.0, valign=0.5, kind='dial'):
    """Full-width plate: the real photo (sharp, untouched) blended into a
    blurred copy of itself with a long vertical ramp, so the flat blush
    backdrop dissolves into the frame with no seam."""
    im = load_rgb(path)
    bg = cover(load_rgb(ENV_FOR.get(kind, ENVS[0])), PW, PH)
    bg = bg.filter(ImageFilter.GaussianBlur(14))
    s = contain * (PW / im.width) * zoom
    fg = im.resize((max(1, int(im.width * s + .5)), max(1, int(im.height * s + .5))), Image.LANCZOS)
    if fg.height > PH:                      # never exceed frame height (keeps aspect)
        s2 = PH / fg.height
        fg = fg.resize((max(1, int(fg.width * s2)), PH), Image.LANCZOS)
    if fg.width < PW:                       # widen to full frame width, aspect kept
        s3 = PW / fg.width
        fg = fg.resize((PW, max(1, int(fg.height * s3))), Image.LANCZOS)
        if fg.height > PH:
            s4 = PH / fg.height
            fg = fg.resize((int(fg.width * s4), PH), Image.LANCZOS)
    # alpha: 1 in the middle, ramping to 0 over `ramp` px at both ends
    mw, mh = fg.size
    m = np.ones((mh, mw), np.float32)
    r = min(ramp, mh // 2)
    yy = np.arange(mh, dtype=np.float32)
    up = np.clip(yy / r, 0, 1)
    dn = np.clip((mh - 1 - yy) / r, 0, 1)
    m *= np.minimum(up, dn)[:, None]
    m = m ** 1.4
    mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(60))
    y0 = int((PH - mh) * valign)
    y0 = max(0, min(PH - mh, y0))
    out = bg.copy()
    out.paste(fg, (0, y0), mask)
    return out


def env_overlay(base, env_path, amount=0.55, feather_y=0.34):
    """Bokeh florals from the vanity plates, masked to the top/bottom thirds."""
    env = cover(load_rgb(env_path), PW, PH)
    env = env.filter(ImageFilter.GaussianBlur(6))
    yy = np.linspace(0, 1, PH, dtype=np.float32)[:, None, None]
    band = np.clip((np.abs(yy - 0.5) - (0.5 - feather_y)) / feather_y, 0, 1) ** 1.5
    a = np.asarray(base, np.float32)
    e = np.asarray(env, np.float32)
    a = a * (1 - band * amount) + e * (band * amount)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def build_plate(ci, kind, path=None, contain=1.0, zoom=1.0, valign=0.5):
    folder, stem = COLORS[ci]
    if path is None:
        path = (f'{ART}/{folder}/website-images/{stem}_03_dial-closeup.jpg' if kind == 'dial'
                else f'{ART}/{folder}/website-images/{stem}_02_on-wrist.jpg' if kind == 'wrist'
                else f'{ART}/{folder}/website-images/{stem}_04_bracelet-closeup.jpg')
    p = smart_plate(path, contain=contain, zoom=zoom, valign=valign, kind=kind)
    if kind == 'dial':
        p = env_overlay(p, ENVS[0], 0.34, 0.26)
    elif kind == 'wrist':
        p = env_overlay(p, ENVS[1], 0.30, 0.26)
    else:
        p = env_overlay(p, ENVS[1], 0.36, 0.26)
    p = warm(p, 1.0)
    # warm light pool so the product reads against the field
    yy = np.linspace(0, 1, PH, dtype=np.float32)[:, None, None]
    xx = np.linspace(0, 1, PW, dtype=np.float32)[None, :, None]
    e = np.asarray(p, np.float32)
    e *= (1.05 - 0.16 * yy ** 1.5)
    pool = np.exp(-(((xx - 0.5) / 0.46) ** 2 + ((yy - 0.42) / 0.33) ** 2)) * 10
    e += pool * np.array([1.0, 0.88, 0.74], np.float32)
    return Image.fromarray(np.clip(e, 0, 255).astype(np.uint8))



# ---------------------------------------------------------------- v3 plates
def watch_bbox(im, tol=34):
    """Bounding box of the product against its flat backdrop."""
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
    """1-D row colour profile sampled from the photo's own margins."""
    a = np.asarray(im.convert('RGB'), np.float32)
    k = max(8, int(a.shape[1] * pad))
    strip = np.concatenate([a[:, :k], a[:, -k:]], 1)
    rows = np.median(strip, axis=1)
    ker = np.ones(41, np.float32) / 41
    padded = np.pad(rows, ((20, 20), (0, 0)), mode='edge')
    return np.stack([np.convolve(padded[:, c], ker, 'valid') for c in range(3)], 1)


def bg_field(prof, pool=9.0):
    ys = np.clip((np.arange(PH) * (len(prof) - 1) / max(1, PH - 1)).astype(int), 0, len(prof) - 1)
    a = prof[ys][:, None, :].repeat(PW, 1)
    yy = np.linspace(0, 1, PH, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, PW, dtype=np.float32)[None, :]
    a += np.exp(-(((xx - 0.5) / 0.44) ** 2 + ((yy - 0.42) / 0.34) ** 2))[:, :, None] * pool
    return a


def whole_plate(ci, watch_h=0.855, valign=0.46, pool=9.0):
    """THE whole watch (top bracelet link to the heart end-link), never cropped.

    The 2000x2000 product photo is cut to the watch plus a small margin, scaled
    to `watch_h` of the frame height, and placed on a field rebuilt from the
    photo's own backdrop so nothing looks pasted on.
    """
    folder, stem = COLORS[ci]
    im = load_rgb(f'{ART}/{folder}/website-images/{stem}_01_primary.jpg')
    x0, y0, x1, y1 = watch_bbox(im)
    mx, my = int((x1 - x0) * 0.055), int((y1 - y0) * 0.028)
    fg = im.crop((max(0, x0 - mx), max(0, y0 - my),
                  min(im.width, x1 + mx), min(im.height, y1 + my)))
    th = int(PH * watch_h)
    tw = max(1, int(fg.width * th / fg.height))
    fg = fg.resize((tw, th), Image.LANCZOS)
    out = Image.fromarray(np.clip(bg_field(row_bg(im), pool), 0, 255).astype(np.uint8))
    out = out.filter(ImageFilter.GaussianBlur(3))
    ry, rx = min(150, th // 3), int(tw * 0.09)
    yy = np.arange(th, dtype=np.float32)[:, None]
    xx = np.arange(tw, dtype=np.float32)[None, :]
    m = np.minimum(np.clip(yy / ry, 0, 1), np.clip((th - 1 - yy) / ry, 0, 1))
    m = np.minimum(m, np.minimum(np.clip(xx / rx, 0, 1), np.clip((tw - 1 - xx) / rx, 0, 1))) ** 0.75
    mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(46))
    py = int(max(0, min(PH - th, PH * valign - th / 2)))
    out.paste(fg, ((PW - tw) // 2, py), mask)
    return warm(out, 1.0)


def styled_plate(ci, watch_h=0.80, valign=0.44, pool=6.0):
    """Whole watch lying on rose satin (photo 05) — flat lay, nothing cropped."""
    folder, stem = COLORS[ci]
    im = load_rgb(f'{ART}/{folder}/website-images/{stem}_05_styled.jpg')
    th = int(PH * watch_h)
    tw = max(1, int(im.width * th / im.height))
    fg = im.resize((tw, th), Image.LANCZOS)
    # the photo is a full-bleed flat lay: extend it with its own blurred edges
    base = cover(im, PW, PH).filter(ImageFilter.GaussianBlur(20))
    r = 260
    m = np.ones((th, tw), np.float32)
    yy = np.arange(th, dtype=np.float32)[:, None]
    xx = np.arange(tw, dtype=np.float32)[None, :]
    m = np.minimum(np.clip(yy / r, 0, 1), np.clip((th - 1 - yy) / r, 0, 1))
    m = np.minimum(m, np.minimum(np.clip(xx / r, 0, 1), np.clip((tw - 1 - xx) / r, 0, 1))) ** 0.8
    mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(60))
    py = int(max(0, min(PH - th, PH * valign - th / 2)))
    out = base.copy()
    out.paste(fg, ((PW - tw) // 2, py), mask)
    return warm(out, 1.0)


def crystal_case_plate(ci):
    """The ENTIRE watch head (bezel ring complete) turning slowly — no dial-only crop."""
    folder, stem = COLORS[ci]
    im = load_rgb(f'{ART}/{folder}/website-images/{stem}_01_primary.jpg')
    x0, y0, x1, y1 = watch_bbox(im)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    hw = int((x1 - x0) * 0.72)                     # case + lugs, both sides
    hh = int((y1 - y0) * 0.42)
    box = (max(0, cx - hw), max(0, cy - hh), min(im.width, cx + hw), min(im.height, cy + hh))
    fg = im.crop(box)
    th = int(PH * 0.70)
    tw = int(fg.width * th / fg.height)
    fg = fg.resize((tw, th), Image.LANCZOS)
    out = Image.fromarray(np.clip(bg_field(row_bg(im), 12.0), 0, 255).astype(np.uint8))
    out = out.filter(ImageFilter.GaussianBlur(6))
    r = 220
    yy = np.arange(th, dtype=np.float32)[:, None]
    xx = np.arange(tw, dtype=np.float32)[None, :]
    m = np.minimum(np.clip(yy / r, 0, 1), np.clip((th - 1 - yy) / r, 0, 1))
    m = np.minimum(m, np.minimum(np.clip(xx / r, 0, 1), np.clip((tw - 1 - xx) / r, 0, 1))) ** 0.8
    mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(70))
    out.paste(fg, ((PW - tw) // 2, (PH - th) // 2), mask)
    return warm(out, 1.0)


def bracelet_band_plate(ci):
    """Complete bracelet band (both heart end-links) laid diagonally, uncropped."""
    folder, stem = COLORS[ci]
    im = load_rgb(f'{ART}/{folder}/website-images/{stem}_05_styled.jpg')
    fg = im.resize((int(PW * 1.0), PW), Image.LANCZOS)
    th = int(PH * 0.82)
    fg = fg.resize((int(fg.width * th / fg.height), th), Image.LANCZOS)
    out = cover(im, PW, PH).filter(ImageFilter.GaussianBlur(26))
    r = 240
    yy = np.arange(th, dtype=np.float32)[:, None]
    xx = np.arange(fg.width, dtype=np.float32)[None, :]
    m = np.minimum(np.clip(yy / r, 0, 1), np.clip((th - 1 - yy) / r, 0, 1))
    m = np.minimum(m, np.minimum(np.clip(xx / r, 0, 1), np.clip((fg.width - 1 - xx) / r, 0, 1))) ** 0.8
    mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(70))
    out.paste(fg, ((PW - fg.width) // 2, int((PH - th) * 0.44)), mask)
    return warm(out, 1.0)


def wrist_plate(ci, valign=0.42):
    """On-wrist shot, whole hand in frame (no dial crop)."""
    folder, stem = COLORS[ci]
    im = load_rgb(f'{ART}/{folder}/website-images/{stem}_02_on-wrist.jpg')
    return smart_plate_path(im, contain=0.98, valign=valign, env=ENVS[1])


def smart_plate_path(im, contain=0.98, valign=0.5, env=None, ramp=380, blur_bg=28):
    """Same idea as smart_plate but takes an image and an explicit env plate."""
    bg = cover(load_rgb(env or ENVS[0]), PW, PH).filter(ImageFilter.GaussianBlur(blur_bg))
    s = contain * (PW / im.width)
    fg = im.resize((max(1, int(im.width * s + .5)), max(1, int(im.height * s + .5))), Image.LANCZOS)
    if fg.height > PH:
        k = PH / fg.height
        fg = fg.resize((max(1, int(fg.width * k)), PH), Image.LANCZOS)
    mh, mw = fg.size
    m = np.ones((mh, mw), np.float32)
    r = min(ramp, mh // 2)
    yy = np.arange(mh, dtype=np.float32)
    m *= np.minimum(np.clip(yy / r, 0, 1), np.clip((mh - 1 - yy) / r, 0, 1))[:, None] ** 1.3
    mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(48))
    y0 = max(0, min(PH - mh, int((PH - mh) * valign)))
    bg.paste(fg, (0, y0), mask)
    return warm(bg, 1.0)


def build_gradient(c0, c1, c2=None):
    yy = np.linspace(0, 1, PH, dtype=np.float32)[:, None]
    a = np.array(c0, np.float32)[None, :] * (1 - yy) + np.array(c1, np.float32)[None, :] * yy
    if c2 is not None:
        t = np.clip((yy - 0.55) / 0.45, 0, 1)
        a = a * (1 - t) + np.array(c2, np.float32)[None, :] * t
    a = np.repeat(a[:, None, :], PW, axis=1)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def hero_plate_bw():
    """THE WHOLE black watch, duotoned into deep burgundy, for the end card."""
    p = whole_plate(0, watch_h=0.62, valign=0.30)
    a = np.asarray(p, np.float32) / 255.0
    lum = np.clip(a @ np.array([0.30, 0.59, 0.11], np.float32), 0, 1)
    lum = np.clip((lum - 0.05) * 1.05, 0, 1) ** 1.2
    sh = np.array([0.098, 0.030, 0.045], np.float32)
    hi = np.array([0.72, 0.40, 0.47], np.float32)
    out = (sh[None, None, :] + lum[..., None] * (hi - sh)[None, None, :]) * 255
    yy = np.linspace(0, 1, PH, dtype=np.float32)[:, None, None]
    out *= (1.06 - 0.34 * np.clip((yy - 0.42) / 0.58, 0, 1) ** 1.15)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


# ------------------------------------------------------------------ text
def layer_img(name):
    return Image.open(f'{LAY}/{name}.png').convert('RGBA')


def paste_alpha(dst, lay, alpha, dy=0, dx=0, scale=1.0):
    if alpha <= 0.004:
        return dst
    if scale != 1.0:
        w = int(lay.width * scale)
        h = int(lay.height * scale)
        lay = lay.resize((w, h), Image.LANCZOS)
        dx += (W - w) // 2
        dy += (H - h) // 2
    if alpha < 0.999:
        a = lay.getchannel('A').point(lambda v: int(v * alpha))
        lay = lay.copy()
        lay.putalpha(a)
    dst.paste(lay, (dx, dy), lay)
    return dst


def crop_zoom(plate, p, z0=1.0, z1=1.05, dx=0.0, dy=0.0, ease=True):
    """plate is PWxPH; return WxH crop with slow zoom (keeps aspect)."""
    t = ease_io(p) if ease else p
    z = z0 + (z1 - z0) * t
    cw, ch = int(PW / z), int(PH / z)
    cx = PW / 2 + dx * (PW - cw) / 2
    cy = PH / 2 + dy * (PH - ch) / 2
    x0 = int(np.clip(cx - cw / 2, 0, PW - cw))
    y0 = int(np.clip(cy - ch / 2, 0, PH - ch))
    return plate.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, H), Image.BILINEAR)


# petal transition masks (soft drifting edge)
def petal_mask(seed=0):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    u = (xx / W) * 0.75 + (yy / H) * 0.25
    wob = 0.055 * np.sin(yy / H * 7.5 + seed) + 0.035 * np.sin(xx / W * 5.2 + seed * 1.7)
    return (u + wob).astype(np.float32)


MASK_A = None
MASK_B = None


def blend_petal(a, b, t, seedrev=False):
    global MASK_A, MASK_B
    if MASK_A is None:
        MASK_A = petal_mask(0.0)
        MASK_B = petal_mask(1.9)
    m = MASK_B if seedrev else MASK_A
    k = 0.30
    al = np.clip((m - (0.30 - k) - t * (0.40 + 2 * k)) / (2 * k), 0, 1).astype(np.float32)[..., None]
    return a * (1 - al) + b * al


# ------------------------------------------------------------------ sparkles
GLINT = None


def glints(img_arr, pts, t, strength=1.0):
    global GLINT
    if GLINT is None:
        GLINT = layer_img('t_glint')
    g = GLINT
    for (gx, gy, ph, sc) in pts:
        a = (0.55 + 0.45 * math.sin(t * 2.1 + ph)) ** 3 * strength
        if a < 0.05:
            continue
        s = 0.55 + 0.45 * math.sin(t * 1.13 + ph * 1.7)
        gw = int(g.width * sc * (0.8 + 0.35 * s))
        gg = g.resize((gw, gw), Image.BILINEAR)
        al = gg.getchannel('A').point(lambda v: int(v * a * 0.9))
        gg.putalpha(al)
        x, y = int(gx - gw / 2), int(gy - gw / 2)
        base = Image.fromarray(np.clip(img_arr, 0, 255).astype(np.uint8))
        base.paste(gg, (x, y), gg)
        img_arr = np.asarray(base, np.float32)
    return img_arr


# ------------------------------------------------------------------ scenes
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='/tmp/vframes')
    ap.add_argument('--test', default='')
    ap.add_argument('--start', type=int, default=0)
    ap.add_argument('--end', type=int, default=0)
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    tl = json.load(open(f'{WORK}/timeline.json'))
    total = tl['total']
    scenes = tl['scenes']
    NF = int(round(total * FPS))
    print(f'{NF} frames, {total:.2f}s', flush=True)

    print('building plates...', flush=True)
    plates = {}
    for ci in range(4):
        plates[(ci, 'whole')] = whole_plate(ci, watch_h=0.685, valign=0.425)  # whole watch
        plates[(ci, 'styled')] = styled_plate(ci)        # whole watch on satin
        plates[(ci, 'wrist')] = wrist_plate(ci)          # whole hand, no dial crop
    plates[(2, 'price')] = whole_plate(2, watch_h=0.60, valign=0.335)
    plates[(1, 'guarantee')] = whole_plate(1, watch_h=0.52, valign=0.30)
    # hook plate is smaller so the price block never overlaps the watch
    plates[(0, 'hook')] = whole_plate(0, watch_h=0.50, valign=0.30)
    endplate = hero_plate_bw()
    cards = {
        'five': build_gradient((251, 244, 241), (250, 240, 236), (246, 226, 227)),
        'cta': build_gradient((90, 26, 46), (74, 21, 38), (56, 16, 28)),
    }

    L = {n: layer_img(n) for n in
         ['t_brandbar', 't_hook_a', 't_hook_b', 't_color_1', 't_color_2', 't_color_3', 't_color_4',
          't_feat_crystal', 't_feat_bracelet', 't_gauge', 't_guarantee', 't_price_big', 't_price',
          't_five', 't_cta', 't_cta_chev', 't_endcard']}
    PETAL = layer_img('t_petal')

    def scene_at(t):
        for i, s in enumerate(scenes):
            if s['t0'] <= t < s['t1']:
                return i, s
        return len(scenes) - 1, scenes[-1]

    def colour_scene(s, t, ci):
        """3 beats, every one showing the ENTIRE watch."""
        p = (t - s['t0']) / s['dur']
        if p < 0.40:                                  # beat 1: whole watch, blush
            img = crop_zoom(plates[(ci, 'whole')], p / 0.40, 1.00, 1.045, dy=-0.02)
        elif p < 0.72:                                # beat 2: whole watch, satin flat lay
            q = (p - 0.40) / 0.32
            img = crop_zoom(plates[(ci, 'styled')], q, 1.05, 1.00, dx=0.02 * (1 - q))
        else:                                         # beat 3: on the wrist
            q = (p - 0.72) / 0.28
            img = crop_zoom(plates[(ci, 'wrist')], q, 1.00, 1.05, dy=-0.02)
        return img

    def render(i):
        t = i / FPS
        si, s = scene_at(t)
        sid = s['id']
        p = (t - s['t0']) / max(1e-6, s['dur'])

        # ---- base composite
        if sid in ('hook',):
            # whole watch drifts in slowly; the price lands on top of it
            tt0 = t - s['t0']
            if tt0 < 1.6:
                q = ease_io(tt0 / 1.6)
                img = crop_zoom(plates[(0, 'hook')], q, 1.10, 1.005, dy=-0.02)
            else:
                q = (tt0 - 1.6) / max(0.1, s['dur'] - 1.6)
                img = crop_zoom(plates[(0, 'hook')], q, 1.005, 1.05, dy=-0.015)
        elif sid in ('black', 'blue', 'white', 'green'):
            ci = {'black': 0, 'blue': 1, 'white': 2, 'green': 3}[sid]
            img = colour_scene(s, t, ci)
        elif sid == 'crystal':
            # whole watch; the light gathers on the bezel ring (no crop, no ghost)
            img = crop_zoom(plates[(0, 'whole')], p, 1.05, 1.01, dx=0.016 * math.sin(p * math.pi))
        elif sid == 'bracelet':
            img = crop_zoom(plates[(3, 'whole')], p, 1.05, 1.01, dx=-0.016 * math.sin(p * math.pi))
        elif sid == 'guarantee':
            img = crop_zoom(plates[(1, 'guarantee')], p, 1.05, 1.01)
            # warm pearl wash over the left/bottom for text contrast
            ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            d = ImageDraw.Draw(ov)
            d.rectangle([0, 0, W, H], fill=(251, 242, 238, 84))
            img = Image.alpha_composite(img.convert('RGBA'), ov).convert('RGB')
        elif sid == 'price':
            img = crop_zoom(plates[(2, 'price')], p, 1.03, 1.005, dy=0.01)
            ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            d = ImageDraw.Draw(ov)
            d.rectangle([0, 0, W, H], fill=(42, 14, 24, 104))
            img = Image.alpha_composite(img.convert('RGBA'), ov).convert('RGB')
        elif sid == 'five':
            img = cards['five'].crop((int((PW - W) / 2), int((PH - H) / 2),
                                      int((PW - W) / 2) + W, int((PH - H) / 2) + H))
        elif sid == 'cta':
            img = cards['cta'].crop((int((PW - W) / 2), int((PH - H) / 2),
                                     int((PW - W) / 2) + W, int((PH - H) / 2) + H))
        else:
            img = Image.new('RGB', (W, H), (42, 20, 30))

        arr = np.asarray(img, np.float32)

        # ---- scene-local light effects
        if sid == 'hook':
            # light sweep + crystal glints on the dial
            sw = (t - s['t0']) / 1.1
            if 0 < sw < 1:
                xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
                band = np.exp(-((xx - (-0.2 + 1.5 * sw)) / 0.10) ** 2) * 46 * math.sin(math.pi * sw)
                arr += band[..., None] * np.array([1.0, 0.90, 0.72], np.float32)
        if sid == 'hook':
            pts = [(W * 0.34, H * 0.30, 0.3, 0.9), (W * 0.66, H * 0.34, 1.7, 0.7),
                   (W * 0.48, H * 0.46, 2.9, 0.6), (W * 0.28, H * 0.42, 4.1, 0.5)]
            arr = glints(arr, pts, t, 0.85)
        if sid == 'crystal':
            pts = [(W * 0.28, H * 0.27, 0.4, 0.8), (W * 0.70, H * 0.29, 1.9, 0.9),
                   (W * 0.24, H * 0.52, 3.3, 0.7), (W * 0.74, H * 0.55, 5.1, 0.8),
                   (W * 0.50, H * 0.22, 2.4, 0.6)]
            arr = glints(arr, pts, t, 1.05)
        if sid == 'bracelet':
            pts = [(W * 0.30, H * 0.30, 0.9, 0.7), (W * 0.70, H * 0.52, 2.3, 0.8),
                   (W * 0.46, H * 0.66, 3.7, 0.6)]
            arr = glints(arr, pts, t, 0.9)

        arr = finish(arr, i)

        # ---- transitions (render previous scene tail into this frame)
        fade = 0.62
        if p * s['dur'] < fade and si > 0:
            prev = scenes[si - 1]
            pf = (t - prev['t0']) / max(1e-6, prev['dur'])
            # previous frame content (cheap: re-render its last look)
            pi = render_plain(prev, pf, plates, cards)
            arr = blend_petal(pi, arr, (p * s['dur']) / fade, seedrev=(si % 2 == 0))
            arr = finish(arr, i + 3)

        # ---- text overlays
        base = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

        if sid == 'hook':
            tt = t - s['t0']
            base = paste_alpha(base, L['t_brandbar'], min(1, tt / 0.5))
            a1 = smooth((tt - 0.22) / 0.42)
            base = paste_alpha(base, L['t_hook_a'], a1, dy=int(26 * (1 - a1)))
            a2 = smooth((tt - 2.95) / 0.45)
            base = paste_alpha(base, L['t_hook_b'], a2, dy=int(22 * (1 - a2)))
        elif sid in ('black', 'blue', 'white', 'green'):
            idx = {'black': 1, 'blue': 2, 'white': 3, 'green': 4}[sid]
            tt = t - s['t0']
            base = paste_alpha(base, L['t_brandbar'], min(1, tt / 0.4) * 0.95)
            a = smooth((tt - 0.30) / 0.45)
            base = paste_alpha(base, L[f't_color_{idx}'], a, dy=int(24 * (1 - a)))
        elif sid == 'crystal':
            tt = t - s['t0']
            base = paste_alpha(base, L['t_brandbar'], min(1, tt / 0.4) * 0.9)
            a = smooth((tt - 0.35) / 0.5)
            base = paste_alpha(base, L['t_feat_crystal'], a, dy=int(26 * (1 - a)))
        elif sid == 'bracelet':
            tt = t - s['t0']
            base = paste_alpha(base, L['t_brandbar'], min(1, tt / 0.4) * 0.9)
            a = smooth((tt - 0.35) / 0.5)
            base = paste_alpha(base, L['t_feat_bracelet'], a, dy=int(26 * (1 - a)))
        elif sid == 'guarantee':
            tt = t - s['t0']
            a = smooth((tt - 0.45) / 0.42)
            sc = 1.34 - 0.34 * ease_io(min(1, (tt - 0.45) / 0.55))
            base = paste_alpha(base, L['t_gauge'], a, scale=sc)
            a2 = smooth((tt - 0.85) / 0.5)
            base = paste_alpha(base, L['t_guarantee'], a2, dy=int(28 * (1 - a2)))
        elif sid == 'price':
            tt = t - s['t0']
            sc = 1.18 - 0.18 * ease_io(min(1, tt / 0.7))
            base = paste_alpha(base, L['t_price_big'], smooth(tt / 0.45), scale=sc)
            a = smooth((tt - 0.55) / 0.5)
            base = paste_alpha(base, L['t_price'], a, dy=int(24 * (1 - a)))
        elif sid == 'five':
            tt = t - s['t0']
            sc = 1.04 - 0.04 * ease_io(min(1, tt / s['dur']))
            base = paste_alpha(base, L['t_five'], smooth(tt / 0.55), scale=sc)
        elif sid == 'cta':
            tt = t - s['t0']
            dur = s['dur']
            end_from = max(3.0, dur - 2.6)
            a = smooth((tt - 0.25) / 0.55)
            out_a = 1.0 - smooth((tt - (end_from - 0.85)) / 0.7)
            card = paste_alpha(base, L['t_cta'], a * max(0.0, out_a))
            bob = int(14 * math.sin(tt * 2.4))
            chev = smooth((tt - 1.5) / 0.5) * (0.75 + 0.25 * math.sin(tt * 2.6))
            card = paste_alpha(card, L['t_cta_chev'], chev * max(0.0, out_a), dy=bob)
            if tt > end_from:
                q = (tt - end_from) / max(0.8, dur - end_from)
                hero = crop_zoom(endplate, min(1, q), 1.02, 1.08)
                harr = finish(np.asarray(hero, np.float32), i + 2)
                hero_i = Image.fromarray(np.clip(harr, 0, 255).astype(np.uint8))
                w = smooth(q * 1.1)
                base = Image.fromarray(np.clip(np.asarray(card, np.float32) * (1 - w) +
                                               np.asarray(hero_i, np.float32) * w, 0, 255).astype(np.uint8))
                base = paste_alpha(base, L['t_endcard'], smooth((q - 0.28) / 0.32))
            else:
                base = card
        else:
            base = paste_alpha(base, L['t_endcard'], 1.0)

        # floating petals (all product scenes, subtle)
        if sid in ('hook', 'black', 'blue', 'white', 'green', 'crystal', 'bracelet', 'guarantee'):
            base = floating_petals(base, t, PETAL, 10 if sid in ('hook', 'crystal', 'bracelet') else 6)
        return base

    def render_plain(s, p, plates, cards):
        """Cheap previous-scene look used for the transition tail (no text)."""
        sid = s['id']
        if sid in ('black', 'blue', 'white', 'green'):
            ci = {'black': 0, 'blue': 1, 'white': 2, 'green': 3}[sid]
            img = crop_zoom(plates[(ci, 'wrist')], min(1, p), 1.02, 1.05)
        elif sid == 'hook':
            img = crop_zoom(plates[(0, 'hook')], 1.0, 1.02, 1.05)
        elif sid == 'crystal':
            img = crop_zoom(plates[(0, 'whole')], 1.0, 1.03, 1.05)
        elif sid == 'bracelet':
            img = crop_zoom(plates[(3, 'whole')], 1.0, 1.03, 1.05)
        elif sid == 'guarantee':
            img = crop_zoom(plates[(1, 'guarantee')], 1.0, 1.03, 1.01)
        elif sid == 'price':
            img = crop_zoom(plates[(2, 'price')], 1.0, 1.03, 1.005)
        elif sid in ('five', 'cta'):
            c = cards[sid]
            img = c.crop((int((PW - W) / 2), int((PH - H) / 2),
                          int((PW - W) / 2) + W, int((PH - H) / 2) + H))
        else:
            img = Image.new('RGB', (W, H), (42, 20, 30))
        return np.asarray(img, np.float32)

    # ---- write frames
    if args.test:
        for f in [int(x) for x in args.test.split(',')]:
            fr = render(f)
            fr.save(f'{args.out}/test_{f:05d}.jpg', quality=90)
            print('test frame', f)
        return

    a = args.start
    b = args.end or NF
    for i in range(a, b):
        fr = render(i)
        fr.save(f'{args.out}/f_{i:05d}.jpg', quality=92, subsampling=0)
        if i % 60 == 0:
            print(f'frame {i}/{NF}', flush=True)
    print('DONE', b)


def floating_petals(base, t, sprite, n):
    rng = np.random.default_rng(3)
    ps = []
    for k in range(n):
        x0 = rng.uniform(0.05, 0.95) * W
        sp = rng.uniform(0.014, 0.03) * H
        ph = rng.uniform(0, 6.28)
        sz = rng.uniform(0.35, 0.95)
        y = H * 0.98 - ((t * sp + rng.uniform(0, H * 1.2)) % (H * 1.35))
        x = x0 + math.sin(t * 0.55 + ph) * W * 0.035
        a = 0.16 + 0.14 * math.sin(t * 0.9 + ph)
        ps.append((x, y, sz, max(0.0, a)))
    for (x, y, sz, a) in ps:
        if a < 0.02:
            continue
        s = sprite.resize((int(120 * sz), int(120 * sz)), Image.BILINEAR)
        s2 = s.copy()
        s2.putalpha(s.getchannel('A').point(lambda v: int(v * a)))
        base.paste(s2, (int(x), int(y)), s2)
    return base


if __name__ == '__main__':
    main()
