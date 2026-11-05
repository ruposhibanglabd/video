#!/usr/bin/env python3
"""Set C v4 — generated whole-watch plates in the MIQA Blush Couture theme.

The client asked for new images, made by us, close to the real product and in
our theme. v4 uses five newly generated 1024x1024 plates (based on the original
product photos) and keeps each whole watch in frame. No cutouts, no separate
background, no chip band. Type sits below the watch, never over it.

Scene map (cuts on the 90 BPM beat):
  hook      0.000 -  5.333   black watch, price
  run       5.333 - 12.000   five colourways, 1.333 s each
  water    12.000 - 18.000   pink watch, water resistance
  replace  18.000 - 21.333   white watch, 7-day replacement
  five     21.333 - 26.667   pearl card, 5 % pledge
  cta      26.667 - 31.500   black watch, CTA
"""
import argparse
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H, FPS = 1080, 1920, 30
IMG = 1080
TOTAL = 31.5
NF = int(round(TOTAL * FPS))
BEAT = 60.0 / 90.0

BASE = 'miqa/products/2026-11-05_set-c-video'
PLATE = f'{BASE}/work/gen_v3'
LAY = f'{BASE}/plates/text'
OUT = '/tmp/cframes4'

SLUGS = ['01_black.jpg', '02_pink.jpg', '03_heart_black.jpg', '04_green.jpg', '05_white.jpg']
RUN_TXT = ['t_c1', 't_c2', 't_c3', 't_c4', 't_c5']
SCENES = {
    'hook': (0.0, 5.333),
    'run': (5.333, 12.0),
    'water': (12.0, 18.0),
    'replace': (18.0, 21.333),
    'five': (21.333, 26.667),
    'cta': (26.667, 31.5),
}
RUN_STEP = (SCENES['run'][1] - SCENES['run'][0]) / 5.0


def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def pulse(t):
    p = (t % BEAT) / BEAT
    return (1.0 - p) ** 3


def load_text():
    out = {}
    for name in ['t_bar', 't_hook', 't_c1', 't_c2', 't_c3', 't_c4', 't_c5',
                 't_water', 't_replace', 't_five', 't_cta']:
        out[name] = Image.open(f'{LAY}/{name}.png').convert('RGBA').resize((W, H), Image.LANCZOS)
    return out


def make_band():
    band = Image.new('L', (IMG, IMG), 0)
    d = ImageDraw.Draw(band)
    step = 12
    for x in range(-IMG, IMG * 2, step):
        d.line([(x, 0), (x + IMG, IMG)], fill=255, width=step)
    band = band.filter(ImageFilter.GaussianBlur(26))
    return np.asarray(band, np.float32) / 255.0


class Renderer:
    def __init__(self):
        print('loading generated plates...', flush=True)
        self.plates = [Image.open(f'{PLATE}/{s}').convert('RGB') for s in SLUGS]
        self.text = load_text()
        self.band = make_band()
        yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
        xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
        top = np.array([255, 247, 243], np.float32)
        bot = np.array([244, 201, 214], np.float32)
        arr = top[None, None, :] * (1 - yy[..., None]) + bot[None, None, :] * yy[..., None]
        r2 = ((xx - 0.5) / 0.55) ** 2 + ((yy - 0.36) / 0.42) ** 2
        arr = arr + np.exp(-r2 * 2.4)[..., None] * np.array([255, 252, 248], np.float32) * 0.55
        self.card = np.clip(arr, 0, 255).astype(np.float32)
        self.grain = [np.random.default_rng(100 + i).normal(0, 2.0, (H, W)).astype(np.float32)[..., None]
                      for i in range(4)]
        yy2 = np.linspace(0, 1, H, dtype=np.float32)[:, None]
        xx2 = np.linspace(0, 1, W, dtype=np.float32)[None, :]
        self.vign = np.clip(1.0 - 0.30 * (((xx2 - 0.5) / 0.62) ** 2 + ((yy2 - 0.46) / 0.62) ** 2), 0, 1)[..., None].astype(np.float32)
        print('ready', flush=True)

    def picture(self, idx, t, phase=0.0, zoom=0.018, pan=7.0, sweep=True):
        plate = self.plates[idx]
        p = ease((t % 3.2) / 3.2)
        z = 1.0 + zoom * (0.5 - 0.5 * math.cos(2 * math.pi * 0.055 * t + phase))
        z *= 1.0 + 0.0025 * pulse(t)
        cw = plate.width / z
        ch = plate.height / z
        cx = plate.width / 2 + pan * math.sin(2 * math.pi * 0.071 * t + phase)
        cy = plate.height / 2 + pan * 0.8 * math.cos(2 * math.pi * 0.053 * t + phase + 1.0)
        x0 = min(max(0, cx - cw / 2), plate.width - cw)
        y0 = min(max(0, cy - ch / 2), plate.height - ch)
        im = plate.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((IMG, IMG), Image.LANCZOS)
        if sweep:
            off = int((p * 1.8 - 0.4) * IMG)
            band = np.roll(self.band, off, axis=1)
            a = np.asarray(im, np.float32)
            a = a + band[..., None] * np.array([255, 248, 236], np.float32) * 0.10
            im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGB')
        return im

    def canvas(self, im, t, text_name, text_alpha=1.0, text_dy=0, glow=0.0):
        arr = np.asarray(im, np.float32)
        bottom = arr[-1:].astype(np.float32)
        ext = np.repeat(bottom, H - IMG, axis=0)
        full = np.vstack([arr, ext])
        if glow > 0:
            yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
            xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
            r2 = ((xx - 0.5) / 0.55) ** 2 + ((yy - 0.78) / 0.28) ** 2
            g = np.exp(-r2 * 3.0)[..., None] * np.array([255, 226, 196], np.float32)
            full = full + g * glow
        full = full + self.grain[int(t * FPS) % 4]
        full = full * self.vign
        img = Image.fromarray(np.clip(full, 0, 255).astype(np.uint8), 'RGB').convert('RGBA')
        if text_alpha > 0.004:
            lay = self.text[text_name]
            if text_alpha < 0.999:
                lay = lay.copy()
                lay.putalpha(lay.getchannel('A').point(lambda v: int(v * text_alpha)))
            if abs(text_dy) > 0.5:
                lay = Image.fromarray(np.roll(np.asarray(lay), int(text_dy), axis=0))
            img.alpha_composite(lay)
        return img.convert('RGB')

    def render_hook(self, t):
        im = self.picture(0, t, phase=0.0, zoom=0.020, pan=7)
        a_bar = ease(t / 0.5)
        a_hook = ease((t - 0.30) / 0.65)
        img = self.canvas(im, t, 't_hook', a_hook, int(14 * (1 - a_hook)), glow=0.10 + 0.05 * pulse(t))
        if a_bar > 0.004:
            lay = self.text['t_bar']
            if a_bar < 0.999:
                lay = lay.copy()
                lay.putalpha(lay.getchannel('A').point(lambda v: int(v * a_bar)))
            img = Image.alpha_composite(img.convert('RGBA'), lay).convert('RGB')
        return img

    def render_run(self, t, k, local):
        im = self.picture(k, t, phase=k * 1.3, zoom=0.018, pan=6)
        img = self.canvas(im, t, RUN_TXT[k], ease(local / 0.30), int(12 * (1 - ease(local / 0.30))), glow=0.06)
        return Image.alpha_composite(img.convert('RGBA'), self.text['t_bar']).convert('RGB')

    def render_water(self, t, local):
        im = self.picture(1, t, phase=2.1, zoom=0.016, pan=6)
        img = self.canvas(im, t, 't_water', ease(local / 0.45), int(14 * (1 - ease(local / 0.45))), glow=0.05)
        rip = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(rip)
        for j in range(3):
            ph = (local * 0.22 + j / 3.0) % 1.0
            r = int(0.08 * W + ph * 0.42 * W)
            a = int(22 * (1 - ph))
            d.ellipse([W // 2 - r, int(0.34 * H) - r, W // 2 + r, int(0.34 * H) + r],
                      outline=(190, 235, 235, a), width=3)
        rip = rip.filter(ImageFilter.GaussianBlur(3))
        img = Image.alpha_composite(img.convert('RGBA'), rip).convert('RGB')
        return Image.alpha_composite(img.convert('RGBA'), self.text['t_bar']).convert('RGB')

    def render_replace(self, t, local):
        im = self.picture(4, t, phase=4.0, zoom=0.016, pan=6)
        img = self.canvas(im, t, 't_replace', ease(local / 0.45), int(14 * (1 - ease(local / 0.45))), glow=0.06)
        seal = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(seal)
        cx, cy = W // 2, int(0.80 * H)
        r = int(0.105 * W)
        prog = ease(local / 0.9)
        d.arc([cx - r, cy - r, cx + r, cy + r], -90, -90 + 360 * prog, fill=(184, 146, 90, 150), width=4)
        img = Image.alpha_composite(img.convert('RGBA'), seal).convert('RGB')
        return Image.alpha_composite(img.convert('RGBA'), self.text['t_bar']).convert('RGB')

    def render_five(self, t, local):
        p = pulse(t)
        arr = self.card.copy()
        yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
        xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
        r2 = ((xx - 0.5) / 0.34) ** 2 + ((yy - 0.36) / 0.30) ** 2
        arr = arr + np.exp(-r2 * 2.4)[..., None] * np.array([255, 236, 200], np.float32) * (0.10 + 0.05 * p)
        arr = arr + self.grain[int(t * FPS) % 4]
        arr = arr * self.vign
        img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB').convert('RGBA')
        rings = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(rings)
        cx, cy = W // 2, int(0.36 * H)
        for j in range(3):
            ph = (local * 0.33 + j / 3.0) % 1.0
            rr = int(0.10 * W + ph * 0.30 * W)
            d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=(184, 146, 90, int(34 * (1 - ph))), width=3)
        rings = rings.filter(ImageFilter.GaussianBlur(2))
        img = Image.alpha_composite(img, rings)
        dy = int(4 * math.sin(2 * math.pi * 0.22 * t))
        lay = self.text['t_five']
        a = ease(local / 0.55)
        if a < 0.999:
            lay = lay.copy()
            lay.putalpha(lay.getchannel('A').point(lambda v: int(v * a)))
        img = Image.alpha_composite(img, Image.fromarray(np.roll(np.asarray(lay), dy, axis=0)))
        return img.convert('RGB')

    def render_cta(self, t, local):
        im = self.picture(0, t, phase=1.0, zoom=0.018, pan=6)
        img = self.canvas(im, t, 't_cta', ease(local / 0.55), int(16 * (1 - ease(local / 0.55))), glow=0.10 + 0.06 * pulse(t))
        return img

    def frame(self, t):
        if t < SCENES['hook'][1]:
            return self.render_hook(t)
        if t < SCENES['run'][1]:
            k = min(4, int((t - SCENES['run'][0]) / RUN_STEP))
            local = t - (SCENES['run'][0] + k * RUN_STEP)
            return self.render_run(t, k, local)
        if t < SCENES['water'][1]:
            return self.render_water(t, t - SCENES['water'][0])
        if t < SCENES['replace'][1]:
            return self.render_replace(t, t - SCENES['replace'][0])
        if t < SCENES['five'][1]:
            return self.render_five(t, t - SCENES['five'][0])
        return self.render_cta(t, t - SCENES['cta'][0])

    def frame_blend(self, t):
        bounds = [(SCENES['water'][0], 0.30), (SCENES['replace'][0], 0.30)]
        for b, d in bounds:
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
            r.frame_blend(f / FPS).save(f'{args.out}/test_{f:05d}.jpg', quality=94, subsampling=0)
            print('test', f, flush=True)
        return
    for i in range(args.start, args.end):
        r.frame_blend(i / FPS).save(f'{args.out}/f_{i:05d}.jpg', quality=94, subsampling=0)
        if i % 30 == 0:
            print(f'frame {i}/{args.end}', flush=True)
    print('DONE', args.end, flush=True)


if __name__ == '__main__':
    main()
