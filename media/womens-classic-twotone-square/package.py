"""Verify selected scene edits and native square lossless exports; create complete ten-entry ZIP."""
from pathlib import Path
from PIL import Image
import cv2,numpy as np,json,hashlib,zipfile
r=Path('media/womens-classic-twotone-square');items=json.loads((r/'set-manifest.json').read_text());assert len(items)==3
boxes={'main':[(572,525,659,554),(45,1138,450,1235)],'wrist':[(557,536,630,565)],'detail':[(857,942,1026,994)]};checks=[]
for style,x in zip(['main','wrist','detail'],items):
    a=np.array(Image.open(r/f'source-{style}.png').convert('RGB'))
    with Image.open(x['master']) as m,Image.open(x['website']) as w:
        assert m.width==m.height==w.width==w.height
        assert m.convert('RGBA').tobytes()==w.convert('RGBA').tobytes()
        assert m.info.get('icc_profile')==w.info.get('icc_profile')
        b=np.array(m.convert('RGB'))
    assert a.shape==b.shape
    if style=='main':
        mask=np.zeros(a.shape[:2],np.uint8);cv2.fillPoly(mask,[np.array([(613,578),(642,546),(651,552),(620,587)],np.int32)],255)
        assert np.array_equal(a[mask>0],b[mask>0]),'Crossing hand pixel changed'
    diff=np.any(a!=b,axis=2);allowed=np.zeros(diff.shape,bool)
    for x0,y0,x1,y1 in boxes[style]:allowed[y0:y1,x0:x1]=True
    outside=int((diff&~allowed).sum());assert outside==0,(style,outside)
    checks.append(dict(style=style,changedPixels=int(diff.sum()),outsideApprovedLetteringLabelRegions=outside))
    assert hashlib.sha256(Path(x['website']).read_bytes()).hexdigest()==x['sha256']
(r/'localized-edit-check.json').write_text(json.dumps(checks,indent=2)+'\n')
report='''# Classic gold-frame two-tone square watch set — QA (2026-11-03)

- Exactly three selected styles: main 2/2, wrist 1/2, detail 1/2; no unselected candidate delivered.
- All source/master/website files natively square 1:1. Main/wrist 1254×1254, detail 2048×2048. No whole-image up/downscale, stretching, square crop, canvas expansion or fake native-4K claim.
- Current reference design reviewed: plain GOLD rectangular case/frame and stepped horizontal bars, GOLD crown, SILVER lugs, SILVER outer/GOLD middle regular rectangular bracelet links. Pale dial, exactly four GOLD pyramid/stud markers and three primary GOLD hands. NO inherited stones, Roman numerals, U/ring bracelet, added date/subdials/QUARTZ.
- Selected sources, final phone-size square compositions and magnified lettering/hand edits visually reviewed. Natural adult wrist, readable glass, controlled reflections; no identifiable original phone/holding fingers/box/plastic wrap. No fabricated open clasp or customer testimonial.
- Inconsistent generated scripts replaced locally by alpha-extracted blurred current reference-02 raster, no guessed verified manufacturer name. Main near-lettering seconds-hand counterweight protected/restored INCLUDING neutral highlights/edges and numerically identical to original source. Other primary hands/markers remain outside clipped edit boxes. Exactly three primary hands reviewed; detail angle/time differs, no identical-time claim.
- Zero changed selected-scene pixels outside approved small lettering regions and main-only **বাটারফ্লাই লক** badge (localized-edit-check.json). Wrist/detail have no added advertising annotation or inset.
- Lossless WebP versus optimized full-color PNG tested at native square sizes; selected files have exact decoded RGBA equality and matching ICC presence/content to finalized masters. No palette quantization, lossy quality=100 workaround, arbitrary KB cap, downsized/blurred detail or source-photo equality claim.
- Same-details benefits only: butterfly lock, water resistant, unspecified-duration chain-color guarantee, seven-day replacement, six-month warranty. No price/gifts/solid gold/silver/steel grade/depth/ATM/refund claim.
- Both original references checked for GPS EXIF tags: absent. AI commercial illustrations, not documentary inventory/customer photos; fine geometry/marking/hand-angle variations can remain. Earlier sets/app/video/deployment untouched.
- Bengali proposed name, short and detailed copy included in ZIP and required inline in delivery chat. Separate immutable website/ZIP links shared after remote bytes/SHA verification.

| Style | Native square dimensions | PNG bytes | Website bytes | Lossless saving |
|---|---:|---:|---:|---:|
'''
for x in items:report+=f'| {Path(x["website"]).stem} | {x["width"]}×{x["height"]} | {x["masterBytes"]:,} | {x["bytes"]:,} | {x["savingsPercent"]}% |\n'
(r/'QA.md').write_text(report)
p=Path('downloads/MIQA-Womens-Classic-Twotone-Square-Three-Styles.zip')
with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for x in items:
        for key in ['master','website']:z.write(x[key],Path(x[key]).name)
    z.write('downloads/womens-classic-twotone-square/product-copy.md','product-copy.md')
    for f in ['README.md','set-manifest.json','QA.md']:z.write(r/f,f)
with zipfile.ZipFile(p) as z:assert len(z.namelist())==10 and z.testzip() is None
(r/'bundle-manifest.json').write_text(json.dumps(dict(file=str(p),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()),indent=2)+'\n')
print(report);print(checks);print('ZIP CRC passed:',p.stat().st_size,'bytes')
