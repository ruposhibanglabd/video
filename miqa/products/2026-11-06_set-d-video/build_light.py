#!/usr/bin/env python3
"""Set D video v2 — "Velora Daylight": bright, product-first, feed-native.

Why this exists: on the first cut the plum stage, the 4x4 thumbnail wall and the
50 px dials meant a phone viewer could not tell the watches apart. This cut is
built around one promise — *the dial is the brightest thing on screen* — and
keeps the whole thing under 40 s so Facebook does not truncate the story.

Timeline (≈36 s, 1080x1920, 30 fps)
  0.0-3.2   hook  : all four hero colourways side by side (p05), brand + ৳৩৯৯
  3.2-18.4  four looks, 3.8 s each, hard-edge slide, name card + design words
  18.4-22.0 macro  : crystal-pavé bezel, "ক্রিস্টাল বসানো বেজেল"
  22.0-25.6 wrist  : on the wrist, water resistance
  25.6-28.4 gift   : open gift box
  28.4-31.2 pledge : 5 % — type card on ivory
  31.2-33.4 replace: 7-day replacement — type card
  33.4-37.9 CTA    : group again, price, COD pill

Writes work/light/timeline.json + work/light/mix.wav for render_light.py.
"""
import json
import os
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import lfilter, butter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_dark import (SR, FPS, load, trim, highpass, peaking, compress, room,  # noqa: E402
                        pad, felt, kick, clap, hat, whoosh, bell, boom, add, midi,
                        CHORDS, sh, high_shelf)

BASE = 'miqa/products/2026-11-06_set-d-video'
VO = f'{BASE}/audio/vo4'
WORK = f'{BASE}/work'
OUT = f'{WORK}/light'
BPM = 96
BEAT = 60.0 / BPM
BAR = BEAT * 4
SLIDE = 0.62

LINES = [
    ('hook', '01_hook.mp3'),
    ('look1', '02_black.mp3'),
    ('look2', '03_pink.mp3'),
    ('look3', '04_blue.mp3'),
    ('look4', '05_silver.mp3'),
    ('more', '06_more.mp3'),
    ('water', '07_water.mp3'),
    ('five', '08_five.mp3'),
    ('cta', '09_cta.mp3'),
    ('gift', '10_gift.mp3'),
]


def prep(name, src):
    raw = f'{WORK}/lvo_{name}.wav'
    sh(f'{FF} -y -v error -i "{src}" -filter:a "atempo=1.20" -ac 1 -ar {SR} "{raw}"')
    x, _ = load(raw)
    x = trim(x)
    x = highpass(x)
    x = peaking(x)
    x = compress(x)
    x = room(x)
    p = np.abs(x).max() or 1.0
    x = x / p * 0.90
    n = int(0.008 * SR)
    x[:n] *= np.linspace(0, 1, n)
    x[-n:] *= np.linspace(1, 0, n)
    return x


FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg'


def timeline(vo):
    def d(name):
        return len(vo[name]) / SR

    sc = []
    # ---- hook: the four hero colourways, all in one frame
    hook_end = max(4.6, 0.28 + d('hook') + 0.45)
    sc.append(dict(id='hook', kind='hook', t0=0.0, t1=round(hook_end, 3),
                   plate='p05', vo=[('hook', 0.30)]))
    t = hook_end

    # ---- the four looks, one idea per scene, hard-edge slide
    looks = [('p01', '০১', 'look1'), ('p02', '০২', 'look2'),
             ('p03', '০৩', 'look3'), ('p04', '০৪', 'look4')]
    for i, (plate, n, name) in enumerate(looks):
        seg = max(3.7, d(name) + 0.95)
        prev = looks[i - 1][0] if i else 'p05'
        sc.append(dict(id=name, kind='watch', plate=plate, n=n, prev=prev,
                       t0=round(t, 3), t1=round(t + seg, 3),
                       name_in=round(t + 0.46, 3), name_out=round(t + seg - 0.42, 3),
                       vo=[(name, round(t + 0.62, 3))]))
        t += seg

    # ---- extras: macro, wrist, gift
    for sid, plate, prev, tail in [('more', 'p08', 'p04', 0.62),
                                   ('water', 'p06', 'p08', 0.62),
                                   ('gift', 'p07', 'p06', 0.55)]:
        seg = max(3.5, d(sid) + 0.95)
        sc.append(dict(id=sid, kind='photo', plate=plate, prev=prev,
                       t0=round(t, 3), t1=round(t + seg, 3),
                       vo=[(sid, round(t + 0.55, 3))]))
        t += seg

    # ---- pledge, then a silent type-only replacement card, then the CTA
    seg = max(3.0, d('five') + 0.70)
    sc.append(dict(id='five', kind='five', t0=round(t, 3), t1=round(t + seg, 3),
                   vo=[('five', round(t + 0.45, 3))]))
    t += seg
    sc.append(dict(id='replace', kind='replace', t0=round(t, 3), t1=round(t + 2.8, 3), vo=[]))
    t += 2.8
    seg = max(4.6, d('cta') + 1.35)
    sc.append(dict(id='cta', kind='cta', t0=round(t, 3), t1=round(t + seg, 3),
                   vo=[('cta', round(t + 0.55, 3))]))
    t += seg

    total = round(t + 0.30, 3)
    return dict(fps=FPS, total=total, frames=int(round(total * FPS)), bpm=BPM,
                wall=[], scenes=sc)


def mix(tl, vo, out):
    total = tl['total']
    N = int(total * SR) + SR // 2
    music = np.zeros((N, 2))
    sfx = np.zeros((N, 2))

    # warm, slow score — no risers, no shimmer
    for bar in range(int(np.ceil(total / BAR)) + 1):
        t0 = bar * BAR
        if t0 >= total:
            break
        root, notes = CHORDS[bar % 4]
        for i, m in enumerate(notes):
            add(music, pad(m, min(4.4, total - t0 + 0.5), 0.050), t0, 1.0, pan=-0.2 + i * 0.14)
        for beat, m, g in [(0, root - 12, 0.11), (2, root - 12, 0.075)]:
            tt = t0 + beat * BEAT
            if tt < total:
                add(music, felt(m, 0.5, g, 0.12), tt, 1.0)
        for i, idx in enumerate([0, 1, 2, 3, 2, 1]):
            tt = t0 + i * (BEAT / 1.5)
            if tt >= total:
                break
            add(music, felt(notes[idx] + 12, 0.8, 0.032 if i % 2 == 0 else 0.022, 0.22),
                tt, 1.0, pan=-0.16 + 0.06 * i)
        for beat in range(4):
            tt = t0 + beat * BEAT
            if tt >= total:
                break
            if beat in (0, 2):
                add(music, kick(0.10 if beat == 0 else 0.07), tt)
            else:
                add(music, clap(0.028), tt, 1.0, 0.13)
            add(music, hat(0.010 if beat % 2 == 0 else 0.013), tt, 1.0, -0.16)

    # scene changes: a soft card whoosh (hard-edge slide, never a hard stab)
    for s in tl['scenes'][1:]:
        add(sfx, whoosh(0.42, 0.030), s['t0'] - 0.10, 1.0, 0.22)
    for s in tl['scenes']:
        if s['kind'] == 'hook':
            add(sfx, boom(0.10), 0.0)
        if s['kind'] == 'watch':
            add(sfx, felt(45, 0.4, 0.030, 0.1), s['t0'] + 0.05)
        if s['kind'] == 'water':
            for i in range(3):
                add(sfx, bell(78 + i * 3, 0.5, 0.014), s['t0'] + 1.0 + i * 0.55, 1.0,
                    -0.25 + i * 0.2)
        if s['kind'] == 'five':
            for i, m in enumerate([69, 72, 76]):
                add(sfx, bell(m, 1.1, 0.020), s['t0'] + 0.35 + i * 0.10, 1.0, -0.2 + i * 0.18)
        if s['kind'] == 'cta':
            add(sfx, boom(0.11), s['t0'] + 0.15)
            for i, m in enumerate([57, 60, 64, 69]):
                add(sfx, pad(m, 2.4, 0.036), s['t0'] + 0.2, 1.0, -0.2 + i * 0.13)
            add(sfx, bell(88, 2.4, 0.034), total - 1.5, 1.0, 0.1)

    vb = np.zeros((N, 2))
    rows = []
    for s in tl['scenes']:
        for name, t0 in s.get('vo', []):
            x = vo.get(name)
            if x is None:
                continue
            i0 = int(t0 * SR)
            n = min(len(x), N - i0)
            if n <= 0:
                continue
            vb[i0:i0 + n, 0] += x[:n]
            vb[i0:i0 + n, 1] += x[:n]
            rows.append(dict(id=name, t0=round(t0, 3), dur=round(len(x) / SR, 3),
                             end=round(t0 + len(x) / SR, 3)))

    env = np.zeros(N)
    for r in rows:
        env[int(r['t0'] * SR):min(N, int(r['end'] * SR))] = 1.0
    e2 = np.zeros(N)
    k_atk, k_rel = int(0.05 * SR), int(0.28 * SR)
    for i in range(1, N):
        k = k_atk if env[i] > e2[i - 1] else k_rel
        e2[i] = e2[i - 1] + ((env[i] if env[i] > e2[i - 1] else 0.0) - e2[i - 1]) / k
    duck = 10 ** (-8.5 * e2 / 20)
    idx = np.arange(N)
    pump = 1.0 - 0.06 * (1 - ((idx / SR) % BEAT) / BEAT) ** 3
    mus = music * duck[:, None] * pump[:, None]
    fi, fo = int(0.45 * SR), int(1.4 * SR)
    arc = np.ones(N)
    arc[:fi] = np.linspace(0, 1, fi)
    arc[-fo:] = np.linspace(1, 0, fo) ** 1.2
    mus *= arc[:, None]

    out_mix = vb + mus * 0.92 + sfx * 0.85
    out_mix = high_shelf(out_mix, 5200, 2.0)
    out_mix = peaking(out_mix, 330, -1.0, 0.9)
    out_mix = lfilter(*butter(2, 32 / (SR / 2), 'high'), out_mix, axis=0)
    out_mix = np.tanh(out_mix * 1.02) * 0.96
    pk = np.abs(out_mix).max()
    if pk > 0.97:
        out_mix *= 0.97 / pk
    out_mix = out_mix[:int(total * SR)]
    wavfile.write(out, SR, (np.clip(out_mix, -1, 1) * 32767).astype(np.int16))
    tl['vo'] = rows
    print(f'audio {total:.2f}s · vo {len(rows)} lines · {out}')


def main():
    os.makedirs(OUT, exist_ok=True)
    vo = {}
    for name, f in LINES:
        p = f'{VO}/{f}'
        if not os.path.exists(p):
            print('MISSING VO', p)
            continue
        vo[name] = prep(name, p)
    tl = timeline(vo)
    mix(tl, vo, f'{OUT}/mix.wav')
    json.dump(tl, open(f'{OUT}/timeline.json', 'w'), indent=1)
    print(f"timeline {tl['total']:.2f}s · {tl['frames']} frames · {len(tl['scenes'])} scenes")


if __name__ == '__main__':
    main()
