#!/usr/bin/env bash
# Crop the real dial of each client photo → 400×400 square inset for the feature chips.
# preview coords from the 600×800 grid (×5.78) for products 05–08; 400×533 grid (×8.61) for 09–14.
set -euo pipefail
SRC=miqa/products/source-photos/2026-11-06_set-d-new
OUT=miqa/products/2026-11-06_set-d/work/insets
mkdir -p "$OUT"

crop() { # name file cx cy r scale
  local name=$1 file=$2 cx=$3 cy=$4 r=$5 sc=$6
  local w x y
  w=$(python3 -c "print(int($r*$sc*2))")
  x=$(python3 -c "print(max(0,int($cx*$sc - $r*$sc)))")
  y=$(python3 -c "print(max(0,int($cy*$sc - $r*$sc)))")
  convert "$SRC/$file" -crop "${w}x${w}+${x}+${y}" +repage -resize 400x400 -modulate 103,104,100 "$OUT/$name.png"
}

crop p05 IMG20261029114459.jpg 268 310 112 5.78
crop p06 IMG20261029114713.jpg 268 287 118 5.78
crop p07 IMG20261029114836.jpg 248 372 116 5.78
crop p08 IMG20261029115146.jpg 266 344 118 5.78
# p09/p13 sources are 1200×1600 (preview 400×533 → ×3) — done with crop3 below
crop p10 IMG20261029115325.jpg 190 215 70 8.61
crop p12 IMG20261029115515.jpg 196 216 62 8.61
# p13 → crop3
crop p14 IMG20261029115809.jpg 201 245 62 8.61

# absolute full-res crops (photos whose face isn't on the preview grid)
crop3() { # name file cx cy r
  local name=$1 file=$2 cx=$3 cy=$4 r=$5
  convert "$SRC/$file" -crop "$((r*2))x$((r*2))+$((cx-r))+$((cy-r))" +repage -resize 400x400 -modulate 103,104,100 "$OUT/$name.png"
}
crop3 p11 IMG20261029115409.jpg 1505 2005 720
crop3 p09 IMG20261029120020.jpg 759 558 234
crop3 p13 IMG20261029115616.jpg 675 615 190

echo "insets → $OUT"; ls "$OUT"
