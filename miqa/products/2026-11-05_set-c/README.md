# Set C — production notes

Five watches, two client photos each, cut out and re-composed into website
images (2000×2000, Blush Mist). No AI watch pixels anywhere: background, light
and the on-wrist hand are built around the real cutouts.

| File | What it does |
|---|---|
| `segment.py` | Cutout: inflate the watch away, per-row span model, colour-guided alpha, fringe decontamination. Per-photo `WIN` (search window) and `BAND` (clean strap rows). |
| `compose.py` | `wb_and_expose` (pillow-referenced white balance + saturation), `radial_bg`, `drop_shadow`, `primary` / `angle` / `closeup` / `bracelet_closeup`, `on_wrist` (AI hand plate + real watch). |
| `build_all.py` | Runs all five products, adds the two feature chips with real watch-detail insets, writes into `miqa/deliveries/2026-11-05_set-c/`. |
| `plates/wrist_plate.png` | AI plate of a bare female forearm/hand in blush silk (no watch, no jewellery). |
| `cut/*.png` | RGBA cutouts used by everything downstream. |
| `work/out/` | Intermediate 2000² renders (kept for re-crops). |

Rules followed: `miqa/creative/PRODUCT-IMAGES-GUIDE.md`.
Client feature copy: **ওয়াটার রেজিস্ট্যান্ট**, **৭ দিনের রিপ্লেসমেন্ট**.
