# MIQA Production Runbook (technical)

Step-by-step for every product job. Read first: `../MASTER-BRIEF.md` → `../DECISIONS.md` → `../brand/BRAND-BIBLE.md` → the line's design guide → `../creative/PLAYBOOK.md` → `../creative/FEATURE-SCENE-LIBRARY.md`.

## 1. Environment (verified 2026-11-02)

```bash
cd /home/user/video && npm install                        # @napi-rs/canvas (Skia) + ffmpeg/ffprobe binaries
python3 -m venv /tmp/venv && /tmp/venv/bin/pip install numpy scipy fonttools opencv-python-headless pymatting
FF=$(node -e "console.log(require('@ffmpeg-installer/ffmpeg').path)")   # static ffmpeg (2018): libx264, aac, loudnorm, sidechaincompress, lut3d, zscale; NO xfade, NO amix normalize=
node miqa/tools/style-board.mjs                           # smoke test: fonts + Skia
```

**Network (bash):**
- Reachable: `github.com` (git push), `api.github.com`, `codeload.github.com`, npm, PyPI.
- Blocked:
  - `miqawatch.vercel.app` and its R2 image CDN
  - `raw.githubusercontent.com`
  - `objects.githubusercontent.com` (release assets)
  - `uploads.github.com` (no Release uploads)
  - Git LFS hosts
  - Hugging Face
  - Google Fonts CDN

**Consequences:**
- Product photos must be uploaded by the client in chat. `fetch_page` can read the site's text only.
- Delivery means committing the MP4 to the repo; each file must be under 100 MB.
- Fonts come via the GitHub API (`gh api -H "Accept: application/vnd.github.raw" repos/google/fonts/contents/ofl/...`).
- The `rembg` model can't be downloaded. Use OpenCV GrabCut + pymatting instead (§3, step 3).

**Measured performance (2 vCPU, ~3 GB RAM):**
- Rendering: a 2160×3840 frame (gradients, shadow, image, Bengali text, light sweep) takes ≈ 0.15 s for Skia draw + readback. With x264 `medium` at 4K the total is ≈ 0.35 s/frame. A 40 s / 30 fps video therefore takes ~7 min for simple scenes and 15–25 min for heavy layering.
- `generate_image` output is ≈ 768×1376. Upscale it only for defocused background plates (Lanczos + fine grain). The product layer always comes from the client's original photos.
- `generate_speech`: max 10 clips per turn and 1500 characters per clip.

## 2. Job folder

```
miqa/products/<YYYY-MM-DD>_<slug>/
  brief.json            # from templates/product-brief.template.json (client-confirmed)
  input/                # client photos, untouched originals (committed)
  analysis.md           # design invariants + photo notes
  script.md             # from templates/SCRIPT-SHOTLIST.template.md
  plates/               # final AI/procedural environment plates actually used (committed)
  cutouts/              # product RGBA layers (committed)
  audio/vo/*.mp3 · audio/music.wav · audio/sfx.wav · audio/mix.wav
  timeline.json         # scene/layer/camera/text/audio cues → renderer input
  qc/                   # contact sheet, safe-zone frames, loudness log, QC-REPORT.md
  work/                 # mezzanine, trials, frames — gitignored
miqa/deliveries/<YYYY-MM-DD>_<slug>/   # final files only (see ../deliveries/README.md)
```

## 3. Steps

1. **Intake:** use [templates/PRODUCT-INTAKE.md](../templates/PRODUCT-INTAKE.md). Ask only for what is missing. Fill in `brief.json`. Flag any trademark product names (Brand Bible §6).
2. **Analysis:** view every photo and write the **design invariants** in `analysis.md`:
   - dial colour and texture
   - hands (shape and colour)
   - number and type of indices/numerals
   - logo text on the dial
   - bezel shape and facets
   - crown position
   - case shape
   - bracelet link pattern or strap
   - clasp type
   - metal tone per colour variant
   Also note each photo's resolution and quality.
3. **Cutouts (never repaint the product):**
   - OpenCV GrabCut seeded with a rect, or flood-fill for plain backgrounds.
   - Build a trimap (erode/dilate), run `pymatting` (`estimate_alpha_cf`), then `estimate_foreground_ml`.
   - Check the edges on both a dark and a light plate.
   - Only global exposure/contrast tweaks are allowed. If edges fail, present the full photo framed instead (light sweep + vignette + parallax).
4. **Concept:**
   - Pick a new combination from the concept generator (PLAYBOOK §6) and log it in `products/CONCEPT-LOG.md`.
   - Write 3 hooks.
   - Write the script and shotlist.
   - Order the features per PLAYBOOK §4.
5. **Imagery:** follow §5 (fidelity tiers).
6. **Voice-over:** follow §6. Record the VO first. Its measured durations lock the timeline.
7. **Music + SFX:** follow §7, synthesised per video against the timeline markers.
8. **Render:**
   - Build or extend `miqa/engine/` on the first job, reusing patterns from `src/render/*.mjs` and the brand components from `miqa/tools/style-board.mjs`.
   - Modules: `fonts`, `timeline`, `layers` (transforms, pre-blurred DOF levels, contact shadow, floor reflection, light-wrap), `fx` (light sweep, bloom, grain, vignette, background grade), `type` (Bengali-safe text, metallic fill, reveals), `brand` (price tag, 5% seal, CTA card), `render` (Skia → ffmpeg pipe).
   - Render 2160×3840 @30 fps into a mezzanine file (§8).
9. **Mix:** §7, items 3–4.
10. **Encode:** 4K master (2-pass) + 1080 copy + covers (§8).
11. **QC:** run [QC-CHECKLIST.md](QC-CHECKLIST.md). Fix → re-render → re-check. Never say "final" while anything fails.
12. **Deliver:**
    - Copy the files to `deliveries/`, along with `AD-COPY.md`, `CREDITS.md` and `QC-REPORT.md`.
    - Commit and push. Merge to `main` if the client has agreed.
    - Send the raw download links.

## 4. Deliverables per job (Master Brief §11)

| # | Deliverable | File in `deliveries/<job>/` |
|---|---|---|
| 1 | Final cinematic MP4 | `<slug>_4K_2160x3840.mp4` |
| 2 | HQ vertical reel export | `<slug>_1080x1920.mp4` |
| 3 | Cover / thumbnail | `<slug>_cover_2160x3840.jpg`, `<slug>_cover_1080x1920.jpg` |
| 4 | VO and music info | `CREDITS.md` |
| 5–7 | Primary Text, Headline, Description | `AD-COPY.md` |
| + | QC result | `QC-REPORT.md` |

Also send direct download links in chat.

## 5. AI imagery — fidelity protocol

| Tier | What | Use for |
|---|---|---|
| **A (default)** | Real product pixels (cutout) composited into a generated/procedural environment. Relight with shadow, reflection and light-wrap; the product's hue is never changed. | Hero, reveal, every macro/detail, price, CTA |
| **B (check hard)** | `generate_image` with the client photo as reference (wrist shots, splash scenes, gift-box scenes) | Only short lifestyle beats, and only if it passes the QC below |
| **C** | Environment-only plates (no watch) and hands-only plates (no watch) | Backgrounds and props; the real watch is composited in |

**Tier-B rejection rule:** compare side-by-side at 200% against the invariants list. Reject if *anything* differs:
- logo text
- index count or shape
- hand shape
- bezel facets
- crown side
- link pattern
- clasp
- metal or dial colour

If it can't pass, choose another presentation (Master Brief §3). Record every check in the QC report.

**Prompt skeleton (environment plate):** "Vertical 9:16 luxury product-photography backdrop with NO product: [environment from design guide], [light], [palette words], clean empty area at [position] for a wristwatch to be composited later, photorealistic, shallow depth of field, no text, no logo, no watch, no people[, no hands]."

**Hands-only plate:** "...a South Asian [woman's/man's] hand and wrist only, [modest sleeve], [pose], wrist bare for a watch to be composited, no face, no jewellery on the wrist, no text."

**Never use AI to generate:**
- text inside images (Bengali gets garbled), so all text is rendered by the engine
- logos
- price tags
- faces

Reference mood plates live in `brand/mood/`.

## 6. Voice-over

**Voices:**
- `voice-00`: female, bn-BD (women's).
- `voice-01`: male, bn-BD (men's).
- Couple ads alternate the two.
- If the IDs are gone in a new session, re-audition with `add_voice` using these scripts and log the new IDs in DECISIONS.md:
  - Female: "ছোট্ট একটি ঘড়ি, বদলে দিতে পারে আপনার পুরো লুক। মিকা নিয়ে এলো এলিগ্যান্ট লেডিস ওয়াচ, মসৃণ বাটারফ্লাই লক আর ঝলমলে ডায়াল। ক্যাশ অন ডেলিভারিতে অর্ডার করতে নিচে দেওয়া অর্ডার বাটনে ক্লিক করে এখনই অর্ডার করুন।"
  - Male: "সময় যার হাতে, আত্মবিশ্বাস তার চোখে। মিকা নিয়ে এলো প্রিমিয়াম মেনস ওয়াচ, বোল্ড ডায়াল, নিখুঁত ফিনিশ আর ক্লাসিক লুক। ক্যাশ অন ডেলিভারিতে অর্ডার করতে নিচে দেওয়া অর্ডার বাটনে ক্লিক করে এখনই অর্ডার করুন।"

**Script rules:**
- Write everything spoken in Bengali script. English terms are transliterated.
- Prices are written in words.
- Use short sentences, ~2.2–2.6 words/s.
- Control pauses with "।", "," and "—". No SSML or brackets.

**Generation:**
- One clip per scene line (≤ 9 per video). Name them `audio/vo/NN_scene.mp3`.
- Measure each clip with ffprobe. Trim only the leading/trailing silence.
- Never time-stretch by more than ±5%; rewrite the line instead.

**Mandatory lines** are verbatim from the Brand Bible §3. The 5% line for TTS is "মিকার মুনাফার পাঁচ শতাংশ পথশিশুদের কল্যাণে।"

| On screen | Write for TTS |
|---|---|
| MIQA | মিকা (possessive মিকার) |
| Butterfly Lock | বাটারফ্লাই লক |
| Waterproof / PU Waterproof | ওয়াটারপ্রুফ / পিইউ ওয়াটারপ্রুফ |
| Water Resistant | ওয়াটার রেজিস্ট্যান্ট |
| Stainless Steel | স্টেইনলেস স্টিল |
| Rose Gold / Champagne Gold | রোজ গোল্ড / শ্যাম্পেন গোল্ড |
| Quartz / Chronograph / Mineral Glass | কোয়ার্টজ / ক্রোনোগ্রাফ / মিনারেল গ্লাস |
| Premium / Elegant / Collection | প্রিমিয়াম / এলিগ্যান্ট / কালেকশন |
| ৳৬৫০ / ৳৯৯৯ / ৳১,২৫০ / ৳১,৭৫০ / ৳২,৯৯৯ | ছয়শো পঞ্চাশ টাকা / নয়শো নিরানব্বই টাকা / বারোশো পঞ্চাশ টাকা / এক হাজার সাতশো পঞ্চাশ টাকা / দুই হাজার নয়শো নিরানব্বই টাকা |
| ৫% | পাঁচ শতাংশ |

## 7. Music, SFX, mix (original = copyright-free)

1. **Music:** `audio/music.py` (numpy/scipy, 48 kHz stereo), composed per video to match the line's BPM, key and palette in `design-tokens.json`.
   - Instruments:
     - felt piano: additive partials with slight inharmonicity, hammer noise and per-note decay
     - pads/strings: detuned saws, low-pass, slow attack
     - bass: sine plus sub
     - percussion: sine-sweep kick, filtered-noise shaker, click ticks
     - bells: high partials
   - Reverb is convolution with a synthetic exponentially decaying IR. Stereo width comes from mid/side processing.
   - The arc follows the scene markers (PLAYBOOK §9).
2. **SFX:** `audio/sfx.py`, all synthesised:
   - whoosh: band-pass noise sweep
   - shimmer: random high bell partials
   - click: noise burst + 3–7 kHz resonances
   - droplet: sine with fast pitch drop
   - impact: sine drop + noise + reverb
   - tick: 1 Hz clicks
   - silk: filtered noise swell
3. **Mix in numpy** (the old ffmpeg's `amix` has no `normalize`):
   - VO: HPF 80 Hz, compression 3:1, presence +2 dB @3.5 kHz.
   - Music is ducked 8–10 dB with a VO-RMS envelope (attack 20 ms, release 300 ms).
   - SFX peaks at −10 dBFS.
4. **Loudness:** run two passes of `loudnorm=I=-14:TP=-1.0:LRA=9` (the first with `print_format=json`, the second with `measured_*` and `linear=true`). Verify with `-af ebur128=peak=true`.

## 8. Encode commands

```bash
# mezzanine from the renderer pipe (exact colour: BT.709 matrix + tags; verified max error 3/255)
$FF -f rawvideo -pix_fmt rgba -s 2160x3840 -r 30 -i - \
  -vf "scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p" \
  -c:v libx264 -preset veryfast -crf 8 -color_primaries bt709 -color_trc bt709 -colorspace bt709 work/mezz_4k.mp4

# 4K master, 2-pass, size-capped for GitHub:  B = min(40000, floor(760000 / duration_s) - 320)  [kbps]
X="-c:v libx264 -preset slow -b:v ${B}k -profile:v high -level 5.1 -pix_fmt yuv420p -g 30 -x264-params aq-mode=3:aq-strength=0.8:deblock=-1,-1"
$FF -y -i work/mezz_4k.mp4 -an $X -pass 1 -passlogfile work/x264 -f mp4 /dev/null
$FF -y -i work/mezz_4k.mp4 -i audio/mix.wav -map 0:v -map 1:a $X -pass 2 -passlogfile work/x264 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 320k -ar 48000 -ac 2 \
  -movflags +faststart -use_editlist 0 OUT_4K.mp4

# 1080 mobile copy (Lanczos down-scale of the same master)
$FF -y -i work/mezz_4k.mp4 -i audio/mix.wav -map 0:v -map 1:a -vf "scale=1080:1920:flags=lanczos" \
  -c:v libx264 -preset slow -crf 18 -maxrate 12M -bufsize 24M -profile:v high -level 4.1 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 256k -ar 48000 -ac 2 \
  -movflags +faststart -use_editlist 0 OUT_1080.mp4
```

**Covers:** render a dedicated designed still from the engine (hero + hook text, inside the safe zone) at 2160×3840 and 1080×1920. Save as JPG q92.

**Pitfalls:**
- Banding in pink/navy gradients: add ±1–2 LSB grain/dither and keep `aq-mode=3`.
- No `letterSpacing` on Bengali.
- The ৳ sign needs a Bengali font.
- Without the BT.709 conversion, gold shifts orange.
- Meta asks for no MP4 edit lists, hence `-use_editlist 0`.

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
