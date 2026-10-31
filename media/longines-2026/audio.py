"""Original procedural instrumental underscore; selected Bengali voice files are inputs."""
import wave,json
from pathlib import Path
import numpy as np
from scipy.signal import resample_poly
from math import gcd
SR=48000; D=48; mix=np.zeros((D*SR,2),np.float64); activity=np.zeros(D*SR)
cues=[('hook',.20),('leather',3.44),('water',8.72),('leatherprice',10.62),('lock',20.15),('guarantee',23.32),('water',25.82),('warranty',27.65),('chainprice',30.55),('final',40.24)]
report=[]
for name,start in cues:
 p=Path('.tmp/longines/audio')/f'vo-{name}.wav';w=wave.open(str(p));rate=w.getframerate();a=np.frombuffer(w.readframes(w.getnframes()),np.int16).reshape(-1,w.getnchannels()).astype(float)/32768;a=a.mean(axis=1)
 ix=np.flatnonzero(abs(a)>.012);lo=max(0,int(ix[0]-.055*rate));hi=min(len(a),int(ix[-1]+.09*rate));a=a[lo:hi]
 g=gcd(rate,SR);a=resample_poly(a,SR//g,rate//g);rms=np.sqrt(np.mean(a*a));a*=min(.105/max(rms,1e-8),.70/max(abs(a)))
 k=int(start*SR);end=min(len(mix),k+len(a));mix[k:end]+=a[:end-k,None];activity[k:end]=1;report.append(dict(clip=name,start=start,end=end/SR))
# Warm slow harmonic bed, composed here without third-party recording.
t=np.arange(D*SR)/SR;bed=np.zeros_like(t)
for j,notes in enumerate([[146.832,220,293.665,369.994],[130.813,196,261.626,329.628],[164.814,246.942,329.628,391.995],[110,164.814,220,293.665]]*3):
 start=j*5;loc=t-start;env=np.clip(loc/.8,0,1)*np.clip((5.7-loc)/1.4,0,1);env[(loc<0)|(loc>5.7)]=0
 for q,f in enumerate(notes):bed+=.008*env*(np.sin(2*np.pi*f*t+q*.3)+.22*np.sin(2*np.pi*f*2*t))
# Gentle plucked notes, no EDM beat.
for j in range(96):
 st=j*.5;loc=t-st;env=np.exp(-np.maximum(loc,0)*7);env[(loc<0)|(loc>1.2)]=0;f=[587.33,739.99,880,659.26,783.99][j%5];bed+=.008*env*np.sin(2*np.pi*f*t)
from scipy.ndimage import gaussian_filter1d
smooth=gaussian_filter1d(activity[::48],60)
duck=1.8-1.40*np.interp(np.arange(len(activity)),np.arange(len(smooth))*48,smooth);fade=np.minimum(t/1.4,1)*np.minimum((D-t)/1.2,1);bed*=duck*fade
mix[:,0]+=bed;mix[:,1]+=bed*.96;mix=np.clip(mix,-.95,.95)
with wave.open('.tmp/longines/render/mix.wav','wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype(np.int16).tobytes())
Path('.tmp/longines/render/audio-cues.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
