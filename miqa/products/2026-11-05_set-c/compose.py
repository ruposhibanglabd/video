"""Set C — website images (2000x2000, Blush Mist).

All watch pixels come from the client's photos (cut/*.png); this script only
neutralises the phone camera's colour cast, rebuilds the studio background,
adds matched shadows and produces the five website framings.
"""
import os, sys, json
import numpy as np, cv2
from PIL import Image

ROOT = 'miqa/products/2026-11-05_set-c'
CUT = f'{ROOT}/cut'
OUT = f'{ROOT}/work/out'
N = 2000
WOMEN = dict(base='#F6E1E7', lift='#FCEFF2', edge='#EFD0D9')
SHADOW = np.array([0.353, 0.102, 0.180])          # #5A1A2E


def hx(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def radial_bg(center, base, lift, edge, seed=7):
    yy, xx = np.mgrid[:N, :N].astype(np.float32)
    d = np.sqrt((xx - center[0]) ** 2 + (yy - center[1]) ** 2) / (N * 0.72)
    t1 = smooth(d / 0.55)[..., None]
    t2 = smooth((d - 0.55) / 0.65)[..., None]
    col = hx(lift) * (1 - t1) + hx(base) * t1
    col = col * (1 - t2) + hx(edge) * t2
    col += np.random.default_rng(seed).normal(0, 0.0035, (N, N, 1)).astype(np.float32)
    return np.clip(col, 0, 1)


def wb_and_expose(rgba, ref_white_rgb):
    """Neutralise the phone cast using the pillow as the white reference."""
    rgb = rgba[..., :3].astype(np.float32) / 255
    ref = np.maximum(np.asarray(ref_white_rgb, np.float32) / 255, 1e-3)
    gain = ref.mean() / ref                      # per channel
    gain = np.clip(gain, 0.80, 1.28)
    rgb = np.clip(rgb * gain, 0, 1)
    # gentle lift, then put back the saturation the phone washed out
    rgb = np.clip(rgb / 0.97, 0, 1) ** 0.98
    hsv = cv2.cvtColor((rgb * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.10, 0, 255)
    rgb = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32) / 255
    out = rgba.copy()
    out[..., :3] = (rgb * 255).astype(np.uint8)
    return out


def taper_ends(rgba, top=70, bot=70):
    """let the bracelet run out of the frame instead of stopping on a blunt line"""
    a = rgba[..., 3].astype(np.float32) / 255
    ys, xs = np.where(a > 0.02)
    if not ys.size:
        return rgba
    y0, y1 = ys.min(), ys.max()
    ramp = np.ones_like(a)
    t = np.arange(a.shape[0], dtype=np.float32)
    ramp *= np.clip((t - y0) / top, 0, 1)[:, None]
    ramp *= np.clip((y1 - t) / bot, 0, 1)[:, None] ** 0.9
    out = rgba.copy()
    out[..., 3] = (a * ramp * 255).astype(np.uint8)
    return out


def crop_alpha(rgba, pad=6):
    a = rgba[..., 3]
    ys, xs = np.where(a > 8)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    y0 = max(0, y0 - pad); x0 = max(0, x0 - pad)
    y1 = min(rgba.shape[0] - 1, y1 + pad); x1 = min(rgba.shape[1] - 1, x1 + pad)
    return rgba[y0:y1 + 1, x0:x1 + 1]


def over(img, rgb, a):
    return rgb * a[..., None] + img * (1 - a[..., None])


def place(cut, scale, angle, src, dst):
    pm = cut.astype(np.float32) / 255
    pm[..., :3] *= pm[..., 3:4]
    sm = cv2.resize(pm, None, fx=scale, fy=scale, interpolation=cv2.INTER_LANCZOS4)
    ax, ay = src[0] * scale, src[1] * scale
    M = cv2.getRotationMatrix2D((ax, ay), angle, 1.0)
    M[0, 2] += dst[0] - ax; M[1, 2] += dst[1] - ay
    o = cv2.warpAffine(sm, M, (N, N), flags=cv2.INTER_CUBIC, borderValue=(0, 0, 0, 0))
    a = np.clip(o[..., 3], 0, 1)
    rgb = np.clip(o[..., :3] / np.maximum(a, 1e-4)[..., None], 0, 1)
    rgb[a < 1e-4] = 0
    return rgb, a


def shadow_of(a, blur, off, op):
    s = cv2.GaussianBlur(a, (0, 0), blur)
    s = cv2.warpAffine(s, np.float32([[1, 0, off[0]], [0, 1, off[1]]]), (N, N))
    return np.clip(s * op, 0, 1)


def drop_shadow(img, a, big=(46, (26, 34), 0.30), contact=(9, (4, 8), 0.42)):
    for blur, off, op in (big, contact):
        s = shadow_of(a, blur, off, op)
        img = img * (1 - s[..., None]) + img * SHADOW * s[..., None]
    return img


def save(img, name):
    im = Image.fromarray((np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8))
    p = f'{OUT}/{name}.jpg'
    for q in (94, 92, 90, 88):
        im.save(p, quality=q, subsampling=0, optimize=True)
        if os.path.getsize(p) < 1.6e6:
            break
    print('  ', name, q, round(os.path.getsize(p) / 1e6, 2), 'MB')


def load(name):
    rgba = np.asarray(Image.open(f'{CUT}/{name}.png').convert('RGBA'))
    return crop_alpha(taper_ends(rgba, top=64, bot=64))


def ref_white(name, box):
    """mean RGB of a clean pillow patch (used as the white reference)"""
    im = np.asarray(Image.open(f'{ROOT}/source-photos/{name}.png').convert('RGB')).astype(np.float32)
    x0, y0, x1, y1 = box
    patch = im[y0:y1, x0:x1].reshape(-1, 3)
    v = patch.mean(1)
    keep = patch[(v > np.percentile(v, 55)) & (v < np.percentile(v, 97))]
    return keep.mean(0)


if __name__ == '__main__':
    print(json.dumps(WOMEN))


# ---------------------------------------------------------------- layouts
def bg_center_for(h_watch, cy):
    return (N / 2, cy - h_watch * 0.06)


def primary(cut, name, h_target=1440, cy=800):
    h, w = cut.shape[:2]
    sc = h_target / h
    src = (w / 2, h / 2)
    rgb, a = place(cut, sc, 0, src, (N / 2, cy))
    img = radial_bg(bg_center_for(h_target, cy), **WOMEN)
    img = drop_shadow(img, a)
    img = over(img, rgb, a)
    save(img, name)


def angle(cut, name, h_target=1880, cy=1010, deg=-9):
    h, w = cut.shape[:2]
    sc = h_target / h
    src = (w / 2, h / 2)
    rgb, a = place(cut, sc, deg, src, (N / 2, cy))
    img = radial_bg((N / 2, cy), **WOMEN)
    img = drop_shadow(img, a, big=(52, (30, 40), 0.32), contact=(10, (6, 10), 0.44))
    img = over(img, rgb, a)
    save(img, name)


def closeup(cut, name, cx=1000, cy=940, fill=0.86):
    """the whole case, filling most of the frame, bracelet running out of it"""
    h, w = cut.shape[:2]
    a0 = cut[..., 3].astype(np.float32) / 255
    widths = a0.sum(1)
    cy_cut = int(np.argmax(cv2.GaussianBlur(widths.reshape(-1, 1), (0, 0), 40).ravel()))
    case_w = float(widths[cy_cut])
    sc = (N * fill) / case_w
    src = (w / 2, cy_cut)
    rgb, a = place(cut, sc, 0, src, (cx, cy))
    img = radial_bg((cx, cy), **WOMEN)
    img = drop_shadow(img, a, big=(40, (18, 26), 0.24), contact=(9, (4, 8), 0.34))
    img = over(img, rgb, a)
    save(img, name)


def bracelet_closeup(cut, name, fill=0.95, grow=1.0):
    """a real crop of the chain, taken from the client's own pixels"""
    h, w = cut.shape[:2]
    a0 = cut[..., 3].astype(np.float32) / 255
    widths = a0.sum(1)
    cy_cut = int(np.argmax(cv2.GaussianBlur(widths.reshape(-1, 1), (0, 0), 40).ravel()))
    y0 = min(h - 10, cy_cut + int(h * 0.21))
    y1 = min(h, y0 + int(h * 0.27))
    crop = cut[y0:y1]
    ch, cw = crop.shape[:2]
    sc = (N * fill) / cw * grow
    pm = crop.astype(np.float32) / 255
    pm[..., :3] *= pm[..., 3:4]
    sm = cv2.resize(pm, None, fx=sc, fy=sc, interpolation=cv2.INTER_LANCZOS4)
    sh_, sw_ = sm.shape[:2]
    dst = np.zeros((N, N, 4), np.float32)
    x0 = (N - sw_) // 2
    y0d = (N - sh_) // 2
    xs0, ys0 = max(0, x0), max(0, y0d)
    xs1, ys1 = min(N, x0 + sw_), min(N, y0d + sh_)
    dst[ys0:ys1, xs0:xs1] = sm[ys0 - y0d:ys1 - y0d, xs0 - x0:xs1 - x0]
    rgb = np.clip(dst[..., :3] / np.maximum(dst[..., 3:4], 1e-4), 0, 1)
    a = np.clip(dst[..., 3], 0, 1)
    yy = np.arange(N, dtype=np.float32)
    fade = np.clip((yy - 60) / 220, 0, 1) * np.clip((N - 60 - yy) / 220, 0, 1)
    a = a * fade[:, None]
    img = radial_bg((N / 2, N / 2), **WOMEN)
    img = drop_shadow(img, a, big=(46, (20, 28), 0.26), contact=(10, (4, 8), 0.36))
    img = over(img, rgb, a)
    save(img, name)


def styled(cut, name, h_target=1700, cy=900):
    """standing on a soft silk fold, with a quiet reflection"""
    h, w = cut.shape[:2]
    sc = h_target / h
    base_y = cy + h_target / 2
    rgb, a = place(cut, sc, 0, (w / 2, h / 2), (N / 2, cy))
    img = radial_bg((N / 2, cy - h_target * 0.02), **WOMEN)
    # silk fold: two very soft horizontal bands of light
    yy = np.arange(N, dtype=np.float32)[:, None]
    fold = 0.035 * np.exp(-((yy - (base_y - 60)) / 130) ** 2) - 0.02 * np.exp(-((yy - (base_y + 120)) / 170) ** 2)
    img = np.clip(img + fold, 0, 1)
    # reflection
    flip = rgb[::-1] * 0.13
    fa = a[::-1] * 0.13
    sh = int(2 * (cy + h_target / 2))
    off = sh - N
    if 0 <= off < N:
        canvas = np.zeros_like(img)
        fa2 = np.zeros((N, N), np.float32)
        fa2[off:] = fa[:N - off]
        canvas[off:] = flip[:N - off]
        fade = np.clip((np.arange(N) - (base_y)) / 240.0, 0, 1)[:, None, None]
        img = over(img, canvas, fa2 * (1 - fade[..., 0]))
    img = drop_shadow(img, a, big=(44, (22, 30), 0.30), contact=(9, (4, 8), 0.44))
    img = over(img, rgb, a)
    save(img, name)


# ---------------------------------------------------------------- on-wrist
PLATE = f'{ROOT}/plates/wrist_plate.png'


def wrist_band(img, row_frac=0.44):
    """Locate the forearm (arm runs vertically, hand at the bottom)."""
    hsv = cv2.cvtColor((img * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    H, S, V = hsv[..., 0], hsv[..., 1] / 255, hsv[..., 2] / 255
    skin = ((S > 0.26) & (S < 0.75) & (V > 0.35) & (V < 0.93) & (H < 30))
    skin = cv2.morphologyEx(skin.astype(np.uint8), cv2.MORPH_OPEN, np.ones((11, 11), np.uint8))
    skin = cv2.morphologyEx(skin, cv2.MORPH_CLOSE, np.ones((31, 31), np.uint8))
    ncc, sl, st, _ = cv2.connectedComponentsWithStats(skin, 8)
    if ncc < 2:
        raise RuntimeError('no skin')
    i = 1 + np.argmax(st[1:, 4])
    skin = (sl == i).astype(np.uint8)
    yc = int(N * row_frac)
    row = skin[yc - 25:yc + 25].sum(0)
    cols = np.where(row >= 30)[0]
    if cols.size < 40:
        raise RuntimeError('no wrist column')
    left, right = int(cols.min()), int(cols.max())
    return skin, left, right, yc


def on_wrist(cut, name, plate=PLATE, case_frac=0.62, row_frac=0.44, y_frac=0.52):
    """Vertical forearm, watch upright on it; bracelet clipped to the wrist."""
    pl = Image.open(plate).convert('RGB').resize((N, N), Image.LANCZOS)
    pl = pl.rotate(-90, expand=True)          # arm now runs top -> bottom, hand down
    img = np.asarray(pl).astype(np.float32) / 255
    skin, left, right, yc = wrist_band(img, row_frac)
    wrist_w = right - left

    h_cut, w_cut = cut.shape[:2]
    case_px = wrist_w * case_frac
    sc = case_px / (w_cut * 0.92)
    pm = cut.astype(np.float32) / 255
    pm[..., :3] *= pm[..., 3:4]
    sm = cv2.resize(pm, None, fx=sc, fy=sc, interpolation=cv2.INTER_LANCZOS4)
    hh, ww = sm.shape[:2]
    dst = np.zeros((N, N, 4), np.float32)
    cx = (left + right) // 2
    cy = int(N * y_frac)
    x0, y0 = int(cx - ww / 2), int(cy - hh / 2)
    xs0, ys0 = max(0, x0), max(0, y0)
    xs1, ys1 = min(N, x0 + ww), min(N, y0 + hh)
    dst[ys0:ys1, xs0:xs1] = sm[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0]
    rgb = np.clip(dst[..., :3] / np.maximum(dst[..., 3:4], 1e-4), 0, 1)
    a = np.clip(dst[..., 3], 0, 1)

    # the bracelet may only exist across the wrist, never in the air beside it
    xs = np.arange(N, dtype=np.float32)
    band = np.clip((xs - (left - 16)) / 24.0, 0, 1) * np.clip(((right + 16) - xs) / 24.0, 0, 1)
    a = a * band[None, :]

    sh = cv2.GaussianBlur(a, (0, 0), 10) * 0.5
    img = img * (1 - sh[..., None]) + img * np.array([0.38, 0.18, 0.15], np.float32) * sh[..., None]
    # the AI plate's pink is a touch too deep for Blush Mist -> match the set
    hsvb = cv2.cvtColor((img * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    bgm = (hsvb[..., 1] < 0.13) & (hsvb[..., 2] > 0.72)
    hsvb[..., 0] = np.where(bgm, (hsvb[..., 0] * 0.86 + 350 * 0.14), hsvb[..., 0])
    hsvb[..., 1] = np.where(bgm, hsvb[..., 1] * 0.62, hsvb[..., 1])
    hsvb[..., 2] = np.where(bgm, np.clip(hsvb[..., 2] * 1.0 + 6, 0, 255), hsvb[..., 2])
    img = cv2.cvtColor(hsvb.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32) / 255
    img = over(img, rgb, a)
    save(img, name)
    return dict(left=int(left), right=int(right), wrist=int(wrist_w), case=int(case_px), scale=round(sc, 3))
