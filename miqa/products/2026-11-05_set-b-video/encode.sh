#!/bin/bash
# Set B — encode frames + audio master into 4K master, 1080 Reels copy, covers.
set -e
cd /home/user/video
FF=./node_modules/@ffmpeg-installer/linux-x64/ffmpeg
FP=./node_modules/@ffprobe-installer/linux-x64/ffprobe
W=miqa/products/2026-11-05_set-b-video/work
D=miqa/deliveries/2026-11-05_set-b-video
SLUG=miqa-set-b-sylvelle-collection
mkdir -p "$D"

echo "== 4K master"
$FF -y -v error -framerate 30 -i /tmp/vframes/f_%05d.jpg -i "$W/audio_master.wav" \
  -c:v libx264 -profile:v high -level 5.1 -pix_fmt yuv420p -preset medium -crf 20 \
  -x264-params "keyint=60:min-keyint=30:scenecut=0" -tune film \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -shortest -movflags +faststart -use_editlist 0 \
  "$D/${SLUG}_4K_2160x3840.mp4"

echo "== 1080 Reels copy"
$FF -y -v error -i "$D/${SLUG}_4K_2160x3840.mp4" \
  -vf "scale=1080:1920:flags=lanczos,unsharp=5:5:0.35:5:5:0" \
  -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p -preset slow -crf 21 \
  -x264-params "keyint=60:min-keyint=30:scenecut=0" \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a copy -movflags +faststart -use_editlist 0 \
  "$D/${SLUG}_1080x1920.mp4"

echo "== covers"
/tmp/venv/bin/python miqa/products/2026-11-05_set-b-video/covers.py

echo "== done"
ls -lh "$D"
