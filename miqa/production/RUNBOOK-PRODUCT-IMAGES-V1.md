# Archived V1 product-image workflow

> superseded by PRODUCT-IMAGES-GUIDE.md V2 and DECISIONS D32–D35. Do not use this cutout/chip workflow for new website images.

## 9. Website product images (2000×2000)

Rules, layout and the client's verbatim instruction: `creative/PRODUCT-IMAGES-GUIDE.md`. Numbers: `brand/design-tokens.json → product_images`.

Setup (lost between sessions):
```bash
python3 -m venv /tmp/venv && /tmp/venv/bin/pip install numpy scipy pillow opencv-python-headless pymatting
npm install   # provides @napi-rs/canvas for text
```

1. **Inspect** every client photo with `read_file` (zoom crops via `convert -crop`). Write the invariants list into `products/<slug>/brief.json`, the same as video step 2. The bracelet link structure is the client's top concern.
2. **Cutout.** Keep the originals untouched in `work/src/`.
   - Plain background: sample the border colour, build a Lab-distance mask, then run `cv2.grabCut` (mask init, 5 iterations).
   - Trimap: erode 6–10 px for foreground, dilate 6–10 px for the unknown band.
   - Run `pymatting.estimate_alpha_cf` on a copy no larger than 1500 px on the long side (RAM limit). Upsample the alpha with Lanczos, then run `estimate_foreground_ml` to remove colour spill.
   - Check the bracelet link gaps and the clasp at 200%.
   - Busy background or failed edges: ask the client for a plain-background photo.
3. **Background:** a numpy radial gradient using the category tokens (lift at the watch centre, base in the middle, edge at the corners). Add 0.5% mono grain and dither before 8-bit to avoid banding. Use identical settings for every product in a category.
4. **Shadows** (light from top-left):
   - **Contact:** alpha squashed to 10–15% height at the bottom edge. Blur 12–20 px, opacity 0.45–0.6, tinted with `shadowTint`.
   - **Soft drop:** alpha offset by (+24, +40) px. Blur 70–90 px, opacity 0.18–0.28.
   - **Reflection** (upright and angle shots): flipped cutout × linear fade from 0.12 to 0 over 25% of the object height. Blur 2 px.
5. **Composite** in float32.
   - Never recolour product pixels. Only global exposure, contrast or white balance (±10%).
   - Resize with Lanczos only, at most 2× upscale for close-ups. If the source is too small, frame wider instead.
   - No generative upscaler or AI redraw on the watch.
6. **Primary label** with `@napi-rs/canvas` (same pattern as `tools/style-board.mjs`).
   - Register fonts from `brand/fonts` by file name. Draw the chip, ring and text per tokens.
   - The text must be **exactly** the client's wording. No `letterSpacing` on Bengali.
   - Inset: a circular crop of the client's real lock photo, never an icon. If the client supplied a standard inset photo "for all", store it in `brand/feature-insets/` and reuse it.
7. **On-wrist** (guide §6):
   - Make a hands-only plate with `generate_image` (prompt skeleton in §5, plus "solid <category colour> background, square 1:1"). Upscale it to 2000 (Lanczos + light unsharp mask).
   - Place the real cutout. Case width ≈ 35–45% of the wrist width for women, 45–60% for men.
   - Perspective-warp the whole watch only. Never bend the case, dial or links.
   - Fade the bracelet where it wraps behind the wrist: 20–40 px soft mask plus a darkening gradient. Add a contact shadow on the skin (opacity ≈ 0.35).
   - Reject plates with wrong anatomy.
8. **Export:**
   - `convert in.png -colorspace sRGB -strip -sampling-factor 4:4:4 -quality 92 out.jpg`. Use quality 88 if a file is over 1.5 MB.
   - ZIP, from the job's delivery folder: `python3 -m zipfile -c <slug>_website-images.zip website-images/*.jpg`.
9. **QC** (guide §10), then commit and send the raw links.
10. **Set → video** (guide §8): reuse the same cutouts and backgrounds, follow §3, and use the collection structure from the guide.

### 9a. Lessons from job 01 (FIYOTA Silver, phone photos on a display card)
- **Pick the sharper photo.** Use Laplacian variance on the dial and the bracelet (127 vs 228 decided it).
- **GrabCut seeded with hand-placed preview polygons works well** on a white card held in the hand. Use probable-FG outer, definite-FG cores and definite-BG outside a 31 px dilation, at half resolution. Then refine edges with a guided filter (r=9, eps=2e-3) at full resolution.
- **Dim phone light makes steel look grey on pink.** Apply levels ÷0.84, then gamma 0.8, then an S-curve on metal only (dial excluded). Lift the bracelet floor (0.24 + 0.76·x) so heavy dark reflections read as polished steel.
- **Photographer and phone reflections on links:**
  - Chroma → 12% inside the bracelet mask (case and crown excluded).
  - Inpaint camera-lens dots: L<78, erode 7 px to split touching dots, keep round blobs (circularity >0.55, aspect <1.9), grow back geodesically, then Telea inpaint r=5.
  - Black-hat detection over-inpaints and smears. Don't use it.
- **Primary composition when the bracelet runs out of frame:** fade both bracelet ends (smoothstep over ~250 canvas px) so the bottom stays free for the chip.
- **On-wrist:** see `tools/product-images/README.md`. The first plate framed the wrist too small; ask for a "close-up, wrist ≈ half frame height".
- **Naming:** European women's names are mostly taken by watch brands (Odette, Linnea, Elara, Solenne, Seraphine). Try coined names first.
