# Set C — production notes

Five watches. **Every image is generated fresh** from the client photos as a
design reference — nothing is cut out and pasted (client instruction, 5 Nov 2026:
"আমার ছবি গুলো কে কেটে কটু বসাবে না সব তৈরি করবে তুমি"). Renders come back at
1024², then `finish.py` does the 2000×2000 pass. Rules: `miqa/creative/IMAGE-RULES.md`.

```
gen/<slug>/01_primary.jpg … 05_styled.jpg     raw renders (10 per turn cap)
   ↓ finish.py  (gentle corner WB → Lanczos 2000 + unsharp 0.40 + sat 1.05 → chips on primary)
../deliveries/2026-11-05_set-c/<slug>/website-images/
```

The legacy files below (`segment.py`, `compose.py`, `build_all.py`, `cut/`,
`plates/`) belong to the rejected cut-out approach — kept for history only,
do not use for Set C.

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
