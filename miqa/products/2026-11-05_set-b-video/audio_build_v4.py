#!/usr/bin/env python3
"""Set B v4 — 20-second cut. Five short VO lines fitted into fixed slots.

Picture is 20.00 s exactly (600 frames @30fps). Each VO clip is time-fitted to
its slot with atempo, so the narration never runs past its picture.

Score is deliberately quiet and steady: soft pad + felt piano + a light pulse.
No shimmers, no risers, no whoosh per cut (the client asked for fewer flashes).
"""
import json, os, subprocess
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
BASE = 'miqa/products/2026-11-05_set-b-video'
SRC = f'{BASE}/audio/v4'
WORK = f'{BASE}/work/v4'
SR = 48000
FPS = 30
TOTAL = 20.0
os.makedirs(f'{WORK}/vo', exist_ok=True)

# id, source, slot start, slot length, lead-in inside the slot
SLOTS = [
    ('hook',      '01_hook.mp3',      0.25,  4.85, 0.18),
    ('colours',   '02_colours.mp3',   5.45,  5.95, 0.22),
    ('guarantee', '03_guarantee.mp3', 11.55, 2.60, 0.26),
    ('five',      '05_five.mp3',      14.35, 2.60, 0.24),
    ('cta',       '04_cta.mp3',       17.25, 2.55, 0.20),
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


def trim(x, thresh=0.012, pad_in=0.04, pad_out=0.10):
    idx = np.where(np.abs(x) > thresh)[0]
    if not len(idx):
        return x
    a = max(0, idx[0] - int(pad_in * SR))
    b = min(len(x), idx[-1] + int(pad_out * SR))
    return x[a:b]


def prep():
    out = {}
    for sid, src, t0, slot, lead in SLOTS:
        raw = f'{WORK}/vo/{sid}_raw.wav'
        sh(f'{FF} -y -v error -i {SRC}/{src} -ac 1 -ar {SR} {raw}')
        x, _ = load(raw)
        x = trim(x)
        # fit inside the slot: allow up to 1.32x speed, never slower than 1.0
        avail = slot - lead - 0.10
        tempo = max(1.0, min(1.22, len(x) / SR / avail))
        if tempo > 1.001:
            tmp = f'{WORK}/vo/{sid}_t.wav'
            sh(f'{FF} -y -v error -i {raw} -ac 1 -ar {SR} -af atempo={tempo:.4f} {tmp}')
            x, _ = load(tmp)
            x = trim(x)
        p = np.abs(x).max() or 1.0
        x = x / p * 0.90
        n = int(0.008 * SR)
        x[:n] *= np.linspace(0, 1, n)
        x[-n:] *= np.linspace(1, 0, n)
        wavfile.write(f'{WORK}/vo/{sid}.wav', SR, (x * 32767).astype(np.int16))
        out[sid] = dict(t0=t0, dur=len(x) / SR, lead=lead, tempo=tempo)
        print(f'{sid:10s} {len(x)/SR:5.2f}s  tempo {tempo:.3f}  at {t0 + lead:5.2f}')
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


def pad(m, dur, amp):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi(m)
    sig = np.zeros(n)
    for k, w in [(1, 1.0), (2, 0.22), (3, 0.10), (4, 0.05)]:
        sig += w * np.sin(2 * np.pi * f * k * t + k * 0.7)
    env = np.minimum(1, t / 0.55) * np.minimum(1, (dur - t) / 0.85)
    return sig * env * amp / 2.0


def felt(m, dur, amp):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi(m)
    sig = (np.sin(2 * np.pi * f * t) + 0.30 * np.sin(4 * np.pi * f * t)
           + 0.12 * np.sin(6 * np.pi * f * t))
    env = np.exp(-t * 3.2) * np.minimum(1, t / 0.006)
    return sig * env * amp


def bellish(m, dur, amp):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi(m)
    sig = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.01 * t) \
        + 0.15 * np.sin(2 * np.pi * f * 3.02 * t)
    env = np.exp(-t * 2.0) * np.minimum(1, t / 0.004)
    return sig * env * amp


def warm_noise(dur, amp, rng, lo=180, hi=2400):
    n = int(dur * SR)
    x = rng.normal(0, 0.3, n)
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band')
    x = lfilter(b, a, x)
    env = np.minimum(1, np.arange(n) / SR / 0.5) * np.minimum(1, (dur - np.arange(n) / SR) / 0.7)
    return x * env * amp


def main():
    vo = prep()
    N = int(TOTAL * SR)
    rng = np.random.default_rng(4)
    music = np.zeros((N, 2))
    sfx = np.zeros((N, 2))

    # slow pad bed: A major, one chord per 4 s, very low level
    chords = [(0.0, [57, 64, 69]), (4.0, [57, 61, 69]), (8.0, [54, 61, 66]),
              (12.0, [59, 66, 71]), (16.0, [57, 64, 69])]
    for t0, notes in chords:
        for i, m in enumerate(notes):
            add(music, pad(m, 4.9, 0.10), t0, 1.0, pan=(-0.18 + i * 0.18))

    # felt piano motif — sparse, one note per bar at most
    for t0, m in [(0.6, 76), (2.4, 73), (5.35, 76), (6.9, 78), (8.45, 81),
                  (11.5, 73), (13.3, 76), (14.5, 71), (16.1, 78), (17.5, 81)]:
        add(music, felt(m, 1.6, 0.13), t0, 1.0, pan=-0.12)

    # soft pulse only in the colourway run (one per colourway, no build-up)
    for k, t0 in enumerate([5.35, 6.9, 8.45, 10.0]):
        add(music, felt(45, 0.55, 0.10), t0, 1.0, pan=0.0)

    # gentle section bells (2 only, both quiet)
    add(music, bellish(88, 2.2, 0.10), 0.35, 1.0, pan=0.18)
    add(music, bellish(84, 2.4, 0.09), 17.45, 1.0, pan=-0.16)

    # air: one soft noise bed under the whole piece, no per-cut whooshes
    add(sfx, warm_noise(TOTAL, 0.030, rng), 0.0, 1.0, pan=0.0)
    # single soft thump on the hook and a quiet stamp on the guarantee seal
    add(sfx, felt(33, 0.5, 0.16), 0.02, 1.0, pan=0.0)
    add(sfx, felt(38, 0.45, 0.13), 11.62, 1.0, pan=0.0)

    # ---------------------------------------------------------- mix
    env = np.zeros(N)
    for sid, s in vo.items():
        a = int((s['t0'] + s['lead']) * SR)
        b = min(N, a + int(s['dur'] * SR))
        env[a:b] = 1.0
    e2 = np.zeros(N)
    k_atk, k_rel = int(0.06 * SR), int(0.28 * SR)
    for i in range(1, N):
        if env[i] > e2[i - 1]:
            e2[i] = e2[i - 1] + (1 - e2[i - 1]) / k_atk
        else:
            e2[i] = e2[i - 1] + (0 - e2[i - 1]) / k_rel
    duck = 10 ** (-7.0 * e2 / 20)

    mus = music * duck[:, None]
    arc = np.ones(N)
    fi, fo = int(0.5 * SR), int(1.1 * SR)
    arc[:fi] = np.linspace(0, 1, fi)
    arc[-fo:] = np.linspace(1, 0, fo) ** 1.3
    mus *= arc[:, None]

    vb = np.zeros((N, 2))
    for sid, s in vo.items():
        x, _ = load(f'{WORK}/vo/{sid}.wav')
        i0 = int((s['t0'] + s['lead']) * SR)
        n = min(len(x), N - i0)
        if n > 0:
            vb[i0:i0 + n, 0] += x[:n]
            vb[i0:i0 + n, 1] += x[:n]

    mix = vb * 1.0 + mus * 0.85 + sfx * 0.6
    pk = np.abs(mix).max()
    if pk > 0.99:
        mix *= 0.99 / pk

    wavfile.write(f'{WORK}/mix_raw.wav', SR, (np.clip(mix, -1, 1) * 32767).astype(np.int16))
    scenes = [
        dict(id='hook', t0=0.0, t1=5.2),
        dict(id='colours', t0=5.2, t1=11.4),
        dict(id='guarantee', t0=11.4, t1=14.2),
        dict(id='five', t0=14.2, t1=17.1),
        dict(id='cta', t0=17.1, t1=20.0),
    ]
    for s in scenes:
        s['dur'] = round(s['t1'] - s['t0'], 3)
    json.dump(dict(version=4, fps=FPS, total=TOTAL, frames=int(TOTAL * FPS),
                   scenes=scenes, vo={k: {kk: round(vv, 3) for kk, vv in v.items()}
                                      for k, v in vo.items()}),
              open(f'{WORK}/timeline.json', 'w'), indent=1)
    print(f'\nwrote timeline  {TOTAL}s  {int(TOTAL * FPS)} frames')


if __name__ == '__main__':
    main()
