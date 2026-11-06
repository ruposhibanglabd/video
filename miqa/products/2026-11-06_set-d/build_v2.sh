#!/usr/bin/env bash
# Build the finished 2000×2000 JPGs for the Set D "new design family" (products 05–08).
set -euo pipefail
cd "$(dirname "$0")/../../.."   # repo root

B=miqa/products/2026-11-06_set-d
OUT=miqa/deliveries/2026-11-06_set-d-v2
mkdir -p "$OUT"

build() { # slug raw kind inset
  local slug=$1 raw=$2 kind=$3 inset=$4
  local dir="$OUT/$slug/website-images"
  mkdir -p "$dir"
  local n
  case "$kind" in
    primary) n=01_primary ;;
    wrist)   n=02_on-wrist ;;
    angle)   n=03_angle ;;
    closeup) n=04_dial-closeup ;;
  esac
  node "$B/compose_v2.mjs" "$raw" \
    "$B/work/insets/$inset.png" "$B/work/insets/$inset.png" \
    "$B/work/out/${slug}_${n}.png" "$([ "$kind" = primary ] && echo primary || echo plain)"
  convert "$B/work/out/${slug}_${n}.png" -resize 2000x2000 -colorspace sRGB \
    -sampling-factor 4:4:4 -quality 93 -strip "$dir/${slug}_${n}.jpg"
  identify -format "%f %wx%h %b\n" "$dir/${slug}_${n}.jpg"
}

build set-d-product-05 "$B/work/raw/p05_hero_b.png"  primary p05
build set-d-product-05 "$B/work/raw/p05_wrist_b.png" wrist p05
build set-d-product-06 "$B/work/raw/p06_hero_a.png"  primary p06
build set-d-product-07 "$B/work/raw/p07_hero_a.png"  primary p07
build set-d-product-08 "$B/work/raw/p08_hero_a.png"  primary p08

build set-d-product-05 "$B/work/raw/p05_wrist_c.png"   wrist p05
build set-d-product-05 "$B/work/raw/p05_angle.png"     angle p05
build set-d-product-05 "$B/work/raw/p05_closeup.png"   closeup p05
build set-d-product-06 "$B/work/raw/p06_angle.png"     angle p06
build set-d-product-07 "$B/work/raw/p07_angle.png"     angle p07
build set-d-product-08 "$B/work/raw/p08_wrist.png"     wrist p08
build set-d-product-08 "$B/work/raw/p08_angle.png"     angle p08
build set-d-product-08 "$B/work/raw/p08_closeup.png"   closeup p08
