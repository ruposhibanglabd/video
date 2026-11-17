# Studio Assets

```
assets/
    reference/          # mood references, client-supplied material, authorized photo
    fonts/              # studio fonts added over time (with licenses)
    audio/              # music beds, ambience, SFX library
    visual-guidelines/  # style boards, grade references, composition guides
```

## Existing in-repo font sources (do not duplicate)

- `assets/fonts/` + `public/fonts/` — Noto Sans Bengali (4 weights), Inter (4 weights)
- `miqa/brand/fonts/` — Hind Siliguri, Anek Bangla, Tiro Bangla, Cinzel,
  Cormorant Garamond, Bodoni Moda, Montserrat (+ OFL licenses)

See `../system/TYPOGRAPHY_GUIDELINES.md` §5 for usage.

## Rules

- Only licensed/owned material; keep license files beside assets.
- Large binaries stay out of Git where the repo's `.gitignore` conventions require it.
- The creator's personal photograph, once authorized, lives in `reference/`.
