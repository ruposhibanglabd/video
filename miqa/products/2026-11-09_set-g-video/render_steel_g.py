#!/usr/bin/env python3
"""Set G video v4 — Steel Daylight frame renderer (Steel Daylight recipe).

The v3 cut was dark-carded and the client could not read the watches — exactly
the failure that created the Daylight theme. This renderer applies the men's
locked theme (miqa/brand/MIQA-MEN-THEME.md):

  * steel stage #FAF8F4 → #F0ECE4 → #DFD9D0, cold soft key, faint linen grain;
  * one watch per frame, ~62% of the frame width, fed straight from the plates
    (their own light stage, feathered into ours — the colour is never retouched);
  * type only in two reserved bands (top: brand + the one identity line,
    bottom: one idea) so it never crosses the watch;
  * hard-edge right→left slide between cards (0.5 s), 2% push-in inside a card,
    no crossfade / no fade / no flash;
  * title + CTA on the obsidian Midnight plate; every product card on steel.

Two cuts come out of the same code path: --cut long (full 7-scene story) and
--cut short (30 s scroll-stopper, same VO, trimmed scenes).

Writes work/gv4/<cut>/frames + timeline.json; audio comes from gaudio_g.py.
"""
import argparse
import json
import os

import numpy as np
from PIL import Image

W, H, FPS = 1080, 1920, 30
BASE = 'miqa/products/2026-11-09_set-g-video'
WORK = f'{BASE}/work'
PLATES = f'{BASE}/plates'
TEXT = f'{WORK}/gtext'

SLIDE = 0.5          # hard-edge push, seconds
STAGE_SCALE = 2      # 1080 → 2160 for the 4K master (cards are rendered at 2x)


def ease_out(x):
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


class Stage:
    """Steel Daylight stage + the two obsidian plates."""

    def __init__(self, w, h):
        self.w, self.h = w, h
        yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
        xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]

        # ---- steel daylight: mist white → lime stone → steel shadow
        stops = [(0.00, (250, 249, 246)), (0.46, (241, 238, 232)), (1.00, (226, 222, 215))]
        img = np.zeros((h, 3), np.float32)
        for i in range(len(stops) - 1):
            a, ca = stops[i]
            b, cb = stops[i + 1]
            m = (yy[:, 0] >= a) & (yy[:, 0] <= b)
            k = ((yy[m, 0] - a) / (b - a))[:, None]
            img[m] = np.array(ca, np.float32)[None, :] * (1 - k) + np.array(cb, np.float32)[None, :] * k
        stage = np.repeat(img[:, None, :], w, axis=1)

        # big soft key from the upper left + a cold falloff bottom right
        r1 = ((xx - 0.30) / 0.55) ** 2 + ((yy - 0.34) / 0.42) ** 2
        stage += np.exp(-r1 * 1.7)[..., None] * np.array([6, 6, 5], np.float32)
        r2 = ((xx - 0.90) / 0.62) ** 2 + ((yy - 0.98) / 0.46) ** 2
        stage -= np.exp(-r2 * 1.6)[..., None] * np.array([8, 7, 5], np.float32)

        # ---- obsidian plate for title / CTA (Midnight Precision)
        obs = np.zeros((h, w, 3), np.float32)
        k = np.clip(yy[:, 0], 0, 1)[:, None] ** 0.8
        obs += np.array([11, 13, 16], np.float32) * (1 - k[..., None]) * 0 + np.array([11, 13, 16], np.float32)
        obs += np.array([4, 10, 18], np.float32)[None, None, :] * (1 - yy[..., None])
        # strip light on the left edge, steel #C9CED4 at 5.5%
        strip = np.exp(-(((xx - 0.035) / 0.055) ** 2))[..., None]
        obs += strip * np.array([201, 206, 212], np.float32) * 0.055
        glow = np.exp(-(((xx - 0.5) / 0.62) ** 2 + ((yy - 0.30) / 0.40) ** 2) * 1.6)[..., None]
        obs += glow * np.array([18, 24, 34], np.float32)
        # faint radial pool at the price
        glow2 = np.exp(-(((xx - 0.5) / 0.55) ** 2 + ((yy - 0.78) / 0.30) ** 2) * 2.0)[..., None]
        obs += glow2 * np.array([14, 12, 8], np.float32)

        self.stage = np.clip(stage, 0, 255).astype(np.float32)
        self.obs = np.clip(obs, 0, 255).astype(np.float32)

        v = 1.0 - 0.10 * (((xx - 0.5) / 0.74) ** 2 + ((yy - 0.46) / 0.74) ** 2)
        self.vign = np.clip(v, 0.84, 1.0).astype(np.float32)[..., None]
        self._yy, self._xx = yy, xx

    def tinted(self, kind):
        """A washed variant of the steel stage — each feature scene gets its own
        atmosphere (theme requires one design per scene)."""
        if kind == 'cool':      # water: cold blue-grey pool rising from the bottom
            m = np.exp(-(((self._yy - 1.02) / 0.42) ** 2))[..., None]
            return np.clip(self.stage * (1 - m * 0.16) + m * 0.16 * np.array([196, 209, 220], np.float32), 0, 255)
        if kind == 'slate':     # dial detail: cool graphite wash, top-to-bottom
            m = np.clip(self._yy * 1.10 - 0.05, 0, 1)[..., None]
            return np.clip(self.stage * (1 - m * 0.07) + m * 0.07 * np.array([206, 210, 215], np.float32), 0, 255)
        return self.stage

    def grains(self, n=6, sigma=1.4):
        return [np.random.default_rng(910 + i).normal(0, sigma, (self.h, self.w))
                .astype(np.float32)[..., None] for i in range(n)]


class Renderer:
    def __init__(self, tl, scale=1, cut='long'):
        self.tl = tl
        self.cut = cut
        w, h = 1080 * scale, 1920 * scale
        self.w, self.h = w, h
        self.s = scale          # every design number below is for 1080×1920
        print(f'building stage {w}×{h}…', flush=True)
        st = Stage(w, h)
        self.st = st
        self.stage, self.obs = st.stage, st.obs
        self.vign = st.vign
        self.grain = st.grains()

        print('loading plates…', flush=True)
        self.plates = {}
        for f in sorted(os.listdir(PLATES)):
            if f.endswith('.png'):
                im = Image.open(f'{PLATES}/{f}').convert('RGB')
                im = im.resize((im.width * scale, im.height * scale), Image.LANCZOS)
                self.plates[f.split('_')[0]] = im

        print('loading type…', flush=True)
        self.text = {}
        for f in sorted(os.listdir(TEXT)):
            if f.endswith('.png'):
                a = np.asarray(Image.open(f'{TEXT}/{f}').convert('RGBA'), np.float32)
                if a.shape[0] != h:
                    a = np.asarray(Image.open(f'{TEXT}/{f}').convert('RGBA')
                                   .resize((w, h), Image.LANCZOS), np.float32)
                self.text[f[:-4]] = (a[..., :3], a[..., 3:4] / 255.0)
        print('ready', flush=True)

    # ---------------------------------------------------------------- type
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
        canvas += rgb * a

    def finish(self, canvas, t):
        out = canvas + self.grain[int(t * FPS) % 6]
        out *= self.vign
        return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGB')

    # ------------------------------------------------------------- plates
    def card(self, plate, side, crop=None):
        im = self.plates[plate]
        if crop:
            w0, h0 = im.size
            im = im.crop((int(crop[0] * w0), int(crop[1] * h0),
                          int(crop[2] * w0), int(crop[3] * h0)))
        sc = max(side / im.width, side / im.height)
        nw, nh = max(side, int(round(im.width * sc))), max(side, int(round(im.height * sc)))
        im = im.resize((nw, nh), Image.LANCZOS)
        x0, y0 = (nw - side) // 2, (nh - side) // 2
        return np.asarray(im.crop((x0, y0, x0 + side, y0 + side)), np.float32)

    def _blend(self, canvas, arr, x0, y0, m):
        h, w = arr.shape[:2]
        sx0, sy0 = max(0, -x0), max(0, -y0)
        dx0, dy0 = max(0, x0), max(0, y0)
        ww = min(w - sx0, self.w - dx0)
        hh = min(h - sy0, self.h - dy0)
        if ww <= 0 or hh <= 0:
            return
        reg = canvas[dy0:dy0 + hh, dx0:dx0 + ww]
        src = arr[sy0:sy0 + hh, sx0:sx0 + ww]
        mm = m[sy0:sy0 + hh, sx0:sx0 + ww]
        reg[:] = reg * (1 - mm) + src * mm

    def shadow(self, canvas, cx, cy, rx, ry, strength=0.16):
        """Soft contact shadow under a watch — grounds the plate into the stage
        so the crop edge is never visible."""
        ys0, ys1 = int(max(0, cy - 2 * ry)), int(min(self.h, cy + 2 * ry))
        xs0, xs1 = int(max(0, cx - 2 * rx)), int(min(self.w, cx + 2 * rx))
        if xs1 <= xs0 or ys1 <= ys0:
            return
        yy = (np.arange(ys0, ys1, dtype=np.float32)[:, None] - cy) / ry
        xx = (np.arange(xs0, xs1, dtype=np.float32)[None, :] - cx) / rx
        m = np.exp(-((xx ** 2 + yy ** 2) * 1.5))[..., None]
        canvas[ys0:ys1, xs0:xs1] *= (1.0 - m * strength)

    @staticmethod
    def _unused_match(arr, ref):
        """Match the plate's own studio background to the stage behind it, so the
        matte disappears. A small per-channel gain — the watch keeps its colour."""
        s_border = np.concatenate([arr[:6].reshape(-1, 3), arr[-6:].reshape(-1, 3),
                                   arr[:, :6].reshape(-1, 3), arr[:, -6:].reshape(-1, 3)])
        r_border = np.concatenate([ref[:6].reshape(-1, 3), ref[-6:].reshape(-1, 3),
                                   ref[:, :6].reshape(-1, 3), ref[:, -6:].reshape(-1, 3)])
        src = np.median(s_border, axis=0) + 1e-3
        dst = np.median(r_border, axis=0)
        return np.clip(dst / src, 0.90, 1.14).astype(np.float32)

    def hero(self, base, plate, side, cy, dx=0.0, feather=0.12, crop=None, shadow=True):
        """One plate as the scene card, feathered into the stage. The plate's own
        light grey studio background melts into the steel stage — no cut-out,
        no re-lighting, the metal keeps its real colour."""
        canvas = base.copy()
        side = int(side)
        arr = self.card(plate, side, crop)
        s = self.s
        x0 = (self.w - side) // 2 + int(dx * s)
        y0 = int(cy * s - side / 2)
        if shadow:
            self.shadow(canvas, x0 + side / 2, y0 + side * 0.62, side * 0.30, side * 0.11,
                        strength=0.10)
        fx = max(1, int(side * feather))
        fxv = max(1, int(fx * 0.9))
        yy = np.arange(side, dtype=np.float32)[:, None]
        xx = np.arange(side, dtype=np.float32)[None, :]
        my = np.clip(np.minimum(yy, side - 1 - yy) / fx, 0, 1)
        mx = np.clip(np.minimum(xx, side - 1 - xx) / fxv, 0, 1)
        m = my * mx
        m = m * m * (3 - 2 * m)
        # radial falloff: the plate's own studio background dissolves into the
        # stage, so no rectangular edge is ever visible
        rx = (xx - side / 2) / (side * 0.46)
        ry = (yy - side / 2) / (side * 0.46)
        rr = np.sqrt(rx ** 2 + ry ** 2)
        fall = np.clip((1.0 - rr) / 0.30, 0, 1)
        m = m * (fall * fall * (3 - 2 * fall))
        m = m[..., None]
        self._blend(canvas, arr, x0, y0, m)
        return canvas

    def band(self, base, plate, width, crop, cy, feather=0.10):
        """A wide strip of a plate — for the five-in-a-row lineup, where a square
        crop would cut the outer watches off."""
        canvas = base.copy()
        im = self.plates[plate]
        w0, h0 = im.size
        im = im.crop((int(crop[0] * w0), int(crop[1] * h0),
                      int(crop[2] * w0), int(crop[3] * h0)))
        width = int(width)
        hh = int(round(im.height * width / im.width))
        im = im.resize((width, hh), Image.LANCZOS)
        arr = np.asarray(im, np.float32)
        x0 = (self.w - width) // 2
        y0 = int(cy * self.s - hh / 2)
        fx = max(1, int(width * 0.05))
        fy = max(1, int(hh * feather))
        yy = np.arange(hh, dtype=np.float32)[:, None]
        xx = np.arange(width, dtype=np.float32)[None, :]
        my = np.clip(np.minimum(yy, hh - 1 - yy) / fy, 0, 1)
        mx = np.clip(np.minimum(xx, width - 1 - xx) / fx, 0, 1)
        m = my * mx
        m = m * m * (3 - 2 * m)
        rx = np.abs(xx - width / 2) / (width * 0.5)
        fall = np.clip((1.0 - rx ** 3) / 0.30, 0, 1)
        m = m * (fall * fall * (3 - 2 * fall))
        m = m[..., None]
        self._blend(canvas, arr, x0, y0, m)
        return canvas

    def grid(self, base, plates, cy=880.0, side=460, gap=26, crops=None,
             crop=(0.10, 0.08, 0.90, 0.94)):
        """2×3 grid of hero cards (five finishes). Each plate gets its own crop
        when given, because the facing angle differs between plates."""
        canvas = base.copy()
        cols = 3 if len(plates) >= 5 else 2
        rows = (len(plates) + cols - 1) // cols
        for i, p in enumerate(plates):
            r, c = divmod(i, cols)
            n_in = min(cols, len(plates) - r * cols)
            dx = (c - (n_in - 1) / 2) * (side + gap)
            dy = (r - (rows - 1) / 2) * (side + gap)
            canvas = self.hero(canvas, p, side=side * self.s, cy=cy + dy,
                               dx=dx, feather=0.13,
                               crop=(crops[i] if crops else crop))
        return canvas

    # --------------------------------------------------------------- move
    def blit(self, dst, src, dx):
        if dx >= self.w or dx <= -self.w:
            return
        if dx > 0:
            w = self.w - dx
            dst[:, dx:] = src[:, :w]
        else:
            w = self.w + dx
            dst[:, :w] = src[:, -dx:]

    def edge_shade(self, canvas, x, strength=0.20, width=110):
        a0, a1 = max(0, int(x - width)), min(self.w, int(x))
        if a1 <= a0:
            return
        ramp = np.linspace(0.0, 1.0, a1 - a0, dtype=np.float32)[None, :, None] ** 1.5
        canvas[:, a0:a1] *= (1.0 - ramp * strength)

    def push(self, prev, cur, e):
        canvas = self.stage.copy()
        off = e * (self.w + 20)
        self.blit(canvas, prev, int(round(-off)))
        self.blit(canvas, cur, int(round(self.w - off)))
        self.edge_shade(canvas, self.w - off + 1, 0.22, 150)
        return canvas

    # ------------------------------------------------------------- scenes
    def scene_at(self, t):
        for sc in self.tl['scenes']:
            if sc['t0'] <= t < sc['t1']:
                return sc
        return self.tl['scenes'][-1]

    def body(self, sc, t):
        """The card of a scene *without* the type — cached by the caller."""
        kind, plate = sc['kind'], sc.get('plate')
        z = 1.0 + 0.020 * ease_in_out(min(1.0, (t - sc['t0']) / max(0.6, sc['t1'] - sc['t0'])))
        if kind in ('watch', 'photo'):
            side, cy, crop = sc['side'], sc['cy'], sc.get('crop')
            base = self.st.tinted(sc['tint']) if sc.get('tint') else self.stage
            return self.hero(base, plate, side * z * self.s, cy, dx=sc.get('dx', 0.0),
                             feather=sc.get('feather', 0.30), crop=crop)
        if kind == 'band':
            base = self.st.tinted(sc['tint']) if sc.get('tint') else self.stage
            return self.band(base, sc['plate'], sc.get('width', 1500) * z * self.s,
                             sc.get('band_crop', (0.1, 0.1, 0.75, 0.86)), sc.get('cy', 820),
                             feather=0.18)
        if kind == 'lineup':
            return self.band(self.stage, plate, 1060 * z * self.s,
                             (0.0, 0.12, 1.0, 0.86), 806, feather=0.20)
        if kind == 'grid':
            return self.grid(self.stage, sc['plates'], cy=sc.get('cy', 880),
                             side=sc.get('side', 452), gap=26, crops=sc.get('crops'))
        if kind == 'price':
            return self.hero(self.stage, sc['plate'], 900 * z * self.s, 700, feather=0.24,
                             crop=(0.06, 0.03, 0.94, 0.97))
        if kind == 'five':
            return self.hero(self.stage, sc['plate'], 720 * z * self.s, 1640, feather=0.34,
                             crop=(0.10, 0.08, 0.90, 0.92))
        if kind == 'seal':
            return self.stage.copy()
        if kind == 'cta':
            return self.hero(self.st.tinted('cool'), sc['plate'], 800 * z * self.s, 596,
                             feather=0.32, crop=(0.06, 0.03, 0.94, 0.97))
        return self.stage.copy()

    def frame(self, t):
        sc = self.scene_at(t)
        kind = sc['kind']
        t0, dur = sc['t0'], max(0.6, sc['t1'] - sc['t0'])
        cur = self.body(sc, t)
        prev = self.body(sc, t0) if sc.get('prev') else None
        k = (t - t0) / SLIDE
        canvas = self.push(prev, cur, ease_in_out(k)) if (prev is not None and k < 1.0) else cur.copy()
        if kind == 'lineup':
            a = ease_out((t - t0 - 0.10) / 0.50)
            self.type_layer(canvas, 'hooktop', a, dy=24 * self.s * (1 - a))
            b = ease_out((t - t0 - 0.46) / 0.50)
            self.type_layer(canvas, 'hookline', b, dy=28 * self.s * (1 - b))
            return self.finish(canvas, t)

        if kind == 'seal':                       # type-only card, no watch
            a = ease_out((t - t0 - 0.10) / 0.55)
            self.type_layer(canvas, 'five', a, dy=24 * self.s * (1 - a))
            return self.finish(canvas, t)

        if kind in ('cta', 'cta_short'):
            a = ease_out((t - t0 - 0.08) / 0.50)
            self.type_layer(canvas, 'cta', a, dy=24 * self.s * (1 - a))
            return self.finish(canvas, t)

        if kind in ('watch', 'photo', 'grid', 'price', 'band'):
            ka = ease_out((t - t0 - 0.30) / 0.40)
            self.type_layer(canvas, 'kick', ka, dy=14 * self.s * (1 - ka))
            key = sc.get('type')
            if key:
                a = ease_out((t - t0 - sc.get('type_in', 0.30)) / 0.42)
                self.type_layer(canvas, key, a, dy=20 * self.s * (1 - a))
            return self.finish(canvas, t)

        return self.finish(canvas, t)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cut', default='long')
    ap.add_argument('--scale', type=int, default=1)
    ap.add_argument('--out', default='')
    ap.add_argument('--threads', type=int, default=0)
    ap.add_argument('--test', default='')
    ap.add_argument('--from', dest='frm', type=int, default=0)
    ap.add_argument('--to', dest='to', type=int, default=0)
    args = ap.parse_args()

    tl_path = f'{WORK}/gv4/{args.cut}/timeline.json'
    tl = json.load(open(tl_path))
    out = args.out or f'{WORK}/gv4/{args.cut}/frames_{args.scale}x'
    os.makedirs(out, exist_ok=True)
    r = Renderer(tl, args.scale, args.cut)
    end = args.to or tl['frames']

    if args.test:
        for f in [int(x) for x in args.test.split(',')]:
            r.frame(f / FPS).save(f'{out}/t_{f:05d}.jpg', quality=92, subsampling=0)
            print('test', f, flush=True)
        return

    jobs = range(args.frm, end)

    def run(i):
        r.frame(i / FPS).save(f'{out}/f_{i:05d}.jpg', quality=95, subsampling=0)

    if args.threads > 1:
        from multiprocessing import Pool
        with Pool(args.threads) as p:
            for n, _ in enumerate(p.imap(run, jobs, chunksize=8)):
                if n % 120 == 0:
                    print(f'frame {n}/{end}', flush=True)
    else:
        for n, i in enumerate(jobs):
            run(i)
            if n % 120 == 0:
                print(f'frame {i}/{end}', flush=True)
    print('DONE', end, flush=True)


if __name__ == '__main__':
    main()
