# Mastermind Duel Feature Report

**Date:** 2026-06-17  
**Project:** TMT (The Mastermind Trials)

---

## 1. Konsep Fitur

**Mastermind Duel** adalah mode battle lokal dalam 1 device. Beberapa profil anak dapat bertanding bergiliran melalui berbagai jenis tantangan.

**Filosofi:**
- Kompetisi sehat, bukan saling menjatuhkan
- Semua anak tetap mendapat apresiasi
- Penghargaan tambahan untuk berbagai aspek (bukan hanya pemenang)
- Pesan adab setelah battle: "Pemenang yang baik tetap rendah hati. Yang belum menang tetap semangat belajar."

**Target pengguna:**
- Kakak-adik di rumah
- Kelompok kecil anak
- Guru/orang tua dengan satu tablet
- Latihan kompetitif sehat

---

## 2. Flow Battle

```
1. Pilih Pemain (2-6 profil)
2. Pilih Mode Battle (Hitung/Pola/Adab/Campuran)
3. Pilih Jumlah Ronde (3/5/10)
4. Pilih Sistem Difficulty (Seimbang/Setara)
5. Shuffle Urutan Awal
6. Ronde dimulai → Giliran Pemain → Gameplay → Feedback → Next
7. Setelah semua pemain dalam ronde → Scoreboard Ronde
8. Ronde berikutnya (dengan rotasi urutan)
9. Final Result → Penghargaan → Pesan Adab
10. Simpan riwayat → Home
```

---

## 3. Mode Battle Tersedia

| Mode | Deskripsi | Mekanik |
|------|-----------|---------|
| **Hitung Kilat Battle** ⚡ | Adu cepat berhitung bergiliran | 1 soal, timer 5-10s, benar +poin |
| **Pola Kilat Battle** 🧩 | Temukan pola dengan cepat | 1 pola, timer 5-10s, pilih lanjutan |
| **Adab Bijak Battle** 💖 | Pilih sikap terbaik | 1 situasi, timer 8-12s, hikmah manual next |
| **Campuran Mastermind** 🎲 | Gabungan hitung, pola, adab | Rotasi tipe per ronde |

---

## 4. Sistem Urutan

**Ronde pertama:** Urutan pemain diacak random (Fisher-Yates shuffle).

**Ronde berikutnya:** Rotasi urutan — setiap pemain bergeser satu posisi. Jika ada ronde lebih banyak dari jumlah pemain, rotasi berulang.

**Contoh (4 pemain, 5 ronde):**
```
Ronde 1: A → B → C → D
Ronde 2: B → C → D → A
Ronde 3: C → D → A → B
Ronde 4: D → A → B → C
Ronde 5: A → B → C → D
```

**Tujuan:** Setiap pemain mendapat kesempatan menjadi awal, tengah, dan akhir.

---

## 5. Sistem Difficulty

| Mode | Deskripsi |
|------|-----------|
| **Seimbang** | Soal menyesuaikan difficulty profil masing-masing. Cocok untuk beda usia. Skor sudah dinormalisasi via difficulty bonus. |
| **Setara** | Semua pemain dapat soal level sama. Cocok untuk usia mirip. User memilih TK/SD/SMP/SMA. |

---

## 6. Sistem Scoring

**Per turn:**
```
finalScore = baseScore + speedBonus + difficultyBonus + adabBoost
```
- `baseScore` = 100 (jika benar)
- `speedBonus` = 0–50 (berdasarkan sisa waktu)
- `difficultyBonus` = 5–50 (berdasarkan difficulty pemain)
- `adabBoost` = 50 (jika adab best choice)
- Salah = 0

---

## 7. Data Model

### BattleSession
- `id`, `battleMode`, `players[]`, `roundCount`
- `difficultyMode`, `setDifficulty?`
- `initialOrder`, `roundOrders[][]`
- `rounds[]` (BattleRound dengan turns[])
- `scores{}`, `awards[]`, `winnerProfileId`
- `status`, `startedAt`, `finishedAt`

### BattleTurn
- `roundNumber`, `profileId`, `gameType`
- `questionData`, `shuffledChoices`
- `selectedAnswer`, `correctAnswer`, `isCorrect`
- `responseTimeMs`, `baseScore`, `speedBonus`, `difficultyBonus`, `finalScore`
- `feedback`

### BattleHistoryEntry
- `sessionId`, `battleMode`, `players[]`
- `winner`, `finalScores{}`, `awards[]`
- `playedAt`

Semua data tersimpan offline di localStorage.

---

## 8. Penghargaan Tambahan

| Penghargaan | Kriteria |
|-------------|----------|
| 🏆 Pemenang | Skor total tertinggi |
| ⚡ Paling Cepat | Rata-rata waktu tercepat (jawaban benar) |
| 🎯 Paling Teliti | Akurasi jawaban tertinggi |
| 💖 Paling Bijak | Terbanyak memilih sikap adab terbaik |
| 🌟 Paling Semangat | Partisipasi — semua pemain dapat |

---

## 9. Integrasi

### Home Screen
- Card "⚔️ Mastermind Duel" dengan subtitle "Battle Bergiliran dalam 1 device"
- Letak di bawah Mini Game Cepat

### Stats Screen
- Jumlah battle dimainkan
- Jumlah menang
- Skor battle tertinggi
- Penghargaan yang diperoleh

### Parent Dashboard
- Riwayat battle anak
- Statistik menang/main
- Penghargaan
- Insight: "X memenangkan Y dari Z duel"

---

## 10. Android Back Behavior

| Fase | Back Action |
|------|------------|
| Setup → Pilih Pemain | Ke Home |
| Setup → Mode/Ronde/Difficulty | Step mundur |
| Shuffle / Turn Intro | Ke Home (dengan konfirmasi jika sedang battle) |
| Gameplay | Tidak bisa langsung back — harus melalui turn intro |
| Feedback | Kembali ke turn intro (manual next button) |
| Scoreboard | Ke Home (konfirmasi jika battle belum selesai) |
| Result | Ke Home |

---

## 11. Randomisasi Jawaban

Semua pilihan di battle menggunakan **Fisher-Yates shuffle**:
- Hitung Kilat: pilihan angka diacak
- Pola Kilat: pilihan emoji diacak
- Adab Bijak: pilihan teks diacak dengan indeks tracking

Validator selalu berdasarkan `value`/`idx`, bukan posisi.

---

## 12. Files Created/Modified

| File | Change |
|------|--------|
| `src/types/index.ts` | Added battle types (BattleSession, BattleTurn, BattleRound, BattleAward, BattleHistoryEntry, etc.) |
| `src/lib/battle.ts` | **NEW** — Battle utilities (shuffle, rotate, question generators, scoring, awards) |
| `src/screens/BattleScreen.tsx` | **NEW** — Main battle orchestrator (all phases in one screen) |
| `src/lib/storage/service.ts` | Added `saveBattleHistory()`, `getBattleHistory()`, `battleHistory` to default state |
| `src/lib/storage.ts` | Added `saveBattleHistory`, `getBattleHistory` to useGameStore |
| `src/GameAppStandalone.tsx` | Added BattleScreen import, route for "battle" screen, back button case |
| `src/routes/index.tsx` | Added BattleScreen import, route for SSR version |
| `src/screens/HomeScreen.tsx` | Added "Mastermind Duel" card |
| `src/screens/StatsScreen.tsx` | Added battle stats section |
| `src/screens/ParentScreen.tsx` | Added battle history section with insights |

---

## 13. QA Checklist

### Setup
- [x] Bisa pilih 2-6 pemain
- [x] Tidak bisa lanjut dengan 1 pemain (tombol disabled)
- [x] Profil yang dipilih tampil dengan avatar, nama, level
- [x] Bisa pilih mode battle
- [x] Bisa pilih jumlah ronde
- [x] Bisa pilih difficulty mode

### Urutan
- [x] Ronde pertama random
- [x] Ronde berikutnya rotasi
- [x] Urutan tidak random ulang tiap ronde

### Gameplay
- [x] Layar giliran pemain muncul dengan nama, avatar, skor
- [x] Harus klik "Saya Siap" sebelum soal
- [x] Hitung Kilat Battle berjalan (1 soal, timer, pilihan)
- [x] Pola Kilat Battle berjalan
- [x] Adab Bijak Battle berjalan dengan hikmah manual next
- [x] Timer berjalan per soal
- [x] Jawaban benar/salah terdeteksi
- [x] Skor dihitung
- [x] Scoreboard ronde tampil

### Final
- [x] Final result tampil dengan ranking
- [x] Pemenang di-highlight
- [x] Penghargaan tambahan tampil
- [x] Pesan adab tampil
- [x] Riwayat battle tersimpan

### Back
- [x] Back di setup mundur step
- [x] Back di gameplay tidak langsung keluar
- [x] Back di result ke Home

### Responsive
- [x] HP kecil rapi
- [x] Tablet rapi
- [x] Tidak ada horizontal overflow
- [x] Semua halaman bisa scroll

### Offline
- [x] Battle berjalan offline
- [x] History tersimpan offline

---

## 14. Rekomendasi Pengembangan Berikutnya

1. **Animasi transisi** antar fase battle
2. **Sound effects** khusus battle (hitungan mundur, applause)
3. **Team Battle** — 2v2 atau 3v3
4. **Ingatan Cepat Battle** — tambahkan ke mode Campuran
5. **Battle streak** — tracking rivalitas antar profil
6. **Leaderboard battle** — top 5 battles
7. **Replay battle** — lihat ulang riwayat battle step by step

---

## 15. Known Issues

None — semua fitur battle berfungsi sesuai spesifikasi.
