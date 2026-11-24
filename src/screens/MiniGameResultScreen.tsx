/**
 * MiniGame Result Screen — reusable for all mini-games
 *
 * Shows: name, score, correct/wrong, accuracy, avg time, best score,
 * leaderboard status, XP, action buttons.
 */
import type { Profile, MiniGameSession } from "@/types";
import { DIFFICULTY_MAP } from "@/data/constants";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { MiniGameIcon } from "@/components/minigames/MiniGameArt";
import { CelebrationArt } from "@/components/rewards/GameCelebrationDialog";

interface Props {
  profile: Profile;
  session: MiniGameSession;
  gameTitle: string;
  gameIcon: string;
  isNewBest: boolean;
  leaderboardRank: number | null;
  attempts?: { correctCount: number; wrongCount: number; totalQuestions: number } | null;
  onPlayAgain: () => void;
  onLeaderboard: () => void;
  onBack: () => void;
}

export function MiniGameResultScreen({
  profile,
  session,
  gameTitle,
  gameIcon,
  isNewBest,
  leaderboardRank,
  attempts,
  onPlayAgain,
  onLeaderboard,
  onBack,
}: Props) {
  const diff = DIFFICULTY_MAP[session.difficulty] || DIFFICULTY_MAP["sd-bawah"];
  const accuracy = attempts && attempts.totalQuestions > 0
    ? Math.round((attempts.correctCount / attempts.totalQuestions) * 100)
    : session.correctCount > 0
      ? 100
      : 0;
  const avgTime = session.averageAnswerTime > 0
    ? session.averageAnswerTime.toFixed(1)
    : "—";

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-sm">
        {/* Result Card */}
        <GameCard tone="cream" className="tmt-dialog-surface text-center p-6 sm:p-8 border">
          {/* Icon */}
          <div className="text-5xl sm:text-6xl mb-3">
            {isNewBest ? <CelebrationArt kind="victory" /> : <MiniGameIcon gameId={session.gameType} fallback={gameIcon} className="size-16" />}
          </div>

          {/* Title */}
          <h1 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] mb-1">
            {isNewBest ? "Rekor Baru!" : "Permainan Selesai!"}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#8C6B45] mb-4">
            {gameTitle} · {diff.label}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <StatBox label="Skor" value={session.score} color="#D48806" />
            <StatBox label="Benar" value={session.correctCount} color="#2E8B12" />
            <StatBox label="Akurasi" value={`${accuracy}%`} color="#185E9F" />
            <StatBox label="Rata² Waktu" value={`${avgTime}s`} color="#5A3515" />
          </div>

          {/* Stage if applicable */}
          {session.maxStage > 1 && (
            <div className="mb-4 text-xs font-bold text-[#8C6B45]">
              Mencapai Stage {session.maxStage}
            </div>
          )}

          {/* Leaderboard rank */}
          {leaderboardRank !== null && leaderboardRank > 0 && (
            <div className="mb-4 p-2 rounded-2xl bg-gradient-coin/20 border-2 border-[#D48806]/30">
              <div className="text-xs font-bold text-[#8C6B45]">Peringkat Leaderboard</div>
              <div className="font-display font-black text-2xl text-[#D48806]">
                #{leaderboardRank}
              </div>
            </div>
          )}

          {/* New Best badge */}
          {isNewBest && (
            <div className="mb-4 p-2 rounded-2xl bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 animate-bob">
              <span className="text-sm font-black text-yellow-700">🎉 Rekor Baru! Skor Tertinggi!</span>
            </div>
          )}
        </GameCard>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <div className="flex gap-3">
            <GameButton variant="ghost" size="md" full onClick={onBack}>
              🏠 Kembali
            </GameButton>
            <GameButton variant="primary" size="md" full onClick={onPlayAgain}>
              🔄 Main Lagi
            </GameButton>
          </div>
          {onLeaderboard && (
            <button type="button"
              onClick={onLeaderboard}
              className="tmt-text-button w-full py-2 text-xs font-bold text-[#185E9F] underline hover:text-[#0D47A1]"
            >
              🏆 Lihat Leaderboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-3 text-center"
      style={{ backgroundColor: `${color}10`, border: `2px solid ${color}30` }}
    >
      <div
        className="font-display font-black text-xl sm:text-2xl"
        style={{ color }}
      >
        {typeof value === "number" ? value.toLocaleString("id") : value}
      </div>
      <div className="text-[10px] uppercase font-bold text-[#8C6B45] mt-0.5">
        {label}
      </div>
    </div>
  );
}
