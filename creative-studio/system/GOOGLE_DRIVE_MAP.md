# Google Drive Map — Delivery Library

**Drive connection:** ✅ Verified (2026-11-17) — read access works; the connected account
is reachable and existing project files are visible.

**Folder structure status:** 🔶 **PARTIAL (2026-11-17)** — connector parameter-drop bug
is intermittent: search/list calls with parameters work, and one `create_file` succeeded
(root folder, ID verified below), but subsequent parameterized create calls arrived empty
(8 failures / 1 success). Remaining folders to be created when the bridge is stable;
the first success proves the account + permissions are fine.

## Intended structure (to create)

```
Abdur Rahman Nayeem - Creative Studio/        ← root
    00 - Master Instructions/
    01 - Brand Identity/
    02 - Voice Profiles/
    03 - Research & References/
    04 - Production Plans/
    05 - Scripts & Storyboards/
    06 - Generated Images/
    07 - Animation Assets/
    08 - Audio & Voiceovers/
    09 - Final Videos/
        Animals/
        Plants/
        Quran/
        Hadith/
        Islamic History/
        Educational Stories/
        Science/
        History/
    10 - Thumbnails/
    11 - Subtitles/
    12 - Project Files/
    13 - Production Archives/
```

## Folder ID registry (fill after creation, then verify)

| Folder | Drive ID | Verified |
|---|---|---|
| Root: Abdur Rahman Nayeem - Creative Studio | `1reCNUTWBI_h9MVvSv5iT7Dqmd4gYSIud` | ✔ |
| 00 - Master Instructions | — | ⬜ |
| 01 - Brand Identity | — | ⬜ |
| 02 - Voice Profiles | — | ⬜ |
| 03 - Research & References | — | ⬜ |
| 04 - Production Plans | — | ⬜ |
| 05 - Scripts & Storyboards | — | ⬜ |
| 06 - Generated Images | — | ⬜ |
| 07 - Animation Assets | — | ⬜ |
| 08 - Audio & Voiceovers | — | ⬜ |
| 09 - Final Videos | — | ⬜ |
| 09 / Animals | — | ⬜ |
| 09 / Plants | — | ⬜ |
| 09 / Quran | — | ⬜ |
| 09 / Hadith | — | ⬜ |
| 09 / Islamic History | — | ⬜ |
| 09 / Educational Stories | — | ⬜ |
| 09 / Science | — | ⬜ |
| 09 / History | — | ⬜ |
| 10 - Thumbnails | — | ⬜ |
| 11 - Subtitles | — | ⬜ |
| 12 - Project Files | — | ⬜ |
| 13 - Production Archives | — | ⬜ |

## Existing Drive observations (2026-11-17)

- The Drive already holds prior video work (e.g. multiple *Ayatul Kursi* renders with
  storyboards/subtitles, and *Good Words or Silence* story videos) in ad-hoc folders.
  Those are left untouched; the studio library above is additive.
- Upload rule reminder: never upload unapproved final videos; verify every upload;
  meaningful filenames only.
