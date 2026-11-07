#!/usr/bin/env python3
"""Set B video — "Midnight Garden": wall of watches, then a slide reel.

Structure the client asked for:
  0.0-3.0   the four Sylvelles are already in frame; the highlight moves every
            0.9 s, so the viewer sees three designs and hears the ৳৩৫০ hook
            inside the first three seconds.
  3.0+      the wall sways; the camera settles on each watch in turn, name card
            slides in while the narration names the watch, the slides crossfade
            slowly (nothing flashes, nothing is cut away too fast).
  after 04  7-day replacement guarantee, the 5 % pledge, CTA.
            (set B never had water-resistance: the client only promised
            the replacement guarantee for this set — see DECISIONS D37.)

Output: frames are rendered by render_dark.py; this script writes
  work/dark/timeline.json   (scenes, card timings, wall timings)
  work/dark/mix.wav         (VO + 92 BPM score, ducked)
"""
import argparse
import json
import os
import subprocess

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
BASE = 'miqa/products/2026-11-05_set-b-video'
VO = f'{BASE}/audio/vo3'
WORK = f'{BASE}/work'
OUT = f'{WORK}/midnight'
SR = 48000
FPS = 30

BPM = 92
BEAT = 60.0 / BPM
BAR = BEAT * 4

WALL_IN = 0.90          # wall change interval during the hook (one watch per beat)
WALL_HOLD = 1.55        # wall sway interval later on
SETTLE = 0.9            # how long the camera takes to settle on a watch
HOOK_END = 3.0

LINES = [
    ('hook', '01_hook.mp3'),
    ('p01', '02_p01.mp3'),
    ('p02', '03_p02.mp3'),
    ('p03', '04_p03.mp3'),
    ('p04', '05_p04.mp3'),
    ('replace', '06_replace.mp3'),
    ('five', '07_five.mp3'),
    ('cta', '08_cta.mp3'),
]


def sh(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(f'FAILED: {cmd}\n{r.stderr[-1200:]}')


def load(path):
    sr, x = wavfile.read(path)
    if x.ndim > 1:
        x = x[:, 0]
    return x.astype(np.float64) / 32768.0, sr


def trim(x, thresh=0.008, pad_in=0.03, pad_out=0.07):
    idx = np.where(np.abs(x) > thresh)[0]
    if not len(idx):
        return x
    return x[max(0, idx[0] - int(pad_in * SR)):min(len(x), idx[-1] + int(pad_out * SR))]


def highpass(x, f=88):
    return lfilter(*butter(2, f / (SR / 2), 'high'), x)


def peaking(x, f=2700, gain=2.4, q=1.0):
    A = 10 ** (gain / 40)
    w0 = 2 * np.pi * f / SR
    al = np.sin(w0) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w0), 1 - al * A]
    a = [1 + al / A, -2 * np.cos(w0), 1 - al / A]
    return lfilter(b, a, x)


def compress(x, thresh=0.18, ratio=3.0, atk=0.006, rel=0.09, makeup=1.12):
    env = np.zeros_like(x)
    k_atk, k_rel = max(1, int(atk * SR)), max(1, int(rel * SR))
    for i in range(1, len(x)):
        tgt = abs(x[i])
        k = k_atk if tgt > env[i - 1] else k_rel
        env[i] = env[i - 1] + (tgt - env[i - 1]) / k
    gain = np.ones_like(x)
    over = env > thresh
    gain[over] = (thresh + (env[over] - thresh) / ratio) / np.maximum(env[over], 1e-9)
    k = int(0.01 * SR)
    gain = np.convolve(gain, np.ones(k) / k, 'same')
    return x * gain * makeup


def high_shelf(x, f=5200, gain=2.2, s=1.0):
    A = 10 ** (gain / 40)
    w0 = 2 * np.pi * f / SR
    al = np.sin(w0) / 2 * np.sqrt((A + 1 / A) * (1 / s - 1) + 2)
    c = np.cos(w0)
    sq = 2 * np.sqrt(A) * al
    b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c),
         A * ((A + 1) + (A - 1) * c - sq)]
    a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sq]
    return lfilter(b, a, x)


def room(x, wet=0.05, dur=0.26):
    rng = np.random.default_rng(7)
    n = int(dur * SR)
    tt = np.arange(n) / SR
    ir = rng.normal(0, 1, n) * np.exp(-tt / 0.07)
    ir = lfilter(*butter(2, 5200 / (SR / 2), 'low'), ir)
    ir /= np.sqrt((ir ** 2).sum()) + 1e-9
    return (1 - wet) * x + wet * fftconvolve(x, ir, 'full')[:len(x)]


def prep(name, src):
    raw = f'{WORK}/bvo_{name}.wav'
    sh(f'{FF} -y -v error -i "{src}" -ac 1 -ar {SR} "{raw}"')
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


# ------------------------------------------------------------------ timeline
PLACEHOLDER = {'five': 3.0, 'cta': 4.2}


def vlen(vo, name):
    if name in vo:
        return len(vo[name]) / SR
    return PLACEHOLDER.get(name, 2.8)


def timeline(vo):
    scenes = []
    wall = []
    hook_dur = vlen(vo, 'hook')
    scenes.append(dict(id='hook', kind='hook', t0=0.0,
                       t1=round(max(4.2, 0.20 + hook_dur + 0.55), 3),
                       vo=[('hook', 0.20)]))
    # ---- the reel: one watch at a time, slow crossfades
    t = scenes[-1]['t1']
    for i in range(1, 5):
        name = f'p{i:02d}'
        dur = vlen(vo, name)
        seg = max(4.3, dur + 1.35)
        sc = dict(id=name, kind='watch', n=f'{i:02d}', t0=round(t, 3), t1=round(t + seg, 3),
                  look_in=round(t + 0.05, 3), name_in=round(t + 0.42, 3),
                  name_out=round(t + seg - 0.42, 3),
                  vo=[(name, round(t + 0.58, 3))])
        scenes.append(sc)
        t += seg
    # ---- features + the 5 % pledge + cta
    for sid, plate, prevp, tail in [('replace', 'p04', 'p02', 0.60),
                                    ('five', 'p01', 'p04', 0.75), ('cta', 'p03', 'p01', 1.15)]:
        dur = vlen(vo, sid)
        scenes.append(dict(id=sid, kind=sid, t0=round(t, 3), t1=round(t + dur + tail, 3),
                           plate=plate, prev=prevp, vo=[(sid, round(t + 0.45, 3))]))
        t += dur + tail
    total = round(t + 0.30, 3)
    # wall highlight changes: every 0.9 s for the whole run
    wt = 0.0
    step = 0
    while wt < total:
        wall.append(dict(t=round(wt, 3), focus=step % 4,
                         mode='hook' if wt < 3.0 else 'sway', step=step))
        wt += WALL_IN if wt < 3.0 else WALL_HOLD
        step += 1
    return dict(fps=FPS, total=total, frames=int(round(total * FPS)), bpm=BPM,
                hook=(0.0, 3.0), wall=wall, scenes=scenes)


# -------------------------------------------------------------------- score
def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(buf, sig, t0, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= len(buf) or i0 < 0:
        return
    n = min(len(sig), len(buf) - i0)
    if n <= 0:
        return
    l = gain * (1 - max(0.0, pan)) ** 0.5
    r = gain * (1 + min(0.0, pan)) ** 0.5
    buf[i0:i0 + n, 0] += sig[:n] * l
    buf[i0:i0 + n, 1] += sig[:n] * r


def pad(m, dur, amp):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    sig = np.zeros(n)
    for k, w in [(1, 1.0), (2, 0.22), (3, 0.10), (4, 0.045)]:
        sig += w * np.sin(2 * np.pi * f * k * tt + k * 0.6)
    e = np.minimum(1, tt / 0.45) * np.minimum(1, (dur - tt) / 0.7)
    return sig * e * amp / 2.1


def felt(m, dur, amp, bright=0.26):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    sig = (np.sin(2 * np.pi * f * tt) + bright * np.sin(4 * np.pi * f * tt)
           + 0.08 * np.sin(6 * np.pi * f * tt))
    return sig * (1 - np.exp(-tt / 0.004)) * np.exp(-tt * 3.0) * amp


def kick(amp=0.15):
    n = int(0.28 * SR)
    tt = np.arange(n) / SR
    f = 94 * np.exp(-tt * 17) + 45
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR)
    click = np.random.default_rng(3).normal(0, 1, n) * np.exp(-tt * 90) * 0.16
    return (sig * np.exp(-tt * 11) + click) * amp


def clap(amp=0.05):
    n = int(0.15 * SR)
    tt = np.arange(n) / SR
    x = np.random.default_rng(9).normal(0, 1, n)
    x = lfilter(*butter(2, [900 / (SR / 2), 4300 / (SR / 2)], 'band'), x)
    return x * np.exp(-tt * 40) * amp


def hat(amp=0.018, open_=False):
    n = int((0.13 if open_ else 0.05) * SR)
    tt = np.arange(n) / SR
    x = np.random.default_rng(5).normal(0, 1, n)
    x = lfilter(*butter(2, 7200 / (SR / 2), 'high'), x)
    return x * np.exp(-tt * (17 if open_ else 62)) * amp


def whoosh(dur=0.5, amp=0.055):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = np.random.default_rng(6).normal(0, 1, n)
    out = np.zeros(n)
    win = int(0.02 * SR)
    for i in range(0, n, win):
        seg = x[i:i + win]
        if not len(seg):
            break
        c = 900 + 1500 * (i / n)
        out[i:i + win] = lfilter(*butter(2, [c * 0.6 / (SR / 2), min(SR / 2 - 120, c * 1.7) / (SR / 2)], 'band'), seg)
    return out * np.sin(np.pi * np.clip(tt / dur, 0, 1)) ** 1.4 * amp


def bell(m, dur, amp):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    sig = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.01 * tt)
           + 0.13 * np.sin(2 * np.pi * f * 3.02 * tt))
    return sig * (1 - np.exp(-tt / 0.003)) * np.exp(-tt * 1.9) * amp


def boom(amp=0.14):
    n = int(0.85 * SR)
    tt = np.arange(n) / SR
    f = 64 * np.exp(-tt * 3.6) + 37
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.3) * amp


CHORDS = [(57, [57, 60, 64, 69]), (53, [53, 57, 60, 65]),
          (55, [55, 58, 62, 67]), (52, [52, 55, 59, 64])]


def mix(tl, vo, out):
    total = tl['total']
    N = int(total * SR) + SR // 2
    music = np.zeros((N, 2))
    sfx = np.zeros((N, 2))
    for bar in range(int(np.ceil(total / BAR)) + 1):
        t0 = bar * BAR
        if t0 >= total:
            break
        root, notes = CHORDS[bar % 4]
        for i, m in enumerate(notes):
            add(music, pad(m, min(4.8, total - t0 + 0.5), 0.055), t0, 1.0, pan=-0.2 + i * 0.14)
        for beat, m, g in [(0, root - 12, 0.14), (2, root - 12, 0.10)]:
            tt = t0 + beat * BEAT
            if tt < total:
                add(music, felt(m, 0.5, g, 0.14), tt, 1.0)
        for i, idx in enumerate([0, 1, 2, 3, 2, 1]):
            tt = t0 + i * (BEAT / 1.5)
            if tt >= total:
                break
            add(music, felt(notes[idx] + 12, 0.8, 0.040 if i % 2 == 0 else 0.026, 0.24),
                tt, 1.0, pan=-0.16 + 0.06 * i)
        for beat in range(4):
            tt = t0 + beat * BEAT
            if tt >= total:
                break
            if beat in (0, 2):
                add(music, kick(0.13 if beat == 0 else 0.09), tt)
            else:
                add(music, clap(0.035), tt, 1.0, 0.13)
            add(music, hat(0.012 if beat % 2 == 0 else 0.016), tt, 1.0, -0.16)

    # wall changes: a soft tick, the hook ones a touch louder
    for c in tl['wall']:
        add(sfx, whoosh(0.34, 0.030), c['t'] - 0.04, 1.0, 0.25)
        if c['mode'] == 'hook':
            add(sfx, kick(0.075), c['t'])
            add(sfx, clap(0.030), c['t'])
        if c['focus'] in (0, 7):          # golden accents on the wall
            add(sfx, bell(81 + (c['focus'] % 3) * 4, 0.9, 0.018), c['t'] + 0.03, 1.0, -0.2)
    # camera moves
    for sc in tl['scenes']:
        if sc['kind'] == 'watch':
            add(sfx, whoosh(0.55, 0.045), sc['look_in'] - 0.12, 1.0, -0.28)
            add(sfx, felt(45, 0.4, 0.040, 0.1), sc['look_in'])
            for ex in sc.get('extras', []):
                add(sfx, whoosh(0.40, 0.032), ex['t'] - 0.05, 1.0, 0.3)
        if sc['kind'] == 'water':
            for i in range(4):
                add(sfx, bell(76 + i * 3, 0.5, 0.020), sc['t0'] + 0.5 + i * 0.6, 1.0,
                    -0.25 + i * 0.14)
        if sc['kind'] == 'replace':
            add(sfx, kick(0.09), sc['t0'] + 0.45)
            add(sfx, clap(0.045), sc['t0'] + 0.45)
        if sc['kind'] == 'five':
            for i, m in enumerate([76, 81, 84, 88]):
                add(sfx, bell(m, 1.1, 0.026), sc['t0'] + 0.30 + i * 0.10, 1.0,
                    -0.2 + i * 0.13)
        if sc['kind'] == 'cta':
            add(sfx, boom(0.13), sc['t0'] + 0.2)
            for i, m in enumerate([57, 60, 64, 69]):
                add(sfx, pad(m, 2.2, 0.040), sc['t0'] + 0.24, 1.0, -0.2 + i * 0.13)
            add(sfx, bell(88, 2.2, 0.040), total - 1.3, 1.0, 0.1)
    add(sfx, boom(0.11), 0.0)

    vb = np.zeros((N, 2))
    rows = []
    for sc in tl['scenes']:
        for name, t0 in sc.get('vo', []):
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
    k_atk, k_rel = int(0.05 * SR), int(0.26 * SR)
    for i in range(1, N):
        k = k_atk if env[i] > e2[i - 1] else k_rel
        e2[i] = e2[i - 1] + ((env[i] if env[i] > e2[i - 1] else 0.0) - e2[i - 1]) / k
    duck = 10 ** (-7.5 * e2 / 20)
    idx = np.arange(N)
    pump = 1.0 - 0.08 * (1 - ((idx / SR) % BEAT) / BEAT) ** 3
    mus = music * duck[:, None] * pump[:, None]
    fi, fo = int(0.4 * SR), int(1.3 * SR)
    arc = np.ones(N)
    arc[:fi] = np.linspace(0, 1, fi)
    arc[-fo:] = np.linspace(1, 0, fo) ** 1.2
    mus *= arc[:, None]

    out_mix = vb + mus * 0.95 + sfx * 0.9
    out_mix = high_shelf(out_mix, 5200, 2.2)
    out_mix = peaking(out_mix, 330, -1.2, 0.9)
    out_mix = lfilter(*butter(2, 32 / (SR / 2), 'high'), out_mix, axis=0)
    out_mix = np.tanh(out_mix * 1.05) * 0.96
    pk = np.abs(out_mix).max()
    if pk > 0.97:
        out_mix *= 0.97 / pk
    out_mix = out_mix[:int(total * SR)]
    wavfile.write(out, SR, (np.clip(out_mix, -1, 1) * 32767).astype(np.int16))
    tl['vo'] = rows
    print(f'audio {total:.2f}s · vo {len(rows)} lines · {out}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='')
    args = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    vo = {}
    missing = []
    for name, f in LINES:
        p = f'{VO}/{f}'
        if not os.path.exists(p):
            missing.append(f)
            continue
        vo[name] = prep(name, p)
    if missing:
        print('MISSING VO:', ', '.join(missing))
    tl = timeline(vo)
    out = args.out or f'{OUT}/mix.wav'
    mix(tl, vo, out)
    json.dump(tl, open(f'{OUT}/timeline.json', 'w'), indent=1)
    print(f"timeline {tl['total']:.2f}s · {tl['frames']} frames · {len(tl['scenes'])} scenes")


if __name__ == '__main__':
    main()
