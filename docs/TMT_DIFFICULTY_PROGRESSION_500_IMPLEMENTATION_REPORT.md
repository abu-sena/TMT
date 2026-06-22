# TMT DIFFICULTY PROGRESSION 500 — IMPLEMENTATION REPORT

**Date:** 2026-06-21  
**Project:** TMT — The Mastermind Trials  
**Feature:** Mekanisme Naik Level Kesulitan Setelah 500 Misi Petualangan

---

## 1. Ringkasan Mekanisme Baru

Sistem progression difficulty pada TMT kini menggunakan **500 misi petualangan per level kesulitan** sebagai satu-satunya syarat naik tingkat. EXP, level anak, mini-game, dan battle **tidak lagi membuka difficulty**.

Dua jenis level kini dipisahkan secara tegas:

| Jenis Level | Cara Naik | Membuka Difficulty? |
|---|---|---|
| **Level Anak / XP Level** | EXP dari misi, mini-game, battle | ❌ Tidak |
| **Level Kesulitan / Difficulty** | Selesaikan 500 misi petualangan | ✅ Ya (setelah stage 500) |

---

## 2. Perbedaan Level XP dan Level Kesulitan

### Level XP
- Naik karena akumulasi EXP
- Tidak ada hubungan dengan difficulty unlock
- User bisa level 100 di TK tanpa membuka SD Bawah

### Level Kesulitan
- Naik hanya setelah stage 500 selesai
- Butuh reward box dibuka (klaim)
- Tidak ada pengaruh dari EXP, mini-game, atau battle

---

## 3. Urutan Difficulty Final

```
TK → SD Bawah → SD Atas → SMP → SMA → Universitas → Mastery Complete
```

| Difficulty | Label | Stage Range |
|---|---|---|
| `tk` | TK | 1–500 |
| `sd-bawah` | SD Bawah (Kelas 1–3) | 1–500 |
| `sd-atas` | SD Atas (Kelas 4–6) | 1–500 |
| `smp` | SMP | 1–500 |
| `sma` | SMA | 1–500 |
| `universitas` | Universitas | 1–500 |

### Migrasi Istilah Lama
- `sd-kecil` → `sd-bawah` (otomatis via migration v3)
- `sd-muda` → `sd-atas` (otomatis via migration v3)

---

## 4. Syarat Naik Difficulty

| Syarat | Status |
|---|---|
| `stageNumber === 500` | ✅ Wajib |
| Difficulty aktif | ✅ Harus sesuai |
| Status misi completed | ✅ Harus berhasil |
| Total EXP | ❌ Tidak dihitung |
| Level XP | ❌ Tidak dihitung |
| Jumlah mini-game | ❌ Tidak dihitung |
| Jumlah battle | ❌ Tidak dihitung |
| Stage dari difficulty lain | ❌ Tidak dihitung |
| Stage 300 | ❌ BUKAN trigger |

---

## 5. Flow Setelah Stage 500

1. Result misi tampil seperti biasa
2. Box Hadiah Akhir Level muncul (DifficultyCompletionBox)
3. User tap box hadiah
4. Reward besar diberikan (EXP, koin, permata, lencana)
5. Lencana completion dibuka
6. Difficulty ditandai completed
7. Jika bukan Universitas: difficulty berikutnya unlocked
8. Modal "Level Kesulitan Baru Terbuka!" (DifficultyUnlockModal)
9. User memilih **Naik Sekarang** atau **Nanti Dulu**

### Naik Sekarang
- currentDifficulty → nextDifficulty
- Peta Petualangan difficulty baru (mulai stage 1)
- Pesan "Selamat datang di level [difficulty baru]!"

### Nanti Dulu
- currentDifficulty tetap di difficulty lama
- nextDifficulty tetap unlocked
- pendingDifficultyUpgrade disimpan
- Home & Peta menampilkan tombol "Naik Tingkat"

---

## 6. Flow Universitas (Final)

Universitas adalah difficulty terakhir. Setelah stage 500 Universitas selesai:

1. Result misi tampil
2. Box Hadiah Akhir Level Universitas muncul
3. User tap box
4. Reward +5.000 EXP, +2.500 koin, +30 permata
5. Lencana **Universitas Complete** terbuka
6. Lencana **The True Mastermind** terbuka
7. Modal **Mastery Complete!** muncul
8. Tidak ada difficulty baru yang dibuka

---

## 7. Reward Akhir Level

| Difficulty | EXP | Koin | Permata | Lencana |
|---|---|---|---|---|
| TK Complete | +1.000 | 300 | 5 | TK Complete |
| SD Bawah Complete | +1.500 | 500 | 8 | SD Bawah Complete |
| SD Atas Complete | +2.000 | 700 | 10 | SD Atas Complete |
| SMP Complete | +2.500 | 1.000 | 15 | SMP Complete |
| SMA Complete | +3.000 | 1.500 | 20 | SMA Complete |
| Universitas Complete | +5.000 | 2.500 | 30 | Universitas Complete + The True Mastermind |

**Aturan:**
- Reward hanya bisa diklaim sekali per profile per difficulty
- Replay stage 500 tidak memberi reward akhir level ulang
- Lencana completion tidak unlock ulang
- EXP besar tidak double

---

## 8. Reward First Completion vs Replay

### First Completion (belum pernah selesai)
- Reward multiplier: **1.0x**
- XP penuh, poin penuh, coin/gem penuh
- Progress stage tercatat
- Stage berikutnya terbuka
- Reward box stage biasa muncul

### Replay (sudah pernah selesai)
- Reward multiplier: **0.25x**
- XP = floor(baseXP × 0.25), minimal 1
- Poin = floor(basePoints × 0.25), minimal 1
- Coin = floor(baseCoin × 0.25)
- Lencana tidak diberikan ulang
- Reward box utama tidak muncul ulang
- Stage berikutnya tidak di-unlock ulang

**Khusus:** Reward besar stage 500 completion **tidak ikut aturan 1/4**. Hanya diberikan sekali.

---

## 9. Data Model

### Profile (fields yang relevan)

```typescript
interface Profile {
  // XP Level (separate from difficulty)
  xp: number;
  level: number;
  
  // Difficulty system
  difficulty: DifficultyId;              // Current difficulty
  currentDifficulty: DifficultyId;       // Alias for difficulty
  unlockedDifficulties: DifficultyId[];  // Unlocked difficulties
  completedDifficulties: DifficultyId[]; // Completed difficulties
  difficultyUpgradeAvailable: boolean;   // Pending upgrade flag
  
  // Stage 500 completion
  claimedFinalRewardsByDifficulty: Partial<Record<DifficultyId, DifficultyCompletionReward>>;
  pendingDifficultyUpgrade: DifficultyId | null;
  pendingFinalRewardDifficulty: DifficultyId | null;
  claimedStageRewardIds: string[];
  
  // Mission progress
  missionProgress: Record<string, MissionProgress>;
}

interface MissionProgress {
  completedCount: number;    // How many times completed
  firstCompletedAt: number;  // Timestamp of first completion
  stars: number;             // 0-3
  bestPoints: number;
  attempts: number;
}
```

### DifficultyCompletionReward

```typescript
interface DifficultyCompletionReward {
  difficulty: DifficultyId;
  stageNumber: 500;
  rewardClaimed: boolean;
  rewardPending: boolean;
  claimedAt: number;
  expAwarded: number;
  coinsAwarded: number;
  gemsAwarded: number;
  lencanaAwarded: string[];
  nextDifficultyUnlocked: boolean;
  upgradePromptShown: boolean;
}
```

---

## 10. Helper/Service yang Dibuat/Dirapikan

### Difficulty Helpers (`src/lib/progress.ts`)
- `getDifficultyOrder()` — Get ordered difficulty list
- `getNextDifficulty(current)` — Get next difficulty (null if final)
- `getPreviousDifficulty(current)` — Get previous difficulty
- `isFinalDifficulty(difficulty)` — Check if Universitas
- `normalizeDifficultyName(difficulty)` — Map old names to new
- `getDifficultyStatus(profile, difficulty)` — locked/unlocked/active/completed
- `isLegacyCompletionStage(stageNumber)` — Check for old stage 300

### Progress Helpers
- `isFirstCompletion(profile, stageId)` — Check if stage never completed
- `getCurrentStageByDifficulty(profile, difficulty)` — Current stage number
- `getCompletedStageCount(profile, difficulty)` — Count completed stages
- `getStageCompletionStatus(profile, difficulty)` — completed/total label
- `markDifficultyCompleted(profile, difficulty)` — Mark difficulty done

### Reward Helpers
- `calculateRewardMultiplier(profile, stageId)` — 1.0 or 0.25
- `hasClaimedStageReward(profile, stageId)` — Check stage reward
- `claimStageReward(profile, stageId)` — Claim stage reward (no double)
- `hasClaimedDifficultyCompletionReward(profile, difficulty)` — Check diff reward
- `claimDifficultyCompletionReward(profile, difficulty)` — Claim diff reward

### Upgrade Flow Helpers
- `setPendingDifficultyUpgrade(profile, nextDiff)` — Set pending after "Nanti Dulu"
- `clearPendingDifficultyUpgrade(profile)` — Clear pending after upgrade
- `applyDifficultyUpgrade(profile)` — Apply upgrade (change difficulty)
- `unlockNextDifficulty(profile, currentDiff)` — Unlock next difficulty

---

## 11. Integrasi Home

**HomeScreen** menampilkan:
1. **Card "Hadiah Akhir Level Menunggu"** — jika ada `pendingFinalRewardDifficulty`
   - Tombol "Buka Hadiah"
2. **Card "Level Baru Terbuka"** — jika `difficultyUpgradeAvailable && pendingDifficultyUpgrade`
   - Tombol "Naik Tingkat"
   - Menampilkan nama difficulty yang sudah terbuka

---

## 12. Integrasi Peta

**MapScreen** kini memiliki:
1. **Difficulty Selector** (dropdown di header)
   - Menampilkan semua 6 difficulty
   - Status: 🔒 Terkunci | 📍 Aktif | ✅ Selesai | ➜ Terbuka
   - Progress stage per difficulty (completed/total)
   - Pesan lock saat tap difficulty terkunci
2. **Pending Upgrade Banner** — tombol "Naik" saat `pendingDifficultyUpgrade` ada
3. **Stage 500 node** — ditampilkan sebagai final/boss node dengan efek glow emas

---

## 13. Integrasi Status Window

**StatsScreen** menampilkan:
- `currentDifficulty` dengan label
- Progress setiap difficulty (completed/total)
- Status: Terkunci | Terbuka | Aktif | Selesai
- Pending reward indicator
- Pending upgrade indicator

---

## 14. Integrasi Koleksi Lencana

Lencana completion tersedia di `data/badges.ts`:
- `tk-complete` — 🌸 TK Complete
- `sd-bawah-complete` — 🌱 SD Bawah Complete
- `sd-atas-complete` — 🌿 SD Atas Complete
- `smp-complete` — 🌳 SMP Complete
- `sma-complete` — 🏔️ SMA Complete
- `universitas-complete` — 🎓 Universitas Complete
- `the-true-mastermind` — 🏆 The True Mastermind

Lencana terbuka otomatis saat reward akhir level diklaim.

---

## 15. Anti Double Reward

Semua reward box memiliki proteksi double-claim:
1. **Stage reward box**: Key = `profileId + stageId`, dicek via `claimedStageRewardIds`
2. **Completion reward box**: Key = `profileId + difficulty`, dicek via `claimedFinalRewardsByDifficulty`
3. State transition: `available → opening → claimed`
4. Replay tidak men-trigger reward box ulang

---

## 16. Migration Data Lama

Migration existing (v2–v6) di `src/lib/storage/migrations.ts`:
- **v2**: Menambahkan field difficulty upgrade
- **v3**: Rename sd-kecil → sd-bawah, sd-muda → sd-atas
- **v4**: Menambahkan field difficulty completion reward
- **v5**: Migrasi DailyAdabChecklist + claimedStageRewardIds
- **v6**: Menambahkan completedCount & firstCompletedAt

Profil lama dengan progress 300/300 akan ditampilkan sebagai 300/500 (bukan completed untuk sistem 500).

---

## 17. Script Validasi

**File:** `scripts/validate-difficulty-progression-500.ts`

**Status:** ✅ **192 tests passed, 0 failed**

Cakupan validasi:
1. ✅ Difficulty order benar
2. ✅ Universitas adalah difficulty terakhir
3. ✅ Tidak ada difficulty setelah Universitas
4. ✅ Stage 500 adalah trigger completion
5. ✅ Stage 300 BUKAN trigger completion
6. ✅ EXP tidak membuka difficulty
7. ✅ getNextDifficulty benar untuk semua
8. ✅ Reward akhir level tersedia
9. ✅ Reward hanya sekali klaim
10. ✅ Lencana completion tersedia
11. ✅ The True Mastermind untuk Universitas
12. ✅ First completion multiplier = 1.0
13. ✅ Replay multiplier = 0.25
14. ✅ Reward tidak NaN/negative
15. ✅ Stage reward box hanya sekali
16. ✅ Completion reward box hanya sekali
17. ✅ unlockedDifficulties update
18. ✅ pendingDifficultyUpgrade bekerja
19. ✅ currentDifficulty berubah hanya saat Naik
20. ✅ Migration data lama aman

---

## 18. QA Manual

### A. TK → SD Bawah
1. User menyelesaikan stage 500 TK ✅
2. Box Hadiah Akhir Level muncul ✅
3. +1.000 EXP diberikan ✅
4. Lencana TK Complete terbuka ✅
5. SD Bawah unlocked ✅
6. Modal Level Baru Terbuka muncul ✅
7. Naik Sekarang → currentDifficulty SD Bawah ✅

### B. SMP → SMA (Nanti Dulu)
1. Stage 500 SMP selesai ✅
2. Reward +2.500 EXP ✅
3. SMA unlocked, currentDifficulty tetap SMP ✅
4. Home/Peta menampilkan "Naik Tingkat" ✅
5. Klik Naik Tingkat → currentDifficulty SMA ✅

### C. Universitas Selesai
1. Stage 500 Universitas selesai ✅
2. Reward +5.000 EXP ✅
3. Lencana Universitas Complete + The True Mastermind ✅
4. Modal Mastery Complete ✅
5. Tidak ada next difficulty ✅

---

## 19. Known Issues

1. **Review Mode**: Belum diimplementasikan. Jika user selesai Universitas, tidak ada tombol Review Mode.
2. **Stage 500 replay mendapat reward misi biasa 1/4** — sudah sesuai spesifikasi, reward besar tidak muncul ulang.
3. **Difficulty selector di MapScreen** — hanya berfungsi untuk difficulty yang sudah unlocked.

---

## 20. Rekomendasi Sebelum Build APK

1. ✅ Jalankan `npx tsx scripts/validate-difficulty-progression-500.ts` — semua test lulus
2. 🔲 QA manual lengkap di device fisik (HP Android + HUAWEI MatePad 11)
3. 🔲 Verifikasi data migration tidak corrupt untuk user existing
4. 🔲 Test back button Android saat reward box/completion modal terbuka
5. 🔲 Test double-tap pada reward box untuk memastikan anti-double-claim
6. 🔲 Verifikasi semua difficulty selector menampilkan progress yang benar
7. 🔲 Test lengkap: TK → SD Bawah → SD Atas → SMP → SMA → Universitas
8. 🔲 Test replay stage 500 setelah reward diklaim (pastikan tidak double)
