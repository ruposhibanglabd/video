#!/usr/bin/env python3
"""Set C v2 — living motion cut.

The v1 cut was a slow push on a still plate. This cut gives every scene a
pulse: the watch floats on a Lissajous path, the backdrop breathes, a light
sweep crosses the dial, type rises in, and every picture change lands on the
90 BPM beat. The whole watch stays in frame; nothing is cropped.

Scene map (all cuts land on a beat):
  hook      0.000 –  5.333   black watch, price
  run       5.333 – 12.000   five colourways, 1.333 s each (2 beats)
  water    12.000 – 18.000   pink watch, water resistance
  replace  18.000 – 21.333   white watch, 7-day replacement
  five     21.333 – 26.667   pearl card, 5 % pledge
  cta      26.667 – 31.500   black watch, CTA
"""
import argparse
import json
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H, FPS = 1080, 1920, 30
TOTAL = 31.5
NF = int(round(TOTAL * FPS))
BEAT = 60.0 / 90.0

BASE = 'miqa/products/2026-11-05_set-c-video'
CUT = f'{BASE}/work/cut'
LAY = f'{BASE}/plates/text'
OUT = '/tmp/cframes2'

# ---------------------------------------------------------------- palette
INK = np.array([26, 7, 16], np.float32)
BURG = np.array([90, 26, 46], np.float32)
ROSE = np.array([158, 74, 99], np.float32)
BLUSH = np.array([244, 201, 214], np.float32)
PEARL = np.array([253, 246, 243], np.float32)
CHAMP = np.array([217, 183, 121], np.float32)
GOLD = np.array([184, 146, 90], np.float32)

SCENES = {
    'hook':    (0.0, 5.333),
    'run':     (5.333, 12.0),
    'water':   (12.0, 18.0),
    'replace': (18.0, 21.333),
    'five':    (21.333, 26.667),
    'cta':     (26.667, 31.5),
}
RUN0, RUN1 = SCENES['run']
RUN_STEP = (RUN1 - RUN0) / 5.0

# background: (top rgb, bottom rgb, glow rgb, glow x, glow y, glow radius)
BG = {
    'hook':    ([42, 14, 24], [90, 26, 46], [158, 74, 99], 0.50, 0.34, 0.62),
    'black':   ([26, 7, 16], [74, 20, 38], [122, 40, 64], 0.50, 0.36, 0.60),
    'pink':    ([206, 148, 166], [244, 201, 214], [255, 240, 235], 0.50, 0.34, 0.66),
    'heart':   ([42, 14, 24], [107, 31, 53], [217, 183, 121], 0.50, 0.34, 0.58),
    'green':   ([7, 19, 13], [18, 58, 38], [46, 107, 74], 0.50, 0.36, 0.60),
    'white':   ([176, 156, 152], [234, 217, 212], [255, 250, 245], 0.50, 0.34, 0.66),
    'water':   ([14, 42, 46], [30, 74, 80], [111, 179, 184], 0.50, 0.36, 0.62),
    'replace': ([253, 246, 243], [234, 217, 196], [217, 183, 121], 0.50, 0.34, 0.64),
    'five':    ([255, 247, 243], [244, 201, 214], [255, 255, 255], 0.50, 0.36, 0.66),
    'cta':     ([26, 7, 16], [90, 26, 46], [158, 74, 99], 0.50, 0.36, 0.62),
}

SLUGS = ['01_fiyota-octagon-black', '02_fiyota-octagon-pink',
         '03_trueworth-heart-black', '04_fiyota-octagon-green',
         '05_fiyota-octagon-white']
RUN_BG = ['black', 'pink', 'heart', 'green', 'white']
RUN_TXT = ['t_c1', 't_c2', 't_c3', 't_c4', 't_c5']


def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def ease_out(x):
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


def pulse(t):
    """Beat envelope: sharp attack, smooth decay."""
    p = (t % BEAT) / BEAT
    return (1.0 - p) ** 3


def lerp(a, b, k):
    return a + (b - a) * k


# ---------------------------------------------------------------- assets
class Watch:
    def __init__(self, path, head_row=None, head_w=None, head_cx=None):
        im = Image.open(path).convert('RGBA')
        self.im = im
        a = np.asarray(im)[:, :, 3]
        widths = (a > 40).sum(1)
        h = im.height
        if head_row is None:
            head_row = int(np.argmax(widths[:int(h * 0.85)]))
        if head_w is None:
            head_w = int(widths[head_row])
        if head_cx is None:
            xs = np.where(a[head_row] > 40)[0]
            head_cx = int((xs.min() + xs.max()) / 2)
        self.head_row, self.head_w, self.head_cx = head_row, head_w, head_cx
        # premultiplied-ish assets at a 1000 px head width for quality
        self.base_scale = 1000.0 / head_w
        self.base = im.resize((max(1, int(im.width * self.base_scale)),
                               max(1, int(im.height * self.base_scale))), Image.LANCZOS)
        self.base_head_row = head_row * self.base_scale
        self.base_head_cx = head_cx * self.base_scale
        alpha = self.base.getchannel('A')
        self.shadow = Image.new('RGBA', self.base.size, (20, 4, 12, 0))
        self.shadow.putalpha(alpha.filter(ImageFilter.GaussianBlur(26)).point(lambda v: int(v * 0.55)))
        # diagonal light band, as wide as the watch
        bw, bh = self.base.size
        band = Image.new('L', (bw, bh), 0)
        d = ImageDraw.Draw(band)
        step = max(2, bw // 90)
        for x in range(-bh, bw + bh, step):
            d.line([(x, 0), (x + bh, bh)], fill=255, width=step)
        band = band.filter(ImageFilter.GaussianBlur(bw * 0.035))
        self.band = band

    def render(self, target_head_w, head_y, angle=0.0, scale=1.0, dx=0.0, dy=0.0,
               sweep=0.0, shadow=True, tint=None):
        s = target_head_w / 1000.0 * scale
        nw, nh = max(1, int(self.base.width * s)), max(1, int(self.base.height * s))
        im = self.base.resize((nw, nh), Image.BICUBIC)
        if abs(angle) > 0.01:
            im = im.rotate(angle, resample=Image.BICUBIC, expand=True)
        if tint is not None:
            a = np.asarray(im, np.float32)
            lum = np.clip(a[:, :, :3] @ np.array([0.30, 0.59, 0.11], np.float32), 0, 255)
            lum = np.clip((lum - 8) * 1.05, 0, 255) ** 1.12
            sh = np.array(tint[0], np.float32)
            hi = np.array(tint[1], np.float32)
            rgb = sh + (lum / 255.0)[..., None] * (hi - sh)
            a[:, :, :3] = np.clip(rgb, 0, 255)
            im = Image.fromarray(a.astype(np.uint8), 'RGBA')
        # head position after rotation/scale
        k = nw / self.base.width
        hx = self.base_head_cx * k + (im.width - nw) / 2
        hy = self.base_head_row * k + (im.height - nh) / 2
        px = int(round(W / 2 + dx - hx))
        py = int(round(head_y + dy - hy))
        out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        if shadow:
            sh = self.shadow.resize((nw, nh), Image.BICUBIC)
            if abs(angle) > 0.01:
                sh = sh.rotate(angle, resample=Image.BICUBIC, expand=True)
            out.alpha_composite(sh, (px + 14, py + 22))
        out.alpha_composite(im, (px, py))
        if sweep > 0.001:
            band = self.band.resize((nw, nh), Image.BICUBIC)
            if abs(angle) > 0.01:
                band = band.rotate(angle, resample=Image.BICUBIC, expand=True)
            band = band.resize(im.size, Image.BICUBIC)
            # shift the band horizontally, wrap inside the watch box
            off = int((sweep * 1.8 - 0.4) * nw)
            band = Image.fromarray(np.roll(np.asarray(band), off, axis=1))
            a = np.asarray(im, np.float32)
            band_a = np.asarray(band, np.float32) / 255.0
            if band_a.ndim == 2:
                band_a = band_a[..., None]
            alpha = band_a * (a[:, :, 3:4].astype(np.float32) / 255.0) * 0.55
            sweep_layer = np.zeros((im.height, im.width, 4), np.float32)
            sweep_layer[:, :, :3] = np.array([255, 246, 230], np.float32)
            sweep_layer[:, :, 3:4] = alpha * 255
            sl = Image.fromarray(np.clip(sweep_layer, 0, 255).astype(np.uint8), 'RGBA')
            out.alpha_composite(sl, (px, py))
        return out


def build_backgrounds():
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
    vign = np.clip(1.0 - 0.55 * (((xx - 0.5) / 0.62) ** 2 + ((yy - 0.46) / 0.62) ** 2), 0, 1)
    out = {}
    for name, (top, bot, glow, gx, gy, gr) in BG.items():
        t = np.array(top, np.float32)
        b = np.array(bot, np.float32)
        g = np.array(glow, np.float32)
        arr = t[None, None, :] * (1 - yy[..., None]) + b[None, None, :] * yy[..., None]
        r2 = ((xx - gx) / gr) ** 2 + ((yy - gy) / (gr * 1.15)) ** 2
        arr = arr + np.exp(-r2 * 2.2)[..., None] * g * 0.55
        # soft second glow, lower right
        r2b = ((xx - 0.78) / 0.45) ** 2 + ((yy - 0.78) / 0.40) ** 2
        arr = arr + np.exp(-r2b * 2.6)[..., None] * g * 0.16
        arr = arr * vign[..., None]
        out[name] = np.clip(arr, 0, 255).astype(np.float32)
    return out


def build_glow():
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
    r2 = ((xx - 0.5) / 0.34) ** 2 + ((yy - 0.40) / 0.30) ** 2
    g = np.exp(-r2 * 2.4)[..., None] * np.array([255, 226, 196], np.float32)
    return g.astype(np.float32)


def build_bokeh(seed, n=22):
    im = Image.new('L', (W // 2, H // 2), 0)
    d = ImageDraw.Draw(im)
    rng = np.random.default_rng(seed)
    for _ in range(n):
        x = rng.uniform(0, W // 2)
        y = rng.uniform(0, H // 2)
        r = rng.uniform(8, 46)
        a = int(rng.uniform(10, 42))
        d.ellipse([x - r, y - r, x + r, y + r], fill=a)
    im = im.filter(ImageFilter.GaussianBlur(9))
    a = np.asarray(im, np.float32) / 255.0
    return (a[..., None] * np.array([255, 232, 206], np.float32)).astype(np.float32)


def build_particles(seed, n=46):
    im = Image.new('L', (W // 2, H // 2), 0)
    d = ImageDraw.Draw(im)
    rng = np.random.default_rng(seed)
    for _ in range(n):
        x = rng.uniform(0, W // 2)
        y = rng.uniform(0, H // 2)
        r = rng.uniform(0.7, 2.6)
        a = int(rng.uniform(18, 70))
        d.ellipse([x - r, y - r, x + r, y + r], fill=a)
    im = im.filter(ImageFilter.GaussianBlur(1.2))
    a = np.asarray(im, np.float32) / 255.0
    return (a[..., None] * np.array([255, 240, 214], np.float32)).astype(np.float32)


def build_grain():
    out = []
    for i in range(4):
        rng = np.random.default_rng(100 + i)
        g = rng.normal(0, 2.2, (H, W)).astype(np.float32)
        out.append(g[..., None])
    return out


def load_text():
    out = {}
    for name in ['t_bar', 't_hook', 't_c1', 't_c2', 't_c3', 't_c4', 't_c5',
                 't_water', 't_replace', 't_five', 't_cta']:
        im = Image.open(f'{LAY}/{name}.png').convert('RGBA').resize((W, H), Image.LANCZOS)
        out[name] = im
    return out


def duotone(im, sh, hi):
    a = np.asarray(im, np.float32)
    lum = np.clip(a[:, :, :3] @ np.array([0.30, 0.59, 0.11], np.float32), 0, 255)
    lum = np.clip((lum - 8) * 1.05, 0, 255) ** 1.12
    s = np.array(sh, np.float32)
    h = np.array(hi, np.float32)
    rgb = s + (lum / 255.0)[..., None] * (h - s)
    a[:, :, :3] = np.clip(rgb, 0, 255)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


# ---------------------------------------------------------------- renderer
class Renderer:
    def __init__(self):
        print('assets...', flush=True)
        self.bg = build_backgrounds()
        self.glow = build_glow()
        self.bokeh = [build_bokeh(s) for s in (11, 23, 37)]
        self.particles = [build_particles(s) for s in (5, 9, 14)]
        self.grain = build_grain()
        yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
        xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
        self.vign = np.clip(1.0 - 0.42 * (((xx - 0.5) / 0.60) ** 2 + ((yy - 0.46) / 0.60) ** 2), 0, 1)[..., None].astype(np.float32)
        self.text = load_text()
        self.watches = [Watch(f'{CUT}/{s}_trim.png') for s in SLUGS]
        self.duo = duotone(self.watches[0].base, (26, 7, 16), (196, 120, 140))
        self.duo.shadow = Image.new('RGBA', self.duo.size, (20, 4, 12, 0))
        self.duo.shadow.putalpha(self.duo.getchannel('A').filter(ImageFilter.GaussianBlur(26)).point(lambda v: int(v * 0.55)))
        self.duo.band = self.watches[0].band
        self.duo.base_head_row = self.watches[0].base_head_row
        self.duo.base_head_cx = self.watches[0].base_head_cx
        self.duo.base_scale = self.watches[0].base_scale
        self.duo.head_row = self.watches[0].head_row
        self.duo.head_w = self.watches[0].head_w
        self.duo.head_cx = self.watches[0].head_cx
        print('assets ready', flush=True)

    # ---------------------------------------------------------- background
    def background(self, name, t, strength=1.0):
        arr = self.bg[name].copy()
        # breathing glow, drifting on a slow Lissajous
        gx = 0.5 + 0.055 * math.sin(2 * math.pi * 0.071 * t + 0.4)
        gy = 0.40 + 0.035 * math.cos(2 * math.pi * 0.053 * t)
        ox, oy = int((gx - 0.5) * W), int((gy - 0.40) * H)
        g = np.roll(np.roll(self.glow, oy, axis=0), ox, axis=1)
        arr += g * (0.10 + 0.05 * pulse(t)) * strength
        # bokeh, slow upward drift and horizontal sway
        bi = int(t / 3.0) % 3
        b = self.bokeh[bi]
        shift = int((t * 7) % 60)
        b = np.roll(b, -shift, axis=0)
        b = np.roll(b, int(10 * math.sin(t * 0.21)), axis=1)
        b8 = (np.clip(b, 0, 1) * 255).astype(np.uint8)
        b = np.asarray(Image.fromarray(b8).resize((W, H), Image.BILINEAR), np.float32) / 255.0
        arr += b * 0.55
        # drifting dust
        pi = int(t / 2.0) % 3
        p = self.particles[pi]
        p = np.roll(p, -int((t * 11) % 40), axis=0)
        p8 = (np.clip(p, 0, 1) * 255).astype(np.uint8)
        p = np.asarray(Image.fromarray(p8).resize((W, H), Image.BILINEAR), np.float32) / 255.0
        arr += p * (0.55 + 0.25 * pulse(t))
        return arr

    def finish_bg(self, arr, i):
        arr = arr + self.grain[i % 4]
        arr = arr * self.vign
        return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB')

    # ---------------------------------------------------------- text
    def text_layer(self, name, alpha=1.0, dy=0.0, glow=0.0):
        if alpha <= 0.004:
            return None
        lay = self.text[name]
        if alpha < 0.999:
            lay = lay.copy()
            lay.putalpha(lay.getchannel('A').point(lambda v: int(v * alpha)))
        if abs(dy) > 0.5:
            lay = Image.fromarray(np.roll(np.asarray(lay), int(dy), axis=0))
        return lay

    def paste_text(self, base, name, alpha=1.0, dy=0.0):
        lay = self.text_layer(name, alpha, dy)
        if lay is not None:
            base.alpha_composite(lay)
        return base

    # ---------------------------------------------------------- scenes
    def watch_motion(self, t, phase=0.0):
        dx = 9.0 * math.sin(2 * math.pi * 0.105 * t + phase)
        dy = 13.0 * math.sin(2 * math.pi * 0.157 * t + phase + 1.1)
        ang = 2.1 * math.sin(2 * math.pi * 0.083 * t + phase + 0.5)
        sc = 1.0 + 0.007 * math.sin(2 * math.pi * 0.121 * t + phase)
        return dx, dy, ang, sc

    def render_hook(self, t, local):
        arr = self.background('hook', t)
        img = self.finish_bg(arr, int(t * FPS)).convert('RGBA')
        dx, dy, ang, sc = self.watch_motion(t, 0.0)
        p = pulse(t)
        w = self.watches[0].render(0.50 * W, 0.405 * H, angle=ang, scale=sc * (1 + 0.006 * p),
                                   dx=dx, dy=dy, sweep=(local % 3.4) / 3.4)
        img.alpha_composite(w)
        # warm halo behind the price, breathing on the beat
        halo = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(halo)
        cx, cy = W // 2, int(0.80 * H)
        r = int(0.30 * W)
        d.ellipse([cx - r, cy - r * 0.55, cx + r, cy + r * 0.55], fill=(255, 214, 170, int(10 + 10 * p)))
        halo = halo.filter(ImageFilter.GaussianBlur(60))
        img.alpha_composite(halo)
        a_bar = ease(t / 0.5)
        a_hook = ease((t - 0.30) / 0.65)
        self.paste_text(img, 't_bar', a_bar)
        self.paste_text(img, 't_hook', a_hook, dy=int(14 * (1 - ease((t - 0.30) / 0.65))))
        return img.convert('RGB')

    def render_run(self, t, k, local):
        name = RUN_BG[k]
        arr = self.background(name, t)
        img = self.finish_bg(arr, int(t * FPS)).convert('RGBA')
        dx, dy, ang, sc = self.watch_motion(t, k * 1.3)
        p = pulse(t)
        # a gentle entrance: the watch rises into place over the first 0.28 s
        ent = ease(local / 0.28)
        w = self.watches[k].render(0.505 * W, 0.405 * H + (1 - ent) * 26,
                                   angle=ang * ent, scale=sc * (1 + 0.006 * p) * (0.985 + 0.015 * ent),
                                   dx=dx * ent, dy=dy * ent, sweep=(local % 2.9) / 2.9)
        img.alpha_composite(w)
        self.paste_text(img, 't_bar', 1.0)
        a = ease(local / 0.30)
        self.paste_text(img, RUN_TXT[k], a, dy=int(12 * (1 - a)))
        return img.convert('RGB')

    def render_water(self, t, local):
        arr = self.background('water', t)
        img = self.finish_bg(arr, int(t * FPS)).convert('RGBA')
        dx, dy, ang, sc = self.watch_motion(t, 2.1)
        p = pulse(t)
        w = self.watches[1].render(0.49 * W, 0.385 * H, angle=ang, scale=sc * (1 + 0.006 * p),
                                   dx=dx, dy=dy, sweep=(local % 3.1) / 3.1)
        img.alpha_composite(w)
        # slow concentric ripples, low contrast
        rip = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(rip)
        for j in range(3):
            ph = (local * 0.22 + j / 3.0) % 1.0
            r = int(0.10 * W + ph * 0.55 * W)
            a = int(26 * (1 - ph))
            d.ellipse([W // 2 - r, int(0.36 * H) - r, W // 2 + r, int(0.36 * H) + r],
                      outline=(190, 235, 235, a), width=3)
        rip = rip.filter(ImageFilter.GaussianBlur(3))
        img.alpha_composite(rip)
        self.paste_text(img, 't_bar', 1.0)
        a = ease(local / 0.45)
        self.paste_text(img, 't_water', a, dy=int(14 * (1 - a)))
        return img.convert('RGB')

    def render_replace(self, t, local):
        arr = self.background('replace', t)
        img = self.finish_bg(arr, int(t * FPS)).convert('RGBA')
        dx, dy, ang, sc = self.watch_motion(t, 4.0)
        p = pulse(t)
        w = self.watches[4].render(0.49 * W, 0.385 * H, angle=ang, scale=sc * (1 + 0.006 * p),
                                   dx=dx, dy=dy, sweep=(local % 3.0) / 3.0)
        img.alpha_composite(w)
        # a gold seal ring drawing itself once
        seal = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(seal)
        cx, cy = W // 2, int(0.80 * H)
        r = int(0.115 * W)
        prog = ease(local / 0.9)
        d.arc([cx - r, cy - r, cx + r, cy + r], -90, -90 + 360 * prog,
              fill=(184, 146, 90, 150), width=4)
        d.ellipse([cx - r * 0.72, cy - r * 0.72, cx + r * 0.72, cy + r * 0.72],
                  outline=(184, 146, 90, 40), width=2)
        img.alpha_composite(seal)
        self.paste_text(img, 't_bar', 1.0)
        a = ease(local / 0.45)
        self.paste_text(img, 't_replace', a, dy=int(14 * (1 - a)))
        return img.convert('RGB')

    def render_five(self, t, local):
        arr = self.background('five', t)
        img = self.finish_bg(arr, int(t * FPS)).convert('RGBA')
        # breathing halo + expanding gold rings behind the 5 %
        p = pulse(t)
        halo = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(halo)
        cx, cy = W // 2, int(0.36 * H)
        r = int(0.24 * W)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 236, 200, int(14 + 10 * p)))
        for j in range(3):
            ph = (local * 0.33 + j / 3.0) % 1.0
            rr = int(0.10 * W + ph * 0.30 * W)
            aa = int(34 * (1 - ph))
            d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr],
                      outline=(184, 146, 90, aa), width=3)
        halo = halo.filter(ImageFilter.GaussianBlur(2))
        img.alpha_composite(halo)
        # slow diagonal shimmer across the pearl card
        sweep = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(sweep)
        off = int((local * 0.16 % 1.0) * W * 1.7 - W * 0.35)
        d.polygon([(off, 0), (off + 190, 0), (off + 190 - 320, H), (off - 320, H)],
                  fill=(255, 255, 255, 12))
        sweep = sweep.filter(ImageFilter.GaussianBlur(46))
        img.alpha_composite(sweep)
        # the type floats, very slightly
        dy = int(4 * math.sin(2 * math.pi * 0.22 * t))
        self.paste_text(img, 't_five', ease(local / 0.55), dy=dy)
        return img.convert('RGB')

    def render_cta(self, t, local):
        arr = self.background('cta', t)
        img = self.finish_bg(arr, int(t * FPS)).convert('RGBA')
        dx, dy, ang, sc = self.watch_motion(t, 1.0)
        p = pulse(t)
        w = self.watches[0].render(0.50 * W, 0.355 * H, angle=ang, scale=sc * (1 + 0.007 * p),
                                   dx=dx, dy=dy, sweep=(local % 3.6) / 3.6,
                                   tint=((26, 7, 16), (196, 120, 140)))
        img.alpha_composite(w)
        # CTA button glow, on the beat
        glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(glow)
        cx, cy = W // 2, int(0.60 * H)
        r = int(0.30 * W)
        d.ellipse([cx - r, cy - r * 0.32, cx + r, cy + r * 0.32], fill=(255, 220, 180, int(12 + 14 * p)))
        glow = glow.filter(ImageFilter.GaussianBlur(50))
        img.alpha_composite(glow)
        self.paste_text(img, 't_cta', ease(local / 0.55), dy=int(16 * (1 - ease(local / 0.55))))
        return img.convert('RGB')

    # ---------------------------------------------------------- frame
    def frame(self, t):
        if t < SCENES['hook'][1]:
            return self.render_hook(t, t)
        if t < SCENES['run'][1]:
            k = min(4, int((t - RUN0) / RUN_STEP))
            local = t - (RUN0 + k * RUN_STEP)
            return self.render_run(t, k, local)
        if t < SCENES['water'][1]:
            return self.render_water(t, t - SCENES['water'][0])
        if t < SCENES['replace'][1]:
            return self.render_replace(t, t - SCENES['replace'][0])
        if t < SCENES['five'][1]:
            return self.render_five(t, t - SCENES['five'][0])
        return self.render_cta(t, t - SCENES['cta'][0])

    def frame_blend(self, t):
        """Cross-dissolve the three interior boundaries; hard cuts elsewhere."""
        bounds = [
            (SCENES['run'][0], 'in'),
            (SCENES['water'][0], 'in'),
            (SCENES['replace'][0], 'in'),
            (SCENES['five'][0], 'hard'),
            (SCENES['cta'][0], 'hard'),
        ]
        d = 0.42
        for b, kind in bounds:
            if kind == 'hard':
                continue
            if b - d / 2 <= t < b + d / 2:
                k = ease((t - (b - d / 2)) / d)
                a = self.frame(b - d / 2 - 0.002)
                c = self.frame(b + d / 2 + 0.002)
                arr = np.asarray(a, np.float32) * (1 - k) + np.asarray(c, np.float32) * k
                return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
        return self.frame(t)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=OUT)
    ap.add_argument('--start', type=int, default=0)
    ap.add_argument('--end', type=int, default=NF)
    ap.add_argument('--test', default='')
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    r = Renderer()
    if args.test:
        for f in [int(x) for x in args.test.split(',')]:
            t = f / FPS
            r.frame_blend(t).save(f'{args.out}/test_{f:05d}.jpg', quality=94, subsampling=0)
            print('test', f, t, flush=True)
        return
    for i in range(args.start, args.end):
        t = i / FPS
        r.frame_blend(t).save(f'{args.out}/f_{i:05d}.jpg', quality=94, subsampling=0)
        if i % 30 == 0:
            print(f'frame {i}/{args.end}', flush=True)
    print('DONE', args.end, flush=True)


if __name__ == '__main__':
    main()
