#!/usr/bin/env python3
"""Set C video — "Octavia Rosewood" frame renderer (1080x1920, 30 fps).

Two shots, one look:
  1. the wall  — all five Octavias on rosewood silk: three on the upper row,
     two centred below. Inside the first three seconds the whole set is already
     in frame and the highlighted watch changes every 0.9 s, so the viewer sees
     three designs and the ৳৩৫০ hook immediately. Afterwards it sways slowly.
  2. the reel  — the camera settles on one watch at a time; the previous watch
     drifts left and out, the name card slides in from the right. Slow
     crossfades, never a hard cut.

Plates are 1024² renders in their own theme (wine-plum silk, candle-warm key,
champagne-gold rim), independent of the website stills.
"""
import argparse
import json
import math
import os
from collections import OrderedDict

import numpy as np
from PIL import Image

W, H, FPS = 1080, 1920, 30
BASE = 'miqa/products/2026-11-05_set-c-video'
WORK = f'{BASE}/work'
SLIDE = 0.62            # one clean slide, keep in step with the build scripts
PLATES = f'{BASE}/plates'
DTEXT = f'{WORK}/dtextc'
DARK = f'{WORK}/darkc'

COLS, ROWS = 3, 2
CELL_W, CELL_H = 300, 372          # tile size on the wall
GAP_X = 16
GAP_Y = 14
WALL_Y = 392


def ease_out(x):
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def smooth(x):
    return ease_in_out(x)


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
        for n in range(1, 6):
            im = Image.open(f'{PLATES}/p{n:02d}.png').convert('RGB')
            self.plates[n] = im
        for extra in ('wrist', 'macro'):
            p = f'{PLATES}/{extra}.png'
            if os.path.exists(p):
                self.plates[extra] = Image.open(p).convert('RGB')
        self.tiles = {}
        for n, im in self.plates.items():
            # 1024² plate -> 300x380 tile: cover-crop (zoom in ~40 %), never letterbox
            sc = max(CELL_W / im.width, CELL_H / im.height) * 1.12
            nw, nh = int(im.width * sc), int(im.height * sc)
            big = im.resize((nw, nh), Image.LANCZOS)
            x0 = (nw - CELL_W) // 2
            y0 = int(min(max(0, (nh - CELL_H) * 0.46), nh - CELL_H))
            self.tiles[n] = big.crop((x0, y0, x0 + CELL_W, y0 + CELL_H))

        print('loading type...', flush=True)
        self.text = {}
        for f in sorted(os.listdir(DTEXT)):
            if f.endswith('.png'):
                lay = Image.open(f'{DTEXT}/{f}').convert('RGBA')
                a = np.asarray(lay, np.float32)
                self.text[f[:-4]] = (a[..., :3].astype(np.uint8), a[..., 3:4].astype(np.float32) / 255.0)

        # ---- the stage gradient (deep wine, candle light lower left)
        yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
        xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
        top = np.array([46, 16, 20], np.float32)
        bot = np.array([18, 6, 9], np.float32)
        stage = top[None, None, :] * (1 - yy[..., None]) + bot[None, None, :] * yy[..., None]
        stage = np.repeat(stage, W, axis=1)
        r = ((xx - 0.22) / 0.55) ** 2 + ((yy - 0.72) / 0.42) ** 2
        stage = stage + np.exp(-r * 2.1)[..., None] * np.array([104, 52, 34], np.float32)
        r2 = ((xx - 0.78) / 0.45) ** 2 + ((yy - 0.18) / 0.34) ** 2
        stage = stage + np.exp(-r2 * 2.6)[..., None] * np.array([84, 36, 40], np.float32)
        self.stage = stage
        self.stage = np.clip(self.stage, 0, 255).astype(np.float32)
        self.vign = np.clip(1.0 - 0.42 * (((xx - 0.5) / 0.66) ** 2 + ((yy - 0.46) / 0.66) ** 2), 0.15, 1
                            ).astype(np.float32)[..., None]
        self.grain = [np.random.default_rng(300 + i).normal(0, 2.6, (H, W)).astype(np.float32)[..., None]
                      for i in range(6)]
        # slow breathing light
        self.bloom = float(os.environ.get('BLOOM', '1'))

        self._scene_cache = LRU(6)
        self._frame_cache = LRU(3)
        print('ready', flush=True)

    # ------------------------------------------------------------- helpers
    def wall_layout(self, t, focus, scale=1.0):
        """Five watches: three on the upper row, two centred below."""
        out = []
        ph = t * 0.18
        cw, ch = CELL_W * scale, CELL_H * scale
        gx, gy = GAP_X * scale, GAP_Y * scale
        for i in range(5):
            if i < 3:
                row, col, ncol = 0, i, 3
            else:
                row, col, ncol = 1, i - 3, 2
            x = (W - (ncol * cw + (ncol - 1) * gx)) / 2 + col * (cw + gx)
            y = WALL_Y + row * (ch + gy)
            dx = 9 * math.sin(ph + row * 0.5)
            dy = 7 * math.cos(ph * 0.8 + col * 0.6)
            out.append((i + 1, x + dx, y + dy, col, row))
        return out

    def paste_tile(self, canvas, plate, x, y, scale=1.0, alpha=1.0, lift=0.0):
        if alpha <= 0.004:
            return
        im = self.tiles[plate]
        tw, th = CELL_W, CELL_H
        if scale != 1.0:
            tw = int(round(CELL_W * scale))
            th = int(round(CELL_H * scale))
            im = im.resize((tw, th), Image.LANCZOS)
        x0 = int(round(x - (tw - CELL_W) / 2))
        y0 = int(round(y - (th - CELL_H) / 2))
        src = np.asarray(im, np.float32)
        if lift:
            src = src * (1.0 + lift)
        sx0 = max(0, -x0)
        sy0 = max(0, -y0)
        dx0 = max(0, x0)
        dy0 = max(0, y0)
        w = min(tw - sx0, W - dx0)
        h = min(th - sy0, H - dy0)
        if w <= 0 or h <= 0:
            return
        region = canvas[dy0:dy0 + h, dx0:dx0 + w]
        s = src[sy0:sy0 + h, sx0:sx0 + w]
        if alpha >= 0.996:
            region[:] = s
        else:
            region[:] = region * (1 - alpha) + s * alpha

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

    def focus_at(self, t):
        """Which tile the wall is highlighting, and since when."""
        wl = self.tl['wall']
        cur = wl[0]
        for c in wl:
            if c['t'] <= t:
                cur = c
            else:
                break
        return cur

    # --------------------------------------------------------------- shots
    def wall(self, t):
        cur = self.focus_at(t)
        canvas = self.stage.copy()
        # the wall opens like a curtain over the first half second
        a0 = ease_out(t / 0.50)
        # whole-wall push-in over the first six seconds, then a slow sway
        push = 0.86 + 0.14 * smooth(t / 6.0)
        sway_x = 12 * math.sin(t * 0.22)
        sway_y = 8 * math.sin(t * 0.17 + 1.1)
        layout = self.wall_layout(t, cur['focus'], scale=1.0)
        focus = cur['focus'] + 1
        cx, cy = W / 2, H * 0.475
        for plate, x, y, c, r in layout:
            tw, th = CELL_W * push, CELL_H * push
            sx = cx + (x + CELL_W / 2 - cx) * push - tw / 2 + sway_x
            sy = cy + (y + CELL_H / 2 - cy) * push - th / 2 + sway_y
            # tiles cascade in with the curtain
            delay = (r * 0.045) + (c * 0.018)
            aa = ease_out((t - delay) / 0.55) * a0
            if plate == focus:
                k = min(1.0, max(0.0, (t - cur['t']) / 0.32))
                e = ease_out(k)
                self.paste_tile(canvas, plate, sx, sy, scale=push * (1 + 0.09 * e),
                                alpha=aa, lift=0.14 * e)
                self.frame_tile(canvas, sx - tw * 0.045, sy - th * 0.045,
                                tw * 1.09, th * 1.09, 0.60 * e * aa)
            else:
                self.paste_tile(canvas, plate, sx, sy, scale=push, alpha=aa)
                self.veil(canvas, sx, sy, tw, th, 1 - (0.70 if t < 3.0 else 0.82))
        return canvas

    def veil(self, canvas, x, y, w, h, amount):
        if amount <= 0.01:
            return
        x0, y0 = int(max(0, x)), int(max(0, y))
        x1, y1 = int(min(W, x + w)), int(min(H, y + h))
        if x1 <= x0 or y1 <= y0:
            return
        region = canvas[y0:y1, x0:x1]
        region *= (1 - amount * 0.55)

    def frame_tile(self, canvas, x, y, w, h, alpha):
        if alpha <= 0.01:
            return
        col = np.array([242, 205, 174], np.float32) * alpha
        x0, y0 = int(round(x)), int(round(y))
        x1, y1 = int(round(x + w)), int(round(y + h))
        t = 2
        for (a0, a1, b0, b1) in [(x0, x1, y0, y0 + t), (x0, x1, y1 - t, y1),
                                 (x0, x0 + t, y0, y1), (x1 - t, x1, y0, y1)]:
            a0, b0 = max(0, a0), max(0, b0)
            a1, b1 = min(W, a1), min(H, b1)
            if a1 > a0 and b1 > b0:
                canvas[b0:b1, a0:a1] = canvas[b0:b1, a0:a1] * 0.35 + col * 0.65

    def hero(self, plate, zoom=1.0, dx=0.0, dy=0.0):
        """One plate as a scene card on the dark stage: the watch sits in the
        middle third, the stage carries the title above and the name below.
        The plate's edges are feathered into the stage, so there is no seam."""
        q = (plate, round(zoom, 3), int(round(dx)), int(round(dy)))
        hit = self._scene_cache.get_(q)
        if hit is not None:
            return hit
        canvas = self.stage.copy()
        side = int(round(W * 1.06 * q[1]))
        im = self.plates[plate].resize((side, side), Image.LANCZOS)
        arr = np.asarray(im, np.float32)
        cy = int(H * 0.495 + q[3])
        y0 = cy - side // 2
        x0 = (W - side) // 2 + q[2]
        # feather the top/bottom 9 % of the plate into the stage
        fy = int(side * 0.09)
        yy = np.arange(side, dtype=np.float32)[:, None]
        m = np.clip(np.minimum(yy, side - 1 - yy) / fy, 0, 1)[:, :, None]
        m = m * m * (3 - 2 * m)
        sx0 = max(0, -x0)
        sy0 = max(0, -y0)
        dx0 = max(0, x0)
        dy0 = max(0, y0)
        w = min(side - sx0, W - dx0)
        h = min(side - sy0, H - dy0)
        if w > 0 and h > 0:
            w = min(w, side - sx0, W - dx0)
            h = min(h, side - sy0, H - dy0)
        else:
            w = h = 0
        if w > 0 and h > 0:
            reg = canvas[dy0:dy0 + h, dx0:dx0 + w]
            src = arr[sy0:sy0 + h, sx0:sx0 + w]
            mm = m[sy0:sy0 + h]          # column mask, broadcasts across the crop width
            reg[:] = reg * (1 - mm) + src * mm
        self._scene_cache.put(q, canvas)
        return canvas

    def blit_frame(self, dst, src, dx):
        """Place a full-frame image at column dx (positive = to the right)."""
        if dx >= W or dx <= -W:
            return
        if dx > 0:
            w = W - dx
            if w <= 0:
                return
            dst[:, dx:] = src[:, :w]
        else:
            w = W + dx
            if w <= 0:
                return
            dst[:, :w] = src[:, -dx:]

    def edge_shade(self, canvas, x, strength=0.55, width=110):
        """Soft shadow just left of the seam: the push reads as a card sliding."""
        a0 = max(0, int(x - width))
        a1 = min(W, int(x))
        if a1 <= a0:
            return
        ramp = np.linspace(0.0, 1.0, a1 - a0, dtype=np.float32)[None, :, None] ** 1.5
        canvas[:, a0:a1] *= (1.0 - ramp * strength)

    def push(self, prev, cur, e):
        """Hard-edge slide: the new card arrives from the right and pushes the old
        one out to the left. No alpha blending at any moment, so nothing flashes."""
        canvas = self.stage.copy()
        off = e * (W + 26)
        self.blit_frame(canvas, prev, int(round(-off)))
        self.blit_frame(canvas, cur, int(round(W - off)))
        self.edge_shade(canvas, W - off + 1, 0.6, 120)
        return canvas

    def scene_at(self, t):
        for sc in self.tl['scenes']:
            if sc['t0'] <= t < sc['t1']:
                return sc
        return self.tl['scenes'][-1]

    def frame(self, t, idx=0):
        sc = self.scene_at(t)
        kind = sc['kind']
        if kind in ('hook', 'wall'):
            canvas = self.wall(t)
            if kind == 'hook':
                a = ease_out((t - 0.10) / 0.55)
                self.type_layer(canvas, 'brand', a, dy=26 * (1 - a))
                p_in = ease_out((t - 0.55) / 0.50)
                self.type_layer(canvas, 'price', p_in, dy=26 * (1 - p_in))
            else:
                a = ease_out((t - sc['t0'] - 0.05) / 0.45)
                self.type_layer(canvas, 'kick', a, dy=20 * (1 - a))
                pa = ease_out((t - sc['t0'] - 0.35) / 0.45)
                self.type_layer(canvas, 'price', pa, dy=18 * (1 - pa))
            self.type_layer(canvas, 'strip', ease_out((t - 0.7) / 0.6))
            return self.finish(canvas, t)
        if kind == 'watch':
            return self.watch(sc, t)
        return self.feature(sc, t)

    def watch(self, sc, t):
        n = int(sc['n'])
        dur = max(0.6, sc['t1'] - sc['t0'])
        t0 = sc['t0']
        lt = t - t0
        z = 1.0 + 0.018 * smooth(min(1.0, lt / dur))      # one slow push-in, no pulse
        cur = self.hero(n, zoom=z, dy=-28)
        k = lt / SLIDE
        if k < 1.0:
            prev = n - 1 if n > 1 else 5
            canvas = self.push(self.hero(prev, zoom=z, dy=-28), cur, smooth(k))
        else:
            canvas = cur.copy()

        ni = ease_out((t - sc['name_in']) / 0.45)
        no = 1.0 - ease_out((t - sc['name_out']) / 0.40)
        a = max(0.0, min(ni, no))
        if a > 0.004:
            self.type_layer(canvas, 'namescrim', a * 0.95)
            self.type_layer(canvas, 'name_' + sc['n'], a, dy=26 * (1 - ni))
        self.type_layer(canvas, 'strip', 1.0)
        return self.finish(canvas, t)

    def feature(self, sc, t):
        plate = int(sc['plate'][1:])
        prev_plate = int(sc['prev'][1:]) if 'prev' in sc else plate
        dur = max(0.6, sc['t1'] - sc['t0'])
        t0 = sc['t0']
        z = 1.0 + 0.016 * smooth(min(1.0, (t - t0) / dur))
        cur = self.hero(plate, zoom=z, dy=-28)
        k = (t - t0) / SLIDE
        if k < 1.0:
            canvas = self.push(self.hero(prev_plate, zoom=z, dy=-28), cur, smooth(k))
        else:
            canvas = cur.copy()
        a = ease_out((t - t0 - 0.55) / 0.45)
        name = 'cta' if sc['kind'] == 'cta' else sc['kind']
        self.type_layer(canvas, name, a, dy=22 * (1 - a))
        if sc['kind'] != 'cta':
            self.type_layer(canvas, 'strip', a)
        return self.finish(canvas, t)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='/tmp/vframes')
    ap.add_argument('--start', type=int, default=0)
    ap.add_argument('--end', type=int, default=0)
    ap.add_argument('--test', default='')
    ap.add_argument('--timeline', default=f'{DARK}/timeline.json')
    args = ap.parse_args()
    tl = json.load(open(args.timeline))
    os.makedirs(args.out, exist_ok=True)
    r = Renderer(tl)
    total = tl['frames']
    end = args.end or total
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
