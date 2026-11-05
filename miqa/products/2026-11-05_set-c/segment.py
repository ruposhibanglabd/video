"""Set C cutouts, take 4 — classify then connect.

A pixel is "watch" unless it is flat, near-neutral pillow white/shadow or a
bright desaturated highlight.  The watch is then simply the connected blob that
contains the dark dial and the rose-gold bezel; antialiased collar pixels get a
soft alpha.
"""
import sys
import numpy as np, cv2
from PIL import Image

SRC = 'miqa/products/2026-11-05_set-c/source-photos'
OUT = 'miqa/products/2026-11-05_set-c/cut'
WIN = {                       # x0, x1, y0, y1 (rect the watch must live in)
    'image-3': (330, 830, 160, 1500),
    'image-5': (340, 840, 180, 1500),
    'image-7': (340, 850, 180, 1400),
    'image-9': (330, 840, 190, 1500),
    'image-11': (340, 840, 195, 1500),
}
PILLOW = np.array([246.0, 128.0, 132.0])
# clean band of the strap per photo: alpha ramps in/out over 26 px here
BAND = {
    'image-3': (356, 1420),
    'image-5': (470, 1418),
    'image-7': (232, 1360),
    'image-9': (206, 1380),
    'image-11': (212, 1400),
}     # Lab of the white pillow


def masks(bgr):
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    S, V = hsv[..., 1] / 255, hsv[..., 2] / 255
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    mu = cv2.blur(g, (11, 11)); mu2 = cv2.blur(g * g, (11, 11))
    tex = np.sqrt(np.maximum(mu2 - mu * mu, 0))
    chroma = np.abs(lab[..., 1] - 128) + np.abs(lab[..., 2] - 128)
    dist = np.linalg.norm(lab - PILLOW, axis=2)

    pillow = (dist < 19) & (S < 0.22) & (V > 0.60)
    flat = (tex < 0.032) & (chroma < 19) & (V > 0.28)
    return ~(pillow | flat), dist, chroma, tex


def cut(name, win=None):
    bgr = cv2.imread(f'{SRC}/{name}.png', cv2.IMREAD_COLOR)
    x0, x1, y0, y1 = win or WIN[name]
    fg, dist, chroma, tex = masks(bgr)
    h, w = fg.shape
    keep = np.zeros_like(fg)
    keep[y0:y1, x0:x1] = True
    m = (fg & keep).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))

    # anchor: the case = biggest very-dark blob inside the window
    V = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(np.float32)[..., 2] / 255
    dark = ((V < 0.5).astype(np.uint8) & keep.astype(np.uint8))
    dark = cv2.morphologyEx(dark, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    ncc, lab, stats, cen = cv2.connectedComponentsWithStats(dark, 8)
    if ncc < 2:
        raise RuntimeError('no dial')
    i = 1 + np.argmax(stats[1:, 4])
    dial_core = (lab == i).astype(np.uint8)
    anchor = cv2.dilate(dial_core, np.ones((45, 45), np.uint8))

    ncc, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    best, score = 0, -1
    for j in range(1, ncc):
        s = int(((lab == j) & (anchor > 0)).sum())
        if stats[j, 4] < 3000:
            continue
        if s > score:
            best, score = j, s
    m = (lab == best).astype(np.uint8)
    if score <= 0:                      # fall back to the whole thing
        m = (fg & keep).astype(np.uint8)

    # kill hair-thin tendrils (bracelet links are >=20 px wide)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    m[:, :int(0.30 * w)] = 0
    m[:, int(0.72 * w):] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    ncc, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    best, score = 0, -1
    for j in range(1, ncc):
        s = int(((lab == j) & (anchor > 0)).sum())
        if s > score:
            best, score = j, s
    m = (lab == best).astype(np.uint8)

    # every fully enclosed hole is watch (bright dial facets, crystal flats);
    # the open link gaps touch the outline and stay transparent
    ff = m.copy()
    hh, ww = ff.shape
    mask2 = np.zeros((hh + 2, ww + 2), np.uint8)
    cv2.floodFill(ff, mask2, (0, 0), 1)
    holes = (ff == 0).astype(np.uint8)
    ncc, lab, stats, _ = cv2.connectedComponentsWithStats(holes, 8)
    for j in range(1, ncc):
        if stats[j, 4] < 200000:
            m[lab == j] = 1

    # keep only the strap that runs through the case: per row, the run nearest
    # the dial centre that is not wider than a case (fingers/shadow are wider)
    d = cv2.connectedComponentsWithStats(anchor.astype(np.uint8), 8)
    dys, dxs = np.where(anchor > 0)
    cx = float(np.median(dxs))
    dw = float(np.percentile(dxs, 95) - np.percentile(dxs, 5))
    band = np.zeros_like(m)
    rows = np.where(m.any(1))[0]
    for y in rows:
        r = np.where(m[y])[0]
        if not r.size:
            continue
        runs = np.split(r, np.where(np.diff(r) > 1)[0] + 1)
        cand = [q for q in runs if (q[-1] - q[0]) < dw * 1.35 and abs(q.mean() - cx) < dw * 0.75]
        if not cand:
            cand = [q for q in runs if (q[-1] - q[0]) < 40 and abs(q.mean() - cx) < dw * 0.75]
        if not cand:
            continue
        q = min(cand, key=lambda q: abs(q.mean() - cx))
        band[y, q[0]:q[-1] + 1] = 1
    m = band
    # the strap never wanders far from the case centreline: hard window outside
    # the case rows (this removes nails, wires, box edges for good)
    cys, cxs = np.where(dial_core > 0)
    cy0, cy1 = int(np.percentile(cys, 2)), int(np.percentile(cys, 98))
    dxs2 = cxs; cw = float(np.percentile(dxs2, 98) - np.percentile(dxs2, 2))
    half = int(cw * 0.46)
    x0w, x1w = int(cx - half), int(cx + half)
    m[:cy0, :max(0, x0w)] = 0; m[:cy0, x1w:] = 0
    m[cy1:, :max(0, x0w)] = 0; m[cy1:, x1w:] = 0
    # outside the case, a row can never be wider than the bracelet really is
    strap_rows = [y for y in rows if y < cy0 - 6 or y > cy1 + 6]
    if strap_rows:
        ww_ = [int(m[y].sum()) for y in strap_rows]
        lim = max(40, int(np.percentile(ww_, 92) * 1.25))
        for y in strap_rows:
            r = np.where(m[y])[0]
            if r.size > lim:
                c0 = int(np.median(r))
                lo2 = max(0, c0 - lim // 2); hi2 = min(m.shape[1], lo2 + lim)
                m[y, :] = 0
                m[y, lo2:hi2] = 1
    # the case itself is solid: fill each case row edge to edge (only when the
    # row is not wider than the case, so neighbours never get bridged in)
    case_w = float(np.percentile(np.where(dial_core.any(0))[0], 98) -
                   np.percentile(np.where(dial_core.any(0))[0], 2))
    for y in range(max(0, cy0 - 8), min(h, cy1 + 9)):
        r = np.where(m[y])[0]
        if r.size and (r.max() - r.min()) < case_w * 1.25:
            m[y, r.min():r.max() + 1] = 1
    # top of the strap: drop smooth neutral stuff (fingernails, pillow folds)
    ys = np.where(m.any(1))[0]
    if ys.size:
        top = ys.min()
        zone = np.zeros_like(m, bool)
        zone[top:top + 90] = True
        weak = zone & (chroma < 17) & (tex < 0.038) & (m > 0)
        m[weak] = 0

    # ---- local background estimate: inpaint the watch away, keep the pillow ----
    hole = cv2.dilate(m, np.ones((11, 11), np.uint8))
    bg_est = cv2.inpaint(bgr, hole, 7, cv2.INPAINT_TELEA)
    bg_est = cv2.GaussianBlur(bg_est, (0, 0), 5)
    lab_src = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    lab_bg = cv2.cvtColor(bg_est, cv2.COLOR_BGR2LAB).astype(np.float32)
    d = np.linalg.norm(lab_src - lab_bg, axis=2)
    soft = np.clip((d - 24.0) / 16.0, 0, 1)
    soft = soft * soft * (3 - 2 * soft)

    # only the deep interior is forced opaque; the rim is decided by colour so
    # no pillow-white halo can survive on the outline
    deep = cv2.erode(m, np.ones((13, 13), np.uint8))
    rim = cv2.dilate(m, np.ones((5, 5), np.uint8))
    a = np.where(deep > 0, 1.0, np.where(rim > 0, soft, 0.0)).astype(np.float32)
    a = np.minimum(a, 1.0)

    # decontaminate the fringe with the real local background colour
    aa = a[..., None]
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255
    bgrgb = cv2.cvtColor(bg_est, cv2.COLOR_BGR2RGB).astype(np.float32) / 255
    fg = np.clip((rgb - (1 - aa) * bgrgb) / np.maximum(aa, 0.20), 0, 1)
    rgb = np.where(aa > 0.99, rgb, fg)
    # nothing outside the clean strap band exists (kills the needle-liner wire
    # and the plastic tweezers that touch the last link)
    t0, t1 = BAND[name]
    a[:max(0, t0 - 6), :] = 0
    a[min(h, t1 + 6):, :] = 0

    # drop stray slivers (hairs, wires, needle-thin highlights)
    hard = (a > 0.30).astype(np.uint8)
    ncc, lab, stats, _ = cv2.connectedComponentsWithStats(hard, 8)
    keep = np.zeros_like(hard)
    for j in range(1, ncc):
        if stats[j, 4] >= 700:
            keep[lab == j] = 1
    a = a * cv2.dilate(keep, np.ones((3, 3), np.uint8))
    aa = a[..., None]
    rgba = (np.dstack([rgb * 255, aa[..., 0] * 255])).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(f'{OUT}/{name}.png')
    a8 = rgba[..., 3]
    ys, xs = np.where(a8 > 90)
    print(name, 'bbox', xs.min(), ys.min(), xs.max(), ys.max(), 'px', int((a8 > 128).sum()))


if __name__ == '__main__':
    for n in (sys.argv[1:] or list(WIN)):
        cut(n)
