import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { GameScreen } from "@/components/layout/GameScreen";
import { FixedBottomActionArea } from "@/components/layout/FixedBottomActionArea";

interface Props {
  onStart: () => void;
}

export function OnboardingScreen({ onStart }: Props) {
  return (
    <GameScreen className="relative" bgClass="bg-gradient-sky">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-30 animate-float">☁️</div>
      <div className="absolute top-32 right-10 text-8xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>☁️</div>
      <div className="absolute bottom-40 left-1/4 text-4xl opacity-30 animate-float" style={{ animationDelay: '2s' }}>☁️</div>
      
      <div className="flex-1 min-h-0 px-5 pt-12 pb-4 flex flex-col items-center justify-center relative z-10 overflow-y-auto overscroll-contain">
        <div className="text-8xl animate-bob mb-2 drop-shadow-lg">🗺️</div>
        
        <h1 className="mt-4 font-display font-black text-4xl sm:text-5xl text-game-title text-center leading-tight">
          🧠 TMT
        </h1>
        <p className="mt-1 text-center text-[#5A3515] font-extrabold text-lg sm:text-xl px-4 py-1 bg-white/40 rounded-full backdrop-blur-sm border-2 border-white/50 shadow-sm">
          Petualangan Ilmu & Akhlak
        </p>

        <GameCard tone="cream" className="mt-8 w-full max-w-sm sm:max-w-md space-y-4 shadow-card border-4">
          <p className="text-center font-bold text-[#5A3515] leading-relaxed">
            Pulihkan Kota Ilmu sambil mengasah ilmu dan akhlak. Tuntaskan misi untuk meraih bintang dan menjelajahi wilayah baru!
          </p>

          <ol className="space-y-3 bg-[#E8DCC2]/30 p-4 rounded-2xl border-2 border-[#D4B483]/30">
            {[
              ["1", "Buat profil petualang"],
              ["2", "Pilih misi pertama di peta"],
              ["3", "Selesaikan misi dan raih bintang"],
            ].map(([step, label]) => (
              <li key={step} className="flex items-center gap-3 text-sm font-extrabold text-[#5A3515]">
                <span className="h-8 w-8 rounded-full bg-white border-2 border-[#D4B483] grid place-items-center shrink-0">{step}</span>
                {label}
              </li>
            ))}
          </ol>

          <p className="text-center text-xs font-semibold text-[#8C6B45]">
            Bisa dimainkan offline. Progres hanya tersimpan di perangkat ini.
          </p>
        </GameCard>
      </div>

      <FixedBottomActionArea>
        <GameButton variant="primary" size="xl" onClick={onStart} full leadingIcon="🚀" className="shadow-pop">
          Mulai Petualangan
        </GameButton>
      </FixedBottomActionArea>
    </GameScreen>
  );
}
