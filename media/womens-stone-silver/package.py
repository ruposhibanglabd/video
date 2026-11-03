"""Verify localized edits and square lossless exports; package selected deliverables only."""
from pathlib import Path
from PIL import Image
import numpy as np, json,hashlib,zipfile
r=Path('media/womens-stone-silver');items=json.loads((r/'set-manifest.json').read_text());assert len(items)==3
boxes={'main':[(60,1455,560,1570)],'wrist':[],'detail':[(432,389,494,421),(426,458,474,482)]}
checks=[]
for style,x in zip(['main','wrist','detail'],items):
    a=Image.open(r/f'source-{style}.png').convert('RGB')
    if style=='wrist':a=a.crop((0,296,1773,2069))
    with Image.open(x['master']) as m,Image.open(x['website']) as w:
        assert m.width==m.height==w.width==w.height
        assert m.convert('RGBA').tobytes()==w.convert('RGBA').tobytes()
        assert m.info.get('icc_profile')==w.info.get('icc_profile')
        b=np.array(m.convert('RGB'));a=np.array(a);assert a.shape==b.shape
    diff=np.any(a!=b,axis=2);allowed=np.zeros(diff.shape,bool)
    for x0,y0,x1,y1 in boxes[style]:allowed[y0:y1,x0:x1]=True
    outside=int((diff&~allowed).sum());assert outside==0,(style,outside)
    checks.append(dict(style=style,changedPixels=int(diff.sum()),outsideApprovedLetteringLabelRegions=outside))
    assert hashlib.sha256(Path(x['website']).read_bytes()).hexdigest()==x['sha256']
(r/'localized-edit-check.json').write_text(json.dumps(checks,indent=2)+'\n')
report='''# All-silver stone-watch photo set — QA (2026-11-03)

- Exactly three distinct styles; user selected option 2/2 for main, wrist and detail. No unselected candidate delivered.
- All files square 1:1. Main 1600×1600, wrist safely cropped at native pixels to 1773×1773, detail 1024×1024. Entire visible wrist watch retained. No whole-image stretch, up/downscale or source resampling.
- Sources, final square phone-size review sheet and magnified detail inscriptions reviewed. Visible small clear-stone settings/facets, silver case/bezel/crown/hands and ornate U/ring bracelet. Controlled pink environmental reflections, not a gold finish. No sparkle overlay, real-diamond/metal-grade assertion or material certification.
- Exactly three primary hands reviewed. Main photograph unchanged except code-typeset Bengali lock badge; wrist pixels entirely unchanged after safe crop. Detail changes confined to the two inscription regions, not hands/stone settings. Zero changed pixels outside approved lettering/main-label regions (localized-edit-check.json).
- Detail wrong upper word repaired with the actual current reference-02 raster, photographed hand-tip excluded from extracted alpha. Lower GUARTZ corrected to reference-legible QUARTZ by code typesetting, avoiding a reference seconds-hand overlap. Brand spelling remains unverified. No invented brand/model in copy.
- Natural adult wrist, readable glass/dial, controlled reflections, no identifiable original phone/holding fingers/cardboard. No fake open-clasp mechanism or customer testimonial. Main-only Bengali **বাটারফ্লাই লক** annotation; wrist/detail clean.
- Strict lossless WebP versus full-color optimized PNG tested at canonical square sizes; chosen files have exact decoded RGBA equality and matching ICC presence/content. No palette quantization, lossy quality=100 workaround, arbitrary KB limit or reduced stone detail.
- Same-details request authorizes the preceding women's benefits only: butterfly lock, water resistant, chain-color guarantee with no stated duration, seven-day replacement and six-month warranty. No price/gifts/solid silver/diamond/depth/ATM/refund claims.
- Original references inspected: no GPS EXIF tags. AI commercial illustrations, not an authenticated physical-product record or documentary customer photo; fine geometry/marking/hand-angle differences may remain. No app/deployment/video/older-set changes.
- Bengali name, short and detailed copy included in package AND required inline in delivery chat. Remote website files and ZIP must have bytes/SHA verified after push before links are shared.

| Style | Square dimensions | PNG bytes | Website bytes | Lossless saving |
|---|---:|---:|---:|---:|
'''
for x in items:report+=f'| {Path(x["website"]).stem} | {x["width"]}×{x["height"]} | {x["masterBytes"]:,} | {x["bytes"]:,} | {x["savingsPercent"]}% |\n'
(r/'QA.md').write_text(report)
p=Path('downloads/MIQA-Womens-Stone-Silver-Square-Three-Styles.zip')
with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for x in items:
        for key in ['master','website']:z.write(x[key],Path(x[key]).name)
    z.write('downloads/womens-stone-silver/product-copy.md','product-copy.md')
    for f in ['README.md','set-manifest.json','QA.md']:z.write(r/f,f)
with zipfile.ZipFile(p) as z:assert len(z.namelist())==10 and z.testzip() is None
(r/'bundle-manifest.json').write_text(json.dumps(dict(file=str(p),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()),indent=2)+'\n')
print(report);print(checks);print('ZIP CRC passed:',p.stat().st_size,'bytes')
