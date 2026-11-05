#!/bin/bash
# Set C v2 — frames + new VO/score → 1080 Reels master + 4K master.
set -e
cd /home/user/video
FF=./node_modules/@ffmpeg-installer/linux-x64/ffmpeg
W=miqa/products/2026-11-05_set-c-video
D=miqa/deliveries/2026-11-05_set-c-video
SLUG=miqa-set-c-octavia
mkdir -p "$D"

echo "== 1080 master"
$FF -y -v error -framerate 30 -i /tmp/cframes2/f_%05d.jpg -i "$W/work/audio2/mix_raw.wav" \
  -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p -preset slow -crf 18 \
  -x264-params "keyint=60:min-keyint=30:scenecut=0" -tune film \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -shortest -movflags +faststart -use_editlist 0 \
  "$D/${SLUG}_1080x1920.mp4"

echo "== 4K master (2x upscale from the 1080 master)"
$FF -y -v error -i "$D/${SLUG}_1080x1920.mp4" \
  -vf "scale=2160:3840:flags=lanczos,unsharp=5:5:0.35:5:5:0" \
  -c:v libx264 -profile:v high -level 5.1 -pix_fmt yuv420p -preset medium -crf 20 \
  -x264-params "keyint=60:min-keyint=30:scenecut=0" -tune film \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a copy -movflags +faststart -use_editlist 0 \
  "$D/${SLUG}_4K_2160x3840.mp4"

echo "== done"
ls -lh "$D"
