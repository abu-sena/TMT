# RANDOM CHOICES FIX REPORT

## Summary
All multiple-choice options in all game types now use Fisher-Yates shuffle for proper randomization. The correct answer is no longer predictably positioned.

## Date
2026-06-17

## Implementation

### Utility Functions Added (`src/lib/utils.ts`)
- `shuffleArray<T>(array: T[]): T[]` — Fisher-Yates shuffle, returns new array
- `createShuffledChoices<T>(options: T[]): T[]` — Wrapper for mission option shuffling
- `validateChoices(choices, correctAnswerId)` — Validates correct answer is present and no duplicates
- `ensureUniqueChoices<T>(choices: T[]): T[]` — Deduplicates by id

### Where Shuffle Is Applied

| Game Type | File | Method |
|-----------|------|--------|
| Misi Utama | `src/screens/PlayScreen.tsx` | `useMemo` shuffles options once on mission load |
| Boss Mission | `src/screens/PlayScreen.tsx` | Each step's options shuffled independently |
| Hitung Kilat | `src/screens/MiniGameHitungScreen.tsx` | `shuffleArray` used for distractors |
| Pola Kilat | `src/screens/MiniGamePolaScreen.tsx` | `shuffleArray` used for distractors |
| Ingatan Cepat | `src/screens/MiniGameIngatanScreen.tsx` | `shuffleArray` used for sequence/options |
| Adab Cepat | `src/screens/MiniGameAdabScreen.tsx` | `shuffleArray` used for option ordering |
| Battle (Duel) | `src/lib/battle.ts` | `shuffleArray` used for all battle question types |

### Key Design Decisions
1. **Shuffle once, not re-render**: Options are shuffled in `useMemo` with `[mission]` dependency. This prevents options from jumping around during gameplay/timer ticks.
2. **ID-based validation**: Answer checking uses `selected === mission.correctAnswer` (id-based), not position-based, ensuring shuffle doesn't break correctness.
3. **Boss mission steps**: Each step's options are shuffled independently via `createShuffledChoices`.

## Test Results

```
Test suite: scripts/test-random-choices.ts
Total: 452 tests
Passed: 452 ✅
Failed: 0 ❌
Success rate: 100%
```

### Coverage
- 100 trials × 4 mission types (multiple_choice, moral_decision, tk_visual_match, boss_step)
- Correct answer appeared in all positions across all trial sets
- Edge cases: empty array, single option, two options — all handled correctly
- No duplicate IDs detected

## Files Changed
- `src/lib/utils.ts` — Added shuffle/validate utilities
- `src/screens/PlayScreen.tsx` — Added `useMemo` shuffled mission
