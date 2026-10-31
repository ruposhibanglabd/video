"""New continuous Bengali take, phrase-paced for the premium revision. Original music."""
import wave,json,subprocess
from pathlib import Path
import numpy as np
SR=48000;D=44;mix=np.zeros((D*SR,2));activity=np.zeros(D*SR)
ff=subprocess.check_output(['node','-p',"require('@ffmpeg-installer/ffmpeg').path"],text=True).strip()
# Every source boundary lies in a detected natural pause; no syllables are reordered.
cues=[('hook',0,3.25,.15),('hero',3.25,7.55,4.05),('lock',7.55,10.65,9.08),('guarantee',10.65,12.45,12.76),('water',12.45,13.8,14.94),('warranty',13.8,15.67,16.66),('silver',15.67,16.65,19.08),('black',16.65,17.28,20.58),('blue',17.28,17.90,22.08),('white',17.90,18.78,23.58),('choose',18.78,20.99,25.04),('details',20.99,24.28,27.42),('price',24.28,26.91,31.52),('gifts',26.91,29.91,35.16),('cta',29.91,31.56,40.45)]
report=[]
for name,lo,hi,start in cues:
 out=f'.tmp/seiko-v2/render/phrase-{name}.wav'
 subprocess.run([ff,'-y','-v','error','-i','.tmp/seiko-v2/audio/premium-full.wav','-af',f'atrim=start={lo}:end={hi},asetpts=PTS-STARTPTS,atempo=0.90','-ar',str(SR),out],check=True)
 w=wave.open(out);a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768
 # One consistent gain for the continuous take, not an exaggerated per-word level.
 a*=1.45;a*=np.minimum(np.arange(len(a))/240,1)*np.minimum(np.arange(len(a))[::-1]/240,1)
 k=round(start*SR);end=k+len(a);assert end<=len(mix);mix[k:end]+=a[:,None];activity[k:end]=1
 report.append(dict(clip=name,source_start=lo,source_end=hi,start=start,end=end/SR))
t=np.arange(D*SR)/SR;bed=np.zeros_like(t)
for j in range(9):
 notes=[[146.832,220,293.665,369.994],[130.813,196,261.626,329.628],[164.814,246.942,329.628,391.995],[110,164.814,220,293.665]][j%4]
 loc=t-j*5;env=np.clip(loc/1.1,0,1)*np.clip((6-loc)/1.8,0,1);env[(loc<0)|(loc>6)]=0
 for q,f in enumerate(notes):bed+=.008*env*(np.sin(2*np.pi*f*t+q*.3)+.2*np.sin(2*np.pi*f*2*t))
for j in range(44):
 loc=t-j;env=np.exp(-np.maximum(loc,0)*5);env[(loc<0)|(loc>1.5)]=0;f=[587.33,739.99,880,659.26][j%4];bed+=.008*env*np.sin(2*np.pi*f*t)
# Smooth duck envelope avoids clicks at phrase edges.
from scipy.ndimage import gaussian_filter1d
duck=1-.64*gaussian_filter1d(activity,SR*.06);fade=np.minimum(t/1.4,1)*np.minimum((D-t)/1.4,1);bed*=duck*fade
mix[:,0]+=bed;mix[:,1]+=bed*.97
assert np.max(abs(mix))<.98, 'Unexpected clipping before loudness normalization'
with wave.open('.tmp/seiko-v2/render/mix.wav','wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype(np.int16).tobytes())
Path('.tmp/seiko-v2/render/audio-cues.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
