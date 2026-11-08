#!/usr/bin/env python3
"""Set G video v4 — timeline + original score + SFX + VO mix, both cuts.

Long cut  (full 7-scene story, PLAYBOOK §2 "Showcase", 30 fps):
  0.0  title   — obsidian plate, identity line, MIQA once        (3.2 s)
  3.2  lineup  — five finishes in one strip + price anchor        (4.6 s)
  7.8  f1 lock — butterfly lock, bracelet                          (4.8 s)
 12.6  f2 dial — fluted bezel, stone markers, magnifier            (4.8 s)
 17.4  f3 water— water resistant, wrist                             (4.8 s)
 22.2  promise— 1 yr warranty · colour guarantee · 7 day replace    (4.8 s)
 27.0  collection — five finishes, grid                            (4.6 s)
 31.6  price   — ৳৮৫০ + COD                                        (3.8 s)
 35.4  5%      — seal (verbatim line)                              (7.0 s, VO 6.1)
 42.4  CTA     — obsidian, price, COD, the ask                     (9.0 s, VO 6.4)

Short cut (30 s, same VO lines, trimmed scenes) — CTA VO starts at 15.0 s.

Audio is composed against the locked timeline: 100 BPM (men's line), deep bass
pulse, low pad, piano motif, tick/click; VO-first mix, music ducked −9 dB under
voice, then loudnorm to −14 LUFS in the encode step.
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import lfilter, butter

SR = 48000
FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
BASE = 'miqa/products/2026-11-09_set-g-video'
VO = f'{BASE}/audio/vo3'
OUT = f'{BASE}/work/gv4'

LINES = {
    'reveal': '01_reveal.mp3',
    'lock': '02_lock.mp3',
    'dial': '03_dial.mp3',
    'water': '04_water.mp3',
    'promise': '05_promise.mp3',
    'colours': '06_colours.mp3',
    'price': '07_price.mp3',
    'five': '08_five.mp3',
    'cta': '09_cta.mp3',
}

# ─────────────────────────────────────────────────────────────── timeline
def long_cut(d):
    sc, t = [], 0.0

    def add(**kw):
        nonlocal t
        kw.setdefault('t0', round(t, 3))
        t += kw.pop('dur')
        kw['t1'] = round(t, 3)
        sc.append(kw)

    add(id='lineup', kind='lineup', dur=max(5.4, 0.40 + d['reveal'] + 0.62), plate='p06',
        vo=[('reveal', 0.34)])
    for sid, plate, key, name, dd, tint in [
        ('lock', 'p02', 'lock', 'lock', 4.8, None),
        ('dial', 'p04', 'dial', 'dial', 4.8, 'slate'),
        ('water', 'p01', 'water', 'water', 4.8, 'cool'),
        ('promise', 'p03', 'promise', 'promise', 4.8, None),
    ]:
        crop = (0.03, 0.02, 0.97, 0.99) if sid == 'promise' else (0.05, 0.05, 0.95, 0.98)
        side = 880 if sid == 'promise' else 968
        cy = 780 if sid == 'promise' else 872
        add(id=sid, kind='watch', plate=plate, type=key, prev=True,
            tint=tint, side=side, cy=cy, crop=crop, dur=max(dd, 0.62 + d[name] + 0.62),
            vo=[(name, 0.62)], type_in=0.34)
    add(id='collection', kind='band', dur=max(4.9, 0.36 + d['colours'] + 0.52),
        plate='p06', width=1000, cy=800,
        band_crop=(0.093, 0.05, 0.935, 0.905),
        type='collection', vo=[('colours', 0.40)], type_in=0.55)
    add(id='price', kind='price', dur=max(3.8, 0.34 + d['price'] + 0.42), plate='p05',
        type='price', vo=[('price', 0.40)], type_in=0.30)
    add(id='five', kind='seal', dur=max(5.6, 0.55 + d['five'] + 1.20), plate='p01',
        type='five', vo=[('five', 0.62)], type_in=0.28)
    add(id='cta', kind='cta', dur=max(9.0, 0.30 + d['cta'] + 2.45), plate='p03', tint='cool',
        vo=[('cta', 0.42)])
    return sc, round(t + 0.30, 3)


def short_cut(d):
    sc, t = [], 0.0

    def add(**kw):
        nonlocal t
        kw.setdefault('t0', round(t, 3))
        t += kw.pop('dur')
        kw['t1'] = round(t, 3)
        sc.append(kw)

    add(id='lineup', kind='lineup', dur=max(2.9, 0.26 + d['reveal'] + 0.34), plate='p06',
        vo=[('reveal', 0.28)])
    for sid, plate, key, name in [('lock', 'p02', 'lock', 'lock'), ('dial', 'p04', 'dial', 'dial')]:
        add(id=sid, kind='watch', plate=plate, type=key, prev=True, side=1030, cy=850,
            crop=(0.05, 0.05, 0.95, 0.98), dur=max(2.9, 0.44 + d[name] + 0.30),
            vo=[(name, 0.50)], type_in=0.30)
    add(id='promise', kind='watch', plate='p03', prev=True, tint='slate',
        side=930, cy=800, crop=(0.06, 0.03, 0.94, 0.98), type='promise',
        dur=max(2.8, 0.44 + d['promise'] + 0.34), vo=[('promise', 0.42)], type_in=0.34)
    add(id='price', kind='price', dur=max(2.2, 0.30 + d['price'] + 0.26), plate='p05',
        type='price', vo=[('price', 0.34)], type_in=0.26)
    add(id='five', kind='seal', dur=max(6.6, 0.42 + d['five'] + 0.85), plate='p01',
        type='five', vo=[('five', 0.50)], type_in=0.26)
    add(id='cta', kind='cta_short', dur=max(8.0, 0.28 + d['cta'] + 1.30), plate='p05',
        vo=[('cta', 0.32)])
    return sc, round(t + 0.20, 3)


# ──────────────────────────────────────────────────────────────── helpers
def load_mp3(path):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def trim(x, thr=0.008):
    if not len(x):
        return x
    i = int(np.argmax(np.abs(x) > thr))
    j = len(x) - int(np.argmax(np.abs(x[::-1]) > thr))
    return x[i:j]


def fast_filter(x, fc, hp=False):
    n = len(x)
    nfft = 1 << (n - 1).bit_length()
    X = np.fft.rfft(x, nfft)
    f = np.fft.rfftfreq(nfft, 1 / SR)
    r = f / fc
    mag = (r ** 2 / np.sqrt(1 + r ** 4)) if hp else (1 / np.sqrt(1 + r ** 4))
    return np.fft.irfft(X * mag, nfft)[:n]


def prep_vo(x):
    x = trim(x)
    x = fast_filter(x, 90, hp=True)
    x = x - fast_filter(x, 300)                       # remove rumble / boxiness
    x = np.tanh(x * 1.9) / 1.9                        # gentle compression
    x /= max(1e-6, np.abs(x).max())
    n = int(0.006 * SR)
    x[:n] *= np.linspace(0, 1, n)
    x[-n:] *= np.linspace(1, 0, n)
    return x


def reverb_ir(seconds=2.0, decay=0.5):
    n = int(seconds * SR)
    tt = np.arange(n) / SR
    ir = np.random.default_rng(7).normal(0, 1, n) * np.exp(-tt / decay)
    ir = fast_filter(ir, 4800)
    return ir / np.sqrt((ir ** 2).sum())


def conv(x, ir):
    n = len(x) + len(ir)
    nfft = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[:len(x)]


def piano(freq, dur, amp, rng):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for h in range(1, 9):
        out += (amp / h ** 1.7) * np.sin(2 * np.pi * freq * h * tt + rng.uniform(0, 6.28)) \
            * np.exp(-tt * (0.85 + 0.5 * h))
    out += rng.normal(0, 1, n) * np.exp(-tt * 90) * 0.09 * amp
    return out


def pad(freq, dur, amp, rng):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for det in (-0.004, 0.0, 0.005):
        out += 2 * ((tt * freq * (1 + det)) % 1.0) - 1
    out = fast_filter(out, 880)
    att = np.minimum(1, tt / 1.3)
    rel = np.minimum(1, (dur - tt) / 1.1)
    return out * att * rel * amp / 3


def kick(rng, dur=0.40):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 118 * np.exp(-tt * 26) + 44
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * 7.2) + rng.normal(0, 1, n) * np.exp(-tt * 170) * 0.22


def tick(rng, dur=0.055):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    noise = rng.normal(0, 1, n) * np.exp(-tt * 270)
    ring = (np.sin(2 * np.pi * 6100 * tt) * 0.5 + np.sin(2 * np.pi * 4200 * tt) * 0.4) * np.exp(-tt * 120)
    return noise * 0.5 + ring * 0.5


def whoosh(rng, dur=0.8):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    noise = fast_filter(noise, 2300) - fast_filter(noise, 380)
    return noise * np.sin(np.pi * np.clip(tt / dur, 0, 1)) ** 2


def click(rng, dur=0.05):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return (rng.normal(0, 1, n) * np.exp(-tt * 720)
            + 0.5 * np.sin(2 * np.pi * 3300 * tt) * np.exp(-tt * 200))


def shimmer(rng, dur=1.3):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for f in (2093, 2637, 3136, 3951):
        out += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3.0) * rng.uniform(0.4, 1.0)
    return out * np.minimum(1, tt / 0.02)


def low_boom(rng, dur=1.2):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 70 * np.exp(-tt * 6) + 36
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * 2.4)


# ─────────────────────────────────────────────────────────────────── mix
def build(cut, sc, total, vo, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    N = int(total * SR) + SR
    rng = np.random.default_rng(1109 if cut == 'long' else 1110)
    BPM = 100
    beat = 60.0 / BPM
    bar = beat * 4

    starts = [s['t0'] for s in sc]

    # ---- score: Am – F – C – G, deep bass pulse, piano motif, tick
    chords = [(55.00, 220.00, 261.63, 329.63),
              (43.65, 174.61, 220.00, 261.63),
              (65.41, 261.63, 329.63, 392.00),
              (49.00, 196.00, 246.94, 293.66)]
    music = np.zeros(N)

    def put(buf, sig, at, gain):
        i0 = max(0, int(at * SR))
        n = max(0, min(len(sig), N - i0))
        if n:
            buf[i0:i0 + n] += sig[:n] * gain

    for b in range(int(np.ceil(total / bar)) + 1):
        t0 = b * bar
        if t0 >= total:
            break
        root, *upper = chords[b % 4]
        for k, f in enumerate(upper):
            put(music, pad(f, min(bar * 1.1, total - t0 + 0.6), 0.55, rng), t0, 0.135)
        put(music, fast_filter(pad(root, min(bar, total - t0 + 0.4), 0.9, rng), 130), t0, 0.42)
        for k, f in enumerate((upper[0] * 2, upper[1] * 2, upper[2] * 2)):
            tt = t0 + bar * 0.55 + k * beat * 0.5
            if tt < total:
                put(music, piano(f, 1.7, 0.5, rng), tt, 0.115)
        for bi in range(4):
            tt = t0 + bi * beat
            if tt >= total:
                break
            if bi in (0, 2):
                put(music, kick(rng), tt, 0.24 if bi == 0 else 0.17)
            else:
                put(music, tick(rng), tt, 0.055)

    # ---- VO
    vb = np.zeros(N)
    rows = []
    for s in sc:
        for name, off in s.get('vo', []):
            x = vo.get(name)
            if x is None:
                continue
            t0 = s['t0'] + off
            put(vb, x, t0, 0.92)
            rows.append(dict(id=name, t0=round(t0, 3), dur=round(len(x) / SR, 3),
                             end=round(t0 + len(x) / SR, 3)))
            if t0 + len(x) / SR > s['t1'] + 0.02:
                print(f'  ! VO {name} overruns scene {s["id"]} by '
                      f'{t0 + len(x) / SR - s["t1"]:.2f}s')

    # ---- SFX: one accent per card, never on top of the voice onset
    sfx = np.zeros(N)
    for i, s in enumerate(sc):
        if i:
            put(sfx, whoosh(rng, 0.55), s['t0'] - 0.16, 0.085)
            put(sfx, click(rng), s['t0'] + 0.02, 0.06)
        if s['kind'] == 'title':
            put(sfx, low_boom(rng, 1.4), 0.02, 0.16)
        if s['kind'] == 'lineup':
            put(sfx, low_boom(rng, 1.2), s['t0'] + 0.02, 0.10)
        if s['kind'] == 'seal':
            put(sfx, shimmer(rng, 1.5), s['t0'] + 0.30, 0.055)
        if s['kind'] in ('cta', 'cta_short'):
            put(sfx, low_boom(rng, 1.6), s['t0'] + 0.05, 0.14)
            for k, f in enumerate((220.0, 261.6, 329.6, 440.0)):
                put(sfx, pad(f, 2.9, 0.5, rng), s['t0'] + 0.12, 0.05)

    ir = reverb_ir()
    music = music + conv(music, ir) * 0.20
    sfx = sfx + conv(sfx, ir) * 0.24

    # ---- duck the score under the voice (20 ms attack / 300 ms release)
    env = np.zeros(N)
    for r_ in rows:
        i0, i1 = int(r_['t0'] * SR), min(N, int(r_['end'] * SR))
        env[i0:i1] = 1.0
    foll = np.zeros(N)
    ka, kr = np.exp(-1 / (0.020 * SR)), np.exp(-1 / (0.300 * SR))
    e = 0.0
    for i in range(N):
        v = env[i]
        e = (ka * e + (1 - ka) * v) if v > e else (kr * e + (1 - kr) * v)
        foll[i] = e
    music *= 10 ** ((-9.0 * foll) / 20)

    # ---- fade the top and tail only (never a mid-video fade)
    fi, fo = int(0.35 * SR), int(0.9 * SR)
    arc = np.ones(N)
    arc[:fi] = np.linspace(0, 1, fi)
    arc[-fo:] = np.linspace(1, 0, fo) ** 1.2
    music *= arc

    mix = vb * 1.0 + music * 0.9 + sfx * 0.9
    mix = lfilter(*butter(2, 30 / (SR / 2), 'high'), mix)
    mix = mix[:int(total * SR)]
    pk = np.abs(mix).max() or 1.0
    if pk > 0.97:
        mix *= 0.97 / pk

    for name, sig in (('music', music), ('sfx', sfx), ('mix', mix)):
        wavfile.write(f'{out_dir}/{name}.wav', SR, (np.clip(sig[:int(total * SR)], -1, 1) * 32767).astype(np.int16))

    tl = dict(fps=30, total=total, frames=int(round(total * 30)), bpm=BPM,
              cut=cut, scenes=sc, vo=rows)
    json.dump(tl, open(f'{out_dir}/timeline.json', 'w'), indent=1)
    print(f'[{cut}] {total:.2f}s · {tl["frames"]} frames · {len(sc)} scenes · '
          f'vo {len(rows)} · peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS')
    return tl


def main():
    vo = {}
    for k, f in LINES.items():
        p = f'{VO}/{f}'
        if not os.path.exists(p):
            sys.exit(f'missing VO {p}')
        vo[k] = prep_vo(load_mp3(p))
        print(f'  vo {k:8s} {len(vo[k]) / SR:5.2f}s')

    d = {k: len(v) / SR for k, v in vo.items()}
    sc, total = long_cut(d)
    build('long', sc, total, vo, f'{OUT}/long')
    sc, total = short_cut(d)
    build('short', sc, total, vo, f'{OUT}/short')


if __name__ == '__main__':
    main()
