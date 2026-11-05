#!/usr/bin/env python3
"""Set B "Petal Light": VO prep + timeline + original music/SFX + ducked mix.

Outputs (all under miqa/products/2026-11-05_set-b-video/work/):
  vo/<id>.wav        trimmed, tempo-fitted, peak-normalised VO (48 kHz mono)
  timeline.json      scene boundaries + VO placement (single source of truth)
  music.wav          original score
  sfx.wav            original sound design
  mix_raw.wav        pre-loudnorm mix
  audio_mix.wav      final mix (48 kHz stereo, loudnorm 2-pass applied by caller)
"""
import subprocess, os, json, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

FF = './node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
BASE = 'miqa/products/2026-11-05_set-b-video'
WORK = f'{BASE}/work'
SR = 48000
TEMPO = 1.06
os.makedirs(f'{WORK}/vo', exist_ok=True)

# id, file, pad after speech (s), leading offset of VO inside the scene
# (source, trim_start, trim_len | None)  -- trims are in *raw* (pre-tempo) seconds
# price (10_price.mp3) is generated in a later batch; until it exists we reuse the
# set-A "চারটি রঙের যেকোনো একটা — মাত্র ৫৯৯ টাকা, ক্যাশ অন ডেলিভারি।" take and it is
# swapped in audio_build_v2 once the new clip lands.
CLIPS = [
    ('hook',      '01_hook.mp3',                      None, None, 0.55, 0.34),
    ('black',     '02_black.mp3',                     None, None, 0.80, 0.30),
    ('blue',      '03_blue.mp3',                      None, None, 0.80, 0.30),
    ('white',     '04_white.mp3',                     None, None, 0.80, 0.30),
    ('green',     '05_green.mp3',                     None, None, 0.80, 0.30),
    ('crystal',   '06_crystal.mp3',                   None, None, 0.65, 0.32),
    ('bracelet',  '07_bracelet.mp3',                  None, None, 0.65, 0.32),
    ('guarantee', '08_replace.mp3',                   None, None, 0.80, 0.42),
    ('price',     'price_src.wav',                    None, None, 0.95, 0.38),
    ('five',      '09_five.mp3',                      None, None, 0.72, 0.42),
    ('cta',       'cta_src.wav',                      None, None, 1.30, 0.50),
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


def trim(x, thresh=0.012, pad_in=0.05, pad_out=0.12):
    idx = np.where(np.abs(x) > thresh)[0]
    if not len(idx):
        return x
    a = max(0, idx[0] - int(pad_in * SR))
    b = min(len(x), idx[-1] + int(pad_out * SR))
    return x[a:b]


def prep_vo():
    vo = {}
    for cid, src, tss, tlen, pad, lead in CLIPS:
        raw = f'{WORK}/vo/{cid}_raw.wav'
        if src.endswith('.wav') and os.path.exists(f'{WORK}/vo/{src}'):
            path = f'{WORK}/vo/{src}'
        else:
            path = f'{BASE}/audio/vo/{src}'
        cut = ''
        if tss is not None:
            cut = f'-ss {tss} -t {tlen} '
        sh(f'{FF} -y -v error -i {path} {cut}-ac 1 -ar {SR} '
           f'-af atempo={TEMPO} {raw}')
        x, _ = load(raw)
        x = trim(x)
        p = np.abs(x).max() or 1.0
        x = x / p * 0.92
        # 8 ms fade edges so no clicks when trimmed hard
        n = int(0.008 * SR)
        x[:n] *= np.linspace(0, 1, n)
        x[-n:] *= np.linspace(1, 0, n)
        wavfile.write(f'{WORK}/vo/{cid}.wav', SR, (x * 32767).astype(np.int16))
        vo[cid] = dict(dur=len(x) / SR, pad=pad, lead=lead)
        print(f'VO {cid:10s} {len(x)/SR:6.2f}s')
    return vo


# v3: extra screen time per scene (full-watch framing needs a beat more)
EXTRA = {'hook': 1.00, 'black': 1.45, 'blue': 1.40, 'white': 1.40, 'green': 1.40,
         'crystal': 1.60, 'bracelet': 1.60, 'guarantee': 0.60, 'price': 0.55,
         'five': 0.50, 'cta': 0.30}


def build_timeline(vo):
    scenes, t = [], 0.0
    for cid, _, _a, _b, pad, lead in CLIPS:
        d = vo[cid]['dur'] + pad + EXTRA.get(cid, 0.0)
        d = round(d * 30) / 30
        scenes.append(dict(
            id=cid, t0=round(t, 3), t1=round(t + d, 3), dur=round(d, 3),
            vo_at=round(t + lead, 3), vo_dur=round(vo[cid]['dur'], 3)))
        t += d
    return scenes, round(t, 3)


# ---------------------------------------------------------------- music
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


def harp(m, dur, amp=1.0, rng=None):
    rng = RNG
    n = int(SR * dur)
    tt = np.arange(n) / SR
    f = midi(m)
    sig = (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 1.5)
           + 0.42 * np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt * 2.6)
           + 0.16 * np.sin(2 * np.pi * f * 3 * tt) * np.exp(-tt * 3.8)
           + 0.06 * np.sin(2 * np.pi * f * 4.2 * tt) * np.exp(-tt * 5.0))
    return sig * np.minimum(1, tt / 0.004) * amp


def pad(ms, dur, amp=1.0, rng=None):
    rng = RNG
    n = int(SR * dur)
    tt = np.arange(n) / SR
    sig = np.zeros(n)
    for m in ms:
        for c in (-5, 0, 5):
            f = midi(m) * 2 ** (c / 1200)
            ph = rng.uniform(0, 2 * np.pi)
            sig += (np.sin(2 * np.pi * f * tt + ph)
                    + 0.30 * np.sin(4 * np.pi * f * tt + ph)
                    + 0.10 * np.sin(6 * np.pi * f * tt))
    b, a = butter(2, 1500 / (SR / 2), 'low')
    sig = lfilter(b, a, sig)
    atk = np.minimum(1, tt / 1.1)
    rel = np.clip((dur - tt) / 0.9, 0, 1)
    return sig * atk * rel * amp / (len(ms) * 3)


def bell(m, dur, amp=1.0, rng=None):
    rng = RNG
    n = int(SR * dur)
    tt = np.arange(n) / SR
    f = midi(m)
    sig = (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 1.9)
           + 0.48 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 3.1)
           + 0.26 * np.sin(2 * np.pi * f * 5.4 * tt) * np.exp(-tt * 4.6))
    return sig * np.minimum(1, tt / 0.003) * amp


def felt(m, dur, amp=1.0, rng=None):
    rng = RNG
    n = int(SR * dur)
    tt = np.arange(n) / SR
    f = midi(m)
    sig = np.zeros(n)
    for k, a in [(1, 1.0), (2, 0.30), (3, 0.10), (4, 0.04)]:
        sig += a * np.sin(2 * np.pi * f * k * tt) * np.exp(-tt * (1.2 + 0.5 * k))
    return sig * np.minimum(1, tt / 0.01) * amp


def kick(amp=1.0):
    n = int(SR * 0.26)
    tt = np.arange(n) / SR
    f = 60 * np.exp(-tt * 17) + 40
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 10) * amp


def shimmer(dur, amp=1.0, rng=None):
    """Crystal shimmer: filtered noise + high bell partials."""
    n = int(SR * dur)
    tt = np.arange(n) / SR
    nz = rng.normal(0, 0.25, n)
    b, a = butter(3, [2600 / (SR / 2), 11000 / (SR / 2)], 'band')
    nz = lfilter(b, a, nz)
    env = np.exp(-tt * 6.0) * np.minimum(1, tt / 0.002)
    tone = sum(np.sin(2 * np.pi * midi(m) * tt) * np.exp(-tt * 7) for m in (93, 96, 100))
    return (nz * 0.9 + tone * 0.22) * env * amp


def whoosh(dur, amp=1.0, rng=None):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    nz = rng.normal(0, 0.3, n)
    b, a = butter(2, 2200 / (SR / 2), 'low')
    nz = lfilter(b, a, nz)
    env = np.sin(np.pi * tt / dur) ** 2
    return nz * env * amp


def thump(amp=1.0):
    n = int(SR * 0.5)
    tt = np.arange(n) / SR
    f = 120 * np.exp(-tt * 24) + 52
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7) * amp


def clink(amp=1.0):
    n = int(SR * 0.7)
    tt = np.arange(n) / SR
    sig = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * d)
              for f, a, d in [(2380, 1.0, 9), (3610, 0.6, 11), (5230, 0.35, 14)])
    return sig * amp


# ---------------------------------------------------------------- build
RNG = np.random.default_rng(11)


def main():
    vo = prep_vo()
    scenes, total = build_timeline(vo)
    # keep the score a hair shorter than the picture so the tail fade lands inside
    total = round((total - 0.02) * 30) / 30
    tmap = {s['id']: s for s in scenes}
    N = int(total * SR)
    print(f'\nTOTAL {total:.2f}s  ({int(total*30)} frames @30fps)')

    rng = RNG
    music = np.zeros((N, 2))
    sfx = np.zeros((N, 2))

    BPM = 92
    BAR = 4 * 60 / BPM            # 2.6087 s
    prog = [([57, 61, 64], 45),    # A      (root A2)
            ([54, 57, 61], 42),    # F#m
            ([50, 54, 57], 38),    # D
            ([52, 56, 59], 40)]    # E
    # ---- pads + bass felt for the whole bed, softer under speech-dense scenes
    for i in range(int(total / BAR) + 1):
        t0 = i * BAR
        if t0 >= total:
            break
        ms, root = prog[i % 4]
        add(music, pad(ms, BAR * 1.25, 0.34), t0, 1.0, pan=0.0)
        add(music, felt(root, BAR * 1.0, 0.26), t0, 1.0, pan=0.06)

    # ---- harp arpeggio: light in colourways, opens in features, lifts at price
    e = BAR / 8
    for k in range(int(total / e) + 1):
        t0 = k * e
        if t0 >= total:
            break
        ms, _ = prog[int(t0 / BAR) % 4]
        m = ms[k % 3] + 24
        sec = next((s['id'] for s in scenes if s['t0'] <= t0 < s['t1']), '')
        if sec in ('five',):
            g = 0.0
        elif sec in ('hook', 'price', 'cta'):
            g = 0.19
        elif sec in ('crystal', 'bracelet'):
            g = 0.16
        else:
            g = 0.11
        if g:
            add(music, harp(m, 0.9, g), t0, 1.0, pan=0.3 if k % 2 else -0.3)

    # ---- melody: original 8-bar theme, one phrase per scene group
    mel = [
        (0.60, 76, 1.5, .40), (2.30, 73, 1.3, .34),
        (5.10, 76, 1.2, .38), (6.60, 78, 1.2, .36), (8.10, 76, 1.7, .40),
        (12.0, 73, 1.2, .32), (14.4, 76, 1.0, .30), (16.2, 74, 1.2, .30),
        (21.0, 71, 1.2, .30), (23.4, 74, 1.2, .30), (25.6, 76, 1.5, .32),
    ]
    for t0, m, d, a in mel:
        if t0 + d < total:
            add(music, felt(m, d, a), t0, 1.0, pan=-0.14)

    # ---- bells on section turns
    for sid, mm, pan in [('hook', 88, 0.28), ('black', 84, -0.22), ('crystal', 88, 0.22),
                         ('bracelet', 91, -0.2), ('guarantee', 84, 0.15),
                         ('price', 93, 0.25), ('cta', 86, 0.0)]:
        t0 = tmap[sid]['t0'] + 0.05
        add(music, bell(mm, 3.2, 0.20), t0, 1.0, pan=pan)

    # ---- soft pulse in colourway + feature beds (bars 1 & 3)
    for k in range(int(total / (BAR / 2)) + 1):
        t0 = k * (BAR / 2)
        if t0 >= total:
            break
        sec = next((s['id'] for s in scenes if s['t0'] <= t0 < s['t1']), '')
        if sec in ('black', 'blue', 'white', 'green', 'crystal', 'bracelet') and k % 2 == 0:
            add(music, kick(0.22), t0)

    # ---------------------------------------------------------- SFX
    h = tmap['hook']
    add(sfx, shimmer(2.4, 0.30, rng), 0.10, 1.0, pan=0.15)
    add(sfx, thump(0.35), 0.02, 1.0, pan=0.0)
    for sid in ('black', 'blue', 'white', 'green', 'crystal', 'bracelet',
                'guarantee', 'price', 'cta'):
        add(sfx, whoosh(0.55, 0.16, rng), tmap[sid]['t0'] - 0.30, 1.0,
            pan=rng.uniform(-0.35, 0.35))
    for sid, tt in [('crystal', 0.9), ('crystal', 3.4), ('crystal', 6.1)]:
        add(sfx, shimmer(1.5, 0.26, rng), tmap[sid]['t0'] + tt, 1.0, pan=0.2)
    add(sfx, clink(0.30), tmap['bracelet']['t0'] + 0.9, 1.0, pan=-0.2)
    add(sfx, clink(0.22), tmap['bracelet']['t0'] + 3.8, 1.0, pan=0.25)
    # seal stamp for the 7-day guarantee
    g0 = tmap['guarantee']['t0']
    add(sfx, thump(0.55), g0 + 0.62, 1.0, pan=0.0)
    add(sfx, shimmer(1.1, 0.24, rng), g0 + 0.64, 1.0, pan=0.0)
    # price bell + cta ticks
    add(sfx, bell(96, 3.0, 0.30), tmap['price']['t0'] + 0.55, 1.0, pan=0.1)
    add(sfx, bell(91, 2.4, 0.22), tmap['price']['t0'] + 0.55, 1.0, pan=-0.25)
    for k in range(2):
        add(sfx, clink(0.12), tmap['cta']['t0'] + 2.4 + k * 0.42, 0.5, pan=0.1)

    # ---------------------------------------------------------- ducking
    env = np.zeros(N)
    for cid, s in tmap.items():
        a = int(s['vo_at'] * SR)
        b = min(N, a + int(s['vo_dur'] * SR))
        env[a:b] = 1.0
    # smooth envelope (attack 60 ms, release 260 ms)
    k_atk = int(0.06 * SR)
    k_rel = int(0.26 * SR)
    e2 = env.copy()
    for i in range(1, N):
        if env[i] > e2[i - 1]:
            e2[i] = e2[i - 1] + (1 - e2[i - 1]) / k_atk
        else:
            e2[i] = e2[i - 1] + (0 - e2[i - 1]) / k_rel
    duck = 10 ** (-8.5 * e2 / 20)          # -8.5 dB under VO

    mus = music * duck[:, None]
    # gentle master arc: fade in 0.6 s, tail fade 1.2 s
    arc = np.ones(N)
    fi = int(0.6 * SR)
    fo = int(1.4 * SR)
    arc[:fi] = np.linspace(0, 1, fi)
    arc[-fo:] = np.linspace(1, 0, fo) ** 1.4
    mus *= arc[:, None]

    vo_buf = np.zeros((N, 2))
    for cid, s in tmap.items():
        x, _ = load(f'{WORK}/vo/{cid}.wav')
        i0 = int(s['vo_at'] * SR)
        n = min(len(x), N - i0)
        if n > 0:
            vo_buf[i0:i0 + n, 0] += x[:n]
            vo_buf[i0:i0 + n, 1] += x[:n]

    mix = vo_buf * 1.0 + mus * 0.85 + sfx * 0.55
    peak = np.abs(mix).max()
    if peak > 0.99:
        mix *= 0.99 / peak
    wavfile.write(f'{WORK}/music.wav', SR, (np.clip(mus, -1, 1) * 32767).astype(np.int16))
    wavfile.write(f'{WORK}/sfx.wav', SR, (np.clip(sfx, -1, 1) * 32767).astype(np.int16))
    wavfile.write(f'{WORK}/mix_raw.wav', SR, (np.clip(mix, -1, 1) * 32767).astype(np.int16))

    json.dump(dict(total=total, fps=30, scenes=scenes,
                   audio=dict(music=f'{WORK}/music.wav', sfx=f'{WORK}/sfx.wav')),
              open(f'{WORK}/timeline.json', 'w'), indent=1, ensure_ascii=False)
    print(f'wrote {WORK}/timeline.json  total={total:.2f}s')


if __name__ == '__main__':
    main()
