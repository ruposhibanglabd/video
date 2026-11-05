#!/usr/bin/env python3
"""Set C v2 — 90 BPM score + the new Bengali VO, cut to the living picture.

The v1 score was a quiet pad with no pulse. This one has a clear beat: soft
kick, rim, hats, felt-piano arpeggio and a bass that moves with the chords.
Every picture change lands on a beat and gets a small transition sound.
"""
import json
import os
import subprocess

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
BASE = 'miqa/products/2026-11-05_set-c-video'
SRC = f'{BASE}/audio/vo2'
WORK = f'{BASE}/work/audio2'
SR = 48000
TOTAL = 31.5
N = int(TOTAL * SR)
BEAT = 60.0 / 90.0
BAR = BEAT * 4
os.makedirs(WORK, exist_ok=True)

# picture slots (start, duration available)
SLOTS = [
    ('hook',    '01_hook.mp3',    0.35, 5.333),
    ('colours', '02_colours.mp3', 5.45, 6.667),
    ('water',   '03_water.mp3',  12.15, 6.000),
    ('replace', '04_replace.mp3', 18.15, 3.333),
    ('five',    '05_five.mp3',   21.50, 5.167),
    ('cta',     '06_cta.mp3',    26.85, 4.650),
]


def sh(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(f'FAILED: {cmd}\n{r.stderr[-1500:]}')


def load(path):
    sr, x = wavfile.read(path)
    if x.ndim > 1:
        x = x[:, 0]
    return x.astype(np.float64) / 32768.0, sr


def trim(x, thresh=0.008, pad_in=0.04, pad_out=0.08):
    idx = np.where(np.abs(x) > thresh)[0]
    if not len(idx):
        return x
    a = max(0, idx[0] - int(pad_in * SR))
    b = min(len(x), idx[-1] + int(pad_out * SR))
    return x[a:b]


def highpass(x, f=90, order=2):
    b, a = butter(order, f / (SR / 2), 'high')
    return lfilter(b, a, x)


def peaking(x, f=2800, gain=2.5, q=1.0):
    # simple RBJ peaking EQ
    A = 10 ** (gain / 40)
    w0 = 2 * np.pi * f / SR
    alpha = np.sin(w0) / (2 * q)
    b = [1 + alpha * A, -2 * np.cos(w0), 1 - alpha * A]
    a = [1 + alpha / A, -2 * np.cos(w0), 1 - alpha / A]
    return lfilter(b, a, x)


def compress(x, thresh=0.18, ratio=3.0, atk=0.006, rel=0.09, makeup=1.15):
    env = np.zeros_like(x)
    k_atk = int(atk * SR)
    k_rel = int(rel * SR)
    for i in range(1, len(x)):
        target = abs(x[i])
        if target > env[i - 1]:
            env[i] = env[i - 1] + (target - env[i - 1]) / max(1, k_atk)
        else:
            env[i] = env[i - 1] + (target - env[i - 1]) / max(1, k_rel)
    gain = np.ones_like(x)
    over = env > thresh
    gain[over] = (thresh + (env[over] - thresh) / ratio) / np.maximum(env[over], 1e-9)
    # smooth gain
    k = int(0.01 * SR)
    kernel = np.ones(k) / k
    gain = np.convolve(gain, kernel, 'same')
    return x * gain * makeup


def high_shelf(x, f=5200, gain=2.6, s=1.0):
    A = 10 ** (gain / 40)
    w0 = 2 * np.pi * f / SR
    alpha = np.sin(w0) / 2 * np.sqrt((A + 1 / A) * (1 / s - 1) + 2)
    c = np.cos(w0)
    sq = 2 * np.sqrt(A) * alpha
    b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c),
         A * ((A + 1) + (A - 1) * c - sq)]
    a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c),
         (A + 1) - (A - 1) * c - sq]
    return lfilter(b, a, x)


def master_eq(x):
    x = high_shelf(x, 5200, 2.6)
    x = peaking(x, 350, -1.4, 0.9)
    b, a = butter(2, 32 / (SR / 2), 'high')
    x = lfilter(b, a, x)
    return x


def room(x, wet=0.045, dur=0.28):
    rng = np.random.default_rng(7)
    n = int(dur * SR)
    t = np.arange(n) / SR
    ir = rng.normal(0, 1, n) * np.exp(-t / 0.075)
    ir = lfilter(*butter(2, 5000 / (SR / 2), 'low'), ir)
    ir /= np.sqrt((ir ** 2).sum()) + 1e-9
    w = fftconvolve(x, ir, 'full')[:len(x)]
    return (1 - wet) * x + wet * w


def prep_vo():
    out = {}
    for sid, src, t0, slot in SLOTS:
        raw = f'{WORK}/{sid}_raw.wav'
        sh(f'{FF} -y -v error -i {SRC}/{src} -ac 1 -ar {SR} {raw}')
        x, _ = load(raw)
        x = trim(x)
        x = highpass(x)
        x = peaking(x)
        x = compress(x)
        x = room(x)
        p = np.abs(x).max() or 1.0
        x = x / p * 0.92
        n = int(0.008 * SR)
        x[:n] *= np.linspace(0, 1, n)
        x[-n:] *= np.linspace(1, 0, n)
        dur = len(x) / SR
        if dur > slot - 0.05:
            # last resort: gentle tempo fit, never more than 1.12
            tempo = min(1.12, dur / (slot - 0.05))
            tmp = f'{WORK}/{sid}_t.wav'
            sh(f'{FF} -y -v error -i {raw} -ac 1 -ar {SR} -af atempo={tempo:.4f} {tmp}')
            x, _ = load(tmp)
            x = trim(x)
            x = highpass(x); x = peaking(x); x = compress(x); x = room(x)
            p = np.abs(x).max() or 1.0
            x = x / p * 0.92
            dur = len(x) / SR
        wavfile.write(f'{WORK}/{sid}.wav', SR, (x * 32767).astype(np.int16))
        out[sid] = dict(t0=t0, dur=round(dur, 3), end=round(t0 + dur, 3))
        print(f'{sid:8s} start {t0:5.2f}  dur {dur:5.2f}  end {t0+dur:5.2f}')
    return out


# ------------------------------------------------------------------ score
def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(buf, sig, t0, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= len(buf):
        return
    n = min(len(sig), len(buf) - i0)
    if n <= 0:
        return
    l = gain * (1 - max(0.0, pan)) ** 0.5
    r = gain * (1 + min(0.0, pan)) ** 0.5
    buf[i0:i0 + n, 0] += sig[:n] * l
    buf[i0:i0 + n, 1] += sig[:n] * r


def env_ad(n, a, d, curve=2.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4) * curve)
    return e


def pad(m, dur, amp):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi(m)
    sig = np.zeros(n)
    for k, w in [(1, 1.0), (2, 0.26), (3, 0.12), (4, 0.06), (5, 0.03)]:
        sig += w * np.sin(2 * np.pi * f * k * t + k * 0.6)
    e = np.minimum(1, t / 0.45) * np.minimum(1, (dur - t) / 0.75)
    return sig * e * amp / 2.2


def felt(m, dur, amp, bright=0.32):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi(m)
    sig = (np.sin(2 * np.pi * f * t) + bright * np.sin(4 * np.pi * f * t)
           + 0.10 * np.sin(6 * np.pi * f * t))
    e = (1 - np.exp(-t / 0.004)) * np.exp(-t * 3.0)
    return sig * e * amp


def bell(m, dur, amp):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi(m)
    sig = (np.sin(2 * np.pi * f * t) + 0.42 * np.sin(2 * np.pi * f * 2.01 * t)
           + 0.16 * np.sin(2 * np.pi * f * 3.02 * t) + 0.06 * np.sin(2 * np.pi * f * 4.98 * t))
    e = (1 - np.exp(-t / 0.003)) * np.exp(-t * 1.7)
    return sig * e * amp


def kick(amp=0.20):
    n = int(0.30 * SR)
    t = np.arange(n) / SR
    f = 92 * np.exp(-t * 16) + 44
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR)
    e = np.exp(-t * 11)
    click = np.random.default_rng(3).normal(0, 1, n) * np.exp(-t * 90) * 0.18
    return (sig * e + click) * amp


def rim(amp=0.055):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    x = np.random.default_rng(4).normal(0, 1, n)
    b, a = butter(2, [1200 / (SR / 2), 5200 / (SR / 2)], 'band')
    x = lfilter(b, a, x)
    return x * np.exp(-t * 55) * amp


def hat(amp=0.022, open_=False):
    n = int((0.16 if open_ else 0.055) * SR)
    t = np.arange(n) / SR
    x = np.random.default_rng(5).normal(0, 1, n)
    b, a = butter(2, 7000 / (SR / 2), 'high')
    x = lfilter(b, a, x)
    return x * np.exp(-t * (18 if open_ else 70)) * amp


def whoosh(dur=0.38, amp=0.09, up=True):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.random.default_rng(6).normal(0, 1, n)
    # moving bandpass via short-time filtering
    out = np.zeros(n)
    win = int(0.02 * SR)
    for i in range(0, n, win):
        seg = x[i:i + win]
        if not len(seg):
            break
        c = 500 + (2800 if up else 500) * (i / n)
        b, a = butter(2, [max(80, c * 0.6) / (SR / 2), min(SR / 2 - 100, c * 1.6) / (SR / 2)], 'band')
        out[i:i + win] = lfilter(b, a, seg)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.4
    return out * e * amp


def plink(f0=1400, dur=0.22, amp=0.05):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * np.exp(-t * 9) + 420
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR)
    e = np.exp(-t * 18) * (1 - np.exp(-t / 0.002))
    return sig * e * amp


def boom(amp=0.16):
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    f = 62 * np.exp(-t * 3.5) + 38
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return sig * np.exp(-t * 3.2) * amp


CHORDS = [
    (57, [57, 61, 64, 69]),   # A
    (52, [52, 56, 59, 64]),   # E
    (54, [54, 57, 61, 66]),   # F#m
    (50, [50, 54, 57, 62]),   # D
]


def build_score(vo):
    music = np.zeros((N, 2))
    sfx = np.zeros((N, 2))
    rng = np.random.default_rng(21)

    # warm pad, one chord per bar
    for bar in range(12):
        t0 = bar * BAR
        if t0 >= TOTAL:
            break
        root, notes = CHORDS[bar % 4]
        for i, m in enumerate(notes):
            add(music, pad(m, min(5.2, TOTAL - t0 + 0.4), 0.070), t0, 1.0, pan=(-0.22 + i * 0.15))
        # airy fifth above
        add(music, pad(notes[-1] + 7, min(4.6, TOTAL - t0 + 0.3), 0.022), t0, 1.0, pan=0.25)

    # bass: beats 1 and 3, plus a pickup into the next bar
    for bar in range(12):
        t0 = bar * BAR
        if t0 >= TOTAL:
            break
        root, notes = CHORDS[bar % 4]
        for beat, m, g in [(0, root - 12, 0.16), (2, root - 12, 0.13), (3.5, root - 5, 0.08)]:
            tt = t0 + beat * BEAT
            if tt < TOTAL:
                add(music, felt(m, 0.55, g, bright=0.18), tt, 1.0, pan=0.0)

    # felt piano arpeggio, 8th notes
    pattern = [0, 1, 2, 3, 2, 1, 2, 3]
    for bar in range(12):
        t0 = bar * BAR
        if t0 >= TOTAL:
            break
        root, notes = CHORDS[bar % 4]
        for i, idx in enumerate(pattern):
            tt = t0 + i * (BEAT / 2)
            if tt >= TOTAL:
                break
            m = notes[idx] + 12
            vel = 0.055 if i % 2 == 0 else 0.036
            add(music, felt(m, 0.9, vel, bright=0.30), tt, 1.0, pan=-0.18 + 0.06 * i)

    # soft kick on 1 and 3, rim on 2 and 4, hats on 8ths
    for bar in range(12):
        t0 = bar * BAR
        for beat in range(4):
            tt = t0 + beat * BEAT
            if tt >= TOTAL:
                break
            if beat in (0, 2):
                add(music, kick(0.17 if beat == 0 else 0.12), tt, 1.0, 0.0)
            if beat in (1, 3):
                add(music, rim(0.045), tt, 1.0, 0.12)
            add(music, hat(0.016 if beat % 2 == 0 else 0.022), tt, 1.0, -0.18)
            add(music, hat(0.012, open_=True), tt + BEAT / 2, 1.0, 0.18)

    # transition whooshes on every colour change
    for i, t0 in enumerate([5.333, 6.667, 8.0, 9.333, 10.667]):
        add(sfx, whoosh(0.40, 0.075, up=True), t0 - 0.05, 1.0, pan=-0.35 if i % 2 == 0 else 0.35)
    # a soft low step under each colour
    for i, t0 in enumerate([5.333, 6.667, 8.0, 9.333, 10.667]):
        add(sfx, felt(45 - i, 0.45, 0.055, bright=0.1), t0, 1.0, 0.0)

    # water plinks
    for i, t0 in enumerate([12.25, 13.05, 14.15, 15.35]):
        add(sfx, plink(1500 + i * 120, 0.24, 0.045), t0, 1.0, pan=-0.25 + i * 0.16)
    # 7-day stamp
    add(sfx, kick(0.10), 18.10, 1.0, 0.0)
    add(sfx, rim(0.05), 18.10, 1.0, 0.0)
    # 5% sparkle
    for i, m in enumerate([81, 85, 88, 93]):
        add(sfx, bell(m, 1.1, 0.045), 21.42 + i * 0.085, 1.0, pan=-0.2 + i * 0.13)
    # CTA boom + warm swell
    add(sfx, boom(0.14), 26.68, 1.0, 0.0)
    for i, m in enumerate([57, 61, 64, 69]):
        add(sfx, pad(m, 2.2, 0.045), 26.70, 1.0, pan=-0.2 + i * 0.13)
    # final bell
    add(sfx, bell(93, 2.4, 0.05), 30.85, 1.0, 0.1)

    # ---------------------------------------------------------- ducking
    env = np.zeros(N)
    for sid, s in vo.items():
        a = int(s['t0'] * SR)
        b = min(N, a + int(s['dur'] * SR))
        env[a:b] = 1.0
    e2 = np.zeros(N)
    k_atk, k_rel = int(0.05 * SR), int(0.26 * SR)
    for i in range(1, N):
        if env[i] > e2[i - 1]:
            e2[i] = e2[i - 1] + (1 - e2[i - 1]) / k_atk
        else:
            e2[i] = e2[i - 1] + (0 - e2[i - 1]) / k_rel
    duck = 10 ** (-8.0 * e2 / 20)

    # beat pump, subtle
    pump = np.ones(N)
    for i in range(N):
        pump[i] = 1.0 - 0.10 * (1 - ((i / SR) % BEAT) / BEAT) ** 3

    mus = music * duck[:, None] * pump[:, None]
    arc = np.ones(N)
    fi, fo = int(0.35 * SR), int(1.2 * SR)
    arc[:fi] = np.linspace(0, 1, fi)
    arc[-fo:] = np.linspace(1, 0, fo) ** 1.2
    mus *= arc[:, None]

    vb = np.zeros((N, 2))
    for sid, s in vo.items():
        x, _ = load(f'{WORK}/{sid}.wav')
        i0 = int(s['t0'] * SR)
        n = min(len(x), N - i0)
        if n > 0:
            vb[i0:i0 + n, 0] += x[:n]
            vb[i0:i0 + n, 1] += x[:n]

    mix = vb * 1.0 + mus * 0.90 + sfx * 0.85
    mix = master_eq(mix)
    # gentle bus glue / limiter
    mix = np.tanh(mix * 1.05) * 0.96
    pk = np.abs(mix).max()
    if pk > 0.98:
        mix *= 0.98 / pk
    wavfile.write(f'{WORK}/mix_raw.wav', SR, (np.clip(mix, -1, 1) * 32767).astype(np.int16))

    tl = dict(version=2, fps=30, total=TOTAL, frames=int(round(TOTAL * 30)),
              scenes=[dict(id='hook', t0=0.0, t1=5.333),
                      dict(id='run', t0=5.333, t1=12.0),
                      dict(id='water', t0=12.0, t1=18.0),
                      dict(id='replace', t0=18.0, t1=21.333),
                      dict(id='five', t0=21.333, t1=26.667),
                      dict(id='cta', t0=26.667, t1=31.5)],
              vo={k: {kk: round(vv, 3) for kk, vv in v.items()} for k, v in vo.items()})
    json.dump(tl, open(f'{WORK}/timeline.json', 'w'), indent=1)
    print('wrote mix', round(len(mix) / SR, 2), 's')


def main():
    vo = prep_vo()
    build_score(vo)


if __name__ == '__main__':
    main()
