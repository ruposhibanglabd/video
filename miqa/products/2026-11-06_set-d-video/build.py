#!/usr/bin/env python3
"""Set D — "Velora" reel: timeline + voice-over bed + 96 BPM score.

The picture is a slide track: every look arrives from the right and settles,
pushing the previous one out to the left. The narration is cut so each line
lands *between* slides — the voice keeps talking while the pictures travel.

Scene order
  intro     brand lock-up + ৳৩৯৯
  p01..p14  five looks each (primary, on-wrist, angle, dial close, styled)
  water     water resistance card
  replace   7-day replacement card
  cta       price + cash on delivery

Usage
  python build.py                 # full build (needs all VO clips)
  python build.py --products 3    # proof build: intro + first 3 products
"""
import argparse
import json
import os
import subprocess

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
BASE = 'miqa/products/2026-11-06_set-d-video'
VO = f'{BASE}/audio/vo2'
WORK = f'{BASE}/work'
SR = 48000
FPS = 30

BPM = 96
BEAT = 60.0 / BPM
BAR = BEAT * 4

PRODUCT_KEYS = {
    '01': ['01_primary', '02_on-wrist', '03_angle', '04_dial-closeup', '05_bracelet-closeup'],
    '02': ['01_primary', '02_on-wrist', '03_angle', '04_dial-closeup', '05_bracelet-closeup'],
    '03': ['01_primary', '02_on-wrist', '03_angle', '04_dial-closeup', '05_bracelet-closeup'],
    '04': ['01_primary', '02_on-wrist', '03_angle', '04_dial-closeup', '05_bracelet-closeup'],
}
for _n in [f'{i:02d}' for i in range(5, 15)]:
    PRODUCT_KEYS[_n] = ['01_primary', '02_on-wrist', '03_angle', '04_dial-closeup', '05_styled']

WOOSH = 0.46          # slide length, must match render.py SLIDE
CARD_HOLD = 0.86      # gap between two slides inside one product


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


def highpass(x, f=90):
    return lfilter(*butter(2, f / (SR / 2), 'high'), x)


def peaking(x, f=2800, gain=2.6, q=1.0):
    A = 10 ** (gain / 40)
    w0 = 2 * np.pi * f / SR
    alpha = np.sin(w0) / (2 * q)
    b = [1 + alpha * A, -2 * np.cos(w0), 1 - alpha * A]
    a = [1 + alpha / A, -2 * np.cos(w0), 1 - alpha / A]
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


def high_shelf(x, f=5200, gain=2.4, s=1.0):
    A = 10 ** (gain / 40)
    w0 = 2 * np.pi * f / SR
    alpha = np.sin(w0) / 2 * np.sqrt((A + 1 / A) * (1 / s - 1) + 2)
    c = np.cos(w0)
    sq = 2 * np.sqrt(A) * alpha
    b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c),
         A * ((A + 1) + (A - 1) * c - sq)]
    a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sq]
    return lfilter(b, a, x)


def room(x, wet=0.05, dur=0.26):
    rng = np.random.default_rng(7)
    n = int(dur * SR)
    t = np.arange(n) / SR
    ir = rng.normal(0, 1, n) * np.exp(-t / 0.07)
    ir = lfilter(*butter(2, 5200 / (SR / 2), 'low'), ir)
    ir /= np.sqrt((ir ** 2).sum()) + 1e-9
    return (1 - wet) * x + wet * fftconvolve(x, ir, 'full')[:len(x)]


# ------------------------------------------------------------------ voice
def prep_vo(name, src):
    """Convert, clean and trim one VO line; returns float array."""
    raw = f'{WORK}/vo_{name}.wav'
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


# --------------------------------------------------------------- timeline
def build_timeline(limit_products, with_features):
    """Lay the narration out first, then hang the slide track on it."""
    lines = [
        ('intro1', '01_intro1.mp3'),
        ('intro2', '02_intro2.mp3'),
    ]
    for i in range(1, 15):
        lines.append((f'p{i:02d}', f'{i + 2:02d}_p{i:02d}.mp3'))
    lines += [('water', '17_water.mp3'), ('replace', '18_replace.mp3'), ('cta', '19_cta.mp3')]

    vo = {}
    missing = []
    for name, f in lines:
        p = f'{VO}/{f}'
        if not os.path.exists(p):
            missing.append(f)
            continue
        vo[name] = prep_vo(name, p)

    scenes = []
    t = 0.55
    # ---- intro
    a = len(vo['intro1']) / SR
    b = len(vo['intro2']) / SR if 'intro2' in vo else 3.0
    t_intro_end = t + a + 0.34 + b + 0.85
    scenes.append(dict(id='intro', kind='intro', t0=0.0, t1=t_intro_end,
                       vo=[('intro1', t), ('intro2', t + a + 0.34)],
                       card=('10', '03_angle')))
    t = t_intro_end

    # ---- products
    for i in range(1, 15):
        name = f'p{i:02d}'
        if limit_products and i > limit_products:
            break
        dur_vo = len(vo[name]) / SR if name in vo else 2.4
        # five slides: 4 holds between them, plus a beat before the next product
        seg = max(4.9, dur_vo + 2.15)
        t0 = t
        t1 = t0 + seg
        cards = []
        keys = PRODUCT_KEYS[f'{i:02d}']
        span = seg - 1.05          # last card should hold ~1.05 s
        step = max(CARD_HOLD, (span - WOOSH) / 4.0)
        for k, key in enumerate(keys):
            cards.append(dict(t=t0 + k * step, key=f'{i:02d}|{key}'))
        name_in = t0 + 0.10
        name_out = t1 - 0.34
        scenes.append(dict(id=name, kind='product', n=f'{i:02d}', t0=t0, t1=t1,
                           cards=cards, name_in=name_in, name_out=name_out,
                           vo=[(name, t0 + 0.62)] if name in vo else []))
        t = t1

    # ---- features + cta
    if with_features:
        for sid, sub, card, tail in [
            ('water', '17_water.mp3', ('11', '02_on-wrist'), 0.55),
            ('replace', '18_replace.mp3', ('12', '03_angle'), 0.55),
            ('cta', '19_cta.mp3', ('14', '03_angle'), 1.5),
        ]:
            dur = len(vo[sid]) / SR if sid in vo else 3.2
            seg = dur + tail
            scenes.append(dict(id=sid, kind=sid, t0=t, t1=t + seg,
                               card=card, cards=[dict(t=t, key='%s|%s' % card)],
                               vo=[(sid, t + 0.35)] if sid in vo else []))
            t += seg

    total = round(t + 0.35, 3)
    tl = dict(fps=FPS, total=total, frames=int(round(total * FPS)),
              bpm=BPM, slide=WOOSH, scenes=scenes,
              vo={k: [round(x, 3)] for k, x in []})
    return tl, vo, missing


# ------------------------------------------------------------------ score
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
    t = np.arange(n) / SR
    f = midi(m)
    sig = np.zeros(n)
    for k, w in [(1, 1.0), (2, 0.24), (3, 0.11), (4, 0.05), (5, 0.025)]:
        sig += w * np.sin(2 * np.pi * f * k * t + k * 0.6)
    e = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.7)
    return sig * e * amp / 2.2


def felt(m, dur, amp, bright=0.30):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi(m)
    sig = (np.sin(2 * np.pi * f * t) + bright * np.sin(4 * np.pi * f * t)
           + 0.09 * np.sin(6 * np.pi * f * t))
    e = (1 - np.exp(-t / 0.004)) * np.exp(-t * 3.2)
    return sig * e * amp


def kick(amp=0.16):
    n = int(0.28 * SR)
    t = np.arange(n) / SR
    f = 96 * np.exp(-t * 17) + 46
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR)
    click = np.random.default_rng(3).normal(0, 1, n) * np.exp(-t * 90) * 0.16
    return (sig * np.exp(-t * 11) + click) * amp


def clap(amp=0.05):
    n = int(0.14 * SR)
    t = np.arange(n) / SR
    x = np.random.default_rng(9).normal(0, 1, n)
    x = lfilter(*butter(2, [900 / (SR / 2), 4200 / (SR / 2)], 'band'), x)
    return x * np.exp(-t * 42) * amp


def hat(amp=0.020, open_=False):
    n = int((0.14 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    x = np.random.default_rng(5).normal(0, 1, n)
    x = lfilter(*butter(2, 7200 / (SR / 2), 'high'), x)
    return x * np.exp(-t * (17 if open_ else 65)) * amp


def whoosh(dur=0.44, amp=0.085, up=True):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.random.default_rng(6).normal(0, 1, n)
    out = np.zeros(n)
    win = int(0.02 * SR)
    for i in range(0, n, win):
        seg = x[i:i + win]
        if not len(seg):
            break
        c = (620 + 2600 * (i / n)) if up else (3200 - 2400 * (i / n))
        lo, hi = max(90, c * 0.55), min(SR / 2 - 120, c * 1.7)
        out[i:i + win] = lfilter(*butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'), seg)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return out * e * amp


def plink(f0=1400, dur=0.22, amp=0.045):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * np.exp(-t * 9) + 420
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return sig * np.exp(-t * 18) * (1 - np.exp(-t / 0.002)) * amp


def boom(amp=0.15):
    n = int(0.85 * SR)
    t = np.arange(n) / SR
    f = 64 * np.exp(-t * 3.6) + 38
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.3) * amp


def bell(m, dur, amp):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi(m)
    sig = (np.sin(2 * np.pi * f * t) + 0.42 * np.sin(2 * np.pi * f * 2.01 * t)
           + 0.15 * np.sin(2 * np.pi * f * 3.02 * t))
    return sig * (1 - np.exp(-t / 0.003)) * np.exp(-t * 1.8) * amp


CHORDS = [(57, [57, 61, 64, 69]), (52, [52, 56, 59, 64]),
          (54, [54, 57, 61, 66]), (53, [53, 57, 60, 65])]


def build_audio(tl, vo, out):
    total = tl['total']
    N = int(total * SR) + SR // 2
    music = np.zeros((N, 2))
    sfx = np.zeros((N, 2))
    nb = int(np.ceil(total / BAR)) + 1

    for bar in range(nb):
        t0 = bar * BAR
        if t0 >= total:
            break
        root, notes = CHORDS[bar % 4]
        for i, m in enumerate(notes):
            add(music, pad(m, min(5.0, total - t0 + 0.5), 0.062), t0, 1.0, pan=-0.22 + i * 0.15)
        add(music, pad(notes[-1] + 7, min(4.4, total - t0 + 0.4), 0.020), t0, 1.0, pan=0.25)
        # bass: 1 and 3, pickup on the "and" of 4
        for beat, m, g in [(0, root - 12, 0.15), (2, root - 12, 0.12), (3.5, root - 5, 0.07)]:
            tt = t0 + beat * BEAT
            if tt < total:
                add(music, felt(m, 0.5, g, bright=0.16), tt, 1.0)
        # felt arpeggio in 8ths
        pattern = [0, 1, 2, 3, 2, 1, 2, 3]
        for i, idx in enumerate(pattern):
            tt = t0 + i * (BEAT / 2)
            if tt >= total:
                break
            add(music, felt(notes[idx] + 12, 0.85, 0.052 if i % 2 == 0 else 0.034, 0.28),
                tt, 1.0, pan=-0.18 + 0.06 * i)
        for beat in range(4):
            tt = t0 + beat * BEAT
            if tt >= total:
                break
            if beat in (0, 2):
                add(music, kick(0.15 if beat == 0 else 0.11), tt)
            else:
                add(music, clap(0.042), tt, 1.0, 0.14)
            add(music, hat(0.015 if beat % 2 == 0 else 0.020), tt, 1.0, -0.18)
            add(music, hat(0.011, open_=True), tt + BEAT / 2, 1.0, 0.18)

    # ---- one whoosh per slide, panned with the movement
    for sc in tl['scenes']:
        for i, c in enumerate(sc.get('cards', [])):
            add(sfx, whoosh(0.42, 0.075, up=False), c['t'] - 0.06, 1.0,
                pan=0.40 if i % 2 == 0 else -0.32)
            add(sfx, felt(45 - (i % 4), 0.4, 0.05, 0.1), c['t'], 1.0)
    # ---- signature sounds
    for sc in tl['scenes']:
        if sc['kind'] == 'intro':
            add(sfx, boom(0.13), 0.0)
            for i, m in enumerate([69, 73, 76, 81]):
                add(sfx, bell(m, 1.0, 0.030), 0.05 + i * 0.10, 1.0, -0.2 + i * 0.13)
        if sc['kind'] == 'water':
            for i in range(4):
                add(sfx, plink(1500 + i * 110, 0.24, 0.040), sc['t0'] + 0.5 + i * 0.7,
                    1.0, -0.25 + i * 0.16)
        if sc['kind'] == 'replace':
            add(sfx, kick(0.10), sc['t0'] + 0.45)
            add(sfx, clap(0.05), sc['t0'] + 0.45)
        if sc['kind'] == 'cta':
            add(sfx, boom(0.14), sc['t0'] + 0.25)
            for i, m in enumerate([57, 61, 64, 69]):
                add(sfx, pad(m, 2.0, 0.042), sc['t0'] + 0.28, 1.0, -0.2 + i * 0.13)
            add(sfx, bell(93, 2.2, 0.045), total - 1.1, 1.0, 0.1)

    # ---- voice
    vb = np.zeros((N, 2))
    voice_rows = []
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
            voice_rows.append(dict(id=name, t0=round(t0, 3), dur=round(len(x) / SR, 3),
                                   end=round(t0 + len(x) / SR, 3)))

    # ---- duck the music under every line
    env = np.zeros(N)
    for r in voice_rows:
        a = int(r['t0'] * SR)
        b = min(N, int(r['end'] * SR))
        env[a:b] = 1.0
    e2 = np.zeros(N)
    k_atk, k_rel = int(0.05 * SR), int(0.26 * SR)
    for i in range(1, N):
        k = k_atk if env[i] > e2[i - 1] else k_rel
        e2[i] = e2[i - 1] + ((env[i] if env[i] > e2[i - 1] else 0.0) - e2[i - 1]) / k
    duck = 10 ** (-7.5 * e2 / 20)

    pump = np.ones(N)
    idx = np.arange(N)
    pump = 1.0 - 0.09 * (1 - ((idx / SR) % BEAT) / BEAT) ** 3

    mus = music * duck[:, None] * pump[:, None]
    fi, fo = int(0.4 * SR), int(1.3 * SR)
    arc = np.ones(N)
    arc[:fi] = np.linspace(0, 1, fi)
    arc[-fo:] = np.linspace(1, 0, fo) ** 1.2
    mus *= arc[:, None]

    mix = vb + mus * 0.92 + sfx * 0.85
    mix = high_shelf(mix, 5200, 2.2)
    mix = peaking(mix, 340, -1.3, 0.9)
    mix = lfilter(*butter(2, 32 / (SR / 2), 'high'), mix, axis=0)
    mix = np.tanh(mix * 1.05) * 0.96
    pk = np.abs(mix).max()
    if pk > 0.97:
        mix *= 0.97 / pk
    mix = mix[:int(total * SR)]
    wavfile.write(out, SR, (np.clip(mix, -1, 1) * 32767).astype(np.int16))
    tl['vo'] = voice_rows
    print(f'audio: {total:.2f}s  vo lines {len(voice_rows)}  -> {out}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--products', type=int, default=0)
    ap.add_argument('--no-features', action='store_true')
    ap.add_argument('--out', default='')
    args = ap.parse_args()
    with_features = not args.no_features and not args.products
    tl, vo, missing = build_timeline(args.products, with_features)
    if missing:
        print('MISSING VO:', ', '.join(missing))
    with_features_real = with_features and not missing
    os.makedirs(WORK, exist_ok=True)
    out = args.out or f'{WORK}/mix.wav'
    build_audio(tl, vo, out)
    json.dump(tl, open(f'{WORK}/timeline.json', 'w'), indent=1)
    print(f"timeline: {tl['total']:.2f}s  {tl['frames']} frames  scenes {len(tl['scenes'])}")


if __name__ == '__main__':
    main()
