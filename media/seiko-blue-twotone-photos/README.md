# SEIKO VIP blue / two-tone — website photo trio

2026-11-02. New customer reference `image-4.png` (same photo attached twice). User says features are the same as the previous blue/all-gold set: premium quality, stainless-steel chain, butterfly lock, color guarantee and waterproof. Do not inherit any prior video price, free gifts, one-year warranty or depth rating. Gold/silver refer to finishes, not precious-metal content. No official model, movement, glass material, case size or guarantee duration is established.

## Identity and creative treatment

The new watch differs from the previous all-gold version: silver case/lugs and ridged crown, narrow gold bezel, predominantly silver bracelet with a narrow gold center stripe, blue sunburst dial/blue outer ring, gold Roman XII/IX/VI, triple-bar right marker and batons, SEIKO/VIP markings, three hands and date window showing 13. All three photographic sources are newly generated from the reference. The chosen wrist image had an extra hand corrected, then was reviewed for three hands, natural anatomy, product colors and fit. Crystal edge and coherent reflected light remain visible without masking the dial. Main and macro are complementary full-product and dial/crown detail views.

`clasp-illustration.webp` is a newly generated two-tone illustration based on this bracelet color scheme and the previously accepted butterfly mechanism reference. It is not a verified photograph of the hidden clasp of this individual unit. Unlike the previous set, the inset is not the old all-gold bracelet. The main image labels it “লকের উপস্থাপনামূলক ছবি”. No labels/insets on wrist or detail images. No original customer pixels are composited.

## Final files and compression QA

- `downloads/seiko-blue-twotone/01-main.webp`: **1600×1600**. Native selected 1254×1254 photo placed without enlargement/cropping into a native-coded canvas with Bengali lock footer and matching two-tone inset.
- `downloads/seiko-blue-twotone/02-wrist.webp`: **896×1195**, retained native portrait dimensions, not artificially upscaled to match other files.
- `downloads/seiko-blue-twotone/03-detail.webp`: **2048×2048**, native selected detail photograph.
- `downloads/seiko-blue-twotone/product-copy.md`: proposed display name, short and detailed Bengali copy using only confirmed/visible features. Display name is not an official model/reference.

Strictly lossless website exports. Each finalized source/master tested as lossless WebP and optimized full-color PNG; smaller WebP chosen. No resizing, quantization, lossy encoding or deliberate texture reduction for byte savings. Decoded RGBA pixels **equal the finalized masters**; ICC profile preservation verified. Exact dimensions, byte sizes, alternatives and SHA-256 are in `manifest.json`. Compression fidelity is not a claim that AI images reconstruct the physical watch pixel-for-pixel; generated fine details may differ. No blanket claim that every source is native 4K or 2048px. Facebook-side recompression is not tested or guaranteed.

Reviewed all selected source images, corrected wrist and the coded final main composition. Crystal edge/highlights, readable dial/date, silver/gold segregation, bracelet continuity and three-hand layout checked. Bengali text is added programmatically with the existing licensed Noto Sans Bengali font. Insets maintain aspect ratio; edge feathering affects photographic background margins, not the product. Main product stays unobscured.

## Reproduction

Existing npm dependencies and Python Pillow/numpy required. Retained `source-main.webp` and `clasp-illustration.webp` preserve their generated pixels losslessly.

```
node media/seiko-blue-twotone-photos/compose.mjs
.venv/bin/python media/seiko-blue-twotone-photos/optimize.py
```

For absent scratch wrist/detail PNGs, optimizer uses the retained final lossless files as equal-pixel masters. No app, backend, database, configuration or deployment changes. Prior photo set is unchanged. User requested GitHub Raw delivery and explicitly authorized push in the immediately preceding exchange; this continuation uses the same branch and verified raw-file delivery workflow.
