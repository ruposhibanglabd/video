#!/usr/bin/env python3
"""MIQA Set-A video audio: original music + SFX + VO placement + ducked mix.
48 kHz stereo. All synthesised (copyright-free)."""
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve
from scipy.io import wavfile
import subprocess, os, glob

SR = 48000
DUR = 56.0
N = int(SR * DUR)
BASE = 'miqa/products/2026-11-04_set-a-video/audio'
rng = np.random.default_rng(7)

def midi(m): return 440.0 * 2 ** ((m - 69) / 12)

def tarr(dur):
    n = int(SR * dur)
    return np.arange(n) / SR, n

def add(buf, sig, t0, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    n = min(len(sig), len(buf) - i0)
    if n <= 0: return
    l = gain * (1 - max(0, pan)) ** 0.5
    r = gain * (1 + min(0, pan)) ** 0.5
    buf[i0:i0+n, 0] += sig[:n] * l
    buf[i0:i0+n, 1] += sig[:n] * r

def felt_piano(m, dur, amp=1.0):
    tt, n = tarr(dur)
    f = midi(m)
    sig = np.zeros(n)
    for k, a in [(1, 1.0), (2, 0.32), (3, 0.11), (4, 0.045), (6, 0.015)]:
        sig += a * np.sin(2*np.pi*f*k*(1+0.0004*k*k)*tt) * np.exp(-tt*(1.1+0.42*k))
    hn = int(SR*0.012)
    sig[:hn] += rng.normal(0, 0.12, hn) * np.exp(-np.arange(hn)/(SR*0.0035))
    return sig * np.minimum(1, tt/0.012) * amp

def pad_chord(ms, dur, amp=1.0):
    tt, n = tarr(dur)
    sig = np.zeros(n)
    for m in ms:
        for d in (-6, 0, 6):  # cents detune
            f = midi(m) * 2**(d/1200)
            ph = rng.uniform(0, 2*np.pi)
            saw = np.sin(2*np.pi*f*tt+ph) + 0.35*np.sin(4*np.pi*f*tt+ph) + 0.12*np.sin(6*np.pi*f*tt)
            sig += saw
    b, a = butter(2, 1600/(SR/2), 'low')
    sig = lfilter(b, a, sig)
    atk = np.minimum(1, tt/0.9)
    rel = np.minimum(1, (dur-tt)/0.8)
    return sig * atk * np.clip(rel, 0, 1) * amp / len(ms)

def pluck(m, dur, amp=1.0):
    tt, n = tarr(dur)
    f = midi(m)
    sig = (np.sin(2*np.pi*f*tt) + 0.4*np.sin(4*np.pi*f*tt) + 0.12*np.sin(6*np.pi*f*tt))
    return sig * np.exp(-tt*4.5) * np.minimum(1, tt/0.006) * amp

def bell(m, dur, amp=1.0):
    tt, n = tarr(dur)
    f = midi(m)
    sig = np.sin(2*np.pi*f*tt)*np.exp(-tt*2.2) + 0.5*np.sin(2*np.pi*f*2.76*tt)*np.exp(-tt*3.5) \
        + 0.3*np.sin(2*np.pi*f*5.4*tt)*np.exp(-tt*5.0)
    return sig * np.minimum(1, tt/0.004) * amp

def soft_kick(amp=1.0):
    tt, n = tarr(0.28)
    f = 62*np.exp(-tt*18)+38
    sig = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-tt*9)
    return sig * amp

# ---------------- MUSIC ----------------
music = np.zeros((N, 2), dtype=np.float64)
BAR = 4*60/85  # 2.8235 s
chords = [([57,60,65], 41), ([57,62,65], 38), ([58,62,65], 46), ([55,60,64], 48)]  # F Dm Bb C
melody = [  # (t, midi, dur, amp) hook-reveal-price phrases
    (0.35, 72, 1.6, .5), (2.0, 69, 1.4, .42), (3.5, 65, 1.6, .4),
    (5.35, 72, 1.3, .5), (6.7, 74, 1.3, .48), (8.1, 72, 1.8, .5),
    (10.6, 69, 1.2, .38), (12.2, 72, 1.2, .38), (14.0, 70, 1.2, .36),
    (16.6, 69, 1.2, .38), (18.2, 67, 1.2, .36), (20.0, 65, 1.4, .36),
    (21.8, 72, 1.2, .4), (23.4, 70, 1.2, .38), (25.2, 69, 1.4, .38),
    (27.0, 65, 1.2, .36), (28.6, 67, 1.2, .36), (30.2, 69, 1.4, .38),
    (32.0, 72, 1.3, .42), (33.6, 71, 1.2, .4),
    (36.0, 74, 1.2, .46), (37.3, 72, 1.2, .44), (38.5, 76, 1.4, .48),
    (39.95, 77, 1.5, .55), (41.6, 74, 1.4, .5), (42.9, 72, 1.5, .5),
    (48.0, 72, 1.6, .5), (49.8, 69, 1.6, .46), (51.6, 65, 2.6, .48),
]
for t0, m, d, a in melody:
    add(music, felt_piano(m, d, a), t0, 1.0, pan=-0.12)
    if a >= 0.44:
        add(music, felt_piano(m-12, d, a*0.5), t0, 1.0, pan=0.1)

for bar_i in range(int(DUR/BAR)+1):
    t0 = bar_i * BAR
    if t0 > DUR: break
    ms, root = chords[bar_i % 4]
    add(music, pad_chord(ms, BAR*1.15, 0.30), t0, 1.0, pan=0.0)
    add(music, felt_piano(root, BAR*0.95, 0.34), t0, 1.0, pan=0.05)

# arp (soft pluck eighths) in features & cta sections
eighth = BAR/8
for k in range(int(DUR/eighth)):
    t0 = k*eighth
    if not (10.0 <= t0 < 39.6 or 47.6 <= t0 < 54.5): continue
    ms, _ = chords[int(t0/BAR) % 4]
    m = ms[k % 3] + 12
    add(music, pluck(m, 0.5, 0.16), t0, 1.0, pan=0.25 if k % 2 else -0.25)

# gentle pulse beats 1 & 3 from 10-44
for k in range(int(DUR/(BAR/2))):
    t0 = k*(BAR/2)
    if 10.0 <= t0 < 44.0 and k % 2 == 0:
        add(music, soft_kick(0.30), t0)

for t0, m in [(0.02, 84), (5.2, 81), (39.7, 88), (47.7, 81), (53.5, 84)]:
    add(music, bell(m, 2.6, 0.22), t0, 1.0, pan=0.3)

# master arc envelope
pts_t = [0, 4.8, 5.2, 9.8, 10.2, 35, 35.6, 39.4, 39.9, 43.5, 43.9, 47.4, 47.9, 55, 56]
pts_g = [0.55, 0.62, 0.72, 0.8, 0.85, 0.9, 0.95, 1.0, 1.0, 0.95, 0.62, 0.55, 0.85, 0.8, 0.2]
arc = np.interp(np.arange(N)/SR, pts_t, pts_g)
music *= arc[:, None]

# reverb (synthetic IR)
ir_n = int(SR*1.2)
ir = rng.normal(0, 1, (ir_n, 2)) * np.exp(-np.arange(ir_n)[:, None]/(SR*0.32))
for ch in range(2):
    wet = fftconvolve(music[:, ch], ir[:, ch])[:N]
    music[:, ch] = 0.82*music[:, ch] + 0.18*wet
music = music / (np.abs(music).max() + 1e-9) * 0.62

# ---------------- SFX ----------------
sfx = np.zeros((N, 2), dtype=np.float64)
def whoosh(dur=0.65, amp=0.5):
    tt, n = tarr(dur)
    nz = rng.normal(0, 1, n)
    b, a = butter(2, [500/(SR/2), 4500/(SR/2)], 'band')
    nz = lfilter(b, a, nz)
    env = np.sin(np.pi*np.clip(tt/dur, 0, 1))**1.6
    return nz*env*amp
def shimmer(amp=0.4):
    out = np.zeros(int(SR*1.2))
    for m in (84, 88, 91):
        s = bell(m, 1.2, amp*0.5)
        out[:len(s)] += s
    return out
def click(amp=0.6):
    tt, n = tarr(0.09)
    nz = rng.normal(0, 1, n) * np.exp(-tt*160)
    ring = np.sin(2*np.pi*3200*tt)*np.exp(-tt*70)*0.6 + np.sin(2*np.pi*5400*tt)*np.exp(-tt*90)*0.35
    return (nz*0.7+ring)*amp
def droplet(amp=0.5):
    tt, n = tarr(0.16)
    f = 1300*np.exp(-tt*14)+520
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*13)*amp
def impact(amp=0.8):
    tt, n = tarr(0.5)
    f = 95*np.exp(-tt*10)+42
    sig = np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*6)
    nz = rng.normal(0, 1, n)*np.exp(-tt*22)*0.35
    return (sig+nz)*amp
def tick(amp=0.35):
    tt, n = tarr(0.05)
    return np.sin(2*np.pi*2100*tt)*np.exp(-tt*90)*amp

add(sfx, impact(0.85), 0.06, pan=0.0)
for t0 in [4.8, 9.85, 15.85, 21.05, 26.25, 31.45, 35.6, 39.45, 43.45, 47.45]:
    add(sfx, whoosh(0.6, 0.42), t0-0.25, pan=0.1)
for t0 in [5.45, 21.7, 39.9, 47.9]:
    add(sfx, shimmer(0.34), t0, pan=0.2)
for t0 in [11.45, 12.6]:
    add(sfx, click(0.5), t0, pan=-0.15)
for t0 in [16.9, 17.6, 18.3]:
    add(sfx, droplet(0.42), t0, pan=0.2)
for t0 in [32.35, 32.75]:
    add(sfx, tick(0.3), t0, pan=-0.2)
sfx = sfx / (np.abs(sfx).max()+1e-9) * 0.32

# ---------------- VO placement ----------------
vo = np.zeros((N, 2), dtype=np.float64)
FF = 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
slots = [('01_hook', 0.35), ('02_reveal', 5.35), ('03_lock', 10.35), ('04_water', 16.35),
         ('05_color', 21.55), ('06_replace', 26.75), ('07_warranty', 31.95),
         ('08_price', 39.95), ('09_cta', 43.95)]
os.makedirs('/tmp/vowav', exist_ok=True)
durs = {}
for name, t0 in slots:
    src = f'{BASE}/vo/{name}.mp3'
    dst = f'/tmp/vowav/{name}.wav'
    subprocess.run([FF, '-y', '-v', 'error', '-i', src, '-ar', '48000', '-ac', '1', dst], check=True)
    sr, d = wavfile.read(dst)
    d = d.astype(np.float64)/32768.0
    durs[name] = len(d)/sr
    # HPF 80 Hz
    b, a = butter(2, 80/(sr/2), 'high')
    d = lfilter(b, a, d)
    # presence +2 dB @ 3.5 kHz (band add)
    bb, aa = butter(2, [2800/(sr/2), 4400/(sr/2)], 'band')
    d = d + 0.26*lfilter(bb, aa, d)
    # soft compression 3:1 @ -18 dB
    env = np.abs(d)
    b2, a2 = butter(1, 12/(sr/2), 'low')
    env = lfilter(b2, a2, env)
    thr = 10**(-18/20)
    gain = np.ones_like(env)
    over = env > thr
    gain[over] = (thr + (env[over]-thr)/3) / env[over]
    d = d*gain
    peak = np.abs(d).max()
    if peak > 0: d = d/peak*0.72
    add(vo, d, t0, pan=0.0)
print('VO durations:', {k: round(v, 3) for k, v in durs.items()})
print('VO last ends at:', round(43.95 + durs['09_cta'], 2))

# duck music under VO (8-10 dB), release 300 ms
env = np.abs(vo).max(axis=1)
b3, a3 = butter(1, 3.2/(SR/2), 'low')
env = lfilter(b3, a3, env)
env = env/(env.max()+1e-9)
duck = 1.0 - 0.66*env  # up to ~ -6.6 dB... push to 8-10:
duck = 10**((-1.2 - 8.6*env)/20)
mix = music*duck[:, None] + vo*1.0 + sfx*0.9
mix = mix/(np.abs(mix).max()+1e-9)*0.89

wavfile.write(f'{BASE}/music.wav', SR, (np.clip(music, -1, 1)*32767).astype(np.int16))
wavfile.write(f'{BASE}/sfx.wav', SR, (np.clip(sfx, -1, 1)*32767).astype(np.int16))
wavfile.write(f'{BASE}/mix.wav', SR, (np.clip(mix, -1, 1)*32767).astype(np.int16))
print('audio written: music.wav sfx.wav mix.wav  total', round(N/SR, 2), 's')
