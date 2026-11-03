"""Square photographs; correct invented dial words using real reference raster, not guessed text."""
from pathlib import Path
from PIL import Image
import numpy as np
import cv2,json
R=Path('media/womens-stone-twotone');T=Path('.tmp/womens-stone-twotone/masters');T.mkdir(parents=True,exist_ok=True)
ref=Image.open(R/'references/reference-02.jpg').convert('RGB')
def raster(box):
 p=np.array(ref.crop(box)).astype(float);g=p@np.array([.2126,.7152,.0722])
 bg=cv2.morphologyEx(g.astype(np.uint8),cv2.MORPH_CLOSE,np.ones((21,31),np.uint8)).astype(float)
 alpha=np.clip((bg-g-2)/np.maximum(bg-58,1),0,.85)
 # Remove gold-hand pixels from the lower inscription extraction; never invent covered strokes.
 alpha[p.max(axis=2)-p.min(axis=2)>38]=0
 h,w=g.shape;ex=np.minimum(np.arange(w)+1,w-np.arange(w))/5;ey=np.minimum(np.arange(h)+1,h-np.arange(h))/4
 alpha*=np.minimum(ey,1)[:,None]*np.minimum(ex,1)[None,:];alpha[alpha<.025]=0
 rgba=np.zeros((h,w,4),np.uint8);rgba[:,:,:3]=(57,55,50);rgba[:,:,3]=np.uint8(alpha*255)
 return Image.fromarray(rgba)
boxes={'brand':(1442,1282,1651,1348),'quartz':(1444,1534,1613,1576)}
marks={key:raster(box) for key,box in boxes.items()}
settings={
 'main':[
  ('brand',[(466,394),(524,394),(524,420),(466,420)],(494,408),54,0),
  ('quartz',[(463,466),(509,466),(509,484),(463,484)],(486,476),38,0)],
 'wrist':[
  ('brand',[(406,412),(466,412),(466,437),(406,437)],(436,425),59,-3),
  ('quartz',[(409,473),(458,473),(458,495),(409,495)],(434,484),42,-3)],
 'detail':[
  ('brand',[(494,382),(582,405),(574,434),(486,408)],(534,407),83,-16),
  ('quartz',[(478,470),(550,486),(544,510),(470,492)],(511,491),59,-16)]}
records=[]
for style,edits in settings.items():
 image=Image.open(R/f'source-{style}.png').convert('RGB');pixels=np.array(image)
 for name,poly,center,width,angle in edits:
  roi=np.zeros(pixels.shape[:2],np.uint8);cv2.fillPoly(roi,[np.array(poly,np.int32)],255)
  lum=cv2.cvtColor(pixels,cv2.COLOR_RGB2GRAY);chroma=pixels.max(axis=2).astype(int)-pixels.min(axis=2).astype(int)
  localbg=cv2.morphologyEx(lum,cv2.MORPH_CLOSE,np.ones((13,13),np.uint8))
  ink=localbg.astype(int)-lum.astype(int)>7
  mask=np.uint8((roi>0)&ink&(chroma<35))*255;mask=cv2.dilate(mask,np.ones((3,3),np.uint8),iterations=1)
  # Keep foreground hands intact where their silhouettes cross an inscription.
  rgb=pixels.astype(int);gold=(chroma>14)&(rgb[:,:,0]>=rgb[:,:,1]+2)&(rgb[:,:,1]>=rgb[:,:,2]+2)
  protect=np.uint8(gold)*255
  mask[protect>0]=0
  # A neutral local background plate avoids bleeding gold hands into erased glyphs.
  plate=cv2.medianBlur(pixels,31);repaired=pixels.copy();repaired[mask>0]=plate[mask>0]
  out=Image.fromarray(repaired).convert('RGBA');glyph=marks[name]
  glyph=glyph.resize((width,round(width*glyph.height/glyph.width)),Image.Resampling.LANCZOS).rotate(angle,Image.Resampling.BICUBIC,expand=True)
  out.alpha_composite(glyph,(round(center[0]-glyph.width/2),round(center[1]-glyph.height/2)))
  edited=np.array(out.convert('RGB'));edited[protect>0]=pixels[protect>0];pixels=edited
 image=Image.fromarray(pixels)
 crop=None
 if image.width!=image.height:
  assert style=='wrist' and image.size==(889,1180)
  crop=(0,145,889,1034);image=image.crop(crop)  # Background/arm-only crop, full watch remains.
 assert image.width==image.height
 image.save(T/f'{style}.png')
 records.append(dict(style=style,source=f'source-{style}.png',outputSize=list(image.size),
                     squareCrop=crop,wholeImageResampled=False,referenceLetteringBoxes=boxes,
                     referenceRasterUsed=True,brandSpellingVerified=False))
(R/'preparation-manifest.json').write_text(json.dumps(records,indent=2)+'\n')
print('Three square masters; no stretching/upscaling; real reference lettering retained without invented transcription.')
