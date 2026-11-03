# Women's gold-frame / two-tone bracelet — three-style photograph set

2026-11-03. User supplied `image-15.png` / `image-16.png`, requested the same product benefits as the preceding women's watch, and explicitly specified: **frame color matches the GOLD center of the bracelet**. This is a different rectangular-case design from the previous all-silver cushion-case Set A; files are separate and the earlier set is untouched. No new set letter or official model number invented.

## Confirmed appearance / benefits

- Compact rectangular gold-tone exterior frame/case, stepped paired horizontal bars top/bottom, short open-space lugs; gold-tone fluted crown.
- Case/frame hue matches the warm gold-tone CENTRAL bracelet links. Bracelet OUTSIDE links remain SILVER. Bright/silver-toned reflections at glass/lugs must not be mistaken for an instruction to recolor the case silver.
- White/ivory dial, four small gold-tone stud indices, exactly three primary gold-tone hands; not gemstone indices, not the prior silver cushion case, not a date/Roman numeral redesign.
- Butterfly clasp; water resistant (not unrestricted waterproof); chain-color guarantee without specified period; 7-day replacement (not refund); 6-month warranty.
- Do not inherit a 1-year warranty, SEIKO prices, gifts, waterproof rating, authenticity, case/bracelet alloy, solid-gold/diamond or unconfirmed frame-color guarantee.

## Three mandatory distinct styles

- `01-main`: complete-product hero, user selected option 2; only this image receives code-typeset Bengali **বাটারফ্লাই লক** label.
- `02-wrist`: adult wrist context, user selected option 2; natural anatomy/fit and no added text/inset.
- `03-detail`: close dial/glass/crown/links, user selected option 1; no added text/inset or invented open mechanism.

All retain a soft blush/pink feminine theme and the corrected gold-frame / silver-outer / gold-center distinction. Original selected source images retained separately; no rejected candidate included. References copied into `references/`. Main/wrist/detail original sources and composed masters visually inspected, with additional localized lettering/hand review.

## Dial lettering correction / honesty

The original wordmark is blurred. The selected generators produced inconsistent legible-looking names across images, so these must not be delivered as factual manufacturer identity. `prepare-masters.py` removes only that generated neutral ink locally (protecting gold hands/markers) and transfers an alpha-extracted raster of the actual supplied reference lettering into all three views. No guessed brand is typed. Original source crop `[502,638,606,669]` from `reference-02.png`; scale/rotation follows each dial. A local cropped mark is resampled to fit the close-up, but the whole photographic canvas is never enlarged/reduced. This retains the original uncertainty; it does not recover missing text detail or verify brand spelling. Small geometric/hand-angle variations remain possible in AI photography; no physical inventory-identity guarantee.

## Files and resolution

`downloads/womens-gold-frame-twotone/` contains three native PNG masters, three pixel-verified lossless website copies, and Bengali copy. `downloads/MIQA-Womens-Gold-Frame-Twotone-Three-Styles.zip` bundles the three website copies and three PNG masters plus metadata/copy.

Native photographic canvases: **main 768×1376**, **wrist 1792×2400**, **detail 1792×2400**. No whole-image resize, no native-4K claim, no palette quantization or arbitrary KB target. Strict lossless WebP versus optimized full-color PNG is tested; use the smaller format only after decoded RGBA equality and matching ICC metadata. Final bytes/dimensions/hashes/savings in `set-manifest.json`. Canonical master is after intentional reference-wordmark correction and main-only label, not an assertion of pixel equality with the customer's photograph.

## Reproduce

Python environment with Pillow/numpy/opencv-python-headless plus the existing Node canvas dependency and Bengali font:

```
python media/womens-gold-frame-twotone/prepare-masters.py
node media/womens-gold-frame-twotone/compose.mjs
python media/womens-gold-frame-twotone/optimize.py
```

Inspect generated sources, local wordmark edits, primary hand count, frame/center-link color match, natural wrist appearance and all final styles. Follow the existing three-style completion gate and strict pixel-lossless delivery policy in `MIQA-PHOTO-WORKFLOW.md`. No video, website/frontend/backend/configuration/deployment changes.
