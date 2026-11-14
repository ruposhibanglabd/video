#!/usr/bin/env bash
# Set H video 2 (2026-11-14, three WhatsApp clips) — full build: tracks → type → audio → frames → encode.
# Run from the repo root:  bash miqa/products/2026-11-14_set-h-video-2/build_n.sh
set -euo pipefail
J=miqa/products/2026-11-14_set-h-video-2
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
OUT=miqa/deliveries/2026-11-14_set-h-video-2
NAME=miqa-honeycomb-film-2
mkdir -p "$J/work" "$OUT"

[ -f "$J/work/tracks.json" ] || python3 "$J/track_n.py"          # subject lock for every shot
node "$J/mtype_n.mjs"                                             # type layers (1080×1920)
python3 "$J/audio_n.py"                                           # VO + score + SFX → work/audio/master.wav (−14 LUFS)
python3 "$J/render_n.py" --crf 10 --out "$J/work/long_1080.mp4"   # mezzanine, video only

# The sources are 480×854 (WhatsApp), so 1080×1920 is the honest ceiling — a 4K file would only be bigger.
# x264 B-frames delay the first video frame by 2 frames (66.7 ms); Meta wants no MP4 edit list, so the audio is
# delayed to match instead: AAC priming (21.3 ms) + 45 ms pad → A/V offset < 1 ms.
$FF -y -v error -i "$J/work/long_1080.mp4" -i "$J/work/audio/master.wav" -map 0:v -map 1:a -af "adelay=45|45" \
  -c:v libx264 -preset slow -crf 18 -maxrate 9M -bufsize 18M -profile:v high -level 4.1 -pix_fmt yuv420p -g 30 \
  -x264-params aq-mode=3:aq-strength=0.8 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 256k -ar 48000 -ac 2 \
  -movflags +faststart -use_editlist 0 "$OUT/${NAME}_1080x1920.mp4"

python3 "$J/render_n.py" --cover "$OUT/${NAME}-cover_1080x1920.jpg"
ls -la "$OUT"
echo BUILDDONE
