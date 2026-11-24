---
title: 'Integrate faceless shinobi avatars'
type: 'feature'
created: '2026-11-24'
status: 'done'
route: 'full'
review_loop_iteration: 0
context: []
baseline_commit: 'c5886f24b5bc2cfc113f7ea7034865024a329146'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The new faceless chibi shinobi portraits have been generated, but the game still uses emoji for player avatars, so the requested art is not visible in play.

**Approach:** Add six selectable portrait sprites, including hijab-wearing girl characters, and use the selected portrait wherever the player's profile avatar is shown. Keep existing saved emoji avatars working.

## Boundaries & Constraints

**Always:** Use the generated `public/assets/2d/concepts/tmt-avatar-icons-v2.png` as the source; keep profiles' existing string avatar field compatible; provide meaningful accessible names for selectable avatars; keep legacy emoji values displayable.

**Never:** Change story companion characters, add avatar purchasing/unlocking, or migrate/overwrite existing profile data. Do not edit the generated route tree or unrelated local changes.

</frozen-after-approval>

## Code Map

- `public/assets/2d/concepts/tmt-avatar-icons-v2.png` -- six transparent source portraits arranged in a 3-column, 2-row sheet; runtime uses the compressed WebP derivative alongside it.
- `src/data/constants.ts` -- current `AVATARS` list; replace new-profile choices with stable sprite IDs and labels.
- `src/types/index.ts` -- `Profile.avatar` is a string; preserve this persisted shape.
- `src/screens/ProfileSelectScreen.tsx` -- profile create/edit avatar selector; reuse its selected-state and submit behavior.
- `src/components/profile/ProfileCard.tsx`, `src/screens/HomeScreen.tsx`, `src/screens/MapScreen.tsx` -- primary profile views and map player marker.
- `src/screens/ParentScreen.tsx`, `src/screens/RewardSetupScreen.tsx`, `src/screens/BattleScreen.tsx`, `src/screens/StatsScreen.tsx` -- parent, reward, battle, and statistics profile avatar surfaces. Native `<option>` elements need text labels, not image children.
- `src/screens/MiniGameAdabScreen.tsx`, `src/screens/MiniGameHitungScreen.tsx`, `src/screens/MiniGameIngatanScreen.tsx`, `src/screens/MiniGamePolaScreen.tsx` -- mini-game leaderboard profile portraits.
- `src/components/mission/MissionPopup.tsx` -- companion emoji are story art and must remain unchanged.

## Tasks & Acceptance

**Execution:**
- [x] `src/components/profile/AvatarPortrait.tsx` and `src/data/constants.ts` -- define the six stable avatar IDs, accessible labels, and a reusable sprite portrait renderer with legacy emoji fallback -- centralize cropping and compatibility.
- [x] `src/screens/ProfileSelectScreen.tsx` -- show and save the six portraits for profile creation/editing -- make the generated art selectable.
- [x] Profile, map, battle, parent, reward, stats, and mini-game surfaces listed in Code Map -- render profile IDs using the shared component and use readable labels in native select options -- keep the avatar consistent throughout the game.
- [x] `src/types/index.ts` -- update the avatar comment/type documentation only if needed; retain compatibility with existing string values.

**Acceptance Criteria:**
- Given a new or edited profile, when the player selects one of the six portraits and saves, then the selected portrait appears in profile selection and all profile-avatar surfaces.
- Given a saved profile whose avatar is an existing emoji, when any profile-avatar surface renders, then the emoji remains visible and the game continues to display the profile normally.
- Given the avatar selector, when navigating it with assistive technology, then each choice has an understandable name and exposes its selected state.
- Given story scenes and companion UI, when they render, then their existing companion illustrations remain unchanged.

## Implementation Notes

Added the shared portrait renderer and wired profile avatar surfaces to it. Existing emoji values fall back to emoji rendering; story companion emoji are unchanged. The runtime WebP preserves the 1536 × 1024 transparent sprite sheet and reduces the asset from 2,604,215 to 389,552 bytes. `npm run build:spa` passed. Browser-based visual checks could not be completed because the local browser session did not attach; the build reports a 1,165 kB main chunk warning.

## Spec Change Log


## Review Triage Log

- `blind-hunter` — **low / patch** — Some Indonesian labels sounded awkward; rewrote the full label set in natural Indonesian.
- `blind-hunter` — **low / patch** — Labels did not identify character gender; each label now says laki-laki or perempuan.
- `blind-hunter` — **low / patch** — Labels described clothing colors inconsistently; all now follow the same character-and-color pattern.
- `blind-hunter` — **false** — The `rose` ID and “merah muda” label refer to the same color; stable IDs remain unchanged.
- `blind-hunter` — **low / patch** — “Zamrud” was less familiar than other colors; replaced it with “hijau tua” in the label.
- `blind-hunter` — **low / patch** — The spec did not record the actual accessible label set; added all six names to Design Notes.
- `blind-hunter` — **medium / patch** — The runtime loaded a 2,604,215-byte PNG sprite; added a transparent WebP derivative (389,552 bytes) and pointed the renderer to it while retaining the PNG source.
- `blind-hunter` — **low / patch** — The asset pack instructed maintainers to split portraits and said the game had not adopted the assets; corrected it to describe CSS cropping, production derivative, and current integration.
- `blind-hunter` — **low / patch** — The asset pack omitted the stable row-major sprite mapping; documented the six cells.
- `blind-hunter` — **low / patch** — Manual verification state was unclear; the Verification section now distinguishes completed build verification from pending browser checks.
- `edge-case-hunter` — **false** — The reported image `onError` handler does not exist; `AvatarPortrait` uses a CSS `backgroundImage`, so the cited failure scenario is not present in the code.
- `verification-gap` — **medium / defer** — No project test runner or app tests exist (the only test files found are BMAD tooling tests); defer adding regression tests until test work is requested and an app-level test setup is chosen.

## Design Notes

The portrait sheet is a 3-by-2 grid. Keep the sprite crop in one reusable component so each screen uses the same cell mapping and legacy values need no data migration. Row-major portrait order and accessible names: `Shinobi laki-laki berpakaian biru`, `Shinobi perempuan berhijab teal`, `Shinobi laki-laki berpakaian hijau`, `Shinobi perempuan berhijab merah muda`, `Shinobi laki-laki berpakaian oranye`, `Shinobi perempuan berhijab hijau tua`.

## Verification

**Commands:**
- `npm run build:spa` -- expected: production SPA build completes successfully.

**Completed:**
- `npm run build:spa` completed successfully after integrating the sprite sheet.

**Pending manual checks:**
- Create and edit profiles using each of the six portraits; confirm the selection persists when returning to the game.
- Inspect map marker, profile card, battle, parent/reward screens, and mini-game leaderboard for consistent portraits.
- Open a pre-existing emoji-avatar profile and confirm it still renders.
