#!/bin/bash
# Set D — frames in /tmp/vframes + work/dark/mix.wav -> the 1080x1920 master.
set -e
cd /home/user/video
FF=./node_modules/@ffmpeg-installer/linux-x64/ffmpeg
D=miqa/deliveries/2026-11-06_set-d-video
W=miqa/products/2026-11-06_set-d-video
$FF -y -v error -framerate 30 -i /tmp/vframes/f_%05d.jpg -i "$W/work/dark/mix.wav" \
  -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p -preset slow -crf 22 \
  -x264-params "keyint=60:min-keyint=30:scenecut=0" -tune film \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -shortest -movflags +faststart -use_editlist 0 \
  "$D/miqa-set-d-velora_1080x1920.mp4"
ls -lh "$D"
