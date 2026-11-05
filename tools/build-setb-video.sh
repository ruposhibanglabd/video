#!/usr/bin/env bash
# সেট B ভিডিও বিল্ড — ফিয়োটা সিলভেল ফ্লোরাল কালেকশন
# ১০৮০×১৯২০, ৩০ fps, H.264 + AAC, বাংলা ভয়েসওভার সহ
set -euo pipefail

cd /home/user/video
FFMPEG=$(node -e "console.log(require('@ffmpeg-installer/ffmpeg').path)")
FONTDIR="assets/fonts"
BOLD="$FONTDIR/NotoSansBengali-Bold.ttf"
REG="$FONTDIR/NotoSansBengali-Regular.ttf"
EB="$FONTDIR/NotoSansBengali-ExtraBold.ttf"

OUT="miqa/deliveries/2026-11-05_set-b-video/miqa-set-b-collection_1080x1920.mp4"
TMP="miqa/deliveries/2026-11-05_set-b-video/_seg"
rm -rf "$TMP"; mkdir -p "$TMP"

W=1080; H=1920; FPS=30
PINK="#F6E1E7"   # Blush Mist
DARKPINK="#C9A7AE"

echo "[1/8] Hook — দাম প্রথম (০-৩ সে.)"
"$FFMPEG" -y -hide_banner -loglevel error \
  -f lavfi -i "color=c=$PINK:s=${W}x${H}:r=$FPS:d=3" \
  -i miqa/deliveries/2026-11-05_set-b/01_fiyota-floral-black/website-images/fiyota-floral-black_01_primary.jpg \
  -filter_complex \
  "[1:v]scale=1080:1080,zoompan=z='zoom+0.002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=90:fps=$FPS[watch]; \
   [0:v][watch]overlay=x=(W-w)/2:y=(H-h)/2:format=auto[base]; \
   [base]drawtext=fontfile='$EB':text='মাত্র ৩৫০ টাকা!':fontcolor=#8E1B4E:fontsize=110:x=(W-text_w)/2:y=H/4-150[bg1]; \
   [bg1]drawtext=fontfile='$BOLD':text='ফিয়োটা সিলভেল ফ্লোরাল কালেকশন':fontcolor=#FFFFFF:fontsize=44:x=(W-text_w)/2:y=H/2+60" \
  -t 3 -pix_fmt yuv420p -c:v libx264 -preset fast -crf 18 "$TMP/00_hook.mp4"

echo "[2/8] Brand reveal (৩-৭ সে.)"
"$FFMPEG" -y -hide_banner -loglevel error \
  -f lavfi -i "color=c=$PINK:s=${W}x${H}:r=$FPS:d=4" \
  -i miqa/deliveries/2026-11-05_set-b/01_fiyota-floral-black/website-images/fiyota-floral-black_02_on-wrist.jpg \
  -filter_complex \
  "[1:v]scale=900:900,zoompan=z='zoom+0.0015':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:fps=$FPS[watch]; \
   [0:v][watch]overlay=x=(W-w)/2:y=(H-h)/2+80:format=auto[base]; \
   [base]drawtext=fontfile='$EB':text='ফিয়োটা সিলভেল':fontcolor=#8E1B4E:fontsize=92:x=(W-text_w)/2:y=H/3-80[bg1]; \
   [bg1]drawtext=fontfile='$BOLD':text='ফ্লোরাল ক্রিস্টাল ব্রেসলেট ঘড়ি':fontcolor=#FFFFFF:fontsize=40:x=(W-text_w)/2:y=H/2+120" \
  -t 4 -pix_fmt yuv420p -c:v libx264 -preset fast -crf 18 "$TMP/01_brand.mp4"

echo "[3/8] Watch 01 Black (৭-১১ সে.)"
"$FFMPEG" -y -hide_banner -loglevel error \
  -f lavfi -i "color=c=$PINK:s=${W}x${H}:r=$FPS:d=4" \
  -i miqa/deliveries/2026-11-05_set-b/01_fiyota-floral-black/website-images/fiyota-floral-black_01_primary.jpg \
  -filter_complex \
  "[1:v]scale=1000:1000,zoompan=z='zoom+0.002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:fps=$FPS[watch]; \
   [0:v][watch]overlay=x=(W-w)/2:y=(H-h)/2-40:format=auto[base]; \
   [base]drawtext=fontfile='$EB':text='০১ · কালো সানবার্স্ট':fontcolor=#8E1B4E:fontsize=72:x=(W-text_w)/2:y=H/5[bg1]; \
   [bg1]drawtext=fontfile='$BOLD':text='FIYOTA Sylvelle (Black)':fontcolor=#FFFFFF:fontsize=46:x=(W-text_w)/2:y=H/2+160" \
  -t 4 -pix_fmt yuv420p -c:v libx264 -preset fast -crf 18 "$TMP/02_black.mp4"

echo "[4/8] Watch 02 Blue (১১-১৫ সে.)"
"$FFMPEG" -y -hide_banner -loglevel error \
  -f lavfi -i "color=c=$PINK:s=${W}x${H}:r=$FPS:d=4" \
  -i miqa/deliveries/2026-11-05_set-b/02_fiyota-floral-blue/website-images/fiyota-floral-blue_01_primary.jpg \
  -filter_complex \
  "[1:v]scale=1000:1000,zoompan=z='zoom+0.002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:fps=$FPS[watch]; \
   [0:v][watch]overlay=x=(W-w)/2:y=(H-h)/2-40:format=auto[base]; \
   [base]drawtext=fontfile='$EB':text='০২ · রয়্যাল নীল':fontcolor=#8E1B4E:fontsize=72:x=(W-text_w)/2:y=H/5[bg1]; \
   [bg1]drawtext=fontfile='$BOLD':text='FIYOTA Sylvelle (Blue)':fontcolor=#FFFFFF:fontsize=46:x=(W-text_w)/2:y=H/2+160" \
  -t 4 -pix_fmt yuv420p -c:v libx264 -preset fast -crf 18 "$TMP/03_blue.mp4"

echo "[5/8] Watch 03 White (১৫-১৯ সে.)"
"$FFMPEG" -y -hide_banner -loglevel error \
  -f lavfi -i "color=c=$PINK:s=${W}x${H}:r=$FPS:d=4" \
  -i miqa/deliveries/2026-11-05_set-b/03_fiyota-floral-white/website-images/fiyota-floral-white_01_primary.jpg \
  -filter_complex \
  "[1:v]scale=1000:1000,zoompan=z='zoom+0.002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:fps=$FPS[watch]; \
   [0:v][watch]overlay=x=(W-w)/2:y=(H-h)/2-40:format=auto[base]; \
   [base]drawtext=fontfile='$EB':text='০৩ · সাদা সানবার্স্ট':fontcolor=#8E1B4E:fontsize=72:x=(W-text_w)/2:y=H/5[bg1]; \
   [bg1]drawtext=fontfile='$BOLD':text='FIYOTA Sylvelle (White)':fontcolor=#FFFFFF:fontsize=46:x=(W-text_w)/2:y=H/2+160" \
  -t 4 -pix_fmt yuv420p -c:v libx264 -preset fast -crf 18 "$TMP/04_white.mp4"

echo "[6/8] Watch 04 Green (১৯-২৩ সে.)"
"$FFMPEG" -y -hide_banner -loglevel error \
  -f lavfi -i "color=c=$PINK:s=${W}x${H}:r=$FPS:d=4" \
  -i miqa/deliveries/2026-11-05_set-b/04_fiyota-floral-green/website-images/fiyota-floral-green_01_primary.jpg \
  -filter_complex \
  "[1:v]scale=1000:1000,zoompan=z='zoom+0.002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:fps=$FPS[watch]; \
   [0:v][watch]overlay=x=(W-w)/2:y=(H-h)/2-40:format=auto[base]; \
   [base]drawtext=fontfile='$EB':text='০৪ · এমেরাল্ড সবুজ':fontcolor=#8E1B4E:fontsize=72:x=(W-text_w)/2:y=H/5[bg1]; \
   [bg1]drawtext=fontfile='$BOLD':text='FIYOTA Sylvelle (Green)':fontcolor=#FFFFFF:fontsize=46:x=(W-text_w)/2:y=H/2+160" \
  -t 4 -pix_fmt yuv420p -c:v libx264 -preset fast -crf 18 "$TMP/05_green.mp4"

echo "[7/8] ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি (২৩-২৮ সে.)"
"$FFMPEG" -y -hide_banner -loglevel error \
  -f lavfi -i "color=c=$DARKPINK:s=${W}x${H}:r=$FPS:d=5" \
  -i miqa/deliveries/2026-11-05_set-b/01_fiyota-floral-black/website-images/fiyota-floral-black_04_bracelet-closeup.jpg \
  -filter_complex \
  "[1:v]scale=900:900,zoompan=z='zoom+0.0015':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:fps=$FPS[watch]; \
   [0:v][watch]overlay=x=(W-w)/2:y=(H-h)/2+40:format=auto[base]; \
   [base]drawtext=fontfile='$EB':text='৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি':fontcolor=#FFFFFF:fontsize=80:x=(W-text_w)/2:y=H/3-60[bg1]; \
   [bg1]drawtext=fontfile='$BOLD':text='কিনতে নিশ্চিন্ত থাকুন':fontcolor=#F6E1E7:fontsize=42:x=(W-text_w)/2:y=H/2+140" \
  -t 5 -pix_fmt yuv420p -c:v libx264 -preset fast -crf 18 "$TMP/06_guarantee.mp4"

echo "[8/8] দাম + COD + সিটিএ (২৮-৩২ সে.)"
"$FFMPEG" -y -hide_banner -loglevel error \
  -f lavfi -i "color=c=$PINK:s=${W}x${H}:r=$FPS:d=4" \
  -i miqa/deliveries/2026-11-05_set-b/04_fiyota-floral-green/website-images/fiyota-floral-green_02_on-wrist.jpg \
  -filter_complex \
  "[1:v]scale=900:900,zoompan=z='zoom+0.0015':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:fps=$FPS[watch]; \
   [0:v][watch]overlay=x=(W-w)/2:y=(H-h)/2+60:format=auto[base]; \
   [base]drawtext=fontfile='$EB':text='মাত্র ৩৫০ টাকা':fontcolor=#8E1B4E:fontsize=100:x=(W-text_w)/2:y=H/4-60[bg1]; \
   [bg1]drawtext=fontfile='$BOLD':text='ক্যাশ অন ডেলিভারিতে অর্ডার করুন':fontcolor=#FFFFFF:fontsize=44:x=(W-text_w)/2:y=H/2+120[bg2]; \
   [bg2]drawtext=fontfile='$REG':text='নিচের অর্ডার বাটনে ক্লিক করে এখনই অর্ডার করুন':fontcolor=#F6E1E7:fontsize=34:x=(W-text_w)/2:y=H/2+190" \
  -t 4 -pix_fmt yuv420p -c:v libx264 -preset fast -crf 18 "$TMP/07_price.mp4"

echo "Concat segments..."
# কনক্যাট ডিমাক্সার লিস্ট ফাইলের সাপেক্ষে পথ সমাধান করে, তাই শুধু ফাইলনাম যথেষ্ট
printf "file '%s'\n" \
  "00_hook.mp4" \
  "01_brand.mp4" \
  "02_black.mp4" \
  "03_blue.mp4" \
  "04_white.mp4" \
  "05_green.mp4" \
  "06_guarantee.mp4" \
  "07_price.mp4" > "$TMP/list.txt"

"$FFMPEG" -y -hide_banner -loglevel error -f concat -safe 0 -i "$TMP/list.txt" -c copy "$TMP/video_only.mp4"

echo "Mux with Bengali voiceover audio..."
"$FFMPEG" -y -hide_banner -loglevel error \
  -i "$TMP/video_only.mp4" \
  -i miqa/deliveries/2026-11-05_set-b-video/voiceover-bn.mp3 \
  -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 128k -shortest \
  -pix_fmt yuv420p -movflags +faststart \
  "$OUT"

echo "Done: $OUT"
"$FFMPEG" -hide_banner -loglevel error -i "$OUT" 2>&1 | grep -E "Duration|Video:|Audio:"
