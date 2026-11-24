---
title: 'Streamline the first-play journey'
type: 'feature'
created: '2026-11-24'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** First-time players see two onboarding actions that do the same thing, including a Google-sync claim that is not implemented. After profile creation they must confirm again, open the map, and find the first mission, creating avoidable friction.

**Approach:** Make onboarding honest and focused, simplify first-profile setup to nickname, avatar, and difficulty, then route the first created profile directly to the adventure map where the current first mission is already brought into view. Preserve gender data and editing for existing profiles.

</frozen-after-approval>

## Code Map

- `D:/Aplikasi/TMT/adab-quest-adventure/src/screens/OnboardingScreen.tsx` -- replace the duplicate Google-sync content/action with a concise first-play preview and one clear forward action.
- `D:/Aplikasi/TMT/adab-quest-adventure/src/screens/ProfileSelectScreen.tsx` -- distinguish first profile setup from profile selection; keep gender out of new-profile setup (default to `unspecified`), retain it while editing, and signal first-profile completion.
- `D:/Aplikasi/TMT/adab-quest-adventure/src/GameAppStandalone.tsx` and `D:/Aplikasi/TMT/adab-quest-adventure/src/routes/index.tsx` -- both app entry points render the shared profile screen; route only the first created profile directly to `map`.
- `D:/Aplikasi/TMT/adab-quest-adventure/src/screens/HomeScreen.tsx` -- label the main CTA “Mulai Misi Pertama” before any mission is completed and “Lanjutkan Misi” afterward.
- `D:/Aplikasi/TMT/adab-quest-adventure/src/screens/MapScreen.tsx` -- already selects and scrolls to the current stage; reuse this behavior without changing map progression.

## Tasks & Acceptance

**Execution:**
- [x] `src/screens/OnboardingScreen.tsx` -- remove the duplicate CTA and unimplemented Google-sync promise; present a truthful, short path into play.
- [x] `src/screens/ProfileSelectScreen.tsx` -- simplify first-time profile fields, preserve edit behavior, and call the continue callback after creating the first profile.
- [x] `src/GameAppStandalone.tsx` and `src/routes/index.tsx` -- route the first-profile callback to the map and retain existing routes for returning and multi-profile users.
- [x] `src/screens/HomeScreen.tsx` -- make the primary mission CTA reflect whether the player has completed a mission.

**Acceptance Criteria:**
- Given a fresh install, when onboarding is shown, then it presents one clear action and makes no claim of Google sync or account setup.
- Given a fresh install, when the first profile is saved, then the map opens directly with the current first mission in view.
- Given an existing profile, when it is edited, then its gender value remains editable and unchanged unless the user changes it.
- Given a player with no completed missions, when Home is shown, then its primary action says “Mulai Misi Pertama”; after a mission is completed it says “Lanjutkan Misi”.
- Given either the web app or Capacitor entry point, when the first-play flow is used, then both follow the same routing behavior without changing the persisted profile schema.
- Given one or more profiles already exist, when another profile is created, then the user remains in profile selection and can continue through the normal profile flow instead of being routed directly to the map.

## Implementation Notes

Oneshot route: estimated under 100 changed lines across five cohesive UI and routing files; no storage migration or independent deliverable is needed.

- Replaced the duplicate onboarding action and mock Google-sync claim with a short three-step path and clear local-only save copy.
- First profile creation now signals the web and Capacitor entry points to open the map. Additional profiles and existing-profile selection retain their previous continuation behavior.
- New profiles keep the existing schema and use `unspecified` gender by default; gender remains editable for existing profiles. Avatar, difficulty, and gender choices expose their group and selected state to assistive technology.
- Home now distinguishes the first-mission action from continuing an existing run.
- `npm run build:spa` succeeded. Vite still reports the app JavaScript chunk is over its 500 kB warning threshold.

## Review Triage Log

- `low` — Onboarding star wording could promise a star on every mission; revised the copy to describe trying to earn stars by completing missions.
- `low` — The progression preview did not explain where the first mission appears; it now points players to the map and connects mission completion with continued exploration.
- `low` — Onboarding dropped the “Ilmu & Akhlak” product framing; restored both learning themes in the introduction.
- `low` — Local-only progress scope could be clearer; copy now states progress is saved only on this device, matching the local storage implementation.
- `low` — The preview omitted the map handoff; its steps now show that the player selects the first mission on the map.
- `low` — New-profile gender default was hidden; the profile screen now explains it is set to “Tidak ditentukan” and can be changed later.
- `low` — Gender choices lacked selected-state semantics; added `aria-pressed` to those buttons.
- `low` — Avatar and difficulty choices lacked accessible group names; added labeled groups and selected-state semantics.
- `low` — The form heading conflicted with first-time setup wording; it now names the new adventurer profile consistently.
- `false` — `_bmad/` is generated workflow support the user explicitly asked to preserve, not a product change; it remains local and will be excluded from the feature commit.
- `low` — Spec status and task checkboxes were stale after implementation; marked the work done and tasks complete.
- `low` — Later profile creation was not an explicit acceptance check; added a criterion confirming its normal flow.

## Verification

**Commands:**
- `npm run build:spa` -- expected: successful Capacitor SPA build.
