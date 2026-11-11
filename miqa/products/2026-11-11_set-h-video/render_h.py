#!/usr/bin/env python3
"""Set H video — Steel Daylight renderer for real handheld footage.

The client sent five phone clips (messy desk, shaky hand) instead of photos.
What this renderer does with them:

  * every shot is LOCKED on its subject with the tracks from track_h.py
    (centre, scale, rotation) — the watch sits still on the stage and only our
    own slow push-in moves, so the film reads as smooth studio footage;
  * slow motion comes from blending neighbouring frames *after* alignment;
  * the clip is white-balanced so the client's sheet of paper lands on the
    Steel Daylight stage colour, then feathered into the stage with a soft
    super-ellipse matte — the desk, the marble and the other hands fall away;
  * type lives only in the reserved bands (mtype_h.mjs), and the ৳৯৯৯ tab stays
    on the right edge for the whole film;
  * shots change with the men's-line move (MIQA-MEN-THEME §5): a right→left push,
    eased, plus a ~2 % push-in inside each shot — no fades, no flashes.

  python3 render_h.py --stills 0.5,3.5,6.2                 # QA stills → work/stills/
  python3 render_h.py --out work/long_1080.mp4             # mezzanine (video only)
  python3 render_h.py --scale 2 --out work/long_4k.mp4     # needs SCALE=2 type layers
  python3 render_h.py --scale 2 --cover cover.jpg          # cover still
"""
import argparse, glob, json, math, os, subprocess, sys
import cv2
import numpy as np

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(f'{BASE}/../../..')
VIDS = sorted(glob.glob(f'{BASE}/input/VID_*.mp4'))
FF = f'{ROOT}/node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
FPS = 30
TRACKS = json.load(open(f'{BASE}/work/tracks.json'))


def sstep(a, b, x):
    x = np.clip((x - a) / (b - a), 0, 1)
    return x * x * (3 - 2 * x)


def ease_io(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def ease_out(x):
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


# ───────────────────────────── stage ─────────────────────────────────────────
class Stage:
    """Steel Daylight: mist white → lime stone → steel shadow, cold soft key."""

    def __init__(self, w, h):
        yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
        xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
        stops = [(0.00, (250, 249, 246)), (0.46, (241, 238, 232)), (1.00, (226, 222, 215))]
        col = np.zeros((h, 3), np.float32)
        for (a, ca), (b, cb) in zip(stops[:-1], stops[1:]):
            m = (yy[:, 0] >= a) & (yy[:, 0] <= b)
            k = ((yy[m, 0] - a) / (b - a))[:, None]
            col[m] = np.array(ca, np.float32) * (1 - k) + np.array(cb, np.float32) * k
        st = np.repeat(col[:, None, :], w, axis=1)
        r1 = ((xx - 0.30) / 0.55) ** 2 + ((yy - 0.34) / 0.42) ** 2
        st += np.exp(-r1 * 1.7)[..., None] * np.array([6, 6, 5], np.float32)
        r2 = ((xx - 0.90) / 0.62) ** 2 + ((yy - 0.98) / 0.46) ** 2
        st -= np.exp(-r2 * 1.6)[..., None] * np.array([8, 7, 5], np.float32)
        v = 1.0 - 0.10 * (((xx - 0.5) / 0.74) ** 2 + ((yy - 0.46) / 0.74) ** 2)
        st *= np.clip(v, 0.86, 1.0).astype(np.float32)[..., None]
        self.rgb = np.clip(st, 0, 255).astype(np.float32)
        self.grain = [np.random.default_rng(1100 + i).normal(0, 1.3, (h, w)).astype(np.float32)[..., None]
                      for i in range(5)]


def matte(w, h, cx, cy, rx, ry, n=2.8, inner=0.60):
    """soft super-ellipse (1 inside, feathered to 0 at the rim) → (x0, y0, alpha[h,w,1])"""
    x0, x1 = max(0, int(cx - rx)), min(w, int(cx + rx) + 1)
    y0, y1 = max(0, int(cy - ry)), min(h, int(cy + ry) + 1)
    y, x = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    d = (np.abs((x - cx) / rx) ** n + np.abs((y - cy) / ry) ** n) ** (1.0 / n)
    return x0, y0, sstep(1.0, inner, d).astype(np.float32)[..., None]


# ───────────────────────────── footage ───────────────────────────────────────
#  per shot: zoom = stage px per source px at the seed frame, rot = levelling (deg),
#  wb = white-balance reference ('auto' = this shot's own paper, or another shot's name)
SHOT = {
    'A': dict(zoom=0.80, mat=(560, 480)),
    'C': dict(zoom=0.70, mat=(470, 470)),
    'D': dict(zoom=0.84, mat=(430, 460)),
    'E': dict(zoom=0.90, mat=(450, 460)),
    'F': dict(zoom=1.06, mat=(420, 450)),
    'G': dict(zoom=0.80, mat=(380, 470)),
    'H': dict(zoom=0.80, mat=(380, 470)),
    'J': dict(zoom=0.98, mat=(470, 460)),
    'K': dict(zoom=0.98, mat=(470, 460)),
    'L': dict(zoom=0.92, mat=(450, 460)),
    'N': dict(zoom=0.80, mat=(520, 480)),
}
PAPER_RGB = np.array([243.0, 240.0, 235.0])      # where the client's paper should land (stage tone)


class Clip:
    """decoded frames + smoothed track + colour LUT for one shot"""

    def __init__(self, name, fa, fb):
        tr = TRACKS[name]
        self.name, self.tr = name, tr
        self.fa, self.fb = max(tr['f0'], fa - 1), min(tr['f1'], fb + 2)
        cap = cv2.VideoCapture(VIDS[tr['v'] - 1])
        cap.set(cv2.CAP_PROP_POS_FRAMES, self.fa)
        self.frames = []
        for _ in range(self.fa, self.fb + 1):
            ok, f = cap.read()
            if not ok:
                break
            self.frames.append(f)
        self.fb = self.fa + len(self.frames) - 1
        g = lambda v, s: v if s <= 0 else cv2.GaussianBlur(np.array(v, np.float64).reshape(-1, 1), (1, 0), s,
                                                             borderType=cv2.BORDER_REPLICATE).ravel()
        self.cx, self.cy = np.array(tr['cx']), np.array(tr['cy'])
        self.s, self.a = g(tr['s'], 1.2), g(tr['a'], 1.2)
        self.lut = colour_lut(name)

    def get(self, f):
        f = min(max(f, self.fa), self.fb)
        return self.frames[int(f) - self.fa]

    def pose(self, f):
        i = min(max(int(f), self.tr['f0']), self.tr['f1']) - self.tr['f0']
        return self.cx[i], self.cy[i], self.s[i], self.a[i]


_LUT = {}


def colour_lut(name):
    """white balance + exposure so the paper matches the stage; gentle S-curve.
    One LUT per shot (never per frame → no flicker). The product's hue is not shifted:
    this is a global neutral balance, the same thing a camera's WB does."""
    if name in _LUT:
        return _LUT[name]
    tr = TRACKS[name]
    cap = cv2.VideoCapture(VIDS[tr['v'] - 1])
    meds = []
    for f in np.linspace(tr['f0'], tr['f1'], 5).round():
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(f))
        ok, im = cap.read()
        if not ok:
            continue
        sm = cv2.resize(im, (270, 480), interpolation=cv2.INTER_AREA)
        hsv = cv2.cvtColor(sm, cv2.COLOR_BGR2HSV)
        m = (hsv[..., 1] < 46) & (hsv[..., 2] > 150)
        if m.sum() > 2500:
            px = sm[m].astype(np.float64)
            v = px.max(axis=1)
            meds.append(np.median(px[v >= np.percentile(v, 35)], axis=0)[::-1])     # RGB
    if meds:
        paper = np.median(np.array(meds), axis=0)
    else:
        paper = np.array([205.0, 212.0, 222.0])
    gain = np.clip(PAPER_RGB / paper, 0.85, 1.55)
    x = np.arange(256, dtype=np.float64)
    lut = np.zeros((256, 1, 3), np.uint8)
    for c in range(3):                      # c: RGB → store BGR
        y = np.clip(x * gain[c], 0, 262) / 255.0
        y = np.where(y > 0.88, 0.88 + (y - 0.88) * 0.62, y)          # soft shoulder: keep steel highlights
        y = np.clip(y, 0, 1)
        y = y + 0.055 * np.sin(2 * np.pi * (y - 0.5)) * -0.5          # mild S-curve
        lut[:, 0, 2 - c] = np.clip(y * 255, 0, 255).round().astype(np.uint8)
    _LUT[name] = lut
    print(f'   wb {name}: paper {paper.round(0)} gain {gain.round(3)}', flush=True)
    return lut


class Seg:
    """one piece of footage: source frames fa→fb play over t0→t1.
    at = where the tracked subject sits on the 1080×1920 stage, mc/mat = centre/radii of the soft window."""

    def __init__(self, shot, fa, fb, t0, t1, at=(540, 770), mc=(540, 765), mat=None, push=0.012, drift=(0, 0),
                 zoom=None, slide=0.5, out=None, n=2.8, key=3):
        self.shot, self.fa, self.fb, self.t0, self.t1 = shot, fa, fb, t0, t1
        self.at, self.mc, self.push, self.drift, self.n = at, mc, push, drift, n
        self.mat = mat if mat is not None else SHOT[shot]['mat']
        self.zoom = zoom if zoom is not None else SHOT[shot]['zoom']
        self.rot = 0.0
        self.slide, self.out = slide, out        # slide = seconds of the right→left push in; out='push' → leaves on its own at t1
        self.corr = None
        # phone footage: every 2nd–3rd frame is motion-blurred. Keep only the sharpest frame of each
        # `key`-frame window and dissolve between those (they are already locked on the subject),
        # so a slowed shot stays evenly crisp instead of pulsing. key=1 → every frame (real action).
        tr = TRACKS[shot]
        sh = tr['sharp']
        ks = []
        for a in range(fa, fb + 1, key):
            w = [f for f in range(a, min(fb, a + key - 1) + 1)]
            ks.append(max(w, key=lambda f: sh[f - tr['f0']]))
        self.keys = ks if len(ks) > 1 else [fa, fb]


class Layer:
    def __init__(self, name, t0, t1, tin=0.42, tout=0.14, rise=20, slide=0, bob=0):
        self.name, self.t0, self.t1, self.tin, self.tout = name, t0, t1, tin, tout
        self.rise, self.slide, self.bob = rise, slide, bob


# ───────────────────────────── timelines ─────────────────────────────────────
def timeline(cut='long'):
    """duration, footage segments, overlay segments, type layers, VO starts, SFX cues.
    Scene lengths follow the recorded VO (speech onsets measured from the clips)."""
    vo = [('01_hook', 0.25), ('02_colors', 5.05), ('03_lock', 11.45), ('04_machine', 15.75),
          ('05_water_color', 19.85), ('06_warranty', 22.55), ('07_price', 26.65),
          ('08_five', 30.05), ('09_cta', 34.10)]
    D = 40.8
    CTA = dict(at=(540, 650), mc=(540, 650), push=0.010)
    Q = 0.36          # quicker push for the colour-by-colour run
    segs = [
        # 01 hook — three colours on the table, the white one is lifted to the lens
        Seg('A', 0, 81, 0.00, 2.72, at=(414, 560), mc=(500, 765), mat=(540, 490), zoom=0.72, push=0.0, slide=0, key=1),
        Seg('N', 9, 43, 2.72, 4.85, at=(530, 770), push=0.014, drift=(-8, 0), key=2),
        # 02 four colours, each on its VO word
        Seg('C', 262, 290, 4.85, 5.92),
        Seg('D', 66, 92, 5.92, 6.78, slide=Q),
        Seg('E', 30, 54, 6.78, 7.52, slide=Q),
        Seg('F', 137, 155, 7.52, 8.62, slide=Q, out='push'),
        # 03 butterfly lock
        Seg('L', 244, 262, 11.25, 12.10),
        Seg('G', 45, 71, 12.10, 14.30),
        Seg('H', 321, 338, 14.30, 15.55, at=(540, 800)),
        # 04 semi-automatic machine (see-through back)
        Seg('J', 70, 101, 15.55, 17.65),
        Seg('K', 259, 281, 17.65, 19.65),
        # 05 waterproof · colour guarantee
        Seg('E', 34, 60, 19.65, 21.00),
        Seg('L', 250, 275, 21.00, 22.40),
        # 06 warranty + replacement
        Seg('D', 66, 92, 22.40, 24.45, push=0.016),
        Seg('F', 137, 155, 24.45, 26.45, push=0.016),
        # 07 price
        Seg('C', 246, 290, 26.45, 29.85, push=0.014, out='push'),
        # 09 CTA — slow colour carousel above the ask
        Seg('E', 20, 64, 33.90, 36.30, mat=(450, 350), zoom=0.70, **CTA),
        Seg('F', 137, 155, 36.30, 38.50, mat=(420, 350), zoom=0.82, **CTA),
        Seg('D', 66, 92, 38.50, D + 0.5, mat=(430, 350), zoom=0.66, **CTA),
    ]
    # "চারটি রঙ, একই রাজকীয় লুক" — all four dials at once, each still locked and alive
    q = dict(mat=(232, 212), n=2.3, push=0.012, slide=0.5, out='push')
    over = [
        Seg('C', 262, 290, 8.62, 11.25, at=(300, 606), mc=(300, 606), zoom=0.40, **q),
        Seg('D', 66, 92, 8.70, 11.25, at=(770, 652), mc=(770, 652), zoom=0.46, **q),
        Seg('E', 30, 54, 8.62, 11.25, at=(300, 1024), mc=(300, 1024), zoom=0.49, **q),
        Seg('F', 137, 155, 8.70, 11.25, at=(770, 1040), mc=(770, 1040), zoom=0.60, **q),
    ]
    L = [
        Layer('head', 0.0, D + 1, tin=0.5, rise=0),
        Layer('tab', 0.0, D + 1, tin=0.01, rise=0),          # the price never leaves the right edge
        Layer('hook', 0.0, 2.52, rise=0),
        Layer('hook2', 2.74, 4.72),
        Layer('col_base', 4.94, 11.12),
        Layer('col_1', 5.00, 5.90, tin=0.2, tout=0.12, rise=0),
        Layer('col_2', 5.90, 6.76, tin=0.14, tout=0.12, rise=0),
        Layer('col_3', 6.76, 7.50, tin=0.14, tout=0.12, rise=0),
        Layer('col_4', 7.50, 8.62, tin=0.14, tout=0.12, rise=0),
        Layer('col_all', 8.62, 11.12, tin=0.3, rise=0),
        Layer('lock', 11.36, 15.42),
        Layer('machine', 15.66, 19.52),
        Layer('water', 19.76, 22.28),
        Layer('colour', 20.86, 22.28),
        Layer('promise1', 22.52, 26.32),
        Layer('promise2', 24.12, 26.32),
        Layer('price', 27.45, 29.72),
        Layer('cod', 28.55, 29.72),
        Layer('five', 30.00, 33.74, tin=0.6, tout=0.16, rise=14),
        Layer('cta', 34.04, D + 1, tin=0.5),
        Layer('chev', 36.6, D + 1, tin=0.4, rise=0, bob=1),
    ]
    hide_head = [(29.85, 33.9)]
    sfx = dict(whoosh=[2.70, 4.85, 11.25, 15.55, 19.65, 22.40, 26.45, 33.90],
               click=[12.25, 14.45], tick=[15.9, 16.4, 16.9, 17.4, 17.9, 18.4, 18.9], drop=[19.72],
               shimmer=[0.05, 27.5, 34.0], tap=[5.0, 5.9, 6.76, 7.5], boom=[0.0, 29.9])
    scenes = [0, 4.85, 11.25, 15.55, 19.65, 22.40, 26.45, 29.85, 33.90, D]
    return dict(D=D, segs=segs, over=over, layers=L, vo=vo, sfx=sfx, scenes=scenes, hide_head=hide_head)


# ───────────────────────────── renderer ──────────────────────────────────────
class Renderer:
    def __init__(self, cut, scale=1):
        self.S = scale
        self.w, self.h = 1080 * scale, 1920 * scale
        self.tl = timeline(cut)
        self.cut = cut
        self.stage = Stage(self.w, self.h)
        self.mattes = {}
        self.cover = {}
        self.clips = {}
        self.type = {}
        tdir = f'{BASE}/work/type{scale}'
        for lay in self.tl['layers']:
            if lay.name in self.type:
                continue
            im = cv2.imread(f'{tdir}/{lay.name}.png', cv2.IMREAD_UNCHANGED)
            a = im[..., 3]
            ys, xs = np.where(a > 0)
            y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            self.type[lay.name] = (x0, y0, np.ascontiguousarray(im[y0:y1, x0:x1, 2::-1]),
                                   np.ascontiguousarray(a[y0:y1, x0:x1]))      # uint8 — 4K layers stay small in RAM

    # footage ---------------------------------------------------------------
    def clip(self, seg):
        key = seg.shot
        c = self.clips.get(key)
        if c is None or c.fa > max(TRACKS[key]['f0'], seg.fa - 1) or c.fb < min(TRACKS[key]['f1'], seg.fb + 1):
            self.clips[key] = c = Clip(key, seg.fa, seg.fb)
        return c

    def get_matte(self, sg):
        key = (sg.mc, sg.mat, sg.n)
        if key not in self.mattes:
            S = self.S
            self.mattes[key] = matte(self.w, self.h, sg.mc[0] * S, sg.mc[1] * S, sg.mat[0] * S, sg.mat[1] * S, sg.n)
        return self.mattes[key]

    def affine(self, clip, seg, f, t, ox, oy, S=None, corr=(0.0, 0.0)):
        S = self.S if S is None else S
        cx, cy, s, a = clip.pose(f)
        k = seg.zoom * S * (1.0 + seg.push * (t - seg.t0)) / s
        th = -a + seg.rot
        ca, sa = math.cos(th) * k, math.sin(th) * k
        M = np.array([[ca, -sa, 0.0], [sa, ca, 0.0]])
        p = M[:, :2] @ np.array([cx, cy])
        dst = np.array([(seg.at[0] + corr[0] + seg.drift[0] * (t - seg.t0)) * S - ox,
                        (seg.at[1] + corr[1] + seg.drift[1] * (t - seg.t0)) * S - oy])
        M[:, 2] = dst - p
        return M, k

    def refine(self, clip, seg):
        """sub-pixel re-registration of the key frames on the subject itself (phase correlation of the
        locked 512 px centre) — the feature track is good to ~1 px, a dissolve needs better than that."""
        if seg.corr is not None:
            return seg.corr
        R = 256
        win = cv2.createHanningWindow((2 * R, 2 * R), cv2.CV_32F)
        acc = np.zeros(2)
        seg.corr = [(0.0, 0.0)]
        prev = None
        for f in seg.keys:
            for _ in range(2):          # second pass confirms the first
                M, _k = self.affine(clip, seg, f, seg.t0, seg.at[0] - R, seg.at[1] - R, S=1, corr=acc)
                g = cv2.cvtColor(cv2.warpAffine(clip.get(f), M, (2 * R, 2 * R), flags=cv2.INTER_LINEAR,
                                                borderMode=cv2.BORDER_REPLICATE), cv2.COLOR_BGR2GRAY).astype(np.float32)
                if prev is None:
                    break
                (dx, dy), resp = cv2.phaseCorrelate(prev, g, win)
                if resp > 0.12 and math.hypot(dx, dy) < 14:
                    acc = np.clip(acc - np.array([dx, dy]), -10, 10)
                else:
                    break
            if prev is not None:
                seg.corr.append((float(acc[0]), float(acc[1])))
            prev = g
        return seg.corr

    def footage(self, seg, t, ox, oy, ww, hh):
        """→ (rgb float32 [hh,ww,3], coverage float32 [hh,ww,1]) for the matte's bounding box"""
        clip = self.clip(seg)
        u = min(1.0, max(0.0, (t - seg.t0) / (seg.t1 - seg.t0)))
        pos = u * (len(seg.keys) - 1)
        j = min(int(pos), len(seg.keys) - 2)
        w = float(sstep(0.12, 0.88, pos - j))
        i0, i1 = seg.keys[j], seg.keys[j + 1]
        corr = self.refine(clip, seg)
        M, k = self.affine(clip, seg, i0, t, ox, oy, corr=corr[j])
        fl = cv2.INTER_CUBIC if k > 1 else cv2.INTER_LINEAR

        def one(i, M):
            src = clip.get(i)
            if k < 0.8:          # down-scaling: pre-filter so the fluted bezel does not alias
                src = cv2.GaussianBlur(src, (0, 0), 0.42 / k)
            return cv2.warpAffine(src, M, (ww, hh), flags=fl, borderMode=cv2.BORDER_REPLICATE)

        if w < 0.02:
            im = one(i0, M)
        else:
            M2, _ = self.affine(clip, seg, i1, t, ox, oy, corr=corr[j + 1])
            if w > 0.98:
                M, im = M2, one(i1, M2)
            else:
                im = cv2.addWeighted(one(i0, M), 1 - w, one(i1, M2), w, 0)
        im = cv2.LUT(im, clip.lut)
        bl = cv2.GaussianBlur(im, (0, 0), 1.6 * self.S)          # light unsharp after stabilising
        im = cv2.addWeighted(im, 1.45, bl, -0.45, 0)
        # where the phone frame ends, the stage takes over (no smeared edges)
        if 'src' not in self.cover:
            c = np.zeros((1920, 1080), np.uint8)
            c[2:-2, 2:-2] = 255
            d = cv2.distanceTransform(c, cv2.DIST_L2, 3)
            self.cover['src'] = sstep(3.0, 84.0, d).astype(np.float32)
        cov = cv2.warpAffine(self.cover['src'], M, (ww, hh), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT,
                             borderValue=0)
        return im[..., ::-1].astype(np.float32), cov[..., None]

    def draw(self, out, sg, t, t_out, sl_out):
        """one footage window; it arrives from the right and leaves to the left (hard push, no fade).
        t_out / sl_out = centre and length of the push that takes it away (None = stays)."""
        W = self.w
        dx = 0.0
        if sg.slide > 0:
            k = (t - (sg.t0 - sg.slide / 2)) / sg.slide
            if k <= 0:
                return
            dx = (1.0 - ease_io(k)) * (W + 20 * self.S)
        if t_out is not None:
            k = (t - (t_out - sl_out / 2)) / sl_out
            if k >= 1:
                return
            if k > 0:
                dx = -ease_io(k) * (W + 20 * self.S)
        dx = int(round(dx))
        x0, y0, m = self.get_matte(sg)
        hh, ww = m.shape[:2]
        X0, X1 = max(0, x0 + dx), min(W, x0 + dx + ww)
        if X1 - X0 < 2:
            return
        fg, cov = self.footage(sg, t, x0, y0, ww, hh)
        a, b = X0 - (x0 + dx), X1 - (x0 + dx)
        reg = out[y0:y0 + hh, X0:X1]
        reg += (fg[:, a:b] - reg) * (m[:, a:b] * cov[:, a:b])

    # frame -------------------------------------------------------------------
    def frame(self, n):
        t = n / FPS
        tl = self.tl
        out = self.stage.rgb.copy()
        segs = tl['segs']
        for i, sg in enumerate(segs):
            nxt = segs[i + 1] if i + 1 < len(segs) else None
            if sg.out == 'push' or (nxt is not None and nxt.t0 > sg.t1 + 0.01):
                self.draw(out, sg, t, sg.t1, 0.5)
            elif nxt is None:
                self.draw(out, sg, t, None, None)
            else:
                self.draw(out, sg, t, nxt.t0, nxt.slide)      # pushed out by the next shot
        for sg in tl['over']:
            self.draw(out, sg, t, sg.t1, 0.5)
        # keep memory flat: drop clips no shot needs in the next second
        need = {sg.shot for sg in segs + tl['over'] if sg.t0 - 1.0 <= t <= sg.t1 + 1.0}
        for k in list(self.clips):
            if k not in need:
                del self.clips[k]
        # type
        for lay in tl['layers']:
            if t < lay.t0 or t > lay.t1 + lay.tout:
                continue
            e = 1.0 if lay.t0 <= 0 else ease_out((t - lay.t0) / lay.tin)      # frame 0 is the thumbnail: complete
            a = e * (1.0 - float(sstep(lay.t1, lay.t1 + lay.tout, t)))
            if lay.name == 'head':
                for (h0, h1) in tl['hide_head']:
                    a *= 1.0 - float(sstep(h0 - 0.1, h0 + 0.25, t)) * (1.0 - float(sstep(h1 - 0.1, h1 + 0.3, t)))
            if a <= 0.003:
                continue
            x0, y0, rgb, al = self.type[lay.name]
            dy = int(round((1 - e) * lay.rise * self.S))
            dx = int(round((1 - e) * lay.slide * self.S))
            if lay.bob:
                dy += int(round((math.sin((t - lay.t0) * 2 * math.pi / 1.1) * 0.5 + 0.5) * 9 * self.S))
            hh, ww = rgb.shape[:2]
            X0, Y0 = x0 + dx, y0 + dy
            X1, Y1 = min(self.w, X0 + ww), min(self.h, Y0 + hh)
            if X1 <= X0 or Y1 <= Y0:
                continue
            aa = al[:Y1 - Y0, :X1 - X0].astype(np.float32)[..., None] * (a / 255.0)
            reg = out[Y0:Y1, X0:X1]
            reg += (rgb[:Y1 - Y0, :X1 - X0].astype(np.float32) - reg) * aa
            if lay.name == 'tab' and e >= 1:      # a quiet glint across the price every 5 s keeps the eye on it
                ph = ((t - lay.t0 - 1.2) % 5.0) / 0.7
                if 0 <= ph <= 1:
                    xs = np.arange(X1 - X0, dtype=np.float32)[None, :, None] + np.arange(Y1 - Y0, dtype=np.float32)[:, None, None] * 0.5
                    c = (ph * 1.4 - 0.2) * (X1 - X0 + (Y1 - Y0) * 0.5)
                    reg += np.exp(-((xs - c) / (38 * self.S)) ** 2) * 55 * (aa > 0.9)
        out += self.stage.grain[n % 5]
        return np.clip(out, 0, 255).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cut', default='long')
    ap.add_argument('--scale', type=int, default=1)
    ap.add_argument('--stills')
    ap.add_argument('--out')
    ap.add_argument('--range')
    ap.add_argument('--crf', default='12')
    ap.add_argument('--cover', help='write the cover JPG: all four dials + the price hook')
    a = ap.parse_args()
    R = Renderer(a.cut, a.scale)
    if a.cover:
        R.tl['layers'] = [Layer('head', 0, 99, rise=0), Layer('tab', 0, 99, rise=0), Layer('hook', 0, 99, rise=0)]
        cv2.imwrite(a.cover, R.frame(round(10.0 * FPS))[..., ::-1], [cv2.IMWRITE_JPEG_QUALITY, 92])
        print('wrote', a.cover)
        return
    if a.stills:
        os.makedirs(f'{BASE}/work/stills', exist_ok=True)
        for ts in a.stills.split(','):
            fr = R.frame(round(float(ts) * FPS))
            p = f'{BASE}/work/stills/{a.cut}_{float(ts):05.2f}.jpg'
            cv2.imwrite(p, fr[..., ::-1], [cv2.IMWRITE_JPEG_QUALITY, 90])
            print(p, flush=True)
        return
    n0, n1 = 0, round(R.tl['D'] * FPS)
    if a.range:
        x, y = a.range.split(':')
        n0, n1 = round(float(x) * FPS), round(float(y) * FPS)
    cmd = [FF, '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{R.w}x{R.h}', '-r', str(FPS), '-i', '-',
           '-vf', 'scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p',
           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', a.crf,
           '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', a.out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    import time
    t0 = time.time()
    for n in range(n0, n1):
        p.stdin.write(R.frame(n).tobytes())
        if (n - n0) % 60 == 0:
            print(f'  frame {n}/{n1}  {time.time() - t0:.0f}s', flush=True)
    p.stdin.close()
    p.wait()
    print('wrote', a.out, f'{time.time() - t0:.0f}s')


if __name__ == '__main__':
    main()
