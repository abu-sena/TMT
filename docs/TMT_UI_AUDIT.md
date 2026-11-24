# TMT UI audit and polish

Date: 2026-11-24

## Scope and method

Static source audit of the screen dispatcher in `src/routes/index.tsx`, shared UI primitives, global styles, and the mini-game registry. This dispatcher is a client-side screen state machine under the `/` route, so the inventory below describes in-game screens rather than separate URL routes. Browser based visual review and assistive-technology checks were unavailable; those checks are marked **Not verified**.

## Screen coverage

| Area | Screens/states reviewed |
| --- | --- |
| Entry and profiles | Splash, onboarding, profile selection |
| Core adventure | Home, map, mission popup, play, mission result |
| Progress | Badges, stats, daily missions |
| Mini-game hub | Mini-game center, 14 enabled games, shared mini-game result; family challenge and battle |
| Family and settings | Parent gate/dashboard, reward setup, my rewards, settings, privacy, screen-time reminder |
| Disabled entries | Four adab mini-games redirect to the adventure map; documented as intentionally disabled in the flat mini-game list |
| Shared/fallback | Hydration splash, global error and not-found UI |

## Changes made

- Set the document language to Indonesian and allow pinch zoom on mobile.
- Added a consistent keyboard focus-visible treatment and reduced-motion handling.
- Replaced broad `transition-all` on the shared game button with transitions limited to filter, transform, and shadow.
- Added a forest backdrop to the splash screen and generated eight themed biome banner tiles for the map world header.
- Generated a 12-object transparent atlas and integrated its fruit/animal sprites into Memory game prompts and choices.
- Added descriptive accessible names to map stage controls, Cari yang Berbeda shape choices, and close/exit controls found during this pass.
- Promoted the mini-game result title to the screen's primary heading.

## Verification

- **Build:** `npm run build:spa` — passed. Vite reports the existing main JavaScript chunk is about 1.17 MB and above its 500 kB advisory threshold.
- **Visual/runtime review:** Not verified; no browser runtime was available in this session.
- **Keyboard/screen-reader review:** Not verified; only source-level semantics and focus styling were inspected.
- Generated source atlases live in `docs/assets/2d/`; optimized game assets live in `public/assets/2d/`.

## Follow-up

Review every screen at narrow mobile and tablet sizes in a browser, including map overlays, parent screens, mini-game states, and result/exit dialogs. Check keyboard traversal, screen-reader names, contrast, and reduced-motion behavior in runtime. The current pass is a source-level polish and asset integration, not a complete visual QA sign-off.
