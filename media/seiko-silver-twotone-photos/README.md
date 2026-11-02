# SEIKO VIP Silver Two-Tone — corrected website photo trio

2026-11-02. Original references `image-7.png` / `image-8.png`. User confirmed same previous product features: premium quality, stainless-steel chain, butterfly lock, color guarantee and waterproof. No rating, guarantee period, price, movement, glass material, case size, authenticity or official model-reference claim is invented. Silver/gold are finishes, not precious-metal content. Proposed retail display name: SEIKO VIP Silver Two-Tone.

## Rejected set vs replacement

`REJECTED-QA.md` retains the earlier failure history. User attachments `image-9.png`–`image-12.png` were rejection examples, not approvals. None is used as a final photograph. New scratch directory `.tmp/seiko-silver-twotone-v2/` keeps the replacement separate. User selected a new wrist and detail view; initial replacement main auditions were not selected. Further main corrections were inspected rather than silently approving the failed auditions. Final main is a new corrected photographic composition, not a pixel-for-pixel recreation of the original.

## Review and limitations

Reviewed native source images and the final three-image review sheet: each final image has **three primary clock hands sharing one pivot**, no earlier five-hand artifact; neutral silver/grey sunburst face with pale outer ring, gold markers/SEIKO VIP/date 8; silver case and right crown; thin gold bezel and silver-dominant bracelet with narrow gold center. New wrist has natural fit/anatomy, detail shows dial/case/crown and links. Crystal lip/controlled reflections stay visible. Tiny hand counterweights/shadows must not be counted as additional full hands. Main hand directions differ from the wrist/detail; do not claim identical frozen time or exact pixel identity across generated views. Fine generated geometry/markings may differ from inventory; all sources are AI-generated, not documentary photographs or original customer cutouts.

Only main has separately coded Bengali label and a two-tone illustrative open-clasp inset, using `media/seiko-blue-twotone-photos/clasp-illustration.webp` from the same previously authorized style. Caption explicitly says illustrative, not an exact hidden-mechanism photograph of this unit. Licensed Noto Sans Bengali used after image generation. Bracelet/material labels are not added to the two other images. Background edge feathering does not cover the watch.

## Final files and strict lossless QA

- `downloads/seiko-silver-twotone/01-main.webp`: **1024×1536** coded canvas with native **896×1195** generated full-product source at its native scale, no enlargement. Footer occupies new canvas below the complete photograph.
- `downloads/seiko-silver-twotone/02-wrist.webp`: **1776×2368**, selected native portrait.
- `downloads/seiko-silver-twotone/03-detail.webp`: **1024×1536**, selected native detail view.
- `downloads/seiko-silver-twotone/product-copy.md`: copy-ready short/detailed Bengali description, plus proposed display name clearly separate from official-model claims.

All final website files use true lossless WebP, compared with optimized full-color PNG and selected as smaller. No lossy compression, resizing, palette quantization or texture destruction to hit an arbitrary byte cap. Decoded RGBA pixels and ICC profiles verified equal to finalized masters. Manifest records dimensions, bytes, PNG comparisons and SHA-256. Wrist is texture-heavy and remains about 6.05 MB to honor strict no-quality-loss instruction; do not claim all files are below 1 MB or that compression proves reference-product fidelity. Facebook-side recompression not tested/controlled.

## Reproduce

Existing npm dependencies + Pillow/numpy. Source main retained as a pixel-lossless WebP; original customer photos excluded. Optimizer uses native wrist/detail PNGs when available and final lossless WebPs as equal-pixel masters otherwise.

```
node media/seiko-silver-twotone-photos/compose.mjs
.venv/bin/python media/seiko-silver-twotone-photos/optimize.py
```

GitHub Raw delivery follows user's explicit authorization. Verify remote hashes before sharing links. No app, backend, database, config or deployment changes; previous completed color sets unchanged. This record marks reviewed replacement outputs, not a claim that the user has approved the replacement main image.
