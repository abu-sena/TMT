interface Props {
  onViewBadges: () => void;
  onBackToMap: () => void;
  onClose: () => void;
}

export function MasteryCompleteModal({
  onViewBadges,
  onBackToMap,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#1a0533] via-[#2d1b4e] to-[#1a0533] rounded-[2rem] p-6 text-center shadow-2xl max-w-sm w-full border-4 border-[#FFD700] animate-pop-in">
        {/* Cosmic background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-lg opacity-60"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${5 + Math.random() * 90}%`,
                animation: `twinkle ${2 + Math.random() * 3}s infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              ⭐
            </span>
          ))}
        </div>

        <div className="relative z-10">
          {/* Mastery crown */}
          <div className="text-8xl mb-4 animate-float drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">
            👑
          </div>

          <h2 className="font-display font-black text-3xl text-[#FFD700] leading-tight mb-2 drop-shadow-lg">
            Mastery Complete!
          </h2>

          <p className="text-base font-bold text-[#E0C0FF] mb-3 leading-relaxed">
            MasyaAllah! Kamu telah menyelesaikan seluruh perjalanan{" "}
            <span className="text-[#FFD700] font-black">The Mastermind Trials</span>{" "}
            sampai level Universitas!
          </p>

          <div className="bg-white/10 rounded-2xl p-4 mb-4 border border-white/20">
            <h3 className="font-black text-lg text-[#FFD700] mb-3">🏆 Penghargaan Final</h3>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-white">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="text-xs opacity-70">EXP Besar</div>
                  <div className="font-black text-lg">+5.000</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="text-2xl">🪙</span>
                <div>
                  <div className="text-xs opacity-70">Koin</div>
                  <div className="font-black text-lg">+2.500</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="text-2xl">💎</span>
                <div>
                  <div className="text-xs opacity-70">Permata</div>
                  <div className="font-black text-lg">+30</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#FFD700]">
                <span className="text-2xl">🏅</span>
                <div>
                  <div className="text-xs opacity-70">Lencana</div>
                  <div className="font-black text-base">Universitas Complete + The True Mastermind</div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#C0A0E0] mb-4 italic">
            "Ilmu tanpa batas, adab tanpa akhir. Kamu adalah The True Mastermind!"
          </p>

          <div className="space-y-2">
            <button
              onClick={onViewBadges}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] border-b-4 border-[#D48806] text-[#5A3515] font-black text-lg shadow-sm active:translate-y-1 active:border-b-0 transition-all"
            >
              🏅 Lihat Lencana
            </button>
            <button
              onClick={onBackToMap}
              className="w-full py-3 rounded-2xl bg-white/15 border-2 border-white/30 text-white font-black text-base shadow-sm active:translate-y-1 transition-all"
            >
              🗺️ Kembali ke Peta
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-3 text-xs font-bold text-[#C0A0E0] hover:text-white underline"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
