"""Buyer-focused regression checks after export.mjs and qa.mjs (no speech generation)."""
from pathlib import Path
import json, subprocess, hashlib, wave, zipfile
import numpy as np
from scipy.signal import resample_poly
from math import gcd
from PIL import Image, ImageDraw

BASE = Path('media/seiko-vip-video-2026')
SCRATCH = Path('.tmp/seiko-vip')
QA = BASE / 'qa'
QA.mkdir(exist_ok=True)
FF = subprocess.check_output(['node', '--input-type=module', '-e',
    "import ff from '@ffmpeg-installer/ffmpeg';console.log(ff.path)"], text=True).strip()
BASELINE = 'e845f03473bbb9573e2f069a7c49e59a193b4406'
prior = json.loads(subprocess.check_output(['git', 'show', f'{BASELINE}:{BASE}/assets-manifest.json']))
prior_wavs = {Path(x['file']).name: x['sha256'] for x in prior if x['file'].endswith('.wav')}
assert len(prior_wavs) == 10
for name, digest in prior_wavs.items():
    assert hashlib.sha256((SCRATCH / 'audio' / name).read_bytes()).hexdigest() == digest, name

scenes = json.loads((BASE / 'storyboard.json').read_text())
cues = json.loads((BASE / 'narration.json').read_text())
assert len(scenes) == 16 and len(cues) == 10
assert scenes[0]['start'] == 0 and scenes[-1]['end'] == 52
assert all(a['end'] == b['start'] for a, b in zip(scenes, scenes[1:]))
assert sum(round((x['end'] - x['start']) * 30) for x in scenes) == 1560
bounds = [(0,7.4),(7.4,11.5),(11.5,15.8),(15.8,18.1),(18.1,20.9),
          (20.9,24),(24,34),(34,39),(39,46.5),(46.5,52)]
for cue, (start, end) in zip(cues, bounds):
    assert start <= cue['start'] < cue['end'] <= end
assert all(a['end'] <= b['start'] for a, b in zip(cues, cues[1:]))

# Compare each final decoded cue to its actual approved spoken source, not just cue metadata.
source_voice = {}
for cue in cues:
    with wave.open(str(SCRATCH / 'audio' / f"vo-{cue['clip']}.wav")) as w:
        rate = w.getframerate()
        samples = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, w.getnchannels()).mean(axis=1) / 32768
    active = np.flatnonzero(abs(samples) > .012)
    lo = max(0, int(active[0] - .055 * rate))
    hi = min(len(samples), int(active[-1] + .09 * rate))
    g = gcd(rate, 48000)
    source_voice[cue['clip']] = resample_poly(samples[lo:hi], 48000 // g, rate // g)

result = {'baselineCommit': BASELINE, 'approvedWavSourcesUnchanged': 10,
          'sceneCount': 16, 'frames': 1560, 'durationSeconds': 52, 'cues': []}
for name in ['MIQA-SEIKO-VIP-4K', 'MIQA-SEIKO-VIP-Facebook-1080p']:
    file = Path('downloads', name + '.mp4')
    raw = subprocess.check_output([FF, '-v', 'error', '-i', str(file), '-vn', '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'])
    decoded = np.frombuffer(raw, np.float32)
    for cue in cues:
        src = source_voice[cue['clip']]
        k = int(cue['start'] * 48000)
        actual = decoded[k:k + len(src)]
        assert len(actual) == len(src)
        corr = float(np.corrcoef(src, actual)[0,1])
        assert corr > .95, (name, cue['clip'], corr)
        result['cues'].append({'file': str(file), 'clip': cue['clip'],
                              'start': cue['start'], 'end': cue['end'],
                              'correlationWithApprovedSpokenSource': corr})
    for suffix in ['-probe.json', '-decode-audio.log']:
        source = SCRATCH / 'qa' / (name + suffix)
        dest = QA / (name + suffix.replace('.log', '.txt'))
        dest.write_text('\n'.join(line.rstrip() for line in source.read_text().splitlines()) + '\n')

# The previous opening-fix packet-hash report pertains to a different picture edit.
# Retain it as history, but write a clearly current complete ten-cue check here.
(QA / 'customer-audio-check.json').write_text(json.dumps(result, indent=2) + '\n')

# Final output frames, not unencoded preflight stills.
frames = sorted((SCRATCH / 'qa').glob('frame-*.jpg'))
assert len(frames) == 104
for j in range(7):
    sheet = Image.new('RGB', (1080, 2024), '#112b24')
    draw = ImageDraw.Draw(sheet)
    for i, p in enumerate(frames[j*16:(j+1)*16]):
        x, y = i % 4 * 270, i // 4 * 506
        draw.text((x + 8, y + 5), f'Sample {j*16+i+1} / 104', fill='white')
        sheet.paste(Image.open(p), (x, y + 26))
    sheet.save(QA / f'review-{j+1}.jpg', quality=92)
phone = Image.new('RGB', (1080, 670), '#112b24')
draw = ImageDraw.Draw(phone)
for i, (label, t) in enumerate([('Opening / early price',1.1), ('Wrist / price',35.5), ('Compare / order',49.2)]):
    p = SCRATCH / 'qa' / f'phone-{i}.png'
    subprocess.run([FF, '-y', '-v', 'error', '-ss', str(t), '-i',
        'downloads/MIQA-SEIKO-VIP-Facebook-1080p.mp4', '-frames:v', '1',
        '-vf', 'scale=360:640', str(p)], check=True)
    draw.text((i*360+8,8), label, fill='white')
    phone.paste(Image.open(p), (i*360,30))
phone.save(QA / 'customer-phone-check.jpg', quality=95)

manifest = json.loads((BASE / 'assets-manifest.json').read_text())
assert len(manifest) == 22  # twelve photographs plus ten approved narrator WAVs
with zipfile.ZipFile('downloads/MIQA-SEIKO-VIP-Production-Assets.zip') as z:
    assert z.testzip() is None
    for item in manifest:
        data = z.read(item['file'])
        assert len(data) == item['bytes'] and hashlib.sha256(data).hexdigest() == item['sha256']
print('PASS: all 10 approved WAVs unchanged; all 20 final-file speech cue checks passed; 104 samples; asset CRC/hashes passed.')
