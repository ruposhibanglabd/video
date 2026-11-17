# Abdur Rahman Nayeem — Personal AI Creative Studio

> **Premium Motion Graphics · Animation · Documentary · Educational Storytelling**
> Creator brand: **ABDUR RAHMAN NAYEEM**

This directory is the persistent memory and operating system of the Personal AI Creative
Studio. It exists so that **no conversation ever starts from zero**: every standard,
approval rule, voice preference and production decision lives here in Git.

**Initialized:** 2026-11-17 · **Status:** Framework ready — awaiting first topic.

---

## The one rule that governs everything

> **THE USER PROVIDES THE TOPIC.**
> **PHASE 1:** research, concept, script, storyboard, timeline, voice options, plan → **present**.
> **PHASE 2:** produce **only after explicit user approval**.
> Never start final production before approval. Never forget the established standards.

## How any new session must start

1. Read [`system/MASTER_INSTRUCTIONS.md`](system/MASTER_INSTRUCTIONS.md) — the doctrine.
2. Read [`system/APPROVAL_WORKFLOW.md`](system/APPROVAL_WORKFLOW.md) — the two-phase process.
3. Skim `personal-brand/`, `voice-library/` (current profiles + history).
4. Check `projects/` for prior work and `CHANGELOG.md` for the latest decisions.
5. For Google Drive delivery locations, read `system/GOOGLE_DRIVE_MAP.md`.

## Structure

| Path | Contents |
|---|---|
| `system/` | Master instructions, creative direction, visual identity, motion graphics, typography, sound design, color grading, Islamic content rules, technical standards, approval workflow, Drive folder map |
| `personal-brand/` | Brand identity, signature guidelines, profile-photo usage rules |
| `production/` | End-to-end workflow, scene-planning template, timeline template, QC checklist |
| `voice-library/` | Voice-style profiles and per-project voice selection history |
| `projects/<project-name>/` | One folder per production: RESEARCH, SCRIPT, STORYBOARD, PRODUCTION_PLAN, ASSET_MANIFEST, VOICE_SETTINGS, TIMELINE, PRODUCTION_LOG, FINAL_DELIVERY |
| `assets/` | Reference material, fonts, audio, visual-guideline assets |
| `CHANGELOG.md` | Every approved standard, correction and decision, dated |

## Capabilities already available in this repository

- **Renderer:** Node.js 1080×1920 (4K-capable) cinematic Reels pipeline — WebCodecs +
  mp4-muxer in browser, CLI renderer with `@napi-rs/canvas`; ffmpeg via
  `@ffmpeg-installer/ffmpeg` after `npm install` (`src/render/`, `tools/`).
- **Bengali typography on disk:** Noto Sans Bengali (4 weights) in `assets/fonts/` and
  `public/fonts/`; Hind Siliguri, Anek Bangla, Tiro Bangla + Latin display faces
  (Cinzel, Cormorant Garamond, Bodoni Moda, Montserrat) in `miqa/brand/fonts/`.
- **QA tooling precedent:** contact-sheet frame QA (`tools/qa-frames.mjs`).
- **Companion brand memory:** `miqa/` — MIQA watch studio (separate brand, do not mix).

## Standing notes

- Personal photograph of Abdur Rahman Nayeem: **not yet provided** — see
  `personal-brand/PROFILE_ASSET_GUIDELINES.md`.
- Google Drive library **"Abdur Rahman Nayeem - Creative Studio"** is the delivery
  archive; folder IDs are recorded in `system/GOOGLE_DRIVE_MAP.md` once created.
- No credentials, API keys or tokens are ever stored in Git.
