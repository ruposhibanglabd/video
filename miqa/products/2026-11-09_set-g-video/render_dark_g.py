#!/usr/bin/env python3
"""Set G — Midnight Precision frame renderer (1080×1920, 30 fps).

Follows miqa/creative/PLAYBOOK.md (7 scenes), MENS-DESIGN-GUIDE.md
(Midnight Precision: dark base, strip-light edges, teeth-sharp glints, brass
used sparingly), BRAND-BIBLE §3 (mandatory verbatim lines) and RUNBOOK §8.

Cards are composed with node-canvas (video_g3_cards.mjs) into work/cards/*.png;
this script owns the *camera*: light sweep, DOF-free slow push, grain, vignette,
hard cuts on the beat, and the frame pipe to ffmpeg.
"""
import argparse
import json
import os
import subprocess

import numpy as np
from PIL import Image

W, H, FPS = 1080, 1920, 30
BASE = 'miqa/products/2026-11-09_set-g-video'
WORK = f'{BASE}/work'
CARDS = f'{WORK}/cards'
FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg'


def cover_stills():
    """Designed cover stills (RUNBOOK §8) — hook card, 2160×3840 and 1080×1920."""
    src = f'{CARDS}/hook.png'
    im = Image.open(src).convert('RGB')
    for w, h in ((2160, 3840), (1080, 1920)):
        Image.fromarray(__import__('numpy').asarray(im.resize((w, h), Image.LANCZOS))).save(
            f'miqa/deliveries/2026-11-09_set-g-video/miqa-set-g-cover_{w}x{h}.jpg', quality=92, subsampling=0)
        print('cover', w, h)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=f'{WORK}/mezz_4k.mp4')
    ap.add_argument('--scale', type=int, default=1)      # 1 = 1080, 2 = 2160
    ap.add_argument('--timeline', default=f'{WORK}/video_g3/timeline.json')
    ap.add_argument('--frames-only', action='store_true')
    ap.add_argument('--stills', action='store_true', help='render designed cover stills instead of the film')
    a = ap.parse_args()

    if a.stills:
        cover_stills()
        return

    tl = json.load(open(a.timeline))
    scenes = tl['scenes']
    total = tl['total']
    scale = a.scale
    w, h = W * scale, H * scale

    print(f'cards={len(scenes)} total={total:.2f}s  render={w}x{h}', flush=True)

    imgs = {}
    for f in sorted(os.listdir(CARDS)):
        if f.endswith('.png'):
            im = Image.open(f'{CARDS}/{f}').convert('RGB')
            if im.size != (w, h):
                im = im.resize((w, h), Image.LANCZOS)
            imgs[f[:-4]] = np.asarray(im, np.float32)

    rng = np.random.default_rng(20261109)
    grain = [rng.normal(0, 2.0, (h, w, 1)).astype(np.float32) for _ in range(6)]

    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    vign = np.clip(1.0 - 0.22 * (((xx - .5) / .78) ** 2 + ((yy - .48) / .78) ** 2), .72, 1.0)[..., None]

    # light sweep: a soft diagonal band crossing the product area once per scene
    sw_y = np.linspace(-1, 1, h, dtype=np.float32)[:, None]
    sw_x = np.linspace(-1, 1, w, dtype=np.float32)[None, :]
    sweep_coord = (sw_x * 0.55 + sw_y * 0.85)

    starts = []
    t = 0.0
    for s in scenes:
        starts.append(t)
        t += s['dur']
    assert abs(t - total) < 0.05, (t, total)

    n_frames = int(round(total * FPS))
    cmd = [FF, '-y', '-hide_banner', '-loglevel', 'error',
           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-r', str(FPS), '-i', 'pipe:0']
    if not a.frames_only:
        cmd += ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12',
                '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709',
                '-colorspace', 'bt709', a.out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE) if not a.frames_only else None

    if a.frames_only:
        os.makedirs(f'{WORK}/g3frames', exist_ok=True)

    for f in range(n_frames):
        at = f / FPS
        i = 0
        while i + 1 < len(scenes) and at >= starts[i + 1]:
            i += 1
        s = scenes[i]
        local = at - starts[i]
        p = local / s['dur']

        img = imgs[s['card']].copy()

        # camera: 3–6 % push-in across the scene (PLAYBOOK §7 dolly-in)
        zoom = 1.0 + s.get('push', 0.05) * min(1.0, p)
        if zoom > 1.001:
            cw, ch = int(w / zoom), int(h / zoom)
            cx = int((w - cw) / 2)
            cy = int((h - ch) * (0.5 - s.get('drift', 0.0) * p))
            img = np.asarray(
                Image.fromarray(img.astype(np.uint8)).crop((cx, cy, cx + cw, cy + ch)).resize((w, h), Image.BICUBIC),
                np.float32)

        # light sweep — one bright band, only where the scene asks for it
        if s.get('sweep', 0) > 0 and 0.05 < p < 0.95:
            c = (p - 0.5) * 3.2
            band = np.exp(-((sweep_coord - c) / 0.16) ** 2).astype(np.float32)[..., None]
            img += band * s['sweep'] * 26.0

        img += grain[f % 6]
        img *= vign
        frame = np.clip(img, 0, 255).astype(np.uint8)

        if a.frames_only:
            if f % 6 == 0:
                Image.fromarray(frame).save(f'{WORK}/g3frames/f{f:05d}.jpg', quality=88)
            continue

        proc.stdin.write(frame.tobytes())
        if f % 150 == 0:
            print(f'  {f}/{n_frames}  {at:.1f}s', flush=True)

    if proc:
        proc.stdin.close()
        proc.wait()
        print('wrote', a.out, os.path.getsize(a.out) / 1048576, 'MB')


if __name__ == '__main__':
    main()
