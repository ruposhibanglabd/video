#!/usr/bin/env python3
"""Chip-free 2000² plates for the video.

The website primaries carry the two Bengali feature chips; the video must not
repeat them (it draws its own copy). This runs the same gentle-WB + Lanczos
pass as finish.py but stops before the chips, and writes to work/clean/.
"""
import os
import numpy as np
from PIL import Image
import cv2

ROOT = 'miqa/products/2026-11-05_set-c'
OUT = f'{ROOT}-video/work/clean'
N = 2000
BASE = np.array([246, 225, 231], np.float32) / 255
SLUGS = ['01_fiyota-octagon-black', '02_fiyota-octagon-pink', '03_trueworth-heart-black',
         '04_fiyota-octagon-green', '05_fiyota-octagon-white']


def gentle_wb(img):
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


for s in SLUGS:
    os.makedirs(f'{OUT}/{s}', exist_ok=True)
    src = f'{ROOT}/gen/{s}/01_primary.jpg'
    raw = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255
    img = upscale(gentle_wb(raw))
    out = f'{OUT}/{s}/clean_primary.jpg'
    Image.fromarray((img * 255 + .5).astype(np.uint8)).save(out, quality=95, subsampling=0)
    print(s, round(os.path.getsize(out) / 1e6, 2), 'MB')
