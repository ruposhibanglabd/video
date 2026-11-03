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

## 9. Website product images — full generative redesign (V2)

Active rules: `creative/PRODUCT-IMAGES-GUIDE.md`. Decisions D32–D36 supersede the old cutout, feature-pill and added-shadow workflow for website images and make the fully generated redesign the default for all future product images. The V1 steps are archived in `RUNBOOK-PRODUCT-IMAGES-V1.md` for history only.

1. **Inspect references.** Read every available product photo and zoom into the dial, case, crown and bracelet. Record visible invariants and unknown surfaces in `products/<slug>/brief.json`. Do not invent a pixel-exactness claim.
2. **Design five new scenes.** Primary, on-wrist, angle, feature close-up and styled; use the client's explicit shot list if supplied. The entire scene and product are generated together. No watch segmentation, hand plate plus watch composite, or repeated crops of one output.
3. **Generate.** Use `generate_image` with the real reference images. Describe case geometry, dial texture/indices/hands/printing, crown position, bracelet rows/link shape and metal color. Explicitly exclude advertising text, pills, insets, borders and added shadow/reflection layers. Keep physically natural scene lighting.
4. **Review each result.** Read the output image, inspect dial lettering at zoom, hand anatomy, product scale, link structure and unwanted graphics. Regenerate failed scenes. Record remaining generative differences honestly; unseen hardware is a reconstruction, not verified engineering.
5. **Keep working files local.** Generated PNGs and inspection crops belong in `products/<slug>/work/`, which is ignored. Only final delivery assets and documentation go into Git.
6. **Export without compositing:**
   ```bash
   python3 -m venv /tmp/miqa-image-tools
   /tmp/miqa-image-tools/bin/pip install pillow
   /tmp/miqa-image-tools/bin/python miqa/tools/product-images/export_redesign.py \
     miqa/products/<slug>/work/redesign-v2 \
     miqa/deliveries/<set>/<product>/redesign-v2 <slug>
   ```
   The exporter creates 2000×2000 sRGB JPGs, one ZIP and a manifest with native/export dimensions and hashes. Default shot names preserve the FIYOTA silver set. For another product's requested feature, pass `--shots` with the source PNG stems in delivery order, e.g. `--shots 01_primary 02_on-wrist 03_angle 04_bracelet-closeup 05_styled`. Resizing is not generative detail enhancement; disclose native resolution.
7. **QC and package.** Verify dimensions, embedded sRGB profile, file size, ZIP integrity and manifest hashes. Check that the README points to the current revision, not V1. Include AI visualization limitations and obtain client approval before commercial use.
8. **Git delivery once.** After the complete set and QC are ready, make one final commit on the session branch and, within the approved delivery workflow, one push. Do not push every intermediate image or correction. Do not merge or open a PR unless requested.
9. **Video remains separate.** No video until the client declares the set complete and supplies prices. Website redesign approval does not waive the video fidelity checks.
