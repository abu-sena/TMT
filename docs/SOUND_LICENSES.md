# Sound Licenses — EduGame

## Status
Sound effect files belum tersedia secara fisik. Game menggunakan **generated tones (Web Audio API)** sebagai fallback yang aman.

## Rencana Pengadaan Sound

### Sumber Prioritas (Royalty-Free/CC0)
1. **Pixabay Sound Effects** — https://pixabay.com/sound-effects/
   - Lisensi: Pixabay Content License (gratis, komersial, no attribution required)
   
2. **Freesound.org** — https://freesound.org/
   - Lisensi: CC0 / Creative Commons 0 (public domain)
   - Filter: "Creative Commons 0" only

3. **OpenGameArt** — https://opengameart.org/
   - Lisensi: CC0 / Public Domain
   - Kategori: Sound Effects

### Sound Files Needed

| # | Sound Name | Deskripsi | Durasi Rekomendasi |
|---|-----------|-----------|-------------------|
| 1 | button_click.mp3 | Klik tombol | <0.1s |
| 2 | back_click.mp3 | Tombol kembali | <0.1s |
| 3 | popup_open.mp3 | Popup dibuka | <0.3s |
| 4 | popup_close.mp3 | Popup ditutup | <0.2s |
| 5 | mission_start.mp3 | Misi dimulai | <0.5s |
| 6 | answer_correct.mp3 | Jawaban benar | <0.5s |
| 7 | answer_wrong.mp3 | Jawaban salah | <0.3s |
| 8 | star_earned.mp3 | Bintang didapat | <0.4s |
| 9 | points_count.mp3 | Poin bertambah | <0.2s |
| 10 | badge_unlock.mp3 | Badge terbuka | <1.0s |
| 11 | level_up.mp3 | Naik level | <1.0s |
| 12 | map_node_unlock.mp3 | Node peta terbuka | <0.3s |
| 13 | daily_reward.mp3 | Reward harian | <0.5s |
| 14 | soft_error.mp3 | Error ringan | <0.2s |
| 15 | success_complete.mp3 | Misi selesai | <1.0s |

### Format
- MP3 atau OGG
- Ukuran kecil (<50KB per file)
- Volume lembut, ramah anak
- Tidak mengagetkan

### Penempatan File
```
assets/sounds/
  ├── button_click.mp3
  ├── back_click.mp3
  ├── popup_open.mp3
  ├── popup_close.mp3
  ├── mission_start.mp3
  ├── answer_correct.mp3
  ├── answer_wrong.mp3
  ├── star_earned.mp3
  ├── points_count.mp3
  ├── badge_unlock.mp3
  ├── level_up.mp3
  ├── map_node_unlock.mp3
  ├── daily_reward.mp3
  ├── soft_error.mp3
  └── success_complete.mp3
```

### Fallback Saat Ini
Game menggunakan **Web Audio API generated tones** sebagai pengganti sementara:
- Jawaban benar: nada naik (C-E-G)
- Jawaban salah: nada rendah
- Level up: nada ascending (E-G-C)
- Badge unlock: nada segitiga (A-C#-E)
- Mission complete: nada fanfare (C-E-G-C')

Generated tones ini:
- ✅ Tidak memerlukan file tambahan
- ✅ Tidak ada masalah lisensi
- ✅ Bekerja offline
- ⚠️ Kurang kaya dibanding sound file asli

### Atribusi
Kosong — belum ada file eksternal yang digunakan.

### Checklist
- [ ] Download 15 sound effects dari Pixabay/Freesound/OpenGameArt
- [ ] Simpan di assets/sounds/ dengan nama yang sesuai
- [ ] Update file ini dengan URL sumber dan lisensi masing-masing
- [ ] Test semua sound di HP dan tablet
- [ ] Pastikan volume nyaman untuk anak
