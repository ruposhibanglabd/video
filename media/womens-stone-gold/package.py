"""Verify native scene pixels and square lossless exports; bundle only three selected styles."""
from pathlib import Path
from PIL import Image
import cv2,numpy as np,json,hashlib,zipfile
r=Path('media/womens-stone-gold');items=json.loads((r/'set-manifest.json').read_text());assert len(items)==3
boxes={'main':[(45,1138,450,1235)],'wrist':[],'detail':[(422,394,485,436)]};checks=[]
for style,x in zip(['main','wrist','detail'],items):
    a=np.array(Image.open(r/f'source-{style}.png').convert('RGB'))
    with Image.open(x['master']) as m,Image.open(x['website']) as w:
        assert m.width==m.height==w.width==w.height
        assert m.convert('RGBA').tobytes()==w.convert('RGBA').tobytes()
        assert m.info.get('icc_profile')==w.info.get('icc_profile')
        b=np.array(m.convert('RGB'))
    if style=='detail':
        b=b[:,160:1024]
        x.update(nativeSceneSize=[864,1184],backgroundCanvasExtension=[160,0,160,0],productCrop=False)
        mask=np.zeros(a.shape[:2],np.uint8)
        cv2.fillPoly(mask,[np.array(p,np.int32) for p in [[(420,441),(487,376),(497,388),(430,453)],[(398,409),(430,431),(441,447),(421,451)]]],255)
        assert np.array_equal(a[mask>0],b[mask>0]),'Primary hand pixel changed'
    assert a.shape==b.shape
    diff=np.any(a!=b,axis=2);allowed=np.zeros(diff.shape,bool)
    for x0,y0,x1,y1 in boxes[style]:allowed[y0:y1,x0:x1]=True
    outside=int((diff&~allowed).sum());assert outside==0,(style,outside)
    checks.append(dict(style=style,changedOriginalScenePixels=int(diff.sum()),outsideApprovedLetteringLabelRegions=outside))
    assert hashlib.sha256(Path(x['website']).read_bytes()).hexdigest()==x['sha256']
(r/'set-manifest.json').write_text(json.dumps(items,indent=2,ensure_ascii=False)+'\n')
(r/'localized-edit-check.json').write_text(json.dumps(checks,indent=2)+'\n')
report='''# Gold-tone stone-watch square set — QA (2026-11-03)

- Three user-selected styles: main 2/2, wrist 1/2, detail 1/2; no rejected option delivered.
- All final images square: main/wrist native 1254×1254; detail selected source 864×1184 placed without resampling inside 1184×1184 canvas, 160px matching background extension per side. Complete visible watch/bracelet preserved, no product crop/stretch/up/downscale. No fake native 4K.
- Independently viewed sources, final phone-size square sheet and magnified inscription/hand repair. Gold case/bezel/crown/hands and gold structural U/ring bracelet, individual clear-stone settings, transparent glass and controlled reflections. No giant gems, starburst overlay, fabricated material grade or authentic diamond claim.
- Main scene unchanged except separate Bengali lock badge in background; wrist entirely unchanged. Original detail scene differs ONLY inside its small upper inscription region. Zero changed original-scene pixels outside approved regions (localized-edit-check.json). Background extension separately disclosed, not counted as an alteration of original scene pixels.
- Detail upper invented word replaced by blurred actual reference-01 raster, manufacturer spelling unverified; main/wrist deliberately indistinct lettering and detail QUARTZ retained. Full crossing long-hand and short-hand polygons, including neutral highlights, restored to original source pixels and verified numerically. Exactly three primary hands reviewed; no extra hand introduced.
- Main-only **বাটারফ্লাই লক** badge; wrist/detail clean. No fabricated open-clasp mechanism, identifiable phone/holding fingers/cardboard or customer testimonial.
- Lossless WebP versus full-color optimized PNG at canonical square sizes; chosen files have exact decoded RGBA equality and identical ICC presence/content. No palette reduction, arbitrary KB cap, resized/blurred stones or lossy quality=100 substitute.
- Same-details benefits retained: butterfly clasp, water resistant, unspecified-duration chain-color guarantee, seven-day replacement, six-month warranty. No price/gifts/solid gold/diamond/steel grade/ATM/depth/refund claim.
- Both original references checked for GPS EXIF tags: absent. AI commercial illustrations, not documentary inventory/customer photos; fine geometry/markings/hand angles may vary. No app/deployment/video/previous-set changes.
- Bengali proposed name/short/detailed copy included in ZIP and required inline in chat. Separate immutable website/ZIP links shared only after remote byte/SHA verification.

| Style | Square dimensions | PNG bytes | Website bytes | Lossless saving |
|---|---:|---:|---:|---:|
'''
for x in items:report+=f'| {Path(x["website"]).stem} | {x["width"]}×{x["height"]} | {x["masterBytes"]:,} | {x["bytes"]:,} | {x["savingsPercent"]}% |\n'
(r/'QA.md').write_text(report)
p=Path('downloads/MIQA-Womens-Stone-Gold-Square-Three-Styles.zip')
with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for x in items:
        for key in ['master','website']:z.write(x[key],Path(x[key]).name)
    z.write('downloads/womens-stone-gold/product-copy.md','product-copy.md')
    for f in ['README.md','set-manifest.json','QA.md']:z.write(r/f,f)
with zipfile.ZipFile(p) as z:assert len(z.namelist())==10 and z.testzip() is None
(r/'bundle-manifest.json').write_text(json.dumps(dict(file=str(p),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()),indent=2)+'\n')
print(report);print(checks);print('ZIP CRC passed:',p.stat().st_size,'bytes')
