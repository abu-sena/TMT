import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";

interface Props {
  onStart: () => void;
}

export function OnboardingScreen({ onStart }: Props) {
  return (
    <div className="min-h-[100dvh] bg-gradient-sky flex flex-col">
      <div className="flex-1 px-5 pt-8 pb-4 flex flex-col items-center justify-center">
        <div className="text-7xl animate-bob">🗺️</div>
        <h1 className="mt-4 font-display font-black text-3xl text-[color:var(--wood-dark)] text-center">
          Selamat Datang, Penjelajah!
        </h1>
        <p className="mt-2 text-center text-[color:var(--wood-dark)]/80 max-w-sm">
          Restorasi <b>Kota Ilmu &amp; Adab</b> menantimu. Selesaikan misi seru untuk
          mendapatkan bintang, lencana, dan poin.
        </p>

        <div className="mt-6 w-full max-w-sm space-y-3">
          <GameCard tone="cream" className="flex items-start gap-3">
            <div className="text-3xl">📶</div>
            <div>
              <div className="font-display font-bold">Bisa Dimainkan Offline</div>
              <div className="text-sm text-muted-foreground">
                Semua misi tersimpan di perangkatmu — tanpa internet pun jalan!
              </div>
            </div>
          </GameCard>
          <GameCard tone="cream" className="flex items-start gap-3">
            <div className="text-3xl">☁️</div>
            <div>
              <div className="font-display font-bold">Sinkron dengan Google (Opsional)</div>
              <div className="text-sm text-muted-foreground">
                Cadangkan progresmu dan lanjutkan di perangkat lain kapan saja.
              </div>
            </div>
          </GameCard>
        </div>
      </div>

      <div className="px-5 pb-6 pt-3 space-y-2 bg-gradient-meadow/0">
        <GameButton variant="primary" size="xl" onClick={onStart} full leadingIcon="🚀">
          Mulai Bermain
        </GameButton>
        <GameButton variant="ghost" size="md" onClick={onStart} full>
          Hubungkan Google Nanti
        </GameButton>
      </div>
    </div>
  );
}
