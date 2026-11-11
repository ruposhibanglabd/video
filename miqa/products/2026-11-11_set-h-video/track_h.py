#!/usr/bin/env python3
"""Set H video — subject tracker for the client's handheld phone clips.

For every shot we follow one region (a dial, the clasp, the case back, or the
static line-up on the paper) with pyramidal Lucas-Kanade features and a RANSAC
similarity fit.  The result (centre, scale, angle per source frame) lets the
renderer lock the subject on the stage, which is what turns shaky handheld
footage into a smooth "product on a turntable" move.

Out: work/tracks.json  (+ work/track_preview_*.jpg for eyeballing)
"""
import glob, json, math, os, sys
import cv2
import numpy as np

BASE = os.path.dirname(os.path.abspath(__file__))
VIDS = sorted(glob.glob(f'{BASE}/input/VID_*.mp4'))
FPS = 30

# name: clip#, t0, t1, seed time, seed centre (x, y), seed half-size (w, h)   [source px, 1080x1920]
SHOTS = {
    # hook: stabilise on the three watches lying on the paper; the hand brings the white one in
    'A': dict(v=1, t0=0.00, t1=3.10, ts=0.00, c=(420, 520), h=(400, 300)),
    # dial close-ups, one per colour
    'C': dict(v=3, t0=8.20, t1=9.73, ts=8.95, c=(545, 880), h=(400, 400)),   # white
    'D': dict(v=5, t0=1.95, t1=3.25, ts=2.50, c=(555, 800), h=(350, 350)),   # navy
    'E': dict(v=4, t0=0.30, t1=2.13, ts=1.20, c=(560, 610), h=(350, 350)),   # blue
    'F': dict(v=4, t0=4.55, t1=5.33, ts=4.97, c=(390, 520), h=(260, 260)),   # green
    # butterfly clasp: open, then closed
    'G': dict(v=2, t0=1.33, t1=2.53, ts=1.85, c=(530, 1070), h=(190, 520)),
    'H': dict(v=1, t0=10.45, t1=11.47, ts=10.95, c=(530, 1300), h=(180, 480)),
    # see-through case back
    'I': dict(v=2, t0=3.00, t1=3.77, ts=3.38, c=(657, 1530), h=(210, 210)),
    'J': dict(v=3, t0=1.95, t1=3.37, ts=2.68, c=(400, 1000), h=(290, 290)),
    'K': dict(v=4, t0=7.90, t1=9.37, ts=8.62, c=(600, 1000), h=(290, 290)),
    # bracelet in hand, the other three colours behind it (track the bracelet)
    'L': dict(v=1, t0=7.60, t1=10.20, ts=8.90, c=(390, 1400), h=(230, 260)),
    # line-up on the paper
    'M': dict(v=2, t0=8.25, t1=10.27, ts=9.25, c=(480, 850), h=(430, 380)),
    'N': dict(v=3, t0=0.30, t1=1.43, ts=0.85, c=(560, 880), h=(450, 420)),
}

LK = dict(winSize=(31, 31), maxLevel=4,
          criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))


def read_frames(path, f0, f1):
    cap = cv2.VideoCapture(path)
    cap.set(cv2.CAP_PROP_POS_FRAMES, f0)
    out = []
    for _ in range(f0, f1 + 1):
        ok, f = cap.read()
        if not ok:
            break
        out.append(f)
    return out


def feats(gray, c, h, ang):
    mask = np.zeros(gray.shape, np.uint8)
    cv2.ellipse(mask, (int(c[0]), int(c[1])), (int(h[0]), int(h[1])), math.degrees(ang), 0, 360, 255, -1)
    p = cv2.goodFeaturesToTrack(gray, 400, 0.01, 9, mask=mask, blockSize=7)
    return p if p is not None else np.zeros((0, 1, 2), np.float32)


def step(g0, g1, state):
    """advance state (c, s, a) from frame g0 to g1"""
    c, s, a, h0 = state
    h = (h0[0] * s, h0[1] * s)
    p0 = feats(g0, c, h, a)
    if len(p0) < 12:
        return state, 0
    p1, st, _ = cv2.calcOpticalFlowPyrLK(g0, g1, p0, None, **LK)
    pb, st2, _ = cv2.calcOpticalFlowPyrLK(g1, g0, p1, None, **LK)
    fb = np.linalg.norm((pb - p0).reshape(-1, 2), axis=1)
    ok = (st.ravel() == 1) & (st2.ravel() == 1) & (fb < 1.5)
    if ok.sum() < 10:
        return state, int(ok.sum())
    M, inl = cv2.estimateAffinePartial2D(p0[ok], p1[ok], method=cv2.RANSAC, ransacReprojThreshold=3.0)
    if M is None:
        return state, 0
    ds = math.hypot(M[0, 0], M[1, 0])
    da = math.atan2(M[1, 0], M[0, 0])
    nc = M @ np.array([c[0], c[1], 1.0])
    return ((float(nc[0]), float(nc[1])), s * ds, a + da, h0), int(inl.sum())


def track(name, sh):
    f0, f1, fs = round(sh['t0'] * FPS), round(sh['t1'] * FPS), round(sh['ts'] * FPS)
    frames = read_frames(VIDS[sh['v'] - 1], f0, f1)
    f1 = f0 + len(frames) - 1
    grays = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
    n = len(frames)
    res = [None] * n
    k = fs - f0
    seed = (tuple(map(float, sh['c'])), 1.0, 0.0, tuple(map(float, sh['h'])))
    res[k] = seed
    inl = [0] * n
    st = seed
    for i in range(k + 1, n):
        st, inl[i] = step(grays[i - 1], grays[i], st)
        res[i] = st
    st = seed
    for i in range(k - 1, -1, -1):
        st, inl[i] = step(grays[i + 1], grays[i], st)
        res[i] = st
    sharp = [float(cv2.Laplacian(cv2.resize(g, (540, 960)), cv2.CV_64F).var()) for g in grays]
    return dict(v=sh['v'], f0=f0, f1=f1, half=list(sh['h']),
                cx=[r[0][0] for r in res], cy=[r[0][1] for r in res],
                s=[r[1] for r in res], a=[r[2] for r in res], inl=inl, sharp=sharp), frames


def preview(name, tr, frames):
    n = len(frames)
    idx = np.linspace(0, n - 1, 6).round().astype(int)
    tiles = []
    hh = max(tr['half'])
    for i in idx:
        s = 230.0 / (hh * tr['s'][i])            # subject half-size -> 230 px
        a = -tr['a'][i]
        ca, sa = math.cos(a) * s, math.sin(a) * s
        M = np.array([[ca, -sa, 0], [sa, ca, 0]], np.float64)
        p = M[:, :2] @ np.array([tr['cx'][i], tr['cy'][i]])
        M[:, 2] = np.array([270, 400]) - p
        t = cv2.warpAffine(frames[i], M, (540, 800), flags=cv2.INTER_AREA, borderValue=(235, 240, 244))
        cv2.putText(t, f"{name} f{tr['f0'] + i} in{tr['inl'][i]} s{tr['s'][i]:.2f} a{math.degrees(tr['a'][i]):.0f}",
                    (6, 24), 0, 0.6, (0, 0, 255), 2)
        tiles.append(t)
    return np.hstack(tiles)


if __name__ == '__main__':
    os.makedirs(f'{BASE}/work', exist_ok=True)
    only = sys.argv[1:]
    path = f'{BASE}/work/tracks.json'
    out = json.load(open(path)) if os.path.exists(path) else {}
    for name, sh in SHOTS.items():
        if only and name not in only:
            continue
        tr, frames = track(name, sh)
        out[name] = tr
        cv2.imwrite(f'{BASE}/work/track_preview_{name}.jpg', preview(name, tr, frames), [cv2.IMWRITE_JPEG_QUALITY, 80])
        print(name, len(frames), 'frames  min inliers', min(tr['inl'][1:] or [0]),
              ' scale %.2f..%.2f' % (min(tr['s']), max(tr['s'])), flush=True)
    json.dump(out, open(path, 'w'))
