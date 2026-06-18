/**
 * Placeholder screens for new mini-games that are defined but
 * whose gameplay renderers haven't been built yet.
 *
 * These show a friendly "coming soon" interface, NOT broken empty screens.
 */

import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import type { Profile } from "@/types";
import type React from "react";

interface PlaceholderProps {
  profile: Profile;
  onBack: () => void;
  backRef?: React.MutableRefObject<(() => boolean) | null>;
  title: string;
  icon: string;
  description: string;
}

export function MiniGamePlaceholderScreen({ profile, onBack, backRef, title, icon, description }: PlaceholderProps) {
  // Register back handler
  if (backRef) {
    backRef.current ??= () => { onBack(); return true; };
  }

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4 overscroll-contain">
      <div className="max-w-sm w-full text-center">
        <GameCard tone="cream" className="p-8 border-4 border-[#CBB794]">
          <div className="text-7xl mb-4">{icon}</div>
          <h1 className="font-display font-black text-2xl text-[#5A3515] mb-2">{title}</h1>
          <p className="text-sm font-bold text-[#8C6B45] mb-2">{description}</p>

          <div className="rounded-2xl bg-gradient-sun/20 border-2 border-[#D48806]/30 p-4 mb-6">
            <div className="text-3xl mb-2">🔧</div>
            <p className="text-xs font-bold text-[#8C6B45]">
              Mini-game ini sedang dalam pengembangan. Akan hadir di update berikutnya!
            </p>
          </div>

          <p className="text-[10px] font-bold text-[#8C6B45]/50 mb-6">
            Level: {profile.difficulty.toUpperCase()} · Nama: {profile.name}
          </p>

          <GameButton variant="primary" size="md" full onClick={onBack}>
            ← Kembali
          </GameButton>
        </GameCard>
      </div>
    </div>
  );
}

// ─── Pre-built screen components for each placeholder game ───

export function CariBerbedaScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Cari yang Berbeda" icon="🔍" description="Temukan objek yang berbeda dari kumpulan yang mirip." />;
}

export function PilihSikapScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Pilih Sikap Terbaik" icon="🌟" description="Pilih sikap terbaik dari situasi sehari-hari." />;
}

export function NasihatScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Nasihat dengan Lembut" icon="💬" description="Pilih kata-kata terbaik untuk menasihati teman." />;
}

export function UrutkanAdabScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Urutkan Adab" icon="📋" description="Susun langkah-langkah adab dalam urutan yang benar." />;
}

export function DilemaBijakScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Dilema Bijak" icon="⚖️" description="Hadapi dilema moral dan pilih keputusan paling bijaksana." />;
}

export function DetektifScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Detektif Petunjuk" icon="🕵️" description="Gunakan petunjuk untuk memecahkan misteri." />;
}

export function TebakAturanScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Tebak Aturan" icon="📐" description="Temukan aturan tersembunyi dari contoh yang diberikan." />;
}

export function PilihKesimpulanScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Pilih Kesimpulan" icon="💡" description="Baca fakta, pilih kesimpulan paling tepat." />;
}

export function BenarSalahScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Benar atau Salah" icon="✅" description="Tentukan apakah pernyataan benar atau salah." />;
}

export function UbahPosisiScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Ubah Posisi" icon="🔄" description="Ikuti instruksi gerakan di grid 10×10." />;
}

export function CocokBayanganScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Cocokkan Bayangan" icon="👤" description="Temukan bayangan yang cocok dengan bentuk objek." />;
}

export function JalurTercepatScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Jalur Tercepat" icon="🐒" description="Cari jalur tercepat menuju pisang!" />;
}

export function SusunPuzzleScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Susun Puzzle" icon="🧩" description="Susun potongan gambar menjadi satu kesatuan." />;
}

export function MisiKeluargaScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Misi Keluarga" icon="🏡" description="Misi kebaikan dari orang tua untuk dikerjakan bersama." />;
}

export function JurnalKebaikanScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <MiniGamePlaceholderScreen {...props} title="Jurnal Kebaikan" icon="📓" description="Tulis kebaikan yang kamu lakukan hari ini." />;
}
