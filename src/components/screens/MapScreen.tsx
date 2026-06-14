import { useMemo } from "react";
import type { Mission, Profile } from "@/game/types";
import { DIFFICULTY_MAP } from "@/game/constants";
import { missionsForDifficulty } from "@/game/logic";
import { MissionNode } from "../game/MissionNode";
import { GameButton } from "../game/GameButton";

interface Props {
  profile: Profile;
  onBack: () => void;
  onOpenMission: (m: Mission) => void;
}

export function MapScreen({ profile, onBack, onOpenMission }: Props) {
  const missions = useMemo(() => missionsForDifficulty(profile.difficulty), [profile.difficulty]);
  const diff = DIFFICULTY_MAP[profile.difficulty];

  // unlock first if no progress, else unlock the one after the highest completed number
  const completedNumbers = new Set(
    missions.filter((m) => (profile.missionProgress[m.id]?.stars ?? 0) > 0).map((m) => m.number),
  );
  const highest = completedNumbers.size > 0 ? Math.max(...Array.from(completedNumbers)) : 0;

  return (
    <div className="min-h-[100dvh] bg-gradient-sky pb-10 relative overflow-hidden">
      {/* decorative scenery */}
      <div className="absolute top-6 left-4 text-4xl opacity-40">☁️</div>
      <div className="absolute top-12 right-6 text-3xl opacity-40">☁️</div>

      <header className="px-4 pt-6 pb-3 flex items-center gap-3 relative z-10">
        <button onClick={onBack} className="h-12 w-12 rounded-2xl bg-black/30 border border-white/15 text-white grid place-items-center text-xl shadow-pop-sm shrink-0" aria-label="Kembali">
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-2xl text-game-title uppercase truncate">
            Peta Petualangan
          </h1>
          <p className="text-white/80 text-sm font-bold">{diff.emoji} {diff.label} — {missions.length} misi</p>
        </div>
      </header>

      <div className="relative max-w-md mx-auto px-6 pt-4">
        {/* dashed path background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 300 800">
          <path
            d="M 60 50 Q 240 120 60 220 Q 240 320 60 420 Q 240 520 60 620 Q 240 720 150 780"
            fill="none"
            stroke="oklch(0.95 0.05 95)"
            strokeWidth="6"
            strokeDasharray="2 14"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>

        <div className="relative space-y-6">
          {missions.map((m, i) => {
            const prog = profile.missionProgress[m.id];
            const state: "locked" | "available" | "completed" =
              (prog?.stars ?? 0) > 0 ? "completed" : m.number <= highest + 1 ? "available" : "locked";
            // alternate left / center / right
            const side = i % 3 === 0 ? "justify-start" : i % 3 === 1 ? "justify-center" : "justify-end";
            return (
              <div key={m.id} className={`flex ${side}`}>
                <div className="flex flex-col items-center gap-1">
                  <MissionNode
                    number={m.number}
                    state={state}
                    stars={prog?.stars ?? 0}
                    isBoss={m.isBoss}
                    onClick={() => state !== "locked" && onOpenMission(m)}
                  />
                  <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    state === "locked" ? "bg-stone-200 text-stone-500" : "bg-white/95 text-[color:var(--wood-dark)]"
                  } shadow-pop-sm max-w-[120px] text-center truncate`}>
                    {state === "locked" ? "Terkunci" : m.title}
                  </div>
                </div>
              </div>
            );
          })}

          {/* bonus chest */}
          <div className="flex justify-center pt-2">
            <button className="relative h-20 w-20 rounded-3xl bg-gradient-sun border-4 border-[color:var(--wood)] grid place-items-center shadow-pop active:translate-y-[2px] animate-bob">
              <div className="text-3xl">🎁</div>
              <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-[color:var(--berry)] text-white text-[10px] font-bold border-2 border-white">BONUS</div>
            </button>
          </div>
          <div className="flex justify-center">
            <button className="relative h-20 w-20 rounded-3xl bg-gradient-coin border-4 border-[color:var(--wood)] grid place-items-center shadow-pop active:translate-y-[2px]">
              <div className="text-3xl">📅</div>
              <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-[color:var(--leaf-dark)] text-white text-[10px] font-bold border-2 border-white">HARIAN</div>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 max-w-md mx-auto">
        <GameButton variant="ghost" size="md" full onClick={onBack}>
          🏠 Kembali ke Beranda
        </GameButton>
      </div>
    </div>
  );
}
