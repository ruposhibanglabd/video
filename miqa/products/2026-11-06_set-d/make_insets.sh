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
# ---- products 09-14 (added 11 Nov 2026) — same source dir
crop2() { # name file cx cy r scale
  local name=$1 file=$2 cx=$3 cy=$4 r=$5 sc=$6
  local w x y
  w=$(python3 -c "print(int($r*$sc*2))")
  x=$(python3 -c "print(max(0,int($cx*$sc - $r*$sc)))")
  y=$(python3 -c "print(max(0,int($cy*$sc - $r*$sc)))")
  convert "$SRC/$file" -crop "${w}x${w}+${x}+${y}" +repage -resize 400x400 -modulate 103,104,100 "$OUT/$name.png"
  echo "$name $w $x $y"
}
crop2 p09 IMG20261029120020.jpg 253 186 78 8.61
crop2 p10 IMG20261029115325.jpg 190 215 70 8.61
crop2 p11 IMG20261029115409.jpg 262 224 60 8.61
crop2 p12 IMG20261029115515.jpg 196 216 62 8.61
crop2 p13 IMG20261029115616.jpg 225 205 62 8.61
crop2 p14 IMG20261029115809.jpg 201 245 62 8.61

# absolute full-res crop (for photos whose face isn't on the 400×533 grid)
crop3() { # name file cx cy r
  local name=$1 file=$2 cx=$3 cy=$4 r=$5
  local w=$((r*2)) x=$((cx-r)) y=$((cy-r))
  convert "$SRC/$file" -crop "${w}x${w}+${x}+${y}" +repage -resize 400x400 -modulate 103,104,100 "$OUT/$name.png"
  echo "$name $w $x $y"
}
crop3 p11 IMG20261029115409.jpg 1505 2005 720
