#!/usr/bin/env bash
# Set H video — full build: tracks → type → frames → audio → encode (RUNBOOK §8).
# Run from the repo root:  bash miqa/products/2026-11-11_set-h-video/build_h.sh
set -euo pipefail
J=miqa/products/2026-11-11_set-h-video
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
OUT=miqa/deliveries/2026-11-11_set-h-video
NAME=miqa-set-h-honeycomb
DUR=40.8
mkdir -p "$J/work" "$OUT"

[ -f "$J/work/tracks.json" ] || python3 "$J/track_h.py"          # subject lock for every shot
SCALE=1 node "$J/mtype_h.mjs"; SCALE=2 node "$J/mtype_h.mjs"      # type layers (1080 + 4K)
python3 "$J/audio_h.py"                                           # VO + score + SFX → work/audio/master.wav (−14 LUFS)
[ -f "$J/work/long_4k.mp4" ] || python3 "$J/render_h.py" --scale 2 --crf 10 --out "$J/work/long_4k.mp4"   # 4K mezzanine

# 4K master, 2-pass, size-capped for GitHub (<100 MB):  B = min(40000, floor(760000 / duration_s) - 320)
B=$(python3 -c "import math; print(min(40000, math.floor(760000/$DUR) - 320))")
X="-c:v libx264 -preset slow -b:v ${B}k -profile:v high -level 5.1 -pix_fmt yuv420p -g 30 -x264-params aq-mode=3:aq-strength=0.8:deblock=-1,-1"
$FF -y -v error -i "$J/work/long_4k.mp4" -an $X -pass 1 -passlogfile "$J/work/x264" -f mp4 /dev/null
# x264 B-frames delay the first video frame by 2 frames (66.7 ms). Meta wants no MP4 edit list, so instead of
# an edit list the audio is delayed to match: AAC priming (21.3 ms) + 45 ms pad = 66.3 ms → A/V offset < 1 ms.
APAD="adelay=45|45"
$FF -y -v error -i "$J/work/long_4k.mp4" -i "$J/work/audio/master.wav" -map 0:v -map 1:a -af "$APAD" $X -pass 2 -passlogfile "$J/work/x264" \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 320k -ar 48000 -ac 2 \
  -movflags +faststart -use_editlist 0 "$OUT/${NAME}_2160x3840.mp4"

# 1080 mobile copy — Lanczos down-scale of the same master
$FF -y -v error -i "$J/work/long_4k.mp4" -i "$J/work/audio/master.wav" -map 0:v -map 1:a -vf "scale=1080:1920:flags=lanczos" -af "$APAD" \
  -c:v libx264 -preset slow -crf 18 -maxrate 12M -bufsize 24M -profile:v high -level 4.1 -pix_fmt yuv420p -g 30 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 256k -ar 48000 -ac 2 \
  -movflags +faststart -use_editlist 0 "$OUT/${NAME}_1080x1920.mp4"

# covers (designed still: four dials + price hook)
python3 "$J/render_h.py" --scale 2 --cover "$OUT/${NAME}-cover_2160x3840.jpg"
python3 "$J/render_h.py" --scale 1 --cover "$OUT/${NAME}-cover_1080x1920.jpg"
ls -la "$OUT"
