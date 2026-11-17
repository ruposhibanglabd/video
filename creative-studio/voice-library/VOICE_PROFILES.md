# Voice Profiles

Voice style is a **user-controlled decision**. For each topic, the studio determines the
ideal narration style, presents 3–5 suitable profiles with character notes (and short
audition previews where tooling allows), then **waits for the user's selection**. No
voice is forced across projects; selections are logged in
[`VOICE_SELECTION_HISTORY.md`](VOICE_SELECTION_HISTORY.md).

## The five studio voice-style profiles

### V1 — Premium Documentary Male
- **Character:** deep, calm, authoritative, cinematic
- **Speed:** measured, deliberate
- **Tone:** gravitas, wonder
- **Best for:** documentary, history, science epics, Quran/tafsir context pieces
- **Bengali:** must be native-quality; **Arabic:** required for Islamic topics

### V2 — Warm Educational Male
- **Character:** friendly, clear, natural, engaging
- **Speed:** moderate
- **Tone:** encouraging teacher
- **Best for:** general education, science explainers, children's-adjacent content
- **Bengali:** native-quality; Arabic helpful

### V3 — Professional Female Narrator
- **Character:** elegant, expressive, clear
- **Speed:** moderate
- **Tone:** refined, warm authority
- **Best for:** nature, plants, emotional education, storytelling
- **Bengali:** native-quality

### V4 — Emotional Storytelling Voice
- **Character:** warm, expressive, narrative-driven
- **Speed:** flexible, follows the story's breath
- **Tone:** empathetic, cinematic
- **Best for:** moral stories, prophetic/biographical storytelling (with Islamic
  depiction rules), history
- **Bengali:** native-quality; Arabic required when Quranic quotes appear

### V5 — Youthful Educational Voice
- **Character:** energetic, friendly, easy to understand
- **Speed:** brisk but clear
- **Tone:** curious, upbeat
- **Best for:** children's education, quick science facts
- **Bengali:** native-quality

## How selection works in practice

1. Studio recommends 3–5 profiles suited to the topic (from the list above).
2. Audition previews are generated when the voice tooling supports it — the user
   listens and picks (in this environment, voices are auditioned and chosen by the user
   before any narration is produced; a picked voice stays consistent for that project).
3. Alternatively, the user may supply an external voiceover file (e.g. ElevenLabs) —
   the studio then syncs everything to that audio.
4. The choice is saved to the project's `VOICE_SETTINGS.md` and to
   `VOICE_SELECTION_HISTORY.md`.

## Known reference

- Repo root contains an ElevenLabs Bengali sample: *"Debashish — Warm, Proud"*
  (`gen_sp100_s50_sb75_v4`, dated 2026-10-20) — evidence of a previously used external
  Bengali voice. Recorded in the history file.
