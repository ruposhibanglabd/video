#!/usr/bin/env python3
"""Set D — "Velora" slide reel (1080x1920, 30 fps).

Motion the client asked for: one look after another slides in from the right and
settles mid-frame, each product bringing its name with it, pushing the previous
picture out to the left. Every product shows five looks, so each watch gets its
own little run of slides, and the narration keeps talking *between* those slides.

Stills are 1300² cards from the finished set-D delivery, rebuilt at 1080². Each
card is blended into a warm ivory stage sampled from its own backdrop, so a card
leaving the frame never shows a hard edge. Memory is kept low on purpose: cards
are composited against the stage once and cached as uint8 (a 1080x1920 float
frame is 25 MB, and this box only has 4 GB).
"""
import argparse
import json
import math
import os
from collections import OrderedDict

import numpy as np
from PIL import Image

W, H, FPS = 1080, 1920, 30
CARD = 1080
CARD_Y = 400
SLIDE = 0.46                     # keep in step with build.py

BASE = 'miqa/products/2026-11-06_set-d-video'
WORK = f'{BASE}/work'
CARDS = f'{WORK}/cards'
TEXT = f'{WORK}/text'


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


class Stage:
    def __init__(self):
        yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
        xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
        self.yy = yy
        r2 = ((xx - 0.5) / 0.62) ** 2 + ((yy - 0.42) / 0.55) ** 2
        self.glow = np.exp(-r2 * 2.2)[..., None].astype(np.float32)
        r3 = ((xx - 0.18) / 0.55) ** 2 + ((yy - 0.05) / 0.40) ** 2
        self.light = np.exp(-r3 * 1.8)[..., None].astype(np.float32)
        self.vign = np.clip(1.0 - 0.22 * (((xx - 0.5) / 0.70) ** 2 + ((yy - 0.45) / 0.70) ** 2),
                            0, 1)[..., None].astype(np.float32)
        self.grain = [np.random.default_rng(200 + i).normal(0, 2.2, (H, W)).astype(np.float32)[..., None]
                      for i in range(6)]
        self.cache = LRU(3)

    def of(self, col):
        key = tuple(int(v) for v in np.round(col))
        hit = self.cache.get_(key)
        if hit is not None:
            return hit
        col = np.array(key, np.float32)
        top = np.clip(col * 1.045 + 6, 0, 255)
        bot = col * 0.905
        arr = top[None, None, :] * (1 - self.yy[..., None]) + bot[None, None, :] * self.yy[..., None]
        arr = arr + self.glow * np.array([255, 252, 246], np.float32) * 0.55
        arr = arr + self.light * np.array([255, 250, 240], np.float32) * 0.30
        arr = np.clip(arr, 0, 255).astype(np.float32)
        self.cache.put(key, arr)
        return arr


class Renderer:
    def __init__(self, tl):
        self.tl = tl
        self.stage = Stage()
        self.keys = []                      # (n, key) in play order
        for sc in tl['scenes']:
            for c in sc.get('cards', []):
                n, k = c['key'].split('|')
                if (n, k) not in self.keys:
                    self.keys.append((n, k))
            if 'card' in sc and sc['kind'] != 'product':
                n, k = sc['card']
                if (n, k) not in self.keys:
                    self.keys.append((n, k))

        print(f'loading {len(self.keys)} cards...', flush=True)
        self.cards = {}
        self.edges = {}
        for n, k in self.keys:
            im = Image.open(f'{CARDS}/p{n}_{k}.jpg').convert('RGB')
            if im.size != (CARD, CARD):
                im = im.resize((CARD, CARD), Image.LANCZOS)
            arr = np.asarray(im, np.uint8)
            self.cards[(n, k)] = arr
            ring = np.concatenate([arr[:36].reshape(-1, 3), arr[-36:].reshape(-1, 3),
                                   arr[:, :36].reshape(-1, 3), arr[:, -36:].reshape(-1, 3)])
            self.edges[(n, k)] = np.median(ring, axis=0).astype(np.float32)
        # soft alpha: how far each pixel is from the card's own backdrop colour
        self.alpha = {}
        for key, arr in self.cards.items():
            col = self.edges[key]
            d = np.abs(arr.astype(np.int16) - col.astype(np.int16)[None, None, :]).max(axis=2)
            a = np.clip((d.astype(np.float32) - 7.0) / 15.0, 0, 1)
            a = (a * a * (3 - 2 * a) * 0.97 * 255).astype(np.uint8)
            self.alpha[key] = a

        print('loading type...', flush=True)
        self.text = {}
        for f in sorted(os.listdir(TEXT)):
            if f.endswith('.png'):
                lay = Image.open(f'{TEXT}/{f}').convert('RGBA').resize((W, H), Image.LANCZOS)
                a = np.asarray(lay, np.float32)
                self.text[f[:-4]] = (a[..., :3].astype(np.uint8), a[..., 3:4].astype(np.float32) / 255.0)

        self._baked = LRU(7)
        self._zoom = LRU(10)
        print('ready', flush=True)

    # ------------------------------------------------------------- pieces
    def baked(self, key):
        """Card composited over its own stage, full frame, uint8."""
        hit = self._baked.get_(key)
        if hit is not None:
            return hit
        base = self.stage.of(self.edges[key])
        out = np.empty((H, W, 3), np.uint8)
        a = self.alpha[key].astype(np.float32) / 255.0
        arr = self.cards[key].astype(np.float32)
        for y0 in range(0, CARD, 216):
            y1 = min(CARD, y0 + 216)
            out[CARD_Y + y0:CARD_Y + y1] = np.clip(
                base[CARD_Y + y0:CARD_Y + y1] * (1 - a[y0:y1, :, None])
                + arr[y0:y1] * a[y0:y1, :, None], 0, 255).astype(np.uint8)
        self._baked.put(key, out)
        return out

    def blit(self, canvas, key, x, alpha=1.0):
        """Paste a baked card at stage column x."""
        ix = int(round(x))
        if ix <= -CARD or ix >= W or alpha <= 0.004:
            return
        src = self.baked(key)
        sx0 = max(0, -ix)
        dx0 = max(0, ix)
        w = min(CARD - sx0, W - dx0)
        if w <= 0:
            return
        s = src[CARD_Y:CARD_Y + CARD, sx0:sx0 + w].astype(np.float32)
        region = canvas[CARD_Y:CARD_Y + CARD, dx0:dx0 + w]
        if alpha >= 0.996:
            region[:] = s
        else:
            region[:] = region * (1 - alpha) + s * alpha

    def edge_shadow(self, canvas, x, strength=0.20, width=78):
        """Soft shade on the stage just left of a card edge, so a slide reads as
        a sheet of paper moving across the frame instead of a hard cut."""
        ix = int(round(x))
        a0 = max(0, ix - width)
        a1 = min(W, ix)
        if a1 <= a0:
            return
        ramp = np.linspace(1.0, 0.0, a1 - a0, dtype=np.float32)[None, :, None] ** 1.6
        region = canvas[CARD_Y:CARD_Y + CARD, a0:a1]
        region *= (1.0 - ramp * strength)

    def zoomed(self, key, zoom, pan=0.0):
        """Baked card cropped in a little, so a held shot still breathes."""
        q = (key, round(zoom, 3), int(round(pan)))
        hit = self._zoom.get_(q)
        if hit is not None:
            return hit
        src = self.baked(key)
        z = max(1.0, zoom)
        side = CARD / z
        cx = W / 2 + pan
        cy = CARD_Y + CARD / 2
        x0 = int(round(min(max(0, cx - side / 2), W - side)))
        y0 = int(round(min(max(0, cy - side / 2), CARD_Y + CARD - side)))
        crop = Image.fromarray(src[y0:y0 + int(round(side)), x0:x0 + int(round(side))])
        hit = np.asarray(crop.resize((CARD, CARD), Image.LANCZOS), np.float32)
        self._zoom.put(q, hit)
        return hit

    def type_layer(self, canvas, name, alpha=1.0, dy=0.0):
        if alpha <= 0.004:
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
        out = canvas + self.stage.grain[int(t * FPS) % 6]
        out *= self.stage.vign
        return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGB')

    # -------------------------------------------------------------- scenes
    def scene_at(self, t):
        for sc in self.tl['scenes']:
            if sc['t0'] <= t < sc['t1']:
                return sc
        return self.tl['scenes'][-1]

    def frame(self, t, idx=0):
        sc = self.scene_at(t)
        kind = sc['kind']
        if kind == 'intro':
            return self.intro(sc, t)
        if kind == 'product':
            return self.product(sc, t)
        return self.feature(sc, t)

    def intro(self, sc, t):
        key = (sc['card'][0], sc['card'][1])
        dur = sc['t1'] - sc['t0']
        canvas = self.stage.of(self.edges[key]).copy()
        z = 1.03 + 0.055 * ease_in_out(t / max(1.0, dur))
        src = self.zoomed(key, z, pan=6.0 * math.sin(t * 0.45))
        canvas[CARD_Y:CARD_Y + CARD] = src
        a1 = ease_out((t - 0.16) / 0.7)
        self.type_layer(canvas, 'brand', a1, dy=18 * (1 - a1))
        price_at = sc['vo'][1][1] + 0.9 if len(sc.get('vo', [])) > 1 else 3.4
        a2 = ease_out((t - price_at) / 0.6)
        self.type_layer(canvas, 'intro_price', a2, dy=22 * (1 - a2))
        fade = 1.0 - ease_in_out(t / 0.5)
        if fade > 0.004:
            base = self.stage.of(self.edges[key])
            canvas = canvas * (1 - fade) + (base * 0.5 + 127) * fade
        return self.finish(canvas, t)

    def product(self, sc, t):
        cards = sc['cards']
        started = [c for c in cards if t >= c['t']]
        top = max(0, len(started) - 1)
        cur = cards[top]
        prev = cards[top - 1] if top > 0 else None
        cn, ck = cur['key'].split('|')
        cur_key = (cn, ck)
        prev_key = (prev['key'].split('|')[0], prev['key'].split('|')[1]) if prev else cur_key

        p = ease_out((t - cur['t']) / SLIDE) if t >= cur['t'] else 0.0
        if p >= 0.999:
            p = 1.0
        # stage crossfades with the incoming card, so no seam shows at the edge
        if p >= 1.0 or prev is None:
            canvas = self.stage.of(self.edges[cur_key]).copy()
        else:
            a = self.stage.of(self.edges[prev_key])
            b = self.stage.of(self.edges[cur_key])
            canvas = a * (1 - p) + b * p

        if prev is not None:
            q = ease_in_out((t - cur['t']) / SLIDE)
            self.blit(canvas, prev_key, -3 - W * q, alpha=max(0.0, 1.0 - q * q))
        # first card of a product starts just off the right edge
        x = (W + 6) - (W + 6) * p
        if p < 0.999:
            self.edge_shadow(canvas, x, strength=0.22)
        if p >= 1.0:
            # settled: a very slow push in instead of a dead still
            lt = t - cur['t']
            z = 1.0 + 0.022 * ease_in_out(min(1.0, lt / max(0.9, sc['t1'] - cur['t'])))
            canvas[CARD_Y:CARD_Y + CARD] = self.zoomed(cur_key, z, pan=3.0 * math.sin(lt * 0.8))
        else:
            self.blit(canvas, cur_key, x)

        name = 'name_' + sc['n']
        a_in = ease_out((t - sc['name_in']) / 0.42)
        a_out = 1.0 - ease_out((t - sc['name_out']) / 0.30)
        a = max(0.0, min(a_in, a_out))
        if a > 0.004:
            self.type_layer(canvas, name, a, dy=20 * (1 - a_in))
        self.type_layer(canvas, 'bar', ease_out((t - sc['t0'] - 0.30) / 0.5))
        return self.finish(canvas, t)

    def feature(self, sc, t):
        key = (sc['card'][0], sc['card'][1])
        dur = max(0.6, sc['t1'] - sc['t0'])
        p = ease_out((t - sc['t0']) / SLIDE)
        if p < 0.999:
            canvas = self.stage.of(self.edges[key]).copy()
            xx = (W + 6) - (W + 6) * p
            self.edge_shadow(canvas, xx, strength=0.22)
            self.blit(canvas, key, xx)
        else:
            canvas = self.stage.of(self.edges[key]).copy()
            z = 1.02 + 0.03 * ease_in_out((t - sc['t0']) / dur)
            canvas[CARD_Y:CARD_Y + CARD] = self.zoomed(key, z, pan=5.0 * math.sin(t * 0.7))
        a = ease_out((t - sc['t0'] - 0.40) / 0.5)
        name = 'cta' if sc['kind'] == 'cta' else sc['kind']
        self.type_layer(canvas, name, a, dy=22 * (1 - a))
        if sc['kind'] != 'cta':
            self.type_layer(canvas, 'bar', a)
        return self.finish(canvas, t)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='/tmp/dframes')
    ap.add_argument('--start', type=int, default=0)
    ap.add_argument('--end', type=int, default=0)
    ap.add_argument('--test', default='')
    ap.add_argument('--timeline', default=f'{WORK}/timeline.json')
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
        if i % 60 == 0:
            print(f'frame {i}/{end}', flush=True)
    print('DONE', end, flush=True)


if __name__ == '__main__':
    main()
