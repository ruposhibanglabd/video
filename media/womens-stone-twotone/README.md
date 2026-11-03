# Stone-set two-tone women's watch — three square styles

2026-11-03. New references: `IMG20261029125049.jpg` / `IMG20261029125050.jpg`. User priority: **stones must be clearly discernible while keeping the other details**. Apply the latest mandatory three-style, square-format and strict small-without-quality-loss website requirements. Earlier portrait photo sets are not altered.

## Appearance and style fidelity

- Silver-tone rounded rectangular outer case, gold-tone stone-set inner bezel and gold right crown; not the previous all-gold-frame plain-stud model.
- White/silver dial, large decorative gold-tone Roman markers, small central panel and exactly three primary gold-tone hands.
- Distinct ornate bracelet: silver outer structure, gold connectors, alternating U/horseshoe and ring/oval motifs with clear-stone decoration. Do not substitute a straight jubilee chain.
- Clear/champagne-looking stones and their settings rendered separately; diffuse lighting, restrained highlights. No added starburst/glitter overlays, extra giant diamonds, material-grade or gemstone authenticity claim. No exact stone-count / physical product reconstruction certification.
- Soft blush/pink feminine theme. Glass and polished-metal highlights retained; recognizable phone/camera/photographer reflections and original holding fingers/cardboard removed. No invented open-clasp mechanism.

## Exactly three selected styles

1. `01-main`: full-product hero, user selected option 2. Main-only native Bengali **বাটারফ্লাই লক** label.
2. `02-wrist`: adult wrist presentation, user selected option 1. Clean, no added annotation.
3. `03-detail`: case/dial/stone settings and bracelet macro, user selected option 2. Clean, no added annotation.

All three generated sources inspected independently. Final square composition and localized dial/hand edits additionally reviewed. The detail shot deliberately shows stone facets and metal settings, without confusing studio highlights with proof of diamond type.

## Square format without stretching

Main/detail sources are natively **1024×1024**. Selected wrist source was **889×1180** despite the square prompt; safely crop `(0,145,889,1034)` to **889×889**, keeping the complete visible watch/crown/bracelet while removing surplus arm/background. No source stretch, product crop, whole-image upscaling, pixel resampling or fake native-4K claim. Every final master and website image is asserted square. Different native square pixel sizes are retained rather than quietly enlarging the wrist image for nominal consistency.

## Lettering correction and limits

Generators introduced inconsistent upper dial words and a wrong lower word on the detail shot. These are not accepted as manufacturer/movement information. `prepare-masters.py` replaces only those local neutral-ink regions with alpha-extracted raster marks from the actual second reference (native crops logged in `preparation-manifest.json`). Protected gold pixels preserve the foreground hands where they cross lettering. Reference wordmark remains inherently blurred; no guessed brand name is typed and no recovered missing-detail guarantee. Local raster marks are scaled/rotated to match each dial, not the whole photographic canvas. AI geometry/marking/hand-angle variations may still remain; these are commercial illustrative images, not documentary captures, authenticated products or a real customer testimonial.

## Product-specific benefits

Per the instruction to retain the preceding women's-watch details: butterfly clasp, **water resistant**, chain-color guarantee (no supplied duration), **seven-day replacement**, **six-month warranty**. Never turn replacement into refund, six months into a color-guarantee period, or water resistance into an unprovided depth/ATM/immersion rating. No price, solid-gold/silver, stainless-steel grade, gifts or previous SEIKO claims.

## Output / lossless policy

`downloads/womens-stone-twotone/`: three square PNG masters, smaller pixel-verified lossless website files, Bengali display name/short/detailed copy and production notes. `downloads/MIQA-Womens-Stone-Twotone-Square-Three-Styles.zip`: complete package.

Compare lossless WebP with optimized full-color PNG at each canonical square size; choose the smaller only after exact decoded RGBA equality and ICC preservation. No arbitrary byte cap, lossy quality=100 substitution, palette quantization or blurred stones. Exact dimensions, bytes, savings, format and SHA-256 in `set-manifest.json`. Master is defined after intentional square crop, reference-lettering correction and main label; pixel equality is not claimed against the user's original camera photograph.

## Reproduce

Python with Pillow/numpy/opencv-python-headless, existing Node canvas dependency and Bengali font:

```
python media/womens-stone-twotone/prepare-masters.py
node media/womens-stone-twotone/compose.mjs
python media/womens-stone-twotone/optimize.py
```

References inspected for GPS EXIF before publishing: no GPS tags. No app, frontend/backend, database, website, video, configuration or deployment changes. Latest square/three-style/website compression instructions are recorded in the root photo preferences and workflow documents.
