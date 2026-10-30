# Patek Philippe / MIKA — 4K export with new Bengali voice

Date: 2026-10-30

## Latest deliverable

- File: `MIQA-Butterfly-Lock-Set-A-Reel-4K.mp4`
- Resolution: **2160 × 3840**, vertical 9:16 UHD / 4K export
- Duration: **40.000 seconds**
- Frame rate: **30 FPS**, constant frame timestamps
- Total decoded video frames: **1,200**
- Video: H.264 High, Level 5.1, yuv420p, CRF 17 encoding
- Audio: AAC-LC stereo, 48 kHz, target 256 kb/s
- Container: MP4 with fast-start moov atom
- Size: **56,543,410 bytes**
- SHA-256: `579c3bf82b13eb21a8a0b8084f085f19486437e959356b8626f1d5155f4e4b95`

## What “4K” means here

The finished file genuinely contains 2160 × 3840 video frames. The existing AI-generated photographs were resampled from their generation outputs with Lanczos interpolation and restrained sharpening. They are **upscaled photographic imagery, not native 4K camera footage or newly generated native-4K product detail**.

Typography, captions, price, warranty-card typography, icons, gradients and graphics were rendered on a 2160 × 3840 canvas, rather than simply enlarging the finished 1080p MP4.

This distinction was disclosed to the user before production.

## Entirely new narration

- The user auditioned a fresh voice pair and selected a different Bengali masculine commercial voice (`voice-01`, instead of the previous `voice-00`).
- All narration was resynthesized with that newly selected voice. No spoken clip from the old narrator is included.
- Edge silence was trimmed conservatively, preserving consonant margins and internal pauses.
- Most clips play at their natural generated speaking rate. The lock phrase uses only approximately 1.081× pitch-preserving tempo adjustment to fit its scene.
- The three lifestyle sentences were split at detected inter-sentence pauses and assigned individually to office, formal and gifting imagery.
- Music/effects remain the original synthesized score, rebalanced against the new narration with voice ducking.

## Narration script

1. আপনার স্টাইলে প্রিমিয়াম ছোঁয়া।
2. পাটেক ফিলিপ। পুরুষদের বাটারফ্লাই লক ঘড়ি।
3. বাটারফ্লাই লক। পরিপাটি ডিজাইনে আকর্ষণীয় লুক।
4. চেইন কালার গ্যারান্টি।
5. ওয়াটারপ্রুফ সুবিধা।
6. এক বছরের ওয়ারেন্টি।
7. একই ডিজাইনে একাধিক চেইন কালার। বেছে নিন আপনার পছন্দেরটি।
8. অফিসে পরিপাটি। ফরমাল সাজে মানানসই। উপহারেও দারুণ পছন্দ।
9. মিকার নিট লাভের পাঁচ শতাংশ ব্যয় হবে পথশিশুদের কর্মসংস্থানে।
10. পাটেক ফিলিপ ঘড়ি। এক হাজার ছয়শ পঞ্চাশ টাকা। অর্ডার করুন মিকায়।

## Synchronization retained / updated

- Lock, chain-color guarantee, surface-droplet waterproof and one-year warranty each retain their corresponding visual.
- Benefit narration starts at 11.00, 12.67 and 14.33 seconds respectively.
- Office, formal and gifting narration/visual boundaries are now 24.00, 25.40 and 27.20 seconds.
- Color and final CTA subtitle changes follow the pauses in the new voice clips.
- Price remains the user-confirmed **৳১,৬৫০**.
- Product name remains **Patek Philippe**; **মিকা (MIQA)** is identified separately as seller.
- Only generated photographs are used as visual inputs; supplied original photographs/cutouts are not displayed.

## Full-file verification

- Entire final video and audio decoded successfully.
- Width/height, codecs, duration and complete decoded frame count verified with FFprobe.
- Every decoded video timestamp checked: exactly 1,200 continuous frames at 30 FPS, with no gap/duplicate at the render-segment join.
- To handle render-memory limits, the final portion was rendered separately using the same codec/quality settings, then joined by stream copy without another lossy video encode.
- Join timestamps: 34.766667, 34.800000, 34.833333, 34.866667, 34.900000, 34.933333 seconds.
- Black-frame detector over the entire finished video: no black intervals reported.
- Visual contact sheets reviewed across the full timeline at one-second intervals, plus 4K scene samples.
- Final loudness: **-14.9 LUFS** integrated; **3.4 LU** loudness range; **-2.3 dBFS** true peak. No clipping.

## Existing product/claim controls

Seller-provided waterproof, chain-color guarantee and one-year warranty claims were not independently certified. Water droplets are illustrative, with no submersion, depth rating or high-pressure demonstration. Gift packaging and warranty card are presentation props, not added included-item promises. The social commitment refers to 5% of **net profit**. No independent authenticity, authorized-dealer or manufacturer affiliation claim is made.

## Repository scope

Only this new 4K MP4 and its quality-control record are added. The previous 1080p delivery and its image ZIP remain as prior-version assets; they are not the new-voice 4K deliverable. No website, frontend/backend, dependency or production configuration is changed, and no deployment is initiated.

Working branch: `arena/297d3995-video`.
