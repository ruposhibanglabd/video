"""Set C — finishing pass.

The AI render gives the watch. This step
  1. models the render's own backdrop as a smooth radial field and lifts the
     watch (plus the shadow the render put under it) off it,
  2. re-places the watch on the ONE canonical Blush Mist canvas so all
     products in the set match exactly, at the guide's primary grid,
  3. upscales to 2000x2000 with Lanczos + detail recovery, and
  4. puts the two feature chips on the primary, insets cut from that watch.

Usage:  python finish.py <slug> [<slug> ...]
"""
import os, sys
import numpy as np, cv2
from PIL import Image

ROOT = 'miqa/products/2026-11-05_set-c'
GEN = f'{ROOT}/gen'
DEL = 'miqa/deliveries/2026-11-05_set-c'
N = 2000
BASE = np.array([246, 225, 231], np.float32) / 255
LIFT = np.array([252, 239, 242], np.float32) / 255
EDGE = np.array([239, 208, 217], np.float32) / 255
SHADOW = np.array([0.353, 0.102, 0.180], np.float32)      # #5A1A2E

ORDER = [('01_primary', 'primary'), ('02_on-wrist', 'on-wrist'), ('03_angle', 'angle'),
         ('04_dial-closeup', 'dial-closeup'), ('05_styled', 'styled')]
SCENE = {'02_on-wrist', '05_styled'}        # keep their own set (hand / silk)

# per-shot framing on the 2000 canvas: watch height, watch centre y
FRAME = {
    '01_primary':      dict(h=1290, cy=790),
    '03_angle':        dict(h=1700, cy=960),
    '04_dial-closeup': dict(h=2050, cy=1000),
}


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def canonical_bg(h, w, cy_frac=0.46, seed=5):
    yy, xx = np.mgrid[:h, :w].astype(np.float32)
    d = np.sqrt(((xx - w / 2) / (w * 0.72)) ** 2 + ((yy - h * cy_frac) / (h * 0.72)) ** 2)
    t1 = smooth(d / 0.55)[..., None]
    t2 = smooth((d - 0.55) / 0.65)[..., None]
    col = LIFT * (1 - t1) + BASE * t1
    col = col * (1 - t2) + EDGE * t2
    col += np.random.default_rng(seed).normal(0, 0.0028, (h, w, 1)).astype(np.float32)
    return np.clip(col, 0, 1)


def bg_field(img):
    """radial polynomial fit of the render's backdrop (watch pixels excluded)"""
    h, w = img.shape[:2]
    yy, xx = np.mgrid[:h, :w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / w) ** 2 + ((yy - h / 2) / h) ** 2)
    pink = (img[..., 0] > 0.72) & (img[..., 1] > 0.55) & (img[..., 0] - img[..., 2] > 0.02) \
        & (img[..., 0] - img[..., 1] > 0.01)
    # only the calm margins are trusted (the watch's own shadow sits near it)
    margin = (r > 0.30)
    sel = pink & margin
    if sel.sum() < 2000:
        sel = pink
    A = np.stack([np.ones_like(r), r, r ** 2, r ** 3], -1)[sel]
    out = np.zeros((h, w, 3), np.float32)
    for c in range(3):
        coef, *_ = np.linalg.lstsq(A, img[..., c][sel], rcond=None)
        out[..., c] = coef[0] + coef[1] * r + coef[2] * r ** 2 + coef[3] * r ** 3
    return np.clip(out, 0, 1)


def guided(I, p, rad, eps):
    k = (2 * rad + 1, 2 * rad + 1)
    mI = cv2.boxFilter(I, -1, k); mp = cv2.boxFilter(p, -1, k)
    cov = cv2.boxFilter(I * p, -1, k) - mI * mp
    var = cv2.boxFilter(I * I, -1, k) - mI * mI
    a = cov / (var + eps); b = mp - a * mI
    return cv2.boxFilter(a, -1, k) * I + cv2.boxFilter(b, -1, k)


def remap_bg(img):
    """keep the render (watch, shadow, reflection) and re-map ONLY the pink backdrop
    onto the canonical Blush Mist. Shadow/glow survive because the ratio is kept."""
    h, w = img.shape[:2]
    bg = bg_field(img)
    # colour-line residual: invariant to a brightness-only change (i.e. a shadow)
    num = (img * bg).sum(2, keepdims=True)
    den = np.maximum((bg * bg).sum(2, keepdims=True), 1e-6)
    resid = np.linalg.norm(img - num / den * bg, axis=2)
    subject = smooth((resid - 0.045) / 0.045)
    subject = cv2.morphologyEx((subject > 0.5).astype(np.uint8), cv2.MORPH_OPEN,
                               cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
    n, lb, st, _ = cv2.connectedComponentsWithStats(subject, 8)
    keep = np.zeros_like(subject)
    for j in range(1, n):
        if st[j, 4] > 0.004 * h * w:
            keep[lb == j] = 1
    g = cv2.cvtColor((img * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
    sub = guided(cv2.GaussianBlur(g, (0, 0), 0.7),
                 cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 2.0), 9, 1.2e-3)
    sub = smooth((sub - 0.30) / 0.40)
    # the ratio (render / its own backdrop) carries shadow and glow
    ratio = img / np.maximum(bg, 1e-3)
    ratio = np.clip(cv2.GaussianBlur(ratio, (0, 0), 3), 0.55, 1.30)
    ratio = ratio.mean(2, keepdims=True) * 0.65 + ratio * 0.35
    canon = canonical_bg(h, w)
    out = np.clip(canon * ratio, 0, 1)
    m = sub[..., None]
    return np.clip(out * (1 - m) + img * m, 0, 1)

def lift(img):
    """soft matte of watch + its shadow, and the colour with the backdrop removed"""
    h, w = img.shape[:2]
    bg = bg_field(img)
    d = np.linalg.norm(img - bg, axis=2)
    seed = (d > 0.030).astype(np.uint8)
    seed = cv2.morphologyEx(seed, cv2.MORPH_OPEN,
                            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    n, lb, st, _ = cv2.connectedComponentsWithStats(seed, 8)
    if n > 1:
        big = 1 + np.argmax(st[1:, 4])
        seed = (lb == big).astype(np.uint8)
    seed = cv2.morphologyEx(seed, cv2.MORPH_CLOSE,
                            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21)))
    ff = seed.copy(); m2 = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(ff, m2, (0, 0), 1)
    holes = (ff == 0).astype(np.uint8)
    n, lb, st, _ = cv2.connectedComponentsWithStats(holes, 8)
    for j in range(1, n):
        if st[j, 4] < 0.30 * h * w:
            seed[lb == j] = 1

    g = cv2.cvtColor((img * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
    a = guided(cv2.GaussianBlur(g, (0, 0), 0.7),
               cv2.GaussianBlur(seed.astype(np.float32), (0, 0), 1.3), 7, 1.0e-3)
    a = a * cv2.dilate(seed, np.ones((9, 9), np.uint8)).astype(np.float32)
    a = smooth((a - 0.32) / 0.40)
    # colour: unmix the backdrop
    aa = a[..., None]
    fg = np.clip((img - (1 - aa) * bg) / np.maximum(aa, 0.25), 0, 1)
    fg = np.where(aa > 0.99, img, fg)
    return fg, a


def place(fg, a, h_target, cy, angle=0.0):
    h, w = fg.shape[:2]
    sc = h_target / h
    small = cv2.resize(np.dstack([fg, a]), None, fx=sc, fy=sc, interpolation=cv2.INTER_LANCZOS4)
    sh, sw = small.shape[:2]
    canv = np.zeros((N, N, 4), np.float32)
    x0 = int(round(N / 2 - sw / 2)); y0 = int(round(cy - sh / 2))
    xs0, ys0 = max(0, x0), max(0, y0)
    xs1, ys1 = min(N, x0 + sw), min(N, y0 + sh)
    canv[ys0:ys1, xs0:xs1] = small[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0]
    if angle:
        M = cv2.getRotationMatrix2D((N / 2, cy), angle, 1.0)
        canv = cv2.warpAffine(canv, M, (N, N), flags=cv2.INTER_CUBIC, borderValue=(0, 0, 0, 0))
    rgb = np.clip(canv[..., :3] / np.maximum(canv[..., 3:4], 1e-4), 0, 1)
    return rgb, np.clip(canv[..., 3], 0, 1)


def shadow_of(a, blur, off, op):
    s = cv2.GaussianBlur(a, (0, 0), blur)
    s = cv2.warpAffine(s, np.float32([[1, 0, off[0]], [0, 1, off[1]]]), (N, N))
    return np.clip(s * op, 0, 1)


def compose(rgb, a, cy, seed=5):
    img = canonical_bg(N, N, seed=seed)
    for blur, off, op in ((52, (22, 34), 0.26), (10, (5, 9), 0.40)):
        s = shadow_of(a, blur, off, op)
        img = img * (1 - s[..., None]) + img * SHADOW * s[..., None]
    return rgb * a[..., None] + img * (1 - a[..., None])


def gentle_wb(img):
    """a +/-4 % corner white balance so the five products read as one set"""
    h, w = img.shape[:2]
    k = 70
    corners = np.concatenate([img[:k, :k].reshape(-1, 3), img[:k, -k:].reshape(-1, 3),
                              img[-k:, :k].reshape(-1, 3), img[-k:, -k:].reshape(-1, 3)])
    ref = np.median(corners, 0)
    gain = np.clip(BASE / np.maximum(ref, 1e-3), 0.955, 1.045)
    return np.clip(img * gain, 0, 1)


def upscale(img):
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).resize((N, N), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255
    a = np.clip(a + (a - cv2.GaussianBlur(a, (0, 0), 1.1)) * 0.40, 0, 1)
    hsv = cv2.cvtColor((a * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.05, 0, 255)
    return cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32) / 255


def chip_inset(img, out_png, x_hint=0.50, y_hint=0.44):
    h, w = img.shape[:2]
    V = img.max(2)
    m = (V < 0.22).astype(np.uint8)
    n, lb, st, cen = cv2.connectedComponentsWithStats(m, 8)
    cx, cy, s = int(w * x_hint), int(h * y_hint), int(w * 0.32)
    if n > 1:
        i = 1 + np.argmax(st[1:, 4])
        if st[i, 4] > 0.01 * h * w:
            cx, cy = int(cen[i][0]), int(cen[i][1])
            s = int(st[i, 2] * 1.20)
    s = max(140, min(s, min(h, w)))
    x0 = max(0, min(w - s, cx - s // 2)); y0 = max(0, min(h - s, cy - s // 2))
    crop = (np.clip(img[y0:y0 + s, x0:x0 + s], 0, 1) * 255).astype(np.uint8)
    Image.fromarray(crop).resize((420, 420), Image.LANCZOS).save(out_png)
    return out_png


def add_chips(prim, chips_png, cy=1730, pill_w=1120):
    base = prim.convert('RGBA')
    ys = [cy] if len(chips_png) == 1 else [cy - 118, cy + 118]
    for p, y in zip(chips_png, ys):
        c = Image.open(p).convert('RGBA')
        a = np.asarray(c)[..., 3]
        yy, xx = np.where(a > 10)
        c = c.crop((xx.min(), yy.min(), xx.max() + 1, yy.max() + 1))
        k = pill_w / c.width
        c = c.resize((pill_w, int(c.height * k)), Image.LANCZOS)
        base.alpha_composite(c, (base.width // 2 - c.width // 2, int(y - c.height / 2)))
    return base.convert('RGB')


def save(im, path):
    for q in (94, 92, 90, 88):
        im.save(path, quality=q, subsampling=0, optimize=True)
        if os.path.getsize(path) < 1.7e6:
            return q, round(os.path.getsize(path) / 1e6, 2)
    return q, round(os.path.getsize(path) / 1e6, 2)


def frame_remapped(raw, f, seed):
    """remap the backdrop, then lay the whole render out on the canonical canvas"""
    rm = remap_bg(raw)
    h, w = rm.shape[:2]
    # watch height inside the render: brightest-vs-dark extent is not reliable,
    # so measure the subject mask instead
    subj = 1 - smooth((np.linalg.norm(rm - bg_field(rm), axis=2) - 0.05) / 0.05)
    ys, xs = np.where(subj < 0.5)
    wy = ys.max() - ys.min() if ys.size else h
    sc = f['h'] / max(wy, 1)
    sw, sh = int(w * sc), int(h * sc)
    big = cv2.resize(rm, (sw, sh), interpolation=cv2.INTER_LANCZOS4)
    canv = canonical_bg(N, N, seed=seed)
    y0 = int(f['cy'] - sh * 0.5)
    x0 = int(N / 2 - sw / 2)
    ys0, xs0 = max(0, y0), max(0, x0)
    ys1, xs1 = min(N, y0 + sh), min(N, x0 + sw)
    piece = big[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0]
    # the piece carries its own remapped backdrop; feather its border into the canvas
    hh, ww = piece.shape[:2]
    fy = np.clip(np.minimum(np.arange(hh), np.arange(hh)[::-1]) / 90.0, 0, 1)[:, None, None]
    fx = np.clip(np.minimum(np.arange(ww), np.arange(ww)[::-1]) / 90.0, 0, 1)[None, :, None]
    fe = fy * fx
    canv[ys0:ys1, xs0:xs1] = piece * fe + canv[ys0:ys1, xs0:xs1] * (1 - fe)
    return canv


def run(slug):
    src = f'{GEN}/{slug}'
    dst = f'{DEL}/{slug}/website-images'
    wk = f'{ROOT}/work/gen/{slug}'
    os.makedirs(dst, exist_ok=True); os.makedirs(wk, exist_ok=True)
    seed = sum(map(ord, slug)) % 89
    for stem, _ in ORDER:
        p = f'{src}/{stem}.jpg'
        if not os.path.exists(p):
            continue
        raw = np.asarray(Image.open(p).convert('RGB')).astype(np.float32) / 255
        img = upscale(gentle_wb(raw))
        out = Image.fromarray((np.clip(img, 0, 1) * 255 + .5).astype(np.uint8))
        if stem == '01_primary':
            ins = chip_inset(img, f'{wk}/_inset0.png')
            chips = []
            for i, label in enumerate(['ওয়াটার রেজিস্ট্যান্ট', '৭ দিনের রিপ্লেসমেন্ট']):
                cp = f'{wk}/_chip{i}.png'
                os.system(f'node miqa/tools/product-images/chip.mjs "{label}" {ins} {cp} women > /dev/null')
                chips.append(cp)
            out = add_chips(out, chips)
        q, mb = save(out, f'{dst}/{slug}_{stem}.jpg')
        print(f'{slug}_{stem}.jpg', q, mb)


if __name__ == '__main__':
    for s in sys.argv[1:]:
        run(s)
