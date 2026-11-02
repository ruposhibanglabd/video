# SEIKO VIP Aqua Gold — website photo trio

2026-11-02. Two customer references: `image-5.png` and `image-6.png`, same turquoise/aqua-dial gold-tone watch. User says same method/details as the previous photo sets: premium quality, stainless-steel chain, butterfly lock, color guarantee and waterproof. No price, time-limited warranty, depth/pressure rating, movement, glass material, case size or official model number is established. Gold is a finish/color, not a solid-gold claim. Do not inherit prior video offers.

## Product and composition

Bright turquoise/cyan sunburst dial and lighter concentric outer ring; gold-tone case/crown/plain bezel and full multi-link gold-tone bracelet. Preserve SEIKO / VIP markings, Roman XII/IX/VI, triple-bar right marker and slim batons, three hands and date 12. New full-product, natural wrist and dial/crystal/crown macro photographs use both uploads as references. No original hand, cardboard, shop or customer product cutout is composited. Selected sources reviewed for color, proportions, hands/markers/date, anatomy and visible crystal. Transparent rim and coherent light reflections establish the glass rather than a bare exposed dial; no sapphire/coating claim.

Main only: coded footer with Bengali “বাটারফ্লাই লক”, steel-chain label and aspect-preserving gold butterfly inset. Inset uses the previously accepted generated gold illustration `downloads/longines-batch-01/09-chain-butterfly-clasp.png`, explicitly captioned illustrative; not a verified hidden-mechanism photograph of this unit. Other two images have no annotation. Licensed Noto Sans Bengali typography is composited after generation, never baked by the image model. Background edge feathering integrates the selected main photograph without covering the product.

## Final files and strict lossless QA

- `downloads/seiko-aqua-gold/01-main.webp`: **2560×2560** coded canvas with the **native 2048×2048** full-product photo placed at native scale, not upscaled. Additional canvas accommodates the footer.
- `downloads/seiko-aqua-gold/02-wrist.webp`: **1024×1536**, native selected portrait, not stretched/upscaled.
- `downloads/seiko-aqua-gold/03-detail.webp`: **2048×2048**, native selected macro.
- `downloads/seiko-aqua-gold/product-copy.md`: proposed display name, short and detailed copy-ready Bengali descriptions. Display name is not an official reference/model designation.

Lossless WebP and optimized full-color PNG compared for each finalized master; WebP smaller in all cases. No resizing, palette quantization, lossy compression or texture removal to achieve a byte cap. Decoded RGBA equality to the finalized masters and color-profile preservation verified. Exact bytes, alternate PNG sizes and SHA-256 in `manifest.json`. All final files fully decoded before delivery; coded main reviewed after final background integration. Compression fidelity does NOT prove pixel-identical physical-product reconstruction. All photographic sources are AI-generated and may have fine-detail variation. No native-4K photo or Facebook recompression guarantee.

## Reproduce

Existing npm dependencies and Python Pillow/numpy. `source-main.webp` retains the selected unannotated main photo losslessly. Other two final lossless files can serve as equal-pixel masters when temporary original PNGs are unavailable.

```
node media/seiko-aqua-gold-photos/compose.mjs
.venv/bin/python media/seiko-aqua-gold-photos/optimize.py
```

Final delivery follows the user's newly authorized GitHub Raw workflow on the session's assigned branch, with remote bytes/hashes checked. Earlier photo sets and video sources remain unchanged. No app/frontend/backend/database/configuration/deployment modifications.
