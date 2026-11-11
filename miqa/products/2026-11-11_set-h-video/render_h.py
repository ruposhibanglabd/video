#!/usr/bin/env python3
"""Set H video — renderer for real handheld footage (v7: full-frame footage).

The client sent five phone clips (messy desk, shaky hand) instead of photos.
v6 hid most of each clip behind a soft white matte; the client rejected that
("সাদা শেড দিয়ে ঢেকে দিয়েছ … ভিডিওটা রিয়েল যেন লাগে"). v7 shows the footage itself:

  * the clip fills the whole 9:16 frame — nothing is painted over it;
  * every shot is still LOCKED on its subject with the tracks from track_h.py
    (centre, scale, rotation), so the watch sits still and only our own slow
    push-in moves;
  * where the stabilised phone frame ends, the same footage continues out of
    focus (mirrored + blurred) — never a white fill;
  * away from the watch the picture falls gently out of focus and a touch darker,
    the way a lens does, so the desk clutter stops competing with the product;
  * one neutral white balance + contrast curve per shot (the product is not recoloured);
  * type sits on small solid cards (header chip, price tab, one caption card)
    instead of a haze over the picture;
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


def focus_mask(w, h, cx, cy, rx, ry, n=2.4, lo=0.85, hi=1.9):
    """0 on the subject → 1 far from it (soft super-ellipse): how far out of focus a pixel is"""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    d = (np.abs((x - cx) / rx) ** n + np.abs((y - cy) / ry) ** n) ** (1.0 / n)
    return sstep(lo, hi, d).astype(np.float32)


def rbox_sdf(w, h, x0, y0, x1, y1, r, ox=0, oy=0):
    """signed distance to a rounded box for the pixel block [oy:oy+h, ox:ox+w]"""
    y, x = np.mgrid[oy:oy + h, ox:ox + w].astype(np.float32)
    qx = np.abs(x + 0.5 - (x0 + x1) / 2) - ((x1 - x0) / 2 - r)
    qy = np.abs(y + 0.5 - (y0 + y1) / 2) - ((y1 - y0) / 2 - r)
    return np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - r


# ───────────────────────────── footage ───────────────────────────────────────
#  per shot: zoom = stage px per source px at the seed frame, rot = levelling (deg),
#  wb = white-balance reference ('auto' = this shot's own paper, or another shot's name)
SHOT = {
    'A': dict(zoom=0.86, foc=None),
    'C': dict(zoom=0.78, foc=(470, 560), steady=True),
    'D': dict(zoom=0.92, foc=(430, 600), steady=True),
    'E': dict(zoom=0.98, foc=(430, 600), steady=True),
    'F': dict(zoom=1.10, foc=(430, 600), steady=True),
    'G': dict(zoom=0.92, foc=(400, 600)),
    'H': dict(zoom=0.92, foc=(420, 600)),
    'J': dict(zoom=1.04, foc=(470, 600)),
    'K': dict(zoom=1.04, foc=(470, 600)),
    'L': dict(zoom=0.98, foc=(460, 600)),
    'M': dict(zoom=1.0, foc=None),
    'N': dict(zoom=0.92, foc=None),
}
PAPER_RGB = np.array([240.0, 238.0, 234.0])      # where the client's sheet of paper should land: clean neutral white


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
    at = where the tracked subject sits in the 1080×1920 frame; win = the part of the frame this footage fills
    (None = all of it); foc = radii of the in-focus zone around `at` (None = everything sharp)."""

    def __init__(self, shot, fa, fb, t0, t1, at=(540, 770), win=None, foc='shot', push=0.012, drift=(0, 0),
                 zoom=None, slide=0.5, out=None, steady=None):
        self.shot, self.fa, self.fb, self.t0, self.t1 = shot, fa, fb, t0, t1
        self.at, self.push, self.drift = at, push, drift
        self.win = win if win is not None else (0, 0, 1080, 1920)
        self.foc = SHOT[shot]['foc'] if foc == 'shot' else foc
        self.zoom = zoom if zoom is not None else SHOT[shot]['zoom']
        self.rot = 0.0
        self.slide, self.out = slide, out        # slide = seconds of the right→left push in; out='push' → leaves on its own at t1
        self.corr = None
        tr = TRACKS[shot]
        self.keys = list(range(fa, fb + 1))
        self.sharp = [max(1e-6, tr['sharp'][f - tr['f0']]) for f in self.keys]
        self.steady = SHOT[shot].get('steady', False) if steady is None else steady


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
    CTA = dict(at=(540, 640), push=0.010)
    Q = 0.36          # quicker push for the colour-by-colour run
    LOW = dict(at=(500, 860))      # clasp shots: the phone held the strap low in frame
    segs = [
        # 01 hook — three colours on the table, the white one is lifted to the lens
        Seg('A', 0, 93, 0.00, 2.72, at=(430, 480), zoom=1.0, push=0.0, slide=0),
        Seg('N', 9, 43, 2.72, 4.85, at=(530, 800), push=0.014, drift=(-8, 0)),
        # 02 four colours, each on its VO word
        Seg('C', 262, 290, 4.85, 5.92),
        Seg('D', 66, 92, 5.92, 6.78, slide=Q),
        Seg('E', 30, 54, 6.78, 7.52, slide=Q),
        Seg('F', 137, 155, 7.52, 8.62, slide=Q, out='push'),
        # 03 butterfly lock
        Seg('L', 240, 274, 11.25, 12.10, **LOW),
        Seg('G', 40, 76, 12.10, 14.52, **LOW),
        Seg('H', 314, 344, 14.52, 15.55, **LOW),
        # 04 semi-automatic machine (see-through back)
        Seg('J', 70, 101, 15.55, 17.65),
        Seg('K', 259, 281, 17.65, 19.65),
        # 05 waterproof · colour guarantee
        Seg('E', 20, 64, 19.65, 21.00),
        Seg('L', 250, 300, 21.00, 22.40, **LOW),
        # 06 warranty + replacement
        Seg('D', 66, 92, 22.40, 24.45, push=0.016),
        Seg('F', 137, 155, 24.45, 26.45, push=0.016),
        # 07 price
        Seg('C', 246, 290, 26.45, 29.85, push=0.014),
        # 08 the 5 % pledge — the whole collection on the table behind the card
        Seg('M', 250, 304, 29.85, 33.90, at=(540, 640), zoom=1.0, push=0.008, foc=None),
        # 09 CTA — slow colour carousel above the ask
        Seg('E', 20, 64, 33.90, 36.30, zoom=0.80, **CTA),
        Seg('F', 137, 155, 36.30, 38.50, zoom=0.92, **CTA),
        Seg('D', 66, 92, 38.50, D + 0.5, zoom=0.76, **CTA),
    ]
    # "চারটি রঙ, একই রাজকীয় লুক" — all four dials at once: a 2×2 split of live footage, each still locked
    q = dict(push=0.012, slide=0.5, out='push', foc=None)
    GX, GY, GUT = 540, 810, 4
    over = [
        Seg('C', 262, 290, 8.62, 11.25, at=(270, 600), win=(0, 0, GX - GUT, GY - GUT), zoom=0.42, **q),
        Seg('D', 66, 92, 8.62, 11.25, at=(810, 630), win=(GX + GUT, 0, 1080, GY - GUT), zoom=0.48, **q),
        Seg('E', 30, 54, 8.62, 11.25, at=(270, 1040), win=(0, GY + GUT, GX - GUT, 1920), zoom=0.51, **q),
        Seg('F', 137, 155, 8.62, 11.25, at=(810, 1040), win=(GX + GUT, GY + GUT, 1080, 1920), zoom=0.63, **q),
    ]
    # the caption card: one solid card under the type, its box eases from scene to scene (x0, y0, x1, y1, radius)
    FEAT, SUB, MID = (48, 1280, 1032, 1652, 40), (48, 1280, 1032, 1600, 40), (48, 1280, 1032, 1614, 40)
    cards = [(0.00, (48, 1236, 1032, 1626, 40)), (2.72, FEAT), (4.85, SUB), (8.62, FEAT), (11.25, SUB), (15.55, FEAT),
             (19.65, MID), (26.45, (48, 1206, 1032, 1676, 40)), (29.85, (48, 968, 1032, 1640, 40)),
             (33.90, (48, 1018, 1032, 1782, 40))]
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
        Layer('price', 26.62, 29.60),
        Layer('cod', 28.20, 29.60),
        Layer('five', 30.00, 33.74, tin=0.6, tout=0.16, rise=14),
        Layer('cta', 34.04, D + 1, tin=0.5),
        Layer('chev', 36.6, D + 1, tin=0.4, rise=0, bob=1),
    ]
    hide_head = []
    sfx = dict(whoosh=[2.70, 4.85, 11.25, 15.55, 19.65, 22.40, 26.45, 33.90],
               click=[12.25, 14.70], tick=[15.9, 16.4, 16.9, 17.4, 17.9, 18.4, 18.9], drop=[19.72],
               shimmer=[0.05, 26.75, 34.0], tap=[5.0, 5.9, 6.76, 7.5], boom=[0.0, 29.9])
    scenes = [0, 4.85, 11.25, 15.55, 19.65, 22.40, 26.45, 29.85, 33.90, D]
    return dict(D=D, segs=segs, over=over, layers=L, cards=cards, vo=vo, sfx=sfx, scenes=scenes, hide_head=hide_head)


# ───────────────────────────── renderer ──────────────────────────────────────
class Renderer:
    def __init__(self, cut, scale=1):
        self.S = scale
        self.w, self.h = 1080 * scale, 1920 * scale
        self.tl = timeline(cut)
        self.cut = cut
        self.stage = Stage(self.w, self.h)
        self.masks = {}
        self.cover = {}
        self.cardc = None
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

    def seg_masks(self, sg):
        """per shot window: out-of-focus weight (0 on the watch → 1 far away) and a soft lens vignette"""
        key = (sg.win, sg.at, sg.foc)
        if key not in self.masks:
            S = self.S
            x0, y0, x1, y1 = [v * S for v in sg.win]
            w, h = x1 - x0, y1 - y0
            foc = None
            if sg.foc:
                foc = focus_mask(w, h, sg.at[0] * S - x0, sg.at[1] * S - y0, sg.foc[0] * S, sg.foc[1] * S)
            y, x = np.mgrid[0:h, 0:w].astype(np.float32)
            r2 = ((x - (sg.at[0] * S - x0)) / (760 * S)) ** 2 + ((y - (sg.at[1] * S - y0)) / (1180 * S)) ** 2
            vig = np.clip(1.0 - 0.20 * sstep(0.25, 1.6, r2), 0, 1).astype(np.float32)
            if len(self.masks) > 12:
                self.masks.clear()
            self.masks[key] = (foc, vig)
        return self.masks[key]

    def subject(self, sg):
        """1 on the watch itself, 0 a little way out (tighter than the focus zone)"""
        key = ('sub', sg.win, sg.at, sg.foc)
        if key not in self.masks:
            S = self.S
            x0, y0, x1, y1 = [v * S for v in sg.win]
            m = focus_mask(x1 - x0, y1 - y0, sg.at[0] * S - x0, sg.at[1] * S - y0, sg.foc[0] * S, sg.foc[1] * S,
                           lo=0.55, hi=0.95)
            self.masks[key] = (1.0 - m).astype(np.float32)
        return self.masks[key]

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
        """→ rgb uint8 [hh,ww,3] for the window whose top-left corner is (ox, oy); always fully covered"""
        clip = self.clip(seg)
        S = self.S
        # v7: every output frame is ONE real source frame at real speed — nothing is invented in between
        # (v6 dissolved between key frames; full-frame, that showed moving fingers twice). A shot that has
        # to last longer than its footage plays forward, then backward (ping-pong) — for a hand holding a
        # watch still the turn-round is invisible.
        L = len(seg.keys)
        n = int(math.floor((t - (seg.t0 - seg.slide / 2)) * FPS + 0.5))      # the clip is already running as it slides in
        per = max(1, 2 * (L - 1))
        q = n % per
        j = q if q < L else per - q
        corr = self.refine(clip, seg)
        M, k = self.affine(clip, seg, seg.keys[j], t, ox, oy, corr=corr[j])
        fl = cv2.INTER_CUBIC if k > 1 else cv2.INTER_LINEAR

        def one(jj):
            Mj, _ = self.affine(clip, seg, seg.keys[jj], t, ox, oy, corr=corr[jj])
            src = clip.get(seg.keys[jj])
            if k < 0.8:          # down-scaling: pre-filter so the fluted bezel does not alias
                src = cv2.GaussianBlur(src, (0, 0), 0.42 / k)
            return cv2.warpAffine(src, Mj, (ww, hh), flags=fl, borderMode=cv2.BORDER_REFLECT_101)

        im = one(j)
        foc, vig = self.seg_masks(seg)
        if seg.steady and foc is not None:
            # a phone blurs every 2nd–3rd frame. ON THE WATCH ONLY (it is rigid and locked to < 1 px) lean on
            # whichever of the neighbouring real frames is sharpest, so the dial stays evenly crisp;
            # hands and desk around it always come from the current frame.
            sh = seg.sharp
            nb = [jj for jj in (j - 2, j - 1, j + 1, j + 2) if 0 <= jj < L]
            wts = np.array([sh[j]] + [sh[jj] for jj in nb], np.float64) ** 4
            wts /= wts.sum()
            use = [(jj, wt) for jj, wt in zip(nb, wts[1:]) if wt > 0.08]
            if use:
                tot = wts[0] + sum(wt for _, wt in use)
                acc = im.astype(np.float32) * np.float32(wts[0] / tot)
                for jj, wt in use:
                    cv2.scaleAdd(one(jj).astype(np.float32), float(wt / tot), acc, acc)
                acc = np.clip(acc, 0, 255).astype(np.uint8)
                on = self.subject(seg)
                im = cv2.blendLinear(im, acc, 1.0 - on, on)
        im = cv2.LUT(im, clip.lut)
        # how much of this window the phone frame really covers (soft edge)
        if 'src' not in self.cover:
            c = np.zeros((1920, 1080), np.uint8)
            c[2:-2, 2:-2] = 255
            d = cv2.distanceTransform(c, cv2.DIST_L2, 3)
            self.cover['src'] = sstep(2.0, 110.0, d).astype(np.float32)
        cov = cv2.warpAffine(self.cover['src'], M, (ww, hh), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT,
                             borderValue=0)
        # two out-of-focus copies of the same picture, built small (cheap, and identical at 1080 and 4K)
        f4 = 4 * S
        sm = cv2.resize(im, (max(8, ww // f4), max(8, hh // f4)), interpolation=cv2.INTER_AREA)
        soft = cv2.resize(cv2.GaussianBlur(sm, (0, 0), 1.0), (ww, hh), interpolation=cv2.INTER_CUBIC)       # ≈ 4 px @1080
        far = cv2.resize(cv2.GaussianBlur(sm, (0, 0), 9.0), (ww, hh), interpolation=cv2.INTER_CUBIC)        # ≈ 36 px @1080
        bl = cv2.GaussianBlur(im, (0, 0), 1.6 * S)               # light unsharp after stabilising
        im = cv2.addWeighted(im, 1.45, bl, -0.45, 0)
        if foc is not None:                                      # lens fall-off away from the watch
            im = cv2.blendLinear(im, soft, 1.0 - foc * 0.75, foc * 0.75)
        if float(cov.min()) < 0.999:                             # past the phone frame: the same footage, out of focus
            im = cv2.blendLinear(im, far, cov, 1.0 - cov)
        im = cv2.blendLinear(im, np.zeros_like(im), vig, 1.0 - vig)
        return im[..., ::-1]

    def draw(self, out, sg, t, t_out, sl_out):
        """one piece of footage; it arrives from the right and leaves to the left (hard push, no fade).
        t_out / sl_out = centre and length of the push that takes it away (None = stays)."""
        W, S = self.w, self.S
        dx = 0.0
        if sg.slide > 0:
            k = (t - (sg.t0 - sg.slide / 2)) / sg.slide
            if k <= 0:
                return
            dx = (1.0 - ease_io(k)) * W
        if t_out is not None:
            k = (t - (t_out - sl_out / 2)) / sl_out
            if k >= 1:
                return
            if k > 0:
                dx = -ease_io(k) * W
        dx = int(round(dx))
        x0, y0, x1, y1 = [v * S for v in sg.win]
        hh, ww = y1 - y0, x1 - x0
        X0, X1 = max(0, x0 + dx), min(W, x1 + dx)
        if X1 - X0 < 2:
            return
        fg = self.footage(sg, t, x0, y0, ww, hh)
        a, b = X0 - (x0 + dx), X1 - (x0 + dx)
        out[y0:y1, X0:X1] = fg[:, a:b]

    def card_box(self, t):
        """caption-card box at time t (eased between scene boxes, in step with the pushes)"""
        cards = self.tl['cards']
        box = np.array(cards[0][1], np.float64)
        for (tc, bx) in cards[1:]:
            k = ease_io((t - (tc - 0.25)) / 0.5)
            if k <= 0:
                break
            box = box + (np.array(bx, np.float64) - box) * k
        return box

    def card(self, out, t):
        S = self.S
        x0, y0, x1, y1, r = self.card_box(t) * S
        key = (round(x0), round(y0), round(x1), round(y1), round(r))
        if self.cardc is None or self.cardc[0] != key:
            x0, y0, x1, y1, r = key
            pad = 70 * S
            X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(self.w, x1 + pad), min(self.h, y1 + pad + 20 * S)
            d = rbox_sdf(X1 - X0, Y1 - Y0, x0, y0, x1, y1, r, X0, Y0)
            a = np.clip(0.5 - d / max(1.0, S * 0.75), 0, 1)
            ds = rbox_sdf(X1 - X0, Y1 - Y0, x0, y0 + 12 * S, x1, y1 + 12 * S, r, X0, Y0)
            sh = 0.34 * np.exp(-(np.maximum(ds, 0) / (26.0 * S)) ** 2) * (1 - a)
            inset = min(1.0, r / (40.0 * S))                     # hairline only while it is a card, not full screen
            ln = np.clip(1.0 - np.abs(d + 11 * S) / (1.1 * S), 0, 1) * 0.42 * inset
            yy = np.linspace(0, 1, self.h, dtype=np.float32)[Y0:Y1, None, None]
            col = np.array([251, 249, 245], np.float32) * (1 - yy) + np.array([240, 236, 229], np.float32) * yy
            col = col + (np.array([176, 140, 74], np.float32) - col) * ln[..., None]
            self.cardc = (key, (X0, Y0, X1, Y1), (a * 0.97)[..., None].astype(np.float32),
                          (1 - sh)[..., None].astype(np.float32), col.astype(np.float32))
        _, (X0, Y0, X1, Y1), a, sh, col = self.cardc
        reg = out[Y0:Y1, X0:X1]
        reg *= sh
        reg += (col - reg) * a

    # frame -------------------------------------------------------------------
    def frame(self, n):
        t = n / FPS
        tl = self.tl
        out = self.stage.rgb.copy()          # only ever seen as the hairline between the four split tiles
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
        self.card(out, t)
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
        R.tl['cards'] = R.tl['cards'][:1]
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
