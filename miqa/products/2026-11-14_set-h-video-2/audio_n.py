#!/usr/bin/env python3
"""Set H video 2 (2026-11-14) — original score + SFX + VO mix (48 kHz stereo WAV).

Everything is synthesised here in numpy (DECISIONS D13: no licensed music, no samples).
The timeline is imported from render_n.py so picture and sound can never drift apart.

Score: 86 BPM, E minor — Em · C · G · D — warm pad, round sub pulse, a muted pluck arpeggio and a soft rim tick.
Mix: VO first; the score ducks 10 dB under the voice (20 ms attack / 300 ms release);
SFX peak ≤ −10 dBFS and never sit on a VO word onset. master() then brings the programme
to −14 LUFS with a look-ahead limiter (true peak ≤ −1 dBTP), measured with ffmpeg ebur128.

  python3 audio_n.py        →  work/audio/master.wav (−14 LUFS) + stems {vo,music,sfx,mix}.wav + vo_times.json
"""
import json, os, subprocess, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, sosfilt

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)
ROOT = os.path.abspath(f'{BASE}/../../..')
FF = f'{ROOT}/node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
SR = 48000
OUT = f'{BASE}/work/audio'


def load(path):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def trim(x, db=-42.0, win=960, hop=480, pad=0.03):
    e = np.array([np.sqrt(np.mean(x[i:i + win] ** 2) + 1e-12) for i in range(0, len(x) - win, hop)])
    on = np.where(20 * np.log10(e) > db)[0]
    i0 = max(0, on[0] * hop - int(pad * SR))
    i1 = min(len(x), on[-1] * hop + win + int(pad * 2 * SR))
    return x[i0:i1]


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc / (SR / 2), 'low', output='sos'), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc / (SR / 2), 'high', output='sos'), x)


def peak_eq(x, f0, gain_db, q=1.0):
    A = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f0 / SR
    al = np.sin(w0) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w0), 1 - al * A]
    a = [1 + al / A, -2 * np.cos(w0), 1 - al / A]
    return lfilter(np.array(b) / a[0], np.array(a) / a[0], x)


def compress(x, thr_db=-20.0, ratio=3.0, att=0.006, rel=0.12):
    env = np.abs(x)
    ka, kr = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    out = np.empty_like(env)
    e = 0.0
    for i, v in enumerate(env):
        e = ka * e + (1 - ka) * v if v > e else kr * e + (1 - kr) * v
        out[i] = e
    db = 20 * np.log10(out + 1e-9)
    gr = np.where(db > thr_db, (thr_db + (db - thr_db) / ratio) - db, 0.0)
    return x * 10 ** (gr / 20)


def prep_vo(x):
    """tokens: HPF 80 Hz, +2 dB presence at 3.5 kHz, 3:1 compression — the voice stays natural"""
    x = trim(x)
    x = hp(x, 80)
    x = peak_eq(x, 3500, 2.0, 0.9)
    x = peak_eq(x, 260, -1.5, 1.0)
    x = x / max(1e-6, np.sqrt(np.mean(x ** 2))) * 10 ** (-20 / 20)       # every line at the same level
    x = compress(x)
    n = int(0.008 * SR)
    x[:n] *= np.linspace(0, 1, n)
    x[-n:] *= np.linspace(1, 0, n)
    return x


# ── instruments ───────────────────────────────────────────────────────────────
def pad(freq, dur, rng):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for det in (-0.0035, 0.0, 0.0045):
        out += 2 * ((tt * freq * (1 + det) + rng.uniform()) % 1.0) - 1
    out = lp(out, 760)
    return out * np.minimum(1, tt / 1.2) * np.clip((dur - tt) / 1.0, 0, 1) / 3


def sub(freq, dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * tt) + 0.25 * np.sin(4 * np.pi * freq * tt)) * np.minimum(1, tt / 0.012) * np.exp(-tt * 3.2)


def pluck(freq, dur, rng):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for h in range(1, 7):
        out += np.sin(2 * np.pi * freq * h * tt + rng.uniform(0, 6.28)) * np.exp(-tt * (5.0 + 2.6 * h)) / h ** 1.4
    return out * np.minimum(1, tt / 0.004)


def kick(rng, dur=0.42):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 105 * np.exp(-tt * 24) + 42
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7.5) + rng.normal(0, 1, n) * np.exp(-tt * 190) * 0.15


def rim(rng, dur=0.06):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return rng.normal(0, 1, n) * np.exp(-tt * 260) * 0.5 + np.sin(2 * np.pi * 5200 * tt) * np.exp(-tt * 130) * 0.5


def whoosh(rng, dur=0.6):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = rng.normal(0, 1, n)
    x = lp(x, 2200) - lp(x, 360)
    return x * np.sin(np.pi * np.clip(tt / dur, 0, 1)) ** 2


def click(rng, dur=0.07):      # clasp
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return rng.normal(0, 1, n) * np.exp(-tt * 620) + 0.6 * np.sin(2 * np.pi * 2900 * tt) * np.exp(-tt * 170)


def tick(rng, dur=0.05):       # movement
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return rng.normal(0, 1, n) * np.exp(-tt * 420) * 0.5 + np.sin(2 * np.pi * 6100 * tt) * np.exp(-tt * 150) * 0.5


def drop(rng, dur=0.32):       # water drop
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 620 + 1500 * np.exp(-tt * 22)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 15) * np.minimum(1, tt / 0.004)


def shimmer(rng, dur=1.4):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for f in (2349.3, 2793.8, 3520.0, 4698.6):       # D–F–A–D
        out += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3.0) * rng.uniform(0.4, 1.0)
    return out * np.minimum(1, tt / 0.02)


def tap(rng, dur=0.22):        # soft mallet on each colour
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 880 * tt) + 0.4 * np.sin(2 * np.pi * 1760 * tt)) * np.exp(-tt * 22) * np.minimum(1, tt / 0.003)


def boom(rng, dur=1.3):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 68 * np.exp(-tt * 6) + 36
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.5)


def reverb_ir(seconds=1.8, decay=0.45, seed=7):
    n = int(seconds * SR)
    tt = np.arange(n) / SR
    ir = np.random.default_rng(seed).normal(0, 1, n) * np.exp(-tt / decay)
    ir = lp(ir, 4600)
    return ir / np.sqrt((ir ** 2).sum())


def conv(x, ir):
    n = len(x) + len(ir)
    nfft = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[:len(x)]


def limiter(L, R, ceil_db=-1.6, look=0.005, rel=0.090):
    """look-ahead peak limiter (stereo-linked) — keeps true peak under −1 dBTP after AAC"""
    ceil = 10 ** (ceil_db / 20)
    pk = np.maximum(np.abs(L), np.abs(R))
    n = int(look * SR)
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
    pk = maximum_filter1d(pk, 2 * n + 1)
    g = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
    kr = np.exp(-1 / (rel * SR))
    out = np.empty_like(g)
    e = 1.0
    for i, v in enumerate(g):
        e = v if v < e else kr * e + (1 - kr) * v
        out[i] = e
    out = np.minimum(uniform_filter1d(out, n), out)
    return L * out, R * out


def measure(path):
    r = subprocess.run([FF, '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    tail = r[r.rindex('Summary:'):]
    I = float(tail.split('I:')[1].split('LUFS')[0])
    TP = float(tail.split('Peak:')[1].split('dBFS')[0])
    LRA = float(tail.split('LRA:')[1].split('LU')[0])
    return I, TP, LRA


def master(L, R, target=-14.0):
    """gain → limiter → measure (EBU R128), repeated until the programme sits at −14 LUFS"""
    w16 = lambda x: (np.clip(x, -1, 1) * 32767).astype(np.int16)
    gain = 1.0
    for _ in range(4):
        l, r = limiter(L * gain, R * gain)
        wavfile.write(f'{OUT}/master.wav', SR, np.stack([w16(l), w16(r)], axis=1))
        I, TP, LRA = measure(f'{OUT}/master.wav')
        if abs(I - target) < 0.1:
            break
        gain *= 10 ** ((target - I) / 20)
    print(f'master.wav: {I:.1f} LUFS · true peak {TP:.1f} dBTP · LRA {LRA:.1f} LU')


def main():
    from render_n import timeline
    tl = timeline()
    D = tl['D']
    N = int(D * SR)
    NB = N + 3 * SR
    rng = np.random.default_rng(1111)
    os.makedirs(OUT, exist_ok=True)

    def put(buf, sig, at, gain):
        i0 = max(0, int(at * SR))
        n = max(0, min(len(sig), len(buf) - i0))
        if n:
            buf[i0:i0 + n] += sig[:n] * gain

    # ── VO
    vb = np.zeros(NB)
    rows = []
    for name, t0 in tl['vo']:
        x = prep_vo(load(f'{BASE}/audio/vo/{name}.mp3'))
        t0 = t0 - 0.03                          # trim() keeps 30 ms of pre-roll
        put(vb, x, t0, 1.0)
        rows.append(dict(id=name, t0=round(t0 + 0.03, 3), end=round(t0 + len(x) / SR - 0.06, 3)))
    for a, b in zip(rows[:-1], rows[1:]):
        assert b['t0'] - a['end'] > 0.15, (a, b)
    assert rows[-1]['end'] < D - 0.6

    # ── score: 86 BPM, Em · C · G · D (a new bed for this film — Set H v2 used 92 BPM D minor)
    BPM = 86
    beat = 60.0 / BPM
    bar = 4 * beat
    chords = [(41.20, (164.81, 196.00, 246.94)),      # Em
              (32.70, (130.81, 164.81, 196.00)),      # C
              (49.00, (146.83, 196.00, 246.94)),      # G
              (36.71, (146.83, 185.00, 220.00))]      # D
    mL, mR = np.zeros(NB), np.zeros(NB)
    drums = np.zeros(NB)
    b = 0
    while b * bar < D:
        t0 = b * bar
        root, up = chords[b % 4]
        full = t0 > 3.6 and t0 < 25.0              # rhythm section rests on the hook's first bars and under the CTA
        for k, f in enumerate(up):
            p = pad(f, bar * 1.12, rng)
            put(mL, p, t0, 0.15 * (1.0 if k != 2 else 0.6))
            put(mR, p, t0, 0.15 * (1.0 if k != 0 else 0.6))
        put(drums, lp(pad(root * 2, bar, rng), 140), t0, 0.5)
        arp = [up[0] * 2, up[1] * 2, up[2] * 2, up[1] * 2, up[0] * 4, up[1] * 2, up[2] * 2, up[1] * 2]
        for k, f in enumerate(arp):
            tt = t0 + k * beat / 2
            if tt >= D - 0.3:
                break
            g = (0.085 if full else 0.05) * (1.0 if k % 2 == 0 else 0.72)
            pl = pluck(f, 0.9, rng)
            put(mL, pl, tt, g * (1.0 if k % 2 == 0 else 0.55))
            put(mR, pl, tt, g * (0.55 if k % 2 == 0 else 1.0))
        for bi in range(4):
            tt = t0 + bi * beat
            if tt >= D - 0.4:
                break
            if bi in (0, 2):
                put(drums, sub(root * 2, 0.5), tt, 0.30 if bi == 0 else 0.20)
                if full:
                    put(drums, kick(rng), tt, 0.20 if bi == 0 else 0.13)
            elif full:
                put(drums, rim(rng), tt, 0.05)
        b += 1
    ir = reverb_ir()
    irR = reverb_ir(seed=8)
    mL = mL + conv(mL, ir) * 0.22 + drums
    mR = mR + conv(mR, irR) * 0.22 + drums

    # ── SFX
    sx = np.zeros(NB)
    vo_on = [r['t0'] for r in rows]

    def clear(t, w=0.12):         # never on a VO line's first syllable
        return all(abs(t - v) > w for v in vo_on)

    c = tl['sfx']
    for t in c['whoosh']:
        put(sx, whoosh(rng), t - 0.30, 0.085)
    for t in c['click']:
        put(sx, click(rng), t, 0.11)
    for t in c['tick']:
        put(sx, tick(rng), t, 0.05)
    for t in c['drop']:
        put(sx, drop(rng), t if clear(t) else t - 0.15, 0.09)
    for t in c['shimmer']:
        put(sx, shimmer(rng), t, 0.045)
    for t in c['tap']:
        put(sx, tap(rng), t - 0.10 if not clear(t) else t, 0.06)
    for t in c['boom']:
        put(sx, boom(rng), t + 0.02, 0.15)
    sx = sx + conv(sx, ir) * 0.22
    pk = np.abs(sx).max()
    lim = 10 ** (-10 / 20)
    if pk > lim:
        sx *= lim / pk

    # ── duck the score under the voice
    gate = np.zeros(NB)
    for r in rows:
        gate[int(r['t0'] * SR):int(r['end'] * SR)] = 1.0
    ka, kr = np.exp(-1 / (0.020 * SR)), np.exp(-1 / (0.300 * SR))
    foll = np.empty(NB)
    e = 0.0
    for i in range(NB):
        v = gate[i]
        e = ka * e + (1 - ka) * v if v > e else kr * e + (1 - kr) * v
        foll[i] = e
    duck = 10 ** (-10.0 * foll / 20)
    arc = np.ones(NB)
    fi, fo = int(0.25 * SR), int(1.1 * SR)
    arc[:fi] = np.linspace(0, 1, fi)
    arc[N - fo:N] = np.linspace(1, 0, fo) ** 1.3
    arc[N:] = 0
    MUS = 0.58
    mL, mR = mL * duck * arc * MUS, mR * duck * arc * MUS
    sx *= arc

    L = hp(vb + mL + sx, 30)[:N]
    R = hp(vb + mR + sx, 30)[:N]
    pk = max(np.abs(L).max(), np.abs(R).max())
    if pk > 0.89:
        L, R = L * 0.89 / pk, R * 0.89 / pk

    def rms_db(x, m=None):
        x = x[m] if m is not None else x
        return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)

    m_vo = gate[:N] > 0.5
    mus_mono = (mL + mR)[:N] / 2
    print(f'duration {D:.2f}s  peak {20 * np.log10(pk):.1f} dBFS (pre-normalise)')
    print(f'VO rms (while speaking) {rms_db(vb[:N], m_vo):.1f} dB · music under VO {rms_db(mus_mono, m_vo):.1f} dB '
          f'→ VO is {rms_db(vb[:N], m_vo) - rms_db(mus_mono, m_vo):.1f} dB above · music between lines {rms_db(mus_mono, ~m_vo):.1f} dB')
    print(f'SFX peak {20 * np.log10(np.abs(sx).max() + 1e-9):.1f} dBFS')
    master(L, R)
    w16 = lambda x: (np.clip(x, -1, 1) * 32767).astype(np.int16)
    wavfile.write(f'{OUT}/mix.wav', SR, np.stack([w16(L), w16(R)], axis=1))
    wavfile.write(f'{OUT}/vo.wav', SR, w16(vb[:N]))
    wavfile.write(f'{OUT}/music.wav', SR, np.stack([w16(mL[:N]), w16(mR[:N])], axis=1))
    wavfile.write(f'{OUT}/sfx.wav', SR, w16(sx[:N]))
    json.dump(dict(duration=D, bpm=BPM, vo=rows), open(f'{OUT}/vo_times.json', 'w'), indent=1)
    for r in rows:
        print(f"  {r['id']:16s} {r['t0']:6.2f} → {r['end']:6.2f}")


if __name__ == '__main__':
    main()
