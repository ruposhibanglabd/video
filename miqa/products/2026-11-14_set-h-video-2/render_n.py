#!/usr/bin/env python3
"""Set H video 2 (2026-11-14) — renderer v2 for three WhatsApp clips (480x854) of the Honeycomb watches.

v1 of this film was rejected by the client: "ভিডিওর কোয়ালিটি একদম নষ্ট হয়ে গেছে, আমার ভিডিও আর তোমার ভিডিওর
মধ্যে কোনো মিল নাই". v1 had cropped far into 480-pixel footage, blended neighbouring frames for slow motion,
sharpened hard, regraded, blurred and darkened everything round the watch and added grain. On footage this
small every one of those steps costs picture quality. v2 does the opposite (decision D58):

  * THE CLIENT'S PICTURE, UNTOUCHED: no colour change, no blur, no darkening, no vignette, no grain;
  * every output frame is exactly ONE real source frame at real speed (no slow motion, no blended frames);
  * one resampling step only, straight from the source frame to 1080x1920 (Lanczos), nearly the full phone
    frame (about 15 % crop — only what the stabiliser needs);
  * stabiliser: the dominant motion of each shot is measured (LK features + RANSAC similarity), its path is
    smoothed, and only the shake is taken out, never further than the crop margin allows — so there is no
    made-up picture at the edges;
  * shots change with a 0.3 s cross-dissolve inside a slow push-in (D57); no hard cut, no flash;
  * type: MIQA mark, a small price, one short label per beat, the order card at the end.

  python3 render_n.py --sheet 0.5                 # contact sheet → work/sheet.jpg
  python3 render_n.py --stills 0.5,3.5            # QA stills → work/stills/
  python3 render_n.py --out x.mp4 [--audio a.wav] # final encode (x264 + AAC when --audio is given)
  python3 render_n.py --cover cover.jpg           # cover still
"""
import argparse, math, os, subprocess, sys
import cv2
import numpy as np

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(f'{BASE}/../../..')
VIDS = {k: f'{BASE}/input/{k}.mp4' for k in 'ABC'}
FF = f'{ROOT}/node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
FPS = 30
W, H = 1080, 1920
SW, SH = 480, 854                 # source frame
FIT = W / SW                      # 2.25 screen px per source px when the phone frame fills the screen
X = 0.30                          # length of every shot change (s)
SHARP = 0.25                      # a very light unsharp after the upscale (0 = none); more than this shows halos


class Seg:
    """Clip `v` plays from source frame `fa` at real speed over t0→t1 (plus half a shot change at either end).
    fb: last usable frame — given only for near-static shots, which then run there-and-back (whole frames).
    z = crop (1.0 = full phone frame), push = crop gained over the shot, bias = (x, y) source px the window
    is moved off the frame centre, drift = (x, y) source px the window travels over the shot,
    stab = smoothing of the camera path in frames."""

    def __init__(self, v, fa, t0, t1, fb=None, z=1.15, push=0.035, bias=(0, 0), drift=(0, 0), stab=8.0):
        self.v, self.fa, self.fb, self.t0, self.t1 = v, fa, fb, t0, t1
        self.lock = fb is not None                     # there-and-back shots are held still, so the turn never shows
        self.z, self.push, self.bias, self.drift, self.stab = z, push, bias, drift, stab
        self.first = self.last = False
        self.clip = None

    def span(self):
        return (self.t0 if self.first else self.t0 - X / 2), (self.t1 if self.last else self.t1 + X / 2)

    def count(self):
        ts, te = self.span()
        return int(math.ceil((te - ts) * FPS)) + 2

    def index(self, t):
        """which loaded frame shows at time t (whole frames only)"""
        k = max(0, int(math.floor((t - self.span()[0]) * FPS + 1e-6)))     # floor: every frame once, in order
        n = len(self.clip.frames)
        if self.fb is None:
            return min(k, n - 1)
        L = n - 1
        m = k % (2 * L)
        return m if m <= L else 2 * L - m


class Layer:
    def __init__(self, name, t0, t1, tin=0.36, tout=0.20, rise=16, dx=0, dy=0):
        self.name, self.t0, self.t1, self.tin, self.tout, self.rise = name, t0, t1, tin, tout, rise
        self.dx, self.dy = dx, dy                      # moved off its drawn place so it never sits on a dial


# ───────────────────────────── timeline ──────────────────────────────────────
def timeline():
    """Scene lengths follow the recorded VO (voice-01). Source ranges are stretches where the phone and the
    hand are reasonably calm and the picture is in focus (measured frame by frame)."""
    D = 31.0
    vo = [('01_hook', 0.40), ('02_colours', 4.95), ('03_lock', 10.15), ('04_machine', 12.35),
          ('05_water', 14.65), ('06_warranty', 17.50), ('07_price', 21.35), ('08_cta', 25.60)]
    segs = [
        # 01 hook — "প্রথম দেখাতেই চোখ আটকে যাবে। মিকার হানিকম্ব কালেকশন।"
        Seg('B', 91, 0.00, 1.35, bias=(-8, 0)),                    # white dial, very close
        Seg('C', 0, 1.35, 2.50),                                   # white dial in the palm
        Seg('B', 862, 2.50, 3.90, fb=892, bias=(25, -15)),         # three colours lying on the paper
        # "চারটি অভিজাত রঙ —" one take: the blue one is laid down beside the others, the green one picked up
        Seg('A', 698, 3.90, 6.60, push=0.03),
        # 02 one colour per word — সাদা · নীল · সবুজ · কালো
        Seg('C', 538, 6.60, 7.50),
        Seg('A', 660, 7.50, 8.30),
        Seg('B', 1281, 8.30, 9.10),
        Seg('B', 921, 9.10, 10.00, z=1.20),
        # 03 butterfly lock: open → closed
        Seg('C', 311, 10.00, 11.25, z=1.20),
        Seg('C', 372, 11.25, 12.20, z=1.20),
        # 04 semi-automatic machine (see-through back)
        Seg('B', 287, 12.20, 13.90),
        Seg('A', 246, 13.90, 14.50),
        # 05 waterproof · colour guarantee
        Seg('A', 1048, 14.50, 15.95),
        Seg('A', 313, 15.95, 17.35),
        # 06 1-year warranty · 7-day replacement
        Seg('B', 1241, 17.35, 18.10),
        Seg('A', 950, 18.10, 18.85, z=1.20, bias=(0, -30)),
        Seg('C', 578, 18.85, 20.00, z=1.20, bias=(-10, 0)),
        Seg('A', 820, 20.00, 21.20),
        # 07 price · cash on delivery
        Seg('B', 91, 21.20, 22.40, bias=(-8, 0)),
        Seg('A', 133, 22.40, 23.70),
        Seg('A', 853, 23.70, 25.40, fb=907, z=1.30, push=0.03, bias=(10, 200)),
        # 08 order card — the four colours in a row along the top, the card on the empty paper below
        Seg('A', 0, 25.40, D, fb=20, z=1.10, push=0.03, bias=(0, -200)),
    ]
    segs[0].first, segs[-1].last = True, True
    L = [
        Layer('head', 0.45, 25.60, tin=0.5, tout=0.35, rise=0),       # the order card carries the mark and the price itself
        Layer('price', 0.60, 25.60, tin=0.5, tout=0.35, rise=0),
        Layer('lab_name', 2.80, 3.80, dx=170),
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
        Layer('lab_cod', 23.84, 25.25, dy=-560),
        Layer('cta', 25.60, D + 1, tin=0.55, rise=26),
    ]
    cuts = [s.t0 for s in segs[1:]]
    sfx = dict(whoosh=[2.50, 3.90, 10.00, 12.20, 14.50, 17.35, 21.20, 25.40],
               click=[11.32], tick=[12.55, 13.05, 13.55, 14.05], drop=[14.60],
               shimmer=[0.05, 21.40, 25.55], tap=[6.60, 7.50, 8.30, 9.10], boom=[0.0, 25.42])
    scenes = [0, 3.90, 6.60, 10.00, 12.20, 14.50, 17.35, 21.20, 25.40, D]
    return dict(D=D, segs=segs, layers=L, vo=vo, sfx=sfx, scenes=scenes, cuts=cuts)


# ───────────────────────────── footage ───────────────────────────────────────
LK = dict(winSize=(21, 21), maxLevel=3, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))


def smooth(x, sig):
    """Gaussian low-pass that keeps a steady move steady at both ends (odd reflection)."""
    x = np.asarray(x, np.float64)
    n = len(x)
    k = min(n - 1, int(3 * sig) + 1)
    if sig <= 0 or k < 1:
        return x.copy()
    pad = np.concatenate([2 * x[0] - x[k:0:-1], x, 2 * x[-1] - x[-2:-k - 2:-1]])
    r = np.arange(-k, k + 1)
    g = np.exp(-0.5 * (r / sig) ** 2)
    return np.convolve(pad, g / g.sum(), mode='valid')


class Clip:
    """the real frames of one shot + how far each one has to move to take the shake out"""

    def __init__(self, seg):
        cap = cv2.VideoCapture(VIDS[seg.v])
        cap.set(cv2.CAP_PROP_POS_FRAMES, seg.fa)
        n = (seg.fb - seg.fa + 1) if seg.fb is not None else seg.count()
        self.frames = []
        for _ in range(n):
            ok, f = cap.read()
            if not ok:
                break
            self.frames.append(f)
        if seg.fb is None and len(self.frames) < n:
            raise SystemExit(f'clip {seg.v} from {seg.fa}: needs {n} frames, has {len(self.frames)}')
        n = len(self.frames)
        # dominant motion, frame to frame → path of the picture centre (P), scale (s) and angle (a)
        P, s, a = np.array([SW / 2, SH / 2]), 1.0, 0.0
        self.P, self.s, self.a = [P.copy()], [s], [a]
        g0 = cv2.cvtColor(self.frames[0], cv2.COLOR_BGR2GRAY)
        mask = np.zeros((SH, SW), np.uint8)
        mask[60:SH - 60, 30:SW - 30] = 255
        for i in range(1, n):
            g1 = cv2.cvtColor(self.frames[i], cv2.COLOR_BGR2GRAY)
            M = None
            p0 = cv2.goodFeaturesToTrack(g0, 500, 0.01, 6, mask=mask, blockSize=5) if (seg.stab > 0 or seg.lock) else None
            if p0 is not None and len(p0) >= 20:
                p1, st, _ = cv2.calcOpticalFlowPyrLK(g0, g1, p0, None, **LK)
                pb, st2, _ = cv2.calcOpticalFlowPyrLK(g1, g0, p1, None, **LK)
                ok = (st.ravel() == 1) & (st2.ravel() == 1) & (np.linalg.norm((pb - p0).reshape(-1, 2), axis=1) < 1.0)
                if ok.sum() >= 15:
                    M, _ = cv2.estimateAffinePartial2D(p0[ok], p1[ok], method=cv2.RANSAC, ransacReprojThreshold=2.0)
            if M is not None:
                ds, da = math.hypot(M[0, 0], M[1, 0]), math.atan2(M[1, 0], M[0, 0])
                nP = M @ np.array([P[0], P[1], 1.0])
                if 0.93 < ds < 1.07 and abs(da) < 0.07 and np.linalg.norm(nP - P) < 60:
                    P, s, a = nP, s * ds, a + da
            self.P.append(P.copy()); self.s.append(s); self.a.append(a)
            g0 = g1
        self.P = np.array(self.P)
        self.s, self.a = np.array(self.s), np.array(self.a)
        sig = seg.stab
        if seg.lock:                                   # hold the picture where it was on the first frame
            self.dP = self.P[0] - self.P
            self.ds = self.s[0] / self.s
            self.da = -self.a
            self.lam = None
            return
        self.dP = np.stack([smooth(self.P[:, 0], sig) - self.P[:, 0], smooth(self.P[:, 1], sig) - self.P[:, 1]], 1)
        self.ds = np.exp(smooth(np.log(self.s), sig) - np.log(self.s))
        self.da = smooth(self.a, sig) - self.a
        self.lam = None


def fit_matrix(seg, i, u, lam):
    """source → screen for loaded frame i at shot progress u, with `lam` (0..1) of the stabilising correction"""
    c = seg.clip
    z = seg.z + seg.push * u
    mx, my = SW / 2 * (1 - 1 / z), SH / 2 * (1 - 1 / z)            # how far the window can move inside the frame
    bx = float(np.clip(seg.bias[0] + seg.drift[0] * (u - 0.5), -mx, mx))
    by = float(np.clip(seg.bias[1] + seg.drift[1] * (u - 0.5), -my, my))
    k = c.ds[i] ** lam
    th = c.da[i] * lam
    R = np.array([[math.cos(th), -math.sin(th)], [math.sin(th), math.cos(th)]]) * k
    P = c.P[i]
    tC = P + lam * c.dP[i] - R @ P                                   # stabilised = R·p + tC
    Z = FIT * z
    M = np.zeros((2, 3))
    M[:, :2] = Z * R
    M[:, 2] = Z * (tC - np.array([SW / 2 + bx, SH / 2 + by])) + np.array([W / 2, H / 2])
    return M


def inside(M):
    inv = cv2.invertAffineTransform(M)
    q = (inv[:, :2] @ np.array([[0, 0], [W, 0], [W, H], [0, H]], np.float64).T).T + inv[:, 2]
    return q[:, 0].min() >= -0.4 and q[:, 0].max() <= SW + 0.4 and q[:, 1].min() >= -0.4 and q[:, 1].max() <= SH + 0.4


def prepare(seg):
    """load the shot and decide, frame by frame, how much of the correction fits inside the crop margin"""
    if seg.clip is not None:
        return
    seg.clip = c = Clip(seg)
    n = len(c.frames)
    ts, te = seg.span()
    lam = np.ones(n)
    for i in range(n):
        fits = lambda l: all(inside(fit_matrix(seg, i, u, l)) for u in (0.0, 0.5, 1.0))
        if fits(1.0):
            continue
        lo, hi = 0.0, 1.0
        for _ in range(9):
            mid = (lo + hi) / 2
            if fits(mid):
                lo = mid
            else:
                hi = mid
        lam[i] = lo
    # never let the amount of correction jump from one frame to the next
    k = 5
    padded = np.concatenate([np.full(k, lam[0]), lam, np.full(k, lam[-1])])
    lam = np.array([padded[i:i + 2 * k + 1].min() for i in range(n)])
    c.lam = np.minimum(smooth(lam, 3.0), 1.0) * 0.96
    res = np.hypot(*(c.dP * c.lam[:, None]).T)
    print(f'   {seg.v}{seg.fa:<5d} {n:3d} fr  shake taken out: mean {res.mean():4.1f} max {res.max():4.1f} src px'
          f'   kept back (margin): {100 * (1 - c.lam.mean()):3.0f}%', flush=True)


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

    # footage ---------------------------------------------------------------
    def shot(self, seg, t):
        """one real source frame, resampled once"""
        prepare(seg)
        c = seg.clip
        i = seg.index(t)
        u = (t - seg.t0) / (seg.t1 - seg.t0)
        M = fit_matrix(seg, i, u, float(c.lam[i]))
        out = cv2.warpAffine(c.frames[i], M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT_101)
        if SHARP > 0:
            out = cv2.addWeighted(out, 1 + SHARP, cv2.GaussianBlur(out, (0, 0), 1.5), -SHARP, 0)
        return out

    def footage(self, t):
        segs = self.tl['segs']
        act = []
        for s in segs:
            ts, te = s.span()
            if ts <= t < te or (s.last and t >= ts):
                act.append(s)
        for s in segs:                                   # free shots that are over
            if s.clip is not None and s.span()[1] < t - 0.5 and s not in act:
                s.clip = None
        if len(act) == 1:
            return self.shot(act[0], t)
        a, b = act[0], act[1]                            # a leaves, b arrives
        p = min(1.0, max(0.0, (t - (b.t0 - X / 2)) / X))
        k = p * p * (3 - 2 * p)
        return cv2.addWeighted(self.shot(a, t), 1 - k, self.shot(b, t), k, 0)

    # type ------------------------------------------------------------------
    def put(self, img, name, op, dy=0, dx=0):
        x0, y0, rgb, a = self.type[name]
        x0, y0 = x0 + int(dx), int(round(y0 + dy))
        h, w = rgb.shape[:2]
        ya, yb = max(0, y0), min(H, y0 + h)
        if yb <= ya or op <= 0:
            return
        sl = img[ya:yb, x0:x0 + w].astype(np.float32)
        al = a[ya - y0:yb - y0] * op
        sl += (rgb[ya - y0:yb - y0] - sl) * al
        img[ya:yb, x0:x0 + w] = np.clip(sl + 0.5, 0, 255).astype(np.uint8)

    def frame(self, t, n=0, cover=False):
        img = self.footage(t)
        if t < 0.30:
            img = cv2.convertScaleAbs(img, alpha=(t / 0.30) ** 1.5)       # opens from black
        for l in self.tl['layers']:
            if cover and l.name.startswith('lab_'):
                continue
            if l.t0 <= t < l.t1:
                ki = min(1.0, (t - l.t0) / l.tin)
                ko = min(1.0, (l.t1 - t) / l.tout)
                e = 1 - (1 - ki) ** 3
                self.put(img, l.name, e * ko, dy=l.dy + l.rise * (1 - e), dx=l.dx)
        if cover:
            self.put(img, 'cover', 1.0)
        return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--stills')
    ap.add_argument('--sheet', type=float)
    ap.add_argument('--out')
    ap.add_argument('--audio')
    ap.add_argument('--cover')
    ap.add_argument('--range')
    ap.add_argument('--crf', type=int, default=16)
    a = ap.parse_args()
    R = Renderer(cover=bool(a.cover))
    D = R.tl['D']
    if a.stills:
        os.makedirs(f'{BASE}/work/stills', exist_ok=True)
        for s in a.stills.split(','):
            t = float(s)
            cv2.imwrite(f'{BASE}/work/stills/t_{t:05.2f}.png', R.frame(t, int(t * FPS)))
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
        R = Renderer(cover=True)
        cv2.imwrite(a.cover, R.frame(0.90, 3, cover=True), [cv2.IMWRITE_JPEG_QUALITY, 95])
        print('cover →', a.cover)
    if a.out:
        n0, n1 = 0, int(round(D * FPS))
        if a.range:
            ta, tb = map(float, a.range.split(':'))
            n0, n1 = int(round(ta * FPS)), int(round(tb * FPS))
        R = Renderer()
        # The sources are BT.709, limited range. OpenCV decodes them with that matrix, so the frames go back to YUV
        # with the same matrix (swscale would use BT.601 by default and shift the hues) and are tagged BT.709.
        # Measured on a 1:1 round trip: chroma within 0.1 level of the source; luma comes back 1 level low
        # (rounding in both conversions), which the +1 below puts right.
        cmd = [FF, '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-']
        if a.audio:
            # x264 B-frames delay the first video frame by 2 frames; no MP4 edit list (Meta) → delay the audio instead
            cmd += ['-i', a.audio, '-map', '0:v', '-map', '1:a', '-af', 'adelay=45|45',
                    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2']
        cmd += ['-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-sws_flags', 'accurate_rnd+full_chroma_int',
                '-c:v', 'libx264', '-preset', 'slow', '-crf', str(a.crf), '-maxrate', '12M', '-bufsize', '24M',
                '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p', '-g', '30',
                '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
                '-movflags', '+faststart', '-use_editlist', '0', a.out]
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        for n in range(n0, n1):
            p.stdin.write(cv2.add(R.frame(n / FPS, n), (1, 1, 1, 0)).tobytes())
            if n % 60 == 0:
                print(f'frame {n}/{n1}', flush=True)
        p.stdin.close()
        p.wait()
        print('wrote', a.out, n1 - n0, 'frames')


if __name__ == '__main__':
    main()
