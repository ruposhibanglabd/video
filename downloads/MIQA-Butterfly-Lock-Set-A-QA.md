# Patek Philippe watch advertisement — revision 4

Date: 2026-10-30

## Correct product and retailer identity

- Product name: **Patek Philippe** watch, butterfly-lock chain version / Set A.
- Seller: **মিকা (MIQA)**, a watch retailer/supplier, not the manufacturer.
- Confirmed selling price: **BDT 1,650 / ৳১,৬৫০**.
- Product name is prominent in the hero, headers and final CTA. MIQA is identified separately as seller; no MIQA logo is applied to the watch body.
- Bengali narration now names the watch “পাটেক ফিলিপ” and the seller “মিকা”, not a letter-by-letter MIQA pronunciation.
- No independent manufacturer affiliation, authenticity certification or authorized-dealer status is claimed.

## Generated visuals only — latest user requirement

The current MP4 and scene-image ZIP display **AI-generated photographs only**, with editorial graphics/text added during compositing. No supplied original photograph or original photographic product cutout is loaded by the final renderer.

The user's photographs were used only as image-generation references. This explicitly supersedes previous revisions that used original clasp, chain or color cutouts.

The final renderer loads only a sixteen-image generated-scene directory. Its input list was audited for attachment paths, original watch/cutout loaders and the previous composite-scene directory. The generated-only preparation manifest records the generation output used for each scene.

Generated product imagery is a reference-based interpretation, not a pixel-identical documentary capture; original fine print, proportions and metal finishing can have AI variation. Product appearance was compared visually with the references. No new bracelet colors, date window, gemstone variant, strap version or technical specification was intentionally introduced.

## Finished MP4

- File: `MIQA-Butterfly-Lock-Set-A-Reel.mp4`
- Duration: 40.000 seconds
- Video: H.264 High, 1080 × 1920, progressive, 30 FPS, yuv420p
- Complete frame count: 1,200
- Audio: AAC-LC stereo, 48 kHz, approximately 192 kb/s
- File size: 14,947,950 bytes
- SHA-256: `1f45d10bc686fb1a0a60df31c41194b309bbd6977c52c66986a4cba6d1f28ec5`
- Fast-start MP4, moov atom at beginning

## Feature-to-visual synchronization

| Time | Spoken subject | Visual actually shown |
|---|---|---|
| 00:00–00:03 | Premium styling hook | Generated dial macro |
| 00:03–00:07 | Patek Philippe / butterfly-lock watch | Generated complete-watch hero and product name |
| 00:07–00:11 | Butterfly lock | Generated open-clasp macro |
| 00:11–00:12.67 | Chain-color guarantee | Generated chain-finishing photograph and restrained shield graphic |
| 00:12.67–00:14.33 | Waterproof feature | Generated watch with visible surface water droplets and droplet graphic |
| 00:14.33–00:16 | One-year warranty | Generated watch/card scene with accurately typeset “১ বছর ওয়ারেন্টি” and calendar graphic |
| 00:16–00:24 | Available color options | Five separately generated product photographs, sequentially presented |
| 00:24–00:25.70 | Office styling | Generated office wrist photograph |
| 00:25.70–00:27.30 | Formal styling | Generated suit/cuff photograph |
| 00:27.30–00:29 | Gifting | Generated gift presentation |
| 00:29–00:34 | 5% of net profit commitment | Generated emerald still life, seller identity and exact net-profit wording |
| 00:34–00:40 | Patek Philippe, BDT 1,650, order from MIKA | Generated final product hero, price and seller/order CTA |

The three benefit phrases and three lifestyle phrases were synthesized separately and positioned at their exact corresponding visual boundaries, rather than estimating word boundaries inside one long narration. Captions follow those same boundaries.

## Water/warranty/guarantee limitations

- Surface droplets are an illustrative product-feature visual, not evidence of testing, an underwater demonstration or a depth rating. No swimming, submersion or high-pressure resistance is depicted.
- The generated water image was corrected to avoid screw/rivet-like bezel additions and to make droplets visibly translucent.
- Chain-color guarantee, waterproof and one-year warranty remain seller-provided claims, not independently tested certifications.
- Warranty card is a graphic presentation prop, not a manufacturer authorization certificate or additional included-item promise.
- Gift packaging is illustrative and marked as such; no included packaging benefit is promised.
- The social commitment refers to **net profit**, not gross sales. No beneficiary photos, testimonials or completed-project claims are added.

## Scene-image ZIP

- File: `MIQA-Set-A-Cinematic-Scene-Images.zip`
- Sixteen generated-only scene photographs plus one finished price/order card; 17 JPEGs and one identification note.
- All scene JPEGs: 1080 × 1920.
- No original attachments or original cutouts are included in the ZIP.
- Size: 8,011,290 bytes
- SHA-256: `e74967339c4c0e99eb9d97ca0790ea5fd0e04a2c691f246b52efcff95d94af58`
- Archive integrity tested successfully.
- The complete MP4 is supplied separately; user assembly/editing is not needed.

## Technical quality checks

- Entire final video and audio decoded successfully with FFmpeg.
- Complete frame count verified: 1,200, matching 40 seconds at 30 FPS.
- Black-frame detection over the full video: no black intervals reported.
- Visual contact sheets reviewed at one-second intervals over the complete timeline, plus larger feature, warranty and final-CTA samples.
- Bengali text is rendered using licensed Noto Sans Bengali fonts during editing, not generated inside the photographs.
- Price and brand-name wording checked in overlays and narration.
- Audio: -15.7 LUFS integrated, 5.9 LU loudness range, -2.3 dBFS true peak; no clipping.
- Music and effects are original synthesized audio, with narration ducking and synchronized feature accents.
- This is a finished animated photographic advertisement using camera moves, light accents, typography and transitions, not newly filmed live action or a fully reconstructed 3D product simulation.

## Repository isolation

Only the MP4, scene ZIP and this QA document are updated. Existing app/frontend/backend, dependencies and production configuration are unchanged. No deployment was initiated.

Work remains on the fixed session branch `arena/297d3995-video`.
