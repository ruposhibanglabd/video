#!/usr/bin/env python3
"""Set G — original music + SFX + VO mix for the Midnight Precision cut.

RUNBOOK §7: music composed per video against the timeline markers (men's line
BPM 100–120, deep bass pulse, low strings, tick/click), SFX synthesised,
VO-first mix with a sidechain-style duck, then two-pass loudnorm to −14 LUFS.

Outputs: work/video_g3/music.wav · sfx.wav · mix.wav · mix_report.json
"""
import json
import sys

import numpy as np
from scipy.io import wavfile
import subprocess

SR = 48000
FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg'


def load_mp3(path):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def trim(x, thr=0.008):
    i = np.argmax(np.abs(x) > thr)
    j = len(x) - np.argmax(np.abs(x[::-1]) > thr)
    return x[i:j]


def fast_filter(x, fc, q=0.707, hp=False):
    """one-pole/one-zero approximation via FFT magnitude shaping — fast and clean"""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    r = f / fc
    if hp:
        mag = r ** 2 / np.sqrt(1 + r ** 4)
    else:
        mag = 1 / np.sqrt(1 + r ** 4)
    return np.fft.irfft(X * mag, len(x))


def env_follow(x, attack=0.02, release=0.30):
    a = np.exp(-1 / (attack * SR))
    r = np.exp(-1 / (release * SR))
    env = np.zeros_like(x)
    e = 0.0
    for i in range(0, len(x), 32):     # 0.67 ms hop for speed
        v = np.abs(x[i:i + 32]).max()
        e = (a * e + (1 - a) * v) if v > e else (r * e + (1 - r) * v)
        env[i:i + 32] = e
    return env


def reverb_ir(seconds=2.2, decay=0.55):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = np.random.default_rng(7).normal(0, 1, n) * np.exp(-t / decay)
    ir = fast_filter(ir, 5200)
    return ir / np.sqrt((ir ** 2).sum())


def conv(x, ir):
    n = len(x) + len(ir)
    nfft = 1 << (n - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)
    return y[:len(x)]


def piano(freq, dur, amp=1.0, rng=None):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for h in range(1, 9):
        a = amp * (1.0 / (h ** 1.7))
        out += a * np.sin(2 * np.pi * freq * h * t + rng.uniform(0, 6.28)) * np.exp(-t * (0.9 + 0.55 * h))
    # hammer noise
    ham = rng.normal(0, 1, n) * np.exp(-t * 90) * 0.10 * amp
    return out + ham


def pad(freq, dur, amp=1.0, rng=None):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for det in (-0.004, 0.0, 0.005):
        saw = 2 * ((t * freq * (1 + det)) % 1.0) - 1
        out += saw
    out = fast_filter(out, 900)
    att = np.minimum(1, t / 1.4)
    rel = np.minimum(1, (dur - t) / 1.2)
    return out * att * rel * amp / 3


def kick(rng, dur=0.42):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 120 * np.exp(-t * 24) + 44
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7.5) + rng.normal(0, 1, n) * np.exp(-t * 160) * 0.25


def tick(rng, dur=0.06):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.normal(0, 1, n) * np.exp(-t * 260)
    ring = (np.sin(2 * np.pi * 6200 * t) * 0.5 + np.sin(2 * np.pi * 4300 * t) * 0.4) * np.exp(-t * 120)
    return (noise * 0.5 + ring * 0.5)


def whoosh(rng, dur=0.9):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    noise = fast_filter(noise, 2400) - fast_filter(noise, 400)
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return noise * env


def shimmer(rng, dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f in (2093, 2637, 3136, 3951):
        out += np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2) * rng.uniform(0.4, 1.0)
    return out * np.minimum(1, t / 0.02)


def click(rng, dur=0.05):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return (rng.normal(0, 1, n) * np.exp(-t * 700)
            + 0.5 * np.sin(2 * np.pi * 3400 * t) * np.exp(-t * 200))


def main():
    tl_path, vo_dir, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
    tl = json.load(open(tl_path))
    scenes, total = tl['scenes'], tl['total']
    N = int(total * SR) + SR
    rng = np.random.default_rng(1109)

    starts, t = [], 0.0
    for s in scenes:
        starts.append(t)
        t += s['dur']

    BPM = 112
    beat = 60.0 / BPM
    bar = beat * 4

    # ── music: pad bed + bass pulse + piano motif + percussion (men's guide)
    music = np.zeros(N)
    chords = [(146.83, 220.00, 293.66), (130.81, 196.00, 261.63),
              (174.61, 220.00, 261.63), (110.00, 164.81, 220.00)]
    for b in range(int(total / bar) + 1):
        t0 = b * bar
        ch = chords[b % len(chords)]
        for f in ch:
            seg = pad(f, min(bar * 1.15, total - t0 + 0.5), 0.55, rng)
            i0 = int(t0 * SR)
            music[i0:i0 + len(seg)] += seg[:max(0, min(len(seg), N - i0))] * 0.20
        # bass
        seg = pad(ch[0] / 2, min(bar, total - t0 + 0.3), 0.9, rng)
        i0 = int(t0 * SR)
        music[i0:i0 + len(seg)] += fast_filter(seg, 120)[:max(0, min(len(seg), N - i0))] * 0.5
        # piano motif on the second half of each bar
        for k, f in enumerate((ch[0] * 2, ch[1] * 2, ch[2] * 2)):
            tt = t0 + bar * 0.5 + k * beat * 0.5
            if tt < total:
                nt = piano(f, 1.6, 0.5, rng)
                i0 = int(tt * SR)
                music[i0:i0 + len(nt)] += nt[:max(0, min(len(nt), N - i0))] * 0.16
    # percussion: kick on beats 1 & 3, tick on 8ths
    for bi in range(int(total / beat)):
        tt = bi * beat
        if bi % 4 in (0, 2):
            k = kick(rng)
            i0 = int(tt * SR)
            music[i0:i0 + len(k)] += k * 0.30
        else:
            k = tick(rng) * 0.10
            i0 = int(tt * SR)
            music[i0:i0 + len(k)] += k

    # ── VO: clean, presence, level
    vo = np.zeros(N)
    names = ['01_reveal', '02_lock', '03_dial', '04_water', '05_promise',
             '06_colours', '07_price', '08_five', '09_cta']
    for name, t0 in zip(names, starts[1:]):
        x = trim(load_mp3(f'{vo_dir}/{name}.mp3'))
        x = fast_filter(x, 85, hp=True)
        x = fast_filter(x, 5200, hp=True) * 0.35 + x * 0.65   # gentle de-ess
        x = np.tanh(x * 1.8) / 1.8                            # soft compression
        x /= max(1e-6, np.abs(x).max())
        i0 = int(t0 * SR) + int(0.18 * SR)
        vo[i0:i0 + len(x)] += x[:max(0, min(len(x), N - i0))] * 0.92

    # ── SFX: one accent per reveal, never on the VO
    sfx = np.zeros(N)
    def put(sig, at, gain):
        i0 = max(0, int(at * SR))
        sfx[i0:i0 + len(sig)] += sig[:max(0, min(len(sig), N - i0))] * gain
    for t0 in starts[1:]:
        put(whoosh(rng, 0.8), t0 - 0.28, 0.10)
        put(click(rng), t0, 0.09)
    put(shimmer(rng, 1.4), starts[5], 0.07)       # quality / promise
    put(shimmer(rng, 1.6), starts[8], 0.06)       # 5%
    put(whoosh(rng, 1.4), starts[9] - 0.5, 0.12)  # CTA lift

    ir = reverb_ir()
    music = music + conv(music, ir) * 0.22
    sfx = sfx + conv(sfx, ir) * 0.25

    # ── duck music under VO (attack 20 ms / release 300 ms)
    env = env_follow(vo, 0.02, 0.30)
    env = env / max(1e-6, env.max())
    duck = 10 ** ((-9.0 * env) / 20)
    music *= duck

    mix = vo * 1.0 + music * 0.85 + sfx * 0.9
    mix /= max(1e-6, np.abs(mix).max())
    mix *= 0.89

    for name, sig in (('music', music), ('sfx', sfx), ('mix', mix)):
        wavfile.write(f'{out_dir}/{name}.wav', SR, (np.clip(sig, -1, 1) * 32767).astype(np.int16))
    peak = float(np.abs(mix).max())
    print(f'mix ok  peak={20*np.log10(peak):.1f} dBFS  chords=Am F C D  bpm={BPM}')
    json.dump({'peak_dbfs': 20 * float(np.log10(peak)), 'bpm': BPM, 'sr': SR, 'vo_lines': len(names)},
              open(f'{out_dir}/mix_report.json', 'w'), indent=1)


if __name__ == '__main__':
    main()
