# SEIKO VIP blue / gold — three website photographs

Created 2026-11-02. User reference: `/tmp/arena-coding-uploads/image-2.png`. This campaign is separate from all previous SEIKO video offers.

## Confirmed brief

Round gold-tone watch/bracelet, blue sunburst dial, SEIKO / VIP markings, Roman XII/IX/VI and right-side triple-bar marker, gold baton indices, three hands, date aperture. User confirms premium quality, stainless-steel chain, butterfly lock like the previously available reference, color guarantee and waterproof feature. The glass must look visibly present without masking the dial. No confirmed price, case dimensions, movement, glass material, waterproof rating or guarantee duration; none is invented. Gold tone is a finish/color, not a claim of solid gold.

## Deliverables

`downloads/seiko-blue-gold/` contains:

1. `01-main.webp`: full product and bracelet; native selected 1600×1600 photo placed without resizing/cropping into a 2048×2048 coded composition. Footer has an aspect-preserving clasp illustration and correctly typeset Bengali “বাটারফ্লাই লক”, stainless-steel chain text, and illustrative-inset caption.
2. `02-wrist.webp`: natural wrist-worn image, 2048×2048. No feature labels/inset.
3. `03-detail.webp`: dial/crystal/crown macro, 2048×2048. No feature labels/inset.
4. `product-copy.md`: proposed display name, short and detailed copy-ready Bengali descriptions. Display name is not an official model/reference.

`downloads/MIQA-SEIKO-Royal-Blue-Gold-Photos.zip` bundles the three images and copy. The square 2048 main canvas does not imply 2048px photographic source detail; the product photo itself remains at its native 1600px scale. Other two selected photos are native 2048px square. All are AI-generated photographic sources; fine details can differ from physical inventory. No claim of pixel-identical AI reconstruction or documentary authenticity.

## Image QA and compression

- Reviewed all three selected sources against the customer reference: blue dial, gold-tone finish, round case/right crown, date window, hands/markers and multi-link bracelet. Natural wrist fit/anatomy; no extra complications.
- Crystal rim and controlled highlights/reflections remain visible. Wrist image has a distinct upper-crystal highlight; macro shows rim and a soft glass reflection; full-product image retains a visible crystal edge and subtle sheen. No sapphire, anti-reflective coating or scratchproof claim.
- User authorized the previously available gold butterfly-lock style. Inset uses `downloads/longines-batch-01/09-chain-butterfly-clasp.png`, a generated earlier illustration, not a newly verified photograph of this exact watch's hidden mechanism. Main image explicitly labels the inset as illustrative; no actual customer-image pixels are composited.
- Bengali typography and lock inset are added with code after image generation. Entire product remains unobscured; only background edge margins are feathered for canvas integration.
- No lossy compression, resizing, blur or palette quantization for final website exports. Opaque redundant alpha may be removed; decoded RGBA pixels remain identical.
- Each finalized photographic/composited master was encoded as both lossless WebP (method 6 / effort quality 100) and optimized full-color PNG; smaller lossless WebP selected in all three cases.
- **All final decoded RGBA pixels are equal to their finalized masters**, verified with NumPy. ICC profile preservation checked. This proves compression fidelity, not identity between the generated watch and the reference photograph.
- See `manifest.json` for exact dimensions, sizes, format comparisons and SHA-256. No arbitrary KB cap; texture-heavy photos need more bytes for strict pixel-lossless delivery. Facebook-side recompression is not controlled or tested here.
- Original received image, scratch comparison files, unselected candidates and redundant PNG exports are not included in final package.

## Reproduce compositing / export

Existing npm dependencies plus Python Pillow/numpy are required. The retained `source-main.webp` is a pixel-lossless copy of the selected unannotated main photograph. Existing clasp asset and licensed Noto Sans Bengali font remain in repository.

```
node media/seiko-blue-gold-photos/compose.mjs
.venv/bin/python media/seiko-blue-gold-photos/optimize.py
```

Optimizer uses selected scratch wrist/detail PNGs when available, or retained final lossless WebPs as equal-pixel masters otherwise. No website/app/backend/database/configuration changes. Local Git commit only: **do not push or deploy without explicit new authorization**.
