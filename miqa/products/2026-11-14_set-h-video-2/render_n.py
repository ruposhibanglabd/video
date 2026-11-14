#!/usr/bin/env python3
"""Set H video 2 (2026-11-14) — renderer for three WhatsApp clips (480x854) of the Honeycomb watches.

Brief: keep only the good parts, premium feel, new voice-over, very little text, and above all
"কাটতে যেন চোখে না লাগে" — no cut may jar. How that is done here:

  * every shot is LOCKED on its subject with the tracks from track_n.py (centre, scale, rotation) and the
    subject always sits at the same place and size on screen — a dial replaces a dial, never jumps;
  * shots change with a 0.3 s match-dissolve inside one continuous push-in: the outgoing shot keeps
    travelling towards the lens, the incoming one arrives on the same move (decision D57 — this replaces
    the hard right→left push of MEN-THEME §5 for client phone footage);
  * footage runs at 0.3–0.8× speed, and only the calm stretches of each clip are used (frame-to-frame change
    of the locked picture was measured; the sudden twists of the hand are cut out);
    in-between frames are a blend of the two REAL neighbouring frames, each registered on the watch first (no optical-flow warping — that melted fingers in Set H v6);
  * the clip fills the whole 9:16 frame (D56: no white matte). Away from the watch the picture falls out
    of focus and slightly darker, like a fast lens — the cluttered desk stops competing with the product;
  * one neutral white balance per clip + a gentle contrast curve; the product is not recoloured,
    the dial is not retouched (D55);
  * type: MIQA mark, a small price, one short label per beat, the order card at the end.

  python3 render_n.py --stills 0.5,3.5,6.2        # QA stills → work/stills/
  python3 render_n.py --sheet 0.5                 # contact sheet, one tile every 0.5 s → work/sheet.jpg
  python3 render_n.py --out work/long_1080.mp4    # mezzanine (video only)
  python3 render_n.py --cover cover.jpg           # cover still
"""
import argparse, json, math, os, subprocess, sys
import cv2
import numpy as np

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(f'{BASE}/../../..')
VIDS = {k: f'{BASE}/input/{k}.mp4' for k in 'ABC'}
FF = f'{ROOT}/node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
FPS = 30
W, H = 1080, 1920
X = 0.30            # length of every shot change (s)
_TR = None


def tracks():
    global _TR
    if _TR is None:
        _TR = json.load(open(f'{BASE}/work/tracks.json'))
    return _TR


def sstep(a, b, x):
    x = np.clip((x - a) / (b - a), 0, 1)
    return x * x * (3 - 2 * x)


# ───────────────────────────── colour ────────────────────────────────────────
PAPER_RGB = np.array([238.0, 236.0, 231.0])      # where the white table/paper lands: clean, a hair warm
_LUT = {}


def colour_lut(v):
    """One white balance + exposure + contrast curve per CLIP (same room light all through a clip),
    so shots from one clip can never differ and nothing flickers."""
    if v in _LUT:
        return _LUT[v]
    cap = cv2.VideoCapture(VIDS[v])
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    meds = []
    for f in np.linspace(5, n - 10, 24).round():
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(f))
        ok, im = cap.read()
        if not ok:
            continue
        sm = cv2.resize(im, (240, 427), interpolation=cv2.INTER_AREA)
        hsv = cv2.cvtColor(sm, cv2.COLOR_BGR2HSV)
        m = (hsv[..., 1] < 40) & (hsv[..., 2] > 165)
        if m.sum() > 6000:
            px = sm[m].astype(np.float64)
            val = px.max(axis=1)
            meds.append(np.median(px[val >= np.percentile(val, 40)], axis=0)[::-1])     # RGB
    paper = np.median(np.array(meds), axis=0) if meds else np.array([215.0, 215.0, 222.0])
    gain = np.clip(PAPER_RGB / paper, 0.85, 1.35)
    x = np.arange(256, dtype=np.float64)
    lut = np.zeros((256, 1, 3), np.uint8)
    for c in range(3):                      # c: RGB → store BGR
        y = np.clip(x * gain[c], 0, 265) / 255.0
        y = np.where(y > 0.86, 0.86 + (y - 0.86) * 0.60, y)           # soft shoulder: keep the steel highlights
        y = np.clip(y, 0, 1)
        y = y - 0.040 * np.sin(2 * np.pi * y)                          # S-curve: deeper blacks, cleaner whites
        lut[:, 0, 2 - c] = np.clip(y * 255, 0, 255).round().astype(np.uint8)
    _LUT[v] = lut
    print(f'   wb clip {v}: paper {paper.round(0)} gain {gain.round(3)}', flush=True)
    return lut


# ───────────────────────────── footage ───────────────────────────────────────
class Clip:
    """decoded + graded frames and the smoothed track of one shot"""
    _cache = {}

    def __init__(self, name):
        tr = tracks()[name]
        self.tr, self.f0, self.f1 = tr, tr['f0'], tr['f1']
        cap = cv2.VideoCapture(VIDS[tr['v']])
        cap.set(cv2.CAP_PROP_POS_FRAMES, self.f0)
        lut = colour_lut(tr['v'])
        self.frames = []
        for _ in range(self.f0, self.f1 + 1):
            ok, f = cap.read()
            if not ok:
                break
            f = cv2.LUT(f, lut)
            hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV).astype(np.float32)
            hsv[..., 1] = np.clip(hsv[..., 1] * 1.07, 0, 255)          # +7 % saturation, hue untouched
            self.frames.append(cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR))
        self.f1 = self.f0 + len(self.frames) - 1
        g = lambda v, s: cv2.GaussianBlur(np.array(v, np.float64).reshape(-1, 1), (1, 0), s,
                                          borderType=cv2.BORDER_REPLICATE).ravel()
        self.cx, self.cy = g(tr['cx'], 0.6), g(tr['cy'], 0.6)            # takes the tracker's sub-pixel chatter out
        self.s, self.a = g(tr['s'], 1.5), g(tr['a'], 1.5)
        sh = np.array(tr['sharp'], np.float64)
        self.sharp = sh / np.median(sh)

    @classmethod
    def get(cls, name):
        if name not in cls._cache:
            cls._cache[name] = Clip(name)
        return cls._cache[name]


class Seg:
    """source frames fa→fb of `shot` play over t0→t1 (plus half a shot change at either end).
    zoom = screen px per source px at the seed frame; at = where the tracked subject sits on screen;
    foc = radii of the in-focus zone round `at` (None → whole frame sharp); push = scale gained over the shot;
    drift = (dx, dy) the subject travels over the shot; passes = how many times the footage is run
    (2 = there and back, eased) when a beat outlasts its footage."""

    def __init__(self, shot, fa, fb, t0, t1, zoom, at=(540, 800), foc=(430, 560), push=0.045, drift=(0, 0),
                 passes=1, k=1.0):
        self.shot, self.fa, self.fb, self.t0, self.t1 = shot, fa, fb, t0, t1
        self.zoom, self.at, self.foc, self.push, self.drift, self.passes, self.k = zoom, at, foc, push, drift, passes, k
        self.first = self.last = False

    def span(self):
        return (self.t0 if self.first else self.t0 - X / 2), (self.t1 if self.last else self.t1 + X / 2)

    def src_pos(self, t):
        ts, te = self.span()
        u = min(1.0, max(0.0, (t - ts) / (te - ts)))
        if self.passes > 1:
            u = 0.5 - 0.5 * math.cos(math.pi * u * self.passes)       # there and back, turning gently
        return self.fa + u * (self.fb - self.fa)


class Layer:
    def __init__(self, name, t0, t1, tin=0.36, tout=0.20, rise=16):
        self.name, self.t0, self.t1, self.tin, self.tout, self.rise = name, t0, t1, tin, tout, rise


# ───────────────────────────── timeline ──────────────────────────────────────
def timeline():
    """Scene lengths follow the recorded VO (speech onsets measured from the clips, voice-01)."""
    D = 31.0
    vo = [('01_hook', 0.40), ('02_colours', 4.95), ('03_lock', 10.15), ('04_machine', 12.35),
          ('05_water', 14.65), ('06_warranty', 17.50), ('07_price', 21.35), ('08_cta', 25.60)]
    DIAL = dict(at=(540, 800), foc=(440, 600))
    BAND = dict(at=(540, 830), foc=(400, 760))            # bracelet / clasp: tall subject
    segs = [
        # 01 hook — "প্রথম দেখাতেই চোখ আটকে যাবে। মিকার হানিকম্ব কালেকশন।"
        Seg('W1', 98, 134, 0.00, 2.50, zoom=1.84, push=0.06, **DIAL),
        Seg('W2', 0, 31, 2.50, 3.90, zoom=2.40, **DIAL),
        # the four on the table — "… চারটি অভিজাত রঙ"
        Seg('L1', 0, 20, 3.90, 6.60, zoom=3.30, at=(540, 800), foc=(1400, 620), push=0.02, drift=(-420, 0), passes=3),
        # 02 one colour per word — সাদা · নীল · সবুজ · কালো
        Seg('W3', 548, 566, 6.60, 7.50, zoom=1.98, push=0.03, **DIAL),
        Seg('U1', 1114, 1123, 7.50, 8.30, zoom=2.12, push=0.03, **DIAL),
        Seg('G1', 1247, 1256, 8.30, 9.10, zoom=2.60, push=0.03, **DIAL),
        Seg('K1', 942, 954, 9.10, 10.00, zoom=2.20, push=0.03, **DIAL),
        # 03 butterfly lock: open → closed
        Seg('CL1', 315, 340, 10.00, 11.25, zoom=2.45, **BAND),
        Seg('CL2', 372, 392, 11.25, 12.20, zoom=2.35, **BAND),
        # 04 semi-automatic machine (see-through back)
        Seg('M1', 296, 310, 12.20, 13.50, zoom=2.70, at=(540, 800), foc=(430, 520)),
        Seg('M2', 250, 266, 13.50, 14.50, zoom=2.35, at=(540, 800), foc=(430, 520)),
        # 05 waterproof · colour guarantee
        Seg('U2', 1061, 1076, 14.50, 15.95, zoom=2.48, **DIAL),
        Seg('BR2', 340, 362, 15.95, 17.35, zoom=2.50, **BAND),
        # 06 1-year warranty · 7-day replacement
        Seg('G2', 1292, 1308, 17.35, 18.85, zoom=3.00, passes=2, **DIAL),
        Seg('K1', 919, 937, 18.85, 20.05, zoom=2.20, **DIAL),
        Seg('U2', 1078, 1094, 20.05, 21.20, zoom=2.48, **DIAL),
        # 07 price (macro on the honeycomb dial) · cash on delivery
        Seg('W1', 108, 131, 21.20, 23.70, zoom=2.35, at=(540, 820), foc=(520, 640), passes=2),
        Seg('L3', 867, 903, 23.70, 25.40, zoom=2.45, at=(520, 800), foc=None, push=0.03, drift=(40, 0)),
        # 08 order card — the four colours again, above the card
        Seg('L1', 0, 20, 25.40, D, zoom=2.25, at=(540, 520), foc=None, push=0.035, passes=6),
    ]
    segs[0].first, segs[-1].last = True, True
    L = [
        Layer('head', 0.45, D + 1, tin=0.5, rise=0),
        Layer('price', 0.60, D + 1, tin=0.5, rise=0),
        Layer('lab_name', 2.80, 4.60),
        Layer('lab_colours', 4.98, 6.45),
        Layer('lab_white', 6.70, 7.40, tin=0.22, tout=0.14, rise=8),
        Layer('lab_blue', 7.58, 8.20, tin=0.22, tout=0.14, rise=8),
        Layer('lab_green', 8.38, 9.00, tin=0.22, tout=0.14, rise=8),
        Layer('lab_black', 9.18, 9.88, tin=0.22, tout=0.14, rise=8),
        Layer('lab_lock', 10.18, 12.05),
        Layer('lab_machine', 12.38, 14.35),
        Layer('lab_water', 14.68, 15.85),
        Layer('lab_colour', 16.12, 17.20),
        Layer('lab_warranty', 17.53, 18.75),
        Layer('lab_replace', 18.98, 21.05),
        Layer('lab_price', 21.38, 23.60),
        Layer('lab_cod', 23.84, 25.25),
        Layer('cta', 25.60, D + 1, tin=0.55, rise=26),
    ]
    cuts = [s.t0 for s in segs[1:]]
    sfx = dict(whoosh=[2.50, 3.90, 10.00, 12.20, 14.50, 17.35, 21.20, 25.40],
               click=[11.32], tick=[12.55, 13.05, 13.55, 14.05], drop=[14.60],
               shimmer=[0.05, 21.40, 25.55], tap=[6.60, 7.50, 8.30, 9.10], boom=[0.0, 25.42])
    scenes = [0, 3.90, 6.60, 10.00, 12.20, 14.50, 17.35, 21.20, 25.40, D]
    return dict(D=D, segs=segs, layers=L, vo=vo, sfx=sfx, scenes=scenes, cuts=cuts)


# ───────────────────────────── renderer ──────────────────────────────────────
class Renderer:
    def __init__(self, cover=False):
        self.tl = timeline()
        self.type = {}
        names = [l.name for l in self.tl['layers']] + (['cover'] if cover else [])
        for name in names:
            im = cv2.imread(f'{BASE}/work/type/{name}.png', cv2.IMREAD_UNCHANGED)
            a = im[..., 3]
            ys, xs = np.where(a > 0)
            y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            self.type[name] = (x0, y0, im[y0:y1, x0:x1, :3].astype(np.float32),
                               (a[y0:y1, x0:x1].astype(np.float32) / 255.0)[..., None])
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r2 = ((xx - W / 2) / (W * 0.80)) ** 2 + ((yy - H * 0.44) / (H * 0.74)) ** 2
        self.vig = (1.0 - 0.20 * np.clip(r2, 0, 1.2))[..., None].astype(np.float32)
        self.grain = [cv2.GaussianBlur(np.random.default_rng(1400 + i).normal(0, 3.0, (H, W)).astype(np.float32),
                                       (0, 0), 0.7)[..., None] for i in range(7)]
        self.focus = {}

    # footage ---------------------------------------------------------------
    def focus_mask(self, at, foc):
        """quarter-res: 0 on the subject → 1 far from it (soft super-ellipse)"""
        key = (round(at[0] / 8), round(at[1] / 8), foc)
        if key not in self.focus:
            y, x = np.mgrid[0:H // 4, 0:W // 4].astype(np.float32) * 4 + 2
            n = 2.4
            d = (np.abs((x - at[0]) / foc[0]) ** n + np.abs((y - at[1]) / foc[1]) ** n) ** (1.0 / n)
            self.focus[key] = sstep(0.80, 1.75, d).astype(np.float32)
            if len(self.focus) > 400:
                self.focus.pop(next(iter(self.focus)))
        return self.focus[key]

    def shot(self, seg, t, extra=1.0):
        """one footage shot at time t → float32 BGR, full frame"""
        c = Clip.get(seg.shot)
        p = seg.src_pos(t)
        u = (t - seg.t0) / (seg.t1 - seg.t0)
        cam = (1.0 + seg.push * u) * extra
        at = (seg.at[0] + seg.drift[0] * (u - 0.5), seg.at[1] + seg.drift[1] * (u - 0.5))
        # real neighbouring frames, each registered on the subject, weighted by distance in time (and sharpness)
        j0 = int(math.floor(p))
        cand = []
        for j in range(j0 - 1, j0 + 3):
            if j < c.f0 or j > c.f1:
                continue
            w = max(0.0, 1.0 - abs(j - p) / seg.k)
            if w > 1e-4:
                cand.append((j, w * float(np.clip(c.sharp[j - c.f0], 0.45, 2.2)) ** 0.8))
        tot = sum(w for _, w in cand)
        acc = np.zeros((H, W, 3), np.float32)
        Mc = None
        for j, w in cand:
            i = j - c.f0
            sc = seg.zoom * cam / c.s[i]
            ca, sa = math.cos(-c.a[i]) * sc, math.sin(-c.a[i]) * sc
            M = np.array([[ca, -sa, 0.0], [sa, ca, 0.0]])
            M[:, 2] = np.array(at) - M[:, :2] @ np.array([c.cx[i], c.cy[i]])
            fr = cv2.warpAffine(c.frames[i], M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT_101)
            cv2.scaleAdd(fr.astype(np.float32), w / tot, acc, acc)
            if Mc is None or abs(j - p) < abs(Mc[1] - p):
                Mc = (M, j, sc)
        M, _, sc = Mc
        # detail: the clips are 480 px wide, so a careful unsharp at the scale of one source pixel
        acc += 0.55 * (acc - cv2.GaussianBlur(acc, (0, 0), 0.85 * sc))
        np.clip(acc, 0, 255, out=acc)
        # how far out of focus each pixel is: far from the watch, and anything past the phone frame's edge
        hh, wh = c.frames[0].shape[:2]
        corners = np.array([[0, 0], [wh, 0], [wh, hh], [0, hh]], np.float64)
        poly = ((M[:, :2] @ corners.T).T + M[:, 2]) / 4.0
        inside = np.zeros((H // 4, W // 4), np.uint8)
        cv2.fillConvexPoly(inside, poly.round().astype(np.int32), 255)
        inside = cv2.GaussianBlur(inside.astype(np.float32) / 255.0, (0, 0), 9)
        b = 1.0 - np.clip((inside - 0.5) * 2.0, 0, 1)
        if seg.foc is not None:
            b = np.maximum(b, self.focus_mask(at, seg.foc))
        b = cv2.resize(b, (W, H), interpolation=cv2.INTER_LINEAR)[..., None]
        small = cv2.resize(cv2.GaussianBlur(cv2.resize(acc, (W // 2, H // 2), interpolation=cv2.INTER_AREA), (0, 0), 3.2),
                           (W, H), interpolation=cv2.INTER_LINEAR)
        big = cv2.resize(cv2.GaussianBlur(cv2.resize(acc, (W // 4, H // 4), interpolation=cv2.INTER_AREA), (0, 0), 6.5),
                         (W, H), interpolation=cv2.INTER_LINEAR)
        k1 = np.clip(b * 2.0, 0, 1)
        k2 = np.clip(b * 2.0 - 1.0, 0, 1)
        out = acc + (small - acc) * k1
        out += (big - out) * k2
        out *= (1.0 - 0.24 * b)
        return out

    def footage(self, t):
        act = []
        for s in self.tl['segs']:
            ts, te = s.span()
            if ts <= t < te or (s.last and t >= ts):
                act.append(s)
        if len(act) == 1:
            return self.shot(act[0], t)
        a, b = act[0], act[1]                       # a leaves, b arrives
        p = min(1.0, max(0.0, (t - (b.t0 - X / 2)) / X))
        ia = self.shot(a, t, extra=1.0 + 0.15 * p ** 2.0)
        ib = self.shot(b, t, extra=1.0 - 0.12 * (1.0 - p) ** 2.0)
        k = p * p * (3 - 2 * p)
        return ia + (ib - ia) * k

    # type ------------------------------------------------------------------
    def put(self, img, name, op, dy=0):
        x0, y0, rgb, a = self.type[name]
        y0 = int(round(y0 + dy))
        h, w = rgb.shape[:2]
        ya, yb = max(0, y0), min(H, y0 + h)
        if yb <= ya or op <= 0:
            return
        sl = img[ya:yb, x0:x0 + w]
        al = a[ya - y0:yb - y0] * op
        sl += (rgb[ya - y0:yb - y0] - sl) * al

    def frame(self, t, n=0, cover=False):
        img = self.footage(t)
        img *= self.vig
        luma = img.mean(axis=2, keepdims=True)
        img += self.grain[n % len(self.grain)] * (1.0 - 0.55 * luma / 255.0)
        if t < 0.40:
            img *= (t / 0.40) ** 1.5                    # opens from black
        for l in self.tl['layers']:
            if cover and l.name.startswith('lab_'):
                continue
            if l.t0 <= t < l.t1:
                ki = min(1.0, (t - l.t0) / l.tin)
                ko = min(1.0, (l.t1 - t) / l.tout)
                e = 1 - (1 - ki) ** 3
                self.put(img, l.name, e * ko, dy=l.rise * (1 - e))
        if cover:
            self.put(img, 'cover', 1.0)
        return np.clip(img, 0, 255).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--stills')
    ap.add_argument('--sheet', type=float)
    ap.add_argument('--out')
    ap.add_argument('--cover')
    ap.add_argument('--range')
    ap.add_argument('--crf', type=int, default=12)
    a = ap.parse_args()
    R = Renderer(cover=bool(a.cover))
    D = R.tl['D']
    if a.stills:
        os.makedirs(f'{BASE}/work/stills', exist_ok=True)
        for s in a.stills.split(','):
            t = float(s)
            cv2.imwrite(f'{BASE}/work/stills/t_{t:05.2f}.jpg', R.frame(t, int(t * FPS)), [cv2.IMWRITE_JPEG_QUALITY, 93])
            print('still', t, flush=True)
    if a.sheet:
        tiles = []
        t = 0.2
        while t < D:
            im = cv2.resize(R.frame(t, int(t * FPS)), (216, 384), interpolation=cv2.INTER_AREA)
            cv2.putText(im, f'{t:.1f}', (6, 376), 0, 0.6, (0, 0, 255), 2)
            tiles.append(im)
            t += a.sheet
        cols = 10
        while len(tiles) % cols:
            tiles.append(np.zeros_like(tiles[0]))
        cv2.imwrite(f'{BASE}/work/sheet.jpg', np.vstack([np.hstack(tiles[i:i + cols]) for i in range(0, len(tiles), cols)]),
                    [cv2.IMWRITE_JPEG_QUALITY, 86])
        print('sheet', len(tiles))
    if a.cover:
        cv2.imwrite(a.cover, R.frame(1.55, 3, cover=True), [cv2.IMWRITE_JPEG_QUALITY, 94])
        print('cover →', a.cover)
    if a.out:
        n0, n1 = 0, int(round(D * FPS))
        if a.range:
            ta, tb = map(float, a.range.split(':'))
            n0, n1 = int(round(ta * FPS)), int(round(tb * FPS))
        p = subprocess.Popen([FF, '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS),
                              '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', str(a.crf), '-pix_fmt', 'yuv420p',
                              a.out], stdin=subprocess.PIPE)
        for n in range(n0, n1):
            p.stdin.write(R.frame(n / FPS, n).tobytes())
            if n % 60 == 0:
                print(f'frame {n}/{n1}', flush=True)
        p.stdin.close()
        p.wait()
        print('wrote', a.out, n1 - n0, 'frames')


if __name__ == '__main__':
    main()
