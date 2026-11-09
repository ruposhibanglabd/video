"""
Set H — "real gold" pass.

The plates' gold hue was right (≈38–40°) but its specular areas had blown out to
cream (p90 value 96%), which reads as pale champagne/blonde instead of gold.
This pass touches ONLY gold-hued pixels:

  • compresses the specular highlights so the metal keeps its colour,
  • lifts saturation in the mid-tones toward rich yellow gold,
  • pulls the hue a touch toward amber (38°),
  • leaves steel, dials, diamonds, black PVD and the white backdrop untouched.

  python golden_v4.py p02_champagne.png p01_green_v2.png …
"""
import sys, os
import cv2
import numpy as np

PLATES_IN = os.environ.get('GOLD_IN', 'miqa/products/2026-11-08_set-h/plates-v3')
PLATES_OUT = os.environ.get('GOLD_OUT', 'miqa/products/2026-11-08_set-h/plates-v4')

# tuning
HUE_TARGET = float(os.environ.get('GOLD_HUE', 40.0))   # real yellow gold sits ~40–42°
HUE_PULL = float(os.environ.get('GOLD_PULL', 0.22))    # how far to pull toward it
SAT_GAIN = float(os.environ.get('GOLD_SAT', 1.24))     # mid-tone saturation boost
HILITE = float(os.environ.get('GOLD_HILITE', 0.24))   # value removed at the top end
HILITE_LO = 0.78       # highlights start to be compressed here
MAX_V = float(os.environ.get('GOLD_MAXV', 0.94))    # brightness ceiling for gold


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def enrich(img_bgr):
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    h = hsv[:, :, 0].astype(np.float32) * 2.0      # OpenCV hue is 0..180
    s = hsv[:, :, 1].astype(np.float32) / 255.0
    v = hsv[:, :, 2].astype(np.float32) / 255.0

    # soft gold mask — wide enough to include the shadowed gold, narrow enough
    # to leave the white backdrop, the diamonds and the coloured dials alone
    hue_w = smoothstep(14, 26, h) * (1 - smoothstep(64, 76, h))
    sat_w = smoothstep(0.13, 0.30, s)
    mask = (hue_w * sat_w).astype(np.float32)
    mask = cv2.GaussianBlur(mask, (0, 0), 1.2)

    # --- hue: pull toward amber
    h_new = h + (HUE_TARGET - h) * HUE_PULL

    # --- saturation: stronger in the mid-tones, a little stronger still in the
    #     highlights so the metal never loses its colour when it catches light
    ramp = 1.0 + float(os.environ.get('GOLD_RAMP', 0.28)) * smoothstep(0.55, 0.95, v)
    s_new = np.clip(s * SAT_GAIN * ramp + 0.015, 0.0, 1.0)

    # --- value: compress the speculars, keep the mid-tones where they are
    comp = HILITE * smoothstep(HILITE_LO, 1.0, v)
    v_new = np.clip(v * (1.0 - comp), 0.0, MAX_V)

    out = img_bgr.astype(np.float32)
    changed = cv2.cvtColor(
        np.dstack([np.clip(h_new / 2.0, 0, 179),
                   np.clip(s_new * 255, 0, 255),
                   np.clip(v_new * 255, 0, 255)]).astype(np.uint8),
        cv2.COLOR_HSV2BGR).astype(np.float32)

    m = mask[:, :, None]
    out = out * (1 - m) + changed * m
    return np.clip(out, 0, 255).astype(np.uint8)


def stats(img_bgr, label):
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    h, s, v = hsv[:, :, 0] * 2, hsv[:, :, 1] / 255.0, hsv[:, :, 2] / 255.0
    m = (h > 28) & (h < 72) & (s > 0.30) & (v > 0.35)
    if m.sum() < 500:
        print(f'{label:24s} (no gold)')
        return
    px = img_bgr[m][:, ::-1].astype(np.float32)
    mean = px.mean(axis=0)
    print(f'{label:24s} n={m.sum():7d} RGB({mean[0]:5.0f},{mean[1]:5.0f},{mean[2]:5.0f}) '
          f'hue {np.median(h[m]):4.1f} sat {np.median(s[m])*100:4.1f}% '
          f'val {np.median(v[m])*100:4.1f}% p90 {np.percentile(v[m],90)*100:4.0f}%')


def main():
    os.makedirs(PLATES_OUT, exist_ok=True)
    for f in sys.argv[1:]:
        p = os.path.join(PLATES_IN, f)
        img = cv2.imread(p, cv2.IMREAD_COLOR)
        if img is None:
            raise SystemExit(f'cannot read {p}')
        out = enrich(img)
        cv2.imwrite(os.path.join(PLATES_OUT, f), out, [cv2.IMWRITE_PNG_COMPRESSION, 6])
        stats(img, f'in   {f[:18]}')
        stats(out, f'out  {f[:18]}')


if __name__ == '__main__':
    main()
