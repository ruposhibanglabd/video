"""Remove inconsistent invented generator lettering; transfer the actual blurred reference mark.
This preserves uncertainty: it is raster restoration, not a verified brand transcription.
No resize of the complete photographic canvas, no change to case/bracelet color.
"""
from pathlib import Path
from PIL import Image
import numpy as np
import cv2, json

ROOT=Path('media/womens-gold-frame-twotone')
TMP=Path('.tmp/womens-gold-frame-twotone/masters'); TMP.mkdir(parents=True,exist_ok=True)
# Crop contains dial lettering only, not the gold 12-o'clock stud or hands.
ref=Image.open(ROOT/'references/reference-02.png').convert('RGB')
patch=np.array(ref.crop((502,638,606,669))).astype(float)
gray=patch@np.array([.2126,.7152,.0722])
bg=cv2.morphologyEx(gray.astype(np.uint8),cv2.MORPH_CLOSE,np.ones((13,19),np.uint8)).astype(float)
alpha=np.clip((bg-gray-1.5)/np.maximum(bg-65,1),0,.72)
# Feather the crop boundary, avoiding a visible rectangular backdrop.
edge_x=np.minimum(np.arange(104)+1,104-np.arange(104))/4
edge_y=np.minimum(np.arange(31)+1,31-np.arange(31))/3
alpha*=np.minimum(edge_y,1)[:,None]*np.minimum(edge_x,1)[None,:]
alpha[alpha<.025]=0
rgba=np.zeros((31,104,4),dtype=np.uint8);rgba[:,:,:3]=(73,70,65);rgba[:,:,3]=np.uint8(alpha*255)
glyph=Image.fromarray(rgba)
records=[]
settings=[
 ('main',[(315,568),(398,568),(398,598),(315,598)],(357,583),78,0),
 ('wrist',[(817,1178),(882,1147),(895,1174),(830,1205)],(856,1176),74,28),
 ('detail',[(817,1031),(1013,1113),(991,1173),(797,1091)],(903,1098),176,-27),
]
for name,poly,center,width,angle in settings:
    source=ROOT/f'source-{name}.png'
    image=Image.open(source).convert('RGB');pixels=np.array(image)
    polygon=np.zeros(pixels.shape[:2],np.uint8)
    cv2.fillPoly(polygon,[np.array(poly,np.int32)],255)
    lum=cv2.cvtColor(pixels,cv2.COLOR_RGB2GRAY)
    chroma=pixels.max(axis=2).astype(int)-pixels.min(axis=2).astype(int)
    # Neutral dark ink only; protect warm-gold hands/markers even near the text.
    mask=np.uint8((polygon>0)&(lum<218)&(chroma<27))*255
    mask=cv2.dilate(mask,np.ones((3,3),np.uint8),iterations=1)
    repaired=cv2.inpaint(pixels,mask,3,cv2.INPAINT_TELEA)
    result=Image.fromarray(repaired).convert('RGBA')
    mark=glyph.resize((width,round(width*31/104)),Image.Resampling.LANCZOS).rotate(angle,Image.Resampling.BICUBIC,expand=True)
    result.alpha_composite(mark,(round(center[0]-mark.width/2),round(center[1]-mark.height/2)))
    output=TMP/f'{name}.png';result.convert('RGB').save(output)
    records.append(dict(style=name,source=str(source),masterBeforeLabel=str(output),
                        size=list(image.size),referenceCrop=[502,638,606,669],
                        referenceLetteringTransferred=True,brandSpellingVerified=False))
(ROOT/'lettering-review.json').write_text(json.dumps(records,indent=2)+'\n')
print('Three native-size masters prepared; ambiguous reference lettering retained without invented brand names.')
