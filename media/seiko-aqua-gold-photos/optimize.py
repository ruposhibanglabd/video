"""Lossless web exports; no resize, quantization, lossy encoding or silent profile removal."""
from PIL import Image
from pathlib import Path
import numpy as np
import hashlib,json,io
root=Path('.tmp/seiko-aqua-gold');out=Path('downloads/seiko-aqua-gold');out.mkdir(parents=True,exist_ok=True)
report=[]
def encode(im):
    opts={'icc_profile':im.info['icc_profile']} if im.info.get('icc_profile') else {}
    wb=io.BytesIO();im.save(wb,'WEBP',lossless=True,quality=100,method=6,exact=True,**opts)
    pb=io.BytesIO();im.save(pb,'PNG',optimize=True,compress_level=9,**opts)
    return wb.getvalue(),pb.getvalue()
for name,source in [('01-main',root/'review/01-main-master.png'),('02-wrist',root/'generated/02-wrist.png'),('03-detail',root/'generated/03-detail.png')]:
    if not source.exists():source=next(out.glob(name+'.*'))
    im=Image.open(source);im.load()
    # Fully opaque alpha is redundant; dropping it preserves every displayed RGBA pixel.
    if im.mode=='RGBA' and im.getchannel('A').getextrema()==(255,255):im=im.convert('RGB')
    wb,pb=encode(im);data,ext=(wb,'webp') if len(wb)<len(pb) else (pb,'png')
    dst=out/(name+'.'+ext);dst.write_bytes(data)
    actual=Image.open(dst);assert np.array_equal(np.asarray(im.convert('RGBA')),np.asarray(actual.convert('RGBA')))
    assert im.info.get('icc_profile')==actual.info.get('icc_profile')
    row={'file':str(dst),'width':im.width,'height':im.height,'bytes':len(data),'lossless_webp_bytes':len(wb),'optimized_png_bytes':len(pb),'pixel_equal_rgba':True,'profile_equal':True,'sha256':hashlib.sha256(data).hexdigest()};report.append(row);print(json.dumps(row))
Path('media/seiko-aqua-gold-photos/manifest.json').write_text(json.dumps(report,indent=2)+'\n')
