# TMT — Story Adventure Map Report

> **Tanggal:** 20 Juni 2026  
> **Fitur:** Story Adventure Map — Petualangan bercerita di Peta  
> **Status:** ✅ Implemented, Validated, APK Built

---

## 1. Konsep Story Adventure Map

Peta Petualangan kini memiliki **unsur cerita**. Setiap stage adalah bagian dari petualangan seorang **Calon Mastermind Muda** yang sedang memulihkan **Negeri Cahaya Ilmu**.

### Peran User
- User adalah **tokoh utama** dalam cerita
- Setiap stage menggunakan bahasa aktif: "Bantulah...", "Kamu melihat...", "Pilih sikap terbaikmu..."
- Tidak ada "Jawablah soal berikut" atau "Kerjakan pertanyaan ini"

### Tema Dunia
Nama dunia: **Negeri Cahaya Ilmu**

Gaya cerita per difficulty:
| Difficulty | User Title |
|---|---|
| TK | Penjelajah Kecil |
| SD Bawah | Sahabat Ceria |
| SD Atas | Penjaga Amanah |
| SMP | Pemecah Masalah |
| SMA | Calon Pemimpin |
| Universitas | Calon Mastermind |

---

## 2. Struktur Cerita per Stage

Setiap stage memiliki:

1. **Story Title** — Judul cerita (termasuk prefiks 👑 untuk boss, 🏆 untuk final)
2. **Intro Text** — 1-2 kalimat pembuka cerita
3. **User Role Text** — Konteks peran user sebagai pelaku
4. **Challenge Context** — Alasan menantang dalam cerita
5. **Success Text** — Feedback cerita saat berhasil
6. **Failure Text** — Feedback lembut saat belum tepat
7. **World Impact Text** — Dampak ke dunia setelah berhasil
8. **Companion** — Karakter pendamping sesuai jenis tantangan
9. **Companion Hint** — Petunjuk dari karakter pendamping

---

## 3. Karakter Pendamping

| Karakter | Peran | Avatar | Muncul pada |
|---|---|---|---|
| **Nara** | Pemandu Adab | 🌸 | Pilih Sikap, Nasihat Lembut, Urutkan Adab, Dilema Bijak |
| **Qiro** | Pemandu Logika | 🔍 | Detektif Petunjuk, Tebak Aturan, Kesimpulan, Benar/Salah, Kode Warna |
| **Luma** | Pemandu Spasial | 👁️ | Cocokkan Bayangan, Ubah Posisi, Jalur Tercepat, Cari Berbeda |
| **Aman** | Pemandu Kepemimpinan | 🛡️ | Systems Thinking, Boss Mission, Dilema Bijak, Argument Evaluation |

Setiap companion muncul sebagai bubble kecil dengan:
- Avatar dan nama
- Peran
- Hint spesifik sesuai tantangan
- Warna tema yang konsisten

---

## 4. Story Preview Modal (Mission Popup)

Saat user tap node di peta:

```
┌─────────────────────────────┐
│ 📖 Cerita                    │
│ "Di sudut ruangan, kamu      │
│  menemukan pintu..."         │
│                              │
│ 🎯 Challenge Context         │
│ "Pilih bayangan yang cocok"  │
│                              │
│ 🌸 Nara — Pemandu Adab      │
│ "Perhatikan bentuknya!"      │
│                              │
│ [Kembali]  [Mulai Misi ▶]   │
└─────────────────────────────┘
```

---

## 5. Story Feedback di Result Screen

Setelah stage selesai:

**Jika berhasil:**
- 💬 Cerita — success text
- 🌍 Dampak Dunia — world impact text
- ⭐ Penjelasan — tetap ada

**Jika belum tepat:**
- 💪 Jangan Menyerah! — failure text (lembut, tidak menghakimi)
- Penjelasan jawaban benar

---

## 6. World Impact pada Node Selesai

Node yang sudah diselesaikan di peta:
- Glow ring emas (`shadow-[0_0_12px_rgba(255,215,0,0.3)]`)
- Sparkle ✨ di pojok kanan atas
- Overlay gradient emas transparan

Efek ini menunjukkan bahwa dunia di sekitar node tersebut telah "pulih" — konsisten dengan narasi "memulihkan Negeri Cahaya Ilmu".

---

## 7. Stage 500 — Gerbang Kenaikan

Stage 500 di setiap difficulty memiliki cerita khusus:

- Judul: 🏆 Gerbang Kenaikan — [Difficulty]
- Success text: "Kamu berhasil melewati Gerbang Kenaikan! Seluruh [User Title] di Negeri Cahaya Ilmu merayakan keberhasilanmu."
- World impact: "Cahaya keemasan menyelimuti seluruh Negeri Cahaya Ilmu."

Untuk Universitas stage 500: cerita Mastery Complete.

---

## 8. Template Cerita per Challenge Type

16 template challenge types dengan variasi deterministik:
- match-shadow, change-position, fastest-path, color-code
- moral-choice, gentle-advice
- detective-clues, pick-conclusion, true-or-false
- boss (boss missions)

Setiap template punya 4 varian intro, challenge, success, failure, dan world impact. Pemilihan varian menggunakan seeded RNG dari stage number agar konsisten.

---

## 9. Stage Tetap Campur Kategori

Story Adventure Map **tidak** mengubah struktur stage:

- Stage tetap campuran kategori
- Tidak ada segment bernama "Dunia Adab", "Dunia Logika", "Dunia Spasial"
- Background map tetap hanya dekorasi area cerita, bukan kategori soal
- Setiap segment berisi campuran challenge type

---

## 10. File yang Dibuat/Diubah

### Created (4):
- `src/data/adventure-story.ts` — Companion characters, story types, world improvements
- `src/lib/story-generator.ts` — Full story generator with templates per challenge type
- `scripts/validate-adventure-story.ts` — Validation script (223 assertions, 16 tests)
- `docs/TMT_STORY_ADVENTURE_MAP_REPORT.md` — This report

### Modified (6):
- `src/types/index.ts` — Added story fields to Stage/Mission interface
- `src/data/stage-generator.ts` — Inline story generation in `stageToMission` + `generateInlineStory`
- `src/components/missions/MissionPopup.tsx` — Rewritten as Story Preview Modal with companion
- `src/screens/ResultScreen.tsx` — Added story feedback & world impact sections
- `src/screens/MapScreen.tsx` — Completed node glow/sparkle effects
- `android/app/build.gradle` — Version bump 5→6, 1.0.5→1.0.6

---

## 11. Validasi (223/223 passed)

Semua tes lulus:
- Story fields tidak kosong
- Companion ID valid
- Tidak ada Lorem ipsum / TODO
- Tidak ada "Dunia Adab"/"Dunia Logika"
- Stage 500 punya cerita Gerbang Kenaikan
- Universitas 500 punya cerita Mastery Complete
- Bahasa aktif (user sebagai protagonis)
- TK failure gentle

---

## 12. Build APK

- **Version:** 1.0.6 (versionCode 6)
- **App Label:** TMT
- **APK Location:** `release/EduGame.apk` (6.37 MB)
- **Build:** Debug APK, siap install
- **Offline-first:** ✅
- **Google Connect:** Optional
- **Device support:** HP Android + Huawei MatePad 11

---

**Laporan selesai.** 🎓
