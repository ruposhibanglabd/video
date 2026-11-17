# Typography & Text Design Guidelines

**Highest-priority craft area.** Text is not subtitles dropped on an image — it is a
carefully art-directed visual composition, at the level of top-tier professional motion
graphics.

## 1. Standards

- Premium modern font selection
- Beautiful **Bengali Unicode typography** with accurate character shaping
- Excellent spacing · professional kerning · strong hierarchy
- Clear contrast · balanced alignment · consistent margins · sophisticated composition
- Bright, clearly visible text where appropriate — stands out without looking cheap

## 2. Tasteful enhancement toolkit

Highlight colors · controlled gradients · subtle shadows · light accents · animated
masks · layered compositions · elegant graphic containers.

## 3. Top-tier text animation vocabulary

Kinetic typography · word-by-word reveals · dynamic title animation · mask reveals ·
staggered text · smooth tracking animation · animated clipping · scale/position
transitions · highlight sweeps · animated keywords · layered text movement · refined 3D
text when appropriate · professional typographic transitions.

**Avoid:** random bouncing, spinning, shaking, cheap glow, generic presets, repetition.

## 4. Text-to-narration synchronization (critical)

- Every important word/phrase appears **in coordination with the voiceover**, using
  actual audio timing whenever possible (transcribe the VO, get word/phrase timings).
- Never display a keyword before the narration introduces it.
- Never remove important text before the viewer has time to read it.
- Use text to emphasize the most important ideas — not to duplicate every word.

## 5. Studio font inventory (already in this repo)

| Typeface | Weights | Location | Use |
|---|---|---|---|
| Noto Sans Bengali | Regular, Bold, SemiBold, ExtraBold | `assets/fonts/`, `public/fonts/` | Primary Bengali UI/title family — clean, modern |
| Hind Siliguri | Light, Regular, Medium, SemiBold, Bold | `miqa/brand/fonts/` | Warm Bengali text family |
| Anek Bangla (+SemiCondensed) | SemiBold, Bold, ExtraBold | `miqa/brand/fonts/` | Expressive Bengali display |
| Tiro Bangla | Regular, Italic | `miqa/brand/fonts/` | Literary/editorial Bengali serif |
| Inter | Regular, SemiBold, Bold, ExtraBold | `assets/fonts/`, `public/fonts/` | Latin text/labels |
| Cinzel, Cormorant Garamond, Bodoni Moda, Montserrat | various | `miqa/brand/fonts/` | Premium Latin display (signature, title cards) |

All fonts are OFL/free-licensed; license files are kept beside them. If a project needs
a new typeface, download only from permitted sources, add the license, and log it in
`../CHANGELOG.md`.

## 6. Bengali rendering rules

- Always verify shaping (যুক্তাক্ষর, রেফ, vowel signs) renders correctly in the chosen
  pipeline before final render — broken conjuncts are a release-blocking defect.
- Line-break Bengali at word boundaries; never hyphenate mid-cluster.
