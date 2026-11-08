#!/bin/bash
# Build 1300² cards for the slide track from the finished set-D stills.
set -e
cd /home/user/video
D=miqa/deliveries/2026-11-11_set-d-final
O=miqa/products/2026-11-06_set-d-video/work/cards
mkdir -p "$O"
for n in $(seq -w 1 14); do
  # product 01 uses 06_styled, 02-04 use 05_bracelet-closeup as their 5th look
  STYLED=05_styled
  [ "$n" = "01" ] && STYLED=06_styled
  [ -d "$D/set-d-product-$n/website-images" ] && [ ! -f "$D/set-d-product-$n/website-images/set-d-product-${n}_05_styled.jpg" ] && STYLED=05_bracelet-closeup
  for k in 01_primary 02_on-wrist 03_angle 04_dial-closeup $STYLED; do
    f="$D/set-d-product-$n/website-images/set-d-product-${n}_${k}.jpg"
    [ -f "$f" ] || { echo "MISSING $f"; continue; }
    if [ "$k" = "01_primary" ]; then
      # primary has the Bengali chip band along the bottom (y≈1590-1850) -> cut it
      # off and extend the backdrop so the card stays square
      # square crop from the top 1530 rows, centred on the watch
      convert "$f" -crop 1530x1530+235+0 +repage -resize 1300x1300 -quality 92 "$O/p${n}_${k}.jpg"
    else
      convert "$f" -resize 1300x1300 -quality 92 "$O/p${n}_${k}.jpg"
    fi
  done
done
ls "$O" | wc -l
