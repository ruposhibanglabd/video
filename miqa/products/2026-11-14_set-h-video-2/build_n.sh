#!/usr/bin/env bash
# Set H video 2 (2026-11-14, three WhatsApp clips) — full build v2: type → audio → frames + encode (one pass).
# Run from the repo root:  bash miqa/products/2026-11-14_set-h-video-2/build_n.sh
set -euo pipefail
J=miqa/products/2026-11-14_set-h-video-2
OUT=miqa/deliveries/2026-11-14_set-h-video-2
NAME=miqa-honeycomb-film-2-v2
mkdir -p "$J/work" "$OUT"

node "$J/mtype_n.mjs"                                             # type layers (1080×1920)
python3 "$J/audio_n.py"                                           # VO + score + SFX → work/audio/master.wav (−14 LUFS)

# The sources are 480×854 (WhatsApp), so 1080×1920 is the honest ceiling — a 4K file would only be bigger.
# One encode only, straight from the rendered frames (no mezzanine): x264 slow, CRF 16, High 4.1, BT.709.
python3 "$J/render_n.py" --crf 16 --audio "$J/work/audio/master.wav" --out "$OUT/${NAME}_1080x1920.mp4"
python3 "$J/render_n.py" --cover "$OUT/${NAME}-cover_1080x1920.jpg"
ls -la "$OUT"
echo BUILDDONE
