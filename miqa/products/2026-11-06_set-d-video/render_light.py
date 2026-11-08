#!/usr/bin/env python3
"""Set D video v2 — "Velora Daylight" frame renderer (1080x1920, 30 fps).

Design brief (the fix for "the watches don't read"):
  * one watch per frame, at ~3x the size the old wall gave it; the dial is the
    brightest, sharpest object on screen at all times;
  * a warm ivory stage, so the rose-gold case and the crystals stay visible —
    the old plum stage swallowed them on a phone screen;
  * type lives in two reserved bands (top: brand + name, bottom: one line of
    design words) and never crosses the watch;
  * hard-edge slide between cards (no crossfade, nothing flashes);
  * one idea per frame, max two type blocks on screen.

The plates come from plates/light/ — high-key studio renders, not the website
stills.
"""
import argparse
import json
import math
import os
from collections import OrderedDict

import numpy as np
from PIL import Image

W, H, FPS = 1080, 1920, 30
BASE = 'miqa/products/2026-11-06_set-d-video'
WORK = f'{BASE}/work'
PLATES = f'{BASE}/plates/light'
LTEXT = f'{WORK}/ltext'
LIGHT = f'{WORK}/light'
SLIDE = 0.62


def ease_out(x):
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


class LRU(OrderedDict):
    def __init__(self, cap):
        super().__init__()
        self.cap = cap

    def get_(self, k):
        if k in self:
            self.move_to_end(k)
            return self[k]
        return None

    def put(self, k, v):
        self[k] = v
        self.move_to_end(k)
        while len(self) > self.cap:
            self.popitem(last=False)


class Renderer:
    def __init__(self, tl):
        self.tl = tl
        print('loading plates...', flush=True)
        self.plates = {}
        for f in sorted(os.listdir(PLATES)):
            if f.endswith('.png'):
                self.plates[f.split('_')[0]] = Image.open(f'{PLATES}/{f}').convert('RGB')

        print('loading type...', flush=True)
        self.text = {}
        for f in sorted(os.listdir(LTEXT)):
            if f.endswith('.png'):
                a = np.asarray(Image.open(f'{LTEXT}/{f}').convert('RGBA'), np.float32)
                self.text[f[:-4]] = (a[..., :3].astype(np.uint8), a[..., 3:4] / 255.0)

        # ---- ivory stage: warm paper, a soft champagne pool in the middle
        yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
        xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
        top = np.array([255, 252, 246], np.float32)
        bot = np.array([243, 231, 219], np.float32)
        stage = top[None, None, :] * (1 - yy[..., None]) + bot[None, None, :] * yy[..., None]
        stage = np.repeat(stage, W, axis=1)
        r = ((xx - 0.5) / 0.62) ** 2 + ((yy - 0.44) / 0.40) ** 2
        stage = stage + np.exp(-r * 1.9)[..., None] * np.array([10, 4, -8], np.float32)
        r2 = ((xx - 0.16) / 0.5) ** 2 + ((yy - 0.86) / 0.32) ** 2
        stage = stage + np.exp(-r2 * 2.2)[..., None] * np.array([9, 2, -6], np.float32)
        self.stage = np.clip(stage, 0, 255).astype(np.float32)

        # very light vignette: keeps the eye on the watch without dimming it
        self.vign = np.clip(1.0 - 0.10 * (((xx - 0.5) / 0.72) ** 2 + ((yy - 0.48) / 0.72) ** 2),
                            0.82, 1).astype(np.float32)[..., None]
        self.grain = [np.random.default_rng(700 + i).normal(0, 1.5, (H, W)).astype(np.float32)[..., None]
                      for i in range(6)]

        self._scene_cache = LRU(8)
        print('ready', flush=True)

    # ------------------------------------------------------------- helpers
    def type_layer(self, canvas, name, alpha=1.0, dy=0.0):
        if alpha <= 0.004 or name not in self.text:
            return
        rgb, a = self.text[name]
        if alpha < 0.996:
            a = a * alpha
        if abs(dy) > 0.5:
            sh = int(round(dy))
            a = np.roll(a, sh, axis=0)
            rgb = np.roll(rgb, sh, axis=0)
        canvas *= (1 - a)
        canvas += rgb.astype(np.float32) * a

    def finish(self, canvas, t):
        out = canvas + self.grain[int(t * FPS) % 6]
        out *= self.vign
        return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGB')

    def stage_with_glow(self, strength=1.0):
        return self.stage.copy()

    def grid4(self, cy=980.0, side=512, gap=22):
        """Hook frame: the four hero colourways as a clean 2x2 product grid, so
        every dial is big enough to read on a phone."""
        q = ('grid4', side, int(cy), gap)
        hit = self._scene_cache.get_(q)
        if hit is not None:
            return hit
        canvas = self.stage.copy()
        cx = W / 2
        cols = [cx - (side + gap) / 2, cx + (side + gap) / 2]
        rows = [cy - (side + gap) / 2, cy + (side + gap) / 2]
        for i, plate in enumerate(['p01', 'p02', 'p03', 'p04']):
            c = cols[i % 2]
            r = rows[i // 2]
            self.paste(canvas, plate, c, r, side, feather=0.16, crop=(0.17, 0.15, 0.83, 0.87))
        self._scene_cache.put(q, canvas)
        return canvas

    def card(self, plate, side, crop=None):
        """Crop (in fractions), then cover-resize to a square so nothing is
        stretched, then centre."""
        im = self.plates[plate]
        if crop:
            w0, h0 = im.size
            im = im.crop((int(crop[0] * w0), int(crop[1] * h0),
                          int(crop[2] * w0), int(crop[3] * h0)))
        sc = max(side / im.width, side / im.height)
        nw, nh = max(side, int(round(im.width * sc))), max(side, int(round(im.height * sc)))
        im = im.resize((nw, nh), Image.LANCZOS)
        x0 = (nw - side) // 2
        y0 = (nh - side) // 2
        return im.crop((x0, y0, x0 + side, y0 + side))

    def band(self, plate, width, crop, cy, feather=0.10):
        """A wide strip of a plate scaled to `width` — used for the 4-up lineup,
        where a square crop would cut the outer watches off."""
        q = ('band', plate, width, crop, int(cy))
        hit = self._scene_cache.get_(q)
        if hit is not None:
            return hit
        canvas = self.stage.copy()
        im = self.plates[plate]
        w0, h0 = im.size
        im = im.crop((int(crop[0] * w0), int(crop[1] * h0), int(crop[2] * w0), int(crop[3] * h0)))
        h = int(round(im.height * width / im.width))
        im = im.resize((width, h), Image.LANCZOS)
        arr = np.asarray(im, np.float32)
        x0 = (W - width) // 2
        y0 = int(cy - h / 2)
        fx = max(1, int(width * 0.05))
        fy = max(1, int(h * feather))
        yy = np.arange(h, dtype=np.float32)[:, None]
        xx = np.arange(width, dtype=np.float32)[None, :]
        my = np.clip(np.minimum(yy, h - 1 - yy) / fy, 0, 1)
        mx = np.clip(np.minimum(xx, width - 1 - xx) / fx, 0, 1)
        m = my * mx
        m = (m * m * (3 - 2 * m))[..., None]
        sx0, sy0 = max(0, -x0), max(0, -y0)
        dx0, dy0 = max(0, x0), max(0, y0)
        w = min(width - sx0, W - dx0)
        hh = min(h - sy0, H - dy0)
        if w > 0 and hh > 0:
            reg = canvas[dy0:dy0 + hh, dx0:dx0 + w]
            src = arr[sy0:sy0 + hh, sx0:sx0 + w]
            mm = m[sy0:sy0 + hh, sx0:sx0 + w]
            reg[:] = reg * (1 - mm) + src * mm
        self._scene_cache.put(q, canvas)
        return canvas

    def paste(self, canvas, plate, cx, cy, side, feather=0.10, crop=None):
        im = self.card(plate, side, crop)
        arr = np.asarray(im, np.float32)
        x0 = int(cx - side / 2)
        y0 = int(cy - side / 2)
        fx = max(1, int(side * feather))
        yy = np.arange(side, dtype=np.float32)[:, None]
        xxa = np.arange(side, dtype=np.float32)[None, :]
        my = np.clip(np.minimum(yy, side - 1 - yy) / fx, 0, 1)
        mx = np.clip(np.minimum(xxa, side - 1 - xxa) / fx, 0, 1)
        m = my * mx
        m = (m * m * (3 - 2 * m))[..., None]
        sx0, sy0 = max(0, -x0), max(0, -y0)
        dx0, dy0 = max(0, x0), max(0, y0)
        w = min(side - sx0, W - dx0)
        h = min(side - sy0, H - dy0)
        if w <= 0 or h <= 0:
            return
        reg = canvas[dy0:dy0 + h, dx0:dx0 + w]
        src = arr[sy0:sy0 + h, sx0:sx0 + w]
        mm = m[sy0:sy0 + h, sx0:sx0 + w]
        reg[:] = reg * (1 - mm) + src * mm

    def hero(self, plate, side=1040, cy=980.0, dx=0.0, feather=0.13, box=False, crop=None):
        """One plate as the scene card. The plate's own ivory background is
        feathered into the stage, so there is no visible seam — and because both
        are ivory, nothing looks cut out."""
        q = (plate, side, int(cy), int(dx), box, crop)
        hit = self._scene_cache.get_(q)
        if hit is not None:
            return hit
        canvas = self.stage.copy()
        im = self.card(plate, side, crop)
        arr = np.asarray(im, np.float32)
        y0 = int(cy - side / 2)
        x0 = (W - side) // 2 + int(dx)
        # feather all four edges into the ivory stage
        fx = max(1, int(side * feather))
        yy = np.arange(side, dtype=np.float32)[:, None]
        xxa = np.arange(side, dtype=np.float32)[None, :]
        my = np.clip(np.minimum(yy, side - 1 - yy) / fx, 0, 1)
        mx = np.clip(np.minimum(xxa, side - 1 - xxa) / (fx * 0.55), 0, 1)
        m = (my * mx)
        m = m * m * (3 - 2 * m)
        m = m[..., None]
        sx0, sy0 = max(0, -x0), max(0, -y0)
        dx0, dy0 = max(0, x0), max(0, y0)
        w = min(side - sx0, W - dx0)
        h = min(side - sy0, H - dy0)
        if w > 0 and h > 0:
            reg = canvas[dy0:dy0 + h, dx0:dx0 + w]
            src = arr[sy0:sy0 + h, sx0:sx0 + w]
            mm = m[sy0:sy0 + h, sx0:sx0 + w]
            reg[:] = reg * (1 - mm) + src * mm
        self._scene_cache.put(q, canvas)
        return canvas

    def blit_frame(self, dst, src, dx):
        if dx >= W or dx <= -W:
            return
        if dx > 0:
            w = W - dx
            if w > 0:
                dst[:, dx:] = src[:, :w]
        else:
            w = W + dx
            if w > 0:
                dst[:, :w] = src[:, -dx:]

    def edge_shade(self, canvas, x, strength=0.30, width=90):
        a0 = max(0, int(x - width))
        a1 = min(W, int(x))
        if a1 <= a0:
            return
        ramp = np.linspace(0.0, 1.0, a1 - a0, dtype=np.float32)[None, :, None] ** 1.6
        canvas[:, a0:a1] *= (1.0 - ramp * strength)

    def push(self, prev, cur, e):
        """Hard-edge slide: the next card pushes the last one out to the left."""
        canvas = self.stage.copy()
        off = e * (W + 24)
        self.blit_frame(canvas, prev, int(round(-off)))
        self.blit_frame(canvas, cur, int(round(W - off)))
        self.edge_shade(canvas, W - off + 1, 0.16, 140)
        return canvas

    def scene_at(self, t):
        for sc in self.tl['scenes']:
            if sc['t0'] <= t < sc['t1']:
                return sc
        return self.tl['scenes'][-1]

    # -------------------------------------------------------------- shots
    def frame(self, t, idx=0):
        sc = self.scene_at(t)
        kind = sc['kind']
        t0 = sc['t0']
        lt = t - t0
        dur = max(0.6, sc['t1'] - t0)
        # every photo scene gets a tiny, slow push-in — motion without a pulse
        z = 1.0 + 0.020 * ease_in_out(min(1.0, lt / dur))

        if kind in ('hook', 'cta'):
            k = lt / SLIDE
            prevp = sc.get('prev')
            if kind == 'hook':
                # all four colourways in one frame: the viewer gets the range in
                # the first 3 seconds, before we go in close on each watch
                cur = self.band('p05', int(1096 * z), (0.0, 0.17, 1.0, 0.74), 880, feather=0.10)
                prev = None
            else:
                cur = self.grid4(cy=842, side=int(468 * z), gap=18)
                prev = self.hero(prevp, side=int(1188 * z), cy=902, feather=0.13,
                                 crop=(0.06, 0.06, 0.94, 0.99)) if prevp else None
            if k < 1.0 and prevp and prev is not None:
                canvas = self.push(prev, cur, ease_in_out(k))
            else:
                canvas = cur.copy()
            if kind == 'hook':
                a = ease_out((t - 0.10) / 0.60)
                self.type_layer(canvas, 'brand', a, dy=30 * (1 - a))
                pa = ease_out((t - 0.85) / 0.55)
                self.type_layer(canvas, 'hookprice', pa, dy=26 * (1 - pa))
            else:
                a = ease_out((t - t0 - 0.10) / 0.55)
                self.type_layer(canvas, 'cta', a, dy=30 * (1 - a))
            return self.finish(canvas, t)

        if kind == 'watch':
            plate = sc['plate']
            cur = self.hero(plate, side=int(1188 * z), cy=902, feather=0.13,
                            crop=(0.06, 0.06, 0.94, 0.99))
            k = lt / SLIDE
            if k < 1.0:
                canvas = self.push(self.hero(sc['prev'], side=int(1188 * z), cy=902, feather=0.13,
                                             crop=(0.06, 0.06, 0.94, 0.99)),
                                   cur, ease_in_out(k))
            else:
                canvas = cur.copy()
            ni = ease_out((t - sc['name_in']) / 0.42)
            no = 1.0 - ease_out((t - sc['name_out']) / 0.38)
            a = max(0.0, min(ni, no))
            self.type_layer(canvas, 'kick', ease_out((t - t0 - 0.10) / 0.45))
            if a > 0.004:
                self.type_layer(canvas, 'name_' + sc['n'], a, dy=24 * (1 - ni))
            return self.finish(canvas, t)

        if kind == 'photo':
            plate = sc['plate']
            if plate == 'p08':                     # macro: keep the whole bezel arc
                side, cy, crop = int(1080 * z), 862, (0.0, 0.0, 1.0, 1.0)
            elif plate == 'p07':                   # gift box, framed on the watch
                side, cy, crop = int(1060 * z), 900, (0.10, 0.06, 0.90, 0.94)
            else:                                  # on the wrist
                side, cy, crop = int(1150 * z), 890, (0.0, 0.0, 1.0, 1.0)
            cur = self.hero(plate, side=side, cy=cy, feather=0.15, crop=crop)
            k = lt / SLIDE
            if k < 1.0:
                canvas = self.push(self.hero(sc['prev'], side=side, cy=cy, feather=0.15, crop=crop),
                                   cur, ease_in_out(k))
            else:
                canvas = cur.copy()
            a = ease_out((t - t0 - 0.42) / 0.45)
            name = 'detail' if plate == 'p08' else ('water' if plate == 'p06' else 'gift')
            self.type_layer(canvas, name, a, dy=22 * (1 - a))
            return self.finish(canvas, t)

        # type-only cards: pledge + replacement
        canvas = self.stage.copy()
        if kind == 'five':
            a = ease_out((t - t0 - 0.12) / 0.55)
            self.type_layer(canvas, 'five', a, dy=26 * (1 - a))
        elif kind == 'replace':
            a = ease_out((t - t0 - 0.12) / 0.55)
            self.type_layer(canvas, 'replace', a, dy=26 * (1 - a))
        return self.finish(canvas, t)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='/tmp/lframes')
    ap.add_argument('--start', type=int, default=0)
    ap.add_argument('--end', type=int, default=0)
    ap.add_argument('--test', default='')
    ap.add_argument('--timeline', default=f'{LIGHT}/timeline.json')
    args = ap.parse_args()
    tl = json.load(open(args.timeline))
    os.makedirs(args.out, exist_ok=True)
    r = Renderer(tl)
    end = args.end or tl['frames']
    if args.test:
        for f in [int(x) for x in args.test.split(',')]:
            r.frame(f / FPS, f).save(f'{args.out}/test_{f:05d}.jpg', quality=94, subsampling=0)
            print('test', f, flush=True)
        return
    for i in range(args.start, end):
        r.frame(i / FPS, i).save(f'{args.out}/f_{i:05d}.jpg', quality=94, subsampling=0)
        if i % 90 == 0:
            print(f'frame {i}/{end}', flush=True)
    print('DONE', end, flush=True)


if __name__ == '__main__':
    main()
