"""Replace inconsistent generated wordmarks with current blurred reference raster; no whole-photo resampling."""
from pathlib import Path
from PIL import Image
import cv2,numpy as np,json
r=Path('media/womens-classic-twotone-square');out=Path('.tmp/womens-classic-twotone-square/masters');out.mkdir(parents=True,exist_ok=True)
box=(1460,1842,1755,1920)
ref=np.array(Image.open(r/'references/reference-02.jpg').convert('RGB').crop(box));gray=cv2.cvtColor(ref,cv2.COLOR_RGB2GRAY)
ink=cv2.morphologyEx(gray,cv2.MORPH_BLACKHAT,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(35,35)))
alpha=np.clip((ink.astype(float)-4)*4,0,190).astype('uint8');rgba=np.zeros((*alpha.shape,4),np.uint8);rgba[:,:,:3]=80;rgba[:,:,3]=alpha
reference=Image.fromarray(rgba)
config={'main':((572,525,659,554),(615,540),82,0),'wrist':((557,536,630,565),(594,552),67,7),'detail':((857,942,1026,994),(941,970),156,-5)}
records=[]
for style,(region,center,width,angle) in config.items():
    source=Image.open(r/f'source-{style}.png').convert('RGB');a=np.array(source);g=cv2.cvtColor(a,cv2.COLOR_RGB2GRAY)
    x0,y0,x1,y1=region;allowed=np.zeros(g.shape,np.uint8);allowed[y0:y1,x0:x1]=255
    bh=cv2.morphologyEx(g,cv2.MORPH_BLACKHAT,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(25,25)))
    mask=((bh>5)&(allowed>0)).astype('uint8')*255;mask=cv2.dilate(mask,np.ones((3,3),np.uint8));mask=cv2.bitwise_and(mask,allowed)
    protected=np.zeros(g.shape,np.uint8)
    if style=='main':
        cv2.fillPoly(protected,[np.array([(613,578),(642,546),(651,552),(620,587)],np.int32)],255)
    mask[protected>0]=0
    plate=cv2.medianBlur(a,31);fixed=a.copy();fixed[mask>0]=plate[mask>0]
    im=Image.fromarray(fixed)
    glyph=reference.resize((width,round(width*reference.height/reference.width)),Image.Resampling.LANCZOS).rotate(angle,Image.Resampling.BICUBIC,expand=True)
    im.paste(glyph,(round(center[0]-glyph.width/2),round(center[1]-glyph.height/2)),glyph)
    repaired=np.array(im);repaired[(allowed==0)|(protected>0)]=a[(allowed==0)|(protected>0)];im=Image.fromarray(repaired)
    assert im.width==im.height;im.save(out/f'{style}.png')
    records.append(dict(style=style,nativeSize=source.size,finalSize=im.size,letteringRegion=region,referenceRasterBox=box,brandSpellingVerified=False,wholeImageResampling=False,crop=False,canvasExpansion=False))
(r/'preparation-manifest.json').write_text(json.dumps(records,indent=2)+'\n')
