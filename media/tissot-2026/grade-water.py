"""Neutralize an excessive emerald cast on the generated black strap only.
No customer pixels are introduced and case/dial geometry is unchanged.
"""
from PIL import Image,ImageDraw,ImageFilter
from pathlib import Path
import numpy as np
p=Path('.tmp/tissot/generated/09-water.png'); backup=Path('.tmp/tissot/review/water-before-grade.png')
if not backup.exists():backup.write_bytes(p.read_bytes())
im=Image.open(backup).convert('RGB');a=np.asarray(im).astype(float)
mask=Image.new('L',im.size);d=ImageDraw.Draw(mask);d.polygon([(282,335),(485,335),(500,442),(269,455)],fill=255);mask=mask.filter(ImageFilter.GaussianBlur(4))
lum=a@np.array([.2126,.7152,.0722]);neutral=np.stack([lum*.61,lum*.63,lum*.65],axis=-1)
m=np.asarray(mask).astype(float)[...,None]/255
Image.fromarray(np.clip(a*(1-m)+neutral*m,0,255).astype('uint8')).save(p)
