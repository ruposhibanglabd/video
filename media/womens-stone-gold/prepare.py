"""Native square masters; detail lettering repair and background-only square canvas extension."""
from pathlib import Path
from PIL import Image
import numpy as np,cv2,json
r=Path('media/womens-stone-gold');out=Path('.tmp/womens-stone-gold/masters');out.mkdir(parents=True,exist_ok=True)
records=[]
for style in ['main','wrist','detail']:
    im=Image.open(r/f'source-{style}.png').convert('RGB');native=im.size;extension=None;repair=None
    if style=='detail':
        a=np.array(im);original=a.copy();g=cv2.cvtColor(a,cv2.COLOR_RGB2GRAY)
        # Protect the complete crossing hand, including neutral highlights/edges (not just gold-colored pixels).
        handmask=np.zeros(a.shape[:2],np.uint8)
        cv2.fillPoly(handmask,[np.array(p,np.int32) for p in [[(420,441),(487,376),(497,388),(430,453)],[(398,409),(430,431),(441,447),(421,451)]]],255)
        gold=handmask>0
        bh=cv2.morphologyEx(g,cv2.MORPH_BLACKHAT,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
        mask=np.zeros(g.shape,np.uint8);mask[396:432,424:483]=(bh[396:432,424:483]>7)*255
        mask=cv2.dilate(mask,np.ones((3,3),np.uint8));mask[gold]=0
        plate=cv2.medianBlur(a,31);a[mask>0]=plate[mask>0];im=Image.fromarray(a)
        box=(1555,1315,1775,1387)
        ref=np.array(Image.open(r/'references/reference-01.jpg').convert('RGB').crop(box));rg=cv2.cvtColor(ref,cv2.COLOR_RGB2GRAY)
        ink=cv2.morphologyEx(rg,cv2.MORPH_BLACKHAT,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(41,41)))
        alpha=np.clip((ink.astype(float)-5)*4,0,150).astype('uint8')
        rgba=np.zeros((*alpha.shape,4),np.uint8);rgba[:,:,:3]=83;rgba[:,:,3]=alpha
        glyph=Image.fromarray(rgba).resize((54,18),Image.Resampling.LANCZOS).rotate(-22,Image.Resampling.BICUBIC,expand=True)
        im.paste(glyph,(round(452-glyph.width/2),round(414-glyph.height/2)),glyph)
        a=np.array(im);a[gold]=original[gold]
        # Continue only the edge background, never resample/crop the watch or fabricate another product segment.
        # Mirror only narrow watch-free background strips: retains satin texture without flat side bands.
        left=cv2.copyMakeBorder(a[:,:96],0,0,160,0,cv2.BORDER_REFLECT_101)[:,:160]
        right=cv2.copyMakeBorder(a[:,-64:],0,0,0,160,cv2.BORDER_REFLECT_101)[:,64:]
        pads=[left,right]
        im=Image.fromarray(np.concatenate([pads[0],a,pads[1]],axis=1))
        extension=[160,0,160,0];repair=dict(region=[422,394,485,436],referenceRasterBox=box,primaryHandPolygonsProtected=True,brandSpellingVerified=False)
    assert im.width==im.height
    im.save(out/f'{style}.png')
    records.append(dict(style=style,nativeSize=native,finalSize=im.size,backgroundCanvasExtension=extension,repair=repair,wholeSceneResampling=False,productCrop=False))
(r/'preparation-manifest.json').write_text(json.dumps(records,indent=2)+'\n')
