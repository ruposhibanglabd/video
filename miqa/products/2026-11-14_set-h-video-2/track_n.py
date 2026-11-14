#!/usr/bin/env python3
"""Set H video 2 (2026-11-14, WhatsApp 480x854 clips) — subject tracker for the client's handheld phone clips.

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
VIDS = {k: f'{BASE}/input/{k}.mp4' for k in 'ABC'}
FPS = 30

# name: clip, first/last source frame, seed frame, seed centre (x, y), seed half-size (w, h)   [source px, 480x854]
SHOTS = {
    # dial close-ups
    'W1': dict(v='B', f0=96, f1=148, fs=120, c=(208, 396), h=(190, 190)),     # white, very close
    'W2': dict(v='C', f0=0, f1=40, fs=18, c=(188, 427), h=(140, 140)),        # white, in the palm
    'W3': dict(v='C', f0=534, f1=566, fs=548, c=(235, 377), h=(170, 170)),
    'W4': dict(v='C', f0=578, f1=622, fs=602, c=(267, 350), h=(150, 150)),
    'U1': dict(v='B', f0=1099, f1=1129, fs=1113, c=(239, 269), h=(158, 158)), # blue
    'U2': dict(v='A', f0=1055, f1=1097, fs=1075, c=(247, 324), h=(135, 135)),
    'U3': dict(v='B', f0=750, f1=790, fs=768, c=(267, 269), h=(170, 170)),    # blue, reads navy in this light
    'G1': dict(v='B', f0=1235, f1=1267, fs=1249, c=(287, 287), h=(128, 128)), # green
    'G2': dict(v='B', f0=1285, f1=1317, fs=1300, c=(230, 397), h=(108, 108)),
    'G3': dict(v='A', f0=741, f1=769, fs=755, c=(337, 388), h=(108, 108)),
    'K1': dict(v='B', f0=919, f1=955, fs=939, c=(230, 359), h=(152, 152)),    # black, steel bezel
    # line-ups on the table
    'L1': dict(v='A', f0=0, f1=26, fs=12, c=(239, 184), h=(235, 150)),
    'L2': dict(v='B', f0=58, f1=80, fs=70, c=(241, 534), h=(200, 230)),
    'L3': dict(v='A', f0=863, f1=907, fs=885, c=(322, 644), h=(170, 190)),
    # butterfly clasp, bracelet
    'CL1': dict(v='C', f0=301, f1=349, fs=325, c=(175, 368), h=(100, 270)),
    'CL2': dict(v='C', f0=369, f1=403, fs=387, c=(202, 397), h=(110, 270)),
    'CL3': dict(v='A', f0=368, f1=416, fs=388, c=(247, 434), h=(120, 330)),
    'BR1': dict(v='B', f0=540, f1=580, fs=558, c=(169, 508), h=(120, 300)),
    'BR2': dict(v='A', f0=340, f1=362, fs=350, c=(223, 416), h=(110, 220)),
    # see-through case back
    'M1': dict(v='B', f0=294, f1=342, fs=320, c=(276, 324), h=(115, 115)),
    'M2': dict(v='A', f0=242, f1=272, fs=256, c=(230, 462), h=(135, 135)),
}

LK = dict(winSize=(21, 21), maxLevel=3,
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
    p = cv2.goodFeaturesToTrack(gray, 400, 0.01, 4, mask=mask, blockSize=5)
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
    ok = (st.ravel() == 1) & (st2.ravel() == 1) & (fb < 1.0)
    if ok.sum() < 10:
        return state, int(ok.sum())
    M, inl = cv2.estimateAffinePartial2D(p0[ok], p1[ok], method=cv2.RANSAC, ransacReprojThreshold=1.5)
    if M is None:
        return state, 0
    ds = math.hypot(M[0, 0], M[1, 0])
    da = math.atan2(M[1, 0], M[0, 0])
    nc = M @ np.array([c[0], c[1], 1.0])
    return ((float(nc[0]), float(nc[1])), s * ds, a + da, h0), int(inl.sum())


def track(name, sh):
    f0, f1, fs = sh['f0'], sh['f1'], sh['fs']
    frames = read_frames(VIDS[sh['v']], f0, f1)
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
    sharp = []
    for g, r in zip(grays, res):                 # sharpness of the subject itself, not of the desk
        (cx, cy), s = r[0], r[1]
        hw, hh = sh['h'][0] * s * 0.8, sh['h'][1] * s * 0.8
        x0, x1 = int(max(0, cx - hw)), int(min(g.shape[1], cx + hw))
        y0, y1 = int(max(0, cy - hh)), int(min(g.shape[0], cy + hh))
        sharp.append(float(cv2.Laplacian(g[y0:y1, x0:x1], cv2.CV_64F).var()) if x1 - x0 > 8 and y1 - y0 > 8 else 1.0)
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
        t = cv2.warpAffine(frames[i], M, (540, 800), flags=cv2.INTER_CUBIC, borderValue=(235, 240, 244))
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
