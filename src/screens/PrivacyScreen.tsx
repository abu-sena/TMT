import { GameButton } from "@/components/ui/GameButton";

interface Props {
  onBack: () => void;
}

/**
 * Child-friendly privacy information screen.
 * Explains what data is stored, where, and the user's rights.
 */
export function PrivacyScreen({ onBack }: Props) {
  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col overflow-hidden">
      <header className="shrink-0 content-wrapper pt-5 pb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="h-12 w-12 rounded-2xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-xl shadow-sm shrink-0 active:scale-95 transition-transform"
          aria-label="Kembali"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] truncate">
            Privasi & Keamanan
          </h1>
          <p className="text-xs sm:text-sm text-[#5A3515]/80">
            Informasi tentang data kamu
          </p>
        </div>
        <div className="text-2xl sm:text-3xl shrink-0">🔒</div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain content-wrapper space-y-3">
        {/* Section 1: Data stored */}
        <div className="surface-panel p-4 space-y-2">
          <h3 className="font-display font-black text-sm text-[#5A3515] flex items-center gap-1.5">
            <span>📦</span> Data yang Disimpan
          </h3>
          <p className="text-sm text-[#8C6B45] leading-relaxed">
            TMT menyimpan data berikut <strong>hanya di perangkatmu</strong>:
          </p>
          <ul className="text-sm text-[#5A3515] space-y-1.5 list-disc list-inside marker:text-[#2E8B12]">
            <li>Nama panggilan &amp; avatar yang kamu pilih</li>
            <li>Progres misi (bintang, poin, jawaban)</li>
            <li>Level &amp; XP</li>
            <li>Lencana yang sudah dikumpulkan</li>
            <li>Pengaturan suara &amp; musik</li>
          </ul>
        </div>

        {/* Section 2: What we DON'T collect */}
        <div className="surface-panel p-4 space-y-2">
          <h3 className="font-display font-black text-sm text-[#5A3515] flex items-center gap-1.5">
            <span>🛡️</span> Yang TIDAK Kami Kumpulkan
          </h3>
          <ul className="text-sm text-[#5A3515] space-y-1.5 list-disc list-inside marker:text-[#2E8B12]">
            <li>Nama asli atau identitas pribadi</li>
            <li>Lokasi atau alamat</li>
            <li>Foto atau gambar pribadi</li>
            <li>Data penggunaan aplikasi</li>
            <li>Informasi kontak</li>
          </ul>
        </div>

        {/* Section 3: Where data lives */}
        <div className="surface-panel p-4 space-y-2">
          <h3 className="font-display font-black text-sm text-[#5A3515] flex items-center gap-1.5">
            <span>🏠</span> Tempat Penyimpanan
          </h3>
          <p className="text-sm text-[#8C6B45] leading-relaxed">
            Semua data disimpan di <strong>penyimpanan lokal perangkatmu</strong> (localStorage).
            Tidak ada data yang dikirim ke server atau internet.
          </p>
          <div className="rounded-2xl bg-[#E8DCC2]/60 border border-[#CBB794] p-3 text-center">
            <span className="text-sm font-bold text-[#5A3515]">
              📶 Aplikasi ini bekerja sepenuhnya OFFLINE
            </span>
          </div>
        </div>

        {/* Section 4: Google sync */}
        <div className="surface-panel p-4 space-y-2">
          <h3 className="font-display font-black text-sm text-[#5A3515] flex items-center gap-1.5">
            <span>☁️</span> Sinkronisasi Google (Opsional)
          </h3>
          <p className="text-sm text-[#8C6B45] leading-relaxed">
            Kamu <strong>bisa memilih</strong> untuk mencadangkan progres ke Google Drive.
            Ini sepenuhnya opsional. Tanpa Google pun, semua misi tetap jalan.
          </p>
          <p className="text-sm text-[#8C6B45] leading-relaxed">
            Data hanya disimpan di Google Drive <strong>milikmu sendiri</strong>.
            Kami tidak punya akses ke data tersebut.
          </p>
        </div>

        {/* Section 5: Delete data */}
        <div className="surface-panel p-4 space-y-2">
          <h3 className="font-display font-black text-sm text-[#5A3515] flex items-center gap-1.5">
            <span>🗑️</span> Hapus Data
          </h3>
          <p className="text-sm text-[#8C6B45] leading-relaxed">
            Kamu bisa menghapus data kapan saja dari menu{" "}
            <strong>Pengaturan → Reset Progres</strong>.
          </p>
          <p className="text-sm text-[#8C6B45] leading-relaxed">
            Jika terhubung ke Google, data di cloud juga bisa dihapus
            dengan memutuskan koneksi Google di Pengaturan.
          </p>
        </div>

        {/* Section 6: Contact */}
        <div className="surface-panel p-4 space-y-2">
          <h3 className="font-display font-black text-sm text-[#5A3515] flex items-center gap-1.5">
            <span>📧</span> Pertanyaan?
          </h3>
          <p className="text-sm text-[#8C6B45] leading-relaxed">
            Jika ada pertanyaan tentang privasi dan keamanan data,
            orang tua bisa menghubungi kami melalui email:
          </p>
          <div className="rounded-2xl bg-[#E8DCC2]/60 border border-[#CBB794] p-3 text-center">
            <span className="text-sm font-bold text-[#5A3515]">
              📩 support@tmt.id
            </span>
          </div>
        </div>

        {/* Version */}
        <div className="pt-2 pb-2 text-center text-xs text-[#5A3515]/70">
          TMT · Kebijakan Privasi v1.0
        </div>
      </main>

      <div className="shrink-0 content-wrapper pb-safe pt-2">
        <GameButton variant="ghost" size="md" full onClick={onBack}>
          ⚙️ Kembali ke Pengaturan
        </GameButton>
      </div>
    </div>
  );
}
