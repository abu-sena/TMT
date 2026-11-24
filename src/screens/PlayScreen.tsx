import { X as TmtCloseGlyph } from "lucide-react";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import type { Mission, MissionOption } from "@/types";
import { CATEGORY_MAP, DIFFICULTY_MAP } from "@/data/constants";
import { MissionRendererRouter } from "../components/missions/renderers/MissionRendererRouter";
import { GameScreen } from "@/components/layout/GameScreen";
import { FixedBottomActionArea } from "@/components/layout/FixedBottomActionArea";
import { shuffleArray, createShuffledChoices } from "@/lib/utils";

interface BossStepResult {
  stepId: string;
  selectedId: string;
  isCorrect: boolean;
  attempts: number;
  hintsUsed: number;
}

interface Props {
  mission: Mission;
  onFinish: (result: { isCorrect: boolean; hintsUsed: number; attempts: number; selectedId: string; elapsedSeconds: number; isBestChoice: boolean; bossStepResults?: BossStepResult[] }) => void;
  onQuit: () => void;
}

export function PlayScreen({ mission, onFinish, onQuit }: Props) {
  const cat = CATEGORY_MAP[mission.category];
  const diff = DIFFICULTY_MAP[mission.difficulty];
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [showHint, setShowHint] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [startTime] = useState(() => Date.now());
  const bossResultsRef = useRef<BossStepResult[]>([]);
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishScheduledRef = useRef(false);
  const [isBossMission] = useState(() => (mission as any).missionType === "boss_mission");

  useEffect(() => () => {
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
  }, []);

  const scheduleFinish = useCallback((result: Parameters<typeof onFinish>[0], delay: number) => {
    if (finishScheduledRef.current) return;
    finishScheduledRef.current = true;
    finishTimerRef.current = setTimeout(() => {
      finishTimerRef.current = null;
      onFinish(result);
    }, delay);
  }, [onFinish]);

  // ── Shuffle choices ONCE when mission loads ──
  // This ensures choices are random but stable across re-renders
  const shuffledMission = useMemo(() => {
    if (!("options" in mission) || !(mission as any).options?.length) return mission;

    const originalOptions = (mission as any).options as MissionOption[];
    // Use Fisher-Yates shuffle for proper randomization
    const shuffled = createShuffledChoices(originalOptions);
    
    // Also shuffle boss step options
    let bossSteps = undefined;
    if ((mission as any).missionType === "boss_mission" && (mission as any).steps) {
      bossSteps = (mission as any).steps.map((step: any) => ({
        ...step,
        options: createShuffledChoices(step.options || []),
      }));
    }

    return { ...mission, options: shuffled, steps: bossSteps };
  }, [mission]);

  const handleBossComplete = useCallback((results: BossStepResult[]) => {
    bossResultsRef.current = results;
    const allCorrect = results.every(r => r.isCorrect);
    const totalHints = results.reduce((sum, r) => sum + r.hintsUsed, 0);
    const maxAttempts = results.reduce((max, r) => Math.max(max, r.attempts), 0);
    const lastSelectedId = results[results.length - 1]?.selectedId ?? "";
    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);

    scheduleFinish({
        isCorrect: allCorrect,
        hintsUsed: totalHints,
        attempts: maxAttempts,
        selectedId: lastSelectedId,
        elapsedSeconds,
        isBestChoice: allCorrect,
        bossStepResults: results,
      }, 1500);
  }, [onFinish, scheduleFinish, startTime]);

  const submit = () => {
    if (!selected) return;
    
    let isCorrect = false;
    if (selected === "WIN_SIMULATION") {
      isCorrect = true;
    } else if (selected === "LOSE_SIMULATION") {
      isCorrect = false;
    } else if ("options" in mission && (mission as any).options) {
      // For missions with options: check against correctAnswer, isBestChoice, or feedback
      const opt = (mission as any).options.find((o: any) => o.id === selected);
      if ("correctAnswer" in mission) {
        isCorrect = selected === (mission as any).correctAnswer;
      } else if (opt?.isBestChoice === true) {
        isCorrect = true;
      } else if (opt?.feedback) {
        // numeracy_story: correct option has feedback text
        isCorrect = true;
      } else if ("acceptableAnswers" in mission) {
        // Check if option label matches acceptable answers
        const acceptable = (mission as any).acceptableAnswers as string[];
        isCorrect = acceptable.some((a: string) => a.toLowerCase() === opt?.label?.toLowerCase());
      }
    } else if ("correctAnswer" in mission) {
      isCorrect = selected === (mission as any).correctAnswer;
    } else if ("acceptableAnswers" in mission) {
      const acceptable = (mission as any).acceptableAnswers as string[];
      isCorrect = acceptable.some((a: string) => a.toLowerCase() === selected.toLowerCase());
    }

    if (isCorrect || attempts >= 3) {
      const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
      let isBestChoice = isCorrect;
      if ("options" in mission && mission.options) {
        const opt = mission.options.find(o => o.id === selected);
        if (opt && opt.isBestChoice !== undefined) {
          isBestChoice = opt.isBestChoice;
        }
      }

      setRevealed(true);
      scheduleFinish({ isCorrect, hintsUsed, attempts, selectedId: selected, elapsedSeconds, isBestChoice }, 900);
    } else {
      setWrongIds((w) => [...w, selected]);
      setAttempts((a) => a + 1);
      setSelected(null);
    }
  };

  const isBoss = (mission as any).missionType === "boss_mission";

  return (
    <GameScreen bgClass={isBoss ? "bg-gradient-to-b from-[#1a1a2e] via-[#2d1f3d] to-[#1a1a2e]" : "bg-[#fbf8f0]"}>
      {!isBoss && (
        <header className="content-wrapper pt-safe mt-2 pb-2 flex items-center gap-3">
          <button type="button" onClick={onQuit} className="field-back" aria-label="Keluar dari misi">
            ✕
          </button>
          <div className="flex-1 min-w-0 text-[#173c3a]">
            <strong className="block text-sm">Misi {mission.number}</strong>
            <span className="block text-xs text-[#49625a]">{cat.short} · {diff.shortLabel}</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-[#f8e3da] text-[#633c33] text-xs font-black">
            Percobaan {attempts}/3
          </div>
        </header>
      )}

      {/* Boss mission header */}
      {isBoss && (
        <header className="shrink-0 content-wrapper pt-safe mt-2 pb-2 flex items-center gap-2">
          <button type="button" onClick={onQuit} className="tmt-icon-button h-12 w-12 rounded-[18px] bg-white/10 border-2 border-white/20 text-white grid place-items-center text-xl shadow-sm hover:bg-white/20 active:translate-y-[2px] transition-all" aria-label="Keluar">
            <TmtCloseGlyph aria-hidden="true" />
          </button>
          <div className="flex-1 flex gap-1.5 items-center">
            <span className="px-3 py-1.5 rounded-full bg-white/10 border-2 border-white/20 text-white text-xs font-black shadow-sm backdrop-blur-sm">
              👑 BOSS
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/10 border-2 border-white/20 text-white text-xs font-black shadow-sm backdrop-blur-sm">
              {diff.emoji} {diff.shortLabel}
            </span>
          </div>
        </header>
      )}

      <main className={`flex-1 min-h-0 content-wrapper mt-2 flex flex-col pb-4 overflow-y-auto overscroll-contain ${isBoss ? "pt-2" : ""}`}>
        <MissionRendererRouter 
          mission={shuffledMission}
          revealed={revealed}
          selectedId={selected}
          wrongIds={wrongIds}
          onSelect={setSelected}
          onBossComplete={handleBossComplete}
        />

        {!isBoss && showHint ? (
          <div className="rounded-2xl bg-[#f9edc9] p-4 text-base text-[#594a32] mt-4" role="status">
            <strong className="block mb-1">Petunjuk</strong>
            {mission.hintLevels?.[0] || "Tidak ada petunjuk lebih lanjut."}
          </div>
        ) : null}
      </main>

      {!isBoss && (
        <FixedBottomActionArea>
          <div className="flex gap-3">
            <button
              type="button"
              className="field-back disabled:opacity-50"
              onClick={() => {
                if (!showHint) {
                  setShowHint(true);
                  setHintsUsed((h) => h + 1);
                }
              }}
              disabled={showHint || revealed}
            >
              Petunjuk
            </button>
            <button type="button" className="field-button flex-1" onClick={submit} disabled={!selected || revealed}>
              Kirim jawaban
            </button>
          </div>
        </FixedBottomActionArea>
      )}
    </GameScreen>
  );
}
