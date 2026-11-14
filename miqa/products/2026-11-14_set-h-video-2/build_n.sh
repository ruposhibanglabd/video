#!/usr/bin/env bash
# Set H video 2 (2026-11-14) — full build v3, from the client's camera originals (1080×1920).
# Run from the repo root:  bash miqa/products/2026-11-14_set-h-video-2/build_n.sh
# Needs input/orig/A.mp4 and input/orig/C.mp4 (not in Git — see input/orig/README.md).
set -euo pipefail
J=miqa/products/2026-11-14_set-h-video-2
OUT=miqa/deliveries/2026-11-14_set-h-video-2
NAME=miqa-honeycomb-film-2-v3
mkdir -p "$J/work" "$OUT"

node "$J/mtype_n.mjs"                                             # type layers (1080×1920)
python3 "$J/audio_n.py"                                           # VO + score + SFX → work/audio/master.wav (−14 LUFS)

# Source and output are both 1080×1920. One encode only, straight from the rendered frames (no mezzanine):
# x264 slow, CRF 15, ceiling 20 Mb/s (the originals are ~20 Mb/s), High 4.2, BT.709.
python3 "$J/render_n.py" --crf 15 --audio "$J/work/audio/master.wav" --out "$OUT/${NAME}_1080x1920.mp4"
python3 "$J/render_n.py" --cover "$OUT/${NAME}-cover_1080x1920.jpg"
ls -la "$OUT"
echo BUILDDONE
