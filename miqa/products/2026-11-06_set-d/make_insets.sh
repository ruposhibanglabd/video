#!/usr/bin/env bash
# Crop the real dial of each client photo → 400×400 square inset for the feature chips.
# Coordinates are in the 600×800 preview grid, multiplied by 5.78 (full res 3468×4624).
set -euo pipefail
SRC=/tmp/arena-coding-uploads
OUT=miqa/products/2026-11-06_set-d/work/insets
mkdir -p "$OUT"
crop() { # name file cx cy r
  local name=$1 file=$2 cx=$3 cy=$4 r=$5
  local s=5.78
  local x y w
  w=$(python3 -c "print(int($r*$s*2))")
  x=$(python3 -c "print(max(0,int($cx*$s - $r*$s)))")
  y=$(python3 -c "print(max(0,int($cy*$s - $r*$s)))")
  convert "$SRC/$file" -crop "${w}x${w}+${x}+${y}" +repage -resize 400x400 -modulate 103,104,100 "$OUT/$name.png"
  echo "$name $w $x $y"
}
crop p05 IMG20261029114459.jpg 268 310 112
crop p06 IMG20261029114713.jpg 268 287 118
crop p07 IMG20261029114836.jpg 248 372 116
crop p08 IMG20261029115146.jpg 266 344 118
