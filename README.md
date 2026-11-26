# momentos — PHOTO SAFE feed study

One link. Each visitor is assigned to **one feed of 10 posts** (20%, 50% or 80% AI images) × **one stamp group** (A: no stamps; B: PHOTO SAFE stamps on ~75% of real photos). Assignment is balanced across the 6 cells using the counts already in the Sheet. After the feed: 5 quiz questions, then a reveal of which images were AI.

Same content mix in every feed: 2 posts each of animais, comida, natureza, pessoas, cidade.

## Setup (about 15 min)

### 1. Google Sheet + Apps Script
1. Create a new Google Sheet with a **personal** Google account.
2. **Extensions → Apps Script**. Delete the default code, paste `apps-script/Code.gs`, save.
3. **Deploy → New deployment →** type *Web app*. Execute as: **Me**. Who has access: **Anyone**. Deploy and authorise.
4. Copy the URL ending in `/exec`.
   The `participantes` and `publicacoes` tabs are created on the first submission.

If you change `Code.gs` later: Deploy → Manage deployments → edit → Version: *New version* (the URL stays the same).

### 2. Config
Open `config.js` and paste the URL into `APPS_SCRIPT_URL`.

### 3. GitHub Pages
1. Create a **public** repository. Pick a neutral name like `momentos`: the name appears in the link, so don't call it `ai-photo-test`.
2. **Add file → Upload files**, then drag in everything from this folder (not the folder itself).
3. **Settings → Pages →** Source: *Deploy from a branch*, Branch: `main`, folder `/ (root)`. Save.
4. After about a minute the site is live at `https://<user>.github.io/momentos/`.

### 4. Pilot before sharing
- `…/momentos/?test=1` is a normal run, but its rows are marked `test = TRUE` and don't count towards balancing.
- `…/momentos/?feed=80&stamps=B&debug` forces a cell and shows an IA/REAL tag on each image. It is always marked as a test.
- `?reset=1` clears the "already took part" lock in that browser.
- Check that rows appear in both tabs. Then delete the test rows, or filter on `test` later.

## Images

Send **at least 30 images**: 5 categories × (3 real + 3 AI). More per category means more variety between participants.

```
fotos/
  real/  animais/ comida/ natureza/ pessoas/ cidade/
  ia/    animais/ comida/ natureza/ pessoas/ cidade/
```

- **Real:** the team's own phone photos. Keep the subject near the centre, because images are cropped to 4:5. Only include people who agreed to be in them.
- **AI:** same subjects, prompted as ordinary smartphone photos (not polished or "cinematic"). Remove any visible generator watermark (Gemini and Meta AI put one in a corner).
- Then run `pip install pillow pillow-heif` and `python tools/preparar_imagens.py fotos/`. This replaces `images/` and `manifest.js`, strips all metadata, renames files neutrally (p01.jpg…) and keeps the phone model and date for the stamp's origin panel. The originals and `mapeamento_privado.csv` stay outside the repo.

## Data (Google Sheet)

**participantes**: one row per person (it is created when the feed starts, so drop-offs are kept)

| column | meaning |
|---|---|
| session_id, created_at, updated_at, seq | identifiers / timing (seq = snapshot counter) |
| test | TRUE for pilot / localhost / forced runs |
| feed_ai_pct, stamps_arm, assignment | condition: 20/50/80 · A/B · balanced/random/override |
| stage | last screen reached: feed, fim_feed, quiz, concluido |
| age_band, social_time | profile answers |
| posts_seen, feed_completed, feed_ms | how far they got and total time in the feed |
| likes, likes_ai, likes_real, comments_opened, stamp_taps | totals |
| quiz_completed, q1_sem_selo … q5_texto | quiz (q2/q3 on a 1–5 scale; q5 free text) |
| q0_quantas_ia, ai_real | guess of how many of the 10 images were AI (asked first, before PHOTO SAFE is explained) vs. the actual number |
| device, viewport, user_agent, started_at | context |

**publicacoes**: one row per person × post

| column | meaning |
|---|---|
| position, image_id, category, is_ai, stamp_shown | what was shown, and where in the feed |
| seen, views | reached at least once; number of times it came on screen |
| dwell_ms / dwell_raw_ms | time with ≥60% of the post on screen, paused while the tab is hidden; dwell_ms is capped at 60 s |
| first_seen_s | seconds from the start of the feed until the post was first seen |
| liked, like_toggles, doubletap_likes | final like state; how many times it was changed; how many double-taps |
| comments_opened, comments_ms | opens of the comments sheet; time spent in it |
| stamp_taps, stamp_ms | taps on the PHOTO SAFE stamp; time spent in the origin panel |

Rows are rewritten as the person moves through the study (no duplicates). An older snapshot never overwrites a newer one.

## Captions, comments and names
`conteudo.js` holds the 45 display names and, for each image, a caption and 3 comments. A real photo and its AI twin (`real-animais-2` / `ai-animais-2`) share the key `animais-2`, so they get the same text, and the randomiser never puts both twins in the same feed. Edit the text freely. Keep the comments free of anything about authenticity or AI.

## Notes
- The quiz wording uses `STAMP_LABEL` from `config.js` ("Feita por humano"). Change it there and both the stamp and the quiz update.
- If you change the design after data collection has started, bump `STUDY_VERSION`.
- Anyone who opens the page source can see which images are AI. That's acceptable for this audience.
