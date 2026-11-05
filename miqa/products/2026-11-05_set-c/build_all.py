"""Set C — build all website images (5 products x 5 photos + group shot).

Run:  /tmp/venv/bin/python miqa/products/2026-11-05_set-c/build_all.py
Needs: cut/*.png (segment.py), plates/wrist_plate.png, node chip.mjs
"""
import json, os, shutil, subprocess, sys
import numpy as np, cv2
from PIL import Image

sys.path.insert(0, 'miqa/products/2026-11-05_set-c')
import compose as C

ROOT = 'miqa/products/2026-11-05_set-c'
DEL = 'miqa/deliveries/2026-11-05_set-c'
OUT = f'{ROOT}/work/out'

# name -> (source photo, cut, feature chips [(label, inset crop box in source)])
PRODUCTS = [
    dict(slug='01_fiyota-octagon-black', src='image-3', cut='image-3'),
    dict(slug='02_fiyota-octagon-pink', src='image-5', cut='image-5'),
    dict(slug='03_trueworth-heart-black', src='image-7', cut='image-7'),
    dict(slug='04_fiyota-octagon-green', src='image-9', cut='image-9'),
    dict(slug='05_fiyota-octagon-white', src='image-11', cut='image-11'),
]
CHIP_LABELS = ['ওয়াটার রেজিস্ট্যান্ট', '৭ দিনের রিপ্লেসমেন্ট']

WHITE_BOX = {k: (330, 200, 860, 1200) for k in ['image-3', 'image-5', 'image-7', 'image-9', 'image-11']}


def prep(p):
    cut = C.load(p['cut'])
    cut = C.wb_and_expose(cut, C.ref_white(p['src'], WHITE_BOX[p['src']]))
    return cut


def detail_inset(cut, i, out_png):
    """crop a real part of the watch itself: the case (water) / a chain link"""
    h, w = cut.shape[:2]
    a = cut[..., 3].astype(np.float32) / 255
    widths = a.sum(1)
    cy = int(np.argmax(cv2.GaussianBlur(widths.reshape(-1, 1), (0, 0), 40).ravel()))
    if i == 0:                       # the case: crown side, clean metal
        side = 0.36 * h
        y0 = int(cy - side / 2); x0 = int(w / 2 - side / 2)
    else:                            # a bracelet link below the case
        side = 0.26 * h
        y0 = int(min(h - side - 1, cy + 0.30 * h)); x0 = int(w / 2 - side / 2)
    y0 = max(0, y0); x0 = max(0, x0)
    box = cut[y0:int(y0 + side), x0:int(x0 + side)]
    im = Image.fromarray(box, 'RGBA')
    bg = Image.new('RGBA', im.size, (251, 244, 241, 255))
    bg.alpha_composite(im)
    bg.convert('RGB').resize((420, 420), Image.LANCZOS).save(out_png)
    return out_png


def inset(src, box, out_png):
    im = Image.open(f'{ROOT}/source-photos/{src}.png').convert('RGB').crop(box)
    im = im.resize((420, 420), Image.LANCZOS)
    im.save(out_png)
    return out_png


def chip(label, inset_png, out_png):
    subprocess.run(['node', 'miqa/tools/product-images/chip.mjs', label, inset_png, out_png, 'women'],
                   check=True, capture_output=True)
    return out_png


def add_chips(img, chips_png, cy=1735, pill_w=1120):
    """place the chip pills (cropped to their real bbox) centred, bottom third"""
    base = Image.fromarray((np.clip(img, 0, 1) * 255 + .5).astype(np.uint8)).convert('RGBA')
    ys = [cy] if len(chips_png) == 1 else [cy - 118, cy + 118]
    for p, y in zip(chips_png, ys):
        c = Image.open(p).convert('RGBA')
        a = np.asarray(c)[..., 3]
        ysx, xsx = np.where(a > 10)
        c = c.crop((xsx.min(), ysx.min(), xsx.max() + 1, ysx.max() + 1))
        k = pill_w / c.width
        c = c.resize((pill_w, int(c.height * k)), Image.LANCZOS)
        base.alpha_composite(c, (base.width // 2 - c.width // 2, int(y - c.height / 2)))
    return base


def run():
    os.makedirs(OUT, exist_ok=True)
    report = {}
    for p in PRODUCTS:
        slug = p['slug']
        wk = f'{OUT}/{slug}'
        os.makedirs(wk, exist_ok=True)
        cut = prep(p)

        C.primary(cut, f'{slug}/_01_base')
        C.angle(cut, f'{slug}/_03')
        C.closeup(cut, f'{slug}/_04')
        C.bracelet_closeup(cut, f'{slug}/_05')
        info = C.on_wrist(cut, f'{slug}/_02')
        report[slug] = dict(wrist=info)

        # primary: two chips, each with a real detail of this very watch
        chips = []
        for i, label in enumerate(CHIP_LABELS):
            ins = detail_inset(cut, i, f'{wk}/_inset{i}.png')
            chips.append(chip(label, ins, f'{wk}/_chip{i}.png'))
        img = np.asarray(Image.open(f'{OUT}/{slug}/_01_base.jpg').convert('RGB')).astype(np.float32) / 255
        final = add_chips(img, chips)
        # deliverable names, straight into the delivery folder
        dst = f'{DEL}/{slug}/website-images'
        os.makedirs(dst, exist_ok=True)
        final.convert('RGB').save(f'{dst}/{slug}_01_primary.jpg', quality=92, subsampling=0, optimize=True)
        for src_name, out_name in [('_02', '02_on-wrist'), ('_03', '03_angle'),
                                   ('_04', '04_dial-closeup'), ('_05', '05_bracelet-closeup')]:
            shutil.copyfile(f'{OUT}/{slug}/{src_name}.jpg', f'{dst}/{slug}_{out_name}.jpg')
        print('built', slug)
    print(json.dumps(report, indent=1))


if __name__ == '__main__':
    run()
