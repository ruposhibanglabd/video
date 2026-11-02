# MIQA watch photography — latest user preferences

Saved 2026-11-02 at the user's request. Read with `MIQA-VIDEO-STYLE-GUIDE.md` before the next media task. Durable repository notes, not a promise of automatic memory in unrelated chats.

## Latest instruction takes precedence

The user's long parenthetical brief was explanatory, NOT a requirement to follow every example literally. Final clarification: make **three distinct photographs of the same supplied watch: one worn on a wrist, the other two composed at the assistant's discretion**. A complete-product hero and a detail/macro are sensible defaults for the other two, not rigid additional requirements. Background choice is the assistant's, suited to a believable premium presentation; solid color/contact shadows are an option, not mandatory.

## Image production

- Wait for the new watch reference image(s); inspect the dial, hands, indices, proportions, crown, case, strap/bracelet links, clasp, colors, finish and markings before generation.
- Generate new product photography from references; preserve the actual watch, not a lookalike redesign. Never invent extra hands/complications, colors, manufacturer/model markings or MIQA branding on the product.
- Three separate images, not a collage. One natural wrist-worn view with correct anatomy/fit. Compose the other two independently to show the product well.
- Aim for realistic premium commercial photography, plausible skin/metal/leather, controlled reflections and contact shadows. Avoid plastic/cheap/obviously synthetic styling, distorted anatomy and fake luxury props. Do not guarantee that AI images are indistinguishable from real photography or pixel-identical to inventory.
- Established emerald/champagne MIQA direction remains a useful reference. Latest instruction allows assistant-selected backgrounds/compositions; never recolor the actual watch to fit a theme.
- Review final outputs against the new reference, including product geometry, small details and wrist anatomy.

## Conditional butterfly-clasp annotation

- Only when the user confirms a butterfly clasp and requests annotation: add Bengali label **বাটারফ্লাই লক** and a suitable matching clasp inset **on the main product image only**. Leave the other two photos free of that annotation.
- Generate the base photograph first; add the label/inset with code afterward, using proper Bengali fonts and aspect-preserving placement. Do not ask the image generator to draw the label or risk damaging the watch beneath it.
- Prior campaign generated open-clasp image exists at `downloads/longines-batch-01/09-chain-butterfly-clasp.png`. It is a gold LONGINES-campaign illustration, **not a verified photograph of a future watch's exact lock**. Use as a visual reference only unless it matches the new product; do not paste a gold bracelet clasp onto another finish/model as if factual.
- Do not assume butterfly clasp from unrelated prior campaigns. Ask for a matching clasp photo only when necessary to resolve a consequential mismatch, not automatically.

## Copy accompanying the images

When the user supplies the watch and its features, provide a suitable product/display name, a short description and a detailed description in copy-ready Bengali. Identify a proposed display name as such outside the copy if needed; do not invent an official model/reference. Use only supplied/visually established facts; no invented price, materials, waterproof rating, warranty, authenticity or manufacturer authorization. Do not insert “বিক্রয়কারী বলছে”, “বিক্রেতার দাবি অনুযায়ী” or similar attribution into the customer-facing copy. Omit or clarify uncertain claims rather than making them up.

## Saving and delivery — NO PUSH

For this image workflow, save finished files and accompanying copy in the repository and make a **local Git commit on the session's assigned branch only**. **Do not push**, open a PR or deploy without new explicit authorization. Present local deliverable files to the user; do not manufacture GitHub download links for unpushed files. This overrides older push-on-delivery advice for the upcoming image work. No app/frontend/backend/database/configuration changes.

## Video work retained

Prior completed source, media and QA are preserved in Git. See the video guide and individual campaign READMEs; do not regenerate them merely to remember them.

- TISSOT: `media/tissot-2026/`, `downloads/MIQA-TISSOT-*`; published production commit `b6f65de40352e55ab2832014e7278f814fadfd3c`. 40 s, 15 scenes, UHD + 1080p; ten generated photos, eight Bengali voice clips. That campaign alone: ৳১,৫০০, waterproof, 100% leather, one-year warranty, free premium box + battery, **no chain cutter**.
- LONGINES: `media/longines-2026/`, `downloads/MIQA-LONGINES-*`; 48 s, UHD + 1080p; campaign commit `bcd95ccf972d10be6a7620c6a945ab07ffd0030e`.
- SEIKO premium V2: `media/seiko-premium-v2/`, `downloads/MIQA-SEIKO-Premium-V2-*`; campaign commit `7378232ad634c7a065758c65b288c5bedd539d75`.
- Earlier approved emerald/champagne reference: `downloads/MIQA-Butterfly-Lock-Set-A-Reel-4K.mp4`.

Prices, offers, warranties and clasp facts are product-specific; never carry them to the next watch by default. Existing video direction includes immediate product opening, separate retailer/manufacturer identity, matched spoken-feature visuals, premium Bengali narration, mobile-safe typeset text, 4K/social exports and full technical/visual QA. Preserve honest disclosure that generated photo sources are upscaled, with native-UHD graphics.

## Website delivery and research update — 2026-11-02

User will use these images on the website: make files as small as possible **without any quality loss**. Do not start producing new watch photographs yet; user is gathering the workflow first. User says they have supplied a butterfly-clasp reference: prioritize their actual matching reference, not the generated gold LONGINES image. Identify/inspect the actual supplied file before using it; do not falsely claim an unidentified attachment was inspected.

### Strict compression policy

- Default to genuinely **lossless** delivery. A high lossy quality setting, even 100, is not proof of losslessness. Do not quietly reinterpret “no quality loss” as merely “looks similar.”
- Preserve the finalized photographic master. Test lossless WebP against optimized full-color PNG at the same dimensions, then choose the smaller verified lossless file for the website. Do not palette-quantize, reduce colors, blur details, or resize simply to meet a byte cap.
- Compare decoded pixels against the canonical master (RGBA where needed); require equality for a claimed pixel-lossless conversion. Preserve intended color management/ICC and correct orientation; do not strip color profiles indiscriminately. Normalize any necessary orientation/color conversion before defining the master used for equality checks.
- Strip only unnecessary metadata. Inspect watch markings, dial hands/indices, metal edges, skin, strap texture, gradient banding and any Bengali typography at 100%/zoom and phone-sized display.
- Record dimensions, exact bytes and actual savings. No guaranteed KB/MB cap before seeing the image: texture and dimensions determine attainable lossless size. Do not sacrifice quality to claim an arbitrary 100/200 KB target.
- WebP/AVIF lossy or reduced-size responsive copies are optional only with user authorization and clear labeling; never substitute them for the strict full-quality deliverable. AVIF is a candidate, not an automatic winner or a guaranteed lossless encoder setting.
- For Facebook, provide a separately suitable JPEG/PNG upload copy if needed, retaining the lossless website file/master. Do not promise that platform-side recompression preserves every pixel. Do not implement website image pipelines or modify/deploy the site as part of this media task.

### Art direction distilled from online research

- Use complementary coverage rather than three almost-identical angles: clear full-product hero, natural wrist context/scale, and a deliberate detail view are the current preferred plan, while respecting the user's freedom for the two non-wrist compositions.
- Main listing image: product is immediately identifiable; dial readable; distracting props/background clutter kept away. Consistent crop, subject scale, color and lighting across the collection. A white background is not mandatory for this own-website brief.
- Wrist image: plausible fit, natural anatomy/skin, honest proportions; no exaggerated apparent case size or invented millimeter specification. Watch remains the subject, not clothing or model identity.
- Detail view: show a genuinely present feature such as crown, case edge, bracelet links, leather grain or confirmed clasp. Do not invent internal mechanisms or change the actual watch hands/indices just because a photography article recommends 10:10.
- Broad soft light and controlled reflections reveal real metal and crystal while preserving dial legibility. Avoid both blown highlights and featureless dark cases, excessive HDR, plastic texture, heavy beautification and impossible highlights/contact shadows.
- Plan restrained compositions that can crop cleanly for product cards and social feeds. Website square and Facebook feed portrait are possible export choices, not universal platform requirements; decide the final crop from the real watch/reference and requested placement. Keep conditional clasp annotation on the main image only and add it programmatically after generation.
- Do not copy another seller's photo or promise that a particular composition will guarantee sales. Research informs original art direction; it does not establish new product claims.

### Sources consulted

1. Shopify, “Product Photography: A DIY Guide for Beginners” (2026): clean consistent product presentation, complementary product/lifestyle/detail coverage, multiple angles, true colors. https://www.shopify.com/blog/12206313-the-ultimate-diy-guide-to-beautiful-product-photography
2. Watchonista, “A Crash Course in Taking Good Watch Photos with Your Phone” (2024): diffuse lighting, crystal reflections, angle and wrist placement. https://www.watchonista.com/articles/opinions/how-crash-course-taking-good-watch-photos-your-phone
3. web.dev, “Image performance”: modern image formats, distinction between lossy and lossless compression, responsive image delivery. https://web.dev/learn/performance/image-performance

Research completed; no new product images generated or website changes made. Local Git only; **no push** remains in force.

## Completed first photo set — SEIKO VIP blue/gold (2026-11-02)

User supplied `image-2.png`: round blue sunburst dial and gold-tone steel bracelet, SEIKO VIP dial markings. Confirmed butterfly lock like our existing gold reference, stainless-steel chain, premium quality, color guarantee and waterproof feature; no rating/duration/price supplied. User particularly requires visible crystal glass. Three selected images completed: full-product with separately coded Bengali lock footer/inset, natural wrist view, dial/crystal detail. Only main image has annotation. Inset explicitly illustrative. Source/scripts/reference hash/QA and final-byte manifest: `media/seiko-blue-gold-photos/`. Final pixel-lossless 2048×2048 WebPs and copy: `downloads/seiko-blue-gold/`; bundle `downloads/MIQA-SEIKO-Royal-Blue-Gold-Photos.zip`. Main uses native 1600px photo without upscaling inside a 2048px coded canvas. Final sizes 1,285,042 / 3,114,002 / 4,479,334 bytes; strict lossless priority means no arbitrary KB target. Reviewed sources/main composition; equal decoded RGBA pixels to finalized masters verified. Proposed display name “SEIKO VIP Royal Blue Gold” is not an official model reference. No previous campaign offers inherited. Saved locally in Git; **not pushed**.
