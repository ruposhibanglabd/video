"""Preserve all three native masters; choose the smaller pixel-lossless website format."""
from pathlib import Path
from PIL import Image
import hashlib, json

root = Path('downloads/womens-set-a')
scratch = Path('.tmp/womens-set-a/lossless')
scratch.mkdir(parents=True, exist_ok=True)
items = []
for stem, style, source in [
    ('01-main', 'main hero; Bengali lock label only here', 'media/womens-set-a/selected-product.png'),
    ('02-wrist', 'natural adult wrist; no added text', 'media/womens-set-a/source-wrist.png'),
    ('03-detail', 'dial/crystal/crown/bracelet close-up; no added text', 'media/womens-set-a/source-detail.png'),
]:
    master = root / (stem + '.png')
    with Image.open(master) as opened:
        opened.load()
        image = opened.copy()
        icc = opened.info.get('icc_profile')
        assert opened.getexif().get(274, 1) == 1, 'Normalize orientation explicitly before delivery'
    assert image.mode in ('RGB', 'RGBA')
    canonical = image.convert('RGBA').tobytes()
    options = {'icc_profile': icc} if icc else {}
    webp = scratch / (stem + '.webp')
    png = scratch / (stem + '.png')
    if not webp.exists() or webp.stat().st_size == 0:
        image.save(webp, 'WEBP', lossless=True, quality=100, method=6, exact=True, **options)
    if not png.exists() or png.stat().st_size == 0:
        image.save(png, 'PNG', optimize=True, compress_level=9, **options)
    for candidate in (webp, png):
        with Image.open(candidate) as decoded:
            assert decoded.size == image.size
            assert decoded.convert('RGBA').tobytes() == canonical, candidate
            assert decoded.info.get('icc_profile') == icc, 'ICC changed'
    chosen = min((webp, png), key=lambda p: p.stat().st_size)
    target = root / (stem + chosen.suffix)
    # For a PNG winner, keep the existing canonical PNG intact and use a separate optimized name.
    if target == master:
        target = root / (stem + '-website.png')
    target.write_bytes(chosen.read_bytes())
    with Image.open(target) as decoded:
        assert decoded.convert('RGBA').tobytes() == canonical
    items.append(dict(style=style, source=source, master=str(master), website=str(target),
                      width=image.width, height=image.height, upscaled=False, downscaled=False,
                      masterBytes=master.stat().st_size, optimizedPngBytes=png.stat().st_size,
                      losslessWebpBytes=webp.stat().st_size, bytes=target.stat().st_size,
                      savingsPercent=round((1-target.stat().st_size/master.stat().st_size)*100,2),
                      pixelEqualityRGBA=True, iccPreserved=True,
                      sha256=hashlib.sha256(target.read_bytes()).hexdigest(),
                      masterSha256=hashlib.sha256(master.read_bytes()).hexdigest()))
assert len(items) == 3
assert all(Path(x['website']).stem.startswith(stem) for x, stem in zip(items, ['01-main', '02-wrist', '03-detail']))
Path('media/womens-set-a/set-manifest.json').write_text(json.dumps(items, ensure_ascii=False, indent=2)+'\n')
for item in items:
    print(f"{item['website']}: {item['width']}×{item['height']}; {item['bytes']:,} bytes; {item['savingsPercent']}% smaller; exact RGBA equality")
