#!/bin/bash
# MIQA Set-A video encode: loudnorm audio + 2-pass H.264 (4K + 1080) + covers.
set -e
FF=node_modules/@ffmpeg-installer/linux-x64/ffmpeg
D=miqa/products/2026-11-04_set-a-video
V=miqa/deliveries/2026-11-04_set-a-video
mkdir -p "$V"
cd /home/user/video

echo "== loudnorm pass 1 =="
$FF -y -v info -i $D/audio/mix.wav -af loudnorm=I=-14:TP=-1.0:LRA=9:print_format=json -f null - 2>/tmp/ln1.txt || true
MEAS=$(python3 - <<'EOF'
import json, re
s = open('/tmp/ln1.txt').read()
m = re.search(r'\{[^{}]+\}', s, re.S)
d = json.loads(m.group(0))
print(f"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}")
EOF
)
echo "== loudnorm pass 2 ($MEAS) =="
$FF -y -v error -i $D/audio/mix.wav -af loudnorm=I=-14:TP=-1.0:LRA=9:$MEAS:linear=true -ar 48000 -ac 2 /tmp/mix_ln.wav

echo "== 4K pass 1 =="
$FF -y -v error -f image2 -framerate 30 -i /tmp/vframes/f_%05d.jpg -i /tmp/mix_ln.wav -t 60.4 \
  -c:v libx264 -profile:v high -level 5.1 -preset slow -b:v 11500k -pass 1 -pix_fmt yuv420p -g 30 -an -f mp4 /tmp/p1_4k.mp4
echo "== 4K pass 2 =="
$FF -y -v error -f image2 -framerate 30 -i /tmp/vframes/f_%05d.jpg -i /tmp/mix_ln.wav -t 60.4 \
  -c:v libx264 -profile:v high -level 5.1 -preset slow -b:v 11500k -pass 2 -pix_fmt yuv420p -g 30 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart -use_editlist 0 \
  "$V/miqa-set-a-collection_4K_2160x3840.mp4"

echo "== 1080 pass 1 =="
$FF -y -v error -f image2 -framerate 30 -i /tmp/vframes/f_%05d.jpg -i /tmp/mix_ln.wav -t 60.4 \
  -vf scale=1080:1920 -c:v libx264 -profile:v high -level 4.0 -preset slow -b:v 6000k -pass 1 -pix_fmt yuv420p -g 30 -an -f mp4 /tmp/p1_1080.mp4
echo "== 1080 pass 2 =="
$FF -y -v error -f image2 -framerate 30 -i /tmp/vframes/f_%05d.jpg -i /tmp/mix_ln.wav -t 60.4 \
  -vf scale=1080:1920 -c:v libx264 -profile:v high -level 4.0 -preset slow -b:v 6000k -pass 2 -pix_fmt yuv420p -g 30 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart -use_editlist 0 \
  "$V/miqa-set-a-collection_1080x1920.mp4"

echo "== covers =="
/tmp/venv/bin/python - <<'EOF'
from PIL import Image
V = 'miqa/deliveries/2026-11-04_set-a-video'
for src, dst in [('/tmp/vframes/f_00225.jpg', 'cover-1.jpg'), ('/tmp/vframes/f_01300.jpg', 'cover-2.jpg')]:
    Image.open(src).resize((1080, 1920), Image.LANCZOS).save(f'{V}/{dst}', quality=92)
print('covers ok')
EOF

cp $D/AD-COPY.md $D/CREDITS.md "$V/"
ls -la "$V"
echo ENCODE DONE
