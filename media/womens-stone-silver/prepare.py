"""Local reference-raster lettering repair; safe square wrist crop, no whole-image resampling."""
from pathlib import Path
import cv2, numpy as np, json
from PIL import Image, ImageDraw, ImageFont
root=Path('media/womens-stone-silver');out=Path('.tmp/womens-stone-silver/masters');out.mkdir(parents=True,exist_ok=True)
ref=Image.open(root/'references/reference-02.jpg').convert('RGB')
refboxes={'brand':(1570,1660,1755,1722)}
def raster(kind,width):
    if kind=='quartz':
        im=Image.new('RGBA',(90,25));d=ImageDraw.Draw(im)
        d.text((2,0),'QUARTZ',font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',18),fill=(85,85,85,230))
        im=im.crop(im.getbbox());return im.resize((width,round(width*im.height/im.width)),Image.Resampling.LANCZOS)
    a=np.asarray(ref.crop(refboxes[kind]));g=cv2.cvtColor(a,cv2.COLOR_RGB2GRAY)
    ink=cv2.morphologyEx(g,cv2.MORPH_BLACKHAT,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(23,23)))
    alpha=np.clip((ink.astype(float)-7)*3.4,0,205).astype('uint8')
    alpha[45:,:28]=0 # Exclude the photographed hand tip below/left of the actual wordmark.
    rgba=np.zeros((*alpha.shape,4),np.uint8);rgba[:,:,:3]=68;rgba[:,:,3]=alpha
    im=Image.fromarray(rgba);return im.resize((width,round(width*im.height/im.width)),Image.Resampling.LANCZOS)
# Rectangles tightly exclude all primary hands; rotation applies only to the reference lettering raster.
repairs={
 'main':[],
 'wrist':[],
 'detail':[('brand',(435,392,491,416),(463,405),54,-11),('quartz',(428,460,472,479),(450,470),42,-11)]}
records=[]
for style in ['main','wrist','detail']:
    im=Image.open(root/f'source-{style}.png').convert('RGB');size=im.size
    for kind,box,center,width,angle in repairs[style]:
        a=np.array(im);x0,y0,x1,y1=box;g=cv2.cvtColor(a,cv2.COLOR_RGB2GRAY)
        bh=cv2.morphologyEx(g,cv2.MORPH_BLACKHAT,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
        mask=np.zeros(g.shape,np.uint8);mask[y0:y1,x0:x1]=(bh[y0:y1,x0:x1]>6)*255
        mask=cv2.dilate(mask,np.ones((3,3),np.uint8))
        fixed=cv2.inpaint(a,mask,3,cv2.INPAINT_TELEA)
        im=Image.fromarray(fixed);glyph=raster(kind,width).rotate(angle,Image.Resampling.BICUBIC,expand=True)
        im.paste(glyph,(round(center[0]-glyph.width/2),round(center[1]-glyph.height/2)),glyph)
    crop=None
    if style=='wrist':crop=(0,296,1773,2069);im=im.crop(crop)
    assert im.width==im.height
    im.save(out/f'{style}.png')
    records.append(dict(style=style,sourceSize=size,finalSize=im.size,crop=crop,letteringRegions=repairs[style],wholeImageResampling=False))
(root/'preparation-manifest.json').write_text(json.dumps(dict(referenceRasterBoxes=refboxes,manufacturerSpellingVerified=False,detailLowerWord="QUARTZ typeset from legible reference; no hand-containing raster copied",images=records),indent=2)+'\n')
